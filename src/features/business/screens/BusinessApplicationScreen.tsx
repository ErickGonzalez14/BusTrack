import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import PrimaryButton from "@/src/shared/ui/buttons/buttonPrimary";
import ButtonSecundary from "@/src/shared/ui/buttons/buttonSecundary";
import ChipButton from "@/src/shared/ui/buttons/chipButton";
import AlertCard from "@/src/shared/ui/Cards/alertCard";
import InputText from "@/src/shared/ui/inputText";
import { BUSINESS_PLANS, type BusinessPlanId } from "../data/stripe.service";
import { useBusinessApplicationForm } from "../hooks/useBusinessApplicationForm";
import { router } from "expo-router";
import { CheckCircle, CreditCard } from "iconoir-react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

export default function BusinessApplicationScreen({ planId }: { planId: BusinessPlanId }) {
  const plan = BUSINESS_PLANS[planId];
  const isLight = planId === "Light";

  const {
    selectedCategories, businessName, setBusinessName, address, categories, alert,
    isGettingLocation, isProcessingPayment, isPending, handleCategorySelection,
    handleSubmit, handleBusinessLocation, closeAlert,
  } = useBusinessApplicationForm(planId);

  const isButtonBusy = isProcessingPayment || isPending;
  const locationButton = (
    <View style={{ gap: 10, marginTop: 20, marginBottom: 20 }}>
      <ButtonSecundary
        title={
          isGettingLocation
            ? "Obteniendo ubicación..."
            : address
              ? "Ubicación seleccionada ✓"
              : "Seleccionar ubicación de la Empresa"
        }
        onPress={handleBusinessLocation}
      />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <AlternativeHeader
        SettingName={plan.name}
        onTouch={() => router.back()}
      />
      <KeyboardAwareScrollView>
        {/* Banner informativo del plan */}
        <View style={styles.planContainer}>
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planBadge}>PLAN EMPRESARIAL</Text>
              <Text
                style={styles.planTitle}
                numberOfLines={isLight ? undefined : 2}
                ellipsizeMode={isLight ? undefined : "tail"}
              >
                {plan.name}
              </Text>
            </View>
            <View style={styles.planPriceContainer}>
              <Text style={styles.planPrice}>
                ${plan.priceUSD.toFixed(2)}
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
                Pago seguro integrado y protegido con Stripe{isLight ? " Sandbox" : ""}
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
            {isLight && locationButton}
          </View>
          {!isLight && locationButton}

          <View style={styles.buttonContainer}>
            <PrimaryButton
              text={
                isProcessingPayment
                  ? "Abriendo pasarela de pago..."
                  : isPending
                    ? "Registrando empresa..."
                    : `Pagar $${plan.priceUSD.toFixed(2)} USD y Registrar`
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

const styles = StyleSheet.create((theme) => ({
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
