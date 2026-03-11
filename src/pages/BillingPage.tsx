import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreditCard, Calendar, AlertTriangle,
  Clock, Loader2, Shield, CalendarDays, Wallet,
  User, Mail, Phone, MapPin, Check, ArrowUpCircle, ArrowDownCircle, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Plan {
  id: number;
  code: string;
  name: string;
  price_cents: number;
  currency: string;
  bill_interval: string;
}

interface Subscription {
  id?: number;
  workspace_id?: string;
  plan_id?: number;
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  trial_start_at?: string | null;
  trial_end_at?: string | null;
  next_billing_at?: string | null;
  cancelled_at?: string | null;
  synthetic?: boolean;
}

interface PaymentMethod {
  id: number;
  last4: string | null;
  brand: string | null;
  exp_month: number | null;
  exp_year: number | null;
  status: string;
}

interface BillingInvoice {
  id: number;
  amount_cents: number;
  currency: string;
  status: string;
  merchant_ref: string | null;
  created_at: string;
  paid_at: string | null;
}

interface BillingData {
  subscription: Subscription | null;
  plan: Plan | null;
  paymentMethod?: PaymentMethod | null;
  invoices?: BillingInvoice[];
}

const planOptions = [
  {
    code: "starter",
    name: "Starter",
    price: "R899",
    priceCents: 89900,
    description: "Website Builder, Financial Tracking, Invoices, Compliance Score, Funding Scoring",
  },
  {
    code: "pro",
    name: "Pro",
    price: "R2,500",
    priceCents: 250000,
    description: "Everything in Starter + Social Media Hub, Content Calendar, Analytics, Media Library",
    popular: true,
  },
];

