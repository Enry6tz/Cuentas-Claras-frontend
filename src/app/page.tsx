import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-emerald-600">TripSplit</h1>
          <div className="flex gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="max-w-2xl px-6 text-center">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900">
            Split travel expenses with friends
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Track shared expenses, manage multiple currencies, calculate balances,
            and settle debts — all in one place.
          </p>
          <div className="mt-10">
            <Link
              href="/sign-up"
              className="rounded-lg bg-emerald-600 px-8 py-3 text-lg font-semibold text-white hover:bg-emerald-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
