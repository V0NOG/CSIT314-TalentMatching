// frontend/src/components/auth/SignUpForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import axios from "axios";
import Alert from "../ui/alert/Alert";

const API = "http://localhost:5050";
type Role = "candidate" | "employer";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: "error" | "success"; title: string; message: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "candidate" as Role,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setAlert({ variant: "error", title: "Required", message: "Please accept the Terms and Privacy Policy to continue." });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      await axios.post(`${API}/api/auth/register`, formData, { withCredentials: true });
      navigate("/signin", { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setAlert({ variant: "error", title: "Sign up failed", message: e?.response?.data?.error || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Join the Talent Matching Platform</p>
        </div>

        {alert && (
          <div className="mb-4">
            <Alert variant={alert.variant} title={alert.title} message={alert.message} showLink={false} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Role selection */}
            <div>
              <Label>I am a <span className="text-error-500">*</span></Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {(["candidate", "employer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      formData.role === r
                        ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                        : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {r === "candidate" ? "Job Seeker" : "Employer"}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {formData.role === "candidate"
                  ? "Find jobs and get matched with opportunities"
                  : "Post jobs and discover top candidates"}
              </p>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>First Name <span className="text-error-500">*</span></Label>
                <Input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name <span className="text-error-500">*</span></Label>
                <Input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div>
              <Label>Password <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword
                    ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
                </span>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3">
              <Checkbox className="w-5 h-5" checked={agreed} onChange={setAgreed} />
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                I agree to the{" "}
                <span className="text-gray-800 dark:text-white/90">Terms</span> and{" "}
                <span className="text-gray-800 dark:text-white/90">Privacy Policy</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Already have an account?{" "}
            <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
