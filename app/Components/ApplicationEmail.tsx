import { useState } from "react";

const ApplicationEmail = ({
    email,
    candidateName,
}: {
    email: ApplicationEmail;
    candidateName?: string;
}) => {
    const [copied, setCopied] = useState(false);
    const fullText = `${email.salutation || "Hi Hiring Manager,"}

${email.body}

${email.closing || "Kind regards,"}
${candidateName || ""}`.trim();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    return (
        <section className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Outreach-ready
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        Tailored application email
                    </h2>
                    <p className="text-sm text-slate-500">
                        Use this message when contacting recruiters or hiring managers.
                    </p>
                </div>
                <button
                    className="ghost-button px-4 py-2"
                    onClick={handleCopy}
                    type="button"
                >
                    {copied ? "Copied!" : "Copy email"}
                </button>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 space-y-3 text-sm text-slate-700">
                <div>
                    <span className="font-semibold text-slate-500">Subject:</span>{" "}
                    <span className="text-slate-900">{email.subject}</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed">
                    {email.salutation && <p>{email.salutation}</p>}
                    <p className="mt-2">{email.body}</p>
                    <p className="mt-4">
                        {email.closing || "Kind regards,"}
                        <br />
                        {candidateName || ""}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ApplicationEmail;
