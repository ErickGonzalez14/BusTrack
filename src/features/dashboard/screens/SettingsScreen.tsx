import { getProfileAvatarSource } from "@/src/features/auth/components/profileAvatarSource";
import { useAuth } from "@/src/features/auth/context/authContext";
import { useActiveBusiness } from "@/src/features/business/hooks/useBusinessProfile";
import { useActiveBus } from "@/src/features/tracking/hooks/useDriverApplication";
import { useAppTheme } from "@/src/shared/theme/useAppTheme";
import SecundaryHeader from "@/src/shared/ui/headers/secundaryHeader";
import OptionLabel from "@/src/shared/ui/Labels/optionLabel";
import ProfileLabel from "@/src/shared/ui/Labels/profileLabel";
import { router } from "expo-router";
import {
  Barcode,
  CreditCard,
  GitCompare,
  Heart,
  Palette,
} from "iconoir-react-native";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const BUSINESS_PRO_PLAN = "BusTrack Business Pro";
const BUSINESS_LIGHT_PLAN = "BusTrack Business Light";
export default function Settings() {
  const { profile } = useAuth();
  const { isDarkMode, setDarkMode } = useAppTheme();
  const { isBusinessApproved, businessPlan } = useActiveBusiness();
  const { isBusApproved } = useActiveBus();

  // Solo el plan Pro tiene acceso al dashboard de negocio
  const isProPlan = isBusinessApproved && businessPlan === BUSINESS_PRO_PLAN;
  const isLightPlan =
    isBusinessApproved && businessPlan === BUSINESS_LIGHT_PLAN;

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
            userName={profile?.nickname || "Usuario"}
            greeting="Buenos Días"
            imageSource={getProfileAvatarSource(profile?.photo?.url)}
            onTouch={() => router.push("/Settings/editProfile")}
          />
        </View>
        {/* Seccion de preferencias*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Preferencias</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Tema oscuro"
              icon={Palette}
              iconColor="#5856D6"
              isToggle={true}
              separator={false}
              toggleValue={isDarkMode}
              onToggleChange={setDarkMode}
            />
          </View>
        </View>

        {/* Seccion de Servicios*/}
        <View style={styles.settingsContainer}>
          <Text style={styles.text}>Servicios</Text>
          <View style={styles.settings}>
            <OptionLabel
              settingsName="Suscripciones"
              icon={CreditCard}
              iconColor="#34C759"
              isToggle={false}
              separator={true}
              onPress={() => router.push("/Settings/Subscriptions/dashBoard")}
            />
            <OptionLabel
              settingsName="Favoritos"
              icon={Heart}
              iconColor="#FF2D55"
              isToggle={false}
              separator={true}
              onPress={() => router.push("/Settings/Favorites/favorite")}
            />

            <OptionLabel
              settingsName="Solicitudes"
              icon={GitCompare}
              iconColor="#091540"
              isToggle={false}
              separator={
                (isBusinessApproved ? true : false) ||
                (isBusApproved ? true : false)
              }
              onPress={() => router.push("/Settings/UserRequests/requests")}
            />

            {isBusApproved && (
              <OptionLabel
                settingsName="BusTracking"
                icon={require("@/assets/images/2xlogo.png")}
                iconColor="#4D7EFF"
                isToggle={false}
                separator={isBusinessApproved ? true : false}
                onPress={() => router.push("/Settings/Buses/trackingView")}
              />
            )}
            {/* Solo visible para empresas aprobadas */}
            {isProPlan && (
              <OptionLabel
                settingsName="Mi Negocio"
                icon={Barcode}
                iconColor="#007fef"
                isToggle={false}
                separator={false}
                onPress={() => router.push("/Settings/Business/dashBoard")}
              />
            )}
            {isLightPlan && (
              <OptionLabel
                settingsName="Mi Negocio"
                icon={Barcode}
                iconColor="#007fef"
                isToggle={false}
                separator={false}
                onPress={() => router.push("/Settings/Business/lightDashBoard")}
              />
            )}
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
