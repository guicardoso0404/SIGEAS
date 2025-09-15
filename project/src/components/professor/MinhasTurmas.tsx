import React from 'react';
import { Users, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockAlunos } from '../../data/mockData';


export const MinhasTurmas: React.FC = () => {
  const { user } = useAuth();
  const turmasProfessor = mockTurmas.filter(t => t.professorId === user?.id);

  const getAlunosCount = (turmaId: string) => {
    return mockAlunos.filter(a => a.turmaId === turmaId).length;
  };

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Turmas</h1>
        <p className="text-gray-600 mt-1">Visualize as turmas sob sua responsabilidade</p>
      </div>
      {turmasProfessor.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmasProfessor.map(turma => (
            <div key={turma.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{turma.nome}</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {turma.serie}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{getAlunosCount(turma.id)} alunos</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>Ano letivo: {turma.ano}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma turma cadastrada para você ainda.</p>
      )}
    </div>
  );
};