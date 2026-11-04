import AlternativeHeader from "@/components/Headers/alternativeHeader";
import PrimaryButton from "@/components/ui/buttons/buttonPrimary";
import ButtonSecundary from "@/components/ui/buttons/buttonSecundary";
import ChipButton from "@/components/ui/buttons/chipButton";
import AlertCard, {
  type AlertCardVariant,
} from "@/components/ui/Cards/alertCard";
import InputText from "@/components/ui/inputText";
import { useMapLocation } from "@/hooks/useMapLocation";
import { useBusinessRequest, useCategories } from "@/hooks/useRequests";
import {
  BUSINESS_PLANS,
  createBusinessPaymentIntent,
} from "@/Services/stripe.service";
import { getAuth } from "@react-native-firebase/auth";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { CheckCircle, CreditCard } from "iconoir-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

export default function BusinessLightRequest() {
  type Adress = {
    latitude: number;
    longitude: number;
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { mutate, isPending } = useBusinessRequest();
  const [businessName, setBusinessName] = useState("");
  const [adress, setAdress] = useState<Adress | null>(null);
  const { categories } = useCategories();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { getFreshUserLocation } = useMapLocation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);

  const handleCategorySelection = (categoryId: string, selected: boolean) => {
    setSelectedCategories((currentCategories) => {
      if (selected) {
        return currentCategories.includes(categoryId)
          ? currentCategories
          : [...currentCategories, categoryId];
      }
      return currentCategories.filter((id) => id !== categoryId);
    });
  };

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      Alert.alert(
        "Nombre requerido",
        "Por favor ingresa el nombre de la empresa antes de continuar.",
      );
      return;
    }

    if (selectedCategories.length === 0) {
      Alert.alert(
        "Categorías requeridas",
        "Selecciona al menos una categoría de productos para tu empresa.",
      );
      return;
    }

    if (!adress) {
      Alert.alert(
        "Ubicación requerida",
        "Selecciona la ubicación de la empresa antes de enviar.",
      );
      return;
    }

    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      Alert.alert(
        "Sesión requerida",
        "Debes tener una sesión iniciada para registrar un negocio.",
      );
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Obtener PaymentIntent desde la Cloud Function de Stripe (o fallback en sandbox)
      const { clientSecret, paymentIntentId } =
        await createBusinessPaymentIntent({
          businessName: businessName.trim(),
          userId: currentUser.uid,
          planId: "Light",
        });

      // 2. Inicializar la pasarela de pago nativa (PaymentSheet)
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "BusTrack",
        defaultBillingDetails: {
          name: currentUser.displayName || businessName.trim(),
          email: currentUser.email || undefined,
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        Alert.alert(
          "Error al inicializar pago",
          initError.message ||
            "No se pudo cargar la pasarela de pago. Intenta nuevamente.",
        );
        setIsProcessingPayment(false);
        return;
      }

      // 3. Abrir la pasarela de pago al usuario
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== "Canceled") {
          Alert.alert("Pago no completado", paymentError.message);
        }
        setIsProcessingPayment(false);
        return;
      }

      // 4. Pago exitoso -> Guardar los datos de la empresa en la base de datos
      mutate(
        {
          businessName: businessName.trim(),
          categoryId: selectedCategories,
          adress,
          paymentIntentId,
          plan: BUSINESS_PLANS.Light.name,
          amountPaid: BUSINESS_PLANS.Light.priceUSD,
        },
        {
          onSuccess: () => {
            setAlert({
              variant: "success",
              title: "¡Pago Exitoso!",
              message: `Tu pago de $${BUSINESS_PLANS.Light.priceUSD.toFixed(2)} USD para ${BUSINESS_PLANS.Light.name} ha sido procesado y tu solicitud de Empresa fue enviada correctamente.`,
            });
          },
          onError: (requestError) => {
            console.error("No se pudo completar el registro:", requestError);
            setAlert({
              variant: "error",
              title: "Error al registrar empresa",
              message:
                requestError instanceof Error
                  ? requestError.message
                  : "Tu pago se procesó pero ocurrió un error al guardar los datos.",
            });
          },
          onSettled: () => {
            setIsProcessingPayment(false);
          },
        },
      );
    } catch (paymentProcessError) {
      console.error(
        "Error en el flujo de la pasarela de pago:",
        paymentProcessError,
      );
      Alert.alert(
        "Error en la pasarela de pago",
        paymentProcessError instanceof Error
          ? paymentProcessError.message
          : "Ocurrió un error al preparar el pago.",
      );
      setIsProcessingPayment(false);
    }
  };

  const handleBusinessLocation = async () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);

    try {
      const location = await getFreshUserLocation();

      setAdress({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      Alert.alert(
        "Ubicación obtenida con éxito",
        "La ubicación de tu empresa ha sido registrada correctamente.",
      );
    } catch (locationError) {
      Alert.alert(
        "Ubicación requerida",
        locationError instanceof Error
          ? locationError.message
          : "Ocurrió un error al obtener la ubicación.",
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/(tabs)/settings");
    }
  };

  const isButtonBusy = isProcessingPayment || isPending;

  return (
    <View style={styles.mainContainer}>
      <AlternativeHeader
        SettingName="BusTrack Business Light"
        onTouch={() => router.back()}
      />
      <KeyboardAwareScrollView>
        {/* Banner informativo del plan */}
        <View style={styles.planContainer}>
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planBadge}>PLAN EMPRESARIAL</Text>
              <Text style={styles.planTitle}>{BUSINESS_PLANS.Light.name}</Text>
            </View>
            <View style={styles.planPriceContainer}>
              <Text style={styles.planPrice}>
                ${BUSINESS_PLANS.Light.priceUSD.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.planFeatures}>
            <View style={styles.featureRow}>
              <CheckCircle width={18} height={18} color="#059669" />
              <Text style={styles.featureText}>
                Publica productos, promociones y descuentos en BusTrack
              </Text>
            </View>
            <View style={styles.featureRow}>
              <CheckCircle width={18} height={18} color="#059669" />
              <Text style={styles.featureText}>
                Presencia comercial visible en rutas y mapa para usuarios
              </Text>
            </View>
            <View style={styles.featureRow}>
              <CreditCard width={18} height={18} color="#059669" />
              <Text style={styles.featureText}>
                Pago seguro integrado y protegido con Stripe Sandbox
              </Text>
            </View>
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <View style={{ gap: 10 }}>
            <Text style={styles.label}>Nombre de la Empresa</Text>
            <InputText
              placeholder="Ejemplo: BusTrack Cafe"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          <View style={{ gap: 10, marginTop: 15 }}>
            <View style={{ gap: 0 }}>
              <Text style={[styles.label, { lineHeight: 25 }]}>
                Categorías de los productos de la Empresa
              </Text>
              <Text style={styles.indications}>
                Escoge qué tipo de productos vendes para clasificar tu negocio
              </Text>
            </View>

            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <ChipButton
                  name={category.name}
                  selected={selectedCategories.includes(category.id)}
                  onSelectionChange={(_name, selected) =>
                    handleCategorySelection(category.id, selected)
                  }
                  key={category.id}
                />
              ))}
            </View>
          </View>

          <View style={{ gap: 10, marginTop: 20, marginBottom: 20 }}>
            <ButtonSecundary
              title={
                isGettingLocation
                  ? "Obteniendo ubicación..."
                  : adress
                    ? "Ubicación seleccionada ✓"
                    : "Seleccionar ubicación de la Empresa"
              }
              onPress={handleBusinessLocation}
            />
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              text={
                isProcessingPayment
                  ? "Abriendo pasarela de pago..."
                  : isPending
                    ? "Registrando empresa..."
                    : `Pagar $${BUSINESS_PLANS.Light.priceUSD.toFixed(2)} USD y Registrar`
              }
              onPress={handleSubmit}
              disabled={isButtonBusy}
            />
            {isButtonBusy && (
              <ActivityIndicator
                size="small"
                color="#1b2cc1"
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        </View>

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
      </KeyboardAwareScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.surface.background,
  },
  planContainer: {
    backgroundColor: "#afc5fe31",
    borderWidth: 1.5,
    borderColor: theme.surface.brand,
    borderRadius: theme.size_rounded.lg,
    padding: 18,
    marginHorizontal: 25,
    marginTop: 20,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planBadge: {
    fontSize: 11,
    fontFamily: theme.fonts.heavy,
    color: theme.text.contrast,
    letterSpacing: 1,
    marginBottom: 4,
  },
  planTitle: {
    maxWidth: 150,
    fontSize: 19,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  planPriceContainer: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 24,
    fontFamily: theme.fonts.heavy,
    color: theme.text.contrast,
  },

  planFeatures: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#1b2cc120",
    paddingTop: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: theme.text.Body,
    fontFamily: "Roboto_400Regular",
    flex: 1,
  },
  label: {
    fontSize: 20,
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
  },
  formContainer: {
    marginHorizontal: 25,
    marginTop: 20,
    flex: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
  },
  indications: {
    fontSize: 16,
    color: theme.text.placeholder,
    fontFamily: "Roboto_400Regular",
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 25,
  },
}));
