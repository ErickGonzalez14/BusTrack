import SecundaryHeader from "@/components/Headers/secundaryHeader";
import OptionLabel from "@/components/ui/Labels/optionLabel";
import ProfileLabel from "@/components/ui/Labels/profileLabel";
import { useAuth } from "@/contexts/authContext";
import { router } from "expo-router";
import {
  Bell,
  CreditCard,
  GitCompare,
  Heart,
  Palette,
  PrivacyPolicy,
} from "iconoir-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function Settings() {
  const { profile } = useAuth();
  const { logOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleLogOut = async () => {
    await logOut();
    router.replace("/logIn");
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      >
        <SecundaryHeader headerName="Ajustes" />
        <View style={{ paddingHorizontal: 15 }}>
          <ProfileLabel
            userName={profile?.fullName || "Usuario"}
            greeting="Buenos Días"
            imageUrl={
              profile?.photo?.url ||
              "https://res.cloudinary.com/snvvb5aq/image/upload/v1784917188/image_1_eosede.png"
            }
            onTouch={() => router.push("/Settings/editProfile")}
          />
        </View>

        {/* Seccion de preferencias*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Preferencias</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Tema"
              icon={Palette}
              iconColor="#5856D6"
              isToggle={true}
              separator={true}
              toggleValue={notificationsEnabled}
              onToggleChange={setNotificationsEnabled}
            />
            <OptionLabel
              settingsName="Notificaciones"
              icon={Bell}
              iconColor="#FF9500"
              isToggle={true}
              separator={false}
              toggleValue={notificationsEnabled}
              onToggleChange={setNotificationsEnabled}
            />
          </View>
        </View>
        {/* Seccion de Servicios*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Servicios</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Subscripciones"
              icon={CreditCard}
              iconColor="#34C759"
              isToggle={false}
              separator={true}
            />
            <OptionLabel
              settingsName="Favoritos"
              icon={Heart}
              iconColor="#FF2D55"
              isToggle={false}
              separator={true}
            />
            <OptionLabel
              settingsName="Solicitudes"
              icon={GitCompare}
              iconColor="#091540"
              isToggle={false}
              separator={false}
              onPress={() => router.push("/Settings/UserRequests/requests")}
            />
          </View>
        </View>
        {/* Seccion de Legal*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Legal</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Terminos y Condiciones"
              icon={PrivacyPolicy}
              iconColor="#8E8E93"
              isToggle={false}
              separator={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.surface.neutral,
    marginBottom: 20,

    flexDirection: "column",
    gap: 1,
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
  text: {
    fontSize: 18,
    fontFamily: "Roboto_400Regular",
    color: theme.text.Body,
    marginBottom: 15,
  },
  scrollView: {
    marginBottom: 20,
  },
}));
