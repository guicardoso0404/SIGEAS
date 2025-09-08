import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Calendar, Target } from 'lucide-react';
import { Card, StatCard } from '../common/Card';
import { useAuth } from '../../hooks/useAuth';
import { mockTurmas, mockAlunos, mockNotas, mockPresencas } from '../../data/mockData';

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();

  // Dados para gráficos
  const notasData = [
    { disciplina: 'Matemática', media: 8.2, aprovados: 85 },
    { disciplina: 'Português', media: 7.8, aprovados: 78 },
    { disciplina: 'História', media: 8.5, aprovados: 92 },
    { disciplina: 'Geografia', media: 7.9, aprovados: 81 },
    { disciplina: 'Ciências', media: 8.1, aprovados: 87 },
    { disciplina: 'Inglês', media: 7.6, aprovados: 74 }
  ];

  const presencaData = [
    { mes: 'Jan', presenca: 92 },
    { mes: 'Fev', presenca: 88 },
    { mes: 'Mar', presenca: 94 },
    { mes: 'Abr', presenca: 89 },
    { mes: 'Mai', presenca: 91 },
    { mes: 'Jun', presenca: 93 }
  ];

  const turmasData = [
    { serie: '6º Ano', alunos: 28, cor: '#3B82F6' },
    { serie: '7º Ano', alunos: 32, cor: '#10B981' },
    { serie: '8º Ano', alunos: 29, cor: '#F59E0B' },
    { serie: '9º Ano', alunos: 31, cor: '#EF4444' }
  ];

  const performanceData = [
    { periodo: 'Q1', matematica: 7.8, portugues: 8.1, ciencias: 7.9 },
    { periodo: 'Q2', matematica: 8.2, portugues: 8.3, ciencias: 8.1 },
    { periodo: 'Q3', matematica: 8.0, portugues: 8.0, ciencias: 8.3 },
    { periodo: 'Q4', matematica: 8.4, portugues: 8.2, ciencias: 8.5 }
  ];

  const stats = [
    {
      title: 'Total de Alunos',
      value: mockAlunos.length,
      icon: Users,
      color: 'bg-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Média Geral',
      value: '8.2',
      icon: TrendingUp,
      color: 'bg-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Taxa de Presença',
      value: '91%',
      icon: Calendar,
      color: 'bg-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      trend: { value: 3, isPositive: true }
    },
    {
      title: 'Taxa de Aprovação',
      value: '83%',
      icon: Award,
      color: 'bg-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      trend: { value: 8, isPositive: true }
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Análise detalhada do desempenho escolar</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-4 py-2 bg-white/80 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Último trimestre</option>
            <option>Último semestre</option>
            <option>Último ano</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notas por Disciplina */}
        <Card className="p-6" gradient>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Desempenho por Disciplina</h3>
            <Target className="w-6 h-6 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={notasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="disciplina" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="media" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Presença ao longo do tempo */}
        <Card className="p-6" gradient>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Taxa de Presença</h3>
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={presencaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="presenca" 
                stroke="#10B981" 
                fill="url(#colorGradient2)"
                strokeWidth={3}
              />
              <defs>
                <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição de Alunos por Série */}
        <Card className="p-6" gradient>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Distribuição por Série</h3>
            <BookOpen className="w-6 h-6 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={turmasData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="alunos"
              >
                {turmasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {turmasData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.cor }}
                />
                <span className="text-sm text-slate-600">{item.serie}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Comparativa */}
        <Card className="p-6" gradient>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Performance Trimestral</h3>
            <TrendingUp className="w-6 h-6 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="matematica" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="portugues" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ciencias" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-600">Matemática</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">Português</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-slate-600">Ciências</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-blue-900">Melhor Performance</h4>
          </div>
          <p className="text-blue-800 mb-2">História apresenta a melhor média geral</p>
          <p className="text-sm text-blue-600">Média: 8.5 | Aprovação: 92%</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-green-900">Destaque do Mês</h4>
          </div>
          <p className="text-green-800 mb-2">7º Ano com maior crescimento</p>
          <p className="text-sm text-green-600">+15% na média geral</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-orange-900">Atenção Necessária</h4>
          </div>
          <p className="text-orange-800 mb-2">Inglês precisa de reforço</p>
          <p className="text-sm text-orange-600">Média: 7.6 | Aprovação: 74%</p>
        </Card>
      </div>
    </div>
  );
};