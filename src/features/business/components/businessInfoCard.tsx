import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import AlertCard, {
    type AlertCardVariant,
} from "@/src/shared/ui/Cards/alertCard";
import InputText from "@/src/shared/ui/inputText";
import {
  useUpdateBusinessAddressDescription,
  useUpdateBusinessPhone,
} from "@/src/features/business/hooks/useBusinessProfile";
import type { BusinessProfile } from "@/src/features/business/data/businessProfile";
import { MapPin, Phone } from "iconoir-react-native";
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

type BusinessInfoCardProps = {
  business: BusinessProfile;
};

export default function BusinessInfoCard({ business }: BusinessInfoCardProps) {
  const { mutate: updatePhone } = useUpdateBusinessPhone();
  const { mutate: updateAddressDescription } =
    useUpdateBusinessAddressDescription();
  //states for the form
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  //state for the Modal
  const [isPhoneModalActive, setIsPhoneModalVisible] = useState(false);
  const [isAddressModalActive, setIsAddressModalVisible] = useState(false);

  //state for alert
  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);

  //handlers for the form
  const handleUpdatePhone = () => {
    if (phone.trim() === "") {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Por favor, ingresa un número de teléfono válido.",
      });
      return;
    }
    updatePhone(phone);
    closePhoneModal();
    setAlert({
      variant: "success",
      title: "Éxito",
      message: "Número de teléfono actualizado correctamente.",
    });
  };
  const handleUpdateAddressDescription = () => {
    if (address.trim() === "") {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Por favor, ingresa una dirección válida.",
      });
      return;
    }
    updateAddressDescription(address);
    setAlert({
      variant: "success",
      title: "Éxito",
      message: "Dirección actualizada correctamente.",
    });
    closeAddressModal();
  };

  //handlers for the modal
  const openPhoneModal = () => {
    setIsPhoneModalVisible(true);
  };

  const closePhoneModal = () => {
    setIsPhoneModalVisible(false);
  };
  const openAddressModal = () => {
    setIsAddressModalVisible(true);
  };
  const closeAddressModal = () => {
    setIsAddressModalVisible(false);
  };

  const closeAlert = () => setAlert(null);

  return (
    <View style={[styles.container]}>
      {/* Columna Izquierda: Teléfono */}
      <Pressable
        style={({ pressed }) => [
          styles.column,
          pressed && Boolean(openPhoneModal) && styles.pressedColumn,
        ]}
        onPress={openPhoneModal}
      >
        <View style={styles.outerBadgePhone}>
          <View style={styles.innerBadgePhone}>
            <Phone width={19} height={19} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Teléfono
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {business.phoneNumber || "Sin teléfono"}
          </Text>
        </View>
      </Pressable>

      {/* Divisor Vertical Central */}
      <View style={styles.divider} />

      {/* Columna Derecha: Dirección */}
      <Pressable
        style={({ pressed }) => [
          styles.column,
          pressed && styles.pressedColumn,
        ]}
        onPress={openAddressModal}
      >
        <View style={styles.outerBadgeAddress}>
          <View style={styles.innerBadgeAddress}>
            <MapPin width={19} height={19} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Dirección
          </Text>
          <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
            {business.adressDescription || "Sin dirección"}
          </Text>
        </View>
      </Pressable>
      <Modal
        visible={isPhoneModalActive}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePhoneModal}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>Cambiar Teléfono del Negocio</Text>

            <InputText
              placeholder="Ingrese el nuevo teléfono"
              value={phone}
              onChangeText={setPhone}
            />
            <ButtonPrimary text="Guardar" onPress={handleUpdatePhone} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={isAddressModalActive}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeAddressModal}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>Cambiar Dirección del Negocio</Text>

            <InputText
              placeholder="Ingrese la nueva dirección"
              value={address}
              onChangeText={setAddress}
            />
            <ButtonPrimary
              text="Guardar"
              onPress={handleUpdateAddressDescription}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <AlertCard
        buttonText={
          alert?.variant === "success" ? "Continuar" : "Intentar de nuevo"
        }
        message={alert?.message ?? ""}
        onClose={closeAlert}
        title={alert?.title ?? ""}
        variant={alert?.variant ?? "success"}
        visible={alert !== null}
      />
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    flexDirection: "row",
    alignItems: "stretch",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    overflow: "hidden",
  },
  column: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
  },
  pressedColumn: {
    opacity: 0.7,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    marginVertical: 10,
  },

  // Halo / Anillo exterior Phone (Azul suave)
  outerBadgePhone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E5EDFF",
    backgroundColor: "#F4F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  // Círculo sólido Phone (Azul primario vibrante idéntico a la imagen)
  innerBadgePhone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Halo / Anillo exterior Address (Coral / Rojizo suave)
  outerBadgeAddress: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  // Círculo sólido Address (Coral / Rojo cálido idéntico a la imagen)
  innerBadgeAddress: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    marginTop: 18,
    gap: 3,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
    color: "#1C1C1E",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: "#8E8E93",
    lineHeight: 16,
  },
  disabledCard: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(8, 20, 35, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    gap: 12,
    padding: 20,
    borderRadius: theme.size_rounded.lg,
    backgroundColor: theme.surface.background,
  },
  modalText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 18,
    color: theme.text.Body,
  },
}));
