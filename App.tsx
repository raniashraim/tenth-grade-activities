
import React, { useState, useEffect } from 'react';
import { SUBJECTS, SCHOOL_INFO } from './constants';
import { Semester, ActivityContent } from './types';
import { generateActivity } from './services/geminiService';
import { exportToWord } from './services/wordExportService';
import { exportToPDF } from './services/pdfExportService';

const App: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<Semester>(Semester.FIRST);
  const [topic, setTopic] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activity, setActivity] = useState<ActivityContent | null>(null);
  const [error, setError] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // التحقق من وجود المفتاح في النظام
  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === '';

  useEffect(() => {
    // إذا كان المفتاح مفقوداً، نظهر نافذة المساعدة تلقائياً عند أول زيارة
    if (isApiKeyMissing) {
      setShowHelp(true);
    }
  }, [isApiKeyMissing]);

  const handleGenerate = async () => {
    if (!selectedSubject || !topic) {
      setError('أستاذة رانية، يرجى اختيار المبحث وكتابة عنوان الدرس أولاً.');
      return;
    }

    if (isApiKeyMissing) {
      setError('⚠️ الموقع يحتاج إلى تفعيل المفتاح لكي يعمل الذكاء الاصطناعي.');
      setShowHelp(true);
      return;
    }

    setError('');
    setLoading(true);
    setActivity(null);
    try {
      const result = await generateActivity(
        SUBJECTS.find(s => s.id === selectedSubject)?.name || '',
        selectedSemester,
        topic
      );
      setActivity(result);
    } catch (err: any) {
      setError('عذراً، يبدو أن هناك مشكلة في الاتصال بالمفتاح. تأكدي من صحة المفتاح في إعدادات Vercel ومن قيامك بعمل Redeploy.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 relative selection:bg-emerald-100 font-['Cairo'] text-right" dir="rtl">
      
      {/* نافذة الإرشادات التوضيحية */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 relative animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              ✕
            </button>
            
            <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-4xl">🚀</span>
              دليل تفعيل المنصة (خطوة بخطوة)
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-amber-800 text-sm font-bold leading-relaxed">
                  أهلاً بكِ أستاذة رانية. لكي يعمل الموقع، نحتاج لربطه بمحرك Gemini من جوجل. اتبعي هذه الخطوات البسيطة:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex-shrink-0 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-black text-slate-800">الحصول على الرمز (API Key)</h4>
                    <p className="text-sm text-slate-500">ادخلي على <a href="https://aistudio.google.com/" target="_blank" className="text-emerald-600 underline font-bold">Google AI Studio</a> واضغطي على زر "Get API Key" ثم انسخي الرمز الطويل.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex-shrink-0 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-black text-slate-800">إضافة المفتاح في Vercel</h4>
                    <p className="text-sm text-slate-500">في لوحة تحكم Vercel، اذهبي لـ <span className="font-bold">Settings</span> ثم <span className="font-bold">Environment Variables</span>. أضيفي اسماً جديداً: <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-bold">API_KEY</code> وضعي الرمز في خانة Value.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex-shrink-0 flex items-center justify-center font-bold">3</div>
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-black text-rose-800">الخطوة الأهم: تفعيل التغيير</h4>
                    <p className="text-sm text-rose-700">بعد الحفظ في Vercel، يجب الذهاب لتبويب <span className="font-bold">Deployments</span>، والضغط على النقاط الثلاث بجانب آخر نسخة، واختيار <span className="font-bold">Redeploy</span>. بدونه لن يعمل الموقع.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200"
                >
                  فهمت الخطوات، سأقوم بها الآن! 👍
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg leading-tight">
            {SCHOOL_INFO.title}
          </h1>
          <p className="text-xl text-emerald-100 font-medium">
            إشراف المعلمة المبدعة: <span className="text-white font-black">{SCHOOL_INFO.teacher}</span>
          </p>
          <p className="mt-2 text-emerald-200/80">{SCHOOL_INFO.school}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto -mt-10 px-4">
        {/* Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Subjects Grid */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📚</span> المبحث الدراسي
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedSubject === sub.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-105 shadow-md'
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-emerald-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl">{sub.icon}</span>
                    <span className="text-xs font-bold">{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic & Generate */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">✍️</span> تفاصيل الدرس
                </h3>
                <div className="flex gap-2">
                  {Object.values(Semester).map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        selectedSemester === sem ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      الفصل {sem}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="مثال: التفاعلات الكيميائية، الممنوع من الصرف..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-5 rounded-2xl text-xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
                  loading ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التفكير...
                  </span>
                ) : (
                  <><span>💡</span> تصميم النشاط الإبداعي</>
                )}
              </button>
              
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Area */}
        {activity && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
             <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-emerald-600 p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                   <div>
                      <h2 className="text-3xl md:text-4xl font-black mb-2">{activity.title}</h2>
                      <p className="text-emerald-100 font-bold opacity-80">نشاط صفي تفاعلي متكامل</p>
                   </div>
                   <div className="flex gap-3">
                      <button onClick={() => exportToPDF(activity)} className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/20">
                         تحميل PDF 📄
                      </button>
                      <button onClick={() => exportToWord(activity)} className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105">
                         Word 📝
                      </button>
                   </div>
                </div>

                <div className="p-8 md:p-16 space-y-12">
                   {/* Objectives */}
                   <section className="bg-emerald-50/50 p-8 rounded-[2rem] border-r-8 border-emerald-500">
                      <h3 className="text-xl font-black text-emerald-800 mb-4 flex items-center gap-2">🎯 الهدف من النشاط</h3>
                      <p className="text-lg text-slate-700 leading-relaxed font-bold">{activity.objective}</p>
                   </section>

                   {/* Activities */}
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-2">🌟 الأنشطة المقترحة</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         {activity.interactiveActivities.map((act, i) => (
                           <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-emerald-300 transition-all group">
                              <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full mb-4 inline-block uppercase tracking-wider">{act.type}</span>
                              <h4 className="text-xl font-black text-slate-800 mb-4 group-hover:text-emerald-700">{act.title}</h4>
                              <p className="text-slate-500 text-sm mb-6 leading-relaxed">{act.description}</p>
                              <ul className="space-y-2">
                                 {act.instructions.map((ins, j) => (
                                   <li key={j} className="text-xs font-bold text-slate-400 flex gap-2"><span>•</span> {ins}</li>
                                 ))}
                              </ul>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Game Section */}
                   <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                      <div className="relative z-10">
                         <div className="flex items-center gap-6 mb-8">
                            <div className="text-5xl">🏆</div>
                            <div>
                               <h3 className="text-2xl font-black text-amber-400">اللعبة التنافسية الكبرى</h3>
                               <p className="text-slate-400 font-bold">{activity.competitiveGame.name}</p>
                            </div>
                         </div>
                         <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                               <p className="text-slate-300 leading-relaxed font-bold">{activity.competitiveGame.suggestedFormat}</p>
                            </div>
                            <div className="space-y-3">
                               {activity.competitiveGame.rules.map((rule, i) => (
                                 <div key={i} className="bg-white/10 p-4 rounded-xl text-sm">- {rule}</div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </section>

                   {/* Digital */}
                   {activity.electronicLinks && (
                     <div>
                        <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-2">🔗 التعزيز الرقمي</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                           {activity.electronicLinks.map((link, i) => (
                             <div key={i} className="flex items-center gap-4 p-6 bg-white border-2 border-slate-50 rounded-2xl hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">🌐</div>
                                <div>
                                   <h4 className="font-black text-slate-800">{link.platform}</h4>
                                   <p className="text-xs text-slate-400">{link.toolType}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* Conclusion */}
                   <div className="text-center pt-10 border-t border-slate-100">
                      <p className="text-2xl font-bold italic text-slate-400">"{activity.conclusion}"</p>
                      <p className="mt-4 text-emerald-600 font-black">المعلمة رانية شريم - فلسطين</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="mt-20 text-center pb-12">
         <p className="text-slate-400 text-sm font-bold">جميع الحقوق محفوظة © ٢٠٢٤ | مدرسة بنات عمر بن عبد العزيز الثانوية</p>
         <button onClick={() => setShowHelp(true)} className="mt-4 text-emerald-600 font-black underline hover:text-emerald-800">تحتاجين مساعدة في التفعيل؟ اضغطي هنا</button>
      </footer>
    </div>
  );
};

export default App;
