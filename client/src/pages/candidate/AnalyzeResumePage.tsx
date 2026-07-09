import { useRef, useState, type DragEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { UploadCloud, FileText, X, Sparkles, Loader2 } from 'lucide-react';
import * as candidateService from '../../services/candidateService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { formatFileSize } from '../../utils/helpers';
import type { ApiErrorResponse } from '../../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FormErrors {
  resume?: string;
  jobTitle?: string;
  jobDescription?: string;
}

export default function AnalyzeResumePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateAndSetFile(file: File): boolean {
    if (file.type !== 'application/pdf') {
      setErrors((prev) => ({ ...prev, resume: 'Only PDF files are supported.' }));
      toast.error('Only PDF files are supported.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, resume: 'File size must be 5MB or less.' }));
      toast.error('File size must be 5MB or less.');
      return false;
    }
    setErrors((prev) => ({ ...prev, resume: undefined }));
    setResumeFile(file);
    return true;
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragActive(false);
  }

  function removeFile() {
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!resumeFile) nextErrors.resume = 'Please upload your resume as a PDF.';
    if (!jobTitle.trim()) nextErrors.jobTitle = 'Job title is required.';
    if (!jobDescription.trim()) nextErrors.jobDescription = 'Job description is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !resumeFile) return;

    setIsSubmitting(true);
    try {
      const analysis = await candidateService.analyzeResume({
        resume: resumeFile,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim() || undefined,
        jobDescription: jobDescription.trim(),
      });
      toast.success('Analysis complete!');
      navigate(`/candidate/analysis/${analysis._id}`);
    } catch (err) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || 'Failed to analyze resume. Please try again.');
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
        <h2 className="text-xl font-bold text-slate-900">Analyzing your resume with AI...</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          This may take a moment while our AI compares your resume against the job description. Please
          don't close this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Analyze Your Resume</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload your resume and paste the job description to get an instant AI-powered match report.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Resume upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resume (PDF, max 5MB)</label>
            {!resumeFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : errors.resume
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <UploadCloud size={32} className="text-primary-500" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Drag & drop your resume here, or click to browse
                </p>
                <p className="mt-1 text-xs text-slate-400">PDF only, up to 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <FileText size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-semibold text-slate-800">{resumeFile.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(resumeFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  aria-label="Remove file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {errors.resume && <p className="mt-1.5 text-xs text-red-600">{errors.resume}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Job Title"
              name="jobTitle"
              placeholder="e.g. Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              error={errors.jobTitle}
            />
            <Input
              label="Company Name (optional)"
              name="companyName"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <Textarea
            label="Job Description"
            name="jobDescription"
            placeholder="Paste the full job description here..."
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            error={errors.jobDescription}
          />

          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            <Sparkles size={18} />
            Analyze Resume
          </Button>
        </form>
      </Card>
    </div>
  );
}
