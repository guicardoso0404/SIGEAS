import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Turma, Professor } from '../../types';
import { mockTurmas, mockProfessores, mockAlunos } from '../../data/mockData';
import { Modal } from '../common/Modal';

export const TurmasManager: React.FC = () => {
  const [turmas, setTurmas] = useState<Turma[]>(mockTurmas);
  const [professores] = useState<Professor[]>(mockProfessores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    serie: '',
    ano: new Date().getFullYear(),
    professorId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTurma) {
      setTurmas(turmas.map(t => 
        t.id === editingTurma.id 
          ? { ...t, ...formData }
          : t
      ));
    } else {
      const newTurma: Turma = {
        id: Date.now().toString(),
        ...formData
      };
      setTurmas([...turmas, newTurma]);
    }
    
    handleCloseModal();
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      serie: turma.serie,
      ano: turma.ano,
      professorId: turma.professorId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (turmaId: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      setTurmas(turmas.filter(t => t.id !== turmaId));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTurma(null);
    setFormData({
      nome: '',
      serie: '',
      ano: new Date().getFullYear(),
      professorId: ''
    });
  };

  const getProfessorNome = (professorId?: string) => {
    const professor = professores.find(p => p.id === professorId);
    return professor ? professor.nome : 'Não atribuído';
  };

  const getAlunosCount = (turmaId: string) => {
    return mockAlunos.filter(a => a.turmaId === turmaId).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Turmas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Turma</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas.map(turma => (
          <div key={turma.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{turma.nome}</h3>
                <p className="text-gray-600">{turma.serie} - {turma.ano}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(turma)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(turma.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Professor:</strong> {getProfessorNome(turma.professorId)}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{getAlunosCount(turma.id)} alunos</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTurma ? 'Editar Turma' : 'Nova Turma'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Turma
            </label>
            <input
              type="text"
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 9º Ano A"
            />
          </div>

          <div>
            <label htmlFor="serie" className="block text-sm font-medium text-gray-700 mb-1">
              Série
            </label>
            <select
              id="serie"
              required
              value={formData.serie}
              onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione a série</option>
              <option value="6º Ano">6º Ano</option>
              <option value="7º Ano">7º Ano</option>
              <option value="8º Ano">8º Ano</option>
              <option value="9º Ano">9º Ano</option>
            </select>
          </div>

          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">
              Ano Letivo
            </label>
            <input
              type="number"
              id="ano"
              required
              value={formData.ano}
              onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="2020"
              max="2030"
            />
          </div>

          <div>
            <label htmlFor="professorId" className="block text-sm font-medium text-gray-700 mb-1">
              Professor Responsável
            </label>
            <select
              id="professorId"
              value={formData.professorId}
              onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um professor</option>
              {professores.map(professor => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome} - {professor.disciplina}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingTurma ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};