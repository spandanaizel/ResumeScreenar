import { useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { UploadCloud, FileText, X, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import * as recruiterService from '../../services/recruiterService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatFileSize } from '../../utils/helpers';
import type { ApiErrorResponse } from '../../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

export default function UploadResumesPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addFiles(newFiles: FileList | File[]) {
    const incoming = Array.from(newFiles);
    const validated: File[] = [];

    for (const file of incoming) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF and was skipped.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than 5MB and was skipped.`);
        continue;
      }
      validated.push(file);
    }

    setFiles((prev) => {
      const combined = [...prev, ...validated];
      if (combined.length > MAX_FILES) {
        toast.error(`You can upload at most ${MAX_FILES} resumes at once.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
    setError('');
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!jobId) return;
    if (files.length === 0) {
      setError('Please select at least one resume PDF.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await recruiterService.analyzeResumesForJob(jobId, files);
      if (result.failed.length) {
        toast.error(`${result.failed.length} resume(s) failed to analyze.`);
      }
      if (result.analyzed.length) {
        toast.success(`${result.analyzed.length} resume(s) analyzed successfully!`);
      }
      navigate(`/recruiter/jobs/${jobId}`);
    } catch (err) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || 'Failed to analyze resumes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-6">
          <Loader2 size={32} className="animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analyzing {files.length} resume(s) with AI...</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          This may take a moment. Please don't close this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <Link
          to={`/recruiter/jobs/${jobId}`}
          className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"
        >
          <ArrowLeft size={14} />
          Back to Job
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900">Upload Candidate Resumes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload up to {MAX_FILES} PDF resumes (max 5MB each) to analyze against this job.
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              error ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <UploadCloud size={32} className="text-primary-500" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Drag & drop resumes here, or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PDF only, up to 5MB each, {MAX_FILES} files max ({files.length}/{MAX_FILES} selected)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                      <FileText size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button size="lg" fullWidth onClick={handleSubmit} disabled={files.length === 0}>
            <Sparkles size={18} />
            Analyze {files.length > 0 ? files.length : ''} Resume{files.length === 1 ? '' : 's'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
