import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "../../lib/puter";
import Summary from "~/Components/Summary";
import ATS from "~/Components/ATS";
import Details from "~/Components/Details";
import EnhancedResume from "~/Components/EnhancedResume";
import ApplicationEmail from "~/Components/ApplicationEmail";

const clampScore = (value: number | undefined, fallback = 0) =>
    Math.max(0, Math.min(100, typeof value === "number" ? Math.round(value) : fallback));

const ensureTips = (
    tips: any[],
    defaultType: "good" | "improve" = "improve",
    defaultExplanation?: string
): FeedbackTip[] => {
    const fallbackExplanation =
        defaultExplanation ??
        (defaultType === "good"
            ? "This element is already working in your favor—keep it consistent."
            : "Address this recommendation to boost ATS alignment.");

    if (!Array.isArray(tips) || tips.length === 0) return [];

    return tips.map((tip, index) => {
        if (typeof tip === "string") {
            return {
                type: defaultType,
                tip,
                explanation: fallbackExplanation,
            };
        }

        const normalizedType: "good" | "improve" = tip.type === "good" ? "good" : "improve";
        return {
            type: normalizedType,
            tip: tip.tip || `Tip ${index + 1}`,
            explanation: tip.explanation || fallbackExplanation,
        };
    });
};

const normalizeCategory = (
    category: Partial<FeedbackCategory> | undefined,
    fallbackScore = 0,
    defaultType: "good" | "improve" = "improve"
): FeedbackCategory => ({
    score: clampScore(category?.score, fallbackScore),
    tips: ensureTips(category?.tips || [], defaultType),
});

const buildLegacyFeedback = (legacy: any): Feedback => {
    const toHundred = (value?: number) => {
        if (typeof value !== "number") return 0;
        return value <= 10 ? clampScore(value * 10) : clampScore(value);
    };

    const detailed = legacy.detailed_feedback || {};
    const strengths: string[] = detailed.strengths || [];
    const weaknesses: string[] = detailed.weaknesses || [];
    const improvements: string[] = detailed.improvement_suggestions || [];
    const keywordAnalysis = detailed.keyword_analysis || {};
    const matched: string[] = keywordAnalysis.present_keywords || [];
    const missing: string[] = keywordAnalysis.missing_keywords || [];
    const totalKeywords = matched.length + missing.length;
    const keywordMatch =
        totalKeywords === 0
            ? toHundred(legacy.ats_compatibility)
            : clampScore((matched.length / totalKeywords) * 100);

    const formatScore = toHundred(legacy.format_and_design);
    const contentScore = toHundred(legacy.content_quality);
    const relevanceScore = toHundred(legacy.relevance_to_job);
    const toneStyleScore = (contentScore + formatScore) / 2;

    const createTip = (items: string[], type: "good" | "improve", explanation: string) =>
        items.map((item) => ({
            type,
            tip: item,
            explanation,
        }));

    const structureKeywords = ["format", "structure", "layout", "section"];
    const skillKeywords = ["skill", "experience", "tool", "technology"];

    const structureTips = createTip(
        improvements.filter((imp) =>
            structureKeywords.some((keyword) => imp.toLowerCase().includes(keyword))
        ),
        "improve",
        "Improve layout, spacing, or section naming so ATS parsers can read it cleanly."
    );

    const skillsTips = createTip(
        improvements.filter((imp) =>
            skillKeywords.some((keyword) => imp.toLowerCase().includes(keyword))
        ),
        "improve",
        "Highlight these skills closer to the top or align wording with the job description."
    );

    const toneStyleTips = createTip(
        improvements.filter(
            (imp) =>
                !structureTips.some((tip) => tip.tip === imp) &&
                !skillsTips.some((tip) => tip.tip === imp)
        ),
        "improve",
        "Adjust tone, clarity, or phrasing to improve readability."
    );

    const atsTips = [
        ...matched.map((keyword) => ({
            type: "good" as const,
            tip: `Keyword detected: ${keyword}`,
            explanation: `The resume already mirrors "${keyword}", which increases ATS confidence.`,
        })),
        ...missing.map((keyword) => ({
            type: "improve" as const,
            tip: `Add keyword: ${keyword}`,
            explanation: `Introduce the exact phrase "${keyword}" in a bullet, headline, or skills list.`,
        })),
    ];

    const priorityFixes = improvements.slice(0, 4);
    const redFlags = weaknesses.slice(0, 3);

    return {
        overallScore: toHundred(legacy.overall_rating),
        ATS: {
            score: toHundred(legacy.ats_compatibility),
            keywordMatch,
            formattingScore: formatScore,
            readabilityScore: clampScore(toneStyleScore),
            complianceScore: clampScore((formatScore + keywordMatch) / 2),
            parsingConfidence: clampScore((formatScore + toneStyleScore) / 2),
            matchedKeywords: matched,
            missingKeywords: missing,
            redFlags,
            priorityFixes,
            tips: atsTips.length
                ? atsTips
                : [
                      {
                          type: "improve",
                          tip: "Add role-specific terminology",
                          explanation: "Mirror phrasing from the job description to boost keyword density.",
                      },
                  ],
        },
        toneAndStyle: {
            score: clampScore(toneStyleScore),
            tips: toneStyleTips.length
                ? toneStyleTips
                : createTip(
                      strengths,
                      "good",
                      "Maintain this tone/style element because it reads clearly for hiring managers."
                  ),
        },
        content: {
            score: contentScore,
            tips:
                strengths.length || weaknesses.length
                    ? [
                          ...createTip(
                              strengths,
                              "good",
                              "This resonates with the job description—keep emphasizing it."
                          ),
                          ...createTip(
                              weaknesses,
                              "improve",
                              "Tighten this section to make accomplishments more compelling."
                          ),
                      ]
                    : [],
        },
        structure: {
            score: formatScore,
            tips: structureTips.length
                ? structureTips
                : [
                      {
                          type: "improve",
                          tip: "Use consistent headings",
                          explanation: "Ensure headings and dates follow the same format for ATS parsing.",
                      },
                  ],
        },
        skills: {
            score: relevanceScore || keywordMatch,
            tips: skillsTips.length
                ? skillsTips
                : [
                      {
                          type: "improve",
                          tip: "Group related skills",
                          explanation: "Grouping skills (cloud, languages, tooling) helps ATS scoring.",
                      },
                  ],
        },
    };
};

