import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header, { PageTab } from './components/Header';
import InputPage from './components/InputPage';
import EvaluationMetrics from './components/EvaluationMetrics';

export type ChipType = 'Swipe Transaction' | 'Chip Transaction' | 'Online Transaction';
export type ErrorType = 'No error' | 'Bad CVV' | 'Bad PIN' | 'Insufficient Balance' | 'Bad Expiration';

type AuditStatus = 'idle' | 'loading' | 'safe' | 'fraud';

export interface ApiResult {
  probability: number;
  is_fraud: boolean;
  threshold: number;
  customer_known: boolean;
  merchant_known: boolean;
}

export default function App() {
  // Navigation state: 'audit' (unified inputs + results on 1 page) or 'metrics'
  const [activeTab, setActiveTab] = useState<PageTab>('audit');

  // API configuration & Connection Health
  const [apiUrl, setApiUrl] = useState('');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Transaction parameters — matches main.py backend payload schema
  const [user, setUser] = useState(876);
  const [card, setCard] = useState(1);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [time, setTime] = useState('03:40');
  const [amount, setAmount] = useState('$2100.00');
  const [merchantName, setMerchantName] = useState('2814378089490887845');
  const [mcc, setMcc] = useState(5999);
  const [useChip, setUseChip] = useState<ChipType>('Online Transaction');
  const [errors, setErrors] = useState<ErrorType>('Bad CVV');

  // Audit State
  const [status, setStatus] = useState<AuditStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAuditResult, setHasAuditResult] = useState(false);
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Health check endpoint helper
  const testConnection = useCallback(async () => {
    if (!apiUrl.trim()) {
      setApiError('Please enter a valid Google Colab ngrok URL.');
      setApiConnected(false);
      return;
    }

    setIsTestingConnection(true);
    setApiError(null);

    try {
      const baseUrl = apiUrl.replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true',
        },
      });

      if (response.ok) {
        setApiConnected(true);
        setApiError(null);
      } else {
        setApiConnected(false);
        setApiError(`Health check returned status HTTP ${response.status}`);
      }
    } catch (err) {
      setApiConnected(false);
      setApiError(err instanceof Error ? err.message : 'Unable to connect to Colab API');
    } finally {
      setIsTestingConnection(false);
    }
  }, [apiUrl]);

  // Main Audit Prediction Dispatcher
  const performAudit = useCallback(async () => {
    setIsLoading(true);
    setStatus('loading');
    setApiError(null);
    setIsFallback(false);

    const payload = {
      User: Number(user),
      Card: Number(card),
      Year: Number(year),
      Month: Number(month),
      Day: Number(day),
      Time: time,
      Amount: amount,
      'Merchant Name': Number(merchantName),
      MCC: Number(mcc),
      'Use Chip': useChip,
      'Errors?': errors,
    };

    try {
      if (!apiUrl.trim()) {
        throw new Error('No API URL provided. Enter your Google Colab ngrok URL to perform live inference.');
      }

      const baseUrl = apiUrl.replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Prediction response from Colab backend:', data);

      const CLASSIFIER_THRESHOLD = data.threshold ?? 0.25;
      const isFraudResult = data.probability !== undefined ? data.probability >= CLASSIFIER_THRESHOLD : Boolean(data.is_fraud);

      const result: ApiResult = {
        probability: data.probability ?? (isFraudResult ? 0.88 : 0.05),
        is_fraud: isFraudResult,
        threshold: CLASSIFIER_THRESHOLD,
        customer_known: data.customer_known ?? true,
        merchant_known: data.merchant_known ?? true,
      };

      setApiResult(result);
      setStatus(isFraudResult ? 'fraud' : 'safe');
      setApiConnected(true);
      setIsFallback(false);
    } catch (error) {
      console.error('API call failed:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errMsg);
      setApiConnected(false);
      setIsFallback(true);

      // Heuristic calculation for fallback demonstration
      const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
      const isHighRisk =
        amountNum > 500 ||
        useChip === 'Online Transaction' ||
        errors !== 'No error';

      const CLASSIFIER_THRESHOLD = 0.25;
      const fallback: ApiResult = {
        probability: isHighRisk ? 0.87 : 0.12,
        is_fraud: isHighRisk,
        threshold: CLASSIFIER_THRESHOLD,
        customer_known: user < 10000,
        merchant_known: true,
      };

      setApiResult(fallback);
      setStatus(isHighRisk ? 'fraud' : 'safe');
    } finally {
      setIsLoading(false);
      setHasAuditResult(true);

      // Smooth scroll to the results section below
      setTimeout(() => {
        window.scrollTo({
          top: 600,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [apiUrl, user, card, year, month, day, time, amount, merchantName, mcc, useChip, errors]);

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2A29]">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasResult={hasAuditResult}
      />

      {/* Main View Container */}
      <main className="pt-20 px-4 sm:px-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'audit' && (
            <InputPage
              key="audit-page"
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
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
              onAudit={performAudit}
              isLoading={isLoading}
              apiError={apiError}
              apiConnected={apiConnected}
              onTestConnection={testConnection}
              isTestingConnection={isTestingConnection}
              status={status}
              apiResult={apiResult}
              isFallback={isFallback}
              hasResult={hasAuditResult}
            />
          )}

          {activeTab === 'metrics' && (
            <EvaluationMetrics key="metrics-page" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

