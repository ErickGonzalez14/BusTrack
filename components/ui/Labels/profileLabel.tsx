import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ProfileLabelProps = {
  userName: string;
  greeting: string;
  imageUrl: string;
};

export default function ProfileLabel({
  userName,
  greeting,
  imageUrl,
}: ProfileLabelProps) {
  return (
    <Pressable style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.userImage} />
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
    width: 40,
    height: 40,
    transform: [{ translateY: 9 }, { translateX: 5 }],
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
    color: theme.text.placeholder,
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    marginTop: -3,
  },
}));
