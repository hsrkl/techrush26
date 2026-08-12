import { motion } from 'framer-motion';

export type PageTab = 'audit' | 'metrics';

interface HeaderProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  hasResult: boolean;
}

const TABS: { id: PageTab; label: string }[] = [
  { id: 'audit', label: '01  Transaction Evaluation' },
  { id: 'metrics', label: '02  Model Performance Metrics' },
];

export default function Header({ activeTab, onSelectTab, hasResult }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E6E1D8] transition-all">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
          <span className="font-serif text-lg font-medium text-[#2C2A29] tracking-tight">
            Safeguard AI
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF0EC] text-[#C85A32] border border-[#F3D7CD] uppercase tracking-wider">
            GNN + XGBoost
          </span>
        </div>

        {/* Text Navigation */}
        <nav className="flex items-center gap-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`
                  relative py-1 text-xs tracking-wider transition-colors cursor-pointer border-none bg-transparent
                  ${isActive ? 'text-[#2C2A29] font-semibold' : 'text-[#78726A] hover:text-[#2C2A29] font-normal'}
                `}
              >
                <span>{tab.label}</span>

                {tab.id === 'audit' && hasResult && (
                  <span className="absolute -top-0.5 -right-2.5 w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                )}

                {isActive && (
                  <motion.div
                    layoutId="header-active-line"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C85A32]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

