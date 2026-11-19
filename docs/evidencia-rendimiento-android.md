# Rendimiento de BusTrack en Android

Pruebas del 18 de noviembre de 2026.

## Tiempo de respuesta

Se usó el APK release en el emulador Android 35 de Windows, con 20 observaciones por escenario.

| Escenario | Mediana | P95 | Rango |
| --- | ---: | ---: | ---: |
| Arranque en frío según Android | 1 018,5 ms | 1 129 ms | 941–1 157 ms |
| Abrir registro desde el inicio de sesión | 687,7 ms | 703,0 ms | 666,6–750,7 ms |
| Enviar registro vacío hasta ver el aviso | 412,3 ms | 414,8 ms | 409,8–419,0 ms |

El arranque usa `TotalTime` de Android. Los otros escenarios abarcan desde el toque de Detox hasta que detecta el texto visible e incluyen la animación de la interfaz, la comunicación con el emulador y la comprobación del elemento. Con 20 observaciones, el P95 por rango más próximo es la segunda observación más alta.

## Memoria

Se midió el PSS del proceso de BusTrack con `dumpsys meminfo` antes y después de abrir el registro, mostrar y cerrar el aviso y regresar al inicio de sesión. Se usó el botón Atrás de Android para regresar en los 20 ciclos.

| Punto de lectura | PSS |
| --- | ---: |
| Inicio de sesión al comenzar | 205,46 MiB |
| Primer regreso al inicio de sesión | 216,45 MiB |
| Máximo observado | 241,58 MiB |
| Regreso al final del ciclo 20 | 238,50 MiB |
| Tras 10 segundos de reposo | 236,58 MiB |

El PSS a los 10 segundos quedó 31,12 MiB por encima del inicial. Esta serie corta muestra memoria retenida durante el recorrido y es insuficiente para diagnosticar una fuga.

- [Resumen numérico](../evidence/performance/emulator-summary.json)
- [20 arranques medidos por Android](../evidence/performance/cold-start.json)
- [Latencias y lecturas de memoria de los 20 ciclos](../evidence/performance/guest-observations.json)
- [Resultado de Detox](../evidence/performance/detox-results.json)

## Batería

Se midió en un teléfono Samsung SM-A366E mediante ADB inalámbrico. Estuvo desconectado de la alimentación, con la pantalla encendida y el brillo automático activo. BusTrack se ejecutó en el cliente de desarrollo de Expo con JavaScript minificado y modo de desarrollo desactivado. Hubo un intervalo por pantalla, sin iniciar un trayecto ni activar seguimiento en segundo plano.

| Pantalla | Duración | Descarga del teléfono | Consumo estimado por Android para BusTrack |
| --- | ---: | ---: | ---: |
| Inicio | 180,2 s | 15 mAh | 9,0 mAh |
| Mapa | 179,7 s | 15 mAh | 12,1 mAh |

La descarga del teléfono es la diferencia del contador de carga del dispositivo, que se mantuvo en 88 % durante ambos intervalos. El consumo de BusTrack es la diferencia entre dos estimaciones acumuladas por UID de `dumpsys batterystats`. Una medición corta por pantalla con brillo automático no permite atribuir de forma concluyente la diferencia de 3,1 mAh al mapa.

- [Muestras, condiciones y estimaciones de batería](../evidence/performance/physical-battery-run.json)

## Reproducción en el emulador

Con el APK release instalado en el emulador dedicado, pasa su identificador ADB al primer comando.

```powershell
node e2e/startup-performance.cjs emulator-5554
npm exec -- detox test -c android.emu.performance
```

Para repetir la medición de batería, abre BusTrack en el teléfono físico desconectado de la alimentación y pasa su identificador ADB inalámbrico a `e2e/battery-performance.ps1`. El script mantiene la pantalla activa durante los dos intervalos y restaura el tiempo de espera al finalizar.

[Documentación de Android sobre `dumpsys`, PSS y Batterystats](https://developer.android.com/tools/dumpsys)