function formatCents(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

function daysRemaining(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

function statusBadge(status: string) {
  const variants: Record<string, { className: string; label: string }> = {
    TRIAL: { className: "bg-sa-blue/10 text-[hsl(225,100%,29%)] border-[hsl(225,100%,29%)]/20", label: "Trial" },
    ACTIVE: { className: "bg-sa-green/10 text-[hsl(155,100%,24%)] border-[hsl(155,100%,24%)]/20", label: "Active" },
    PAST_DUE: { className: "bg-sa-red/10 text-[hsl(2,72%,54%)] border-[hsl(2,72%,54%)]/20", label: "Past Due" },
    CANCELLED: { className: "bg-muted text-muted-foreground border-border", label: "Cancelled" },
    PAID: { className: "bg-sa-green/10 text-[hsl(155,100%,24%)] border-[hsl(155,100%,24%)]/20", label: "Paid" },
    PENDING: { className: "bg-sa-gold/10 text-[hsl(41,100%,40%)] border-[hsl(41,100%,40%)]/20", label: "Pending" },
    FAILED: { className: "bg-sa-red/10 text-[hsl(2,72%,54%)] border-[hsl(2,72%,54%)]/20", label: "Failed" },
  };
  const v = variants[status] || { className: "bg-muted text-muted-foreground", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${v.className}`}>
      {v.label}
    </span>
  );
}

const checkoutSchema = z.object({
  planCode: z.enum(["starter", "pro"]),
  recipientName: z.string().min(2, "Full name is required"),
  email: z.string().email("A valid email address is required"),
  contactNumber: z.string().min(7, "Contact number is required"),
  mobileNumber: z.string().optional(),
  collectionDay: z.number().min(1).max(28),
  startDate: z.string().min(1, "Start date is required"),
  shippingAddress1: z.string().optional(),
  shippingAddress2: z.string().optional(),
  shippingAddress3: z.string().optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms and Conditions" }) }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function ordinal(n: number) {
  return n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
}

function InlineSubscribeForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const { toast } = useToast();

  const defaultStartDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toISOString().split("T")[0];
  })();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      planCode: "starter",
      recipientName: user?.full_name || "",
      email: user?.email || "",
      contactNumber: user?.phone || "",
      mobileNumber: "",
      collectionDay: 1,
      startDate: defaultStartDate,
      shippingAddress1: "",
      shippingAddress2: "",
      shippingAddress3: "",
      acceptTerms: false as any,
    },
  });

  useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);

  const selectedPlanCode = form.watch("planCode");
  const plan = planOptions.find((p) => p.code === selectedPlanCode)!;

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planCode: data.planCode,
          recipientName: data.recipientName,
          email: data.email,
          contactNumber: data.contactNumber,
          mobileNumber: data.mobileNumber || data.contactNumber,
          collectionDay: String(data.collectionDay),
          startDate: data.startDate,
          shippingAddress1: data.shippingAddress1 || "",
          shippingAddress2: data.shippingAddress2 || "",
          shippingAddress3: data.shippingAddress3 || "",
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "You already have an active subscription") {
          toast({ title: "Already subscribed", description: "You already have an active subscription." });
          onSuccess();
          return;
        }
        toast({ title: "Error", description: json.error || "Failed to start checkout.", variant: "destructive" });
        return;
      }

      if (json.formAction && json.fields) {
        setPaymentData(json);
      }
    } catch {
      toast({ title: "Error", description: "Failed to process subscription.", variant: "destructive" });
    }
  };

  return (
    <>
      {paymentData && (
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Choose a Plan
            </h3>
            <FormField
              control={form.control}
              name="planCode"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-3">
                    {planOptions.map((p) => (
                      <label
                        key={p.code}
                        className={`relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                          field.value === p.code
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={p.code}
                          checked={field.value === p.code}
                          onChange={() => field.onChange(p.code)}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground font-heading">{p.name}</span>
                            {p.popular && (
                              <span className="gradient-gold text-sa-black text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>
                            )}
                          </div>
                          <p className="text-lg font-bold font-heading text-foreground">
                            {p.price}<span className="text-sm font-normal text-muted-foreground">/month</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Subscriber Details
            </h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-xs">
                      <User className="h-3 w-3" /> Full Name
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
                    <FormLabel className="flex items-center gap-1.5 text-xs">
                      <Mail className="h-3 w-3" /> Email Address
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
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3" /> Contact Number
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
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3" /> Mobile Number <span className="text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+27871234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Debit Order Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="collectionDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Collection Day</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={String(day)}>
                            {ordinal(day)} of each month
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
                    <FormLabel className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3" /> First Collection Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Address <span className="text-muted-foreground font-normal">(optional)</span>
            </h3>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="shippingAddress1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="shippingAddress2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Suburb / City</FormLabel>
                      <FormControl>
                        <Input placeholder="Sandton" {...field} />
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
                      <FormLabel className="text-xs">Province / Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Gauteng, 2196" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold text-foreground">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Starts</span>
              <span className="text-sa-green font-semibold">After trial ends</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Then</span>
              <span className="font-semibold text-foreground">{plan.price}/month</span>
            </div>
          </div>

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-0.5 accent-primary h-4 w-4"
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    I have read and agree to the{" "}
                    <a
                      href="/api/billing/terms-pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline font-medium"
                    >
                      Terms and Conditions
                    </a>
                    , and authorise a monthly debit order via Adumo Online for the selected subscription plan.
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
            Your debit order will be processed securely via Adumo Online. Your first payment will only be collected once your trial period ends.
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting || !!paymentData}
          >
            {form.formState.isSubmitting || paymentData ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirecting to payment...</>
            ) : (
              <><Check className="h-4 w-4 mr-2" />Subscribe Now</>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

const changePlanSchema = z.object({
  recipientName: z.string().min(2, "Full name is required"),
  email: z.string().email("A valid email address is required"),
  contactNumber: z.string().min(7, "Contact number is required"),
  mobileNumber: z.string().optional(),
  collectionDay: z.number().min(1).max(28),
  startDate: z.string().min(1, "Start date is required"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms and Conditions" }) }),
});

type ChangePlanFormData = z.infer<typeof changePlanSchema>;

function ChangePlanSection({ currentPlanCode, onSuccess }: { currentPlanCode: string; onSuccess: () => void }) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const targetPlan = currentPlanCode === "starter"
    ? planOptions.find((p) => p.code === "pro")!
    : planOptions.find((p) => p.code === "starter")!;

  const isUpgrade = currentPlanCode === "starter";

  const defaultStartDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toISOString().split("T")[0];
  })();

  const form = useForm<ChangePlanFormData>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: {
      recipientName: user?.full_name || "",
      email: user?.email || "",
      contactNumber: user?.phone || "",
      mobileNumber: "",
      collectionDay: 1,
      startDate: defaultStartDate,
      acceptTerms: false as any,
    },
  });

  useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);

  const onSubmit = async (data: ChangePlanFormData) => {
    try {
      const res = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newPlanCode: targetPlan.code,
          recipientName: data.recipientName,
          email: data.email,
          contactNumber: data.contactNumber,
          mobileNumber: data.mobileNumber || data.contactNumber,
          collectionDay: String(data.collectionDay),
          startDate: data.startDate,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: json.error || "Failed to change plan.", variant: "destructive" });
        return;
      }

      if (json.formAction && json.fields) {
        setPaymentData(json);
      }
    } catch {
      toast({ title: "Error", description: "Failed to process plan change.", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6 shadow-card"
    >
      {paymentData && (
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

      <h3 className="text-lg font-bold font-heading text-foreground mb-2 flex items-center gap-2">
        {isUpgrade ? (
          <ArrowUpCircle className="h-5 w-5 text-sa-green" />
        ) : (
          <ArrowDownCircle className="h-5 w-5 text-muted-foreground" />
        )}
        {isUpgrade ? "Upgrade Your Plan" : "Change Plan"}
      </h3>

      {!showForm ? (
        <div className="space-y-4">
          <div className={`rounded-xl border p-4 ${isUpgrade ? "border-primary/30 bg-primary/5" : "border-border"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground font-heading">{targetPlan.name}</span>
                  {isUpgrade && (
                    <span className="gradient-gold text-sa-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="h-2.5 w-2.5" /> Recommended
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold font-heading text-foreground">
                  {targetPlan.price}<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{targetPlan.description}</p>
                {isUpgrade && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">Unlocks with Pro:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sa-green" />Premium website templates</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sa-green" />Vehicle inventory management</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sa-green" />Website leads tracking</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sa-green" />Social Media Hub with analytics</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sa-green" />Content calendar and media library</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowForm(true)}
            className={isUpgrade ? "w-full" : "w-full"}
            variant={isUpgrade ? "default" : "outline"}
            size="lg"
          >
            {isUpgrade ? (
              <><ArrowUpCircle className="h-4 w-4 mr-2" />Upgrade to {targetPlan.name} — {targetPlan.price}/month</>
            ) : (
              <><ArrowDownCircle className="h-4 w-4 mr-2" />Switch to {targetPlan.name} — {targetPlan.price}/month</>
            )}
          </Button>

          {!isUpgrade && (
            <p className="text-xs text-muted-foreground text-center">
              Downgrading will remove access to premium features including premium templates, vehicle inventory, and lead tracking.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUpgrade ? "bg-sa-green/10" : "bg-muted"}`}>
              {isUpgrade ? <ArrowUpCircle className="h-4 w-4 text-sa-green" /> : <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {isUpgrade ? "Upgrading" : "Switching"} to {targetPlan.name} — {targetPlan.price}/month
              </p>
              <p className="text-xs text-muted-foreground">
                Your current subscription will be cancelled and replaced with the new plan. A new debit order will be set up via Adumo.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <User className="h-3 w-3" /> Full Name
                      </FormLabel>
                      <FormControl><Input placeholder="John Smith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <Mail className="h-3 w-3" /> Email
                      </FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3" /> Contact Number
                      </FormLabel>
                      <FormControl><Input placeholder="+27211234567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="collectionDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <CalendarDays className="h-3 w-3" /> Collection Day
                      </FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(parseInt(v))}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Day of month" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                            <SelectItem key={d} value={String(d)}>{ordinal(d)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3" /> Debit Order Start Date
                    </FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 accent-primary"
                      />
                      <div className="text-xs text-muted-foreground">
                        I accept the{" "}
                        <a href="/api/billing/terms-pdf" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                          Terms and Conditions
                        </a>
                        , and authorise a new monthly debit order via Adumo Online for the {targetPlan.name} plan.
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                Your new debit order will be processed securely via Adumo Online.
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={form.formState.isSubmitting || !!paymentData}
                >
                  {form.formState.isSubmitting || paymentData ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirecting to payment...</>
                  ) : (
                    <><Check className="h-4 w-4 mr-2" />Confirm {isUpgrade ? "Upgrade" : "Plan Change"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </motion.div>
  );
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/subscription", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData({ subscription: null, plan: null });
      }
    } catch {
      setData({ subscription: null, plan: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBilling(); }, []);

  useEffect(() => {
    const paymentResult = searchParams.get("payment");
    if (paymentResult) {
      if (paymentResult === "success") {
        toast({ title: "Payment Successful!", description: "Your subscription is now active. Welcome to Masakhe!" });
      } else if (paymentResult === "failed") {
        toast({ title: "Payment Failed", description: "Your payment was not processed. Please try again.", variant: "destructive" });
      } else if (paymentResult === "error") {
        toast({ title: "Something went wrong", description: "There was an issue processing your payment. Please contact support.", variant: "destructive" });
      }
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Subscription cancelled", description: "Your subscription has been cancelled." });
        fetchBilling();
      } else {
        toast({ title: "Error", description: json.error || "Failed to cancel.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to cancel subscription.", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { subscription, plan, invoices } = data || {};

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold font-heading text-foreground">Billing</h2>
        <p className="text-muted-foreground mt-1">Manage your subscription, payment method, and view billing history.</p>
      </motion.div>

      {(!subscription || subscription.synthetic) ? (
        <>
          {subscription?.synthetic && subscription.trial_end_at && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-[hsl(41,100%,54%)]/30 bg-[hsl(41,100%,54%)]/5 p-6 shadow-card"
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[hsl(41,100%,54%)]" />
                Free Trial Active
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold text-foreground">{daysRemaining(subscription.trial_end_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trial Ends</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(subscription.trial_end_at)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Subscribe to a paid plan below. Your debit order only starts after your trial ends.
              </p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-8 shadow-card space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full gradient-hero flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground">Choose Your Plan</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Select a plan to activate your subscription. Your debit order only begins after your trial ends. Cancel anytime.
              </p>
            </div>
            <InlineSubscribeForm onSuccess={fetchBilling} />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h3 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Current Plan
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-heading text-foreground">{plan?.name || "Unknown"}</span>
                  {statusBadge(subscription.status)}
                </div>
                <p className="text-muted-foreground">
                  {plan ? `${formatCents(plan.price_cents)} / month` : ""}
                </p>
              </div>
            </div>
          </motion.div>

          {subscription.status === "TRIAL" && subscription.trial_end_at && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-[hsl(41,100%,54%)]/30 bg-[hsl(41,100%,54%)]/5 p-6 shadow-card"
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[hsl(41,100%,54%)]" />
                Trial Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold text-foreground">{daysRemaining(subscription.trial_end_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trial Ends</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(subscription.trial_end_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount After Trial</p>
                  <p className="text-lg font-semibold text-foreground">{plan ? formatCents(plan.price_cents) : "—"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {subscription.status === "ACTIVE" && subscription.next_billing_at && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Next Billing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Next Charge Date</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(subscription.next_billing_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-foreground">{plan ? formatCents(plan.price_cents) : "—"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {subscription.status === "PAST_DUE" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-[hsl(2,72%,54%)]/30 bg-[hsl(2,72%,54%)]/5 p-8 shadow-card space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-bold font-heading text-foreground">Payment Past Due</h3>
                <p className="text-sm text-muted-foreground">Your last payment failed. Re-subscribe below to restore access to all features.</p>
              </div>
              <InlineSubscribeForm onSuccess={fetchBilling} />
            </motion.div>
          )}

          {(subscription.status === "TRIAL" || subscription.status === "ACTIVE") && plan?.code && (
            <ChangePlanSection currentPlanCode={plan.code} onSuccess={fetchBilling} />
          )}

          {(subscription.status === "TRIAL" || subscription.status === "ACTIVE") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-2">Cancel Subscription</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {subscription.status === "TRIAL"
                  ? "Cancel your trial. You won't be charged."
                  : "Cancel your subscription. You'll retain access until the end of your current billing period."}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {subscription.status === "TRIAL"
                        ? "Your trial will end immediately and you won't be charged."
                        : "Your subscription will be cancelled. You'll lose access to premium features at the end of your billing period."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          )}
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-bold font-heading text-foreground mb-4">Billing History</h3>
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reference</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 px-3 text-foreground">{formatDate(inv.created_at)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{inv.merchant_ref || `INV-${inv.id}`}</td>
                    <td className="py-2.5 px-3 text-foreground text-right">{formatCents(inv.amount_cents)}</td>
                    <td className="py-2.5 px-3 text-center">{statusBadge(inv.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No billing history yet.</p>
        )}
      </motion.div>
    </div>
  );
}
