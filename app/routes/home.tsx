import type { Route } from "./+types/home";
import Navbar from "~/Components/Navbar";
import {resumes} from "../../constants";
import ResumeCard from "~/Components/ResumeCard";
import {usePuterStore} from "../../lib/puter";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Tracker" },
    { name: "description", content: "Welcome to Resume Tracker" },
  ];
}

export default function Home() {
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    <section className="main-section py-16">
      <div className="page-heading">
        <h1 className="">Track Your Applications & Resume Ratings</h1>
        <h2>Review your submissions and check AI powered feedback</h2>
      </div>


      {resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
      )}
    </section>
  </main>
}
