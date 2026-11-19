# Evidencia de pruebas de módulos de BusTrack

Ejecución del 18 de noviembre de 2026 en Windows con Node.js 22.23.4, Expo 54.0.36, Jest 29.7.0 y jest-expo 54.0.18.

**Resultado: 52 pruebas aprobadas en 6 suites, 0 fallidas y 0 omitidas.**

| Suite | Aprobadas | Comportamiento verificado |
| --- | ---: | --- |
| Autenticación | 8 | Validación del registro, inicio de sesión y perfil |
| Negocios | 8 | Solicitudes, contacto, publicaciones, fechas de descuentos y ajuste de color |
| Solicitud de conductor | 5 | Validación de placas y selección de ruta |
| Rutinas | 10 | Validación, anticipación del aviso y cambio de día en la hora de Panamá |
| Mapa de tránsito | 18 | Coordenadas, paradas, disponibilidad de buses, selección de ruta y simulación del trayecto |
| Flota simulada | 3 | Distancias, distribución de buses y velocidad predeterminada |

## Cobertura

Los porcentajes corresponden a los 11 archivos de lógica de dominio y funciones auxiliares incluidos en la configuración de Jest.

| Métrica | Cubiertas / total | Cobertura |
| --- | ---: | ---: |
| Líneas | 237 / 239 | 99,16 % |
| Sentencias | 262 / 268 | 97,76 % |
| Funciones | 38 / 38 | 100 % |
| Ramas | 123 / 136 | 90,44 % |

Las pruebas se ejecutan localmente con datos de prueba. Las pantallas, los dispositivos físicos y las integraciones con Firebase, RevenueCat y las API de mapas quedan fuera de esta ejecución.

## Reproducir la evidencia

En una instalación limpia, usa `npm ci --legacy-peer-deps` para resolver los conflictos de dependencias pares del proyecto. Ejecuta `npm test` para correr las pruebas o `npm run test:evidence` para generar los siguientes archivos en el directorio de trabajo.

- [Resultados por caso](../evidence/jest/results.json)
- [Cobertura HTML por archivo](../evidence/jest/coverage/index.html)
- [Resumen de cobertura JSON](../evidence/jest/coverage/coverage-summary.json)
