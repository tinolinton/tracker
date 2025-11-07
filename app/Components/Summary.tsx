import ScoreCircle from "~/Components/ScoreCircle";
import ScoreBadge from "~/Components/ScoreBadge";

const CategoryCard = ({
    title,
    data,
}: {
    title: string;
    data: FeedbackCategory;
}) => (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-lg">
        <div className="flex items-center justify-between gap-2">
            <p className="text-base font-medium text-slate-900">{title}</p>
            <ScoreBadge score={data.score} />
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${data.score}%` }}
            />
        </div>
        {data.tips?.length > 0 && (
            <p className="mt-3 text-sm text-slate-600">{data.tips[0].tip}</p>
        )}
    </div>
);

const Summary = ({ feedback }: { feedback: Feedback }) => {
    const categories = [
        { title: "Tone & Style", data: feedback.toneAndStyle },
        { title: "Content Depth", data: feedback.content },
        { title: "Structure", data: feedback.structure },
        { title: "Skills Alignment", data: feedback.skills },
    ];
    const keywordMatch = feedback.ATS.keywordMatch ?? feedback.ATS.score;

    return (
        <section className="glass-panel w-full space-y-6 rounded-3xl p-6">
            <div className="flex flex-wrap items-center gap-6">
                <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-white/40 blur-xl" aria-hidden />
                    <ScoreCircle score={feedback.overallScore} />
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-slate-900">Overall readiness</h2>
                    <p className="text-sm text-slate-500">
                        Composite score blending ATS health, keyword coverage, and storytelling strength.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="stat-chip">
                            ATS score <span>{feedback.ATS.score}/100</span>
                        </div>
                        <div className="stat-chip">
                            Keyword match <span>{keywordMatch}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.title}
                        title={category.title}
                        data={category.data}
                    />
                ))}
            </div>
        </section>
    );
};
export default Summary;
