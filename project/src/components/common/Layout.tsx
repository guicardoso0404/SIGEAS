import React, { ReactNode, useState, useEffect } from 'react';
import { Menu, X, LogOut, Users, BookOpen, GraduationCap, User, Home, BarChart3, Bell, Search, Calendar, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      if (!mobile) {
        setSidebarOpen(true);
      }
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const getMenuItems = () => {
    if (!user) return [];

    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ];

    switch (user.perfil) {
      case 'admin':
        return [
          ...common,
          { id: 'turmas', label: 'Gerenciar Turmas', icon: BookOpen },
          { id: 'professores', label: 'Gerenciar Professores', icon: Users },
          { id: 'alunos', label: 'Gerenciar Alunos', icon: GraduationCap }
        ];
      case 'professor':
        return [
          ...common,
          { id: 'minhas-turmas', label: 'Minhas Turmas', icon: BookOpen },
          { id: 'chamada', label: 'Lançar Chamada', icon: Users },
          { id: 'notas', label: 'Lançar Notas', icon: GraduationCap },
          { id: 'atividades', label: 'Atividades', icon: ClipboardList },
          { id: 'calendario', label: 'Calendário', icon: Calendar }
        ];
      case 'aluno':
        return [
          ...common,
          { id: 'minha-turma', label: 'Minha Turma', icon: BookOpen },
          { id: 'minhas-notas', label: 'Minhas Notas', icon: GraduationCap },
          { id: 'presencas', label: 'Presenças', icon: Users },
          { id: 'tarefas', label: 'Tarefas', icon: ClipboardList },
          { id: 'calendario', label: 'Calendário', icon: Calendar }
        ];
      default:
        return common;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 glass-effect shadow-premium transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-20 px-6 gradient-primary">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SIGEAS</h1>
                <p className="text-xs text-white/80">Sistema Escolar</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="mt-8 px-4 custom-scrollbar overflow-y-auto h-[calc(100vh-12.5rem)] pb-8">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-700 hover:bg-white/60 hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center mb-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-3 shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{user?.nome}</p>
                <p className="text-sm text-slate-600 capitalize truncate">{user?.perfil}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
        {/* Sidebar ends here; overlay and main content continue within outer container */}

      {/* Overlay para mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-effect shadow-elegant border-b border-white/20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/60 transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 bg-white/60 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all"
                />
              </div>
              
              <button className="relative p-2 rounded-xl hover:bg-white/60 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="hidden md:flex items-center space-x-3 px-3 py-2 bg-white/60 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-800">{user?.nome}</p>
                  <p className="text-slate-500 capitalize">{user?.perfil}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar h-[calc(100vh-5rem)]">
          <div className="container mx-auto px-6 py-8">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};