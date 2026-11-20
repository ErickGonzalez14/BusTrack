import { useAuth } from "@/src/features/auth/context/authContext";
import { usePremiumAdVisibility } from "@/src/features/premium/hooks/usePremiumAdVisibility";
import { usePremiumSubscription } from "@/src/features/premium/hooks/usePremiumSubscription";
import { useQuery } from "@tanstack/react-query";
import { createElement, type ReactElement } from "react";

jest.mock("@/src/features/auth/context/authContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/src/features/premium/hooks/usePremiumSubscription", () => ({
  usePremiumSubscription: jest.fn(),
}));
jest.mock("@/src/features/premium/data/premiumPurchases.service", () => ({
  premiumPurchasesConfigured: true,
  premiumEntitlementQueryKey: (uid?: string) => ["premium-entitlement", uid],
}));
jest.mock("@tanstack/react-query", () => ({ useQuery: jest.fn() }));

const { renderToStaticMarkup } = jest.requireActual<{
  renderToStaticMarkup: (element: ReactElement) => string;
}>("react-dom/server");

function BannerProbe() {
  return usePremiumAdVisibility() ? createElement("div", null, "announcement") : null;
}

describe("Anuncios y Premium", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({ user: { uid: "user-1" } } as ReturnType<typeof useAuth>);
  });

  test.each([
    { status: "loading", hasAccess: false, isSuccess: true, entitlement: null, showsAds: false },
    { status: "ready", hasAccess: false, isSuccess: false, entitlement: undefined, showsAds: false },
    { status: "ready", hasAccess: true, isSuccess: true, entitlement: null, showsAds: false },
    { status: "ready", hasAccess: false, isSuccess: true, entitlement: { isActive: true }, showsAds: false },
    { status: "ready", hasAccess: false, isSuccess: true, entitlement: null, showsAds: true },
    { status: "error", hasAccess: false, isSuccess: true, entitlement: null, showsAds: false },
  ] as const)(
    "anuncios=$showsAds con Firestore $status y store=$entitlement",
    ({ status, hasAccess, isSuccess, entitlement, showsAds }) => {
      jest.mocked(usePremiumSubscription).mockReturnValue({
        status, hasAccess, subscription: null, accessEndsAt: 0, isFromServer: false,
      });
      jest.mocked(useQuery).mockReturnValue({
        isSuccess, data: entitlement, refetch: jest.fn(),
      } as unknown as ReturnType<typeof useQuery>);

      expect(renderToStaticMarkup(createElement(BannerProbe)).includes("announcement")).toBe(showsAds);
      expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
        queryKey: ["premium-entitlement", "user-1"],
      }));
    },
  );
});
