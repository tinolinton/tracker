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
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
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

declare module "*.mjs?url" {
    const src: string;
    export default src;
}
