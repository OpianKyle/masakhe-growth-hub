import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Stage, Layer, Rect, Circle, Text as KText, Image as KImage, Transformer, Star, Line } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Type, Square, Circle as CircleIcon, Star as StarIcon, Image as ImageIcon,
  Upload, Download, Trash2, LayoutTemplate, Palette, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Copy, Layers, Minus, ChevronUp, ChevronDown,
  Undo2, Redo2, Link as LinkIcon, Plus
} from "lucide-react";

type ElementType = "text" | "rect" | "circle" | "star" | "image" | "line";

interface BaseEl {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  draggable: boolean;
}

interface TextEl extends BaseEl {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  align: "left" | "center" | "right";
  fill: string;
  width: number;
  link?: string;
}

interface RectEl extends BaseEl {
  type: "rect";
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  fillType?: "solid" | "linear" | "radial" | "image";
  fillColor2?: string;
  gradientAngle?: number;
  fillImageSrc?: string;
}

interface CircleEl extends BaseEl {
  type: "circle";
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillType?: "solid" | "linear" | "radial" | "image";
  fillColor2?: string;
  gradientAngle?: number;
  fillImageSrc?: string;
}

interface StarEl extends BaseEl {
  type: "star";
  numPoints: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
  fillType?: "solid" | "linear" | "radial" | "image";
  fillColor2?: string;
  gradientAngle?: number;
  fillImageSrc?: string;
}

interface ImageEl extends BaseEl {
  type: "image";
  src: string;
  width: number;
  height: number;
  mask?: "none" | "rounded" | "circle";
  cornerRadius?: number;
}

interface LineEl extends BaseEl {
  type: "line";
  points: number[];
  stroke: string;
  strokeWidth: number;
}

type AnyEl = TextEl | RectEl | CircleEl | StarEl | ImageEl | LineEl;

const FONTS = [
  "Inter", "Arial", "Georgia", "Times New Roman", "Courier New",
  "Verdana", "Trebuchet MS", "Impact", "Comic Sans MS", "Poppins"
];

const PRESETS: { id: string; label: string; w: number; h: number }[] = [
  { id: "ig-square", label: "Instagram Post (1:1)", w: 1080, h: 1080 },
  { id: "ig-story", label: "Instagram Story (9:16)", w: 1080, h: 1920 },
  { id: "ig-portrait", label: "Instagram Portrait (4:5)", w: 1080, h: 1350 },
  { id: "fb-post", label: "Facebook Post", w: 1200, h: 630 },
  { id: "fb-story", label: "Facebook Story", w: 1080, h: 1920 },
  { id: "tt-video", label: "TikTok Cover (9:16)", w: 1080, h: 1920 },
  { id: "twitter", label: "Twitter Post", w: 1200, h: 675 },
];

const PALETTE = [
  "#000000", "#FFFFFF", "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  "#F43F5E", "#78716C", "#6B7280", "#1F2937"
];

interface Template {
  id: string;
  name: string;
  thumb: string;
  width: number;
  height: number;
  background: string;
  backgroundImage?: string;
  elements: Omit<AnyEl, "id">[];
}

