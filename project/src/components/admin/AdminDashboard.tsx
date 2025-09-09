import React, { useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, Target, Activity } from 'lucide-react';
import { mockTurmas, mockProfessores, mockAlunos } from '../../data/mockData';
import { Card, StatCard } from '../common/Card';
import { motion } from 'framer-motion';
import { NovaTurmaModal } from './NovaTurmaModal';
import { NovoProfessorModal } from './NovoProfessorModal';
import { NovoAlunoModal } from './NovoAlunoModal';
import { RelatoriosModal } from './RelatoriosModal';

export const AdminDashboard: React.FC = () => {
  const [showNovaTurma, setShowNovaTurma] = useState(false);
  const [showNovoProfessor, setShowNovoProfessor] = useState(false);
  const [showNovoAluno, setShowNovoAluno] = useState(false);
  const [showRelatorios, setShowRelatorios] = useState(false);
  
  const stats = {
    totalTurmas: mockTurmas.length,
    totalProfessores: mockProfessores.length,
    totalAlunos: mockAlunos.length,
    mediaAlunos: mockAlunos.length > 0 ? (mockAlunos.length / mockTurmas.length).toFixed(1) : '0'
  };

  const statCards = [
    {
      title: 'Total de Turmas',
      value: stats.totalTurmas,
      icon: BookOpen,
      color: 'bg-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Professores Ativos',
      value: stats.totalProfessores,
      icon: Users,
      color: 'bg-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Alunos Matriculados',
      value: stats.totalAlunos,
      icon: GraduationCap,
      color: 'bg-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Média Alunos/Turma',
      value: stats.mediaAlunos,
      icon: TrendingUp,
      color: 'bg-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      trend: { value: 5, isPositive: true }
    }
  ];

  const recentActivities = [
    { action: 'Nova turma criada', details: '9º Ano C - Matemática', time: '2 horas atrás', type: 'success' },
    { action: 'Professor cadastrado', details: 'Maria Silva - História', time: '4 horas atrás', type: 'info' },
    { action: 'Aluno matriculado', details: 'João Santos - 8º Ano A', time: '6 horas atrás', type: 'success' },
    { action: 'Notas lançadas', details: '7º Ano B - Português', time: '1 dia atrás', type: 'warning' }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-slate-600 mt-2">Visão geral completa do sistema escolar</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg">
            Sistema Online
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Turmas Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6" gradient>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Turmas por Série</h3>
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-4">
              {mockTurmas.map((turma, index) => (
                <motion.div
                  key={turma.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50/30 rounded-xl border border-blue-100/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{turma.nome}</p>
                      <p className="text-sm text-slate-600">{turma.serie} • Ano {turma.ano}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {mockAlunos.filter(a => a.turmaId === turma.id).length} alunos
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6" gradient>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Atividades Recentes</h3>
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{activity.action}</p>
                    <p className="text-slate-600 text-xs">{activity.details}</p>
                    <p className="text-slate-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Professores Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6" gradient>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Professores por Disciplina</h3>
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockProfessores.map((professor, index) => (
              <motion.div
                key={professor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-green-50/30 rounded-xl border border-green-100/50 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{professor.nome}</p>
                    <p className="text-sm text-slate-600">{professor.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {professor.disciplina}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-6" gradient>
          <h3 className="text-xl font-bold text-slate-800 mb-6">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: 'Nova Turma', color: 'from-blue-500 to-blue-600', action: () => setShowNovaTurma(true) },
              { icon: Users, label: 'Cadastrar Professor', color: 'from-green-500 to-green-600', action: () => setShowNovoProfessor(true) },
              { icon: GraduationCap, label: 'Matricular Aluno', color: 'from-purple-500 to-purple-600', action: () => setShowNovoAluno(true) },
              { icon: Target, label: 'Relatórios', color: 'from-orange-500 to-orange-600', action: () => setShowRelatorios(true) }
            ].map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className={`flex flex-col items-center justify-center p-6 bg-gradient-to-r ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all`}
              >
                <action.icon className="w-8 h-8 mb-3" />
                <span className="font-medium text-sm">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>
      
      {/* Modals */}
      <NovaTurmaModal isOpen={showNovaTurma} onClose={() => setShowNovaTurma(false)} />
      <NovoProfessorModal isOpen={showNovoProfessor} onClose={() => setShowNovoProfessor(false)} />
      <NovoAlunoModal isOpen={showNovoAluno} onClose={() => setShowNovoAluno(false)} />
      <RelatoriosModal isOpen={showRelatorios} onClose={() => setShowRelatorios(false)} />
    </div>
  );
};