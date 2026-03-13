import { Link } from "react-router-dom";
import { FileText, ChevronLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Legal Agreement</span>
          </div>
          <h1 className="text-4xl font-extrabold font-heading mb-3">Terms of Service</h1>
          <p className="text-muted-foreground text-base">Last updated: March 2026 · Effective date: 1 January 2025</p>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl">
            Please read these Terms of Service carefully before using the Masakhe platform. By registering or using our services,
            you agree to be bound by these terms.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12 max-w-3xl space-y-10">

        {/* 1. Acceptance */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and
            Masakhe ("we", "us", or "our"), governing your access to and use of the Masakhe platform available at
            masakheportal.co.za and related services.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            By creating an account, accessing, or using the Masakhe platform, you confirm that you have read, understood, and
            agree to be bound by these Terms and our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            If you do not agree to these Terms, you may not use the platform.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            You must be at least 18 years of age and have the legal authority to enter into this agreement on behalf of yourself
            or the business entity you represent.
          </p>
        </div>

        {/* 2. Description of Services */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">2. Description of Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Masakhe is a South African digital business platform that provides the following tools and services to Small, Medium,
            and Micro Enterprises (SMMEs):
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: "Website Builder", desc: "Create and publish a business website using customisable templates." },
              { name: "Social Media Hub", desc: "Manage and schedule posts across connected social media accounts." },
              { name: "Finance & Invoicing", desc: "Create professional invoices and track business finances." },
              { name: "Funding Toolkit", desc: "Business plans, funding proposals, readiness assessments, and applications." },
              { name: "Company Verification", desc: "Verify company registration details against CIPC format standards." },
              { name: "Annual Statements", desc: "Generate and manage financial statement documents." },
            ].map(s => (
              <div key={s.name} className="rounded-xl border border-border p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground leading-relaxed mt-4 text-sm">
            We reserve the right to modify, suspend, or discontinue any feature or service at any time with reasonable notice.
            New features will also be subject to these Terms.
          </p>
        </div>

        {/* 3. Account Registration */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">3. Account Registration</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">When creating a Masakhe account, you agree to:</p>
          <ul className="space-y-2">
            {[
              "Provide accurate, current, and complete information about yourself and your business",
              "Maintain and promptly update your account information to keep it accurate",
              "Keep your password confidential and not share access with unauthorised persons",
              "Notify us immediately at support@masakheportal.co.za if you suspect unauthorised use of your account",
              "Accept responsibility for all activity that occurs under your account",
              "Register only one account per business entity without our prior written consent",
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4 text-sm">
            We reserve the right to suspend or terminate accounts that contain false, fraudulent, or misleading information.
          </p>
        </div>

        {/* 4. Subscriptions & Billing */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">4. Subscriptions & Billing</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">4.1 Subscription Plans</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Masakhe offers subscription-based access to its platform. Plan details, pricing, and included features are
                published on our pricing page and may be updated from time to time. An active subscription is required to
                access the platform features after registration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">4.2 Payment Processing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All payments are processed securely by Adumo Online, a PCI-DSS-compliant South African payment gateway.
                By providing payment details, you authorise us to charge your chosen payment method for the applicable
                subscription fees. All prices are quoted in South African Rand (ZAR) and include VAT where applicable.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">4.3 Renewals & Cancellation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Subscriptions renew automatically at the end of each billing period unless cancelled before the renewal date.
                You may cancel your subscription at any time through your account settings. Cancellation takes effect at the
                end of the current billing period — no pro-rata refunds are issued for unused time within a paid period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">4.4 Failed Payments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If a payment fails, we will notify you and attempt to collect payment again. Continued failure to pay may
                result in suspension of your account until outstanding amounts are settled. Accounts suspended for non-payment
                for more than 60 days may be terminated and data deleted.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Acceptable Use */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">5. Acceptable Use Policy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You agree to use the Masakhe platform only for lawful purposes. You may not use the platform to:
          </p>
          <div className="space-y-2">
            {[
              "Violate any applicable South African law, regulation, or the rights of any third party",
              "Submit false, fraudulent, or misleading company registration or business information",
              "Publish, upload, or transmit content that is defamatory, offensive, obscene, or discriminatory",
              "Infringe the intellectual property rights of any person or entity",
              "Attempt to gain unauthorised access to any part of the platform or other users' accounts",
              "Introduce malware, viruses, or any other malicious code into the platform",
              "Use automated tools to scrape, crawl, or extract data from the platform without our written permission",
              "Impersonate another person, business, or entity, including Masakhe staff or other users",
              "Use the platform to send unsolicited commercial communications (spam)",
              "Engage in any activity that disrupts, overloads, or interferes with our infrastructure",
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground list-none">
                <span className="text-destructive mt-0.5 shrink-0">✕</span>
                {item}
              </li>
            ))}
          </div>
          <p className="text-muted-foreground leading-relaxed mt-4 text-sm">
            Violation of this policy may result in immediate account suspension or termination without refund.
          </p>
        </div>

        {/* 6. Your Content */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">6. Your Content</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">6.1 Ownership</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You retain full ownership of all content you create, upload, or publish through the Masakhe platform,
                including business documents, invoices, website content, and social media posts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">6.2 Licence to Masakhe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By uploading content to the platform, you grant Masakhe a limited, non-exclusive, royalty-free licence to
                store, process, and display your content solely for the purpose of providing our services to you. We do not
                use your content for marketing purposes without your explicit consent.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">6.3 Your Responsibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are solely responsible for all content you create or publish through the platform. You warrant that your
                content does not violate any law, infringe any third-party rights, or breach these Terms.
              </p>
            </div>
          </div>
        </div>

        {/* 7. Third-Party Integrations */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">7. Third-Party Integrations</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The platform integrates with third-party services including Meta (Facebook and Instagram), Adumo Online, and OpenAI.
            Your use of these integrations is subject to the respective third parties' terms of service and privacy policies.
            Masakhe is not responsible for the actions, content, or policies of third-party services.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm">
            When you connect a social media account, you authorise Masakhe to publish content on your behalf using the
            permissions you grant during the OAuth connection process. You may revoke this access at any time through
            the platform or directly through the relevant social media platform's settings.
          </p>
        </div>

        {/* 8. Intellectual Property */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">8. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All intellectual property in the Masakhe platform — including the software, design, templates, trademarks, logos,
            and written content — is owned by or licensed to Masakhe. You may not copy, reproduce, modify, distribute, or
            create derivative works from any part of the platform without our prior written permission.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            The Masakhe name and logo are trademarks. Nothing in these Terms grants you any right to use our trademarks
            without our explicit written consent.
          </p>
        </div>

        {/* 9. Disclaimer of Warranties */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">9. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Masakhe platform is provided on an <strong className="text-foreground">"as is" and "as available"</strong> basis
            without warranties of any kind, whether express or implied. We do not warrant that the platform will be uninterrupted,
            error-free, or free from harmful components.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            AI-generated content (including company verification results and document drafts) is provided for guidance only and
            does not constitute legal, financial, or regulatory advice. You should seek professional advice for formal business
            or legal decisions.
          </p>
        </div>

        {/* 10. Limitation of Liability */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">10. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by South African law, Masakhe shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising from your use of or inability to use the platform, including
            but not limited to loss of profits, data, business, or goodwill.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Our total aggregate liability to you for any claim arising from these Terms or your use of the platform shall not
            exceed the total amount you paid to us in the 3 months immediately preceding the event giving rise to the claim.
          </p>
        </div>

        {/* 11. Indemnification */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">11. Indemnification</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to indemnify, defend, and hold harmless Masakhe, its directors, employees, and agents from and against
            any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from: (a) your use
            of the platform in violation of these Terms; (b) your content; (c) your violation of any third-party rights; or
            (d) any fraudulent or illegal activity by you.
          </p>
        </div>

        {/* 12. Termination */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">12. Termination</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-2">12.1 By You</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You may close your account at any time by contacting us at support@masakheportal.co.za or through your account
                settings. Upon closure, your data will be retained for 12 months as per our Privacy Policy before deletion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">12.2 By Masakhe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may suspend or terminate your account with immediate effect if you breach these Terms, engage in fraudulent
                activity, or if required by law. We will provide reasonable notice where circumstances allow, except in cases
                of serious misconduct or security threats.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">12.3 Effect of Termination</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upon termination, your right to access the platform ceases immediately. Provisions of these Terms that by their
                nature should survive termination — including intellectual property, limitation of liability, and indemnification
                — shall remain in effect.
              </p>
            </div>
          </div>
        </div>

        {/* 13. Governing Law */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">13. Governing Law & Dispute Resolution</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of the Republic of South Africa, including
            but not limited to the Electronic Communications and Transactions Act 25 of 2002 (ECT Act), the Consumer Protection
            Act 68 of 2008 (CPA), and the Protection of Personal Information Act 4 of 2013 (POPIA).
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Any disputes arising from these Terms shall first be referred to mediation in good faith. If unresolved, disputes
            shall be subject to the exclusive jurisdiction of the South African courts.
          </p>
        </div>

        {/* 14. Changes to Terms */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">14. Changes to These Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these Terms from time to time. When we make material changes, we will notify you via email or a
            prominent notice within the platform at least 14 days before changes take effect. Your continued use of the platform
            after the effective date constitutes your acceptance of the revised Terms.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            The most recent version of these Terms will always be available at masakheportal.co.za/terms.
          </p>
        </div>

        {/* 15. Contact */}
        <div>
          <h2 className="text-2xl font-bold font-heading mb-4">15. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-2 text-sm">
            <p><strong className="text-foreground">Company:</strong> <span className="text-muted-foreground">Masakhe Digital Platform</span></p>
            <p><strong className="text-foreground">General enquiries:</strong> <a href="mailto:support@masakheportal.co.za" className="text-primary hover:underline">support@masakheportal.co.za</a></p>
            <p><strong className="text-foreground">Privacy & POPIA:</strong> <a href="mailto:privacy@masakheportal.co.za" className="text-primary hover:underline">privacy@masakheportal.co.za</a></p>
            <p><strong className="text-foreground">Legal:</strong> <a href="mailto:legal@masakheportal.co.za" className="text-primary hover:underline">legal@masakheportal.co.za</a></p>
            <p><strong className="text-foreground">Jurisdiction:</strong> <span className="text-muted-foreground">Republic of South Africa</span></p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            See also our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for information on how we handle your personal data.
          </p>
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
          © 2026 Masakhe. These Terms of Service are governed by the laws of the Republic of South Africa.
        </p>
      </section>
    </div>
  );
}
