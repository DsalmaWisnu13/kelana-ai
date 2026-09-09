"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateTrip } from "@/services/tripService";

interface TripRequest {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
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

export default function Home() {
  const router = useRouter();

  const [form, setForm] = useState<TripRequest>({
    destination: "",
    days: 1,
    budget: 0,
    travel_style: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

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

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

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

    try {
      await generateTrip({
        destination: form.destination.trim(),
        budget: form.budget,
        days: form.days,
        travel_style: form.travel_style,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );

      router.push("/trips");
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

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-900">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">

          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-lg shadow-blue-600/20">
              ✈️
            </div>

            <div className="text-left">
              <h1 className="text-lg font-extrabold tracking-tight">
                Kelana<span className="text-blue-600">AI</span>
              </h1>

              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                AI Travel Planner
              </p>
            </div>
          </button>

          {/* Navigation */}
          <div className="hidden items-center gap-1 md:flex">

            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
            >
              Plan Trip
            </button>

            <button
              onClick={() => router.push("/chat")}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              💬 Chat AI
            </button>

            <button
              onClick={() => router.push("/trips")}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              📋 Trip History
            </button>

          </div>

          {/* Account */}
          {isLoggedIn ? (
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                setIsLoggedIn(false);
                router.push("/");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              👤 Account
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Sign In
            </button>
          )}

        </div>

        {/* Mobile Navigation */}
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 pb-3 md:hidden sm:px-8">
          <button
            onClick={() => router.push("/")}
            className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
          >
            ✈️ Plan Trip
          </button>

          <button
            onClick={() => router.push("/chat")}
            className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
          >
            💬 Chat AI
          </button>

          <button
            onClick={() => router.push("/trips")}
            className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
          >
            📋 History
          </button>
        </div>
      </nav>

      {/* Main */}
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

        {/* Planner */}
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

              {/* Login Notice */}
              {!isLoggedIn && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-800">
                    🔐 Sign in to save your travel plans
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-600">
                    Your itinerary will be saved to your personal trip history.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-100 bg-red-50 p-5"
                >

                  <div className="flex items-start gap-3">

                    <span className="text-xl">
                      ⚠️
                    </span>

                    <div className="flex-1">

                      <p className="text-sm font-bold text-red-800">
                        Unable to generate itinerary.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </p>

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
                ) : isLoggedIn ? (
                  <>✨ Generate My Trip</>
                ) : (
                  <>🔐 Sign In to Generate</>
                )}

              </button>

              <p className="text-center text-xs text-slate-400">
                Powered by KelanaAI & FastAPI
              </p>

            </div>

          </form>

        </section>

        {/* Loading */}
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

      </div>

    </main>
  );
}