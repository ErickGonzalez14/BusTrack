import { Image, ImageBackground, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import LogInForm from "../components/logInForm";
export default function LogIn() {
  return (
    <ImageBackground
      source={require("../assets/images/BackGround.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Image
        source={require("../assets/images/2xlogo.png")}
        style={styles.image}
      />
      <View style={styles.LogInForm}>
        <LogInForm />
      </View>
    </ImageBackground>
  );
}
export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.surface.background,
  },

  image: {
    width: 130,
    height: 130,
    alignSelf: "center",
    marginTop: 150,
  },
  LogInForm: {
    marginTop: "auto",
  },
}));
