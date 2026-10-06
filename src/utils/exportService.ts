import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { UserProfile, NutritionTargets, Meal, MacroTotals, BodyMeasurement, NutritionistReportOptions } from '../types';

interface ExportDataParams {
  user: UserProfile | null;
  targets: NutritionTargets | null;
  meals: Meal[];
  rangeLabel: string;
  waterIntakeMl?: number;
}

export class ExportService {
  /**
   * Export to formatted PDF document
   */
  static exportToPDF({ user, targets, meals, rangeLabel, waterIntakeMl }: ExportDataParams): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;

    // Header Background Accent
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(0, 0, pageWidth, 6, 'F');

    // App & Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('NutriMacro - Relatório Nutricional', 14, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Período Selecionado: ${rangeLabel} | Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 14, y);

    y += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // User Profile Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Perfil do Usuário & Metas', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    const userName = user?.name || 'Usuário';
    const userEmail = user?.email || 'Não informado';
    const goalText = user?.goal || 'Manutenção';
    const currentWeight = user?.currentWeight ? `${user.currentWeight} kg` : '-';
    const targetWeight = user?.targetWeight ? `${user.targetWeight} kg` : '-';

    doc.text(`Nome: ${userName}`, 14, y);
    doc.text(`E-mail: ${userEmail}`, 110, y);
    y += 5;
    doc.text(`Objetivo: ${goalText.toUpperCase()}`, 14, y);
    doc.text(`Peso Atual: ${currentWeight} | Meta: ${targetWeight}`, 110, y);
    y += 5;

    if (targets) {
      doc.text(
        `Metas Diárias: ${targets.calories} kcal | P: ${targets.protein}g | C: ${targets.carbs}g | G: ${targets.fat}g | Água: ${targets.waterMl || 2500}ml`,
        14,
        y
      );
      y += 5;
    }

