import React, { useState } from 'react';
import { RoutePath } from '../../types';
import { BookOpen, FileText, Activity, Heart, Search, ArrowRight } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const ResourcesPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  const [filter, setFilter] = useState<'all' | 'guides' | 'labs' | 'triage'>('all');

  const articles = [
    {
      category: 'guides',
      title: 'How to Prepare for a 15-Minute Doctor Appointment',
      readTime: '4 min read',
      summary: 'Strategies for prioritizing symptoms, writing down questions, and making the most of compressed consultation time.'
    },
    {
      category: 'labs',
      title: 'Understanding Your Complete Blood Count (CBC) Numbers',
      readTime: '6 min read',
      summary: 'A plain-language guide to Hemoglobin, White Blood Cells, Platelets, and what biological reference intervals actually mean.'
    },
    {
      category: 'triage',
      title: 'When to Choose Urgent Care vs. the Emergency Room',
      readTime: '5 min read',
      summary: 'Practical clinical guidelines on distinguishing urgent but non-life-threatening conditions from acute medical emergencies.'
    },
    {
      category: 'guides',
      title: 'Tracking Blood Pressure at Home: Best Practices',
      readTime: '3 min read',
      summary: 'Proper cuff placement, optimal measuring times, resting intervals, and common measurement pitfalls to avoid.'
    },
    {
      category: 'labs',
      title: 'Fasting Blood Glucose and HbA1c: What Do They Indicate?',
      readTime: '5 min read',
      summary: 'How metabolic markers reflect immediate vs 90-day biological glucose regulation, and what lifestyle habits influence them.'
    },
    {
      category: 'triage',
      title: 'Red Flags in Acute Headaches: The SNOOP Framework',
      readTime: '4 min read',
      summary: 'How clinicians evaluate systemic signs, neurologic symptoms, and onset timing to differentiate benign tension from emergent events.'
    }
  ];

  const filtered = filter === 'all' ? articles : articles.filter((a) => a.category === filter);

  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Educational Library
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Health Resources & Guides
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Evidence-grounded educational guides to help you understand common diagnostic tests, prepare for clinical visits, and make informed choices.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Articles' },
            { id: 'guides', label: 'Doctor Visit Guides' },
            { id: 'labs', label: 'Lab & Diagnostic Tests' },
            { id: 'triage', label: 'Care Timing & Triage' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((art, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono mb-2">
                  <span className="uppercase text-blue-700 dark:text-blue-400 font-semibold">{art.category}</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">{art.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{art.summary}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                <span>Read educational guide</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Medical disclaimer note */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          All articles are curated strictly for educational purposes and do not constitute specific medical advice or clinical diagnoses.
        </div>
      </div>
    </div>
  );
};
