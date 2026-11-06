const appJson = require("./app.json");

module.exports = () => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const googlePlacesApiKey =
    process.env.GOOGLE_PLACES_API_KEY || googleMapsApiKey;
  const googleRoutesApiKey =
    process.env.GOOGLE_ROUTES_API_KEY || googlePlacesApiKey;
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const stripeSecretKey =
    process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const stripeFunctionsUrl = process.env.EXPO_PUBLIC_STRIPE_FUNCTIONS_URL;
  const googleAdsAppId = process.env.GOOGLE_ADS_APP_ID;

  if (!googleMapsApiKey) {
    throw new Error("Falta GOOGLE_MAPS_API_KEY en el archivo .env");
  }

  return {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins || []),
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: googleAdsAppId,
          iosAppId: googleAdsAppId,
        },
      ],
    ],
    extra: {
      ...appJson.expo.extra,
      googlePlacesApiKey,
      googleRoutesApiKey,
      cloudinaryCloudName,
      cloudinaryUploadPreset,
      stripePublishableKey,
      stripeSecretKey,
      stripeFunctionsUrl,
    },
    ios: {
      ...appJson.expo.ios,
      config: {
        ...appJson.expo.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...appJson.expo.android,
      config: {
        ...appJson.expo.android.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    "react-native-google-mobile-ads": {
      android_app_id: googleAdsAppId,
      ios_app_id: googleAdsAppId, // Mismo ID aquí también
    },
  };
};
