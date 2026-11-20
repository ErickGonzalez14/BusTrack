import { getProfileAvatarSource } from "@/src/features/auth/components/profileAvatarSource";
import { useAuth } from "@/src/features/auth/context/authContext";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type UserProfileProps = {
  userName: string;
};

export default function UserProfile({ userName }: UserProfileProps) {
  const { profile } = useAuth();
  return (
    <View style={styles.Profile}>
      <View style={styles.imageContainer}>
        <Image
          source={getProfileAvatarSource(profile?.photo?.url)}
          style={styles.userImage}
        />
      </View>
      <View style={styles.userInformation}>
        <Text style={styles.greeting}>Buenos Días</Text>
        <Text style={styles.userName}>{profile?.fullName || userName}</Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  Profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userInformation: {
    flexDirection: "column",
  },
  greeting: {
    color: theme.text.Secondary,
    fontSize: 16,
    fontFamily: "Roboto_300Light",
  },
  userName: {
    color: theme.text.Secondary,
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
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
}));
