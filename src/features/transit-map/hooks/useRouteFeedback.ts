import { submitRouteFeedback } from "@/src/features/transit-map/data/routeFeedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRouteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRouteFeedback,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["buses"] }),
        queryClient.invalidateQueries({ queryKey: ["routes"] }),
      ]);
    },
  });
}
