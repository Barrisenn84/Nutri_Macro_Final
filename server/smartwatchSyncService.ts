import { GoogleGenAI, Type } from '@google/genai';
import { SmartwatchAIWorkoutAdvice } from '../src/types';

/**
 * Service handling Smartwatch data synchronization, complications, and AI workout analysis
 */
export async function generateSmartwatchWorkoutAdvice(
  ai: GoogleGenAI | null,
  workout: {
    workoutType: string;
    caloriesBurned: number;
    durationMinutes: number;
    heartRateAvg: number;
    userGoal?: string;
  }
): Promise<SmartwatchAIWorkoutAdvice> {
  const goal = workout.userGoal || 'hipertrofia';
  const cals = Math.max(50, Math.round(workout.caloriesBurned));
  const duration = Math.max(10, Math.round(workout.durationMinutes));
  const type = workout.workoutType || 'Musculação';

  // Deterministic fallback advice based on sports nutrition guidelines
  const fallbackAdvice: SmartwatchAIWorkoutAdvice = {
    summary: `Treino de ${type} concluído com sucesso (${duration} min, ~${cals} kcal gastas). Janela anabólica e reposição de glicogênio ativada.`,
    recommendedPostWorkoutSnack: {
      title: 'Shake Anabólico com Frutas & Proteína de Absorção Rápida',
      description: '30g Whey Protein ou Proteína Vegetal batida com 1 banana média e 200ml de água de coco ou leite desnatado.',
      proteinG: Math.min(35, Math.max(22, Math.round(cals * 0.05))),
      carbsG: Math.min(50, Math.max(25, Math.round(cals * 0.08))),
      fatG: 4,
      calories: Math.round(22 * 4 + 30 * 4 + 4 * 9),
      optimalTimingTimingMinutes: 45,
    } as any,
    recoveryTips: [
      `Ingerir cerca de ${Math.round(duration * 12)}ml de líquidos nas próximas 2 horas para repor o suor perdido.`,
      'Priorize carboidratos de rápida absorção para repor os estoques de glicogênio muscular.',
      'Mantenha o monitoramento de frequência cardíaca até o retorno à faixa de repouso (<80 bpm).',
    ],
  };

  // Adjust timing field if needed
  fallbackAdvice.recommendedPostWorkoutSnack.optimalTimingMinutes = 45;

  if (!ai) return fallbackAdvice;

  try {
    const prompt = `Você é um Fisiologista do Exercício e Nutricionista Esportivo de elite.
Analise os dados de telemetria recebidos diretamente do smartwatch do atleta:
- Tipo de Exercício: ${type}
- Duração: ${duration} minutos
- Calorias Queimadas (Gasto Ativo): ${cals} kcal
- Frequência Cardíaca Média: ${workout.heartRateAvg || 135} bpm
- Objetivo Nutricional do Atleta: ${goal}

Gere uma prescrição de lanche pós-treino imediato e 3 dicas de recuperação muscular e hidratação sob medida.
Retorne rigorosamente em formato JSON Schema.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.25,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendedPostWorkoutSnack: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                proteinG: { type: Type.NUMBER },
                carbsG: { type: Type.NUMBER },
                fatG: { type: Type.NUMBER },
                calories: { type: Type.NUMBER },
                optimalTimingMinutes: { type: Type.NUMBER },
              },
              required: ['title', 'description', 'proteinG', 'carbsG', 'fatG', 'calories', 'optimalTimingMinutes'],
            },
            recoveryTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['summary', 'recommendedPostWorkoutSnack', 'recoveryTips'],
        },
      },
    });

    if (res.text) {
      const parsed = JSON.parse(res.text);
      return {
        summary: parsed.summary || fallbackAdvice.summary,
        recommendedPostWorkoutSnack: {
          title: parsed.recommendedPostWorkoutSnack?.title || fallbackAdvice.recommendedPostWorkoutSnack.title,
          description: parsed.recommendedPostWorkoutSnack?.description || fallbackAdvice.recommendedPostWorkoutSnack.description,
          proteinG: Math.round(Number(parsed.recommendedPostWorkoutSnack?.proteinG) || 28),
          carbsG: Math.round(Number(parsed.recommendedPostWorkoutSnack?.carbsG) || 35),
          fatG: Math.round(Number(parsed.recommendedPostWorkoutSnack?.fatG) || 4),
          calories: Math.round(Number(parsed.recommendedPostWorkoutSnack?.calories) || 280),
          optimalTimingMinutes: Math.round(Number(parsed.recommendedPostWorkoutSnack?.optimalTimingMinutes) || 45),
        },
        recoveryTips: parsed.recoveryTips || fallbackAdvice.recoveryTips,
      };
    }

    return fallbackAdvice;
  } catch (err: any) {
    console.warn('[Smartwatch AI Workout Advice Warning]:', err?.message || err);
    return fallbackAdvice;
  }
}
