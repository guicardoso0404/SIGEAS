import React from "react";
import Header from "../../components/layout/Header";
import { BookOpen, Users, GraduationCap, Target } from "lucide-react";
import type { User, Pedagogue } from "../../types/Usertypes";

function StatCard({
  title,
  value,
  badge,
  color = "blue",
}: {
  title: string;
  value: string | number;
  badge?: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const map = {
    blue: {
      ring: "ring-blue-100",
      text: "text-blue-700",
      chipBg: "bg-blue-100",
      chipText: "text-blue-800",
    },
    green: {
      ring: "ring-green-100",
      text: "text-green-700",
      chipBg: "bg-green-100",
      chipText: "text-green-800",
    },
    purple: {
      ring: "ring-purple-100",
      text: "text-purple-700",
      chipBg: "bg-purple-100",
      chipText: "text-purple-800",
    },
    orange: {
      ring: "ring-orange-100",
      text: "text-orange-700",
      chipBg: "bg-orange-100",
      chipText: "text-orange-800",
    },
  }[color];

  return (
    <div
      className={`rounded-xl border border-black/5 bg-white p-5 ring-1 ${map.ring}`}
    >
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className={`text-2xl font-semibold ${map.text}`}>{value}</span>
        {badge ? (
          <span
            className={`px-2 py-1 text-xs rounded-full ${map.chipBg} ${map.chipText}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  //
  const mockTurmas = [
    { id: 1, nome: "9º Ano A", serie: "Fundamental", ano: "2023" },
    { id: 2, nome: "8º Ano B", serie: "Fundamental", ano: "2023" },
  ];

  const mockAlunos = [
    { id: 1, nome: "Pedro", turmaId: 1 },
    { id: 2, nome: "Ana", turmaId: 1 },
    { id: 3, nome: "Carlos", turmaId: 2 },
  ];

  // Exemplo de dados contendo SÓ pedagogos (admins)1
  const pedagogos: Pedagogue[] = [
    {
      idUser: 1,
      nameUser: "Maria Silva",
      email: "admin@escola.com",
      role: "pedagogue",
      age: 30,
      managedClasses: [1, 20, 40, 50],
    },
    {
      idUser: 2,
      nameUser: "Bernardo Silva",
      email: "adminBernardo@escola.com",
      role: "pedagogue",
      age: 45,
      managedClasses: [1, 20, 12, 45],
    },
  ];

  // KPIs específicos do pedagogo
  const totalPedagogos = pedagogos.length;
  const totalTurmasGeridas = pedagogos.reduce(
    (sum, p) => sum + (p.managedClasses?.length || 0),
    0
  );
  const mediaTurmasPorPedagogo =
    totalPedagogos > 0
      ? (totalTurmasGeridas / totalPedagogos).toFixed(1)
      : "0.0";

  // (Opcional) Alunos sob gestão (se você tiver esse dado em outro array, agregue aqui)
  // Para o exemplo, vamos só ilustrar um número estimado:
  const alunosEstimadosPorTurma = 25;
  const alunosEstimados = totalTurmasGeridas * alunosEstimadosPorTurma;

  return (
    <>
      <Header />

      <div className="p-4 sm:ml-64">
        <div className="p-4  mt-14">
          {/* Título */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Dashboard Administrativo (Pedagogia)
            </h1>
            <p className="text-slate-600 mt-2">
              Visão geral do trabalho pedagógico
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Pedagogos ativos"
              value={totalPedagogos}
              badge="Equipe"
              color="green"
            />
            <StatCard
              title="Turmas geridas (total)"
              value={totalTurmasGeridas}
              badge="Cobertura"
              color="blue"
            />
            <StatCard
              title="Média de turmas por pedagogo"
              value={mediaTurmasPorPedagogo}
              badge="Eficiência"
              color="purple"
            />
            <StatCard
              title="Alunos estimados sob gestão"
              value={alunosEstimados}
              badge="Estimativa"
              color="orange"
            />
          </div>

          {/* Lista de Pedagogos */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Equipe Pedagógica
              </h2>
              <div className="text-sm px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Sistema Online
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pedagogos.map((p) => (
                <div
                  key={p.idUser}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50/30 rounded-xl border border-blue-100/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {p.nameUser}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {p.email}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          Turmas: {p.managedClasses?.length ?? 0}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          Id: {p.idUser}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-800">
                          Idade: {p.age}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    // onClick={() => ... navegar para perfil do pedagogo }
                  >
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Turmas por pedagogo */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Turmas por Pedagogo
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pedagogos.map((p) => (
                <div key={p.idUser} className="rounded-xl border p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {p.nameUser}
                        </p>
                        <p className="text-xs text-slate-500">
                          Pedagogo • {p.email}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                      {p.managedClasses?.length ?? 0} turmas
                    </span>
                  </div>

                  {p.managedClasses?.length ? (
                    <ul className="space-y-2">
                      {p.managedClasses.map((id) => (
                        <li
                          key={id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                        >
                          <span className="text-sm text-slate-700">
                            Turma #{id}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {alunosEstimadosPorTurma} alunos (est.)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Sem turmas vinculadas.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-2 border-1 rounded-lg p-4">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                Turmas por Série
              </h3>
              <span style={{ fontSize: "1.5rem" }}>📚</span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {mockTurmas.map((turma) => (
                <div
                  key={turma.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "linear-gradient(to right, #ffffff, #eff6ff)",
                    borderRadius: "12px",
                    border: "1px solid #dbeafe",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        background:
                          "linear-gradient(to right, #3b82f6, #8b5cf6)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.5rem",
                      }}
                    >
                      📚
                    </div>
                    <div>
                      <p style={{ fontWeight: "bold", color: "#1e293b" }}>
                        {turma.nome}
                      </p>
                      <p style={{ color: "#64748b", fontSize: "14px" }}>
                        {turma.serie} • Ano {turma.ano}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      fontSize: "14px",
                      fontWeight: "bold",
                      borderRadius: "9999px",
                    }}
                  >
                    {mockAlunos.filter((a) => a.turmaId === turma.id).length}{" "}
                    alunos
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  icon: BookOpen,
                  label: "Nova Turma",
                  classes: "from-blue-500 to-blue-600",
                },
                {
                  icon: Users,
                  label: "Cadastrar Professor",
                  classes: "from-green-500 to-green-600",
                },
                {
                  icon: GraduationCap,
                  label: "Matricular Aluno",
                  classes: "from-purple-500 to-purple-600",
                },
                {
                  icon: Target,
                  label: "Relatórios",
                  classes: "from-orange-500 to-orange-600",
                },
              ].map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`flex flex-col items-center justify-center p-6 bg-gradient-to-r ${action.classes} text-white rounded-xl shadow-lg hover:shadow-xl transition`}
                  // onClick={() => ... }
                >
                  <action.icon className="w-8 h-8 mb-3" />
                  <span className="font-medium text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
