import type { FC } from "react";

interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge: FC<ScoreBadgeProps> = ({ score }) => {
    let badgeColor = "";
    let badgeText = "";

    if (score > 79) {
        badgeColor = "bg-emerald-50 text-emerald-600 border border-emerald-100";
        badgeText = "Excellent";
    } else if (score > 59) {
        badgeColor = "bg-amber-50 text-amber-600 border border-amber-100";
        badgeText = "On Track";
    } else {
        badgeColor = "bg-rose-50 text-rose-600 border border-rose-100";
        badgeText = "Needs Focus";
    }

    return (
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
            <span>{badgeText}</span>
            <span className="text-slate-400">•</span>
            <span>{score}</span>
        </div>
    );
};

export default ScoreBadge;
