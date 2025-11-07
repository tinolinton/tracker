import { type FormEvent, useMemo, useState } from "react";
import Navbar from "~/Components/Navbar";
import FileUploader from "~/Components/FileUploader";
import { usePuterStore } from "../../lib/puter";
import { useNavigate } from "react-router";
import { prepareInstructions } from "../../constants";
import { cn, generateUUID } from "../../lib/utils";
import { convertPdfToImage } from "../../lib/pdf2img";

type ProcessingStage =
    | "idle"
    | "upload"
    | "convert"
    | "imageUpload"
    | "persist"
    | "analyze"
    | "complete";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("Waiting for a resume upload");
    const [file, setFile] = useState<File | null>(null);
    const [activeStage, setActiveStage] = useState<ProcessingStage>("idle");

    const handleFileSelect = (file: File | null) => {
        setFile(file);
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
                                 }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);

        updateStage("upload", "Uploading the resume securely…");
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return fail("Error: Failed to upload file");

        updateStage("convert", "Generating a high-resolution preview…");
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) {
            return fail(imageFile.error ?? "Error: Failed to convert PDF to image");
        }

        updateStage("imageUpload", "Uploading preview image…");
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return fail("Error: Failed to upload image");

        updateStage("persist", "Persisting resume metadata…");
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        };
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        updateStage("analyze", "Requesting ATS analysis from Claude…");

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        );
        if (!feedback) return fail("Error: Failed to analyze resume");

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        try {
            data.feedback = JSON.parse(feedbackText);
        } catch (error) {
            console.error("Failed to parse feedback", error);
            return fail("Error: Unable to parse AI feedback. Please retry.");
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        updateStage("complete", "Analysis complete — redirecting to your report");
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest("form");
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

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

                        <button
                            className="primary-button flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold"
                            type="submit"
                            disabled={!file || isProcessing || isLoading}
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
