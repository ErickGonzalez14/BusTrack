# Pruebas de extremo a extremo con Detox

## Ejecución inicial

Ejecución del 18 de noviembre de 2026 con Detox 20.47.0 y Expo SDK 54 en el emulador dedicado `BusTrack_Detox_API_35` de Windows. Gradle generó los dos APK de la variante release. La suite ejecutó **4 casos, con 3 aprobados y 1 fallido**.

| Caso | Resultado |
| --- | --- |
| Arranque sin sesión y pantalla de inicio de sesión visible | Aprobado |
| Inicio de sesión vacío y regreso al formulario al cerrar el aviso | Aprobado |
| Navegación a registro y regreso al inicio de sesión | Aprobado |
| Registro vacío con aviso visible y opción de volver al formulario | Fallido |

Al pulsar **Registrarse** con todos los campos vacíos, el aviso muestra los errores de Zod como JSON. El contenido desborda la pantalla y deja fuera de vista tanto el título **No pudimos registrarte** como el botón **Intentar de nuevo**. Detox detectó el título por encima del área visible y detuvo el caso en esa aserción.

- [Captura del registro vacío](../evidence/detox/registro-vacio.png)
- [Resultados iniciales por caso en JSON](../evidence/detox/results-before-registration-fix.json)
- [Registro de la ejecución](../evidence/detox/run.log)

## Verificación de la corrección

La segunda ejecución en el mismo emulador aprobó **4 de 4 casos**. Al enviar el registro vacío, Detox verificó que el título **No pudimos registrarte**, el mensaje **Correo inválido** y el botón **Intentar de nuevo** estaban visibles. Al pulsar el botón, el aviso se cerró y el formulario de registro quedó disponible.

- [Captura del aviso corregido](../evidence/detox/registro-vacio-corregido.png)
- [Resultados de la segunda ejecución](../evidence/detox/results.json)
- [Registro de la segunda ejecución](../evidence/detox/run-registration-fix.log)

## Reproducción

Usa JDK 17, el SDK de Android con la plataforma 36 y un dispositivo virtual Android x86_64. La configuración usa `BusTrack_Detox_API_35` como nombre del dispositivo virtual. Define `DETOX_AVD` para usar otro emulador dedicado. La compilación adopta la configuración local de Expo y Firebase de BusTrack.

```powershell
npm ci --legacy-peer-deps
npm run test:detox:build
npm run test:detox
```

Detox guarda el resultado de Jest en `evidence/detox/results.json` y coloca los registros del dispositivo y las capturas en un subdirectorio con la fecha de cada ejecución.

La suite usa datos vacíos y una sesión de invitado. La autenticación válida, las compras, los mapas y los flujos con sesión activa requieren casos adicionales.
