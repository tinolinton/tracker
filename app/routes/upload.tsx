import { type FormEvent, useEffect, useMemo, useState } from "react";
import Navbar from "~/Components/Navbar";
import FileUploader from "~/Components/FileUploader";
import { usePuterStore } from "../../lib/puter";
import { useNavigate } from "react-router";
import {
    prepareApplicationEmailPrompt,
    prepareInstructions,
    prepareResumeRewritePrompt,
} from "../../constants";
import { cn, generateUUID } from "../../lib/utils";
import { convertPdfToImage } from "../../lib/pdf2img";
import { generateResumePdf } from "../../lib/resumePdf";

type ProcessingStage =
    | "idle"
    | "upload"
    | "convert"
    | "imageUpload"
    | "persist"
    | "analyze"
    | "rewrite"
    | "pdf"
    | "email"
    | "store"
    | "complete";

type ResumeDraft = Omit<Resume, "feedback"> & { feedback: Feedback | string };

const getMessageText = (content: string | any[]): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .map((block) => {
                if (typeof block === "string") return block;
                if (block?.text) return block.text;
                if (block?.content) return block.content;
                return "";
            })
            .filter(Boolean)
            .join("\n");
    }
    return "";
};

const extractJson = (payload: string): any => {
    const trimmed = payload.trim();
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const jsonCandidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
    return JSON.parse(jsonCandidate);
};

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("Waiting for a resume upload");
    const [file, setFile] = useState<File | null>(null);
    const [activeStage, setActiveStage] = useState<ProcessingStage>("idle");
    const [existingResumes, setExistingResumes] = useState<Resume[]>([]);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState("");
    const [existingPreviewUrl, setExistingPreviewUrl] = useState("");

    const selectedResume = useMemo(
        () => existingResumes.find((resume) => resume.id === selectedResumeId),
        [existingResumes, selectedResumeId]
    );

    useEffect(() => {
        const fetchExistingResumes = async () => {
            setLoadingExisting(true);
            try {
                const stored = (await kv.list("resume:*", true)) as KVItem[];
                const parsed =
                    stored
                        ?.map((item) => {
                            try {
                                return JSON.parse(item.value) as Resume;
                            } catch {
                                return null;
                            }
                        })
                        .filter((resume): resume is Resume => !!resume?.resumePath) || [];
                parsed.sort(
                    (a, b) =>
                        (b.enhancedResume?.updatedAt ?? 0) - (a.enhancedResume?.updatedAt ?? 0)
                );
                setExistingResumes(parsed);
            } catch (error) {
                console.error("Failed to load stored resumes", error);
            } finally {
                setLoadingExisting(false);
            }
        };

        fetchExistingResumes();
    }, [kv]);

    useEffect(() => {
        let previewUrl: string | null = null;
        if (!selectedResume) {
            setExistingPreviewUrl("");
            return;
        }

        const loadPreview = async () => {
            const blob = await fs.read(selectedResume.imagePath);
            if (!blob) return;
            previewUrl = URL.createObjectURL(blob);
            setExistingPreviewUrl(previewUrl);
        };

        loadPreview();

        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [fs, selectedResume?.imagePath]);

    const clearExistingSelection = () => {
        setSelectedResumeId("");
        setExistingPreviewUrl("");
        if (!isProcessing) {
            setStatusText(file ? "Ready to analyze" : "Waiting for a resume upload");
            setActiveStage("idle");
        }
    };

    const handleExistingSelection = (resumeId: string) => {
        setSelectedResumeId(resumeId);
        setFile(null);
        if (!resumeId) {
            clearExistingSelection();
        } else if (!isProcessing) {
            setStatusText("Ready to analyze using a stored resume");
            setActiveStage("idle");
        }
    };

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        if (file) {
            setSelectedResumeId("");
            setExistingPreviewUrl("");
        }
        if (!isProcessing) {
            setStatusText(file ? "Ready to analyze" : "Waiting for a resume upload");
            setActiveStage("idle");
        }
    };

    const updateStage = (stage: ProcessingStage, text: string) => {
        setActiveStage(stage);
        setStatusText(text);
    };

    const fail = (message: string) => {
        setIsProcessing(false);
        setActiveStage("idle");
        setStatusText(message);
    };

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                     existingResume,
                                 }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file?: File | null;
        existingResume?: Resume | null;
    }) => {
        setIsProcessing(true);

        let resumePath = existingResume?.resumePath;
        let imagePath = existingResume?.imagePath;
        let uploadedFilePath = resumePath;

        if (file) {
            updateStage("upload", "Uploading the resume securely…");
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) return fail("Error: Failed to upload file");
            uploadedFilePath = uploadedFile.path;

            updateStage("convert", "Generating a high-resolution preview…");
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                return fail(imageFile.error ?? "Error: Failed to convert PDF to image");
            }

            updateStage("imageUpload", "Uploading preview image…");
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage) return fail("Error: Failed to upload image");

            resumePath = uploadedFilePath;
            imagePath = uploadedImage.path;
        } else if (existingResume) {
            updateStage("upload", "Reusing your previously uploaded resume.");
            updateStage("convert", "Loading stored preview.");
            updateStage("imageUpload", "Preview confirmed.");
            uploadedFilePath = existingResume.resumePath;
        }

        if (!resumePath || !imagePath || !uploadedFilePath) {
            return fail("Error: Unable to locate resume file. Please upload again.");
        }

        updateStage("persist", "Persisting resume metadata…");
        const uuid = generateUUID();
        const data: ResumeDraft = {
            id: uuid,
            resumePath,
            imagePath,
            companyName,
            jobTitle,
            jobDescription,
            feedback: "" as unknown as Feedback,
        };
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        updateStage("analyze", "Requesting ATS analysis from Claude…");

        const feedback = await ai.feedback(
            uploadedFilePath,
            prepareInstructions({ jobTitle, jobDescription })
        );
        if (!feedback) return fail("Error: Failed to analyze resume");

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        try {
            data.feedback = extractJson(feedbackText);
        } catch (error) {
            console.error("Failed to parse feedback", error, feedbackText);
            return fail("Error: Unable to parse AI feedback. Please retry.");
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        updateStage("rewrite", "Drafting an upgraded, job-aligned resume narrative.");
        const resumeRewritePrompt = prepareResumeRewritePrompt({
            jobTitle,
            jobDescription,
            feedbackJSON: JSON.stringify(data.feedback, null, 2),
        });
        const rewriteResponse = await ai.chat(
            [
                {
                    role: "user",
                    content: [
                        { type: "file", puter_path: uploadedFilePath },
                        { type: "text", text: resumeRewritePrompt },
                    ],
                },
            ],
            undefined,
            undefined,
            { model: "claude-3-7-sonnet" }
        );
        if (!rewriteResponse) return fail("Error: Failed to generate updated resume draft");

        const rewriteText = getMessageText(rewriteResponse.message.content);
        let generatedResume: GeneratedResume;
        try {
            generatedResume = extractJson(rewriteText);
        } catch (error) {
            console.error("Failed to parse updated resume JSON", error, rewriteText);
            return fail("Error: Unable to parse generated resume. Please retry.");
        }

        updateStage("pdf", "Rendering the polished resume PDF.");
        const resumePdf = await generateResumePdf({
            summary: generatedResume.summary,
            sections: generatedResume.sections || [],
            skills: generatedResume.skills || [],
            achievements: generatedResume.achievements || [],
            candidateName: generatedResume.candidateName || companyName || "Updated Resume",
            targetRole: generatedResume.targetRole || jobTitle,
            callToAction: generatedResume.callToAction,
        });

        updateStage("email", "Drafting a tailored application email.");
        const emailPrompt = prepareApplicationEmailPrompt({
            candidateName: generatedResume.candidateName || auth.user?.username,
            companyName,
            jobTitle,
            jobDescription,
            resumeSummary: generatedResume.summary,
        });
        const emailResponse = await ai.chat(
            [
                {
                    role: "user",
                    content: [
                        { type: "text", text: emailPrompt },
                    ],
                },
            ],
            undefined,
            undefined,
            { model: "claude-3-7-sonnet" }
        );
        if (!emailResponse) return fail("Error: Failed to generate application email");
        const emailText = getMessageText(emailResponse.message.content);
        let applicationEmail: ApplicationEmail;
        try {
            applicationEmail = extractJson(emailText);
        } catch (error) {
            console.error("Failed to parse application email", error, emailText);
            return fail("Error: Unable to parse application email. Please retry.");
        }

        updateStage("store", "Saving the regenerated resume.");
        const uploadedUpdatedResume = await fs.upload([resumePdf]);
        if (!uploadedUpdatedResume) return fail("Error: Failed to upload updated resume PDF");

        data.enhancedResume = {
            pdfPath: uploadedUpdatedResume.path,
            content: generatedResume,
            updatedAt: Date.now(),
            filename: resumePdf.name,
        };
        data.applicationEmail = applicationEmail;

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        updateStage("complete", "All set! Redirecting to your new report.");
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest("form");
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;

        if (!file && !selectedResume) {
            setStatusText("Upload a resume or choose one from your library before analyzing.");
            return;
        }

        handleAnalyze({
            companyName,
            jobTitle,
            jobDescription,
            file,
            existingResume: selectedResume,
        });
    };

    const processingSteps = useMemo(
        () => [
            {
                id: "upload" as ProcessingStage,
                label: "Upload & encrypt",
                description: "Send your PDF securely to Puter storage.",
            },
            {
                id: "convert" as ProcessingStage,
                label: "Create preview",
                description: "Render a high-res image for your report.",
            },
            {
                id: "imageUpload" as ProcessingStage,
                label: "Sync preview",
                description: "Store the visual preview alongside the PDF.",
            },
            {
                id: "persist" as ProcessingStage,
                label: "Persist data",
                description: "Save metadata, job info, and references.",
            },
            {
                id: "analyze" as ProcessingStage,
                label: "ATS analysis",
                description: "Claude builds ATS + recruiter-ready insights.",
            },
            {
                id: "rewrite" as ProcessingStage,
                label: "Resume rewrite",
                description: "AI integrates suggestions into a refreshed narrative.",
            },
            {
                id: "pdf" as ProcessingStage,
                label: "PDF rendering",
                description: "We typeset the content into a polished layout.",
            },
            {
                id: "email" as ProcessingStage,
                label: "Application email",
                description: "AI drafts a tailored outreach email.",
            },
            {
                id: "store" as ProcessingStage,
                label: "Secure storage",
                description: "Enhanced resume uploaded & linked to your report.",
            },
            {
                id: "complete" as ProcessingStage,
                label: "Ready",
                description: "Redirecting you to the interactive report.",
            },
        ],
        []
    );
    const currentStepIndex = processingSteps.findIndex((step) => step.id === activeStage);

    return (
        <main className="page-shell">
            <Navbar />

            <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="glass-panel rounded-3xl p-8 space-y-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Upload workspace
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                            Smart feedback for your next application
                        </h1>
                        <p className="mt-3 text-base text-slate-600">
                            Drop your resume, paste in the job context, and get ATS targeting suggestions in
                            less than a minute.
                        </p>
                    </div>

                    <form
                        id="upload-form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="form-div">
                                <label htmlFor="company-name">Company</label>
                                <input
                                    type="text"
                                    name="company-name"
                                    placeholder="Puter"
                                    id="company-name"
                                    disabled={isProcessing}
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Role</label>
                                <input
                                    type="text"
                                    name="job-title"
                                    placeholder="Senior Frontend Engineer"
                                    id="job-title"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job description</label>
                            <textarea
                                rows={6}
                                name="job-description"
                                placeholder="Paste the bullet points or summary that matters most…"
                                id="job-description"
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="uploader">Upload resume (PDF)</label>
                            <FileUploader onFileSelect={handleFileSelect} />
                        </div>

                        {existingResumes.length > 0 && (
                    <div className="space-y-4 rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            Or reuse a stored resume
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {loadingExisting
                                                ? "Loading your resume library…"
                                                : "Skip the upload by selecting a previous scan."}
                                        </p>
                                    </div>
                                    {selectedResumeId && (
                                        <button
                                            type="button"
                                            className="ghost-button px-3 py-1 text-xs"
                                            onClick={clearExistingSelection}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={selectedResumeId}
                                    onChange={(event) => handleExistingSelection(event.target.value)}
                                    disabled={loadingExisting}
                                >
                                    <option value="">
                                        {loadingExisting ? "Loading…" : "Choose a stored resume"}
                                    </option>
                                    {existingResumes.map((resume) => (
                                        <option key={resume.id} value={resume.id}>
                                            {(resume.companyName || "Personal resume") +
                                                " — " +
                                                (resume.jobTitle || "General")}
                                        </option>
                                    ))}
                                </select>

                                {selectedResume && (
                                    <div className="existing-resume-preview">
                                        {existingPreviewUrl ? (
                                            <img
                                                src={existingPreviewUrl}
                                                alt="Stored resume preview"
                                            />
                                        ) : (
                                            <div className="flex h-[140px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                                                Preview loading…
                                            </div>
                                        )}
                                        <div className="space-y-2 text-sm text-slate-600">
                                            <p className="text-base font-semibold text-slate-900">
                                                {selectedResume.jobTitle || "Resume"}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {selectedResume.companyName || "Personal resume"}
                                            </p>
                                            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                                    ATS {selectedResume.feedback?.ATS?.score ?? "--"}/100
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                                    Skills {selectedResume.feedback?.skills?.score ?? "--"}/100
                                                </span>
                                                {selectedResume.enhancedResume && (
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                                        Enhanced CV ready
                                                    </span>
                                                )}
                                                {selectedResume.applicationEmail && (
                                                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
                                                        Email ready
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="primary-button flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold"
                            type="submit"
                            disabled={( !file && !selectedResume) || isProcessing || isLoading}
                        >
                            {isProcessing ? "Analyzing…" : "Analyze resume"}
                        </button>
                    </form>
                </div>

                <div className="glass-panel rounded-3xl p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Processing timeline
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{statusText}</h2>

                    <ol className="mt-6 space-y-4">
                        {processingSteps.map((step, index) => {
                            const status =
                                activeStage === "idle" || currentStepIndex === -1
                                    ? "pending"
                                    : index < currentStepIndex
                                        ? "done"
                                        : index === currentStepIndex
                                            ? "active"
                                            : "pending";
                            return (
                                <li
                                    key={step.id}
                                    className="flex items-start gap-3"
                                >
                                    <span
                                        className={cn(
                                            "mt-1 h-3 w-3 rounded-full border",
                                            status === "done" && "border-emerald-400 bg-emerald-400",
                                            status === "active" && "border-indigo-500 bg-white",
                                            status === "pending" && "border-slate-300 bg-white"
                                        )}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                                        <p className="text-xs text-slate-500">{step.description}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="mt-8 rounded-2xl border border-white/40 bg-white/70 p-4 text-center">
                        <img
                            src="/images/resume-scan.gif"
                            alt="scan"
                            className="mx-auto h-36 w-36"
                        />
                        <p className="text-xs text-slate-500">
                            Claude 3.7 Sonnet cross-analyzes your resume vs. the job description.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};
export default Upload;
