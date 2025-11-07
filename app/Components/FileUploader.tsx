import { useDropzone } from "react-dropzone";
import { cn, formatSize } from "../../lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop: (acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        onFileSelect?.(file);
      },
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      maxSize: maxFileSize,
    });

  const file = acceptedFiles[0] || null;

  return (
    <div className="w-full space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "rounded-3xl border-2 border-dashed border-white/40 bg-white/70 p-8 text-center transition-all duration-200 cursor-pointer backdrop-blur-lg shadow-inner shadow-slate-200",
          isDragActive && "border-indigo-400 bg-white shadow-xl shadow-indigo-400/20"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner">
            <img src="/icons/info.svg" alt="upload" className="h-10 w-10 opacity-80" />
          </div>
          <p className="text-base text-slate-600">
            <span className="font-semibold text-slate-900">Click to upload</span>{" "}
            or drag & drop your resume
          </p>
          <p className="text-sm text-slate-500">PDF only — up to {formatSize(maxFileSize)}</p>
        </div>
      </div>

      {file ? (
        <div className="uploader-selected-file flex items-center justify-between rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <img src="/images/pdf.png" alt="pdf" className="h-10 w-10" />
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[220px]">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white/70 p-2 text-slate-500 transition hover:text-rose-500 hover:border-rose-200"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect?.(null);
            }}
          >
            <img src="/icons/cross.svg" alt="remove" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">PDF only</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Under {formatSize(maxFileSize)}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Secure Puter storage</span>
        </div>
      )}
    </div>
  );
};
export default FileUploader;
