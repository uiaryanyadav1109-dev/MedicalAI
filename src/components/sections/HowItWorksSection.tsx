import React, { useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { MessageSquare, HelpCircle, FileCheck, Compass, Share2, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC<{ onOpenAssessment?: () => void }> = ({ onOpenAssessment }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: "Tell us what's happening.",
      subtitle: 'Natural Language Input',
      desc: 'Describe what you are feeling in simple, everyday language. Type or use voice to explain symptoms, onset, and current concerns without needing complex medical terminology.',
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      detail: 'Supports English, Hindi, Bengali, and Hinglish for comfortable natural articulation.'
    },
    {
      num: '02',
      title: 'Medical AI asks relevant questions.',
      subtitle: 'Dynamic Adaptive Interview',
      desc: 'The system identifies missing clinical context and presents tailored follow-up questions to clarify anatomical location, duration, triggers, and severity.',
      icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
      detail: 'Continuous red-flag interceptor evaluates symptoms for high-risk emergency markers.'
    },
    {
      num: '03',
      title: 'Your information is organized.',
      subtitle: 'Clinical Schema Synthesis',
      desc: 'Raw conversational responses are structured into standard clinical categories: Chief Concern, HPI timeline, pertinent positives/negatives, vitals, and medications.',
      icon: <FileCheck className="w-5 h-5 text-blue-600" />,
      detail: 'Laboratory documents (such as CBCs) are translated alongside reference intervals.'
    },
    {
      num: '04',
      title: 'The system provides preliminary guidance.',
      subtitle: 'Evidence-Informed Triage',
      desc: 'You receive preliminary care-timing guidance categorized into 5 operational tiers (Emergency, Urgent, Prompt Evaluation, Routine, or Monitor).',
      icon: <Compass className="w-5 h-5 text-blue-600" />,
      detail: 'Clearly delineated as supportive context, never as definitive medical diagnosis.'
    },
    {
      num: '05',
      title: 'Prepare or share with a clinician.',
      subtitle: 'Structured Doctor Handoff',
      desc: 'Generate a standardized 1-page clinical brief with prioritized questions for your doctor. Share via ephemeral tokenized QR pass or printed summary on your terms.',
      icon: <Share2 className="w-5 h-5 text-blue-600" />,
      detail: 'Full patient consent review before any information leaves your control.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-200" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Process Workflow"
          title="From initial concern to clinical clarity in five calm steps."
          description="A structured methodology engineered to respect your time, clarify confusing medical details, and prepare for productive healthcare conversations."
        />

        {/* 5-Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {steps.map((st, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-sm font-bold text-blue-700">{st.num}</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {st.icon}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{st.title}</h3>
                  <div className="text-[11px] font-mono text-slate-400 mb-2">{st.subtitle}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  {st.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Sandbox Prompt */}
        {onOpenAssessment && (
          <div className="text-center pt-2">
            <button
              onClick={onOpenAssessment}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <span>Experience the 5-Step Flow in Assessment Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
