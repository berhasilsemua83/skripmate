
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mode, FormData, GeneratedScript, AspectRatio, ReferenceMode, GenderSelection, AppTab, IdeaFormData, GeneratedIdeaBatch, ImageTab, CharacterFormData, CharacterResult, PromptMakerFormData, PromptMakerResult, AdvancedImageFormData, AdvancedImageResult } from './types';
import { HOOKS, STORYTELLING_FORMULAS, TONES_OF_VOICE, TARGET_AUDIENCES, RELATE_FORMULAS, MODEL_REGIONS, SALES_CTA_TYPES, VISUAL_GENRES, CAMERA_ANGLES, CHARACTER_FRAMINGS, LIPSYNC_FOCUS_OPTIONS } from './constants';
import { generateScripts, generateImage, generateVideoPrompt, generateTextToVideoPrompt, generateVeo3VideoPrompt, detectImageGender, generateLongFormContent, generateContentIdeas, generateCharacterSession, generateCreativeImagePrompts, generateAdvancedImages, generateFlowVideoPrompt, setApiKey } from './services/geminiService';
import Icon from './components/Icon';
import ScriptCard from './components/ScriptCard';
import IdeaResultCard from './components/IdeaResultCard';
import ImageCropper from './components/ImageCropper';

// ... (previous imports and constants remain the same) ...
const GENDER_LABELS: Record<GenderSelection, string> = {
    wanita: 'Wanita',
    pria: 'Pria',
    'pria & wanita': 'Pria & Wanita'
};

const aspectRatioClasses: Record<AspectRatio, string> = {
    '9:16': 'aspect-[9/16]',
    '16:9': 'aspect-[16/9]',
    '1:1': 'aspect-square',
    '2:3': 'aspect-[2/3]',
    '4:5': 'aspect-[4/5]',
};

const parseAspectRatio = (ratio: AspectRatio | string): number => {
    try {
        const [w, h] = ratio.split(':').map(Number);
        return w / h;
    } catch {
        return 9/16; // Default fallback
    }
};

const sanitizeFilename = (name: string) => {
    const sanitized = name.replace(/[^a-z0-9_\-]/gi, '_');
    return sanitized.length > 0 ? sanitized : `image_${Date.now()}`;
};

// --- Helper for Direct Downloads (Blob) ---
const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

const forceDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  
  link.click();
  
  // Use requestAnimationFrame for safer cleanup after click event propagates
  requestAnimationFrame(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
};

// --- IndexedDB Helpers for Image History ---
const DB_NAME = 'ScriptMateDB';
const STORE_NAME = 'images';
const HISTORY_STORE = 'app_data'; // legacy
const SCRIPTS_STORE = 'scripts_store';
const IDEAS_STORE = 'ideas_store';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 3);
        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(HISTORY_STORE)) {
                db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(SCRIPTS_STORE)) {
                db.createObjectStore(SCRIPTS_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(IDEAS_STORE)) {
                db.createObjectStore(IDEAS_STORE, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) => reject(event.target.error);
    });
};

const saveItemToDB = async (storeName: string, item: any) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(`IndexedDB Save Error (${storeName}):`, error);
    }
};

const deleteItemFromDB = async (storeName: string, id: string) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
         console.error(`IndexedDB Delete Error (${storeName}):`, error);
    }
};

async function getAllItemsFromDB<T>(storeName: string): Promise<T[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result as T[];
                results.sort((a: any, b: any) => (b.createdAt || b.timestamp || 0) - (a.createdAt || a.timestamp || 0));
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(`IndexedDB Load Error (${storeName}):`, error);
        return [];
    }
};

const saveStateToDB = async (id: string, data: any) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE, 'readwrite');
            const store = transaction.objectStore(HISTORY_STORE);
            const request = store.put({ id, data });
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("IndexedDB Save State Error:", error);
    }
};

const loadStateFromDB = async (id: string): Promise<any> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE, 'readonly');
            const store = transaction.objectStore(HISTORY_STORE);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("IndexedDB Load State Error:", error);
        return null;
    }
};

const saveImageToDB = async (image: AdvancedImageResult) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(image);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("IndexedDB Save Error:", error);
    }
};

const deleteImageFromDB = async (id: string) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
         console.error("IndexedDB Delete Error:", error);
    }
};

const getAllImagesFromDB = async (): Promise<AdvancedImageResult[]> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result as AdvancedImageResult[];
                // Sort by timestamp desc
                results.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("IndexedDB Load Error:", error);
        return [];
    }
};

const App: React.FC = () => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  
  useEffect(() => {
    setApiKey(apiKeyInput);
  }, [apiKeyInput]);

  // ... (State declarations remain same) ...
  const [activeTab, setActiveTab] = useState<AppTab>('production');
  const [imageTab, setImageTab] = useState<ImageTab>('generate');
  
  const [formData, setFormData] = useState<FormData>({
    mode: Mode.GENERAL,
    topic: '',
    productName: '',
    productDescription: '',
    durationMinutes: '',
    durationSeconds: '30',
    scriptCount: 1,
    selectedFormulas: [],
    tone: 'Santai & Sopan',
    audience: 'Pria & Wanita',
    seoFriendly: true,
    hardSelling: false,
    salesFormulaType: 'storytelling',
    ctaType: SALES_CTA_TYPES[0], // Default CTA Type
    generateImagePrompts: false,
    enableLipsync: false, 
    flowSegmentDuration: 8,
    flowAudioMode: 'Lipsync',
    lipsyncFocus: LIPSYNC_FOCUS_OPTIONS[0],
    autoGenerateImages: false,
    aspectRatio: '9:16',
    gender: 'pria & wanita',
    modelRegion: 'se_asia', // Default to SE Asia
    useReferenceModel: false,
    referenceImage: undefined,
    referenceMode: 'kreatif',
    scriptSource: 'ai',
    manualScript: '',
    manualHook: '',
    salesMode: 'kompleks',
    spesialisType: 'aman',
    hargaNormal: '',
    hargaPromo: '',
    jumlahIsi: '',
  });

  const [ideaFormData, setIdeaFormData] = useState<IdeaFormData>({
    topic: '',
    count: 1
  });

  // --- IMAGE PRODUCTION STATES ---
  const [charFormData, setCharFormData] = useState<CharacterFormData>({ 
      region: 'se_asia', 
      customRegion: '', 
      userDescription: '', 
      framing: 'half_body',
      age: '25', 
      gender: 'Female', 
      genre: 'Photorealistic', 
      aspectRatio: '9:16' 
  });
  const [promptFormData, setPromptFormData] = useState<PromptMakerFormData>({ idea: '', genre: 'Cinematic', angle: 'Medium Shot' });
  const [advImgFormData, setAdvImgFormData] = useState<AdvancedImageFormData>({ aspectRatio: '9:16', prompt: '', count: 1 });
  
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScript[]>([]);
  const [history, setHistory] = useState<GeneratedScript[]>([]);
  const [ideaHistory, setIdeaHistory] = useState<GeneratedIdeaBatch[]>([]);
  const [imageHistory, setImageHistory] = useState<AdvancedImageResult[]>([]);

  // Result States for Image Production
  const [characterResult, setCharacterResult] = useState<CharacterResult | null>(null);
  const [promptMakerResult, setPromptMakerResult] = useState<PromptMakerResult | null>(null);
  const [advancedImageResults, setAdvancedImageResults] = useState<AdvancedImageResult[]>([]);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('AI sedang bersiap...');
  const [editingImage, setEditingImage] = useState<{ data: string; mimeType: string; aspectRatio?: AspectRatio } | null>(null);
  const [editingSlot, setEditingSlot] = useState<keyof AdvancedImageFormData | null>(null); // For multi-slot cropper
  const [isDetectingGender, setIsDetectingGender] = useState(false);
  
  // Drag and Drop state
  const [dragOverSlot, setDragOverSlot] = useState<keyof AdvancedImageFormData | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoGenerationQueueRef = useRef<string[]>([]);
  // Specific queue for lipsync auto-generation to handle them differently if needed
  const autoLipsyncQueueRef = useRef<{scriptId: string, segmentIndices: number[]}[]>([]);

  // Helper function to save history to IndexedDB/localStorage
  const saveHistoryToLocalStorage = (key: string, data: any) => {
    saveStateToDB(key, data).catch((e: any) => {
      console.error(`Failed to save ${key} to IndexedDB`, e);
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (eLocal: any) {
        if (eLocal.name === 'QuotaExceededError') {
            console.error(`Failed to save ${key} to localStorage: Quota Exceeded. Data too large.`);
        } else {
            console.error(`Failed to save ${key} to localStorage`, eLocal);
        }
      }
    });
  };

