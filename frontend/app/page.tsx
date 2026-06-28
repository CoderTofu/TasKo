"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { getCookie, setCookie } from "@/lib/cookies";

import { API_URL } from "@/lib/helper";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "name": {
        if (!value.trim()) return "Full name is required.";
        if (value.length < 2 || value.length > 50)
          return "Full name must be between 2 and 50 characters.";
        const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
        if (!nameRegex.test(value))
          return "Full name can only contain letters, spaces, hyphens, and apostrophes.";
        return "";
      }
      case "email": {
        if (!value.trim()) return "Email address is required.";
        if (value.length > 254)
          return "Email address must be under 254 characters.";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address (e.g., name@example.com).";
        return "";
      }
      case "password": {
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters.";
        if (value.length > 26) return "Password cannot exceed 26 characters.";
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,26}$/;
        if (!passwordRegex.test(value))
          return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).";
        return "";
      }
      case "confirmPassword": {
        if (!value) return "Please confirm your password.";
        if (value !== password) return "Passwords do not match.";
        return "";
      }
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const nameError = validateField("name", name);
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    const confirmPasswordError = validateField(
      "confirmPassword",
      confirmPassword,
    );

    const newErrors = {
      ...(nameError && { name: nameError }),
      ...(emailError && { email: emailError }),
      ...(passwordError && { password: passwordError }),
      ...(confirmPasswordError && { confirmPassword: confirmPasswordError }),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      router.push("/tasks");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (isLogin) {
      setLoading(true);
      handleLogin();
    } else {
      const isValid = validateForm();
      if (!isValid) {
        // Focus the first invalid field
        const firstInvalid = [
          "name",
          "email",
          "password",
          "confirm-password",
        ].find((id) => {
          const fieldName = id === "confirm-password" ? "confirmPassword" : id;
          return !!validateField(
            fieldName === "name" ? "name" : fieldName,
            fieldName === "name"
              ? name
              : fieldName === "email"
                ? email
                : fieldName === "password"
                  ? password
                  : confirmPassword,
          );
        });
        if (firstInvalid) {
          document.getElementById(firstInvalid)?.focus();
        }
        return;
      }
      setLoading(true);
      handleRegister();
    }
  };

  const handleLogin = async () => {
    const url = API_URL + "/auth/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Something went wrong. Please try again.",
        });
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      }

      setCookie("token", data.token);
      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      router.push("/tasks");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const url = API_URL + "/auth/register";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Something went wrong. Please try again.",
        });
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      }

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      setTouched({});
      setCookie("token", data.token);
      setMessage({ type: "success", text: "Account created! Redirecting..." });
      router.push("/tasks");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen relative justify-center items-center">
      <div className="relative flex flex-col justify-center px-6 lg:col-span-7 sm:px-12 md:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-lg relative z-10">
          <div className="p-8 sm:p-10 rounded-2xl border border-zinc-200/50 bg-white/70 shadow-xl shadow-zinc-200/30 dark:border-zinc-850 dark:bg-zinc-900/60 dark:shadow-none">
            {/* Sign in or create account tab */}
            <div className="mb-6 flex rounded-xl bg-zinc-100/80 p-1 dark:bg-zinc-950/80 border border-zinc-200/10 dark:border-zinc-805">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setMessage(null);
                  setErrors({});
                  setTouched({});
                }}
                className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isLogin
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400 border border-zinc-200/20 dark:border-zinc-800/30"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setMessage(null);
                  setErrors({});
                  setTouched({});
                }}
                className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  !isLogin
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400 border border-zinc-200/20 dark:border-zinc-800/30"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header Text */}
            <div className="mb-6">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {isLogin ? "Welcome back" : "Get started today"}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
                {isLogin
                  ? "Enter your credentials to access your account."
                  : "Fill out the fields below to create your account."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {!isLogin && (
                <Field className="space-y-0.5">
                  <FieldLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </FieldLabel>
                  <div className="flex flex-col">
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (touched.name) {
                          setErrors((prev) => ({
                            ...prev,
                            name: validateField("name", e.target.value),
                          }));
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, name: true }));
                        setErrors((prev) => ({
                          ...prev,
                          name: validateField("name", name),
                        }));
                      }}
                      className={`h-10 px-3 bg-white dark:bg-zinc-900/80 transition-all duration-200 ${
                        errors.name && touched.name
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25"
                          : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
                      }`}
                      aria-invalid={
                        errors.name && touched.name ? "true" : "false"
                      }
                      aria-describedby={
                        errors.name && touched.name ? "name-error" : undefined
                      }
                    />
                    {errors.name && touched.name && (
                      <p
                        id="name-error"
                        className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>
                </Field>
              )}

              <Field className="space-y-0.5">
                <FieldLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </FieldLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) {
                        setErrors((prev) => ({
                          ...prev,
                          email: validateField("email", e.target.value),
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, email: true }));
                      setErrors((prev) => ({
                        ...prev,
                        email: validateField("email", email),
                      }));
                    }}
                    className={`h-10 px-3 bg-white dark:bg-zinc-900/80 transition-all duration-200 ${
                      errors.email && touched.email
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25"
                        : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
                    }`}
                    aria-invalid={
                      errors.email && touched.email ? "true" : "false"
                    }
                    aria-describedby={
                      errors.email && touched.email ? "email-error" : undefined
                    }
                  />
                  {errors.email && touched.email && (
                    <p
                      id="email-error"
                      className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </Field>

              <Field className="space-y-0.5">
                <FieldLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </FieldLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setPassword(newPassword);
                      if (touched.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: validateField("password", newPassword),
                        }));
                      }
                      if (touched.confirmPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword:
                            newPassword !== confirmPassword
                              ? "Passwords do not match."
                              : "",
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, password: true }));
                      setErrors((prev) => ({
                        ...prev,
                        password: validateField("password", password),
                      }));
                    }}
                    className={`h-10 px-3 bg-white dark:bg-zinc-900/80 transition-all duration-200 ${
                      errors.password && touched.password
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25"
                        : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
                    }`}
                    aria-invalid={
                      errors.password && touched.password ? "true" : "false"
                    }
                    aria-describedby={
                      errors.password && touched.password
                        ? "password-error"
                        : undefined
                    }
                  />
                  {errors.password && touched.password && (
                    <p
                      id="password-error"
                      className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>
              </Field>

              {!isLogin && (
                <Field className="space-y-0.5">
                  <FieldLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Confirm Password
                  </FieldLabel>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (touched.confirmPassword) {
                          setErrors((prev) => ({
                            ...prev,
                            confirmPassword: validateField(
                              "confirmPassword",
                              e.target.value,
                            ),
                          }));
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({
                          ...prev,
                          confirmPassword: true,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: validateField(
                            "confirmPassword",
                            confirmPassword,
                          ),
                        }));
                      }}
                      className={`h-10 px-3 bg-white dark:bg-zinc-900/80 transition-all duration-200 ${
                        errors.confirmPassword && touched.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/25"
                          : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
                      }`}
                      aria-invalid={
                        errors.confirmPassword && touched.confirmPassword
                          ? "true"
                          : "false"
                      }
                      aria-describedby={
                        errors.confirmPassword && touched.confirmPassword
                          ? "confirmPassword-error"
                          : undefined
                      }
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p
                        id="confirmPassword-error"
                        className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </Field>
              )}
            </form>

            {/* Message Alert */}
            {message && (
              <div
                className={`my-6 rounded-xl p-4 text-sm font-medium border shadow-sm ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-450"
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/10 dark:shadow-none hover:shadow-indigo-500/20 hover:scale-[1.01] transition-all duration-300 font-semibold cursor-pointer"
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
