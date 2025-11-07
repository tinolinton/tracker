import { cn } from "../../lib/utils";
import { Accordion, AccordionContent, AccordionHeader, AccordionItem } from "~/Components/Accordion";
import ScoreBadge from "~/Components/ScoreBadge";

const CategoryContent = ({
                             tips,
                         }: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => (
    <div className="space-y-4">
        {tips.map((tip, index) => (
            <div
                key={`${tip.tip}-${index}`}
                className={cn(
                    "rounded-2xl border p-4 backdrop-blur",
                    tip.type === "good"
                        ? "border-emerald-100 bg-emerald-50/60"
                        : "border-amber-100 bg-amber-50/60"
                )}
            >
                <p className="text-base font-semibold text-slate-900">{tip.tip}</p>
                <p className="text-sm text-slate-600">{tip.explanation}</p>
            </div>
        ))}
        {tips.length === 0 && (
            <p className="text-sm text-slate-400">No insights recorded for this category.</p>
        )}
    </div>
);

const Details = ({ feedback }: { feedback: Feedback }) => {
    const sections = [
        { id: "tone-style", title: "Tone & Style", data: feedback.toneAndStyle },
        { id: "content", title: "Content", data: feedback.content },
        { id: "structure", title: "Structure", data: feedback.structure },
        { id: "skills", title: "Skills", data: feedback.skills },
    ];

    return (
        <section className="glass-panel w-full rounded-3xl p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Deep dive
            </p>
            <Accordion allowMultiple className="mt-4 divide-y divide-white/40">
                {sections.map((section) => (
                    <AccordionItem id={section.id} key={section.id}>
                        <AccordionHeader
                            itemId={section.id}
                            className="flex items-center justify-between py-4"
                        >
                            <div className="flex flex-col gap-1 text-left">
                                <p className="text-lg font-semibold text-slate-900">
                                    {section.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Top {section.data.tips.length || 0} insights
                                </p>
                            </div>
                            <ScoreBadge score={section.data.score} />
                        </AccordionHeader>
                        <AccordionContent itemId={section.id}>
                            <CategoryContent tips={section.data.tips} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
};

export default Details;
