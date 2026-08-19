import BottomSheet from "@gorhom/bottom-sheet";
import { Bell, CrownCircle, HeartSolid } from "iconoir-react-native";
import { useMemo, useRef } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IconButton from "../../ui/buttons/iconButton";
import LocationDropDown from "./locationDropDown";
import UserProfile from "./userProfile";
import WeatherBadge from "./weatherBadge";

// Resolver el problema con el BottomSheet en las siguientes versiones
export default function PrimaryHeader() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["25%", "50%", "75%", "100%"], []);
  const handleOpenLocation = () => {
    bottomSheetRef.current?.expand();
  };
  return (
    <View style={styles.container}>
      <View style={styles.firstRow}>
        <UserProfile userName="Roberto Díaz" />
        <LocationDropDown siteName="Bugaba" onPress={handleOpenLocation} />
      </View>
      <View style={styles.secondRow}>
        <WeatherBadge />
        <View style={styles.iconButtonContainer}>
          <IconButton
            onPress={() => {
              console.log("Pressed");
            }}
            icon={Bell}
            width={20}
            height={20}
          />
          <IconButton
            onPress={() => {
              console.log("Pressed");
            }}
            icon={HeartSolid}
            width={20}
            height={20}
          />
          <IconButton
            onPress={() => {
              console.log("Pressed");
            }}
            icon={CrownCircle}
            width={20}
            height={20}
          />
        </View>
      </View>

      <BottomSheet snapPoints={snapPoints} ref={bottomSheetRef}>
        <Text>Bottom Sheet Content</Text>
      </BottomSheet>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.primary,
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  firstRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
  },
  secondRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
  },
  iconButtonContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-end",
  },
}));
