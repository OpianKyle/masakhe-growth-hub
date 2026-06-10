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

export default function SocialPostTemplates({ workspaceId, site, createPath }: Props) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
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

        {/* ── Explore categories (only when not filtering) ── */}
        {!isFiltering && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Explore templates</h2>
              <button
                onClick={() => navigate(createPath || "/dashboard/social/create")}
                className="flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-800 transition-colors"
              >
                <Plus className="h-4 w-4" /> Create from scratch
              </button>
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
                    style={{ width: 160, height: 110, flexShrink: 0 }}
                  >
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-75`} />
                    <div className="absolute inset-0 p-3 flex flex-col justify-end">
                      <p className="text-white font-bold text-[13px] leading-tight drop-shadow">{cat.label}</p>
                      <p className="text-white/80 text-[10px] mt-0.5 drop-shadow">{cat.sublabel}</p>
                    </div>
                  </motion.button>
                ))}
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
                  <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 hover:border-violet-100 flex flex-col h-full">

                    {/* Image area */}
                    <div className="relative h-44 w-full overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={template.mockImage}
                        alt={template.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to bottom, rgba(${template.categoryBgRGB}, 0.3) 0%, rgba(0,0,0,0.65) 100%)` }}
                      />
                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                          <Icon className="h-3 w-3" />
                          {template.category}
                        </div>
                      </div>
                      {/* Hover overlay button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="bg-white text-violet-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-xl hover:bg-violet-50 transition-colors"
                        >
                          Use Template
                        </button>
                      </div>
                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm leading-tight drop-shadow-md">{template.title}</p>
                        <p className="text-white/80 text-xs drop-shadow mt-0.5 line-clamp-1">{template.description}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-3 flex flex-col flex-1">
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-500 leading-relaxed overflow-hidden max-h-[72px] relative">
                        {template.content}
                        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-gray-50 to-transparent" />
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="rounded-full bg-violet-50 text-violet-600 text-[10px] px-2 py-0.5 font-medium border border-violet-100">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                        >
                          Use Template <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(template)}
                          className={`h-8 text-xs ${copiedId === template.id ? "border-green-300 text-green-600 bg-green-50" : "border-gray-200 text-gray-500 hover:border-violet-200 hover:text-violet-600"}`}
                          title="Copy text + download image"
                        >
                          {copiedId === template.id ? "Copied!" : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
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
