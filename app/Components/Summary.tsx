import ScoreCircle from "~/Components/ScoreCircle";
import ScoreBadge from "~/Components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? "text-green-600" :
        score > 50 ? "text-yellow-600" : "text-red-600";

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row items-center justify-center">
                    <p className="text-2xl">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <div className="text-2xl">
                    <span className={textColor}>{score}</span>/100
                </div>
            </div>
        </div>
    )
}

const Summary = ({feedback} :{feedback: Feedback}) => {
    return (
        <div className="bg-white rounded-2xl shadow-md w-full">
            <div className="flex flex-row items-center p-4 gap-8">
                <ScoreCircle score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Your resume score</h2>
                    <p className="text-sm text-gray-500">
                        This score is calculated based on the variables listed below
                    </p>
                </div>
            </div>

            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />
        </div>
    )
}
export default Summary
