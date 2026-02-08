
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

  // Like System State
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(124); // Simulated initial count

  useEffect(() => {
    const savedLike = localStorage.getItem('platform_liked');
    if (savedLike === 'true') {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  }, []);

  const handleLike = () => {
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setLikesCount(prev => newStatus ? prev + 1 : prev - 1);
    localStorage.setItem('platform_liked', String(newStatus));
  };

  const handleGenerate = async () => {
    if (!selectedSubject || !topic) {
      setError('يرجى اختيار المبحث وإدخال عنوان الدرس');
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
    } catch (err) {
      setError('حدث خطأ أثناء تصميم النشاط. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 relative">
      {/* Floating Like Button */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-2">
        {isLiked && (
          <div className="bg-white px-3 py-1 rounded-full shadow-lg border border-pink-100 text-pink-600 text-xs font-bold animate-bounce">
            شكراً لتشجيعك! ✨
          </div>
        )}
        <button
          onClick={handleLike}
          className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${
            isLiked 
              ? 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white' 
              : 'bg-white text-gray-400 hover:text-pink-500 border-2 border-gray-100'
          }`}
          title="أعجبني الموقع"
        >
          <span className={`text-3xl transition-transform duration-300 ${isLiked ? 'scale-110' : 'group-hover:scale-125'}`}>
            {isLiked ? '❤️' : '🤍'}
          </span>
          <span className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-[10px] font-bold shadow-sm transition-colors ${
            isLiked ? 'bg-white text-pink-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {likesCount}
          </span>
          {isLiked && (
            <span className="absolute inset-0 rounded-full animate-ping bg-pink-400 opacity-20 pointer-events-none"></span>
          )}
        </button>
      </div>

      {/* Header Section */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 text-white py-12 px-4 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            {SCHOOL_INFO.title}
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-emerald-50">
            <p className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 shadow-sm">
              إعداد المعلمة: <span className="text-white font-bold">{SCHOOL_INFO.teacher}</span>
            </p>
            <p className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 shadow-sm">
              {SCHOOL_INFO.school}
            </p>
          </div>
          <p className="mt-4 text-emerald-100 font-semibold flex items-center justify-center gap-2">
            <span>📍</span> {SCHOOL_INFO.location}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-[-3rem] px-4">
        {/* Selection Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 mb-10 border border-gray-100 backdrop-blur-sm bg-white/95">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Subject Selection */}
            <div>
              <label className="block text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">📚</span>
                <span>اختر المبحث التعليمي:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedSubject === sub.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg scale-105'
                        : 'border-gray-100 hover:border-emerald-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-3xl mb-2">{sub.icon}</span>
                    <span className="text-sm font-bold">{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Semester and Topic */}
            <div className="space-y-8">
              <div>
                <label className="block text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center shadow-sm">🗓️</span>
                  <span>الفترة الدراسية:</span>
                </label>
                <div className="flex gap-4">
                  {[Semester.FIRST, Semester.SECOND].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all duration-300 ${
                        selectedSemester === sem
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl translate-y-[-2px]'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      الفصل {sem}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shadow-sm">✏️</span>
                  <span>موضوع النشاط الصفي:</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: تجربة انكسار الضوء، قواعد الإملاء..."
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-lg font-medium shadow-inner"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-5 rounded-2xl text-xl font-extrabold text-white transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.97] group ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>جاري ابتكار النشاط...</span>
                  </>
                ) : (
                  <>
                    <span className="group-hover:rotate-12 transition-transform">🚀</span>
                    <span>ابتكار نشاط تفاعلي</span>
                  </>
                )}
              </button>
              {error && <p className="text-red-500 text-center font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            </div>
          </div>
        </div>

        {/* Activity Result View */}
        {activity && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 border-t-[12px] border-emerald-600 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 pb-8 border-b border-gray-100">
              <div className="text-center md:text-right">
                <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                    <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm text-sm">✨</span>
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold inline-block">نشاط تفاعلي جديد</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-emerald-900 mb-2 leading-tight">{activity.title}</h2>
                <p className="text-gray-500 font-bold text-lg">{activity.subject} • الفصل {activity.semester}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => exportToPDF(activity)}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-rose-200"
                >
                  تحميل PDF 📄
                </button>
                <button
                  onClick={() => exportToWord(activity)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-200"
                >
                  تحميل Word 📝
                </button>
              </div>
            </div>

            <div className="space-y-12">
              {/* Objective */}
              <section className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl border-r-8 border-emerald-500 shadow-inner relative overflow-hidden group">
                <div className="absolute -top-4 -left-4 text-emerald-100/30 text-8xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform">🎯</div>
                <h3 className="text-2xl font-bold text-emerald-800 mb-4 flex items-center gap-3 relative z-10">
                  <span className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">🎯</span>
                  <span>الهدف التعليمي:</span>
                </h3>
                <p className="text-gray-700 leading-relaxed text-xl font-medium relative z-10 pr-2">{activity.objective}</p>
              </section>

              {/* Tools */}
              {activity.toolsNeeded && activity.toolsNeeded.length > 0 && (
                <section>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <span className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">🛠️</span>
                    <span>الأدوات والمواد المطلوبة:</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {activity.toolsNeeded.map((tool, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 px-5 py-3 rounded-2xl border border-amber-200 font-bold shadow-sm hover:shadow-md hover:bg-white transition-all">
                        {tool}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Steps */}
              {activity.steps && activity.steps.length > 0 && (
                <section className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-2">📝</span>
                        <span>خطوات التنفيذ الأساسية:</span>
                    </h3>
                    <div className="space-y-4">
                        {activity.steps.map((step, i) => (
                            <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                                <p className="text-gray-700 text-lg">{step}</p>
                            </div>
                        ))}
                    </div>
                </section>
              )}

              {/* Interactive Activities List */}
              <section>
                <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b-4 border-emerald-100 pb-3 flex items-center gap-3">
                  <span className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-2">🌈</span>
                  <span>الأنشطة الصفية المقترحة:</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activity.interactiveActivities.map((act, i) => (
                    <div key={i} className="bg-white border-2 border-gray-50 rounded-3xl p-8 shadow-md hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-sky-400 opacity-50"></div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          act.type === 'practical' ? 'bg-purple-100 text-purple-700' : 
                          act.type === 'competitive' ? 'bg-orange-100 text-orange-700' :
                          'bg-sky-100 text-sky-700'
                        }`}>
                          {act.type}
                        </span>
                        <span className="text-gray-200 font-black text-4xl group-hover:text-emerald-100 transition-colors">0{i+1}</span>
                      </div>
                      <h4 className="font-black text-xl text-gray-800 mb-3">{act.title}</h4>
                      <p className="text-gray-600 mb-5 leading-relaxed">{act.description}</p>
                      <div className="space-y-2 pt-4 border-t border-gray-50">
                        {act.instructions.map((ins, j) => (
                          <div key={j} className="flex gap-3 items-start text-sm text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></span>
                            <p className="leading-relaxed">{ins}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Competitive Game - Highlighted */}
              <section className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 md:p-12 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="w-16 h-16 bg-white text-amber-500 rounded-3xl flex items-center justify-center shadow-2xl text-4xl animate-bounce">🏆</span>
                    <div>
                      <h3 className="text-3xl font-black drop-shadow-md">اللعبة التنافسية الكبرى</h3>
                      <p className="text-amber-100 font-bold text-lg">{activity.competitiveGame.name}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-black/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-inner">
                      <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🎮</span>
                        <span>الشكل المقترح:</span>
                      </h4>
                      <p className="text-lg font-medium">{activity.competitiveGame.suggestedFormat}</p>
                    </div>
                    <div className="bg-black/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-inner">
                      <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📜</span>
                        <span>القوانين والتعليمات:</span>
                      </h4>
                      <ul className="space-y-2">
                        {activity.competitiveGame.rules.map((rule, i) => (
                          <li key={i} className="flex gap-2 items-start">
                              <span className="mt-1 flex-shrink-0">🔸</span>
                              <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Electronic Interactions - No Links */}
              {activity.electronicLinks && activity.electronicLinks.length > 0 && (
                <section className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-indigo-100 relative overflow-hidden">
                  <div className="absolute -bottom-8 -left-8 text-indigo-100 text-9xl font-black select-none pointer-events-none opacity-50">💻</div>
                  <h3 className="text-2xl font-bold text-indigo-800 mb-8 flex items-center gap-3 relative z-10">
                    <span className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">🔗</span>
                    <span>موارد رقمية وأنشطة تفاعلية مصغرة:</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {activity.electronicLinks.map((link, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl shadow-md border-r-8 border-indigo-500 flex flex-col group hover:shadow-xl hover:translate-x-[-4px] transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-black border border-indigo-200">
                            {link.toolType}
                          </span>
                          <span className="w-10 h-10 bg-indigo-50 text-2xl flex items-center justify-center rounded-xl shadow-sm">
                            {link.toolType === 'لعبة تعليمية' ? '🎮' : 
                             link.toolType === 'محاكاة تفاعلية' ? '🧪' :
                             link.toolType === 'اختبار قصير' ? '📝' : '📊'}
                          </span>
                        </div>
                        <h4 className="font-black text-indigo-900 text-lg mb-2">{link.platform}</h4>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow">{link.description}</p>
                        
                        <div className="mt-auto bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                          <p className="text-emerald-800 text-sm font-bold leading-relaxed italic">
                            <span className="not-italic ml-1 inline-flex items-center gap-1">
                                <span className="text-emerald-500">🔗</span> الارتباط بالهدف:
                            </span> {link.linkToObjective}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Conclusion */}
              <section className="text-center py-12 px-6 bg-white border-4 border-dashed border-gray-100 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-50 rounded-full -ml-12 -mb-12 opacity-50 group-hover:scale-150 transition-transform"></div>
                <h3 className="text-2xl font-black text-gray-800 mb-6 flex justify-center items-center gap-3 relative z-10">
                  <span className="w-12 h-12 bg-white shadow-lg rounded-2xl flex items-center justify-center text-2xl border border-gray-50">💡</span>
                  <span>بصمة المعلمة الإبداعية</span>
                </h3>
                <p className="text-gray-500 italic text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto relative z-10 font-medium">"{activity.conclusion}"</p>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-400 pb-10 border-t border-gray-100 pt-10">
        <p className="font-bold text-gray-600">جميع الحقوق محفوظة © ٢٠٢٤ منصة المعلمة رانية شريم</p>
        <p className="text-sm mt-2 font-medium">مدرسة بنات عمر بن عبد العزيز الثانوية • طولكرم • فلسطين 🇵🇸</p>
        <div className="mt-6 flex justify-center gap-6 text-3xl grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100">
          <span className="cursor-default">📚</span> 
          <span className="cursor-default">💻</span> 
          <span className="cursor-default animate-pulse">🇵🇸</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
