import { Coordinate, GooglePlace, PlaceSuggestion } from "@/interfaces/transport.type";
import { normalizeCoordinate } from "@/lib/mapRouting";
import Constants from "expo-constants";

const PLACES_API_URL = "https://places.googleapis.com/v1/places";
const CHIRIQUI_VIEWPORT = {
  low: { latitude: 7.7, longitude: -83.2 },
  high: { latitude: 9.1, longitude: -81.45 },
};

const getApiKey = () => {
  const apiKey = Constants.expoConfig?.extra?.googlePlacesApiKey;

  if (typeof apiKey !== "string" || !apiKey) {
    throw new Error("La clave de Google Places no está configurada.");
  }

  return apiKey;
};

const parseGoogleError = async (response: Response) => {
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
    };
    return body.error?.message || "Google Places no respondió correctamente.";
  } catch {
    return "Google Places no respondió correctamente.";
  }
};

export async function searchPlaces(
  input: string,
  origin?: Coordinate,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const trimmedInput = input.trim();
  if (trimmedInput.length < 2) return [];

  const response = await fetch(`${PLACES_API_URL}:autocomplete`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
    },
    body: JSON.stringify({
      input: trimmedInput,
      includedRegionCodes: ["pa"],
      languageCode: "es",
      regionCode: "pa",
      ...(origin ? { origin } : {}),
      locationRestriction: { rectangle: CHIRIQUI_VIEWPORT },
    }),
  });

  if (!response.ok) {
    throw new Error(await parseGoogleError(response));
  }

  const body = (await response.json()) as {
    suggestions?: {
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }[];
  };

  return (body.suggestions ?? []).flatMap(({ placePrediction }) => {
    if (!placePrediction?.placeId) return [];
    return [
      {
        id: placePrediction.placeId,
        name:
          placePrediction.structuredFormat?.mainText?.text ||
          placePrediction.text?.text ||
          "Lugar",
        secondaryText: placePrediction.structuredFormat?.secondaryText?.text,
      },
    ];
  });
}

export async function getPlaceDetails(
  placeId: string,
  fallback?: Partial<GooglePlace>,
): Promise<GooglePlace> {
  const fields = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "primaryTypeDisplayName",
    "rating",
    "userRatingCount",
    "regularOpeningHours.openNow",
  ].join(",");
  const response = await fetch(
    `${PLACES_API_URL}/${encodeURIComponent(placeId)}?languageCode=es&regionCode=pa`,
    {
      headers: {
        "X-Goog-Api-Key": getApiKey(),
        "X-Goog-FieldMask": fields,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await parseGoogleError(response));
  }

  const body = (await response.json()) as {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: Coordinate;
    primaryTypeDisplayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    regularOpeningHours?: { openNow?: boolean };
  };
  const coordinate = normalizeCoordinate(body.location ?? fallback?.coordinate);

  if (!coordinate) {
    throw new Error("Google Places no devolvió la ubicación del lugar.");
  }

  return {
    id: body.id || placeId,
    name: body.displayName?.text || fallback?.name || "Lugar seleccionado",
    secondaryText: fallback?.secondaryText,
    coordinate,
    address: body.formattedAddress || fallback?.address,
    type: body.primaryTypeDisplayName?.text || fallback?.type,
    rating: body.rating,
    userRatingCount: body.userRatingCount,
    openNow: body.regularOpeningHours?.openNow,
  };
}
