import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

interface QuestionnaireQuestion {
  key: string;
  category: string;
  title: string;
  help: string;
  options: string[];
  select?: boolean;
}

const QUESTIONS: QuestionnaireQuestion[] = [
  {
    key: "stage",
    category: "Your business journey",
    title: "Where are you in your business journey?",
    help: "Choose the stage that feels closest to where you are today.",
    options: [
      "I’m planning my business",
      "I’m getting ready to launch",
      "I’m trading and getting organised",
      "I’m growing an established business",
    ],
  },
  {
    key: "industry",
    category: "Your world of work",
    title: "What kind of business are you building?",
    help: "Choose the closest match. Every business starts somewhere.",
    options: [
      "Retail & online selling",
      "Food, hospitality & tourism",
      "Professional & business services",
      "Trades, construction & maintenance",
      "Beauty, wellness & personal services",
      "Creative, media & entertainment",
      "Manufacturing & agriculture",
      "Technology & digital services",
      "Other / still deciding",
    ],
    select: true,
  },
  {
    key: "team",
    category: "Your people",
    title: "How many people work in your business?",
    help: "Include yourself. This helps shape your starting suggestions.",
    options: ["Just me", "2–5 people", "6–20 people", "21+ people"],
  },
  {
    key: "challenge",
    category: "Your everyday challenges",
    title: "What gets in the way most often?",
    help: "Pick the one challenge you’d most like to work on first.",
    options: [
      "My business needs more online visibility",
      "Admin feels scattered across different tools",
      "Quotes, invoices and records are hard to organise",
      "Client follow-ups slip through the cracks",
      "Keeping team information organised takes time",
    ],
  },
  {
    key: "priority",
    category: "Your first priority",
    title: "Which tool would you like to start with?",
    help: "You can explore the other tools after signup.",
    options: [
      "Website builder",
      "Social media tools",
      "Quotes & invoices",
      "Income, expense & transaction tracking",
      "Client management",
      "Payroll, leave & HR",
    ],
  },
  {
    key: "goal",
    category: "Your next chapter",
    title: "What would you like to focus on next?",
    help: "Choose a practical goal for the next 30 days.",
    options: [
      "Launch my business online",
      "Create a more consistent marketing routine",
      "Organise my billing and business records",
      "Build a better client follow-up routine",
      "Put a clearer team admin routine in place",
    ],
  },
];

const TOOL_INFO: Record<string, { title: string; description: string }> = {
  "Website builder": {
    title: "Website builder",
    description: "Start with a clear description of your business, your services and how customers can contact you.",
  },
  "Social media tools": {
    title: "Social media tools",
    description: "Plan useful posts around customer questions, your work and a clear next step.",
  },
  "Quotes & invoices": {
    title: "Quotes & invoices",
    description: "Prepare a professional quote or invoice and organise the details for your next billing task.",
  },
  "Income, expense & transaction tracking": {
    title: "Income & expense tracking",
    description: "Bring your business income, expenses and transaction records into a clearer routine.",
  },
  "Client management": {
    title: "Client management",
    description: "Organise client details and decide the next follow-up action for each active enquiry.",
  },
  "Payroll, leave & HR": {
    title: "Payroll, leave & HR",
    description: "Keep employee records up to date and prepare the information needed for team administration.",
  },
};

const CHALLENGE_TO_TOOL = [
  "Website builder",
  "Income, expense & transaction tracking",
  "Quotes & invoices",
  "Client management",
  "Payroll, leave & HR",
];

