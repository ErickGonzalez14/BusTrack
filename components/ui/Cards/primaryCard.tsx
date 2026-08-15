import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type PrimaryHeaderProps = {
  lugar: string;
  nextBus: string;
  distance: string;
  time: string;
};

export default function PrimaryCard({
  lugar,
  nextBus,
  distance,
  time,
}: PrimaryHeaderProps) {
  return (
    <Pressable style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require("../../../assets/icons/bus.svg")}
          style={styles.icon}
        />
      </View>
      <View>
        <View>
          <Text style={styles.text}>{lugar}</Text>
          <Text style={styles.secundaryText}>Next Bus in {nextBus} mins. </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{distance}Km aprox</Text>
          <Text style={styles.secundaryText}>{time} mins</Text>
        </View>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    paddingVertical: 15,
    paddingHorizontal: 25,
    gap: 20,

    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
  },
  iconContainer: {
    backgroundColor: theme.surface.brand,
    borderRadius: theme.size_rounded.md,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
  },
  secundaryText: {
    fontFamily: "Roboto_400Regular",
    fontSize: 13,
    color: theme.text.placeholder,
    marginTop: -3,
  },
  textContainer: {
    flexDirection: "column",
    paddingTop: 10,
  },
}));
