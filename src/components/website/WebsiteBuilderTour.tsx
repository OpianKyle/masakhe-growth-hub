import { useState, useEffect, useCallback, useRef } from "react";
import {
  Globe, Palette, Layout, Plus, Monitor, Rocket, Save,
  ArrowRight, ArrowLeft, X, HelpCircle, MousePointerClick,
  Smartphone, Image, AlignLeft, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY_PICKER = "wb_tour_picker_done";
const STORAGE_KEY_EDITOR = "wb_tour_editor_done";

interface TourStep {
  targetId: string | null;
  title: string;
  description: string;
  icon: React.ElementType;
  tooltipSide: "top" | "bottom" | "left" | "right" | "center";
  padding?: number;
}

const PICKER_STEPS: TourStep[] = [
  {
    targetId: null,
    title: "Welcome to the Website Builder!",
    description: "You're minutes away from having a live, professional website for your business. Let us walk you through the key steps.",
    icon: Globe,
    tooltipSide: "center",
  },
  {
    targetId: "tour-template-search",
    title: "Search & Filter Templates",
    description: "Type your industry in the search bar or click a category to quickly find the right template for your business.",
    icon: MousePointerClick,
    tooltipSide: "bottom",
    padding: 10,
  },
  {
    targetId: "tour-template-grid",
    title: "Pick Your Template",
    description: "Browse 50+ industry templates. Hover over any card to preview it. Click to select and start editing — you can always switch later.",
    icon: Layout,
    tooltipSide: "top",
    padding: 12,
  },
];

const EDITOR_STEPS: TourStep[] = [
  {
    targetId: null,
    title: "Your Template is Ready!",
    description: "The editor is on the left, the live preview on the right. Every change you make updates the preview instantly.",
    icon: Sparkles,
    tooltipSide: "center",
  },
  {
    targetId: "tour-site-settings",
    title: "Your Business Details",
    description: "Update your business name, URL slug, and brand colours here. These apply across the entire site.",
    icon: Palette,
    tooltipSide: "right",
    padding: 8,
  },
  {
    targetId: "tour-logo-upload",
    title: "Logo & Hero Photo",
    description: "Upload your business logo and a hero background photo. Accepted formats: PNG, JPG, WebP.",
    icon: Image,
    tooltipSide: "right",
    padding: 8,
  },
  {
    targetId: "tour-sections-list",
    title: "Edit Your Sections",
    description: "Each card here is a section of your website. Click to expand and edit text, images, and content. Toggle the switch to show or hide a section.",
    icon: AlignLeft,
    tooltipSide: "right",
    padding: 8,
  },
  {
    targetId: "tour-add-section",
    title: "Add More Sections",
    description: "Click 'Add Section' to insert a contact form, image gallery, testimonials, statistics bar, or more — in any order you like.",
    icon: Plus,
    tooltipSide: "top",
    padding: 8,
  },
  {
    targetId: "tour-preview-toggle",
    title: "Desktop & Mobile Preview",
    description: "Toggle between Desktop and Mobile views to see exactly how your site looks on every device before publishing.",
    icon: Smartphone,
    tooltipSide: "bottom",
    padding: 8,
  },
  {
    targetId: "tour-save-publish",
    title: "Save & Publish Your Site",
    description: "Hit Save to keep your progress, or Publish to make your site live and share it with customers. You'll get a shareable URL instantly.",
    icon: Rocket,
    tooltipSide: "bottom",
    padding: 8,
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getRect(id: string, padding = 8): Rect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - padding,
    left: r.left - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
  };
}

function TooltipCard({
  step,
  stepIndex,
  totalSteps,
  spotRect,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  spotRect: Rect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const Icon = step.icon;
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  const cardStyle = useTooltipPosition(step.tooltipSide, spotRect);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 10001,
        width: 300,
        ...cardStyle,
        filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.22))",
        pointerEvents: "auto",
      }}
    >
      {/* Arrow pointer */}
      {spotRect && step.tooltipSide !== "center" && (
        <Arrow side={step.tooltipSide} />
      )}

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 3, background: "#e5e7eb" }}>
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              transition: "width 0.3s ease",
              borderRadius: 9999,
            }}
          />
        </div>

        <div style={{ padding: "16px 16px 12px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <button
              onClick={onSkip}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                padding: 2,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Text */}
          <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 3px", fontWeight: 500 }}>
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 6px", lineHeight: 1.3 }}>
            {step.title}
          </h3>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.55 }}>
            {step.description}
          </p>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 5, margin: "12px 0 10px" }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === stepIndex ? 18 : 6,
                  height: 6,
                  borderRadius: 9999,
                  background: i === stepIndex ? "#4f46e5" : "#e5e7eb",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            {!isFirst && (
              <button
                onClick={onPrev}
                style={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft style={{ width: 12, height: 12 }} />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {isLast ? "Let's Build!" : "Next"}
              {!isLast && <ArrowRight style={{ width: 12, height: 12 }} />}
            </button>
          </div>

          <button
            onClick={onSkip}
            style={{
              display: "block",
              margin: "8px auto 0",
              background: "none",
              border: "none",
              fontSize: 11,
              color: "#9ca3af",
              cursor: "pointer",
            }}
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}

function Arrow({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  const size = 10;
  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    pointerEvents: "none",
  };

  if (side === "bottom") {
    return (
      <div
        style={{
          ...arrowStyle,
          top: -size,
          left: "50%",
          transform: "translateX(-50%)",
          borderLeft: `${size}px solid transparent`,
          borderRight: `${size}px solid transparent`,
          borderBottom: `${size}px solid #fff`,
          filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.06))",
        }}
      />
    );
  }
  if (side === "top") {
    return (
      <div
        style={{
          ...arrowStyle,
          bottom: -size,
          left: "50%",
          transform: "translateX(-50%)",
          borderLeft: `${size}px solid transparent`,
          borderRight: `${size}px solid transparent`,
          borderTop: `${size}px solid #fff`,
        }}
      />
    );
  }
  if (side === "right") {
    return (
      <div
        style={{
          ...arrowStyle,
          left: -size,
          top: "50%",
          transform: "translateY(-50%)",
          borderTop: `${size}px solid transparent`,
          borderBottom: `${size}px solid transparent`,
          borderRight: `${size}px solid #fff`,
        }}
      />
    );
  }
  if (side === "left") {
    return (
      <div
        style={{
          ...arrowStyle,
          right: -size,
          top: "50%",
          transform: "translateY(-50%)",
          borderTop: `${size}px solid transparent`,
          borderBottom: `${size}px solid transparent`,
          borderLeft: `${size}px solid #fff`,
        }}
      />
    );
  }
  return null;
}

