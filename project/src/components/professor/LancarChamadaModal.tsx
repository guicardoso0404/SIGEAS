import React, { useState, useEffect } from 'react';
import { Calendar, Users, Check, X, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../common/Modal';
import { presencaService, AttendanceData } from '../../services/presencaService';
import { turmaService } from '../../services/turmaService';

interface LancarChamadaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChamadaData {
  [alunoId: string]: boolean;
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

export const LancarChamadaModal: React.FC<LancarChamadaModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [chamadaData, setChamadaData] = useState<ChamadaData>({});
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  // Carregar turmas do professor quando o modal abrir
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
    const fetchAlunos = async () => {
      if (!selectedTurma) return;
      
      setLoadingAlunos(true);
      try {
        const data = await turmaService.getClassStudents(selectedTurma);
        setAlunos(data);
        
        // Verificar se já existem presenças registradas para esta data
        const presencas = await presencaService.getAttendanceByClassAndDate(selectedTurma, selectedDate);
        
        // Preparar os dados da chamada baseado nas presenças já registradas
        const chamadaAtual: ChamadaData = {};
        presencas.forEach(p => {
          chamadaAtual[p.alunoId] = p.presente;
        });
        
        setChamadaData(chamadaAtual);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      } finally {
        setLoadingAlunos(false);
      }
    };

    fetchAlunos();
  }, [selectedTurma, selectedDate]);

  const handlePresencaChange = (alunoId: string, presente: boolean) => {
    setChamadaData(prev => ({
      ...prev,
      [alunoId]: presente
    }));
  };

  const handleSaveChamada = async () => {
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
      // Converter o formato de dados para o formato da API
      const attendanceData: AttendanceData = {
        classId: parseInt(selectedTurma),
        date: selectedDate,
        attendanceData: Object.keys(chamadaData).map(alunoId => ({
          studentId: parseInt(alunoId),
          status: chamadaData[alunoId] ? 'present' : 'absent'
        }))
      };
      
      // Enviar os dados para a API
      const response = await presencaService.recordAttendance(attendanceData);
      
      if (response.success) {
        alert('Chamada salva com sucesso!');
        setChamadaData({});
        onClose();
      } else {
        alert(`Erro ao salvar chamada: ${response.message}`);
      }
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
      alert('Erro ao salvar chamada. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTurmaName = (turmaId: string) => {
    const turma = turmas.find(t => t.id === turmaId);
    return turma ? turma.nome : '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Lançar Chamada
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
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
                  setChamadaData({});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
              Data da Aula
            </label>
            <input
              type="date"
              id="data"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedTurma && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Presença - {getTurmaName(selectedTurma)}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date(selectedDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {loadingAlunos ? (
              <div className="py-8 flex justify-center">
                <div className="animate-pulse text-gray-500">Carregando alunos...</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alunos.map(aluno => (
                  <div key={aluno.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{aluno.nome}</p>
                        <p className="text-sm text-gray-600">{aluno.email}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePresencaChange(aluno.id, true)}
                        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                          chamadaData[aluno.id] === true
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                        } border`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Presente
                      </button>
                      <button
                        onClick={() => handlePresencaChange(aluno.id, false)}
                        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                          chamadaData[aluno.id] === false
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                        } border`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Falta
                      </button>
                    </div>
                  </div>
                ))}

                {alunos.length === 0 && (
                  <div className="py-4 text-center text-gray-500">
                    Nenhum aluno encontrado para esta turma.
                  </div>
                )}
              </div>
            )}

            {alunos.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveChamada}
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
                  <span>{loading ? 'Salvando...' : 'Salvar Chamada'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
