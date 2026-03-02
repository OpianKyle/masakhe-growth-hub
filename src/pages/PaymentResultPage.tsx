import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function PaymentResultPage({ status }: { status: "success" | "failed" }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (status === "success" && ref) {
      fetch("/api/billing/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ merchantRef: ref, status: "success" }),
      }).catch(() => {});
    }
  }, [status, ref]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          {status === "success" ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold">Subscription Active</h1>
              <p className="text-muted-foreground">
                Your subscription has been set up successfully. You can now access all features.
              </p>
              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/billing")}>
                  View Billing
                </Button>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold">Payment Failed</h1>
              <p className="text-muted-foreground">
                There was a problem setting up your subscription. Please try again or contact support.
              </p>
              {ref && (
                <p className="text-xs text-muted-foreground">Reference: {ref}</p>
              )}
              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={() => navigate("/pricing")}>
                  Try Again
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                  Return Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
