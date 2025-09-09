import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { motion } from 'framer-motion';
import { mockTurmas } from '../../data/mockData';

interface NovoAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NovoAlunoModal: React.FC<NovoAlunoModalProps> = ({ isOpen, onClose }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turmaId, setTurmaId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aqui você adicionaria a lógica para matricular um novo aluno
    const novoAluno = {
      id: Date.now().toString(),
      nome,
      email,
      turmaId
    };
    
    // Simulando salvar em localStorage
    const alunos = JSON.parse(localStorage.getItem('alunos') || '[]');
    alunos.push(novoAluno);
    localStorage.setItem('alunos', JSON.stringify(alunos));
    
    // Resetar formulário e fechar modal
    setNome('');
    setEmail('');
    setTurmaId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Matricular Novo Aluno">
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Aluno
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Ex: João Silva"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Ex: joao.silva@email.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-1">
              Turma
            </label>
            <select
              id="turma"
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              required
            >
              <option value="">Selecione uma turma</option>
              {mockTurmas.map(turma => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} - {turma.serie} {turma.ano}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
            >
              Matricular Aluno
            </motion.button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
