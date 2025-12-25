import React from "react";
import { useAuth } from "@/context/auth";
// import { Link } from "react-router";

export const SidebarCreditBalance: React.FC = () => {
  const { currentUser, isLoading, isUserLoading, error } = useAuth();

  const loading = isLoading || isUserLoading;
  const credits = currentUser?.credits ?? currentUser?.credit;

  // Low credit threshold from env, default to 5
  const envThreshold = Number(import.meta.env.VITE_CREDIT_LOW_THRESHOLD);
  const LOW_CREDIT_THRESHOLD = Number.isFinite(envThreshold) ? envThreshold : 5;

  const isLow = typeof credits === "number" && credits < LOW_CREDIT_THRESHOLD;
  const display = loading
    ? "…"
    : error
    ? "—"
    : typeof credits === "number"
    ? String(credits)
    : "—";

  return (
    <div className="px-2 py-1 text-xs flex items-center justify-between">
      <span className="text-muted-foreground">Credits</span>
      <span className="flex items-center gap-2">
        <span
          className={`tabular-nums font-semibold ${
            isLow ? "text-red-600" : ""
          }`}
        >
          {display}
        </span>
        {/* {isLow && (
          <Link to="/account/payments" className="text-blue-600 hover:underline whitespace-nowrap">
            Buy
          </Link>
        )} */}
      </span>
    </div>
  );
};
