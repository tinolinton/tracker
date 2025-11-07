interface Job {
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
}

interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
    enhancedResume?: {
        pdfPath: string;
        content: GeneratedResume;
        updatedAt: number;
        filename: string;
    };
}

type FeedbackTip = {
    type: "good" | "improve";
    tip: string;
    explanation: string;
};

type FeedbackCategory = {
    score: number;
    tips: FeedbackTip[];
};

interface Feedback {
    overallScore: number;
    ATS: FeedbackCategory & {
        keywordMatch: number;
        formattingScore: number;
        readabilityScore: number;
        complianceScore: number;
        parsingConfidence: number;
        matchedKeywords: string[];
        missingKeywords: string[];
        redFlags: string[];
        priorityFixes: string[];
    };
    toneAndStyle: FeedbackCategory;
    content: FeedbackCategory;
    structure: FeedbackCategory;
    skills: FeedbackCategory;
}

interface GeneratedResumeSection {
    title: string;
    bullets: string[];
}

interface GeneratedResume {
    candidateName?: string;
    targetRole?: string;
    summary: string;
    sections: GeneratedResumeSection[];
    skills: string[];
    achievements: string[];
    callToAction?: string;
}

declare module "*.mjs?url" {
    const src: string;
    export default src;
}
