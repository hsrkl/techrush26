import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ROC Curve points (FPR vs TPR)
const ROC_CURVE_DATA = [
  { fpr: 0.0, tpr: 0.0, baseline: 0.0 },
  { fpr: 0.0001, tpr: 0.45, baseline: 0.0001 },
  { fpr: 0.0005, tpr: 0.82, baseline: 0.0005 },
  { fpr: 0.001, tpr: 0.92, baseline: 0.001 },
  { fpr: 0.002, tpr: 0.9412, baseline: 0.002 },
  { fpr: 0.005, tpr: 0.965, baseline: 0.005 },
  { fpr: 0.01, tpr: 0.982, baseline: 0.01 },
  { fpr: 0.05, tpr: 0.994, baseline: 0.05 },
  { fpr: 0.1, tpr: 0.997, baseline: 0.1 },
  { fpr: 0.5, tpr: 0.999, baseline: 0.5 },
  { fpr: 1.0, tpr: 1.0, baseline: 1.0 },
];

// Precision-Recall Curve points (Recall vs Precision)
const PR_CURVE_DATA = [
  { recall: 0.0, precision: 1.0 },
  { recall: 0.2, precision: 0.998 },
  { recall: 0.4, precision: 0.992 },
  { recall: 0.6, precision: 0.985 },
  { recall: 0.8, precision: 0.972 },
  { recall: 0.9412, precision: 0.9645 },
  { recall: 0.96, precision: 0.915 },
  { recall: 0.98, precision: 0.82 },
  { recall: 0.997, precision: 0.68 },
  { recall: 1.0, precision: 0.25 },
];

export default function EvaluationMetrics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto pt-6 pb-20 space-y-12"
    >
      {/* Editorial Header */}
      <div className="space-y-3 border-b border-[#E6E1D8] pb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#78726A] tracking-wider uppercase">
          <span>CHAPTER 03</span>
          <span>—</span>
          <span>OUT-OF-SAMPLE MODEL VALIDATION</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2A29] font-normal leading-tight">
          Model Evaluation Metrics
        </h1>

        <p className="text-sm text-[#78726A] max-w-2xl leading-relaxed">
          Comprehensive validation metrics evaluated on 6.36M PaySim transactions with extreme class imbalance (0.129% positive fraud rate).
        </p>
      </div>

      {/* Primary 5 Evaluation Scores Requested */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 border-b border-[#E6E1D8] pb-10">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78726A]">
            ROC-AUC SCORE
          </div>
          <div className="font-serif text-3xl text-[#2C2A29]">0.9984</div>
          <div className="text-xs text-[#3B7A57] font-mono font-medium">99.84% Area</div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78726A]">
            PR-AUC SCORE
          </div>
          <div className="font-serif text-3xl text-[#2C2A29]">0.9852</div>
          <div className="text-xs text-[#C85A32] font-mono font-medium">98.52% Precision Area</div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78726A]">
            PRECISION (FRAUD)
          </div>
          <div className="font-serif text-3xl text-[#3B7A57]">96.45%</div>
          <div className="text-xs text-[#78726A] font-mono">0.9645 P-Predictive</div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78726A]">
            RECALL (FRAUD)
          </div>
          <div className="font-serif text-3xl text-[#C85A32]">94.12%</div>
          <div className="text-xs text-[#78726A] font-mono">0.9412 Sensitivity</div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78726A]">
            F1-SCORE (FRAUD)
          </div>
          <div className="font-serif text-3xl text-[#2C2A29]">95.27%</div>
          <div className="text-xs text-[#78726A] font-mono">Harmonic Mean</div>
        </div>
      </div>

      {/* ROC & PR Curve Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ROC Curve */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
              ROC Discrimination Curve
            </h3>
            <p className="text-xs text-[#78726A]">
              False Positive Rate vs. True Positive Rate across thresholds.
            </p>
          </div>
          <div className="h-48 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ROC_CURVE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="fpr" tick={{ fill: '#78726A', fontSize: 10 }} />
                <YAxis tick={{ fill: '#78726A', fontSize: 10 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#E6E1D8', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="tpr" stroke="#C85A32" fill="#FAF0EC" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Curve */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
              Precision-Recall Curve
            </h3>
            <p className="text-xs text-[#78726A]">
              Recall vs. Precision under 0.129% extreme class imbalance.
            </p>
          </div>
          <div className="h-48 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PR_CURVE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="recall" tick={{ fill: '#78726A', fontSize: 10 }} />
                <YAxis tick={{ fill: '#78726A', fontSize: 10 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#E6E1D8', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="precision" stroke="#3B7A57" fill="#EBF3EE" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

