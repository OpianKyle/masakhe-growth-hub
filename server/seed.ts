import { sqlite } from "./db";
import { randomUUID } from "crypto";

function now() { return new Date().toISOString(); }

export function seedIfEmpty() {
  const tableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='onboarding_flows'").get();
  if (!tableCheck) return;

  const flowCount = sqlite.prepare(`SELECT COUNT(*) as c FROM onboarding_flows`).get() as any;
  if (flowCount.c > 0) return;

  const flowId = "flow_default";
  sqlite.prepare(`INSERT INTO onboarding_flows (id, name, active, created_at) VALUES (?, ?, ?, ?)`)
    .run(flowId, "Masakhe Smart Registration", 1, now());

  const steps = [
    {
      step_key: "welcome",
      title: "Welcome to Masakhe",
      description: "Choose your registration path.",
      order_index: 1,
      condition_json: null,
      fields_json: JSON.stringify([
        {
          name: "journey",
          label: "I am…",
          type: "radio",
          required: true,
          options: [
            { label: "Registered business (I have a reg number)", value: "registered" },
            { label: "Still registering", value: "registering" },
            { label: "Informal trader / spaza", value: "informal" },
          ],
        }
      ]),
    },
    {
      step_key: "identity",
      title: "Identity",
      description: "Enter SA ID number for verification (stub).",
      order_index: 2,
      condition_json: null,
      fields_json: JSON.stringify([
        { name: "saId", label: "South African ID Number", type: "text", required: true, placeholder: "e.g. 9001015009087" },
        { name: "skipVerify", label: "Continue without verification", type: "checkbox", required: false },
      ]),
    },
    {
      step_key: "cipc",
      title: "Business Lookup",
      description: "Lookup using CIPC registration number (stub).",
      order_index: 3,
      condition_json: JSON.stringify({ equals: [{ field: "journey", value: "registered" }] }),
      fields_json: JSON.stringify([
        { name: "registrationNumber", label: "CIPC Registration Number", type: "text", required: true, placeholder: "YYYY/NNNNNN/07" },
        { name: "businessName", label: "Company Name", type: "text", required: false },
        { name: "tradingName", label: "Trading Name", type: "text", required: false },
      ]),
    },
    {
      step_key: "profile",
      title: "Business Profile",
      description: "Tell us about the business.",
      order_index: 4,
      condition_json: null,
      fields_json: JSON.stringify([
        { name: "businessType", label: "Business Type", type: "select", required: true, options: [
          { label: "Pty Ltd", value: "pty" },
          { label: "CC", value: "cc" },
          { label: "Sole Proprietor", value: "sole" },
          { label: "Non-Profit", value: "npo" },
          { label: "Informal", value: "informal" },
        ]},
        { name: "industrySector", label: "Industry Sector", type: "select", required: true, options: [
          { label: "Retail", value: "retail" },
          { label: "Services", value: "services" },
          { label: "Construction", value: "construction" },
          { label: "Agriculture", value: "agriculture" },
          { label: "Manufacturing", value: "manufacturing" },
        ]},
        { name: "yearsOperating", label: "Years Operating", type: "number", required: false },
        { name: "employeeCount", label: "Employee Count", type: "number", required: false },
        { name: "phone", label: "Phone", type: "text", required: true, placeholder: "+27..." },
        { name: "email", label: "Email", type: "text", required: true, placeholder: "name@domain.com" },
        { name: "addressPhysical", label: "Physical Address", type: "text", required: true },
      ]),
    },
    {
      step_key: "banking",
      title: "Banking (Optional for MVP)",
      description: "Add banking details.",
      order_index: 5,
      condition_json: null,
      fields_json: JSON.stringify([
        { name: "bankName", label: "Bank", type: "text", required: false },
        { name: "accountType", label: "Account Type", type: "select", required: false, options: [
          { label: "Cheque", value: "cheque" },
          { label: "Savings", value: "savings" },
          { label: "Business", value: "business" },
        ]},
        { name: "accountNumber", label: "Account Number", type: "text", required: false },
        { name: "branchCode", label: "Branch Code", type: "text", required: false },
      ]),
    },
    {
      step_key: "review",
      title: "Review & Submit",
      description: "Confirm and submit.",
      order_index: 6,
      condition_json: null,
      fields_json: JSON.stringify([
        { name: "popiaConsent", label: "I consent to POPIA terms", type: "checkbox", required: true },
      ]),
    },
  ];

  const insertStep = sqlite.prepare(`
    INSERT INTO onboarding_steps
    (id, flow_id, step_key, title, description, order_index, condition_json, fields_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of steps) {
    insertStep.run(randomUUID(), flowId, s.step_key, s.title, s.description, s.order_index, s.condition_json, s.fields_json);
  }

  const pages = [
    { id: "p_web", route: "/website-builder", title: "AI Website Builder", description: "Generate and manage your website draft." },
    { id: "p_social", route: "/social-media", title: "Social Media Launch", description: "Launch pack and content calendar." },
    { id: "p_comms", route: "/communications", title: "Communication Hub", description: "Unified inbox and auto replies." },
    { id: "p_campaign", route: "/campaigns", title: "Campaign Builder", description: "Budget -> creatives -> tracking (mock)." },
    { id: "p_books", route: "/bookkeeping", title: "Bookkeeping Lite", description: "Transactions, categorization, invoices." },
    { id: "p_tax", route: "/tax", title: "SARS Compliance", description: "Returns dashboard, health score (mock)." },
    { id: "p_gov", route: "/gov/dashboard", title: "Government Analytics", description: "Adoption + compliance stats (mock)." },
  ];

  const insPage = sqlite.prepare(`INSERT INTO page_definitions (id, route, title, description, created_at) VALUES (?, ?, ?, ?, ?)`);
  const insSection = sqlite.prepare(`INSERT INTO page_sections (id, page_id, section_type, order_index, config_json) VALUES (?, ?, ?, ?, ?)`);

  for (const p of pages) insPage.run(p.id, p.route, p.title, p.description, now());

  insSection.run(randomUUID(), "p_web", "stats", 1, JSON.stringify({
    cards: [
      { label: "Website Status", value: "Draft" },
      { label: "Pages", value: "4" },
      { label: "Leads (30d)", value: "36" },
      { label: "SEO Score", value: "72/100" }
    ]
  }));
  insSection.run(randomUUID(), "p_web", "wizard", 2, JSON.stringify({ wizardKey: "website_5q" }));
  insSection.run(randomUUID(), "p_web", "table", 3, JSON.stringify({
    title: "Website Draft Pages",
    columns: ["Page", "Status", "Last Updated"],
    rows: [
      ["Home", "Draft", "Today"],
      ["About", "Draft", "Yesterday"],
      ["Services", "Draft", "Today"],
      ["Contact", "Draft", "Yesterday"],
    ]
  }));

  for (const pid of ["p_social","p_comms","p_campaign","p_books","p_tax","p_gov"]) {
    insSection.run(randomUUID(), pid, "stats", 1, JSON.stringify({ cards: [
      { label: "This Week", value: "Active" },
      { label: "Tasks", value: "8" },
      { label: "Alerts", value: "2" },
      { label: "Health", value: "Good" },
    ]}));
    insSection.run(randomUUID(), pid, "cards", 2, JSON.stringify({
      title: "Quick Actions",
      items: [
        { title: "Create new", description: "Start a new workflow", action: "create" },
        { title: "Generate (mock AI)", description: "Run the generator", action: "generate" },
        { title: "View history", description: "See saved outputs", action: "history" },
      ]
    }));
  }
}
