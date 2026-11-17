# BusTrack Premium en Render (proyecto de pruebas)

Este flujo usa Render para comprobar RevenueCat y escribir Firestore con
Firebase Admin. No necesita Cloud Functions ni el plan Blaze de Firebase.
El servidor también crea rutas y trips comunitarios y actualiza valoraciones.

## 1. Preparar credenciales

1. En Firebase Console, abre el proyecto **bustrack-dea8b** → Configuración del
   proyecto → Cuentas de servicio → **Generar nueva clave privada**. Conserva
   el JSON fuera del repositorio. La cuenta de servicio permite acceso de
   administrador a Firestore: no la incluyas en la app ni en Git.
2. En `.env.local` ya existe `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`. Su valor
   `test_...` sirve para que el servidor consulte el estado del cliente de
   Test Store mediante la API v1 de RevenueCat. No lo copies al código fuente.

## 2. Crear el servicio gratuito en Render

1. Sube este repositorio a GitHub/GitLab y en Render selecciona **New →
   Blueprint**, apuntando al repositorio. `render.yaml` configura un Web
   Service gratuito con `functions` como directorio raíz.
2. Cuando Render solicite variables, pega el contenido completo del JSON de
   Firebase en `FIREBASE_SERVICE_ACCOUNT_JSON` y la clave `test_...` en
   `REVENUECAT_API_KEY`. `REVENUECAT_ALLOW_SANDBOX=true` ya está en el Blueprint.
3. Confirma el despliegue. Abre `https://TU-SERVICIO.onrender.com/health`;
   debe responder `{"ok":true}`. Si falla, revisa los logs de Render y las
   variables. Nunca pegues credenciales en los logs o en una incidencia.

## 3. Conectar la aplicación

1. Añade a `.env.local` de la raíz:

   `EXPO_PUBLIC_BACKEND_URL=https://TU-SERVICIO.onrender.com`

2. Reinicia Metro después de cambiar `.env.local`. La app invoca
   `POST /premium/sync` al detectar la compra; manda el token de Firebase Auth.
   El servidor usa ese UID para consultar RevenueCat y escribir
   `userSubscriptions/{uid}`. La app no puede otorgarse acceso a sí misma.
3. Despliega `firestore.rules` y `firestore.indexes.json` en Firebase. Estos
   archivos permiten a Premium leer las publicaciones y bloquean escrituras
   directas del cliente: las altas y valoraciones pasan por Render.
   La regla temporal heredada para las demás colecciones vence el 13 de
   diciembre de 2026 y necesita una migración de permisos aparte.

   Desde la raíz del proyecto, con Firebase CLI autenticado:

   `npx firebase-tools@latest deploy --only "firestore:rules,firestore:indexes" --project bustrack-dea8b`

## 4. Probar

1. Compra el producto de Test Store con la misma cuenta de Firebase que usa
   la app. En Render, verifica que `/premium/sync` responde sin errores.
2. En Firebase Console, comprueba que existe
   `userSubscriptions/{uid}` con `status: active` y `expiresAt` futuro.
3. Vuelve al tab Premium. Deben aparecer las acciones para crear rutas y trips.
   Prueba una valoración desde otra cuenta Premium.

## Webhook opcional

RevenueCat ofrece webhooks en su plan Pro. Si usas el plan gratuito, omite esta
sección: `POST /premium/sync` ya permite validar la compra sin webhook.

Si tu plan de RevenueCat ofrece webhooks, configura en Render la variable
`REVENUECAT_WEBHOOK_TOKEN` con un valor aleatorio largo. En RevenueCat →
Integrations → Webhooks, añade la URL
`https://TU-SERVICIO.onrender.com/revenuecat/webhook`, el encabezado
`Authorization: Bearer <mismo valor>` y habilita eventos de sandbox. El
servidor consulta RevenueCat después de cada evento; no confía en el contenido
del webhook para conceder acceso. Sin webhook, la app sincroniza al abrir el
flujo Premium. El acceso vigente expira según `expiresAt` aunque no llegue
ningún evento.

Render Free se suspende tras 15 minutos sin tráfico; la primera verificación
puede tardar cerca de un minuto. El cliente espera hasta 90 segundos.

## Habilitar la predicción de tráfico

1. Despliega las reglas de Firestore actualizadas para proteger `trafficUsage`.
2. En Render, configura `GOOGLE_ROUTES_TRAFFIC_API_KEY` con una clave restringida
   a Routes API, con facturación habilitada en Google Cloud. Vuelve a desplegar
   el servidor para habilitar `POST /premium/traffic-forecast`.
3. En la app actualizada, abre Premium y elige un día en **Predicción de
   tráfico vial**.

La app ofrece fechas entre 7 y 13 días en el futuro. El servidor solicita a
Google Routes estimaciones para cuatro horarios de tres corredores, con
`TRAFFIC_AWARE_OPTIMAL` y `BEST_GUESS`. El gráfico muestra los minutos por
corredor. Son pronósticos de duración en carro. Cada consulta usa hasta
12 solicitudes a Google, con un límite de 3 consultas por usuario y 72
solicitudes totales por día. Firestore almacena los contadores de uso.
