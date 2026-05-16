import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = "March 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 md:p-12 text-gray-900 dark:text-gray-100 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        
        <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
          <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors w-fit">
            <ArrowLeft size={16} /> Back to Settings
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Last Updated: {lastUpdated}</p>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the EssentiallyAnalytics dashboard ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Description of Service</h2>
            <p>
              Our Service provides social media analytics and reporting by integrating with third-party APIs, including the Meta Graph API. We aggregate and visualize data from your connected Facebook and Instagram accounts, as well as web traffic sources.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Meta Integration & Third-Party Terms</h2>
            <p className="text-gray-900 dark:text-white">
              Our Service utilizes the Meta Graph API to fetch your data. By connecting your Meta accounts, you explicitly agree to comply with the 
              <a href="https://www.facebook.com/legal/terms" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline mx-1">Facebook Terms of Service</a> 
              and the 
              <a href="https://help.instagram.com/581066165581870" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline mx-1">Instagram Terms of Use</a>. 
              We are not responsible for any changes in third-party API availability, rate limits, or account suspensions resulting from your violation of Meta's policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li>Maintaining the confidentiality of your login credentials.</li>
              <li>Ensuring you have the legal right and necessary permissions to connect and view analytics for any Meta Pages or Instagram accounts you import into our Service.</li>
              <li>All activities that occur under your account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Intellectual Property</h2>
            <p>
              The visual interfaces, graphics, design, compilation, information, data, computer code, and all other elements of the Service are protected by intellectual property and other laws. All content fetched via the Meta API remains the property of its respective owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Termination</h2>
            <p>
              We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. You may also terminate your account at any time by disconnecting your profiles and requesting data deletion via the settings dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Limitation of Liability</h2>
            <p>
              In no event shall EssentiallyAnalytics, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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