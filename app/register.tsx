import { Image, ImageBackground, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import RegisterForm from "../components/registerForm";

export default function Register() {
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
      <View style={styles.RegisterForm}>
        <RegisterForm />
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
    marginTop: 65,
    marginBottom: 15,
  },
  RegisterForm: {
    flex: 1,
  },
}));