    if (typeof waterIntakeMl === 'number') {
      const waterGoal = targets?.waterMl || 2660;
      const pct = Math.round((waterIntakeMl / waterGoal) * 100);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(2, 132, 199); // Sky/cyan
      doc.text(
        `Hidratação Registrada: ${waterIntakeMl} ml de ${waterGoal} ml (${pct}% da meta diária)`,
        14,
        y
      );
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
    }
    y += 8;
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Meals Detailed Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`2. Registro Detalhado de Refeições (${meals.length} refeições)`, 14, y);
    y += 7;

    if (meals.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Nenhuma refeição registrada no período selecionado.', 14, y);
    } else {
      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      doc.text('Data/Hora', 16, y);
      doc.text('Refeição / Alimentos', 46, y);
      doc.text('Calorias', 125, y);
      doc.text('Proteínas', 145, y);
      doc.text('Carbos', 165, y);
      doc.text('Gorduras', 182, y);
      y += 6;

      // Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      meals.forEach((meal) => {
        // Page break if needed
        if (y > 270) {
          doc.addPage();
          y = 18;
        }

        const mealTotals = meal.items.reduce(
          (acc, item) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fat: acc.fat + (item.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${meal.date} ${meal.time}`, 16, y);
        doc.text(`${meal.name || meal.type}`, 46, y);
        doc.text(`${Math.round(mealTotals.calories)} kcal`, 125, y);
        doc.text(`${Math.round(mealTotals.protein)}g`, 145, y);
        doc.text(`${Math.round(mealTotals.carbs)}g`, 165, y);
        doc.text(`${Math.round(mealTotals.fat)}g`, 182, y);
        y += 4.5;

        // Print individual items indented
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        meal.items.forEach((item) => {
          if (y > 275) {
            doc.addPage();
            y = 18;
          }
          doc.text(`• ${item.name} (${item.quantity}${item.unit})`, 50, y);
          doc.text(`${Math.round(item.calories)} kcal`, 125, y);
          doc.text(`${Math.round(item.protein)}g`, 145, y);
          doc.text(`${Math.round(item.carbs)}g`, 165, y);
          doc.text(`${Math.round(item.fat)}g`, 182, y);
          y += 4;
        });

        y += 2;
        doc.setDrawColor(241, 245, 249);
        doc.line(16, y, pageWidth - 16, y);
        y += 4;
      });
    }

    doc.save(`NutriMacro_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Export to XLSX Excel workbook
   */
  static exportToXLSX({ user, targets, meals }: ExportDataParams): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Detailed Items
    const itemsData: any[] = [];
    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        itemsData.push({
          Data: meal.date,
          Horário: meal.time,
          'Tipo Refeição': meal.type,
          'Nome da Refeição': meal.name || meal.type,
          Alimento: item.name,
          Quantidade: item.quantity,
          Unidade: item.unit,
          'Calorias (kcal)': Math.round(item.calories),
          'Proteínas (g)': Math.round(item.protein * 10) / 10,
          'Carboidratos (g)': Math.round(item.carbs * 10) / 10,
          'Gorduras (g)': Math.round(item.fat * 10) / 10,
        });
      });
    });

    const wsItems = XLSX.utils.json_to_sheet(itemsData.length > 0 ? itemsData : [{ Aviso: 'Nenhum registro encontrado' }]);
    XLSX.utils.book_append_sheet(wb, wsItems, 'Alimentos e Refeições');

    // Sheet 2: Daily Totals
    const dailyMap = new Map<string, MacroTotals>();
    meals.forEach((meal) => {
      const current = dailyMap.get(meal.date) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      meal.items.forEach((item) => {
        current.calories += item.calories;
        current.protein += item.protein;
        current.carbs += item.carbs;
        current.fat += item.fat;
      });
      dailyMap.set(meal.date, current);
    });

    const dailyData: any[] = [];
    dailyMap.forEach((totals, date) => {
      dailyData.push({
        Data: date,
        'Calorias Totais (kcal)': Math.round(totals.calories),
        'Meta Calorias': targets?.calories || 0,
        'Saldo Calórico': Math.round(totals.calories - (targets?.calories || 0)),
        'Proteínas (g)': Math.round(totals.protein),
        'Meta Proteína': targets?.protein || 0,
        'Carboidratos (g)': Math.round(totals.carbs),
        'Meta Carboidratos': targets?.carbs || 0,
        'Gorduras (g)': Math.round(totals.fat),
        'Meta Gorduras': targets?.fat || 0,
      });
    });

    const wsDaily = XLSX.utils.json_to_sheet(dailyData.length > 0 ? dailyData : [{ Aviso: 'Nenhum total diário' }]);
    XLSX.utils.book_append_sheet(wb, wsDaily, 'Totais Diários');

    // Sheet 3: Perfil e Metas
    const profileData = [
      { Parâmetro: 'Nome do Usuário', Valor: user?.name || 'Não informado' },
      { Parâmetro: 'E-mail', Valor: user?.email || 'Não informado' },
      { Parâmetro: 'Objetivo', Valor: user?.goal || 'Manutenção' },
      { Parâmetro: 'Peso Atual (kg)', Valor: user?.currentWeight || 0 },
      { Parâmetro: 'Meta de Peso (kg)', Valor: user?.targetWeight || 0 },
      { Parâmetro: 'Altura (cm)', Valor: user?.height || 0 },
      { Parâmetro: 'Meta Calórica Diária (kcal)', Valor: targets?.calories || 0 },
      { Parâmetro: 'Meta Proteica Diária (g)', Valor: targets?.protein || 0 },
      { Parâmetro: 'Meta de Carboidratos Diária (g)', Valor: targets?.carbs || 0 },
      { Parâmetro: 'Meta de Gorduras Diária (g)', Valor: targets?.fat || 0 },
      { Parâmetro: 'Meta de Água (ml)', Valor: targets?.waterMl || 2500 },
      { Parâmetro: 'Data de Exportação', Valor: new Date().toISOString() },
    ];
    const wsProfile = XLSX.utils.json_to_sheet(profileData);
    XLSX.utils.book_append_sheet(wb, wsProfile, 'Perfil & Metas');

    XLSX.writeFile(wb, `NutriMacro_Dados_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Export to DOC (Word compatible formatted document)
   */
  static exportToDOC({ user, targets, meals, rangeLabel }: ExportDataParams): void {
    let mealsRows = '';
    meals.forEach((meal) => {
      const mealTotals = meal.items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const itemsList = meal.items
        .map(
          (i) =>
            `<li style="margin-bottom: 3px;"><strong>${i.name}</strong> - ${i.quantity}${i.unit} (${Math.round(i.calories)} kcal | P: ${Math.round(i.protein)}g | C: ${Math.round(i.carbs)}g | G: ${Math.round(i.fat)}g)</li>`
        )
        .join('');

      mealsRows += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; vertical-align: top;">${meal.date}<br/><small style="color: #64748b;">${meal.time}</small></td>
          <td style="padding: 8px; vertical-align: top;">
            <strong>${meal.name || meal.type}</strong>
            <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 11px; color: #475569;">${itemsList}</ul>
          </td>
          <td style="padding: 8px; text-align: right; vertical-align: top; font-weight: bold;">${Math.round(mealTotals.calories)} kcal</td>
          <td style="padding: 8px; text-align: right; vertical-align: top;">${Math.round(mealTotals.protein)}g</td>
          <td style="padding: 8px; text-align: right; vertical-align: top;">${Math.round(mealTotals.carbs)}g</td>
          <td style="padding: 8px; text-align: right; vertical-align: top;">${Math.round(mealTotals.fat)}g</td>
        </tr>
      `;
    });

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>NutriMacro - Relatório Nutricional</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; padding: 20px; }
          h1 { color: #059669; font-size: 22pt; margin-bottom: 4px; border-bottom: 2px solid #059669; padding-bottom: 6px; }
          h2 { color: #0f172a; font-size: 14pt; margin-top: 20px; margin-bottom: 8px; }
          .meta-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
          th { background-color: #f1f5f9; color: #334155; text-align: left; padding: 8px; border-bottom: 2px solid #cbd5e1; }
          .footer { font-size: 9pt; color: #94a3b8; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>NutriMacro - Relatório Nutricional & Evolução</h1>
        <p><strong>Período:</strong> ${rangeLabel} | <strong>Emitido em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>

        <div class="meta-box">
          <h2>1. Dados do Usuário & Metas Nutricionais</h2>
          <p>
            <strong>Atleta/Usuário:</strong> ${user?.name || 'Não informado'} (${user?.email || 'Sem e-mail'})<br/>
            <strong>Objetivo:</strong> ${user?.goal?.toUpperCase() || 'MANUTENÇÃO'} | <strong>Peso Atual:</strong> ${user?.currentWeight || '-'} kg | <strong>Meta de Peso:</strong> ${user?.targetWeight || '-'} kg<br/>
            <strong>Metas Diárias:</strong> ${targets?.calories || 0} kcal | Proteínas: ${targets?.protein || 0}g | Carboidratos: ${targets?.carbs || 0}g | Gorduras: ${targets?.fat || 0}g | Água: ${targets?.waterMl || 2500}ml
          </p>
        </div>

        <h2>2. Registros de Refeições</h2>
        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Refeição & Alimentos</th>
              <th style="text-align: right;">Calorias</th>
              <th style="text-align: right;">Proteínas</th>
              <th style="text-align: right;">Carbos</th>
              <th style="text-align: right;">Gorduras</th>
            </tr>
          </thead>
          <tbody>
            ${mealsRows || '<tr><td colspan="6" style="padding: 12px; text-align: center; color: #94a3b8;">Nenhum registro encontrado para este período.</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          Relatório gerado pelo NutriMacro - Acompanhamento Nutricional com IA.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NutriMacro_Relatorio_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates a clinical summary text formatted for WhatsApp or messaging
   */
  static generateNutritionistSummaryText(options: NutritionistReportOptions): string {
    const { user, targets, meals, measurements, rangeDays, nutritionistName, patientNotes } = options;
    const now = new Date();
    const periodDays = rangeDays || 30;

    let filteredMeals = meals;
    let filteredMeasurements = measurements;
    if (rangeDays && rangeDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - rangeDays);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      filteredMeals = meals.filter((m) => m.date >= cutoffStr);
      filteredMeasurements = measurements.filter((m) => m.date >= cutoffStr);
    }

    // Daily totals
    const dailyMap = new Map<string, { cals: number; prot: number; carb: number; fat: number }>();
    filteredMeals.forEach((meal) => {
      const existing = dailyMap.get(meal.date) || { cals: 0, prot: 0, carb: 0, fat: 0 };
      meal.items.forEach((item) => {
        existing.cals += item.calories || 0;
        existing.prot += item.protein || 0;
        existing.carb += item.carbs || 0;
        existing.fat += item.fat || 0;
      });
      dailyMap.set(meal.date, existing);
    });

    const daysLogged = dailyMap.size;
    let sumCals = 0;
    let sumProt = 0;
    let sumCarb = 0;
    let sumFat = 0;
    dailyMap.forEach((d) => {
      sumCals += d.cals;
      sumProt += d.prot;
      sumCarb += d.carb;
      sumFat += d.fat;
    });

    const avgCals = daysLogged > 0 ? Math.round(sumCals / daysLogged) : 0;
    const avgProt = daysLogged > 0 ? Math.round(sumProt / daysLogged) : 0;
    const avgCarb = daysLogged > 0 ? Math.round(sumCarb / daysLogged) : 0;
    const avgFat = daysLogged > 0 ? Math.round(sumFat / daysLogged) : 0;

    const currentWeight = user?.currentWeight || (filteredMeasurements.length > 0 ? filteredMeasurements[filteredMeasurements.length - 1].weight : 70);
    const protPerKg = (avgProt / currentWeight).toFixed(1);

    const sortedMeasurements = [...filteredMeasurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const startWeight = sortedMeasurements.length > 0 ? sortedMeasurements[0].weight : currentWeight;
    const deltaWeight = (currentWeight - startWeight).toFixed(1);

    const greeting = nutritionistName ? `Olá ${nutritionistName}!` : 'Olá Nutricionista!';
    const userName = user?.name || 'Paciente';

    let msg = `📋 *Relatório NutriMacro — ${userName}*\n`;
    msg += `${greeting} Segue o resumo da minha evolução e consumo de macros nos últimos ${periodDays} dias:\n\n`;
    msg += `⚖️ *Peso Atual:* ${currentWeight} kg (${Number(deltaWeight) > 0 ? `+${deltaWeight}` : deltaWeight} kg no período)\n`;
    msg += `🎯 *Meta de Peso:* ${user?.targetWeight || '-'} kg | *Objetivo:* ${user?.goal || 'Manutenção'}\n`;
    msg += `📅 *Dias Registrados:* ${daysLogged} de ${periodDays} dias\n\n`;
    msg += `🔥 *Consumo Calórico Médio:* ${avgCals} kcal/dia (Meta: ${targets?.calories || 0} kcal)\n`;
    msg += `🥩 *Proteína Média:* ${avgProt}g/dia (~${protPerKg} g/kg | Meta: ${targets?.protein || 0}g)\n`;
    msg += `🍚 *Carboidratos Médios:* ${avgCarb}g/dia (Meta: ${targets?.carbs || 0}g)\n`;
    msg += `🥑 *Gorduras Médias:* ${avgFat}g/dia (Meta: ${targets?.fat || 0}g)\n`;
    if (targets?.waterMl) {
      msg += `💧 *Meta de Água:* ${targets.waterMl} ml/dia\n`;
    }

    if (patientNotes && patientNotes.trim()) {
      msg += `\n💬 *Minhas Observações para a Consulta:*\n"${patientNotes.trim()}"\n`;
    }

    msg += `\n📄 *O PDF clínico completo com evolução e análise detalhada foi gerado e salvo.*`;

    return msg;
  }

  /**
   * Export comprehensive Clinical Nutrition & Evolution PDF optimized for sharing with a nutritionist
   */
  static exportToNutritionistPDF(options: NutritionistReportOptions): { filename: string; blob: Blob } {
    const {
      user,
      targets,
      meals,
      measurements,
      rangeDays,
      nutritionistName,
      nutritionistCrn,
      patientNotes,
      includeMeasurements = true,
      includeMealsDetail = true,
      includeHydration = true,
      waterIntakeMl,
    } = options;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm

    // Filter by period
    let filteredMeals = meals;
    let filteredMeasurements = measurements;
    let periodLabel = 'Todo o Histórico';

    if (rangeDays && rangeDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - rangeDays);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      filteredMeals = meals.filter((m) => m.date >= cutoffStr);
      filteredMeasurements = measurements.filter((m) => m.date >= cutoffStr);
      periodLabel = rangeDays === 1 ? 'Últimas 24 Horas' : `Últimos ${rangeDays} Dias`;
    }

    // Daily totals calculation
    const dailyMap = new Map<string, { cals: number; prot: number; carb: number; fat: number; count: number }>();
    filteredMeals.forEach((meal) => {
      const existing = dailyMap.get(meal.date) || { cals: 0, prot: 0, carb: 0, fat: 0, count: 0 };
      existing.count += 1;
      meal.items.forEach((item) => {
        existing.cals += item.calories || 0;
        existing.prot += item.protein || 0;
        existing.carb += item.carbs || 0;
        existing.fat += item.fat || 0;
      });
      dailyMap.set(meal.date, existing);
    });

    const daysWithMeals = dailyMap.size;
    let sumCals = 0;
    let sumProt = 0;
    let sumCarb = 0;
    let sumFat = 0;
    dailyMap.forEach((d) => {
      sumCals += d.cals;
      sumProt += d.prot;
      sumCarb += d.carb;
      sumFat += d.fat;
    });

    const avgCalories = daysWithMeals > 0 ? Math.round(sumCals / daysWithMeals) : 0;
    const avgProtein = daysWithMeals > 0 ? Math.round((sumProt / daysWithMeals) * 10) / 10 : 0;
    const avgCarbs = daysWithMeals > 0 ? Math.round((sumCarb / daysWithMeals) * 10) / 10 : 0;
    const avgFat = daysWithMeals > 0 ? Math.round((sumFat / daysWithMeals) * 10) / 10 : 0;

    // Body weight and metrics
    const sortedMeasurements = [...filteredMeasurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const initialWeight = sortedMeasurements.length > 0 ? sortedMeasurements[0].weight : (user?.startWeight || user?.currentWeight || 75);
    const currentWeight = user?.currentWeight || (sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1].weight : initialWeight);
    const targetWeight = user?.targetWeight || initialWeight;
    const deltaWeight = Math.round((currentWeight - initialWeight) * 10) / 10;

    const heightM = (user?.height || 170) / 100;
    const bmi = Math.round((currentWeight / (heightM * heightM)) * 10) / 10;
    let bmiCategory = 'Eutrofia (Peso Normal)';
    if (bmi < 18.5) bmiCategory = 'Baixo Peso';
    else if (bmi >= 25 && bmi < 29.9) bmiCategory = 'Sobrepeso';
    else if (bmi >= 30) bmiCategory = 'Obesidade';

    // Estimated BMR (Mifflin-St Jeor)
    const isMale = user?.gender !== 'female';
    const age = user?.age || 28;
    const bmr = isMale
      ? Math.round(10 * currentWeight + 6.25 * (user?.height || 170) - 5 * age + 5)
      : Math.round(10 * currentWeight + 6.25 * (user?.height || 170) - 5 * age - 161);
    const tdee = Math.round(bmr * 1.55); // Moderate activity fallback

    // Macro g/kg
    const protPerKg = (avgProtein / Math.max(1, currentWeight)).toFixed(2);
    const carbPerKg = (avgCarbs / Math.max(1, currentWeight)).toFixed(2);
    const fatPerKg = (avgFat / Math.max(1, currentWeight)).toFixed(2);

    // Adherence rate (% days within target +/- 250 kcal)
    const targetCals = targets?.calories || 2000;
    let daysAdherent = 0;
    dailyMap.forEach((d) => {
      if (Math.abs(d.cals - targetCals) <= 250) {
        daysAdherent += 1;
      }
    });
    const adherenceRate = daysWithMeals > 0 ? Math.round((daysAdherent / daysWithMeals) * 100) : 0;

    // Caloric distribution percentages
    const totalMacroCals = avgProtein * 4 + avgCarbs * 4 + avgFat * 9;
    const pctP = totalMacroCals > 0 ? Math.round((avgProtein * 4 / totalMacroCals) * 100) : 0;
    const pctC = totalMacroCals > 0 ? Math.round((avgCarbs * 4 / totalMacroCals) * 100) : 0;
    const pctG = totalMacroCals > 0 ? Math.round((avgFat * 9 / totalMacroCals) * 100) : 0;

    // Helper: Add page header
    const printHeader = (pageNumber: number) => {
      // Top colored accent bars
      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.rect(0, 0, pageWidth, 4, 'F');
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 4, pageWidth, 1.5, 'F');

      // Title & Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('NutriMacro • Relatório Clínico & Evolução Nutricional', margin, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Documento consolidado de consumo alimentar, macronutrientes e antropometria para compartilhamento profissional',
        margin,
        17.5
      );

      // Professional Destinatary / Sub-info
      const destText = nutritionistName
        ? `A/C: ${nutritionistName}${nutritionistCrn ? ` (CRN: ${nutritionistCrn})` : ''}`
        : 'A/C: Nutricionista / Equipe de Saúde Responsável';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(5, 150, 105);
      doc.text(destText, pageWidth - margin, 13, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      const emissionDate = new Date().toLocaleDateString('pt-BR');
      const emissionTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      doc.text(`Período: ${periodLabel} | Emissão: ${emissionDate} às ${emissionTime}`, pageWidth - margin, 17.5, { align: 'right' });

      // Separator line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, 20.5, pageWidth - margin, 20.5);
    };

    let y = 25;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 25;
        printHeader(doc.getNumberOfPages());
      }
    };

    // Print header on first page
    printHeader(1);

    // =======================================================
    // 1. BOX: IDENTIFICAÇÃO DO PACIENTE & DADOS ANTROPOMÉTRICOS
    // =======================================================
    checkPageBreak(38);
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    // Section Badge
    doc.setFillColor(16, 185, 129);
    doc.rect(margin, y, 3, 34, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Identificação do Paciente & Perfil Metabólico', margin + 6, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const userName = user?.name || 'Paciente Não Identificado';
    const userEmail = user?.email || 'Não informado';
    const userGoal = user?.goal?.toUpperCase() || 'MANUTENÇÃO';

    // Left Column
    doc.text(`Nome do Paciente:`, margin + 6, y + 12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${userName}`, margin + 36, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.text(`Idade / Sexo:`, margin + 6, y + 17);
    doc.text(`${age} anos | ${user?.gender === 'female' ? 'Feminino' : 'Masculino'}`, margin + 36, y + 17);

    doc.text(`E-mail de Contato:`, margin + 6, y + 22);
    doc.text(`${userEmail}`, margin + 36, y + 22);

    doc.text(`Objetivo Atual:`, margin + 6, y + 27);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`${userGoal}`, margin + 36, y + 27);
    doc.setTextColor(51, 65, 85);

    // Center/Right Column
    const col2X = margin + 98;
    doc.setFont('helvetica', 'normal');
    doc.text(`Estatura / Altura:`, col2X, y + 12);
    doc.text(`${user?.height || 170} cm`, col2X + 32, y + 12);

    doc.text(`Peso Atual / Inicial:`, col2X, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currentWeight} kg  (Início: ${initialWeight} kg | Δ ${deltaWeight > 0 ? `+${deltaWeight}` : deltaWeight} kg)`, col2X + 32, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.text(`IMC Atual:`, col2X, y + 22);
    doc.text(`${bmi} kg/m² — ${bmiCategory}`, col2X + 32, y + 22);

    doc.text(`Metabolismo Est.:`, col2X, y + 27);
    doc.text(`TMB: ~${bmr} kcal | Gasto Total (GET): ~${tdee} kcal`, col2X + 32, y + 27);

    y += 38;

    // =======================================================
    // 2. TABELA: METAS PRESCRITAS VS CONSUMO REAL (MACRONUTRIENTES)
    // =======================================================
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Avaliação de Ingestão Diária vs Metas Prescritas', margin, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Média calculada sobre ${daysWithMeals} dias com registro alimentar ativo no período (${adherenceRate}% de adesão à meta calórica).`,
      margin,
      y + 8.5
    );

    y += 11;

    // Table Header
    const tableY = y;
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(margin, tableY, contentWidth, 7, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, tableY, contentWidth, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    doc.text('Macronutriente / Indicador', margin + 3, tableY + 4.8);
    doc.text('Meta Prescrita', margin + 55, tableY + 4.8);
    doc.text('Média Consumida', margin + 85, tableY + 4.8);
    doc.text('Saldo Diário', margin + 118, tableY + 4.8);
    doc.text('Ingestão Relativa (g/kg)', margin + 145, tableY + 4.8);
    doc.text('% Calórico', margin + 180, tableY + 4.8, { align: 'right' });

    y += 7;

    // Table Rows
    const targetProt = targets?.protein || 0;
    const targetCarbs = targets?.carbs || 0;
    const targetFat = targets?.fat || 0;
    const targetWater = targets?.waterMl || 2500;

    const diffCals = avgCalories - targetCals;
    const diffProt = Math.round((avgProtein - targetProt) * 10) / 10;
    const diffCarbs = Math.round((avgCarbs - targetCarbs) * 10) / 10;
    const diffFat = Math.round((avgFat - targetFat) * 10) / 10;

    const rows = [
      {
        label: 'Calorias Totais (VET)',
        target: `${targetCals} kcal`,
        actual: `${avgCalories} kcal`,
        diff: `${diffCals >= 0 ? `+${diffCals}` : diffCals} kcal`,
        relative: `${(avgCalories / Math.max(1, currentWeight)).toFixed(1)} kcal/kg`,
        pct: '100%',
        color: '#0f172a',
      },
      {
        label: 'Proteínas (4 kcal/g)',
        target: `${targetProt} g`,
        actual: `${avgProtein} g`,
        diff: `${diffProt >= 0 ? `+${diffProt}` : diffProt} g`,
        relative: `${protPerKg} g/kg`,
        pct: `${pctP}%`,
        color: '#059669',
      },
      {
        label: 'Carboidratos (4 kcal/g)',
        target: `${targetCarbs} g`,
        actual: `${avgCarbs} g`,
        diff: `${diffCarbs >= 0 ? `+${diffCarbs}` : diffCarbs} g`,
        relative: `${carbPerKg} g/kg`,
        pct: `${pctC}%`,
        color: '#2563eb',
      },
      {
        label: 'Gorduras / Lipídios (9 kcal/g)',
        target: `${targetFat} g`,
        actual: `${avgFat} g`,
        diff: `${diffFat >= 0 ? `+${diffFat}` : diffFat} g`,
        relative: `${fatPerKg} g/kg`,
        pct: `${pctG}%`,
        color: '#7c3aed',
      },
      {
        label: 'Hidratação (Água)',
        target: `${targetWater} ml`,
        actual: `${waterIntakeMl || targetWater} ml`,
        diff: `${(waterIntakeMl || targetWater) >= targetWater ? 'Adequada' : `-${targetWater - (waterIntakeMl || 0)} ml`}`,
        relative: `${((waterIntakeMl || targetWater) / Math.max(1, currentWeight)).toFixed(0)} ml/kg`,
        pct: `${Math.round(((waterIntakeMl || targetWater) / targetWater) * 100)}%`,
        color: '#0284c7',
      },
    ];

    rows.forEach((r, idx) => {
      const rowY = y;
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, rowY, contentWidth, 6, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, rowY + 6, margin + contentWidth, rowY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(r.label, margin + 3, rowY + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(r.target, margin + 55, rowY + 4.2);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(r.actual, margin + 85, rowY + 4.2);

      doc.setFont('helvetica', 'normal');
      if (r.diff.startsWith('+')) {
        doc.setTextColor(217, 119, 6); // Amber
      } else if (r.diff.startsWith('-')) {
        doc.setTextColor(225, 29, 72); // Rose
      } else {
        doc.setTextColor(5, 150, 105); // Green
      }
      doc.text(r.diff, margin + 118, rowY + 4.2);

      doc.setTextColor(71, 85, 105);
      doc.text(r.relative, margin + 145, rowY + 4.2);
      doc.text(r.pct, margin + 180, rowY + 4.2, { align: 'right' });

      y += 6;
    });

    // Caloric Distribution Visual Bar
    y += 3;
    checkPageBreak(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Divisão Energética Real dos Macronutrientes:`, margin, y);

    const barW = contentWidth;
    const barH = 4.5;
    const barY = y + 2;

    const wP = (pctP / 100) * barW;
    const wC = (pctC / 100) * barW;
    const wG = barW - wP - wC;

    // Protein chunk
    doc.setFillColor(16, 185, 129); // Green
    doc.rect(margin, barY, wP, barH, 'F');
    // Carbs chunk
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(margin + wP, barY, wC, barH, 'F');
    // Fat chunk
    doc.setFillColor(168, 85, 247); // Purple
    doc.rect(margin + wP + wC, barY, wG, barH, 'F');

    // Bar legend
    y = barY + barH + 3.5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(5, 150, 105);
    doc.text(`■ Proteína: ${pctP}% (${avgProtein * 4} kcal)`, margin, y);
    doc.setTextColor(37, 99, 235);
    doc.text(`■ Carboidrato: ${pctC}% (${avgCarbs * 4} kcal)`, margin + 65, y);
    doc.setTextColor(126, 34, 206);
    doc.text(`■ Gorduras: ${pctG}% (${avgFat * 9} kcal)`, margin + 135, y);

    y += 7;

    // =======================================================
    // 3. EVOLUÇÃO CORPORAL E HISTÓRICO ANTROPOMÉTRICO
    // =======================================================
    if (includeMeasurements && sortedMeasurements.length > 0) {
      checkPageBreak(38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Evolução Corporal & Histórico de Pesagens', margin, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Registros antropométricos do paciente ordenados cronologicamente (Variação total no período: ${deltaWeight > 0 ? `+${deltaWeight}` : deltaWeight} kg).`,
        margin,
        y + 8.5
      );

      y += 11;

      // Table Header
      const measHeaderY = y;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, measHeaderY, contentWidth, 6, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, measHeaderY, contentWidth, 6, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      doc.text('Data', margin + 3, measHeaderY + 4.2);
      doc.text('Peso (kg)', margin + 30, measHeaderY + 4.2);
      doc.text('Variação (Δ)', margin + 55, measHeaderY + 4.2);
      doc.text('Cintura (cm)', margin + 85, measHeaderY + 4.2);
      doc.text('Quadril (cm)', margin + 115, measHeaderY + 4.2);
      doc.text('Braço (cm)', margin + 145, measHeaderY + 4.2);
      doc.text('Gordura (% BF est.)', margin + 180, measHeaderY + 4.2, { align: 'right' });

      y += 6;

      // Show up to 8 recent measurements in table
      const displayedMeasurements = sortedMeasurements.slice(-8);
      displayedMeasurements.forEach((m, idx) => {
        checkPageBreak(6);
        const rowY = y;
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, rowY, contentWidth, 5.5, 'F');
        }
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, rowY + 5.5, margin + contentWidth, rowY + 5.5);

        const deltaVsStart = idx > 0 ? (m.weight - sortedMeasurements[0].weight).toFixed(1) : '0.0';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(m.date, margin + 3, rowY + 3.8);

        doc.setFont('helvetica', 'normal');
        doc.text(`${m.weight.toFixed(1)} kg`, margin + 30, rowY + 3.8);

        doc.setTextColor(Number(deltaVsStart) <= 0 ? 5 : 217, Number(deltaVsStart) <= 0 ? 150 : 119, Number(deltaVsStart) <= 0 ? 105 : 6);
        doc.text(`${Number(deltaVsStart) > 0 ? `+${deltaVsStart}` : deltaVsStart} kg`, margin + 55, rowY + 3.8);

        doc.setTextColor(71, 85, 105);
        doc.text(m.waist ? `${m.waist} cm` : '-', margin + 85, rowY + 3.8);
        doc.text(m.hips ? `${m.hips} cm` : '-', margin + 115, rowY + 3.8);
        doc.text(m.arm ? `${m.arm} cm` : '-', margin + 145, rowY + 3.8);
        doc.text(m.bodyFat ? `${m.bodyFat}%` : '-', margin + 180, rowY + 3.8, { align: 'right' });

        y += 5.5;
      });

      y += 4;
    }

    // =======================================================
    // 4. PADRÃO DE CRONONUTRIÇÃO E REFEIÇÕES
    // =======================================================
    checkPageBreak(36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('4. Padrão de Fracionamento & Crononutrição', margin, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Distribuição média de energia e proteínas nas principais refeições do dia para análise de timing nutricional.',
      margin,
      y + 8.5
    );

    y += 11;

    // Group by meal types
    const mealTypeStats: Record<string, { label: string; count: number; sumCals: number; sumProt: number }> = {
      breakfast: { label: 'Café da Manhã', count: 0, sumCals: 0, sumProt: 0 },
      morning_snack: { label: 'Colação (Manhã)', count: 0, sumCals: 0, sumProt: 0 },
      lunch: { label: 'Almoço', count: 0, sumCals: 0, sumProt: 0 },
      snack: { label: 'Lanche da Tarde', count: 0, sumCals: 0, sumProt: 0 },
      dinner: { label: 'Jantar', count: 0, sumCals: 0, sumProt: 0 },
      supper: { label: 'Ceia Noturna', count: 0, sumCals: 0, sumProt: 0 },
    };

    filteredMeals.forEach((meal) => {
      const typeKey = meal.type in mealTypeStats ? meal.type : 'lunch';
      const slot = mealTypeStats[typeKey];
      slot.count += 1;
      meal.items.forEach((it) => {
        slot.sumCals += it.calories || 0;
        slot.sumProt += it.protein || 0;
      });
    });

    // Draw cards for active meal types
    const activeSlots = Object.values(mealTypeStats).filter((s) => s.count > 0);
    const cardW = (contentWidth - 6 * (Math.min(activeSlots.length, 4) - 1)) / Math.min(activeSlots.length, 4);

    if (activeSlots.length > 0) {
      let cardX = margin;
      activeSlots.slice(0, 4).forEach((s) => {
        const avgSlotCals = Math.round(s.sumCals / s.count);
        const avgSlotProt = Math.round((s.sumProt / s.count) * 10) / 10;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(cardX, y, cardW, 16, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(s.label, cardX + 3, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(`${avgSlotCals} kcal médias`, cardX + 3, y + 8.5);
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
        doc.text(`${avgSlotProt}g proteína`, cardX + 3, y + 12.5);

        cardX += cardW + 6;
      });
      y += 20;
    }

    // Top Consumed Foods
    const foodFrequency = new Map<string, { count: number; totalGrams: number }>();
    filteredMeals.forEach((m) => {
      m.items.forEach((it) => {
        const key = it.name.trim();
        const cur = foodFrequency.get(key) || { count: 0, totalGrams: 0 };
        cur.count += 1;
        cur.totalGrams += it.quantity || 0;
        foodFrequency.set(key, cur);
      });
    });

    const topFoods = Array.from(foodFrequency.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6);

    if (topFoods.length > 0) {
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Alimentos de Maior Recorrência na Rotina do Paciente:', margin, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const topFoodStrings = topFoods.map(
        ([name, data]) => `• ${name} (${data.count}x)`
      );
      doc.text(topFoodStrings.slice(0, 3).join('   |   '), margin, y);
      if (topFoodStrings.length > 3) {
        y += 4;
        doc.text(topFoodStrings.slice(3, 6).join('   |   '), margin, y);
      }
      y += 6;
    }

    // =======================================================
    // 5. OBSERVAÇÕES E NOTAS DO PACIENTE PARA O NUTRICIONISTA
    // =======================================================
    if (patientNotes && patientNotes.trim()) {
      checkPageBreak(24);
      doc.setFillColor(254, 243, 199); // Amber 100
      doc.setDrawColor(251, 191, 36); // Amber 400
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(146, 64, 14); // Amber 800
      doc.text('5. Mensagem & Apontamentos do Paciente para a Consulta:', margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 53, 15);
      const splitNotes = doc.splitTextToSize(patientNotes.trim(), contentWidth - 8);
      doc.text(splitNotes, margin + 4, y + 10);

      y += 22;
    }

    // =======================================================
    // 6. ESPAÇO PARA CONDUTA CLÍNICA & PRESCRIÇÃO DO NUTRICIONISTA
    // =======================================================
    checkPageBreak(42);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('6. Parecer Clínico, Conduta e Ajuste de Metas (Nutricionista)', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Dotted lines for handwritten notes
    doc.text('Diagnóstico / Conduta: __________________________________________________________________________________________', margin + 4, y + 11);
    doc.text('Ajuste de Macronutrientes Prescritos (kcal / P / C / G): ___________________________________________________________', margin + 4, y + 17);
    doc.text('Orientações e Exames: __________________________________________________________________________________________', margin + 4, y + 23);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Próximo Retorno: _____ / _____ / _________', margin + 4, y + 31);
    doc.text('Assinatura & Carimbo (CRN): _____________________________________', margin + 85, y + 31);

    y += 40;

    // Add footers and page numbers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('NutriMacro — Gestão & Inteligência Nutricional • Relatório emitido para fins clínicos e acompanhamento profissional', margin, pageHeight - 7.5);
      doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
    }

    const cleanName = (user?.name || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `NutriMacro_Relatorio_Nutricionista_${cleanName}_${dateStr}.pdf`;

    // Save download
    doc.save(filename);

    const blob = doc.output('blob');
    return { filename, blob };
  }

  /**
   * Share via Native Share API or trigger instant download with WhatsApp text copy
   */
  static async shareOrDownloadNutritionistReport(
    options: NutritionistReportOptions
  ): Promise<{ shared: boolean; downloaded: boolean; whatsAppText: string }> {
    const { filename, blob } = this.exportToNutritionistPDF(options);
    const whatsAppText = this.generateNutritionistSummaryText(options);

    let shared = false;
    // Check if navigator.share supports files
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Relatório Nutricional NutriMacro',
            text: whatsAppText,
            files: [file],
          });
          shared = true;
        }
      } catch (e) {
        console.warn('Native share error or dismissed:', e);
      }
    }

    // Copy formatted text to clipboard if possible
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(whatsAppText);
      } catch (e) {
        // ignore clipboard error
      }
    }

    return { shared, downloaded: true, whatsAppText };
  }
}

