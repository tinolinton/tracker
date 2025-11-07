import { cn } from "../../lib/utils";
import ScoreCircle from "~/Components/ScoreCircle";

type AtsProps = {
    score: number;
    suggestions: FeedbackTip[];
    keywordMatch?: number;
    formattingScore?: number;
    readabilityScore?: number;
    complianceScore?: number;
    parsingConfidence?: number;
    matchedKeywords?: string[];
    missingKeywords?: string[];
    priorityFixes?: string[];
    redFlags?: string[];
};

const MetricBar = ({ label, value }: { label: string; value?: number }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{label}</span>
            <span className="font-semibold text-slate-900">
                {typeof value === "number" ? `${value}%` : "--"}
            </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
            <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${value ?? 0}%` }}
            />
        </div>
    </div>
);

const ChipList = ({
                      title,
                      items,
                      tone = "neutral",
                  }: {
    title: string;
    items?: string[];
    tone?: "neutral" | "warning";
}) => (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-4 backdrop-blur">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className="mt-3 flex flex-wrap gap-2">
            {items?.length ? (
                items.map((item) => (
                    <span
                        key={item}
                        className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            tone === "warning"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}
                    >
                        {item}
                    </span>
                ))
            ) : (
                <span className="text-sm text-slate-400">No items</span>
            )}
        </div>
    </div>
);

const ListBlock = ({
                       title,
                       items,
                       tone = "neutral",
                   }: {
    title: string;
    items?: string[];
    tone?: "neutral" | "warning";
}) => (
    <div
        className={cn(
            "rounded-2xl border p-4 backdrop-blur",
            tone === "warning"
                ? "border-rose-200/60 bg-rose-50/60"
                : "border-white/40 bg-white/70"
        )}
    >
        <p className="text-sm font-semibold text-slate-600">{title}</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {items?.length ? (
                items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{item}</span>
                    </li>
                ))
            ) : (
                <li className="text-slate-400">No findings</li>
            )}
        </ul>
    </div>
);

const ATS = ({
                 score,
                 suggestions = [],
                 keywordMatch,
                 formattingScore,
                 readabilityScore,
                 complianceScore,
                 parsingConfidence,
                 matchedKeywords,
                 missingKeywords,
                 priorityFixes,
                 redFlags,
             }: AtsProps) => {
    const metrics = [
        { label: "Keyword match", value: keywordMatch },
        { label: "Formatting", value: formattingScore },
        { label: "Readability", value: readabilityScore },
        { label: "Compliance", value: complianceScore },
        { label: "Parsing confidence", value: parsingConfidence },
    ];

    return (
        <section className="glass-panel w-full space-y-6 rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        ATS health
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-slate-900">
                        {score}/100
                    </p>
                    <p className="mt-2 max-w-xl text-sm text-slate-500">
                        Blended score using parsing confidence, keyword density, and formatting checks.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ScoreCircle score={score} />
                    <div className="stat-chip">
                        Parsing confidence <span>{parsingConfidence ?? "--"}%</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {metrics.map((metric) => (
                    <MetricBar key={metric.label} label={metric.label} value={metric.value} />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <ChipList title="Keywords detected" items={matchedKeywords} />
                <ChipList title="Keywords to add" items={missingKeywords} tone="warning" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <ListBlock title="Priority fixes" items={priorityFixes} />
                <ListBlock title="Red flags" items={redFlags} tone="warning" />
            </div>

            <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Insight stream
                </p>
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.tip}-${index}`}
                            className={cn(
                                "rounded-2xl border p-4 backdrop-blur",
                                suggestion.type === "good"
                                    ? "border-emerald-100 bg-emerald-50/60"
                                    : "border-amber-100 bg-amber-50/60"
                            )}
                        >
                            <p className="text-base font-semibold text-slate-900">{suggestion.tip}</p>
                            <p className="text-sm text-slate-600">
                                {suggestion.explanation || "Action item recorded from ATS analysis."}
                            </p>
                        </div>
                    ))}
                    {suggestions.length === 0 && (
                        <p className="text-sm text-slate-400">No ATS-specific tips generated.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ATS;
