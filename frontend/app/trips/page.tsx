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
      const data = await getTrips();
      setTrips(data);
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

    // Sort
    if (sort === "latest") {
      return [...result].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }

    if (sort === "oldest") {
      return [...result].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
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
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              My Trips
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Trip History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {filteredTrips.length} saved itineraries
            </p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            + New Trip
          </Link>
        </div>

        {/* Search & Sort */}
        {trips.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trips..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              ✈️
            </div>

            <h2 className="mt-4 text-xl font-extrabold">
              No trips found.
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create your first itinerary.
            </p>

            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white"
            >
              Generate a Trip →
            </Link>

          </div>
        ) : paginatedTrips.length === 0 ? (

          /* Search Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="text-4xl">
              🔍
            </div>

            <h2 className="mt-4 text-xl font-extrabold">
              No matching trips
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try another destination or travel style.
            </p>

            <button
              onClick={() => setSearch("")}
              className="mt-5 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white"
            >
              Clear Search
            </button>

          </div>

        ) : (

          /* Trip List */
          <>
            <div className="space-y-4">
              {paginatedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ←
                </button>

                <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  →
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}