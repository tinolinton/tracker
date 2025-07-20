import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "../../lib/puter";
import Summary from "~/Components/Summary";
import ATS from "~/Components/ATS";
import Details from "~/Components/Details";

// Function to transform the feedback data to match the expected structure
const transformFeedback = (originalFeedback: any): Feedback => {
    // Map scores from the original feedback to the expected structure
    const overallScore = originalFeedback.overall_rating * 10 || 0; // Convert to scale of 100
    const atsScore = originalFeedback.ats_compatibility * 10 || 0;
    const relevanceScore = originalFeedback.relevance_to_job * 10 || 0;
    const formatScore = originalFeedback.format_and_design * 10 || 0;
    const contentScore = originalFeedback.content_quality * 10 || 0;
    
    // Create tips from strengths and weaknesses
    const createTips = (items: string[], type: "good" | "improve", explanation: string = "") => {
        return items.map(item => ({
            type,
            tip: item,
            explanation
        }));
    };
    
    // Extract detailed feedback
    const detailedFeedback = originalFeedback.detailed_feedback || {};
    const strengths = detailedFeedback.strengths || [];
    const weaknesses = detailedFeedback.weaknesses || [];
    const improvements = detailedFeedback.improvement_suggestions || [];
    
    // Create ATS tips from keyword analysis
    const keywordAnalysis = detailedFeedback.keyword_analysis || {};
    const presentKeywords = keywordAnalysis.present_keywords || [];
    const missingKeywords = keywordAnalysis.missing_keywords || [];
    
    const atsTips = [
        ...presentKeywords.map(keyword => ({ 
            type: "good" as const, 
            tip: `Your resume includes the keyword: ${keyword}`
        })),
        ...missingKeywords.map(keyword => ({ 
            type: "improve" as const, 
            tip: `Consider adding the keyword: ${keyword}`
        }))
    ];
    
    // Create content tips from strengths and weaknesses
    const contentTips = [
        ...createTips(strengths, "good", "This is a strength in your resume."),
        ...createTips(weaknesses, "improve", "This is an area for improvement.")
    ];
    
    // Create structure tips from improvements related to format and structure
    const structureTips = createTips(
        improvements.filter(imp => imp.toLowerCase().includes("format") || 
                                  imp.toLowerCase().includes("structure") || 
                                  imp.toLowerCase().includes("layout")),
        "improve",
        "Suggestion to improve your resume's structure."
    );
    
    // Create skills tips from improvements related to skills
    const skillsTips = createTips(
        improvements.filter(imp => imp.toLowerCase().includes("skill") || 
                                  imp.toLowerCase().includes("experience") || 
                                  imp.toLowerCase().includes("knowledge")),
        "improve",
        "Suggestion to better highlight your skills."
    );
    
    // Create tone and style tips from remaining improvements
    const toneStyleTips = createTips(
        improvements.filter(imp => !structureTips.some(st => st.tip === imp) && 
                                  !skillsTips.some(st => st.tip === imp)),
        "improve",
        "Suggestion to improve your resume's tone and style."
    );
    
    // Return the transformed feedback object
    return {
        overallScore,
        ATS: {
            score: atsScore,
            tips: atsTips
        },
        toneAndStyle: {
            score: formatScore,
            tips: toneStyleTips
        },
        content: {
            score: contentScore,
            tips: contentTips
        },
        structure: {
            score: formatScore,
            tips: structureTips
        },
        skills: {
            score: relevanceScore,
            tips: skillsTips
        }
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
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

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
            console.log({resumeUrl, imageUrl, feedback: transformedFeedback });
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
