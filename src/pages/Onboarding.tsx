import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "radio" | "checkbox" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

type Step = {
  step_key: string;
  title: string;
  description?: string;
  order_index: number;
  condition: any | null;
  fields: Field[];
};

function meetsCondition(values: any, condition: any | null) {
  if (!condition) return true;
  if (condition.equals) {
    return condition.equals.every((c: any) => values?.[c.field] === c.value);
  }
  return true;
}

// Mock data for the onboarding flow
const MOCK_FLOW = {
  steps: [
    {
      step_key: "business_type",
      title: "Business Type",
      description: "Tell us about the kind of business you're starting.",
      order_index: 0,
      condition: null,
      fields: [
        {
          name: "type",
          label: "What type of business is it?",
          type: "select" as const,
          required: true,
          options: [
            { label: "Private Company (Pty) Ltd", value: "pty" },
            { label: "Sole Proprietorship", value: "sole" },
            { label: "Non-Profit Company (NPC)", value: "npc" },
          ],
        },
      ],
    },
    {
      step_key: "business_details",
      title: "Business Details",
      description: "Basic information about your enterprise.",
      order_index: 1,
      condition: null,
      fields: [
        { name: "name", label: "Proposed Business Name", type: "text" as const, required: true, placeholder: "e.g. Masakhe Tech" },
        { name: "industry", label: "Industry", type: "text" as const, required: true, placeholder: "e.g. Retail, Tech, Agriculture" },
      ],
    },
    {
      step_key: "tax_details",
      title: "Tax Registration",
      description: "SARS compliance information.",
      order_index: 2,
      condition: { equals: [{ field: "type", value: "pty" }] },
      fields: [
        { name: "vat_reg", label: "Do you need to register for VAT?", type: "checkbox" as const },
        { name: "tax_number", label: "Existing Tax Number (if any)", type: "text" as const },
      ],
    },
  ],
};

export default function Onboarding() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, getValues, setValue } = useForm({ defaultValues: {} });
  const values = watch();

  useEffect(() => {
    fetch("/api/onboarding/flow")
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(data => setSteps(data.steps))
      .catch(err => {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load onboarding flow.",
          variant: "destructive",
        });
      });
  }, []);

  const visibleSteps = useMemo(() => steps.filter(s => meetsCondition(values, s.condition)), [steps, values]);
  const step = visibleSteps[active];

  async function submitAll(payload: any) {
    console.log("Submitting payload:", payload);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "onboarding", payload }),
      });
      
      if (!res.ok) throw new Error("Submission failed");

      toast({
        title: "Success! ✅",
        description: "Your business onboarding is complete.",
      });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit onboarding.",
        variant: "destructive",
      });
    }
  }

  if (!step) return <div className="flex items-center justify-center min-h-screen">Loading…</div>;

  return (
    <div className="container max-w-2xl py-20">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-heading">{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(async () => {
              if (active < visibleSteps.length - 1) setActive(a => a + 1);
              else await submitAll(getValues());
            })}
            className="grid gap-6"
          >
            {step.fields.map((f) => (
              <div key={f.name} className="grid gap-2">
                <Label htmlFor={f.name} className="font-bold">
                  {f.label}
                  {f.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {f.type === "radio" ? (
                  <RadioGroup onValueChange={(v) => setValue(f.name as any, v)} className="grid gap-4 mt-2">
                    {(f.options ?? []).map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={`${f.name}-${opt.value}`} />
                        <Label htmlFor={`${f.name}-${opt.value}`}>{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : f.type === "select" ? (
                  <Select onValueChange={(v) => setValue(f.name as any, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(f.options ?? []).map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "checkbox" ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox id={f.name} onCheckedChange={(checked) => setValue(f.name as any, checked)} />
                    <Label htmlFor={f.name} className="font-normal opacity-90">{f.label}</Label>
                  </div>
                ) : f.type === "textarea" ? (
                  <Textarea
                    {...register(f.name as any, { required: f.required })}
                    placeholder={f.placeholder}
                    className="min-h-[100px]"
                  />
                ) : (
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    {...register(f.name as any, { required: f.required })}
                    placeholder={f.placeholder}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={active === 0}
                onClick={() => setActive(a => Math.max(0, a - 1))}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" variant="hero" className="flex-1">
                {active < visibleSteps.length - 1 ? "Continue" : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
