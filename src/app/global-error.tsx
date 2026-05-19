"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="rounded-full bg-red-50 p-4">
            <svg
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-gray-500">
            A critical error occurred. Please reload the page.
          </p>
          <button
            onClick={reset}
            className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
