"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Check, X } from "lucide-react";
import { normalizeExplicitUrl } from "@/lib/page-links";

interface PageUrlCellProps {
  /** Stored override, or null when the link is being derived. */
  value: string | null | undefined;
  /** What the page directory resolves for this row without an override. */
  resolved: string | null;
  /** Any resolved value is ignored — the cell only awaits completion. */
  onSave: (pageUrl: string | null) => unknown | Promise<unknown>;
}

/**
 * The "where does this name point?" cell in a mappings editor.
 *
 * Shows the derived link as placeholder text when there's no override, so it's
 * obvious at a glance which pages already resolve on their own and which ones
 * still need a URL typed in. Clearing the field removes the override and hands
 * the row back to the directory.
 */
export function PageUrlCell({ value, resolved, onSave }: PageUrlCellProps) {
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  // A save elsewhere on the page reloads the whole list, so the field has to
  // follow the stored value rather than keep a stale draft.
  useEffect(() => setDraft(value ?? ""), [value]);

  const trimmed = draft.trim();
  const dirty = trimmed !== (value ?? "").trim();
  const invalid = trimmed.length > 0 && normalizeExplicitUrl(trimmed) === null;

  const commit = async () => {
    if (!dirty || invalid) return;
    setSaving(true);
    try {
      await onSave(trimmed || null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex-1 min-w-[180px]">
        <input
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setDraft(value ?? "");
          }}
          placeholder={resolved ? "Auto — from page directory" : "Paste page URL"}
          className={`w-full rounded border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1 ${
            invalid
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-gray-300 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400"
          }`}
        />
        {invalid && (
          <p className="absolute left-0 top-full mt-0.5 text-[10px] text-red-500">
            Needs a full URL, e.g. threads.com/@essentiallygolf
          </p>
        )}
      </div>

      {dirty ? (
        <>
          <button
            onClick={commit}
            disabled={invalid || saving}
            title="Save link"
            className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDraft(value ?? "")}
            disabled={saving}
            title="Discard"
            className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <a
          href={resolved ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          title={resolved ? `Open ${resolved}` : "Not linked yet"}
          aria-disabled={!resolved}
          onClick={(e) => {
            if (!resolved) e.preventDefault();
          }}
          className={`p-1 rounded ${
            resolved
              ? "text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              : "text-gray-200 dark:text-gray-700 cursor-not-allowed"
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
