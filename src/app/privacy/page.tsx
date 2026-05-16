import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "March 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 md:p-12 text-gray-900 dark:text-gray-100 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Back to Settings
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              1. Introduction
            </h2>
            <p>
              Welcome to EssentiallyAnalytics ("we," "our," or "us"). We are committed to
              protecting your personal information and your right to privacy.
              This Privacy Policy outlines how we collect, use, and safeguard
              your data when you use our analytics dashboard and connect
              third-party accounts like Meta (Facebook/Instagram) and Google
              Analytics.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              2. Information We Collect
            </h2>
            <p>
              We collect information that you voluntarily provide to us when you
              register for the application and connect external integrations:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li>
                <strong>Account Data:</strong> Your email address and secure
                passwords used to access the dashboard.
              </li>
              <li>
                <strong>Meta Platform Data:</strong> When you connect your
                Facebook or Instagram accounts, we securely receive an access
                token. We use this to fetch public profile data, page/post
                insights, follower demographics, and engagement metrics.
              </li>
              <li>
                <strong>Web Analytics Data:</strong> Traffic data, UTM
                parameters, and aggregated website user demographics imported
                from Google Analytics / BigQuery.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              3. How We Use Your Information
            </h2>
            <p>
              The information we collect is strictly used to provide, improve,
              and administer our services. Specifically, we use your data to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li>
                Generate cross-channel marketing reports and visual dashboards.
              </li>
              <li>
                Automate the synchronization of historical social media and web
                traffic data.
              </li>
              <li>
                Maintain the security of your account via secure session
                cookies.
              </li>
            </ul>
            <p className="font-semibold text-gray-900 dark:text-white mt-2">
              We do not sell, rent, or trade your personal information to third
              parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              4. Data Storage and Security
            </h2>
            <p>
              Your data is stored securely on cloud infrastructure (e.g., AWS).
              We use industry-standard security measures, including encrypted
              databases and secure HTTPS connections, to protect your data from
              unauthorized access. Session management is handled via secure,
              HTTP-only cookies.
            </p>
          </section>

          <section className="space-y-3 bg-gray-50 dark:bg-gray-800/50  rounded-xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              5. Data Retention and Deletion (Your Rights)
            </h2>
            <p>
              You have full control over the data we import from third-party
              platforms.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-sm md:text-base">
              <li>
                <strong>Disconnecting Accounts:</strong> You can revoke our
                access to your Meta accounts at any time via the "Settings" page
                in our dashboard.
              </li>
              <li>
                <strong>Data Deletion:</strong> During the disconnection
                process, you are provided with a "Delete all historical data"
                option. Selecting this permanently wipes all downloaded posts,
                metrics, and snapshots associated with your account from our
                database.
              </li>
              <li>
                <strong>Manual Requests:</strong> You may also contact us
                directly to request a complete export or deletion of your
                account and all associated data.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              6. Contact Us
            </h2>
            <p>
              If you have questions or comments about this notice, or wish to
              exercise your data rights, please contact the administrator of
              this workspace at:
            </p>
            <p className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm w-fit mt-2">
              rajat@essentiallysports.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
