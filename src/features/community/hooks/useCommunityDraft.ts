import { getRoadTripEstimate } from "@/src/features/transit-map/data/roadRoute.service";
import type { GooglePlace } from "@/src/features/transit-map/domain/transport.type";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { createCommunityRoute, createCommunityTrip } from "../data/community.service";

type DraftKind = "route" | "trip";
const emptyDraft = {
  title: "",
  description: "",
  city: "",
  direction: "outbound" as "outbound" | "return",
};

export function useCommunityDraft(saving: boolean, setSaving: (saving: boolean) => void) {
  const [draftKind, setDraftKind] = useState<DraftKind | null>(null);
  const [draftSession, setDraftSession] = useState(0);
  const [draft, setDraft] = useState(emptyDraft);
  const [originPlace, setOriginPlace] = useState<GooglePlace | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<GooglePlace | null>(null);
  const [tripEstimate, setTripEstimate] = useState<{
    distanceKm: number; durationMinutes: number; originId: string; destinationId: string;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);

  useEffect(() => {
    setTripEstimate(null);
    setEstimateError(null);
    if (!originPlace || !destinationPlace) {
      setEstimating(false);
      return;
    }
    let active = true;
    setEstimating(true);
    getRoadTripEstimate(originPlace.coordinate, destinationPlace.coordinate)
      .then((estimate) => {
        if (active) setTripEstimate({ ...estimate, originId: originPlace.id, destinationId: destinationPlace.id });
      })
      .catch((reason: Error) => { if (active) setEstimateError(reason.message); })
      .finally(() => { if (active) setEstimating(false); });
    return () => { active = false; };
  }, [originPlace, destinationPlace]);

  function openDraft(kind: DraftKind) {
    setDraftSession((current) => current + 1);
    setDraft(emptyDraft);
    setOriginPlace(null);
    setDestinationPlace(null);
    setTripEstimate(null);
    setSelectedStops([]);
    setDraftKind(kind);
  }

  function toggleStop(id: string) {
    if (!selectedStops.includes(id) && selectedStops.length >= 20) return;
    setSelectedStops((current) =>
      current.includes(id)
        ? current.filter((stopId) => stopId !== id)
        : [...current, id],
    );
  }

  async function saveDraft() {
    if (!draftKind || saving) return;
    setSaving(true);
    try {
      if (draftKind === "route") {
        await createCommunityRoute({
          title: draft.title,
          description: draft.description,
          city: draft.city,
          direction: draft.direction,
          stopIds: selectedStops,
        });
      } else {
        if (!originPlace || !destinationPlace || !tripEstimate || estimating ||
            tripEstimate.originId !== originPlace.id || tripEstimate.destinationId !== destinationPlace.id) {
          throw new Error("Selecciona origen y destino de las sugerencias y espera el cálculo del recorrido.");
        }
        await createCommunityTrip({
          title: draft.title,
          description: draft.description,
          origin: originPlace.name,
          destination: destinationPlace.name,
          originPlaceId: originPlace.id,
          destinationPlaceId: destinationPlace.id,
          originCoordinate: originPlace.coordinate,
          destinationCoordinate: destinationPlace.coordinate,
          distanceKm: tripEstimate.distanceKm,
          durationMinutes: tripEstimate.durationMinutes,
        });
      }
      setDraftKind(null);
      Alert.alert(
        "Enviado",
        "Tu propuesta aparecerá cuando termine la validación.",
      );
    } catch (reason) {
      Alert.alert("No se pudo crear", (reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return {
    draftKind, draftSession, draft, setDraft, openDraft, closeDraft: () => setDraftKind(null),
    originPlace, setOriginPlace, destinationPlace, setDestinationPlace, tripEstimate,
    estimating, estimateError, selectedStops, toggleStop, saveDraft,
  };
}
