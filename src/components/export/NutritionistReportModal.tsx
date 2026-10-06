import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Share2,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Droplets,
  Scale,
  Utensils,
  Stethoscope,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExportService } from '../../utils/exportService';
import { NutritionistReportOptions } from '../../types';

interface NutritionistReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRangeDays?: number;
}

export const NutritionistReportModal: React.FC<NutritionistReportModalProps> = ({
  isOpen,
  onClose,
  defaultRangeDays = 30,
}) => {
  const { user, targets, allMeals, measurements, waterIntakeMl, showToast } = useApp();

  const [rangeDays, setRangeDays] = useState<number>(defaultRangeDays);
  const [nutritionistName, setNutritionistName] = useState<string>('');
  const [nutritionistCrn, setNutritionistCrn] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');

  const [includeMeasurements, setIncludeMeasurements] = useState<boolean>(true);
  const [includeMealsDetail, setIncludeMealsDetail] = useState<boolean>(true);
  const [includeHydration, setIncludeHydration] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Quick chips for patient notes
  const quickNotesSuggestions = [
    'Aumentei a intensidade dos treinos para 5x/semana',
    'Sensação de saciedade adequada ao longo do dia',
    'Dificuldade para atingir a meta proteica nos finais de semana',
    'Sintomas digestivos confortáveis',
    'Bebendo mais de 2.5 litros de água diariamente',
  ];

  // Calculate live preview metrics based on selected range
  const previewMetrics = useMemo(() => {
    let filteredMeals = allMeals;
    let filteredMeasurements = measurements;

    if (rangeDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - rangeDays);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      filteredMeals = allMeals.filter((m) => m.date >= cutoffStr);
      filteredMeasurements = measurements.filter((m) => m.date >= cutoffStr);
    }

    const dailyMap = new Map<string, { cals: number; prot: number; carb: number; fat: number }>();
    filteredMeals.forEach((m) => {
      const cur = dailyMap.get(m.date) || { cals: 0, prot: 0, carb: 0, fat: 0 };
      m.items.forEach((it) => {
        cur.cals += it.calories || 0;
        cur.prot += it.protein || 0;
        cur.carb += it.carbs || 0;
        cur.fat += it.fat || 0;
      });
      dailyMap.set(m.date, cur);
    });

    const daysCount = dailyMap.size;
    let sumCals = 0;
    let sumProt = 0;
    dailyMap.forEach((d) => {
      sumCals += d.cals;
      sumProt += d.prot;
    });

    const avgCals = daysCount > 0 ? Math.round(sumCals / daysCount) : 0;
    const avgProt = daysCount > 0 ? Math.round((sumProt / daysCount) * 10) / 10 : 0;

    const currentWeight = user?.currentWeight || (filteredMeasurements.length > 0 ? filteredMeasurements[filteredMeasurements.length - 1].weight : 70);
    const startWeight = filteredMeasurements.length > 0 ? filteredMeasurements[0].weight : currentWeight;
    const deltaWeight = (currentWeight - startWeight).toFixed(1);

    const targetCals = targets?.calories || 2000;
    let adherentDays = 0;
    dailyMap.forEach((d) => {
      if (Math.abs(d.cals - targetCals) <= 250) adherentDays += 1;
    });
    const adherenceRate = daysCount > 0 ? Math.round((adherentDays / daysCount) * 100) : 0;

    return {
      daysCount,
      totalMeals: filteredMeals.length,
      measurementsCount: filteredMeasurements.length,
      avgCals,
      avgProt,
      protPerKg: (avgProt / Math.max(1, currentWeight)).toFixed(1),
      deltaWeight: Number(deltaWeight) > 0 ? `+${deltaWeight}` : deltaWeight,
      currentWeight,
      adherenceRate,
    };
  }, [allMeals, measurements, rangeDays, user, targets]);

  if (!isOpen) return null;

  const getReportOptions = (): NutritionistReportOptions => ({
    user,
    targets,
    meals: allMeals,
    measurements,
    rangeDays: rangeDays > 0 ? rangeDays : undefined,
    nutritionistName: nutritionistName.trim() || undefined,
    nutritionistCrn: nutritionistCrn.trim() || undefined,
    patientNotes: patientNotes.trim() || undefined,
    includeMeasurements,
    includeMealsDetail,
    includeHydration,
    waterIntakeMl,
  });

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const opts = getReportOptions();
      ExportService.exportToNutritionistPDF(opts);
      showToast('Relatório em PDF para o nutricionista gerado e baixado!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsAppOrNative = async () => {
    setIsExporting(true);
    try {
      const opts = getReportOptions();
      const result = await ExportService.shareOrDownloadNutritionistReport(opts);
      if (result.shared) {
        showToast('Relatório compartilhado com sucesso!');
      } else {
        showToast('PDF baixado e texto de resumo copiado para a área de transferência!');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao compartilhar.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyTextSummary = () => {
    const opts = getReportOptions();
    const text = ExportService.generateNutritionistSummaryText(opts);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    showToast('Resumo textual copiado! Cole no WhatsApp do seu nutricionista.');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const addQuickNote = (note: string) => {
    setPatientNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return note;
      if (trimmed.includes(note)) return prev;
      return `${trimmed}; ${note}`;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white relative flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Exportar Relatório para Nutricionista
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  PDF Clínico A4
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Gere um documento profissional com evolução corporal, médias de macronutrientes, adesão e crononutrição para compartilhar com seu profissional de saúde.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* 1. Range Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Período do Relatório</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: 'Hoje', days: 1 },
                { label: '7 Dias', days: 7 },
                { label: '14 Dias', days: 14 },
                { label: '30 Dias', days: 30 },
                { label: '60 Dias', days: 60 },
                { label: 'Tudo', days: 0 },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setRangeDays(item.days)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                    rangeDays === item.days
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Professional Info (Optional) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Identificação do Nutricionista (Opcional)</span>
              </h4>
              <span className="text-[11px] text-slate-400">Aparecerá no cabeçalho do PDF</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Nome do(a) Nutricionista
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dra. Camila Silveira"
                  value={nutritionistName}
                  onChange={(e) => setNutritionistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  CRN / Registro Profissional
                </label>
                <input
                  type="text"
                  placeholder="Ex: CRN-3 48123"
                  value={nutritionistCrn}
                  onChange={(e) => setNutritionistCrn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Included Clinical Modules */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Seções Inclusas no Relatório
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeMeasurements}
                  onChange={(e) => setIncludeMeasurements(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Evolução Antropométrica</span>
                  <span className="text-[10px] text-slate-500">Peso, cintura e medidas</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeMealsDetail}
                  onChange={(e) => setIncludeMealsDetail(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Crononutrição & Pratos</span>
                  <span className="text-[10px] text-slate-500">Fracionamento e horários</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeHydration}
                  onChange={(e) => setIncludeHydration(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Hidratação & Água</span>
                  <span className="text-[10px] text-slate-500">Média em ml/dia</span>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Notes from Patient to Nutritionist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Observações do Paciente para a Consulta</span>
              </label>
              <span className="text-[11px] text-slate-400">Impresso em destaque no PDF</span>
            </div>

            <textarea
              rows={2}
              placeholder="Ex: Senti maior disposição nos treinos da manhã. Tive um pouco de fome antes de dormir nos dias de pernas..."
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed resize-none"
            />

            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {quickNotesSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addQuickNote(sug)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Live Data Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Prévia dos Dados que Serão Enviados
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {previewMetrics.daysCount} dias com dieta
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Peso Atual</span>
                <span className="text-base font-black text-white font-mono mt-0.5 block">
                  {previewMetrics.currentWeight} kg
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {previewMetrics.deltaWeight} kg no período
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Média Calórica</span>
                <span className="text-base font-black text-white font-mono mt-0.5 block">
                  {previewMetrics.avgCals} kcal
                </span>
                <span className="text-[10px] text-slate-400">
                  Meta: {targets?.calories || 0} kcal
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Proteína Média</span>
                <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
                  {previewMetrics.avgProt}g
                </span>
                <span className="text-[10px] text-emerald-300 font-medium">
                  ~{previewMetrics.protPerKg} g/kg
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Adesão à Meta</span>
                <span className="text-base font-black text-purple-300 font-mono mt-0.5 block">
                  {previewMetrics.adherenceRate}%
                </span>
                <span className="text-[10px] text-slate-400">dias na faixa alvo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyTextSummary}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Resumo Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar Texto para WhatsApp</span>
              </>
            )}
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsAppOrNative}
              disabled={isExporting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Compartilhar diretamente ou copiar texto formatado"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar via WhatsApp</span>
            </button>

            <button
              type="button"
              id="btn-confirm-download-pdf-nutritionist"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Gerando...' : 'Baixar PDF Clínico'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
