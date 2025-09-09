import React, { useState, useEffect } from 'react';
import { Calendar, Users, Check, X, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockAlunos } from '../../data/mockData';
import { Modal } from '../common/Modal';
import { Presenca } from '../../types';

interface LancarChamadaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChamadaData {
  [alunoId: string]: boolean;
}

// Função para gerar um ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const LancarChamadaModal: React.FC<LancarChamadaModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [chamadaData, setChamadaData] = useState<ChamadaData>({});

  useEffect(() => {
    if (isOpen) {
      const professorTurmas = mockTurmas.filter(t => t.professorId === user?.id);
      if (professorTurmas.length > 0) {
        setSelectedTurma(professorTurmas[0].id);
      }
    }
  }, [isOpen, user?.id]);

  const professorTurmas = mockTurmas.filter(t => t.professorId === user?.id);
  const alunosTurma = selectedTurma ? mockAlunos.filter(a => a.turmaId === selectedTurma) : [];

  const handlePresencaChange = (alunoId: string, presente: boolean) => {
    setChamadaData(prev => ({
      ...prev,
      [alunoId]: presente
    }));
  };

  const handleSaveChamada = () => {
    if (!selectedTurma) {
      alert('Selecione uma turma primeiro');
      return;
    }

    if (!user?.id) {
      alert('Erro: Usuário não identificado');
      return;
    }

    // Obter presenças existentes
    const existingPresencas = JSON.parse(localStorage.getItem('sigeas_presencas') || '[]') as Presenca[];
    
    // Criar novas presenças a partir do chamadaData
    const novasPresencas: Presenca[] = Object.keys(chamadaData).map(alunoId => {
      return {
        id: generateId(),
        alunoId,
        turmaId: selectedTurma,
        data: selectedDate,
        presente: chamadaData[alunoId],
        professorId: user.id
      };
    });
    
    // Juntar com presenças existentes, substituindo as da mesma turma/data/aluno
    const presencasAtualizadas = [
      ...existingPresencas.filter((p: Presenca) => 
        p.turmaId !== selectedTurma || 
        p.data !== selectedDate || 
        !Object.keys(chamadaData).includes(p.alunoId)
      ),
      ...novasPresencas
    ];
    
    // Salvar no localStorage
    localStorage.setItem('sigeas_presencas', JSON.stringify(presencasAtualizadas));
    
    alert('Chamada salva com sucesso!');
    setChamadaData({});
    onClose();
  };

  const getTurmaName = (turmaId: string) => {
    const turma = mockTurmas.find(t => t.id === turmaId);
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
              {professorTurmas.map(turma => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} - {turma.serie}
                </option>
              ))}
            </select>
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

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alunosTurma.map(aluno => (
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
            </div>

            {alunosTurma.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveChamada}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Chamada</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
