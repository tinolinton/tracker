import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/Components/Navbar";
import { usePuterStore } from "../../lib/puter";
import { formatSize } from "../../lib/utils";

type ActionStatus = "idle" | "pending";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
    const navigate = useNavigate();

    const [fsItems, setFsItems] = useState<FSItem[]>([]);
    const [kvItems, setKvItems] = useState<KVItem[]>([]);
    const [loadingFS, setLoadingFS] = useState(false);
    const [loadingKV, setLoadingKV] = useState(false);
    const [pageReady, setPageReady] = useState(false);
    const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");
    const [logs, setLogs] = useState<string[]>([]);
    const [filter, setFilter] = useState("");

    const appendLog = (message: string) => {
        setLogs((prev) => [
            `${new Date().toLocaleTimeString()} — ${message}`,
            ...prev,
        ]);
    };

    const loadFsItems = async () => {
        setLoadingFS(true);
        try {
            const dir = (await fs.readDir("./")) as FSItem[];
            dir.sort((a, b) => a.name.localeCompare(b.name));
            setFsItems(dir);
        } catch (err) {
            console.error("Failed to load files", err);
            appendLog("❌ Failed to read file system contents.");
        } finally {
            setLoadingFS(false);
        }
    };

    const loadKvItems = async () => {
        setLoadingKV(true);
        try {
            const keys = (await kv.list("*", true)) as KVItem[];
            setKvItems(keys || []);
        } catch (err) {
            console.error("Failed to load KV items", err);
            appendLog("❌ Failed to read KV entries.");
        } finally {
            setLoadingKV(false);
        }
    };

    const refreshAll = async () => {
        await Promise.all([loadFsItems(), loadKvItems()]);
    };

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [auth.isAuthenticated, isLoading, navigate]);

    useEffect(() => {
        const boot = async () => {
            await refreshAll();
            setPageReady(true);
        };
        boot();
    }, []);

    const fsStats = useMemo(() => {
        const totalSize = fsItems.reduce((acc, item) => acc + (item.size || 0), 0);
        const directories = fsItems.filter((item) => item.is_dir).length;
        return {
            count: fsItems.length,
            directories,
            sizeLabel: formatSize(totalSize),
        };
    }, [fsItems]);

    const handleDeleteFile = async (item: FSItem) => {
        if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
        try {
            setActionStatus("pending");
            await fs.delete(item.path);
            appendLog(`🗑️ Deleted ${item.name}`);
            await loadFsItems();
        } catch (err) {
            console.error("delete failed", err);
            appendLog(`❌ Failed to delete ${item.name}`);
        } finally {
            setActionStatus("idle");
        }
    };

    const handleDeleteKey = async (key: string) => {
        if (!window.confirm(`Remove KV key ${key}?`)) return;
        try {
            setActionStatus("pending");
            await kv.delete(key);
            appendLog(`🗝️ Removed key ${key}`);
            await loadKvItems();
        } catch (err) {
            console.error("kv delete failed", err);
            appendLog(`❌ Failed to delete key ${key}`);
        } finally {
            setActionStatus("idle");
        }
    };

    const handleFlushKV = async () => {
        if (!window.confirm("Clear ALL KV entries?")) return;
        try {
            setActionStatus("pending");
            await kv.flush();
            appendLog("🗝️ KV store flushed");
            await loadKvItems();
        } catch (err) {
            console.error("kv flush failed", err);
            appendLog("❌ Failed to flush KV store");
        } finally {
            setActionStatus("idle");
        }
    };

    const handleWipeAll = async () => {
        if (
            !window.confirm(
                "This will delete every file and KV record created by this app. Proceed?"
            )
        )
            return;

        try {
            setActionStatus("pending");
            await Promise.all(
                fsItems.map(async (item) => {
                    try {
                        await fs.delete(item.path);
                    } catch (err) {
                        console.error("delete error", err);
                    }
                })
            );
            await kv.flush();
            appendLog("🧹 Completed full workspace wipe");
            await refreshAll();
        } catch (err) {
            console.error("wipe failed", err);
            appendLog("❌ Failed to complete wipe. Check logs.");
        } finally {
            setActionStatus("idle");
        }
    };

    const filteredKvItems = useMemo(() => {
        if (!filter) return kvItems;
        return kvItems.filter((item) =>
            item.key.toLowerCase().includes(filter.toLowerCase())
        );
    }, [kvItems, filter]);

    if (isLoading || !pageReady) {
        return (
            <main className="page-shell">
                <Navbar />
                <div className="glass-panel rounded-3xl p-10 text-center text-slate-500">
                    Loading Puter usage…
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="page-shell">
                <Navbar />
                <div className="glass-panel rounded-3xl p-8 text-center text-rose-600">
                    Error: {error}
                    <button className="ghost-button mt-4" onClick={() => clearError()}>
                        Dismiss
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <Navbar />
            <section className="mt-12 space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="glass-panel rounded-3xl p-6 space-y-2">
                        <p className="text-xs uppercase font-semibold tracking-[0.2em] text-slate-500">
                            Files stored
                        </p>
                        <p className="text-4xl font-semibold text-slate-900">
                            {fsStats.count}
                        </p>
                        <p className="text-sm text-slate-500">
                            {fsStats.directories} folders · {fsStats.sizeLabel}
                        </p>
                    </div>
                    <div className="glass-panel rounded-3xl p-6 space-y-2">
                        <p className="text-xs uppercase font-semibold tracking-[0.2em] text-slate-500">
                            KV entries
                        </p>
                        <p className="text-4xl font-semibold text-slate-900">
                            {kvItems.length}
                        </p>
                        <p className="text-sm text-slate-500">Key-value pairs stored</p>
                    </div>
                    <div className="glass-panel rounded-3xl p-6 space-y-2">
                        <p className="text-xs uppercase font-semibold tracking-[0.2em] text-slate-500">
                            Active user
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                            {auth.user?.username}
                        </p>
                        <button className="ghost-button mt-2 w-fit" onClick={handleWipeAll} disabled={actionStatus === "pending"}>
                            Wipe everything
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="glass-panel rounded-3xl p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
                                    File system
                                </p>
                                <h2 className="text-2xl font-semibold text-slate-900">
                                    Workspace explorer
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="ghost-button"
                                    onClick={loadFsItems}
                                    disabled={loadingFS || actionStatus === "pending"}
                                >
                                    Refresh
                                </button>
                                <button
                                    className="ghost-button text-rose-600"
                                    onClick={handleWipeAll}
                                    disabled={actionStatus === "pending"}
                                >
                                    Wipe files
                                </button>
                            </div>
                        </div>
                        <div className="table-scroll max-h-[360px] overflow-y-auto rounded-2xl border border-white/60 bg-white/80">
                            <table className="min-w-full text-sm text-slate-600">
                                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Size</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fsItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-slate-100 hover:bg-slate-50/60"
                                        >
                                            <td className="px-4 py-2 font-semibold text-slate-900">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.is_dir ? "Folder" : "File"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.size ? formatSize(item.size) : "--"}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {!item.is_dir && (
                                                    <button
                                                        className="text-xs font-semibold text-rose-600"
                                                        onClick={() => handleDeleteFile(item)}
                                                        disabled={actionStatus === "pending"}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!fsItems.length && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                                                File system is empty.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
                                    KV store
                                </p>
                                <h2 className="text-2xl font-semibold text-slate-900">
                                    Key inspector
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="ghost-button"
                                    onClick={loadKvItems}
                                    disabled={loadingKV || actionStatus === "pending"}
                                >
                                    Refresh
                                </button>
                                <button
                                    className="ghost-button text-rose-600"
                                    onClick={handleFlushKV}
                                    disabled={actionStatus === "pending"}
                                >
                                    Flush KV
                                </button>
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="Filter keys…"
                            className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-inner shadow-white/70 focus:border-indigo-200 focus:outline-none"
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                        />

                        <div className="table-scroll max-h-[360px] overflow-y-auto rounded-2xl border border-white/60 bg-white/80">
                            <table className="min-w-full text-sm text-slate-600">
                                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2">Key</th>
                                        <th className="px-4 py-2">Value</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredKvItems.map((item) => (
                                        <tr
                                            key={item.key}
                                            className="border-t border-slate-100 hover:bg-slate-50/60"
                                        >
                                            <td className="px-4 py-2 font-semibold text-slate-900 break-all">
                                                {item.key}
                                            </td>
                                            <td className="px-4 py-2 text-xs text-slate-500 break-all">
                                                {item.value?.toString().slice(0, 120) || "--"}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    className="text-xs font-semibold text-rose-600"
                                                    onClick={() => handleDeleteKey(item.key)}
                                                    disabled={actionStatus === "pending"}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!filteredKvItems.length && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                                                No keys match this filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
                                Audit log
                            </p>
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Session history
                            </h2>
                        </div>
                        <button className="ghost-button" onClick={() => setLogs([])}>
                            Clear log
                        </button>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-slate-600">
                        {logs.length === 0 ? (
                            <p className="text-slate-400">No actions recorded yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {logs.map((log, idx) => (
                                    <li key={`${log}-${idx}`}>{log}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default WipeApp;