const transformFeedback = (original: any): Feedback => {
    if (!original) {
        return buildLegacyFeedback({});
    }

    const looksModern =
        original?.ATS &&
        typeof original.ATS.keywordMatch === "number" &&
        Array.isArray(original?.toneAndStyle?.tips);

    if (!looksModern) {
        return buildLegacyFeedback(original);
    }

    return {
        overallScore: clampScore(original.overallScore),
        ATS: {
            score: clampScore(original.ATS.score),
            keywordMatch: clampScore(original.ATS.keywordMatch),
            formattingScore: clampScore(original.ATS.formattingScore),
            readabilityScore: clampScore(original.ATS.readabilityScore),
            complianceScore: clampScore(original.ATS.complianceScore),
            parsingConfidence: clampScore(original.ATS.parsingConfidence),
            matchedKeywords: original.ATS.matchedKeywords || [],
            missingKeywords: original.ATS.missingKeywords || [],
            redFlags: original.ATS.redFlags || [],
            priorityFixes: original.ATS.priorityFixes || [],
            tips: ensureTips(original.ATS.tips || [], "improve"),
        },
        toneAndStyle: normalizeCategory(original.toneAndStyle, 0),
        content: normalizeCategory(original.content, 0),
        structure: normalizeCategory(original.structure, 0),
        skills: normalizeCategory(original.skills, 0),
    };
};

