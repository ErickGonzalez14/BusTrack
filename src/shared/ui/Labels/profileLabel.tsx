import { Image, type ImageSource } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ProfileLabelProps = {
  userName: string;
  greeting: string;
  imageSource: ImageSource | number;
  onTouch?: () => void;
};

export default function ProfileLabel({
  userName,
  greeting,
  imageSource,
  onTouch,
}: ProfileLabelProps) {
  return (
    <Pressable style={styles.container} onPress={onTouch}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.userImage} />
      </View>
      <View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.greeting}>{greeting} - BusTrack</Text>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    backgroundColor: theme.surface.background,
    gap: 10,
    paddingVertical: 16,
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: theme.size_rounded.md,
  },
  userImage: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#f5a432",
    overflow: "hidden",
  },
  userName: {
    color: theme.text.Body,
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
  },
  greeting: {
    color: theme.text.placeHolderLight,
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    marginTop: -3,
  },
}));
