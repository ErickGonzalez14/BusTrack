import {
  BusinessRequestInput,
  businessRequestSchema,
  DriverRequestInput,
  driverRequestSchema,
} from "@/Schemas/request.schema";
import {
  BusinessRequestService,
  type Categories,
  DriverRequestService,
  getCategories,
} from "@/Services/request.service";
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
