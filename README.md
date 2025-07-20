# ResumeTracker - AI-Powered Resume Analysis Tool

![ResumeTracker Logo](/public/images/resume-scan.gif)

ResumeTracker is a modern web application that helps jobseekers optimize their resumes for specific job applications. Using advanced AI analysis, it provides detailed feedback on how well your resume matches job requirements and offers actionable suggestions for improvement.

## 🚀 Features

- **AI-Powered Resume Analysis**: Get comprehensive feedback on your resume using Claude 3.7 Sonnet AI model
- **ATS Compatibility Check**: Ensure your resume passes through Applicant Tracking Systems
- **Job-Specific Optimization**: Tailor your resume analysis to specific job descriptions
- **Detailed Feedback Categories**:
  - Overall Score
  - ATS Compatibility
  - Tone and Style
  - Content Quality
  - Resume Structure
  - Skills Alignment
- **Visual Score Representation**: Easy-to-understand visual indicators of your resume's performance
- **Secure Cloud Storage**: Your resumes and analysis results are securely stored

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- A Puter.js account for cloud storage and AI functionality

## 🔧 Installation

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tracker.git
   cd tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t resumetracker .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 resumetracker
   ```

## 🔍 How It Works

1. **Upload Your Resume**: Upload your resume in PDF format
2. **Enter Job Details**: Provide the company name, job title, and job description
3. **AI Analysis**: Our AI analyzes your resume against the job description
4. **Review Feedback**: Get detailed feedback and suggestions for improvement
5. **Implement Changes**: Use the actionable insights to optimize your resume

## 🏗️ Architecture

ResumeTracker is built with a modern tech stack:

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router 7
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **File Handling**: react-dropzone, pdfjs-dist
- **Cloud Services**: Puter.js for:
  - Authentication
  - File storage
  - AI analysis (Claude 3.7 Sonnet)
  - Key-value data storage

### Data Flow

1. User uploads a resume PDF and enters job details
2. The PDF is uploaded to Puter's file system and converted to an image
3. The AI analyzes the resume against the job description
4. Analysis results are stored in Puter's key-value store
5. Results are displayed to the user with detailed feedback

## 📁 Project Structure

```
tracker/
├── app/                  # Main application code
│   ├── Components/       # React components
│   ├── routes/           # Route components
│   ├── app.css           # Global styles
│   ├── root.tsx          # Root component
│   └── routes.ts         # Route definitions
├── constants/            # Application constants
├── lib/                  # Utility functions
│   ├── pdf2img.ts        # PDF to image conversion
│   ├── puter.ts          # Puter.js integration
│   └── utils.ts          # General utilities
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── Dockerfile            # Docker configuration
└── package.json          # Project dependencies
```

## 🧪 Testing

To run the tests:

```bash
npm run typecheck
```

Note: This project uses TypeScript for type checking. Additional test suites may be added in the future.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Puter.js](https://puter.com/)
- [Claude AI](https://www.anthropic.com/claude)

---

Built with ❤️ by [tinolinton] jsmastery course