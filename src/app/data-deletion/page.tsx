import React from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

/**
 * Public page referenced by the Meta app's "User Data Deletion" setting
 * (App Settings -> Basic -> Data deletion instructions URL). It must stay
 * reachable without a login session — see @/lib/public-routes.
 *
 * The data inventory below mirrors the actual Postgres schema. If an entity is
 * added to the backend, add it here and to the disconnect handler in
 * auth.Controller.ts, or this page becomes a false statement.
 */
export default function DataDeletion() {
  const lastUpdated = "21 July 2026";
  const contactEmail = "rajat@essentiallysports.com";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 md:p-12 text-gray-900 dark:text-gray-100 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Back to Privacy Policy
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <Trash2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Data Deletion Instructions
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              1. Who this applies to
            </h2>
            <p>
              EssentiallyAnalytics (&ldquo;the Service&rdquo;) is a private
              analytics dashboard operated by EssentiallySports and available at{" "}
              <span className="font-mono text-sm">esstudio.vercel.app</span>. It
              connects to Facebook Pages and Instagram Business accounts through
              the Meta application <strong>Social Studio</strong> (App ID{" "}
              <span className="font-mono text-sm">908250775184300</span>).
            </p>
            <p>
              These instructions explain how to have data that the Service has
              imported from Meta permanently erased. They apply to any person or
              organisation who has connected a Facebook Page or Instagram
              Business account to the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              2. What data we hold
            </h2>
            <p>
              When you connect an account, we store the following in our
              database. This is the complete inventory:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li>
                <strong>Connected account records</strong> — the Page or
                Instagram account ID, its display name, the platform, an access
                token, and synchronisation status.
              </li>
              <li>
                <strong>Daily performance snapshots</strong> — per-day follower
                totals, followers gained, unfollows, reach, impressions, video
                views, engagement, and profile clicks.
              </li>
              <li>
                <strong>Post records</strong> — post ID, post type, the post
                message text, media and thumbnail URLs, permalink, publication
                time, published and boosted flags, author name, and per-post
                likes, comments, shares, reach, views and clicks.
              </li>
              <li>
                <strong>Comment records</strong> — where a post&rsquo;s top
                comment contains a link, we store the comment ID, the comment
                text, the linked URL, and the time it was checked.
              </li>
              <li>
                <strong>Aggregated audience demographics</strong> — grouped
                age/gender bands and top cities and countries. These are
                aggregate counts supplied by Meta; we do not receive or store
                the identities of individual followers.
              </li>
              <li>
                <strong>Monetisation records</strong> — per-day earnings figures
                reported by Meta for the connected Page, and the Page-to-team
                mapping used to group them.
              </li>
            </ul>
            <p className="text-sm">
              We access this data using read-only permissions. The Service does
              not post, comment, message, delete, or otherwise write anything to
              your Facebook or Instagram accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              3. How to delete your data
            </h2>

            <h3 className="text-base font-bold text-gray-900 dark:text-white pt-2">
              Option A — Delete it yourself (immediate)
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm md:text-base">
              <li>Sign in to the Service and open the Settings page.</li>
              <li>
                Locate the connected Facebook or Instagram account and select{" "}
                <strong>Disconnect</strong>.
              </li>
              <li>
                In the confirmation dialog, tick{" "}
                <strong>&ldquo;Delete all historical data&rdquo;</strong>.
              </li>
              <li>Confirm.</li>
            </ol>
            <p className="text-sm">
              Every category listed in section 2 is erased immediately and
              irreversibly for the accounts you disconnect, including the stored
              access token. Any queued background synchronisation jobs for those
              accounts are cancelled at the same time.
            </p>

            <h3 className="text-base font-bold text-gray-900 dark:text-white pt-3">
              Option B — Revoke access from Facebook
            </h3>
            <p className="text-sm">
              You may remove the application at any time from{" "}
              <strong>
                Facebook &rarr; Settings &amp; Privacy &rarr; Settings &rarr;
                Apps and Websites
              </strong>
              , or from{" "}
              <strong>
                Instagram &rarr; Settings &rarr; Apps and Websites
              </strong>
              . This immediately halts all further data collection. It does not
              by itself erase data already imported — use Option A or Option C
              for that.
            </p>

            <h3 className="text-base font-bold text-gray-900 dark:text-white pt-3">
              Option C — Ask us to delete it
            </h3>
            <p className="text-sm">
              If you cannot access the dashboard, email us and we will carry out
              the deletion on your behalf:
            </p>
            <p className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm w-fit border border-gray-200 dark:border-gray-700">
              {contactEmail}
            </p>
            <p className="text-sm">
              Use the subject line{" "}
              <strong>&ldquo;Data Deletion Request&rdquo;</strong> and state the
              Facebook Page name(s) or Instagram username(s) concerned. We
              acknowledge requests within 5 business days and complete verified
              deletions within 30 days. We may ask you to confirm that you
              control the account before acting, in order to prevent a
              third party from deleting data that is not theirs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              4. Retention
            </h2>
            <p className="text-sm md:text-base">
              We retain imported data for as long as the account remains
              connected, because historical figures are what the dashboard
              reports on. There is no automatic expiry. Once deletion is carried
              out under any option above, the records are removed from the live
              database and are not recoverable by us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              5. What is not covered
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li>
                Your EssentiallyAnalytics <strong>login account</strong> (email
                address and credentials) is separate from Meta data and is not
                removed by Option A. Ask us via Option C if you want it deleted
                as well.
              </li>
              <li>
                <strong>Website traffic data</strong> imported from Google
                Analytics and BigQuery is not Meta data and is unaffected by
                these instructions.
              </li>
              <li>
                Content on Facebook or Instagram itself is not touched. Deleting
                data here removes our copy only; your posts, comments and
                insights remain on Meta&rsquo;s platforms.
              </li>
              <li>
                We may retain a minimal record of a deletion request itself
                where necessary to demonstrate compliance, and may retain data
                where retention is required by law.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              6. Your statutory rights
            </h2>
            <p className="text-sm md:text-base">
              Where the GDPR applies, you have the right to erasure under
              Article 17, alongside rights of access, rectification, restriction
              and portability. Where the CCPA/CPRA applies, you have the right
              to request deletion of personal information and the right not to
              be discriminated against for exercising it. We do not sell or
              share personal information. To exercise any of these rights, use
              the contact address in Option C.
            </p>
            <p className="text-sm">
              We handle Meta platform data in accordance with the Meta Platform
              Terms and Developer Policies, including the obligation to delete
              platform data on request.
            </p>
          </section>

          <section className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              7. Contact
            </h2>
            <p className="text-sm md:text-base">
              Questions about this page or about how we handle your data:
            </p>
            <p className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm w-fit border border-gray-200 dark:border-gray-700">
              {contactEmail}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">
              See also our{" "}
              <Link
                href="/privacy"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
