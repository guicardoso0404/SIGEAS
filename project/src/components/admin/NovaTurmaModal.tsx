import React, { useState, useEffect } from 'react';
import { BookOpen, X, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../common/Modal';
import { turmaService } from '../../services/turmaService';
import api from '../../services/api';

interface NovaTurmaProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Professor {
  id: string;
  nome: string;
  disciplina?: string;
}

export const NovaTurmaModal: React.FC<NovaTurmaProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth(); // Manter o hook para contexto
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [professorId, setProfessorId] = useState('');
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfessores, setLoadingProfessores] = useState(false);

  // Carregar lista de professores
  useEffect(() => {
    if (isOpen) {
      const fetchProfessores = async () => {
        setLoadingProfessores(true);
        try {
          // Como não temos um endpoint específico para professores, usaremos users com filtro no frontend
          const response = await api.get('/users');
          if (response.success && response.data) {
            // Filtrar apenas usuários com role 'teacher'
            const professoresData = response.data
              .filter((user: any) => user.role === 'teacher')
              .map((professor: any) => ({
                id: professor.idUser.toString(),
                nome: professor.nameUser,
                disciplina: professor.subject || 'Geral'
              }));
            
            setProfessores(professoresData);
          }
        } catch (error) {
          console.error('Erro ao carregar professores:', error);
        } finally {
          setLoadingProfessores(false);
        }
      };
      
      fetchProfessores();
    }
  }, [isOpen]);

  const handleSaveTurma = async () => {
    if (!nome || !serie) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (!professorId) {
      alert('Selecione um professor responsável');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para API
      const novaTurmaData = {
        className: nome,
        teacherId: parseInt(professorId),
        subject: serie
      };
      
      // Enviar para a API
      const response = await turmaService.createClass(novaTurmaData);
      
      if (response.success) {
        alert('Turma criada com sucesso!');
        // Limpar formulário
        setNome('');
        setSerie('');
        setAno(new Date().getFullYear());
        setProfessorId('');
        onClose();
      } else {
        alert(`Erro ao criar turma: ${response.message}`);
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      alert('Erro ao criar turma. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
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
            {loadingProfessores ? (
              <div className="h-10 flex items-center text-sm text-gray-500">
                Carregando professores...
              </div>
            ) : (
              <select
                id="professor"
                value={professorId}
                onChange={(e) => setProfessorId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um professor</option>
                {professores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome} {professor.disciplina ? `- ${professor.disciplina}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveTurma}
            disabled={loading}
            className={`${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-6 py-2 rounded-md flex items-center transition-colors`}
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            <span>{loading ? 'Criando...' : 'Criar Turma'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
