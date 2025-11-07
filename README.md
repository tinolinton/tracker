# Tracker

Tracker is an AI-powered workspace for preparing job-ready resumes. It benchmarks a candidate�s resume against a target job description, generates an enhanced PDF, drafts a tailored application email, and is available as a public demo at https://tracker.chimaliro.com (Vercel).

## Features

- **ATS-grade analysis** � Scores overall readiness plus ATS, tone, content, structure, and skill alignment using Claude 3.7 Sonnet.
- **Smart rewrite** � Produces a refreshed resume PDF that mirrors professional templates (one-click download).
- **Application email** � Generates a short outreach email aligned with the job and resume summary.
- **Managed storage** � Puter.js handles authentication, file storage, KV persistence, and AI access; `/wipe` exposes a full workspace management console.
- **Responsive UI** � Modern desktop dashboard with mobile-first optimizations, glassmorphism styling, and accessible tables.

## Stack

| Area              | Technology                              |
| ----------------- | --------------------------------------- |
| Frontend          | React 19, TypeScript, Vite              |
| Routing           | React Router 7                          |
| State             | Zustand                                 |
| Styling           | PostCSS + Tailwind utilities / custom CSS |
| File handling     | `react-dropzone`, `pdfjs-dist`, `pdf-lib` |
| Cloud + AI        | Puter.js (auth, FS, KV, Claude access)  |
| Hosting           | Vercel (demo)                           |

## Prerequisites

- Node.js 20+
- npm 10+ (or yarn/pnpm)
- Puter.js account with API access

## Getting Started

### Local Development

```bash
git clone https://github.com/yourusername/tracker.git
cd tracker
npm install
npm run dev
```

Open `http://localhost:5173` to use the app with hot reload.

### Production Build

```bash
npm run build
npm run start   # serves the React Router build output
```

### Docker

```bash
docker build -t tracker .
docker run -p 3000:3000 tracker
```

## How It Works

1. **Upload & context** � User provides a PDF resume plus company/job info.
2. **Analysis** � Claude compares the resume to the job description and returns structured JSON feedback.
3. **Rewrite** � The AI produces an updated resume outline; the app renders it into a polished PDF.
4. **Email drafting** � A short application email is generated alongside the report.
5. **Review** � Dashboard cards display scores, detailed tips, ATS insights, enhanced resume preview, and email text.

## Key Routes & Components

- `/` � Home dashboard listing prior scans with score indicators.
- `/upload` � Guided workflow (drag/drop upload, stored resume reuse, status timeline).
- `/resume/:id` � Full report (summary, ATS breakdown, details accordion, enhanced PDF, application email).
- `/wipe` � Manage Puter storage/KV (file explorer, KV inspector, audit log).

Notable components: `Summary`, `ATS`, `Details`, `EnhancedResume`, `ApplicationEmail`, `FileUploader`, `ResumeCard`, `Navbar`.

## Testing & Quality

Type safety is ensured with:

```bash
npm run typecheck
```

Additional unit/integration tests can be layered on top; this script currently runs React Router typegen plus `tsc`.

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/my-feature`.
3. Commit changes: `git commit -m "Add feature"`.
4. Push: `git push origin feature/my-feature`.
5. Open a Pull Request describing your changes and testing steps.

Please run `npm run typecheck` before submitting PRs.

## License

Tracker is distributed under the MIT License. See `LICENSE` for details.

## Acknowledgements

- Puter.js for storage/auth/AI services.
- Anthropic Claude 3.7 Sonnet for analysis and copy generation.
- React, React Router, TailwindCSS, Zustand, pdf-lib, pdfjs-dist, react-dropzone for the front-end foundation.
- Vercel for hosting the public demo.

---

Built by Tinotenda Linton Machila.
