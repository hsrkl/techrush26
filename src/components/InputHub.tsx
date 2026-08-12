import { motion } from 'framer-motion';
import type { ChipType, ErrorType } from '../App';

interface InputHubProps {
  user: number;
  setUser: (n: number) => void;
  card: number;
  setCard: (n: number) => void;
  year: number;
  setYear: (n: number) => void;
  month: number;
  setMonth: (n: number) => void;
  day: number;
  setDay: (n: number) => void;
  time: string;
  setTime: (s: string) => void;
  amount: string;
  setAmount: (s: string) => void;
  merchantName: string;
  setMerchantName: (s: string) => void;
  mcc: number;
  setMcc: (n: number) => void;
  useChip: ChipType;
  setUseChip: (c: ChipType) => void;
  errors: ErrorType;
  setErrors: (e: ErrorType) => void;
  onAudit: () => void;
  isLoading: boolean;
}

const CHIP_OPTIONS: ChipType[] = ['Swipe Transaction', 'Chip Transaction', 'Online Transaction'];
const CHIP_SHORT: Record<ChipType, string> = {
  'Swipe Transaction': 'Swipe',
  'Chip Transaction': 'Chip',
  'Online Transaction': 'Online',
};
const ERROR_OPTIONS: ErrorType[] = ['No error', 'Bad CVV', 'Bad PIN', 'Insufficient Balance', 'Bad Expiration'];

const MCC_PRESETS = [
  { label: '5411 Grocery', value: 5411 },
  { label: '5999 Misc Retail', value: 5999 },
  { label: '5732 Electronics', value: 5732 },
  { label: '5812 Dining', value: 5812 },
  { label: '4111 Transport', value: 4111 },
];

const AMOUNT_PRESETS = [
  { label: '$10', value: '$10.00' },
  { label: '$50', value: '$50.00' },
  { label: '$500', value: '$500.00' },
  { label: '$2K', value: '$2000.00' },
];

const TIME_PRESETS = [
  { label: 'Morning (09:15)', value: '09:15' },
  { label: 'Afternoon (14:30)', value: '14:30' },
  { label: 'Evening (20:00)', value: '20:00' },
  { label: 'Late Night (03:17)', value: '03:17' },
];

