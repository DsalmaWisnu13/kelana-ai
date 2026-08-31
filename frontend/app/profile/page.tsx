"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserProfile {
  id: number;
  name: string;
  email: string;
  total_trips: number;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <p className="text-sm font-medium text-slate-500">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">

        <Link
          href="/"
          className="text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          ← Back to KelanaAI
        </Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">

          <div className="bg-blue-600 px-6 py-10 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl">
              👤
            </div>

            <h1 className="mt-4 text-2xl font-black">
              {user.name}
            </h1>

            <p className="mt-1 text-sm text-blue-100">
              {user.email}
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Name
              </p>

              <p className="mt-2 text-lg font-extrabold">
                {user.name}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email
              </p>

              <p className="mt-2 break-all text-lg font-extrabold">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                Total Trips Generated
              </p>

              <p className="mt-2 text-3xl font-black text-blue-700">
                {user.total_trips}
              </p>
            </div>

          </div>

          <div className="border-t border-slate-100 p-6 space-y-3">

            <Link
              href="/trips"
              className="block w-full rounded-2xl bg-blue-600 px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-blue-700"
            >
              View My Trips →
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                router.push("/login");
              }}
              className="block w-full rounded-2xl border border-slate-200 px-6 py-4 text-center text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Log Out
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}