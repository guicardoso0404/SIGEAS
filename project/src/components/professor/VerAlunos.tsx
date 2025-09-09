import React, { useState, useEffect } from 'react';
import { Users, Search, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockAlunos } from '../../data/mockData';
import { Modal } from '../common/Modal';

interface VerAlunosProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerAlunos: React.FC<VerAlunosProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedTurma, setSelectedTurma] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const professorTurmas = mockTurmas.filter(t => t.professorId === user?.id);
  const alunosFiltrados = selectedTurma 
    ? mockAlunos.filter(a => 
        a.turmaId === selectedTurma && 
        a.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (isOpen && professorTurmas.length > 0) {
      setSelectedTurma(professorTurmas[0].id);
    }
  }, [isOpen, professorTurmas]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Ver Alunos
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-1">
              Selecione a Turma
            </label>
            <select
              id="turma"
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {professorTurmas.map(turma => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} - {turma.serie}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar alunos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map(aluno => (
              <div key={aluno.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{aluno.nome}</p>
                      <p className="text-sm text-gray-600">{aluno.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {professorTurmas.find(t => t.id === aluno.turmaId)?.nome || 'Sem turma'}
                  </span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Telefone:</span> {aluno.telefone || 'Não informado'}
                  </div>
                  <div>
                    <span className="text-gray-600">Responsável:</span> {aluno.responsavel || 'Não informado'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Nenhum aluno encontrado para esta turma.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
