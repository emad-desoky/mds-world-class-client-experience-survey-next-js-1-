"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AM_ROSTER,
  ROLES,
  MODULES,
  MINI_BLOCK_QUESTIONS,
  RECOVERY_QUESTIONS,
  SECTIONS,
  GROWTH_SYSTEMS,
  CURRENCIES,
  SPEND_BANDS,
  MARKETS,
  SurveyMode,
  Tenure,
} from "@/lib/constants";
import ProgressBar from "@/components/ProgressBar";
import RatingInput from "@/components/RatingInput";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Zap,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mds_survey_autosave_v3";

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [savedStatus, setSavedStatus] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize responses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setResponses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      setSavedStatus("Saving...");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
      const timer = setTimeout(() => setSavedStatus("Saved ✓"), 1000);
      return () => clearTimeout(timer);
    }
  }, [responses]);

  const updateResponse = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => prev.filter((e) => e !== id));
  };

  const selectedModulesCount = (responses.SET_MODULES || []).length;
  const isCorePrioritized =
    responses.SET_MODE === SurveyMode.CORE && selectedModulesCount >= 4;

  const steps = useMemo(() => {
    const flow = ["welcome", "setup", "module_select"];

    if (
      responses.SET_MODULES?.includes("ORG") ||
      responses.SET_MODULES?.includes("PAID") ||
      responses.SET_MODULES?.includes("AI")
    ) {
      flow.push("conditional_setup");
    }

    if (isCorePrioritized) flow.push("prioritization");

    const tenure = responses.SET_TENURE;
    if (tenure === Tenure.ZERO_THREE || tenure === Tenure.THREE_SIX)
      flow.push("section_onboarding");

    flow.push("section_exec_summary");

    const needsSafety = ["PAID", "ORG", "VP", "AI", "WEB"].some((m) =>
      responses.SET_MODULES?.includes(m),
    );
    if (needsSafety) flow.push("section_trust_safety");

    if (responses.SET_GROWTH_SYSTEMS?.length > 0) {
      responses.SET_GROWTH_SYSTEMS.forEach((_, i) =>
        flow.push(`growth_system_${i}`),
      );
    }

    flow.push("section_am_scorecard");
    flow.push("section_ops_timelines");

    const selected = MODULES.filter((m) =>
      responses.SET_MODULES?.includes(m.id),
    );
    selected.forEach((m) => flow.push(`module_${m.id}`));

    flow.push("close_out");
    return flow;
  }, [responses, isCorePrioritized]);

  const currentStepId = steps[step];

  const needsRecovery = (questionId) => {
    const val = responses[questionId];
    if (typeof val === "number") {
      if (questionId === "NPS_1" || questionId.endsWith("NPS_1"))
        return val <= 6;
      return val <= 2;
    }
    return false;
  };

  const validateStep = () => {
    const newErrors = [];

    if (currentStepId === "setup") {
      if (!responses.SET_EMAIL) newErrors.push("SET_EMAIL");
      if (!responses.SET_ROLE) newErrors.push("SET_ROLE");
      if (!responses.SET_TENURE) newErrors.push("SET_TENURE");
      if (!responses.SET_MODE) newErrors.push("SET_MODE");
      if (!responses.SET_AM) newErrors.push("SET_AM");
    }

    if (currentStepId === "module_select") {
      if (!responses.SET_MODULES || responses.SET_MODULES.length === 0)
        newErrors.push("SET_MODULES");
    }

    if (currentStepId === "conditional_setup") {
      if (
        !responses.SET_GROWTH_SYSTEMS ||
        responses.SET_GROWTH_SYSTEMS.length === 0
      )
        newErrors.push("SET_GROWTH_SYSTEMS");
      if (responses.SET_MODULES?.includes("PAID")) {
        if (!responses.SET_CURRENCY) newErrors.push("SET_CURRENCY");
        if (!responses.SET_SPEND) newErrors.push("SET_SPEND");
        if (!responses.SET_MARKET) newErrors.push("SET_MARKET");
      }
    }

    if (currentStepId === "prioritization") {
      if (!responses.PRIORITY_MODULES || responses.PRIORITY_MODULES.length < 2)
        newErrors.push("PRIORITY_MODULES");
    }

    if (currentStepId?.startsWith("growth_system_")) {
      const index = currentStepId.replace("growth_system_", "");
      ["GS_SAT", "GS_IMPACT", "GS_GAP"].forEach((id) => {
        const fullId = `GS_${index}_${id}`;
        if (!responses[fullId]) newErrors.push(fullId);
      });
    }

    const currentQuestions = [];
    let prefix = "";

    if (currentStepId?.startsWith("section_")) {
      const sid = currentStepId.replace("section_", "");
      const s = SECTIONS.find((x) => x.id === sid);
      if (s) {
        currentQuestions.push(...s.questions);
        if (responses.SET_MODE === SurveyMode.DEEP && s.deepDiveAdds) {
          currentQuestions.push(...s.deepDiveAdds);
        }
      }
    } else if (currentStepId?.startsWith("module_")) {
      prefix = currentStepId.replace("module_", "");
      const m = MODULES.find((x) => x.id === prefix);
      const isPriority =
        !isCorePrioritized || responses.PRIORITY_MODULES?.includes(prefix);
      if (m) {
        currentQuestions.push(
          ...(isPriority ? m.questions : MINI_BLOCK_QUESTIONS),
        );
      }
    }

    currentQuestions.forEach((q) => {
      const fullId = prefix ? `${prefix}_${q.id}` : q.id;
      if (q.required && responses[fullId] === undefined) {
        newErrors.push(fullId);
      }
      if (needsRecovery(fullId)) {
        RECOVERY_QUESTIONS.forEach((rq) => {
          const recId = `${fullId}_${rq.id}`;
          if (!responses[recId]) newErrors.push(recId);
        });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to submit: ${errorData.error || "Unknown error"}. Please check your Resend API key and domain status.`,
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (q, prefix = "") => {
    const fullId = prefix ? `${prefix}_${q.id}` : q.id;
    const hasError = errors.includes(fullId);

    return (
      <div
        key={fullId}
        className={`space-y-4 animate-fade-in border-b border-slate-50 pb-8 last:border-0 ${hasError ? "ring-2 ring-red-50 ring-offset-8 rounded-xl" : ""}`}
      >
        <label
          className={`block text-lg font-semibold leading-tight ${hasError ? "text-red-600" : "text-slate-800"}`}
        >
          {q.text}
          {q.required && <span className="text-emerald-500 ml-1">*</span>}
        </label>

        {q.type === "rating" || q.type === "nps" ? (
          <RatingInput
            id={fullId}
            value={responses[fullId]}
            onChange={(val) => updateResponse(fullId, val)}
            allowNotDelivered={q.allowNotDelivered}
            allowNotApplicable={q.allowNotApplicable}
            isNps={q.type === "nps"}
          />
        ) : q.type === "open-text" ? (
          <textarea
            value={responses[fullId] || ""}
            onChange={(e) => updateResponse(fullId, e.target.value)}
            placeholder="Please provide details..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[100px] focus:bg-white transition-all text-slate-700"
          />
        ) : q.type === "single-select" && q.options ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt) => {
              const label = typeof opt === "string" ? opt : opt.label;
              const val = typeof opt === "string" ? opt : opt.value;
              return (
                <button
                  key={val}
                  onClick={() => updateResponse(fullId, val)}
                  className={`p-3 rounded-lg border text-left transition-all ${responses[fullId] === val ? "bg-slate-900 border-slate-900 text-white font-bold" : "bg-white border-slate-100 hover:bg-slate-50 text-slate-600"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : q.type === "short-text" ? (
          <input
            type="text"
            value={responses[fullId] || ""}
            onChange={(e) => updateResponse(fullId, e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:bg-white transition-all text-slate-700"
          />
        ) : null}

        {needsRecovery(fullId) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mt-4 space-y-4 shadow-sm border border-red-100">
            <h4 className="text-red-900 font-black uppercase tracking-[0.2em] text-[10px]">
              Quick follow-up so we can fix this
            </h4>
            {RECOVERY_QUESTIONS.map((rq) => {
              const recId = `${fullId}_${rq.id}`;
              const hasRecError = errors.includes(recId);
              return (
                <div key={recId}>
                  <label
                    className={`block text-xs font-bold mb-1 ${hasRecError ? "text-red-700" : "text-red-800"}`}
                  >
                    {rq.text} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={responses[recId] || ""}
                    onChange={(e) => updateResponse(recId, e.target.value)}
                    className={`w-full bg-white border rounded-lg p-3 text-sm focus:border-red-500 ${hasRecError ? "border-red-400" : "border-red-200"}`}
                    placeholder="Provide a specific example or solution..."
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const calculateTopPriorities = () => {
    if (responses.PRIORITY_MODULES && responses.PRIORITY_MODULES.length > 0) {
      return MODULES.filter((m) =>
        responses.PRIORITY_MODULES.includes(m.id),
      ).map((m) => m.name);
    }
    return (responses.SET_MODULES || [])
      .slice(0, 2)
      .map((id) => MODULES.find((m) => m.id === id)?.name || id);
  };

  if (isSubmitted) {
    const priorities = calculateTopPriorities();
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white rounded-3xl p-12 text-center survey-card border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Feedback Submitted
          </h1>
          <p className="text-slate-600 mb-10 text-lg leading-relaxed">
            Thank you. Your insights are being reviewed by MDS leadership. We
            have captured your top focus areas:
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {priorities.map((p) => (
              <span
                key={p}
                className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-10 border border-slate-100 border-dashed">
            <h3 className="font-bold text-slate-800 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside font-medium">
              <li>MDS leadership reviews all high-priority items.</li>
              <li>Operational adjustments planned for the next 90 days.</li>
              {responses.CL_FU === "Yes" && (
                <li>
                  Your Account Manager will follow up via {responses.CL_CHAN}.
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            {responses.CL_FU === "Yes" && (
              <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                Schedule 15-min Review
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              Start new survey
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ProgressBar currentStep={step} totalSteps={steps.length - 1} />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 w-full pb-32">
        <div className="flex justify-between items-center mb-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Step {step} of {steps.length - 1}
            </span>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.1em]">
              {savedStatus}
            </span>
          </div>
          {step > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
              </svg>
              Save & Exit
            </button>
          )}
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-700 px-6 py-4 rounded-2xl mb-6 text-xs font-bold uppercase tracking-widest border border-red-100 animate-fade-in">
            Please complete all required fields (marked with *)
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepId}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-white rounded-3xl p-8 md:p-14 survey-card border border-slate-100"
          >
            {currentStepId === "welcome" && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                    Help us improve your results — fast.
                  </h1>
                  <p className="text-xl text-slate-500 leading-relaxed font-medium">
                    A short, confidential survey reviewed by MDS leadership to
                    strengthen delivery and outcomes in the next 90 days.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  {[
                    {
                      title: "Confidential",
                      desc: "Direct review by leadership.",
                      icon: <Lock className="w-6 h-6 text-emerald-600" />,
                    },
                    {
                      title: "Smart Flow",
                      desc: "Tailored to your scope.",
                      icon: <Zap className="w-6 h-6 text-emerald-600" />,
                    },
                    {
                      title: "Autosaved",
                      desc: "Resume anytime.",
                      icon: <Save className="w-6 h-6 text-emerald-600" />,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group"
                    >
                      <div className="mb-3">{item.icon}</div>
                      <h3 className="font-bold text-slate-900 mb-1 group-hover:text-emerald-600">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 space-y-4">
                  <button
                    onClick={handleNext}
                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-[0.98] border-b-4 border-emerald-800"
                  >
                    Start Survey
                  </button>
                </div>
              </div>
            )}

            {currentStepId === "setup" && (
              <div className="space-y-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Step 0 — Setup
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Set the context for your feedback.
                  </p>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-xs font-bold uppercase tracking-widest mb-3 ${errors.includes("SET_EMAIL") ? "text-red-600" : "text-slate-400"}`}
                      >
                        Work Email <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={responses.SET_EMAIL || ""}
                        onChange={(e) =>
                          updateResponse("SET_EMAIL", e.target.value)
                        }
                        placeholder="your@email.com"
                        className={`w-full bg-slate-50 border-2 rounded-xl py-4 px-6 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold ${errors.includes("SET_EMAIL") ? "border-red-500 bg-red-50" : "border-slate-100"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={responses.SET_COMPANY || ""}
                        onChange={(e) =>
                          updateResponse("SET_COMPANY", e.target.value)
                        }
                        placeholder="Company Ltd."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 px-6 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-widest mb-3 ${errors.includes("SET_ROLE") ? "text-red-600" : "text-slate-400"}`}
                    >
                      Your Role <span className="text-emerald-500">*</span>
                    </label>
                    <select
                      value={responses.SET_ROLE || ""}
                      onChange={(e) =>
                        updateResponse("SET_ROLE", e.target.value)
                      }
                      className={`w-full bg-slate-50 border-2 rounded-xl py-4 px-6 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold ${errors.includes("SET_ROLE") ? "border-red-500 bg-red-50" : "border-slate-100"}`}
                    >
                      <option value="">Select role...</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Partnership Tenure
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(Tenure).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => updateResponse("SET_TENURE", val)}
                          className={`py-4 rounded-xl border-2 font-bold transition-all ${responses.SET_TENURE === val ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"}`}
                        >
                          {val} Months
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Account Manager
                    </label>
                    <select
                      value={responses.SET_AM || ""}
                      onChange={(e) => updateResponse("SET_AM", e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 px-6 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold"
                    >
                      <option value="">Select AM...</option>
                      {AM_ROSTER.map((am) => (
                        <option key={am} value={am}>
                          {am}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Survey Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          updateResponse("SET_MODE", SurveyMode.CORE)
                        }
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${responses.SET_MODE === SurveyMode.CORE ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-slate-200"}`}
                      >
                        <div
                          className={`text-lg font-black mb-1 ${responses.SET_MODE === SurveyMode.CORE ? "text-emerald-900" : "text-slate-900"}`}
                        >
                          Core
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          Essential. ~8 mins.
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          updateResponse("SET_MODE", SurveyMode.DEEP)
                        }
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${responses.SET_MODE === SurveyMode.DEEP ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200"}`}
                      >
                        <div
                          className={`text-lg font-black mb-1 ${responses.SET_MODE === SurveyMode.DEEP ? "text-indigo-900" : "text-slate-900"}`}
                        >
                          Deep-Dive
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          Diagnostic. ~25 mins.
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStepId === "conditional_setup" && (
              <div className="space-y-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Growth Context
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Additional details to tailor your evaluation.
                  </p>
                </div>
                <div className="space-y-8">
                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-widest mb-3 ${errors.includes("SET_GROWTH_SYSTEMS") ? "text-red-600" : "text-slate-400"}`}
                    >
                      Which Growth Systems are we building/managing?
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {GROWTH_SYSTEMS.map((gs) => (
                        <button
                          key={gs}
                          onClick={() => {
                            const curr = responses.SET_GROWTH_SYSTEMS || [];
                            updateResponse(
                              "SET_GROWTH_SYSTEMS",
                              curr.includes(gs)
                                ? curr.filter((i) => i !== gs)
                                : [...curr, gs],
                            );
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all font-bold ${responses.SET_GROWTH_SYSTEMS?.includes(gs) ? "bg-slate-900 border-slate-900 text-white" : errors.includes("SET_GROWTH_SYSTEMS") ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"}`}
                        >
                          {gs}
                        </button>
                      ))}
                    </div>
                  </div>

                  {responses.SET_MODULES?.includes("PAID") && (
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs font-bold uppercase tracking-widest mb-3 ${errors.includes("SET_CURRENCY") ? "text-red-600" : "text-slate-400"}`}
                          >
                            Currency
                          </label>
                          <select
                            value={responses.SET_CURRENCY || ""}
                            onChange={(e) =>
                              updateResponse("SET_CURRENCY", e.target.value)
                            }
                            className={`w-full bg-slate-50 border-2 rounded-xl py-3 px-4 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold ${errors.includes("SET_CURRENCY") ? "border-red-500 bg-red-50" : "border-slate-100"}`}
                          >
                            <option value="">Select...</option>
                            {CURRENCIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-bold uppercase tracking-widest mb-3 ${errors.includes("SET_SPEND") ? "text-red-600" : "text-slate-400"}`}
                          >
                            Monthly Spend
                          </label>
                          <select
                            value={responses.SET_SPEND || ""}
                            onChange={(e) =>
                              updateResponse("SET_SPEND", e.target.value)
                            }
                            disabled={!responses.SET_CURRENCY}
                            className={`w-full bg-slate-50 border-2 rounded-xl py-3 px-4 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold disabled:opacity-50 ${errors.includes("SET_SPEND") ? "border-red-500 bg-red-50" : "border-slate-100"}`}
                          >
                            <option value="">Select...</option>
                            {responses.SET_CURRENCY &&
                              SPEND_BANDS[responses.SET_CURRENCY].map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-bold uppercase tracking-widest mb-3 ${errors.includes("SET_MARKET") ? "text-red-600" : "text-slate-400"}`}
                        >
                          Primary Market
                        </label>
                        <select
                          value={responses.SET_MARKET || ""}
                          onChange={(e) =>
                            updateResponse("SET_MARKET", e.target.value)
                          }
                          className={`w-full bg-slate-50 border-2 rounded-xl py-3 px-4 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold ${errors.includes("SET_MARKET") ? "border-red-500 bg-red-50" : "border-slate-100"}`}
                        >
                          <option value="">Select...</option>
                          {MARKETS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStepId === "prioritization" && (
              <div className="space-y-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Focus Prioritization
                  </h2>
                  <p className="text-slate-500 font-medium">
                    You selected {selectedModulesCount} modules. In Core mode,
                    please pick your top 2 for deep evaluation.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {MODULES.filter((m) =>
                    responses.SET_MODULES?.includes(m.id),
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const curr = responses.PRIORITY_MODULES || [];
                        if (curr.includes(m.id)) {
                          updateResponse(
                            "PRIORITY_MODULES",
                            curr.filter((i) => i !== m.id),
                          );
                        } else if (curr.length < 2) {
                          updateResponse("PRIORITY_MODULES", [...curr, m.id]);
                        }
                      }}
                      className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all font-bold ${responses.PRIORITY_MODULES?.includes(m.id) ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" : errors.includes("PRIORITY_MODULES") ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-100 text-slate-700 hover:border-slate-300"}`}
                    >
                      <span>{m.name}</span>
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${responses.PRIORITY_MODULES?.includes(m.id) ? "bg-white border-white" : errors.includes("PRIORITY_MODULES") ? "border-red-300 bg-white" : "border-slate-200 bg-slate-50"}`}
                      >
                        {responses.PRIORITY_MODULES?.includes(m.id) && (
                          <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStepId?.startsWith("growth_system_") && (
              <div className="space-y-12">
                {(() => {
                  const index = parseInt(
                    currentStepId.replace("growth_system_", ""),
                  );
                  const systemName = responses.SET_GROWTH_SYSTEMS?.[index];
                  if (!systemName) return null;
                  return (
                    <>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                          System: {systemName}
                        </h2>
                        <p className="text-slate-500 font-medium">
                          Evaluating the performance and health of this growth
                          layer.
                        </p>
                      </div>
                      <div className="space-y-10">
                        {renderQuestion(
                          {
                            id: "GS_SAT",
                            text: `Overall satisfaction with the ${systemName}.`,
                            type: "rating",
                            required: true,
                          },
                          `GS_${index}`,
                        )}
                        {renderQuestion(
                          {
                            id: "GS_IMPACT",
                            text: "Impact on business outcomes so far.",
                            type: "rating",
                            required: true,
                          },
                          `GS_${index}`,
                        )}
                        {renderQuestion(
                          {
                            id: "GS_GAP",
                            text: "What is the #1 gap in this system today?",
                            type: "open-text",
                            required: true,
                          },
                          `GS_${index}`,
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {currentStepId === "module_select" && (
              <div className="space-y-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Scope Selection
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Select the MDS modules you received.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODULES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const curr = responses.SET_MODULES || [];
                        updateResponse(
                          "SET_MODULES",
                          curr.includes(m.id)
                            ? curr.filter((i) => i !== m.id)
                            : [...curr, m.id],
                        );
                      }}
                      className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all font-bold ${responses.SET_MODULES?.includes(m.id) ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-700 hover:border-slate-300"}`}
                    >
                      <span>{m.name}</span>
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${responses.SET_MODULES?.includes(m.id) ? "bg-white border-white" : "border-slate-200 bg-slate-50"}`}
                      >
                        {responses.SET_MODULES?.includes(m.id) && (
                          <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStepId?.startsWith("section_") && (
              <div className="space-y-12">
                {(() => {
                  const sid = currentStepId.replace("section_", "");
                  const s = SECTIONS.find((x) => x.id === sid);
                  if (!s) return null;
                  return (
                    <>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                          {s.title}
                        </h2>
                        <p className="text-slate-500 font-medium">
                          {s.description ||
                            "Continuous performance evaluation."}
                        </p>
                      </div>
                      <div className="space-y-10">
                        {s.questions.map((q) => renderQuestion(q))}
                        {responses.SET_MODE === SurveyMode.DEEP &&
                          s.deepDiveAdds?.map((q) => renderQuestion(q))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {currentStepId?.startsWith("module_") && (
              <div className="space-y-12">
                {(() => {
                  const mid = currentStepId.replace("module_", "");
                  const m = MODULES.find((x) => x.id === mid);
                  const isPriority =
                    !isCorePrioritized ||
                    responses.PRIORITY_MODULES?.includes(mid);
                  if (!m) return null;
                  return (
                    <>
                      <div className="space-y-2 border-b border-slate-50 pb-6">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                          Module: {m.name}
                        </h2>
                        <p
                          className={`text-[10px] font-black uppercase tracking-widest ${isPriority ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {isPriority
                            ? "Core Priority Evaluation"
                            : "Condensed Evaluation"}
                        </p>
                      </div>
                      <div className="space-y-10">
                        {(isPriority ? m.questions : MINI_BLOCK_QUESTIONS).map(
                          (q) => renderQuestion(q, mid),
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {currentStepId === "close_out" && (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Advocacy & Close-out
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Final steps to strengthen our partnership.
                  </p>
                </div>
                <div className="space-y-10">
                  {(() => {
                    const section = SECTIONS.find((s) => s.id === "close_out");
                    if (!section) return null;
                    return section.questions.map((q) => {
                      if (q.id === "CL_CHAN" && responses.CL_FU !== "Yes")
                        return null;
                      if (q.id === "ADV_2A" && responses.ADV_2 !== "Not yet")
                        return null;
                      return <div key={q.id}>{renderQuestion(q)}</div>;
                    });
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-6 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-xl font-black transition-all text-sm uppercase tracking-widest",
              step === 0
                ? "opacity-0 pointer-events-none"
                : "text-slate-400 hover:text-slate-900",
            )}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex-1 flex justify-center">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
              MDS World-Class V2
            </span>
          </div>

          <button
            onClick={step < steps.length - 1 ? handleNext : handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "btn-primary",
              step !== steps.length - 1 && "bg-slate-900 border-slate-800",
            )}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : step < steps.length - 1 ? (
              <span className="flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Submit <Check className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Save & Continue Later
            </h3>
            <p className="text-slate-500 font-medium">
              We'll send a secure resume link to your email. Your progress is
              already autosaved.
            </p>
            <input
              type="email"
              placeholder="Enter your work email"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 font-bold focus:border-emerald-500 transition-all"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100"
              >
                Email Me Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
