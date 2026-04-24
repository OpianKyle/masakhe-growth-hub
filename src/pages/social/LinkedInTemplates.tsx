import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sparkles, Copy, ArrowRight, Lightbulb, TrendingUp, Award,
  Users, Heart, BookOpen, Briefcase, Target, Globe,
  CheckCircle2, MessageSquare, Star, Handshake, RefreshCw,
  UserCheck, BarChart3, Rocket, ChevronRight, PenSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Props {
  workspaceId: string;
  businessName?: string;
  createPath?: string;
}

interface LinkedInTemplate {
  id: string;
  category: string;
  categoryIcon: any;
  categoryColor: string;
  categoryBg: string;
  title: string;
  hook: string;
  description: string;
  content: string;
  tags: string[];
}

const CATEGORIES = {
  "Thought Leadership":  { color: "text-blue-600",   bg: "bg-blue-500/10" },
  "Business Lessons":    { color: "text-purple-600", bg: "bg-purple-500/10" },
  "Industry Insights":   { color: "text-teal-600",   bg: "bg-teal-500/10" },
  "Milestones":          { color: "text-amber-600",  bg: "bg-amber-500/10" },
  "Team & Culture":      { color: "text-green-600",  bg: "bg-green-500/10" },
  "Client Wins":         { color: "text-cyan-600",   bg: "bg-cyan-500/10" },
  "Monday Motivation":   { color: "text-orange-600", bg: "bg-orange-500/10" },
  "Networking":          { color: "text-indigo-600", bg: "bg-indigo-500/10" },
  "SA Business":         { color: "text-rose-600",   bg: "bg-rose-500/10" },
};

function cat(name: keyof typeof CATEGORIES) {
  return CATEGORIES[name];
}

