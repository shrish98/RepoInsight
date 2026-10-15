// The coloured bar from the top of a GitHub repo page, with a legend underneath.
export default function LanguageBar({ shares }) {
  return (
    <>
      <div className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={shares.map((s) => `${s.name} ${s.percent.toFixed(1)}%`).join(', ')}>
        {shares.map((s, i) => (
          <span key={s.name} className="fill-up h-full" style={{ flex: s.percent, background: s.color, '--d': `${0.15 + i * 0.08}s` }} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-2">
        {shares.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="font-semibold text-ink">{s.name}</span>
            {s.percent.toFixed(1)}%
          </li>
        ))}
      </ul>
    </>
  );
}
