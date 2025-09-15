import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { mockAtividades, mockSubmissoes, mockAlunos } from '../../data/mockData';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';


export const TarefasAluno: React.FC = () => {
  const { user } = useAuth();

  const aluno = mockAlunos.find(a => a.id === user?.id);

  const atividadesDaTurma = mockAtividades.filter(a => a.turmaId === aluno?.turmaId);

  const [conteudos, setConteudos] = useState<{ [key: string]: string }>({});
  const handleChange = (atividadeId: string, value: string) => {
    setConteudos({ ...conteudos, [atividadeId]: value });
  };

  const handleSubmit = (atividadeId: string) => {
    if (!user) return;
    const conteudo = conteudos[atividadeId];
    if (!conteudo) return;
    const novaSub = {
      id: Date.now().toString(),
      atividadeId,
      alunoId: user.id,
      conteudo,
      dataEnvio: new Date().toISOString()
    };
    mockSubmissoes.push(novaSub);

    setConteudos({ ...conteudos, [atividadeId]: '' });
  };
  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
        <p className="text-gray-600 mt-1">Veja e entregue as atividades da sua turma</p>
      </div>
      {atividadesDaTurma.length > 0 ? (
        <div className="space-y-6">
          {atividadesDaTurma.map(atividade => {
            const submissao = mockSubmissoes.find(
              s => s.atividadeId === atividade.id && s.alunoId === user?.id
            );
            return (
              <Card key={atividade.id} className="p-6">
                <div className="flex items-center mb-2">
                  <ClipboardList className="w-5 h-5 mr-2 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">{atividade.titulo}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-1">Entrega: {new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-3">{atividade.descricao}</p>
                {submissao ? (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-5 h-5 mr-1" /> Enviado em {new Date(submissao.dataEnvio).toLocaleDateString('pt-BR')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite sua resposta aqui..."
                      value={conteudos[atividade.id] || ''}
                      onChange={(e) => handleChange(atividade.id, e.target.value)}
                      rows={3}
                    ></textarea>
                    <Button onClick={() => handleSubmit(atividade.id)}>Enviar</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">Não há tarefas disponíveis para a sua turma.</p>
      )}
    </div>
  );
};