import React, { useState } from 'react';
import { Target, BarChart, PieChart, LineChart, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { motion } from 'framer-motion';
import { mockTurmas, mockAlunos, mockProfessores } from '../../data/mockData';

interface RelatoriosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RelatoriosModal: React.FC<RelatoriosModalProps> = ({ isOpen, onClose }) => {
  const [tipoRelatorio, setTipoRelatorio] = useState('');
  

  const relatoriosTurmas = {
    totalTurmas: mockTurmas.length,
    turmasMaiores: mockTurmas.map(t => ({
      ...t, 
      quantidadeAlunos: mockAlunos.filter(a => a.turmaId === t.id).length
    })).sort((a, b) => b.quantidadeAlunos - a.quantidadeAlunos).slice(0, 3)
  };
  
  const relatoriosAlunos = {
    totalAlunos: mockAlunos.length,
    mediaPorTurma: mockTurmas.length > 0 ? (mockAlunos.length / mockTurmas.length).toFixed(1) : '0'
  };
  
  const relatoriosProfessores = {
    totalProfessores: mockProfessores.length,
    disciplinas: [...new Set(mockProfessores.map(p => p.disciplina))].map(disciplina => ({
      nome: disciplina,
      quantidade: mockProfessores.filter(p => p.disciplina === disciplina).length
    }))
  };

  const tiposRelatorio = [
    { 
      id: 'turmas', 
      titulo: 'Relatório de Turmas', 
      descricao: 'Detalhamento de turmas, quantitativo e distribuição por série',
      icon: BarChart,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'alunos', 
      titulo: 'Relatório de Alunos', 
      descricao: 'Estatísticas de alunos matriculados e distribuição por turma',
      icon: PieChart,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'professores', 
      titulo: 'Relatório de Professores', 
      descricao: 'Distribuição de professores por disciplina e carga horária',
      icon: LineChart,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Relatórios">
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selecione o tipo de relatório</h3>
          
          <div className="space-y-3">
            {tiposRelatorio.map(tipo => (
              <motion.div
                key={tipo.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setTipoRelatorio(tipo.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  tipoRelatorio === tipo.id 
                    ? 'border-orange-500 bg-orange-50 shadow-md' 
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${tipo.color} rounded-lg flex items-center justify-center`}>
                      <tipo.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{tipo.titulo}</h4>
                      <p className="text-sm text-gray-500">{tipo.descricao}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${tipoRelatorio === tipo.id ? 'text-orange-500' : 'text-gray-300'}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {tipoRelatorio === 'turmas' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800">Total de Turmas</h4>
              <p className="text-2xl font-bold text-blue-600">{relatoriosTurmas.totalTurmas}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Turmas com mais alunos:</h4>
              <div className="space-y-2">
                {relatoriosTurmas.turmasMaiores.map(turma => (
                  <div key={turma.id} className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{turma.nome}</p>
                      <p className="text-sm text-gray-500">{turma.serie}</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {turma.quantidadeAlunos} alunos
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {tipoRelatorio === 'alunos' && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800">Total de Alunos</h4>
              <p className="text-2xl font-bold text-purple-600">{relatoriosAlunos.totalAlunos}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800">Média de Alunos por Turma</h4>
              <p className="text-2xl font-bold text-purple-600">{relatoriosAlunos.mediaPorTurma}</p>
            </div>
          </div>
        )}
        
        {tipoRelatorio === 'professores' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-medium text-green-800">Total de Professores</h4>
              <p className="text-2xl font-bold text-green-600">{relatoriosProfessores.totalProfessores}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Distribuição por disciplina:</h4>
              <div className="space-y-2">
                {relatoriosProfessores.disciplinas.map((disciplina, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                    <p className="font-medium">{disciplina.nome}</p>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {disciplina.quantidade} professor{disciplina.quantidade > 1 ? 'es' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Fechar
          </motion.button>
          
          {tipoRelatorio && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition"
            >
              Gerar PDF
            </motion.button>
          )}
        </div>
      </div>
    </Modal>
  );
};