// Time conversion helpers
function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 822; // default 13:42
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  const clamped = Math.max(0, Math.min(1439, mins));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function InputHub({
  user,
  setUser,
  card,
  setCard,
  year,
  setYear,
  month,
  setMonth,
  day,
  setDay,
  time,
  setTime,
  amount,
  setAmount,
  merchantName,
  setMerchantName,
  mcc,
  setMcc,
  useChip,
  setUseChip,
  errors,
  setErrors,
  onAudit,
  isLoading,
}: InputHubProps) {
  const currentMinutes = timeToMinutes(time);

  return (
    <div className="space-y-6">
      {/* ── Transaction Input Grid ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── 01. Transaction Method ────────────────────────── */}
        <div className="claude-card p-5 space-y-3">
          <label className="claude-label">01. Transaction Method</label>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {CHIP_OPTIONS.map((opt) => {
              const active = useChip === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setUseChip(opt)}
                  className={`
                    py-2 px-2 text-xs font-mono rounded-md border text-center transition-all cursor-pointer
                    ${active
                      ? 'border-[#C85A32] bg-[#FAF0EC] text-[#C85A32] font-semibold shadow-xs'
                      : 'border-[#E6E1D8] bg-[#FAF8F5] text-[#78726A] hover:border-[#D8D2C7]'}
                  `}
                >
                  {CHIP_SHORT[opt]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 02. Transaction Amount ────────────────────────── */}
        <div className="claude-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <label className="claude-label">02. Transaction Amount</label>
            <div className="flex items-center gap-2">
              {AMOUNT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAmount(p.value)}
                  className={`
                    text-[11px] font-mono px-1.5 py-0.5 rounded cursor-pointer border-none bg-transparent transition-colors
                    ${amount === p.value ? 'text-[#C85A32] font-semibold underline' : 'text-[#78726A] hover:text-[#2C2A29]'}
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="claude-input-container flex items-center">
            <span className="font-serif text-lg text-[#78726A] mr-1.5">$</span>
            <input
              type="text"
              value={amount.replace(/^\$/, '')}
              onChange={(e) => setAmount(`$${e.target.value}`)}
              placeholder="0.00"
              className="claude-input font-serif text-lg font-semibold"
            />
          </div>
        </div>

        {/* ── 03. Customer & Card Vector ────────────────────── */}
        <div className="claude-card p-5 space-y-4">
          <label className="claude-label">03. Customer & Card Vector</label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">User ID</span>
              <div className="claude-input-container">
                <input
                  type="number"
                  min={0}
                  value={user}
                  onChange={(e) => setUser(Number(e.target.value) || 0)}
                  className="claude-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">Card Index</span>
              <div className="claude-input-container">
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={card}
                  onChange={(e) => setCard(Number(e.target.value) || 0)}
                  className="claude-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 04. Date Vector (Year, Month, Day) ────────────── */}
        <div className="claude-card p-5 space-y-4">
          <label className="claude-label">04. Date Vector</label>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">Year</span>
              <div className="claude-input-container">
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || 2024)}
                  className="claude-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">Month</span>
              <div className="claude-input-container">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value) || 1)}
                  className="claude-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">Day</span>
              <div className="claude-input-container">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value) || 1)}
                  className="claude-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 05. Time Slider (HH:MM Vector) ────────────────── */}
        <div className="claude-card p-5 space-y-4 md:col-span-2">
          <div className="flex justify-between items-baseline">
            <label className="claude-label">05. Time Vector Slider (24-Hour)</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#78726A]">Selected Time:</span>
              <span className="font-mono text-base font-bold text-[#C85A32] bg-[#FAF0EC] px-2.5 py-0.5 rounded border border-[#F3D7CD]">
                {time || '00:00'} HRS
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <input
              type="range"
              min={0}
              max={1439}
              step={1}
              value={currentMinutes}
              onChange={(e) => setTime(minutesToTime(Number(e.target.value)))}
              className="w-full"
            />

            {/* Time labels below slider */}
            <div className="flex justify-between text-[11px] font-mono text-[#78726A]">
              <span>00:00 (Midnight)</span>
              <span>06:00 (Morning)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Evening)</span>
              <span>23:59 (Night)</span>
            </div>

            {/* Quick time preset buttons */}
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">Quick Times:</span>
              {TIME_PRESETS.map((tp) => (
                <button
                  key={tp.label}
                  type="button"
                  onClick={() => setTime(tp.value)}
                  className={`
                    text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer border transition-colors
                    ${time === tp.value
                      ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF0EC] font-semibold'
                      : 'border-[#E6E1D8] text-[#78726A] hover:border-[#D8D2C7] bg-[#FAF8F5]'}
                  `}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 06. Merchant Details ──────────────────────────── */}
        <div className="claude-card p-5 space-y-4 md:col-span-2">
          <label className="claude-label">06. Merchant Identifiers & MCC Code</label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">Merchant Name (ID)</span>
              <div className="claude-input-container">
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="3527213246127876916"
                  className="claude-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#78726A]">MCC Code</span>
              <div className="claude-input-container">
                <input
                  type="number"
                  value={mcc}
                  onChange={(e) => setMcc(Number(e.target.value) || 0)}
                  className="claude-input"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {MCC_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setMcc(p.value)}
                    className={`
                      text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer border transition-colors
                      ${mcc === p.value
                        ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF0EC]'
                        : 'border-[#E6E1D8] text-[#78726A] hover:border-[#D8D2C7] bg-[#FAF8F5]'}
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Primary Action Button ──────────────────────────── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAudit}
          disabled={isLoading}
          className="
            w-full py-4 px-8 rounded-lg bg-[#C85A32] hover:bg-[#B24E2A] text-white
            font-medium text-base tracking-wide transition-all cursor-pointer border-none
            disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg
            flex items-center justify-center gap-3
          "
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Running GNN + XGBoost Model Inference...</span>
            </>
          ) : (
            <>
              <span>Evaluate Transaction & Calculate Fraud Score</span>
              <span className="font-mono text-xs opacity-80">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}



