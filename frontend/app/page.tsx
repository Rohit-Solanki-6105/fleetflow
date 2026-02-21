import DashboardLayout from './(dashboard)/layout';
import { Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center font-sans">
        <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-500 mb-8 shadow-sm">
          <Truck className="h-12 w-12" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Welcome to <span className="text-blue-600 dark:text-blue-500">FleetFlow</span>
        </h1>

        <p className="mt-6 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
          Your centralized command center for fleet operations, logistics, dispatch tracking, and real-time maintenance monitoring.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/command-center"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Open Command Center
            <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-white dark:bg-gray-900 px-8 py-3.5 text-base font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
