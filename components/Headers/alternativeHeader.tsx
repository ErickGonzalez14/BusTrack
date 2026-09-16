import { ArrowLeft } from "iconoir-react-native";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IconButton from "../ui/buttons/iconButton";

type AlternativeHeaderProps = {
  SettingName: string;
  onTouch?: () => void;
};

export default function AlternativeHeader({
  SettingName,
  onTouch,
}: AlternativeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <IconButton icon={ArrowLeft} onPress={onTouch} width={26} height={26} />
      </View>
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {SettingName}
      </Text>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.primary,
    flexDirection: "row",
    paddingTop: 75,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  buttonContainer: {
    position: "absolute",
    left: 16,
    top: 63,
  },
  text: {
    color: theme.text.Secondary,
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
    width: "50%",
  },
}));
