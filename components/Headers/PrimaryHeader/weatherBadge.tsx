import { Image } from "expo-image";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function WeatherBadge() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require("../../../assets/icons/sunnyLow.svg")}
          style={styles.icon}
        />
      </View>
      <View>
        <Text style={styles.weatherDescription}>Nublado</Text>
        <Text style={styles.weatherTemperature}>25°C</Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    gap: 10,
  },

  icon: {
    width: 25,
    height: 25,
  },
  iconContainer: {
    backgroundColor: "#ffffff2b",
    borderRadius: theme.size_rounded.full,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  weatherDescription: {
    fontSize: 16,
    fontFamily: "Roboto_300Light",
    color: theme.text.Secondary,
  },
  weatherTemperature: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.text.Secondary,
  },
}));
