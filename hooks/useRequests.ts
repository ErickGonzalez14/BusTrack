import {
  BusinessRequestInput,
  businessRequestSchema,
  DiscountRequestInput,
  DiscountRequestSchema,
  DriverRequestInput,
  driverRequestSchema,
  ProductRequestInput,
  ProductRequestSchema,
  ServiceRequestInput,
  ServiceRequestSchema,
} from "@/Schemas/request.schema";
import {
  DiscountRequestService,
  getBusinessPublications,
  getMyBusinessPublications,
  ProductRequestService,
  ProfesionalServiceRequestService,
  type Publication,
} from "@/Services/businessRequest.service";
import {
  BusinessRequestService,
  type Categories,
  DriverRequestService,
  getBusinessCategories,
  getBusinessId,
  getCategories,
  subscribeToActiveBusiness,
} from "@/Services/request.service";
import { uploadImageToCloudinary } from "@/Services/uploadImage.service";
import { getAuth } from "@react-native-firebase/auth";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
export const useDriverRequest = () => {
  return useMutation({
    mutationFn: async (input: DriverRequestInput) => {
      const validatedData = driverRequestSchema.parse(input);
      return DriverRequestService(validatedData);
    },
  });
};

export const useBusinessRequest = () => {
  return useMutation({
    mutationFn: async (input: BusinessRequestInput) => {
      const validatedData = businessRequestSchema.parse(input);
      return BusinessRequestService(validatedData);
    },
  });
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setCategoryError(null);
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (fetchError) {
      setCategoryError((fetchError as Error).message);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    categoryError,
    fetchCategories,
  };
};

export const useActiveBusiness = () => {
  const [isBusinessApproved, setIsBusinessApproved] = useState(false);
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setIsBusinessApproved(false);
      return;
    }

    return subscribeToActiveBusiness(userId, setIsBusinessApproved);
  }, [userId]);

  return { isBusinessApproved };
};

export const useProductRequest = () => {
  return useMutation({
    mutationFn: async (input: ProductRequestInput) => {
      const validatedData = ProductRequestSchema.parse(input);
      return ProductRequestService(validatedData);
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

export const useBusinessCategories = () => {
  const [businessCategories, setBusinessCategories] = useState<Categories[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const userId = getAuth().currentUser?.uid;

  const fetchBusinessCategories = async () => {
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
  };

  useEffect(() => {
    fetchBusinessCategories();
  }, [userId]);

  return {
    businessCategories,
    isLoading,
    categoryError,
    fetchBusinessCategories,
  };
};

export const useDiscountRequest = () => {
  return useMutation({
    mutationFn: async (input: DiscountRequestInput) => {
      const validatedData = DiscountRequestSchema.parse(input);
      return DiscountRequestService(validatedData);
    },
  });
};

export const useProfesionalServiceRequest = () => {
  return useMutation({
    mutationFn: async (input: ServiceRequestInput) => {
      const validatedData = ServiceRequestSchema.parse(input);
      return ProfesionalServiceRequestService(validatedData);
    },
  });
};

export const useBusinessPublications = () => {
  const [businessPublications, setBusinessPublications] = useState<
    Publication[]
  >([]);
  const [isPublicationLoading, setIsLoading] = useState(false);
  const [publicationsError, setPublicationsError] = useState<string | null>(
    null,
  );
  const userId = getAuth().currentUser?.uid;
  const fetchBusinessPublications = async () => {
    if (!userId) {
      setBusinessPublications([]);
      setPublicationsError("No hay un usuario autenticado.");
      return;
    }

    setIsLoading(true);
    setPublicationsError(null);

    try {
      const publications = await getBusinessPublications();

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
  };

  useEffect(() => {
    fetchBusinessPublications();
  }, []);

  return {
    businessPublications,
    isPublicationLoading,
    publicationsError,
    fetchBusinessPublications,
  };
};

export const useMyBusinessPublications = () => {
  const [businessPublications, setBusinessPublications] = useState<
    Publication[]
  >([]);
  const [isPublicationLoading, setIsLoading] = useState(false);
  const [publicationsError, setPublicationsError] = useState<string | null>(
    null,
  );
  const userId = getAuth().currentUser?.uid;
  const fetchBusinessPublications = async () => {
    if (!userId) {
      setBusinessPublications([]);
      setPublicationsError("No hay un usuario autenticado.");
      return;
    }

    setIsLoading(true);
    setPublicationsError(null);

    try {
      const businessId = await getBusinessId(userId);
      const publications = await getMyBusinessPublications(businessId);

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
  };

  useEffect(() => {
    fetchBusinessPublications();
  }, [userId]);

  return {
    businessPublications,
    isPublicationLoading,
    publicationsError,
    fetchBusinessPublications,
  };
};
