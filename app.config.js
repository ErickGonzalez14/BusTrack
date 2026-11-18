const appJson = require("./app.json");

module.exports = ({ config }) => {
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
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const googleAdsAppId = process.env.GOOGLE_ADS_APP_ID;
  const defaultAds = appJson["react-native-google-mobile-ads"];

  if (!googleMapsApiKey) {
    throw new Error("Falta GOOGLE_MAPS_API_KEY en el archivo .env");
  }

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: googleAdsAppId || defaultAds.android_app_id,
          iosAppId: googleAdsAppId || defaultAds.ios_app_id,
        },
      ],
    ],
    extra: {
      ...config.extra,
      googlePlacesApiKey,
      googleRoutesApiKey,
      cloudinaryCloudName,
      cloudinaryUploadPreset,
      stripePublishableKey,
      stripeSecretKey,
      stripeFunctionsUrl,
      backendUrl,
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};
