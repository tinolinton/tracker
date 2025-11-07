import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type ResumeSection = {
    title: string;
    bullets: string[];
};

export interface ResumePdfInput {
    summary: string;
    sections: ResumeSection[];
    skills: string[];
    achievements: string[];
    candidateName?: string;
    targetRole?: string;
    callToAction?: string;
}

const lineHeight = 14;
const pageMargin = 50;

const addWrappedText = (
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number
) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
};

export const generateResumePdf = async ({
                                            summary,
                                            sections,
                                            skills,
                                            achievements,
                                            candidateName = "Updated Resume",
                                            targetRole,
                                            callToAction,
                                        }: ResumePdfInput): Promise<File> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { height, width } = page.getSize();
    let cursorY = height - pageMargin;

    const drawHeading = (text: string) => {
        page.drawText(text, {
            x: pageMargin,
            y: cursorY,
            size: 20,
            font: boldFont,
            color: rgb(0.15, 0.2, 0.35),
        });
        cursorY -= 24;
    };

    const drawSubheading = (text: string) => {
        page.drawText(text, {
            x: pageMargin,
            y: cursorY,
            size: 12,
            font,
            color: rgb(0.35, 0.4, 0.5),
        });
        cursorY -= 18;
    };

    const drawSectionTitle = (text: string) => {
        page.drawText(text.toUpperCase(), {
            x: pageMargin,
            y: cursorY,
            size: 12,
            font: boldFont,
            color: rgb(0.28, 0.34, 0.58),
        });
        cursorY -= 18;
    };

    const drawParagraph = (text: string) => {
        const maxWidth = width - pageMargin * 2;
        const lines = addWrappedText(text, font, 11, maxWidth);
        lines.forEach((line) => {
            page.drawText(line, {
                x: pageMargin,
                y: cursorY,
                size: 11,
                font,
                color: rgb(0.2, 0.23, 0.3),
            });
            cursorY -= lineHeight;
        });
        cursorY -= 6;
    };

    const drawBullets = (bullets: string[]) => {
        const maxWidth = width - pageMargin * 2 - 16;
        bullets.forEach((bullet) => {
            const wrappedLines = addWrappedText(bullet, font, 11, maxWidth);
            page.drawText("•", {
                x: pageMargin,
                y: cursorY,
                size: 12,
                font,
                color: rgb(0.18, 0.2, 0.3),
            });
            wrappedLines.forEach((line, index) => {
                page.drawText(line, {
                    x: pageMargin + 14,
                    y: cursorY,
                    size: 11,
                    font,
                    color: rgb(0.2, 0.23, 0.3),
                });
                cursorY -= lineHeight;
                if (index < wrappedLines.length - 1) cursorY += 2;
            });
            cursorY -= 6;
        });
        cursorY -= 4;
    };

    drawHeading(candidateName);
    if (targetRole) {
        drawSubheading(targetRole);
    }

    drawSectionTitle("Professional Summary");
    drawParagraph(summary);

    sections.forEach((section) => {
        if (!section.title || !section.bullets?.length) return;
        drawSectionTitle(section.title);
        drawBullets(section.bullets);
    });

    if (skills.length) {
        drawSectionTitle("Key Skills");
        drawParagraph(skills.join(" • "));
    }

    if (achievements.length) {
        drawSectionTitle("Highlighted Wins");
        drawBullets(achievements);
    }

    if (callToAction) {
        drawSectionTitle("Next Steps");
        drawParagraph(callToAction);
    }

    const pdfBytes = await pdfDoc.save();
    const arrayBuffer = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(arrayBuffer).set(pdfBytes);
    const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
    return new File([pdfBlob], `${candidateName.replace(/\s+/g, "_")}_resume.pdf`, {
        type: "application/pdf",
    });
};
