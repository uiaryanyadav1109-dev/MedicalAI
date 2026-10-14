import React, { useState } from 'react';
import { MapPin, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';

export const MedilabContactSection: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert('Please fill out all required fields.');
      return;
    }
    setSent(true);
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1977cc] dark:text-[#38BDF8]">
            Contact
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#194376] dark:text-white mt-1">
            Get in Touch With Our Medical Team
          </h2>
          <div className="w-16 h-1 bg-[#1977cc] mx-auto my-4 rounded-full" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Have questions about clinical protocols, emergency handoffs, or hospital system integrations? Our team is available 24/7.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#f1f7fd] dark:bg-[#132238] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-[#1977cc] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#194376] dark:text-white">
                  Location
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  A108 Adam Street, New York, NY 535022
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Clinical Operations & AI Triage Dispatch Hub
                </p>
              </div>
            </div>

            <div className="bg-[#f1f7fd] dark:bg-[#132238] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-[#1977cc] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#194376] dark:text-white">
                  Email
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  contact@medicalai.org
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  General inquiries & hospital partner desk
                </p>
              </div>
            </div>

            <div className="bg-[#f1f7fd] dark:bg-[#132238] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-[#1977cc] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#194376] dark:text-white">
                  Call Us
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  +1 5589 55488 55
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Toll-free clinical coordination hotline
                </p>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-[#f1f7fd] dark:bg-[#132238] p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Message Sent Successfully
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Thank you for reaching out. A medical officer will review your message and reply to <span className="font-semibold">{form.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="px-6 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Your Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
                  />
                </div>

                <div>
                  <textarea
                    rows={5}
                    required
                    placeholder="Your Message..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1977cc] resize-none"
                  />
                </div>

                <div className="text-center pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-[#1977cc] hover:bg-[#156cb9] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedilabContactSection;
