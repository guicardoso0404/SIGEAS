import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Nota } from '../../types';
import { notasService } from '../../services/notasService';


export const MinhasNotas: React.FC = () => {
  const { user } = useAuth();
  const [notasAluno, setNotasAluno] = useState<Nota[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNotas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar o serviço para buscar as notas do aluno logado
        const notas = await notasService.getStudentGrades();
        setNotasAluno(notas);
      } catch (err) {
        console.error('Erro ao buscar notas do aluno:', err);
        setError('Não foi possível carregar suas notas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchNotas();
    }
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Notas</h1>
        <p className="text-gray-600 mt-1">Acompanhe as notas de todas as disciplinas</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-purple-600" />
          Lançamentos de Notas
        </h3>
        
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-pulse text-gray-500">Carregando notas...</div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        ) : notasAluno.length > 0 ? (
          <div className="space-y-4">
            {notasAluno.map(nota => (
              <div key={nota.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{nota.disciplina}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      nota.mediaFinal && nota.mediaFinal >= 7 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Média: {nota.mediaFinal?.toFixed(1) ?? '-'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 flex flex-wrap">
                  <span>Nota 1: {nota.nota1 ?? '-'}</span>
                  <span className="mx-4">Nota 2: {nota.nota2 ?? '-'}</span>
                  <span>Data: {new Date(nota.dataLancamento).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhuma nota lançada ainda.</p>
        )}
      </div>
    </div>
  );
};