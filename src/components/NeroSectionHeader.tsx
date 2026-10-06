import type { ReactNode } from "react";

type NeroSectionHeaderProps = {
  section: string;
  title: string;
  description: string;
  actions?: ReactNode;
  backgroundImage?: string;
  backgroundOverlay?: string;
  backgroundPosition?: string;
};

export default function NeroSectionHeader({
  section,
  title,
  description,
  actions,
  backgroundImage,
  backgroundOverlay = "90deg, rgba(7, 44, 35, 0.93) 0%, rgba(9, 68, 72, 0.78) 52%, rgba(10, 40, 61, 0.62) 100%",
  backgroundPosition = "center 43%",
}: NeroSectionHeaderProps) {
  return (
    <header
      className={`relative isolate overflow-hidden border-b border-slate-900/20 bg-[#0f172a] py-6 text-white md:py-7 ${backgroundImage ? "px-4 sm:px-6" : "px-6 md:px-8"}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(${backgroundOverlay}), url(${backgroundImage})`,
        backgroundPosition,
        backgroundSize: "cover",
      } : undefined}
    >
      {!backgroundImage && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.25),_transparent_70%)]"
        />
      )}
      <div className={`relative mx-auto flex flex-col justify-between gap-5 sm:flex-row sm:items-center ${backgroundImage ? "max-w-6xl" : "max-w-7xl"}`}>
        <div className="min-w-0">
          <p className={`mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${backgroundImage ? "text-emerald-100/80" : "text-blue-300"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${backgroundImage ? "bg-emerald-300" : "bg-blue-400"}`} />
            {section}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            {title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-300">
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
