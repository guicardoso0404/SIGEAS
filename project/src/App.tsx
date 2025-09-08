import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthProvider';
import { LoginForm } from './components/auth/LoginForm';
import { Layout } from './components/common/Layout';
import { useAuth } from './hooks/useAuth';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TurmasManager } from './components/admin/TurmasManager';
import { ProfessoresManager } from './components/admin/ProfessoresManager';
import { AlunosManager } from './components/admin/AlunosManager';

// Professor Components
import { ProfessorDashboard } from './components/professor/ProfessorDashboard';
import { ChamadaLauncher } from './components/professor/ChamadaLauncher';
import { NotasLauncher } from './components/professor/NotasLauncher';
import { MinhasTurmas as ProfessorTurmas } from './components/professor/MinhasTurmas';
import { AtividadesProfessor } from './components/professor/AtividadesProfessor';

// Aluno Components
import { AlunoDashboard } from './components/aluno/AlunoDashboard';
import { MinhaTurma } from './components/aluno/MinhaTurma';
import { MinhasNotas } from './components/aluno/MinhasNotas';
import { Presencas } from './components/aluno/Presencas';
import { TarefasAluno } from './components/aluno/TarefasAluno';

// Calendário para ambos os perfis
import { Calendario } from './components/common/Calendario';

// Analytics Component
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    if (!user) return null;

    // Analytics page is available for all user types
    if (currentPage === 'analytics') {
      return <AnalyticsDashboard />;
    }

    switch (user.perfil) {
      case 'admin':
        switch (currentPage) {
          case 'turmas':
            return <TurmasManager />;
          case 'professores':
            return <ProfessoresManager />;
          case 'alunos':
            return <AlunosManager />;
          default:
            return <AdminDashboard />;
        }
      
      case 'professor':
        switch (currentPage) {
          case 'chamada':
            return <ChamadaLauncher />;
          case 'notas':
            return <NotasLauncher />;
          case 'minhas-turmas':
            return <ProfessorTurmas />;
          case 'atividades':
            return <AtividadesProfessor />;
          case 'calendario':
            return <Calendario userType="professor" />;
          default:
            return <ProfessorDashboard />;
        }
      
      case 'aluno':
        switch (currentPage) {
          case 'minha-turma':
            return <MinhaTurma />;
          case 'minhas-notas':
            return <MinhasNotas />;
          case 'presencas':
            return <Presencas />;
          case 'tarefas':
            return <TarefasAluno />;
          case 'calendario':
            return <Calendario userType="aluno" />;
          default:
            return <AlunoDashboard />;
        }
      
      default:
        return <div>Perfil não reconhecido</div>;
    }
  };

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;