import React from 'react';
const chamadaMock = [
  { nome: 'Aluno 1', presente: true, nota: 8.5 },
  { nome: 'Aluno 2', presente: false, nota: 7.0 },
  { nome: 'Aluno 3', presente: true, nota: 9.2 },
];

const ChamadaNotasProfessor: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Chamada e Notas dos Alunos</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Aluno</th>
            <th className="border px-2 py-1">Presença</th>
            <th className="border px-2 py-1">Nota</th>
          </tr>
        </thead>
        <tbody>
          {chamadaMock.map((aluno, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{aluno.nome}</td>
              <td className="border px-2 py-1">{aluno.presente ? 'Presente' : 'Faltou'}</td>
              <td className="border px-2 py-1">{aluno.nota}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChamadaNotasProfessor;
