import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { DOCTOR_CREDENTIALS } from '../../data/doctorCredentials';
import { RoutePath } from '../../types';

interface MedilabAppointmentSectionProps {
  onOpenAssessment?: () => void;
  onNavigate?: (route: RoutePath) => void;
}

export const MedilabAppointmentSection: React.FC<MedilabAppointmentSectionProps> = ({
  onOpenAssessment,
  onNavigate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    department: 'Cardiology',
    doctor: DOCTOR_CREDENTIALS[0]?.name || 'Dr. Sarah Chen, MD',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in your name, email, and phone number.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <section id="appointment" className="py-20 bg-[#f1f7fd] dark:bg-[#0c1626] border-b border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1977cc] dark:text-[#38BDF8]">
            Appointment
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#194376] dark:text-white mt-1">
            Make an Appointment
          </h2>
          <div className="w-16 h-1 bg-[#1977cc] mx-auto my-4 rounded-full" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Book an in-person consultation or launch an immediate preliminary AI triage assessment with board-certified physicians.
          </p>
        </div>

        {submitted ? (
          <div className="max-w-xl mx-auto bg-white dark:bg-[#132238] p-8 rounded-2xl shadow-lg border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Appointment Request Received
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Thank you, <span className="font-semibold">{formData.name}</span>! Your appointment request for <span className="font-semibold">{formData.department}</span> with <span className="font-semibold">{formData.doctor}</span> has been scheduled. Our clinical coordination desk will contact you at <span className="font-semibold">{formData.phone}</span> shortly.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Book Another Visit
              </button>
              {onOpenAssessment && (
                <button
                  type="button"
                  onClick={onOpenAssessment}
                  className="px-6 py-2.5 rounded-full bg-[#1977cc] hover:bg-[#156cb9] text-white text-sm font-semibold shadow-md transition-colors"
                >
                  Start Instant AI Triage
                </button>
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto bg-white dark:bg-[#132238] p-8 sm:p-10 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800 space-y-6"
          >
            {/* Row 1: Name, Email, Phone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                />
              </div>
            </div>

            {/* Row 2: Date, Department, Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Hepatology & Gastroenterology">Hepatology & Gastroenterology</option>
                  <option value="Emergency & Triage">Emergency & Triage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Attending Doctor
                </label>
                <select
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                >
                  {DOCTOR_CREDENTIALS.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.specialty.split('&')[0].trim()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Symptoms or Message (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Describe your current symptoms, medical history, or specific questions..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc] resize-none"
              />
            </div>

            {/* Submit */}
            <div className="text-center pt-2">
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-[#1977cc] hover:bg-[#156cb9] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                Make an Appointment
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default MedilabAppointmentSection;
