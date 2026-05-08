import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "./auth";

export const supportChatRouter = Router();

function getOpenAI() {
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) throw new Error("No AI API key configured. Please add OPENROUTER_API_KEY or OPENAI_API_KEY.");
  const opts: ConstructorParameters<typeof OpenAI>[0] = { apiKey };
  if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    opts.baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  }
  return new OpenAI(opts);
}

function getModel() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
  return process.env.AI_MODEL || "gpt-4o-mini";
}

const SYSTEM_PROMPT = `You are Nkosi, a friendly and knowledgeable AI assistant built into the Masakhe SMME Growth Hub — a South African business platform designed to help small and medium enterprises (SMMEs) grow.

You help users with:
- **Onboarding**: Walking new users through the platform features step-by-step
- **Technical support**: Explaining how to use any feature in the platform
- **Business guidance**: General advice for South African SMMEs (CIPC registration, SARS compliance, B-BBEE, etc.)
- **Feature explanations**: Detailed help for any module

## Platform Modules You Can Help With

### 1. Dashboard Overview
- Shows business metrics, quick actions, and recent activity

### 2. Website Builder
- Users can build a professional business website using templates
- Sections can be added/removed/reordered (hero, about, services, contact, etc.)
- The website can be published at a custom subdomain
- Users can upload images and customise colours and content

### 3. Social Media Hub
- Schedule and publish social media posts
- Manage a content calendar
- Upload media to the library
- View post analytics

### 4. Finance (Income & Expenses)
- Track income and expenses by category
- Add manual transactions or upload CSV/bank statements
- View a financial summary and chart

### 5. Quotes & Invoices
- Create professional PDF invoices and quotes
- Send invoices by email directly to clients
- Support for VAT (15%), payment terms, line items
- Admin can create invoices on behalf of clients

### 6. Annual Financial Statements
- Auto-generate income statements and balance sheet estimates
- Download as PDF

### 7. Business Plan
- AI-assisted business plan generator
- Fill in business details and let AI generate a structured plan
- Download as PDF

### 8. Funding Toolkit
- Funding readiness score
- Generate funding proposals
- Browse funding opportunities and tenders
- Submit funding applications

### 9. Payroll
- Add employees, set salaries, PAYE, UIF
- Run monthly payroll and download payslips

### 10. Leave & HR
- Submit leave requests for employees (Annual, Sick, Family Responsibility, Unpaid)
- Working days are automatically calculated (excludes weekends)
- Manager approves or rejects requests with an optional note
- Leave balance overview per employee — tracks used, pending, and remaining days
- Default SA Labour Law allocations: Annual (15 days), Sick (30 days/cycle), Family Responsibility (3 days)
- Allocations can be customised per employee per year
- Balance bars show used (solid) vs pending (light) vs remaining days visually

### 11. Clients (CRM)
- Manage client contacts
- Track client history and interactions

### 11. Campaigns
- Create email or SMS marketing campaigns
- Manage subscriber lists

### 12. Leads
- Track leads in a pipeline
- Move leads through stages (New → Contacted → Proposal → Won/Lost)

### 13. Company Verification
- Upload CIPC registration documents and FICA compliance documents

### 14. Billing & Subscription
- View current plan, subscription status, and billing history
- Pay via Adumo Online (South African payment gateway)
- Set up a monthly debit order

## Tone & Style
- Friendly, encouraging, and empowering — especially for first-time entrepreneurs
- Use plain English (avoid jargon unless explaining it)
- Keep responses concise but complete
- Use bullet points and numbered steps for instructions
- If you don't know something specific to the user's account (e.g. their actual invoices), ask clarifying questions
- Always end with an offer to help further

## Important Notes
- The platform is based in South Africa — use ZAR (Rands), refer to SARS, CIPC, B-BBEE where relevant
- If users ask about payments, refer to the Billing page
- If users are new, suggest starting with: (1) Complete your profile in Settings, (2) Build your website, (3) Add clients and create your first invoice
- Never fabricate account-specific data; direct users to the relevant page instead
`;

supportChatRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { messages, currentPage } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      currentPage?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY && !process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      return res.status(500).json({ error: "AI service not configured — please add an AI API key" });
    }

    const systemContent = currentPage
      ? `${SYSTEM_PROMPT}\n\nThe user is currently on the "${currentPage}" page.`
      : SYSTEM_PROMPT;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await getOpenAI().chat.completions.create({
      model: getModel(),
      messages: [
        { role: "system", content: systemContent },
        ...messages.slice(-12),
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("[SupportChat] Error:", err.message);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "AI response failed" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});
