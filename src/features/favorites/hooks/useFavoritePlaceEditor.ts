import type { GooglePlace } from "@/src/features/transit-map/domain/transport.type";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { getFavoriteSite, saveFavoriteSite } from "../data/favoriteSites.service";

export function useFavoritePlaceEditor(place: GooglePlace | null) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [savedFavoriteName, setSavedFavoriteName] = useState("");
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  useEffect(() => {
    let isCurrentPlace = true;

    setIsFavorite(false);
    setSavedFavoriteName("");
    setIsFavoriteModalOpen(false);

    if (!place?.id) return () => undefined;

    void getFavoriteSite(place.id)
      .then((favorite) => {
        if (!isCurrentPlace || !favorite) return;
        setIsFavorite(true);
        setSavedFavoriteName(favorite.name);
      })
      .catch((favoriteError) => {
        console.warn("No se pudo consultar el lugar favorito:", favoriteError);
      });

    return () => {
      isCurrentPlace = false;
    };
  }, [place?.id]);

  const openFavoriteModal = () => {
    if (!place) return;
    setFavoriteName(savedFavoriteName || place.name);
    setIsFavoriteModalOpen(true);
  };

  const closeFavoriteModal = () => {
    if (isSavingFavorite) return;
    setIsFavoriteModalOpen(false);
    setFavoriteName("");
  };

  const handleSaveFavorite = async () => {
    const cleanName = favoriteName.trim();
    if (!place || !cleanName || isSavingFavorite) return;

    setIsSavingFavorite(true);

    try {
      await saveFavoriteSite({
        placeId: place.id,
        name: cleanName,
        originalName: place.name,
        address: place.address,
        coordinate: place.coordinate,
        placeType: place.type,
      });
      setIsFavorite(true);
      setSavedFavoriteName(cleanName);
      setIsFavoriteModalOpen(false);
      setFavoriteName("");
      Alert.alert("Lugar guardado", `${cleanName} se agregó a tus favoritos.`);
    } catch (favoriteError) {
      Alert.alert(
        "No pudimos guardar el lugar",
        favoriteError instanceof Error
          ? favoriteError.message
          : "Inténtalo nuevamente en unos momentos.",
      );
    } finally {
      setIsSavingFavorite(false);
    }
  };

  return {
    isFavorite, favoriteName, setFavoriteName, isFavoriteModalOpen, isSavingFavorite,
    openFavoriteModal, closeFavoriteModal, handleSaveFavorite,
  };
}
