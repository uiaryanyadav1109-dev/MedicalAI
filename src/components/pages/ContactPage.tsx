import React, { useState } from 'react';
import { RoutePath } from '../../types';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Building,
  Stethoscope,
  Users,
  Send
} from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const ContactPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'clinician',
    organization: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-medical-blue dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            <span>Institutional Inquiries &amp; Clinical Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Connect with the Medical AI Clinical Team
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Whether you are a practicing clinician interested in pre-consultation briefs, a health system exploring a pilot trial, or a patient with feedback, our team is at your service.
          </p>
        </div>

        <div className="max-w-3xl">
          {/* Form Card */}
          <div className="bg-white dark:bg-[#0E1A2D] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#1E2E47] shadow-xs transition-colors">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Inquiry Received</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-900 dark:text-white">{formData.fullName}</span>. Your message has been routed to our Clinical Partnerships department. We will respond to <span className="font-mono text-slate-900 dark:text-white">{formData.email}</span> within 1–2 business days.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        role: 'clinician',
                        organization: '',
                        subject: '',
                        message: ''
                      });
                    }}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">Direct Message Form</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">All institutional communications handled with clinical discretion.</p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Dr. Sarah Chen or John Doe"
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-blue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sarah.chen@hospital.org"
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role / Perspective
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-blue focus:outline-none"
                    >
                      <option value="clinician">Practicing Physician / Clinician</option>
                      <option value="health_system">Hospital / Health System Leader</option>
                      <option value="patient">Patient / Caregiver</option>
                      <option value="researcher">Clinical Researcher / Academic</option>
                      <option value="technology">Technology Partner / Developer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Organization / Practice (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Metro Health or Independent Practice"
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Area of Interest
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Clinical Pilot Program, Feedback on Triage Flow"
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, practice needs, or questions regarding Medical AI..."
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-blue focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Clinical Relations</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-2">
                  Emergency Notice: Do not submit acute clinical symptoms through this form. In an emergency, dial 108/112 or 911 immediately.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
