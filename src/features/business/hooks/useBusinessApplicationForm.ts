import { useMapLocation } from "@/src/features/transit-map/hooks/useMapLocation";
import type { Coordinate } from "@/src/features/transit-map/domain/transport.type";
import type { AlertCardVariant } from "@/src/shared/ui/Cards/alertCard";
import { getAuth } from "@react-native-firebase/auth";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { BUSINESS_PLANS, createBusinessPaymentIntent, type BusinessPlanId } from "../data/stripe.service";
import { useBusinessApplication, useCategories } from "./useBusinessApplication";

export function useBusinessApplicationForm(planId: BusinessPlanId) {
  const plan = BUSINESS_PLANS[planId];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { mutate, isPending } = useBusinessApplication();
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState<Coordinate | null>(null);
  const { categories } = useCategories();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { getFreshUserLocation } = useMapLocation();

  const [alert, setAlert] = useState<{
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

    if (!address) {
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
          planId,
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
          adress: address,
          paymentIntentId,
          plan: plan.name,
          amountPaid: plan.priceUSD,
        },
        {
          onSuccess: () => {
            setAlert({
              variant: "success",
              title: "¡Pago Exitoso!",
              message: `Tu pago de $${plan.priceUSD.toFixed(2)} USD para ${plan.name} ha sido procesado y tu solicitud de Empresa fue enviada correctamente.`,
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

  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/(tabs)/settings");
    }
  };
  const handleBusinessLocation = async () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);

    try {
      const location = await getFreshUserLocation();

      setAddress({
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

  return {
    selectedCategories, businessName, setBusinessName, address, categories, alert,
    isGettingLocation, isProcessingPayment, isPending, handleCategorySelection,
    handleSubmit, handleBusinessLocation, closeAlert,
  };
}
