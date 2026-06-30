import { Helmet } from "react-helmet-async";
import { Shield, CheckCircle2 } from "lucide-react";

function SectionCard({
  number,
  title,
  inviteEmail,
  accessList,
  notSetupList,
}: {
  number: number;
  title: string;
  inviteEmail: string;
  accessList: string[];
  notSetupList: string[];
}) {
  return (
    <div className="rounded-2xl border-2 border-teal-300 bg-white overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-teal-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white text-sm font-bold shrink-0">
          {number}
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-teal-100">
        {/* Left — already have */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-teal-700">
            If you already have {title.split(" ")[0]} set up, invite us to:
          </h3>
          <div className="inline-block rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5">
            <span className="text-sm font-mono font-medium text-gray-800">{inviteEmail}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 mb-2">Access needed:</p>
            <ul className="space-y-1.5">
              {accessList.map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — not set up yet */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-teal-700">
            If you do not have these set up yet, we will need:
          </h3>
          <ul className="space-y-1.5">
            {notSetupList.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AdRequirementsPage() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>Google & Meta Access Requirements | Masakhe</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Page header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-px flex-1 bg-teal-300 max-w-[60px]" />
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <div className="h-px flex-1 bg-teal-300 max-w-[60px]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Google &amp; Meta Access Requirements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            What Masakhe needs to get your advertising set up correctly
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="h-px flex-1 bg-teal-300 max-w-[60px]" />
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <div className="h-px flex-1 bg-teal-300 max-w-[60px]" />
          </div>
        </div>

        {/* Section 1 — Google */}
        <SectionCard
          number={1}
          title="Google Advertising"
          inviteEmail="wearecyborgdigital@gmail.com"
          accessList={[
            "Google Ads",
            "Google Analytics / GA4",
            "Google Tag Manager",
            "Google Merchant Center (online stores only)",
          ]}
          notSetupList={[
            "Business name and website link",
            "Google email that must own the account",
            "Website/backend access for tracking setup",
            "Billing details added by the client",
            "Masakhe recommends the ad budget",
            "Products or services you want to advertise",
          ]}
        />

        {/* Section 2 — Meta */}
        <SectionCard
          number={2}
          title="Meta Advertising"
          inviteEmail="catherineslatermusic@gmail.com"
          accessList={[
            "Meta Business Manager / Business Suite",
            "Facebook Page",
            "Instagram Account",
            "Ad Account",
            "Pixel / Dataset",
            "Catalogue (online stores only)",
          ]}
          notSetupList={[
            "Business name and website link",
            "Facebook Page and Instagram access",
            "Email that must own the Meta account",
            "Website/backend access for tracking setup",
            "Billing details added by the client",
            "Masakhe recommends the ad budget",
            "What you want to advertise",
          ]}
        />

        {/* Important notice */}
        <div className="flex items-start gap-4 rounded-2xl border-2 border-teal-200 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-800 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900 shrink-0 mt-0.5">
            <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
              <span className="font-bold">Important: </span>
              Please do not send passwords.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
              Your business remains the owner of all accounts.
            </p>
          </div>
        </div>

        {/* Checklist helper */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base">
            Before contacting us, check you have:
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Admin access to your Google or Meta account",
              "Your business website URL ready",
              "Your business email address",
              "A clear idea of your target audience",
              "Your monthly advertising budget in mind",
              "A list of products/services to advertise",
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
