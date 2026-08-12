import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputHub from './InputHub';
import FraudRadar from './FraudRadar';
import EvidenceLedger from './EvidenceLedger';
import type { ChipType, ErrorType, ApiResult } from '../App';

interface InputPageProps {
  apiUrl: string;
  setApiUrl: (s: string) => void;
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
  apiError: string | null;
  apiConnected: boolean | null;
  onTestConnection: () => void;
  isTestingConnection: boolean;
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  apiResult: ApiResult | null;
  isFallback: boolean;
  hasResult: boolean;
}

interface Preset {
  name: string;
  desc: string;
  dotColor: string;
  dotLabel: string;
  user: number;
  card: number;
  year: number;
  month: number;
  day: number;
  time: string;
  amount: string;
  merchantName: string;
  mcc: number;
  useChip: ChipType;
  errors: ErrorType;
}

const PRESETS: Preset[] = [
  {
    name: 'Normal Daytime Swipe',
    desc: 'Standard in-store purchase during business hours',
    dotColor: '#3B7A57',
    dotLabel: 'LOW RISK',
    user: 1, card: 0, year: 2024, month: 6, day: 15,
    time: '13:42', amount: '$47.20',
    merchantName: '3527213246127876916',
    mcc: 5411, useChip: 'Swipe Transaction', errors: 'No error',
  },
  {
    name: 'Odd Hour Online + Bad CVV',
    desc: 'Late-night large online purchase with CVV error',
    dotColor: '#B84A39',
    dotLabel: 'HIGH RISK',
    user: 1, card: 0, year: 2024, month: 6, day: 15,
    time: '03:17', amount: '$1894.99',
    merchantName: '9184223317239487261',
    mcc: 5999, useChip: 'Online Transaction', errors: 'Bad CVV',
  },
  {
    name: 'Cold Start (Unseen User)',
    desc: 'New user and merchant with no graph history',
    dotColor: '#A86B24',
    dotLabel: 'UNKNOWN',
    user: 999999, card: 9, year: 2024, month: 6, day: 15,
    time: '11:05', amount: '$312.00',
    merchantName: '1111111111111111111',
    mcc: 5732, useChip: 'Chip Transaction', errors: 'No error',
  },
];

