import {
  BusinessRequestInput,
  businessRequestSchema,
} from "@/src/features/business/domain/businessApplication.schema";
import { submitBusinessApplication } from "@/src/features/business/data/businessApplications";
import { getCategories, type Categories } from "@/src/features/business/data/businessProfile";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useBusinessApplication = () => {
  return useMutation({
    mutationFn: async (input: BusinessRequestInput) => {
      const validatedData = businessRequestSchema.parse(input);
      return submitBusinessApplication(validatedData);
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
