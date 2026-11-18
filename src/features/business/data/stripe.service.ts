import Constants from "expo-constants";

export const BUSINESS_PLANS = {
  Light: {
    id: "light",
    name: "BusTrack Business Light",
    priceUSD: 10.0,
    amountInCents: 1000,
    currency: "usd",
    features: ["search_visibility"],
  },
  Pro: {
    id: "pro",
    name: "BusTrack Business Pro",
    priceUSD: 35.0,
    amountInCents: 3500,
    currency: "usd",
    features: ["search_visibility", "geolocated_popups"],
  },
} as const;
export type BusinessPlanId = keyof typeof BUSINESS_PLANS;

type CreatePaymentIntentParams = {
  businessName: string;
  userId: string;
  planId: BusinessPlanId;
};

type PaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
};

/**
 * Obtiene o crea un PaymentIntent en Stripe para procesar la suscripción de registro de negocio.
 * 1. Si está configurada una URL en EXPO_PUBLIC_STRIPE_FUNCTIONS_URL, llama a la Cloud Function.
 * 2. Si no hay URL configurada o la Cloud Function no está disponible (404/error), utiliza el
 *    modo Sandbox directo con STRIPE_SECRET_KEY.
 */
export const createBusinessPaymentIntent = async ({
  businessName,
  userId,
  planId,
}: CreatePaymentIntentParams): Promise<PaymentIntentResult> => {
  const plan = BUSINESS_PLANS[planId];
  if (!plan) {
    throw new Error(`Plan de negocio: ${planId}` + "no es válido.");
  }
  const { amountInCents, currency } = plan;
  const extra = Constants.expoConfig?.extra;
  const functionsUrl =
    process.env.EXPO_PUBLIC_STRIPE_FUNCTIONS_URL || extra?.stripeFunctionsUrl;
  const stripeSecretKey =
    process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    extra?.stripeSecretKey;

  // 1. Intentar llamar a Cloud Function sólo si hay una URL configurada explícitamente
  if (functionsUrl && functionsUrl.trim().length > 0) {
    try {
      const response = await fetch(functionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency,
          businessName,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.clientSecret) {
          return {
            clientSecret: data.clientSecret,
            paymentIntentId: data.paymentIntentId || "",
          };
        }
      }

      console.warn(
        `Cloud Function respondió con código ${response.status}. Intentando fallback directo en sandbox...`,
      );
    } catch (cloudFnError) {
      console.warn(
        "No se pudo contactar a la Cloud Function:",
        cloudFnError,
        "Intentando fallback directo en sandbox...",
      );
    }
  }

  // 2. Fallback de Sandbox directo llamando a la API de Stripe
  if (stripeSecretKey && stripeSecretKey.trim().length > 0) {
    console.log(
      `[Stripe Sandbox] Generando PaymentIntent de $${(amountInCents / 100).toFixed(2)} ${currency.toUpperCase()} directamente...`,
    );

    const bodyParams = [
      `amount=${encodeURIComponent(amountInCents.toString())}`,
      `currency=${encodeURIComponent(currency.toLowerCase())}`,
      `description=${encodeURIComponent(
        `Plan ${plan.name} - ${businessName || "Empresa"}`,
      )}`,
      `metadata[plan]=${encodeURIComponent(planId)}`,
      `metadata[businessName]=${encodeURIComponent(businessName)}`,
      `metadata[userId]=${encodeURIComponent(userId)}`,
      `automatic_payment_methods[enabled]=true`,
    ].join("&");

    const directResponse = await fetch(
      "https://api.stripe.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey.trim()}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams,
      },
    );

    const directData = await directResponse.json();

    if (!directResponse.ok || directData.error) {
      throw new Error(
        directData.error?.message ||
          `Error en Stripe (${directResponse.status}): no se pudo generar el pago en sandbox.`,
      );
    }

    if (!directData.client_secret) {
      throw new Error(
        "Stripe no devolvió el client_secret para completar el pago.",
      );
    }

    return {
      clientSecret: directData.client_secret,
      paymentIntentId: directData.id,
    };
  }

  throw new Error(
    "No se encontró STRIPE_SECRET_KEY en el entorno (.env). Por favor verifica que tu clave privada de Stripe esté configurada.",
  );
};
