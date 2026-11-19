const { execFileSync } = require("node:child_process");
const { mkdirSync, writeFileSync } = require("node:fs");

const serial = process.argv[2];
if (!/^emulator-\d+$/.test(serial ?? "")) {
  throw new Error("Indica el identificador ADB del emulador dedicado.");
}

const packageName = "com.erick12.BusTrack";
const samples = [];
const adb = (...args) => execFileSync("adb", ["-s", serial, "shell", ...args], {
  encoding: "utf8",
  timeout: 30_000,
});
const resolution = adb("cmd", "package", "resolve-activity", "--brief", packageName);
const component = resolution.trim().split(/\r?\n/).find((line) => line.startsWith(`${packageName}/`));
if (!component) throw new Error("BusTrack no está instalado en el emulador.");

mkdirSync("evidence/performance", { recursive: true });
for (let run = 1; run <= 20; run += 1) {
  const raw = adb("am", "start", "-S", "-W", "-n", component);
  const total = raw.match(/^TotalTime:\s*(\d+)/m);
  if (!total || !/^LaunchState:\s*COLD\b/m.test(raw)) {
    throw new Error(`Android no registró un arranque en frío: ${raw}`);
  }
  samples.push({ run, totalTimeMs: Number(total[1]), raw });
  writeFileSync("evidence/performance/cold-start.json", JSON.stringify(samples, null, 2));
}