const GOAL_TO_TOOL = [
  "Website builder",
  "Social media tools",
  "Quotes & invoices",
  "Client management",
  "Payroll, leave & HR",
];

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export default function BusinessQuestionnairePage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const question = QUESTIONS[step];
  const currentAnswer = answers[question.key] || "";
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const signupPath = useMemo(() => {
    const params = new URLSearchParams();
    UTM_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return query ? `/register?${query}` : "/register";
  }, [searchParams]);

  const recommendations = useMemo(() => {
    const priority = answers.priority;
    const goalIndex = QUESTIONS[5].options.indexOf(answers.goal || "");
    const challengeIndex = QUESTIONS[3].options.indexOf(answers.challenge || "");
    const fallback =
      answers.team === "Just me"
        ? ["Client management", "Quotes & invoices", "Website builder"]
        : ["Payroll, leave & HR", "Client management", "Quotes & invoices"];
    const keys = [
      priority,
      GOAL_TO_TOOL[goalIndex],
      CHALLENGE_TO_TOOL[challengeIndex],
      ...fallback,
    ];
    return [...new Set(keys)]
      .filter((key): key is string => Boolean(key && TOOL_INFO[key]))
      .slice(0, 3)
      .map((key) => TOOL_INFO[key]);
  }, [answers]);

  useEffect(() => {
    if (showResult) resultHeading.current?.focus();
    else questionHeading.current?.focus();
  }, [step, showResult]);

  function chooseAnswer(value: string) {
    setAnswers((previous) => ({ ...previous, [question.key]: value }));
  }

  function continueQuestionnaire() {
    if (!currentAnswer) return;
    if (step === QUESTIONS.length - 1) {
      setShowResult(true);
      return;
    }
    setStep((previous) => previous + 1);
  }

  function reviewAnswers() {
    setShowResult(false);
    setStep(0);
  }

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#092b45]">
      <Helmet>
        <title>Business Questionnaire | Masakhe SME Builder</title>
        <meta
          name="description"
          content="Answer six quick questions to find a useful starting point for your business with Masakhe SME Builder."
        />
      </Helmet>

      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link
          to="/"
          aria-label="Masakhe home"
          data-testid="link-questionnaire-home"
          className="flex items-center gap-3"
        >
          <img src="/masakhe-logo.png" alt="" className="h-10 w-10 object-contain" />
          <span className="leading-tight">
            <strong className="block text-xl tracking-tight">Masakhe</strong>
            <small className="mt-1 block text-[9px] font-bold tracking-[0.2em]">SME BUILDER</small>
          </span>
        </Link>
        <span className="rounded-full bg-emerald-100 px-3 py-2 text-center text-[10px] font-extrabold tracking-wide text-emerald-800 sm:px-4 sm:text-xs">
          FREE CORE ACCESS
        </span>
      </header>

      <main className="mx-auto mb-8 grid min-h-[640px] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_22px_70px_rgba(22,49,59,0.08)] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative flex flex-col overflow-hidden bg-[#092b45] px-7 py-8 text-white sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">
              Your business. Your next move.
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Build the business
              <br />
              you <span className="text-emerald-300">believe in.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300 sm:text-base">
              Tell us a little about your business. We’ll suggest where to start with Masakhe SME Builder.
            </p>

            <div className="mt-8 hidden border-t border-white/15 sm:block">
              {[
                "Get your business seen",
                "Bring your admin together",
                "Give your team room to grow",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-4 border-b border-white/15 py-4 text-sm text-slate-100">
                  <span className="text-xs font-extrabold text-emerald-300">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="relative mt-auto hidden pt-10 text-xs leading-5 text-slate-300 sm:block">
            Built for South African small businesses.
            <br />
            One dashboard for your next chapter.
          </p>
        </aside>

        <section
          aria-label="Business questionnaire"
          className="flex min-h-[560px] flex-col px-6 py-7 sm:px-10 sm:py-10 lg:px-12"
        >
          {!showResult ? (
            <>
              <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span data-testid="text-question-progress">Question {step + 1} of {QUESTIONS.length}</span>
                <strong className="text-[10px] tracking-[0.12em] text-emerald-700">ABOUT A MINUTE</strong>
              </div>
              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Questionnaire progress"
                aria-valuemin={1}
                aria-valuemax={QUESTIONS.length}
                aria-valuenow={step + 1}
              >
                <div
                  className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-8">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-emerald-700">{question.category}</p>
                <h2
                  id="question-title"
                  ref={questionHeading}
                  tabIndex={-1}
                  className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-[#092b45] outline-none sm:text-3xl"
                >
                  {question.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">{question.help}</p>
              </div>

              <div className="mt-5 grid gap-2.5" role="group" aria-labelledby="question-title">
                {question.select ? (
                  <select
                    aria-label={question.title}
                    data-testid="select-business-industry"
                    value={currentAnswer}
                    onChange={(event) => chooseAnswer(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm text-[#092b45] focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="" disabled>Select your business type</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  question.options.map((option) => {
                    const selected = currentAnswer === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={selected}
                        data-testid={`button-answer-${step}-${question.options.indexOf(option)}`}
                        onClick={() => chooseAnswer(option)}
                        className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors ${
                          selected
                            ? "border-emerald-600 bg-emerald-50 text-[#092b45] ring-1 ring-emerald-600"
                            : "border-slate-200 bg-white text-[#092b45] hover:border-emerald-500 hover:bg-emerald-50/40"
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected ? "border-emerald-700 bg-emerald-700" : "border-slate-300"
                        }`}>
                          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                <button
                  type="button"
                  onClick={() => setStep((previous) => Math.max(0, previous - 1))}
                  disabled={step === 0}
                  data-testid="button-question-back"
                  className="inline-flex items-center gap-2 rounded-lg py-3 text-sm font-medium text-slate-500 hover:text-[#092b45] disabled:invisible"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={continueQuestionnaire}
                  disabled={!currentAnswer}
                  data-testid="button-question-continue"
                  className="inline-flex items-center gap-3 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {step === QUESTIONS.length - 1 ? "See my starting point" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-5 border-t border-slate-100 pt-4 text-[11px] leading-5 text-slate-500">
                No contact details needed. Your answers stay in this browser tab and are not saved or sent to Masakhe. You’ll create your account on the next page.
              </p>
            </>
          ) : (
            <div className="flex flex-1 flex-col">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-emerald-700">Your business starting point</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2
                  ref={resultHeading}
                  tabIndex={-1}
                  className="text-2xl font-semibold tracking-tight text-[#092b45] outline-none sm:text-3xl"
                >
                  A clearer next step.
                </h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Start with {answers.priority?.toLowerCase()}, then explore the tools that support your next goal.
              </p>
              <p data-testid="text-questionnaire-summary" className="mt-2 text-xs text-slate-500">
                {answers.industry} · {answers.team} · {answers.stage}
              </p>

              <div className="my-5 grid gap-3">
                {recommendations.map((recommendation, index) => (
                  <div key={recommendation.title} data-testid={`card-recommendation-${index}`} className="grid grid-cols-[30px_1fr] gap-3 rounded-xl bg-[#f3f8f5] p-4">
                    <span className="pt-0.5 text-xs font-extrabold text-emerald-700">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong className="text-sm text-[#092b45]">{recommendation.title}</strong>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{recommendation.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <Link
                  to={signupPath}
                  data-testid="link-questionnaire-signup"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Continue to free signup <ArrowUpRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Core Masakhe access is free. No subscription or trial is required.
                </p>
                <button
                  type="button"
                  onClick={reviewAnswers}
                  data-testid="button-questionnaire-review"
                  className="mx-auto mt-4 flex items-center gap-2 text-xs font-medium text-[#092b45] underline underline-offset-4"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Review my answers
                </button>
              </div>
              <p className="mt-4 border-t border-slate-100 pt-4 text-[11px] leading-5 text-slate-500">
                Your suggestions are a starting point, not a business assessment or guarantee. Your answers are not transferred to your account.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pb-6 text-[11px] text-slate-500 sm:px-8">
        <span>© {new Date().getFullYear()} Masakhe · SME Builder</span>
        <span>Explore your tools. Take your next step.</span>
        <Link to="/privacy" data-testid="link-questionnaire-privacy" className="underline underline-offset-2 hover:text-[#092b45]">
          Privacy policy
        </Link>
      </footer>
    </div>
  );
}
