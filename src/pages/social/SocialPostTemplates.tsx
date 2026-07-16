import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sparkles, Copy, ArrowRight, Globe, Building2, Star, Phone,
  Tag, Users, BarChart3, RefreshCw, ChevronRight, Megaphone,
  Gift, Lightbulb, TrendingUp, Heart, Clock, Handshake, HelpCircle, Rocket, Zap,
  ShieldCheck, PiggyBank, Briefcase, DollarSign, PieChart, FileCheck, Award, Home, AlertTriangle, UserCheck, PenLine,
  Search, Plus, X, Send, Edit3
} from "lucide-react";
import { motion } from "framer-motion";
import type { SiteConfig, ServicesData, AboutData, HeroData, TestimonialsData, StatsData, ContactData } from "@/types/site";

interface Props {
  workspaceId: string;
  site: SiteConfig | null;
  createPath?: string;
  editorPath?: string;
}

interface PostTemplate {
  id: string;
  category: string;
  categoryIcon: any;
  categoryColor: string;
  categoryBg: string;
  categoryBgRGB: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  mockImage: string;
  templateImage: string;
  templateImageName: string;
}

const CATEGORY_COLORS: Record<string, { color: string; bg: string; rgb: string }> = {
  Introduction:   { color: "text-blue-600",   bg: "bg-blue-500/10",   rgb: "59, 130, 246" },
  Services:       { color: "text-green-600",  bg: "bg-green-500/10",  rgb: "34, 197, 94" },
  "Our Story":    { color: "text-purple-600", bg: "bg-purple-500/10", rgb: "147, 51, 234" },
  Features:       { color: "text-yellow-600", bg: "bg-yellow-500/10", rgb: "202, 138, 4" },
  Testimonials:   { color: "text-amber-600",  bg: "bg-amber-500/10",  rgb: "217, 119, 6" },
  Milestones:     { color: "text-cyan-600",   bg: "bg-cyan-500/10",   rgb: "6, 182, 212" },
  Contact:        { color: "text-red-600",    bg: "bg-red-500/10",    rgb: "220, 38, 38" },
  Engagement:     { color: "text-pink-600",   bg: "bg-pink-500/10",   rgb: "236, 72, 153" },
  Advertising:    { color: "text-orange-600", bg: "bg-orange-500/10", rgb: "234, 88, 12" },
  Promotions:     { color: "text-rose-600",   bg: "bg-rose-500/10",   rgb: "225, 29, 72" },
  "Tips & Value":        { color: "text-teal-600",   bg: "bg-teal-500/10",   rgb: "13, 148, 136" },
  "Brokerage & Finance": { color: "text-indigo-600", bg: "bg-indigo-500/10", rgb: "79, 70, 229" },
};

function getCategory(cat: string) {
  return CATEGORY_COLORS[cat] || { color: "text-blue-600", bg: "bg-blue-500/10", rgb: "59, 130, 246" };
}

