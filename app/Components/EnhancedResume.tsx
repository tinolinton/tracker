interface EnhancedResumeProps {
    resume: GeneratedResume;
    downloadUrl?: string;
    filename?: string;
}

const EnhancedResume = ({ resume, downloadUrl, filename }: EnhancedResumeProps) => {
    const sections = resume.sections?.slice(0, 3) || [];

    return (
        <section className="glass-panel rounded-3xl p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Updated resume ready
                    </p>
                    <h2 className="text-3xl font-semibold text-slate-900">
                        {resume.candidateName || "Enhanced profile"}
                    </h2>
                    {resume.targetRole && (
                        <p className="text-sm text-slate-500">{resume.targetRole}</p>
                    )}
                </div>
                {downloadUrl && (
                    <a
                        href={downloadUrl}
                        download={filename || "updated-resume.pdf"}
                        className="primary-button w-fit px-6 py-2 text-sm font-semibold"
                    >
                        Download PDF
                    </a>
                )}
            </div>
            <p className="text-sm text-slate-600">{resume.summary}</p>

            {sections.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {sections.map((section) => (
                        <div
                            key={section.title}
                            className="rounded-2xl border border-white/50 bg-white/80 p-4"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {section.title}
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                {section.bullets.slice(0, 3).map((bullet, idx) => (
                                    <li key={`${section.title}-${idx}`} className="flex gap-2">
                                        <span className="text-indigo-500">•</span>
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {resume.skills?.length > 0 && (
                    <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Skills focus
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {resume.skills.slice(0, 10).map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {resume.achievements?.length > 0 && (
                    <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Signature wins
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                            {resume.achievements.slice(0, 3).map((achievement) => (
                                <li key={achievement}>{achievement}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {resume.callToAction && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900">
                    {resume.callToAction}
                </div>
            )}
        </section>
    );
};

export default EnhancedResume;
