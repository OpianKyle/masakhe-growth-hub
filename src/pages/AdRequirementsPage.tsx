import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

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
    <div className="rounded-xl border-2 border-teal-400 bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white text-sm font-black shrink-0">
          {number}
        </div>
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">{title}</h2>
      </div>

      {/* Divider */}
      <div className="border-t border-teal-200" />

      {/* Two columns */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-teal-200">
        {/* Left — already have */}
        <div className="p-5 space-y-3">
          <p className="text-sm font-bold text-teal-700 leading-snug">
            If you already have {title.split(" ")[0]} set up,<br />invite us to:
          </p>
          <div className="inline-block rounded border border-gray-300 bg-white px-3 py-2 text-sm font-mono text-gray-800">
            {inviteEmail}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1.5">Access needed:</p>
            <ul className="space-y-1">
              {accessList.map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — not set up yet */}
        <div className="p-5 space-y-3">
          <p className="text-sm font-bold text-teal-700 leading-snug">
            If you do not have these set up<br />yet, we will need:
          </p>
          <ul className="space-y-1">
            {notSetupList.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
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
    <div className="min-h-screen bg-white text-foreground">
      <Helmet>
        <title>Google & Meta Access Requirements | Masakhe</title>
        <meta name="description" content="What Masakhe needs to get your Google and Meta advertising set up correctly." />
      </Helmet>

      {/* Minimal header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-7 w-7 object-contain" />
            <span className="text-base font-bold text-gray-900">Masakhe</span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Document body */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Page title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-500 mb-1">
            <div className="h-px w-10 bg-teal-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <div className="h-px w-10 bg-teal-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-tight leading-tight">
            Google &amp; Meta Access Requirements
          </h1>
          <p className="text-gray-500 text-sm">
            What Masakhe needs to get your advertising set up correctly
          </p>
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
        <div className="flex items-center gap-4 rounded-xl border-2 border-teal-300 bg-white px-5 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-teal-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            <span className="font-bold">Important:</span>{" "}
            Please do not send passwords.{" "}
            <span className="text-gray-500">Your business remains the owner of all accounts.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
