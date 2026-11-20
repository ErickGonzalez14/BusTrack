import EditPhoto from "@/src/features/auth/components/editPhoto";
import EditNicknameModal from "@/src/features/auth/components/EditNicknameModal";
import { useAuth } from "@/src/features/auth/context/authContext";
import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import OptionLabel from "@/src/shared/ui/Labels/optionLabel";
import { router } from "expo-router";
import { LogOut, User } from "iconoir-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function EditProfile() {
  const { logOut, profile } = useAuth();
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

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
              onPress={() => setIsNicknameModalOpen(true)}
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
      {isNicknameModalOpen && profile && (
        <EditNicknameModal key={profile.uid} onClose={() => setIsNicknameModalOpen(false)} />
      )}
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
