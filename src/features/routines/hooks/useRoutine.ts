import {
  RoutineRequestInput,
  RoutineRequestSchema,
} from "@/src/features/routines/domain/routine.schema";
import {
    RoutineRequestService,
    getRoutinesService,
    type Routines,
} from "@/src/features/routines/data/routineRequest.service";
import { getAuth } from "@react-native-firebase/auth";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
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
  const fetchRoutines = useCallback(async () => {
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
  }, [userId]);

  useEffect(() => {
    void fetchRoutines();
  }, [fetchRoutines]);
  return {
    routines,
    isRoutineLoading,
    RoutinesError,
    fetchRoutines,
  };
}
