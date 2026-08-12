import type { ChipType, ErrorType } from '../App';

interface EvidenceLedgerProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  probability: number;
  threshold: number;
  customerKnown: boolean;
  merchantKnown: boolean;
  amount: string;
  useChip: ChipType;
  errors: ErrorType;
}

export default function EvidenceLedger({
  probability,
  threshold,
  customerKnown,
  merchantKnown,
  amount,
  useChip,
  errors,
}: EvidenceLedgerProps) {
  const isOnline = useChip === 'Online Transaction';
  const hasError = errors !== 'No error';

  const metrics = [
    {
      label: 'Model Decision',
      value: status === 'fraud' ? 'FRAUD' : 'SAFE',
      note: status === 'fraud' ? 'Exceeds 25% threshold — flagged' : 'Below 25% threshold — cleared',
      highlight: status === 'fraud',
    },
    {
      label: 'Decision Threshold',
      value: `${(threshold * 100).toFixed(0)}% (${threshold.toFixed(2)})`,
      note: 'Model-configured boundary',
      highlight: false,
    },
    {
      label: 'Transaction Amount',
      value: amount,
      note: 'Primary scale feature',
      highlight: false,
    },
    {
      label: 'Transaction Method',
      value: useChip,
      note: isOnline ? 'Online — higher risk channel' : 'In-person — lower risk',
      highlight: isOnline,
    },
    {
      label: 'Error Signal',
      value: errors,
      note: hasError ? 'Transaction error detected' : 'Clean transaction',
      highlight: hasError,
    },
    {
      label: 'Customer Graph Status',
      value: customerKnown ? 'Known' : 'Cold Start',
      note: customerKnown ? 'Established user profile' : 'No prior graph edges',
      highlight: !customerKnown,
    },
    {
      label: 'Merchant Graph Status',
      value: merchantKnown ? 'Known' : 'Cold Start',
      note: merchantKnown ? 'Established merchant node' : 'No prior graph edges',
      highlight: !merchantKnown,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="border-b border-[#E6E1D8] pb-3 space-y-1">
            <div className="flex justify-between items-baseline text-xs font-mono">
              <span className="text-[#78726A]">{m.label}</span>
              <span className={`font-medium ${m.highlight ? 'text-[#B84A39]' : 'text-[#2C2A29]'}`}>
                {m.value}
              </span>
            </div>
            <div className={`text-[11px] italic ${m.highlight ? 'text-[#B84A39]' : 'text-[#A0988E]'}`}>
              {m.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

