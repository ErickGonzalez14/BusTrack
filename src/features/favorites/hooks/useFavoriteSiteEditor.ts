import { useAuth } from "@/src/features/auth/context/authContext";
import { useRef, useState } from "react";
import {
  deleteFavoriteSite,
  type FavoriteSite,
  updateFavoriteSiteName,
} from "../data/favoriteSites.service";

type Operation = "rename" | "delete";

export function useFavoriteSiteEditor() {
  const { user } = useAuth();
  const [selection, setSelection] = useState<{ userId: string; site: FavoriteSite } | null>(null);
  const [favoriteName, setFavoriteName] = useState("");
  const [operation, setOperation] = useState<Operation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const activeSelection = selection?.userId === user?.uid ? selection : null;

  function openFavoriteModal(site: FavoriteSite) {
    if (!user || busy.current) return;

    setFavoriteName(site.name || site.originalName);
    setError(null);
    setSelection({ userId: user.uid, site });
  }

  function closeFavoriteModal() {
    if (!busy.current) setSelection(null);
  }

  async function changeFavorite(nextOperation: Operation) {
    if (!activeSelection || busy.current) return;
    const { userId, site } = activeSelection;
    const cleanName = favoriteName.trim();
    if (nextOperation === "rename" && !cleanName) return;

    busy.current = true;
    setOperation(nextOperation);
    setError(null);

    try {
      if (nextOperation === "rename") {
        await updateFavoriteSiteName(userId, site.id, cleanName);
      } else {
        await deleteFavoriteSite(userId, site.id);
      }
      setSelection(null);
    } catch {
      setError(nextOperation === "rename"
        ? "No se pudo guardar el nombre. Inténtalo de nuevo."
        : "No se pudo eliminar el favorito. Inténtalo de nuevo.");
    } finally {
      busy.current = false;
      setOperation(null);
    }
  }

  return {
    selectedSite: activeSelection?.site ?? null,
    isFavoriteModalOpen: Boolean(activeSelection),
    favoriteName,
    setFavoriteName,
    openFavoriteModal,
    closeFavoriteModal,
    isSavingFavorite: operation === "rename",
    isDeletingFavorite: operation === "delete",
    handleSaveFavorite: () => changeFavorite("rename"),
    handleDeleteFavorite: () => changeFavorite("delete"),
    error,
  };
}
