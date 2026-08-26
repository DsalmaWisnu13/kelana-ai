"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";

interface TripRequest {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}

interface TripResult {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  ai_recommendation: string;
  created_at: string;
}

interface Activity {
  name: string;
  cost: string;
  description: string;
}

interface DayPlan {
  day: number;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
}

interface ParsedRecommendation {
  days: DayPlan[];
  transportation: string[];
  food: string[];
}

const travelStyles = [
  {
    value: "Backpacker",
    icon: "🎒",
    title: "Backpacker",
    description: "Hemat & fleksibel",
  },
  {
    value: "Family",
    icon: "👨‍👩‍👧",
    title: "Family",
    description: "Nyaman & menyenangkan",
  },
  {
    value: "Couple",
    icon: "💑",
    title: "Couple",
    description: "Santai & berkesan",
  },
  {
    value: "Luxury",
    icon: "✨",
    title: "Luxury",
    description: "Premium & nyaman",
  },
];

function parseRecommendation(markdown: string): ParsedRecommendation {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const days: DayPlan[] = [];
  const transportation: string[] = [];
  const food: string[] = [];

  let currentDay: DayPlan | null = null;
  let currentSection:
    | "morning"
    | "afternoon"
    | "evening"
    | "transportation"
    | "food"
    | null = null;

  let currentActivity: Activity | null = null;

  // Helper untuk membersihkan markdown seperti **text** atau *text*
  function cleanMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .trim();
  }

  for (const line of lines) {
    // =========================
    // DAY
    // =========================
    const dayMatch = line.match(/^## Day (\d+)/i);

    if (dayMatch) {
      if (currentDay) {
        days.push(currentDay);
      }

      currentDay = {
        day: Number(dayMatch[1]),
        morning: [],
        afternoon: [],
        evening: [],
      };

      currentSection = null;
      currentActivity = null;

      continue;
    }

    // =========================
    // SECTIONS
    // =========================
    if (/^### Morning Activities/i.test(line)) {
      currentSection = "morning";
      currentActivity = null;
      continue;
    }

    if (/^### Afternoon Activities/i.test(line)) {
      currentSection = "afternoon";
      currentActivity = null;
      continue;
    }

    if (/^### Evening Activities/i.test(line)) {
      currentSection = "evening";
      currentActivity = null;
      continue;
    }

    if (/^## Transportation Suggestions/i.test(line)) {
      currentSection = "transportation";
      currentActivity = null;
      continue;
    }

    if (/^## Local Food Recommendations/i.test(line)) {
      currentSection = "food";
      currentActivity = null;
      continue;
    }

    // =========================
    // OTHER ## HEADINGS
    // =========================
    if (/^## /.test(line)) {
      currentSection = null;
      currentActivity = null;
      continue;
    }

    // =========================
    // ACTIVITY
    // =========================
    const activityMatch = line.match(
      /^#### Activity \d+:\s*(?:\*\*)?(.*?)(?:\*\*)?$/i
    );

    if (
      activityMatch &&
      currentDay &&
      (
        currentSection === "morning" ||
        currentSection === "afternoon" ||
        currentSection === "evening"
      )
    ) {
      currentActivity = {
        name: cleanMarkdown(activityMatch[1]),
        cost: "Varies",
        description: "",
      };

      currentDay[currentSection].push(currentActivity);
      continue;
    }

    // =========================
    // COST
    // =========================
    if (
      currentActivity &&
      /^-\s*\*{0,2}Cost\*{0,2}:/i.test(line)
    ) {
      currentActivity.cost = cleanMarkdown(
        line.replace(/^-\s*\*{0,2}Cost\*{0,2}:\s*/, "")
      );

      continue;
    }

    // =========================
    // DESCRIPTION
    // =========================
    if (
      currentActivity &&
      /^-\s*\*{0,2}Description\*{0,2}:/i.test(line)
    ) {
      currentActivity.description = cleanMarkdown(
        line.replace(/^-\s*\*{0,2}Description\*{0,2}:\s*/, "")
      );

      continue;
    }

    // =========================
    // TRANSPORTATION
    // =========================
    if (
      currentSection === "transportation" &&
      line.startsWith("- ")
    ) {
      const value = cleanMarkdown(
        line.replace(/^-\s+/, "")
      );

      transportation.push(value);
      continue;
    }

    // =========================
    // LOCAL FOOD
    // =========================
    if (
      currentSection === "food" &&
      line.startsWith("- ")
    ) {
      const value = cleanMarkdown(
        line.replace(/^-\s+/, "")
      );

      food.push(value);
      continue;
    }
  }

  // Push final day
  if (currentDay) {
    days.push(currentDay);
  }

  return {
    days,
    transportation,
    food,
  };
}
export default function Home() {
  const [form, setForm] = useState<TripRequest>({
    destination: "",
    days: 1,
    budget: 0,
    travel_style: "",
  });

  const [result, setResult] = useState<TripResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "days" || name === "budget"
          ? Number(value)
          : value,
    }));

    setError(null);
  }

  function selectTravelStyle(style: string) {
    setForm((prev) => ({
      ...prev,
      travel_style: style,
    }));

    setError(null);
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!form.destination.trim()) {
      setError("Please enter your destination.");
      return;
    }

    if (form.budget <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    if (form.days < 1) {
      setError("Trip duration must be at least 1 day.");
      return;
    }

    if (!form.travel_style) {
      setError("Please choose your travel style.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/trips",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination: form.destination.trim(),
            budget: form.budget,
            days: form.days,
            travel_style: form.travel_style,
          }),
        }
      );

      if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
          const detail = await response.json();

          if (typeof detail?.detail === "string") {
            message = detail.detail;
          }
        } catch {
          // Ignore invalid JSON response
        }

        throw new Error(message);
      }

      const trip: TripResult = await response.json();

      // Keep loading state visible for at least 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      setResult(trip);

      setTimeout(() => {
        document
          .getElementById("trip-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      console.error("Trip generation failed:", err);

      if (err instanceof TypeError) {
        setError(
          "We couldn't connect to the server. Please try again."
        );
      } else {
        setError(
          "Something went wrong while generating your itinerary. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function resetTrip() {
    setForm({
      destination: "",
      days: 1,
      budget: 0,
      travel_style: "",
    });

    setResult(null);
    setError(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-lg shadow-blue-600/20">
              ✈️
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Kelana<span className="text-blue-600">AI</span>
              </h1>

              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                AI Travel Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Ready
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-20">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 sm:text-sm">
            ✨ AI-powered travel planning
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Your journey starts
            <span className="block text-blue-600">
              with KelanaAI.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Tell us where you want to go, your budget, and
            your travel style. KelanaAI will create a
            personalized travel plan just for you.
          </p>
        </section>

        {/* Planner form */}
        <section className="mx-auto mt-10 max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60 sm:p-8"
          >
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Start planning
              </p>

              <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                Where are you going?
              </h3>
            </div>

            <div className="space-y-6">
              {/* Destination */}
              <div>
                <label
                  htmlFor="destination"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Destination
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <span className="mr-3 text-xl">
                    🌏
                  </span>

                  <input
                    id="destination"
                    type="text"
                    name="destination"
                    value={form.destination}
                    onChange={handleInputChange}
                    placeholder="e.g. Japan, Bali, South Korea..."
                    autoComplete="off"
                    className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Budget & Duration */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="budget"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Budget
                  </label>

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                    <span className="mr-3 text-xl">
                      💰
                    </span>

                    <span className="mr-1 text-sm text-slate-400">
                      $
                    </span>

                    <input
                      id="budget"
                      type="number"
                      name="budget"
                      value={form.budget || ""}
                      onChange={handleInputChange}
                      placeholder="2000"
                      min={1}
                      step={1}
                      className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="days"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Duration
                  </label>

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                    <span className="mr-3 text-xl">
                      📅
                    </span>

                    <input
                      id="days"
                      type="number"
                      name="days"
                      value={form.days || ""}
                      onChange={handleInputChange}
                      min={1}
                      step={1}
                      className="w-full bg-transparent py-4 text-sm outline-none"
                      required
                    />

                    <span className="ml-2 text-xs text-slate-400">
                      days
                    </span>
                  </div>
                </div>
              </div>

              {/* Travel Style */}
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-slate-800">
                  Travel style
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  {travelStyles.map((style) => {
                    const isSelected =
                      form.travel_style === style.value;

                    return (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() =>
                          selectTravelStyle(style.value)
                        }
                        aria-pressed={isSelected}
                        className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                            : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">
                            {style.icon}
                          </span>

                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                              ✓
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-3 text-sm font-bold ${
                            isSelected
                              ? "text-blue-700"
                              : "text-slate-800"
                          }`}
                        >
                          {style.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {style.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Error */}
              {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-100 bg-red-50 p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">
                      Unable to generate itinerary.
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {error}
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating itinerary...
                  </>
                ) : (
                  <>✨ Generate My Trip</>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                Powered by KelanaAI & FastAPI
              </p>
            </div>
          </form>
        </section>

        {/* ========================= */}
        {/* TRIP RESULT */}
        {/* ========================= */}
        {loading && (
          <section className="mx-auto mt-10 max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-lg shadow-slate-200/50">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-8 text-center text-white sm:px-10 sm:py-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>

                <h3 className="mt-4 text-lg font-extrabold">
                  Generating itinerary...
                </h3>

                <p className="mt-2 text-sm text-teal-50">
                  Amazon Bedrock is thinking.
                </p>
              </div>
            </div>
          </section>
        )}
        {result && (
          <section
            id="trip-result"
            className="mx-auto mt-12 max-w-3xl scroll-mt-8"
          >
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
              {/* Result Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white sm:p-8">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

                <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

                <div className="relative">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-100">
                    ✨ Your personalized trip
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                        {result.destination}
                      </h3>

                      <p className="mt-2 text-sm text-blue-100">
                        {result.days} days ·{" "}
                        {form.travel_style} · $
                        {result.budget.toLocaleString()}
                      </p>
                    </div>

                    <div className="hidden text-5xl sm:block">
                      🗺️
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 p-5 sm:p-8">
                {/* Overview Cards */}
                <div>
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                      Trip overview
                    </p>

                    <h4 className="mt-1 text-xl font-extrabold text-slate-900">
                      Your travel snapshot
                    </h4>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Category */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 text-2xl">
                        🧭
                      </div>

                      <p className="text-xs font-medium text-slate-400">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {result.category}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 text-2xl">
                        📅
                      </div>

                      <p className="text-xs font-medium text-slate-400">
                        Duration
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {result.days} days
                      </p>
                    </div>

                    {/* Daily Budget */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 text-2xl">
                        💰
                      </div>

                      <p className="text-xs font-medium text-slate-400">
                        Daily budget
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        $
                        {result.daily_budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                {result.ai_recommendation && (
                  <div>
                    {/* Section Header */}
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                        🤖
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          AI Recommendation
                        </h4>

                        <p className="text-xs text-slate-400">
                          Your personalized travel itinerary
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const recommendation = parseRecommendation(
                        result.ai_recommendation
                      );

                      return (
                        <div className="space-y-5">

                          {/* DAY CARDS */}
                          {recommendation.days.map((day) => (
                            <div
                              key={day.day}
                              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                              {/* Day Header */}
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                                  Your itinerary
                                </p>

                                <h5 className="mt-1 text-xl font-extrabold">
                                  Day {day.day}
                                </h5>
                              </div>

                              <div className="space-y-6 p-5">

                                {/* Morning */}
                                {day.morning.length > 0 && (
                                  <div>
                                    <div className="mb-3 flex items-center gap-2">
                                      <span className="text-xl">🌅</span>

                                      <h6 className="text-sm font-extrabold text-slate-800">
                                        Morning
                                      </h6>
                                    </div>

                                    <div className="space-y-3">
                                      {day.morning.map((activity, index) => (
                                        <div
                                          key={index}
                                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <h6 className="text-sm font-bold text-slate-800">
                                              {activity.name}
                                            </h6>

                                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                              {activity.cost}
                                            </span>
                                          </div>

                                          {activity.description && (
                                            <p className="mt-2 text-xs leading-6 text-slate-500">
                                              {activity.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Afternoon */}
                                {day.afternoon.length > 0 && (
                                  <div>
                                    <div className="mb-3 flex items-center gap-2">
                                      <span className="text-xl">☀️</span>

                                      <h6 className="text-sm font-extrabold text-slate-800">
                                        Afternoon
                                      </h6>
                                    </div>

                                    <div className="space-y-3">
                                      {day.afternoon.map((activity, index) => (
                                        <div
                                          key={index}
                                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <h6 className="text-sm font-bold text-slate-800">
                                              {activity.name}
                                            </h6>

                                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                              {activity.cost}
                                            </span>
                                          </div>

                                          {activity.description && (
                                            <p className="mt-2 text-xs leading-6 text-slate-500">
                                              {activity.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Evening */}
                                {day.evening.length > 0 && (
                                  <div>
                                    <div className="mb-3 flex items-center gap-2">
                                      <span className="text-xl">🌙</span>

                                      <h6 className="text-sm font-extrabold text-slate-800">
                                        Evening
                                      </h6>
                                    </div>

                                    <div className="space-y-3">
                                      {day.evening.map((activity, index) => (
                                        <div
                                          key={index}
                                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <h6 className="text-sm font-bold text-slate-800">
                                              {activity.name}
                                            </h6>

                                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                              {activity.cost}
                                            </span>
                                          </div>

                                          {activity.description && (
                                            <p className="mt-2 text-xs leading-6 text-slate-500">
                                              {activity.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          ))}

                          {/* Transportation */}
                          {recommendation.transportation.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <div className="mb-4 flex items-center gap-3">
                                <span className="text-xl">🚗</span>

                                <div>
                                  <h5 className="text-sm font-extrabold text-slate-800">
                                    Transportation
                                  </h5>

                                  <p className="text-xs text-slate-400">
                                    Getting around your destination
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {recommendation.transportation.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="rounded-xl bg-white px-4 py-3 text-xs leading-5 text-slate-600"
                                    >
                                      {item}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Local Food */}
                          {recommendation.food.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <div className="mb-4 flex items-center gap-3">
                                <span className="text-xl">🍜</span>

                                <div>
                                  <h5 className="text-sm font-extrabold text-slate-800">
                                    Local Food
                                  </h5>

                                  <p className="text-xs text-slate-400">
                                    Things worth trying
                                  </p>
                                </div>
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2">
                                {recommendation.food.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="rounded-xl bg-white px-4 py-3 text-xs leading-5 text-slate-600"
                                    >
                                      {item}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })()}
                  </div>
                )}
                {/* New Trip */}
                <button
                  type="button"
                  onClick={resetTrip}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  ← Plan Another Trip
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-7 text-center sm:px-8">
          <p className="text-xs text-slate-400">
            © 2026 KelanaAI · Your AI-powered travel companion
          </p>
        </div>
      </footer>
    </main>
  );
}