export const meta = () => ([
    { title: 'Tracker | Resume Review' },
    { name: 'description', content: 'Log into your account' },
]);

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeMeta, setResumeMeta] = useState<{
        companyName?: string;
        jobTitle?: string;
        jobDescription?: string;
    } | null>(null);
    const [enhancedResume, setEnhancedResume] = useState<Resume["enhancedResume"] | null>(null);
    const [enhancedPdfUrl, setEnhancedPdfUrl] = useState('');
    const [applicationEmail, setApplicationEmail] = useState<ApplicationEmail | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [auth.isAuthenticated, id, isLoading, navigate]);

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            // Transform the feedback data to match the expected structure
            const transformedFeedback = transformFeedback(data.feedback);
            setFeedback(transformedFeedback);
            setResumeMeta({
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                jobDescription: data.jobDescription,
            });
            setEnhancedResume(data.enhancedResume || null);
            setApplicationEmail(data.applicationEmail || null);
            console.log({resumeUrl, imageUrl, feedback: transformedFeedback });
        }

        loadResume();
    }, [fs, id, kv]);

    useEffect(() => {
        return () => {
            if (resumeUrl) URL.revokeObjectURL(resumeUrl);
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [imageUrl, resumeUrl]);

    useEffect(() => {
        if (!enhancedResume?.pdfPath) {
            setEnhancedPdfUrl('');
            return;
        }

        let pdfUrl = '';
        const loadPdf = async () => {
            const blob = await fs.read(enhancedResume.pdfPath);
            if (!blob) return;
            pdfUrl = URL.createObjectURL(blob);
            setEnhancedPdfUrl(pdfUrl);
        };

        loadPdf();

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [enhancedResume?.pdfPath, fs]);

    return (
        <main className="page-shell !pt-0">
            <nav className="resume-nav glass-panel">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-3 h-3" />
                    <span className="text-slate-700 text-sm font-semibold">Back to dashboard</span>
                </Link>
                <Link to="/upload" className="ghost-button">
                    New scan
                </Link>
            </nav>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                <div className="glass-panel sticky top-6 h-fit rounded-3xl p-4">
                    {imageUrl && resumeUrl ? (
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={imageUrl}
                                className="w-full rounded-2xl object-contain shadow-2xl"
                                title="resume preview"
                            />
                        </a>
                    ) : (
                        <div className="flex h-[600px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
                            Loading preview…
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <div className="glass-panel rounded-3xl p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Role analyzed
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                            {resumeMeta?.jobTitle || "Resume review"}
                        </h1>
                        <p className="mt-1 text-base text-slate-600">
                            {resumeMeta?.companyName || "No company provided"}
                        </p>

                        {resumeMeta?.jobDescription && (
                            <p className="mt-4 whitespace-pre-line text-sm text-slate-500">
                                {resumeMeta.jobDescription}
                            </p>
                        )}

                        {feedback && (
                            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                                <span className="rounded-full bg-slate-100 px-3 py-1">
                                    ATS score: {feedback.ATS.score}/100
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1">
                                    Keyword match: {feedback.ATS.keywordMatch}%
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1">
                                    Overall: {feedback.overallScore}/100
                                </span>
                            </div>
                        )}

                        {resumeUrl && (
                            <div className="mt-5 flex flex-wrap gap-3">
                                <a
                                    href={resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="primary-button w-fit px-6 py-2 text-sm font-semibold"
                                >
                                    Open PDF
                                </a>
                            </div>
                        )}
                    </div>

                    {feedback ? (
                        <div className="flex flex-col gap-6">
                            {enhancedResume?.content && (
                                <EnhancedResume
                                    resume={enhancedResume.content}
                                    downloadUrl={enhancedPdfUrl}
                                    filename={enhancedResume.filename}
                                />
                            )}
                            {applicationEmail && (
                                <ApplicationEmail
                                    email={applicationEmail}
                                    candidateName={
                                        enhancedResume?.content?.candidateName || auth.user?.username || "Candidate"
                                    }
                                />
                            )}
                            <Summary feedback={feedback} />
                            <ATS
                                score={feedback.ATS.score || 0}
                                suggestions={feedback.ATS.tips || []}
                                keywordMatch={feedback.ATS.keywordMatch}
                                formattingScore={feedback.ATS.formattingScore}
                                readabilityScore={feedback.ATS.readabilityScore}
                                complianceScore={feedback.ATS.complianceScore}
                                parsingConfidence={feedback.ATS.parsingConfidence}
                                matchedKeywords={feedback.ATS.matchedKeywords}
                                missingKeywords={feedback.ATS.missingKeywords}
                                priorityFixes={feedback.ATS.priorityFixes}
                                redFlags={feedback.ATS.redFlags}
                            />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="glass-panel rounded-3xl p-10 text-center">
                            <img src="/images/resume-scan-2.gif" className="mx-auto h-32 w-32" />
                            <p className="mt-4 text-sm text-slate-500">
                                Fetching your ATS report…
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Resume
