import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

// Componente para depuração das notas dos alunos
export const NotasDebug: React.FC = () => {
  const { user } = useAuth();
  const [notasDirectas, setNotasDirectas] = useState<any[]>([]);
  const [notasDebug, setNotasDebug] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          setError('Usuário não identificado');
          return;
        }

        // Tentar endpoint normal primeiro
        try {
          const response = await fetch('http://localhost:3001/student/grades', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sigeas-token')}`
            }
          });
          const data = await response.json();
          console.log('Dados do endpoint normal:', data);
          setNotasDirectas(data.data || []);
        } catch (err) {
          console.error('Erro ao buscar do endpoint normal:', err);
          setNotasDirectas([]);
        }

        // Tentar endpoint de debug sem autenticação
        try {
          const debugResponse = await fetch(`http://localhost:3001/debug-student-grades/${user.id}`);
          const debugData = await debugResponse.json();
          console.log('Dados do endpoint debug:', debugData);
          setNotasDebug(debugData.data || []);
        } catch (err) {
          console.error('Erro ao buscar do endpoint debug:', err);
          setNotasDebug([]);
        }

      } catch (err) {
        console.error('Erro geral:', err);
        setError('Erro ao carregar dados para depuração');
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, [user?.id]);

  const gerarNotasDeTesteHandler = async () => {
    try {
      if (!user?.id) return;

      setLoading(true);
      // Encontrar uma matrícula para o aluno
      const enrollmentsResponse = await fetch('http://localhost:3001/debug-all-enrollments');
      const enrollmentsData = await enrollmentsResponse.json();
      
      if (!enrollmentsData.success || !enrollmentsData.data?.enrollments?.length) {
        alert('Nenhuma matrícula encontrada para gerar notas');
        return;
      }

      // Filtrar matrículas do aluno atual
      const studentEnrollments = enrollmentsData.data.enrollments.filter(
        (e: any) => e.studentId === Number(user.id)
      );

      if (studentEnrollments.length === 0) {
        alert('Você não está matriculado em nenhuma turma');
        return;
      }

      // Criar notas de teste para a primeira turma
      const classId = studentEnrollments[0].classId;
      const response = await fetch('http://localhost:3001/create-test-grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${data.data.totalGrades} notas criadas com sucesso!`);
        // Recarregar dados
        window.location.reload();
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (err) {
      console.error('Erro ao gerar notas de teste:', err);
      alert('Erro ao gerar notas de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-bold text-yellow-800 mb-4">Depuração de Notas</h2>
        
        <div className="flex justify-end mb-4">
          <button
            onClick={gerarNotasDeTesteHandler}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
          >
            {loading ? 'Processando...' : 'Gerar Notas de Teste'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Endpoint normal */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Endpoint Normal (/student/grades)</h3>
            <div className="bg-white p-4 rounded-md shadow-sm overflow-auto max-h-96">
              {notasDirectas.length > 0 ? (
                <pre className="text-xs">{JSON.stringify(notasDirectas, null, 2)}</pre>
              ) : (
                <p className="text-gray-500 italic">Nenhum dado encontrado</p>
              )}
            </div>
          </div>

          {/* Endpoint debug */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Endpoint Debug (/debug-student-grades)</h3>
            <div className="bg-white p-4 rounded-md shadow-sm overflow-auto max-h-96">
              {notasDebug.length > 0 ? (
                <pre className="text-xs">{JSON.stringify(notasDebug, null, 2)}</pre>
              ) : (
                <p className="text-gray-500 italic">Nenhum dado encontrado</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Instruções</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Se suas notas não estão aparecendo, clique em "Gerar Notas de Teste"</li>
            <li>Verifique se você está matriculado em alguma turma</li>
            <li>O backend deve estar rodando na porta 3001</li>
            <li>Certifique-se de que sua autenticação está funcionando corretamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotasDebug;