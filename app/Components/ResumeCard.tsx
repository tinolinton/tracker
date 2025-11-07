import { Link } from "react-router";
import { useEffect, useState } from "react";
import ScoreCircle from "~/Components/ScoreCircle";
import { usePuterStore } from "../../lib/puter";

const ResumeCard = ({ resume }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [previewUrl, setPreviewUrl] = useState("");

    const { id, companyName, jobTitle, feedback, imagePath } = resume;
    const keywordMatch = feedback.ATS?.keywordMatch ?? feedback.ATS?.score ?? feedback.overallScore;
    const priorityFix = feedback.ATS?.priorityFixes?.[0];

    useEffect(() => {
        let active = true;
        let generatedUrl: string | null = null;
        const loadPreview = async () => {
            const blob = await fs.read(imagePath);
            if (!blob || !active) return;
            generatedUrl = URL.createObjectURL(blob);
            setPreviewUrl(generatedUrl);
        };
        loadPreview();

        return () => {
            active = false;
            if (generatedUrl) {
                URL.revokeObjectURL(generatedUrl);
            }
        };
    }, [fs, imagePath]);

    return (
        <Link
            to={`/resume/${id}`}
            className="group flex h-full flex-col gap-5 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-indigo-200/80"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {companyName || "Untitled company"}
                    </p>
                    <p className="text-xl font-semibold text-slate-900 break-words">
                        {jobTitle || "Resume scan"}
                    </p>
                </div>
                <ScoreCircle score={feedback.overallScore} />
            </div>

            {previewUrl ? (
                <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-slate-100">
                    <img
                        src={previewUrl}
                        alt={`${jobTitle || "Resume"} preview`}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
                </div>
            ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
                    Preview loading…
                </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                    Keyword match: {Math.round(keywordMatch)}%
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                    ATS: {feedback.ATS?.score ?? "--"}/100
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                    Content: {feedback.content.score}/100
                </span>
            </div>

            {priorityFix && (
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-900">Next fix:</span> {priorityFix}
                </p>
            )}
        </Link>
    );
};

export default ResumeCard;
