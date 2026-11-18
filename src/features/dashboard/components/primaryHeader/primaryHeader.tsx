import UserProfile from "@/src/features/dashboard/components/primaryHeader/userProfile";
import IconButton from "@/src/shared/ui/buttons/iconButton";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { CrownCircle } from "iconoir-react-native";
import { useMemo, useRef } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
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
        <View style={styles.iconButtonContainer}>
          <IconButton
            onPress={() => {
              router.push("/(tabs)/premium");
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
