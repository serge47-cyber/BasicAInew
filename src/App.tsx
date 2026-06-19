import { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle, GraduationCap, Award, Compass, 
  Sparkles, Shield, User, HelpCircle, Layers, Moon, Sun, 
  Menu, X, ChevronRight, ChevronLeft, Type, Copy, 
  Check, Play, ArrowLeft, Heart, Zap, Globe, Sparkle
} from 'lucide-react';
import { syllabusList, detailedLessons, allLessons } from './lessonsData';
import { PlaygroundWidget } from './components/PlaygroundWidget';
import { GlossaryModal } from './components/GlossaryModal';
import { RoleType, RouteMode, FullLesson } from './types';

export default function App() {
  // Стан модального вікна глосарію термінів
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  // Користувацький шлях
  const [userRole, setUserRole] = useState<RoleType | null>(() => {
    const saved = localStorage.getItem('basicai_user_role');
    return (saved === 'curious' || saved === 'pragmatic') ? saved as RoleType : null;
  });

  // Маршрут навчання (Повний чи Експрес)
  const [routeMode, setRouteMode] = useState<RouteMode>(() => {
    const saved = localStorage.getItem('basicai_route_mode');
    return saved === 'quick' ? 'quick' : 'full';
  });

  // Вивчені уроки (завершений прогрес)
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('basicai_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Локальний стан читання
  const [activeView, setActiveView] = useState<'dashboard' | 'lesson'>('dashboard');
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSelectedIndices, setQuizSelectedIndices] = useState<number[]>([]);
  const [promptSelection1, setPromptSelection1] = useState<'A' | 'B' | null>(null);
  const [promptSelection2, setPromptSelection2] = useState<'A' | 'B' | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, number>>({});
  const [scenariosAnswers, setScenariosAnswers] = useState<Record<number, any>>({});
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  
  // Додаткові гейміфіковані тригери
  const [playgroundSolved, setPlaygroundSolved] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<'normal' | 'large'>(() => {
    const saved = localStorage.getItem('basicai_text_size');
    return saved === 'large' ? 'large' : 'normal';
  });

  // Світла/темна тема (за замовчуванням світла)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('basicai_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('basicai_theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('basicai_theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    showToast(`Тему змінено на: ${next === 'light' ? 'Світлу ☀️' : 'Темну 🌙'}`, 'info');
  };

  // Тости
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'error' | 'info' }[]>([]);

  useEffect(() => {
    localStorage.setItem('basicai_completed', JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Reset lesson interactive states upon changing lesson or role to prevent stale or premature feedback
  useEffect(() => {
    setQuizAnswer(null);
    setQuizSelectedIndices([]);
    setPromptSelection1(null);
    setPromptSelection2(null);
    setSelectedScenarioId(null);
    setReflectionAnswers({});
    setScenariosAnswers({});
    setPlaygroundSolved(false);
  }, [currentLessonId, userRole]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const selectRole = (role: RoleType) => {
    setUserRole(role);
    localStorage.setItem('basicai_user_role', role);
    showToast(`Траєкторію «${role === 'curious' ? 'Шлях Допитливого' : 'Шлях Прагматика'}» успішно активовано!`, 'success');
  };

  const changeRole = () => {
    setUserRole(null);
    localStorage.removeItem('basicai_user_role');
    setActiveView('dashboard');
    showToast('Траєкторію скинуто. Оберіть новий шлях навчання.', 'info');
  };

  const toggleRouteMode = (mode: RouteMode) => {
    setRouteMode(mode);
    localStorage.setItem('basicai_route_mode', mode);
    showToast(`Маршрут змінено на: ${mode === 'quick' ? 'Експрес' : 'Повний курс'}`, 'info');
  };

  const toggleTextSize = () => {
    const next = textSize === 'normal' ? 'large' : 'normal';
    setTextSize(next);
    localStorage.setItem('basicai_text_size', next);
    showToast(`Контролер шрифту: ${next === 'large' ? 'Збільшено тексти' : 'Звичайний розмір'}`, 'info');
  };

  // Визначення уроків для поточного режиму
  const quickLessonIds = [1, 2, 4, 6, 10];
  const activeLessons = syllabusList.filter(lesson => {
    if (routeMode === 'quick') {
      return quickLessonIds.includes(lesson.id);
    }
    return true;
  });

  const lessonBrief = syllabusList.find(l => l.id === currentLessonId) || syllabusList[0];
  const fullLessonData = detailedLessons[currentLessonId] || detailedLessons[1];
  const activeDetail = userRole === 'curious' ? fullLessonData.curious : fullLessonData.pragmatic;

  // Кроки уроку - динамічне виявлення кроків відповідно до вмісту
  const getDynamicSteps = () => {
    const steps: { key: string; label: string; type: string }[] = [];

    // 1. Вступ
    steps.push({ key: 'intro', label: 'Вступ', type: 'intro' });

    // 2. Теорія
    if (activeDetail.expTitle || activeDetail.tableHeaders || activeDetail.can || activeDetail.cant || activeDetail.ruleText || activeDetail.aiText) {
      const theoryLabel = activeDetail.cant ? 'Суперсили ШІ' : 'Теорія';
      steps.push({ key: 'theory', label: theoryLabel, type: 'theory' });
    }

    // 3. Сценарії
    if (activeDetail.scens && activeDetail.scens.length > 0) {
      steps.push({ key: 'scens', label: 'Аналіз кейсів', type: 'scenarios' });
    }

    // 4. Оцінка промптів
    if (activeDetail.ccA && activeDetail.ccB) {
      steps.push({ key: 'prompt_choice', label: 'Оцінка промптів', type: 'prompt_choice' });
    }
    if (activeDetail.ccA1 && activeDetail.ccB1) {
      steps.push({ key: 'prompt_choice_1', label: 'Порівняння промптів I', type: 'prompt_choice_1' });
    }
    if (activeDetail.ccA2 && activeDetail.ccB2) {
      steps.push({ key: 'prompt_choice_2', label: 'Порівняння промптів II', type: 'prompt_choice_2' });
    }

    // Interactive Scenario Cards (e.g. Lesson 11)
    if (activeDetail.scenarios && activeDetail.scenarios.length > 0) {
      steps.push({ key: 'scenario_cards', label: 'Творчий практикум', type: 'scenario_cards' });
    }

    // Reflections
    if (activeDetail.reflections && activeDetail.reflections.length > 0) {
      steps.push({ key: 'reflections', label: 'Саморефлексія', type: 'reflections' });
    }

    // 5. Промпт-шаблони
    if (activeDetail.tmpls && activeDetail.tmpls.length > 0) {
      steps.push({ key: 'tmpls', label: 'Промпт-шаблони', type: 'templates' });
    }

    // 6. Практикум ch3
    if (activeDetail.ch3 && activeDetail.ch3.length > 0) {
      steps.push({ key: 'ch3_quiz', label: 'Розбір кейсу', type: 'ch3_quiz' });
    }

    // 7. Практикум ch4
    if (activeDetail.ch4 && activeDetail.ch4.length > 0) {
      steps.push({ key: 'ch4_quiz', label: 'Розумний вибір', type: 'ch4_quiz' });
    }

    // 8. Перевірка знань ch5
    if (activeDetail.ch5 && activeDetail.ch5.length > 0) {
      steps.push({ key: 'ch5_quiz', label: 'Контроль', type: 'ch5_quiz' });
    }

    // 9. Симулятор
    if (currentLessonId <= 17) {
      steps.push({ key: 'simulator', label: 'Симулятор', type: 'simulator' });
    }

    // 10. Тест
    if (activeDetail.quiz) {
      steps.push({ key: 'quiz', label: 'Тест-контроль', type: 'quiz' });
    }

    return steps;
  };

  const dynamicSteps = getDynamicSteps();
  const stepsList = dynamicSteps.map(s => s.label);
  const totalSteps = dynamicSteps.length;
  const activeStepType = dynamicSteps[currentStep]?.type;

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setQuizAnswer(null);
      setQuizSelectedIndices([]);
      setPromptSelection1(null);
      setPromptSelection2(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setQuizAnswer(null);
      setQuizSelectedIndices([]);
      setPromptSelection1(null);
      setPromptSelection2(null);
    }
  };

  const openLesson = (id: number) => {
    setCurrentLessonId(id);
    setCurrentStep(0);
    setQuizAnswer(null);
    setQuizSelectedIndices([]);
    setPromptSelection1(null);
    setPromptSelection2(null);
    setSelectedScenarioId(null);
    setReflectionAnswers({});
    setScenariosAnswers({});
    setPlaygroundSolved(false);
    setShowCelebration(false);
    setActiveView('lesson');
  };

  const finishLesson = () => {
    if (!completedLessons.includes(currentLessonId)) {
      setCompletedLessons(prev => [...prev, currentLessonId]);
    }
    showToast(`Урок ${lessonBrief.num} успішно пройдено! Отримано зірку вивчення ⭐️`, 'success');
    setShowCelebration(true);
  };

  const getNextLessonId = () => {
    if (routeMode === 'quick') {
      const idx = quickLessonIds.indexOf(currentLessonId);
      if (idx !== -1 && idx < quickLessonIds.length - 1) {
        return quickLessonIds[idx + 1];
      }
    } else {
      if (currentLessonId < 17) {
        return currentLessonId + 1;
      }
    }
    return null;
  };

  const isLComplete = completedLessons.includes(currentLessonId);

  // Емодзі під уроки
  const getEmoji = (id: number) => {
    const emojis: Record<number, string> = {
      1: '🍕', 2: '👁️', 3: '🛡️', 4: '🪄', 5: '📅', 6: '🔐', 
      7: '⚙️', 8: '📚', 9: '🕵️', 10: '🗣️', 11: '🎬', 12: '🎨', 
      13: '💼', 14: '🗣️', 15: '🌱', 16: '📈', 17: '📜'
    };
    return emojis[id] || '💡';
  };

  // Розрахунок усього прогресу
  const completedCount = completedLessons.length;
  const quickCompleted = quickLessonIds.filter(id => completedLessons.includes(id)).length;
  const progressPercent = Math.round(
    ((routeMode === 'quick' ? quickCompleted : completedCount) / (routeMode === 'quick' ? 5 : 17)) * 100
  );

  return (
    <div className={`min-h-screen bg-vibrant-dark text-slate-100 flex flex-col font-sans selection:bg-vibrant-pink/30 selection:text-white transition-all duration-300 ${textSize === 'large' ? 'text-lg leading-relaxed' : 'text-sm leading-normal'}`}>
      
      {/* Toast notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-2xl shadow-xl border text-xs font-bold leading-relaxed flex items-center gap-2 pointer-events-auto animate-[slideIn_0.3s_ease-out] border-l-4 ${
              t.type === 'success' 
                ? 'bg-vibrant-card/90 border-vibrant-emerald text-vibrant-emerald shadow-vibrant-emerald/10' 
                : t.type === 'error'
                ? 'bg-vibrant-card/90 border-vibrant-coral text-vibrant-coral shadow-vibrant-coral/10'
                : 'bg-vibrant-card/90 border-vibrant-cyan text-vibrant-cyan shadow-vibrant-cyan/10'
            }`}
          >
            <div className={`w-2 h-2 rounded-full bg-current animate-pulse shrink-0 ${
              t.type === 'success' ? 'text-vibrant-emerald' : t.type === 'error' ? 'text-vibrant-coral' : 'text-vibrant-cyan'
            }`}></div>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-vibrant-border/60 bg-vibrant-dark/85 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center gap-4">
          
          {/* Brand */}
          <div onClick={() => setActiveView('dashboard')} className="flex items-center gap-3 cursor-pointer shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vibrant-pink via-vibrant-purple to-vibrant-indigo flex items-center justify-center shadow-lg shadow-vibrant-pink/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-sm tracking-tighter">ШІ</span>
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-vibrant-pink via-vibrant-purple to-vibrant-cyan bg-clip-text text-transparent block">ШІ для всіх</span>
              <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider font-mono">Гейміфікований посібник</span>
            </div>
          </div>

          {/* Quick action bar */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={toggleTextSize}
              className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                textSize === 'large' 
                  ? 'bg-vibrant-pink/15 border-vibrant-pink/40 text-vibrant-pink' 
                  : 'bg-vibrant-card border-vibrant-border text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title="Збільшити розміри шрифтів для зручності читання"
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold font-display">Aa</span>
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all border flex items-center justify-center active:scale-95 cursor-pointer bg-vibrant-card border-vibrant-border text-slate-400 hover:text-white hover:border-slate-600"
              title="Перемкнути світлу/темну тему"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-vibrant-violet" />
              ) : (
                <Sun className="w-4 h-4 text-vibrant-amber" />
              )}
            </button>

            <button 
              onClick={() => setIsGlossaryOpen(true)}
              className="p-2 rounded-xl transition-all border flex items-center gap-1.5 active:scale-95 cursor-pointer bg-vibrant-card border-vibrant-border text-slate-400 hover:text-white hover:border-slate-600"
              title="Відкрити глосарій термінів ШІ"
              id="header_glossary_trigger"
            >
              <BookOpen className="w-4 h-4 text-vibrant-pink" />
              <span className="hidden lg:inline text-xs font-bold font-display">Глосарій</span>
            </button>

            {userRole && (
              <div className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                userRole === 'curious' 
                  ? 'border-vibrant-cyan/35 bg-vibrant-cyan/10 text-vibrant-cyan' 
                  : 'border-vibrant-amber/35 bg-vibrant-amber/10 text-vibrant-amber'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                <span>{userRole === 'curious' ? 'Шлях Допитливого ☀️' : 'Шлях Прагматика 💼'}</span>
              </div>
            )}

            {userRole && (
              <button 
                onClick={changeRole}
                className="px-3.5 py-2 bg-vibrant-card hover:bg-vibrant-card-hover border border-vibrant-border text-[10px] font-black tracking-wider text-slate-350 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer uppercase font-display"
              >
                Змінити шлях
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar (Only if user has selected a path) */}
        {userRole && (
          <aside className="w-full lg:w-72 shrink-0 self-start">
            <div className="border border-vibrant-border bg-vibrant-card/65 rounded-2xl p-4 space-y-4 shadow-xl">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-display">Зміст курсу</h3>
                <span className="text-[10px] font-mono font-bold text-vibrant-amber bg-vibrant-amber/10 px-2 py-0.5 rounded-full">{completedCount}/17 вивчено</span>
              </div>

              <div className="space-y-1">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeView === 'dashboard' 
                      ? 'bg-gradient-to-r from-vibrant-violet to-vibrant-indigo text-white shadow-lg shadow-vibrant-violet/20 font-display' 
                      : 'text-slate-400 hover:bg-vibrant-card-hover hover:text-white border border-transparent'
                  }`}
                >
                  <span className="text-sm">🏠</span>
                  <span className="font-display">Головний пульт</span>
                </button>
                
                <hr className="border-vibrant-border/50 my-2" />

                <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                  {syllabusList.map((lesson) => {
                    const isQuick = quickLessonIds.includes(lesson.id);
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isActive = activeView === 'lesson' && currentLessonId === lesson.id;
                    const isMuted = routeMode === 'quick' && !isQuick;

                    return (
                      <button 
                        key={lesson.id}
                        onClick={() => openLesson(lesson.id)}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                          isActive 
                            ? 'bg-gradient-to-r from-vibrant-purple/20 to-transparent border-vibrant-purple text-vibrant-pink shadow-md shadow-vibrant-pink/5' 
                            : isMuted
                            ? 'opacity-30 border-transparent hover:opacity-50 text-slate-500'
                            : 'border-transparent text-slate-350 hover:bg-vibrant-card-hover hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-vibrant-pink' : 'text-slate-500'}`}>{lesson.num}</span>
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        {isCompleted && <span className="text-vibrant-emerald text-xs shrink-0 font-bold bg-vibrant-emerald/10 px-1 rounded">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main interactive window */}
        <main className="flex-grow min-w-0">
          
          {/* STEP 1: ONBOARDING ROLE SWITCHER */}
          {!userRole && (
            <section className="animate-[fadeIn_0.4s_ease-out] py-4">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="px-3 py-1 bg-gradient-to-r from-vibrant-pink/10 to-vibrant-purple/10 border border-vibrant-pink/30 text-vibrant-pink rounded-full text-[10px] font-black tracking-widest uppercase font-mono">Вільний вибір</span>
                <h1 className="text-3xl md:text-4xl font-display font-black mt-4 mb-3 tracking-tight text-white leading-tight">Вітаємо у посібнику штучного інтелекту!</h1>
                <p className="text-slate-350 text-sm">Тут ви опануєте ШІ повністю без складних математичних формул та програмування. Оберіть свій шлях викладання матеріалу:</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Curious path Card */}
                <div 
                  onClick={() => selectRole('curious')}
                  className="group bg-vibrant-card/80 hover:bg-vibrant-card border border-vibrant-border hover:border-vibrant-pink rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-vibrant-pink/15 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-vibrant-pink/15 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">☀️</div>
                    <h3 className="text-xl font-display font-black text-white group-hover:text-vibrant-pink transition-colors mb-2">☀️ Шлях Допитливого</h3>
                    <p className="text-slate-350 text-xs leading-relaxed mb-6">Для школярів, старшого покоління та початківців. Пояснення через прості життєві метафори. Вивчимо основи пошуку інформації, планування подорожей та побутову безпеку даних.</p>
                  </div>
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-vibrant-coral to-vibrant-pink text-white font-black rounded-xl transition-all shadow-lg shadow-vibrant-pink/20 hover:opacity-90 active:scale-95 text-xs cursor-pointer font-display uppercase tracking-wider">
                    Почати просту подорож
                  </button>
                </div>

                {/* Pragmatic path Card */}
                <div 
                  onClick={() => selectRole('pragmatic')}
                  className="group bg-vibrant-card/80 hover:bg-vibrant-card border border-vibrant-border hover:border-vibrant-cyan rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-vibrant-cyan/15 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-vibrant-cyan/15 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">💼</div>
                    <h3 className="text-xl font-display font-black text-white group-hover:text-vibrant-cyan transition-colors mb-2">💼 Шлях Прагматика</h3>
                    <p className="text-slate-350 text-xs leading-relaxed mb-6">Для підприємців, фрілансерів та спеціалістів. Реальні бізнес-кейси. Складання офіційних скарг, автоматизація робочих листів, копірайт та сортування бюджетів.</p>
                  </div>
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-vibrant-purple to-vibrant-indigo text-white font-black rounded-xl transition-all shadow-lg shadow-vibrant-indigo/20 hover:opacity-90 active:scale-95 text-xs cursor-pointer font-display uppercase tracking-wider">
                    Почати професійний курс
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* STEP 2: COURSE DASHBOARD (HOME) */}
          {userRole && activeView === 'dashboard' && (
            <section className="animate-[fadeIn_0.3s_ease-out] space-y-6">
              
              {/* Profile banner with status */}
              <div className="relative overflow-hidden rounded-2xl border border-vibrant-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-vibrant-card/80 shadow-xl">
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-vibrant-pink via-vibrant-purple to-vibrant-cyan"></div>
                <div className="space-y-1">
                  <span className="text-[10px] tracking-widest uppercase font-black text-slate-400 block font-display">Ваш активний профіль:</span>
                  <h2 className="text-2xl font-display font-black text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {userRole === 'curious' ? '☀️ Шлях Допитливого' : '💼 Шлях Прагматика'}
                  </h2>
                  <p className="text-slate-350 text-xs max-w-2xl leading-relaxed">
                    {userRole === 'curious' 
                      ? 'Проста мова, життєві аналогії на пальцях та максимальна легкість розуміння основ ШІ в побуті.'
                      : 'Докладне розкриття ділових інструментів, написання маркетингового контенту, звітів, планів та робочих сценаріїв.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-450 font-mono font-bold">Траєкторія:</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border font-display ${
                    userRole === 'curious' ? 'bg-vibrant-cyan/15 border-vibrant-cyan/35 text-vibrant-cyan' : 'bg-vibrant-amber/15 border-vibrant-amber/35 text-vibrant-amber'
                  }`}>
                    {userRole === 'curious' ? 'Допитливий ☀️' : 'Бізнес 💼'}
                  </span>
                </div>
              </div>

              {/* Glossary Promo Banner */}
              <div 
                id="glossary-promo-card"
                onClick={() => setIsGlossaryOpen(true)}
                className="group relative overflow-hidden rounded-2xl border border-vibrant-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-vibrant-pink/10 via-vibrant-purple/5 to-transparent hover:border-vibrant-pink/50 cursor-pointer transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-vibrant-pink/15 flex items-center justify-center text-vibrant-pink border border-vibrant-pink/25 group-hover:scale-105 transition-transform shrink-0">
                    <BookOpen className="w-6 h-6 text-glow-pink" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-black text-white group-hover:text-vibrant-pink transition-colors">📖 Інтерактивний глосарій термінів ШІ</h3>
                    <p className="text-slate-350 text-xs mt-1">
                      Промпт, галюцинація, контекст, нейромережа... Дізнайтеся та закріпіть прості життєві аналогії для найскладніших понять за один клік!
                    </p>
                  </div>
                </div>
                <button 
                  id="dashboard-open-glossary-btn"
                  className="px-4 py-2 bg-vibrant-dark group-hover:bg-vibrant-pink group-hover:text-slate-950 border border-vibrant-border group-hover:border-transparent text-[11px] font-black uppercase text-vibrant-pink rounded-xl shadow-lg transition-all active:scale-95 shrink-0 self-stretch sm:self-center flex items-center justify-center gap-1.5 font-display tracking-wider"
                >
                  <span>Відкрити словник</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Route Mode Switcher & Progress bar combined */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 border border-vibrant-border bg-vibrant-card/50 rounded-2xl space-y-4 shadow-xl">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 font-display">Формат маршруту:</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Змініть у будь-який час, прогрес збережеться.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => toggleRouteMode('full')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        routeMode === 'full' 
                          ? 'border-vibrant-pink/45 bg-vibrant-pink/15 text-vibrant-pink shadow-md' 
                          : 'border-vibrant-border bg-vibrant-card text-slate-350 hover:bg-vibrant-card-hover'
                      }`}
                    >
                      🗺️ Повний курс (17 занять)
                    </button>
                    <button 
                      onClick={() => toggleRouteMode('quick')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        routeMode === 'quick' 
                          ? 'border-vibrant-cyan/45 bg-vibrant-cyan/15 text-vibrant-cyan shadow-md' 
                          : 'border-vibrant-border bg-vibrant-card text-slate-350 hover:bg-vibrant-card-hover'
                      }`}
                    >
                      ⚡ Експрес (5 занять / 30 хв)
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs italic leading-relaxed">
                    {routeMode === 'quick' 
                      ? '💡 Обрано 5 найважливіших уроків для супер-швидкого навчання (Уроки 1, 2, 4, 6, 10).'
                      : '🗺️ Повна послідовна мандрівка з вивченням креативності, здоров\'я, фінансів, перекладів та складання власних правил.'}
                  </p>
                </div>

                <div className="p-5 border border-vibrant-border bg-vibrant-card/50 rounded-2xl flex flex-col justify-between space-y-3 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 font-display">Мій прогрес:</h3>
                      <p className="text-white text-base font-extrabold mt-0.5 font-display">Пройдені заняття</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-vibrant-pink font-mono text-glow-pink">{progressPercent}%</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5 bg-vibrant-pink/10 px-2 py-0.5 rounded-full">
                        {routeMode === 'quick' 
                          ? `${quickCompleted} з 5`
                          : `${completedCount} з 17`}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-vibrant-dark overflow-hidden border border-vibrant-border/50">
                    <div 
                      className="h-full bg-gradient-to-r from-vibrant-pink via-vibrant-purple to-vibrant-cyan rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,20,147,0.5)]" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-slate-450 italic leading-snug">
                    За кожен завершений урок ви отримуєте унікальну зірку вивчення ⭐️. Спробуйте зібрати всі зірки!
                  </div>
                </div>
              </div>

              {/* Subtitles heading */}
              <div className="pt-2 border-t border-vibrant-border/50">
                <h3 className="text-sm font-black text-white font-display">Список занять:</h3>
                <p className="text-slate-400 text-xs mt-0.5">Оберіть урок для занурення у інтерактивні розповіді.</p>
              </div>

              {/* Lesson Grid Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {syllabusList.map((lesson) => {
                  const isQuick = quickLessonIds.includes(lesson.id);
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isRouteMuted = routeMode === 'quick' && !isQuick;

                  return (
                    <div 
                      key={lesson.id}
                      onClick={() => openLesson(lesson.id)}
                      className={`group border rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 shadow-md ${
                        isCompleted 
                          ? 'border-vibrant-emerald/30 bg-vibrant-emerald/5 hover:bg-vibrant-emerald/10'
                          : isRouteMuted
                          ? 'border-vibrant-border bg-vibrant-card/10 opacity-30 hover:opacity-100 hover:border-vibrant-border'
                          : 'border-vibrant-border bg-vibrant-card/80 hover:bg-vibrant-card hover:border-vibrant-purple hover:shadow-vibrant-purple/10'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-vibrant-dark border border-vibrant-border/80 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform group-hover:border-vibrant-pink">
                          {getEmoji(lesson.id)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">УРОК {lesson.num}</span>
                          <h4 className="text-sm font-display font-black text-white mt-0.5 group-hover:text-vibrant-pink transition-colors truncate">
                            {lesson.title}
                          </h4>
                          <p className="text-[11px] text-slate-350 mt-1 leading-snug line-clamp-2">
                            {userRole === 'curious' 
                              ? (detailedLessons[lesson.id]?.curious?.hookSub || '').substring(0, 110)
                              : (detailedLessons[lesson.id]?.pragmatic?.hookSub || '').substring(0, 110)}
                            ...
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5 pl-2">
                        {isCompleted ? (
                          <span className="text-[10px] font-display font-black uppercase text-vibrant-emerald bg-vibrant-emerald/10 border border-vibrant-emerald/20 px-2.5 py-0.5 rounded-full">⭐️ Вивчено</span>
                        ) : isQuick && routeMode === 'quick' ? (
                          <span className="text-[10px] font-display font-black uppercase text-vibrant-cyan bg-vibrant-cyan/10 border border-vibrant-cyan/20 px-2.5 py-0.5 rounded-full">⚡ Експрес</span>
                        ) : (
                          <span className="text-[10.5px] font-display font-black text-slate-400 group-hover:text-vibrant-pink transition-colors">Читати →</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </section>
          )}

          {/* STEP 3: INDIVIDUAL ADAPTIVE LESSON PLAYER */}
          {userRole && activeView === 'lesson' && (
            <section className="animate-[fadeIn_0.3s_ease-out] space-y-6">
              
              {/* Top back & details box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vibrant-border">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-vibrant-pink" />
                  <span>Повернутись на пульт</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Поточний шлях:</span>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                    userRole === 'curious' ? 'border-vibrant-cyan/35 bg-vibrant-cyan/10 text-vibrant-cyan' : 'border-vibrant-amber/35 bg-vibrant-amber/10 text-vibrant-amber'
                  }`}>
                    {userRole === 'curious' ? 'Допитливий ☀️' : 'Прагматика 💼'}
                  </span>
                </div>
              </div>

              {/* Active Step Indicator tracker */}
              <div className="bg-vibrant-card/65 rounded-2xl p-4 border border-vibrant-border space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400 font-bold uppercase tracking-wider">Крок {currentStep + 1} / {totalSteps}</span>
                  <span className="text-vibrant-pink font-black font-display">{stepsList[currentStep]}</span>
                </div>
                <div className="flex gap-1.5 h-1.5 w-full">
                  {stepsList.map((stepName, sidx) => {
                    const isDone = sidx < currentStep;
                    const isNow = sidx === currentStep;
                    return (
                      <div 
                        key={stepName}
                        className={`h-full rounded-full flex-grow transition-all duration-300 ${
                          isDone 
                            ? 'bg-vibrant-emerald' 
                            : isNow 
                            ? 'bg-vibrant-pink ring-2 ring-vibrant-pink/40 animate-pulse' 
                            : 'bg-vibrant-dark'
                        }`}
                        title={stepName}
                      ></div>
                    );
                  })}
                </div>
              </div>

              {/* Title blocks */}
              <div className="space-y-1">
                <span className="text-xs font-black tracking-widest bg-gradient-to-r from-vibrant-pink via-vibrant-purple to-vibrant-cyan bg-clip-text text-transparent uppercase font-mono">
                  УРОК {lessonBrief.num}
                </span>
                <h1 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">
                  {lessonBrief.title}
                </h1>
              </div>

              {/* STEP CONTENT SWITCHER */}
              <div className="p-1 min-h-[30vh]">

                {/* INTRO STEP */}
                {activeStepType === 'intro' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="p-5 bg-gradient-to-tr from-vibrant-card to-vibrant-card/85 border-l-4 border-vibrant-pink rounded-2xl space-y-2.5 shadow-xl">
                      <p className="text-base font-bold text-white leading-relaxed font-display">
                        {activeDetail.hook}
                      </p>
                      <p className="text-xs text-slate-350 leading-relaxed italic">
                        {activeDetail.hookSub}
                      </p>
                    </div>

                    {activeDetail.aiText && (
                      <div className="border-l-4 border-vibrant-amber bg-vibrant-amber/10 rounded-2xl p-5 space-y-2.5 shadow-xl">
                        <span className="text-[10px] font-black uppercase text-vibrant-amber tracking-widest font-mono">ВІДПОВІДЬ ШІ</span>
                        <p className="text-xs font-mono text-slate-355 leading-relaxed bg-vibrant-dark/40 p-3.5 rounded-xl border border-vibrant-border/30 italic">
                          "{activeDetail.aiText}"
                        </p>
                      </div>
                    )}

                    {(activeDetail.think || activeDetail.ch1) && (
                      <div className="space-y-4">
                        {activeDetail.think && (
                          <div className="border border-vibrant-border/80 rounded-2xl p-4 bg-vibrant-dark/50">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-450 mb-1 font-bold">Поміркуйте</p>
                            <p className="text-sm text-slate-200 font-bold leading-relaxed">{activeDetail.think}</p>
                          </div>
                        )}

                        {activeDetail.ch1 && (
                          <div className="space-y-2.5">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest font-display">
                              {currentLessonId === 3 
                                ? 'Що вас насторожує у цій відповіді?' 
                                : 'Оберіть варіант відповіді:'}
                            </p>
                            {activeDetail.ch1.map((choice, cidx) => {
                              const isChecked = quizAnswer === cidx;
                              const isCorrect = choice.v === 'correct';
                              const isPartial = choice.v === 'partial';

                              return (
                                <div key={cidx} className="space-y-2">
                                  <button
                                    onClick={() => {
                                      setQuizAnswer(cidx);
                                      if (choice.v === 'correct') {
                                        showToast('Вірно! Ознайомтесь і переходьте на наступний крок.', 'success');
                                      }
                                    }}
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                      isChecked
                                        ? isCorrect
                                          ? 'bg-vibrant-emerald/15 border-vibrant-emerald text-vibrant-emerald shadow-lg shadow-vibrant-emerald/5'
                                          : isPartial
                                          ? 'bg-vibrant-cyan/15 border-vibrant-cyan text-vibrant-cyan shadow-lg shadow-vibrant-cyan/5'
                                          : 'bg-vibrant-coral/15 border-vibrant-coral text-vibrant-coral shadow-lg shadow-vibrant-coral/5'
                                        : 'bg-vibrant-card border-vibrant-border text-slate-200 hover:bg-vibrant-card-hover hover:border-slate-600'
                                    }`}
                                  >
                                    <span>{choice.t}</span>
                                    <span className="text-[10px] shrink-0 font-bold uppercase font-display bg-white/5 px-2 py-0.5 rounded text-slate-300">
                                      {isChecked ? (isCorrect ? '✓ Правильно' : '✗ Спробувати ще') : 'Зробити вибір'}
                                    </span>
                                  </button>
                                  {isChecked && (
                                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-[fadeIn_0.2s_ease-out] ${
                                      isCorrect ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' : 'bg-vibrant-coral/10 border-vibrant-coral/30 text-coral-200'
                                    }`}>
                                      {choice.fb}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* THEORY STEP */}
                {activeStepType === 'theory' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    {activeDetail.expTitle && (
                      <div className="space-y-1 text-center max-w-xl mx-auto">
                        <h2 className="text-xl font-display font-black text-white">{activeDetail.expTitle}</h2>
                        {activeDetail.expSub && <p className="text-xs text-slate-400">{activeDetail.expSub}</p>}
                      </div>
                    )}

                    {activeDetail.aiText && (
                      <div className="p-4 bg-vibrant-card border border-vibrant-border rounded-xl space-y-2">
                        <strong className="text-[10px] font-mono uppercase text-vibrant-pink tracking-wider">Приклад галюцинації / тексту:</strong>
                        <p className="text-xs text-slate-350 italic font-mono bg-vibrant-dark/40 p-3 rounded-lg leading-relaxed break-words">
                          "{activeDetail.aiText}"
                        </p>
                      </div>
                    )}

                    {activeDetail.tableHeaders && activeDetail.tableRows && (
                      <div className="border border-vibrant-border rounded-2xl overflow-hidden shadow-2xl bg-vibrant-card/50">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-vibrant-dark/80 border-b border-vibrant-border text-slate-300">
                                {activeDetail.tableHeaders.map((header, hidx) => (
                                  <th key={hidx} className="p-3.5 font-black uppercase tracking-wider font-mono text-[10px]">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {activeDetail.tableRows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-vibrant-border/50 hover:bg-vibrant-card-hover/40 transition-all">
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className={`p-3.5 leading-relaxed ${cellIdx === 0 ? 'text-vibrant-pink font-bold font-mono text-[11px]' : 'text-slate-200'}`}>
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeDetail.can && activeDetail.cant && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 bg-vibrant-emerald/5 border border-vibrant-emerald/25 rounded-2xl space-y-3 shadow-xl">
                          <h4 className="text-xs font-black uppercase text-vibrant-emerald tracking-widest flex items-center gap-1.5 font-display">
                            <span className="w-2 h-2 rounded-full bg-vibrant-emerald animate-pulse px-0 py-0 block gap-0"></span>
                            ✓ ШІ вміє добре:
                          </h4>
                          <ul className="space-y-2.5 pl-1">
                            {activeDetail.can.map((item, cidx) => (
                              <li key={cidx} className="text-xs text-slate-205 leading-relaxed flex items-start gap-2">
                                <span className="text-vibrant-emerald mt-0.5 shrink-0 font-bold font-display">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-5 bg-vibrant-coral/5 border border-vibrant-coral/25 rounded-2xl space-y-3 shadow-xl">
                          <h4 className="text-xs font-black uppercase text-vibrant-coral tracking-widest flex items-center gap-1.5 font-display">
                            <span className="w-2 h-2 rounded-full bg-vibrant-coral animate-pulse px-0 py-0 block gap-0"></span>
                            ✗ ШІ не вміє / ризиковано:
                          </h4>
                          <ul className="space-y-2.5 pl-1">
                            {activeDetail.cant.map((item, cidx) => (
                              <li key={cidx} className="text-xs text-slate-205 leading-relaxed flex items-start gap-2">
                                <span className="text-vibrant-coral mt-0.5 shrink-0 font-bold font-display">✗</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeDetail.ruleText && (
                      <div className="p-4.5 border-l-4 border-vibrant-amber bg-vibrant-amber/5 rounded-r-xl space-y-1 shadow-md">
                        <strong className="text-xs uppercase font-black text-vibrant-amber font-mono block tracking-wider">
                          {activeDetail.ruleTitle || 'Важливе правило'}
                        </strong>
                        <p className="text-xs text-slate-300 leading-relaxed font-bold">{activeDetail.ruleText}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SCENARIOS STEP */}
                {activeStepType === 'scenarios' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="space-y-1 text-center max-w-xl mx-auto">
                      <span className="text-[10px] uppercase font-black text-slate-400 font-mono tracking-widest">Методологія</span>
                      <h2 className="text-xl font-display font-black text-white">Аналіз та сортування ситуацій</h2>
                      <p className="text-xs text-slate-400">Перевірте уміння орієнтуватися у складних завданнях побуту. Оцініть кожну ситуацію:</p>
                    </div>

                    {activeDetail.scens && (
                      <div className="space-y-4">
                        {activeDetail.scens.map((sc, scIdx) => {
                          const userAns = scenariosAnswers[scIdx];
                          const hasScChk = sc.chk !== undefined;
                          const hasScAi = sc.ai !== undefined;
                          const hasScSafe = sc.safe !== undefined;
                          const hasScOk = sc.ok !== undefined;
                          const hasScCor = sc.cor !== undefined;

                          const isInteractive = hasScChk || hasScAi || hasScSafe || hasScOk || hasScCor;
                          
                          let correctVal: any = undefined;
                          if (hasScChk) correctVal = sc.chk;
                          else if (hasScAi) correctVal = sc.ai;
                          else if (hasScSafe) correctVal = sc.safe;
                          else if (hasScOk) correctVal = sc.ok;
                          else if (hasScCor) correctVal = sc.cor;

                          const isCorrect = userAns === correctVal;

                          return (
                            <div key={scIdx} className="p-5 bg-vibrant-card border border-vibrant-border rounded-2xl space-y-4 shadow-xl transition-all">
                              <p className="text-sm font-bold text-slate-200 leading-relaxed">{sc.q}</p>
                              
                              {sc.good && sc.bad && (
                                <div className="grid md:grid-cols-2 gap-3 pt-1 text-[11px]">
                                  <div className="p-3 bg-vibrant-emerald/10 border border-vibrant-emerald/20 rounded-xl space-y-1">
                                    <span className="font-bold text-vibrant-emerald flex items-center gap-1 font-display uppercase tracking-wider text-[9px]">🛡️ Безпечно:</span>
                                    <p className="text-slate-300 leading-relaxed">{sc.good}</p>
                                  </div>
                                  <div className="p-3 bg-vibrant-coral/10 border border-vibrant-coral/20 rounded-xl space-y-1">
                                    <span className="font-bold text-vibrant-coral flex items-center gap-1 font-display uppercase tracking-wider text-[9px]">⚠️ Ризиковано:</span>
                                    <p className="text-slate-300 leading-relaxed">{sc.bad}</p>
                                  </div>
                                </div>
                              )}

                              {/* Show double prompts for choosing if cor is defined */}
                              {hasScCor && sc.a && sc.b && (
                                <div className="grid sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                                  <div className="p-3 bg-vibrant-dark/35 border border-vibrant-border/30 rounded-xl space-y-1">
                                    <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Варіант А:</span>
                                    <p className="text-slate-350 italic">"{sc.a}"</p>
                                  </div>
                                  <div className="p-3 bg-vibrant-dark/35 border border-vibrant-border/30 rounded-xl space-y-1">
                                    <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Варіант Б:</span>
                                    <p className="text-slate-350 italic">"{sc.b}"</p>
                                  </div>
                                </div>
                              )}

                              {/* Interactive Choice Buttons */}
                              {isInteractive && (
                                <div className="space-y-2">
                                  <span className="block text-[11px] font-black uppercase text-slate-400 font-mono tracking-wider">Ваш вибір:</span>
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    {/* Option A (true / 'A') */}
                                    <button
                                      onClick={() => {
                                        if (userAns === undefined) {
                                          const val = hasScCor ? 'A' : true;
                                          setScenariosAnswers(prev => ({ ...prev, [scIdx]: val }));
                                          if (correctVal === val) {
                                            showToast('Правильний висновок! Відповідь підсвічено зеленим.', 'success');
                                          } else {
                                            showToast('Не зовсім так. Прочитайте розбір методиста.', 'error');
                                          }
                                        }
                                      }}
                                      disabled={userAns !== undefined}
                                      className={`w-full py-3 px-4 text-left rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2.5 ${
                                        userAns === undefined
                                          ? 'bg-vibrant-dark/30 border-vibrant-border/70 text-slate-205 hover:bg-vibrant-card-hover hover:border-slate-500 cursor-pointer'
                                          : userAns === (hasScCor ? 'A' : true)
                                            ? correctVal === (hasScCor ? 'A' : true)
                                              ? 'bg-vibrant-emerald/15 border-vibrant-emerald text-vibrant-emerald font-black cursor-default shadow-lg shadow-vibrant-emerald/5'
                                              : 'bg-vibrant-coral/15 border-vibrant-coral text-vibrant-coral font-black cursor-default shadow-lg shadow-vibrant-coral/5'
                                            : 'opacity-40 cursor-not-allowed bg-vibrant-dark/30 border-vibrant-border text-slate-500'
                                      }`}
                                    >
                                      <span>
                                        {userAns === (hasScCor ? 'A' : true)
                                          ? correctVal === (hasScCor ? 'A' : true)
                                            ? '✓ '
                                            : '✗ '
                                          : ''}
                                        {hasScCor 
                                          ? 'Обрати Промпт А' 
                                          : hasScChk 
                                            ? 'Треба перевірити' 
                                            : hasScSafe 
                                              ? 'Цілком безпечно' 
                                              : hasScOk 
                                                ? 'Хороший конкретний запит' 
                                                : 'ШІ підходить'}
                                      </span>
                                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                        {hasScCor 
                                          ? 'Запит А' 
                                          : hasScChk 
                                            ? '⚠ Ризик' 
                                            : hasScSafe 
                                              ? '🛡️ Онлайн' 
                                              : hasScOk 
                                                ? '🎯 Ок' 
                                                : '💡 ШІ'}
                                      </span>
                                    </button>

                                    {/* Option B (false / 'B') */}
                                    <button
                                      onClick={() => {
                                        if (userAns === undefined) {
                                          const val = hasScCor ? 'B' : false;
                                          setScenariosAnswers(prev => ({ ...prev, [scIdx]: val }));
                                          if (correctVal === val) {
                                            showToast('Правильний висновок! Відповідь підсвічено зеленим.', 'success');
                                          } else {
                                            showToast('Не зовсім так. Прочитайте розбір методиста.', 'error');
                                          }
                                        }
                                      }}
                                      disabled={userAns !== undefined}
                                      className={`w-full py-3 px-4 text-left rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2.5 ${
                                        userAns === undefined
                                          ? 'bg-vibrant-dark/30 border-vibrant-border/70 text-slate-205 hover:bg-vibrant-card-hover hover:border-slate-500 cursor-pointer'
                                          : userAns === (hasScCor ? 'B' : false)
                                            ? correctVal === (hasScCor ? 'B' : false)
                                              ? 'bg-vibrant-emerald/15 border-vibrant-emerald text-vibrant-emerald font-black cursor-default shadow-lg shadow-vibrant-emerald/5'
                                              : 'bg-vibrant-coral/15 border-vibrant-coral text-vibrant-coral font-black cursor-default shadow-lg shadow-vibrant-coral/5'
                                            : 'opacity-40 cursor-not-allowed bg-vibrant-dark/30 border-vibrant-border text-slate-500'
                                      }`}
                                    >
                                      <span>
                                        {userAns === (hasScCor ? 'B' : false)
                                          ? correctVal === (hasScCor ? 'B' : false)
                                            ? '✓ '
                                            : '✗ '
                                          : ''}
                                        {hasScCor 
                                          ? 'Обрати Промпт Б' 
                                          : hasScChk 
                                            ? 'Можна довіряти' 
                                            : hasScSafe 
                                              ? 'Містить ризики / Небезпечно' 
                                              : hasScOk 
                                                ? 'Слабкий занадто загальний запит' 
                                                : 'Потребує людини / Google'}
                                      </span>
                                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                        {hasScCor 
                                          ? 'Запит Б' 
                                          : hasScChk 
                                            ? '✓ Інтуїція' 
                                            : hasScSafe 
                                              ? '⚠ Складно' 
                                              : hasScOk 
                                                ? '⚠ Слабкий' 
                                                : '🔍 Пошук'}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Prompts side-by-side comparison (only for non-cor type once answered) */}
                              {!hasScCor && sc.a && sc.b && userAns !== undefined && (
                                <div className="grid sm:grid-cols-2 gap-3 pt-1 text-[11px] animate-[fadeIn_0.2s_ease-out]">
                                  <div className="p-2.5 bg-vibrant-dark/40 border border-vibrant-border/40 rounded-xl italic text-slate-450">
                                    <span className="block font-bold text-slate-450 uppercase tracking-wider text-[9px] mb-1 font-mono">Слабкий запит:</span>
                                    "{sc.a}"
                                  </div>
                                  <div className="p-2.5 bg-vibrant-dark/70 border border-vibrant-pink/25 rounded-md italic">
                                    <span className="block font-bold text-vibrant-pink uppercase tracking-wider text-[9px] mb-1 font-display">Покращений запит:</span>
                                    "{sc.b}"
                                  </div>
                                </div>
                              )}

                              {/* Explanation of current scenario item */}
                              {userAns !== undefined && sc.exp && (
                                <div className={`p-4 border rounded-xl text-xs leading-relaxed animate-[fadeIn_0.2s_ease-out] ${
                                  isCorrect 
                                    ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' 
                                    : 'bg-vibrant-cyan/10 border-vibrant-cyan/30 text-cyan-200'
                                }`}>
                                  <span className="font-mono uppercase text-[9px] tracking-wider text-vibrant-pink font-black block mb-1">
                                    {isCorrect ? '🎯 Правильний висновок:' : '💡 Коментар методолога:'}
                                  </span>
                                  {sc.exp}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Overall methodology completion banner */}
                        {(() => {
                          const allAnswered = activeDetail.scens.every((_, idx) => scenariosAnswers[idx] !== undefined);
                          if (!allAnswered) return null;
                          return (
                            <div className="p-5 bg-gradient-to-tr from-vibrant-emerald/20 to-vibrant-card border-l-4 border-vibrant-emerald rounded-r-2xl space-y-2 shadow-2xl animate-[fadeIn_0.4s_ease-out] border border-vibrant-border/50">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">🏆</span>
                                <h4 className="text-xs font-black uppercase text-vibrant-emerald tracking-wider font-display">Практикум завершено!</h4>
                              </div>
                              <p className="text-xs text-slate-205 leading-relaxed font-bold">
                                {currentLessonId === 3 
                                  ? 'Добре. Ви вже відчуваєте різницю між загальними порадами і конкретними фактами.' 
                                  : currentLessonId === 2
                                  ? 'Добре. Ви вже відрізняєте сфери, де ШІ показує суперсили, від тих, де потрібен пошук у Google або робота людини.'
                                  : 'Чудово! Ви успішно пройшли практикум сортування кейсів та розібралися з логікою ШІ!'}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* PROMPT CHOICE STEP */}
                {activeStepType === 'prompt_choice' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="space-y-1 text-center max-w-xl mx-auto">
                      <span className="text-[10px] uppercase font-black text-vibrant-pink font-mono tracking-widest">Порівняння промптів</span>
                      <h2 className="text-xl font-display font-black text-white">
                        {activeDetail.promptTitle || activeDetail.pTitle || 'Який запит кращий?'}
                      </h2>
                      {(activeDetail.promptSub || activeDetail.pSub) && (
                        <p className="text-xs text-slate-400">
                          {activeDetail.promptSub || activeDetail.pSub}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* PROMPT A */}
                      <button
                        onClick={() => setPromptSelection1('A')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 shadow-xl transition-all cursor-pointer ${
                          promptSelection1 === 'A' ? 'border-vibrant-coral bg-vibrant-coral/5 ring-1 ring-vibrant-coral' : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover'
                        }`}
                      >
                        <div className="space-y-2 w-full">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-vibrant-coral/10 text-vibrant-coral font-mono">Промпт А</span>
                          <p className="text-xs font-mono text-slate-205 bg-vibrant-dark/40 p-3 rounded-xl border border-vibrant-border/30 italic whitespace-normal leading-relaxed">
                            "{activeDetail.ccA || activeDetail.ccA1 || activeDetail.ccA2}"
                          </p>
                        </div>
                        <span className="w-full py-2 bg-vibrant-dark/60 border border-white/5 text-center text-[10px] font-black rounded-lg hover:text-white font-display uppercase tracking-widest">
                          {promptSelection1 === 'A' ? 'Обрано' : 'Аналізувати А'}
                        </span>
                      </button>

                      {/* PROMPT B */}
                      <button
                        onClick={() => setPromptSelection1('B')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 shadow-xl transition-all cursor-pointer ${
                          promptSelection1 === 'B' ? 'border-vibrant-emerald bg-vibrant-emerald/5 ring-1 ring-vibrant-emerald' : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover'
                        }`}
                      >
                        <div className="space-y-2 w-full">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-vibrant-emerald/10 text-vibrant-emerald font-mono">Промпт Б</span>
                          <p className="text-xs font-mono text-slate-205 bg-vibrant-dark/40 p-3 rounded-xl border border-vibrant-border/30 italic whitespace-normal leading-relaxed">
                            "{activeDetail.ccB || activeDetail.ccB1 || activeDetail.ccB2}"
                          </p>
                        </div>
                        <span className="w-full py-2 bg-vibrant-dark/60 border border-white/5 text-center text-[10px] font-black rounded-lg hover:text-white font-display uppercase tracking-widest">
                          {promptSelection1 === 'B' ? 'Обрано ✓' : 'Аналізувати Б'}
                        </span>
                      </button>
                    </div>

                    {promptSelection1 && (
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed font-bold animate-[fadeIn_0.2s_ease-out] ${
                        promptSelection1 === 'B' 
                          ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' 
                          : 'bg-vibrant-coral/10 border-vibrant-coral/30 text-coral-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg">{promptSelection1 === 'B' ? '🎉' : '⚠️'}</span>
                          <span className="uppercase text-[9px] tracking-widest font-mono font-black">{promptSelection1 === 'B' ? 'Правильна стратегія:' : 'Слабкий запит:'}</span>
                        </div>
                        <p className="font-medium">
                          {promptSelection1 === 'B' 
                            ? (activeDetail.fb4c || activeDetail.fb1c || 'Відмінний вибір! Промпт Б містить точність, додаткові вказівки чи корисну роль.') 
                            : (activeDetail.fb4w || activeDetail.fb1w || 'Промпт А занадто загальний, ШІ може дофантазувати деталі.')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* PROMPT CHOICE 1 STEP */}
                {activeStepType === 'prompt_choice_1' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="space-y-1 text-center max-w-xl mx-auto">
                      <span className="text-[10px] uppercase font-black text-vibrant-pink font-mono tracking-widest">Порівняння промптів: Частина I</span>
                      <h2 className="text-xl font-display font-black text-white">
                        {activeDetail.promptTitle1 || activeDetail.pTitle || 'Який запит кращий?'}
                      </h2>
                      {(activeDetail.promptSub1 || activeDetail.pSub) && (
                        <p className="text-xs text-slate-400">
                          {activeDetail.promptSub1 || activeDetail.pSub}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* PROMPT A */}
                      <button
                        onClick={() => setPromptSelection1('A')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 shadow-xl transition-all cursor-pointer ${
                          promptSelection1 === 'A' ? 'border-vibrant-coral bg-vibrant-coral/5 ring-1 ring-vibrant-coral' : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover'
                        }`}
                      >
                        <div className="space-y-2 w-full">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-vibrant-coral/10 text-vibrant-coral font-mono">Промпт А</span>
                          <p className="text-xs font-mono text-slate-205 bg-vibrant-dark/40 p-3 rounded-xl border border-vibrant-border/30 italic whitespace-normal leading-relaxed font-normal">
                            "{activeDetail.ccA1}"
                          </p>
                        </div>
                        <span className="w-full py-2 bg-vibrant-dark/60 border border-white/5 text-center text-[10px] font-black rounded-lg hover:text-white font-display uppercase tracking-widest">
                          {promptSelection1 === 'A' ? 'Обрано' : 'Аналізувати А'}
                        </span>
                      </button>

                      {/* PROMPT B */}
                      <button
                        onClick={() => setPromptSelection1('B')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 shadow-xl transition-all cursor-pointer ${
                          promptSelection1 === 'B' ? 'border-vibrant-emerald bg-vibrant-emerald/5 ring-1 ring-vibrant-emerald' : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover'
                        }`}
                      >
                        <div className="space-y-2 w-full">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-vibrant-emerald/10 text-vibrant-emerald font-mono">Промпт Б</span>
                          <p className="text-xs font-mono text-slate-205 bg-vibrant-dark/40 p-3 rounded-xl border border-vibrant-border/30 italic whitespace-normal leading-relaxed font-normal">
                            "{activeDetail.ccB1}"
                          </p>
                        </div>
                        <span className="w-full py-2 bg-vibrant-dark/60 border border-white/5 text-center text-[10px] font-black rounded-lg hover:text-white font-display uppercase tracking-widest">
                          {promptSelection1 === 'B' ? 'Обрано ✓' : 'Аналізувати Б'}
                        </span>
                      </button>
                    </div>

                    {promptSelection1 && (
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed font-bold animate-[fadeIn_0.2s_ease-out] ${
                        promptSelection1 === 'B' 
                          ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' 
                          : 'bg-vibrant-coral/10 border-vibrant-coral/30 text-coral-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg">{promptSelection1 === 'B' ? '🎉' : '⚠️'}</span>
                          <span className="uppercase text-[9px] tracking-widest font-mono font-black">{promptSelection1 === 'B' ? 'Правильна стратегія:' : 'Слабкий запит:'}</span>
                        </div>
                        <p className="font-medium font-display leading-relaxed">
                          {promptSelection1 === 'B' 
                            ? (activeDetail.fb1c || 'Відмінний вибір!') 
                            : (activeDetail.fb1w || 'Спробуйте інший варіант.')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* PROMPT CHOICE 2 STEP */}
                {activeStepType === 'prompt_choice_2' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="space-y-1 text-center max-w-xl mx-auto">
                      <span className="text-[10px] uppercase font-black text-vibrant-pink font-mono tracking-widest">Порівняння промптів: Частина II</span>
                      <h2 className="text-xl font-display font-black text-white">
                        {activeDetail.promptTitle2 || activeDetail.pTitle || 'Який запит кращий?'}
                      </h2>
                      {(activeDetail.promptSub2 || activeDetail.pSub) && (
                        <p className="text-xs text-slate-400">
                          {activeDetail.promptSub2 || activeDetail.pSub}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* PROMPT A */}
                      <button
                        onClick={() => setPromptSelection2('A')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 shadow-xl transition-all cursor-pointer ${
                          promptSelection2 === 'A' ? 'border-vibrant-coral bg-vibrant-coral/5 ring-1 ring-vibrant-coral' : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover'
                        }`}
                      >
                        <div className="space-y-2 w-full">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-vibrant-coral/10 text-vibrant-coral font-mono">Промпт А</span>
                          <p className="text-xs font-mono text-slate-205 bg-vibrant-dark/40 p-3 rounded-xl border border-vibrant-border/30 italic whitespace-normal leading-relaxed font-normal">
                            "{activeDetail.ccA2}"
                          </p>
                        </div>
                        <span className="w-full py-2 bg-vibrant-dark/60 border border-white/5 text-center text-[10px] font-black rounded-lg hover:text-white font-display uppercase tracking-widest">
                          {promptSelection2 === 'A' ? 'Обрано' : 'Аналізувати А'}
                        </span>
                      </button>

                      {/* PROMPT B */}
                      <button
                        onClick={() => setPromptSelection2('B')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 shadow-xl transition-all cursor-pointer ${
                          promptSelection2 === 'B' ? 'border-vibrant-emerald bg-vibrant-emerald/5 ring-1 ring-vibrant-emerald' : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover'
                        }`}
                      >
                        <div className="space-y-2 w-full">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-vibrant-emerald/10 text-vibrant-emerald font-mono">Промпт Б</span>
                          <p className="text-xs font-mono text-slate-205 bg-vibrant-dark/40 p-3 rounded-xl border border-vibrant-border/30 italic whitespace-normal leading-relaxed font-normal">
                            "{activeDetail.ccB2}"
                          </p>
                        </div>
                        <span className="w-full py-2 bg-vibrant-dark/60 border border-white/5 text-center text-[10px] font-black rounded-lg hover:text-white font-display uppercase tracking-widest">
                          {promptSelection2 === 'B' ? 'Обрано ✓' : 'Аналізувати Б'}
                        </span>
                      </button>
                    </div>

                    {promptSelection2 && (
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed font-bold animate-[fadeIn_0.2s_ease-out] ${
                        promptSelection2 === 'B' 
                          ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' 
                          : 'bg-vibrant-coral/10 border-vibrant-coral/30 text-coral-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg">{promptSelection2 === 'B' ? '🎉' : '⚠️'}</span>
                          <span className="uppercase text-[9px] tracking-widest font-mono font-black">{promptSelection2 === 'B' ? 'Правильна стратегія:' : 'Слабкий запит:'}</span>
                        </div>
                        <p className="font-medium font-display leading-relaxed">
                          {promptSelection2 === 'B' 
                            ? (activeDetail.fb4c || 'Відмінний вибір!') 
                            : (activeDetail.fb4w || 'Промпт А занадто загальний, ШІ може дофантазувати деталі.')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* SCENARIO CARDS STEP */}
                {activeStepType === 'scenario_cards' && activeDetail.scenarios && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="space-y-1 text-center max-w-xl mx-auto">
                      <span className="text-[10px] uppercase font-black text-vibrant-pink font-mono tracking-widest">Практикум</span>
                      <h2 className="text-xl font-display font-black text-white">Мій перший AI-сценарій</h2>
                      <p className="text-xs text-slate-400">Оберіть життєву задачу, щоб вивчити покроковий діалог взаємодії з ШІ:</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {activeDetail.scenarios.map((scen) => {
                        const isSelected = selectedScenarioId === scen.id || (!selectedScenarioId && activeDetail.scenarios?.[0]?.id === scen.id);
                        return (
                          <button
                            key={scen.id}
                            onClick={() => setSelectedScenarioId(scen.id)}
                            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 shadow-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'border-vibrant-pink bg-vibrant-pink/5 ring-1 ring-vibrant-pink shadow-vibrant-pink/5 outline-none'
                                : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="text-xl block">{scen.icon}</span>
                              <h3 className="text-xs font-black uppercase text-white tracking-wider">{scen.title}</h3>
                              <p className="text-[11px] text-slate-350 leading-relaxed font-normal">{scen.desc}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-vibrant-pink">
                              {isSelected ? '✓ Вибрано' : 'Дивитись кроки'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      const currentScenario = activeDetail.scenarios.find(s => s.id === (selectedScenarioId || activeDetail.scenarios?.[0]?.id));
                      if (!currentScenario) return null;

                      return (
                        <div className="p-6 bg-vibrant-card border border-vibrant-border rounded-2xl space-y-5 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                          <div className="flex items-center gap-2 border-b border-vibrant-border/50 pb-2.5">
                            <span className="text-xl">{currentScenario.icon}</span>
                            <h3 className="text-sm font-black uppercase text-white font-display tracking-wide">{currentScenario.title} — сценарій роботи:</h3>
                          </div>

                          <div className="space-y-6">
                            {currentScenario.steps.map((step, sIdx) => (
                              <div key={sIdx} className="relative flex gap-4 items-start">
                                {sIdx < currentScenario.steps.length - 1 && (
                                  <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-gradient-to-b from-vibrant-pink to-vibrant-border/30"></div>
                                )}

                                <div className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-vibrant-pink/15 text-vibrant-pink font-mono text-glow-pink font-black text-xs border border-vibrant-pink/30 shrink-0">
                                  {sIdx + 1}
                                </div>

                                <div className="space-y-2 w-full">
                                  <h4 className="text-xs font-black text-white font-display uppercase tracking-wider">{step.label}</h4>
                                  <div className="p-3.5 bg-vibrant-dark/65 border border-vibrant-border/50 rounded-xl">
                                    <pre className="text-xs font-mono text-slate-205 leading-relaxed whitespace-pre-wrap italic break-words">
                                      {step.prompt}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* REFLECTIONS STEP */}
                {activeStepType === 'reflections' && activeDetail.reflections && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] max-w-xl mx-auto">
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] uppercase font-black text-vibrant-cyan font-mono tracking-widest">Думки на подумати</span>
                      <h2 className="text-xl font-display font-black text-white">Саморефлексія після практикуму</h2>
                      <p className="text-xs text-slate-400">Оцініть свій практичний досвід. Оберіть варіант у запитаннях нижче:</p>
                    </div>

                    <div className="space-y-6">
                      {activeDetail.reflections.map((ref, idx) => {
                        const refAnswer = reflectionAnswers[idx];
                        return (
                          <div key={idx} className="p-5 bg-vibrant-card border border-vibrant-border rounded-2xl space-y-4 shadow-xl">
                            <h3 className="text-xs font-black uppercase text-white tracking-wide border-b border-vibrant-border/40 pb-2 flex gap-1.5 items-start font-display">
                              <span className="text-vibrant-cyan font-mono mr-1">Q{idx + 1}.</span>
                              <span>{ref.q}</span>
                            </h3>

                            <div className="space-y-2">
                              {ref.opts.map((opt, oIdx) => {
                                const isSelected = refAnswer === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => setReflectionAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer font-bold ${
                                      isSelected
                                        ? 'bg-vibrant-cyan/15 border-vibrant-cyan text-vibrant-cyan shadow-lg shadow-vibrant-cyan/5'
                                        : 'bg-vibrant-dark/30 border-vibrant-border/70 text-slate-205 hover:bg-vibrant-card-hover hover:border-slate-500'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    <span className="text-[9px] shrink-0 uppercase font-display bg-white/5 px-2 py-0.5 rounded text-slate-300">
                                      {isSelected ? '✓ Обрано' : 'Вибрати'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {refAnswer !== undefined && ref.fbs[refAnswer] && (
                              <div className="p-3.5 bg-vibrant-cyan/10 border border-vibrant-cyan/30 rounded-xl text-xs leading-relaxed text-cyan-200 animate-[fadeIn_0.2s_ease-out]">
                                <span className="font-mono uppercase text-[9px] tracking-wider text-vibrant-cyan font-black block mb-1">Коментар методиста:</span>
                                {ref.fbs[refAnswer]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TEMPLATES STEP */}
                {activeStepType === 'templates' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="space-y-1 text-center max-w-xl mx-auto">
                      <span className="text-[10px] uppercase font-black text-vibrant-pink font-mono tracking-widest">Конструктори</span>
                      <h2 className="text-xl font-display font-black text-white">Корисні промпт-шаблони</h2>
                      <p className="text-xs text-slate-400">Скопіюйте ці заготовки та підставте свої деталі у чат із ШІ:</p>
                    </div>

                    {activeDetail.tmpls && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {activeDetail.tmpls.map((tmp, tIdx) => {
                          return (
                            <div key={tIdx} className="p-4 bg-vibrant-card rounded-2xl border border-vibrant-border flex flex-col justify-between gap-4 shadow-xl">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{tmp.icon}</span>
                                  <h4 className="text-xs font-black text-white uppercase font-display tracking-wider">{tmp.title}</h4>
                                </div>
                                <p className="text-[11px] font-mono text-slate-300 bg-vibrant-dark/40 p-2.5 rounded-xl border border-vibrant-border/30 italic break-words leading-relaxed">
                                  "{tmp.text}"
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(tmp.text);
                                  showToast(`Шаблон «${tmp.title}» скопійовано!`, 'success');
                                }}
                                className="w-full flex items-center justify-center gap-1.5 p-2 bg-vibrant-dark hover:bg-vibrant-card-hover border border-vibrant-border rounded-xl text-[10px] font-bold text-slate-350 transition-all cursor-pointer font-display uppercase tracking-widest"
                              >
                                <Copy className="w-3.5 h-3.5 text-vibrant-pink" />
                                <span>Скопіювати шаблон</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* CH3 QUIZ STEP */}
                {activeStepType === 'ch3_quiz' && activeDetail.ch3 && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] max-w-lg mx-auto">
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] uppercase font-black text-vibrant-pink font-mono tracking-widest">Практикум</span>
                      <h2 className="text-xl font-display font-black text-white">
                        {activeDetail.pTitle || 'Аналіз та сортування занять'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {activeDetail.pSub || 'Оцініть кожне твердження: натискайте для перевірки свого вибору:'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeDetail.ch3.map((choice, cidx) => {
                        const isRevealed = quizSelectedIndices.includes(cidx);
                        const isCorrect = choice.v === 'correct';
                        const isPartial = choice.v === 'partial';

                        return (
                          <div key={cidx} className="space-y-2">
                            <button
                              onClick={() => {
                                if (!quizSelectedIndices.includes(cidx)) {
                                  setQuizSelectedIndices(prev => [...prev, cidx]);
                                }
                              }}
                              className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isRevealed
                                  ? isCorrect
                                    ? 'bg-vibrant-emerald/15 border-vibrant-emerald text-vibrant-emerald shadow-lg'
                                    : isPartial
                                    ? 'bg-vibrant-cyan/15 border-vibrant-cyan text-vibrant-cyan shadow-lg'
                                    : 'bg-vibrant-coral/15 border-vibrant-coral text-vibrant-coral shadow-lg'
                                  : 'bg-vibrant-card border-vibrant-border text-slate-200 hover:bg-vibrant-card-hover hover:border-slate-500'
                              }`}
                            >
                              <span>{choice.t}</span>
                              <span className="text-[10px] shrink-0 font-bold uppercase font-display bg-white/5 px-2.5 py-1 rounded text-slate-350">
                                {isRevealed ? (isCorrect ? '✓ Правильно' : '✗ Помилка') : 'Оцінити'}
                              </span>
                            </button>
                            {isRevealed && (
                              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-[fadeIn_0.2s_ease-out] ${
                                isCorrect ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' : 'bg-vibrant-coral/10 border-vibrant-coral/30 text-coral-200'
                              }`}>
                                {choice.fb}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CH4 QUIZ STEP */}
                {activeStepType === 'ch4_quiz' && activeDetail.ch4 && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] max-w-lg mx-auto">
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] uppercase font-black text-vibrant-cyan font-mono tracking-widest font-bold">Розумний вибір</span>
                      <h2 className="text-xl font-display font-black text-white">
                        {activeDetail.pTitle || 'Перевірка інтуїції у роботі з клієнтом'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {activeDetail.pSub || 'Натисніть на варіанти відповіді нижче:'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeDetail.ch4.map((choice, cidx) => {
                        const isRevealed = quizSelectedIndices.includes(cidx);
                        const isCorrect = choice.v === 'correct';
                        const isPartial = choice.v === 'partial';

                        return (
                          <div key={cidx} className="space-y-2">
                            <button
                              onClick={() => {
                                if (!quizSelectedIndices.includes(cidx)) {
                                  setQuizSelectedIndices(prev => [...prev, cidx]);
                                }
                              }}
                              className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isRevealed
                                  ? isCorrect
                                    ? 'bg-vibrant-emerald/15 border-vibrant-emerald text-vibrant-emerald shadow-lg'
                                    : isPartial
                                    ? 'bg-vibrant-cyan/15 border-vibrant-cyan text-vibrant-cyan shadow-lg'
                                    : 'bg-vibrant-coral/15 border-vibrant-coral text-vibrant-coral shadow-lg'
                                  : 'bg-vibrant-card border-vibrant-border text-slate-200 hover:bg-vibrant-card-hover hover:border-slate-500'
                              }`}
                            >
                              <span>{choice.t}</span>
                              <span className="text-[10px] shrink-0 font-bold uppercase font-display bg-white/5 px-2.5 py-1 rounded text-slate-350">
                                {isRevealed ? (isCorrect ? '✓ Правильно' : '✗ Помилка') : 'Оцінити'}
                              </span>
                            </button>
                            {isRevealed && (
                              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-[fadeIn_0.2s_ease-out] ${
                                isCorrect ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' : 'bg-vibrant-coral/10 border-vibrant-coral/30 text-coral-200'
                              }`}>
                                {choice.fb}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CH5 QUIZ STEP */}
                {activeStepType === 'ch5_quiz' && activeDetail.ch5 && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] max-w-lg mx-auto">
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] uppercase font-black text-vibrant-pink font-mono tracking-widest font-bold">Контроль знань</span>
                      <h2 className="text-xl font-display font-black text-white">
                        {activeDetail.pTitle || 'Виберіть правильну стратегію дії:'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {activeDetail.pSub || 'Натисніть на кожний варіант для оцінки логіки:'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeDetail.ch5.map((choice, cidx) => {
                        const isRevealed = quizSelectedIndices.includes(cidx);
                        const isCorrect = choice.v === 'correct';
                        const isPartial = choice.v === 'partial';

                        return (
                          <div key={cidx} className="space-y-2">
                            <button
                              onClick={() => {
                                if (!quizSelectedIndices.includes(cidx)) {
                                  setQuizSelectedIndices(prev => [...prev, cidx]);
                                }
                              }}
                              className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isRevealed
                                  ? isCorrect
                                    ? 'bg-vibrant-emerald/15 border-vibrant-emerald text-vibrant-emerald'
                                    : isPartial
                                    ? 'bg-vibrant-cyan/15 border-vibrant-cyan text-vibrant-cyan'
                                    : 'bg-vibrant-coral/15 border-vibrant-coral text-vibrant-coral'
                                  : 'bg-vibrant-card border-vibrant-border text-slate-200 hover:bg-vibrant-card-hover hover:border-slate-500'
                              }`}
                            >
                              <span>{choice.t}</span>
                              <span className="text-[10px] shrink-0 font-bold uppercase font-display bg-white/5 px-2.5 py-1 rounded text-slate-350">
                                {isRevealed ? (isCorrect ? '✓ Правильно' : '✗ Помилка') : 'Оцінити'}
                              </span>
                            </button>
                            {isRevealed && (
                              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-[fadeIn_0.2s_ease-out] ${
                                isCorrect ? 'bg-vibrant-emerald/10 border-vibrant-emerald/30 text-emerald-200' : 'bg-vibrant-coral/10 border-vibrant-coral/30 text-coral-200'
                              }`}>
                                {choice.fb}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SIMULATOR STEP */}
                {activeStepType === 'simulator' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] max-w-md mx-auto">
                    <div className="space-y-1 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-vibrant-pink bg-vibrant-pink/10 border border-vibrant-pink/20 tracking-widest font-mono">Симулятор</span>
                      <h2 className="text-xl font-display font-black text-white mt-2">Практичний пульт навчання</h2>
                      <p className="text-xs text-slate-400">Виконайте інтерактивну справу на пульті нижче, щоб завершити блок:</p>
                    </div>

                    <PlaygroundWidget 
                      lessonId={currentLessonId} 
                      role={userRole || 'curious'} 
                      onTaskPassed={() => {
                        setPlaygroundSolved(true);
                        showToast("Чудово! Практичне завдання симулятора успішно виконане. Продовжуйте крок!", "success");
                      }}
                    />

                    <div className="p-4 bg-vibrant-card/85 border border-vibrant-border rounded-2xl space-y-1 text-center shadow-lg">
                      <p className="text-xs font-black text-vibrant-pink font-display uppercase">Вказівка для завершення:</p>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
                        Виконайте дії у вікні вище. Після завантаження симуляції ви зможете перейти на фінальний крок та підтвердити проходження уроку.
                      </p>
                    </div>
                  </div>
                )}

                {/* QUIZ STEP */}
                {activeStepType === 'quiz' && (
                  <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] max-w-lg mx-auto">
                    {/* Diagnostic Quiz block */}
                    {activeDetail.quiz && (
                      <div className="bg-vibrant-card p-5 rounded-2xl border border-vibrant-border space-y-4 shadow-xl">
                        <div className="space-y-1.5 text-center">
                          <span className="text-[9px] tracking-widest uppercase text-slate-500 font-black font-mono">Перевірка</span>
                          <h3 className="text-sm font-display font-black text-white leading-relaxed">
                            {activeDetail.quiz.q}
                          </h3>
                        </div>

                        <div className="space-y-2">
                          {activeDetail.quiz.opts.map((opt, oidx) => {
                            const isSelected = quizAnswer === oidx;
                            const isCorrect = oidx === activeDetail.quiz?.correct;

                            return (
                              <button
                                key={oidx}
                                onClick={() => {
                                  setQuizAnswer(oidx);
                                  if (isCorrect) {
                                    showToast('Сертифікат верифікації пройдено! Кнопка «Урок пройдено» тепер доступна.', 'success');
                                  } else {
                                    showToast('Невірно! Прочитайте матеріали кроків вище та спробуйте іншу відповідь.', 'error');
                                  }
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                  isSelected
                                    ? isCorrect
                                      ? 'bg-vibrant-emerald/15 border-vibrant-emerald text-vibrant-emerald'
                                      : 'bg-vibrant-coral/15 border-vibrant-coral text-vibrant-coral'
                                    : 'bg-vibrant-dark border-vibrant-border text-slate-200 hover:bg-vibrant-card-hover hover:border-slate-600'
                                }`}
                              >
                                <span>{opt}</span>
                                <span className="text-[10px] shrink-0 font-bold uppercase font-display bg-white/5 px-2 py-0.5 rounded text-slate-300">
                                  {isSelected ? (isCorrect ? '✓ Правильно' : '✗ Помилка') : 'Обрати'}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {quizAnswer !== null && (
                          <div className={`p-3 rounded-xl border text-xs leading-relaxed text-center font-bold animate-[fadeIn_0.2s_ease-out] ${
                            quizAnswer === activeDetail.quiz.correct 
                              ? 'bg-vibrant-emerald/15 border-vibrant-emerald/30 text-vibrant-emerald' 
                              : 'bg-vibrant-coral/15 border-vibrant-coral/30 text-vibrant-coral'
                          }`}>
                            {quizAnswer === activeDetail.quiz.correct 
                              ? '🎉 Правильний вибір! Ви успішно засвоїли матеріал цього заняття.' 
                              : '⚠️ Невірно. ШІ вимагає чіткості та раціональності в діях. Спробуйте ще раз!'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lesson summary block */}
                    {isLComplete && (
                      <div className="p-4 bg-gradient-to-tr from-vibrant-emerald/20 to-transparent border border-vibrant-emerald/20 text-vibrant-emerald rounded-2xl text-center text-xs font-bold space-y-1">
                        <p>⭐️ Ви вже вивчали цей урок раніше!</p>
                        <p className="text-[10px] text-slate-450 font-normal">Ви можете перечитати його для оновлення знань.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Bottom steps navigator elements */}
              <div className="pt-6 border-t border-vibrant-border/65 flex items-center justify-between gap-4 animate-[fadeIn_0.2s_ease-out]">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    currentStep === 0 
                      ? 'border-transparent text-slate-700 cursor-not-allowed' 
                      : 'border-vibrant-border bg-vibrant-card hover:bg-vibrant-card-hover text-slate-205'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>

                {currentStep < totalSteps - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-vibrant-card hover:bg-vibrant-card-hover border border-vibrant-border active:scale-95 text-xs font-black text-vibrant-pink rounded-xl transition-all cursor-pointer font-display uppercase tracking-wider"
                  >
                    <span>Далі</span>
                    <ChevronRight className="w-4 h-4 text-vibrant-pink" />
                  </button>
                ) : (
                  <button
                    onClick={finishLesson}
                    disabled={
                      activeStepType === 'quiz' 
                        ? quizAnswer !== activeDetail.quiz?.correct 
                        : activeStepType === 'simulator' 
                        ? !playgroundSolved 
                        : false
                    }
                    className={`px-6 py-3 text-xs font-black rounded-xl transition-all shadow-xl active:scale-95 flex items-center gap-1 cursor-pointer font-display uppercase tracking-widest ${
                      (activeStepType === 'quiz' && quizAnswer === activeDetail.quiz?.correct) || 
                      (activeStepType === 'simulator' && playgroundSolved) || 
                      (!activeDetail.quiz && activeStepType !== 'simulator')
                        ? 'bg-gradient-to-r from-vibrant-coral via-vibrant-pink to-vibrant-purple text-white shadow-vibrant-pink/20 shadow-lg cursor-pointer'
                        : 'bg-vibrant-card border border-vibrant-border text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Урок пройдено ✓</span>
                  </button>
                )}
              </div>

            </section>
          )}

        </main>
      </div>

      {/* Glossary Modal Overlay */}
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />

      {/* Success Celebration modal overlay on finishing Lesson */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-vibrant-card max-w-sm w-full border border-vibrant-border p-6 rounded-3xl space-y-6 shadow-[0_0_50px_rgba(255,20,147,0.15)] text-center">
            
            {/* Sparkles or Star Icon */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-vibrant-pink/10 rounded-full border border-vibrant-pink/35 shadow-[0_0_20px_rgba(255,20,147,0.1)] text-4xl mb-1 mx-auto animate-[bounce_1s_infinite]">
              ⭐️
              <Sparkles className="w-6 h-6 text-vibrant-cyan absolute -top-1 -right-1 animate-pulse" />
              <Sparkle className="w-5 h-5 text-vibrant-amber absolute -bottom-1 -left-1 animate-spin" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-vibrant-pink tracking-widest font-black block">Блискуче завершення!</span>
              <h2 className="text-xl font-display font-black text-white">Вітаємо з перемогою! 🎉</h2>
              <p className="text-xs text-slate-350 leading-relaxed max-w-xs mx-auto">
                Ви успішно вивчили матеріал та виконали всі практичні кейси уроку <strong className="text-white">«{lessonBrief.title}»</strong>. Ваша колекція зірок поповнилась ще однією зіркою вивчення!
              </p>
              <p className="text-[10.5px] text-vibrant-pink font-bold mt-1 max-w-xs mx-auto leading-relaxed">
                {getNextLessonId() 
                  ? "👉 Натисніть «Наступний урок» нижче, щоб автоматично продовжити курс, або поверніться в кабінет."
                  : "🏆 Ви блискуче пройшли весь маршрут! Будь ласка, поверніться в особистий кабінет."}
              </p>
            </div>

            {/* Custom Divider */}
            <div className="border-t border-vibrant-border/50 py-1"></div>

            <div className="flex flex-col gap-2.5">
              {getNextLessonId() ? (
                <button
                  onClick={() => {
                    const nextId = getNextLessonId();
                    if (nextId) {
                      openLesson(nextId);
                      setShowCelebration(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-vibrant-coral via-vibrant-pink to-vibrant-purple hover:opacity-95 text-xs font-black text-white rounded-xl shadow-xl hover:shadow-vibrant-pink/20 transition-all font-display uppercase tracking-widest cursor-pointer"
                >
                  <span>Наступний урок →</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              ) : (
                <div className="p-3 bg-vibrant-emerald/10 border border-vibrant-emerald/20 rounded-xl mb-1 text-center">
                  <span className="text-xs font-black text-vibrant-emerald font-display block uppercase">🏆 Повний тріумф!</span>
                  <p className="text-[10.5px] text-slate-350 mt-1">Ви повністю завершили вашу навчальну траєкторію! Неймовірний результат!</p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowCelebration(false);
                  setActiveView('dashboard');
                }}
                className="w-full p-3 bg-vibrant-dark hover:bg-vibrant-card-hover border border-vibrant-border text-xs font-bold text-slate-300 rounded-xl transition-all cursor-pointer font-display uppercase tracking-wider"
              >
                Повернутись до кабінету
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-vibrant-border/50 bg-vibrant-dark/95 py-6 text-center text-slate-450 mt-auto">
        <p className="text-xs font-mono">BETA © 2026 Лекторій «BasicAI». Побудовано для здорового та безпечного вивчення технологій.</p>
        <p className="text-[10px] text-slate-500 tracking-widest mt-1 uppercase font-black font-display">Розумне майбутнє в руках людей</p>
      </footer>
    </div>
  );
}