const BACKGROUNDS = [
  { id: "none", label: "None", url: "" },
  { id: "office", label: "Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1080&q=80&auto=format" },
  { id: "team", label: "Team", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1080&q=80&auto=format" },
  { id: "shop", label: "Shop", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&q=80&auto=format" },
  { id: "food", label: "Food", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80&auto=format" },
  { id: "city", label: "City", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1080&q=80&auto=format" },
  { id: "tech", label: "Tech", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80&auto=format" },
  { id: "nature", label: "Nature", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&q=80&auto=format" },
  { id: "abstract", label: "Abstract", url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1080&q=80&auto=format" },
  { id: "marble", label: "Marble", url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1080&q=80&auto=format" },
  { id: "fashion", label: "Fashion", url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1080&q=80&auto=format" },
  { id: "fitness", label: "Fitness", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1080&q=80&auto=format" },
];

const BASE_TEMPLATES: Template[] = [
  {
    id: "mega-sale",
    name: "Mega Sale 50% OFF",
    thumb: "linear-gradient(135deg,#DC2626,#FBBF24)",
    width: 1080, height: 1080,
    background: "#DC2626",
    elements: [
      { type: "circle", x: 880, y: 200, radius: 180, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "text", x: 740, y: 130, text: "50%\nOFF", fontSize: 90, fontFamily: "Impact", fontStyle: "bold", align: "center", fill: "#DC2626", width: 280, rotation: -8, draggable: true },
      { type: "rect", x: 60, y: 60, width: 960, height: 960, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 6, cornerRadius: 28, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 420, text: "MEGA\nSALE", fontSize: 240, fontFamily: "Impact", fontStyle: "bold", align: "center", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 290, y: 800, width: 500, height: 90, fill: "#FFFFFF", stroke: "transparent", strokeWidth: 0, cornerRadius: 45, rotation: 0, draggable: true },
      { type: "text", x: 290, y: 825, text: "SHOP NOW →", fontSize: 38, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#DC2626", width: 500, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 940, text: "Limited time only · Use code SAVE50", fontSize: 26, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
    ],
  },
  {
    id: "new-arrival",
    name: "New Arrival",
    thumb: "linear-gradient(135deg,#0F172A,#10B981)",
    width: 1080, height: 1080,
    background: "#0F172A",
    backgroundImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1080&q=80&auto=format",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(15,23,42,0.55)", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 120, width: 220, height: 50, fill: "#10B981", stroke: "transparent", strokeWidth: 0, cornerRadius: 25, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 130, text: "NEW DROP", fontSize: 24, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#FFFFFF", width: 220, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 220, text: "Spring\nCollection\n2026", fontSize: 130, fontFamily: "Georgia", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 720, width: 140, height: 4, fill: "#10B981", stroke: "transparent", strokeWidth: 0, cornerRadius: 2, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 750, text: "Discover the styles everyone is\ntalking about — now in store.", fontSize: 36, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 920, width: 360, height: 80, fill: "#10B981", stroke: "transparent", strokeWidth: 0, cornerRadius: 40, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 942, text: "SHOP COLLECTION", fontSize: 28, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#FFFFFF", width: 360, rotation: 0, draggable: true },
    ],
  },
  {
    id: "grand-opening",
    name: "Grand Opening",
    thumb: "linear-gradient(135deg,#7C2D12,#FBBF24)",
    width: 1080, height: 1080,
    background: "#7C2D12",
    backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&q=80&auto=format",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(124,45,18,0.65)", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "star", x: 200, y: 200, numPoints: 5, innerRadius: 30, outerRadius: 70, fill: "#FBBF24", rotation: 0, draggable: true },
      { type: "star", x: 880, y: 220, numPoints: 5, innerRadius: 25, outerRadius: 55, fill: "#FBBF24", rotation: 15, draggable: true },
      { type: "star", x: 920, y: 880, numPoints: 5, innerRadius: 30, outerRadius: 70, fill: "#FBBF24", rotation: -10, draggable: true },
      { type: "text", x: 80, y: 350, text: "GRAND\nOPENING", fontSize: 150, fontFamily: "Impact", fontStyle: "bold", align: "center", fill: "#FBBF24", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 340, y: 670, width: 400, height: 3, fill: "#FFFFFF", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 700, text: "Saturday · 10 AM", fontSize: 56, fontFamily: "Georgia", fontStyle: "italic", align: "center", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 800, text: "Free gifts · Live music · Refreshments", fontSize: 32, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 290, y: 900, width: 500, height: 80, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, cornerRadius: 40, rotation: 0, draggable: true },
      { type: "text", x: 290, y: 922, text: "RSVP TODAY", fontSize: 32, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#7C2D12", width: 500, rotation: 0, draggable: true },
    ],
  },
  {
    id: "service-promo",
    name: "Service Promo",
    thumb: "linear-gradient(135deg,#1E40AF,#06B6D4)",
    width: 1080, height: 1080,
    background: "#FFFFFF",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 480, fill: "#1E40AF", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "circle", x: 880, y: 100, radius: 140, fill: "#06B6D4", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "circle", x: 100, y: 480, radius: 90, fill: "#06B6D4", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 140, text: "PROFESSIONAL\nSERVICES", fontSize: 80, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 360, text: "Trusted by 500+ South African businesses", fontSize: 28, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#06B6D4", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 580, width: 920, height: 2, fill: "#E5E7EB", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 620, text: "✓ Fast turnaround\n✓ Affordable pricing\n✓ Local expertise\n✓ 100% satisfaction", fontSize: 36, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#1F2937", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 920, width: 380, height: 80, fill: "#1E40AF", stroke: "transparent", strokeWidth: 0, cornerRadius: 40, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 942, text: "GET A QUOTE", fontSize: 30, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#FFFFFF", width: 380, rotation: 0, draggable: true },
      { type: "text", x: 540, y: 950, text: "📞 011 123 4567", fontSize: 28, fontFamily: "Inter", fontStyle: "bold", align: "left", fill: "#1E40AF", width: 460, rotation: 0, draggable: true },
    ],
  },
  {
    id: "food-special",
    name: "Food Special",
    thumb: "linear-gradient(135deg,#92400E,#F59E0B)",
    width: 1080, height: 1080,
    background: "#92400E",
    backgroundImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80&auto=format",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(0,0,0,0.45)", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 60, width: 960, height: 960, fill: "transparent", stroke: "#FBBF24", strokeWidth: 4, cornerRadius: 16, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 160, text: "TODAY'S SPECIAL", fontSize: 36, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#FBBF24", width: 920, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 320, text: "Sunday\nRoast", fontSize: 200, fontFamily: "Georgia", fontStyle: "italic bold", align: "center", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "circle", x: 540, y: 760, radius: 100, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "text", x: 380, y: 720, text: "ONLY\nR149", fontSize: 50, fontFamily: "Impact", fontStyle: "bold", align: "center", fill: "#92400E", width: 320, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 920, text: "Order now · Dine in or takeaway", fontSize: 30, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
    ],
  },
  {
    id: "fitness",
    name: "Fitness Promo",
    thumb: "linear-gradient(135deg,#000000,#22C55E)",
    width: 1080, height: 1080,
    background: "#000000",
    backgroundImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1080&q=80&auto=format",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(0,0,0,0.55)", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "rect", x: 0, y: 880, width: 1080, height: 200, fill: "#22C55E", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 200, text: "STRONGER\nEVERY DAY", fontSize: 130, fontFamily: "Impact", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 540, width: 100, height: 6, fill: "#22C55E", stroke: "transparent", strokeWidth: 0, cornerRadius: 3, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 580, text: "Join the gym that gets results.\nFirst class FREE.", fontSize: 38, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 920, text: "BOOK YOUR FREE SESSION TODAY", fontSize: 36, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#000000", width: 920, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 980, text: "yourbrand.co.za · @yourbrand", fontSize: 22, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#000000", width: 920, rotation: 0, draggable: true },
    ],
  },
  {
    id: "quote",
    name: "Inspiring Quote",
    thumb: "linear-gradient(135deg,#1F2937,#0EA5E9)",
    width: 1080, height: 1080,
    background: "#1F2937",
    elements: [
      { type: "circle", x: 540, y: 540, radius: 480, fill: "transparent", stroke: "#0EA5E9", strokeWidth: 2, rotation: 0, draggable: true },
      { type: "text", x: 100, y: 380, text: '"Dream big.\nWork hard.\nStay humble."', fontSize: 100, fontFamily: "Georgia", fontStyle: "italic", align: "center", fill: "#FFFFFF", width: 880, rotation: 0, draggable: true },
      { type: "rect", x: 470, y: 740, width: 140, height: 4, fill: "#0EA5E9", stroke: "transparent", strokeWidth: 0, cornerRadius: 2, rotation: 0, draggable: true },
      { type: "text", x: 100, y: 780, text: "— YOUR BRAND", fontSize: 32, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#0EA5E9", width: 880, rotation: 0, draggable: true },
    ],
  },
  {
    id: "discount-coupon",
    name: "Discount Coupon",
    thumb: "linear-gradient(135deg,#FBBF24,#EF4444)",
    width: 1200, height: 630,
    background: "#FFFFFF",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1200, height: 630, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "circle", x: 600, y: 0, radius: 50, fill: "#FFFFFF", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "circle", x: 600, y: 630, radius: 50, fill: "#FFFFFF", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "text", x: 40, y: 180, text: "30%", fontSize: 220, fontFamily: "Impact", fontStyle: "bold", align: "center", fill: "#7C2D12", width: 520, rotation: 0, draggable: true },
      { type: "text", x: 40, y: 420, text: "DISCOUNT", fontSize: 56, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#7C2D12", width: 520, rotation: 0, draggable: true },
      { type: "text", x: 640, y: 120, text: "Special Offer", fontSize: 40, fontFamily: "Georgia", fontStyle: "italic", align: "left", fill: "#7C2D12", width: 520, rotation: 0, draggable: true },
      { type: "rect", x: 640, y: 200, width: 480, height: 100, fill: "#FFFFFF", stroke: "transparent", strokeWidth: 0, cornerRadius: 12, rotation: 0, draggable: true },
      { type: "text", x: 640, y: 230, text: "CODE: SAVE30", fontSize: 50, fontFamily: "Courier New", fontStyle: "bold", align: "center", fill: "#EF4444", width: 480, rotation: 0, draggable: true },
      { type: "text", x: 640, y: 350, text: "Use this code at checkout to get\n30% off your next purchase.", fontSize: 26, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#7C2D12", width: 520, rotation: 0, draggable: true },
      { type: "text", x: 640, y: 510, text: "Valid until 31 December 2026", fontSize: 22, fontFamily: "Inter", fontStyle: "italic", align: "left", fill: "#7C2D12", width: 520, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-quarterly",
    name: "Quarterly Results",
    thumb: "linear-gradient(135deg,#0F172A,#3B82F6)",
    width: 1080, height: 1080,
    background: "#0F172A",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 140, fill: "#3B82F6", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 50, text: "QUARTERLY UPDATE", fontSize: 36, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 960, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 200, text: "Q3 2026 Results", fontSize: 90, fontFamily: "Georgia", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 960, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 360, width: 460, height: 280, fill: "#1E293B", stroke: "#3B82F6", strokeWidth: 2, cornerRadius: 12, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 400, text: "REVENUE", fontSize: 22, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#94A3B8", width: 460, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 450, text: "R 4.8M", fontSize: 96, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#3B82F6", width: 460, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 580, text: "▲ 24% YoY growth", fontSize: 26, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#22C55E", width: 460, rotation: 0, draggable: true },
      { type: "rect", x: 560, y: 360, width: 460, height: 280, fill: "#1E293B", stroke: "#3B82F6", strokeWidth: 2, cornerRadius: 12, rotation: 0, draggable: true },
      { type: "text", x: 560, y: 400, text: "NEW CLIENTS", fontSize: 22, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#94A3B8", width: 460, rotation: 0, draggable: true },
      { type: "text", x: 560, y: 450, text: "127", fontSize: 96, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#3B82F6", width: 460, rotation: 0, draggable: true },
      { type: "text", x: 560, y: 580, text: "▲ 18 from last quarter", fontSize: 26, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#22C55E", width: 460, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 720, text: "Thank you to our clients, partners and team\nfor an outstanding quarter.", fontSize: 30, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#FFFFFF", width: 960, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 1000, width: 960, height: 2, fill: "#3B82F6", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 1020, text: "yourcompany.co.za · @yourcompany", fontSize: 22, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#94A3B8", width: 960, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-hiring",
    name: "We're Hiring",
    thumb: "linear-gradient(135deg,#1E40AF,#FFFFFF)",
    width: 1080, height: 1080,
    background: "#FFFFFF",
    backgroundImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1080&q=80&auto=format",
    elements: [
      { type: "rect", x: 0, y: 0, width: 540, height: 1080, fill: "#1E40AF", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 40, y: 100, text: "WE'RE\nHIRING", fontSize: 130, fontFamily: "Impact", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 480, rotation: 0, draggable: true },
      { type: "rect", x: 40, y: 460, width: 100, height: 6, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, cornerRadius: 3, rotation: 0, draggable: true },
      { type: "text", x: 40, y: 500, text: "Marketing\nManager", fontSize: 56, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#FBBF24", width: 480, rotation: 0, draggable: true },
      { type: "text", x: 40, y: 700, text: "📍 Johannesburg, ZA\n💼 Full-time · Hybrid\n💰 Market related", fontSize: 28, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#FFFFFF", width: 480, rotation: 0, draggable: true },
      { type: "rect", x: 40, y: 920, width: 360, height: 80, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, cornerRadius: 40, rotation: 0, draggable: true },
      { type: "text", x: 40, y: 942, text: "APPLY NOW", fontSize: 30, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#1E40AF", width: 360, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-webinar",
    name: "Webinar Invite",
    thumb: "linear-gradient(135deg,#312E81,#A78BFA)",
    width: 1200, height: 630,
    background: "#312E81",
    elements: [
      { type: "circle", x: 1080, y: -40, radius: 220, fill: "#A78BFA", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "circle", x: 80, y: 580, radius: 180, fill: "#6366F1", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 80, width: 200, height: 44, fill: "#A78BFA", stroke: "transparent", strokeWidth: 0, cornerRadius: 22, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 90, text: "FREE WEBINAR", fontSize: 22, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#FFFFFF", width: 200, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 160, text: "Scaling your\nbusiness in 2026", fontSize: 78, fontFamily: "Georgia", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 1080, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 380, text: "Wednesday · 6 May · 18:00 SAST", fontSize: 30, fontFamily: "Inter", fontStyle: "bold", align: "left", fill: "#A78BFA", width: 1080, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 430, text: "Hosted by Sarah Mokoena, CEO", fontSize: 24, fontFamily: "Inter", fontStyle: "italic", align: "left", fill: "#FFFFFF", width: 1080, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 510, width: 280, height: 70, fill: "#A78BFA", stroke: "transparent", strokeWidth: 0, cornerRadius: 35, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 528, text: "REGISTER FREE", fontSize: 26, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#312E81", width: 280, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-stat",
    name: "Statistic Highlight",
    thumb: "linear-gradient(135deg,#FFFFFF,#0EA5E9)",
    width: 1080, height: 1080,
    background: "#FFFFFF",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 240, fill: "#0EA5E9", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 90, text: "DID YOU KNOW?", fontSize: 44, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 960, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 320, text: "87%", fontSize: 360, fontFamily: "Impact", fontStyle: "bold", align: "center", fill: "#0EA5E9", width: 960, rotation: 0, draggable: true },
      { type: "rect", x: 390, y: 720, width: 300, height: 4, fill: "#0F172A", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 760, text: "of South African SMMEs say\ndigital tools improved their growth.", fontSize: 38, fontFamily: "Georgia", fontStyle: "italic", align: "center", fill: "#0F172A", width: 960, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 1000, text: "Source: Masakhe Business Report 2026", fontSize: 20, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#64748B", width: 960, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-testimonial",
    name: "Client Testimonial",
    thumb: "linear-gradient(135deg,#F8FAFC,#1E293B)",
    width: 1080, height: 1080,
    background: "#F8FAFC",
    elements: [
      { type: "text", x: 60, y: 120, text: "“", fontSize: 280, fontFamily: "Georgia", fontStyle: "bold", align: "left", fill: "#1E40AF", width: 200, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 320, text: "Working with this team\ntransformed how we run\nour business — completely.", fontSize: 56, fontFamily: "Georgia", fontStyle: "italic", align: "left", fill: "#0F172A", width: 920, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 740, width: 80, height: 4, fill: "#1E40AF", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "circle", x: 130, y: 850, radius: 50, fill: "#1E40AF", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "text", x: 200, y: 800, text: "Thandi Nkosi", fontSize: 32, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#0F172A", width: 800, rotation: 0, draggable: true },
      { type: "text", x: 200, y: 850, text: "Founder · Bright Future Catering", fontSize: 24, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#475569", width: 800, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 980, text: "★ ★ ★ ★ ★", fontSize: 40, fontFamily: "Inter", fontStyle: "bold", align: "left", fill: "#FBBF24", width: 920, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-launch",
    name: "Product Launch",
    thumb: "linear-gradient(135deg,#0F172A,#22D3EE)",
    width: 1080, height: 1080,
    background: "#0F172A",
    backgroundImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80&auto=format",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(15,23,42,0.7)", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 100, width: 220, height: 44, fill: "transparent", stroke: "#22D3EE", strokeWidth: 2, cornerRadius: 22, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 110, text: "INTRODUCING", fontSize: 22, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#22D3EE", width: 220, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 200, text: "The future of\nyour workflow", fontSize: 100, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 960, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 500, width: 100, height: 4, fill: "#22D3EE", stroke: "transparent", strokeWidth: 0, cornerRadius: 2, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 540, text: "Smart automation. Real-time insights.\nBuilt for the way you work.", fontSize: 32, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#E2E8F0", width: 960, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 920, width: 320, height: 80, fill: "#22D3EE", stroke: "transparent", strokeWidth: 0, cornerRadius: 40, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 942, text: "LEARN MORE →", fontSize: 30, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#0F172A", width: 320, rotation: 0, draggable: true },
      { type: "text", x: 420, y: 950, text: "Available · 1 May 2026", fontSize: 22, fontFamily: "Inter", fontStyle: "italic", align: "left", fill: "#94A3B8", width: 600, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-conference",
    name: "Conference Banner",
    thumb: "linear-gradient(135deg,#7E22CE,#FBBF24)",
    width: 1200, height: 630,
    background: "#7E22CE",
    elements: [
      { type: "circle", x: -40, y: 630, radius: 240, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "circle", x: 1200, y: 0, radius: 200, fill: "#A855F7", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 80, text: "BUSINESS SUMMIT", fontSize: 30, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#FBBF24", width: 1080, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 140, text: "Africa Forward 2026", fontSize: 90, fontFamily: "Georgia", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 1080, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 320, width: 1080, height: 2, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 360, text: "12 — 14 June 2026", fontSize: 38, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 700, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 420, text: "Sandton Convention Centre, Johannesburg", fontSize: 24, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#E9D5FF", width: 1080, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 510, width: 280, height: 70, fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, cornerRadius: 35, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 528, text: "BOOK YOUR SEAT", fontSize: 26, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#7E22CE", width: 280, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-thanks",
    name: "Thank You Card",
    thumb: "linear-gradient(135deg,#064E3B,#34D399)",
    width: 1080, height: 1080,
    background: "#064E3B",
    elements: [
      { type: "circle", x: 540, y: 540, radius: 460, fill: "transparent", stroke: "#34D399", strokeWidth: 2, rotation: 0, draggable: true },
      { type: "circle", x: 540, y: 540, radius: 360, fill: "transparent", stroke: "#34D399", strokeWidth: 2, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 360, text: "Thank You", fontSize: 200, fontFamily: "Georgia", fontStyle: "italic bold", align: "center", fill: "#FFFFFF", width: 960, rotation: 0, draggable: true },
      { type: "rect", x: 470, y: 620, width: 140, height: 4, fill: "#34D399", stroke: "transparent", strokeWidth: 0, cornerRadius: 2, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 660, text: "for trusting us with your business.\nWe're proud to serve you.", fontSize: 36, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#D1FAE5", width: 960, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 1000, text: "— THE TEAM AT YOUR COMPANY", fontSize: 22, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#34D399", width: 960, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-tip",
    name: "Business Tip",
    thumb: "linear-gradient(135deg,#FEF3C7,#F59E0B)",
    width: 1080, height: 1080,
    background: "#FEF3C7",
    elements: [
      { type: "rect", x: 60, y: 60, width: 960, height: 960, fill: "#FFFFFF", stroke: "transparent", strokeWidth: 0, cornerRadius: 24, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 60, width: 960, height: 160, fill: "#F59E0B", stroke: "transparent", strokeWidth: 0, cornerRadius: 24, rotation: 0, draggable: true },
      { type: "rect", x: 60, y: 180, width: 960, height: 40, fill: "#F59E0B", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 60, y: 110, text: "💡 BUSINESS TIP", fontSize: 50, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#FFFFFF", width: 960, rotation: 0, draggable: true },
      { type: "text", x: 100, y: 320, text: "Track every rand", fontSize: 80, fontFamily: "Georgia", fontStyle: "bold", align: "left", fill: "#0F172A", width: 880, rotation: 0, draggable: true },
      { type: "rect", x: 100, y: 440, width: 100, height: 4, fill: "#F59E0B", stroke: "transparent", strokeWidth: 0, cornerRadius: 2, rotation: 0, draggable: true },
      { type: "text", x: 100, y: 480, text: "Cash flow is the lifeblood of any small business.\n\nReview your income and expenses weekly — not monthly.\n\nSmall leaks can sink a profitable company.", fontSize: 32, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#1F2937", width: 880, rotation: 0, draggable: true },
      { type: "text", x: 100, y: 940, text: "Follow for more SMME tips →", fontSize: 24, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill: "#F59E0B", width: 880, rotation: 0, draggable: true },
    ],
  },
  {
    id: "corp-meet",
    name: "Meet the Team",
    thumb: "linear-gradient(135deg,#1F2937,#EAB308)",
    width: 1080, height: 1080,
    background: "#1F2937",
    backgroundImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1080&q=80&auto=format",
    elements: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(31,41,55,0.78)", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 80, width: 240, height: 50, fill: "#EAB308", stroke: "transparent", strokeWidth: 0, cornerRadius: 25, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 90, text: "MEET THE TEAM", fontSize: 24, fontFamily: "Poppins", fontStyle: "bold", align: "center", fill: "#1F2937", width: 240, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 200, text: "The people\nbehind your success", fontSize: 84, fontFamily: "Georgia", fontStyle: "bold", align: "left", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "circle", x: 220, y: 600, radius: 90, fill: "#EAB308", stroke: "#FFFFFF", strokeWidth: 4, rotation: 0, draggable: true },
      { type: "circle", x: 420, y: 600, radius: 90, fill: "#3B82F6", stroke: "#FFFFFF", strokeWidth: 4, rotation: 0, draggable: true },
      { type: "circle", x: 620, y: 600, radius: 90, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 4, rotation: 0, draggable: true },
      { type: "circle", x: 820, y: 600, radius: 90, fill: "#EF4444", stroke: "#FFFFFF", strokeWidth: 4, rotation: 0, draggable: true },
      { type: "rect", x: 80, y: 800, width: 920, height: 2, fill: "#EAB308", stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 840, text: "12 dedicated experts. One mission:\nhelping your business thrive.", fontSize: 34, fontFamily: "Inter", fontStyle: "normal", align: "left", fill: "#FFFFFF", width: 920, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 1000, text: "yourcompany.co.za", fontSize: 22, fontFamily: "Inter", fontStyle: "bold", align: "left", fill: "#EAB308", width: 920, rotation: 0, draggable: true },
    ],
  },
  {
    id: "minimal",
    name: "Minimal Card",
    thumb: "linear-gradient(135deg,#F3F4F6,#9CA3AF)",
    width: 1080, height: 1080,
    background: "#F3F4F6",
    elements: [
      { type: "circle", x: 540, y: 380, radius: 120, fill: "#1F2937", stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 560, text: "Less is more", fontSize: 84, fontFamily: "Georgia", fontStyle: "italic", align: "center", fill: "#1F2937", width: 920, rotation: 0, draggable: true },
      { type: "text", x: 80, y: 720, text: "A clean, simple statement that lets your message stand out.", fontSize: 30, fontFamily: "Inter", fontStyle: "normal", align: "center", fill: "#6B7280", width: 920, rotation: 0, draggable: true },
    ],
  },
  {
    id: "blank",
    name: "Blank Canvas",
    thumb: "linear-gradient(135deg,#FFFFFF,#E5E7EB)",
    width: 1080, height: 1080,
    background: "#FFFFFF",
    elements: [],
  },
];

type StockLayout = "overlay" | "side-panel" | "bottom-card" | "top-strip" | "frame" | "diagonal" | "circle-badge" | "split";

interface StockSpec {
  id: string;
  name: string;
  img: string;
  accent: string;
  layout?: StockLayout;
  side?: "left" | "right";
  overlayAlpha?: number;
  badge?: string;
  headline: string;
  sub?: string;
  cta?: string;
  width?: number;
  height?: number;
  font?: string;
  light?: boolean;
}

function rect(x: number, y: number, w: number, h: number, fill: string, opts: any = {}): Omit<RectEl, "id"> {
  return { type: "rect", x, y, width: w, height: h, fill, stroke: "transparent", strokeWidth: 0, cornerRadius: 0, rotation: 0, draggable: true, ...opts };
}
function txt(x: number, y: number, w: number, text: string, size: number, fill: string, opts: any = {}): Omit<TextEl, "id"> {
  return { type: "text", x, y, width: w, text, fontSize: size, fontFamily: "Poppins", fontStyle: "bold", align: "left", fill, rotation: 0, draggable: true, ...opts };
}
function badge(x: number, y: number, label: string, accent: string, fillText = "#FFFFFF"): Omit<AnyEl, "id">[] {
  const bw = Math.max(180, label.length * 16 + 60);
  return [
    rect(x, y, bw, 50, accent, { cornerRadius: 25 }),
    txt(x, y + 12, bw, label, 22, fillText, { align: "center" }),
  ];
}
function ctaBtn(x: number, y: number, label: string, accent: string, fillText = "#FFFFFF"): Omit<AnyEl, "id">[] {
  const w = Math.max(260, label.length * 18 + 80);
  return [
    rect(x, y, w, 80, accent, { cornerRadius: 40 }),
    txt(x, y + 22, w, label, 28, fillText, { align: "center" }),
  ];
}

const STOCK_LAYOUTS: StockLayout[] = ["overlay", "side-panel", "bottom-card", "top-strip", "frame", "diagonal", "circle-badge", "split"];
function makeStockTemplate(s: StockSpec): Template {
  const W = s.width ?? 1080;
  const H = s.height ?? 1080;
  const hash = Array.from(s.id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const layout: StockLayout = s.layout ?? STOCK_LAYOUTS[hash % STOCK_LAYOUTS.length];
  const sideAuto: "left" | "right" = (hash % 2 === 0) ? "left" : "right";
  if (s.layout === undefined && layout === "side-panel") s = { ...s, side: sideAuto };
  const accent = s.accent;
  const lightText = s.light ? "#0F172A" : "#FFFFFF";
  const subText = s.light ? "#1F2937" : "#F1F5F9";
  const els: Omit<AnyEl, "id">[] = [];

  const headlineSize = (text: string, max = 100) => {
    const longest = Math.max(...text.split("\n").map(l => l.length));
    if (longest > 22) return Math.min(max, 72);
    if (longest > 14) return Math.min(max, 88);
    return max;
  };

  const subLines = (text?: string, perLine = 40) =>
    text ? text.split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(l.length / perLine)), 0) : 0;

  if (layout === "overlay") {
    const alpha = s.overlayAlpha ?? 0.55;
    els.push(rect(0, 0, W, H, `rgba(15,23,42,${alpha})`));
    let y = Math.round(H * 0.1);
    if (s.badge) { els.push(...badge(70, y, s.badge, accent)); y += 80; }
    const hs = headlineSize(s.headline, 100);
    els.push(txt(70, y, W - 140, s.headline, hs, "#FFFFFF"));
    y += hs * 1.15 * s.headline.split("\n").length + 30;
    els.push(rect(70, y, 100, 4, accent, { cornerRadius: 2 })); y += 30;
    if (s.sub) { els.push(txt(70, y, W - 140, s.sub, 28, "#F1F5F9", { fontFamily: "Inter", fontStyle: "normal" })); y += 28 * 1.3 * subLines(s.sub, 36) + 50; }
    if (s.cta) els.push(...ctaBtn(70, Math.min(H - 160, Math.max(y, H - 240)), s.cta, accent));
  }

  else if (layout === "side-panel") {
    const side = s.side ?? "left";
    const panelW = Math.round(W * 0.5);
    const px = side === "left" ? 0 : W - panelW;
    const tx = px + 60;
    const tw = panelW - 120;
    els.push(rect(0, 0, W, H, "rgba(15,23,42,0.25)"));
    els.push(rect(px, 0, panelW, H, accent));
    let y = Math.round(H * 0.12);
    if (s.badge) {
      const bw = Math.max(180, s.badge.length * 16 + 60);
      els.push(rect(tx, y, bw, 50, "#FFFFFF", { cornerRadius: 25 }));
      els.push(txt(tx, y + 12, bw, s.badge, 22, accent, { align: "center" }));
      y += 80;
    }
    const hs = headlineSize(s.headline, 88);
    els.push(txt(tx, y, tw, s.headline, hs, "#FFFFFF"));
    y += hs * 1.15 * s.headline.split("\n").length + 24;
    els.push(rect(tx, y, 80, 4, "#FFFFFF", { cornerRadius: 2 })); y += 28;
    if (s.sub) { els.push(txt(tx, y, tw, s.sub, 24, "#FFFFFF", { fontFamily: "Inter", fontStyle: "normal" })); y += 24 * 1.3 * subLines(s.sub, 26) + 50; }
    if (s.cta) {
      const ctaW = Math.max(220, s.cta.length * 16 + 60);
      const cy = Math.min(H - 140, Math.max(y, H - 220));
      els.push(rect(tx, cy, ctaW, 70, "#FFFFFF", { cornerRadius: 35 }));
      els.push(txt(tx, cy + 19, ctaW, s.cta, 24, accent, { align: "center" }));
    }
  }

  else if (layout === "bottom-card") {
    const cardH = Math.round(H * 0.55);
    const cardY = H - cardH - 40;
    els.push(rect(50, cardY, W - 100, cardH, "#FFFFFF", { cornerRadius: 24 }));
    els.push(rect(50, cardY, W - 100, 80, accent, { cornerRadius: 24 }));
    els.push(rect(50, cardY + 60, W - 100, 30, accent));
    if (s.badge) els.push(txt(80, cardY + 22, W - 160, s.badge, 28, "#FFFFFF", { align: "center" }));
    let y = cardY + 120;
    const hs = headlineSize(s.headline, 70);
    els.push(txt(80, y, W - 160, s.headline, hs, "#0F172A", { fontFamily: "Georgia" }));
    y += hs * 1.15 * s.headline.split("\n").length + 24;
    els.push(rect(80, y, 80, 4, accent, { cornerRadius: 2 })); y += 26;
    if (s.sub) { els.push(txt(80, y, W - 160, s.sub, 24, "#374151", { fontFamily: "Inter", fontStyle: "normal" })); y += 24 * 1.3 * subLines(s.sub, 36) + 30; }
    if (s.cta) els.push(...ctaBtn(80, Math.min(cardY + cardH - 100, Math.max(y, cardY + cardH - 180)), s.cta, accent));
  }

  else if (layout === "top-strip") {
    const stripH = Math.round(H * 0.2);
    els.push(rect(0, stripH, W, H - stripH, "rgba(0,0,0,0.4)"));
    els.push(rect(0, 0, W, stripH, accent));
    if (s.badge) els.push(txt(60, stripH / 2 - 20, W - 120, s.badge, 32, "#FFFFFF", { align: "center" }));
    let y = stripH + Math.round(H * 0.08);
    const hs = headlineSize(s.headline, 100);
    els.push(txt(70, y, W - 140, s.headline, hs, "#FFFFFF", { align: "center" }));
    y += hs * 1.15 * s.headline.split("\n").length + 24;
    els.push(rect((W - 100) / 2, y, 100, 4, accent, { cornerRadius: 2 })); y += 28;
    if (s.sub) { els.push(txt(70, y, W - 140, s.sub, 28, "#F1F5F9", { fontFamily: "Inter", fontStyle: "normal", align: "center" })); y += 28 * 1.3 * subLines(s.sub, 38) + 40; }
    if (s.cta) {
      const ctaW = Math.max(260, s.cta.length * 18 + 80);
      els.push(...ctaBtn((W - ctaW) / 2, Math.min(H - 140, Math.max(y, H - 220)), s.cta, accent));
    }
  }

  else if (layout === "frame") {
    els.push(rect(0, 0, W, H, "rgba(15,23,42,0.55)"));
    els.push(rect(40, 40, W - 80, H - 80, "transparent", { stroke: accent, strokeWidth: 6, cornerRadius: 12 }));
    const cardY = Math.round(H * 0.22);
    const cardH = Math.round(H * 0.6);
    els.push(rect(80, cardY, W - 160, cardH, "rgba(15,23,42,0.75)", { cornerRadius: 16 }));
    let y = cardY + 40;
    if (s.badge) {
      const bw = Math.max(180, s.badge.length * 16 + 60);
      els.push(rect((W - bw) / 2, y, bw, 50, accent, { cornerRadius: 25 }));
      els.push(txt((W - bw) / 2, y + 12, bw, s.badge, 22, "#FFFFFF", { align: "center" }));
      y += 80;
    }
    const hs = headlineSize(s.headline, 84);
    els.push(txt(110, y, W - 220, s.headline, hs, "#FFFFFF", { align: "center", fontFamily: "Georgia" }));
    y += hs * 1.15 * s.headline.split("\n").length + 24;
    els.push(rect((W - 80) / 2, y, 80, 4, accent, { cornerRadius: 2 })); y += 28;
    if (s.sub) { els.push(txt(110, y, W - 220, s.sub, 26, "#F1F5F9", { fontFamily: "Inter", fontStyle: "italic", align: "center" })); y += 26 * 1.3 * subLines(s.sub, 38) + 40; }
    if (s.cta) {
      const ctaW = Math.max(260, s.cta.length * 18 + 80);
      els.push(...ctaBtn((W - ctaW) / 2, Math.min(cardY + cardH - 100, Math.max(y, cardY + cardH - 180)), s.cta, accent));
    }
  }

  else if (layout === "diagonal") {
    els.push(rect(0, 0, W, H, "rgba(15,23,42,0.45)"));
    els.push({ type: "line", x: 0, y: 0, points: [0, H * 0.55, W, H * 0.28], stroke: accent, strokeWidth: 80, rotation: 0, draggable: true } as any);
    let y = Math.round(H * 0.62);
    if (s.badge) { els.push(...badge(70, y, s.badge, accent)); y += 80; }
    const hs = headlineSize(s.headline, 88);
    els.push(txt(70, y, W - 140, s.headline, hs, "#FFFFFF"));
    y += hs * 1.15 * s.headline.split("\n").length + 24;
    if (s.sub) { els.push(txt(70, y, W - 140, s.sub, 24, "#F1F5F9", { fontFamily: "Inter", fontStyle: "normal" })); y += 24 * 1.3 * subLines(s.sub, 44) + 40; }
    if (s.cta) els.push(...ctaBtn(70, Math.min(H - 140, Math.max(y, H - 220)), s.cta, accent));
  }

  else if (layout === "circle-badge") {
    els.push(rect(0, 0, W, H, "rgba(15,23,42,0.6)"));
    els.push({ type: "circle", x: W - 180, y: 200, radius: 180, fill: accent, stroke: "transparent", strokeWidth: 0, rotation: 0, draggable: true } as any);
    if (s.badge) els.push(txt(W - 360, 170, 360, s.badge, 36, "#FFFFFF", { align: "center" }));
    let y = Math.round(H * 0.46);
    const hs = headlineSize(s.headline, 100);
    els.push(txt(70, y, W - 140, s.headline, hs, "#FFFFFF"));
    y += hs * 1.15 * s.headline.split("\n").length + 24;
    els.push(rect(70, y, 100, 4, accent, { cornerRadius: 2 })); y += 28;
    if (s.sub) { els.push(txt(70, y, W - 140, s.sub, 28, "#F1F5F9", { fontFamily: "Inter", fontStyle: "normal" })); y += 28 * 1.3 * subLines(s.sub, 38) + 40; }
    if (s.cta) els.push(...ctaBtn(70, Math.min(H - 140, Math.max(y, H - 220)), s.cta, accent));
  }

  else if (layout === "split") {
    const splitY = Math.round(H * 0.5);
    els.push(rect(0, splitY, W, H - splitY, "#0F172A"));
    let y = splitY + 50;
    if (s.badge) { els.push(...badge(70, y, s.badge, accent)); y += 80; }
    const hs = headlineSize(s.headline, 70);
    els.push(txt(70, y, W - 140, s.headline, hs, "#FFFFFF"));
    y += hs * 1.15 * s.headline.split("\n").length + 24;
    els.push(rect(70, y, 80, 4, accent, { cornerRadius: 2 })); y += 24;
    if (s.sub) { els.push(txt(70, y, W - 140, s.sub, 22, "#CBD5E1", { fontFamily: "Inter", fontStyle: "normal" })); y += 22 * 1.3 * subLines(s.sub, 50) + 30; }
    if (s.cta) {
      const ctaW = Math.max(240, s.cta.length * 16 + 60);
      els.push(...ctaBtn(W - ctaW - 70, Math.min(H - 120, Math.max(y, H - 180)), s.cta, accent));
    }
  }

  return {
    id: s.id, name: s.name,
    thumb: `linear-gradient(135deg,${accent},#0F172A)`,
    width: W, height: H,
    background: "#0F172A",
    backgroundImage: s.img,
    elements: els,
  };
}

const U = (id: string, w = 1080) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format`;

const STOCK_SPECS: StockSpec[] = [
  { id: "st-restaurant", name: "Restaurant Special", img: U("photo-1517248135467-4c7edcad34c4"), accent: "#EF4444", badge: "TONIGHT", headline: "Chef's table\nspecial menu", sub: "3-course dinner · R295 per person", cta: "RESERVE A TABLE" },
  { id: "st-coffee", name: "Coffee Promo", img: U("photo-1495474472287-4d71bcdd2085"), accent: "#92400E", badge: "MORNING DEAL", headline: "Buy one,\nget one free", sub: "Every weekday before 10am", cta: "FIND YOUR STORE" },
  { id: "st-bakery", name: "Bakery Daily", img: U("photo-1509440159596-0249088772ff"), accent: "#D97706", badge: "FRESH TODAY", headline: "Baked from\n4am, every day", sub: "Sourdough · pastries · cakes", cta: "ORDER NOW" },
  { id: "st-pizza", name: "Pizza Friday", img: U("photo-1513104890138-7c749659a591"), accent: "#DC2626", badge: "FRIDAY ONLY", headline: "Two large\npizzas · R199", sub: "Dine-in, takeaway or delivery", cta: "ORDER ONLINE" },
  { id: "st-burger", name: "Burger Combo", img: U("photo-1568901346375-23c9450c58cd"), accent: "#F59E0B", badge: "COMBO DEAL", headline: "Burger, fries\n& drink · R89", sub: "Available all day, every day", cta: "ORDER NOW" },
  { id: "st-sushi", name: "Sushi Night", img: U("photo-1579871494447-9811cf80d66c"), accent: "#0EA5E9", badge: "ALL YOU CAN EAT", headline: "Sushi night\nThursdays", sub: "R245 per person · 18:00 till late", cta: "BOOK A TABLE" },
  { id: "st-smoothie", name: "Smoothie Bar", img: U("photo-1546173159-315724a31696"), accent: "#22C55E", badge: "HEALTHY VIBES", headline: "Cold-pressed\ngoodness daily", sub: "Made fresh from local produce", cta: "VIEW MENU" },
  { id: "st-wine", name: "Wine Tasting", img: U("photo-1510812431401-41d2bd2722f3"), accent: "#7E22CE", badge: "INVITE ONLY", headline: "Private wine\ntasting evening", sub: "Saturday · 7 May · 19:00", cta: "RSVP NOW" },
  { id: "st-gym", name: "Gym Membership", img: U("photo-1534438327276-14e5300c3a48"), accent: "#22C55E", badge: "JOIN TODAY", headline: "Train hard.\nLive better.", sub: "First month free · No contracts", cta: "CLAIM YOUR SPOT" },
  { id: "st-pt", name: "Personal Training", img: U("photo-1517836357463-d25dfeac3438"), accent: "#F97316", badge: "1-ON-1", headline: "Your personal\ntraining plan", sub: "Certified coaches · Real results", cta: "BOOK A SESSION" },
  { id: "st-yoga", name: "Yoga Class", img: U("photo-1545205597-3d9d02c29597"), accent: "#A855F7", badge: "MORNING FLOW", headline: "Find your\nbalance", sub: "Sunrise yoga · Tue, Thu & Sat", cta: "RESERVE YOUR SPOT" },
  { id: "st-spa", name: "Spa Day", img: U("photo-1540555700478-4be289fbecef"), accent: "#10B981", badge: "RELAX & RESTORE", headline: "Treat yourself\nto a spa day", sub: "Full body massage from R495", cta: "BOOK NOW" },
  { id: "st-salon", name: "Hair Salon", img: U("photo-1560066984-138dadb4c035"), accent: "#EC4899", badge: "NEW CLIENT", headline: "20% off your\nfirst visit", sub: "Cut · colour · style", cta: "BOOK ONLINE" },
  { id: "st-nails", name: "Nail Studio", img: U("photo-1604654894610-df63bc536371"), accent: "#F472B6", badge: "TUESDAY SPECIAL", headline: "Gel manicure\nR180", sub: "Walk-ins welcome", cta: "FIND US" },
  { id: "st-beauty", name: "Beauty Tips", img: U("photo-1522335789203-aabd1fc54bc9"), accent: "#EC4899", badge: "BEAUTY TIP", headline: "Glow from\nthe inside out", sub: "5 daily habits for healthier skin", cta: "READ MORE" },
  { id: "st-skincare", name: "Skincare Launch", img: U("photo-1556228720-195a672e8a03"), accent: "#22D3EE", badge: "JUST LAUNCHED", headline: "The new vitamin\nC serum", sub: "Brighter skin in 14 days", cta: "SHOP NOW" },
  { id: "st-fashion", name: "Fashion Sale", img: U("photo-1490481651871-ab68de25d43d"), accent: "#FBBF24", badge: "UP TO 60% OFF", headline: "End of season\nclearance", sub: "Online & in-store · Limited stock", cta: "SHOP THE SALE" },
  { id: "st-shoes", name: "Shoe Drop", img: U("photo-1542291026-7eec264c27ff"), accent: "#06B6D4", badge: "JUST LANDED", headline: "Step into\nsomething new", sub: "Latest sneakers from your favourite brands", cta: "SHOP DROP" },
  { id: "st-jewelry", name: "Jewelry Showcase", img: U("photo-1535632787350-4e68ef0ac584"), accent: "#FBBF24", badge: "HANDCRAFTED", headline: "Timeless\npieces, just\nfor you", sub: "Locally made · Ethically sourced", cta: "VIEW COLLECTION" },
  { id: "st-watch", name: "Watch Promo", img: U("photo-1523275335684-37898b6baf30"), accent: "#0F172A", badge: "FATHER'S DAY", headline: "A gift that\nlasts a lifetime", sub: "Free engraving with every purchase", cta: "SHOP WATCHES" },
  { id: "st-handbag", name: "Handbag Launch", img: U("photo-1584917865442-de89df76afd3"), accent: "#9333EA", badge: "NEW IN", headline: "The everyday\nbag, reimagined", sub: "Available in 6 colours", cta: "DISCOVER MORE" },
  { id: "st-realestate", name: "Real Estate Listing", img: U("photo-1568605114967-8130f3a36994"), accent: "#1E40AF", badge: "FOR SALE", headline: "4-bed family\nhome · Sandton", sub: "R 4 250 000 · 320 m²", cta: "VIEW LISTING" },
  { id: "st-openhouse", name: "Open House", img: U("photo-1600585154340-be6161a56a0c"), accent: "#0EA5E9", badge: "THIS SUNDAY", headline: "Open house\n· 12 — 14h", sub: "27 Jacaranda Drive, Bryanston", cta: "GET DIRECTIONS" },
  { id: "st-property", name: "Property Manager", img: U("photo-1487958449943-2429e8be8625"), accent: "#0F766E", badge: "STRESS-FREE LETTING", headline: "We manage\nyour property", sub: "Tenant vetting · Rent collection · Maintenance", cta: "GET A QUOTE" },
  { id: "st-construction", name: "Construction Services", img: U("photo-1503387762-592deb58ef4e"), accent: "#F59E0B", badge: "BUILD WITH US", headline: "Built to last,\ndelivered on time", sub: "Residential · commercial · renovations", cta: "REQUEST A QUOTE" },
  { id: "st-trades", name: "Trades & Repairs", img: U("photo-1581094288338-2314dddb7ece"), accent: "#EF4444", badge: "24/7 CALL-OUTS", headline: "Plumbing &\nelectrical, sorted", sub: "Same-day response across Gauteng", cta: "CALL NOW" },
  { id: "st-carwash", name: "Car Wash", img: U("photo-1492144534655-ae79c964c9d7"), accent: "#0EA5E9", badge: "WEEKEND SPECIAL", headline: "Full valet\nfrom R150", sub: "Wash · vacuum · interior shine", cta: "FIND OUR LOCATIONS" },
  { id: "st-autorepair", name: "Auto Repair", img: U("photo-1503376780353-7e6692767b70"), accent: "#0F172A", badge: "TRUSTED MECHANIC", headline: "Service your\ncar with us", sub: "Major service from R1 950 · All makes", cta: "BOOK YOUR SERVICE" },
  { id: "st-travel", name: "Travel Deal", img: U("photo-1488646953014-85cb44e25828"), accent: "#06B6D4", badge: "EARLY BIRD", headline: "Cape Town\nlong weekend", sub: "Flights + hotel from R3 999 pp", cta: "BOOK YOUR TRIP" },
  { id: "st-hotel", name: "Hotel Booking", img: U("photo-1566073771259-6a8506099945"), accent: "#FBBF24", badge: "STAY 3, PAY 2", headline: "Escape the city\nthis weekend", sub: "Boutique stays from R1 250 a night", cta: "VIEW HOTELS" },
  { id: "st-flights", name: "Flight Sale", img: U("photo-1436491865332-7a61a109cc05"), accent: "#3B82F6", badge: "FLIGHT SALE", headline: "Fly local from\nR699 one-way", sub: "Book by Sunday · Travel in May", cta: "SEARCH FLIGHTS" },
  { id: "st-tour", name: "Tour Operator", img: U("photo-1464822759023-fed622ff2c3b"), accent: "#F97316", badge: "GUIDED ADVENTURE", headline: "Drakensberg\nweekend hike", sub: "All meals & guides included · 9–11 May", cta: "BOOK YOUR PLACE" },
  { id: "st-photo", name: "Photography Service", img: U("photo-1502920917128-1aa500764cbd"), accent: "#FBBF24", badge: "BOOKING NOW", headline: "Brand & portrait\nphotography", sub: "Studio & on-location packages from R1 950", cta: "VIEW PORTFOLIO" },
  { id: "st-wedding", name: "Wedding Planner", img: U("photo-1519225421980-715cb0215aed"), accent: "#F472B6", badge: "SAVE THE DATE", headline: "Your dream day,\nplanned by us", sub: "Full-service wedding planning", cta: "BOOK A CONSULTATION" },
  { id: "st-baby", name: "Baby Shower", img: U("photo-1531497865144-0464ef8fb9a9"), accent: "#FBCFE8", badge: "BUNDLE OF JOY", headline: "It's a party!", sub: "Saturday · 14h · 12 Acacia Lane", cta: "RSVP NOW" },
  { id: "st-birthday", name: "Birthday Bash", img: U("photo-1530103862676-de8c9debad1d"), accent: "#F59E0B", badge: "YOU'RE INVITED", headline: "Let's celebrate\ntogether", sub: "Saturday · 18:30 · The Rooftop", cta: "RSVP" },
  { id: "st-newyear", name: "New Year Promo", img: U("photo-1546961342-8e845b6720be"), accent: "#FBBF24", badge: "NEW YEAR · NEW YOU", headline: "20% off\neverything", sub: "Use code NEW2026 at checkout", cta: "SHOP THE SALE" },
  { id: "st-valentines", name: "Valentine's Special", img: U("photo-1549122728-f519709caa9c"), accent: "#EF4444", badge: "VALENTINE'S DAY", headline: "Treat someone\nyou love", sub: "Curated gift sets from R249", cta: "SHOP GIFTS" },
  { id: "st-mothers", name: "Mother's Day", img: U("photo-1556228720-195a672e8a03"), accent: "#F472B6", badge: "MOTHER'S DAY", headline: "Show mom\nyou care", sub: "Spa, dining and gift bundles available", cta: "VIEW GIFTS" },
  { id: "st-blackfriday", name: "Black Friday", img: U("photo-1607082348824-0a96f2a4b9da"), accent: "#FBBF24", overlayAlpha: 0.75, badge: "BLACK FRIDAY", headline: "Up to 70% off\nstorewide", sub: "Doors open midnight · While stocks last", cta: "SHOP NOW" },
  { id: "st-techlaunch", name: "Tech Launch", img: U("photo-1518770660439-4636190af475"), accent: "#22D3EE", badge: "INTRODUCING", headline: "The smarter\nway to work", sub: "Available 1 May · Pre-order today", cta: "PRE-ORDER" },
  { id: "st-app", name: "App Promo", img: U("photo-1512941937669-90a1b58e7e9c"), accent: "#6366F1", badge: "DOWNLOAD NOW", headline: "Your business,\nin your pocket", sub: "iOS & Android · Free 14-day trial", cta: "GET THE APP" },
  { id: "st-podcast", name: "Podcast Episode", img: U("photo-1478737270239-2f02b77fc618"), accent: "#22C55E", badge: "NEW EPISODE", headline: "How to scale\nyour SMME", sub: "Featuring Lerato Khumalo · 38 min", cta: "LISTEN NOW" },
  { id: "st-course", name: "Online Course", img: U("photo-1503676260728-1c00da094a0b"), accent: "#3B82F6", badge: "ENROL NOW", headline: "Master your\ndigital marketing", sub: "6-week online course · Starts 5 May", cta: "ENROL TODAY" },
  { id: "st-coaching", name: "Business Coaching", img: U("photo-1573496359142-b8d87734a5a2"), accent: "#A855F7", badge: "1-ON-1 COACHING", headline: "Grow your\nbusiness faster", sub: "Free 30-minute discovery call", cta: "BOOK YOUR CALL" },
  { id: "st-charity", name: "Charity Drive", img: U("photo-1593113598332-cd288d649433"), accent: "#22C55E", badge: "DONATE TODAY", headline: "Together we\ncan do more", sub: "Help us feed 1 000 families this winter", cta: "DONATE NOW" },
  { id: "st-eco", name: "Eco Initiative", img: U("photo-1473773508845-188df298d2d1"), accent: "#10B981", badge: "GO GREEN", headline: "Small steps,\nbig impact", sub: "Switch to our refillable range today", cta: "LEARN MORE" },
  { id: "st-pet", name: "Pet Service", img: U("photo-1518791841217-8f162f1e1131"), accent: "#F59E0B", badge: "PAW-FECT CARE", headline: "Grooming your\npet will love", sub: "Cats & dogs · Mobile service available", cta: "BOOK A GROOM" },
  { id: "st-florist", name: "Florist Promo", img: U("photo-1490750967868-88aa4486c946"), accent: "#EC4899", badge: "SAME-DAY DELIVERY", headline: "Fresh blooms,\ndelivered today", sub: "Order before 12pm · Across Joburg", cta: "ORDER FLOWERS" },
  { id: "st-gift", name: "Gift Shop", img: U("photo-1513885535751-8b9238bd345a"), accent: "#A855F7", badge: "GIFT IDEAS", headline: "The perfect\ngift, sorted", sub: "Curated gift boxes from R349", cta: "SHOP GIFTS" },
];

const TEMPLATES: Template[] = [...BASE_TEMPLATES, ...STOCK_SPECS.map(makeStockTemplate)];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function URLImage({ el, isSelected, onSelect, onChange }: {
  el: ImageEl; isSelected: boolean;
  onSelect: () => void; onChange: (a: Partial<ImageEl>) => void;
}) {
  const [img] = useImage(el.src, "anonymous");
  const ref = useRef<Konva.Image>(null);
  const cr =
    el.mask === "circle" ? Math.min(el.width, el.height) / 2 :
    el.mask === "rounded" ? (el.cornerRadius ?? 24) : 0;
  return (
    <KImage
      id={el.id}
      image={img}
      ref={ref}
      x={el.x} y={el.y} width={el.width} height={el.height}
      rotation={el.rotation}
      draggable={el.draggable}
      cornerRadius={cr}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={() => {
        const node = ref.current!;
        const sx = node.scaleX(); const sy = node.scaleY();
        node.scaleX(1); node.scaleY(1);
        onChange({
          x: node.x(), y: node.y(),
          width: Math.max(20, node.width() * sx),
          height: Math.max(20, node.height() * sy),
          rotation: node.rotation(),
        });
      }}
      stroke={isSelected ? "#3B82F6" : undefined}
      strokeWidth={isSelected ? 2 : 0}
    />
  );
}

function BackgroundImage({ src, width, height }: { src: string; width: number; height: number }) {
  const [img] = useImage(src, "anonymous");
  if (!img) return null;
  const ir = img.width / img.height;
  const cr = width / height;
  let w = width, h = height, x = 0, y = 0;
  if (ir > cr) {
    h = height; w = height * ir; x = (width - w) / 2;
  } else {
    w = width; h = width / ir; y = (height - h) / 2;
  }
  return <KImage image={img} x={x} y={y} width={w} height={h} listening={false} />;
}

/* ── Gradient / Image Fill Helpers ─────────────────────────────────── */

function gradientPoints(w: number, h: number, angleDeg: number, centered = false) {
  const rad = (angleDeg * Math.PI) / 180;
  const hd = Math.sqrt(w * w + h * h) / 2;
  if (centered) {
    return { start: { x: -hd * Math.cos(rad), y: -hd * Math.sin(rad) }, end: { x: hd * Math.cos(rad), y: hd * Math.sin(rad) } };
  }
  const cx = w / 2, cy = h / 2;
  return { start: { x: cx - hd * Math.cos(rad), y: cy - hd * Math.sin(rad) }, end: { x: cx + hd * Math.cos(rad), y: cy + hd * Math.sin(rad) } };
}

function useShapeFillProps(el: RectEl | CircleEl | StarEl, w: number, h: number, centered = false) {
  const [img] = useImage((el.fillType === "image" ? el.fillImageSrc : "") || "", "anonymous");
  return useMemo(() => {
    const type = el.fillType || "solid";
    const c1 = el.fill || "#3B82F6";
    const c2 = el.fillColor2 || "#000000";
    const angle = el.gradientAngle ?? 90;
    if (type === "linear") {
      const { start, end } = gradientPoints(w, h, angle, centered);
      return { fillLinearGradientStartPoint: start, fillLinearGradientEndPoint: end, fillLinearGradientColorStops: [0, c1, 1, c2] };
    }
    if (type === "radial") {
      const cx = centered ? 0 : w / 2, cy = centered ? 0 : h / 2;
      const r = Math.sqrt((w / 2) * (w / 2) + (h / 2) * (h / 2));
      return { fillRadialGradientStartPoint: { x: cx, y: cy }, fillRadialGradientEndPoint: { x: cx, y: cy }, fillRadialGradientStartRadius: 0, fillRadialGradientEndRadius: r, fillRadialGradientColorStops: [0, c1, 1, c2] };
    }
    if (type === "image" && img?.width) {
      if (centered) {
        const scale = Math.max((w) / img.width, (h) / img.height);
        return { fillPatternImage: img, fillPatternScaleX: scale, fillPatternScaleY: scale, fillPatternOffsetX: img.width / 2, fillPatternOffsetY: img.height / 2, fillPatternRepeat: "no-repeat" as const, fillPriority: "pattern" as const, fill: c1 };
      }
      return { fillPatternImage: img, fillPatternScaleX: w / img.width, fillPatternScaleY: h / img.height, fillPatternRepeat: "no-repeat" as const, fillPriority: "pattern" as const, fill: c1 };
    }
    return { fill: c1 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.fillType, el.fill, el.fillColor2, el.gradientAngle, el.fillImageSrc, w, h, img]);
}

function ShapeRect({ el, common, onTE }: { el: RectEl; common: any; onTE: (e: any) => void }) {
  const fp = useShapeFillProps(el, el.width, el.height, false);
  return <Rect {...common} x={el.x} y={el.y} width={el.width} height={el.height} {...fp} stroke={el.stroke} strokeWidth={el.strokeWidth} cornerRadius={el.cornerRadius} rotation={el.rotation} draggable={el.draggable} onTransformEnd={onTE} />;
}

function ShapeCircle({ el, common, onTE }: { el: CircleEl; common: any; onTE: (e: any) => void }) {
  const fp = useShapeFillProps(el, el.radius * 2, el.radius * 2, true);
  return <Circle {...common} x={el.x} y={el.y} radius={el.radius} {...fp} stroke={el.stroke} strokeWidth={el.strokeWidth} rotation={el.rotation} draggable={el.draggable} onTransformEnd={onTE} />;
}

function ShapeStar({ el, common, onTE }: { el: StarEl; common: any; onTE: (e: any) => void }) {
  const fp = useShapeFillProps(el, el.outerRadius * 2, el.outerRadius * 2, true);
  return <Star {...common} x={el.x} y={el.y} numPoints={el.numPoints} innerRadius={el.innerRadius} outerRadius={el.outerRadius} {...fp} rotation={el.rotation} draggable={el.draggable} onTransformEnd={onTE} />;
}

export default function SocialPostEditor() {
  const [searchParams] = useSearchParams();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [bg, setBg] = useState("#FFFFFF");
  const [bgImage, setBgImage] = useState<string>("");
  const [elements, setElements] = useState<AnyEl[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageScale, setStageScale] = useState(0.5);
  const [tab, setTab] = useState<"templates" | "text" | "shapes" | "background" | "uploads">("templates");
  const [uploads, setUploads] = useState<string[]>([]);
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(256);
  const [activeMenu, setActiveMenu] = useState<"file"|"resize"|"editing"|"animate"|"position"|null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [animationType, setAnimationType] = useState("none");
  const topBarRef = useRef<HTMLDivElement>(null);

  const historyRef = useRef<{ elements: AnyEl[]; bg: string; bgImage: string }[]>([{ elements: [], bg: "#FFFFFF", bgImage: "" }]);
  const historyIdxRef = useRef<number>(0);
  const skipHistoryRef = useRef<boolean>(false);
  const autoLoadedRef = useRef<boolean>(false);
  const [, forceHistoryUpdate] = useState(0);

  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    const snapshot = { elements: JSON.parse(JSON.stringify(elements)), bg, bgImage };
    const trimmed = historyRef.current.slice(0, historyIdxRef.current + 1);
    trimmed.push(snapshot);
    if (trimmed.length > 80) trimmed.shift();
    historyRef.current = trimmed;
    historyIdxRef.current = trimmed.length - 1;
    forceHistoryUpdate(n => n + 1);
  }, [elements, bg, bgImage]);

  useEffect(() => {
    if (autoLoadedRef.current) return;
    const templateId = searchParams.get("template");
    if (!templateId) return;
    const found = TEMPLATES.find(t => t.id === templateId);
    if (!found) return;
    autoLoadedRef.current = true;
    const matchingPreset = PRESETS.find(p => p.w === found.width && p.h === found.height);
    if (matchingPreset) setPreset(matchingPreset);
    setBg(found.background);
    setBgImage(found.backgroundImage || "");
    skipHistoryRef.current = true;
    setElements(found.elements.map(e => ({ ...e, id: uid() } as AnyEl)));
    setTab("text");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function undo() {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const snap = historyRef.current[historyIdxRef.current];
    skipHistoryRef.current = true;
    setElements(JSON.parse(JSON.stringify(snap.elements)));
    setBg(snap.bg);
    setBgImage(snap.bgImage);
    setSelectedId(null);
    forceHistoryUpdate(n => n + 1);
  }

  function redo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const snap = historyRef.current[historyIdxRef.current];
    skipHistoryRef.current = true;
    setElements(JSON.parse(JSON.stringify(snap.elements)));
    setBg(snap.bg);
    setBgImage(snap.bgImage);
    setSelectedId(null);
    forceHistoryUpdate(n => n + 1);
  }

  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMeta = e.ctrlKey || e.metaKey;
      if (!isMeta) return;
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!activeMenu) return;
    function onClickOutside(e: MouseEvent) {
      if (topBarRef.current && !topBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [activeMenu]);

  function alignEl(mode: string) {
    if (!selectedId) { toast("Select an element first"); return; }
    setElements(els => els.map(el => {
      if (el.id !== selectedId) return el;
      const elW = "width" in el ? (el as any).width : "radius" in el ? (el as any).radius * 2 : 0;
      const elH = "height" in el ? (el as any).height : "radius" in el ? (el as any).radius * 2 : 0;
      switch (mode) {
        case "left":   return { ...el, x: 0 };
        case "cH":     return { ...el, x: Math.round((preset.w - elW) / 2) };
        case "right":  return { ...el, x: preset.w - elW };
        case "top":    return { ...el, y: 0 };
        case "cV":     return { ...el, y: Math.round((preset.h - elH) / 2) };
        case "bottom": return { ...el, y: preset.h - elH };
        default: return el;
      }
    }));
  }

  function startResize(side: "left" | "right", e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = side === "left" ? leftWidth : rightWidth;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const next = side === "left" ? startW + dx : startW - dx;
      const maxW = side === "left" ? 720 : 560;
      const clamped = Math.max(180, Math.min(maxW, next));
      if (side === "left") setLeftWidth(clamped); else setRightWidth(clamped);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fillImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleResize() {
      const c = containerRef.current; if (!c) return;
      const padX = 32; const padY = 32;
      const sx = (c.clientWidth - padX) / preset.w;
      const sy = (c.clientHeight - padY) / preset.h;
      setStageScale(Math.min(sx, sy, 1));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [preset]);

  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    if (!selectedId) { trRef.current.nodes([]); trRef.current.getLayer()?.batchDraw(); return; }
    const node = stage.findOne(`#${selectedId}`);
    if (node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        deleteSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  function loadTemplate(t: Template) {
    setPreset({ id: t.id, label: t.name, w: t.width, h: t.height });
    setBg(t.background);
    setBgImage(t.backgroundImage || "");
    setElements(t.elements.map(e => ({ ...e, id: uid() } as AnyEl)));
    setSelectedId(null);
  }

  function update(id: string, patch: Partial<AnyEl>) {
    setElements(els => els.map(e => e.id === id ? { ...e, ...patch } as AnyEl : e));
  }

  function addText() {
    const e: TextEl = {
      id: uid(), type: "text", x: preset.w / 2 - 200, y: preset.h / 2 - 40,
      text: "Your text here", fontSize: 64, fontFamily: "Poppins",
      fontStyle: "normal", align: "center", fill: "#1F2937",
      width: 400, rotation: 0, draggable: true,
    };
    setElements([...elements, e]); setSelectedId(e.id); setTab("text");
  }

  function addHeading() {
    const e: TextEl = {
      id: uid(), type: "text", x: preset.w / 2 - 300, y: 100,
      text: "Add a heading", fontSize: 120, fontFamily: "Impact",
      fontStyle: "bold", align: "center", fill: "#1F2937",
      width: 600, rotation: 0, draggable: true,
    };
    setElements([...elements, e]); setSelectedId(e.id); setTab("text");
  }

  function addRect() {
    const e: RectEl = {
      id: uid(), type: "rect", x: preset.w / 2 - 150, y: preset.h / 2 - 100,
      width: 300, height: 200, fill: "#3B82F6", stroke: "transparent",
      strokeWidth: 0, cornerRadius: 12, rotation: 0, draggable: true,
    };
    setElements([...elements, e]); setSelectedId(e.id);
  }

  function addCircle() {
    const e: CircleEl = {
      id: uid(), type: "circle", x: preset.w / 2, y: preset.h / 2,
      radius: 120, fill: "#10B981", stroke: "transparent",
      strokeWidth: 0, rotation: 0, draggable: true,
    };
    setElements([...elements, e]); setSelectedId(e.id);
  }

  function addStar() {
    const e: StarEl = {
      id: uid(), type: "star", x: preset.w / 2, y: preset.h / 2,
      numPoints: 5, innerRadius: 60, outerRadius: 120, fill: "#F59E0B",
      rotation: 0, draggable: true,
    };
    setElements([...elements, e]); setSelectedId(e.id);
  }

  function addLine() {
    const e: LineEl = {
      id: uid(), type: "line", x: preset.w / 2 - 150, y: preset.h / 2,
      points: [0, 0, 300, 0], stroke: "#1F2937", strokeWidth: 6,
      rotation: 0, draggable: true,
    };
    setElements([...elements, e]); setSelectedId(e.id);
  }

  function addButton(variant: "filled" | "outline" | "pill" | "ghost", label: string, fill: string) {
    const w = Math.max(280, label.length * 18 + 80);
    const h = 80;
    const x = preset.w / 2 - w / 2;
    const y = preset.h / 2 - h / 2;
    const bgId = uid();
    const txtId = uid();
    let bg: RectEl;
    let textColor = "#FFFFFF";
    if (variant === "filled") {
      bg = { id: bgId, type: "rect", x, y, width: w, height: h, fill, stroke: "transparent", strokeWidth: 0, cornerRadius: 12, rotation: 0, draggable: true };
    } else if (variant === "pill") {
      bg = { id: bgId, type: "rect", x, y, width: w, height: h, fill, stroke: "transparent", strokeWidth: 0, cornerRadius: h / 2, rotation: 0, draggable: true };
    } else if (variant === "outline") {
      bg = { id: bgId, type: "rect", x, y, width: w, height: h, fill: "transparent", stroke: fill, strokeWidth: 4, cornerRadius: 12, rotation: 0, draggable: true };
      textColor = fill;
    } else {
      bg = { id: bgId, type: "rect", x, y, width: w, height: h, fill: "rgba(255,255,255,0.15)", stroke: "transparent", strokeWidth: 0, cornerRadius: 12, rotation: 0, draggable: true };
      textColor = "#FFFFFF";
    }
    const t: TextEl = {
      id: txtId, type: "text", x, y: y + 22, width: w, text: label,
      fontSize: 28, fontFamily: "Poppins", fontStyle: "bold", align: "center",
      fill: textColor, rotation: 0, draggable: true,
    };
    setElements(prev => [...prev, bg, t]);
    setSelectedId(t.id);
    toast.success("Button added — edit text in the right panel");
  }

  function addImage(src: string) {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const max = Math.min(preset.w * 0.6, 600);
      const ratio = img.width / img.height;
      const w = ratio > 1 ? max : max * ratio;
      const h = ratio > 1 ? max / ratio : max;
      const e: ImageEl = {
        id: uid(), type: "image", x: preset.w / 2 - w / 2, y: preset.h / 2 - h / 2,
        src, width: w, height: h, rotation: 0, draggable: true,
      };
      setElements(prev => [...prev, e]); setSelectedId(e.id);
    };
    img.src = src;
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setUploads(u => [src, ...u]);
      addImage(src);
      setTab("uploads");
    };
    reader.readAsDataURL(file);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setElements(els => els.filter(e => e.id !== selectedId));
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const copy = { ...el, id: uid(), x: el.x + 30, y: el.y + 30 } as AnyEl;
    setElements([...elements, copy]); setSelectedId(copy.id);
  }

  function moveLayer(dir: 1 | -1) {
    if (!selectedId) return;
    setElements(els => {
      const i = els.findIndex(e => e.id === selectedId);
      if (i < 0) return els;
      const j = i + dir;
      if (j < 0 || j >= els.length) return els;
      const copy = els.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  function exportImage() {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const prevSelected = selectedId;
    setSelectedId(null);
    const tr = stage.findOne("Transformer") as any;
    if (tr) { tr.nodes([]); tr.getLayer()?.batchDraw(); }
    const prevScale = stage.scaleX();
    const prevPos = { x: stage.x(), y: stage.y() };
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.size({ width: preset.w, height: preset.h });
    stage.draw();
    const uri = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
    stage.scale({ x: prevScale, y: prevScale });
    stage.position(prevPos);
    stage.size({ width: preset.w * prevScale, height: preset.h * prevScale });
    setSelectedId(prevSelected);

    const a = document.createElement("a");
    a.download = `post-${preset.id}-${Date.now()}.png`;
    a.href = uri;
    a.click();

    const links = elements
      .filter(el => el.type === "text" && (el as TextEl).link?.trim())
      .map(el => {
        const t = el as TextEl;
        return { label: t.text.replace(/\n/g, " ").trim(), url: t.link!.trim() };
      });
    if (links.length > 0) {
      const captionLines = links.map(l => `${l.label}: ${l.url}`).join("\n");
      try { navigator.clipboard.writeText(captionLines); } catch {}
      toast.success(`Design downloaded · ${links.length} link${links.length > 1 ? "s" : ""} copied to clipboard`, {
        description: captionLines.length > 120 ? captionLines.slice(0, 120) + "…" : captionLines,
        duration: 8000,
      });
    } else {
      toast.success("Design downloaded");
    }
  }

  const selected = elements.find(e => e.id === selectedId) || null;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* ── Canva-style top bar ────────────────────────────────── */}
      <div ref={topBarRef} className="flex items-center gap-0 border-b bg-white h-12 px-2 shrink-0 relative z-30">

        {/* Left: logo + menu buttons */}
        <div className="flex items-center gap-0.5">
          <div className="w-7 h-7 rounded-lg mr-2 ml-1 flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}>
            <Palette className="h-4 w-4 text-white" />
          </div>

          {/* File */}
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === "file" ? null : "file")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors font-medium ${activeMenu === "file" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`}>
              File <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {activeMenu === "file" && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-1 w-48">
                <button
                  onClick={() => {
                    if (!elements.length || window.confirm("Clear the canvas and start a new design?")) {
                      setElements([]); setBg("#FFFFFF"); setBgImage(""); setSelectedId(null);
                      toast.success("New design created");
                    }
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Plus className="h-4 w-4 text-gray-400" /> New design
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={() => { exportImage(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 text-gray-400" /> Download PNG
                </button>
              </div>
            )}
          </div>

          {/* Resize */}
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === "resize" ? null : "resize")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors font-medium ${activeMenu === "resize" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`}>
              Resize <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {activeMenu === "resize" && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-1 w-64">
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Canvas format</p>
                {PRESETS.map(p => (
                  <button key={p.id}
                    onClick={() => { setPreset(p); setActiveMenu(null); toast.success(`Resized to ${p.label}`); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${p.id === preset.id ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                    <span>{p.label}</span>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{p.w}×{p.h}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editing */}
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === "editing" ? null : "editing")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors font-medium ${activeMenu === "editing" || snapEnabled ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`}>
              Editing {snapEnabled && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {activeMenu === "editing" && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-3 w-52">
                <p className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Canvas options</p>
                <div className="px-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Snap to grid</span>
                    <div className="relative w-9 h-5 rounded-full cursor-pointer transition-colors"
                      style={{ background: snapEnabled ? "#7c3aed" : "#D1D5DB" }}
                      onClick={() => setSnapEnabled(v => !v)}>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                        style={{ transform: snapEnabled ? "translateX(16px)" : "translateX(0)" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full">NEW</span>
        </div>

        {/* Center: undo/redo + format selector */}
        <div className="flex items-center gap-1.5 mx-auto">
          <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
            className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"
            className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="mx-1 h-5 w-px bg-gray-200" />
          <select value={preset.id}
            onChange={(e) => { const p = PRESETS.find(x => x.id === e.target.value); if (p) setPreset(p); }}
            className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs bg-white text-gray-700 font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-200">
            {PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        {/* Right: Animate + Position + Share */}
        <div className="flex items-center gap-1">

          {/* Animate */}
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === "animate" ? null : "animate")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors font-medium ${activeMenu === "animate" || animationType !== "none" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`}>
              Animate {animationType !== "none" && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {activeMenu === "animate" && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-2 w-44">
                <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Animation</p>
                {[
                  { id: "none",      label: "None" },
                  { id: "fade-in",   label: "Fade In" },
                  { id: "slide-up",  label: "Slide Up" },
                  { id: "zoom-in",   label: "Zoom In" },
                  { id: "bounce",    label: "Bounce" },
                  { id: "rotate-in", label: "Rotate In" },
                ].map(anim => (
                  <button key={anim.id}
                    onClick={() => { setAnimationType(anim.id); setActiveMenu(null); if (anim.id !== "none") toast.success(`Animation: ${anim.label}`); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${animationType === anim.id ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                    {anim.label}
                    {animationType === anim.id && <span className="w-2 h-2 rounded-full bg-violet-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Position */}
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === "position" ? null : "position")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors font-medium ${activeMenu === "position" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`}>
              Position <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {activeMenu === "position" && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-3 w-60">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Align on canvas</p>
                {!selected ? (
                  <p className="text-xs text-gray-400 text-center py-2">Select an element to align it</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[
                        { label: "← Left",   mode: "left" },
                        { label: "↔ Center", mode: "cH" },
                        { label: "Right →",  mode: "right" },
                        { label: "↑ Top",    mode: "top" },
                        { label: "↕ Middle", mode: "cV" },
                        { label: "↓ Bottom", mode: "bottom" },
                      ].map(({ label, mode }) => (
                        <button key={mode}
                          onClick={() => { alignEl(mode); setActiveMenu(null); }}
                          className="px-1.5 py-2 text-[10px] bg-gray-50 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-colors font-medium text-gray-600 leading-tight">
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-2.5">
                      <p className="text-[10px] text-gray-400 mb-1.5">Position (px)</p>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 flex-1">
                          <span className="text-[10px] text-gray-500 font-medium w-3">X</span>
                          <input type="number" value={Math.round(selected.x)}
                            onChange={e => setElements(els => els.map(el => el.id === selectedId ? { ...el, x: Number(e.target.value) } : el))}
                            className="flex-1 w-0 text-xs border border-gray-200 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-violet-300" />
                        </label>
                        <label className="flex items-center gap-1 flex-1">
                          <span className="text-[10px] text-gray-500 font-medium w-3">Y</span>
                          <input type="number" value={Math.round(selected.y)}
                            onChange={e => setElements(els => els.map(el => el.id === selectedId ? { ...el, y: Number(e.target.value) } : el))}
                            className="flex-1 w-0 text-xs border border-gray-200 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-violet-300" />
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button onClick={exportImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
            style={{ background: "linear-gradient(90deg,#7c3aed,#9333ea)" }}>
            <Download className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left tools rail */}
        <div className="w-16 border-r bg-slate-50 flex flex-col items-center py-3 gap-1 shrink-0">
          {([
            { id: "templates", icon: LayoutTemplate, label: "Templates" },
            { id: "text", icon: Type, label: "Text" },
            { id: "shapes", icon: Square, label: "Shapes" },
            { id: "background", icon: Palette, label: "Background" },
            { id: "uploads", icon: ImageIcon, label: "Uploads" },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-12 h-14 flex flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] transition-colors ${
                tab === t.id ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Left panel */}
        <div className="border-r bg-white overflow-y-auto p-3 shrink-0 relative" style={{ width: leftWidth }}>
          {tab === "templates" && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Templates</h3>
              <div className={`grid gap-2 ${leftWidth >= 560 ? "grid-cols-4" : leftWidth >= 400 ? "grid-cols-3" : "grid-cols-2"}`}>
                {TEMPLATES.map(t => {
                  const headlineEl = t.elements.find(e => e.type === "text" && (e as TextEl).fontSize >= 50) as TextEl | undefined;
                  const headline = (headlineEl?.text || t.name).split("\n")[0].slice(0, 18);
                  const accentEl = t.elements.find(e => (e.type === "rect" || e.type === "circle") && (e as any).fill && !String((e as any).fill).startsWith("rgba") && !String((e as any).fill).startsWith("transparent")) as any;
                  const accent = accentEl?.fill || "#3B82F6";
                  const isPortrait = t.height > t.width;
                  const isLandscape = t.width > t.height;
                  return (
                    <button
                      key={t.id}
                      onClick={() => loadTemplate(t)}
                      className={`rounded-lg border hover:border-primary hover:shadow-md transition-all overflow-hidden shadow-sm relative group ${
                        isLandscape ? "aspect-[16/9]" : isPortrait ? "aspect-[9/16]" : "aspect-square"
                      }`}
                      style={
                        t.backgroundImage
                          ? { backgroundImage: `url(${t.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: t.background }
                          : { background: t.thumb }
                      }
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                      <div className="absolute top-1.5 left-1.5 right-1.5 flex">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white truncate max-w-full" style={{ background: accent }}>
                          {t.width}×{t.height}
                        </span>
                      </div>
                      <div className="absolute inset-x-1 bottom-5 text-white font-bold text-[11px] leading-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-2 px-1">
                        {headline}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[9px] font-semibold text-white text-center truncate px-1">
                        {t.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "background" && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Background Image</h3>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUNDS.map(b => (
                  <button key={b.id} onClick={() => setBgImage(b.url)}
                    className={`aspect-square rounded-lg border overflow-hidden hover:border-primary text-[10px] font-semibold text-white shadow-sm relative ${
                      bgImage === b.url ? "ring-2 ring-primary" : ""
                    } ${b.url ? "" : "bg-slate-100 text-slate-600"}`}
                    style={b.url ? { backgroundImage: `url(${b.url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
                    <span className={`absolute inset-x-0 bottom-0 py-1 ${b.url ? "bg-black/40" : ""}`}>{b.label}</span>
                  </button>
                ))}
              </div>
              <h3 className="font-semibold text-sm mt-5 mb-2">Background Color</h3>
              <div className="grid grid-cols-6 gap-1.5">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => { setBg(c); setBgImage(""); }}
                    className={`w-8 h-8 rounded border hover:scale-110 transition-transform ${bg === c && !bgImage ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <input type="color" value={bg} onChange={e => { setBg(e.target.value); setBgImage(""); }}
                className="mt-2 w-full h-9 rounded cursor-pointer" />
            </div>
          )}

          {tab === "text" && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm mb-3">Add Text</h3>
              <button onClick={addHeading}
                className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-slate-50 transition-all">
                <div className="text-xl font-bold">Add a Heading</div>
                <div className="text-xs text-muted-foreground">Big, bold, attention-grabbing</div>
              </button>
              <button onClick={addText}
                className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-slate-50 transition-all">
                <div className="text-base">Add body text</div>
                <div className="text-xs text-muted-foreground">For descriptions and details</div>
              </button>
            </div>
          )}

          {tab === "shapes" && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Shapes</h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={addRect} className="aspect-square rounded-lg border hover:border-primary flex items-center justify-center bg-slate-50">
                  <Square className="h-8 w-8 text-slate-700" />
                </button>
                <button onClick={addCircle} className="aspect-square rounded-lg border hover:border-primary flex items-center justify-center bg-slate-50">
                  <CircleIcon className="h-8 w-8 text-slate-700" />
                </button>
                <button onClick={addStar} className="aspect-square rounded-lg border hover:border-primary flex items-center justify-center bg-slate-50">
                  <StarIcon className="h-8 w-8 text-slate-700" />
                </button>
                <button onClick={addLine} className="aspect-square rounded-lg border hover:border-primary flex items-center justify-center bg-slate-50">
                  <Minus className="h-8 w-8 text-slate-700" />
                </button>
              </div>

              <h3 className="font-semibold text-sm mt-5 mb-3">CTA Buttons</h3>
              <div className="space-y-2">
                <button onClick={() => addButton("filled", "Shop Now", "#3B82F6")} className="w-full rounded-lg bg-blue-500 text-white text-sm font-semibold py-3 hover:bg-blue-600">
                  Shop Now
                </button>
                <button onClick={() => addButton("pill", "Learn More", "#10B981")} className="w-full rounded-full bg-emerald-500 text-white text-sm font-semibold py-3 hover:bg-emerald-600">
                  Learn More
                </button>
                <button onClick={() => addButton("filled", "Get Started", "#F97316")} className="w-full rounded-lg bg-orange-500 text-white text-sm font-semibold py-3 hover:bg-orange-600">
                  Get Started
                </button>
                <button onClick={() => addButton("outline", "Read More", "#FFFFFF")} className="w-full rounded-lg border-2 border-slate-700 text-slate-700 text-sm font-semibold py-3 hover:bg-slate-100">
                  Read More (outline)
                </button>
                <button onClick={() => addButton("pill", "Book Now", "#EF4444")} className="w-full rounded-full bg-red-500 text-white text-sm font-semibold py-3 hover:bg-red-600">
                  Book Now
                </button>
                <button onClick={() => addButton("ghost", "Sign Up", "#FFFFFF")} className="w-full rounded-lg bg-slate-200 text-slate-800 text-sm font-semibold py-3 hover:bg-slate-300">
                  Sign Up (ghost)
                </button>
                <button onClick={() => addButton("filled", "Contact Us", "#0F172A")} className="w-full rounded-lg bg-slate-900 text-white text-sm font-semibold py-3 hover:bg-slate-800">
                  Contact Us
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">Buttons are added as a shape + text. Click the text to change the label and the shape to change the colour.</p>
            </div>
          )}

          {tab === "uploads" && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Uploads</h3>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
              <input
                ref={fillImgRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    handleFile(f);
                    if (selectedId) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        if (ev.target?.result) {
                          update(selectedId, { fillImageSrc: ev.target.result as string, fillType: "image" } as any);
                        }
                      };
                      reader.readAsDataURL(f);
                    }
                  }
                  if (fillImgRef.current) fillImgRef.current.value = "";
                }}
              />
              <Button onClick={() => fileRef.current?.click()} className="w-full gradient-hero text-white" size="sm">
                <Upload className="h-4 w-4 mr-1" /> Upload Image
              </Button>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {uploads.map((src, i) => (
                  <button key={i} onClick={() => addImage(src)}
                    className="aspect-square rounded-lg border overflow-hidden hover:border-primary">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {uploads.length === 0 && (
                  <p className="col-span-2 text-xs text-muted-foreground text-center py-6">
                    Your uploaded images will appear here
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resize handle — right edge of left panel */}
        <div
          onMouseDown={(e) => startResize("left", e)}
          className="w-1.5 cursor-col-resize bg-slate-200 hover:bg-primary/60 active:bg-primary transition-colors shrink-0 flex items-center justify-center group"
          title="Drag to resize panel"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-400 group-hover:bg-primary/80 transition-colors" />
        </div>

        {/* Canvas area */}
        <div ref={containerRef} className="flex-1 bg-[#1e1e1e] flex items-center justify-center overflow-auto relative">
          <div style={{
            width: preset.w * stageScale,
            height: preset.h * stageScale,
            background: bg,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }} className="rounded-sm">
            <Stage
              ref={stageRef}
              width={preset.w * stageScale}
              height={preset.h * stageScale}
              scaleX={stageScale}
              scaleY={stageScale}
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
              onTouchStart={(e) => {
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
            >
              <Layer>
                <Rect x={0} y={0} width={preset.w} height={preset.h} fill={bg} listening={false} />
                {bgImage && <BackgroundImage src={bgImage} width={preset.w} height={preset.h} />}
                {elements.map(el => {
                  const common = {
                    id: el.id,
                    key: el.id,
                    onClick: () => setSelectedId(el.id),
                    onTap: () => setSelectedId(el.id),
                    onDragEnd: (e: any) => update(el.id, { x: e.target.x(), y: e.target.y() }),
                  };
                  if (el.type === "text") {
                    return (
                      <KText
                        {...common}
                        text={el.text}
                        x={el.x} y={el.y}
                        fontSize={el.fontSize}
                        fontFamily={el.fontFamily}
                        fontStyle={el.fontStyle}
                        align={el.align}
                        fill={el.fill}
                        width={el.width}
                        rotation={el.rotation}
                        draggable={el.draggable}
                        onTransformEnd={(e) => {
                          const node = e.target as Konva.Text;
                          const sx = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          update(el.id, {
                            x: node.x(), y: node.y(),
                            width: Math.max(40, node.width() * sx),
                            rotation: node.rotation(),
                          } as Partial<TextEl>);
                        }}
                      />
                    );
                  }
                  if (el.type === "rect") {
                    return (
                      <ShapeRect
                        key={el.id}
                        el={el}
                        common={common}
                        onTE={(e) => {
                          const node = e.target as Konva.Rect;
                          const sx = node.scaleX(); const sy = node.scaleY();
                          node.scaleX(1); node.scaleY(1);
                          update(el.id, { x: node.x(), y: node.y(), width: Math.max(10, node.width() * sx), height: Math.max(10, node.height() * sy), rotation: node.rotation() } as Partial<RectEl>);
                        }}
                      />
                    );
                  }
                  if (el.type === "circle") {
                    return (
                      <ShapeCircle
                        key={el.id}
                        el={el}
                        common={common}
                        onTE={(e) => {
                          const node = e.target as Konva.Circle;
                          const sx = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          update(el.id, { x: node.x(), y: node.y(), radius: Math.max(10, el.radius * sx), rotation: node.rotation() } as Partial<CircleEl>);
                        }}
                      />
                    );
                  }
                  if (el.type === "star") {
                    return (
                      <ShapeStar
                        key={el.id}
                        el={el}
                        common={common}
                        onTE={(e) => {
                          const node = e.target as Konva.Star;
                          const sx = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          update(el.id, { x: node.x(), y: node.y(), innerRadius: Math.max(5, el.innerRadius * sx), outerRadius: Math.max(10, el.outerRadius * sx), rotation: node.rotation() } as Partial<StarEl>);
                        }}
                      />
                    );
                  }
                  if (el.type === "line") {
                    return (
                      <Line
                        {...common}
                        x={el.x} y={el.y}
                        points={el.points}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth}
                        rotation={el.rotation}
                        draggable={el.draggable}
                        onTransformEnd={(e) => {
                          const node = e.target as Konva.Line;
                          const sx = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          const newPts = (el.points as number[]).map((p, idx) =>
                            idx % 2 === 0 ? p * sx : p * sx
                          );
                          update(el.id, {
                            x: node.x(), y: node.y(),
                            points: newPts,
                            rotation: node.rotation(),
                          } as Partial<LineEl>);
                        }}
                      />
                    );
                  }
                  if (el.type === "image") {
                    return (
                      <URLImage
                        key={el.id}
                        el={el}
                        isSelected={selectedId === el.id}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(p) => update(el.id, p)}
                      />
                    );
                  }
                  return null;
                })}
                <Transformer
                  ref={trRef}
                  rotateEnabled
                  keepRatio={false}
                  enabledAnchors={["top-left","top-center","top-right","middle-left","middle-right","bottom-left","bottom-center","bottom-right"]}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) return oldBox;
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>
          </div>
          <div className="absolute bottom-3 right-3 bg-[#2d2d2d] backdrop-blur rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/70 font-medium">
            {Math.round(stageScale * 100)}%
          </div>
        </div>

        {/* Resize handle — left edge of right panel */}
        <div
          onMouseDown={(e) => startResize("right", e)}
          className="w-1.5 cursor-col-resize bg-slate-200 hover:bg-primary/60 active:bg-primary transition-colors shrink-0 flex items-center justify-center group"
          title="Drag to resize panel"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-400 group-hover:bg-primary/80 transition-colors" />
        </div>
        <div className="border-l bg-white overflow-y-auto shrink-0" style={{ width: rightWidth }}>
          <div className="border-b">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> Layers
              </h3>
              <span className="text-[10px] text-muted-foreground">{elements.length} item{elements.length === 1 ? "" : "s"}</span>
            </div>
            {elements.length === 0 ? (
              <p className="text-xs text-muted-foreground px-4 pb-3">
                Add text, shapes or images and they will appear here.
              </p>
            ) : (
              <ul className="px-2 pb-2 max-h-64 overflow-y-auto">
                {elements.slice().reverse().map((el) => {
                  const isActive = el.id === selectedId;
                  let label = "";
                  let LIcon: any = Square;
                  if (el.type === "text") { label = (el as TextEl).text.split("\n")[0].slice(0, 24) || "Text"; LIcon = Type; }
                  else if (el.type === "rect") { label = "Rectangle"; LIcon = Square; }
                  else if (el.type === "circle") { label = "Circle"; LIcon = CircleIcon; }
                  else if (el.type === "star") { label = "Star"; LIcon = StarIcon; }
                  else if (el.type === "line") { label = "Line"; LIcon = Minus; }
                  else if (el.type === "image") { label = "Image"; LIcon = ImageIcon; }
                  return (
                    <li key={el.id}>
                      <button
                        onClick={() => setSelectedId(el.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <LIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate flex-1">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {!selected ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Palette className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              Select an element above or on the canvas to edit its properties
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm capitalize">{selected.type}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => moveLayer(1)} title="Bring forward">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => moveLayer(-1)} title="Send backward">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={duplicateSelected} title="Duplicate">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deleteSelected} title="Delete" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selected.type === "text" && (
                <>
                  <div>
                    <Label className="text-xs">Text</Label>
                    <textarea
                      value={(selected as TextEl).text}
                      onChange={e => update(selected.id, { text: e.target.value } as Partial<TextEl>)}
                      rows={3}
                      className="w-full mt-1 rounded-md border px-2 py-1.5 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Font</Label>
                    <select
                      value={(selected as TextEl).fontFamily}
                      onChange={e => update(selected.id, { fontFamily: e.target.value } as Partial<TextEl>)}
                      className="w-full mt-1 rounded-md border px-2 py-1.5 text-sm bg-white"
                    >
                      {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Size: {(selected as TextEl).fontSize}px</Label>
                    <input
                      type="range" min={12} max={300}
                      value={(selected as TextEl).fontSize}
                      onChange={e => update(selected.id, { fontSize: Number(e.target.value) } as Partial<TextEl>)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={(selected as TextEl).fontStyle.includes("bold") ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const t = selected as TextEl;
                        const has = t.fontStyle.includes("bold");
                        const next = has ? t.fontStyle.replace("bold", "").trim() || "normal"
                          : (t.fontStyle === "normal" ? "bold" : `${t.fontStyle} bold`);
                        update(t.id, { fontStyle: next } as Partial<TextEl>);
                      }}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={(selected as TextEl).fontStyle.includes("italic") ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const t = selected as TextEl;
                        const has = t.fontStyle.includes("italic");
                        const next = has ? t.fontStyle.replace("italic", "").trim() || "normal"
                          : (t.fontStyle === "normal" ? "italic" : `${t.fontStyle} italic`);
                        update(t.id, { fontStyle: next } as Partial<TextEl>);
                      }}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    {(["left", "center", "right"] as const).map(a => {
                      const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                      return (
                        <Button key={a}
                          variant={(selected as TextEl).align === a ? "default" : "outline"}
                          size="sm"
                          onClick={() => update(selected.id, { align: a } as Partial<TextEl>)}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                  <ColorPicker
                    label="Color"
                    value={(selected as TextEl).fill}
                    onChange={(c) => update(selected.id, { fill: c } as Partial<TextEl>)}
                  />
                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" /> Link (URL)
                    </Label>
                    <input
                      type="url"
                      placeholder="https://your-site.co.za/offer"
                      value={(selected as TextEl).link ?? ""}
                      onChange={e => update(selected.id, { link: e.target.value } as Partial<TextEl>)}
                      className="w-full mt-1 rounded-md border px-2 py-1.5 text-sm"
                    />
                    {(selected as TextEl).link && (
                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText((selected as TextEl).link ?? "");
                            toast.success("Link copied");
                          }}
                          className="text-xs flex-1 rounded-md border px-2 py-1 hover:bg-slate-50"
                        >
                          Copy link
                        </button>
                        <a
                          href={(selected as TextEl).link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex-1 rounded-md border px-2 py-1 hover:bg-slate-50 text-center"
                        >
                          Open
                        </a>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      PNG images can't carry clickable links. The link is stored on the design and added to your post caption when you download or publish.
                    </p>
                  </div>
                </>
              )}

              {(selected.type === "rect" || selected.type === "circle" || selected.type === "star") && (
                <>
                  <FillEditor
                    el={selected as any}
                    uploads={uploads}
                    onChange={(patch) => update(selected.id, patch as any)}
                    fillImgRef={fillImgRef}
                  />
                  {(selected.type === "rect" || selected.type === "circle") && (
                    <>
                      <ColorPicker
                        label="Border"
                        value={(selected as any).stroke}
                        onChange={(c) => update(selected.id, { stroke: c } as any)}
                      />
                      <div>
                        <Label className="text-xs">Border width: {(selected as any).strokeWidth}px</Label>
                        <input type="range" min={0} max={30}
                          value={(selected as any).strokeWidth}
                          onChange={e => update(selected.id, { strokeWidth: Number(e.target.value) } as any)}
                          className="w-full" />
                      </div>
                    </>
                  )}
                  {selected.type === "rect" && (
                    <div>
                      <Label className="text-xs">Corner radius: {(selected as RectEl).cornerRadius}px</Label>
                      <input type="range" min={0} max={200}
                        value={(selected as RectEl).cornerRadius}
                        onChange={e => update(selected.id, { cornerRadius: Number(e.target.value) } as Partial<RectEl>)}
                        className="w-full" />
                    </div>
                  )}
                </>
              )}

              {selected.type === "image" && (
                <>
                  <div>
                    <Label className="text-xs">Mask shape</Label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {(["none", "rounded", "circle"] as const).map(m => {
                        const active = ((selected as ImageEl).mask ?? "none") === m;
                        return (
                          <button
                            key={m}
                            onClick={() => update(selected.id, { mask: m } as Partial<ImageEl>)}
                            className={`py-2 rounded border text-xs capitalize ${
                              active ? "bg-primary text-white border-primary" : "bg-white hover:bg-slate-50"
                            }`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {((selected as ImageEl).mask ?? "none") === "rounded" && (
                    <div>
                      <Label className="text-xs">Corner radius: {(selected as ImageEl).cornerRadius ?? 24}px</Label>
                      <input type="range" min={0} max={200}
                        value={(selected as ImageEl).cornerRadius ?? 24}
                        onChange={e => update(selected.id, { cornerRadius: Number(e.target.value) } as Partial<ImageEl>)}
                        className="w-full" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input type="number"
                        value={Math.round((selected as ImageEl).width)}
                        onChange={e => update(selected.id, { width: Math.max(20, Number(e.target.value)) } as Partial<ImageEl>)}
                        className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input type="number"
                        value={Math.round((selected as ImageEl).height)}
                        onChange={e => update(selected.id, { height: Math.max(20, Number(e.target.value)) } as Partial<ImageEl>)}
                        className="h-8 text-sm" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Drag any corner or side handle to freely deform — use a mask to crop into a circle or rounded shape.
                  </p>
                </>
              )}

              {selected.type === "line" && (
                <>
                  <ColorPicker
                    label="Color"
                    value={(selected as LineEl).stroke}
                    onChange={(c) => update(selected.id, { stroke: c } as Partial<LineEl>)}
                  />
                  <div>
                    <Label className="text-xs">Thickness: {(selected as LineEl).strokeWidth}px</Label>
                    <input type="range" min={1} max={40}
                      value={(selected as LineEl).strokeWidth}
                      onChange={e => update(selected.id, { strokeWidth: Number(e.target.value) } as Partial<LineEl>)}
                      className="w-full" />
                  </div>
                </>
              )}

              <div>
                <Label className="text-xs">Rotation: {Math.round(selected.rotation)}°</Label>
                <input type="range" min={-180} max={180}
                  value={selected.rotation}
                  onChange={e => update(selected.id, { rotation: Number(e.target.value) } as any)}
                  className="w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="grid grid-cols-6 gap-1.5 mt-1">
        {PALETTE.map(c => (
          <button key={c} onClick={() => onChange(c)}
            className={`w-8 h-8 rounded border hover:scale-110 transition-transform ${value === c ? "ring-2 ring-primary ring-offset-1" : ""}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
      <input type="color" value={value && value.startsWith("#") ? value : "#000000"}
        onChange={e => onChange(e.target.value)}
        className="mt-2 w-full h-9 rounded cursor-pointer" />
    </div>
  );
}

const DIR_PRESETS = [
  { angle: 0,   label: "→" },
  { angle: 45,  label: "↘" },
  { angle: 90,  label: "↓" },
  { angle: 135, label: "↙" },
  { angle: 180, label: "←" },
  { angle: 225, label: "↖" },
  { angle: 270, label: "↑" },
  { angle: 315, label: "↗" },
];

function FillEditor({ el, uploads, onChange, fillImgRef }: {
  el: RectEl | CircleEl | StarEl;
  uploads: string[];
  onChange: (patch: Partial<RectEl & CircleEl & StarEl>) => void;
  fillImgRef: React.RefObject<HTMLInputElement>;
}) {
  const type = el.fillType || "solid";
  const c1 = el.fill || "#3B82F6";
  const c2 = el.fillColor2 || "#000000";
  const angle = el.gradientAngle ?? 90;

  const gradPreview = type === "linear"
    ? `linear-gradient(${angle}deg, ${c1}, ${c2})`
    : type === "radial"
    ? `radial-gradient(circle, ${c1}, ${c2})`
    : c1;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs mb-1.5 block">Fill Type</Label>
        <div className="grid grid-cols-4 gap-1">
          {(["solid", "linear", "radial", "image"] as const).map(t => (
            <button key={t} type="button" onClick={() => onChange({ fillType: t })}
              className={`py-1.5 rounded text-xs font-medium border transition-colors ${type === t ? "bg-primary text-white border-primary" : "bg-white hover:bg-slate-50 border-slate-200"}`}>
              {t === "solid" ? "Solid" : t === "linear" ? "Linear" : t === "radial" ? "Radial" : "Image"}
            </button>
          ))}
        </div>
      </div>

      {type === "solid" && (
        <ColorPicker label="Color" value={c1} onChange={c => onChange({ fill: c })} />
      )}

      {(type === "linear" || type === "radial") && (
        <>
          {/* Gradient preview swatch */}
          <div className="h-8 rounded-md border" style={{ background: gradPreview }} />

          <ColorPicker label="Color 1 (start)" value={c1} onChange={c => onChange({ fill: c })} />
          <ColorPicker label="Color 2 (end)" value={c2} onChange={c => onChange({ fillColor2: c })} />

          {type === "linear" && (
            <div>
              <Label className="text-xs mb-1 block">Direction: {angle}°</Label>
              <input type="range" min={0} max={360} value={angle}
                onChange={e => onChange({ gradientAngle: Number(e.target.value) })}
                className="w-full mb-2" />
              <div className="grid grid-cols-8 gap-1">
                {DIR_PRESETS.map(d => (
                  <button key={d.angle} type="button" onClick={() => onChange({ gradientAngle: d.angle })}
                    className={`h-7 rounded text-sm border transition-colors ${angle === d.angle ? "bg-primary text-white border-primary" : "hover:bg-slate-50 border-slate-200"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {type === "image" && (
        <div className="space-y-2">
          <Label className="text-xs block">Choose image fill</Label>
          {el.fillImageSrc && (
            <div className="h-16 rounded-md border overflow-hidden">
              <img src={el.fillImageSrc} alt="fill" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`grid gap-1.5 ${uploads.length > 0 ? "grid-cols-3" : "grid-cols-1"}`}>
            {uploads.map((src, i) => (
              <button key={i} type="button" onClick={() => onChange({ fillImageSrc: src, fillType: "image" })}
                className={`aspect-square rounded border overflow-hidden hover:border-primary transition-colors ${el.fillImageSrc === src ? "ring-2 ring-primary border-primary" : "border-slate-200"}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => fillImgRef.current?.click()}
            className="w-full py-2 rounded border border-dashed border-slate-300 text-xs text-muted-foreground hover:bg-slate-50 hover:border-primary transition-colors flex items-center justify-center gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Upload image for fill
          </button>
          {uploads.length === 0 && !el.fillImageSrc && (
            <p className="text-[10px] text-muted-foreground text-center">Upload an image to use it as a shape fill</p>
          )}
        </div>
      )}
    </div>
  );
}
