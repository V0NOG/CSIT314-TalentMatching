// frontend/src/pages/membership/MembershipPage.tsx
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { updateMembership } from "../../api/userApi";

const FEATURES = [
  "Unlimited AI-powered job recommendations",
  "See every matching candidate with no cap",
  "Full scoring breakdown for every match",
  "Priority placement in employer searches",
  "30-day billing cycle",
  "Cancel anytime — no lock-in",
];

type CardType = "visa" | "mastercard" | "amex" | "unknown";

function detectCard(number: string): CardType {
  const raw = number.replace(/\s/g, "");
  if (/^4/.test(raw)) return "visa";
  if (/^5[1-5]/.test(raw)) return "mastercard";
  if (/^3[47]/.test(raw)) return "amex";
  return "unknown";
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function isExpiryValid(expiry: string): boolean {
  const [mm, yy] = expiry.split("/");
  if (!mm || !yy || mm.length < 2 || yy.length < 2) return false;
  const month = parseInt(mm, 10);
  const year = 2000 + parseInt(yy, 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return new Date(year, month - 1, 1) > now;
}

function CardIcon({ type }: { type: CardType }) {
  if (type === "visa") {
    return (
      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
        VISA
      </span>
    );
  }
  if (type === "mastercard") {
    return (
      <span className="flex gap-0.5 items-center">
        <span className="w-4 h-4 rounded-full bg-red-500 opacity-90" />
        <span className="w-4 h-4 rounded-full bg-yellow-400 opacity-90 -ml-2" />
      </span>
    );
  }
  if (type === "amex") {
    return (
      <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
        AMEX
      </span>
    );
  }
  return null;
}

type Stage = "form" | "processing" | "success";

export default function MembershipPage() {
  const { user, refreshUser, isCandidate } = useAuth();

  const profilePath = isCandidate ? "/candidate/profile" : "/employer/profile";

  const [stage, setStage] = useState<Stage>("form");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  if (user?.membership) {
    return (
      <>
        <PageMeta title="Premium Membership | Talent Matching" description="Membership management" />
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-900/10 p-10">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <svg className="w-7 h-7 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
            </span>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-1">You're already a Premium member</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Enjoy unlimited recommendations and full access to all features.
            </p>
            <Link
              to={profilePath}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!cardName.trim()) e.cardName = "Cardholder name is required.";
    const rawNumber = cardNumber.replace(/\s/g, "");
    if (rawNumber.length < 16) e.cardNumber = "Enter a valid 16-digit card number.";
    if (!isExpiryValid(expiry)) e.expiry = "Enter a valid expiry date (MM/YY).";
    const cvvLen = detectCard(cardNumber) === "amex" ? 4 : 3;
    if (cvv.replace(/\D/g, "").length < cvvLen) e.cvv = `Enter a valid ${cvvLen}-digit CVV.`;
    if (!agreed) e.agreed = "Please agree to the terms to continue.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStage("processing");
    await new Promise((r) => setTimeout(r, 2000));

    try {
      await updateMembership(true);
      await refreshUser();
      setStage("success");
    } catch {
      setStage("form");
      setApiError("Payment could not be processed. Please try again.");
    }
  };

  const handleCardNumberChange = (v: string) => {
    const formatted = formatCardNumber(v);
    setCardNumber(formatted);
    if (formatted.replace(/\s/g, "").length === 16) expiryRef.current?.focus();
  };

  const handleExpiryChange = (v: string) => {
    const prev = expiry;
    const formatted = formatExpiry(v);
    setExpiry(formatted);
    if (formatted.length === 5 && prev.length < 5) cvvRef.current?.focus();
  };

  const cardType = detectCard(cardNumber);
  const cvvMaxLen = cardType === "amex" ? 4 : 3;

  if (stage === "processing") {
    return (
      <>
        <PageMeta title="Processing Payment | Talent Matching" description="Processing your payment" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-900/30" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-800 dark:text-white/90">Processing payment…</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait, do not close this page.</p>
          </div>
        </div>
      </>
    );
  }

  if (stage === "success") {
    return (
      <>
        <PageMeta title="Welcome to Premium | Talent Matching" description="Membership activated" />
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/10 p-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-5">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're now Premium!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Welcome aboard, {user?.firstName}. You now have unlimited access to all recommendations and matching features.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                to={isCandidate ? "/candidate/recommendations" : "/employer/recommendations"}
                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
              >
                View My Recommendations →
              </Link>
              <Link
                to={profilePath}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Upgrade to Premium | Talent Matching" description="Upgrade your membership" />

      <div className="mb-6">
        <Link
          to={profilePath}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Upgrade to Premium</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Unlock unlimited recommendations and full platform access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">

        {/* Left — Plan summary */}
        <div className="flex flex-col gap-4">
          {/* Plan card */}
          <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 dark:border-yellow-800/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-yellow-600 dark:text-yellow-400 mb-1">
                  Premium Plan
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  $9.99
                  <span className="text-base font-normal text-gray-500 dark:text-gray-400"> / month</span>
                </p>
              </div>
              <span className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700">
                Most Popular
              </span>
            </div>

            <ul className="space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="mt-0.5 w-4 h-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Free vs Premium comparison */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Free vs Premium</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 w-1/2"></th>
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-center">Free</th>
                  <th className="pb-2 font-medium text-yellow-600 dark:text-yellow-400 text-center">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  ["Recommendations shown", "Top 10", "Unlimited"],
                  ["Match score details", "✓", "✓"],
                  ["Apply to jobs", "✓", "✓"],
                  ["Browse candidates/jobs", "✓", "✓"],
                  ["Profile visibility boost", "—", "✓"],
                ].map(([feature, free, premium]) => (
                  <tr key={feature}>
                    <td className="py-2 text-gray-600 dark:text-gray-300">{feature}</td>
                    <td className="py-2 text-center text-gray-400 dark:text-gray-500">{free}</td>
                    <td className="py-2 text-center font-medium text-green-600 dark:text-green-400">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Payments are secured with 256-bit SSL encryption. We never store your card details.
            </p>
          </div>
        </div>

        {/* Right — Payment form */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-1">Payment Details</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
            Your subscription begins immediately. Cancel at any time from your profile.
          </p>

          {apiError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Cardholder name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Jane Smith"
                autoComplete="cc-name"
                className={`w-full h-10 rounded-lg border px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.cardName
                    ? "border-red-400 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              />
              {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>}
            </div>

            {/* Card number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                  maxLength={19}
                  className={`w-full h-10 rounded-lg border px-3 pr-16 text-sm text-gray-800 dark:text-white placeholder-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono tracking-wider ${
                    errors.cardNumber
                      ? "border-red-400 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CardIcon type={cardType} />
                </div>
              </div>
              {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  ref={expiryRef}
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                  maxLength={5}
                  className={`w-full h-10 rounded-lg border px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono ${
                    errors.expiry
                      ? "border-red-400 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                />
                {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CVV
                </label>
                <input
                  ref={cvvRef}
                  type="text"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, cvvMaxLen))}
                  placeholder={cardType === "amex" ? "4 digits" : "3 digits"}
                  autoComplete="cc-csc"
                  maxLength={cvvMaxLen}
                  className={`w-full h-10 rounded-lg border px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono ${
                    errors.cvv
                      ? "border-red-400 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                />
                {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
              </div>
            </div>

            {/* Billing summary */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 px-4 py-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Premium membership</span>
                <span className="font-medium text-gray-800 dark:text-white">$9.99 / mo</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Billed today</span>
                <span className="font-semibold text-gray-900 dark:text-white">$9.99</span>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                I agree to the{" "}
                <span className="text-brand-500 cursor-pointer hover:underline">Terms of Service</span>
                {" "}and{" "}
                <span className="text-brand-500 cursor-pointer hover:underline">Privacy Policy</span>.
                Your subscription renews monthly until cancelled.
              </span>
            </label>
            {errors.agreed && <p className="text-xs text-red-500 -mt-2">{errors.agreed}</p>}

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Subscribe — $9.99/month
            </button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured with 256-bit SSL encryption
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
