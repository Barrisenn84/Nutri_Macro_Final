export type GoalType = 'cutting' | 'bulking' | 'maintenance' | 'weight_loss' | 'hypertrophy';

export type PreferredUnit = 'metric' | 'imperial';

export const MASTER_ADMIN_EMAIL = 'nuncaparedelutar1988@gmail.com';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal: GoalType;
  currentWeight: number; // in kg
  startWeight: number; // in kg
  targetWeight: number; // in kg
  height: number; // in cm
  preferredUnit: PreferredUnit;
  isMasterAdmin?: boolean;
  role?: 'owner' | 'admin' | 'user';
  plan?: 'free' | 'pro' | 'vip';
  createdAt: string;
  updatedAt: string;
}

export type TargetSource = 'manual' | 'professional' | 'estimated';

export interface NutritionTargets {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  waterMl?: number;
  source: TargetSource;
  updatedAt: string;
}

export type NutritionGoals = NutritionTargets;


export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper' | 'other';

export type ItemSource = 'manual' | 'photo' | 'database' | 'voice';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface MealItem {
  id: string;
  mealId: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  photo?: string;
  source: ItemSource;
  aiEstimate: boolean;
  confidence?: ConfidenceLevel;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: MealType;
  name?: string;
  photo?: string;
  items: MealItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GoalProgress {
  caloriesPercent: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  caloriesRemaining: number;
  proteinRemaining: number;
  carbsRemaining: number;
  fatRemaining: number;
  isCaloriesExceeded: boolean;
  activeBurnKcal?: number;
  adjustedCaloriesTarget?: number;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  waist?: number; // in cm
  arm?: number; // in cm
  chest?: number; // in cm
  thigh?: number; // in cm
  hips?: number; // in cm
  bodyFat?: number; // %
  notes?: string;
  photo?: string;
  createdAt: string;
}

export interface EvolutionPhoto {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  photoUrl: string;
  weight: number;
  weekLabel: string;
  notes?: string;
  createdAt: string;
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  defaultQuantity: number;
  unit: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  isFavorite?: boolean;
  isRecent?: boolean;
  lastUsedAt?: string;
}

export interface AIEstimateItem {
  id: string;
  name: string;
  estimatedQuantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: ConfidenceLevel;
  reasoning?: string;
}

export interface AIAnalysisResult {
  imageUrl: string;
  identifiedMealType?: MealType;
  items: AIEstimateItem[];
  notes?: string;
}

export interface MealReminderConfig {
  id: string;
  mealType: MealType;
  label: string;
  time: string; // "HH:mm" (e.g. "08:00")
  enabled: boolean;
  message: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  smartSkipIfLogged: boolean;
  browserNotifications: boolean;
  reminders: {
    breakfast: MealReminderConfig;
    morning_snack?: MealReminderConfig;
    lunch: MealReminderConfig;
    snack: MealReminderConfig;
    dinner: MealReminderConfig;
    supper?: MealReminderConfig;
    water?: MealReminderConfig;
    [key: string]: MealReminderConfig | undefined;
  };
}

export interface ActiveMealReminder {
  id: string;
  mealType: MealType;
  title: string;
  message: string;
  time: string;
  scheduledTime: string;
}

export interface UnifiedFoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  category: string;
  barcode?: string;
  imageUrl?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  unit: string;
  defaultServingG: number;
  source: 'TACO' | 'OPEN_FOOD_FACTS' | 'GEMINI_AI';
}

export interface NextMealSuggestion {
  id: string;
  name: string;
  mealType: string;
  description: string;
  prepTimeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  instructions: string[];
  whyThisFits: string;
}

export interface WeeklyNutritionReview {
  period: string;
  overallScore: number;
  verdict: 'Excelente' | 'Bom' | 'Atenção Necessária' | 'Ajuste Crítico';
  summary: string;
  strengths: string[];
  improvements: string[];
  calorieCompliancePercent: number;
  proteinCompliancePercent: number;
  suggestedActionPlan: string[];
}

export interface BodyCompositionAnalysis {
  estimatedBodyFatPercent: number;
  leanMassKg: number;
  fatMassKg: number;
  bmrEstimatedKcal: number;
  tdeeEstimatedKcal: number;
  weeklyWeightRateKg: number;
  projectedGoalWeeks: number;
  projectedGoalDate: string;
  evaluation: string;
  coachTips: string[];
}

export interface SaaSPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceQuarterly?: number;
  priceAnnual?: number;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}

export interface SaaSClient {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'vip';
  status: 'active' | 'trial' | 'overdue' | 'canceled';
  goal: string;
  weightCurrentKg: number;
  weightTargetKg: number;
  adherenceRate: number; // 0-100%
  lastActive: string;
  joinedDate: string;
}

export interface NutritionistReportOptions {
  user: UserProfile | null;
  targets: NutritionTargets | null;
  meals: Meal[];
  measurements: BodyMeasurement[];
  rangeDays?: number;
  nutritionistName?: string;
  nutritionistCrn?: string;
  patientNotes?: string;
  includeMeasurements?: boolean;
  includeMealsDetail?: boolean;
  includeHydration?: boolean;
  waterIntakeMl?: number;
}

// ==========================================
// SMARTWATCH INTEGRATION TYPES
// ==========================================
export type SmartwatchProvider =
  | 'apple_health'
  | 'health_connect'
  | 'samsung_health'
  | 'garmin'
  | 'wear_os'
  | 'amazfit';

export type SmartwatchCalorieStrategy = 'maintain_deficit' | 'eat_back_half' | 'eat_back_all';

export interface SmartwatchActivityData {
  provider: SmartwatchProvider;
  deviceName: string;
  deviceModel?: string;
  connected: boolean;
  lastSyncedAt: string;
  caloriesBurnedActive: number; // Kcal queimadas em treino
  stepsCount: number; // Passos no dia
  heartRateAvg: number; // BPM médio
  activeMinutes: number; // Minutos de treino ativo
  workoutType?: string; // Ex: "Musculação Hipertrofia", "Corrida na Esteira", "CrossFit"
  batteryLevelPercent?: number;
  vo2Max?: number;
  bodyFatPercentEstimated?: number;
}

export interface SmartwatchConfig {
  enabled: boolean;
  provider: SmartwatchProvider;
  deviceModel?: string;
  calorieStrategy: SmartwatchCalorieStrategy;
  autoSync: boolean;
  syncWater: boolean;
  wristHapticReminders: boolean;
  voiceInputEnabled?: boolean;
}

export interface SmartwatchAIWorkoutAdvice {
  summary: string;
  recommendedPostWorkoutSnack: {
    title: string;
    description: string;
    proteinG: number;
    carbsG: number;
    fatG: number;
    calories: number;
    optimalTimingMinutes: number;
  };
  recoveryTips: string[];
}


