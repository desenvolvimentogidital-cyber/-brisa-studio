import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useEditor } from '../../context/EditorContext';
import {
  DOCUMENTATION_CATEGORIES,
  DocArticle,
  searchArticles,
  getArticleById,
  getRelatedArticles,
  getFavorites,
  toggleFavorite,
  getRecentAccess,
  addRecentAccess,
  COURSES,
  CHALLENGES,
  INSPIRATION_PROJECTS,
  KEYBOARD_SHORTCUTS,
  VERSION_UPDATES,
  getCourseProgress,
  completeLesson,
  getChallengeProgress,
  completeChallenge,
  getArticleFeedback,
  setArticleFeedback,
  Course,
  Challenge,
} from '../../constants/documentationData';
import {
  Search, X, Star, Clock, ChevronRight, ChevronLeft, BookOpen, Heart, Menu, ArrowLeft,
  Sparkles, GraduationCap, Trophy, Lightbulb, Keyboard, Rocket, MessageSquare, ThumbsUp, ThumbsDown,
  Play, Code, Database, Zap, Globe, Smartphone, Palette, Layers, Layout, Settings, Users,
  CheckCircle, Circle, Lock, Award, Target, Flag, ExternalLink, Download, Eye,
} from 'lucide-react';

type DocTab = 'docs' | 'academy' | 'challenges' | 'inspiration' | 'shortcuts' | 'updates';

interface DocumentationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialArticleId?: string;
  initialTab?: DocTab;
}

