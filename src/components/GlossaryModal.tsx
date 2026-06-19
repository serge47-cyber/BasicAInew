import React, { useState } from 'react';
import { X, Search, BookOpen, Lightbulb, HelpCircle, AlertTriangle, Zap, Tag } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  termEn?: string;
  category: 'basics' | 'prompting' | 'safety' | 'advanced';
  definition: string;
  analogy: string;
  example: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Промпт",
    termEn: "Prompt",
    category: "prompting",
    definition: "Запит, інструкція або вказівка, яку ви даєте штучному інтелекту, щоб отримати відповідь. Це мова спілкування з ШІ.",
    analogy: "Це як детальний рецепт для професійного шеф-кухаря або конкретне ТЗ для вашого асистента.",
    example: "«Напиши три ідеї для вечері без м'яса за 15 хвилин» замість «що приготувати?»."
  },
  {
    term: "Галюцинація",
    termEn: "Hallucination",
    category: "safety",
    definition: "Явище, коли модель з упевненим виглядом вигадує факти, цитати, історичні події або цифри, яких ніколи не існувало.",
    analogy: "Немов дитина, яка щиро вірить у вигадану нею казку і розповідає її дорослим як реальні новини.",
    example: "Коли ви просите ШІ написати біографію вашого сусіда, а він додає туди неіснуючі вищі освіти та дві премії Оскар."
  },
  {
    term: "Нейромережа",
    termEn: "Neural Network",
    category: "basics",
    definition: "Комп'ютерна програма, алгоритми якої імітують роботу біологічного людського мозку (зв'язків між нейронами) для підвищення інтелектуального аналізу даних.",
    analogy: "Величезний колектив фахівців у кімнаті: кожен вміє робити лише одну дрібну функцію, але разом вони можуть розпізнати будь-який складний об'єкт.",
    example: "Системи розпізнавання облич у смартфонах, автопілот у машинах або аналіз томографії в медицині."
  },
  {
    term: "Контекст (Контекстне вікно)",
    termEn: "Context Window",
    category: "basics",
    definition: "Обсяг інформації (кількість символів чи слів), яку ШІ здатен утримати у «короткочасній пам'яті» під час поточного діалогу.",
    analogy: "Ваш робочий стіл: що він більший, то більше папок та документів ви можете тримати відкритими перед очима одночасно.",
    example: "Завантажуючи цілу книгу і ставлячи питання по ній, потрібно пересвідчитись, що її обсяг не перевищує контекстне вікно моделі (інакше вона «забуде» початок)."
  },
  {
    term: "Мультимодальність",
    termEn: "Multimodality",
    category: "basics",
    definition: "Здатність сучасної моделі штучного інтелекту працювати одночасно з різними типами вхідних та вихідних форматів даних (текст, голос, фотографії, відео чи програмний код).",
    analogy: "Людина, яка одночасно бачить картинку у книзі, чує коментарі колеги та робить записи в зошит.",
    example: "Надіслати фото полагодженого велосипеда у Gemini і запитати голосом: «Скажи, чи правильно я встановив ланцюг?»."
  },
  {
    term: "Токени",
    termEn: "Tokens",
    category: "advanced",
    definition: "Микроскопічні склади, частини слів чи комбінації симфолів, на які ШІ розбиває весь опрацьований текст для математичного кодування даних.",
    analogy: "Деталі конструктора LEGO: ми бачимо цілий замок, а модель складає і розбирає його на окремі кубики.",
    example: "Запит «Привіт, ШІ» складається з декількох токенів. Ліміти на використання ШІ часто рахуються саме в токенах."
  },
  {
    term: "Донавчання",
    termEn: "Fine-tuning",
    category: "advanced",
    definition: "Додаткове тренування вже наявної, готової базової моделі ШІ на дуже вузькому та спеціалізованому колі корпоративних або специфічних даних.",
    analogy: "Навчання випускника медичного університету за спеціальністю нейрохірург на базі конкретної лікарні.",
    example: "Приватний банк бере загальну модель Gemini та донавчає її виключно на власних внутрішніх регламентах підтримки клієнтів."
  },
  {
    term: "Глибоке навчання",
    termEn: "Deep Learning",
    category: "basics",
    definition: "Метод машинного навчання, заснований на багатошарових нейромережах, які автоматично виявляють складні закономірності в сирих даних без прямої допомоги програміста.",
    analogy: "Багатоступеневий фільтр для води: кожна секція очищує дрібніші деталі, поки на виході не вийде чистий результат.",
    example: "Створення зображень за текстовим описом — модель вчиться у мільйонах прикладів розуміти, що означає «кіт на пляжі»."
  },
  {
    term: "Штучний Загальний Інтелект",
    termEn: "AGI / Artificial General Intelligence",
    category: "basics",
    definition: "Гіпотетична форма ШІ майбутнього, яка здатна зрозуміти, навчитися та професійно виконати БУДЬ-ЯКЕ інтелектуальне завдання так само чи краще за звичайну людину.",
    analogy: "Як супер-універсальний розум, універсальний винахідник, який вміє керувати авто, писати симфонії, жартувати та розробляти нові ліки автономно.",
    example: "Моделі, які самі створюють нові теорії фізики або повністю керують корпорацією без втручання людини (поки не існує в природі)."
  },
  {
    term: "Прикладна модель (Вузький ШІ)",
    termEn: "Narrow AI",
    category: "basics",
    definition: "Система штучного інтелекту, спроєктована виключно для виконання одного конкретного, вузького завдання.",
    analogy: "Прекрасний електронний калькулятор або шаховий робот: грає фантастично, але не зможе зварити вам каву чи підказати погоду.",
    example: "ШІ-перекладач Google Translate, алгоритм рекомендацій у TikTok або фільтр спаму в пошті."
  }
];

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'prompting' | 'safety' | 'advanced'>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Всі терміни', icon: BookOpen },
    { id: 'basics', label: 'Основи ШІ', icon: Zap },
    { id: 'prompting', label: 'Промптинг', icon: Lightbulb },
    { id: 'safety', label: 'Безпека й ризики', icon: AlertTriangle },
    { id: 'advanced', label: 'Просунуті', icon: Tag },
  ];

  const filteredTerms = GLOSSARY_TERMS.filter(term => {
    const matchesSearch = 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.termEn && term.termEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || term.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div 
        id="glossary_modal_container"
        className="w-full max-w-4xl max-h-[85vh] md:max-h-[80vh] flex flex-col bg-vibrant-card border border-vibrant-border rounded-3xl overflow-hidden shadow-2xl shadow-vibrant-pink/10 animate-[scaleIn_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="p-5 border-b border-vibrant-border/50 bg-vibrant-dark/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vibrant-pink/15 flex items-center justify-center text-vibrant-pink border border-vibrant-pink/20">
              <BookOpen className="w-5 h-5 text-glow-pink" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white">Глосарій термінів ШІ</h2>
              <p className="text-xs text-slate-400">Короткий путівник основними поняттями у простій формі</p>
            </div>
          </div>
          <button 
            id="glossary_close_btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-vibrant-card-hover rounded-xl border border-transparent hover:border-vibrant-border transition-all active:scale-95 cursor-pointer"
            title="Закрити глосарій"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search toolbar */}
        <div className="p-4 bg-vibrant-dark/25 border-b border-vibrant-border/30 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4 shrink-0">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  id={`glossary_cat_btn_${cat.id}`}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg border transition-all active:scale-95 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-vibrant-coral via-vibrant-pink to-vibrant-purple text-white border-transparent shadow-md'
                      : 'bg-vibrant-card border-vibrant-border text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <input 
              id="glossary_search_input"
              type="text"
              placeholder="Пошук термінів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-vibrant-dark text-white text-xs border border-vibrant-border rounded-xl focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/30 placeholder-slate-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Glossary Terms List */}
        <div className="flex-grow overflow-y-auto p-5 md:p-6 space-y-4 max-h-[calc(85vh-200px)] min-h-[250px]">
          {filteredTerms.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTerms.map((t, idx) => (
                <div 
                  key={idx}
                  id={`glossary_term_card_${idx}`}
                  className="p-5 bg-vibrant-dark/30 rounded-2xl border border-vibrant-border/60 hover:border-vibrant-border hover:bg-vibrant-card-hover/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-vibrant-border/30 pb-2">
                      <h3 className="text-sm font-display font-black text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-vibrant-pink animate-pulse"></span>
                        {t.term}
                      </h3>
                      {t.termEn && (
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider bg-vibrant-dark/50 px-2 py-0.5 rounded-md border border-vibrant-border/50">
                          {t.termEn}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">{t.definition}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-vibrant-border/20 space-y-2.5">
                    {/* Analogy */}
                    <div className="bg-vibrant-pink/5 hover:bg-vibrant-pink/10 p-2.5 rounded-xl border border-vibrant-pink/10 transition-colors">
                      <div className="flex items-center gap-1 text-[9px] font-black text-vibrant-pink uppercase tracking-widest leading-none mb-1">
                        <HelpCircle className="w-3 h-3 text-vibrant-pink" />
                        <span>ЖИТТЄВА АНАЛОГІЯ</span>
                      </div>
                      <p className="text-[11px] text-slate-350 italic leading-relaxed">{t.analogy}</p>
                    </div>

                    {/* Example */}
                    <div className="bg-vibrant-cyan/5 hover:bg-vibrant-cyan/10 p-2.5 rounded-xl border border-vibrant-cyan/10 transition-colors">
                      <div className="flex items-center gap-1 text-[9px] font-black text-vibrant-cyan uppercase tracking-widest leading-none mb-1">
                        <Lightbulb className="w-3 h-3 text-vibrant-cyan" />
                        <span>ПРИКЛАД</span>
                      </div>
                      <p className="text-[11px] text-slate-350 italic leading-relaxed font-mono">
                        {t.example}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-sm font-semibold">Жодних термінів не знайдено за запитом «{searchQuery}»</p>
              <p className="text-xs text-slate-500">Спробуйте інше слово або змініть категорію фільтра</p>
              <button 
                id="reset_glossary_search"
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-4 py-2 bg-vibrant-dark hover:bg-vibrant-card-hover text-xs font-bold text-slate-300 rounded-xl border border-vibrant-border cursor-pointer transition-all"
              >
                Скинути пошук
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-vibrant-border/50 bg-vibrant-dark/50 text-center shrink-0">
          <p className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">
            «ШІ ДЛЯ ВСІХ» — НАВЧАЙТЕСЯ ЛЕГКО Й ПРАКТИЧНО ⭐️
          </p>
        </div>
      </div>
    </div>
  );
};
