// frontend/src/components/auth/SignInForm.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Alert from "../ui/alert/Alert";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = "http://localhost:5050";

export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: "error" | "warning"; title: string; message: string } | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const saved = localStorage.getItem("savedEmail");
    if (saved) {
      setFormData((p) => ({ ...p, email: saved }));
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setAlert(null);

    try {
      const res = await axios.post(`${API}/api/auth/login`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const { token, user } = res.data || {};
      if (token) localStorage.setItem("token", token);
      login(token, user);

      if (rememberEmail) localStorage.setItem("savedEmail", formData.email);
      else localStorage.removeItem("savedEmail");

      navigate("/", { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      const msg = e?.response?.data?.error || "Login failed. Please check your credentials.";
      setAlert({ variant: "error", title: "Sign in failed", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
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
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in.
          </p>
        </div>

        {alert && (
          <div className="mb-4">
            <Alert variant={alert.variant} title={alert.title} message={alert.message} showLink={false} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Password <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <div className="flex items-center gap-3">
              <Checkbox checked={rememberEmail} onChange={setRememberEmail} />
              <span className="text-sm text-gray-700 dark:text-gray-400">Remember email</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
