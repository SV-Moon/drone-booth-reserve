import { BOOTHS, TIME_SLOTS, slotLabel } from '../utils/booking'

export default function BoothScheduleGrid({ bookings, onSelectSlot }) {
  const isReserved = (boothId, slot) =>
    bookings.some((b) => b.booth === boothId && b.start_time.slice(0, 5) === slot)

  return (
    <div className="overflow-x-auto rounded-lg border border-radar-border bg-radar-panel">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-radar-border p-3 text-left font-semibold text-slate-400">
              시간
            </th>
            {BOOTHS.map((booth) => (
              <th
                key={booth.id}
                className="border-b border-radar-border p-3 text-center font-semibold text-radar-cyan"
              >
                {booth.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot) => (
            <tr key={slot} className="border-b border-radar-border last:border-b-0">
              <td className="p-3 font-mono text-slate-300">{slotLabel(slot)}</td>
              {BOOTHS.map((booth) => {
                const reserved = isReserved(booth.id, slot)
                return (
                  <td key={booth.id} className="p-2 text-center">
                    <button
                      type="button"
                      disabled={reserved}
                      onClick={() => onSelectSlot(booth.id, slot)}
                      className={
                        reserved
                          ? 'w-full cursor-not-allowed rounded-md border border-slate-700 bg-slate-800/60 py-2 text-slate-500'
                          : 'w-full rounded-md border border-radar-amber/50 bg-radar-amber/10 py-2 font-semibold text-radar-amber transition hover:bg-radar-amber/20'
                      }
                    >
                      {reserved ? '예약 마감' : '예약 가능'}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
