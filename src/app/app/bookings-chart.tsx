import { formatDate } from "@/lib/utils";

interface Props {
  bookings: { createdAt: Date }[];
  rangeDays: number;
}

/**
 * Hand-rolled SVG bar chart of bookings per day across the selected window.
 * Server-rendered, no chart lib. Auto-scales the Y axis and labels first / last day.
 */
export function BookingsChart({ bookings, rangeDays }: Props) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (rangeDays - 1));

  const buckets = new Array<number>(rangeDays).fill(0);
  for (const b of bookings) {
    const diff = Math.floor((+b.createdAt - +start) / 86_400_000);
    if (diff >= 0 && diff < rangeDays) buckets[diff] += 1;
  }
  const max = Math.max(1, ...buckets);

  const W = 720;
  const H = 140;
  const PADDING = 24;
  const innerW = W - PADDING * 2;
  const innerH = H - PADDING - 18;
  const barGap = rangeDays > 30 ? 1 : 2;
  const barW = (innerW - barGap * (rangeDays - 1)) / rangeDays;

  const endLabel = formatDate(now).split(",")[0];
  const startLabel = formatDate(start).split(",")[0];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Bookings per day, last ${rangeDays} days`}
        className="w-full max-w-full text-primary"
      >
        <line
          x1={PADDING}
          y1={PADDING + innerH}
          x2={W - PADDING}
          y2={PADDING + innerH}
          stroke="currentColor"
          strokeOpacity={0.15}
        />
        {buckets.map((count, i) => {
          const h = (count / max) * innerH;
          const x = PADDING + i * (barW + barGap);
          const y = PADDING + innerH - h;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={Math.min(2, barW / 2)}
                fill="currentColor"
                fillOpacity={count > 0 ? 0.85 : 0.12}
              >
                <title>{`${count} booking${count === 1 ? "" : "s"}`}</title>
              </rect>
            </g>
          );
        })}
        <text
          x={PADDING}
          y={H - 4}
          fontSize={10}
          fill="currentColor"
          fillOpacity={0.6}
        >
          {startLabel}
        </text>
        <text
          x={W - PADDING}
          y={H - 4}
          fontSize={10}
          textAnchor="end"
          fill="currentColor"
          fillOpacity={0.6}
        >
          {endLabel}
        </text>
        <text
          x={W - PADDING}
          y={PADDING - 8}
          fontSize={10}
          textAnchor="end"
          fill="currentColor"
          fillOpacity={0.6}
        >
          peak {max}/day
        </text>
      </svg>
    </div>
  );
}