function buildTemplates(biz: string): LinkedInTemplate[] {
  return [
    // ── THOUGHT LEADERSHIP ─────────────────────────────────────────────────
    {
      id: "li-tl-lesson",
      category: "Thought Leadership",
      categoryIcon: Lightbulb,
      categoryColor: cat("Thought Leadership").color,
      categoryBg: cat("Thought Leadership").bg,
      title: "The Hardest Lesson I Learned Running a Business",
      hook: "Start with a vulnerable, relatable business lesson",
      description: "Vulnerability drives LinkedIn engagement. Share a real lesson that changed how you operate.",
      content: `The hardest lesson I learned running ${biz}:\n\nIn my early days, I said yes to every client.\n\nEvery. Single. One.\n\nThe result? Overworked. Underpaid. Resentful.\n\nUntil the day I learned that saying NO to the wrong clients is how you make room for the RIGHT ones.\n\nHere's what changed when I became selective:\n→ My prices went up\n→ My stress went down\n→ My results for clients improved dramatically\n→ Referrals started coming naturally\n\nIf you're a small business owner in South Africa feeling stretched thin — this is your sign.\n\nYou don't need more clients. You need better ones.\n\nWhat's the hardest business lesson you've had to learn? Drop it below. 👇\n\n#SmallBusiness #BusinessLesson #Entrepreneurship #SouthAfrica #SMME`,
      tags: ["#SmallBusiness", "#BusinessLesson", "#Entrepreneurship", "#SouthAfrica"],
    },
    {
      id: "li-tl-unpopular",
      category: "Thought Leadership",
      categoryIcon: MessageSquare,
      categoryColor: cat("Thought Leadership").color,
      categoryBg: cat("Thought Leadership").bg,
      title: "Unpopular Opinion About [Your Industry]",
      hook: "Challenge a common belief in your industry",
      description: "Contrarian posts get 3–5× more engagement. Share a genuine belief that goes against the grain.",
      content: `Unpopular opinion:\n\nMost [your industry] businesses are solving the wrong problem.\n\nEvery competitor is racing to be cheaper.\nFaster. More convenient.\n\nBut customers aren't leaving because of price.\nThey're leaving because nobody actually listens to them.\n\nAt ${biz}, we made one shift:\nWe stopped competing on price and started competing on understanding.\n\nWe ask more questions. We follow up. We remember details.\n\nAnd our retention rate went from [X]% to [X]%.\n\nPricing is easy to match. Genuine care isn't.\n\nAgree or disagree? I'd love to hear your perspective. 👇\n\n#BusinessStrategy #CustomerExperience #SouthAfrica #Entrepreneurship #Leadership`,
      tags: ["#BusinessStrategy", "#CustomerExperience", "#Entrepreneurship", "#Leadership"],
    },
    {
      id: "li-tl-framework",
      category: "Thought Leadership",
      categoryIcon: Target,
      categoryColor: cat("Thought Leadership").color,
      categoryBg: cat("Thought Leadership").bg,
      title: "The Framework That Changed My Business",
      hook: "Share a simple framework or process you use",
      description: "Practical frameworks get saved and shared. Give away genuine value.",
      content: `The simple framework that changed how I run ${biz}:\n\nI call it the 3-Filter Test.\n\nBefore taking on any new client or project, I ask:\n\n1️⃣ Can I genuinely help them get a great result?\n2️⃣ Will this relationship be respectful and clear?\n3️⃣ Is the price fair for the value I'm delivering?\n\nIf the answer to ANY of those is no — I don't take it.\n\nBefore this filter:\n→ High stress, average results, constant scope creep\n\nAfter this filter:\n→ Calmer work, exceptional outcomes, more referrals\n\nThe counterintuitive truth: being more selective made ${biz} MORE profitable, not less.\n\nSave this for the next time you're tempted to say yes to the wrong thing.\n\nWhat filter do you use? 👇\n\n#BusinessFramework #SmallBusiness #Productivity #SouthAfrica #Entrepreneur`,
      tags: ["#BusinessFramework", "#SmallBusiness", "#Productivity", "#SouthAfrica"],
    },

    // ── BUSINESS LESSONS ───────────────────────────────────────────────────
    {
      id: "li-bl-mistake",
      category: "Business Lessons",
      categoryIcon: BookOpen,
      categoryColor: cat("Business Lessons").color,
      categoryBg: cat("Business Lessons").bg,
      title: "The Mistake That Cost Me [R Amount]",
      hook: "Lead with the cost of a real mistake",
      description: "Honest failure posts build tremendous trust. Be specific — vague posts underperform.",
      content: `I made a mistake that cost ${biz} dearly.\n\nI won't hide it.\n\nI hired someone based on personality, not skills.\n\nThey were energetic, enthusiastic, and a perfect culture fit.\n\nBut they couldn't do the core job.\n\nBy the time I realised it, we'd lost two clients and three months of momentum.\n\nWhat I learned:\n→ Hire for skills first, culture fit second\n→ Set clear 30-day milestones from day one\n→ Trust your gut when something feels off — early\n→ Document everything from the first week\n\nThe painful lessons are the ones that actually stick.\n\nIf this saved you from making the same mistake, it was worth sharing.\n\nWhat's a hiring lesson you've had to learn the hard way? 👇\n\n#Leadership #HiringMistakes #BusinessLessons #SouthAfrica #Entrepreneur`,
      tags: ["#Leadership", "#HiringMistakes", "#BusinessLessons", "#SouthAfrica"],
    },
    {
      id: "li-bl-wish-knew",
      category: "Business Lessons",
      categoryIcon: Star,
      categoryColor: cat("Business Lessons").color,
      categoryBg: cat("Business Lessons").bg,
      title: "What I Wish Someone Told Me Before Starting",
      hook: "Speak directly to new entrepreneurs",
      description: "Advice posts generate strong saves and shares from aspiring entrepreneurs.",
      content: `What I wish someone told me before starting ${biz}:\n\n"Revenue is vanity. Profit is sanity. Cash flow is reality."\n\nI spent my first year celebrating revenue milestones.\nLook at us — R[X] in sales!\n\nBut I was constantly stressed. Constantly chasing payments. Always just surviving.\n\nThe shift came when I started tracking:\n→ How much actually landed in my account\n→ When clients were paying (not just IF they'd pay)\n→ My actual costs vs my perceived costs\n\nThree things every new business owner should do immediately:\n1. Open a separate business account — TODAY\n2. Invoice on delivery, not at month end\n3. Build a 3-month cash buffer before you "relax"\n\nThe business can look great on paper and still kill you if cash flow is broken.\n\nTag a new entrepreneur who needs to see this. 👇\n\n#StartupAdvice #CashFlow #FinancialLiteracy #SouthAfrica #SmallBusiness`,
      tags: ["#StartupAdvice", "#CashFlow", "#FinancialLiteracy", "#SouthAfrica"],
    },

    // ── INDUSTRY INSIGHTS ──────────────────────────────────────────────────
    {
      id: "li-ii-trend",
      category: "Industry Insights",
      categoryIcon: TrendingUp,
      categoryColor: cat("Industry Insights").color,
      categoryBg: cat("Industry Insights").bg,
      title: "A Trend Changing [Your Industry] Right Now",
      hook: "Lead with a specific observation about your market",
      description: "Trend commentary establishes you as a market expert. Be specific to your sector.",
      content: `Something is shifting in [your industry] — and most businesses aren't ready for it.\n\n[Describe the trend you're observing]\n\nHere's what I'm seeing at ${biz}:\n→ Clients are asking for [new thing] more than ever before\n→ The businesses ignoring this are losing ground fast\n→ The ones embracing it are pulling ahead\n\nMy read on what this means:\n\n[Your insight or prediction — 2–3 sentences]\n\nThe businesses that will thrive in the next 3 years aren't the biggest ones. They're the ones adapting fastest.\n\nAt ${biz}, we're already [what you're doing differently].\n\nAre you seeing the same shift? What's your read on where this is heading? 👇\n\n#IndustryTrends #BusinessStrategy #Innovation #SouthAfrica #FutureOfWork`,
      tags: ["#IndustryTrends", "#BusinessStrategy", "#Innovation", "#SouthAfrica"],
    },
    {
      id: "li-ii-data",
      category: "Industry Insights",
      categoryIcon: BarChart3,
      categoryColor: cat("Industry Insights").color,
      categoryBg: cat("Industry Insights").bg,
      title: "A Stat That Surprised Me (and What It Means)",
      hook: "Open with a surprising statistic from your industry",
      description: "Data-backed posts build credibility and get strong professional engagement.",
      content: `A statistic that stopped me in my tracks:\n\n[Insert relevant stat — e.g. "70% of South African SMMEs fail in the first 5 years."]\n\nI've been thinking about WHY for the past week.\n\nIn my experience running ${biz}, the biggest culprits are:\n\n1. Underpricing out of fear, not strategy\n2. No clear target customer — trying to serve everyone\n3. Confusing being busy with being productive\n4. Waiting for perfection instead of launching and improving\n\nThe good news?\n\nEvery single one of those is fixable — with the right knowledge and the right support.\n\nThat's exactly why we built ${biz} the way we did: to help businesses not become that statistic.\n\nWhat do you think is the #1 reason small businesses struggle? I genuinely want to know. 👇\n\n#SMMEs #SouthAfrica #BusinessGrowth #Entrepreneurship #SmallBusiness`,
      tags: ["#SMMEs", "#SouthAfrica", "#BusinessGrowth", "#Entrepreneurship"],
    },

    // ── MILESTONES ─────────────────────────────────────────────────────────
    {
      id: "li-ms-anniversary",
      category: "Milestones",
      categoryIcon: Award,
      categoryColor: cat("Milestones").color,
      categoryBg: cat("Milestones").bg,
      title: "We Just Hit [X] Years / [X] Clients",
      hook: "Celebrate with gratitude, not just numbers",
      description: "Milestone posts perform best when you credit the people involved, not just the achievement.",
      content: `${biz} just hit a milestone I'm incredibly proud of.\n\n[X years in business / X clients served / X milestone achieved.]\n\nI remember the first day clearly.\n\n[One honest sentence about how uncertain or humble the start was.]\n\nHere's what I didn't expect:\n→ The clients who became friends\n→ The team members who grew more than I imagined\n→ The problems that turned out to be the best lessons\n→ The quiet moments that turned out to be the most meaningful\n\nTo every client who trusted us: thank you.\nYou chose us — often when you didn't have to. That means everything.\n\nTo anyone still in the early stages: it gets clearer. Keep going.\n\nHere's to the next chapter. 🥂\n\n#BusinessAnniversary #Grateful #Milestone #SouthAfrica #Entrepreneurship`,
      tags: ["#BusinessAnniversary", "#Grateful", "#Milestone", "#SouthAfrica"],
    },
    {
      id: "li-ms-launch",
      category: "Milestones",
      categoryIcon: Rocket,
      categoryColor: cat("Milestones").color,
      categoryBg: cat("Milestones").bg,
      title: "We Just Launched [Product/Service/Partnership]",
      hook: "Announce something new with professional energy",
      description: "LinkedIn launch posts work best when they explain the WHY behind what you're launching.",
      content: `Today, ${biz} launches something I've been working on for months.\n\n[Name what you're launching — one clear sentence.]\n\nBut before I tell you what it is, let me tell you why we built it:\n\n[The problem you kept seeing clients face]\n\nWe kept hearing the same thing over and over from businesses like yours:\n"[Direct quote or paraphrase of the pain point]"\n\nSo we built [product/service/solution] to solve exactly that.\n\nWhat it does:\n→ [Benefit 1 — outcome focused]\n→ [Benefit 2 — outcome focused]\n→ [Benefit 3 — outcome focused]\n\nWho it's for: [Describe your ideal client in one sentence]\n\nWe're opening [X] spots for early access — details in the comments.\n\nWhat questions do you have? Ask me anything. 👇\n\n#NewLaunch #BusinessGrowth #Innovation #SouthAfrica #Entrepreneurship`,
      tags: ["#NewLaunch", "#BusinessGrowth", "#Innovation", "#SouthAfrica"],
    },

    // ── TEAM & CULTURE ─────────────────────────────────────────────────────
    {
      id: "li-tc-hire",
      category: "Team & Culture",
      categoryIcon: UserCheck,
      categoryColor: cat("Team & Culture").color,
      categoryBg: cat("Team & Culture").bg,
      title: "Welcome to the Team, [Name]",
      hook: "Introduce a new team member with warmth and specificity",
      description: "Team posts humanise your business and attract talent. Be specific about what this person brings.",
      content: `Big news at ${biz}: we're growing!\n\nI'm thrilled to welcome [Name] to our team as [Role/Title].\n\nA little about [Name]:\n→ [Relevant experience or background]\n→ [Something unique or impressive about them]\n→ [Why you're excited to have them specifically]\n\nWhat this means for our clients:\n[One sentence explaining how this hire makes your service/product better]\n\nBuilding a great team is one of the hardest and most rewarding things about running a business.\n\nFinding someone who is not only skilled, but genuinely cares about the people we serve? That's rare.\n\n[Name], the team is lucky to have you. Welcome home. 🙌\n\nFor anyone looking to work with us in future — our values and culture are everything. DM me if you want to learn more.\n\n#NewHire #TeamGrowth #CompanyCulture #SouthAfrica #Hiring`,
      tags: ["#NewHire", "#TeamGrowth", "#CompanyCulture", "#SouthAfrica"],
    },
    {
      id: "li-tc-culture",
      category: "Team & Culture",
      categoryIcon: Heart,
      categoryColor: cat("Team & Culture").color,
      categoryBg: cat("Team & Culture").bg,
      title: "The Culture We've Built at [Business Name]",
      hook: "Share the values that define your workplace",
      description: "Culture posts attract both talent and clients who share your values.",
      content: `Something I'm proud of that doesn't show in any revenue report:\n\nThe culture we've built at ${biz}.\n\nWe don't have a ping-pong table or a fancy office.\n\nWhat we do have:\n→ Honest conversations — even the uncomfortable ones\n→ A no-blame approach to mistakes (we fix, then we learn)\n→ Flexibility that treats people like adults\n→ Clients we actually enjoy working with\n→ Work that we're genuinely proud to put our name on\n\nI believe how a business treats its people internally is exactly how it treats its clients externally.\n\nYou can't fake good culture. It shows in every email, every delivery, every interaction.\n\nTo the team at ${biz}: thank you for making this place what it is.\n\nWhat's a workplace value that's non-negotiable for you? 👇\n\n#WorkplaceCulture #Leadership #TeamFirst #SouthAfrica #BusinessValues`,
      tags: ["#WorkplaceCulture", "#Leadership", "#TeamFirst", "#SouthAfrica"],
    },

    // ── CLIENT WINS ────────────────────────────────────────────────────────
    {
      id: "li-cw-casestudy",
      category: "Client Wins",
      categoryIcon: CheckCircle2,
      categoryColor: cat("Client Wins").color,
      categoryBg: cat("Client Wins").bg,
      title: "How We Helped [Client] Achieve [Result]",
      hook: "Lead with the client's result, not your service",
      description: "Outcome-led case studies are the most trusted form of social proof on LinkedIn.",
      content: `I want to share a client win I'm genuinely proud of.\n\n[Client description — industry, size, situation]\n\nWhen they came to ${biz}, their challenge was:\n[Describe the specific problem clearly]\n\nWhat we did:\n→ [Step 1 — action taken]\n→ [Step 2 — action taken]\n→ [Step 3 — action taken]\n\nThe result:\n✅ [Specific, measurable outcome]\n✅ [Second outcome if applicable]\n✅ [Qualitative win — how they feel / what changed]\n\nWhat they said:\n"[Short, authentic quote from the client]"\n— [Name or description if anonymised]\n\nThis is why we do what we do at ${biz}.\n\nNot for the contract. For the moment when the results land and the client realises what's now possible.\n\nIf you're facing a similar challenge, let's talk. 👇\n\n#ClientSuccess #CaseStudy #ResultsDriven #SouthAfrica #BusinessGrowth`,
      tags: ["#ClientSuccess", "#CaseStudy", "#ResultsDriven", "#SouthAfrica"],
    },

    // ── MONDAY MOTIVATION ──────────────────────────────────────────────────
    {
      id: "li-mm-monday",
      category: "Monday Motivation",
      categoryIcon: Sparkles,
      categoryColor: cat("Monday Motivation").color,
      categoryBg: cat("Monday Motivation").bg,
      title: "The One Thing That Changes Everything",
      hook: "Share a mindset shift at the start of the week",
      description: "Monday posts with a clear mindset shift perform well early in the week.",
      content: `Happy Monday, LinkedIn. Let's start the week with something real.\n\nThe one mindset shift that changed how I run ${biz}:\n\nI stopped asking: "How do I get more clients?"\n\nAnd started asking: "How do I become the obvious choice for the RIGHT clients?"\n\nThose are wildly different questions.\n\nThe first leads to:\n→ Chasing everyone\n→ Competing on price\n→ Exhausting yourself\n\nThe second leads to:\n→ Niching down\n→ Building genuine authority\n→ Attracting clients who already trust you before you speak\n\nThis week, ask yourself:\nWho is your ideal client — specifically?\nAnd are you showing up as the obvious answer to their most pressing problem?\n\nHave a productive week. 💪\n\n#MondayMotivation #BusinessMindset #Entrepreneurship #SouthAfrica #Growth`,
      tags: ["#MondayMotivation", "#BusinessMindset", "#Entrepreneurship", "#SouthAfrica"],
    },
    {
      id: "li-mm-reflection",
      category: "Monday Motivation",
      categoryIcon: RefreshCw,
      categoryColor: cat("Monday Motivation").color,
      categoryBg: cat("Monday Motivation").bg,
      title: "End-of-Week Reflection",
      hook: "Friday wrap-up that invites engagement",
      description: "Friday reflection posts close the week and invite community input.",
      content: `Wrapping up another week at ${biz}.\n\nThis week I:\n\n✅ [Something you accomplished — be specific]\n✅ [A decision you made]\n✅ [Something you learned or observed]\n\nSomething that challenged me:\n[One honest challenge — not a complaint, but something real]\n\nSomething I'm grateful for:\n[Client, team member, moment, insight]\n\nQuestion for your week:\nWhat's one thing you're taking into next week with you — and one thing you're leaving behind?\n\nI'll go first: I'm taking [insight/energy] and leaving behind [what you're letting go of].\n\nHave a great weekend, everyone. Rest, reset, return stronger. 🙏\n\n#FridayReflection #WeeklyWrapUp #Gratitude #BusinessLife #SouthAfrica`,
      tags: ["#FridayReflection", "#WeeklyWrapUp", "#Gratitude", "#SouthAfrica"],
    },

    // ── NETWORKING ─────────────────────────────────────────────────────────
    {
      id: "li-nw-collab",
      category: "Networking",
      categoryIcon: Handshake,
      categoryColor: cat("Networking").color,
      categoryBg: cat("Networking").bg,
      title: "Open to Collaboration / Referrals",
      hook: "Professional networking post that invites connection",
      description: "Clearly stating what you do and who you're looking to connect with drives quality referrals.",
      content: `I'm going to be direct — because I think LinkedIn works best when we are.\n\nHere's what ${biz} does:\n[One clear, jargon-free sentence about your service]\n\nThe clients we serve best:\n→ [Descriptor 1]\n→ [Descriptor 2]\n→ [Descriptor 3]\n\nThe results they typically see:\n→ [Specific outcome]\n→ [Specific outcome]\n\nWho I'd love to connect with:\n→ Business owners in [industry/location]\n→ Professionals who work with [your ideal client type]\n→ Anyone looking to [solve the problem you solve]\n\nI believe strongly in the power of community over competition.\n\nIf you know someone who could benefit from what we do — I'd be honoured if you made the introduction.\n\nAnd I'll do the same for you.\n\nDrop a comment below or send me a DM. Let's build something together. 👇\n\n#Networking #Collaboration #BusinessReferrals #SouthAfrica #BizConnect`,
      tags: ["#Networking", "#Collaboration", "#BusinessReferrals", "#SouthAfrica"],
    },

    // ── SA BUSINESS ────────────────────────────────────────────────────────
    {
      id: "li-sa-challenge",
      category: "SA Business",
      categoryIcon: Globe,
      categoryColor: cat("SA Business").color,
      categoryBg: cat("SA Business").bg,
      title: "Running a Business in South Africa — Honestly",
      hook: "Speak candidly about the SA business environment",
      description: "Honest takes on the SA business landscape resonate strongly with local professionals.",
      content: `Let's be honest about running a business in South Africa.\n\nIt's one of the most challenging environments in the world.\n\nLoad shedding. Rising input costs. A tough consumer market. Skills shortages. Late payments.\n\nAnd yet.\n\nSouth African entrepreneurs are some of the most resilient, resourceful, and innovative people I've ever met.\n\nAt ${biz}, we've had to:\n→ [Challenge you faced and adapted to]\n→ [Another real challenge]\n→ [How you responded]\n\nWhat I know for certain:\n\nThe businesses that survive here could survive anywhere.\n\nThe obstacles that defeat others become our competitive advantage — because we've learned to build differently, think differently, and keep going when others stop.\n\nTo every South African business owner reading this:\n\nYou are not behind. You are building in hard mode.\n\nKeep going. 🇿🇦\n\n#SouthAfrica #SouthAfricanBusiness #SMME #Entrepreneurship #ProudlySA`,
      tags: ["#SouthAfrica", "#SouthAfricanBusiness", "#SMME", "#Entrepreneurship"],
    },
    {
      id: "li-sa-opportunity",
      category: "SA Business",
      categoryIcon: Briefcase,
      categoryColor: cat("SA Business").color,
      categoryBg: cat("SA Business").bg,
      title: "The SA Opportunity Nobody Talks About",
      hook: "Flip the narrative — SA has massive opportunity",
      description: "Positive, forward-looking SA business content cuts through the doom and gets strong engagement.",
      content: `Everyone talks about the challenges of doing business in South Africa.\n\nFew talk about the opportunity.\n\nHere's what I see from where ${biz} sits:\n\n📈 A growing middle class hungry for quality products and services\n🤝 A culture of entrepreneurship that's accelerating, not slowing\n💡 Technology levelling the playing field between small and large businesses\n🌍 A gateway position into the broader African continent\n🏆 A market where excellent service is still genuinely rare — and therefore powerful\n\nThe gap between mediocre and excellent in South Africa is massive.\n\nAnd for any business willing to show up consistently, communicate well, and genuinely care about results?\n\nThat gap is the opportunity.\n\nWe built ${biz} to help South African businesses close that gap.\n\nWhat opportunity do YOU see that others are missing? 👇\n\n#SouthAfrica #BusinessOpportunity #ProudlySA #SMME #AfricanBusiness`,
      tags: ["#SouthAfrica", "#BusinessOpportunity", "#ProudlySA", "#SMME"],
    },
  ];
}