function useTooltipPosition(
  side: TourStep["tooltipSide"],
  spotRect: Rect | null
): React.CSSProperties {
  const GAP = 18;
  const CARD_W = 300;

  if (!spotRect || side === "center") {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  if (side === "bottom") {
    return {
      top: spotRect.top + spotRect.height + GAP,
      left: Math.max(8, Math.min(window.innerWidth - CARD_W - 8, spotRect.left + spotRect.width / 2 - CARD_W / 2)),
    };
  }
  if (side === "top") {
    return {
      bottom: window.innerHeight - spotRect.top + GAP,
      left: Math.max(8, Math.min(window.innerWidth - CARD_W - 8, spotRect.left + spotRect.width / 2 - CARD_W / 2)),
    };
  }
  if (side === "right") {
    return {
      top: Math.max(8, spotRect.top + spotRect.height / 2 - 100),
      left: spotRect.left + spotRect.width + GAP,
    };
  }
  if (side === "left") {
    return {
      top: Math.max(8, spotRect.top + spotRect.height / 2 - 100),
      right: window.innerWidth - spotRect.left + GAP,
    };
  }
  return {};
}

interface WebsiteBuilderTourProps {
  phase: "picker" | "editor";
}

export function WebsiteBuilderTour({ phase }: WebsiteBuilderTourProps) {
  const storageKey = phase === "picker" ? STORAGE_KEY_PICKER : STORAGE_KEY_EDITOR;
  const steps = phase === "picker" ? PICKER_STEPS : EDITOR_STEPS;

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotRect, setSpotRect] = useState<Rect | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      const t = setTimeout(() => {
        setActive(true);
        setStepIndex(0);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  const currentStep = steps[stepIndex];

  const updateSpot = useCallback(() => {
    if (!active) return;
    const id = currentStep?.targetId;
    if (!id) {
      setSpotRect(null);
      return;
    }
    const r = getRect(id, currentStep.padding ?? 8);
    setSpotRect(r);
  }, [active, currentStep]);

  useEffect(() => {
    updateSpot();
    const loop = () => {
      updateSpot();
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [updateSpot]);

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setActive(false);
  };

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (!active) return null;

  return (
    <>
      {/* Dark overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {spotRect ? (
          <>
            {/* Top */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: spotRect.top, background: "rgba(0,0,0,0.55)" }} />
            {/* Bottom */}
            <div style={{ position: "absolute", top: spotRect.top + spotRect.height, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.55)" }} />
            {/* Left */}
            <div style={{ position: "absolute", top: spotRect.top, left: 0, width: spotRect.left, height: spotRect.height, background: "rgba(0,0,0,0.55)" }} />
            {/* Right */}
            <div style={{ position: "absolute", top: spotRect.top, left: spotRect.left + spotRect.width, right: 0, height: spotRect.height, background: "rgba(0,0,0,0.55)" }} />
            {/* Spotlight border ring */}
            <div
              style={{
                position: "absolute",
                top: spotRect.top,
                left: spotRect.left,
                width: spotRect.width,
                height: spotRect.height,
                borderRadius: 10,
                boxShadow: "0 0 0 2px rgba(99,102,241,0.8), 0 0 0 4px rgba(99,102,241,0.25)",
                pointerEvents: "none",
                transition: "all 0.25s ease",
              }}
            />
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
        )}
      </div>

      {/* Tooltip card */}
      <TooltipCard
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        spotRect={spotRect}
        onNext={next}
        onPrev={prev}
        onSkip={dismiss}
      />
    </>
  );
}

export function TourRestartButton({ phase }: { phase: "picker" | "editor" }) {
  const storageKey = phase === "picker" ? STORAGE_KEY_PICKER : STORAGE_KEY_EDITOR;
  const [show, setShow] = useState(false);

  const restart = () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setShow((s) => !s)}
        title="Help / Tour"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#fff",
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          cursor: "pointer",
          height: 32,
        }}
      >
        <HelpCircle style={{ width: 14, height: 14 }} />
        Tour
      </button>
      {show && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9000 }}
            onClick={() => setShow(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              padding: 12,
              zIndex: 9001,
              width: 200,
              pointerEvents: "auto",
            }}
          >
            <p style={{ fontSize: 12, color: "#374151", fontWeight: 600, margin: "0 0 6px" }}>Website Builder Help</p>
            <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 10px" }}>Replay the guided tour to revisit the key features.</p>
            <button
              onClick={restart}
              style={{
                width: "100%",
                padding: "7px 12px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Restart Tour
            </button>
          </div>
        </>
      )}
    </div>
  );
}
