import type { Route } from "./+types/home";
import Navbar from "~/Components/Navbar";
import ResumeCard from "~/Components/ResumeCard";
import { usePuterStore } from "../../lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Tracker" },
    { name: "description", content: "Welcome to Resume Tracker" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => JSON.parse(resume.value) as Resume);

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    loadResumes();
  }, [kv]);

  const summary = useMemo(() => {
    if (resumes.length === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgKeyword: 0,
        bestScore: 0,
      };
    }

    const totals = resumes.reduce(
      (acc, { feedback }) => {
        acc.score += feedback.overallScore;
        acc.keyword += feedback.ATS?.keywordMatch ?? feedback.ATS?.score ?? feedback.overallScore;
        acc.best = Math.max(acc.best, feedback.overallScore);
        return acc;
      },
      { score: 0, keyword: 0, best: 0 }
    );

    return {
      total: resumes.length,
      avgScore: Math.round(totals.score / resumes.length),
      avgKeyword: Math.round(totals.keyword / resumes.length),
      bestScore: Math.round(totals.best),
    };
  }, [resumes]);

  return (
    <main className="page-shell">
      <Navbar />

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="glass-panel rounded-3xl p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            ATS co-pilot
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-slate-900">
            Modern resume intelligence for <span className="text-gradient">every</span> job search
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Upload, benchmark, and iterate with real-time ATS scoring, keyword coverage, and recruiter-ready insights.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/upload" className="primary-button w-fit px-8 py-3 text-base font-semibold">
              Analyze a resume
            </Link>
            <Link
              to={resumes.length ? `/resume/${resumes[0].id}` : "/upload"}
              className="ghost-button"
            >
              View last report
            </Link>
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your snapshot
          </p>
          <div className="grid gap-4">
            <div className="stat-card">
              <p>Total scans</p>
              <span>{summary.total}</span>
            </div>
            <div className="stat-card">
              <p>Avg. ATS score</p>
              <span>{summary.avgScore}</span>
            </div>
            <div className="stat-card">
              <p>Avg. keyword match</p>
              <span>{summary.avgKeyword}%</span>
            </div>
            <div className="stat-card">
              <p>Personal best</p>
              <span>{summary.bestScore}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent scans
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              {loadingResumes
                ? "Loading your reports…"
                : resumes.length
                  ? "Pick a report to revisit insights"
                  : "No scans yet — let’s run your first analysis"}
            </h2>
          </div>
          <Link to="/upload" className="ghost-button">
            New analysis
          </Link>
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/80 p-10 shadow-inner">
            <img src="/images/resume-scan-2.gif" alt="loading" className="h-32 w-32" />
            <p className="mt-4 text-sm text-slate-500">Running AI models…</p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 text-center shadow-inner">
            <p className="text-lg text-slate-600">
              Upload your resume and job description to unlock ATS-grade scoring.
            </p>
            <Link to="/upload" className="primary-button mx-auto mt-6 w-fit px-8 py-3 text-base font-semibold">
              Start with first scan
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
