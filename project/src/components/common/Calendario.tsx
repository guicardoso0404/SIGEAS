import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { mockAtividades, mockPresencas, mockTurmas, mockAlunos } from '../../data/mockData';
import { Card } from './Card';
import { ClipboardList, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

interface CalendarioProps {
  userType: 'professor' | 'aluno';
}


export const Calendario: React.FC<CalendarioProps> = ({ userType }) => {
  const { user } = useAuth();
  if (!user) return null;

  type Evento = {
    date: string;
    type: 'atividade' | 'presenca';
    title: string;
    desc: string;
  };
  const eventos: Evento[] = [];
  if (userType === 'professor') {

    mockAtividades
      .filter((a) => a.professorId === user.id)
      .forEach((a) => {
        eventos.push({
          date: a.dataEntrega,
          type: 'atividade',
          title: a.titulo,
          desc: `Entrega para a turma ${a.turmaId}`
        });
      });
  } else {

    const aluno = mockAlunos.find(a => a.id === user.id);
    mockAtividades
      .filter((a) => a.turmaId === aluno?.turmaId)
      .forEach((a) => {
        eventos.push({
          date: a.dataEntrega,
          type: 'atividade',
          title: a.titulo,
          desc: `Entrega da atividade`,
        });
      });

    mockPresencas
      .filter((p) => p.alunoId === user.id)
      .forEach((p) => {
        const turma = mockTurmas.find((t) => t.id === p.turmaId);
        eventos.push({
          date: p.data,
          type: 'presenca',
          title: turma ? `Aula ${turma.nome}` : 'Aula',
          desc: p.presente ? 'Presente' : 'Falta',
        });
      });
  }

  eventos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        <p className="text-gray-600 mt-1">Veja as próximas atividades e aulas</p>
      </div>
      {eventos.length > 0 ? (
        <div className="space-y-4">
          {eventos.map((ev, idx) => (
            <Card key={idx} className="p-4 flex items-center">
              <div className="flex-shrink-0 mr-4">
                {ev.type === 'atividade' ? (
                  <ClipboardList className="w-6 h-6 text-purple-600" />
                ) : ev.desc === 'Presente' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                <p className="text-base font-semibold text-gray-900">{ev.title}</p>
                <p className="text-sm text-gray-600">{ev.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum evento disponível.</p>
      )}
    </div>
  );
};