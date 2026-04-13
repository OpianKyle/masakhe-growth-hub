import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Shield, ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Privacy Policy | Masakhe SMME Platform</title>
        <meta name="description" content="Read the Masakhe privacy policy. Learn how we collect, use, and protect your personal and business data on the Masakhe SMME platform." />
        <link rel="canonical" href="https://masakheportal.co.za/privacy" />
      </Helmet>
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
              <span className="text-sm font-bold text-primary-foreground font-heading">M</span>
            </div>
            <span className="text-lg font-bold font-heading text-foreground">Masakhe</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-muted/40 border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">POPIA Compliant</span>
          </div>
          <h1 className="text-4xl font-extrabold font-heading mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-base">Last updated: March 2026 · Effective date: 1 January 2025</p>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl">
            This Privacy Policy explains how Masakhe collects, uses, and protects your personal information in compliance with the
            Protection of Personal Information Act 4 of 2013 (POPIA) of South Africa.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12 max-w-3xl space-y-10">

        {/* 1. Who We Are */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">1. Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed">
            Masakhe is a South African digital business platform designed to empower Small, Medium, and Micro Enterprises (SMMEs)
            through technology. We provide tools for website building, social media management, financial invoicing, funding
            readiness, and company verification.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            For the purposes of POPIA, Masakhe acts as the <strong className="text-foreground">Responsible Party</strong> in
            respect of personal information collected through this platform.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Information Officer:</strong> Masakhe Compliance Team</p>
            <p><strong className="text-foreground">Email:</strong> privacy@masakheportal.co.za</p>
            <p><strong className="text-foreground">Country of Operation:</strong> Republic of South Africa</p>
          </div>
        </div>

        {/* 2. Information We Collect */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We collect only the personal information necessary to provide and improve our services. This includes:
          </p>
          <div className="space-y-4">
            {[
              {
                title: "Account & Identity Information",
                items: ["Full name and email address", "Business name and registration number (CIPC format)", "Password (stored in encrypted, hashed form — we never store plain-text passwords)"],
              },
              {
                title: "Business Information",
                items: ["Company registration details and entity type", "Industry sector and business description", "Logo and branding assets uploaded to the platform"],
              },
              {
                title: "Financial Information",
                items: ["Billing details processed via Adumo Online (our payment processor)", "Invoice data you create within the platform (client names, amounts, descriptions)", "Subscription status and payment history"],
              },
              {
                title: "Usage & Technical Data",
                items: ["Pages visited and features used within the platform", "Device type, browser, and IP address (for security and fraud prevention)", "Session data and authentication tokens (stored securely)"],
              },
              {
                title: "Social Media Tokens",
                items: ["If you connect Facebook or Instagram accounts, we store encrypted OAuth access tokens", "We never store your social media passwords — connection is via official OAuth 2.0 flows", "Tokens are used solely to publish content on your behalf"],
              },
            ].map(section => (
              <div key={section.title} className="rounded-xl border border-border p-4">
                <h3 className="font-semibold text-foreground mb-2">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map(item => (
                    <li key={item} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 3. How We Use Your Information */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">We use your personal information to:</p>
          <ul className="space-y-2">
            {[
              "Create and manage your Masakhe account and workspace",
              "Provide, operate, and improve all platform features",
              "Process subscription payments and generate invoices",
              "Send transactional emails (account confirmations, password resets, payment receipts)",
              "Verify your company registration details through public records and AI-assisted checks",
              "Publish social media content to connected accounts on your instruction",
              "Detect, investigate, and prevent fraudulent or unauthorised activity",
              "Comply with South African legal obligations, including POPIA and tax legislation",
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4 text-sm">
            We do not use your personal information for automated profiling that produces legal effects or significantly affects you
            without your explicit consent.
          </p>
        </div>

        {/* 4. Legal Basis for Processing */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">4. Legal Basis for Processing</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Under POPIA, we process your personal information based on the following lawful grounds:
          </p>
          <div className="space-y-3">
            {[
              { basis: "Contractual necessity", desc: "Processing required to fulfil our agreement to provide the Masakhe platform to you." },
              { basis: "Legitimate interest", desc: "Security monitoring, fraud prevention, and platform improvement, where these do not override your rights." },
              { basis: "Consent", desc: "Where you explicitly authorise specific processing, such as connecting social media accounts or receiving marketing communications." },
              { basis: "Legal obligation", desc: "Compliance with South African tax, financial, and regulatory requirements." },
            ].map(item => (
              <div key={item.basis} className="flex gap-3 text-sm">
                <span className="font-semibold text-foreground shrink-0 w-48">{item.basis}</span>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Sharing Your Information */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">5. Sharing Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not sell your personal information. We share it only in the following limited circumstances:
          </p>
          <div className="space-y-4">
            {[
              {
                party: "Adumo Online (Payment Processing)",
                detail: "Billing and payment card data is handled by Adumo Online, a PCI-DSS-compliant South African payment gateway. We do not store card numbers on our servers.",
              },
              {
                party: "Meta Platforms (Facebook & Instagram)",
                detail: "If you connect social media accounts, your content is transmitted to Meta's APIs using your authorised access token. This is governed by Meta's Privacy Policy.",
              },
              {
                party: "OpenAI (AI Features)",
                detail: "Certain AI-assisted features (company verification, document drafting) may submit limited business context to OpenAI's API. No sensitive personal identifiers are submitted.",
              },
              {
                party: "Xneelo (Hosting & Database)",
                detail: "Your data is stored on servers hosted in South Africa by Xneelo, an accredited South African hosting provider.",
              },
              {
                party: "Legal Authorities",
                detail: "We will disclose personal information if required by South African law, court order, or to protect the rights and safety of our users or the public.",
              },
            ].map(item => (
              <div key={item.party} className="rounded-xl border border-border p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{item.party}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Data Retention */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">6. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal information for as long as your account is active or as needed to provide services. After
            account closure:
          </p>
          <ul className="space-y-2 mt-3">
            {[
              "Account data is retained for 12 months to allow reactivation, then permanently deleted",
              "Financial records (invoices, payment history) are retained for 5 years in compliance with SARS requirements",
              "Social media tokens are deleted immediately upon disconnecting an account",
              "Backup data may persist for up to 90 days before being purged from backup systems",
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 7. Your Rights Under POPIA */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">7. Your Rights Under POPIA</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            As a data subject under the Protection of Personal Information Act, you have the following rights:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { right: "Right of Access", desc: "Request a copy of the personal information we hold about you." },
              { right: "Right to Correction", desc: "Request correction of inaccurate or incomplete personal information." },
              { right: "Right to Deletion", desc: "Request deletion of your personal information, subject to retention obligations." },
              { right: "Right to Object", desc: "Object to the processing of your personal information in certain circumstances." },
              { right: "Right to Withdraw Consent", desc: "Withdraw consent at any time where processing is based on consent." },
              { right: "Right to Lodge a Complaint", desc: "Lodge a complaint with the Information Regulator of South Africa." },
            ].map(item => (
              <div key={item.right} className="rounded-xl border border-border p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{item.right}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            To exercise any of these rights, email us at <strong className="text-foreground">privacy@masakheportal.co.za</strong>.
            We will respond within 30 days as required by POPIA.
          </p>
          <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Information Regulator of South Africa</p>
            <p>Website: <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.justice.gov.za/inforeg</a></p>
            <p>Email: inforeg@justice.gov.za</p>
          </div>
        </div>

        {/* 8. Security */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">8. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate technical and organisational measures to protect your personal information against
            unauthorised access, loss, or disclosure. These include:
          </p>
          <ul className="space-y-2 mt-3">
            {[
              "All data transmitted over HTTPS using TLS encryption",
              "Passwords hashed using bcrypt with salting — plain-text passwords are never stored",
              "Social media access tokens encrypted at rest using AES encryption",
              "Session data secured with HTTP-only cookies and CSRF protection",
              "Database access restricted to application servers only — no direct public access",
              "Regular security reviews and dependency updates",
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            If you discover a security vulnerability, please report it responsibly to{" "}
            <strong className="text-foreground">security@masakheportal.co.za</strong>.
          </p>
        </div>

        {/* 9. Cookies */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">9. Cookies & Session Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use session cookies to maintain your logged-in state. These are essential cookies required for the platform to
            function. We do not use third-party advertising cookies or tracking pixels on the platform itself.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            The landing and marketing pages may include basic analytics to understand page traffic. No personally identifiable
            information is collected through these analytics without your consent.
          </p>
        </div>

        {/* 10. Children */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">10. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Masakhe is a business platform intended for use by individuals 18 years and older. We do not knowingly collect
            personal information from anyone under the age of 18. If you believe a minor has provided us with personal
            information, please contact us immediately at <strong className="text-foreground">privacy@masakheportal.co.za</strong>.
          </p>
        </div>

        {/* 11. Changes */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">11. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations.
            When we make material changes, we will notify you via email or a prominent notice within the platform at least
            14 days before the changes take effect. The "Last updated" date at the top of this page will always reflect the
            most recent revision.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Continued use of the platform after the effective date constitutes acceptance of the updated policy.
          </p>
        </div>

        {/* 12. Contact */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">12. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            For any privacy-related enquiries, to exercise your POPIA rights, or to report a concern, please contact our
            Information Officer:
          </p>
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-2 text-sm">
            <p><strong className="text-foreground">Company:</strong> <span className="text-muted-foreground">Masakhe Digital Platform</span></p>
            <p><strong className="text-foreground">Email:</strong> <a href="mailto:privacy@masakheportal.co.za" className="text-primary hover:underline">privacy@masakheportal.co.za</a></p>
            <p><strong className="text-foreground">Jurisdiction:</strong> <span className="text-muted-foreground">Republic of South Africa</span></p>
          </div>
        </div>

        {/* SA flag stripe */}
        <div className="flex h-1 rounded-full overflow-hidden">
          <div className="flex-1 bg-sa-green" />
          <div className="flex-1 bg-sa-gold" />
          <div className="flex-1 bg-sa-red" />
          <div className="flex-1 bg-sa-blue" />
          <div className="flex-1 bg-sa-black" />
        </div>

        <p className="text-xs text-muted-foreground text-center pb-8">
          © 2026 Masakhe. This Privacy Policy is governed by the laws of the Republic of South Africa.
        </p>
      </section>
    </div>
  );
}
