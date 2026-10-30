import { Image } from "expo-image";
import { ArrowRight } from "iconoir-react-native";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type RoutineCardProps = {
  routineName: string;
  routineHour: string;
  firstDay: string;
  lastDay: string;
};

export default function RoutineCard({
  routineName,
  routineHour,
  firstDay,
  lastDay,
}: RoutineCardProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      {/*Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require("../../../assets/icons/calendar.svg")}
          style={{ width: 30, height: 30 }}
        />
      </View>
      <View>
        <View style={styles.destinationContainer}>
          <Text style={styles.mainText}>{routineName}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{routineHour}</Text>
          <ArrowRight width={12} height={12} color={theme.text.placeholder} />
          <Text style={styles.infoText}>{firstDay}</Text>
          <Text style={styles.infoText}>-</Text>
          <Text style={styles.infoText}>{lastDay}</Text>
        </View>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 10,
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    shadowColor: "#505F6F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: theme.icons.primary,
    borderRadius: theme.size_rounded.md,
    justifyContent: "center",
    alignItems: "center",
  },
  mainText: {
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    color: "#000000",
  },
  destinationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Roboto_300Light",
    color: theme.text.placeholder,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
}));
