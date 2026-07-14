import { isBookableDate, todayStr, weekdayName } from '../utils/booking'

export default function DateSelector({ value, onChange }) {
  const bookable = isBookableDate(value)

  return (
    <div className="rounded-lg border border-radar-border bg-radar-panel p-4">
      <label className="mb-2 block text-sm font-semibold tracking-wide text-radar-cyan">
        예약 날짜 선택
      </label>
      <input
        type="date"
        value={value}
        min={todayStr()}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-radar-border bg-[#0a0e17] px-3 py-2 font-mono text-slate-100 outline-none focus:border-radar-cyan focus:ring-1 focus:ring-radar-cyan"
      />

      <p className="mt-2 text-xs text-slate-400">
        운영 요일: 화요일 · 수요일 · 목요일 (13:00 ~ 17:00)
      </p>

      {value && !bookable && (
        <p className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {weekdayName(value)}요일은 예약할 수 없습니다. 화·수·목요일 중에서 선택해주세요.
        </p>
      )}

      {value && bookable && (
        <p className="mt-2 rounded-md border border-radar-amber/40 bg-radar-amber/10 px-3 py-2 text-sm text-radar-amber">
          {value} ({weekdayName(value)}요일) 예약 가능한 시간표를 아래에서 확인하세요.
        </p>
      )}
    </div>
  )
}
