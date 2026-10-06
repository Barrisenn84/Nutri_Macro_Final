import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  CreditCard,
  QrCode,
  Sparkles,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Star,
  Activity,
  Award,
  Zap,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SaaSPlan, SaaSClient } from '../../types';
import confetti from 'canvas-confetti';

export const BusinessHubView: React.FC = () => {
  const { user, showToast, allMeals, measurements } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'plans' | 'checkout' | 'clients' | 'ai_advisor'>('metrics');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<string>('plan_pro');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [pixCopied, setPixCopied] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Business AI Insights state
  const [isLoadingAiInsights, setIsLoadingAiInsights] = useState(false);
  const [aiBusinessInsights, setAiBusinessInsights] = useState<any>(null);

  // Filter clients
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'pro' | 'vip' | 'free'>('all');

  // SaaS Plans
  const plans: SaaSPlan[] = [
    {
      id: 'plan_free',
      name: 'Gratuito (Básico)',
      priceMonthly: 0,
      features: [
        'Registro manual de refeições',
        'Cálculo de macros e TDEE',
        'Até 5 fotos com IA por mês',
        'Acesso à Tabela TACO',
      ],
      ctaText: 'Plano Atual Padrão',
    },
    {
      id: 'plan_pro',
      name: 'NutriMacro Pro Atleta',
      badge: 'Mais Popular',
      isPopular: true,
      priceMonthly: 29.90,
      priceQuarterly: 79.90,
      priceAnnual: 249.00,
      features: [
        'Fotos IA ilimitadas (Gemini 3.8 Vision)',
        'Voz em Tempo Real (Gemini 3.8 Live API)',
        'Leitor de Código de Barras Ilimitado',
        'Sincronização em nuvem e histórico completo',
        'Exportação de relatórios em PDF e Excel',
      ],
      ctaText: 'Assinar Plano Pro',
    },
    {
      id: 'plan_vip',
      name: 'NutriMacro VIP + Coach IA',
      badge: 'Completo',
      priceMonthly: 49.90,
      priceQuarterly: 129.90,
      priceAnnual: 399.00,
      features: [
        'Tudo do Plano Pro incluído',
        'Auditoria Nutricional Semanal por IA',
        'Planejador Inteligente de Próximo Prato',
        'Projeção Corporal e Estimativa de BF%',
        'Suporte Prioritário e Consultoria Nutricional',
      ],
      ctaText: 'Garantir Acesso VIP',
    },
  ];

  // Mock SaaS clients/athletes
  const [clients, setClients] = useState<SaaSClient[]>([
    {
      id: 'cli_1',
      name: user?.name || 'Carlos Silveira',
      email: user?.email || 'carlos.atleta@gmail.com',
      plan: 'vip',
      status: 'active',
      goal: 'Hipertrofia',
      weightCurrentKg: user?.currentWeight || 75.5,
      weightTargetKg: user?.targetWeight || 80.0,
      adherenceRate: 96,
      lastActive: 'Hoje às 11:20',
      joinedDate: '15/01/2026',
    },
    {
      id: 'cli_2',
      name: 'Mariana Duarte',
      email: 'mari.duarte.fit@gmail.com',
      plan: 'pro',
      status: 'active',
      goal: 'Cutting (Secar)',
      weightCurrentKg: 64.2,
      weightTargetKg: 60.0,
      adherenceRate: 92,
      lastActive: 'Ontem',
      joinedDate: '02/02/2026',
    },
    {
      id: 'cli_3',
      name: 'Rodrigo Medeiros',
      email: 'rodrigo.crossfit@outlook.com',
      plan: 'vip',
      status: 'active',
      goal: 'Hipertrofia',
      weightCurrentKg: 88.0,
      weightTargetKg: 85.0,
      adherenceRate: 88,
      lastActive: 'Há 2 horas',
      joinedDate: '10/02/2026',
    },
    {
      id: 'cli_4',
      name: 'Camila Fernandes',
      email: 'camila.fernandes@uol.com.br',
      plan: 'free',
      status: 'trial',
      goal: 'Manutenção',
      weightCurrentKg: 58.0,
      weightTargetKg: 58.0,
      adherenceRate: 74,
      lastActive: 'Há 3 dias',
      joinedDate: '28/02/2026',
    },
    {
      id: 'cli_5',
      name: 'Lucas Brandão',
      email: 'lucas.brandao99@gmail.com',
      plan: 'pro',
      status: 'active',
      goal: 'Definição',
      weightCurrentKg: 79.8,
      weightTargetKg: 74.0,
      adherenceRate: 95,
      lastActive: 'Hoje às 08:45',
      joinedDate: '12/03/2026',
    },
  ]);

  // Load Business AI Insights
  const handleFetchAiInsights = async () => {
    setIsLoadingAiInsights(true);
    try {
      const res = await fetch('/api/ai/business-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mrr: 14280,
          activeUsers: 320,
          proSubscribers: 185,
          retentionRate: 94.2,
        }),
      });
      const data = await res.json();
      if (data.success && data.insights) {
        setAiBusinessInsights(data.insights);
        showToast('Diagnóstico de Negócio gerado pela IA!');
      }
    } catch (err) {
      showToast('Erro ao consultar insights de negócio.');
    } finally {
      setIsLoadingAiInsights(false);
    }
  };

  useEffect(() => {
    handleFetchAiInsights();
  }, []);

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      showToast('Assinatura ativada com sucesso!');
    }, 1200);
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesFilter = clientFilter === 'all' || c.plan === clientFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-lg border border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Gestão do Negócio & SaaS NutriMacro
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Painel comercial para total controle, gestão de faturamento, planos de assinatura, alunos cadastrados e estratégias de monetização.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveTab('checkout');
              setSelectedPlanForCheckout('plan_pro');
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Simulador de Checkout</span>
          </button>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'metrics' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Métricas de Faturamento</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'plans' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Planos & Monetização</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'clients' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Gestão de Alunos ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('checkout')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'checkout' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Gateway de Checkout (PIX/Cartão)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_advisor')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ai_advisor' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>IA Estratégia de Crescimento</span>
        </button>
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">MRR (Receita Mensal)</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl sm:text-2xl font-black text-slate-900">R$ 14.280</span>
                <span className="text-xs text-emerald-600 font-bold">+14.2%</span>
              </div>
              <span className="text-[11px] text-slate-500 block">Projeção: R$ 16.200 próx. mês</span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-emerald-200/90 shadow-xs ring-1 ring-emerald-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Assinantes Pagantes</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl sm:text-2xl font-black text-emerald-800">185</span>
                <span className="text-xs text-emerald-600 font-bold">Atletas</span>
              </div>
              <span className="text-[11px] text-emerald-700 block">68% Plano Pro • 32% VIP</span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Taxa de Retenção</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl sm:text-2xl font-black text-slate-900">94.2%</span>
                <span className="text-xs text-emerald-600 font-bold">Baixo Churn</span>
              </div>
              <span className="text-[11px] text-slate-500 block">Fidelidade alta pela IA diária</span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ticket Médio (ARPU)</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl sm:text-2xl font-black text-slate-900">R$ 77,18</span>
              </div>
              <span className="text-[11px] text-slate-500 block">LTV médio de R$ 420,00</span>
            </div>
          </div>

          {/* Revenue Breakdown & Chart Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Histórico de Crescimento & Vendas (2026)</h3>
                  <p className="text-xs text-slate-500">Evolução do faturamento líquido mês a mês</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Operação Lucrativa
                </span>
              </div>

              {/* Monthly Bar Progression */}
              <div className="space-y-3 pt-2">
                {[
                  { month: 'Janeiro/2026', rev: 9400, percent: 58, clients: 120 },
                  { month: 'Fevereiro/2026', rev: 11800, percent: 72, clients: 152 },
                  { month: 'Março/2026', rev: 13100, percent: 82, clients: 168 },
                  { month: 'Abril/2026 (Atual)', rev: 14280, percent: 89, clients: 185 },
                  { month: 'Maio/2026 (Meta IA)', rev: 16200, percent: 100, clients: 210 },
                ].map((item, idx) => (
                  <div key={item.month} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700 font-semibold">
                      <span>{item.month}</span>
                      <span className="font-mono font-bold text-slate-900">
                        R$ {item.rev.toLocaleString('pt-BR')} ({item.clients} alunos)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 4
                            ? 'bg-gradient-to-r from-teal-400 to-emerald-400 border border-emerald-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Quick Actions */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Ações Rápidas de Gestão</h3>
                <p className="text-xs text-slate-500">Ferramentas de exportação contábil e operacional</p>

                <div className="space-y-2 pt-1 text-xs">
                  <button
                    onClick={() => showToast('Relatório contábil gerado em formato XLSX!')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Exportar Vendas (.XLSX)</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => showToast('DRE e Demonstrativo gerados em formato PDF!')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Demonstrativo DRE (.PDF)</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('ai_advisor');
                      handleFetchAiInsights();
                    }}
                    className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-between text-emerald-900 font-bold cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Auditoria Comercial IA</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1 text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sistema 100% Produção
                </span>
                <p className="text-[11px] text-slate-500">
                  Banco Firestore ativo, autenticação segura, endpoints de IA integrados e Push API nativa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANS & MONETIZATION */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-lg font-black text-slate-900">Planos & Pacotes NutriMacro</h2>
            <p className="text-xs text-slate-500">
              Estrutura de preços calibrada para maximizar conversão e retenção de praticantes e atletas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isSelected = selectedPlanForCheckout === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-3xl bg-white border flex flex-col justify-between transition-all relative ${
                    p.isPopular
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                      : 'border-slate-200 shadow-sm'
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                      {p.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                      <div className="mt-3 flex items-baseline gap-1 font-mono">
                        <span className="text-3xl font-black text-slate-900">
                          {p.priceMonthly === 0 ? 'Grátis' : `R$ ${p.priceMonthly.toFixed(2)}`}
                        </span>
                        {p.priceMonthly > 0 && <span className="text-xs text-slate-500 font-sans">/mês</span>}
                      </div>
                      {p.priceAnnual && (
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                          Ou R$ {p.priceAnnual.toFixed(2)} no plano anual (2 meses off)
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setSelectedPlanForCheckout(p.id);
                        setActiveTab('checkout');
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                        p.isPopular
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {p.ctaText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CHECKOUT GATEWAY */}
      {activeTab === 'checkout' && (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Gateway de Pagamento & Checkout</h2>
            <p className="text-xs text-slate-500">
              Ambiente de pagamento seguro com suporte imediato a PIX, Cartão de Crédito e Boleto
            </p>
          </div>

          {paymentSuccess ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-emerald-950">Pagamento Aprovado com Sucesso!</h3>
                <p className="text-xs text-emerald-800">
                  Sua conta foi atualizada para o plano selecionado. Todos os recursos de IA e sincronização estão liberados!
                </p>
              </div>
              <button
                onClick={() => setPaymentSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Simular Novo Pagamento
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-xs">
              {/* Plan Choice Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800">Plano Escolhido:</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlanForCheckout('plan_pro')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlanForCheckout === 'plan_pro'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-slate-900">NutriMacro Pro</p>
                    <p className="text-sm font-black font-mono text-emerald-800">R$ 29,90 / mês</p>
                  </div>

                  <div
                    onClick={() => setSelectedPlanForCheckout('plan_vip')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlanForCheckout === 'plan_vip'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-slate-900">Nutri VIP + Coach IA</p>
                    <p className="text-sm font-black font-mono text-emerald-800">R$ 49,90 / mês</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800">Método de Pagamento:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX Instantâneo</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de Crédito</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('boleto')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                      paymentMethod === 'boleto'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Boleto Bancário</span>
                  </button>
                </div>
              </div>

              {/* PIX Flow */}
              {paymentMethod === 'pix' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">QR Code PIX Copia e Cola</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Aprovação em 3 segundos
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                      <QrCode className="w-16 h-16 text-slate-800" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="text-slate-600 text-[11px]">
                        Abra o app do seu banco, escolha <strong>Pagar com PIX</strong> e aponte a câmera ou use o código:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value="00020126580014br.gov.bcb.pix0136nutrimacro-pay@banco.com.br520400005303986540529.905802BR5920NUTRIMACRO SAAS LTDA"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600 truncate"
                        />
                        <button
                          onClick={() => {
                            setPixCopied(true);
                            setTimeout(() => setPixCopied(false), 2000);
                            showToast('Código PIX copiado!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {pixCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{pixCopied ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Flow */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        defaultValue="4532 •••• •••• 8829"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Validade (MM/AA)</label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">CVV</label>
                      <input
                        type="text"
                        defaultValue="842"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Boleto Flow */}
              {paymentMethod === 'boleto' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <p className="text-slate-700">O boleto será gerado com vencimento para 3 dias úteis.</p>
                  <p className="font-mono text-[11px] text-slate-500">23793.38128 60083.010283 56000.063302 1 98450000002990</p>
                </div>
              )}

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando Transação...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar & Ativar Assinatura</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CLIENTS & ATHLETES MANAGEMENT */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold">
              {(['all', 'pro', 'vip', 'free'] as const).map((fil) => (
                <button
                  key={fil}
                  onClick={() => setClientFilter(fil)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer capitalize ${
                    clientFilter === fil ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {fil === 'all' ? 'Todos' : fil.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Aluno / Atleta</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Objetivo</th>
                    <th className="py-3 px-4">Peso Atual / Meta</th>
                    <th className="py-3 px-4">Adesão</th>
                    <th className="py-3 px-4">Última Atividade</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.plan === 'vip'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : c.plan === 'pro'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{c.goal}</td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-900">{c.weightCurrentKg} kg</span>
                        <span className="text-slate-400 text-[11px]"> / {c.weightTargetKg} kg</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={c.adherenceRate >= 90 ? 'text-emerald-600' : 'text-amber-600'}>
                          {c.adherenceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.lastActive}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => showToast(`Relatório de evolução de ${c.name} gerado!`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer transition-colors"
                        >
                          Ver Prontuário
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI GROWTH STRATEGY ADVISOR */}
      {activeTab === 'ai_advisor' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">IA Consultora de Negócios e Monetização SaaS</h3>
              </div>
              <button
                onClick={handleFetchAiInsights}
                disabled={isLoadingAiInsights}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
              >
                {isLoadingAiInsights ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Atualizar Diagnóstico</span>
              </button>
            </div>

            {aiBusinessInsights && (
              <div className="space-y-4 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                      Score de Saúde Financeira
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black font-mono">
                      {aiBusinessInsights.healthScore}/100
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-xs">{aiBusinessInsights.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block">
                      Oportunidades de Alto Impacto
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {aiBusinessInsights.topOpportunities?.map((op: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{op}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {aiBusinessInsights.recommendedCampaign && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-teal-900/40 border border-emerald-500/30 space-y-2">
                      <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] block">
                        Campanha Recomendada para Este Mês
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {aiBusinessInsights.recommendedCampaign.title}
                      </h4>
                      <p className="text-slate-300 text-xs">
                        {aiBusinessInsights.recommendedCampaign.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-300">
                        <span>Público: {aiBusinessInsights.recommendedCampaign.targetSegment}</span>
                        <span className="font-bold font-mono">
                          Desconto: {aiBusinessInsights.recommendedCampaign.discountPercent}% OFF
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
