import React, { useState } from 'react';
import { BookOpen, X, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockProfessores } from '../../data/mockData';
import { Modal } from '../common/Modal';
import { Turma } from '../../types';

interface NovaTurmaProps {
  isOpen: boolean;
  onClose: () => void;
}

// Função para gerar um ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const NovaTurmaModal: React.FC<NovaTurmaProps> = ({ isOpen, onClose }) => {
  // Remove unused user variable
  useAuth(); // Keep the hook for context
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [professorId, setProfessorId] = useState('');

  const handleSaveTurma = () => {
    if (!nome || !serie) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Criar nova turma
    const novaTurma: Turma = {
      id: generateId(),
      nome,
      serie,
      ano,
      professorId: professorId || undefined
    };

    // Obter turmas existentes
    const existingTurmas = JSON.parse(localStorage.getItem('sigeas_turmas') || JSON.stringify(mockTurmas));
    
    // Adicionar nova turma
    const turmasAtualizadas = [...existingTurmas, novaTurma];
    
    // Salvar no localStorage
    localStorage.setItem('sigeas_turmas', JSON.stringify(turmasAtualizadas));
    
    alert('Turma criada com sucesso!');
    setNome('');
    setSerie('');
    setAno(new Date().getFullYear());
    setProfessorId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Nova Turma
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Turma*
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 9º Ano A"
            />
          </div>
          
          <div>
            <label htmlFor="serie" className="block text-sm font-medium text-gray-700 mb-1">
              Série/Ano*
            </label>
            <input
              type="text"
              id="serie"
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 9º Ano"
            />
          </div>
          
          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">
              Ano Letivo
            </label>
            <input
              type="number"
              id="ano"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="professor" className="block text-sm font-medium text-gray-700 mb-1">
              Professor Responsável
            </label>
            <select
              id="professor"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um professor</option>
              {mockProfessores.map(professor => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome} - {professor.disciplina}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveTurma}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>Criar Turma</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