const CATEGORY_ORDER: Array<keyof typeof CATEGORIES> = [
  "Thought Leadership", "Business Lessons", "Industry Insights",
  "Milestones", "Team & Culture", "Client Wins",
  "Monday Motivation", "Networking", "SA Business",
];

export default function LinkedInTemplates({ workspaceId, businessName, createPath }: Props) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const biz = businessName || "our business";
  const templates = buildTemplates(biz);
  const categories = ["All", ...CATEGORY_ORDER.filter(c => templates.some(t => t.category === c))];
  const filtered = selectedCategory === "All" ? templates : templates.filter(t => t.category === selectedCategory);

  const handleUse = (t: LinkedInTemplate) => {
    const params = new URLSearchParams();
    params.set("template", t.content);
    const base = createPath || "/dashboard/biz-connect/create";
    navigate(`${base}?${params.toString()}`);
  };

  const handleCopy = async (t: LinkedInTemplate) => {
    await navigator.clipboard.writeText(t.content);
    setCopiedId(t.id);
    toast.success("Post copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            LinkedIn Post Templates
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Professional posts designed to build authority, spark conversation, and grow your network.
          </p>
        </div>
        <Button
          onClick={() => navigate(createPath || "/dashboard/biz-connect/create")}
          className="bg-[#0A66C2] hover:bg-[#004182] text-white"
        >
          <PenSquare className="h-4 w-4 mr-2" /> Write Custom Post
        </Button>
      </div>

      {/* Info banner */}
      <Card className="p-4 border-blue-200 bg-blue-50/60 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800">Customise before posting</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Every template contains <strong>[placeholders]</strong> — replace them with your real numbers, names, and stories. Authentic specifics outperform generic posts every time.
          </p>
        </div>
      </Card>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedCategory === c
                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                : "bg-background border-border text-muted-foreground hover:border-[#0A66C2]/50 hover:text-[#0A66C2]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t, i) => {
          const Icon = t.categoryIcon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="flex flex-col h-full hover:shadow-md transition-shadow border-border">
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${t.categoryBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${t.categoryColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${t.categoryColor}`}>{t.category}</span>
                      <h3 className="font-bold text-sm text-foreground leading-snug mt-0.5">{t.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 italic">"{t.hook}"</p>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 flex-1">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">WHY IT WORKS</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t.description}</p>

                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">PREVIEW</p>
                  <div className="text-xs text-foreground/80 leading-relaxed bg-muted/40 rounded-lg p-3 line-clamp-5 whitespace-pre-wrap font-mono">
                    {t.content}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {t.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] text-[#0A66C2] bg-blue-50 rounded px-1.5 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopy(t)}
                  >
                    {copiedId === t.id
                      ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copied!</>
                      : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</>}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white"
                    onClick={() => handleUse(t)}
                  >
                    Use Template <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
