import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Check,
} from "lucide-react";

const paymentFormSchema = z.object({
  planCode: z.string(),
  recipientName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  mobileNumber: z.string().optional(),
  collectionDay: z.number().min(1).max(28),
  startDate: z.string().min(1, "Start date is required"),
  shippingAddress1: z.string().optional(),
  shippingAddress2: z.string().optional(),
  shippingAddress3: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const planCode = searchParams.get("plan") || "starter";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const { data: plansData, isLoading: planLoading } = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: () => fetch("/api/billing/plans").then((r) => r.json()),
  });

  const plan = plansData?.plans?.find((p: any) => p.code === planCode);

  const today = new Date();
  const defaultStartDate = new Date(today);
  defaultStartDate.setMonth(defaultStartDate.getMonth() + 1);
  defaultStartDate.setDate(1);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      planCode,
      recipientName: user?.full_name || "",
      email: user?.email || "",
      contactNumber: user?.phone || "",
      mobileNumber: user?.phone || "",
      collectionDay: 1,
      startDate: defaultStartDate.toISOString().split("T")[0],
      shippingAddress1: "",
      shippingAddress2: "",
      shippingAddress3: "",
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planCode: data.planCode,
          collectionDay: data.collectionDay,
          frequency: "MONTHLY",
          recipientName: data.recipientName,
          email: data.email,
          contactNumber: data.contactNumber,
          mobileNumber: data.mobileNumber,
          startDate: data.startDate,
          shippingAddress1: data.shippingAddress1,
          shippingAddress2: data.shippingAddress2,
          shippingAddress3: data.shippingAddress3,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to initiate payment");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setPaymentData(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!paymentData) return;
    if (paymentData.mock) {
      fetch("/api/billing/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ merchantRef: paymentData.merchantRef, status: "success" }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.ok) navigate("/dashboard/billing?payment=success");
          else toast({ title: "Error", description: json.error || "Payment failed", variant: "destructive" });
        });
    } else if (paymentData.formAction && paymentData.fields && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData, navigate, toast]);

  const onSubmit = (data: PaymentFormData) => {
    paymentMutation.mutate(data);
  };

  const formatPrice = (cents: number) =>
    `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

  if (planLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Skeleton className="h-[600px] rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[300px] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">Plan not found</p>
            <Button onClick={() => navigate("/pricing")}>Back to Plans</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {paymentData && !paymentData.mock && paymentData.fields && (
        <form
          ref={formRef}
          action={paymentData.formAction}
          method="POST"
          style={{ display: "none" }}
        >
          {Object.entries(paymentData.fields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={String(value)} />
          ))}
        </form>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <button
          onClick={() => navigate("/pricing")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-foreground rounded-md px-2 py-1 -ml-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to plans
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2">
          Complete Your Subscription
        </h1>
        <p className="text-muted-foreground mb-8">
          Fill in your details below to subscribe to the <strong>{plan.name}</strong> plan.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Subscriber Details
                </h2>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <input type="hidden" {...form.register("planCode")} />

                    <FormField
                      control={form.control}
                      name="recipientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+27211234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              Mobile Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+27821234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <h3 className="text-base font-medium flex items-center gap-2 pt-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      Billing Schedule
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="collectionDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collection Day</FormLabel>
                            <Select
                              onValueChange={(v) => field.onChange(parseInt(v))}
                              defaultValue={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={String(day)}>
                                    {day}
                                    {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of each month
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <h3 className="text-base font-medium flex items-center gap-2 pt-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      Address (Optional)
                    </h3>

                    <FormField
                      control={form.control}
                      name="shippingAddress1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingAddress2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City / Suburb</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingAddress3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Province / State</FormLabel>
                            <FormControl>
                              <Input placeholder="Province" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full mt-4"
                      disabled={paymentMutation.isPending || !!paymentData}
                    >
                      {paymentMutation.isPending || paymentData ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscribe — {formatPrice(plan.price_cents)}/month
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium">{plan.name} Plan</p>
                      <p className="text-sm text-muted-foreground">Billed monthly</p>
                    </div>
                    <p className="font-semibold text-lg">{formatPrice(plan.price_cents)}</p>
                  </div>

                  <Separator />

                  <ul className="space-y-2">
                    {[
                      "14-day free trial",
                      "Cancel anytime",
                      "Secure debit order",
                      "Instant activation",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Today</span>
                      <span className="font-semibold text-green-600">R0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After Trial</span>
                      <span className="font-semibold">{formatPrice(plan.price_cents)}/mo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Secure Debit Order</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Your subscription is processed securely through Adumo Online. Card details
                        are never stored on our servers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
