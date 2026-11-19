import { Image } from "expo-image";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
type EmptyProps = {
  message?: string;
};
export default function Empty({ message }: EmptyProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/empty.png")}
        style={{ width: 100, height: 100 }}
      />
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 12,
    fontFamily: theme.fonts.heavy,
    color: theme.text.placeholder,
    width: "70%",
  },
}));
