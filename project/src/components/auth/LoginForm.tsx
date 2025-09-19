import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, GraduationCap, Shield, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.senha);
      
      if (!success) {
        setError('Email ou senha inválidos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const demoUsers = [
    { 
      type: 'Admin', 
      email: 'admin@escola.com', 
      icon: Shield, 
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      type: 'Professor', 
      email: 'prof.joao@escola.com', 
      icon: GraduationCap, 
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      type: 'Aluno', 
      email: 'ana.costa@escola.com', 
      icon: User, 
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">SIGEAS</h1>
                <p className="text-purple-200">Sistema Escolar</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Gestão Escolar
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Inteligente
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Plataforma completa para administração educacional com dashboards avançados, 
              analytics em tempo real e gestão integrada de alunos, professores e turmas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {demoUsers.map((user, index) => {
                const Icon = user.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="glass-effect p-4 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => setFormData({ email: user.email, senha: '123456' })}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${user.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{user.type}</h3>
                    <p className="text-xs text-slate-300">Clique para testar</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md mx-auto w-full"
          >
            <div className="glass-effect p-8 rounded-3xl shadow-premium">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo de volta</h3>
                <p className="text-slate-600">Entre com suas credenciais para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/60 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all placeholder-slate-400"
                    placeholder="seu.email@escola.com"
                  />
                </div>

                <div>
                  <label htmlFor="senha" className="block text-sm font-semibold text-slate-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      name="senha"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.senha}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 bg-white/60 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all placeholder-slate-400"
                      placeholder="Digite sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar no Sistema'
                  )}
                </motion.button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">
                  Credenciais de Demonstração
                </h4>
                <div className="space-y-3">
                  {demoUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${user.bgColor} rounded-lg flex items-center justify-center`}>
                          <user.icon className={`w-3 h-3 ${user.textColor}`} />
                        </div>
                        <span className="font-medium text-slate-700">{user.type}:</span>
                      </div>
                      <div className="text-slate-500">
                        <span className="font-mono">{user.email}</span>
                        <span className="mx-2">•</span>
                        <span className="font-mono">123456</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};