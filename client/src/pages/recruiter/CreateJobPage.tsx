import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Briefcase } from 'lucide-react';
import * as recruiterService from '../../services/recruiterService';
import type { ApiErrorResponse, CreateJobPayload } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface FormErrors {
  title?: string;
  companyName?: string;
  description?: string;
}

const EMPTY_FORM = {
  title: '',
  companyName: '',
  location: '',
  jobType: '',
  experienceLevel: '',
  requiredSkills: '',
  preferredSkills: '',
  minimumEducation: '',
  salaryRange: '',
  description: '',
};

export default function CreateJobPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    recruiterService
      .getJobById(id)
      .then((job) => {
        setForm({
          title: job.title,
          companyName: job.companyName,
          location: job.location || '',
          jobType: job.jobType || '',
          experienceLevel: job.experienceLevel || '',
          requiredSkills: job.requiredSkills.join(', '),
          preferredSkills: job.preferredSkills.join(', '),
          minimumEducation: job.minimumEducation || '',
          salaryRange: job.salaryRange || '',
          description: job.description,
        });
      })
      .catch(() => toast.error('Could not load job details'))
      .finally(() => setIsLoading(false));
  }, [id]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Job title is required.';
    if (!form.companyName.trim()) nextErrors.companyName = 'Company name is required.';
    if (!form.description.trim()) nextErrors.description = 'Job description is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateJobPayload = {
      title: form.title.trim(),
      companyName: form.companyName.trim(),
      location: form.location.trim(),
      jobType: form.jobType.trim(),
      experienceLevel: form.experienceLevel.trim(),
      requiredSkills: form.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      preferredSkills: form.preferredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      minimumEducation: form.minimumEducation.trim(),
      salaryRange: form.salaryRange.trim(),
      description: form.description.trim(),
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await recruiterService.updateJob(id, payload);
        toast.success('Job updated successfully!');
        navigate(`/recruiter/jobs/${id}`);
      } else {
        const job = await recruiterService.createJob(payload);
        toast.success('Job created successfully!');
        navigate(`/recruiter/jobs/${job._id}`);
      }
    } catch (err) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || 'Failed to save job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading job details..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {isEditMode ? 'Edit Job Posting' : 'Post a New Job'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? 'Update the job details below.'
            : 'Fill in the job details to start analyzing candidate resumes against it.'}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Job Title"
              placeholder="e.g. Frontend Developer"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              error={errors.title}
            />
            <Input
              label="Company Name"
              placeholder="e.g. Acme Corp"
              value={form.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              error={errors.companyName}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Location"
              placeholder="e.g. Remote / Bengaluru"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
            <Input
              label="Job Type"
              placeholder="e.g. Full-time, Internship"
              value={form.jobType}
              onChange={(e) => updateField('jobType', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Experience Level"
              placeholder="e.g. Entry-level, 2-4 years"
              value={form.experienceLevel}
              onChange={(e) => updateField('experienceLevel', e.target.value)}
            />
            <Input
              label="Minimum Education"
              placeholder="e.g. B.Tech / B.E in CS"
              value={form.minimumEducation}
              onChange={(e) => updateField('minimumEducation', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Required Skills (comma-separated)"
              placeholder="e.g. React, Node.js, MongoDB"
              value={form.requiredSkills}
              onChange={(e) => updateField('requiredSkills', e.target.value)}
            />
            <Input
              label="Preferred Skills (comma-separated)"
              placeholder="e.g. TypeScript, AWS"
              value={form.preferredSkills}
              onChange={(e) => updateField('preferredSkills', e.target.value)}
            />
          </div>

          <Input
            label="Salary Range (optional)"
            placeholder="e.g. 6-9 LPA"
            value={form.salaryRange}
            onChange={(e) => updateField('salaryRange', e.target.value)}
          />

          <Textarea
            label="Job Description"
            placeholder="Paste the full job description here..."
            rows={8}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
          />

          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            <Briefcase size={18} />
            {isEditMode ? 'Save Changes' : 'Create Job'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
