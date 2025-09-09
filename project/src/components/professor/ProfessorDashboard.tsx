import React, { useState } from 'react';
import { BookOpen, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockAlunos, mockNotas, mockPresencas } from '../../data/mockData';
import { VerAlunos } from './VerAlunos';
import { LancarChamadaModal } from './LancarChamadaModal';
import { LancarNotasModal } from './LancarNotasModal';
import ChamadaNotasProfessor from './ChamadaNotasProfessor';

export const ProfessorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showVerAlunos, setShowVerAlunos] = useState(false);
  const [showLancarChamada, setShowLancarChamada] = useState(false);
  const [showLancarNotas, setShowLancarNotas] = useState(false);

  const professorTurmas = mockTurmas.filter(t => t.professorId === user?.id);
  const totalAlunos = professorTurmas.reduce((total, turma) => {
    return total + mockAlunos.filter(a => a.turmaId === turma.id).length;
  }, 0);

  const notasLancadas = mockNotas.length;
  const presencasLancadas = mockPresencas.filter(p => p.professorId === user?.id).length;

  const stats = [
    {
      title: 'Minhas Turmas',
      value: professorTurmas.length,
      icon: BookOpen,
      color: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total de Alunos',
      value: totalAlunos,
      icon: Users,
      color: 'bg-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Notas Lançadas',
      value: notasLancadas,
      icon: TrendingUp,
      color: 'bg-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Chamadas Feitas',
      value: presencasLancadas,
      icon: ClipboardList,
      color: 'bg-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Professor</h1>
        <p className="text-gray-600 mt-2">Bem-vindo(a), {user?.nome}!</p>
      </div>

      {/* Chamada e Notas dos Alunos */}
      <div className="mb-8">
        <ChamadaNotasProfessor />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg mr-4`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Turmas Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Turmas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professorTurmas.map(turma => {
            const alunosTurma = mockAlunos.filter(a => a.turmaId === turma.id);
            return (
              <div key={turma.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{turma.nome}</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {turma.serie}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{alunosTurma.length} alunos</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Ano letivo: {turma.ano}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowLancarChamada(true)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
            <span>Lançar Chamada</span>
          </button>
          <button 
            onClick={() => setShowLancarNotas(true)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            <span>Lançar Notas</span>
          </button>
          <button 
            onClick={() => setShowVerAlunos(true)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            <span>Ver Alunos</span>
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <VerAlunos isOpen={showVerAlunos} onClose={() => setShowVerAlunos(false)} />
      <LancarChamadaModal isOpen={showLancarChamada} onClose={() => setShowLancarChamada(false)} />
      <LancarNotasModal isOpen={showLancarNotas} onClose={() => setShowLancarNotas(false)} />
    </div>
  );
};