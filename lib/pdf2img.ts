export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

type PdfJsLib = typeof import("pdfjs-dist");

let pdfjsLib: PdfJsLib | null = null;
let loadPromise: Promise<PdfJsLib> | null = null;
let workerSrc: string | null = null;

const resolveWorkerSrc = async () => {
    if (workerSrc) return workerSrc;

    try {
        const workerModule = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        workerSrc = workerModule.default;
    } catch {
        workerSrc = "/pdf.worker.min.mjs";
    }

    return workerSrc;
};

async function loadPdfJs(): Promise<PdfJsLib> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        try {
            const lib = await import("pdfjs-dist");
            const src = await resolveWorkerSrc();
            lib.GlobalWorkerOptions.workerSrc = src;
            pdfjsLib = lib;
            return lib;
        } finally {
            loadPromise = null;
        }
    })();

    return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Canvas context unavailable in this environment.");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        await page.render({ canvasContext: context, viewport, canvas }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Unable to generate PNG preview from canvas output.",
                        });
                    }
                },
                "image/png",
                1.0
            );
        });
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Unknown PDF conversion error.";
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${message}`,
        };
    }
}
