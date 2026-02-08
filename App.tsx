
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

  // Like & Share System
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(156);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: SCHOOL_INFO.title,
          text: `اكتشفوا منصة تصميم الأنشطة التعليمية المبتكرة للمعلمة ${SCHOOL_INFO.teacher}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('رابط الموقع: ' + window.location.href);
    }
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
      setError('حدث خطأ أثناء تصميم النشاط. يرجى التأكد من مفتاح API أو المحاولة لاحقاً.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 relative selection:bg-emerald-100">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-4">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-12 h-12 bg-white text-emerald-600 rounded-full shadow-xl border border-emerald-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          title="مشاركة المنصة"
        >
          <span className="text-xl">🔗</span>
        </button>

        {/* Like Button */}
        <div className="flex flex-col items-center gap-2">
          {isLiked && (
            <div className="bg-white px-3 py-1 rounded-full shadow-lg border border-pink-100 text-pink-600 text-[10px] font-bold animate-bounce">
              شكراً لكِ! ✨
            </div>
          )}
          <button
            onClick={handleLike}
            className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${
              isLiked 
                ? 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white' 
                : 'bg-white text-gray-400 border-2 border-gray-100'
            }`}
          >
            <span className={`text-3xl ${isLiked ? 'scale-110' : ''}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-[10px] font-bold shadow-sm ${
              isLiked ? 'bg-white text-pink-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {likesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Header Section */}
      <header className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 text-white py-16 px-4 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="0" y="0" width="100" height="100" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-lg rounded-full text-emerald-100 text-sm font-bold mb-4 border border-white/20">
             نحو تعليم تفاعلي متميز 🇵🇸
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight drop-shadow-2xl">
            {SCHOOL_INFO.title}
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-emerald-50">
            <p className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-lg group hover:bg-white/20 transition-all">
              إعداد المعلمة: <span className="text-white font-bold">{SCHOOL_INFO.teacher}</span>
            </p>
            <p className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-lg">
              {SCHOOL_INFO.school}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-[-4rem] px-4">
        {/* Selection Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 mb-12 border border-white/50 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Subject Selection */}
            <div>
              <label className="block text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <span className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">📚</span>
                <span>المبحث التعليمي</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`flex flex-col items-center p-5 rounded-[2rem] border-2 transition-all duration-300 transform ${
                      selectedSubject === sub.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xl scale-105'
                        : 'border-slate-100 hover:border-emerald-200 bg-slate-50 text-slate-500 hover:bg-white'
                    }`}
                  >
                    <span className="text-4xl mb-3">{sub.icon}</span>
                    <span className="text-xs font-black uppercase tracking-wide">{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Semester and Topic */}
            <div className="space-y-10">
              <div>
                <label className="block text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center shadow-sm">🗓️</span>
                  <span>الفصل الدراسي</span>
                </label>
                <div className="flex gap-4">
                  {[Semester.FIRST, Semester.SECOND].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`flex-1 py-5 rounded-2xl border-2 font-black transition-all duration-300 ${
                        selectedSemester === sem
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                      }`}
                    >
                      الفصل {sem}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shadow-sm">✏️</span>
                  <span>عنوان الدرس أو المفهوم</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: قوانين الحركة، التشبيه، الخلية..."
                  className="w-full p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-50 outline-none transition-all text-lg font-bold shadow-inner"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-6 rounded-3xl text-2xl font-black text-white transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] group ${
                  loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-200'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جاري التفكير والإبداع...</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl group-hover:rotate-12 transition-transform">💡</span>
                    <span>تصميم النشاط الآن</span>
                  </>
                )}
              </button>
              {error && <p className="text-rose-500 text-center font-bold bg-rose-50 p-4 rounded-2xl border border-rose-100">{error}</p>}
            </div>
          </div>
        </div>

        {/* Results with enhanced styling */}
        {activity && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
             {/* Main Viewport */}
             <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border-t-[16px] border-emerald-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-40"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 pb-12 border-b-2 border-slate-50 relative z-10">
                  <div className="text-right">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-emerald-600 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">جاهز للطباعة والتنفيذ</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{activity.title}</h2>
                    <div className="flex gap-4 text-slate-400 font-bold">
                      <span className="flex items-center gap-1">🏷️ {activity.subject}</span>
                      <span className="flex items-center gap-1">🗓️ الفصل {activity.semester}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => exportToPDF(activity)} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:shadow-rose-100 transition-all flex items-center gap-2">
                       PDF 📄
                    </button>
                    <button onClick={() => exportToWord(activity)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:shadow-indigo-100 transition-all flex items-center gap-2">
                       Word 📝
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-16">
                  {/* Objective & Tools */}
                  <div className="grid md:grid-cols-3 gap-8">
                    <section className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-10 rounded-[2.5rem] border-r-8 border-emerald-600 shadow-sm">
                      <h3 className="text-2xl font-black text-emerald-900 mb-6 flex items-center gap-3">🎯 الهدف الذهبي</h3>
                      <p className="text-xl text-emerald-800 leading-relaxed font-bold">{activity.objective}</p>
                    </section>
                    <section className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">🛠️ التجهيزات</h3>
                      <ul className="space-y-3">
                        {activity.toolsNeeded?.map((tool, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-600 font-bold">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            {tool}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* Steps */}
                  <section>
                    <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                      <span className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">1</span>
                      خارطة التنفيذ الصفي
                    </h3>
                    <div className="space-y-4">
                      {activity.steps?.map((step, i) => (
                        <div key={i} className="group bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm hover:border-emerald-200 transition-all flex gap-6 items-start">
                          <span className="text-4xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors">0{i+1}</span>
                          <p className="text-lg text-slate-700 font-bold leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Activities Grid */}
                  <section>
                    <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4">
                      <span className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-black">2</span>
                      الأنشطة التفاعلية المقترحة
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      {activity.interactiveActivities.map((act, i) => (
                        <div key={i} className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                          <span className="inline-block px-4 py-1 bg-white rounded-full text-[10px] font-black uppercase text-slate-400 mb-4 border border-slate-100">{act.type}</span>
                          <h4 className="text-xl font-black text-emerald-800 mb-4">{act.title}</h4>
                          <p className="text-slate-600 mb-6 text-sm leading-relaxed">{act.description}</p>
                          <div className="space-y-2">
                            {act.instructions.map((ins, j) => (
                              <div key={j} className="flex gap-2 text-xs font-bold text-slate-400">
                                <span>•</span> {ins}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Mega Game */}
                  <section className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                         <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl animate-pulse">🏆</div>
                         <div className="text-center md:text-right">
                            <h3 className="text-3xl md:text-5xl font-black mb-2">اللعبة التنافسية</h3>
                            <p className="text-amber-400 text-xl font-black tracking-widest uppercase">{activity.competitiveGame.name}</p>
                         </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                           <h4 className="text-amber-400 font-black mb-4 flex items-center gap-2">🕹️ آلية اللعب</h4>
                           <p className="text-lg leading-relaxed text-slate-300 font-bold">{activity.competitiveGame.suggestedFormat}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                           <h4 className="text-amber-400 font-black mb-4 flex items-center gap-2">⚖️ قوانين التحدي</h4>
                           <ul className="space-y-2 text-slate-300">
                             {activity.competitiveGame.rules.map((rule, i) => (
                               <li key={i} className="flex gap-2"><span>-</span> {rule}</li>
                             ))}
                           </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Digital Resources */}
                  {activity.electronicLinks && (
                    <section>
                      <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                        <span className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black">3</span>
                        تعزيز رقمي (أدوات تفاعلية)
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {activity.electronicLinks.map((link, i) => (
                          <div key={i} className="bg-indigo-50/50 p-8 rounded-[2rem] border-2 border-indigo-100 group hover:bg-white hover:border-indigo-400 transition-all">
                             <div className="flex justify-between items-center mb-6">
                               <span className="text-3xl">{link.toolType === 'لعبة تعليمية' ? '🎮' : '🧪'}</span>
                               <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{link.platform}</span>
                             </div>
                             <h4 className="font-black text-indigo-900 mb-2">{link.toolType} مقترح</h4>
                             <p className="text-slate-500 text-sm mb-6 leading-relaxed">{link.description}</p>
                             <div className="p-4 bg-white rounded-2xl border border-indigo-100 text-xs font-bold text-indigo-700 italic">
                               💡 {link.linkToObjective}
                             </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Teacher's Footprint */}
                  <section className="text-center py-20 px-8 bg-emerald-600 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                       <span className="text-5xl mb-8 block">💡</span>
                       <h3 className="text-2xl font-black mb-6">بصمة المعلمة الإبداعية</h3>
                       <p className="text-2xl md:text-3xl font-medium italic leading-relaxed">"{activity.conclusion}"</p>
                    </div>
                  </section>
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="mt-32 text-center text-slate-400 pb-12">
        <div className="max-w-2xl mx-auto px-6 py-8 border-t border-slate-200">
           <p className="font-black text-slate-800 text-lg mb-2">جميع الحقوق محفوظة © ٢٠٢٤</p>
           <p className="text-sm font-bold text-emerald-600 mb-6">بإشراف المعلمة رانية شريم</p>
           <div className="flex justify-center gap-8 text-3xl opacity-30">
              <span>🇵🇸</span>
              <span>📚</span>
              <span>💻</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
