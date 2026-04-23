import { useEffect, useRef, useState } from "react";
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
  AlignLeft, AlignCenter, AlignRight, Copy, Layers, Minus, ChevronUp, ChevronDown
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
}

interface RectEl extends BaseEl {
  type: "rect";
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

interface CircleEl extends BaseEl {
  type: "circle";
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface StarEl extends BaseEl {
  type: "star";
  numPoints: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
}

interface ImageEl extends BaseEl {
  type: "image";
  src: string;
  width: number;
  height: number;
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

const TEMPLATES: Template[] = [
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

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function URLImage({ el, isSelected, onSelect, onChange }: {
  el: ImageEl; isSelected: boolean;
  onSelect: () => void; onChange: (a: Partial<ImageEl>) => void;
}) {
  const [img] = useImage(el.src, "anonymous");
  const ref = useRef<Konva.Image>(null);
  return (
    <KImage
      id={el.id}
      image={img}
      ref={ref}
      x={el.x} y={el.y} width={el.width} height={el.height}
      rotation={el.rotation}
      draggable={el.draggable}
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

export default function SocialPostEditor() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [bg, setBg] = useState("#FFFFFF");
  const [bgImage, setBgImage] = useState<string>("");
  const [elements, setElements] = useState<AnyEl[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageScale, setStageScale] = useState(0.5);
  const [tab, setTab] = useState<"templates" | "text" | "shapes" | "background" | "uploads">("templates");
  const [uploads, setUploads] = useState<string[]>([]);

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    const prevScale = stage.scaleX();
    const prevPos = { x: stage.x(), y: stage.y() };
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.size({ width: preset.w, height: preset.h });
    const uri = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
    stage.scale({ x: prevScale, y: prevScale });
    stage.position(prevPos);
    stage.size({ width: preset.w * prevScale, height: preset.h * prevScale });

    const link = document.createElement("a");
    link.download = `post-${preset.id}-${Date.now()}.png`;
    link.href = uri;
    link.click();
    toast.success("Design downloaded");
  }

  const selected = elements.find(e => e.id === selectedId) || null;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-100px)] w-full overflow-hidden bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="font-bold font-heading text-base">Post Designer</h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">Create stunning social media posts</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={preset.id}
            onChange={(e) => {
              const p = PRESETS.find(x => x.id === e.target.value);
              if (p) setPreset(p);
            }}
            className="rounded-md border px-2 py-1.5 text-sm bg-white"
          >
            {PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <Button onClick={exportImage} className="gradient-hero text-white" size="sm">
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
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
        <div className="w-60 border-r bg-white overflow-y-auto p-3 shrink-0">
          {tab === "templates" && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => loadTemplate(t)}
                    className="aspect-square rounded-lg border hover:border-primary transition-all overflow-hidden text-[10px] font-semibold text-white shadow-sm relative group"
                    style={{ background: t.thumb }}
                  >
                    <span className="absolute inset-x-0 bottom-0 bg-black/40 py-1">{t.name}</span>
                  </button>
                ))}
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

        {/* Canvas area */}
        <div ref={containerRef} className="flex-1 bg-slate-100 flex items-center justify-center overflow-auto relative">
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
                      <Rect
                        {...common}
                        x={el.x} y={el.y}
                        width={el.width} height={el.height}
                        fill={el.fill}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth}
                        cornerRadius={el.cornerRadius}
                        rotation={el.rotation}
                        draggable={el.draggable}
                        onTransformEnd={(e) => {
                          const node = e.target as Konva.Rect;
                          const sx = node.scaleX(); const sy = node.scaleY();
                          node.scaleX(1); node.scaleY(1);
                          update(el.id, {
                            x: node.x(), y: node.y(),
                            width: Math.max(10, node.width() * sx),
                            height: Math.max(10, node.height() * sy),
                            rotation: node.rotation(),
                          } as Partial<RectEl>);
                        }}
                      />
                    );
                  }
                  if (el.type === "circle") {
                    return (
                      <Circle
                        {...common}
                        x={el.x} y={el.y}
                        radius={el.radius}
                        fill={el.fill}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth}
                        rotation={el.rotation}
                        draggable={el.draggable}
                        onTransformEnd={(e) => {
                          const node = e.target as Konva.Circle;
                          const sx = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          update(el.id, {
                            x: node.x(), y: node.y(),
                            radius: Math.max(10, el.radius * sx),
                            rotation: node.rotation(),
                          } as Partial<CircleEl>);
                        }}
                      />
                    );
                  }
                  if (el.type === "star") {
                    return (
                      <Star
                        {...common}
                        x={el.x} y={el.y}
                        numPoints={el.numPoints}
                        innerRadius={el.innerRadius}
                        outerRadius={el.outerRadius}
                        fill={el.fill}
                        rotation={el.rotation}
                        draggable={el.draggable}
                        onTransformEnd={(e) => {
                          const node = e.target as Konva.Star;
                          const sx = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          update(el.id, {
                            x: node.x(), y: node.y(),
                            innerRadius: Math.max(5, el.innerRadius * sx),
                            outerRadius: Math.max(10, el.outerRadius * sx),
                            rotation: node.rotation(),
                          } as Partial<StarEl>);
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
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) return oldBox;
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>
          </div>
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-md border px-2 py-1 text-[11px] text-slate-600">
            {Math.round(stageScale * 100)}%
          </div>
        </div>

        {/* Right properties panel */}
        <div className="w-64 border-l bg-white overflow-y-auto shrink-0">
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
                </>
              )}

              {(selected.type === "rect" || selected.type === "circle" || selected.type === "star") && (
                <>
                  <ColorPicker
                    label="Fill"
                    value={(selected as any).fill}
                    onChange={(c) => update(selected.id, { fill: c } as any)}
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
