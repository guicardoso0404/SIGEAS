import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { mockAtividades, mockSubmissoes, mockTurmas } from '../../data/mockData';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FilePlus, ListChecks } from 'lucide-react';

/**
 * Página de gerenciamento de atividades para professores. Permite
 * visualizar atividades existentes, criar novas e acompanhar o
 * número de submissões feitas pelos alunos. Utiliza estado local
 * para refletir alterações sem persistência externa.
 */
export const AtividadesProfessor: React.FC = () => {
  const { user } = useAuth();
  // Lista de atividades filtradas pelo professor logado
  const [atividades, setAtividades] = useState(
    mockAtividades.filter(a => a.professorId === user?.id)
  );
  // Estado do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  // Turmas que o professor leciona
  const turmasProfessor = mockTurmas.filter(t => t.professorId === user?.id);
  const [turmaId, setTurmaId] = useState(turmasProfessor[0]?.id || '');

  // Cria uma nova atividade a partir dos campos do formulário
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !dataEntrega) return;
    const novaAtividade = {
      id: Date.now().toString(),
      turmaId: turmaId,
      professorId: user?.id || '',
      titulo,
      descricao,
      dataEntrega
    } as typeof mockAtividades[number];
    setAtividades([...atividades, novaAtividade]);
    // Limpa campos
    setTitulo('');
    setDescricao('');
    setDataEntrega('');
    setTurmaId(turmasProfessor[0]?.id || '');
  };

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
        <p className="text-gray-600 mt-1">Crie e gerencie as atividades das suas turmas</p>
      </div>
      {/* Formulário para criar nova atividade */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FilePlus className="w-5 h-5 mr-2 text-blue-600" /> Nova Atividade
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          {turmasProfessor.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                required
              >
                {turmasProfessor.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de entrega</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="mt-2">Criar Atividade</Button>
        </form>
      </Card>
      {/* Lista de atividades existentes */}
      {atividades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {atividades.map((atividade) => {
            const submissions = mockSubmissoes.filter(s => s.atividadeId === atividade.id);
            return (
              <Card key={atividade.id} className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <ListChecks className="w-5 h-5 mr-2 text-purple-600" />
                  {atividade.titulo}
                </h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{atividade.descricao}</p>
                <p className="text-sm text-gray-500 mb-1">Entrega: {new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm font-medium text-gray-700">Submissões: {submissions.length}</p>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma atividade criada ainda.</p>
      )}
    </div>
  );
};