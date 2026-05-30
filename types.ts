
export enum Mode {
  GENERAL = 'Umum',
  SALES = 'Jualan',
}

export type AppTab = 'production' | 'ideas' | 'image-production';
export type ImageTab = 'character' | 'generate' | 'prompt-maker';

export interface Formula {
  id: string;
  label: string;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '2:3' | '4:5';
export type ReferenceMode = 'kreatif' | 'pose-background';
export type GenderSelection = 'wanita' | 'pria' | 'pria & wanita';

export interface FormData {
  mode: Mode;
  topic: string;
  productName: string;
  productDescription: string;
  durationMinutes: string;
  durationSeconds: string;
  scriptCount: number;
  selectedFormulas: string[];
  tone: string;
  audience: string;
  seoFriendly: boolean;
  hardSelling: boolean;
  salesFormulaType: 'storytelling' | 'relate';
  ctaType: string;
  generateImagePrompts: boolean;
  enableLipsync: boolean; // TO BE REPLACED/RENAMED
  flowSegmentDuration: number;
  flowAudioMode: 'VO' | 'Lipsync';
  lipsyncFocus: string; 
  autoGenerateImages: boolean;
  aspectRatio: AspectRatio;
  gender: GenderSelection;
  modelRegion: string; 
  useReferenceModel: boolean;
  referenceImage?: {
    data: string; // base64 string
    mimeType: string;
  };
  referenceMode: ReferenceMode;
  scriptSource: 'ai' | 'manual';
  manualScript: string;
  manualHook: string;
  salesMode?: 'kompleks' | 'spesialis';
  spesialisType?: 'aman' | 'bebas';
  hargaNormal?: string;
  hargaPromo?: string;
  jumlahIsi?: string;
}

export interface IdeaFormData {
  topic: string;
  count: number;
}

export interface GeneratedIdeaBatch {
  id: string;
  topic: string;
  ideas: string[];
  timestamp: number;
}

export interface ImagePrompt {
  source: string;
  prompt: string;
  manualPrompt?: string;
  base64?: string;
  isLoading: boolean;
  error?: string;
  videoPrompt?: string;
  isGeneratingVideoPrompt?: boolean;
  videoPromptError?: string;
  textVideoPrompt?: string;
  isGeneratingTextVideoPrompt?: boolean;
  textVideoPromptError?: string;
  veo3VideoPrompt?: string;
  isGeneratingVeo3VideoPrompt?: boolean;
  veo3VideoPromptError?: string;
}

// NEW INTERFACE FOR LIPSYNC SEGMENTS
export interface LipsyncSegment {
  segmentNumber: number;
  duration: string;
  dialog: string;
  imagePrompt: string; // The generic description for image gen
  videoPrompt: string; // The formatted I2V prompt
  base64?: string;
  isLoading: boolean;
  error?: string;
}

export interface GeneratedScript {
  id: string;
  createdAt?: number;
  wordCount?: number;
  estimatedDuration?: string;
  scriptContent: string;
  storytellingFormula: string;
  hookNumber: number;
  isFromGoogleSearch?: boolean;
  caption?: string;
  hashtags?: string[];
  imagePrompts?: ImagePrompt[]; // Standard visual scenes
  lipsyncSegments?: LipsyncSegment[]; // NEW: Lipsync segments
  groundingChunks?: { web: { uri: string; title: string; } }[];
  aspectRatio: AspectRatio;
  useReferenceModel?: boolean;
  referenceMode?: ReferenceMode;
  longFormContent?: string;
  isGeneratingLongForm?: boolean;
}

// --- NEW TYPES FOR IMAGE PRODUCTION ---

export interface CharacterFormData {
  region: string;
  customRegion?: string;
  userDescription?: string;
  framing: string; // New field for framing
  age: string;
  gender: string;
  genre: string;
  aspectRatio: AspectRatio;
}

export interface CharacterResult {
  id: string;
  summary: string;
  promptA: string;
  imageA?: string; // base64
  promptB: string;
  imageB?: string; // base64
  isLoadingA: boolean;
  isLoadingB: boolean;
  errorA?: string;
  errorB?: string;
  timestamp: number;
}

export interface PromptMakerFormData {
  idea: string;
  genre: string;
  angle: string;
}

export interface PromptMakerResult {
  id: string;
  idea: string;
  indoPrompt: string;
  engPrompt: string;
  timestamp: number;
}

export interface AdvancedImageFormData {
  aspectRatio: AspectRatio;
  prompt: string;
  count: number;
  filename?: string;
  focusItem?: string;
  refModel?: { data: string; mimeType: string };
  refTop?: { data: string; mimeType: string };
  refBottom?: { data: string; mimeType: string };
  refProduct?: { data: string; mimeType: string };
}

export interface AdvancedImageResult {
  id: string;
  filename: string;
  base64: string;
  prompt: string; // The prompt used
  videoPrompt?: string; // The generated Image-to-Video prompt
  isLoadingVideoPrompt: boolean;
  timestamp: number;
  aspectRatio: AspectRatio; // ADDED: To track ratio for previews
}