export default function InputPage({
  apiUrl, setApiUrl,
  user, setUser,
  card, setCard,
  year, setYear,
  month, setMonth,
  day, setDay,
  time, setTime,
  amount, setAmount,
  merchantName, setMerchantName,
  mcc, setMcc,
  useChip, setUseChip,
  errors, setErrors,
  onAudit,
  isLoading,
  apiError,
  apiConnected,
  onTestConnection,
  isTestingConnection,
  status,
  apiResult,
  isFallback,
  hasResult,
}: InputPageProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  const applyPreset = (p: Preset) => {
    setUser(p.user);
    setCard(p.card);
    setYear(p.year);
    setMonth(p.month);
    setDay(p.day);
    setTime(p.time);
    setAmount(p.amount);
    setMerchantName(p.merchantName);
    setMcc(p.mcc);
    setUseChip(p.useChip);
    setErrors(p.errors);
  };

  const isFraud = status === 'fraud';
  const probability = apiResult?.probability ?? 0;
  const probPercent = (probability * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto pt-6 pb-20 space-y-10"
    >
      {/* Editorial Page Header */}
      <div className="space-y-4 border-b border-[#E6E1D8] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#78726A] tracking-wider uppercase">
          <span>CHAPTER 01</span>
          <span>—</span>
          <span>TRANSACTION AUDIT & INFERENCE ENGINE</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2A29] font-normal leading-tight">
          Card Fraud Evaluation Hub
        </h1>

        <p className="text-sm text-[#78726A] max-w-2xl leading-relaxed">
          Enter card transaction parameters below to compute live fraud predictions using the GNN + XGBoost classifier trained on financial transaction graphs.
        </p>

        {/* Preset Scenarios */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <span className="text-xs font-semibold text-[#78726A] tracking-wider uppercase font-mono">
            TEST PRESETS:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="flex items-center gap-2 text-xs text-[#2C2A29] hover:text-[#C85A32] transition-colors cursor-pointer border border-[#E6E1D8] bg-[#FAF8F5] px-3 py-1.5 rounded-md"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.dotColor }}
              />
              <span className="font-medium">{p.name}</span>
              <span className="text-[#78726A] font-mono text-[11px]">
                ({p.amount})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Layout (Inputs + Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Inputs (7 cols) */}
        <div className="lg:col-span-7">
          <InputHub
            user={user}
            setUser={setUser}
            card={card}
            setCard={setCard}
            year={year}
            setYear={setYear}
            month={month}
            setMonth={setMonth}
            day={day}
            setDay={setDay}
            time={time}
            setTime={setTime}
            amount={amount}
            setAmount={setAmount}
            merchantName={merchantName}
            setMerchantName={setMerchantName}
            mcc={mcc}
            setMcc={setMcc}
            useChip={useChip}
            setUseChip={setUseChip}
            errors={errors}
            setErrors={setErrors}
            onAudit={onAudit}
            isLoading={isLoading}
          />
        </div>


        {/* Right Column: Payload Preview & Model Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#E6E1D8] lg:pl-8">
          {/* Payload Preview Card */}
          <div className="claude-card p-5 space-y-4">
            <h3 className="claude-label flex items-center justify-between">
              <span>JSON Payload Vector</span>
              <span className="font-mono text-[10px] text-[#A0988E] font-normal">POST /predict</span>
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {([
                ['User', String(user)],
                ['Card', String(card)],
                ['Date', `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`],
                ['Time', time || '—'],
                ['Amount', amount],
                ['Merchant', merchantName.length > 12 ? `…${merchantName.slice(-10)}` : merchantName],
                ['MCC', String(mcc)],
                ['Use Chip', useChip],
                ['Errors?', errors],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between items-baseline border-b border-[#EDE9E1] pb-1.5">
                  <span className="text-[#78726A] text-[11px]">{label}</span>
                  <span className="text-[#2C2A29] font-medium text-right max-w-[180px] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 07. Error Signals & Security Anomaly Code ─────────── */}
          <div className="claude-card p-5 space-y-3">
            <label className="claude-label">07. Error Signals & Anomaly Code</label>

            <div className="flex flex-wrap gap-2 pt-1">
              {(['No error', 'Bad CVV', 'Bad PIN', 'Insufficient Balance', 'Bad Expiration'] as ErrorType[]).map((opt) => {
                const active = errors === opt;
                const isError = opt !== 'No error';
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setErrors(opt)}
                    className={`
                      text-xs font-mono px-3 py-1.5 rounded-md transition-all cursor-pointer border
                      ${active
                        ? isError
                          ? 'border-[#B84A39] text-[#B84A39] bg-[#FBF0EF] font-semibold'
                          : 'border-[#3B7A57] text-[#3B7A57] bg-[#EBF3EE] font-semibold'
                        : 'border-[#E6E1D8] text-[#78726A] hover:border-[#D8D2C7] bg-[#FAF8F5]'}
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>



      {/* ── UNIFIED RESULTS SECTION ─────────────────────────────────── */}
      <AnimatePresence>
        {hasResult && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="pt-10 border-t-2 border-[#E6E1D8] space-y-8"
          >
            {/* Verdict Header Banner */}
            <div className="claude-card p-6 border-l-4" style={{
              borderLeftColor: isFraud ? '#B84A39' : '#3B7A57'
            }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#78726A]">
                    <span>STATUS: {isFraud ? 'HIGH RISK' : 'APPROVED'}</span>
                    <span>·</span>
                    <span>{useChip}</span>
                    <span>·</span>
                    <span>{amount}</span>
                  </div>

                  <h2 className="font-serif text-3xl text-[#2C2A29] font-normal flex items-center gap-3 pt-1">
                    <span>Audit Verdict:</span>
                    <span className={`font-semibold ${isFraud ? 'text-[#B84A39]' : 'text-[#3B7A57]'}`}>
                      {isFraud ? 'FRAUDULENT' : 'SAFE'}
                    </span>
                  </h2>
                </div>

                {/* Fraud Probability Badge */}
                <div className="text-right flex sm:flex-col items-baseline justify-between sm:justify-end gap-2">
                  <span className="text-xs font-mono text-[#78726A] uppercase tracking-wider">Fraud Risk Score</span>
                  <span className={`font-serif text-3xl font-bold ${isFraud ? 'text-[#B84A39]' : 'text-[#3B7A57]'}`}>
                    {probPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Risk Bar */}
              <div className="mt-4 pt-3 border-t border-[#EDE9E1] space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#78726A]">
                  <span>0% (Safe)</span>
                  <span>Threshold: 25%</span>
                  <span>100% (Fraud)</span>
                </div>
                <div className="w-full h-3 bg-[#E6E1D8] rounded-full overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(2, probability * 100))}%`,
                      backgroundColor: isFraud ? '#B84A39' : '#3B7A57'
                    }}
                  />
                  {/* Threshold marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-[#2C2A29] left-[25%]" title="Decision Boundary (25%)" />
                </div>
              </div>
            </div>


            {/* Results Grid (Radar Chart & Evidence Ledger) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <FraudRadar
                  status={status}
                  probability={probability}
                  threshold={apiResult?.threshold ?? 0.25}
                  amount={amount}
                  customerKnown={apiResult?.customer_known ?? true}
                  merchantKnown={apiResult?.merchant_known ?? true}
                />
              </div>

              <div className="lg:col-span-5 lg:border-l lg:border-[#E6E1D8] lg:pl-8">
                <EvidenceLedger
                  status={status}
                  probability={probability}
                  threshold={apiResult?.threshold ?? 0.25}
                  customerKnown={apiResult?.customer_known ?? true}
                  merchantKnown={apiResult?.merchant_known ?? true}
                  amount={amount}
                  useChip={useChip}
                  errors={errors}
                />
              </div>
            </div>

            {/* Raw API Response JSON Viewer */}
            <div className="claude-card p-5 space-y-3">
              <h3 className="claude-label flex justify-between">
                <span>Model Output JSON Response</span>
                <span className="font-mono text-[10px] text-[#3B7A57]">HTTP 200 OK</span>
              </h3>
              <pre className="font-mono text-xs bg-[#2C2A29] text-[#F7F4EE] p-4 rounded-md overflow-x-auto">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

