import Link from "next/link";

interface Trip {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  travel_style?: string;
}

export default function TripCard({ trip }: { trip: Trip }) {
  // Destination icon
  const destinationIcons: Record<string, string> = {
    japan: "🗾",
    bali: "🌴",
    indonesia: "🇮🇩",
    singapore: "🦁",
    korea: "🇰🇷",
    "south korea": "🇰🇷",
    thailand: "🇹🇭",
    malaysia: "🇲🇾",
    australia: "🇦🇺",
    france: "🇫🇷",
    italy: "🇮🇹",
    spain: "🇪🇸",
    america: "🇺🇸",
    "united states": "🇺🇸",
    usa: "🇺🇸",
    china: "🇨🇳",
  };

  const icon =
    destinationIcons[trip.destination.toLowerCase()] ?? "✈️";

  // Category badge colors
  const categoryStyles: Record<string, string> = {
    backpacker:
      "bg-orange-50 text-orange-700 border-orange-100",
    standard:
      "bg-blue-50 text-blue-700 border-blue-100",
    luxury:
      "bg-purple-50 text-purple-700 border-purple-100",
  };

  const categoryStyle =
    categoryStyles[trip.category.toLowerCase()] ??
    "bg-slate-50 text-slate-700 border-slate-100";

  // Travel style badge colors
  const travelStyleStyles: Record<string, string> = {
    family:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    solo:
      "bg-cyan-50 text-cyan-700 border-cyan-100",
    couple:
      "bg-pink-50 text-pink-700 border-pink-100",
  };

  const travelStyle =
    trip.travel_style?.toLowerCase() ?? "";

  const travelStyleStyle =
    travelStyleStyles[travelStyle] ??
    "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-4">

        {/* Trip Information */}
        <div className="flex min-w-0 items-center gap-4">

          {/* Destination Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition-transform duration-200 group-hover:scale-105">
            {icon}
          </div>

          <div className="min-w-0">

            {/* Destination */}
            <h3 className="text-lg font-extrabold text-slate-900">
              {trip.destination}
            </h3>

            {/* Days + Budget */}
            <p className="mt-1 text-sm text-slate-500">
              {trip.days} days ·{" "}
              <span className="font-semibold text-slate-700">
                ${trip.budget.toLocaleString()}
              </span>
            </p>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-2">

              {/* Category Badge */}
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${categoryStyle}`}
              >
                {trip.category}
              </span>

              {/* Travel Style Badge */}
              {trip.travel_style && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${travelStyleStyle}`}
                >
                  🎒 {trip.travel_style}
                </span>
              )}

            </div>
          </div>
        </div>

        {/* View Details */}
        <span className="hidden shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition group-hover:bg-blue-700 sm:inline-block">
          View Details →
        </span>

        {/* Mobile Arrow */}
        <span className="text-xl font-bold text-blue-600 sm:hidden">
          →
        </span>

      </div>
    </Link>
  );
}