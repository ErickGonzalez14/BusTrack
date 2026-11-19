/* global beforeEach, describe, it */
const { by, device, element, expect, waitFor } = require("detox");

function showInForm(text, form) {
  const target = element(by.text(text));
  return waitFor(target).toBeVisible().whileElement(by.id(form)).scroll(200, "down");
}

describe("Autenticación de BusTrack en Android", () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.text("Bienvenido a BusTrack"))).toBeVisible().withTimeout(20_000);
  });

  it("abre la pantalla de inicio de sesión al arrancar sin cuenta", async () => {
    await expect(element(by.text("Bienvenido a BusTrack"))).toBeVisible();
    await showInForm("Iniciar Sesión", "login-form");
    await expect(element(by.text("Iniciar Sesión"))).toBeVisible();
  });

  it("rechaza el inicio de sesión vacío y vuelve al formulario al cerrar el aviso", async () => {
    await showInForm("Iniciar Sesión", "login-form");
    await element(by.text("Iniciar Sesión")).tap();
    await expect(element(by.text("No pudimos iniciar sesión"))).toBeVisible();
    await device.takeScreenshot("validacion-inicio-de-sesion");
    await element(by.text("Intentar de nuevo")).tap();
    await expect(element(by.text("No pudimos iniciar sesión"))).not.toBeVisible();
    await expect(element(by.text("Iniciar Sesión"))).toBeVisible();
  });

  it("abre el registro y regresa al inicio de sesión", async () => {
    await showInForm("Registrarse", "login-form");
    await element(by.text("Registrarse")).tap();
    await expect(element(by.text("Nombre Completo"))).toBeVisible();
    await device.takeScreenshot("formulario-de-registro");
    await showInForm("Iniciar Sesión", "register-form");
    await element(by.text("Iniciar Sesión")).tap();
    await expect(element(by.text("Bienvenido a BusTrack"))).toBeVisible();
  });

  it("rechaza el registro vacío y mantiene abierto el formulario", async () => {
    await showInForm("Registrarse", "login-form");
    await element(by.text("Registrarse")).tap();
    await showInForm("Registrarse", "register-form");
    await element(by.text("Registrarse")).tap();
    await expect(element(by.text("No pudimos registrarte"))).toBeVisible();
    await expect(element(by.text("Correo inválido"))).toBeVisible();
    await expect(element(by.text("Intentar de nuevo"))).toBeVisible();
    await device.takeScreenshot("validacion-de-registro");
    await element(by.text("Intentar de nuevo")).tap();
    await expect(element(by.text("No pudimos registrarte"))).not.toBeVisible();
    await expect(element(by.text("Registrarse"))).toBeVisible();
  });
});
