import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';
import { turmaService } from '../../services/turmaService';
import { Turma } from '../../types';

interface NovoAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NovoAlunoModal: React.FC<NovoAlunoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const turmas = await turmaService.getAllClasses();
        setTurmas(turmas);
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
      }
    };

    if (isOpen) {
      fetchTurmas();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Criar o usuário aluno
      const response = await userService.createUser({
        nameUser: nome,
        email,
        password: '123456', // Senha padrão inicial
        age: 0, // Campo obrigatório mas não temos no formulário
        role: 'student'
      });
      
      // Se a matrícula for bem sucedida e o callback existir, chamar
      if (response.success && onSuccess) {
        onSuccess();
      }
      
      setNome('');
      setEmail('');
      setTurmaId('');
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      alert("Erro ao cadastrar aluno. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
              {turmas.map(turma => (
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
              disabled={isLoading}
              className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Matriculando...' : 'Matricular Aluno'}
            </motion.button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
