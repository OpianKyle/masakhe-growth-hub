import { useNavigate } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
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

  const continueToDashboard = () => navigate("/dashboard", { replace: true });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 p-6 text-white text-center">
          <div className="flex justify-end mb-2">
            <button
              onClick={continueToDashboard}
              className="text-white/70 hover:text-white transition-colors"
              title="Continue to dashboard"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 rounded-full p-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-1">Your Masakhe Account Is Free</h2>
          {endedDate && (
            <p className="text-white/80 text-sm">Your trial period ended on {endedDate}</p>
          )}
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 mb-2">
            The trial ending does not affect your account. All Masakhe platform features remain available for free, with no subscription required.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Your business can continue using its dashboard and tools as usual.
          </p>

          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-base font-semibold"
            onClick={continueToDashboard}
          >
            <CheckCircle2 className="h-5 w-5" />
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
