const appJson = require("./app.json");

module.exports = () => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const googlePlacesApiKey =
    process.env.GOOGLE_PLACES_API_KEY || googleMapsApiKey;
  const googleRoutesApiKey =
    process.env.GOOGLE_ROUTES_API_KEY || googlePlacesApiKey;
  const cloudName = process.env.CLOUD_NAME;
  const uploadPreset = process.env.UPLOAD_PRESET;

  if (!googleMapsApiKey) {
    throw new Error("Falta GOOGLE_MAPS_API_KEY en el archivo .env");
  }

  return {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      googlePlacesApiKey,
      googleRoutesApiKey,
      cloudName,
      uploadPreset,
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
  };
};
