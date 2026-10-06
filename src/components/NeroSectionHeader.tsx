import type { ReactNode } from "react";

type NeroSectionHeaderProps = {
  section: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function NeroSectionHeader({
  section,
  title,
  description,
  actions,
}: NeroSectionHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-slate-800 bg-[#0f172a] px-6 py-6 text-white md:px-8 md:py-7">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.25),_transparent_70%)]"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
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
