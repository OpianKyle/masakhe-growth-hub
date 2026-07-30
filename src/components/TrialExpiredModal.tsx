import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  trialEndedAt?: string | null;
}

export default function TrialExpiredModal({ open, trialEndedAt }: Props) {
  const navigate = useNavigate();

  if (!open) return null;

  const endedDate = trialEndedAt
    ? new Date(trialEndedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const goToBilling = () => navigate("/dashboard/billing");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-br from-red-600 to-red-500 p-6 text-white text-center">
          <div className="flex justify-end mb-2">
            <button
              onClick={goToBilling}
              className="text-white/70 hover:text-white transition-colors"
              title="Go to billing"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 rounded-full p-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-1">Your Free Trial Has Ended</h2>
          {endedDate && (
            <p className="text-white/80 text-sm">Trial ended on {endedDate}</p>
          )}
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 mb-2">
            Your 14-day free trial has expired. To continue using Masakhe and access all your business tools, please subscribe to a plan.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Free trials can only be used once. Choose a plan to restore full access.
          </p>

          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-base font-semibold"
            onClick={goToBilling}
          >
            <CreditCard className="h-5 w-5" />
            Subscribe Now
          </Button>

          <p className="text-xs text-gray-400 mt-4">
            You can only access the billing page until you subscribe.
          </p>
        </div>
      </div>
    </div>
  );
}
