import { ClockSolid, Heart, StarSolid } from "iconoir-react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type RouterCardProps = {
  busPlate: string;
  busType: string;
  startStop: string;
  endStop: string;
  routeTime: string;
  routeFair: number;
  calification: number;
  timeNearestBus: string;
  routeDirection: "Ida" | "Regreso";
};

export default function RouteCard({
  busPlate,
  busType,
  startStop,
  endStop,
  routeTime,
  routeFair,
  calification,
  timeNearestBus,
  routeDirection,
}: RouterCardProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <View style={styles.busInfoContainer}>
        <View>
          <Text style={styles.plateText}>{busPlate}</Text>
          <Text style={styles.busTypeText}>{busType}</Text>
        </View>
        <View style={styles.directionBadge}>
          <Text style={styles.directionText}>{routeDirection}</Text>
        </View>
        <Pressable style={styles.favoriteButton}>
          <Heart width={25} height={25} color="red" />
        </Pressable>
      </View>
      <View style={styles.routesContainer}>
        <View style={styles.stopContainer}>
          <Text
            style={[styles.secundaryText, styles.startStopText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {startStop}
          </Text>
        </View>

        <View style={styles.timeLine}>
          <View style={styles.circle} />

          <View style={styles.dashedLine} />

          <View style={styles.timeContainer}>
            <Text style={styles.secundaryText}>{routeTime}</Text>
          </View>

          <View style={styles.dashedLine} />

          <View style={styles.circle} />
        </View>

        <View style={styles.stopContainer}>
          <Text
            style={[styles.secundaryText, styles.endStopText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {endStop}
          </Text>
        </View>
      </View>
      <View style={styles.fairContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <ClockSolid width={25} height={25} color={theme.surface.brand} />
          <Text
            style={{
              color: theme.text.contrast,
              fontFamily: theme.fonts.heavy,
              fontSize: 14,
            }}
          >
            {timeNearestBus}
          </Text>
        </View>
        <Text
          style={{
            color: theme.text.Body,
            fontFamily: theme.fonts.heavy,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          ${routeFair}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            borderWidth: 1,
            borderColor: theme.text.placeholder,
            padding: 4,
            borderRadius: 6,
          }}
        >
          <StarSolid width={25} height={25} color="#fdc538" />
          <Text style={styles.secundaryText}>{calification}</Text>
        </View>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    borderWidth: 1,
    borderColor: theme.surface.brand,
    padding: 12,
  },
  busInfoContainer: {
    backgroundColor: theme.surface.neutral,
    borderRadius: theme.size_rounded.sm,
    padding: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  plateText: {
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  busTypeText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.components.cards,
  },
  routesContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.text.placeHolderLight,
  },
  fairContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    alignItems: "center",
  },
  favoriteButton: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.full,
    padding: 8,
  },
  directionBadge: {
    marginLeft: "auto",
    marginRight: 8,
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  directionText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
  },
  secundaryText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.text.Body,
  },
  timeContainer: {
    borderWidth: 1,
    borderColor: theme.surface.brand,
    borderRadius: theme.size_rounded.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  timeLine: {
    flexDirection: "row",
    alignItems: "center",
    width: 150,
    flexShrink: 0,
    marginHorizontal: 8,
  },
  stopContainer: {
    flex: 1,
    minWidth: 0,
  },
  startStopText: {
    textAlign: "right",
  },
  endStopText: {
    textAlign: "left",
  },

  circle: {
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: "#4D7CFE",
  },

  dashedLine: {
    flex: 1,
    borderTopWidth: 3,
    borderTopColor: "#4D7CFE",
    borderStyle: "dashed",
    minWidth: 12,
    marginHorizontal: 10,
  },
}));
