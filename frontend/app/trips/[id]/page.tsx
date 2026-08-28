import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getTrip } from "@/services/tripService";
import { Trip } from "@/types/trip";

interface TripDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TripDetailPage({
  params,
}: TripDetailPageProps) {
  const { id } = await params;

  const trip: Trip = await getTrip(Number(id));

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
        >
          ← Back to Trips
        </Link>

        {/* Main Card */}
        <div className="mt-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-7 py-8 text-white sm:px-9 sm:py-10">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
              ✈️ Trip Detail
            </p>

            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  {trip.destination}
                </h1>

                <p className="mt-3 text-sm font-medium text-blue-100">
                  {trip.days} days · ${trip.budget.toLocaleString()}
                </p>
              </div>

              <div className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">
                {trip.travel_style}
              </div>

            </div>
          </div>

          {/* Trip Information */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">

            {/* Destination */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  📍
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                    Destination
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {trip.destination}
                  </p>
                </div>

              </div>

            </div>

            {/* Budget */}
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                  💰
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Budget
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    ${trip.budget.toLocaleString()}
                  </p>
                </div>

              </div>

            </div>

            {/* Category */}
            <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                  🏷️
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-500">
                    Category
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {trip.category}
                  </p>
                </div>

              </div>

            </div>

            {/* Travel Style */}
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                  🎒
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                    Travel Style
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {trip.travel_style}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* AI Recommendation */}
          <div className="border-t border-slate-100 px-6 py-8 sm:px-8">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-xl">
                ✨
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-600">
                  KelanaAI
                </p>

                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                  AI Recommendation
                </h2>
              </div>

            </div>

            <article className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/70 to-white p-6 sm:p-7">

              <ReactMarkdown
                components={{

                  h1: ({ children }) => (
                    <h1 className="mb-5 text-2xl font-black leading-tight text-slate-950">
                      {children}
                    </h1>
                  ),

                  h2: ({ children }) => (
                    <h2 className="mb-4 mt-8 border-b border-teal-100 pb-2 text-xl font-extrabold text-slate-900">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-7 text-lg font-extrabold text-slate-900">
                      {children}
                    </h3>
                  ),

                  h4: ({ children }) => (
                    <h4 className="mb-2 mt-5 text-base font-bold text-teal-700">
                      {children}
                    </h4>
                  ),

                  p: ({ children }) => (
                    <p className="mb-4 text-sm leading-7 text-slate-700">
                      {children}
                    </p>
                  ),

                  ul: ({ children }) => (
                    <ul className="mb-5 ml-5 list-disc space-y-2 text-sm leading-7 text-slate-700">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="mb-5 ml-5 list-decimal space-y-2 text-sm leading-7 text-slate-700">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => (
                    <li className="pl-1">
                      {children}
                    </li>
                  ),

                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-950">
                      {children}
                    </strong>
                  ),

                  em: ({ children }) => (
                    <em className="text-slate-600">
                      {children}
                    </em>
                  ),

                  hr: () => (
                    <hr className="my-7 border-teal-100" />
                  ),
                }}
              >
                {trip.ai_recommendation}
              </ReactMarkdown>

            </article>

          </div>

        </div>

        {/* Bottom Back Button */}
        <div className="mt-6 text-center">
          <Link
            href="/trips"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
          >
            ← Back to Trip History
          </Link>
        </div>

      </div>
    </main>
  );
}