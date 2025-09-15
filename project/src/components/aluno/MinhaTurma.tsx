import React from 'react';
import { Users, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockAlunos, mockTurmas, mockProfessores } from '../../data/mockData';


export const MinhaTurma: React.FC = () => {
  const { user } = useAuth();

  const aluno = mockAlunos.find(a => a.id === user?.id);

  const turma = mockTurmas.find(t => t.id === aluno?.turmaId);

  const professor = mockProfessores.find(p => p.id === turma?.professorId);

  const colegas = mockAlunos.filter(a => a.turmaId === turma?.id);

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Minha Turma</h1>
        <p className="text-gray-600 mt-1">Informações detalhadas sobre sua turma e colegas</p>
      </div>

      {turma ? (
        <>
          {/* Informações da Turma */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Informações da Turma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p><span className="font-medium text-gray-700">Nome:</span> {turma.nome}</p>
                <p><span className="font-medium text-gray-700">Série:</span> {turma.serie}</p>
                <p><span className="font-medium text-gray-700">Ano Letivo:</span> {turma.ano}</p>
              </div>
              <div className="space-y-1">
                <p><span className="font-medium text-gray-700">Professor(a):</span> {professor?.nome || 'Não informado'}</p>
                <p><span className="font-medium text-gray-700">Disciplina:</span> {professor?.disciplina || 'Não informado'}</p>
                {professor?.telefone && (
                  <p><span className="font-medium text-gray-700">Contato:</span> {professor.telefone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Colegas de Turma */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Colegas de Turma
            </h3>
            <div className="space-y-3">
              {colegas.map(colega => (
                <div key={colega.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{colega.nome}</span>
                  </div>
                  <span className="text-xs text-gray-500">{colega.email}</span>
                </div>
              ))}
              {colegas.length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum colega encontrado.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500">Você não está matriculado(a) em nenhuma turma.</p>
      )}
    </div>
  );
};