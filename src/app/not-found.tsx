import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl font-black text-gray-200 dark:text-gray-800">
        404
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Page not found
      </h2>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
