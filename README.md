# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Estado de BusTrack Premium

Firestore guarda el acceso en `userSubscriptions/{uid}`. La app lee el documento de la cuenta activa. La función `revenueCatWebhook` consulta RevenueCat antes de escribirlo.

1. Crea el derecho `premium` en RevenueCat y vincúlalo a tu producto mensual. La app usa el UID de Firebase Auth como App User ID de RevenueCat.
2. Configura `REVENUECAT_API_KEY` con una clave secreta compatible con la API REST v1 y `REVENUECAT_WEBHOOK_TOKEN` con un token aleatorio. Usa `firebase functions:secrets:set NOMBRE_DEL_SECRETO` para cada uno.
3. Despliega `functions:revenueCatWebhook` y `firestore:rules` al proyecto correspondiente. Configura el webhook de RevenueCat con la URL de la función y el encabezado `Authorization: Bearer <token>`.
4. Para pruebas en un proyecto de Firebase separado, configura `REVENUECAT_ALLOW_SANDBOX=true` en el entorno de Functions y habilita la entrega de eventos sandbox en RevenueCat. En producción la opción es `false` por defecto.

### Probar con Test Store

1. En RevenueCat, abre **Apps & providers → Test Store**. Usa un producto mensual de USD 4.99, vincúlalo a `premium` y agrégalo al paquete mensual (`$rc_monthly`) de la oferta actual. Si el producto de ejemplo tiene otro precio, crea uno nuevo con el precio deseado.
2. Copia la clave **pública** de Test Store al `.env.local` de la raíz:

```dotenv
EXPO_PUBLIC_REVENUECAT_TEST_API_KEY=test_...
```

3. Usa una compilación nativa de desarrollo con `react-native-purchases` y reinicia Metro tras añadir la clave. Abre **Ajustes → Suscripciones → Elegir Premium** y confirma la compra simulada. La tarjeta mostrará el precio de la oferta de prueba.
4. Para verificar el acceso en Firestore, conecta el webhook de RevenueCat a Firebase de pruebas y habilita los eventos sandbox como se indica arriba. Tras confirmar la compra, verifica que aparece un documento en `userSubscriptions/{uid}` y que la tarjeta cambia a **Activo**.

La clave de Test Store tiene prioridad en desarrollo. En compilaciones de producción la app usa las claves de la plataforma.

### Habilitar compras en las tiendas

Añade las claves **públicas** de cada plataforma al entorno de Expo:

```dotenv
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
```

En la oferta actual de RevenueCat, configura el paquete mensual (`$rc_monthly`) con el producto vinculado a `premium`. Define el precio base de USD 4.99 al mes en las tiendas. La app muestra el precio localizado que devuelve la tienda. Para iOS también debes configurar el identificador de la app y la capacidad de compras dentro de la app.

Genera una nueva compilación nativa de desarrollo para incluir el SDK. Si ya tienes una carpeta `android` generada, aplica el plugin con `npx expo prebuild --platform android` antes de recompilar. Verifica la compra, la cancelación del diálogo y la restauración en el entorno de pruebas de la tienda con el webhook conectado.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
