import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import Button from "../components/Button.jsx";
import { login, signInWithGoogle, signup } from "../services/auth.js";

const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account already exists for this email.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    default:
      return error?.message || "Something went wrong. Please try again.";
  }
};

export default function AuthPage({ refreshUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const navigate = useNavigate();

  const isLoading = Boolean(loadingAction);

  const handleAuthSuccess = () => {
    navigate("/dashboard");
  };

  const handleSignup = async () => {
    setError("");
    setLoadingAction("signup");

    try {
      await signup(email, password, name);
      await refreshUser?.();
      handleAuthSuccess();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingAction("");
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoadingAction("login");

    try {
      await login(email, password);
      await refreshUser?.();
      handleAuthSuccess();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingAction("");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoadingAction("google");

    try {
      await signInWithGoogle();
      await refreshUser?.();
      handleAuthSuccess();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingAction("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSignup) {
      handleSignup();
      return;
    }

    handleLogin();
  };

  const handleModeToggle = () => {
    setIsSignup((current) => !current);
    setError("");
  };

  return (
    <PageShell className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#f8f9fa]">
      
      {/* 🔥 CENTER FIX WRAPPER */}
      <div className="w-full max-w-5xl mx-auto flex justify-center">

        <div className="premium-surface grid w-full max-w-5xl overflow-hidden rounded-2xl md:grid-cols-2 md:min-h-[560px] shadow-lg">

          {/* LEFT PANEL */}
          <motion.aside
            layout
            transition={{ duration: 0.36, ease: "easeInOut" }}
            className={`relative z-10 flex min-h-72 flex-col justify-center overflow-hidden border-[#e5e7eb] bg-[#F8FAFC] p-6 sm:p-8 text-[#202124] md:min-h-full ${
              isSignup ? "md:order-2" : "md:order-1"
            }`}
          >
            <div className="absolute inset-y-0 left-0 w-1.5 bg-google-green" />

            <div className="absolute right-6 top-6 flex gap-2">
              <span className="size-2 rounded-full bg-google-blue" />
              <span className="size-2 rounded-full bg-google-red" />
              <span className="size-2 rounded-full bg-google-yellow" />
              <span className="size-2 rounded-full bg-google-green" />
            </div>

            <motion.div
              key={isSignup ? "signin-panel" : "signup-panel"}
              initial={{ opacity: 0, x: isSignup ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
              className="relative text-center md:text-left"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-google-blue">
                Ethicly access
              </p>

              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-normal">
                {isSignup ? "Already have an account?" : "New here?"}
              </h1>

              <p className="mt-4 text-sm sm:text-base leading-7 text-[#5f6368]">
                {isSignup
                  ? "Sign in to review saved audits, reports, and fairness checks."
                  : "Create a workspace for responsible AI audits and dataset reviews."}
              </p>

              <button
                type="button"
                onClick={handleModeToggle}
                className="mt-8 min-h-11 rounded-lg border border-google-blue bg-white px-5 py-2.5 text-sm font-bold text-google-blue transition duration-200 hover:scale-[1.02] hover:bg-[#edf4ff] active:scale-[0.98]"
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </button>

              <div className="mt-8 grid max-w-sm gap-3 text-sm text-[#5f6368] mx-auto md:mx-0">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-google-green" />
                  Responsible review workflows
                </div>
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-google-yellow" />
                  Clear audit status signals
                </div>
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-google-red" />
                  Bias alerts kept visible
                </div>
              </div>
            </motion.div>
          </motion.aside>

          {/* RIGHT PANEL */}
          <motion.section
            layout
            transition={{ duration: 0.36, ease: "easeInOut" }}
            className={`flex items-center justify-center bg-white p-6 sm:p-10 ${
              isSignup ? "md:order-1" : "md:order-2"
            }`}
          >
            <motion.div
              key={isSignup ? "signup-form" : "login-form"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26 }}
              className="w-full max-w-sm mx-auto"
            >
              <p className="text-sm font-semibold text-google-blue text-center md:text-left">
                {isSignup ? "Create account" : "Welcome back"}
              </p>

              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-normal text-[#202124] text-center md:text-left">
                {isSignup ? "Start with Ethicly" : "Sign in to Ethicly"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#5f6368] text-center md:text-left">
                {isSignup
                  ? "Set up your audit workspace in seconds."
                  : "Continue your fairness review workflow."}
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="mt-7 flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white px-4 py-2.5 text-sm font-semibold text-[#3c4043] transition duration-200 hover:border-google-blue hover:bg-[#edf4ff]"
              >
                <span className="grid size-5 place-items-center rounded-full bg-google-blue text-xs font-bold text-white">
                  G
                </span>
                {loadingAction === "google"
                  ? "Connecting..."
                  : "Continue with Google"}
              </button>

              <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#9aa0a6]">
                <span className="h-px flex-1 bg-[#e8eaed]" />
                or
                <span className="h-px flex-1 bg-[#e8eaed]" />
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignup && (
                  <label className="block">
                    <span className="text-sm font-semibold text-[#3c4043]">
                      Name
                    </span>
                    <input
                      className="mt-2 min-h-11 w-full rounded-lg border border-[#dadce0] px-4 text-sm outline-none focus:border-google-blue focus:ring-4 focus:ring-[#d8e7ff]"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-sm font-semibold text-[#3c4043]">
                    Email
                  </span>
                  <input
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#dadce0] px-4 text-sm outline-none focus:border-google-blue focus:ring-4 focus:ring-[#d8e7ff]"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#3c4043]">
                    Password
                  </span>
                  <input
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#dadce0] px-4 text-sm outline-none focus:border-google-blue focus:ring-4 focus:ring-[#d8e7ff]"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  {error && (
                    <span className="mt-2 block text-sm font-medium text-google-red">
                      {error}
                    </span>
                  )}
                </label>

                <Button type="submit" className="w-full">
                  {loadingAction === "signup" && "Creating account..."}
                  {loadingAction === "login" && "Signing in..."}
                  {!loadingAction &&
                    (isSignup ? "Create Account" : "Sign In")}
                </Button>
              </form>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </PageShell>
  );
}