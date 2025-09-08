import React, { useState } from 'react';
import { TrendingUp, Users, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockAlunos } from '../../data/mockData';

interface NotasData {
  [alunoId: string]: {
    nota1?: number;
    nota2?: number;
    mediaFinal?: number;
  };
}

export const NotasLauncher: React.FC = () => {
  const { user } = useAuth();
  const [selectedTurma, setSelectedTurma] = useState('');
  const [notasData, setNotasData] = useState<NotasData>({});

  const professorTurmas = mockTurmas.filter(t => t.professorId === user?.id);
  const alunosTurma = selectedTurma ? mockAlunos.filter(a => a.turmaId === selectedTurma) : [];

  const handleNotaChange = (alunoId: string, campo: 'nota1' | 'nota2', valor: string) => {
    const nota = parseFloat(valor) || undefined;
    const notasAluno = notasData[alunoId] || {};
    const novasNotas = { ...notasAluno, [campo]: nota };
    
    // Calcular média automaticamente se ambas as notas estiverem preenchidas
    if (novasNotas.nota1 !== undefined && novasNotas.nota2 !== undefined) {
      novasNotas.mediaFinal = (novasNotas.nota1 + novasNotas.nota2) / 2;
    }

    setNotasData(prev => ({
      ...prev,
      [alunoId]: novasNotas
    }));
  };

  const handleSaveNotas = () => {
    if (!selectedTurma) {
      alert('Selecione uma turma primeiro');
      return;
    }

    // Aqui seria salvo no backend
    alert('Notas salvas com sucesso!');
    setNotasData({});
  };

  const getTurmaName = (turmaId: string) => {
    const turma = mockTurmas.find(t => t.id === turmaId);
    return turma ? turma.nome : '';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lançar Notas</h1>
        <p className="text-gray-600 mt-2">Registre as notas dos alunos</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Turma
          </label>
          <select
            id="turma"
            value={selectedTurma}
            onChange={(e) => {
              setSelectedTurma(e.target.value);
              setNotasData({});
            }}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma turma</option>
            {professorTurmas.map(turma => (
              <option key={turma.id} value={turma.id}>
                {turma.nome} - {turma.serie}
              </option>
            ))}
          </select>
        </div>

        {selectedTurma && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Lançamento de Notas - {getTurmaName(selectedTurma)}
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Aluno</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Nota 1</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Nota 2</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Média Final</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosTurma.map(aluno => {
                    const notasAluno = notasData[aluno.id] || {};
                    const media = notasAluno.mediaFinal;
                    const status = media !== undefined ? (media >= 7 ? 'Aprovado' : 'Reprovado') : '-';
                    const statusColor = media !== undefined ? (media >= 7 ? 'text-green-600' : 'text-red-600') : 'text-gray-400';

                    return (
                      <tr key={aluno.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">{aluno.nome}</p>
                              <p className="text-sm text-gray-600">{aluno.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={notasAluno.nota1 || ''}
                            onChange={(e) => handleNotaChange(aluno.id, 'nota1', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.0"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={notasAluno.nota2 || ''}
                            onChange={(e) => handleNotaChange(aluno.id, 'nota2', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.0"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {media !== undefined ? media.toFixed(1) : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-medium ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {alunosTurma.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotas}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Notas</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};