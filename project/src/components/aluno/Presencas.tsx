import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockPresencas, mockTurmas } from '../../data/mockData';
import { Presenca } from '../../types';

/**
 * Exibe o histórico de presenças do aluno autenticado. Mostra
 * individualmente cada aula registrada com data, nome da turma e
 * status de presença. Também apresenta um resumo com o total de
 * aulas, quantidade de presenças e porcentagem geral. Se não houver
 * registros, informa o usuário adequadamente.
 */
export const Presencas: React.FC = () => {
  const { user } = useAuth();
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  
  useEffect(() => {
    // Carregar presenças do localStorage
    const savedPresencas = localStorage.getItem('sigeas_presencas');
    
    if (savedPresencas) {
      const todasPresencas = JSON.parse(savedPresencas) as Presenca[];
      // Filtrar apenas as presenças do aluno atual e ordenar por data decrescente
      const presencasDoAluno = todasPresencas
        .filter(p => p.alunoId === user?.id)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setPresencas(presencasDoAluno);
    } else {
      // Fallback para os dados mockados
      setPresencas(
        mockPresencas
          .filter(p => p.alunoId === user?.id)
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      );
    }
  }, [user?.id]);

  // Calcular métricas de presença
  const totalAulas = presencas.length;
  const totalPresencas = presencas.filter(p => p.presente).length;
  const percentual = totalAulas > 0 ? (totalPresencas / totalAulas) * 100 : 0;

  const getTurmaNome = (turmaId: string) => {
    const turma = mockTurmas.find(t => t.id === turmaId);
    return turma ? turma.nome : '-';
  };

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Presenças</h1>
        <p className="text-gray-600 mt-1">Acompanhe o registro das suas presenças nas aulas</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Histórico de Presenças
        </h3>
        {presencas.length > 0 ? (
          <div className="space-y-3">
            {presencas.map(presenca => (
              <div key={presenca.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{getTurmaNome(presenca.turmaId)}</p>
                    <p className="text-xs text-gray-500">{new Date(presenca.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  presenca.presente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {presenca.presente ? 'Presente' : 'Falta'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhuma presença registrada até o momento.</p>
        )}
        {/* Resumo */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total de aulas: {totalAulas}</span>
            <span className="text-gray-600">Presenças: {totalPresencas}</span>
            <span className={`font-medium ${percentual >= 75 ? 'text-green-600' : 'text-red-600'}`}>{percentual.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};