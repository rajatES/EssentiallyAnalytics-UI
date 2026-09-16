import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageNameLinkProps {
  name: string;
  /** Resolved click-through URL. Null renders the name as plain text. */
  href: string | null;
  className?: string;
  /** Hide the trailing icon where the row is already cramped. */
  showIcon?: boolean;
}

/**
 * A page name in a table, clickable when we know where it points.
 *
 * Used across Traffic, Reports and Revenue so the affordance reads the same
 * everywhere, and so the "we couldn't resolve this one" case is a single
 * decision rather than a per-table judgement call. Unlinked names keep the
 * surrounding row's styling exactly — nothing about the table shifts when a
 * mapping gains or loses a URL.
 *
 * `noopener` matters here: these open pages on domains we don't control.
 */
export function PageNameLink({
  name,
  href,
  className,
  showIcon = true,
}: PageNameLinkProps) {
  // Both branches share the inline-flex + inner truncate shape so a row's
  // layout doesn't shift when a mapping gains or loses a URL.
  if (!href) {
    return (
      <span
        className={cn("inline-flex items-center min-w-0", className)}
        title={name}
      >
        <span className="truncate">{name}</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Stops the click from also hitting a row-level handler — several of
      // these tables toggle a group or a selection when the row is clicked.
      onClick={(e) => e.stopPropagation()}
      title={`${name} — opens in a new tab`}
      className={cn(
        "inline-flex items-center gap-1 min-w-0 hover:text-blue-600 dark:hover:text-blue-400 hover:underline underline-offset-2 transition-colors",
        className,
      )}
    >
      <span className="truncate">{name}</span>
      {showIcon && (
        <ExternalLink className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
      )}
    </a>
  );
}
