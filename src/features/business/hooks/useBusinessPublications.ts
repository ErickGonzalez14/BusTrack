import {
  DiscountRequestInput,
  DiscountRequestSchema,
  ProductRequestInput,
  ProductRequestSchema,
  ServiceRequestInput,
  ServiceRequestSchema,
} from "@/src/features/business/domain/publication.schema";
import {
  submitDiscountPublication,
  getBusinessPublications,
  getMyBusinessPublications,
  submitProductPublication,
  submitServicePublication,
  type Publication,
} from "@/src/features/business/data/businessPublications";
import { getBusinessId } from "@/src/features/business/data/businessProfile";
import { uploadImageToCloudinary } from "@/src/shared/lib/uploadImage.service";
import { getAuth } from "@react-native-firebase/auth";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export const useProductPublication = () => {
  return useMutation({
    mutationFn: async (input: ProductRequestInput) => {
      const validatedData = ProductRequestSchema.parse(input);
      return submitProductPublication(validatedData);
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (imageUri: string) => {
      if (!imageUri) {
        throw new Error("No se proporcionó ninguna URI de imagen.");
      }
      return uploadImageToCloudinary(imageUri);
    },
  });
};

export const useDiscountPublication = () => {
  return useMutation({
    mutationFn: async (input: DiscountRequestInput) => {
      const validatedData = DiscountRequestSchema.parse(input);
      return submitDiscountPublication(validatedData);
    },
  });
};

export const useServicePublication = () => {
  return useMutation({
    mutationFn: async (input: ServiceRequestInput) => {
      const validatedData = ServiceRequestSchema.parse(input);
      return submitServicePublication(validatedData);
    },
  });
};

export function useBusinessPublications({ onlyMine = false } = {}) {
  const [businessPublications, setBusinessPublications] = useState<
    Publication[]
  >([]);
  const [isPublicationLoading, setIsLoading] = useState(false);
  const [publicationsError, setPublicationsError] = useState<string | null>(
    null,
  );
  const userId = getAuth().currentUser?.uid;
  const fetchBusinessPublications = useCallback(async () => {
    if (!userId) {
      setBusinessPublications([]);
      setPublicationsError("No hay un usuario autenticado.");
      return;
    }

    setIsLoading(true);
    setPublicationsError(null);

    try {
      const publications = onlyMine
        ? await getMyBusinessPublications(await getBusinessId(userId))
        : await getBusinessPublications();

      setBusinessPublications(publications);
    } catch (fetchError) {
      setBusinessPublications([]);
      setPublicationsError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudieron obtener las publicaciones.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [onlyMine, userId]);

  useEffect(() => {
    void fetchBusinessPublications();
  }, [fetchBusinessPublications]);

  return {
    businessPublications,
    isPublicationLoading,
    publicationsError,
    fetchBusinessPublications,
  };
}
