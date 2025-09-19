import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Modal } from '../common/Modal';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';

interface NovoProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NovoProfessorModal: React.FC<NovoProfessorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await userService.createUser({
        nameUser: nome,
        email,
        password: '123456', // Senha padrão inicial
        age: 0, // Campo obrigatório mas não temos no formulário
        role: 'teacher'
      });
      
      // Se a criação for bem sucedida e o callback existir, chamar
      if (response.success && onSuccess) {
        onSuccess();
      }
      
      setNome('');
      setEmail('');
      setDisciplina('');
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar professor:", error);
      alert("Erro ao cadastrar professor. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Professor">
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Professor
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Ex: Maria Silva"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Ex: maria.silva@email.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="disciplina" className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina
            </label>
            <select
              id="disciplina"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              required
            >
              <option value="">Selecione uma disciplina</option>
              <option value="Matemática">Matemática</option>
              <option value="Português">Português</option>
              <option value="História">História</option>
              <option value="Geografia">Geografia</option>
              <option value="Ciências">Ciências</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
              <option value="Biologia">Biologia</option>
              <option value="Educação Física">Educação Física</option>
              <option value="Artes">Artes</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
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
              className={`px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Professor'}
            </motion.button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
