import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import type { RouteRecommendation } from "../domain/transport.type";
import { useRouteFeedback } from "./useRouteFeedback";

export function useJourneyFeedback() {
  const [feedbackRoute, setFeedbackRoute] = useState<RouteRecommendation | null>(null);
  const submittingRouteFeedback = useRef(false);
  const routeFeedback = useRouteFeedback();

  const openFeedback = useCallback((route: RouteRecommendation) => {
    setFeedbackRoute((current) => current ?? route);
  }, []);

  const handleRateRoute = useCallback(async (rating: number, fare: number) => {
    if (!feedbackRoute || submittingRouteFeedback.current) return;
    submittingRouteFeedback.current = true;
    try {
      await routeFeedback.mutateAsync({
        busId: feedbackRoute.bus?.simulated ? undefined : feedbackRoute.bus?.id,
        routeId: feedbackRoute.route.id,
        rating,
        fare,
      });
      setFeedbackRoute(null);
    } catch (error) {
      Alert.alert(
        "No pudimos guardar tu calificación",
        error instanceof Error ? error.message : "Inténtalo nuevamente.",
      );
    } finally {
      submittingRouteFeedback.current = false;
    }
  }, [feedbackRoute, routeFeedback]);

  const dismissFeedback = useCallback(() => setFeedbackRoute(null), []);
  return { feedbackRoute, openFeedback, handleRateRoute, dismissFeedback, isSubmitting: routeFeedback.isPending };
}
