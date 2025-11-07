export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume-01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 86,
            ATS: {
                score: 88,
                keywordMatch: 82,
                formattingScore: 92,
                readabilityScore: 84,
                complianceScore: 86,
                parsingConfidence: 91,
                matchedKeywords: ["React", "TypeScript", "Design Systems", "Unit Testing"],
                missingKeywords: ["GraphQL", "Performance Optimization"],
                redFlags: ["Missing measurable impact for recent projects"],
                priorityFixes: [
                    "Add impact metrics for the flagship dashboard project",
                    "Call out experience collaborating with product/UX partners",
                ],
                tips: [
                    {
                        type: "good",
                        tip: "Clean visual structure",
                        explanation:
                            "Section hierarchy and whitespace make it easy for parsing engines to follow.",
                    },
                    {
                        type: "improve",
                        tip: "Expand keyword density",
                        explanation:
                            "Mirror wording from the job description to increase exact keyword matches for ATS scanners.",
                    },
                ],
            },
            toneAndStyle: {
                score: 90,
                tips: [
                    {
                        type: "good",
                        tip: "Confident voice",
                        explanation: "Action verbs and ownership language communicate leadership.",
                    },
                ],
            },
            content: {
                score: 84,
                tips: [
                    {
                        type: "improve",
                        tip: "Quantify achievements",
                        explanation: "Add baseline metrics so impact statements feel concrete.",
                    },
                ],
            },
            structure: {
                score: 92,
                tips: [
                    {
                        type: "good",
                        tip: "One-page format",
                        explanation: "Stays within ATS-friendly layout conventions.",
                    },
                ],
            },
            skills: {
                score: 78,
                tips: [
                    {
                        type: "improve",
                        tip: "Highlight testing tools",
                        explanation: "List Jest/React Testing Library since they are requested in the posting.",
                    },
                ],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume-02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 68,
            ATS: {
                score: 64,
                keywordMatch: 58,
                formattingScore: 72,
                readabilityScore: 60,
                complianceScore: 66,
                parsingConfidence: 70,
                matchedKeywords: ["Azure", "Terraform", "CI/CD"],
                missingKeywords: ["Kubernetes", "Cost Optimization", "Disaster Recovery"],
                redFlags: ["Dense paragraph blocks that lower scanability"],
                priorityFixes: [
                    "Convert paragraphs to bullet points with metrics",
                    "Add experience with managed Kubernetes services",
                ],
                tips: [
                    {
                        type: "good",
                        tip: "Strong platform coverage",
                        explanation: "Hands-on Azure experience is evident across multiple roles.",
                    },
                    {
                        type: "improve",
                        tip: "Fix formatting noise",
                        explanation:
                            "Use consistent bullet symbols and reduce font variations to improve parsing accuracy.",
                    },
                ],
            },
            toneAndStyle: {
                score: 62,
                tips: [
                    {
                        type: "improve",
                        tip: "Reduce filler wording",
                        explanation: "Shorten phrases like “responsible for” to action verbs for clarity.",
                    },
                ],
            },
            content: {
                score: 70,
                tips: [
                    {
                        type: "good",
                        tip: "Clear ownership",
                        explanation: "Each bullet indicates the role you played in the initiative.",
                    },
                ],
            },
            structure: {
                score: 65,
                tips: [
                    {
                        type: "improve",
                        tip: "Normalize headings",
                        explanation:
                            "Ensure headings use the same font size and weight so ATS parsers can detect sections.",
                    },
                ],
            },
            skills: {
                score: 60,
                tips: [
                    {
                        type: "improve",
                        tip: "Call out security tooling",
                        explanation:
                            "List cloud security controls (Key Vault, Defender) since they are part of the role.",
                    },
                ],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume-03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 74,
            ATS: {
                score: 76,
                keywordMatch: 72,
                formattingScore: 81,
                readabilityScore: 78,
                complianceScore: 75,
                parsingConfidence: 80,
                matchedKeywords: ["SwiftUI", "Combine", "Unit Testing"],
                missingKeywords: ["Accessibility", "Animations", "Localization"],
                redFlags: ["Skill summary is buried at the bottom of the page"],
                priorityFixes: [
                    "Move the skills graph near the top of the resume",
                    "Add a bullet on accessibility compliance (WCAG)",
                ],
                tips: [
                    {
                        type: "good",
                        tip: "Readable layout",
                        explanation:
                            "Two-column structure with consistent spacing aligns with ATS parsing heuristics.",
                    },
                    {
                        type: "improve",
                        tip: "Surface flagship metrics",
                        explanation:
                            "Highlight MAU and crash-rate improvements for the iOS apps you shipped.",
                    },
                ],
            },
            toneAndStyle: {
                score: 78,
                tips: [
                    {
                        type: "good",
                        tip: "Product mindset",
                        explanation:
                            "Bullets reference user satisfaction and app-store ratings which recruiters value.",
                    },
                ],
            },
            content: {
                score: 72,
                tips: [
                    {
                        type: "improve",
                        tip: "Mention Apple ecosystem tools",
                        explanation:
                            "Add instrumenting, TestFlight, and App Store Connect where relevant.",
                    },
                ],
            },
            structure: {
                score: 80,
                tips: [
                    {
                        type: "good",
                        tip: "Consistent date formatting",
                        explanation: "YYYY-MM ranges are machine readable and ATS friendly.",
                    },
                ],
            },
            skills: {
                score: 70,
                tips: [
                    {
                        type: "improve",
                        tip: "Add localization experience",
                        explanation:
                            "Include handling of RTL languages since the role mentions global launches.",
                    },
                ],
            },
        },
    },
];

export const AI_RESPONSE_FORMAT = `
interface Feedback {
  overallScore: number; // 0-100 composite score
  ATS: {
    score: number; // holistic ATS readiness
    keywordMatch: number; // keyword coverage percentage
    formattingScore: number; // layout compliance
    readabilityScore: number; // sentence clarity / bullet structure
    complianceScore: number; // alignment to ATS friendly best practices
    parsingConfidence: number; // how well the resume can be parsed
    matchedKeywords: string[]; // keywords already present verbatim
    missingKeywords: string[]; // keywords to add verbatim
    redFlags: string[]; // structural blockers that may cause rejection
    priorityFixes: string[]; // 2-4 high-impact tasks to improve ATS score
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[]; // 3-5 total, each with explanation
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}`;

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                        responseFormat = AI_RESPONSE_FORMAT,
                                    }: {
    jobTitle: string;
    jobDescription: string;
    responseFormat?: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${responseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;