useEffect(() => {
    try {
      // 1. Load History Skrip dari IndexedDB yang benar (SCRIPTS_STORE)
      getAllItemsFromDB<GeneratedScript>(SCRIPTS_STORE).then(data => {
          if (data && data.length > 0) {
              setHistory(data);
          } else {
              // Fallback jika database kosong, coba cari di localStorage lama
              const storedHistory = localStorage.getItem('scriptmate_history');
              if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
              }
          }
      });
      
      // 2. Load History Ide Konten dari IndexedDB yang benar (IDEAS_STORE)
      getAllItemsFromDB<GeneratedIdeaBatch>(IDEAS_STORE).then(data => {
          if (data && data.length > 0) {
              setIdeaHistory(data);
          } else {
              // Fallback jika database kosong, coba cari di localStorage lama
              const storedIdeaHistory = localStorage.getItem('ideamate_history');
              if (storedIdeaHistory) {
                setIdeaHistory(JSON.parse(storedIdeaHistory));
              }
          }
      });
      
      // 3. Load Image History (Ini sudah benar dari awal)
      getAllImagesFromDB().then(images => {
          setImageHistory(images);
      });

    } catch (e) {
      console.error("Failed to load from storage", e);
    }
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    if (isLoading) {
      if (activeTab === 'production') {
          const messages = [
            "Menganalisis permintaan Anda...", "Memilih hook yang paling menarik...", "Menyusun alur cerita...", "Membuat caption yang memikat...", "Jika topik butuh info baru, saya akan browsing Google...",
            ...(formData.generateImagePrompts ? ["Merancang prompt visual untuk setiap adegan..."] : []),
            ...(formData.enableLipsync ? ["Sutradara AI sedang memecah skrip menjadi video..."] : [])
          ];
          let messageIndex = 0;
          setLoadingMessage(messages[0]);
          interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingMessage(messages[messageIndex]);
          }, 2500);
      } else if (activeTab === 'ideas') {
          setLoadingMessage("Sedang mencari ide konten kreatif untuk Anda...");
      } else {
          setLoadingMessage("Sedang memproses gambar Anda...");
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isLoading, formData.generateImagePrompts, formData.enableLipsync, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'scriptCount' ? parseInt(value, 10) : value }));
  };

  const handleIdeaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setIdeaFormData(prev => ({ ...prev, [name]: name === 'count' ? parseInt(value, 10) : value }));
  };

  const handleCharInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCharFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handlePromptMakerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setPromptFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleAdvImgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setAdvImgFormData(prev => ({ ...prev, [name]: name === 'count' ? parseInt(value, 10) : value }));
  };


  const handleFormulaToggle = (formulaId: string) => {
    setFormData(prev => ({ ...prev, selectedFormulas: prev.selectedFormulas.includes(formulaId) ? prev.selectedFormulas.filter(id => id !== formulaId) : [...prev.selectedFormulas, formulaId] }));
  };
  
  const handleFormulaTypeChange = (type: 'storytelling' | 'relate') => {
    setFormData(prev => ({ ...prev, salesFormulaType: type, selectedFormulas: [] }));
  };

  const setMode = (mode: Mode) => {
    setFormData(prev => ({ ...prev, mode, selectedFormulas: [], salesFormulaType: 'storytelling' }));
    setGeneratedScripts([]);
    setError(null);
  };
  
  const updateScriptInHistory = (updatedScript: GeneratedScript) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.map(h => h.id === updatedScript.id ? updatedScript : h);
      return newHistory;
    });
    saveItemToDB(SCRIPTS_STORE, updatedScript);
  };

  // ... (Other handlers like generateVideoPrompt, generateImage, etc. remain the same) ...
  const handleGenerateVideoPrompt = useCallback(async (scriptId: string, promptIndex: number, imageBase64: string) => {
    const script = generatedScripts.find(s => s.id === scriptId) || history.find(s => s.id === scriptId);
    const promptItem = script?.imagePrompts?.[promptIndex];

    if (!script || !promptItem) {
      console.error("Could not find script or prompt data for video prompt generation.");
      return;
    }
    
    setGeneratedScripts(prev => prev.map(s => {
      if (s.id === scriptId && s.imagePrompts) {
        return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingVideoPrompt: true, videoPromptError: undefined } : p) };
      }
      return s;
    }));

    try {
      const imageForVideoPrompt = { data: imageBase64, mimeType: 'image/png' };
      const originalPromptForContext = promptItem.manualPrompt || promptItem.prompt;
      const regionName = MODEL_REGIONS.find(r => r.id === formData.modelRegion)?.label || formData.modelRegion;
      const videoPrompt = await generateVideoPrompt(
          imageForVideoPrompt, 
          originalPromptForContext,
          undefined, // focusItem not needed here
          formData.useReferenceModel ? undefined : formData.gender,
          formData.useReferenceModel ? undefined : regionName
      );
      
      setGeneratedScripts(prevScripts => {
        const newScripts = prevScripts.map(s => {
          if (s.id === scriptId && s.imagePrompts) {
            const updatedPrompts = s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingVideoPrompt: false, videoPrompt: videoPrompt } : p);
            const updatedScript = { ...s, imagePrompts: updatedPrompts };
            updateScriptInHistory(updatedScript);
            return updatedScript;
          }
          return s;
        });
        return newScripts;
      });
    } catch (err: any) {
      setGeneratedScripts(prevScripts => prevScripts.map(s => {
        if (s.id === scriptId && s.imagePrompts) {
          return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingVideoPrompt: false, videoPromptError: err.message || 'Terjadi kesalahan.' } : p) };
        }
        return s;
      }));
    }
  }, [generatedScripts, history]);


  const handleGenerateImage = useCallback(async (scriptId: string, promptIndex: number) => {
    const script = generatedScripts.find(s => s.id === scriptId);
    if (!script || !script.imagePrompts?.[promptIndex]) {
      console.error("Could not find script data for image generation.");
      return;
    }
    
    setGeneratedScripts(prev => prev.map(s => {
      if (s.id === scriptId && s.imagePrompts) {
        return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isLoading: true, error: undefined } : p) };
      }
      return s;
    }));

    try {
      const promptItem = script.imagePrompts[promptIndex];
      const finalPrompt = promptItem.manualPrompt || promptItem.prompt;
      const regionName = MODEL_REGIONS.find(r => r.id === formData.modelRegion)?.label || formData.modelRegion;
      const imageBase64 = await generateImage(finalPrompt, script.aspectRatio, formData.referenceImage, script.referenceMode, formData.useReferenceModel ? undefined : formData.gender, formData.useReferenceModel ? undefined : regionName);

      setGeneratedScripts(prev => {
        const newScripts = prev.map(s => {
          if (s.id === scriptId) {
            const updatedPrompts = s.imagePrompts!.map((p, idx) => idx === promptIndex ? { ...p, isLoading: false, base64: imageBase64 } : p);
            const updatedScript = { ...s, imagePrompts: updatedPrompts };
            updateScriptInHistory(updatedScript);
            return updatedScript;
          }
          return s;
        });
        return newScripts;
      });
      
      await handleGenerateVideoPrompt(scriptId, promptIndex, imageBase64);

    } catch (imageErr: any) {
      setGeneratedScripts(prevScripts => prevScripts.map(s => {
        if (s.id === scriptId && s.imagePrompts) {
          return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isLoading: false, error: imageErr.message || 'Terjadi kesalahan.' } : p) };
        }
        return s;
      }));
    }
  }, [generatedScripts, formData.referenceImage, handleGenerateVideoPrompt]);

  const handleGenerateFlowVideoPrompt = useCallback(async (scriptId: string, segmentIndex: number) => {
      const script = generatedScripts.find(s => s.id === scriptId);
      if (!script || !script.lipsyncSegments?.[segmentIndex]) return;
      const segment = script.lipsyncSegments[segmentIndex];
      if (!segment.base64) return;

      setGeneratedScripts(prev => prev.map(s => {
          if (s.id === scriptId && s.lipsyncSegments) {
              return { ...s, lipsyncSegments: s.lipsyncSegments.map((seg, idx) => idx === segmentIndex ? { ...seg, videoPrompt: "Sedang membuat prompt video..." } : seg) };
          }
          return s;
      }));

      try {
          const imageForVideoPrompt = { data: segment.base64, mimeType: 'image/png' };
          
          // Determine duration from string (e.g. "8 detik")
          const durationMatch = segment.duration.match(/\d+/);
          const segmentDuration = durationMatch ? parseInt(durationMatch[0]) : formData.flowSegmentDuration;

          const regionName = MODEL_REGIONS.find(r => r.id === formData.modelRegion)?.label || formData.modelRegion;
          const videoPrompt = await generateFlowVideoPrompt(
              imageForVideoPrompt, 
              segmentDuration, 
              formData.flowAudioMode, 
              segment.dialog, 
              segment.imagePrompt,
              formData.useReferenceModel ? undefined : formData.gender,
              formData.useReferenceModel ? undefined : regionName
          );
          
          setGeneratedScripts(prev => {
              const newScripts = prev.map(s => {
                  if (s.id === scriptId && s.lipsyncSegments) {
                      const updatedSegments = s.lipsyncSegments.map((seg, idx) => idx === segmentIndex ? { ...seg, videoPrompt } : seg);
                      const updatedScript = { ...s, lipsyncSegments: updatedSegments };
                      updateScriptInHistory(updatedScript);
                      return updatedScript;
                  }
                  return s;
              });
              return newScripts;
          });
      } catch (err: any) {
          setGeneratedScripts(prev => prev.map(s => {
              if (s.id === scriptId && s.lipsyncSegments) {
                  return { ...s, lipsyncSegments: s.lipsyncSegments.map((seg, idx) => idx === segmentIndex ? { ...seg, videoPrompt: err.message || 'Gagal.' } : seg) };
              }
              return s;
          }));
      }
  }, [generatedScripts, formData]);

  const handleGenerateLipsyncImage = useCallback(async (scriptId: string, segmentIndex: number) => {
      const script = generatedScripts.find(s => s.id === scriptId);
      if (!script || !script.lipsyncSegments?.[segmentIndex]) {
          return;
      }

      setGeneratedScripts(prev => prev.map(s => {
          if (s.id === scriptId && s.lipsyncSegments) {
              return { ...s, lipsyncSegments: s.lipsyncSegments.map((seg, idx) => idx === segmentIndex ? { ...seg, isLoading: true, error: undefined } : seg) };
          }
          return s;
      }));

      try {
          const segment = script.lipsyncSegments[segmentIndex];
          const regionName = MODEL_REGIONS.find(r => r.id === formData.modelRegion)?.label || formData.modelRegion;
          const imageBase64 = await generateImage(segment.imagePrompt, script.aspectRatio, formData.referenceImage, script.referenceMode, formData.useReferenceModel ? undefined : formData.gender, formData.useReferenceModel ? undefined : regionName);

          // Use a promise to update state, and then we will generate the video prompt
          setGeneratedScripts(prev => {
              const newScripts = prev.map(s => {
                  if (s.id === scriptId && s.lipsyncSegments) {
                      const updatedSegments = s.lipsyncSegments.map((seg, idx) => idx === segmentIndex ? { ...seg, isLoading: false, base64: imageBase64 } : seg);
                      const updatedScript = { ...s, lipsyncSegments: updatedSegments };
                      updateScriptInHistory(updatedScript);
                      return updatedScript;
                  }
                  return s;
              });
              return newScripts;
          });

          // Generate the video prompt automatically after the image is ready
          await handleGenerateFlowVideoPrompt(scriptId, segmentIndex);

      } catch (imageErr: any) {
           setGeneratedScripts(prevScripts => prevScripts.map(s => {
              if (s.id === scriptId && s.lipsyncSegments) {
                  return { ...s, lipsyncSegments: s.lipsyncSegments.map((seg, idx) => idx === segmentIndex ? { ...seg, isLoading: false, error: imageErr.message || 'Terjadi kesalahan.' } : seg) };
              }
              return s;
          }));
      }
  }, [generatedScripts, formData.referenceImage, handleGenerateFlowVideoPrompt]);

  useEffect(() => {
    // Process Standard Auto-Generation Queue
    const processQueue = async () => {
      const scriptToProcess = generatedScripts.find(s => autoGenerationQueueRef.current.includes(s.id));
      if (!scriptToProcess || !scriptToProcess.imagePrompts) return;
      const isCurrentlyProcessing = scriptToProcess.imagePrompts.some(p => p.isLoading || p.isGeneratingVideoPrompt);
      if(isCurrentlyProcessing) return;
      const nextPromptIndex = scriptToProcess.imagePrompts.findIndex(p => !p.base64 && !p.error);
      if (nextPromptIndex === -1) {
        autoGenerationQueueRef.current = autoGenerationQueueRef.current.filter(id => id !== scriptToProcess.id);
        setGeneratedScripts(prev => [...prev]); 
        return;
      }

      const promptItem = scriptToProcess.imagePrompts[nextPromptIndex];
      const finalPrompt = promptItem.manualPrompt || promptItem.prompt;
      const aspectRatioToUse = scriptToProcess.aspectRatio;
      
      setGeneratedScripts(prev => prev.map(s => s.id === scriptToProcess.id ? { ...s, imagePrompts: s.imagePrompts!.map((p, idx) => idx === nextPromptIndex ? {...p, isLoading: true, error: undefined} : p) } : s));

      try {
        const regionName = MODEL_REGIONS.find(r => r.id === formData.modelRegion)?.label || formData.modelRegion;
        const imageBase64 = await generateImage(finalPrompt, aspectRatioToUse, formData.referenceImage, scriptToProcess.referenceMode, formData.useReferenceModel ? undefined : formData.gender, formData.useReferenceModel ? undefined : regionName);
        
        setGeneratedScripts(prev => {
          const newScripts = prev.map(s => {
            if (s.id === scriptToProcess.id) {
              const updatedPrompts = s.imagePrompts!.map((p, idx) => idx === nextPromptIndex ? { ...p, isLoading: false, base64: imageBase64 } : p);
              const updatedScript = { ...s, imagePrompts: updatedPrompts };
              updateScriptInHistory(updatedScript);
              return updatedScript;
            }
            return s;
          });
          return newScripts;
        });
        
        await handleGenerateVideoPrompt(scriptToProcess.id, nextPromptIndex, imageBase64);

      } catch (imageErr: any) {
        setGeneratedScripts(prev => prev.map(s => s.id === scriptToProcess.id ? { ...s, imagePrompts: s.imagePrompts!.map((p, idx) => idx === nextPromptIndex ? {...p, isLoading: false, error: imageErr.message} : p) } : s));
      }
    };

    // Process Lipsync Auto-Generation Queue
    const processLipsyncQueue = async () => {
         // Find a script in the queue that has pending lipsync segments
         const queueItem = autoLipsyncQueueRef.current[0];
         if (!queueItem) return;

         const script = generatedScripts.find(s => s.id === queueItem.scriptId);
         if (!script || !script.lipsyncSegments) {
             autoLipsyncQueueRef.current.shift();
             return;
         }

         // Check if any segment in this script is currently loading
         const isBusy = script.lipsyncSegments.some(seg => seg.isLoading);
         if (isBusy) return;

         // Find next segment index that hasn't been generated yet
         const nextSegmentIndex = script.lipsyncSegments.findIndex(seg => !seg.base64 && !seg.error);
         
         if (nextSegmentIndex === -1) {
             // All done for this script
             autoLipsyncQueueRef.current.shift();
             setGeneratedScripts(prev => [...prev]);
             return;
         }

         // Trigger generation for this segment
         await handleGenerateLipsyncImage(script.id, nextSegmentIndex);
    };

    if (autoGenerationQueueRef.current.length > 0) {
      processQueue();
    }
    
    // Only run lipsync processor if standard queue is empty (optional prioritization) or run concurrently
    // Let's run concurrently but with separate logic
    if (autoLipsyncQueueRef.current.length > 0) {
        processLipsyncQueue();
    }

  }, [generatedScripts, formData.referenceImage, handleGenerateVideoPrompt, handleGenerateLipsyncImage]);
  
  const handleGenerateTextVideoPrompt = useCallback(async (scriptId: string, promptIndex: number) => {
    const script = generatedScripts.find(s => s.id === scriptId) || history.find(s => s.id === scriptId);
    if (!script || !script.imagePrompts?.[promptIndex]) {
      console.error("Could not find script data for text-to-video prompt generation.");
      return;
    }
    const promptItem = script.imagePrompts[promptIndex];
    setGeneratedScripts(prev => prev.map(s => {
      if (s.id === scriptId && s.imagePrompts) {
        return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingTextVideoPrompt: true, textVideoPromptError: undefined } : p) };
      }
      return s;
    }));
    try {
      const sceneDescription = promptItem.source;
      const textVideoPrompt = await generateTextToVideoPrompt(sceneDescription);
      setGeneratedScripts(prevScripts => {
        const newScripts = prevScripts.map(s => {
          if (s.id === scriptId && s.imagePrompts) {
            const updatedPrompts = s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingTextVideoPrompt: false, textVideoPrompt: textVideoPrompt } : p);
            const updatedScript = { ...s, imagePrompts: updatedPrompts };
            updateScriptInHistory(updatedScript);
            return updatedScript;
          }
          return s;
        });
        return newScripts;
      });
    } catch (err: any) {
      setGeneratedScripts(prevScripts => prevScripts.map(s => {
        if (s.id === scriptId && s.imagePrompts) {
          return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingTextVideoPrompt: false, textVideoPromptError: err.message || 'Terjadi kesalahan.' } : p) };
        }
        return s;
      }));
    }
  }, [generatedScripts, history]);

  const handleGenerateVeo3VideoPrompt = useCallback(async (scriptId: string, promptIndex: number) => {
    const script = generatedScripts.find(s => s.id === scriptId) || history.find(s => s.id === scriptId);
    if (!script || !script.imagePrompts?.[promptIndex] || !script.imagePrompts[promptIndex].base64) {
      console.error("Could not find script or image data for Veo 3 video prompt generation.");
      return;
    }
    const promptItem = script.imagePrompts[promptIndex];
    setGeneratedScripts(prev => prev.map(s => {
      if (s.id === scriptId && s.imagePrompts) {
        return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingVeo3VideoPrompt: true, veo3VideoPromptError: undefined } : p) };
      }
      return s;
    }));
    try {
      const imageForVideoPrompt = { data: promptItem.base64, mimeType: 'image/png' };
      const sceneDescriptionForContext = promptItem.source;
      const regionName = MODEL_REGIONS.find(r => r.id === formData.modelRegion)?.label || formData.modelRegion;
      const videoPrompt = await generateVeo3VideoPrompt(
          imageForVideoPrompt, 
          sceneDescriptionForContext, 
          script.scriptContent,
          formData.useReferenceModel ? undefined : formData.gender,
          formData.useReferenceModel ? undefined : regionName
      );
      setGeneratedScripts(prevScripts => {
        const newScripts = prevScripts.map(s => {
          if (s.id === scriptId && s.imagePrompts) {
            const updatedPrompts = s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingVeo3VideoPrompt: false, veo3VideoPrompt: videoPrompt } : p);
            const updatedScript = { ...s, imagePrompts: updatedPrompts };
            updateScriptInHistory(updatedScript);
            return updatedScript;
          }
          return s;
        });
        return newScripts;
      });
    } catch (err: any) {
      setGeneratedScripts(prevScripts => prevScripts.map(s => {
        if (s.id === scriptId && s.imagePrompts) {
          return { ...s, imagePrompts: s.imagePrompts.map((p, idx) => idx === promptIndex ? { ...p, isGeneratingVeo3VideoPrompt: false, veo3VideoPromptError: err.message || 'Terjadi kesalahan.' } : p) };
        }
        return s;
      }));
    }
  }, [generatedScripts, history]);

  const handleGenerateLongForm = useCallback(async (scriptId: string) => {
      const script = generatedScripts.find(s => s.id === scriptId) || history.find(s => s.id === scriptId);
      if (!script) return;

      // Update state to show loading
      setGeneratedScripts(prev => prev.map(s => s.id === scriptId ? { ...s, isGeneratingLongForm: true } : s));

      try {
          const longFormContent = await generateLongFormContent(
              script.scriptContent,
              formData.topic || formData.productName,
              formData.tone,
              formData.audience
          );

          // Update state with result
          const updatedScript = { ...script, longFormContent, isGeneratingLongForm: false };
          setGeneratedScripts(prev => prev.map(s => s.id === scriptId ? updatedScript : s));
          updateScriptInHistory(updatedScript);

      } catch (err: any) {
          console.error("Failed to generate long form content", err);
          alert("Gagal membuat artikel: " + err.message);
          setGeneratedScripts(prev => prev.map(s => s.id === scriptId ? { ...s, isGeneratingLongForm: false } : s));
      }
  }, [generatedScripts, history, formData]);


  // --- HANDLERS FOR IDEA GENERATION ---

  const handleGenerateIdeas = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      
      try {
          const result = await generateContentIdeas(ideaFormData);
          setIdeaHistory(prev => {
              const newHistory = [result, ...prev]; // Unlimited
              return newHistory;
          });
          await saveItemToDB(IDEAS_STORE, result);
      } catch (err: any) {
          setError(err.message || 'An unknown error occurred.');
      } finally {
          setIsLoading(false);
      }
  };

  const deleteIdeaHistoryItem = (id: string) => {
      setIdeaHistory(prev => prev.filter(item => item.id !== id));
      deleteItemFromDB(IDEAS_STORE, id);
  };

  // --- HANDLERS FOR IMAGE PRODUCTION ---

  const handleCharacterSession = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setCharacterResult(null);

      try {
          // 1. Generate specs and prompts
          const result = await generateCharacterSession(charFormData);
          setCharacterResult(result);
          
          // 2. Sequence A then B
          await handleGenerateCharacterImageSequence(result);

      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  // Revised: Generate A, then B using A as reference
  const handleGenerateCharacterImageSequence = async (initialResult: CharacterResult) => {
       // Step 1: Generate Front (A)
       setCharacterResult(prev => prev ? { ...prev, isLoadingA: true, errorA: undefined } : initialResult);
       try {
           const imageA_Base64 = await generateImage(initialResult.promptA, charFormData.aspectRatio);
           
           // Update state with Image A
           const resultWithA = { ...initialResult, imageA: imageA_Base64, isLoadingA: false };
           setCharacterResult(prev => prev ? { ...prev, imageA: imageA_Base64, isLoadingA: false } : resultWithA);

           // Step 2: Generate Side (B) using A as reference
           handleGenerateSideView(resultWithA, imageA_Base64);
           
       } catch (err: any) {
           setCharacterResult(prev => prev ? { ...prev, errorA: err.message, isLoadingA: false } : initialResult);
       }
  };

  const handleGenerateSideView = async (currentResult: CharacterResult, refImageBase64: string) => {
      setCharacterResult(prev => prev ? { ...prev, isLoadingB: true, errorB: undefined } : currentResult);
      try {
           // Use 'pose-background' mode to keep identity/clothes but change angle/pose
           const imageB_Base64 = await generateImage(
               currentResult.promptB, 
               charFormData.aspectRatio, 
               { data: refImageBase64, mimeType: 'image/png' }, 
               'pose-background'
           );
           
           setCharacterResult(prev => prev ? { ...prev, imageB: imageB_Base64, isLoadingB: false } : null);
      } catch (err: any) {
           setCharacterResult(prev => prev ? { ...prev, errorB: err.message, isLoadingB: false } : null);
      }
  };

  const handlePromptMaker = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      try {
          const result = await generateCreativeImagePrompts(promptFormData);
          setPromptMakerResult(result);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleAdvancedImageGen = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setAdvancedImageResults([]); // Clear previous results
      try {
          const results = await generateAdvancedImages(advImgFormData);
          setAdvancedImageResults(results);
          
          // Save each result to IndexedDB
          for (const res of results) {
              await saveImageToDB(res);
          }
          
          // Reload history from DB
          const newHistory = await getAllImagesFromDB();
          setImageHistory(newHistory.slice(0, 50));
          
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };
  
  // Handlers for Advanced Image Multi-Slot Uploads
  const handleAdvImageUpload = (slot: keyof AdvancedImageFormData, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        setEditingImage({ data: result.split(',')[1], mimeType: file.type, aspectRatio: advImgFormData.aspectRatio });
        setEditingSlot(slot);
        if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };
  
  // DRAG AND DROP HANDLERS
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, slot: keyof AdvancedImageFormData) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSlot(slot);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, slot: keyof AdvancedImageFormData) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSlot(null);
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
          handleAdvImageUpload(slot, file);
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    // ... existing implementation ...
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedScripts([]);

    try {
      const result = await generateScripts(formData);
      
      // Handle Auto Generation Queue for Standard Visual Scenes
      if (formData.generateImagePrompts && formData.autoGenerateImages) {
        autoGenerationQueueRef.current = result.filter(s => s.imagePrompts && s.imagePrompts.length > 0).map(s => s.id);
      } else {
        autoGenerationQueueRef.current = [];
      }

      // Handle Auto Generation Queue for Lipsync Segments
      if (formData.enableLipsync && formData.autoGenerateImages) {
          autoLipsyncQueueRef.current = result
            .filter(s => s.lipsyncSegments && s.lipsyncSegments.length > 0)
            .map(s => ({ scriptId: s.id, segmentIndices: s.lipsyncSegments!.map((_, i) => i) }));
      } else {
          autoLipsyncQueueRef.current = [];
      }

      setGeneratedScripts(result);
      if (result.length > 0) {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHistory(prev => [...result, ...prev]); // Unlimited
        
        // Save each new result script individually
        for (const s of result) {
            saveItemToDB(SCRIPTS_STORE, s);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Other functions like prompt change, gender detect etc remain same) ...
  const handlePromptChange = (scriptId: string, promptIndex: number, newPrompt: string) => {
    setGeneratedScripts(prevScripts => 
        prevScripts.map(script => {
            if (script.id === scriptId && script.imagePrompts) {
                const newImagePrompts = [...script.imagePrompts];
                newImagePrompts[promptIndex] = { ...newImagePrompts[promptIndex], manualPrompt: newPrompt };
                const updatedScript = { ...script, imagePrompts: newImagePrompts };
                updateScriptInHistory(updatedScript);
                return updatedScript;
            }
            return script;
        })
    );
  };

  const autoDetectGender = async (base64Data: string, mimeType: string) => {
    setIsDetectingGender(true);
    try {
      const detectedGender = await detectImageGender(base64Data, mimeType);
      if (detectedGender) {
        setFormData(prev => ({ ...prev, gender: detectedGender }));
      }
    } catch (e) {
      console.error("Gender detection failed", e);
    } finally {
      setIsDetectingGender(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot?: keyof AdvancedImageFormData) => {
    const file = e.target.files?.[0];
    if (file) {
        if (slot) {
            handleAdvImageUpload(slot, file);
        } else {
             // Default handler for Script Mode reference image
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const img = new Image();
                img.src = result;
                img.onload = () => {
                const targetRatio = parseAspectRatio(formData.aspectRatio);
                const imageRatio = img.naturalWidth / img.naturalHeight;

                if (Math.abs(targetRatio - imageRatio) > 0.01) {
                    setEditingImage({ data: result.split(',')[1], mimeType: file.type, aspectRatio: formData.aspectRatio });
                    setFormData(prev => ({ ...prev, referenceImage: undefined }));
                } else {
                    const base64Data = result.split(',')[1];
                    setFormData(prev => ({ ...prev, referenceImage: { data: base64Data, mimeType: file.type } }));
                    setEditingImage(null);
                    autoDetectGender(base64Data, file.type);
                }
                };
            };
            reader.readAsDataURL(file);
        }
    }
  };

  const handleDownloadReference = (base64: string, mimeType: string) => {
        // Use application/octet-stream to force download
        const blob = base64ToBlob(base64, 'application/octet-stream');
        forceDownload(blob, `referensi_model_${Date.now()}.png`);
  };

  const handleAdjustReference = (slot?: keyof AdvancedImageFormData) => {
      // Re-opens cropper with the CURRENT cropped image, allowing further edits.
      if (slot) {
          const ref = advImgFormData[slot];
          if (ref) {
              setEditingImage({ data: ref.data, mimeType: ref.mimeType, aspectRatio: advImgFormData.aspectRatio });
              setEditingSlot(slot);
          }
      } else if (formData.referenceImage) {
        setEditingImage({
            data: formData.referenceImage.data,
            mimeType: formData.referenceImage.mimeType,
            aspectRatio: formData.aspectRatio
        });
        setEditingSlot(null); // Explicitly null for script mode
    }
  };

  const handleResetReference = (slot?: keyof AdvancedImageFormData) => {
      // Just clear the image for now, as we don't store the original raw file permanently
      if (slot) {
          setAdvImgFormData(prev => ({ ...prev, [slot]: undefined }));
      } else {
          setFormData(prev => ({ ...prev, referenceImage: undefined, useReferenceModel: false }));
      }
  };

  const handleCropComplete = async (croppedImage: { data: string; mimeType: string }) => {
    if (editingResultId) {
        // We are editing a generated result
        const updatedResults = advancedImageResults.map(res => {
            if (res.id === editingResultId) {
                return { ...res, base64: croppedImage.data };
            }
            return res;
        });
        setAdvancedImageResults(updatedResults);
        
        // Also update the result in IndexedDB
        const targetImage = updatedResults.find(r => r.id === editingResultId);
        if (targetImage) {
            await saveImageToDB(targetImage);
            // Reload history
            const newHistory = await getAllImagesFromDB();
            setImageHistory(newHistory.slice(0, 50));
        }

        setEditingResultId(null);
    } else if (editingSlot) {
        // Handling Advanced Image Form Slots
        setAdvImgFormData(prev => ({ ...prev, [editingSlot]: croppedImage }));
        setEditingSlot(null);
    } else {
        // Handling Script Mode Reference
        setFormData(prev => ({ ...prev, referenceImage: croppedImage }));
        autoDetectGender(croppedImage.data, croppedImage.mimeType);
    }
    setEditingImage(null);
    if(fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleCropCancel = () => {
    setEditingImage(null);
    setEditingSlot(null);
    setEditingResultId(null);
    // Only uncheck if we don't have a reference image yet (for script mode)
    if (!editingSlot && !formData.referenceImage && !editingResultId) {
        setFormData(prev => ({ ...prev, useReferenceModel: false }));
    }
    if(fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
  };


  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    deleteItemFromDB(SCRIPTS_STORE, id);
  };
  
  const copyHistoryItem = (item: GeneratedScript) => {
    const imagePromptsText = item.imagePrompts && item.imagePrompts.length > 0 ? `\n\n--- VISUALISASI SCENE (PROMPTS) ---\n${item.imagePrompts.map(p => { let promptBlock = `Sumber: "${p.source}"\nPrompt Gambar: ${p.manualPrompt || p.prompt}`; if (p.textVideoPrompt) { promptBlock += `\nPrompt Text To Video: "${p.textVideoPrompt}"`; } if (p.videoPrompt) { promptBlock += `\nPrompt Image To Video: "${p.videoPrompt}"`; } if (p.veo3VideoPrompt) { promptBlock += `\nPrompt Image to Video (Veo 3): "${p.veo3VideoPrompt}"`; } return promptBlock; }).join('\n\n')}` : '';
    const groundingChunksText = item.groundingChunks && item.groundingChunks.length > 0 ? `\n\n--- SUMBER DARI GOOGLE SEARCH ---\n${item.groundingChunks.map(c => `${c.web.title || 'Untitled'}: ${c.web.uri}`).join('\n')}` : '';
    const longFormText = item.longFormContent ? `\n\n--- ARTIKEL / FACEBOOK POST ---\n${item.longFormContent}` : '';
    const fullContent = `--- SCRIPT ---\n${String(item.scriptContent || '')}${groundingChunksText}\n\n--- CAPTION ---\n${item.caption || ''}\n\n--- HASHTAGS ---\n${item.hashtags ? item.hashtags.join(' ') : ''}${longFormText}${imagePromptsText}`.trim();
    navigator.clipboard.writeText(fullContent).then(() => {
        setCopiedHistoryId(item.id);
        setTimeout(() => setCopiedHistoryId(null), 2000);
    });
  };
  
  const downloadHistoryItem = useCallback((item: GeneratedScript) => {
    const imagePromptsText = item.imagePrompts && item.imagePrompts.length > 0 ? `\n\n[VISUALISASI SCENE (PROMPTS)]\n${item.imagePrompts.map(p => { let promptBlock = `Sumber: "${p.source}"\nPrompt Gambar: ${p.manualPrompt || p.prompt}`; if (p.textVideoPrompt) { promptBlock += `\nPrompt Text To Video: "${p.textVideoPrompt}"`; } if (p.videoPrompt) { promptBlock += `\nPrompt Image To Video: "${p.videoPrompt}"`; } if (p.veo3VideoPrompt) { promptBlock += `\nPrompt Image to Video (Veo 3): "${p.veo3VideoPrompt}"`; } return promptBlock; }).join('\n\n')}` : '';
    const groundingChunksText = item.groundingChunks && item.groundingChunks.length > 0 ? `\n\n[SUMBER DARI GOOGLE SEARCH]\n${item.groundingChunks.map(c => `${c.web.title || 'Untitled'}: ${c.web.uri}`).join('\n')}` : '';
    const longFormText = item.longFormContent ? `\n\n[ARTIKEL / FACEBOOK POST]\n${item.longFormContent}` : '';
    const fullContent = `[SCRIPT]\n${String(item.scriptContent || '')}${groundingChunksText}\n\n[CAPTION]\n${item.caption || ''}\n\n[HASHTAGS]\n${item.hashtags ? item.hashtags.join(' ') : ''}${longFormText}${imagePromptsText}`.trim();
    const safeFormula = item.storytellingFormula.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `skrip_riwayat_hook_${item.hookNumber}_${safeFormula}.txt`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    requestAnimationFrame(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    });
  }, []);

  const viewHistoryItem = (id: string) => {
    const itemToView = history.find(item => item.id === id);
    if (itemToView) {
        setGeneratedScripts([itemToView]);
        setError(null);
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadImagePlusPrompt = (result: AdvancedImageResult) => {
      const safeName = sanitizeFilename(result.filename);
      // 1. Download Text File
      // Use application/octet-stream to force save and prevent opening in browser
      const promptContent = `PROMPT:\n${result.prompt}\n\nVIDEO PROMPT (I2V):\n${result.videoPrompt || 'Tidak ada video prompt.'}`;
      const textBlob = new Blob([promptContent], { type: 'application/octet-stream' });
      forceDownload(textBlob, `${safeName}_prompt.txt`);
      
      // 2. Download Image (Delay increased to ensure browser doesn't block sequential downloads)
      setTimeout(() => {
          // Use octet-stream to force download logic
          const imgBlob = base64ToBlob(result.base64, 'application/octet-stream');
          forceDownload(imgBlob, `${safeName}.png`);
      }, 800);
  };
  
  const deleteImageHistoryItem = async (id: string) => {
      await deleteImageFromDB(id);
      const newHistory = await getAllImagesFromDB();
      setImageHistory(newHistory.slice(0, 50));
  };

  // ... (Other helpers like renderInputField remain the same) ...
  const renderInputField = (name: keyof FormData, label: string, placeholder: string, type: 'input' | 'textarea' = 'input') => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      {type === 'textarea' ? <textarea id={name} name={name} value={String(formData[name])} onChange={handleInputChange} placeholder={placeholder} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
      : <input id={name} name={name} type="text" value={String(formData[name])} onChange={handleInputChange} placeholder={placeholder} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed" />}
    </div>
  );

  const renderSelectField = (name: keyof FormData, label: string, options: string[]) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <select id={name} name={name} value={String(formData[name])} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
  );
  
  const isAiScriptMode = formData.scriptSource === 'ai';

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* ... (Header, Tabs, Form Column - unchanged) ... */}
      {editingImage && (
        <ImageCropper
          imageSrc={`data:${editingImage.mimeType};base64,${editingImage.data}`}
          imageMimeType={editingImage.mimeType}
          // Fix: Use the image's specific aspect ratio if editing an existing result, otherwise fallback to form data
          targetAspectRatio={parseAspectRatio(editingImage.aspectRatio || (editingSlot ? advImgFormData.aspectRatio : formData.aspectRatio))}
          aspectRatio={editingImage.aspectRatio || (editingSlot ? advImgFormData.aspectRatio : formData.aspectRatio)}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <header className="text-center mb-6 w-full max-w-7xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">ScriptMate AI</h1>
        <p className="text-slate-400 mt-2">
          Copywriter & Sutradara Visual{' '}
          <a 
            href="https://akariu.blogspot.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            https://akariu.blogspot.com/
          </a>
        </p>
        <div className="mt-4 flex flex-col items-center justify-center max-w-md mx-auto">
          <input
            type="password"
            placeholder="Input Gemini API Key (Opsional)"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-center mb-2"
          />
          <p className="text-xs text-slate-500">
            Masukan terlebih dahulu API Key akun google masing masing. Anda bisa 
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline mx-1">
              dapatkan API Key sendiri
            </a> 
            ada kuota default harian yang mungkin terbatas Terutama saat pembuatan Gambar.GRATIS, sbg apresiasi Author- akan muncul iklan saat klik generate🙏, bisa langsung di close jika menggangu
          </p>
        </div>
      </header>

      {/* --- TOP LEVEL TABS --- */}
      <div className="flex justify-center mb-8 w-full">
          <div className="bg-slate-800 p-1 rounded-xl shadow-lg flex gap-1">
              <button
                  onClick={() => setActiveTab('production')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'production' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                  Produksi Konten
              </button>
              <button
                  onClick={() => setActiveTab('ideas')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'ideas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                  Cari Ide Konten
              </button>
              <button
                  onClick={() => setActiveTab('image-production')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'image-production' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                  Produksi Gambar
              </button>
          </div>
      </div>
      
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- FORM COLUMN --- */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={
              activeTab === 'production' ? handleSubmit : 
              activeTab === 'ideas' ? handleGenerateIdeas :
              imageTab === 'character' ? handleCharacterSession :
              imageTab === 'prompt-maker' ? handlePromptMaker :
              handleAdvancedImageGen
            } 
            className="bg-slate-800/50 rounded-xl p-6 space-y-6"
          >
            
            {activeTab === 'production' && (
                // --- PRODUCTION MODE FORM ---
                <fieldset className="space-y-6 animate-fade-in">
                    {/* ... (Existing form content - No changes needed here) ... */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                        {(Object.values(Mode) as Mode[]).map(m => <button type="button" key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.mode === m ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>{m}</button>)}
                    </div>

                    <fieldset disabled={!isAiScriptMode} className="space-y-6 disabled:opacity-50">
                        {formData.mode === Mode.GENERAL ? renderInputField('topic', 'Topik / Ide Konten', 'cth: Manfaat minum air putih') : (<>{renderInputField('productName', 'Nama Produk', 'cth: Serum Pencerah Wajah')}{renderInputField('productDescription', 'Deskripsi Produk', 'cth: Mengandung vitamin C...', 'textarea')}</>)}
                        <div className="flex items-end gap-4">
                            <div className="flex-grow">
                                <label htmlFor="durationMinutes" className="block text-sm font-medium text-slate-300 mb-1">Durasi (Menit:Detik)</label>
                                <div className="flex items-center gap-2">
                                    <input id="durationMinutes" name="durationMinutes" type="number" value={formData.durationMinutes} onChange={handleInputChange} min="0" placeholder="M" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" aria-label="Durasi menit"/>
                                    <input id="durationSeconds" name="durationSeconds" type="number" value={formData.durationSeconds} onChange={handleInputChange} min="0" max="59" placeholder="D" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" aria-label="Durasi detik"/>
                                </div>
                            </div>
                            <div className="w-32 flex-shrink-0">
                                <label htmlFor="scriptCount" className="block text-sm font-medium text-slate-300 mb-1">Jumlah Skrip</label>
                                <input id="scriptCount" name="scriptCount" type="number" value={formData.scriptCount} onChange={handleInputChange} min="1" max="20" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />
                            </div>
                        </div>
                    </fieldset>

                    <div className="grid grid-cols-2 gap-4">{renderSelectField('tone', 'Gaya Bahasa', TONES_OF_VOICE)}{renderSelectField('audience', 'Target Audiens', TARGET_AUDIENCES)}</div>

                    <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <label htmlFor="seoFriendly" className="text-sm font-medium text-slate-300">SEO Friendly</label>
                            <input type="checkbox" id="seoFriendly" name="seoFriendly" checked={formData.seoFriendly} onChange={e => setFormData(prev => ({ ...prev, seoFriendly: e.target.checked }))} className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer" onClick={() => setFormData(p => ({...p, seoFriendly: !p.seoFriendly}))}></div>
                        </div>
                        {formData.mode === Mode.SALES && (
                            <fieldset disabled={!isAiScriptMode} className="disabled:opacity-50">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="hardSelling" className="text-sm font-medium text-slate-300">Hard Selling</label>
                                    <input type="checkbox" id="hardSelling" name="hardSelling" checked={formData.hardSelling} onChange={e => setFormData(prev => ({ ...prev, hardSelling: e.target.checked }))} className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer" onClick={() => setFormData(p => ({...p, hardSelling: !p.hardSelling}))}></div>
                                </div>
                            </fieldset>
                        )}
                        <div className="flex items-center justify-between">
                            <label htmlFor="generateImagePrompts" className="text-sm font-medium text-slate-300">Visualisasi Scene</label>
                            <input type="checkbox" id="generateImagePrompts" name="generateImagePrompts" checked={formData.generateImagePrompts} onChange={e => setFormData(prev => ({ ...prev, generateImagePrompts: e.target.checked }))} className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer" onClick={() => setFormData(p => ({...p, generateImagePrompts: !p.generateImagePrompts}))}></div>
                        </div>
                        
                        {/* --- IMAGE FLOW (GROK) TOGGLE & OPTIONS --- */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="enableLipsync" className="text-sm font-medium text-slate-300 flex items-center gap-1">
                                <span>Image(Flow/Grok)</span>
                                <span className="bg-indigo-500 text-[10px] px-1.5 py-0.5 rounded text-white font-bold">BETA</span>
                            </label>
                            <input type="checkbox" id="enableLipsync" name="enableLipsync" checked={formData.enableLipsync} onChange={e => setFormData(prev => ({ ...prev, enableLipsync: e.target.checked }))} className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer" onClick={() => setFormData(p => ({...p, enableLipsync: !p.enableLipsync}))}></div>
                        </div>
                        
                        {/* Image Flow Options Panel */}
                        {formData.enableLipsync && (
                            <div className="pl-4 mt-2 mb-4 space-y-4 pt-2 border-l-2 border-indigo-500/30 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-2">Durasi Segmen Skrip</label>
                                    <div className="flex gap-2">
                                        {[6, 8, 10, 12, 15].map(time => (
                                            <button 
                                                key={time}
                                                type="button" 
                                                onClick={() => setFormData(prev => ({ ...prev, flowSegmentDuration: time }))}
                                                className={`flex-1 px-2 py-1.5 rounded text-xs transition duration-200 ${
                                                    formData.flowSegmentDuration === time 
                                                        ? 'bg-indigo-600 font-bold text-white shadow-sm' 
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                {time} Detik
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Skrip akan otomatis dibagi menjadi beberapa segmen berdasarkan durasi.</p>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-2">Gaya Audio (Per Segmen)</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ ...prev, flowAudioMode: 'VO' }))}
                                            className={`flex-1 px-2 py-1.5 rounded text-xs transition duration-200 ${
                                                formData.flowAudioMode === 'VO' 
                                                    ? 'bg-indigo-600 font-bold text-white shadow-sm' 
                                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            Voice Over (VO)
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ ...prev, flowAudioMode: 'Lipsync' }))}
                                            className={`flex-1 px-2 py-1.5 rounded text-xs transition duration-200 ${
                                                formData.flowAudioMode === 'Lipsync' 
                                                    ? 'bg-indigo-600 font-bold text-white shadow-sm' 
                                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            Berbicara (Lipsync)
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">VO: Model menutup mulut. Berbicara: Model melakukan lipsync naskah.</p>
                                </div>
                            </div>
                        )}

                        {(formData.generateImagePrompts || formData.enableLipsync) && (
                            <div className="pl-4 mt-2 space-y-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="autoGenerateImages" className="text-sm font-medium text-slate-300">Buatin gambar langsung</label>
                                    <input type="checkbox" id="autoGenerateImages" name="autoGenerateImages" checked={formData.autoGenerateImages} onChange={e => setFormData(prev => ({ ...prev, autoGenerateImages: e.target.checked }))} className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer" onClick={() => setFormData(p => ({...p, autoGenerateImages: !p.autoGenerateImages}))}></div>
                                </div>
                                <p className="text-xs text-slate-400 -mt-2">Jika aktif, AI akan langsung membuat semua gambar setelah skrip jadi. (Memakai lebih banyak kuota)</p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Rasio Aspek Gambar</label>
                                    <div className="grid grid-cols-5 gap-2 bg-slate-700 p-1 rounded-lg">
                                        {(['9:16', '16:9', '1:1', '2:3', '4:5'] as AspectRatio[]).map(ratio => (<button type="button" key={ratio} onClick={() => { setFormData(p => ({ ...p, aspectRatio: ratio, referenceImage: undefined, })); setEditingImage(null); }} className={`px-2 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${formData.aspectRatio === ratio ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>{ratio === '1:1' ? 'Persegi' : ratio}</button>))}
                                    </div>
                                </div>

                                {/* GENDER & ETHNICITY SECTION */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-slate-300">Gender Model</label>
                                        {isDetectingGender && <span className="text-xs text-indigo-400 animate-pulse">Mendeteksi gender...</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 bg-slate-700 p-1 rounded-lg mb-4">
                                        {(Object.keys(GENDER_LABELS) as GenderSelection[]).map(gender => (<button type="button" key={gender} onClick={() => setFormData(p => ({...p, gender: gender}))} className={`px-2 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${formData.gender === gender ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>{GENDER_LABELS[gender]}</button>))}
                                    </div>

                                    {!formData.useReferenceModel && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Wilayah & Karakteristik Wajah</label>
                                            <select 
                                                name="modelRegion" 
                                                value={formData.modelRegion} 
                                                onChange={handleInputChange} 
                                                className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {MODEL_REGIONS.map(region => (
                                                    <option key={region.id} value={region.id}>{region.label}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-slate-400 mt-1">
                                                AI akan membuat wajah model sesuai karakteristik wilayah yang dipilih.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between pt-2">
                                    <label htmlFor="useReferenceModel" className="text-sm font-medium text-slate-300">Referensi Model</label>
                                    <input type="checkbox" id="useReferenceModel" name="useReferenceModel" checked={formData.useReferenceModel} onChange={e => setFormData(prev => ({ ...prev, useReferenceModel: e.target.checked, referenceImage: undefined }))} className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer" onClick={() => setFormData(p => ({...p, useReferenceModel: !p.useReferenceModel, referenceImage: undefined}))}></div>
                                </div>
                                {formData.useReferenceModel && (
                                    <div className="space-y-3 bg-slate-700/30 p-3 rounded-lg">
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} ref={fileInputRef} className="hidden" />
                                        
                                        {!formData.referenceImage ? (
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm text-center bg-slate-600/50 hover:bg-slate-600 text-slate-300 py-2 rounded-md transition-colors">
                                                Upload Gambar Referensi
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className={`mt-2 relative group w-full ${aspectRatioClasses[formData.aspectRatio]} rounded-lg overflow-hidden bg-black`}>
                                                    <img 
                                                        src={`data:${formData.referenceImage.mimeType};base64,${formData.referenceImage.data}`} 
                                                        alt="Pratinjau Referensi" 
                                                        className="w-full h-full object-cover opacity-80" 
                                                    />
                                                    {/* Overlay Actions */}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                                            <button
                                                            type="button"
                                                            onClick={() => handleAdjustReference()}
                                                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transform hover:scale-105 transition"
                                                            title="Atur Ulang / Crop Lagi"
                                                        >
                                                            <Icon type="adjust" className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadReference(formData.referenceImage!.data, formData.referenceImage!.mimeType)}
                                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg transform hover:scale-105 transition"
                                                            title="Download Gambar"
                                                        >
                                                            <Icon type="download" className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg transform hover:scale-105 transition"
                                                            title="Ganti Gambar"
                                                        >
                                                            <Icon type="edit" className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResetReference()}
                                                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg transform hover:scale-105 transition"
                                                            title="Hapus"
                                                        >
                                                            <Icon type="trash" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-lg">
                                                    {(['kreatif', 'pose-background'] as ReferenceMode[]).map(mode => (
                                                        <button type="button" key={mode} onClick={() => setFormData(p => ({...p, referenceMode: mode}))} className={`px-2 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${formData.referenceMode === mode ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>{mode === 'kreatif' ? 'Kreatif' : 'Pose & BG'}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Hook Input Section */}
                        <fieldset disabled={!isAiScriptMode} className="disabled:opacity-50 border-t border-slate-700/50 pt-4">
                            <div>
                                <label htmlFor="manualHook" className="block text-sm font-medium text-slate-300 mb-1">
                                    Input Manual Hook Konten (Opsional)
                                </label>
                                <textarea
                                    id="manualHook"
                                    name="manualHook"
                                    value={formData.manualHook}
                                    onChange={handleInputChange}
                                    placeholder="Tulis kalimat hook/pembuka andalan Anda di sini... (Biarkan kosong jika ingin AI memilih hook acak)"
                                    rows={2}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400 text-sm"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Jika diisi, AI akan wajib menggunakan kalimat ini sebagai pembuka dan menyesuaikannya dengan topik Anda.
                                </p>
                            </div>
                        </fieldset>
                        
                        {formData.mode === Mode.SALES && (
                            <fieldset disabled={!isAiScriptMode} className="disabled:opacity-50 border-t border-slate-700/50 pt-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Mode Produksi Konten Jualan</label>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, salesMode: 'spesialis' }))} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.salesMode === 'spesialis' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Spesialis</button>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, salesMode: 'kompleks' }))} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.salesMode === 'kompleks' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Kompleks</button>
                                    </div>
                                </div>
                                {formData.salesMode === 'spesialis' && (
                                    <div className="mt-4 space-y-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Pilihan Mode Spesialis</label>
                                            <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, spesialisType: 'aman' }))} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.spesialisType === 'aman' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Aman</button>
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, spesialisType: 'bebas' }))} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.spesialisType === 'bebas' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Bebas</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="hargaNormal" className="block text-sm font-medium text-slate-300 mb-1">Harga Normal (Opsional)</label>
                                            <input type="text" id="hargaNormal" name="hargaNormal" value={formData.hargaNormal || ''} onChange={handleInputChange} placeholder="cth: 150000" className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="hargaPromo" className="block text-sm font-medium text-slate-300 mb-1">Harga Promo (Opsional)</label>
                                            <input type="text" id="hargaPromo" name="hargaPromo" value={formData.hargaPromo || ''} onChange={handleInputChange} placeholder="cth: 99000" className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="jumlahIsi" className="block text-sm font-medium text-slate-300 mb-1">Jumlah Isi / Pcs dalam 1 Paket (Opsional)</label>
                                            <input type="text" id="jumlahIsi" name="jumlahIsi" value={formData.jumlahIsi || ''} onChange={handleInputChange} placeholder="cth: 2" className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                )}
                            </fieldset>
                        )}
                    </div>

                    {(formData.mode !== Mode.SALES || formData.salesMode !== 'spesialis') && (
                        <fieldset disabled={!isAiScriptMode} className="disabled:opacity-50 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{formData.mode === Mode.SALES ? 'Pilih Tipe & Rumus Jualan' : 'Pilih Rumus Storytelling (Opsional)'}</label>
                                {formData.mode === Mode.SALES ? (<div className='space-y-4'><div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg"><button type="button" onClick={() => handleFormulaTypeChange('storytelling')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.salesFormulaType === 'storytelling' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Storytelling</button><button type="button" onClick={() => handleFormulaTypeChange('relate')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.salesFormulaType === 'relate' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Relate</button></div>
                                <div>
                                    <label htmlFor="ctaType" className="block text-xs font-medium text-slate-400 mb-1">Jenis CTA (Call to Action)</label>
                                    <select id="ctaType" name="ctaType" value={formData.ctaType} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        {SALES_CTA_TYPES.map(cta => <option key={cta} value={cta}>{cta}</option>)}
                                    </select>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">{(formData.salesFormulaType === 'storytelling' ? STORYTELLING_FORMULAS : RELATE_FORMULAS).map(formula => (<button type="button" key={formula.id} onClick={() => handleFormulaToggle(formula.id)} className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-between ${formData.selectedFormulas.includes(formula.id) ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}><span>{formula.label}</span>{formData.selectedFormulas.includes(formula.id) && <Icon type="check" className="w-4 h-4" />}</button>))}</div></div>) : (<div className="max-h-40 overflow-y-auto space-y-2 pr-2">{STORYTELLING_FORMULAS.map(formula => (<button type="button" key={formula.id} onClick={() => handleFormulaToggle(formula.id)} className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-between ${formData.selectedFormulas.includes(formula.id) ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}><span>{formula.label}</span>{formData.selectedFormulas.includes(formula.id) && <Icon type="check" className="w-4 h-4" />}</button>))}</div>)}
                            </div>
                        </fieldset>
                    )}

                    <div className="space-y-3 pt-4 border-t border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300">Sumber Skrip</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                            <button type="button" onClick={() => setFormData(p => ({ ...p, scriptSource: 'ai' }))} className={`px-2 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.scriptSource === 'ai' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Buat skrip AI</button>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, scriptSource: 'manual' }))} className={`px-2 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.scriptSource === 'manual' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Input Skrip Manual</button>
                        </div>
                        {formData.scriptSource === 'ai' && (
                             <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 animate-fade-in">
                                <Icon type="check" className="w-3 h-3 text-green-400" />
                                <span>Siap menggunakan <strong>{HOOKS.length} Hook Viral</strong> (Diacak dengan sistem RNG Kriptografi)</span>
                             </p>
                        )}
                    </div>

                    {formData.scriptSource === 'manual' && (
                        <div className="animate-fade-in">
                        <label htmlFor="manualScript" className="block text-sm font-medium text-slate-300 mb-1">Skrip Manual Anda</label>
                        <textarea id="manualScript" name="manualScript" value={formData.manualScript} onChange={handleInputChange} placeholder="Tulis atau tempel skrip lengkap Anda di sini. AI akan menganalisis skrip ini untuk membuat visualisasi adegan, caption, dan hashtag." rows={8} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                        </div>
                    )}
                    
                    <button 
  type="submit" 
  onClick={() => { if (!isLoading && !(formData.useReferenceModel && !formData.referenceImage)) openAffiliateLink(); }}
  disabled={isLoading || (formData.useReferenceModel && !formData.referenceImage)} 
  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {isLoading ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Memproses...</span>
    </>
  ) : (
    <>
      <Icon type="sparkles" className="w-5 h-5" />Buat Skrip
    </>
  )}
</button>
                </fieldset>
            )}
            
            {/* ... (Ideas Tab and Image Production Tab logic remains unchanged) ... */}
             {activeTab === 'ideas' && (
                 // --- IDEA GENERATION MODE FORM ---
                 <fieldset className="space-y-6 animate-fade-in">
                     <div>
                        <label htmlFor="ideaTopic" className="block text-sm font-medium text-slate-300 mb-1">Topik / Kategori Konten</label>
                        <input
                            id="ideaTopic"
                            name="topic"
                            type="text"
                            value={ideaFormData.topic}
                            onChange={handleIdeaInputChange}
                            placeholder="cth: Digital Marketing, Diet Sehat, Fashion Pria"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            required
                        />
                     </div>
                     <div>
                        <label htmlFor="ideaCount" className="block text-sm font-medium text-slate-300 mb-1">Jumlah Ide (Maks. 30)</label>
                        <input
                            id="ideaCount"
                            name="count"
                            type="number"
                            value={ideaFormData.count}
                            onChange={handleIdeaInputChange}
                            min="1"
                            max="30"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                     </div>
                     
                     <div className="bg-slate-700/50 p-4 rounded-lg text-sm text-slate-400 space-y-2">
                         <p className="font-semibold text-slate-300">Formula AI:</p>
                         <div className="flex items-center gap-2">
                             <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs">[Aksi/Bentuk]</span>
                             <span>+</span>
                             <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">[Topik]</span>
                             <span>+</span>
                             <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs">[Tujuan]</span>
                         </div>
                     </div>

                     <button type="submit"onClick={() => { if (!isLoading) openAffiliateLink(); }} disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Mencari Ide...</span></>) : (<><Icon type="sparkles" className="w-5 h-5" />Cari Ide Konten</>)}</button>
                 </fieldset>
            )}

            {activeTab === 'image-production' && (
                // --- IMAGE PRODUCTION MODE FORM ---
                <div className="space-y-6 animate-fade-in">
                    {/* ... (Existing image tabs navigation and forms - No changes needed here) ... */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-700 p-1 rounded-lg mb-4">
                        {(['character', 'generate', 'prompt-maker'] as ImageTab[]).map(t => (
                            <button type="button" key={t} onClick={() => setImageTab(t)} className={`px-2 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors duration-200 ${imageTab === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>
                                {t === 'character' ? 'Buat Karakter' : t === 'generate' ? 'Buat Gambar' : 'Buat Prompt'}
                            </button>
                        ))}
                    </div>

                    {imageTab === 'character' && (
                        <fieldset className="space-y-4" disabled={isLoading}>
                             <div>
                                 <label className="block text-sm font-medium text-slate-300 mb-1">Region / Race</label>
                                 <select name="region" value={charFormData.region} onChange={handleCharInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white mb-2">
                                     {MODEL_REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                                     <option value="others">Lainnya (Input Manual)</option>
                                 </select>
                                 {charFormData.region === 'others' && (
                                     <input 
                                        name="customRegion" 
                                        value={charFormData.customRegion || ''} 
                                        onChange={handleCharInputChange} 
                                        placeholder="Ketik manual wilayah/ras... (cth: Skandinavia, Indian, dll)"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white animate-fade-in"
                                     />
                                 )}
                             </div>
                             
                             <div>
                                 <label className="block text-sm font-medium text-slate-300 mb-2">Framing / Shot Type</label>
                                 <div className="grid grid-cols-3 gap-2 bg-slate-700 p-1 rounded-lg">
                                     {CHARACTER_FRAMINGS.map(f => (
                                         <button 
                                            type="button" 
                                            key={f.id} 
                                            onClick={() => setCharFormData(prev => ({...prev, framing: f.id}))}
                                            className={`px-2 py-2 rounded-md text-xs font-semibold transition-colors duration-200 flex flex-col items-center justify-center text-center h-full ${charFormData.framing === f.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                                         >
                                             {f.label}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi Tambahan / Ciri Khas (Opsional)</label>
                                 <textarea 
                                    name="userDescription" 
                                    value={charFormData.userDescription || ''} 
                                    onChange={handleCharInputChange} 
                                    placeholder="Cth: Memakai hijab pashmina warna pastel, kacamata bulat, gaya fashion casual..." 
                                    rows={2}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                                 />
                                 <p className="text-xs text-slate-400 mt-1">Gunakan ini untuk request spesifik (Hijab, Warna Rambut, Gaya Baju, dll).</p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-300 mb-1">Age</label><input name="age" value={charFormData.age} onChange={handleCharInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white" /></div>
                                <div><label className="block text-sm font-medium text-slate-300 mb-1">Gender</label><select name="gender" value={charFormData.gender} onChange={handleCharInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"><option>Male</option><option>Female</option></select></div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Genre Visual</label>
                                <select name="genre" value={charFormData.genre} onChange={handleCharInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                                    {VISUAL_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-300 mb-1">Aspek Rasio</label>
                                 <select name="aspectRatio" value={charFormData.aspectRatio} onChange={handleCharInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                                     <option value="9:16">9:16 (Portrait)</option><option value="1:1">1:1 (Square)</option>
                                 </select>
                             </div>
                             <button type="submit"onClick={() => { if (!isLoading) openAffiliateLink(); }} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2">{isLoading ? 'Membuat Karakter...' : 'Generate Character'}</button>
                        </fieldset>
                    )}

                    {imageTab === 'prompt-maker' && (
                        <fieldset className="space-y-4" disabled={isLoading}>
                             <div><label className="block text-sm font-medium text-slate-300 mb-1">Ide Sederhana</label><textarea name="idea" value={promptFormData.idea} onChange={handlePromptMakerChange} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white" placeholder="Contoh: Kucing cyberpunk minum kopi di neon city" /></div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Genre Visual</label>
                                <select name="genre" value={promptFormData.genre} onChange={handlePromptMakerChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                                    {VISUAL_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Camera Angle</label>
                                <select name="angle" value={promptFormData.angle} onChange={handlePromptMakerChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                                    {CAMERA_ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                             </div>
                             <button type="submit"onClick={() => { if (!isLoading) openAffiliateLink(); }} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2">{isLoading ? 'Membuat Prompt...' : 'Buat Prompt'}</button>
                        </fieldset>
                    )}

                    {imageTab === 'generate' && (
                         <fieldset className="space-y-4" disabled={isLoading}>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Prompt / Deskripsi</label>
                                <textarea name="prompt" value={advImgFormData.prompt} onChange={handleAdvImgChange} rows={4} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white" placeholder="Deskripsikan gambar yang ingin dibuat..." />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-sm font-medium text-slate-300 mb-1">Aspek Rasio</label>
                                     <select name="aspectRatio" value={advImgFormData.aspectRatio} onChange={handleAdvImgChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                                        {(['9:16', '16:9', '1:1', '2:3', '4:5'] as AspectRatio[]).map(r => <option key={r} value={r}>{r}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-slate-300 mb-1">Jumlah Gambar</label>
                                     <input type="number" name="count" value={advImgFormData.count} onChange={handleAdvImgChange} min="1" max="10" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white" />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-300 mb-1">Nama File (Opsional)</label>
                                 <input type="text" name="filename" value={advImgFormData.filename || ''} onChange={handleAdvImgChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white" placeholder="cth: boni" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-300 mb-1">Fokus Item (Untuk Prompt Video)</label>
                                 <textarea name="focusItem" value={advImgFormData.focusItem || ''} onChange={handleAdvImgChange} rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white" placeholder="cth: bordir bunga elegan pada lengan" />
                                 <p className="text-xs text-slate-400 mt-1">Jika diisi, AI akan membuat prompt khusus untuk mengubah gambar ini menjadi video.</p>
                             </div>

                             {/* Multi-Slot Image Upload */}
                             <div className="space-y-3 pt-4 border-t border-slate-700/50">
                                 <label className="block text-sm font-medium text-slate-300">Referensi Gambar (Drag & Drop)</label>
                                 <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, editingSlot!)} />
                                 
                                 <div className="grid grid-cols-2 gap-3">
                                     {([
                                         { key: 'refModel', label: 'Model Utama' },
                                         { key: 'refTop', label: 'Atasan (Opsional)' },
                                         { key: 'refBottom', label: 'Bawahan (Opsional)' },
                                         { key: 'refProduct', label: 'Produk Lain' }
                                     ] as const).map((slot) => (
                                         <div 
                                            key={slot.key} 
                                            className={`relative overflow-hidden rounded-lg cursor-pointer transition-colors ${aspectRatioClasses[advImgFormData.aspectRatio]} ${advImgFormData[slot.key] ? 'border-indigo-500 bg-black' : dragOverSlot === slot.key ? 'border-2 border-dashed border-indigo-400 bg-slate-700' : 'border-2 border-dashed border-slate-600 hover:bg-slate-700/50 flex flex-col items-center justify-center'}`}
                                            onDragOver={(e) => handleDragOver(e, slot.key)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, slot.key)}
                                         >
                                             {advImgFormData[slot.key] ? (
                                                 <>
                                                    <img src={`data:${advImgFormData[slot.key]!.mimeType};base64,${advImgFormData[slot.key]!.data}`} className="w-full h-full object-cover opacity-80" />
                                                    <div className="absolute top-0 left-0 bg-black/60 px-2 py-1 rounded-br text-xs text-white font-medium z-10">{slot.label}</div>
                                                    
                                                    {/* Controls Overlay */}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-wrap items-center justify-center gap-1.5 p-2">
                                                        <button type="button" onClick={() => handleAdjustReference(slot.key)} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow" title="Atur Ulang"><Icon type="adjust" className="w-4 h-4" /></button>
                                                        <button type="button" onClick={() => handleDownloadReference(advImgFormData[slot.key]!.data, advImgFormData[slot.key]!.mimeType)} className="p-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded shadow" title="Download"><Icon type="download" className="w-4 h-4" /></button>
                                                        <button type="button" onClick={() => { setEditingSlot(slot.key); fileInputRef.current?.click(); }} className="p-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded shadow" title="Ganti"><Icon type="edit" className="w-4 h-4" /></button>
                                                        <button type="button" onClick={() => handleResetReference(slot.key)} className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded shadow" title="Hapus"><Icon type="trash" className="w-4 h-4" /></button>
                                                    </div>
                                                 </>
                                             ) : (
                                                 <div onClick={() => { setEditingSlot(slot.key); fileInputRef.current?.click(); }} className="w-full h-full flex flex-col items-center justify-center p-2">
                                                    <Icon type="download" className="w-6 h-6 text-slate-400 mb-2" />
                                                    <span className={`text-xs text-center ${dragOverSlot === slot.key ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                                                        {dragOverSlot === slot.key ? 'Lepaskan Gambar!' : slot.label}
                                                    </span>
                                                 </div>
                                             )}
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             <button type="submit"onClick={() => { if (!isLoading) openAffiliateLink(); }} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2">{isLoading ? 'Memproses Gambar...' : 'Buat Gambar'}</button>
                         </fieldset>
                    )}
                </div>
            )}

          </form>
        </div>

        {/* --- RESULTS COLUMN --- */}
        <div className="lg:col-span-8 space-y-8">
            {/* ... (Error and Loading UI - No changes needed here) ... */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-3">
                    <Icon type="delete" className="w-6 h-6 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            
            {isLoading && (
                 <div className="bg-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon type="sparkles" className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                    <p className="text-lg font-medium text-slate-300">{loadingMessage}</p>
                 </div>
            )}

            {/* PRODUCTION TAB RESULTS */}
            {activeTab === 'production' && (
                // ... (No changes here)
                <div className="space-y-6">
                    {generatedScripts.length > 0 && (
                        <div className="space-y-6" ref={resultsRef}>
                             <div className="flex items-center gap-2 mb-4">
                                <Icon type="sparkles" className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-xl font-bold text-white">Hasil Generasi</h2>
                            </div>
                            {generatedScripts.map(script => (
                                <ScriptCard
                                    key={script.id}
                                    script={script}
                                    onGenerateImage={handleGenerateImage}
                                    onGenerateLipsyncImage={handleGenerateLipsyncImage}
                                    onGenerateFlowVideoPrompt={handleGenerateFlowVideoPrompt}
                                    onPromptChange={handlePromptChange}
                                    onGenerateVideoPrompt={handleGenerateVideoPrompt}
                                    onGenerateTextVideoPrompt={handleGenerateTextVideoPrompt}
                                    onGenerateVeo3VideoPrompt={handleGenerateVeo3VideoPrompt}
                                    onGenerateLongForm={handleGenerateLongForm}
                                />
                            ))}
                        </div>
                    )}

                    {history.length > 0 && (
                        <div className="pt-8 border-t border-slate-700">
                             <h2 className="text-xl font-bold text-slate-400 mb-6 flex items-center gap-2">
                                <Icon type="history" className="w-5 h-5" />
                                Riwayat Skrip
                            </h2>
                            <div className="space-y-6">
                                {history.map(item => (
                                    <div key={item.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:bg-slate-800 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                 <span className="inline-block px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 mb-1">
                                                    Hook #{item.hookNumber} • {item.storytellingFormula}
                                                 </span>
                                                 <p className="text-slate-300 text-sm line-clamp-3">{item.scriptContent}</p>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0 ml-2">
                                                 <button onClick={() => viewHistoryItem(item.id)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg" title="Lihat"><Icon type="preview" className="w-4 h-4" /></button>
                                                 <button onClick={() => downloadHistoryItem(item)} className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg" title="Download"><Icon type="download" className="w-4 h-4" /></button>
                                                 <button onClick={() => copyHistoryItem(item)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg" title="Salin">{copiedHistoryId === item.id ? <Icon type="check" className="w-4 h-4 text-green-500" /> : <Icon type="copy" className="w-4 h-4" />}</button>
                                                 <button onClick={() => deleteHistoryItem(item.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg" title="Hapus"><Icon type="trash" className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* IDEAS TAB RESULTS */}
            {activeTab === 'ideas' && (
                <div className="space-y-6">
                    {ideaHistory.length > 0 ? (
                        ideaHistory.map(batch => (
                            <IdeaResultCard 
                                key={batch.id} 
                                batch={batch} 
                                onDelete={deleteIdeaHistoryItem} 
                            />
                        ))
                    ) : (
                        !isLoading && (
                            <div className="text-center text-slate-500 py-12">
                                <Icon type="sparkles" className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Belum ada ide tersimpan. Mulai cari ide sekarang!</p>
                            </div>
                        )
                    )}
                </div>
            )}
            
            {/* IMAGE PRODUCTION TAB RESULTS */}
            {activeTab === 'image-production' && (
                <div className="space-y-8">
                    {/* Character Results */}
                    {imageTab === 'character' && characterResult && (
                         <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                             <h3 className="text-lg font-bold text-white mb-4">Hasil Karakter</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 {/* Image A */}
                                 <div className="space-y-2">
                                     <p className="text-sm font-medium text-slate-400">Tampak Depan (Portrait)</p>
                                     <div className={`relative bg-black rounded-lg overflow-hidden ${aspectRatioClasses[charFormData.aspectRatio]}`}>
                                         {characterResult.isLoadingA ? (
                                             <div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
                                         ) : characterResult.imageA ? (
                                             <img src={`data:image/png;base64,${characterResult.imageA}`} alt="Character A" className="w-full h-full object-cover" />
                                         ) : characterResult.errorA ? (
                                             <div className="absolute inset-0 flex items-center justify-center p-4 text-red-400 text-xs text-center">{characterResult.errorA}</div>
                                         ) : null}
                                         
                                         {characterResult.imageA && (
                                             <div className="absolute top-2 right-2 flex gap-1">
                                                 <button onClick={() => handleDownloadReference(characterResult.imageA!, 'image/png')} className="p-1.5 bg-black/50 text-white rounded hover:bg-black/70"><Icon type="download" className="w-4 h-4" /></button>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                                 {/* Image B */}
                                 <div className="space-y-2">
                                     <p className="text-sm font-medium text-slate-400">Tampak Samping / Gaya Lain</p>
                                     <div className={`relative bg-black rounded-lg overflow-hidden ${aspectRatioClasses[charFormData.aspectRatio]}`}>
                                         {characterResult.isLoadingB ? (
                                             <div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
                                         ) : characterResult.imageB ? (
                                             <img src={`data:image/png;base64,${characterResult.imageB}`} alt="Character B" className="w-full h-full object-cover" />
                                         ) : characterResult.errorB ? (
                                             <div className="absolute inset-0 flex items-center justify-center p-4 text-red-400 text-xs text-center">{characterResult.errorB}</div>
                                         ) : null}
                                         
                                          {characterResult.imageB && (
                                             <div className="absolute top-2 right-2 flex gap-1">
                                                 <button onClick={() => handleDownloadReference(characterResult.imageB!, 'image/png')} className="p-1.5 bg-black/50 text-white rounded hover:bg-black/70"><Icon type="download" className="w-4 h-4" /></button>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                             <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                                 <p className="text-xs text-slate-400 font-mono mb-1">Character Description:</p>
                                 <p className="text-sm text-slate-300">{characterResult.summary}</p>
                             </div>
                         </div>
                    )}
                    
                    {/* Prompt Maker Results */}
                    {imageTab === 'prompt-maker' && promptMakerResult && (
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
                            <h3 className="text-lg font-bold text-white">Hasil Prompt</h3>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-indigo-400">Prompt Bahasa Indonesia (Artistik)</label>
                                <div className="bg-slate-900/50 p-3 rounded-lg flex gap-3">
                                    <p className="text-sm text-slate-300 flex-grow">{promptMakerResult.indoPrompt}</p>
                                    <button onClick={() => navigator.clipboard.writeText(promptMakerResult.indoPrompt)} className="text-slate-400 hover:text-white"><Icon type="copy" className="w-5 h-5" /></button>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-indigo-400">Prompt English (AI Optimized)</label>
                                <div className="bg-slate-900/50 p-3 rounded-lg flex gap-3">
                                    <p className="text-sm text-slate-300 flex-grow">{promptMakerResult.engPrompt}</p>
                                    <button onClick={() => navigator.clipboard.writeText(promptMakerResult.engPrompt)} className="text-slate-400 hover:text-white"><Icon type="copy" className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced Image Results (Current Session) */}
                    {advancedImageResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {advancedImageResults.map((res) => (
                                <div key={res.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative group">
                                     <div className={`w-full ${aspectRatioClasses[res.aspectRatio]} bg-black relative`}>
                                         <img src={`data:image/png;base64,${res.base64}`} alt={res.prompt} className="w-full h-full object-cover" />
                                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                             <button onClick={() => handleDownloadImagePlusPrompt(res)} className="p-2 bg-slate-700 text-white rounded-full hover:bg-indigo-600" title="Download Image + Prompt"><Icon type="download" className="w-5 h-5" /></button>
                                              <button 
                                                onClick={() => {
                                                    setEditingResultId(res.id);
                                                    setEditingImage({ data: res.base64, mimeType: 'image/png', aspectRatio: res.aspectRatio });
                                                }} 
                                                className="p-2 bg-slate-700 text-white rounded-full hover:bg-indigo-600" 
                                                title="Edit / Crop"
                                              >
                                                <Icon type="adjust" className="w-5 h-5" />
                                              </button>
                                         </div>
                                     </div>
                                     <div className="p-3">
                                         <p className="text-xs text-slate-400 line-clamp-2 mb-2">{res.prompt}</p>
                                         {res.videoPrompt && (
                                             <div className="bg-slate-900/50 p-2 rounded relative group/videoprompt">
                                                 <div className="flex justify-between items-start">
                                                     <p className="text-[10px] text-indigo-300 font-bold mb-1">VIDEO PROMPT:</p>
                                                     <button 
                                                        onClick={() => navigator.clipboard.writeText(res.videoPrompt!)} 
                                                        className="text-slate-400 hover:text-white"
                                                        title="Salin Prompt Video"
                                                     >
                                                         <Icon type="copy" className="w-3 h-3" />
                                                     </button>
                                                 </div>
                                                 <p className="text-[10px] text-slate-400 line-clamp-3">{res.videoPrompt}</p>
                                             </div>
                                         )}
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Image History from IndexedDB */}
                    {imageHistory.length > 0 && (
                        <div className="pt-8 border-t border-slate-700">
                             <h2 className="text-xl font-bold text-slate-400 mb-6 flex items-center gap-2">
                                <Icon type="history" className="w-5 h-5" />
                                Galeri Riwayat
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                {imageHistory.map(img => (
                                    <div key={img.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative group">
                                         {/* Bagian Gambar */}
                                         <div className={`w-full ${aspectRatioClasses[img.aspectRatio]} bg-black relative`}>
                                            <img src={`data:image/png;base64,${img.base64}`} className="w-full h-full object-cover" alt={img.prompt} />
                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                 <button onClick={() => handleDownloadImagePlusPrompt(img)} className="p-2 bg-slate-700 text-white rounded-full hover:bg-indigo-600" title="Download"><Icon type="download" className="w-5 h-5" /></button>
                                                 <button onClick={() => deleteImageHistoryItem(img.id)} className="p-2 bg-slate-700 text-white rounded-full hover:bg-red-600" title="Hapus"><Icon type="trash" className="w-5 h-5" /></button>
                                            </div>
                                         </div>
                                         
                                         {/* Bagian Info Prompt (Sama seperti Hasil Generasi) */}
                                         <div className="p-3">
                                             <p className="text-xs text-slate-400 line-clamp-2 mb-2" title={img.prompt}>{img.prompt}</p>
                                             
                                             {img.videoPrompt && (
                                                 <div className="bg-slate-900/50 p-2 rounded relative group/videoprompt">
                                                     <div className="flex justify-between items-start">
                                                         <p className="text-[10px] text-indigo-300 font-bold mb-1">VIDEO PROMPT:</p>
                                                         <button 
                                                            onClick={() => navigator.clipboard.writeText(img.videoPrompt!)} 
                                                            className="text-slate-400 hover:text-white"
                                                            title="Salin Prompt Video"
                                                         >
                                                             <Icon type="copy" className="w-3 h-3" />
                                                         </button>
                                                     </div>
                                                     <p className="text-[10px] text-slate-400 line-clamp-3">{img.videoPrompt}</p>
                                                 </div>
                                             )}
                                         </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
