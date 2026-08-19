import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type SecundaryHeaderProps = {
  headerName: string;
  onBackPress?: () => void;
};

export default function SecundaryHeader({
  headerName,
  onBackPress,
}: SecundaryHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.settingName}>{headerName}</Text>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",

    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 10,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginLeft: 10,
  },
  settingName: {
    color: theme.text.Body,
    fontSize: 36,
    fontFamily: theme.fonts.heavy,
  },
}));