function generateStaticAdTemplates(biz: string): PostTemplate[] {
  const templates: PostTemplate[] = [];

  // ─── ADVERTISING ──────────────────────────────────────────────────────────

  const adCat = getCategory("Advertising");

  templates.push({
    id: "ad-flash-sale",
    category: "Advertising",
    categoryIcon: Zap,
    categoryColor: adCat.color,
    categoryBg: adCat.bg,
    categoryBgRGB: adCat.rgb,
    title: "Flash Sale – 24 Hours Only",
    description: "Drive urgency with a limited-time discount offer",
    content: `⚡ FLASH SALE — 24 HOURS ONLY!\n\nDon't miss out on massive savings at ${biz}! For the next 24 hours, we're slashing prices on our most popular products and services.\n\n🔥 Up to 30% OFF selected items\n⏰ Offer ends midnight tonight\n🛍️ Limited quantities available\n\nThis is NOT a drill! Tag a friend who needs to know about this deal before it's gone. Share the savings! 💰\n\n👇 Drop "DEAL" in the comments to get the link!\n\n#FlashSale #LimitedOffer #24HoursOnly #${biz.replace(/\s+/g, "")} #SouthAfrica #ShopLocal`,
    tags: ["#FlashSale", "#LimitedOffer", "#ShopLocal", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-flash-sale.jpg",
  });

  templates.push({
    id: "ad-product-launch",
    category: "Advertising",
    categoryIcon: Rocket,
    categoryColor: adCat.color,
    categoryBg: adCat.bg,
    categoryBgRGB: adCat.rgb,
    title: "New Product / Service Launch",
    description: "Build excitement around your latest launch",
    content: `🚀 IT'S HERE! Introducing our newest addition at ${biz}!\n\nWe've been working hard behind the scenes, and we're beyond excited to finally reveal what's been keeping us busy.\n\n✨ Designed with YOUR needs in mind\n💎 Premium quality — no compromises\n🇿🇦 Proudly South African, built for South Africans\n\n🎉 LAUNCH SPECIAL: Be among the first 20 customers to claim our exclusive introductory offer!\n\n👇 Comment "LAUNCH" below or DM us to be first in line!\n\n#NewLaunch #ProductLaunch #Innovation #${biz.replace(/\s+/g, "")} #SouthAfrica`,
    tags: ["#NewLaunch", "#ProductLaunch", "#Innovation", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-product-launch.jpg",
  });

  templates.push({
    id: "ad-limited-stock",
    category: "Advertising",
    categoryIcon: TrendingUp,
    categoryColor: adCat.color,
    categoryBg: adCat.bg,
    categoryBgRGB: adCat.rgb,
    title: "Low Stock Urgency Alert",
    description: "Create urgency with a limited stock notification",
    content: `⚠️ ALMOST GONE — Low Stock Alert!\n\nWe only have a handful of units left of our best-selling item — and at this rate, they're flying off the shelves!\n\n📦 Only a FEW units remaining\n💳 Secure yours before midnight\n🚚 Fast delivery available nationwide\n❌ NO RESTOCK planned this month\n\nDon't be the person who says "I should have bought it when I had the chance!"\n\nWe've seen this sell out THREE times already. Don't sleep on it.\n\n👇 Comment "SOLD" to reserve yours NOW before someone else grabs it!\n\n#LimitedStock #DontMissOut #SellingFast #${biz.replace(/\s+/g, "")} #ShopNow`,
    tags: ["#LimitedStock", "#DontMissOut", "#SellingFast", "#ShopNow"],
    mockImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-limited-stock.jpg",
  });

  templates.push({
    id: "ad-giveaway",
    category: "Advertising",
    categoryIcon: Gift,
    categoryColor: adCat.color,
    categoryBg: adCat.bg,
    categoryBgRGB: adCat.rgb,
    title: "Community Giveaway",
    description: "Grow your audience with an exciting giveaway post",
    content: `🎉 GIVEAWAY TIME — We're celebrating with YOU!\n\nTo thank our incredible community for [X] followers / [milestone], we're giving away an amazing prize!\n\n🎁 Prize: [Describe Your Prize]\n💰 Value: R[Amount]\n📅 Winner announced: [Date]\n\nTo enter, simply:\n1️⃣ LIKE this post ❤️\n2️⃣ FOLLOW our page (if you haven't already)\n3️⃣ TAG 2 friends in the comments below\n\n⭐ BONUS: Share this to your story for 5 extra entries!\n\nEach tag = an extra entry. The more you share, the better your chances! Good luck! 🍀\n\n#Giveaway #Competition #WinWithUs #${biz.replace(/\s+/g, "")} #SouthAfrica`,
    tags: ["#Giveaway", "#Competition", "#WinWithUs", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-giveaway.jpg",
  });

  templates.push({
    id: "ad-before-after",
    category: "Advertising",
    categoryIcon: Sparkles,
    categoryColor: adCat.color,
    categoryBg: adCat.bg,
    categoryBgRGB: adCat.rgb,
    title: "Before & After Transformation",
    description: "Showcase a powerful client result or transformation",
    content: `🔄 The Transformation is REAL — and it could be yours too!\n\nBefore ${biz}:\n❌ [The Problem Your Customer Had]\n❌ [The Frustration They Felt]\n❌ [What Wasn't Working]\n\n↓ After working with ${biz}:\n✅ [Incredible Result 1]\n✅ [Incredible Result 2]\n✅ [Life-Changing Result 3]\n\nThe difference? [Your Key Differentiator — what makes you different]\n\nWe've helped [number]+ clients make this transformation — and we're ready to do the same for YOU.\n\n💬 Comment "TRANSFORM" below and we'll reach out within 24 hours to show you how.\n\n#BeforeAfter #Transformation #Results #ClientWins #${biz.replace(/\s+/g, "")} #SouthAfrica`,
    tags: ["#BeforeAfter", "#Transformation", "#Results", "#ClientWins"],
    mockImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-before-after.jpg",
  });

  // ─── PROMOTIONS ───────────────────────────────────────────────────────────

  const promoCat = getCategory("Promotions");

  templates.push({
    id: "promo-discount",
    category: "Promotions",
    categoryIcon: Tag,
    categoryColor: promoCat.color,
    categoryBg: promoCat.bg,
    categoryBgRGB: promoCat.rgb,
    title: "Special Discount Offer",
    description: "Announce a price reduction or discount code",
    content: `💥 SPECIAL OFFER — Just For Our Online Community!\n\nWe appreciate every single one of you, so here's a little thank-you gift:\n\n🏷️ [X]% OFF your next purchase / service\n📲 Mention "SOCIAL[X]" when you book or order\n⏳ Valid until [Date]\n\nThis exclusive deal is for our followers ONLY — so share it before it expires!\n\nWhat will you be getting? Let us know in the comments! 👇\n\n📞 Book now: [Phone/WhatsApp]\n📧 Email: [Email]\n\n#SpecialOffer #Discount #ExclusiveDeal #${biz.replace(/\s+/g, "")} #SouthAfrica #ShopLocal`,
    tags: ["#SpecialOffer", "#Discount", "#ExclusiveDeal", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-discount-offer.jpg",
  });

  templates.push({
    id: "promo-referral",
    category: "Promotions",
    categoryIcon: Handshake,
    categoryColor: promoCat.color,
    categoryBg: promoCat.bg,
    categoryBgRGB: promoCat.rgb,
    title: "Refer a Friend & Earn",
    description: "Reward customers who bring in new business",
    content: `💰 REFER A FRIEND — You BOTH Win!\n\nDo you know someone who could benefit from what we offer at ${biz}? Send them our way and we'll reward you BOTH!\n\n🎁 You receive: [Your Reward — e.g. R200 voucher / free service]\n🎁 Your friend gets: [Friend's Reward — e.g. 15% off their first order]\n✅ No limit — refer as many people as you like!\n\nHere's how it works:\n1️⃣ Share this post with a friend who needs us\n2️⃣ They mention YOUR name when they contact us\n3️⃣ You BOTH walk away with something awesome 🏆\n\nTag your person below! 👇\n\n#ReferAFriend #ReferralProgram #WinWin #${biz.replace(/\s+/g, "")} #SouthAfrica`,
    tags: ["#ReferAFriend", "#ReferralProgram", "#WinWin", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-referral.jpg",
  });

  templates.push({
    id: "promo-bundle",
    category: "Promotions",
    categoryIcon: Star,
    categoryColor: promoCat.color,
    categoryBg: promoCat.bg,
    categoryBgRGB: promoCat.rgb,
    title: "Bundle Deal / Package Offer",
    description: "Promote a value-packed bundle or combo package",
    content: `🎯 BUNDLE DEAL — More Value, Less Spend!\n\nWhy settle for one when you can get MORE for your money?\n\nIntroducing our ${biz} VALUE BUNDLE:\n\n📦 [Item / Service 1] — Worth R[Price]\n📦 [Item / Service 2] — Worth R[Price]\n📦 [Item / Service 3] — Worth R[Price]\n\n💰 Bundle Price: Only R[Bundle Price] (Save R[Savings]!)\n⏳ Available for [X] days only\n\nThis bundle was created because our customers kept asking for it — and we listened! 👂\n\n👇 Comment "BUNDLE" to claim yours or DM us to order!\n\n#BundleDeal #ValueForMoney #${biz.replace(/\s+/g, "")} #SmartShopping #SouthAfrica`,
    tags: ["#BundleDeal", "#ValueForMoney", "#SmartShopping", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-bundle-deal.jpg",
  });

  templates.push({
    id: "promo-partnership",
    category: "Promotions",
    categoryIcon: Handshake,
    categoryColor: promoCat.color,
    categoryBg: promoCat.bg,
    categoryBgRGB: promoCat.rgb,
    title: "Partnership Announcement",
    description: "Announce an exciting new business partnership",
    content: `🤝 BIG NEWS — We've Partnered Up!\n\nWe are beyond THRILLED to announce our exciting new partnership with [Partner Name]!\n\nWhat does this mean for YOU?\n\n✨ [Key Benefit 1 for your customers]\n✨ [Key Benefit 2 for your customers]\n✨ [Key Benefit 3 for your customers]\n\nTogether, ${biz} and [Partner] are combining our strengths to deliver something our customers have never experienced before.\n\nStay tuned — there is a LOT more coming your way very soon! 🚀\n\nTag someone who should know about this! 👇\n\n#Partnership #Collaboration #BusinessGrowth #${biz.replace(/\s+/g, "")} #SouthAfrica`,
    tags: ["#Partnership", "#Collaboration", "#BusinessGrowth", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-partnership.jpg",
  });

  // ─── TIPS & VALUE ─────────────────────────────────────────────────────────

  const tipCat = getCategory("Tips & Value");

  templates.push({
    id: "tip-pro-tip",
    category: "Tips & Value",
    categoryIcon: Lightbulb,
    categoryColor: tipCat.color,
    categoryBg: tipCat.bg,
    categoryBgRGB: tipCat.rgb,
    title: "Pro Tip Tuesday",
    description: "Share an industry tip to build authority and trust",
    content: `💡 PRO TIP from the ${biz} team!\n\nDid you know that [industry-specific fact or insight that surprises your audience]?\n\nHere's what most people get WRONG:\n❌ [Common Mistake 1]\n❌ [Common Mistake 2]\n❌ [Common Mistake 3]\n\nHere's what actually WORKS:\n✅ [Correct Approach 1]\n✅ [Correct Approach 2]\n✅ [Correct Approach 3]\n\n📌 Save this post — you'll want to come back to it!\n\n💬 What questions do you have? Drop them in the comments and we'll answer every single one!\n\n#ProTip #BusinessAdvice #IndustryInsights #${biz.replace(/\s+/g, "")} #SouthAfrica #Entrepreneur`,
    tags: ["#ProTip", "#BusinessAdvice", "#IndustryInsights", "#Entrepreneur"],
    mockImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-pro-tip.jpg",
  });

  templates.push({
    id: "tip-did-you-know",
    category: "Tips & Value",
    categoryIcon: HelpCircle,
    categoryColor: tipCat.color,
    categoryBg: tipCat.bg,
    categoryBgRGB: tipCat.rgb,
    title: "Did You Know? (Education Post)",
    description: "Educate your audience with a surprising industry fact",
    content: `🤔 Did you know this about [your industry]?\n\nFact: [Surprising or eye-opening industry statistic or insight]\n\nMost people don't realise:\n👉 [Supporting fact 1]\n👉 [Supporting fact 2]\n👉 [Supporting fact 3]\n\nAt ${biz}, this is EXACTLY why we [explain your unique approach or commitment].\n\nWe believe an informed customer makes the best decisions — and we're here to keep you informed.\n\n📌 Save this and share with someone in your industry!\n\n#DidYouKnow #Facts #Education #${biz.replace(/\s+/g, "")} #SouthAfrica #SMME`,
    tags: ["#DidYouKnow", "#Facts", "#Education", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1516321165247-4aa89a48be55?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1516321165247-4aa89a48be55?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-did-you-know.jpg",
  });

  templates.push({
    id: "tip-motivation",
    category: "Tips & Value",
    categoryIcon: Heart,
    categoryColor: tipCat.color,
    categoryBg: tipCat.bg,
    categoryBgRGB: tipCat.rgb,
    title: "Monday Motivation",
    description: "Inspire your audience to start the week strong",
    content: `💪 MONDAY MOTIVATION from the ${biz} team!\n\n"The secret to getting ahead is getting started." — Mark Twain\n\nThis week, we challenge you to:\n🎯 Set ONE clear, specific goal for your business\n📝 Write down the 3 steps that will get you there\n✅ Take action on step ONE before the end of today\n\nAt ${biz}, we believe deeply in the power of South African entrepreneurship. Every great business — every empire — started with a single brave decision.\n\n💙💛💚🖤 You've got this!\n\n👇 Drop your goal for this week in the comments — let's hold each other accountable!\n\n#MondayMotivation #Entrepreneur #SouthAfrica #SMME #BusinessGrowth`,
    tags: ["#MondayMotivation", "#Entrepreneur", "#SouthAfrica", "#SMME"],
    mockImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-motivation.jpg",
  });

  templates.push({
    id: "tip-faq",
    category: "Tips & Value",
    categoryIcon: HelpCircle,
    categoryColor: tipCat.color,
    categoryBg: tipCat.bg,
    categoryBgRGB: tipCat.rgb,
    title: "FAQ — Your Top Questions Answered",
    description: "Address common customer questions in one post",
    content: `❓ YOUR TOP QUESTIONS — ANSWERED!\n\nWe get asked these ALL the time at ${biz}, so we thought we'd put them all in one place:\n\n🙋 Q: How long does it take?\n💬 A: [Your typical turnaround time]\n\n🙋 Q: What areas do you service?\n💬 A: We serve [your area] and surrounding regions. Nationwide delivery available!\n\n🙋 Q: Do you offer payment plans?\n💬 A: Yes! We offer flexible payment options — ask us about our plans.\n\n🙋 Q: How do I get started?\n💬 A: Simply DM us, WhatsApp us, or click the link in our bio!\n\n📌 Save this and share with someone who's been wondering!\n\n#FAQ #CustomerService #${biz.replace(/\s+/g, "")} #SouthAfrica #HereToHelp`,
    tags: ["#FAQ", "#CustomerService", "#HereToHelp", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-faq.jpg",
  });

  // ─── ENGAGEMENT ───────────────────────────────────────────────────────────

  const engCat = getCategory("Engagement");

  templates.push({
    id: "eng-behind-scenes",
    category: "Engagement",
    categoryIcon: Users,
    categoryColor: engCat.color,
    categoryBg: engCat.bg,
    categoryBgRGB: engCat.rgb,
    title: "Behind the Scenes",
    description: "Give your audience an exclusive look at your team at work",
    content: `👀 Ever wondered what goes on BEHIND THE SCENES at ${biz}?\n\nToday, we're giving you an exclusive peek into our world...\n\n☕ We start early — because your orders, bookings, and projects deserve our best\n🛠️ Every single detail is checked, double-checked, and triple-checked\n🤝 We collaborate as a team because great things are never done alone\n❤️ Most importantly — we genuinely care about every single customer\n\nThe passionate people behind the brand are what make ${biz} truly special.\n\n💬 Would you like to see more of our day-to-day? Comment "MORE" below and we'll do a full day-in-the-life post!\n\n#BehindTheScenes #OurTeam #BusinessLife #${biz.replace(/\s+/g, "")} #SouthAfrica`,
    tags: ["#BehindTheScenes", "#OurTeam", "#BusinessLife", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-behind-scenes.jpg",
  });

  templates.push({
    id: "eng-poll",
    category: "Engagement",
    categoryIcon: BarChart3,
    categoryColor: engCat.color,
    categoryBg: engCat.bg,
    categoryBgRGB: engCat.rgb,
    title: "This or That? (Engagement Poll)",
    description: "Boost engagement with a fun audience poll",
    content: `🗳️ THIS OR THAT? — We want to know what YOU think!\n\nAt ${biz}, your opinions shape everything we do. So tell us:\n\n🅰️ Option A: [Choice 1 — e.g. Morning service vs Evening service]\n🆚\n🅱️ Option B: [Choice 2 — e.g. Pay monthly vs Pay upfront]\n\n👇 Comment A or B below!\n\nBonus question: Is there something specific you wish we offered or did differently? We're ALL ears — your feedback directly influences what we build next.\n\nShare this with a friend and see what THEY choose! 😄\n\n#ThisOrThat #YouDecide #CommunityVote #${biz.replace(/\s+/g, "")} #CustomerFirst`,
    tags: ["#ThisOrThat", "#CommunityVote", "#CustomerFirst", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-poll.jpg",
  });

  templates.push({
    id: "eng-social-proof",
    category: "Engagement",
    categoryIcon: BarChart3,
    categoryColor: engCat.color,
    categoryBg: engCat.bg,
    categoryBgRGB: engCat.rgb,
    title: "Our Numbers Speak for Themselves",
    description: "Build credibility with real business stats and milestones",
    content: `📊 THE NUMBERS DON'T LIE — and we're incredibly proud of ours!\n\nSince opening our doors, ${biz} has:\n\n🎯 Served [X]+ happy, satisfied customers\n⭐ Maintained a [4.8]/5 customer satisfaction rating\n📦 Delivered [X]+ successful projects and orders\n🏆 Earned [X] industry recognition / awards\n🇿🇦 Supported [X]+ local jobs in South Africa\n\nWe don't just talk about excellence — we LIVE it, every single day.\n\nNone of this would be possible without YOUR continued trust and support. THANK YOU. 🙏\n\nReady to become our next success story? 👇 Let's talk!\n\n#Milestones #SocialProof #Credibility #${biz.replace(/\s+/g, "")} #Proud #SouthAfrica`,
    tags: ["#Milestones", "#SocialProof", "#Credibility", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-social-proof.jpg",
  });

  templates.push({
    id: "eng-appreciation",
    category: "Engagement",
    categoryIcon: Heart,
    categoryColor: engCat.color,
    categoryBg: engCat.bg,
    categoryBgRGB: engCat.rgb,
    title: "Customer Appreciation Post",
    description: "Genuinely thank your community for their support",
    content: `🙏 FROM THE BOTTOM OF OUR HEARTS — THANK YOU!\n\nWe hit a major milestone this week — [X followers / X orders / X years in business / etc.] — and we couldn't have done it without every single one of you.\n\nTo our loyal customers:\nThank you for trusting us. Thank you for choosing us. Thank you for spreading the word.\n\nTo our new followers:\nWelcome to the ${biz} family! We're so glad you found us, and we cannot wait to show you what we're made of.\n\n❤️ This community is everything to us.\n\n💬 Drop a ❤️ in the comments if you've been part of our journey — we see you and we appreciate you more than words can say!\n\n#ThankYou #CustomerAppreciation #Grateful #${biz.replace(/\s+/g, "")} #Community #SouthAfrica`,
    tags: ["#ThankYou", "#CustomerAppreciation", "#Grateful", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-appreciation.jpg",
  });

  templates.push({
    id: "eng-anniversary",
    category: "Engagement",
    categoryIcon: Star,
    categoryColor: engCat.color,
    categoryBg: engCat.bg,
    categoryBgRGB: engCat.rgb,
    title: "Business Anniversary / Milestone",
    description: "Celebrate a birthday, anniversary, or major milestone",
    content: `🎂 WE'RE CELEBRATING — And YOU'RE Invited!\n\n${biz} is turning [X] years old / reaching [milestone] — and we want to celebrate with the people who made it possible: YOU! 🎉\n\n[X] years ago, we started with [humble beginning — e.g. a small garage, a dream, R500 in the bank].\n\nToday, we've:\n🏆 Served [X]+ amazing clients\n💼 Built a team of [X] passionate people\n🌍 Expanded to [regions/platforms]\n\nThe road wasn't always easy — but every challenge was worth it because of the incredible community we've built.\n\n🎁 To celebrate, we're offering [ANNIVERSARY SPECIAL: X% off / free gift / etc.] this week only!\n\nThank you for being part of this story. Here's to many more years! 🥂\n\n#Anniversary #Milestone #Celebrating #${biz.replace(/\s+/g, "")} #SouthAfrica`,
    tags: ["#Anniversary", "#Milestone", "#Celebrating", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-anniversary.jpg",
  });

  // ─── BROKERAGE & FINANCE ─────────────────────────────────────────────────

  const brokerCat = getCategory("Brokerage & Finance");

  templates.push({
    id: "broker-life-cover",
    category: "Brokerage & Finance",
    categoryIcon: ShieldCheck,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Life Cover Awareness",
    description: "Educate your audience on the importance of life insurance",
    content: `🛡️ DOES YOUR FAMILY KNOW THEY'RE PROTECTED?\n\nLife is unpredictable. One moment everything is fine — and the next, your loved ones could be facing financial hardship without you.\n\nAt ${biz}, we help South African families secure their future with the right life cover:\n\n✅ Pay-out on death, disability or critical illness\n✅ Covers outstanding debt, bonds & school fees\n✅ Plans starting from as little as R200/month\n✅ Fully underwritten — no hidden surprises\n\nThe question isn't whether you can afford life cover — it's whether your family can afford for you NOT to have it.\n\n📞 Book a FREE consultation today. No obligation. Just peace of mind.\n\n👇 Comment "COVER" or DM us to get started.\n\n#LifeCover #LifeInsurance #FinancialPlanning #${biz.replace(/\s+/g, "")} #SouthAfrica #ProtectYourFamily`,
    tags: ["#LifeCover", "#LifeInsurance", "#FinancialPlanning", "#SouthAfrica"],    mockImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-life-cover.jpg",
  });

  templates.push({
    id: "broker-retirement",
    category: "Brokerage & Finance",
    categoryIcon: PiggyBank,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Retirement Planning",
    description: "Prompt clients to start planning for retirement early",
    content: `⏰ ARE YOU SAVING ENOUGH FOR RETIREMENT?\n\nHere's a hard truth: 94% of South Africans cannot afford to retire comfortably.\n\nDon't be part of that statistic.\n\nAt ${biz}, our retirement planning specialists help you:\n\n📈 Build a personalised retirement savings strategy\n🏦 Choose between RAs, pension funds, and living annuities\n💰 Maximise your 27.5% tax deductible contributions\n🧮 Calculate exactly how much you need — and how to get there\n🇿🇦 Navigate SARS retirement fund tax benefits\n\nWhether you're 25 or 55, the best time to start was yesterday. The second best time is TODAY.\n\n📊 Book your FREE retirement gap analysis — no cost, no commitment.\n\n👇 Comment "RETIRE" to get started!\n\n#RetirementPlanning #RetirementFund #FinancialFreedom #${biz.replace(/\s+/g, "")} #SouthAfrica #RA`,
    tags: ["#RetirementPlanning", "#FinancialFreedom", "#RA", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-retirement-planning.jpg",
  });

  templates.push({
    id: "broker-investment",
    category: "Brokerage & Finance",
    categoryIcon: TrendingUp,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Investment Portfolio Growth",
    description: "Showcase investment opportunities and wealth-building advice",
    content: `📈 YOUR MONEY SHOULD WORK AS HARD AS YOU DO.\n\nToo many South Africans leave their savings sitting in a bank account earning 4% while inflation quietly eats away at their wealth.\n\nAt ${biz}, we help our clients invest smarter:\n\n🏦 Unit trusts & managed funds\n📊 JSE-listed equities and ETFs\n🌍 Offshore investing & rand hedging\n🏘️ Property investment strategies\n💎 Alternative investments & structured products\n\nOur advisors don't chase commission — we chase YOUR results.\n\n📊 Example: R5,000/month invested over 20 years at 12% p.a. = R4.9 million. 💰\n\nStop letting inflation win. Start building real wealth today.\n\n📞 Book a FREE investment strategy session with one of our qualified advisors.\n\n👇 Comment "INVEST" or DM us to get started!\n\n#Investing #WealthBuilding #FinancialAdvisor #${biz.replace(/\s+/g, "")} #SouthAfrica #JSE`,
    tags: ["#Investing", "#WealthBuilding", "#FinancialAdvisor", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-investment-portfolio.jpg",
  });

  templates.push({
    id: "broker-tfsa",
    category: "Brokerage & Finance",
    categoryIcon: PieChart,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Tax-Free Savings Account",
    description: "Educate clients about the TFSA tax benefit",
    content: `💡 THE SMARTEST TAX MOVE MOST SOUTH AFRICANS AREN'T MAKING.\n\nDid you know SARS allows every South African to invest R36,000 per year — TAX FREE?\n\nThat means:\n❌ No tax on interest\n❌ No tax on dividends\n❌ No capital gains tax on growth\n\nYour TFSA grows completely tax-free for LIFE — up to a R500,000 lifetime limit.\n\nAt ${biz}, we help you:\n✅ Open and fund your TFSA correctly\n✅ Choose the right fund for your goals and risk profile\n✅ Combine TFSAs with other investments for maximum benefit\n✅ Avoid common TFSA mistakes that cost clients thousands\n\nThis is literally free money from SARS — are you taking advantage of it?\n\n📞 Get your FREE TFSA strategy session today.\n\n👇 Drop "TFSA" in the comments to find out more!\n\n#TFSA #TaxFree #TaxSavings #${biz.replace(/\s+/g, "")} #SouthAfrica #SARS #FinancialTip`,
    tags: ["#TFSA", "#TaxFree", "#TaxSavings", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-tfsa.jpg",
  });

  templates.push({
    id: "broker-estate-planning",
    category: "Brokerage & Finance",
    categoryIcon: FileCheck,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Estate Planning & Will",
    description: "Drive conversations about wills and estate planning",
    content: `📜 WHO GETS EVERYTHING YOU'VE WORKED FOR IF SOMETHING HAPPENS TO YOU?\n\nIf you don't have a valid will, the Intestate Succession Act decides — not you.\n\nAnd without proper estate planning:\n❌ Your estate could take years to wind up\n❌ Your family may receive nothing for months\n❌ Executor's fees and estate duty can consume up to 20%+ of your estate\n❌ Loved ones left with debt they didn't know about\n\nAt ${biz}, our estate planning specialists help you:\n\n✅ Draft a legally valid will\n✅ Structure your estate to minimise taxes and delays\n✅ Set up trusts for minor children and dependants\n✅ Nominate the right beneficiaries on all your policies\n✅ Plan for business succession if you're a business owner\n\nIt's not about dying — it's about living with peace of mind knowing your loved ones are taken care of.\n\n📞 Book your FREE estate review today.\n\n👇 Comment "ESTATE" or send us a DM!\n\n#EstatePlanning #Will #FinancialPlanning #${biz.replace(/\s+/g, "")} #SouthAfrica #Legacy`,
    tags: ["#EstatePlanning", "#Will", "#FinancialPlanning", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-estate-planning.jpg",
  });

  templates.push({
    id: "broker-short-term",
    category: "Brokerage & Finance",
    categoryIcon: AlertTriangle,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Short-Term Insurance Review",
    description: "Prompt clients to review their short-term cover",
    content: `⚠️ ARE YOU UNDERINSURED — AND DON'T EVEN KNOW IT?\n\nMost South Africans haven't reviewed their insurance in over 3 years. In that time:\n\n🏠 Your home's replacement value may have increased by 30%+\n🚗 Your vehicle's market value has changed\n📱 You've bought new appliances, electronics & valuables\n💼 Your business assets have grown\n\nIf you claim today, you could receive significantly less than you expect — and be left out of pocket.\n\nAt ${biz}, we offer FREE short-term insurance reviews to make sure you're:\n\n✅ Paying the right premium for your current situation\n✅ Covered for the RIGHT amount (not just the cheapest policy)\n✅ Protected against gaps most people don't know about\n✅ Getting the best value from a reputable underwriter\n\nOur brokers work for YOU — not the insurance companies.\n\n📞 Book your FREE insurance review now. It takes 30 minutes and could save you thousands.\n\n👇 Comment "REVIEW" or DM us!\n\n#Insurance #ShortTermInsurance #UnderInsured #${biz.replace(/\s+/g, "")} #SouthAfrica #Broker`,
    tags: ["#Insurance", "#ShortTermInsurance", "#Broker", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-short-term-insurance.jpg",
  });

  templates.push({
    id: "broker-debt-consolidation",
    category: "Brokerage & Finance",
    categoryIcon: DollarSign,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Debt Consolidation",
    description: "Help clients struggling with multiple debt obligations",
    content: `💳 DROWNING IN DEBT? HERE'S YOUR LIFELINE.\n\nIf you're juggling multiple monthly repayments — credit cards, vehicle finance, personal loans, store accounts — you're likely paying MORE than you need to.\n\nDebt consolidation through ${biz} could help you:\n\n✅ Combine ALL your debt into ONE lower monthly payment\n✅ Reduce your total interest paid significantly\n✅ Free up cash flow every single month\n✅ Protect your credit record from missed payments\n✅ Regain control and build a clear path to financial freedom\n\n📊 Example: 4 x R2,500 monthly payments = R10,000/month\nAfter consolidation: as low as R6,500/month — saving R3,500 every month!\n\nYou don't have to keep struggling alone. Our qualified debt advisors have helped hundreds of South African families breathe again.\n\n📞 FREE, no-obligation consultation. Completely confidential.\n\n👇 Comment "DEBT" or DM us to get started today!\n\n#DebtConsolidation #DebtRelief #FinancialFreedom #${biz.replace(/\s+/g, "")} #SouthAfrica #DebtAdvice`,
    tags: ["#DebtConsolidation", "#DebtRelief", "#FinancialFreedom", "#SouthAfrica"],    mockImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-debt-consolidation.jpg",
  });

  templates.push({
    id: "broker-business-insurance",
    category: "Brokerage & Finance",
    categoryIcon: Briefcase,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Business Insurance for SMMEs",
    description: "Target SMME owners who need to protect their business assets",
    content: `🏢 YOUR BUSINESS IS YOUR BIGGEST ASSET — IS IT PROTECTED?\n\nMost SMME owners insure their cars but not their businesses. One incident could wipe out everything you've spent years building.\n\nAt ${biz}, our commercial insurance specialists cover South African SMMEs against:\n\n🔥 Fire, flood and natural disasters\n🚨 Theft, burglary and malicious damage\n⚖️ Public liability and professional indemnity\n🛑 Business interruption (when you can't trade)\n💼 Key person insurance (what if you're incapacitated?)\n🚗 Commercial vehicle and fleet cover\n\nWhether you run a spaza shop, a construction company or a professional practice — we have a solution tailored for your business.\n\n📞 Get your FREE business insurance quote in under 24 hours.\n\n👉 Don't wait until something goes wrong. Protect what you've built.\n\n👇 Comment "BIZINSURE" or send us a DM today!\n\n#BusinessInsurance #SMME #SmallBusiness #${biz.replace(/\s+/g, "")} #SouthAfrica #CommercialInsurance`,
    tags: ["#BusinessInsurance", "#SMME", "#SmallBusiness", "#SouthAfrica"],    mockImage: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-business-insurance.jpg",
  });

  templates.push({
    id: "broker-meet-advisor",
    category: "Brokerage & Finance",
    categoryIcon: UserCheck,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Meet Your Financial Advisor",
    description: "Introduce your advisor team and build trust with your audience",
    content: `👋 MEET THE TEAM BEHIND YOUR FINANCIAL FUTURE.\n\nAt ${biz}, we believe great financial advice starts with a real relationship — not a call centre.\n\nOur team of qualified financial advisors are:\n\n🎓 CFP® certified and FSCA registered\n🤝 Dedicated to YOUR goals, not a sales target\n📍 Based locally — available for in-person consultations\n🔒 Bound by the Financial Advisory and Intermediary Services (FAIS) Act\n💬 Always available — email, WhatsApp, or phone\n\nWe've helped hundreds of South African families and businesses:\n✅ Build wealth through smart investing\n✅ Protect their income and assets\n✅ Plan for retirement with confidence\n✅ Navigate complex financial decisions\n\nWe're not just your broker — we're your long-term financial partner.\n\n📞 Book a FREE 30-minute introduction call. No sales pitch. Just good advice.\n\n👇 Comment "HELLO" or DM us to meet your advisor today!\n\n#FinancialAdvisor #CFP #FSCA #${biz.replace(/\s+/g, "")} #SouthAfrica #TrustYourAdvisor`,
    tags: ["#FinancialAdvisor", "#CFP", "#FSCA", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-meet-advisor.jpg",
  });

  templates.push({
    id: "broker-client-success",
    category: "Brokerage & Finance",
    categoryIcon: Award,
    categoryColor: brokerCat.color,
    categoryBg: brokerCat.bg,
    categoryBgRGB: brokerCat.rgb,
    title: "Client Success Story",
    description: "Share an anonymised client win to build social proof",
    content: `🏆 ANOTHER FAMILY SECURED. ANOTHER DREAM PROTECTED.\n\nWe love sharing these moments — with full permission, of course. 😊\n\nMeet [Client First Name], a [profession/business owner] from [city], who came to ${biz} just [X months/years] ago:\n\n❌ No life cover\n❌ No retirement savings\n❌ No will or estate plan\n❌ Three different debts eating into their monthly income\n\nToday:\n✅ R[X] million in life cover — family fully protected\n✅ R[X,000] per month flowing into a diversified investment portfolio\n✅ Will and estate plan completed and signed\n✅ Debt consolidated — saving R[X,000] per month\n\n"I wish I'd done this 10 years ago. ${biz} changed everything for us." — [Client Name]\n\nEvery South African deserves this kind of financial security. It's not just for the wealthy — it's for anyone ready to take the first step.\n\n📞 Your success story starts with a FREE consultation. Book today.\n\n👇 Comment "SUCCESS" or DM us — let's write YOUR story next!\n\n#ClientSuccess #FinancialPlanning #Testimonial #${biz.replace(/\s+/g, "")} #SouthAfrica #FinancialFreedom`,
    tags: ["#ClientSuccess", "#FinancialPlanning", "#Testimonial", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-client-success.jpg",
  });

  // ─── OUR STORY (static fallbacks — site-specific ones added by generateSiteTemplates) ───
  const storyCat = getCategory("Our Story");

  templates.push({
    id: "story-origin",
    category: "Our Story",
    categoryIcon: Users,
    categoryColor: storyCat.color,
    categoryBg: storyCat.bg,
    categoryBgRGB: storyCat.rgb,
    title: "How We Started",
    description: "Share the origin story of your business",
    content: `📖 THE STORY BEHIND ${biz.toUpperCase()}\n\nEvery great business starts with a moment — a spark, a problem worth solving, a dream worth chasing.\n\nOurs started with [your founding story: e.g. "a simple belief that local businesses deserved better tools and support."].\n\nWe've grown from [humble beginning] to [where you are today], and every step of that journey has been shaped by the people we serve — our incredible customers and community.\n\nWe're not just a business. We're part of YOUR story. 🙏\n\n💬 Tell us — what made you first discover ${biz}? We'd love to know!\n\n#OurStory #BehindTheBusiness #${biz.replace(/\s+/g, "")} #SouthAfrica #Entrepreneur #SmallBusiness`,
    tags: ["#OurStory", "#BehindTheBusiness", "#Entrepreneur", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-our-story-origin.jpg",
  });

  templates.push({
    id: "story-values",
    category: "Our Story",
    categoryIcon: Users,
    categoryColor: storyCat.color,
    categoryBg: storyCat.bg,
    categoryBgRGB: storyCat.rgb,
    title: "Our Values & Vision",
    description: "Share what your business stands for",
    content: `💜 WHAT WE BELIEVE IN — The Heart of ${biz}\n\nBehind every product and service we offer, there are values that guide everything we do:\n\n🤝 People First — Our customers are never just transactions. You matter to us.\n✅ Quality Without Compromise — We refuse to cut corners. Ever.\n🌍 Community Over Competition — We believe a rising tide lifts all boats.\n💡 Constant Growth — We never stop learning, improving, and innovating.\n🇿🇦 Proudly South African — Built here. For here.\n\nThese aren't just words on a wall. They're decisions we make every single day.\n\nWe're proud of what ${biz} stands for — and we're grateful you're part of our journey. 🙏\n\n💬 Which value resonates most with you? Comment below!\n\n#OurValues #BusinessVision #WhyWeDoIt #${biz.replace(/\s+/g, "")} #SouthAfrica #PurposeDriven`,
    tags: ["#OurValues", "#BusinessVision", "#SouthAfrica", "#PurposeDriven"],
    mockImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-our-values.jpg",
  });

  templates.push({
    id: "story-team",
    category: "Our Story",
    categoryIcon: Users,
    categoryColor: storyCat.color,
    categoryBg: storyCat.bg,
    categoryBgRGB: storyCat.rgb,
    title: "Meet the Team",
    description: "Put a human face on your business",
    content: `👋 MEET THE PEOPLE BEHIND ${biz.toUpperCase()}!\n\nWe believe in the power of people — and we want you to know WHO is working hard for you every day.\n\n[Team Member 1 — Name, Role]: "[Short quote about what they love about their work]"\n[Team Member 2 — Name, Role]: "[Short quote]"\n[Team Member 3 — Name, Role]: "[Short quote]"\n\nThis team is the reason ${biz} delivers the way it does. Every win, every 5-star review, every happy customer — it belongs to them. 💪\n\nWe're more than a company. We're a family — and that family includes YOU, our customers. 🏡\n\n💬 Tag a teammate or business partner who inspires you!\n\n#MeetTheTeam #OurPeople #BehindTheBusiness #${biz.replace(/\s+/g, "")} #SmallBusiness #SouthAfrica`,
    tags: ["#MeetTheTeam", "#OurPeople", "#BehindTheBusiness", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-meet-team.jpg",
  });

  // ─── MILESTONES (static fallbacks) ────────────────────────────────────────────
  const milestoneCat = getCategory("Milestones");

  templates.push({
    id: "milestone-anniversary",
    category: "Milestones",
    categoryIcon: Star,
    categoryColor: milestoneCat.color,
    categoryBg: milestoneCat.bg,
    categoryBgRGB: milestoneCat.rgb,
    title: "Business Anniversary",
    description: "Celebrate a business birthday or founding anniversary",
    content: `🎂 WE'RE CELEBRATING — AND YOU'RE INVITED!\n\n${biz} is turning [X] years old — and honestly, we're a little emotional about it. 🥲\n\nWhen we started, we had a simple dream: [your founding vision]. Today, [X] years later, that dream has grown into something far bigger than we ever imagined — thanks entirely to YOU.\n\nIn [X] years, we've:\n🏆 Served [X]+ incredible clients\n💼 Built a team of passionate people\n📦 Delivered [X]+ products/projects\n🌍 Grown from [starting point] to [where you are now]\n\n🎁 To say THANK YOU, we're celebrating with a [special offer/giveaway/anniversary deal] this week only!\n\nTo every single person who has trusted us, recommended us, or simply given us a chance — THANK YOU. You are the reason we do this. 💜\n\n#BusinessAnniversary #Milestone #Celebrating #${biz.replace(/\s+/g, "")} #Grateful #SouthAfrica`,
    tags: ["#BusinessAnniversary", "#Milestone", "#Celebrating", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-anniversary.jpg",
  });

  templates.push({
    id: "milestone-achievement",
    category: "Milestones",
    categoryIcon: Award,
    categoryColor: milestoneCat.color,
    categoryBg: milestoneCat.bg,
    categoryBgRGB: milestoneCat.rgb,
    title: "Big Achievement Unlocked",
    description: "Announce a major business win or milestone",
    content: `🏆 WE DID IT — AND WE HAD TO SHARE THIS WITH YOU!\n\n${biz} just hit [major milestone — e.g. 1,000 customers / R1M in revenue / 5-star rating / industry award / new location]!\n\nWhen we started this journey, reaching this point felt like a distant dream. Today, it's our reality — and we owe it entirely to this incredible community.\n\n🎯 What this milestone means:\n→ [What it represents for your business]\n→ [What it means for your customers]\n→ [What's coming next]\n\nThis is just the beginning. The best is still ahead. 🚀\n\nThank you for believing in us before we were big. Thank you for growing with us. Thank you for being YOU. 💜\n\n💬 Drop a 🎉 in the comments to celebrate with us!\n\n#Achievement #MilestoneAlert #${biz.replace(/\s+/g, "")} #Winning #GrowthMindset #SouthAfrica`,
    tags: ["#Achievement", "#MilestoneAlert", "#GrowthMindset", "#SouthAfrica"],
    mockImage: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&q=80&w=600",
    templateImage: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&q=80&w=1200",
    templateImageName: "template-achievement.jpg",
  });

  return templates;
}

function generateSiteTemplates(site: SiteConfig): PostTemplate[] {
  const templates: PostTemplate[] = [];
  const biz = site.businessName || "our business";

  const hero = site.sections.find(s => s.type === "hero" && s.enabled)?.data as HeroData | undefined;
  const servicesSection = site.sections.find(s => s.type === "services" && s.enabled)?.data as ServicesData | undefined;
  const aboutSection = site.sections.find(s => s.type === "about" && s.enabled)?.data as AboutData | undefined;
  const testimonialsSection = site.sections.find(s => s.type === "testimonials" && s.enabled)?.data as TestimonialsData | undefined;
  const statsSection = site.sections.find(s => s.type === "stats" && s.enabled)?.data as StatsData | undefined;
  const contactSection = site.sections.find(s => s.type === "contact" && s.enabled)?.data as ContactData | undefined;
  const featuresSection = site.sections.find(s => s.type === "features" && s.enabled)?.data;

  if (hero) {
    const cat = getCategory("Introduction");
    templates.push({
      id: "intro-1",
      category: "Introduction",
      categoryIcon: Building2,
      categoryColor: cat.color,
      categoryBg: cat.bg,
      categoryBgRGB: cat.rgb,
      title: "Meet Our Business",
      description: `Introduce ${biz} to your audience`,
      content: `👋 Introducing ${biz}!\n\n${hero.subtitle || hero.title || "We're here to serve you."}\n\n${hero.ctaPrimaryText ? `${hero.ctaPrimaryText} today — ` : ""}we'd love to work with you.\n\n#SmallBusiness #${biz.replace(/\s+/g, "")} #SouthAfrica #SMME`,
      tags: ["#SmallBusiness", "#SMME", "#SouthAfrica"],      mockImage: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&q=80&w=600",
      templateImage: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&q=80&w=1200",
      templateImageName: "template-meet-business.jpg",
    });

    templates.push({
      id: "intro-2",
      category: "Introduction",
      categoryIcon: Building2,
      categoryColor: cat.color,
      categoryBg: cat.bg,
      categoryBgRGB: cat.rgb,
      title: "What We Do",
      description: `Explain what ${biz} offers`,
      content: `✨ At ${biz}, we believe in making a difference.\n\n${hero.subtitle || "We offer top-quality products and services tailored to your needs."}\n\nGet in touch — we're ready to help!\n\n#${biz.replace(/\s+/g, "")} #BusinessGrowth #ShopLocal`,
      tags: ["#BusinessGrowth", "#ShopLocal"],
      mockImage: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&q=80&w=600",
      templateImage: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&q=80&w=1200",
      templateImageName: "template-what-we-do.jpg",
    });
  }

  if (servicesSection?.items?.length) {
    const catSvc = getCategory("Services");
    const serviceImages = [
      { mock: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600', tmpl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200' },
      { mock: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600', tmpl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200' },
      { mock: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600', tmpl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200' },
      { mock: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=600', tmpl: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=1200' },
    ];
    servicesSection.items.slice(0, 4).forEach((service, i) => {
      templates.push({
        id: `service-${i}`,
        category: "Services",
        categoryIcon: Tag,
        categoryColor: catSvc.color,
        categoryBg: catSvc.bg,
        categoryBgRGB: catSvc.rgb,
        title: `Spotlight: ${service.title}`,
        description: `Promote service: ${service.title}`,
        content: `🌟 Service Spotlight: ${service.title}\n\n${service.desc || "One of our most popular offerings."}\n\n${service.price ? `Starting from ${service.price} — ` : ""}Contact ${biz} today to learn more!\n\n#${biz.replace(/\s+/g, "")} #Services #SouthAfrica #SMME`,
        tags: ["#Services", "#SMME"],
        mockImage: serviceImages[i % serviceImages.length].mock,
        templateImage: serviceImages[i % serviceImages.length].tmpl,
        templateImageName: `template-service-${i}.jpg`,
      });
    });

    if (servicesSection.items.length > 1) {
      const serviceList = servicesSection.items.slice(0, 5).map(s => `• ${s.title}${s.price ? ` — ${s.price}` : ""}`).join("\n");
      templates.push({
        id: "services-all",
        category: "Services",
        categoryIcon: Tag,
        categoryColor: catSvc.color,
        categoryBg: catSvc.bg,
        categoryBgRGB: catSvc.rgb,
        title: "All Our Services",
        description: "Showcase all offerings",
        content: `💼 Here's what we offer at ${biz}:\n\n${serviceList}\n\nReady to get started? Reach out to us today!\n\n#${biz.replace(/\s+/g, "")} #Services #BusinessGrowth #ShopLocal`,
        tags: ["#Services", "#ShopLocal"],
        mockImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
        templateImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200",
        templateImageName: "template-all-services.jpg",
      });
    }
  }

  if (aboutSection) {
    const catStory = getCategory("Our Story");
    const storyText = aboutSection.quote || (aboutSection.items?.[0]?.desc) || "";
    templates.push({
      id: "about-1",
      category: "Our Story",
      categoryIcon: Users,
      categoryColor: catStory.color,
      categoryBg: catStory.bg,
      categoryBgRGB: catStory.rgb,
      title: "Our Story",
      description: "Share your business journey",
      content: `📖 The Story Behind ${biz}\n\n${storyText || "Every business has a story. Ours is built on passion, hard work, and dedication to our customers."}\n\nWe're proud of where we've come from and excited about where we're going. Thank you for being part of our journey! 🙏\n\n#OurStory #${biz.replace(/\s+/g, "")} #SouthAfrica #Entrepreneur`,
      tags: ["#OurStory", "#Entrepreneur"],
      mockImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
      templateImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
      templateImageName: "template-our-story.jpg",
    });

    if (aboutSection.items?.length > 0) {
      templates.push({
        id: "about-2",
        category: "Our Story",
        categoryIcon: Users,
        categoryColor: catStory.color,
        categoryBg: catStory.bg,
        categoryBgRGB: catStory.rgb,
        title: "Why Choose Us",
        description: "Highlight your unique value proposition",
        content: `💪 Why choose ${biz}?\n\n${aboutSection.items.slice(0, 3).map(item => `✅ ${item.title}: ${item.desc}`).join("\n\n")}\n\nDiscover the difference — reach out today!\n\n#WhyChooseUs #${biz.replace(/\s+/g, "")} #QualityService`,
        tags: ["#WhyChooseUs", "#QualityService"],
        mockImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600",
        templateImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1200",
        templateImageName: "template-why-choose-us.jpg",
      });
    }
  }

  if (featuresSection?.items?.length) {
    const catFeat = getCategory("Features");
    templates.push({
      id: "features-1",
      category: "Features",
      categoryIcon: Sparkles,
      categoryColor: catFeat.color,
      categoryBg: catFeat.bg,
      categoryBgRGB: catFeat.rgb,
      title: "What Makes Us Different",
      description: "Emphasize your unique features",
      content: `⭐ What sets ${biz} apart?\n\n${featuresSection.items.slice(0, 3).map((f: any) => `🔹 ${f.title}: ${f.desc}`).join("\n\n")}\n\nExperience the ${biz} difference today.\n\n#Excellence #${biz.replace(/\s+/g, "")} #BusinessGrowth`,
      tags: ["#Excellence", "#BusinessGrowth"],
      mockImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=600",
      templateImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=1200",
      templateImageName: "template-what-makes-different.jpg",
    });
  }

  if (testimonialsSection?.items?.length) {
    const catTest = getCategory("Testimonials");
    const testimonialImages = [
      { mockImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600", templateImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200" },
      { mockImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=600", templateImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=1200" },
    ];
    testimonialsSection.items.slice(0, 2).forEach((t, i) => {
      templates.push({
        id: `testimonial-${i}`,
        category: "Testimonials",
        categoryIcon: Star,
        categoryColor: catTest.color,
        categoryBg: catTest.bg,
        categoryBgRGB: catTest.rgb,
        title: `Review from ${t.name}`,
        description: `Customer testimonial: ${t.name}`,
        content: `⭐ What our customers say about ${biz}:\n\n"${t.text}"\n— ${t.name}${t.role ? `, ${t.role}` : ""}\n\nWe love hearing from our customers! Share your experience with us.\n\n#CustomerLove #${biz.replace(/\s+/g, "")} #Testimonial #SouthAfrica`,
        tags: ["#CustomerLove", "#Testimonial"],
        mockImage: testimonialImages[i % 2].mockImage,
        templateImage: testimonialImages[i % 2].templateImage,
        templateImageName: `template-testimonial-${i}.jpg`,
      });
    });
  }

  if (statsSection?.items?.length) {
    const catMile = getCategory("Milestones");
    const statsList = statsSection.items.map(s => `📊 ${s.value} ${s.label}`).join("\n");
    templates.push({
      id: "stats-1",
      category: "Milestones",
      categoryIcon: BarChart3,
      categoryColor: catMile.color,
      categoryBg: catMile.bg,
      categoryBgRGB: catMile.rgb,
      title: "Our Achievements",
      description: "Celebrate your milestones",
      content: `🎉 Celebrating milestones at ${biz}!\n\n${statsList}\n\nNone of this would be possible without our amazing customers. Thank you! 🙌\n\n#Milestones #${biz.replace(/\s+/g, "")} #Grateful #Entrepreneur`,
      tags: ["#Milestones", "#Grateful"],
      mockImage: "https://images.unsplash.com/photo-1521791055366-0d553872952f?auto=format&fit=crop&q=80&w=600",
      templateImage: "https://images.unsplash.com/photo-1521791055366-0d553872952f?auto=format&fit=crop&q=80&w=1200",
      templateImageName: "template-achievements.jpg",
    });
  }

  if (contactSection) {
    const catCont = getCategory("Contact");
    const contactLines = [
      contactSection.email ? `📧 ${contactSection.email}` : null,
      contactSection.phone ? `📞 ${contactSection.phone}` : null,
      contactSection.whatsapp ? `💬 WhatsApp: ${contactSection.whatsapp}` : null,
      contactSection.address ? `📍 ${contactSection.address}` : null,
    ].filter(Boolean).join("\n");

    templates.push({
      id: "contact-1",
      category: "Contact",
      categoryIcon: Phone,
      categoryColor: catCont.color,
      categoryBg: catCont.bg,
      categoryBgRGB: catCont.rgb,
      title: "Get in Touch",
      description: "Encourage contact and inquiries",
      content: `📣 Ready to work with ${biz}? We'd love to hear from you!\n\n${contactLines || "Reach out and let's chat."}\n\nDon't hesitate — let's make something great together! 💼\n\n#ContactUs #${biz.replace(/\s+/g, "")} #GetInTouch #SouthAfrica`,
      tags: ["#ContactUs", "#GetInTouch"],
      mockImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=600",
      templateImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=1200",
      templateImageName: "template-get-in-touch.jpg",
    });

    templates.push({
      id: "contact-2",
      category: "Contact",
      categoryIcon: Phone,
      categoryColor: catCont.color,
      categoryBg: catCont.bg,
      categoryBgRGB: catCont.rgb,
      title: "Weekend Special CTA",
      description: "Weekly call-to-action post",
      content: `🌟 This week at ${biz}!\n\nLooking for quality ${servicesSection?.items?.[0]?.title || "services"}? You've found the right team.\n\n${contactLines || "Get in touch today."}\n\n#WeekendSpecial #${biz.replace(/\s+/g, "")} #SouthAfrica #ShopLocal`,
      tags: ["#WeekendSpecial", "#ShopLocal"],
      mockImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600",
      templateImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
      templateImageName: "template-weekend-cta.jpg",
    });
  }

  return templates;
}

function generateTemplates(site: SiteConfig | null): PostTemplate[] {
  const biz = site?.businessName || "our business";
  const adTemplates = generateStaticAdTemplates(biz);
  const siteTemplates = site ? generateSiteTemplates(site) : [];
  return [...siteTemplates, ...adTemplates];
}

const DESIGN_TEMPLATES = [
  // — SALES —
  { id: "mega-sale",        name: "Mega Sale 50% OFF",    thumb: "linear-gradient(135deg,#DC2626,#FBBF24)", format: "Instagram Post", tag: "Sale",       designCat: "Sales",      thumbLayout: "sale",         c1: "#DC2626", c2: "#FBBF24", tc: "#FFFFFF" },
  { id: "flash-sale",       name: "Flash Sale 24hrs",     thumb: "linear-gradient(135deg,#1a1a1a,#F97316)", format: "Instagram Post", tag: "Flash",      designCat: "Sales",      thumbLayout: "flash",        c1: "#1a1a1a", c2: "#F97316", tc: "#FFFFFF" },
  { id: "clearance",        name: "Clearance Sale",       thumb: "linear-gradient(135deg,#F97316,#EF4444)", format: "Instagram Post", tag: "Sale",       designCat: "Sales",      thumbLayout: "sale",         c1: "#F97316", c2: "#FFFFFF", tc: "#FFFFFF" },
  { id: "black-friday",     name: "Black Friday",         thumb: "linear-gradient(135deg,#000000,#EAB308)", format: "Instagram Post", tag: "BF Deal",    designCat: "Sales",      thumbLayout: "flash",        c1: "#000000", c2: "#EAB308", tc: "#FFFFFF" },
  { id: "weekend-deal",     name: "Weekend Deal",         thumb: "linear-gradient(135deg,#7C3AED,#EC4899)", format: "Instagram Post", tag: "Deal",       designCat: "Sales",      thumbLayout: "sale",         c1: "#7C3AED", c2: "#F9A8D4", tc: "#FFFFFF" },
  { id: "discount-coupon",  name: "Discount Coupon",      thumb: "linear-gradient(135deg,#FBBF24,#EF4444)", format: "Facebook Post",  tag: "Coupon",     designCat: "Sales",      thumbLayout: "coupon",       c1: "#FBBF24", c2: "#EF4444", tc: "#FFFFFF" },
  { id: "bundle-deal",      name: "Bundle Deal",          thumb: "linear-gradient(135deg,#0F766E,#10B981)", format: "Instagram Post", tag: "Bundle",     designCat: "Sales",      thumbLayout: "sale",         c1: "#0F766E", c2: "#6EE7B7", tc: "#FFFFFF" },
  // — EVENTS —
  { id: "grand-opening",    name: "Grand Opening",        thumb: "linear-gradient(135deg,#7C2D12,#FBBF24)", format: "Instagram Post", tag: "Opening",    designCat: "Events",     thumbLayout: "event",        c1: "#7C2D12", c2: "#FBBF24", tc: "#FFFFFF" },
  { id: "product-launch",   name: "Product Launch",       thumb: "linear-gradient(135deg,#0F172A,#22D3EE)", format: "Instagram Post", tag: "Launch",     designCat: "Events",     thumbLayout: "announcement", c1: "#0F172A", c2: "#22D3EE", tc: "#FFFFFF" },
  { id: "anniversary",      name: "Business Anniversary", thumb: "linear-gradient(135deg,#6D28D9,#FBBF24)", format: "Instagram Post", tag: "Milestone",  designCat: "Events",     thumbLayout: "event",        c1: "#6D28D9", c2: "#FBBF24", tc: "#FFFFFF" },
  { id: "year-end-function",name: "Year-End Function",    thumb: "linear-gradient(135deg,#1e1b4b,#A78BFA)", format: "Instagram Post", tag: "Event",      designCat: "Events",     thumbLayout: "event",        c1: "#1e1b4b", c2: "#A78BFA", tc: "#FFFFFF" },
  { id: "workshop",         name: "Workshop Invite",      thumb: "linear-gradient(135deg,#1E40AF,#60A5FA)", format: "Instagram Post", tag: "Workshop",   designCat: "Events",     thumbLayout: "hiring",       c1: "#1E40AF", c2: "#60A5FA", tc: "#FFFFFF" },
  { id: "webinar",          name: "Free Webinar",         thumb: "linear-gradient(135deg,#312E81,#A78BFA)", format: "Facebook Post",  tag: "Webinar",    designCat: "Events",     thumbLayout: "hiring",       c1: "#312E81", c2: "#A78BFA", tc: "#FFFFFF" },
  { id: "store-event",      name: "In-Store Event",       thumb: "linear-gradient(135deg,#065F46,#34D399)", format: "Instagram Post", tag: "Event",      designCat: "Events",     thumbLayout: "announcement", c1: "#065F46", c2: "#34D399", tc: "#FFFFFF" },
  // — HOLIDAYS —
  { id: "christmas",        name: "Christmas Special",    thumb: "linear-gradient(135deg,#991B1B,#16A34A)", format: "Instagram Post", tag: "Christmas",  designCat: "Holidays",   thumbLayout: "holiday",      c1: "#991B1B", c2: "#FBBF24", tc: "#FFFFFF" },
  { id: "new-year",         name: "New Year Special",     thumb: "linear-gradient(135deg,#1a1a1a,#EAB308)", format: "Instagram Post", tag: "New Year",   designCat: "Holidays",   thumbLayout: "holiday",      c1: "#111827", c2: "#EAB308", tc: "#FFFFFF" },
  { id: "valentines",       name: "Valentine's Day",      thumb: "linear-gradient(135deg,#9F1239,#FDA4AF)", format: "Instagram Post", tag: "Valentine's",designCat: "Holidays",   thumbLayout: "holiday",      c1: "#9F1239", c2: "#FDA4AF", tc: "#FFFFFF" },
  { id: "easter",           name: "Easter Special",       thumb: "linear-gradient(135deg,#6D28D9,#FDE68A)", format: "Instagram Post", tag: "Easter",     designCat: "Holidays",   thumbLayout: "holiday",      c1: "#6D28D9", c2: "#FDE68A", tc: "#FFFFFF" },
  { id: "womens-day",       name: "Women's Day",          thumb: "linear-gradient(135deg,#831843,#FCA5A5)", format: "Instagram Post", tag: "Women's Day",designCat: "Holidays",   thumbLayout: "holiday",      c1: "#831843", c2: "#FCA5A5", tc: "#FFFFFF" },
  { id: "youth-day",        name: "Youth Day",            thumb: "linear-gradient(135deg,#166534,#4ADE80)", format: "Instagram Post", tag: "Youth Day",  designCat: "Holidays",   thumbLayout: "holiday",      c1: "#166534", c2: "#FDE68A", tc: "#FFFFFF" },
  { id: "heritage-day",     name: "Heritage Day",         thumb: "linear-gradient(135deg,#78350F,#FCD34D)", format: "Instagram Post", tag: "Heritage Day",designCat: "Holidays",  thumbLayout: "event",        c1: "#78350F", c2: "#FCD34D", tc: "#FFFFFF" },
  { id: "ramadan",          name: "Ramadan Kareem",       thumb: "linear-gradient(135deg,#134E4A,#FCD34D)", format: "Instagram Post", tag: "Ramadan",    designCat: "Holidays",   thumbLayout: "holiday",      c1: "#134E4A", c2: "#FCD34D", tc: "#FFFFFF" },
  // — FOOD & DINING —
  { id: "daily-special",    name: "Daily Special",        thumb: "linear-gradient(135deg,#92400E,#F59E0B)", format: "Instagram Post", tag: "Food",       designCat: "Food",       thumbLayout: "food",         c1: "#92400E", c2: "#F59E0B", tc: "#FFFFFF" },
  { id: "weekend-brunch",   name: "Weekend Brunch",       thumb: "linear-gradient(135deg,#7C2D12,#FCA5A5)", format: "Instagram Post", tag: "Brunch",     designCat: "Food",       thumbLayout: "food",         c1: "#7C2D12", c2: "#FEF3C7", tc: "#FFFFFF" },
  { id: "happy-hour",       name: "Happy Hour",           thumb: "linear-gradient(135deg,#1a1a1a,#D97706)", format: "Instagram Post", tag: "Happy Hour", designCat: "Food",       thumbLayout: "food",         c1: "#1a1a1a", c2: "#D97706", tc: "#FFFFFF" },
  { id: "menu-launch",      name: "New Menu Launch",      thumb: "linear-gradient(135deg,#064E3B,#6EE7B7)", format: "Instagram Post", tag: "Menu",       designCat: "Food",       thumbLayout: "announcement", c1: "#064E3B", c2: "#6EE7B7", tc: "#FFFFFF" },
  { id: "restaurant-promo", name: "Restaurant Promo",     thumb: "linear-gradient(135deg,#7C2D12,#F59E0B)", format: "Facebook Post",  tag: "Promo",      designCat: "Food",       thumbLayout: "food",         c1: "#7C2D12", c2: "#F59E0B", tc: "#FFFFFF" },
  // — SERVICES —
  { id: "service-promo",    name: "Service Promo",        thumb: "linear-gradient(135deg,#1E40AF,#06B6D4)", format: "Instagram Post", tag: "Services",   designCat: "Services",   thumbLayout: "service",      c1: "#1E40AF", c2: "#06B6D4", tc: "#FFFFFF" },
  { id: "home-cleaning",    name: "Cleaning Services",    thumb: "linear-gradient(135deg,#0369A1,#BAE6FD)", format: "Instagram Post", tag: "Cleaning",   designCat: "Services",   thumbLayout: "service",      c1: "#0369A1", c2: "#7DD3FC", tc: "#FFFFFF" },
  { id: "transport",        name: "Transport & Delivery", thumb: "linear-gradient(135deg,#0F172A,#F97316)", format: "Instagram Post", tag: "Transport",  designCat: "Services",   thumbLayout: "service",      c1: "#0F172A", c2: "#F97316", tc: "#FFFFFF" },
  { id: "coaching",         name: "Business Coaching",    thumb: "linear-gradient(135deg,#4C1D95,#A855F7)", format: "Instagram Post", tag: "Coaching",   designCat: "Services",   thumbLayout: "service",      c1: "#4C1D95", c2: "#C4B5FD", tc: "#FFFFFF" },
  { id: "tech-support",     name: "Tech Support",         thumb: "linear-gradient(135deg,#0F172A,#22D3EE)", format: "Instagram Post", tag: "Tech",       designCat: "Services",   thumbLayout: "service",      c1: "#0F172A", c2: "#22D3EE", tc: "#FFFFFF" },
  // — BEAUTY —
  { id: "beauty-salon",     name: "Salon Promo",          thumb: "linear-gradient(135deg,#831843,#F472B6)", format: "Instagram Post", tag: "Beauty",     designCat: "Beauty",     thumbLayout: "beauty",       c1: "#831843", c2: "#FBB6CE", tc: "#FFFFFF" },
  { id: "spa-day",          name: "Spa Day Special",      thumb: "linear-gradient(135deg,#9F1239,#FBCFE8)", format: "Instagram Post", tag: "Spa",        designCat: "Beauty",     thumbLayout: "beauty",       c1: "#9F1239", c2: "#FBCFE8", tc: "#FFFFFF" },
  { id: "nail-special",     name: "Nail Special",         thumb: "linear-gradient(135deg,#6D28D9,#F9A8D4)", format: "Instagram Post", tag: "Nails",      designCat: "Beauty",     thumbLayout: "beauty",       c1: "#6D28D9", c2: "#F9A8D4", tc: "#FFFFFF" },
  { id: "beauty-arrivals",  name: "New Beauty Arrivals",  thumb: "linear-gradient(135deg,#1a1a1a,#EC4899)", format: "Instagram Post", tag: "New In",     designCat: "Beauty",     thumbLayout: "announcement", c1: "#1a1a1a", c2: "#EC4899", tc: "#FFFFFF" },
  // — FITNESS —
  { id: "gym-promo",        name: "Gym Membership",       thumb: "linear-gradient(135deg,#000000,#22C55E)", format: "Instagram Post", tag: "Fitness",    designCat: "Fitness",    thumbLayout: "fitness",      c1: "#000000", c2: "#22C55E", tc: "#FFFFFF" },
  { id: "personal-training",name: "Personal Training",    thumb: "linear-gradient(135deg,#1a1a1a,#F97316)", format: "Instagram Post", tag: "Training",   designCat: "Fitness",    thumbLayout: "fitness",      c1: "#111827", c2: "#F97316", tc: "#FFFFFF" },
  { id: "fitness-challenge",name: "30-Day Challenge",     thumb: "linear-gradient(135deg,#1a1a1a,#06B6D4)", format: "Instagram Post", tag: "Challenge",  designCat: "Fitness",    thumbLayout: "fitness",      c1: "#0F172A", c2: "#06B6D4", tc: "#FFFFFF" },
  // — PROPERTY —
  { id: "for-sale",         name: "Property For Sale",    thumb: "linear-gradient(135deg,#0F172A,#1E40AF)", format: "Instagram Post", tag: "For Sale",   designCat: "Property",   thumbLayout: "property",     c1: "#0F172A", c2: "#60A5FA", tc: "#FFFFFF" },
  { id: "for-rent",         name: "For Rent",             thumb: "linear-gradient(135deg,#1a1a1a,#0F766E)", format: "Instagram Post", tag: "For Rent",   designCat: "Property",   thumbLayout: "property",     c1: "#111827", c2: "#2DD4BF", tc: "#FFFFFF" },
  { id: "open-house",       name: "Open House",           thumb: "linear-gradient(135deg,#7C2D12,#FCD34D)", format: "Instagram Post", tag: "Open House", designCat: "Property",   thumbLayout: "property",     c1: "#7C2D12", c2: "#FCD34D", tc: "#FFFFFF" },
  // — MOTIVATION —
  { id: "inspiring-quote",  name: "Inspiring Quote",      thumb: "linear-gradient(135deg,#1F2937,#0EA5E9)", format: "Instagram Post", tag: "Quote",      designCat: "Motivation", thumbLayout: "quote",        c1: "#1F2937", c2: "#0EA5E9", tc: "#FFFFFF" },
  { id: "monday-motivation",name: "Monday Motivation",    thumb: "linear-gradient(135deg,#1e1b4b,#A78BFA)", format: "Instagram Post", tag: "Motivation", designCat: "Motivation", thumbLayout: "quote",        c1: "#1e1b4b", c2: "#A78BFA", tc: "#FFFFFF" },
  { id: "business-tips",    name: "Business Tips",        thumb: "linear-gradient(135deg,#134E4A,#6EE7B7)", format: "Instagram Post", tag: "Tips",       designCat: "Motivation", thumbLayout: "quote",        c1: "#134E4A", c2: "#6EE7B7", tc: "#FFFFFF" },
  { id: "thank-you",        name: "Thank You Post",       thumb: "linear-gradient(135deg,#7C2D12,#FBBF24)", format: "Instagram Post", tag: "Thank You",  designCat: "Motivation", thumbLayout: "event",        c1: "#7C2D12", c2: "#FBBF24", tc: "#FFFFFF" },
  // — CORPORATE —
  { id: "we-are-hiring",    name: "We're Hiring",         thumb: "linear-gradient(135deg,#1E40AF,#E0E7FF)", format: "Instagram Post", tag: "Hiring",     designCat: "Corporate",  thumbLayout: "hiring",       c1: "#1E40AF", c2: "#93C5FD", tc: "#FFFFFF" },
  { id: "quarterly-results",name: "Quarterly Results",    thumb: "linear-gradient(135deg,#0F172A,#3B82F6)", format: "Instagram Post", tag: "Corporate",  designCat: "Corporate",  thumbLayout: "corporate",    c1: "#0F172A", c2: "#3B82F6", tc: "#FFFFFF" },
  { id: "client-testimonial",name:"Client Testimonial",   thumb: "linear-gradient(135deg,#F8FAFC,#1E293B)", format: "Instagram Post", tag: "Review",     designCat: "Corporate",  thumbLayout: "testimonial",  c1: "#F8FAFC", c2: "#F59E0B", tc: "#111827" },
  { id: "csr-initiative",   name: "CSR Initiative",       thumb: "linear-gradient(135deg,#14532D,#22C55E)", format: "Instagram Post", tag: "CSR",        designCat: "Corporate",  thumbLayout: "corporate",    c1: "#14532D", c2: "#4ADE80", tc: "#FFFFFF" },
  { id: "award-won",        name: "Award Announcement",   thumb: "linear-gradient(135deg,#0F172A,#EAB308)", format: "Instagram Post", tag: "Award",      designCat: "Corporate",  thumbLayout: "announcement", c1: "#0F172A", c2: "#EAB308", tc: "#FFFFFF" },
];

interface DesignTemplate {
  id: string; name: string; thumb: string; format: string; tag: string;
  designCat: string; thumbLayout: string; c1: string; c2: string; tc: string;
}

function DesignThumb({ dt }: { dt: DesignTemplate }) {
  const { thumbLayout: layout, thumb, c1, c2, tc } = dt;
  const light = tc === "#FFFFFF";
  const txt   = light ? "text-white" : "text-gray-900";
  const dim   = light ? "text-white/60" : "text-gray-500";
  const base  = "absolute inset-0";

  if (layout === "sale") return (
    <div className={`${base} flex flex-col`} style={{ background: thumb }}>
      <div className="px-2.5 pt-2.5 flex items-center justify-between">
        <span className={`text-[8px] font-bold uppercase tracking-widest ${dim}`}>{dt.designCat}</span>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: c2, color: c1 }}>{dt.tag}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center border-4 border-white/40 bg-white/15">
          <span className="text-2xl font-black leading-none text-white">50%</span>
          <span className="text-[9px] font-bold text-white/80">OFF</span>
        </div>
      </div>
      <div className="h-8 bg-black/25 flex items-center justify-center">
        <span className="text-[9px] font-black text-white tracking-widest">SHOP NOW</span>
      </div>
    </div>
  );

  if (layout === "flash") return (
    <div className={`${base} overflow-hidden flex flex-col`} style={{ background: thumb }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full opacity-15" style={{ background: c2, transform: "skewY(-18deg)", top: "10%" }} />
      </div>
      <div className="relative z-10 flex flex-col h-full px-3.5 py-3">
        <span className={`text-[8px] font-bold uppercase tracking-wider ${dim} mb-0.5`}>Limited time only</span>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-3xl font-black text-white leading-none">24HR</div>
          <div className="text-xl font-black leading-tight" style={{ color: c2 }}>ONLY</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-px" style={{ background: c2 }} />
          <span className="text-[8px] font-bold tracking-wider" style={{ color: c2 }}>FLASH SALE</span>
        </div>
      </div>
    </div>
  );

  if (layout === "coupon") return (
    <div className={`${base} flex flex-col`} style={{ background: thumb }}>
      <div className="flex-1 flex flex-row">
        <div className="flex-1 flex flex-col items-center justify-center border-r-2 border-dashed border-white/35">
          <span className="text-5xl font-black leading-none text-white">30%</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 mt-0.5">Discount</span>
        </div>
        <div className="w-[88px] flex flex-col justify-center px-2.5 gap-1.5">
          <span className="text-[9px] font-bold text-white uppercase">Special offer</span>
          <div className="h-5 rounded border border-white/35 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">SAVE30</span>
          </div>
          <span className="text-[7px] text-white/50">Use at checkout</span>
        </div>
      </div>
      <div className="h-7 bg-black/25 flex items-center justify-center">
        <span className="text-[9px] font-bold text-white tracking-wider">REDEEM NOW</span>
      </div>
    </div>
  );

  if (layout === "event") return (
    <div className={`${base} flex flex-col items-center justify-center`} style={{ background: thumb }}>
      {([[8,8],[162,8],[8,144],[162,144]] as [number,number][]).map(([x,y], i) => (
        <div key={i} className="absolute w-3.5 h-3.5" style={{ left: x, top: y, background: c2,
          clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }} />
      ))}
      <div className="absolute inset-2 border rounded-xl" style={{ borderColor: `${c2}50` }} />
      <div className="flex flex-col items-center gap-1 relative z-10">
        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{ background: c2, color: c1 }}>{dt.tag}</span>
        <div className="text-base font-black uppercase text-white leading-tight text-center mt-0.5">EVENT<br/>NAME</div>
        <div className="h-0.5 w-14 my-0.5" style={{ background: `${c2}80` }} />
        <span className="text-[8px] text-white/60">Saturday · 10 AM</span>
      </div>
    </div>
  );

  if (layout === "announcement") return (
    <div className={`${base} flex flex-col`} style={{ background: thumb }}>
      <div className="h-1" style={{ background: c2 }} />
      <div className="flex-1 flex flex-col items-center justify-center px-3 gap-1.5">
        <span className={`text-[8px] font-bold uppercase tracking-widest ${dim}`}>{dt.tag}</span>
        <div className={`text-base font-black text-center uppercase leading-tight ${txt}`}>NEW<br/>ARRIVAL</div>
        <div className="h-0.5 w-12" style={{ background: c2 }} />
        <span className={`text-[8px] ${dim} text-center`}>Available now</span>
      </div>
      <div className="h-8 flex items-center justify-center" style={{ background: `${c2}25` }}>
        <span className="text-[9px] font-black tracking-wider" style={{ color: c2 }}>DISCOVER MORE →</span>
      </div>
    </div>
  );

  if (layout === "food") return (
    <div className={`${base} flex flex-col`} style={{ background: thumb }}>
      <div className="px-2.5 pt-2.5">
        <span className="text-[8px] font-bold text-white/70 uppercase tracking-wider">Today's Special</span>
      </div>
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-[66px] h-[66px] rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10" />
        </div>
        <div className="absolute bottom-1.5 right-6 w-[44px] h-[44px] rounded-full flex flex-col items-center justify-center" style={{ background: c2 }}>
          <span className="text-[8px] font-bold leading-none" style={{ color: c1 }}>ONLY</span>
          <span className="text-[12px] font-black leading-tight" style={{ color: c1 }}>R149</span>
        </div>
      </div>
      <div className="h-7 bg-black/20 flex items-center justify-center">
        <span className="text-[9px] font-bold text-white tracking-wider">ORDER NOW</span>
      </div>
    </div>
  );

  if (layout === "service") return (
    <div className={`${base} flex flex-col px-3 py-2.5`} style={{ background: thumb }}>
      <div className="mb-2">
        <span className={`text-[9px] font-black uppercase tracking-wider ${txt}`}>Services</span>
        <div className="h-0.5 w-8 mt-0.5" style={{ background: c2 }} />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-2">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c2 }} />
            <div className={`h-1.5 rounded-full ${light ? "bg-white/40" : "bg-black/20"}`} style={{ width: `${70 - i * 10}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 h-6 rounded-full flex items-center justify-center" style={{ background: c2 }}>
        <span className="text-[9px] font-bold" style={{ color: c1 }}>GET A QUOTE</span>
      </div>
    </div>
  );

  if (layout === "beauty") return (
    <div className={`${base} flex flex-col items-center justify-center`} style={{ background: thumb }}>
      {([[10,10],[172,10],[10,150],[172,150]] as [number,number][]).map(([x,y], i) => (
        <div key={i} className="absolute w-5 h-5 rounded-full opacity-35" style={{ left: x, top: y, background: c2 }} />
      ))}
      <div className="absolute inset-3 border rounded-xl opacity-30" style={{ borderColor: c2 }} />
      <div className="flex flex-col items-center gap-1.5 relative z-10">
        <div className="w-9 h-9 rounded-full border-2" style={{ borderColor: `${c2}80`, background: `${c2}20` }} />
        <span className={`text-[11px] font-black uppercase tracking-widest ${txt}`}>Beauty</span>
        <span className={`text-[8px] uppercase tracking-widest ${dim}`}>& Salon</span>
        <div className="h-px w-14" style={{ background: light ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.15)" }} />
        <div className="px-3 py-1 rounded-full text-[8px] font-bold mt-0.5" style={{ background: c2, color: light ? c1 : "#FFFFFF" }}>BOOK NOW</div>
      </div>
    </div>
  );

  if (layout === "fitness") return (
    <div className={`${base} overflow-hidden`} style={{ background: thumb }}>
      <div className="absolute bottom-0 left-0 right-0 h-[38px]" style={{ background: c2 }} />
      <div className="absolute inset-0 flex flex-col justify-center px-4" style={{ paddingBottom: "38px" }}>
        <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Get stronger</span>
        <div className="text-3xl font-black text-white leading-none uppercase">TRAIN</div>
        <div className="text-xl font-black leading-tight uppercase" style={{ color: c2 }}>HARDER</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[38px] flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: c1 === "#000000" || c1 === "#111827" || c1 === "#0F172A" ? "#000" : "#fff" }}>JOIN TODAY</span>
      </div>
    </div>
  );

  if (layout === "property") return (
    <div className={`${base} flex flex-col`} style={{ background: thumb }}>
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
        <div className="relative w-[54px] h-[48px]">
          <div className="absolute top-0 left-0 right-0"
            style={{ height: 0, borderLeft: "27px solid transparent", borderRight: "27px solid transparent", borderBottom: `22px solid ${c2}` }} />
          <div className="absolute bottom-0 left-[5px] right-[5px] h-[26px] rounded-sm" style={{ background: `${c2}88` }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[10px] h-[16px] rounded-t-sm" style={{ background: `${c1}aa` }} />
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-wider">{dt.tag}</span>
      </div>
      <div className="h-9 flex items-center justify-center" style={{ background: c2 }}>
        <span className="text-[11px] font-black" style={{ color: c1 }}>R 2 500 000</span>
      </div>
    </div>
  );

  if (layout === "quote") return (
    <div className={`${base} flex flex-col`} style={{ background: thumb }}>
      <div className="absolute inset-2 border rounded-lg opacity-20" style={{ borderColor: c2 }} />
      <div className="relative z-10 px-3 pt-1">
        <span className="text-5xl font-serif leading-none" style={{ color: `${c2}70` }}>"</span>
      </div>
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 gap-1.5 -mt-3">
        <div className={`h-1.5 rounded-full ${light ? "bg-white/55" : "bg-black/25"}`} />
        <div className={`h-1.5 w-5/6 rounded-full ${light ? "bg-white/45" : "bg-black/20"}`} />
        <div className={`h-1.5 w-4/6 rounded-full ${light ? "bg-white/35" : "bg-black/10"}`} />
      </div>
      <div className="relative z-10 px-4 pb-3 flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: light ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)" }} />
        <span className="text-[8px] font-bold" style={{ color: c2 }}>YOUR BRAND</span>
      </div>
    </div>
  );

  if (layout === "hiring") return (
    <div className={`${base} flex flex-col px-3 py-2.5`} style={{ background: thumb }}>
      <span className="self-start inline-block px-2 py-0.5 rounded-full text-[8px] font-bold mb-2" style={{ background: c2, color: c1 }}>NOW HIRING</span>
      <div className={`text-base font-black uppercase leading-tight ${txt}`}>Join<br/>Our Team</div>
      <div className="flex-1 flex flex-col justify-center gap-1.5 mt-2">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c2 }} />
            <div className={`h-1 rounded-full flex-1 ${light ? "bg-white/35" : "bg-black/15"}`} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 h-5 rounded-full flex items-center justify-center text-[8px] font-black" style={{ background: `${c2}30`, color: c2 }}>APPLY NOW →</div>
    </div>
  );

  if (layout === "corporate") return (
    <div className={`${base} flex flex-col`} style={{ background: thumb }}>
      <div className="h-1" style={{ background: c2 }} />
      <div className="flex-1 flex flex-col items-center justify-center px-3 gap-1">
        <span className={`text-[8px] font-semibold uppercase tracking-widest ${dim}`}>{dt.tag}</span>
        <span className="text-3xl font-black" style={{ color: c2 }}>98%</span>
        <span className={`text-[8px] ${dim} text-center`}>Client satisfaction</span>
        <div className="h-px w-14 mt-0.5" style={{ background: light ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }} />
        <span className={`text-[8px] font-bold ${txt}`}>YOUR BRAND</span>
      </div>
      <div className="h-1" style={{ background: `${c2}60` }} />
    </div>
  );

  if (layout === "testimonial") return (
    <div className={`${base} flex flex-col px-3 py-3`} style={{ background: thumb }}>
      <div className="flex gap-0.5 mb-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="w-2.5 h-2.5"
            style={{ background: c2, clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }} />
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className={`h-1.5 rounded-full ${light ? "bg-white/55" : "bg-black/20"}`} />
        <div className={`h-1.5 w-5/6 rounded-full ${light ? "bg-white/45" : "bg-black/15"}`} />
        <div className={`h-1.5 w-4/6 rounded-full ${light ? "bg-white/35" : "bg-black/10"}`} />
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: c2 }} />
        <div className="flex flex-col gap-0.5">
          <div className={`h-1 w-14 rounded-full ${light ? "bg-white/50" : "bg-black/20"}`} />
          <div className={`h-1 w-10 rounded-full ${light ? "bg-white/30" : "bg-black/10"}`} />
        </div>
      </div>
    </div>
  );

  if (layout === "holiday") return (
    <div className={`${base} flex flex-col items-center justify-center`} style={{ background: thumb }}>
      {([[6,6],[174,6],[6,150],[174,150],[90,4]] as [number,number][]).map(([x,y], i) => (
        <div key={i} className="absolute w-[14px] h-[14px]"
          style={{ left: x, top: y, background: c2, opacity: i > 3 ? 0.6 : 1,
            clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }} />
      ))}
      <div className="absolute inset-2 border rounded-xl" style={{ borderColor: `${c2}50` }} />
      <div className="flex flex-col items-center gap-1 relative z-10">
        <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Season's Greetings</span>
        <div className="text-sm font-black uppercase text-center leading-tight text-white">Happy<br/>Holidays!</div>
        <div className="h-0.5 w-14 my-0.5" style={{ background: c2 }} />
        <div className="px-3 py-0.5 rounded-full text-[8px] font-bold" style={{ background: c2, color: c1 }}>SPECIAL OFFER</div>
      </div>
    </div>
  );

  return (
    <div className={`${base} flex flex-col items-center justify-center px-2`} style={{ background: thumb }}>
      <div className={`text-[10px] font-bold text-center ${txt}`}>{dt.name}</div>
    </div>
  );
}

const CATEGORY_ORDER = [
  "Introduction", "Services", "Our Story", "Features", "Testimonials",
  "Milestones", "Contact", "Advertising", "Promotions", "Tips & Value", "Engagement",
  "Brokerage & Finance",
];

const CHIP_CATEGORIES = ["All", "Advertising", "Promotions", "Services", "Engagement", "Tips & Value", "Introduction", "Testimonials", "Brokerage & Finance"];

const CATEGORY_EXPLORE = [
  { label: "Advertising",        sublabel: "Drive sales & awareness",   gradient: "from-orange-500 to-rose-500",    img: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=400" },
  { label: "Promotions",         sublabel: "Special offers & deals",    gradient: "from-rose-500 to-pink-500",       img: "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&q=80&w=400" },
  { label: "Services",           sublabel: "Showcase what you do",      gradient: "from-green-500 to-emerald-500",   img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400" },
  { label: "Engagement",         sublabel: "Grow your audience",        gradient: "from-pink-500 to-fuchsia-500",    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" },
  { label: "Introduction",       sublabel: "Tell your story",           gradient: "from-blue-500 to-violet-500",     img: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&q=80&w=400" },
  { label: "Tips & Value",       sublabel: "Build authority",           gradient: "from-teal-500 to-cyan-500",       img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400" },
  { label: "Testimonials",       sublabel: "Social proof",              gradient: "from-amber-500 to-orange-500",    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" },
  { label: "Brokerage & Finance",sublabel: "Financial services",        gradient: "from-indigo-600 to-blue-600",     img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400" },
  { label: "Milestones",         sublabel: "Celebrate wins",            gradient: "from-cyan-500 to-sky-500",        img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=400" },
  { label: "Our Story",          sublabel: "Brand history & values",    gradient: "from-violet-500 to-purple-600",   img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=400" },
];

export default function SocialPostTemplates({ workspaceId, site, createPath, editorPath }: Props) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [designFilter, setDesignFilter] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/analytics`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setRecentPosts(d.recentPosts || []))
      .catch(() => {});
  }, [workspaceId]);

  const templates = generateTemplates(site);
  const isFiltering = !!search || selectedCategory !== "All";

  const filtered = templates.filter(t => {
    if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleUseTemplate = (template: PostTemplate) => {
    const params = new URLSearchParams();
    params.set("template", template.content);
    params.set("templateImage", template.templateImage);
    params.set("templateImageName", template.templateImageName);
    const base = createPath || "/dashboard/social/create";
    navigate(`${base}?${params.toString()}`);
  };

  const handleCopy = async (template: PostTemplate) => {
    await navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    try {
      const res = await fetch(template.templateImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = template.templateImageName || "template-image.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Text copied! Image saved to Downloads — attach when posting.");
    } catch {
      toast.success("Post copied to clipboard!");
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-full" style={{ background: "#fafafa" }}>

      {/* ── Hero / Search ─────────────────────────────────── */}
      <div className="relative" style={{ background: "linear-gradient(135deg, #ede9fe 0%, #f3e8ff 40%, #fce7f3 80%, #ffe4e6 100%)" }}>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: "#3b0764" }}
          >
            Templates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-purple-700/70 text-sm mb-6"
          >
            {site
              ? `${templates.length} posts crafted for ${site.businessName} — pick one and publish in minutes`
              : "Ready-to-post captions with images for every occasion"}
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-sm shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-purple-300 text-gray-700"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>

          {/* Category filter chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none pb-1 flex-wrap justify-center"
          >
            {CHIP_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setSearch(""); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-white/80 border-white/60 text-purple-700 hover:bg-white hover:border-violet-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* ── Explore section (Canva 2-row style) ── */}
        {!isFiltering && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Explore templates</h2>
              <button
                onClick={() => navigate(createPath || "/dashboard/social/create")}
                className="flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-800 transition-colors"
              >
                <Plus className="h-4 w-4" /> Create from scratch
              </button>
            </div>

            {/* ── Row 1: Design / Canvas Templates ── */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Design templates</p>
                <button
                  onClick={() => navigate(editorPath || "/dashboard/social/editor")}
                  className="text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors"
                >
                  Open editor →
                </button>
              </div>
              {/* Category filter chips */}
              <div className="overflow-x-auto scrollbar-none -mx-2 mb-3">
                <div className="flex gap-1.5 px-2 pb-1" style={{ minWidth: "max-content" }}>
                  {["All","Sales","Events","Holidays","Food","Services","Beauty","Fitness","Property","Motivation","Corporate"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setDesignFilter(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                        designFilter === cat
                          ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {/* Template cards with real CSS thumbnails */}
              <div className="overflow-x-auto scrollbar-none -mx-2">
                <div className="flex gap-3 pb-3 px-2" style={{ minWidth: "max-content" }}>
                  {DESIGN_TEMPLATES
                    .filter(dt => designFilter === "All" || dt.designCat === designFilter)
                    .map((dt, i) => (
                      <motion.button
                        key={dt.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }}
                        onClick={() => navigate(`${editorPath || "/dashboard/social/editor"}?template=${dt.id}`)}
                        className="group flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-200 bg-white border border-gray-100 hover:border-violet-300 text-left"
                        style={{ width: 192, flexShrink: 0 }}
                      >
                        <div className="w-full overflow-hidden relative" style={{ height: 168 }}>
                          <DesignThumb dt={dt as DesignTemplate} />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <span className="bg-white text-violet-700 text-xs font-bold px-4 py-2 rounded-xl shadow-lg">
                              Customize →
                            </span>
                          </div>
                        </div>
                        <div className="px-3 py-2.5 bg-white group-hover:bg-violet-50/60 transition-colors">
                          <p className="text-[12px] font-semibold text-gray-800 leading-tight truncate">{dt.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{dt.format}</p>
                        </div>
                      </motion.button>
                    ))}
                </div>
              </div>
            </div>

            {/* ── Row 2: Caption / Post Template Categories ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Caption templates</p>
              </div>
              <div className="overflow-x-auto scrollbar-none -mx-2">
                <div className="flex gap-3 pb-2 px-2" style={{ minWidth: "max-content" }}>
                  {CATEGORY_EXPLORE.map((cat, i) => (
                    <motion.button
                      key={cat.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedCategory(cat.label)}
                      className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group text-left"
                      style={{ width: 148, height: 100, flexShrink: 0 }}
                    >
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-75`} />
                      <div className="absolute inset-0 p-3 flex flex-col justify-end">
                        <p className="text-white font-bold text-[12px] leading-tight drop-shadow">{cat.label}</p>
                        <p className="text-white/80 text-[10px] mt-0.5 drop-shadow">{cat.sublabel}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Recently published ── */}
        {!isFiltering && recentPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recently published</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentPosts.slice(0, 6).map((post, i) => (
                <motion.div
                  key={post.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-violet-100 transition-all cursor-pointer group"
                  onClick={() => navigate(createPath || "/dashboard/social/create")}
                >
                  <div className="aspect-square bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center p-2">
                    <p className="text-[9px] text-gray-500 text-center leading-relaxed line-clamp-4">{post.content_text}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-medium text-gray-600 truncate">{post.content_text?.slice(0, 30) || "Post"}</p>
                    <p className="text-[9px] text-green-600 font-medium mt-0.5">✓ Published</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Website unlock banner ── */}
        {!site && !isFiltering && (
          <div className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/60 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-violet-800">Unlock personalised templates</p>
              <p className="text-xs text-violet-600/80 mt-0.5">Build your website to generate posts tailored to your exact business name, services, and story.</p>
            </div>
            <Button size="sm" onClick={() => navigate("/dashboard/website")} className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white border-0 text-xs">
              Build Website →
            </Button>
          </div>
        )}

        {/* ── Results header ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isFiltering && selectedCategory !== "All" ? selectedCategory : "All Templates"}
            <span className="text-gray-400 font-normal text-sm ml-2">({filtered.length})</span>
          </h2>
          {isFiltering && (
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Template grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 mx-auto text-gray-200 mb-3" />
            <p className="font-semibold text-gray-500">No templates found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
            {filtered.map((template, i) => {
              const Icon = template.categoryIcon;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                >
                  <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 hover:border-violet-200">

                    {/* Full-bleed image area */}
                    <div className="relative overflow-hidden bg-gray-100" style={{ height: 230 }}>
                      <img
                        src={template.mockImage}
                        alt={template.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = "none";
                          const parent = el.parentElement;
                          if (parent) parent.style.background = `linear-gradient(135deg, rgba(${template.categoryBgRGB},0.8), rgba(${template.categoryBgRGB},0.4))`;
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />

                      {/* Category badge — top left */}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/25 shadow-sm">
                          <Icon className="h-3 w-3" />
                          {template.category}
                        </div>
                      </div>

                      {/* Title + desc — bottom overlay (always visible) */}
                      <div className="absolute bottom-0 inset-x-0 px-3.5 pb-3.5 group-hover:pb-16 transition-all duration-200">
                        <p className="text-white font-bold text-sm leading-tight drop-shadow-lg">{template.title}</p>
                        <p className="text-white/75 text-[11px] mt-0.5 line-clamp-1 drop-shadow">{template.description}</p>
                      </div>

                      {/* Hover overlay — action buttons */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gradient-to-t from-black/50 to-transparent">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="bg-white text-violet-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-xl hover:bg-violet-50 transition-colors"
                        >
                          Use Template
                        </button>
                        <button
                          onClick={() => handleCopy(template)}
                          className={`backdrop-blur-sm font-semibold text-sm px-3 py-2.5 rounded-xl border transition-all ${
                            copiedId === template.id
                              ? "bg-green-500 text-white border-green-400"
                              : "bg-white/20 text-white border-white/40 hover:bg-white/30"
                          }`}
                          title="Copy text + download image"
                        >
                          {copiedId === template.id ? "✓" : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Clean bottom strip */}
                    <div className="px-3.5 py-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5 min-w-0">
                        {template.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="rounded-full bg-violet-50 text-violet-600 text-[10px] px-2 py-0.5 font-medium border border-violet-100 whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="shrink-0 ml-2 text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
                      >
                        Use <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
