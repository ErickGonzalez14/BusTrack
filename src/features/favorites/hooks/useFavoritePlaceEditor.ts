import { useAuth } from "@/src/features/auth/context/authContext";
import type { GooglePlace } from "@/src/features/transit-map/domain/transport.type";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { saveFavoriteSite, updateFavoriteSiteName } from "../data/favoriteSites.service";
import { useFavoriteSites } from "./useFavoriteSites";

export function useFavoritePlaceEditor(place: GooglePlace | null) {
  const { user } = useAuth();
  const placeId = place?.id;
  const { sites, isLoading, error } = useFavoriteSites(Boolean(placeId));
  const favorite = placeId
    ? sites.find((site) => site.placeId === placeId || site.id === encodeURIComponent(placeId))
    : undefined;
  const [favoriteName, setFavoriteName] = useState("");
  const [selection, setSelection] = useState<{
    userId: string;
    placeId: string;
    siteId?: string;
  } | null>(null);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const saving = useRef(false);
  const editing = selection?.userId === user?.uid && selection?.placeId === placeId
    ? selection
    : null;

  useEffect(() => {
    setSelection(null);
  }, [placeId, user?.uid]);

  const openFavoriteModal = () => {
    if (!place || isLoading || saving.current) return;
    if (!user) {
      Alert.alert("Inicia sesión para guardar un lugar favorito");
      return;
    }
    if (error) {
      Alert.alert("No se pudieron cargar tus favoritos", "Inténtalo de nuevo en unos momentos.");
      return;
    }
    setFavoriteName(favorite?.name || place.name);
    setSelection({ userId: user.uid, placeId: place.id, siteId: favorite?.id });
  };

  const closeFavoriteModal = () => {
    if (saving.current) return;
    setSelection(null);
    setFavoriteName("");
  };

  const handleSaveFavorite = async () => {
    const cleanName = favoriteName.trim();
    if (!place || !user || !editing || !cleanName || saving.current) return;

    saving.current = true;
    setIsSavingFavorite(true);
    const siteId = editing.siteId ?? favorite?.id;

    try {
      if (siteId) {
        await updateFavoriteSiteName(user.uid, siteId, cleanName);
      } else {
        await saveFavoriteSite(user.uid, {
          placeId: place.id,
          name: cleanName,
          originalName: place.name,
          address: place.address,
          coordinate: place.coordinate,
          placeType: place.type,
        });
      }
      setSelection(null);
      setFavoriteName("");
      if (!siteId) {
        Alert.alert("Lugar guardado", `${cleanName} se agregó a tus favoritos.`);
      }
    } catch (favoriteError) {
      Alert.alert(
        "No pudimos guardar el lugar",
        favoriteError instanceof Error
          ? favoriteError.message
          : "Inténtalo nuevamente en unos momentos.",
      );
    } finally {
      saving.current = false;
      setIsSavingFavorite(false);
    }
  };

  return {
    isFavorite: Boolean(favorite), favoriteName, setFavoriteName,
    isFavoriteModalOpen: Boolean(editing), isEditing: Boolean(editing?.siteId), isSavingFavorite,
    openFavoriteModal, closeFavoriteModal, handleSaveFavorite,
  };
}
