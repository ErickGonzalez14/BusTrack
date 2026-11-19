/* global it */
const { execFileSync } = require("node:child_process");
const { mkdirSync, writeFileSync } = require("node:fs");
const { performance } = require("node:perf_hooks");
const { setTimeout: delay } = require("node:timers/promises");
const { by, device, element, waitFor } = require("detox");

const packageName = "com.erick12.BusTrack";
const outputDirectory = "evidence/performance";
const repetitions = 20;

function memorySample(stage, cycle) {
  const raw = execFileSync("adb", ["-s", device.id, "shell", "dumpsys", "meminfo", "-s", packageName], {
    encoding: "utf8",
    timeout: 20_000,
  });
  const pss = raw.match(/TOTAL PSS:\s*(\d+)/);
  if (!pss) throw new Error(`No se encontró TOTAL PSS para ${stage}: ${raw}`);
  return { stage, cycle, pssKiB: Number(pss[1]), raw };
}

async function measureVisible(action, text) {
  const startedAt = performance.now();
  await action();
  await waitFor(element(by.text(text))).toBeVisible().withTimeout(10_000);
  return Math.round((performance.now() - startedAt) * 10) / 10;
}

it("mide la respuesta y el PSS al recorrer el registro de invitado", async () => {
  mkdirSync(outputDirectory, { recursive: true });
  const observations = { repetitions, latencies: [], memory: [] };
  await device.launchApp({ newInstance: true });
  const loginTitle = element(by.text("Bienvenido a BusTrack"));
  const registerButton = element(by.text("Registrarse"));
  await waitFor(loginTitle).toBeVisible().withTimeout(20_000);
  await waitFor(registerButton).toBeVisible()
    .whileElement(by.id("login-form")).scroll(200, "down");
  await delay(2_000);
  observations.memory.push(memorySample("login-inicial", 0));
  await device.disableSynchronization();

  try {
    for (let cycle = 1; cycle <= repetitions; cycle += 1) {
      const openRegistrationMs = await measureVisible(() => registerButton.tap(), "Nombre Completo");
      await waitFor(registerButton).toBeVisible()
        .whileElement(by.id("register-form")).scroll(200, "down");
      const showValidationMs = await measureVisible(() => registerButton.tap(), "Correo inválido");
      await element(by.text("Intentar de nuevo")).tap();
      await waitFor(registerButton).toBeVisible().withTimeout(10_000);
      if (cycle === 1 || cycle === repetitions) {
        observations.memory.push(memorySample("registro", cycle));
      }
      await device.pressBack();
      await waitFor(loginTitle).toBeVisible().withTimeout(10_000);
      await waitFor(registerButton).toBeVisible()
        .whileElement(by.id("login-form")).scroll(200, "down");
      observations.latencies.push({ cycle, openRegistrationMs, showValidationMs });
      observations.memory.push(memorySample("regreso-login", cycle));
    }
    await delay(10_000);
    observations.memory.push(memorySample("login-reposo-10s", repetitions));
  } finally {
    writeFileSync(`${outputDirectory}/guest-observations.json`, JSON.stringify(observations, null, 2));
    await device.enableSynchronization();
  }
});
