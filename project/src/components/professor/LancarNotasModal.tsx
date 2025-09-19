import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Save, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../common/Modal';
import { notasService } from '../../services/notasService';
import { turmaService } from '../../services/turmaService';

interface LancarNotasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotasData {
  [alunoId: string]: {
    nota1?: number;
    nota2?: number;
    mediaFinal?: number;
  };
}

interface Turma {
  id: string;
  nome: string;
  serie?: string;
  professorId?: string;
}

interface Aluno {
  id: string;
  nome: string;
  email: string;
  turmaId: string;
}

export const LancarNotasModal: React.FC<LancarNotasModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedTurma, setSelectedTurma] = useState('');
  const [notasData, setNotasData] = useState<NotasData>({});
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchTurmas = async () => {
        setLoadingTurmas(true);
        try {
          const data = await turmaService.getTeacherClasses();
          setTurmas(data);
          
          if (data.length > 0) {
            setSelectedTurma(data[0].id);
          }
        } catch (error) {
          console.error('Erro ao carregar turmas:', error);
        } finally {
          setLoadingTurmas(false);
        }
      };

      if (user?.id) {
        fetchTurmas();
      }
    }
  }, [isOpen, user?.id]);

  // Carregar alunos da turma selecionada
  useEffect(() => {
    const fetchAlunosENotas = async () => {
      if (!selectedTurma) return;
      
      setLoadingAlunos(true);
      try {
        // Buscar alunos da turma
        const alunosData = await turmaService.getClassStudents(selectedTurma);
        setAlunos(alunosData);
        
        // Buscar notas já existentes para esta turma
        const notasTurma = await notasService.getGradesByClass(selectedTurma);
        
        // Preparar os dados das notas baseado nas notas já registradas
        const notasAtuais: NotasData = {};
        notasTurma.forEach(nota => {
          if (nota.alunoId) {
            notasAtuais[nota.alunoId] = {
              nota1: nota.nota1,
              nota2: nota.nota2,
              mediaFinal: nota.mediaFinal
            };
          }
        });
        
        setNotasData(notasAtuais);
      } catch (error) {
        console.error('Erro ao carregar alunos e notas:', error);
      } finally {
        setLoadingAlunos(false);
      }
    };

    fetchAlunosENotas();
  }, [selectedTurma]);

  const handleNotaChange = (alunoId: string, campo: 'nota1' | 'nota2', valor: string) => {
    const nota = parseFloat(valor) || undefined;
    const notasAluno = notasData[alunoId] || {};
    const novasNotas = { ...notasAluno, [campo]: nota };
    
    if (novasNotas.nota1 !== undefined && novasNotas.nota2 !== undefined) {
      novasNotas.mediaFinal = (novasNotas.nota1 + novasNotas.nota2) / 2;
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

    if (!user?.id) {
      alert('Erro: Usuário não identificado');
      return;
    }

    setLoading(true);
    
    try {
      // Vamos assumir que o nome da disciplina está disponível no perfil do usuário
      // ou usamos um valor padrão como "Geral"
      const disciplina = "Geral"; // Será obtido da API em uma implementação completa
      const hoje = new Date().toISOString().split('T')[0];
      
      // Para cada aluno com notas, salvar na API
      for (const alunoId of Object.keys(notasData)) {
        const notaData = notasData[alunoId];
        
        // Se tiver nota1, salvar primeira nota
        if (notaData.nota1 !== undefined) {
          await notasService.addGrade({
            studentId: parseInt(alunoId),
            classId: parseInt(selectedTurma),
            disciplina: disciplina,
            nota: notaData.nota1,
            assessmentDate: hoje
          });
        }
        
        // Se tiver nota2, salvar segunda nota
        if (notaData.nota2 !== undefined) {
          await notasService.addGrade({
            studentId: parseInt(alunoId),
            classId: parseInt(selectedTurma),
            disciplina: disciplina,
            nota: notaData.nota2,
            assessmentDate: hoje
          });
        }
      }
      
      alert('Notas salvas com sucesso!');
      setNotasData({});
      onClose();
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      alert('Erro ao salvar notas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTurmaName = (turmaId: string) => {
    const turma = turmas.find(t => t.id === turmaId);
    return turma ? turma.nome : '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Lançar Notas
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Turma
          </label>
          {loadingTurmas ? (
            <div className="h-10 flex items-center text-sm text-gray-500">
              Carregando turmas...
            </div>
          ) : (
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
              {turmas.map(turma => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} - {turma.serie}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedTurma && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Lançamento de Notas - {getTurmaName(selectedTurma)}
            </h3>

            {loadingAlunos ? (
              <div className="py-8 flex justify-center">
                <div className="animate-pulse text-gray-500">Carregando alunos e notas...</div>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
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
                    {alunos.map(aluno => {
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

                    {alunos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          Nenhum aluno encontrado para esta turma.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {alunos.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotas}
                  disabled={loading}
                  className={`${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-6 py-2 rounded-md flex items-center space-x-2 transition-colors`}
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  <span>{loading ? 'Salvando...' : 'Salvar Notas'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
