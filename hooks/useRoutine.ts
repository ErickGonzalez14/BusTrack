import {
    RoutineRequestInput,
    RoutineRequestSchema,
} from "@/Schemas/request.schema";
import {
    RoutineRequestService,
    getRoutinesService,
    type Routines,
} from "@/Services/routineRequest.service";
import { getAuth } from "@react-native-firebase/auth";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
export function useRoutineRequest() {
  return useMutation({
    mutationFn: async (input: RoutineRequestInput) => {
      const validatedData = RoutineRequestSchema.parse(input);
      return RoutineRequestService(validatedData);
    },
  });
}

export function useGetRoutines() {
  const [routines, setRoutines] = useState<Routines[]>([]);
  const [isRoutineLoading, setIsLoading] = useState(false);
  const [RoutinesError, setRoutinesError] = useState<string | null>(null);
  const userId = getAuth().currentUser?.uid;
  const fetchRoutines = async () => {
    if (!userId) {
      setRoutines([]);
      setRoutinesError("No hay un usuario autenticado.");
      return;
    }

    setIsLoading(true);
    setRoutinesError(null);

    try {
      const result = await getRoutinesService(userId);
      setRoutines(result);
    } catch (fetchError) {
      setRoutines([]);
      setRoutinesError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudieron obtener las publicaciones.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRoutines();
  }, [userId]);
  return {
    routines,
    isRoutineLoading,
    RoutinesError,
    fetchRoutines,
  };
}
