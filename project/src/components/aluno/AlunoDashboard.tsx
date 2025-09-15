import React from 'react';
import { BookOpen, TrendingUp, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockNotas, mockPresencas } from '../../data/mockData';

export const AlunoDashboard: React.FC = () => {
  const { user } = useAuth();

  const alunoNotas = mockNotas.filter(n => n.alunoId === user?.id);
  const alunoPresencas = mockPresencas.filter(p => p.alunoId === user?.id);
  

  const totalPresencas = alunoPresencas.length;
  const presencasCount = alunoPresencas.filter(p => p.presente).length;
  const percentualPresenca = totalPresencas > 0 ? (presencasCount / totalPresencas) * 100 : 0;
  
  const mediaGeral = alunoNotas.length > 0 
    ? alunoNotas.reduce((acc, nota) => acc + (nota.mediaFinal || 0), 0) / alunoNotas.length
    : 0;

  const stats = [
    {
      title: 'Média Geral',
      value: mediaGeral.toFixed(1),
      icon: TrendingUp,
      color: mediaGeral >= 7 ? 'bg-green-600' : 'bg-red-600',
      bgColor: mediaGeral >= 7 ? 'bg-green-50' : 'bg-red-50',
      textColor: mediaGeral >= 7 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Presença',
      value: `${percentualPresenca.toFixed(0)}%`,
      icon: Calendar,
      color: percentualPresenca >= 75 ? 'bg-blue-600' : 'bg-orange-600',
      bgColor: percentualPresenca >= 75 ? 'bg-blue-50' : 'bg-orange-50',
      textColor: percentualPresenca >= 75 ? 'text-blue-600' : 'text-orange-600'
    },
    {
      title: 'Disciplinas',
      value: alunoNotas.length,
      icon: BookOpen,
      color: 'bg-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Status',
      value: mediaGeral >= 7 ? 'Aprovado' : 'Atenção',
      icon: Award,
      color: mediaGeral >= 7 ? 'bg-green-600' : 'bg-yellow-600',
      bgColor: mediaGeral >= 7 ? 'bg-green-50' : 'bg-yellow-50',
      textColor: mediaGeral >= 7 ? 'text-green-600' : 'text-yellow-600'
    }
  ];

  // Encontrar turma do aluno
  const aluno = mockTurmas.find(t => t.id === mockNotas[0]?.alunoId);
  const minhasTurma = mockTurmas.find(t => t.alunos?.some(a => a.id === user?.id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
        <p className="text-gray-600 mt-2">Bem-vindo(a), {user?.nome}!</p>
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
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = "#/minhas-notas"}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            <span>Ver Notas</span>
          </button>
          <button 
            onClick={() => window.location.href = "#/presencas"}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            <span>Minhas Presenças</span>
          </button>
          <button 
            onClick={() => window.location.href = "#/minha-turma"}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
            <span>Minha Turma</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minhas Notas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Notas</h3>
          <div className="space-y-4">
            {alunoNotas.map(nota => (
              <div key={nota.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{nota.disciplina}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    nota.mediaFinal && nota.mediaFinal >= 7 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Média: {nota.mediaFinal?.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span>Nota 1: {nota.nota1}</span>
                  <span className="mx-4">Nota 2: {nota.nota2}</span>
                </div>
              </div>
            ))}
            {alunoNotas.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma nota lançada ainda</p>
            )}
          </div>
        </div>

        {/* Histórico de Presenças */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Presenças</h3>
          <div className="space-y-3">
            {alunoPresencas.slice(-5).reverse().map(presenca => (
              <div key={presenca.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(presenca.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  presenca.presente 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {presenca.presente ? 'Presente' : 'Falta'}
                </span>
              </div>
            ))}
            {alunoPresencas.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma presença registrada ainda</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de aulas: {totalPresencas}</span>
              <span className="text-gray-600">Presenças: {presencasCount}</span>
              <span className={`font-medium ${percentualPresenca >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                {percentualPresenca.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};