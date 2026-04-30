import Link from 'next/link';

/**
 * Reusable empty state component.
 * @param {string} icon - Emoji icon
 * @param {string} title - Main message
 * @param {string} subtitle - Secondary message
 * @param {string} actionLabel - Optional CTA button label
 * @param {string} actionHref - Optional CTA button link
 */
export default function EmptyState({ icon = '🏠', title, subtitle, actionLabel, actionHref, actionOnClick }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white border border-dashed border-[#e2ddd8] rounded-2xl mx-auto max-w-sm">
      <div className="w-20 h-20 bg-[#f7f4f0] border border-[#e8e2db] rounded-2xl flex items-center justify-center mb-6 transition-transform hover:scale-105 duration-300">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-[#1a1815] mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-black max-w-xs leading-relaxed">{subtitle}</p>}
      {actionLabel && actionOnClick ? (
        <button
          onClick={actionOnClick}
          className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-[#1a1815] text-white text-sm font-bold rounded-xl hover:bg-[#2e2a25] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
        >
          {actionLabel}
        </button>
      ) : actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-[#1a1815] text-white text-sm font-bold rounded-xl hover:bg-[#2e2a25] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
