"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Loader2, Search, Link2 } from "lucide-react";
import {
  fetchPagePathMappings,
  createPagePathMapping,
  updatePagePathMapping,
  deletePagePathMapping,
  type PagePathMappingRow,
} from "@/lib/api";

const EMPTY = { pattern: "", pageName: "", category: "", team: "", priority: 0 };

/**
 * CRUD for landing-page mappings — the URL-pattern equivalent of the UTM
 * mappings directory.
 *
 * These are a separate concept, not a replacement: a UTM mapping answers "which
 * of our accounts sent this traffic", a pattern here answers "which of our
 * content did it land on". Organic referral traffic has no usable UTM, so
 * patterns are the only way to group it.
 */
export function PathMappingsPanel({ onChanged }: { onChanged?: () => void }) {
  const [rows, setRows] = useState<PagePathMappingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY });

  const load = async () => {
    setLoading(true);
    setRows(await fetchPagePathMappings());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const teams = useMemo(
    () => Array.from(new Set(rows.map((r) => r.team).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.pattern, r.pageName, r.category, r.team]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pattern.trim() || !form.pageName.trim()) return;
    setSaving(true);
    try {
      await createPagePathMapping({
        pattern: form.pattern.trim(),
        pageName: form.pageName.trim(),
        category: form.category.trim() || "Uncategorized",
        team: form.team.trim() || null,
        priority: Number(form.priority) || 0,
      });
      setForm({ ...EMPTY });
      await load();
      onChanged?.();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to add mapping (is the pattern already used?)";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (r: PagePathMappingRow) => {
    setEditingId(r.id);
    setEditForm({
      pattern: r.pattern,
      pageName: r.pageName,
      category: r.category,
      team: r.team || "",
      priority: r.priority,
    });
  };

  const saveEdit = async (id: number) => {
    try {
      await updatePagePathMapping(id, {
        pattern: editForm.pattern.trim(),
        pageName: editForm.pageName.trim(),
        category: editForm.category.trim() || "Uncategorized",
        team: editForm.team.trim() || null,
        priority: Number(editForm.priority) || 0,
      });
      setEditingId(null);
      await load();
      onChanged?.();
    } catch {
      alert("Failed to update mapping");
    }
  };

  const handleDelete = async (r: PagePathMappingRow) => {
    if (!confirm(`Delete the mapping for "${r.pattern}"?`)) return;
    await deletePagePathMapping(r.id);
    await load();
    onChanged?.();
  };

  const input =
    "w-full p-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white";

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-bold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-orange-500" /> Add Landing Page Mapping
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Match landing page URLs to a page and team. Use <code>*</code> as a wildcard —
          e.g. <code>/wnba-*</code> claims every WNBA article. Most specific pattern wins;
          raise Priority to break a tie.
        </p>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-semibold uppercase text-gray-500">URL Pattern</label>
            <input className={input} value={form.pattern} placeholder="/wnba-*"
              onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase text-gray-500">Page Name</label>
            <input className={input} value={form.pageName} placeholder="WNBA Content"
              onChange={(e) => setForm((f) => ({ ...f, pageName: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase text-gray-500">Category</label>
            <input className={input} value={form.category} placeholder="WNBA"
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase text-gray-500">Team</label>
            <input className={input} value={form.team} placeholder="Unassigned" list="path-team-options"
              onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))} />
            <datalist id="path-team-options">
              {teams.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase text-gray-500">Priority</label>
            <input className={input} type="number" value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))} />
          </div>
          <div className="sm:col-span-2 lg:col-span-6 flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Mapping
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold">Landing Page Mappings</h2>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pattern, page, team..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent py-1.5 pl-9 pr-3 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[11px] border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-2.5">URL Pattern</th>
                <th className="px-4 py-2.5">Page Name</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Team</th>
                <th className="px-4 py-2.5 text-right">Priority</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-500" />Loading…
                </td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {rows.length ? `No mappings match "${search}".` : "No landing page mappings yet. Add one above."}
                </td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-800 dark:text-gray-200">
                  {editingId === r.id ? (
                    <>
                      <td className="px-4 py-2.5"><input className={input} value={editForm.pattern}
                        onChange={(e) => setEditForm((f) => ({ ...f, pattern: e.target.value }))} /></td>
                      <td className="px-4 py-2.5"><input className={input} value={editForm.pageName}
                        onChange={(e) => setEditForm((f) => ({ ...f, pageName: e.target.value }))} /></td>
                      <td className="px-4 py-2.5"><input className={input} value={editForm.category}
                        onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} /></td>
                      <td className="px-4 py-2.5"><input className={input} value={editForm.team} list="path-team-options"
                        onChange={(e) => setEditForm((f) => ({ ...f, team: e.target.value }))} /></td>
                      <td className="px-4 py-2.5"><input className={input} type="number" value={editForm.priority}
                        onChange={(e) => setEditForm((f) => ({ ...f, priority: Number(e.target.value) }))} /></td>
                      <td className="px-4 py-2.5 text-right space-x-2">
                        <button onClick={() => saveEdit(r.id)} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg" title="Save">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 font-mono text-xs text-orange-600 dark:text-orange-400">{r.pattern}</td>
                      <td className="px-4 py-2.5 font-semibold text-blue-600 dark:text-blue-400">{r.pageName}</td>
                      <td className="px-4 py-2.5 font-semibold">{r.category}</td>
                      <td className="px-4 py-2.5">
                        {r.team ? <span className="text-violet-600 dark:text-violet-400">{r.team}</span>
                          : <span className="text-gray-400 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.priority}</td>
                      <td className="px-4 py-2.5 text-right space-x-2">
                        <button onClick={() => startEdit(r)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(r)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
