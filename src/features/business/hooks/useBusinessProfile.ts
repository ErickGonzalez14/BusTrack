import {
  editBusinessLogo,
  getBusinessFromPublication,
  getBusinessLogo,
  updateBusinessAddressDescription,
  updateBusinessPhone,
} from "@/src/features/business/data/businessContact";
import {
  getBusinessCategories,
  getBusinessId,
  getBusinessInfo,
  getCategories,
  subscribeToActiveBusiness,
  type Categories,
} from "@/src/features/business/data/businessProfile";
import { getAuth } from "@react-native-firebase/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export const useActiveBusiness = () => {
  const [isBusinessApproved, setIsBusinessApproved] = useState(false);
  const [businessPlan, setBusinessPlan] = useState<string | null>(null);
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setIsBusinessApproved(false);
      setBusinessPlan(null);
      return;
    }

    return subscribeToActiveBusiness(userId, (info) => {
      setIsBusinessApproved(info.isApproved);
      setBusinessPlan(info.plan);
    });
  }, [userId]);

  return { isBusinessApproved, businessPlan };
};

export const useBusinessCategories = () => {
  const [businessCategories, setBusinessCategories] = useState<Categories[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const userId = getAuth().currentUser?.uid;

  const fetchBusinessCategories = useCallback(async () => {
    if (!userId) {
      setBusinessCategories([]);
      setCategoryError("No hay un usuario autenticado.");
      return;
    }

    setIsLoading(true);
    setCategoryError(null);

    try {
      const businessId = await getBusinessId(userId);

      // IDs guardados en la empresa
      const categoryIds = await getBusinessCategories(businessId);

      // Categorías completas con id y name
      const allCategories = await getCategories();

      // Solo categorías seleccionadas por la empresa
      const availableCategories = allCategories.filter((category) =>
        categoryIds.includes(category.id),
      );

      setBusinessCategories(availableCategories);
    } catch (fetchError) {
      setBusinessCategories([]);
      setCategoryError((fetchError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchBusinessCategories();
  }, [fetchBusinessCategories]);

  return {
    businessCategories,
    isLoading,
    categoryError,
    fetchBusinessCategories,
  };
};

export const useUpdateBusinessLogo = () => {
  const queryClient = useQueryClient();
  const userId = getAuth().currentUser?.uid;

  return useMutation({
    mutationFn: async (imageUri: string) => {
      if (!imageUri) {
        throw new Error("No se proporcionó ninguna URI de imagen.");
      }

      if (!userId) {
        throw new Error("No hay un usuario autenticado.");
      }

      const businessId = await getBusinessId(userId);

      return editBusinessLogo(businessId, imageUri);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["business-logo", userId], result.logoUrl);
    },
  });
};

export const useBusinessLogo = () => {
  const userId = getAuth().currentUser?.uid;

  return useQuery({
    queryKey: ["business-logo", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("No hay un usuario autenticado.");
      }

      return getBusinessLogo(userId);
    },
    enabled: Boolean(userId),
  });
};

export const useBusinessInfo = () => {
  const userId = getAuth().currentUser?.uid;

  return useQuery({
    queryKey: ["business-name", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("No hay un usuario autenticado.");
      }
      return getBusinessInfo(userId);
    },
    enabled: Boolean(userId),
  });
};

export const useUpdateBusinessPhone = () => {
  const userId = getAuth().currentUser?.uid;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPhone: string) => {
      if (!userId) {
        throw new Error("No hay un usuario autenticado.");
      }
      const businessId = await getBusinessId(userId);
      return updateBusinessPhone(businessId, newPhone);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["business-info", userId], result.phoneNumber);
    },
  });
};

export const useUpdateBusinessAddressDescription = () => {
  const userId = getAuth().currentUser?.uid;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newAddressDescription: string) => {
      if (!userId) {
        throw new Error("No hay un usuario autenticado.");
      }
      const businessId = await getBusinessId(userId);
      return updateBusinessAddressDescription(businessId, newAddressDescription);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ["business-info", userId],
        result.adressDescription,
      );
    },
  });
};

export const useBusinessFromPublication = (businessId?: string) => {
  return useQuery({
    queryKey: ["business-from-publication", businessId],
    queryFn: () => {
      if (!businessId) {
        throw new Error("La publicación no tiene businessId.");
      }

      return getBusinessFromPublication({ businessId });
    },
    enabled: Boolean(businessId),
  });
};
