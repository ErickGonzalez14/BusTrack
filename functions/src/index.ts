import {setGlobalOptions} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {onRequest} from "firebase-functions/v2/https";
import Stripe from "stripe";

export {revenueCatWebhook} from "./revenueCatWebhook";

setGlobalOptions({maxInstances: 10});

/**
 * Cloud Function para crear un PaymentIntent en Stripe.
 * Utiliza STRIPE_SECRET_KEY configurada en functions/.env
 */
export const createPaymentIntent = onRequest(
  {cors: true},
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).json({error: "Método no permitido. Usa POST."});
      return;
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      logger.error(
        "Falta STRIPE_SECRET_KEY en el entorno de Firebase Functions.",
      );
      response.status(500).json({
        error:
          "Define la variable STRIPE_SECRET_KEY en functions/.env",
      });
      return;
    }

    try {
      const stripe = new Stripe(stripeSecretKey);

      const {planId, businessName = "", userId = ""} = request.body || {};

      const plans = {
        Light: {
          name: "BusTrack Business Light",
          amountInCents: 1000,
          currency: "usd",
        },
        Pro: {
          name: "BusTrack Business Pro",
          amountInCents: 3500,
          currency: "usd",
        },
      } as const;

      const plan = plans[planId as keyof typeof plans];

      if (!plan) {
        response.status(400).json({
          error: "El plan seleccionado no es válido.",
        });
        return;
      }

      logger.info(
        `Crdo ${plan.name} para ${businessName || "Empresa"} ` +
          `(Usuario: ${userId}) por ${plan.amountInCents} ${plan.currency}`,
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.amountInCents,
        currency: String(plan.currency).toLowerCase(),
        description: `${plan.name} - ${businessName || "Empresa"}`,
        metadata: {
          planId,
          planName: plan.name,
          businessName: String(businessName),
          userId: String(userId),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error("No se pudo generar el client_secret de Stripe.");
      }

      response.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido en Stripe";
      logger.error("Error al crea PaymentIntent:", errorMessage);
      response.status(500).json({error: errorMessage});
    }
  },
);
