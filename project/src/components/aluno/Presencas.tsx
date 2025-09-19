import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Presenca } from '../../types';
import { presencaService } from '../../services/presencaService';
import { turmaService } from '../../services/turmaService';


export const Presencas: React.FC = () => {
  const { user } = useAuth();
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [turmas, setTurmas] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    const fetchPresencas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar o serviço para buscar as presenças do aluno logado
        const presencasData = await presencaService.getStudentAttendance();
        
        // Ordenar por data decrescente
        const sortedPresencas = presencasData.sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        
        setPresencas(sortedPresencas);
        
        // Buscar informações das turmas para exibir os nomes
        try {
          const turmasData = await turmaService.getAllClasses();
          const turmasObj: {[key: string]: string} = {};
          turmasData.forEach(turma => {
            turmasObj[turma.id] = turma.nome;
          });
          setTurmas(turmasObj);
        } catch (err) {
          console.error('Erro ao buscar turmas:', err);
          // Não interromper o fluxo principal se as turmas não forem carregadas
        }
      } catch (err) {
        console.error('Erro ao buscar presenças do aluno:', err);
        setError('Não foi possível carregar seus registros de presença. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchPresencas();
    }
  }, [user?.id]);


  const totalAulas = presencas.length;
  const totalPresencas = presencas.filter(p => p.presente).length;
  const percentual = totalAulas > 0 ? (totalPresencas / totalAulas) * 100 : 0;

  const getTurmaNome = (turmaId: string) => {
    return turmas[turmaId] || 'Turma não encontrada';
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
        
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-pulse text-gray-500">Carregando registros de presença...</div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        ) : presencas.length > 0 ? (
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
        {!loading && !error && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de aulas: {totalAulas}</span>
              <span className="text-gray-600">Presenças: {totalPresencas}</span>
              <span className={`font-medium ${percentual >= 75 ? 'text-green-600' : 'text-red-600'}`}>{percentual.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};