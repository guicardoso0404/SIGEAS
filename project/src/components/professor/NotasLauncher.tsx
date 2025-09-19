import React, { useState, useEffect } from 'react';
import { Users, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notasService } from '../../services/notasService';
import { turmaService } from '../../services/turmaService';

// Interfaces para gerenciar dados de notas e entidades
interface NotasData {
  [alunoId: string]: {
    nota1?: number;
    nota2?: number;
    mediaFinal?: number;
  };
}

// Definição das interfaces necessárias para o componente
interface TurmaData {
  id: string;
  nome: string;
  serie: string;
  professorId: string;
}

interface AlunoData {
  id: string;
  nome: string;
  email: string;
  turmaId: string;
}

export const NotasLauncher: React.FC = () => {
  const { user } = useAuth();
  const [selectedTurma, setSelectedTurma] = useState('');
  const [notasData, setNotasData] = useState<NotasData>({});
  const [turmas, setTurmas] = useState<TurmaData[]>([]);
  const [alunos, setAlunos] = useState<AlunoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const turmasData = await turmaService.getClassesByTeacher();
        // Garantir que todos os campos necessários estejam presentes
        const turmasFormatadas: TurmaData[] = turmasData.map(turma => ({
          id: turma.id,
          nome: turma.nome,
          serie: turma.serie,
          professorId: turma.professorId || user?.id || ''
        }));
        setTurmas(turmasFormatadas);
      } catch (err) {
        console.error('Erro ao buscar turmas do professor:', err);
        setError('Não foi possível carregar suas turmas');
      }
    };
    
    if (user?.id) {
      fetchTurmas();
    }
  }, [user?.id]);
  
  useEffect(() => {
    const fetchAlunos = async () => {
      if (!selectedTurma) return;
      
      try {
        setLoading(true);
        // Usar o serviço para buscar alunos da turma selecionada
        const alunosData = await turmaService.getClassStudents(selectedTurma);
        setAlunos(alunosData);
      } catch (err) {
        console.error('Erro ao buscar alunos da turma:', err);
        setError('Não foi possível carregar os alunos desta turma');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlunos();
  }, [selectedTurma]);

  const professorTurmas = turmas;
  const alunosTurma = alunos;

  const handleNotaChange = (alunoId: string, campo: 'nota1' | 'nota2', valor: string) => {
    const nota = parseFloat(valor) || undefined;
    
    // Validar nota entre 0 e 10
    if (nota !== undefined && (nota < 0 || nota > 10)) {
      return;
    }
    
    const notasAluno = notasData[alunoId] || {};
    const novasNotas = { ...notasAluno, [campo]: nota };
    
    // Calcular média apenas se ambas as notas estiverem preenchidas
    if (novasNotas.nota1 !== undefined && novasNotas.nota2 !== undefined) {
      novasNotas.mediaFinal = Math.round(((novasNotas.nota1 + novasNotas.nota2) / 2) * 10) / 10;
    } else {
      novasNotas.mediaFinal = undefined;
    }

    setNotasData(prev => ({
      ...prev,
      [alunoId]: novasNotas
    }));
  };

  const handleSaveNotas = async () => {
    if (!selectedTurma) {
      alert('Selecione uma turma primeiro');
      return;
    }

    // Pegar informações da turma selecionada
    const turmaSelecionada = turmas.find(t => t.id === selectedTurma);
    if (!turmaSelecionada) {
      setError('Turma não encontrada');
      return;
    }

    const disciplina = turmaSelecionada.serie;
    const hoje = new Date().toISOString().split('T')[0];
    
    setLoading(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      // Processar cada nota para salvar no backend
      const promises = Object.keys(notasData).map(async (alunoId) => {
        const notaData = notasData[alunoId];
        
        if (notaData.nota1 !== undefined) {
          // Adicionar a primeira nota
          await notasService.addGrade({
            studentId: parseInt(alunoId),
            classId: parseInt(selectedTurma),
            disciplina: disciplina,
            nota: notaData.nota1,
            assessmentDate: hoje
          });
        }
        
        if (notaData.nota2 !== undefined) {
          // Adicionar a segunda nota
          await notasService.addGrade({
            studentId: parseInt(alunoId),
            classId: parseInt(selectedTurma),
            disciplina: disciplina,
            nota: notaData.nota2,
            assessmentDate: hoje
          });
        }
      });
      
      await Promise.all(promises);
      
      setSaveSuccess(true);
      setNotasData({});
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar notas:', err);
      setError('Ocorreu um erro ao salvar as notas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTurmaName = (turmaId: string) => {
    const turma = turmas.find(t => t.id === turmaId);
    return turma ? turma.nome : '';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lançar Notas</h1>
        <p className="text-gray-600 mt-2">Registre as notas dos alunos</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Notas salvas com sucesso!
        </div>
      )}

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
            disabled={loading}
          >
            <option value="">Selecione uma turma</option>
            {professorTurmas.map(turma => (
              <option key={turma.id} value={turma.id}>
                {turma.nome} - {turma.serie}
              </option>
            ))}
          </select>
        </div>

        {loading && !selectedTurma && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {selectedTurma && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Lançamento de Notas - {getTurmaName(selectedTurma)}
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : alunosTurma.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Nenhum aluno matriculado nesta turma
              </div>
            ) : (
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
                              disabled={loading}
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
                              disabled={loading}
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
            )}

            {alunosTurma.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotas}
                  disabled={loading}
                  className={`${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-md flex items-center space-x-2 transition-colors`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Notas</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};