export const DocumentationCenter: React.FC<DocumentationCenterProps> = ({
  isOpen,
  onClose,
  initialArticleId,
  initialTab = 'docs',
}) => {
  const { theme, setIsDocumentationOpen, setDocumentationArticleId } = useEditor();
  const [activeTab, setActiveTab] = useState<DocTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [recentAccess, setRecentAccess] = useState<string[]>(getRecentAccess());
  const [showWelcomeWalkthrough, setShowWelcomeWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeStep, setChallengeStep] = useState(0);
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>(getCourseProgress());
  const [challengeProgress, setChallengeProgress] = useState<string[]>(getChallengeProgress());
  const [articleFeedback, setArticleFeedbackState] = useState<Record<string, 'up' | 'down'>>(getArticleFeedback());
  const [inspirationFilter, setInspirationFilter] = useState<string>('all');
  const [shortcutSearch, setShortcutSearch] = useState('');
  const [showExperiment, setShowExperiment] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (initialArticleId) {
      const article = getArticleById(initialArticleId);
      if (article) {
        setSelectedArticle(article);
        setSelectedCategory(article.category);
        addRecentAccess(article.id);
        setRecentAccess(getRecentAccess());
      }
    }
  }, [initialArticleId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchArticles(searchQuery);
  }, [searchQuery]);

  const relatedArticles = selectedArticle
    ? getRelatedArticles(selectedArticle.id)
    : [];

  const favoriteArticles = useMemo(() => {
    return favorites
      .map(id => getArticleById(id))
      .filter((a): a is DocArticle => a !== undefined);
  }, [favorites]);

  const recentArticles = useMemo(() => {
    return recentAccess
      .map(id => getArticleById(id))
      .filter((a): a is DocArticle => a !== undefined);
  }, [recentAccess]);

  const filteredShortcuts = useMemo(() => {
    if (!shortcutSearch) return KEYBOARD_SHORTCUTS;
    const q = shortcutSearch.toLowerCase();
    return KEYBOARD_SHORTCUTS.filter(s =>
      s.key.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.keys.some(k => k.toLowerCase().includes(q))
    );
  }, [shortcutSearch]);

  const filteredInspiration = useMemo(() => {
    if (inspirationFilter === 'all') return INSPIRATION_PROJECTS;
    return INSPIRATION_PROJECTS.filter(p => p.category === inspirationFilter);
  }, [inspirationFilter]);

  const inspirationCategories = useMemo(() => {
    const cats = new Set(INSPIRATION_PROJECTS.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const handleSelectArticle = (article: DocArticle) => {
    setSelectedArticle(article);
    setSelectedCategory(article.category);
    addRecentAccess(article.id);
    setRecentAccess(getRecentAccess());
    setSearchQuery('');
  };

  const handleToggleFavorite = (articleId: string) => {
    const newFavorites = toggleFavorite(articleId);
    setFavorites(newFavorites);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  const handleExperiment = (article: DocArticle) => {
    setShowExperiment(true);
    if (article.experimentAction === 'openCanvas') {
      // Switch to visual mode
    } else if (article.experimentAction === 'openCodeEditor') {
      // Switch to code mode
    } else if (article.experimentAction === 'openNoCode') {
      // Switch to nocode mode
    } else if (article.experimentAction === 'openDatabase') {
      // Switch to database mode
    } else if (article.experimentAction === 'openExport') {
      // Open export modal
    } else if (article.experimentAction === 'newProject') {
      // Create new project
    } else if (article.experimentAction === 'addComponent') {
      // Add component to canvas
    } else if (article.experimentAction === 'demoAutoLayout') {
      // Demo auto layout
    } else if (article.experimentAction === 'startTutorial') {
      // Start tutorial
    } else if (article.experimentAction === 'loadTemplate') {
      // Load template
    }
    onClose();
  };

  const handleLessonComplete = (courseId: string, lessonId: string) => {
    const progress = completeLesson(courseId, lessonId);
    setCourseProgress(progress);
  };

  const handleChallengeComplete = (challengeId: string) => {
    const progress = completeChallenge(challengeId);
    setChallengeProgress(progress);
  };

  const handleArticleFeedback = (articleId: string, type: 'up' | 'down') => {
    const feedback = setArticleFeedback(articleId, type);
    setArticleFeedbackState(feedback);
  };

  const walkthroughSteps = [
    { title: 'Bem-vindo ao Mobile Studio!', description: 'Vamos te guiar pelos principais recursos da plataforma.', icon: '🎉', action: 'next' },
    { title: 'Editor Visual', description: 'Esta é a área principal. Arraste componentes do painel esquerdo para o canvas.', icon: '🎨', action: 'highlightCanvas' },
    { title: 'Painel de Componentes', description: 'Aqui você encontra todos os componentes disponíveis: botões, textos, imagens, containers e muito mais.', icon: '📦', action: 'highlightLeftPanel' },
    { title: 'Painel de Propriedades', description: 'Selecione um componente e ajuste suas propriedades aqui: cores, tamanhos, fontes, interações.', icon: '⚙️', action: 'highlightRightPanel' },
    { title: 'Modos de Desenvolvimento', description: 'Alterne entre Visual, Código, No-Code, Dados, Segurança e Notificações.', icon: '🔄', action: 'highlightModes' },
    { title: 'Pronto para criar!', description: 'Agora você já conhece o básico. Que tal criar seu primeiro projeto?', icon: '🚀', action: 'finish' },
  ];

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mb-3 mt-1">{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold mb-2 mt-4 text-blue-400">{line.replace('## ', '')}</h2>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold mb-1">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-xs mb-0.5 list-disc">{line.replace('- ', '')}</li>;
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') || line.startsWith('7. ') || line.startsWith('8. ') || line.startsWith('9. ') || line.startsWith('10. ')) {
        return <li key={i} className="ml-4 text-xs mb-0.5 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
      }
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      return <p key={i} className="text-xs mb-1.5 leading-relaxed">{line}</p>;
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'docs' as DocTab, label: 'Documentação', icon: BookOpen },
    { id: 'academy' as DocTab, label: 'Academia', icon: GraduationCap },
    { id: 'challenges' as DocTab, label: 'Desafios', icon: Trophy },
    { id: 'inspiration' as DocTab, label: 'Inspiração', icon: Lightbulb },
    { id: 'shortcuts' as DocTab, label: 'Atalhos', icon: Keyboard },
    { id: 'updates' as DocTab, label: 'Novidades', icon: Rocket },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex ${isDark ? 'bg-slate-950/80' : 'bg-slate-100/80'} backdrop-blur-sm`}>
      <div className={`flex w-full h-full ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Sidebar */}
        {showSidebar && activeTab === 'docs' && (
          <div className={`w-64 border-r ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'} flex flex-col shrink-0`}>
            <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <h2 className="font-bold text-xs">Documentation Center</h2>
                </div>
                <button onClick={() => setShowSidebar(false)} className={`p-1 rounded ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Pesquisar..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} outline-none focus:border-blue-500 transition`} />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400" /></button>}
              </div>
            </div>

            {searchQuery.trim() ? (
              <div className="flex-1 overflow-y-auto p-2">
                <p className="text-[10px] text-slate-400 mb-1.5">{searchResults.length} resultado(s)</p>
                {searchResults.map(article => (
                  <button key={article.id} onClick={() => handleSelectArticle(article)}
                    className={`w-full text-left p-2 rounded-lg mb-0.5 text-[11px] transition ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} ${selectedArticle?.id === article.id ? (isDark ? 'bg-blue-500/20' : 'bg-blue-50') : ''}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{article.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{article.title}</p>
                        <p className="text-slate-400 truncate">{article.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                {recentArticles.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1.5"><Clock className="w-3 h-3 text-slate-400" /><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Últimos Acessos</p></div>
                    {recentArticles.map(article => (
                      <button key={article.id} onClick={() => handleSelectArticle(article)}
                        className={`w-full text-left p-1.5 rounded mb-0.5 text-[11px] transition ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                        <span className="mr-1">{article.icon}</span>{article.title}
                      </button>
                    ))}
                  </div>
                )}
                {favoriteArticles.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1.5"><Star className="w-3 h-3 text-amber-400" /><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Favoritos</p></div>
                    {favoriteArticles.map(article => (
                      <button key={article.id} onClick={() => handleSelectArticle(article)}
                        className={`w-full text-left p-1.5 rounded mb-0.5 text-[11px] transition ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                        <span className="mr-1">{article.icon}</span>{article.title}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Categorias</p>
                {DOCUMENTATION_CATEGORIES.map(cat => (
                  <div key={cat.id} className="mb-1.5">
                    <button onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                      className={`w-full text-left p-1.5 rounded text-[11px] font-medium transition flex items-center justify-between ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} ${selectedCategory === cat.id ? (isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600') : ''}`}>
                      <span><span className="mr-1">{cat.icon}</span>{cat.title}</span>
                      <ChevronRight className={`w-2.5 h-2.5 transition ${selectedCategory === cat.id ? 'rotate-90' : ''}`} />
                    </button>
                    {selectedCategory === cat.id && (
                      <div className="ml-3 mt-0.5 space-y-0.5">
                        {cat.articles.map(article => (
                          <button key={article.id} onClick={() => handleSelectArticle(article)}
                            className={`w-full text-left p-1 rounded text-[11px] transition ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} ${selectedArticle?.id === article.id ? (isDark ? 'text-blue-300' : 'text-blue-600') : ''}`}>
                            {article.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1">
              {!showSidebar && activeTab === 'docs' && (
                <button onClick={() => setShowSidebar(true)} className={`p-1 rounded ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                  <Menu className="w-3.5 h-3.5" />
                </button>
              )}
              {selectedArticle && activeTab === 'docs' && (
                <button onClick={handleBack} className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  <ArrowLeft className="w-3 h-3" /> Voltar
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedArticle(null); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition ${activeTab === tab.id ? (isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600') : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>
                  <tab.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
              <button onClick={onClose} className={`p-1 rounded ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* DOCS TAB */}
            {activeTab === 'docs' && (
              selectedArticle ? (
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{selectedArticle.icon}</span>
                    <div>
                      <h1 className="text-lg font-bold">{selectedArticle.title}</h1>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedArticle.description}</p>
                    </div>
                  </div>

                  {/* Experiment Button */}
                  {selectedArticle.experimentAction && (
                    <button onClick={() => handleExperiment(selectedArticle)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold mb-3 transition shadow-md">
                      <Play className="w-3 h-3 fill-current" /> Experimentar
                    </button>
                  )}

                  <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} leading-relaxed text-[13px]`}>
                    {renderMarkdown(selectedArticle.content)}
                  </div>

                  {/* Article Feedback */}
                  <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} flex items-center justify-between`}>
                    <p className="text-[11px] text-slate-400">Este artigo ajudou?</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleArticleFeedback(selectedArticle.id, 'up')}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${articleFeedback[selectedArticle.id] === 'up' ? 'bg-emerald-500/20 text-emerald-400' : (isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500')}`}>
                        <ThumbsUp className="w-3 h-3" /> Sim
                      </button>
                      <button onClick={() => handleArticleFeedback(selectedArticle.id, 'down')}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${articleFeedback[selectedArticle.id] === 'down' ? 'bg-red-500/20 text-red-400' : (isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500')}`}>
                        <ThumbsDown className="w-3 h-3" /> Não
                      </button>
                    </div>
                  </div>

                  {/* Related Articles */}
                  {relatedArticles.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xs font-semibold mb-2">Artigos Relacionados</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {relatedArticles.map(article => (
                          <button key={article.id} onClick={() => handleSelectArticle(article)}
                            className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] transition ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}>
                            <span className="text-base">{article.icon}</span>
                            <div className="text-left"><p className="font-medium">{article.title}</p><p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{article.description}</p></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h1 className="text-xl font-bold mb-1">Documentation Center</h1>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Aprenda tudo sobre o Mobile Studio</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {DOCUMENTATION_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); handleSelectArticle(cat.articles[0]); }}
                        className={`p-3 rounded-xl text-left transition border ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50'}`}>
                        <span className="text-xl mb-1 block">{cat.icon}</span>
                        <h3 className="font-semibold text-xs mb-0.5">{cat.title}</h3>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cat.description}</p>
                        <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cat.articles.length} artigo(s)</p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ACADEMY TAB */}
            {activeTab === 'academy' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <GraduationCap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h1 className="text-xl font-bold mb-1">Academia Mobile Studio</h1>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cursos organizados por nível de conhecimento</p>
                </div>

                {selectedCourse ? (
                  <div>
                    <button onClick={() => setSelectedCourse(null)} className={`flex items-center gap-1 text-[11px] mb-3 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                      <ArrowLeft className="w-3 h-3" /> Voltar aos cursos
                    </button>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} mb-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{selectedCourse.icon}</span>
                        <div>
                          <h2 className="text-base font-bold">{selectedCourse.title}</h2>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedCourse.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${selectedCourse.level === 'basic' ? 'bg-emerald-500/20 text-emerald-400' : selectedCourse.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                          {selectedCourse.level === 'basic' ? 'Básico' : selectedCourse.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </span>
                        <span>{selectedCourse.estimatedTime}</span>
                        <span>{selectedCourse.lessons.length} aulas</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {selectedCourse.lessons.map((lesson, idx) => {
                        const isCompleted = courseProgress[selectedCourse.id]?.includes(lesson.id);
                        return (
                          <div key={lesson.id} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-400" />}
                              <div>
                                <p className="text-xs font-medium">{lesson.title}</p>
                                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{lesson.description} · {lesson.duration}</p>
                              </div>
                            </div>
                            <button onClick={() => {
                              const article = getArticleById(lesson.articleId);
                              if (article) handleSelectArticle(article);
                              handleLessonComplete(selectedCourse.id, lesson.id);
                            }}
                              className={`text-[10px] px-2 py-1 rounded ${isCompleted ? 'text-emerald-400' : (isDark ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-50')}`}>
                              {isCompleted ? 'Concluído' : 'Iniciar'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {courseProgress[selectedCourse.id]?.length === selectedCourse.lessons.length && (
                      <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                        <Award className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-emerald-400">Curso Concluído! 🎉</p>
                        <p className="text-[10px] text-slate-400">Certificado interno disponível</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COURSES.map(course => {
                      const completed = courseProgress[course.id]?.length || 0;
                      const total = course.lessons.length;
                      const pct = Math.round((completed / total) * 100);
                      return (
                        <button key={course.id} onClick={() => setSelectedCourse(course)}
                          className={`p-4 rounded-xl text-left transition border ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{course.icon}</span>
                            <div>
                              <h3 className="font-semibold text-xs">{course.title}</h3>
                              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{course.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${course.level === 'basic' ? 'bg-emerald-500/20 text-emerald-400' : course.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                              {course.level === 'basic' ? 'Básico' : course.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                            </span>
                            <span>{course.estimatedTime}</span>
                            <span>{total} aulas</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{completed}/{total} concluídas ({pct}%)</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CHALLENGES TAB */}
            {activeTab === 'challenges' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h1 className="text-xl font-bold mb-1">Desafios</h1>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Teste suas habilidades com desafios práticos</p>
                </div>

                {selectedChallenge ? (
                  <div>
                    <button onClick={() => setSelectedChallenge(null)} className={`flex items-center gap-1 text-[11px] mb-3 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                      <ArrowLeft className="w-3 h-3" /> Voltar aos desafios
                    </button>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} mb-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{selectedChallenge.icon}</span>
                        <div>
                          <h2 className="text-base font-bold">{selectedChallenge.title}</h2>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedChallenge.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${selectedChallenge.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' : selectedChallenge.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {selectedChallenge.difficulty === 'easy' ? 'Fácil' : selectedChallenge.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedChallenge.steps.map((step, idx) => {
                        const isCurrentStep = challengeStep === idx;
                        const isCompleted = idx < challengeStep;
                        return (
                          <div key={step.id} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} ${isCurrentStep ? 'ring-1 ring-blue-500' : ''}`}>
                            <div className="flex items-start gap-2">
                              {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> : <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0 ${isCurrentStep ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{idx + 1}</div>}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{step.description}</p>
                                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>💡 {step.hint}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      {challengeStep > 0 && (
                        <button onClick={() => setChallengeStep(challengeStep - 1)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-[11px] font-medium hover:bg-slate-600 transition">
                          Passo Anterior
                        </button>
                      )}
                      {challengeStep < selectedChallenge.steps.length - 1 ? (
                        <button onClick={() => setChallengeStep(challengeStep + 1)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-500 transition">
                          Próximo Passo
                        </button>
                      ) : (
                        <button onClick={() => {
                          handleChallengeComplete(selectedChallenge.id);
                          setChallengeStep(0);
                        }} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-medium hover:bg-emerald-500 transition">
                          Concluir Desafio 🎉
                        </button>
                      )}
                    </div>
                    {challengeProgress.includes(selectedChallenge.id) && (
                      <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                        <p className="text-xs font-bold text-emerald-400">{selectedChallenge.rewardTitle}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CHALLENGES.map(challenge => {
                      const isCompleted = challengeProgress.includes(challenge.id);
                      return (
                        <button key={challenge.id} onClick={() => { setSelectedChallenge(challenge); setChallengeStep(0); }}
                          className={`p-4 rounded-xl text-left transition border ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50'} ${isCompleted ? 'ring-1 ring-emerald-500/50' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{challenge.icon}</span>
                            <div>
                              <h3 className="font-semibold text-xs">{challenge.title}</h3>
                              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{challenge.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${challenge.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' : challenge.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                              {challenge.difficulty === 'easy' ? 'Fácil' : challenge.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                            </span>
                            <span>{challenge.steps.length} passos</span>
                            {isCompleted && <span className="text-emerald-400">✅ Concluído</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* INSPIRATION TAB */}
            {activeTab === 'inspiration' && (
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                  <Lightbulb className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h1 className="text-xl font-bold mb-1">Inspiração</h1>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Explore projetos prontos para clonar e personalizar</p>
                </div>
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                  {inspirationCategories.map(cat => (
                    <button key={cat} onClick={() => setInspirationFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition ${inspirationFilter === cat ? (isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600') : (isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900')}`}>
                      {cat === 'all' ? 'Todos' : cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredInspiration.map(project => (
                    <div key={project.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} hover:border-blue-500/50 transition cursor-pointer`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{project.icon}</span>
                        <div>
                          <h3 className="font-semibold text-xs">{project.title}</h3>
                          <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${project.difficulty === 'Fácil' ? 'bg-emerald-500/20 text-emerald-400' : project.difficulty === 'Intermediário' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                          {project.difficulty}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{project.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.features.map((f, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{f}</span>
                        ))}
                      </div>
                      <button className="mt-2 w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-medium transition flex items-center justify-center gap-1">
                        <Download className="w-3 h-3" /> Clonar Projeto
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHORTCUTS TAB */}
            {activeTab === 'shortcuts' && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <Keyboard className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h1 className="text-xl font-bold mb-1">Atalhos do Teclado</h1>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Acelere seu trabalho com atalhos</p>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="text" placeholder="Pesquisar atalhos (ex: Ctrl+C, Delete, Shift)..."
                    value={shortcutSearch} onChange={(e) => setShortcutSearch(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} outline-none focus:border-blue-500 transition`} />
                </div>
                {['Edição', 'Navegação', 'Movimento', 'Camadas', 'Arquivo', 'Ajuda'].map(category => {
                  const shortcuts = filteredShortcuts.filter(s => s.category === category);
                  if (shortcuts.length === 0) return null;
                  return (
                    <div key={category} className="mb-4">
                      <h3 className="text-xs font-semibold mb-2 text-slate-400 uppercase tracking-wider">{category}</h3>
                      <div className="space-y-1">
                        {shortcuts.map(s => (
                          <div key={s.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                            <p className="text-xs">{s.description}</p>
                            <div className="flex items-center gap-1">
                              {s.keys.map((key, i) => (
                                <React.Fragment key={i}>
                                  {i > 0 && <span className="text-[10px] text-slate-400">+</span>}
                                  <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-slate-700 text-slate-200 border border-slate-600' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                    {key === 'ctrl' ? 'Ctrl' : key === 'shift' ? 'Shift' : key === 'delete' ? 'Del' : key === 'backspace' ? 'Bksp' : key === 'escape' ? 'Esc' : key === 'arrowup' ? '↑' : key === 'arrowdown' ? '↓' : key === 'arrowleft' ? '←' : key === 'arrowright' ? '→' : key === 'f1' ? 'F1' : key === 'f2' ? 'F2' : key}
                                  </kbd>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* UPDATES TAB */}
            {activeTab === 'updates' && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <Rocket className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h1 className="text-xl font-bold mb-1">Novidades da Versão</h1>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Acompanhe as atualizações do Mobile Studio</p>
                </div>
                <div className="space-y-3">
                  {VERSION_UPDATES.map(update => (
                    <div key={update.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${update.type === 'new' ? 'bg-emerald-500/20 text-emerald-400' : update.type === 'improvement' ? 'bg-blue-500/20 text-blue-400' : update.type === 'fix' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                            {update.type === 'new' ? 'NOVO' : update.type === 'improvement' ? 'MELHORIA' : update.type === 'fix' ? 'CORREÇÃO' : 'MUDANÇA'}
                          </span>
                          <span className="font-bold text-sm">{update.version}</span>
                        </div>
                        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{update.date}</span>
                      </div>
                      <h3 className="text-xs font-semibold mb-1">{update.title}</h3>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{update.description}</p>
                    </div>
                  ))}
                </div>
                <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} text-center`}>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📋 Roadmap: Plugins, Marketplace, Colaboração em tempo real, Deploy automático</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Walkthrough Modal */}
      {showWelcomeWalkthrough && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`w-96 p-6 rounded-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'} shadow-2xl`}>
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">{walkthroughSteps[walkthroughStep].icon}</span>
              <h2 className="text-lg font-bold mb-1">{walkthroughSteps[walkthroughStep].title}</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{walkthroughSteps[walkthroughStep].description}</p>
            </div>
            <div className="flex items-center justify-center gap-1 mb-4">
              {walkthroughSteps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === walkthroughStep ? 'bg-blue-500 w-4' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => { setShowWelcomeWalkthrough(false); setWalkthroughStep(0); }} className={`text-[11px] ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                Pular tutorial
              </button>
              <button onClick={() => {
                if (walkthroughStep < walkthroughSteps.length - 1) {
                  setWalkthroughStep(walkthroughStep + 1);
                } else {
                  setShowWelcomeWalkthrough(false);
                  setWalkthroughStep(0);
                }
              }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition">
                {walkthroughStep < walkthroughSteps.length - 1 ? 'Continuar' : 'Começar!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};