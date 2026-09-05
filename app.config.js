const appJson = require("./app.json");

module.exports = () => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    throw new Error("Falta GOOGLE_MAPS_API_KEY en el archivo .env");
  }

  return {
    ...appJson.expo,
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
