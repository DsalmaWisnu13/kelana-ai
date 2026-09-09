"use client";

import Link from "next/link";
import TripCard from "@/components/TripCard";
import { getTrips } from "@/services/tripService";
import { Trip } from "@/types/trip";
import { useEffect, useMemo, useState } from "react";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const tripsPerPage = 10;

  // Get trips from API
  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (error) {
        console.error("Failed to load trips:", error);
      }
    }

    loadTrips();
  }, []);

  // Search + Sort
  const filteredTrips = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    const result = trips.filter((trip) => {
      const destination = trip.destination?.toLowerCase() ?? "";
      const travelStyle = trip.travel_style?.toLowerCase() ?? "";

      return (
        destination.includes(keyword) ||
        travelStyle.includes(keyword)
      );
    });

    if (sort === "latest") {
      return [...result].sort(
        (a, b) => (b.id ?? 0) - (a.id ?? 0)
      );
    }

    if (sort === "oldest") {
      return [...result].sort(
        (a, b) => (a.id ?? 0) - (b.id ?? 0)
      );
    }

    if (sort === "budget") {
      return [...result].sort(
        (a, b) => (b.budget ?? 0) - (a.budget ?? 0)
      );
    }

    return result;
  }, [trips, search, sort]);

  // Pagination
  const totalPages = Math.ceil(
    filteredTrips.length / tripsPerPage
  );

  const startIndex =
    (currentPage - 1) * tripsPerPage;

  const paginatedTrips = filteredTrips.slice(
    startIndex,
    startIndex + tripsPerPage
  );

  // Reset page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort]);

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-6 text-slate-900 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">

        {/* Top Navigation */}
        <div className="mb-8 flex items-center justify-between">

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
          >
            ← Back to Home
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg shadow-sm">
              ✈️
            </span>

            <span className="text-lg font-black tracking-tight text-slate-950">
              KelanaAI
            </span>
          </div>

        </div>

        {/* Hero Header */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-7 py-8 text-white shadow-xl shadow-blue-600/10 sm:px-9 sm:py-10">

          {/* Decorative circles */}
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10" />

          <div className="relative">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
              Your Journey
            </p>

            <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Trip History
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  All your personalized travel plans, saved in one place.
                </p>
              </div>

              <Link
                href="/"
                className="w-fit rounded-xl bg-white px-5 py-3 text-sm font-black text-blue-600 shadow-lg transition hover:bg-blue-50"
              >
                + Plan New Trip
              </Link>

            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Trips
            </p>

            <p className="mt-1 text-2xl font-black text-slate-950">
              {trips.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Showing
            </p>

            <p className="mt-1 text-2xl font-black text-blue-600">
              {filteredTrips.length}
            </p>
          </div>

          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:block">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status
            </p>

            <p className="mt-1 text-lg font-black text-emerald-600">
              ✨ Saved
            </p>
          </div>

        </div>

        {/* Search & Sort */}
        {trips.length > 0 && (
          <div className="mb-7 flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destination or travel style..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="latest">
                Latest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="budget">
                Highest Budget
              </option>
            </select>

          </div>
        )}

        {/* Empty State */}
        {trips.length === 0 ? (

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
              ✈️
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-950">
              Your journey starts here
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don't have any saved trips yet. Let KelanaAI create your first personalized itinerary.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Generate My First Trip →
            </Link>

          </div>

        ) : paginatedTrips.length === 0 ? (

          /* Search Empty State */
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🔍
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              No matching trips
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try another destination or travel style.
            </p>

            <button
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Clear Search
            </button>

          </div>

        ) : (

          /* Trip List */
          <>
            <div className="space-y-5">

              {paginatedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Destination Image */}
                  <div className="relative h-40 overflow-hidden sm:h-48">

                    <img
                      src={`https://images.unsplash.com/featured/1200x500/?${encodeURIComponent(
                        trip.destination
                      )},travel`}
                      alt={`${trip.destination} travel`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Destination */}
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                          Destination
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-white drop-shadow sm:text-3xl">
                          {trip.destination}
                        </h2>
                      </div>

                      <div className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-800 shadow-lg">
                        {trip.travel_style}
                      </div>

                    </div>

                  </div>

                  {/* Trip Card */}
                  <div className="p-4 sm:p-5">
                    <TripCard trip={trip} />
                  </div>

                </div>
              ))}

            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-9 flex items-center justify-center gap-2">

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ←
                </button>

                <span className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  →
                </button>

              </div>
            )}

          </>
        )}

        {/* Bottom Navigation */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">

          <Link
            href="/"
            className="text-sm font-bold text-slate-500 transition hover:text-blue-600"
          >
            ← Back to Home
          </Link>

          <p className="text-xs text-slate-400">
            Powered by KelanaAI ✨
          </p>

        </div>

      </div>
    </main>
  );
}