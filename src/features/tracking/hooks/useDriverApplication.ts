import {
  DriverRequestInput,
  driverRequestSchema,
} from "@/src/features/tracking/domain/driverApplication.schema";
import {
  submitDriverApplication,
  subscribeToActiveBus,
  type BusesListing,
} from "@/src/features/tracking/data/driverApplications";
import { useAuth } from "@/src/features/auth/context/authContext";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useDriverApplication = () => {
  return useMutation({
    mutationFn: async (input: DriverRequestInput) => {
      const validatedData = driverRequestSchema.parse(input);
      return submitDriverApplication(validatedData);
    },
  });
};

export const useActiveBus = () => {
  const { user } = useAuth();
  const [isBusApproved, setIsBusApproved] = useState(false);
  const [approvedBuses, setApprovedBuses] = useState<BusesListing[]>([]);
  const [isBusLoading, setIsBusLoading] = useState(true);
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setIsBusApproved(false);
      setApprovedBuses([]);
      setIsBusLoading(false);
      return;
    }
    return subscribeToActiveBus(userId, (activeBus) => {
      setIsBusApproved(activeBus.isApproved);
      setApprovedBuses(activeBus.approvedBuses);
      setIsBusLoading(false);
    });
  }, [userId]);
  return { isBusApproved, approvedBuses, isBusLoading };
};
