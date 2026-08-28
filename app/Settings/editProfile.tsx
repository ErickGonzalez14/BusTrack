import EditPhoto from "@/components/editPhoto";
import AlternativeHeader from "@/components/Headers/alternativeHeader";
import OptionLabel from "@/components/ui/Labels/optionLabel";
import { useAuth } from "@/contexts/authContext";
import { router } from "expo-router";
import {
  Lock,
  LogOut,
  ShieldCheck,
  Translate,
  User,
} from "iconoir-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function EditProfile() {
  const { logOut } = useAuth();

  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("No se pudo cerrar sesión:", error);
    }
  };
  return (
    <View style={styles.container}>
      <AlternativeHeader
        SettingName="Configuración de Perfil"
        onTouch={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 10 }}>
          <EditPhoto />
        </View>
        {/* Seccion de Cuenta*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Cuenta</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Cambiar UserName"
              icon={User}
              iconColor="#1B2CC1"
              isToggle={false}
              separator={true}
            />
            <OptionLabel
              settingsName="Cambiar Contraseña"
              icon={Lock}
              iconColor="#5856D6"
              isToggle={false}
              separator={false}
            />
          </View>
        </View>
        {/* Seccion de Seguridad*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Seguridad</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Autenticación de 2 Factores"
              icon={ShieldCheck}
              iconColor="#34C759"
              isToggle={true}
              separator={false}
            />
          </View>
        </View>
        {/* Seccion de Preferencias*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Preferencias</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Idioma"
              icon={Translate}
              iconColor="#FF9500"
              isToggle={false}
              separator={true}
            />
            <OptionLabel
              settingsName="Cerrar sesión"
              icon={LogOut}
              iconColor="#FF3B30"
              isToggle={false}
              separator={false}
              onPress={handleLogOut}
            />
          </View>
        </View>
        <Pressable></Pressable>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.surface.neutral,
  },
  content: {
    flexGrow: 1,
  },
  text: {
    fontSize: 18,
    fontFamily: "Roboto_400Regular",
    color: theme.text.Body,
    marginBottom: 15,
  },
  settings: {
    flexDirection: "column",
    gap: 1,
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    paddingTop: 5,
    paddingBottom: 5,
    overflow: "hidden",
  },
  settingsContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
}));
