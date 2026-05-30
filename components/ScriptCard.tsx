
import React, { useState, useCallback } from 'react';
import { GeneratedScript, ImagePrompt, AspectRatio } from '../types';
import Icon from './Icon';

interface ScriptCardProps {
  script: GeneratedScript;
  onGenerateImage: (scriptId: string, promptIndex: number) => void;
  onGenerateLipsyncImage?: (scriptId: string, segmentIndex: number) => void; 
  onGenerateFlowVideoPrompt?: (scriptId: string, segmentIndex: number) => void;
  onPromptChange: (scriptId: string, promptIndex: number, newPrompt: string) => void;
  onGenerateVideoPrompt: (scriptId: string, promptIndex: number, imageBase64: string) => void;
  onGenerateTextVideoPrompt: (scriptId: string, promptIndex: number) => void;
  onGenerateVeo3VideoPrompt: (scriptId: string, promptIndex: number) => void;
  onGenerateLongForm: (scriptId: string) => void;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ 
  script, 
  onGenerateImage, 
  onGenerateLipsyncImage,
  onGenerateFlowVideoPrompt,
  onPromptChange, 
  onGenerateVideoPrompt, 
  onGenerateTextVideoPrompt, 
  onGenerateVeo3VideoPrompt,
  onGenerateLongForm
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedScriptOnly, setCopiedScriptOnly] = useState(false);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedVideoPromptIndex, setCopiedVideoPromptIndex] = useState<number | null>(null);
  const [copiedTextVideoPromptIndex, setCopiedTextVideoPromptIndex] = useState<number | null>(null);
  const [copiedVeo3VideoPromptIndex, setCopiedVeo3VideoPromptIndex] = useState<number | null>(null);
  const [copiedLongForm, setCopiedLongForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);
  
  // Lipsync Copy States
  const [copiedLipsyncPromptIndex, setCopiedLipsyncPromptIndex] = useState<number | null>(null);

  // Helper for blob download
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleCopy = useCallback(() => {
    const imagePromptsText = script.imagePrompts && script.imagePrompts.length > 0
      ? `\n\n--- VISUALISASI SCENE (PROMPTS) ---\n${
          script.imagePrompts.map((p, idx) => {
            let promptBlock = `Scene #${idx + 1}: "${p.source}"\nPrompt Gambar: ${p.manualPrompt || p.prompt}`;
            if (p.textVideoPrompt) {
              promptBlock += `\nPrompt Text To Video: "${p.textVideoPrompt}"`;
            }
            if (p.videoPrompt) {
              promptBlock += `\nPrompt Image To Video: "${p.videoPrompt}"`;
            }
            if (p.veo3VideoPrompt) {
              promptBlock += `\nPrompt Image to Video (Veo 3): "${p.veo3VideoPrompt}"`;
            }
            return promptBlock;
          }).join('\n\n')
        }`
      : '';
    
    const lipsyncText = script.lipsyncSegments && script.lipsyncSegments.length > 0
      ? `\n\n--- AI SUTRADARA VIDEO (LIPSYNC & I2V) ---\n${
          script.lipsyncSegments.map(seg => 
            `SEGMENT ${seg.segmentNumber} (${seg.duration})\nDialog: "${seg.dialog}"\n\nVIDEO PROMPT:\n${seg.videoPrompt}`
          ).join('\n\n')
      }` : '';
    
    const groundingChunksText = script.groundingChunks && script.groundingChunks.length > 0
      ? `\n\n--- SUMBER DARI GOOGLE SEARCH ---\n${script.groundingChunks.map(c => `${c.web.title || 'Untitled'}: ${c.web.uri}`).join('\n')}`
      : '';
      
    const longFormText = script.longFormContent ? `\n\n--- ARTIKEL / FACEBOOK POST ---\n${script.longFormContent}` : '';

    const fullContent = `
--- SCRIPT ---
${script.scriptContent}${groundingChunksText}

--- CAPTION ---
${script.caption || ''}

--- HASHTAGS ---
${script.hashtags ? script.hashtags.join(' ') : ''}${longFormText}${imagePromptsText}${lipsyncText}
`.trim();

    navigator.clipboard.writeText(fullContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [script]);

  const handleCopyScriptOnly = useCallback(() => {
    if (!script.scriptContent) return;
    navigator.clipboard.writeText(script.scriptContent).then(() => {
      setCopiedScriptOnly(true);
      setTimeout(() => setCopiedScriptOnly(false), 2000);
    });
  }, [script]);
  
  const handleDownload = useCallback(() => {
    // ... logic same as handleCopy but for file download ...
    // Simplified for brevity, follows same structure as handleCopy
    // Using handleCopy logic to construct content
    
    const imagePromptsText = script.imagePrompts && script.imagePrompts.length > 0
      ? `\n\n[VISUALISASI SCENE (PROMPTS)]\n${
          script.imagePrompts.map((p, idx) => {
            let promptBlock = `Scene #${idx + 1}: "${p.source}"\nPrompt Gambar: ${p.manualPrompt || p.prompt}`;
            if (p.textVideoPrompt) {
              promptBlock += `\nPrompt Text To Video: "${p.textVideoPrompt}"`;
            }
            if (p.videoPrompt) {
              promptBlock += `\nPrompt Image To Video: "${p.videoPrompt}"`;
            }
            if (p.veo3VideoPrompt) {
              promptBlock += `\nPrompt Image to Video (Veo 3): "${p.veo3VideoPrompt}"`;
            }
            return promptBlock;
          }).join('\n\n')
        }`
      : '';

    const lipsyncText = script.lipsyncSegments && script.lipsyncSegments.length > 0
      ? `\n\n[AI SUTRADARA VIDEO (LIPSYNC & I2V)]\n${
          script.lipsyncSegments.map(seg => 
            `SEGMENT ${seg.segmentNumber} (${seg.duration})\nDialog: "${seg.dialog}"\n\nVIDEO PROMPT:\n${seg.videoPrompt}`
          ).join('\n\n')
      }` : '';
    
    const groundingChunksText = script.groundingChunks && script.groundingChunks.length > 0
      ? `\n\n[SUMBER DARI GOOGLE SEARCH]\n${script.groundingChunks.map(c => `${c.web.title || 'Untitled'}: ${c.web.uri}`).join('\n')}`
      : '';
      
    const longFormText = script.longFormContent ? `\n\n[ARTIKEL / FACEBOOK POST]\n${script.longFormContent}` : '';

    const fullContent = `
[SCRIPT]
${script.scriptContent}${groundingChunksText}

[CAPTION]
${script.caption || ''}

[HASHTAGS]
${script.hashtags ? script.hashtags.join(' ') : ''}${longFormText}${imagePromptsText}${lipsyncText}
`.trim();

    const safeFormula = script.storytellingFormula.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `skrip_hook_${script.hookNumber}_${safeFormula}.txt`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [script]);

  const handleCopyPrompt = useCallback((promptToCopy: string, index: number) => {
    navigator.clipboard.writeText(promptToCopy).then(() => {
      setCopiedPromptIndex(index);
      setTimeout(() => setCopiedPromptIndex(null), 2000);
    });
  }, []);

  const handleCopyVideoPrompt = useCallback((promptToCopy: string, index: number) => {
    navigator.clipboard.writeText(promptToCopy).then(() => {
        setCopiedVideoPromptIndex(index);
        setTimeout(() => setCopiedVideoPromptIndex(null), 2000);
    });
  }, []);
  
  const handleCopyTextVideoPrompt = useCallback((promptToCopy: string, index: number) => {
    navigator.clipboard.writeText(promptToCopy).then(() => {
        setCopiedTextVideoPromptIndex(index);
        setTimeout(() => setCopiedTextVideoPromptIndex(null), 2000);
    });
  }, []);

  const handleCopyVeo3VideoPrompt = useCallback((promptToCopy: string, index: number) => {
    navigator.clipboard.writeText(promptToCopy).then(() => {
        setCopiedVeo3VideoPromptIndex(index);
        setTimeout(() => setCopiedVeo3VideoPromptIndex(null), 2000);
    });
  }, []);
  
  const handleCopyLipsyncVideoPrompt = useCallback((promptToCopy: string, index: number) => {
      navigator.clipboard.writeText(promptToCopy).then(() => {
          setCopiedLipsyncPromptIndex(index);
          setTimeout(() => setCopiedLipsyncPromptIndex(null), 2000);
      });
  }, []);

  const handleCopyLongForm = useCallback((text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          setCopiedLongForm(true);
          setTimeout(() => setCopiedLongForm(false), 2000);
      });
  }, []);


  const handleDownloadImage = (base64: string, source: string) => {
    const safeSource = source.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeSource.substring(0, 50)}.png`;
    
    // Use Blob + application/octet-stream to force download and avoid browser preview
    const blob = base64ToBlob(base64, 'application/octet-stream');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    requestAnimationFrame(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    });
  };

  const aspectRatioClasses: Record<AspectRatio, string> = {
    '9:16': 'aspect-[9/16]',
    '16:9': 'aspect-[16/9]',
    '1:1': 'aspect-square',
    '2:3': 'aspect-[2/3]',
    '4:5': 'aspect-[4/5]',
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 relative group transition-all duration-300 hover:bg-slate-700/50">
      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img src={`data:image/png;base64,${previewImage}`} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
           <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
      )}

      {/* Action Buttons (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
         <button
          onClick={handleCopyScriptOnly}
          className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Salin Skrip Saja"
          aria-label="Copy script content only"
        >
          {copiedScriptOnly ? <Icon type="check" className="w-5 h-5" /> : <Icon type="document" className="w-5 h-5" />}
        </button>
         <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Download Semua sebagai File"
          aria-label="Download script"
        >
          <Icon type="download" className="w-5 h-5" />
        </button>
        <button
          onClick={handleCopy}
          className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Salin Semua (Skrip + Caption + Hashtag)"
          aria-label="Copy script"
        >
          {copied ? <Icon type="check" className="w-5 h-5" /> : <Icon type="copy" className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <span className="bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-full font-medium">Hook #{script.hookNumber}</span>
        <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-medium">{script.storytellingFormula}</span>
        {script.wordCount && (
          <span className="bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-medium">{script.wordCount} Kata</span>
        )}
        {script.estimatedDuration && (
          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-medium">~{script.estimatedDuration}</span>
        )}
        {script.isFromGoogleSearch && (
          <span className="bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full font-medium">Info Terkini</span>
        )}
      </div>

      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{script.scriptContent}</p>
      
      {/* --- GENERATE LONG FORM CONTENT BUTTON --- */}
      <div className="mt-4">
        {!script.longFormContent && !script.isGeneratingLongForm && (
            <button
                onClick={() => onGenerateLongForm(script.id)}
                className="flex items-center gap-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-indigo-300 hover:text-indigo-200 px-3 py-2 rounded-md transition-colors"
            >
                <Icon type="document" className="w-4 h-4" />
                Buat Postingan Lengkap (FB/Blog)
            </button>
        )}
        
        {script.isGeneratingLongForm && (
             <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 px-3 py-2 bg-slate-800/50 rounded-md border border-slate-700">
                <svg className="animate-spin h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sedang mengembangkan artikel...</span>
            </div>
        )}

        {script.longFormContent && (
            <div className="mt-3 bg-slate-900/50 rounded-md p-4 border border-slate-700 relative group/longform">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                        <Icon type="document" className="w-4 h-4" />
                        Artikel / Postingan FB
                    </h4>
                    <button
                        onClick={() => handleCopyLongForm(script.longFormContent!)}
                        className="p-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                        title="Salin Artikel"
                    >
                         {copiedLongForm ? <Icon type="check" className="w-4 h-4 text-green-400" /> : <Icon type="copy" className="w-4 h-4" />}
                    </button>
                </div>
                <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {script.longFormContent}
                </div>
            </div>
        )}
      </div>

      {script.groundingChunks && script.groundingChunks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-400 mb-2">Sumber dari Google Search</h4>
          <ul className="space-y-1">
            {script.groundingChunks.map((chunk, index) => (
              <li key={index}>
                <a
                  href={chunk.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={chunk.web.uri}
                  className="text-xs text-sky-400 hover:text-sky-300 hover:underline"
                >
                  {index + 1}. {chunk.web.title || chunk.web.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(script.caption || (script.hashtags && script.hashtags.length > 0)) && (
        <div className="mt-6 pt-4 border-t border-slate-700 space-y-3">
            {script.caption && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">✨ Caption</h4>
                    <p className="text-slate-300 text-sm">{script.caption}</p>
                </div>
            )}
            {script.hashtags && script.hashtags.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">🔥 Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                        {script.hashtags.map((tag, index) => (
                            <span key={index} className="text-xs bg-slate-700 text-cyan-300 px-2 py-1 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}
      
      {/* --- STANDARD VISUAL SCENE PROMPTS --- */}
      {script.imagePrompts && script.imagePrompts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700 space-y-3">
          <h4 className="text-sm font-semibold text-slate-400 mb-2">🎨 Visualisasi Scene (Prompt Teks-ke-Gambar)</h4>
          <div className="space-y-4">
            {script.imagePrompts.map((promptItem, index) => {
              // Extract logic to display scene Number if missing from text
              const sourceText = promptItem.source || '';
              // Simple heuristic: if it starts with a number, use it, else use index+1
              const hasNumber = /^\d+/.test(sourceText);
              const sceneLabel = hasNumber ? '' : `Scene #${index + 1}: `;

              return (
                <div key={index} className="bg-slate-900/50 p-3 rounded-md">
                   <div className="mb-2 bg-slate-800/40 p-2 rounded border-l-2 border-indigo-500">
                      <p className="text-xs text-indigo-300 font-bold mb-1">
                          {sceneLabel}Sumber Skrip
                      </p>
                      <p className="text-sm text-slate-200 italic">
                          "{sourceText}"
                      </p>
                   </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-grow">
                      {editingPromptIndex === index ? (
                          <textarea
                              value={promptItem.manualPrompt ?? promptItem.prompt}
                              onChange={(e) => onPromptChange(script.id, index, e.target.value)}
                              className="w-full bg-slate-800 border border-slate-600 rounded-md text-xs px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                              rows={3}
                              autoFocus
                          />
                      ) : (
                          <p className="text-slate-300 text-xs flex-grow">{promptItem.manualPrompt || promptItem.prompt}</p>
                      )}
                    </div>
                    <div className="flex items-center flex-shrink-0 gap-1">
                      <button
                        onClick={() => setEditingPromptIndex(editingPromptIndex === index ? null : index)}
                        className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-200"
                        aria-label="Edit prompt"
                      >
                        <Icon type="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(promptItem.manualPrompt || promptItem.prompt, index)}
                        className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-200"
                        aria-label="Copy prompt"
                      >
                        {copiedPromptIndex === index ? <Icon type="check" className="w-4 h-4 text-green-400" /> : <Icon type="copy" className="w-4 h-4" />}
                      </button>
                       <button
                          onClick={() => onGenerateImage(script.id, index)}
                          disabled={promptItem.isLoading}
                          className="ml-1 px-3 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                          aria-label="Buat Gambar"
                        >
                         Buat Gambar
                        </button>
                    </div>
                  </div>
                  {/* Image Generation Result Area */}
                  <div className="mt-3 space-y-3">
                    {promptItem.isLoading && (
                       <div className={`flex items-center justify-center bg-slate-800/50 rounded-lg w-32 ${aspectRatioClasses[script.aspectRatio]}`}>
                          <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="sr-only">AI sedang menggambar...</span>
                       </div>
                    )}
                    {promptItem.error && (
                      <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-xs whitespace-pre-wrap">{promptItem.error}</div>
                    )}
                    {promptItem.base64 && (
                        <div className={`relative group/image w-32 rounded-lg ${aspectRatioClasses[script.aspectRatio]}`}>
                          <img 
                              src={`data:image/png;base64,${promptItem.base64}`} 
                              alt={promptItem.source} 
                              className="rounded-lg w-full h-full object-cover"
                          />
                          <div 
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2"
                            aria-hidden="true"
                          >
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewImage(promptItem.base64!); }} 
                                className="p-2 rounded-full bg-slate-700/80 text-white hover:bg-slate-600"
                                aria-label="Pratinjau gambar"
                              >
                                <Icon type="preview" className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDownloadImage(promptItem.base64!, promptItem.source); }} 
                                className="p-2 rounded-full bg-slate-700/80 text-white hover:bg-slate-600"
                                aria-label="Download gambar"
                              >
                                <Icon type="download" className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onGenerateImage(script.id, index); }} 
                                className="p-2 rounded-full bg-slate-700/80 text-white hover:bg-slate-600"
                                aria-label="Buat ulang gambar"
                              >
                                <Icon type="regenerate" className="w-5 h-5" />
                              </button>
                          </div>
                        </div>
                    )}
                  </div>

                  {/* Video Prompts Section */}
                  <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-3">
                      <h5 className="text-xs font-semibold text-slate-400">🎬 Prompt Video</h5>

                      {/* --- Text-to-Video --- */}
                      <div className="text-xs max-w-sm">
                          {!promptItem.textVideoPrompt && !promptItem.isGeneratingTextVideoPrompt && !promptItem.textVideoPromptError && (
                              <button
                                  onClick={() => onGenerateTextVideoPrompt(script.id, index)}
                                  className="w-full text-center px-2 py-1.5 rounded-md font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors duration-200"
                              >
                                  Buat Prompt Text To Video
                              </button>
                          )}
                          {promptItem.isGeneratingTextVideoPrompt && (
                              <div className="flex items-center justify-center gap-2 text-slate-400 p-2 bg-slate-800/50 rounded-md">
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  <span>Membuat prompt T2V...</span>
                              </div>
                          )}
                          {promptItem.textVideoPromptError && (
                            <div className="space-y-2">
                              <div className="text-red-400 p-2 bg-red-500/10 rounded-md">{promptItem.textVideoPromptError}</div>
                               <button
                                  onClick={() => onGenerateTextVideoPrompt(script.id, index)}
                                  className="w-full text-center px-2 py-1.5 rounded-md font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors duration-200"
                              >
                                  Coba Buat Ulang Prompt T2V
                              </button>
                            </div>
                          )}
                          {promptItem.textVideoPrompt && (
                              <div className="space-y-1 bg-slate-800/50 p-2 rounded-md">
                                  <p className="font-semibold text-slate-400">Prompt Text To Video:</p>
                                  <div className="flex items-start gap-2">
                                      <p className="flex-grow text-slate-300 italic">"{promptItem.textVideoPrompt}"</p>
                                      <button onClick={() => handleCopyTextVideoPrompt(promptItem.textVideoPrompt!, index)} className="p-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-200 flex-shrink-0" aria-label="Salin prompt T2V">
                                          {copiedTextVideoPromptIndex === index ? <Icon type="check" className="w-3 h-3 text-green-400" /> : <Icon type="copy" className="w-3 h-3" />}
                                      </button>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      {/* --- Image-to-Video (only if image exists) --- */}
                      {promptItem.base64 && (
                        <div className="text-xs max-w-sm space-y-2">
                            {promptItem.isGeneratingVideoPrompt && (
                                <div className="flex items-center justify-center gap-2 text-slate-400 p-2 bg-slate-800/50 rounded-md">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Membuat prompt I2V...</span>
                                </div>
                            )}
                             {/* Veo 3 Button and UI */}
                            {!promptItem.veo3VideoPrompt && !promptItem.isGeneratingVeo3VideoPrompt && !promptItem.veo3VideoPromptError && (
                              <button
                                  onClick={() => onGenerateVeo3VideoPrompt(script.id, index)}
                                  className="w-full text-center px-2 py-1.5 rounded-md font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors duration-200"
                              >
                                  Buat Prompt Image to Video (Veo 3) +VO
                              </button>
                            )}
                            {promptItem.isGeneratingVeo3VideoPrompt && (
                                <div className="flex items-center justify-center gap-2 text-slate-400 p-2 bg-slate-800/50 rounded-md">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Membuat prompt Veo 3...</span>
                                </div>
                            )}
                            {promptItem.veo3VideoPromptError && (
                              <div className="space-y-2">
                                <div className="text-red-400 p-2 bg-red-500/10 rounded-md">{promptItem.veo3VideoPromptError}</div>
                                <button
                                  onClick={() => onGenerateVeo3VideoPrompt(script.id, index)}
                                  className="w-full text-center px-2 py-1.5 rounded-md font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors duration-200"
                                >
                                    Coba Buat Ulang Prompt Veo 3
                                </button>
                              </div>
                            )}
                            {promptItem.videoPromptError && (
                              <div className="space-y-2">
                                <div className="text-red-400 p-2 bg-red-500/10 rounded-md">{promptItem.videoPromptError}</div>
                                 <button
                                  onClick={() => { if (promptItem.base64) { onGenerateVideoPrompt(script.id, index, promptItem.base64); } }}
                                  className="w-full text-center px-2 py-1.5 rounded-md font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors duration-200"
                                >
                                    Coba Buat Ulang Prompt I2V
                                </button>
                              </div>
                            )}
                            {promptItem.videoPrompt && (
                                <div className="space-y-1 bg-slate-800/50 p-2 rounded-md">
                                    <p className="font-semibold text-slate-400">Prompt Image To Video:</p>
                                    <div className="flex items-start gap-2">
                                        <p className="flex-grow text-slate-300 italic">"{promptItem.videoPrompt}"</p>
                                        <button
                                            onClick={() => handleCopyVideoPrompt(promptItem.videoPrompt!, index)}
                                            className="p-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-200 flex-shrink-0"
                                            aria-label="Salin prompt video"
                                        >
                                            {copiedVideoPromptIndex === index ? <Icon type="check" className="w-3 h-3 text-green-400" /> : <Icon type="copy" className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {promptItem.veo3VideoPrompt && (
                                <div className="space-y-1 bg-slate-800/50 p-2 rounded-md">
                                    <p className="font-semibold text-slate-400">Prompt Image to Video (Veo 3):</p>
                                    <div className="flex items-start gap-2">
                                        <p className="flex-grow text-slate-300 italic">"{promptItem.veo3VideoPrompt}"</p>
                                        <button
                                            onClick={() => handleCopyVeo3VideoPrompt(promptItem.veo3VideoPrompt!, index)}
                                            className="p-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-200 flex-shrink-0"
                                            aria-label="Salin prompt Veo 3"
                                        >
                                            {copiedVeo3VideoPromptIndex === index ? <Icon type="check" className="w-3 h-3 text-green-400" /> : <Icon type="copy" className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* --- IMAGE FLOW / VIDEO SEGMENTS --- */}
      {script.lipsyncSegments && script.lipsyncSegments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-indigo-500/30">
              <div className="flex items-center gap-2 mb-4 bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20">
                  <Icon type="sparkles" className="w-5 h-5 text-indigo-400" />
                  <div>
                      <h4 className="text-sm font-bold text-white">AI Sutradara Video (Image Flow)</h4>
                      <p className="text-xs text-indigo-300">Skrip telah dipecah menjadi segmen video siap produksi.</p>
                  </div>
              </div>
              
              <div className="space-y-6">
                  {script.lipsyncSegments.map((seg, index) => (
                      <div key={index} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                          {/* Segment Header */}
                          <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded">
                                  Segment {seg.segmentNumber} • {seg.duration}
                              </span>
                          </div>

                          {/* Dialog & Prompt Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left: Content & Image */}
                              <div className="space-y-3">
                                  <div>
                                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Teks / Dialog</label>
                                      <p className="text-sm text-slate-200 font-medium italic">"{seg.dialog}"</p>
                                  </div>
                                  
                                  {/* Image Generation Area for Segment */}
                                  <div>
                                      <div className="flex items-center justify-between mb-2">
                                          <label className="text-[10px] text-slate-500 uppercase font-semibold">Frame Awal (Image)</label>
                                          {!seg.base64 && !seg.isLoading && (
                                              <button 
                                                  onClick={() => onGenerateLipsyncImage && onGenerateLipsyncImage(script.id, index)}
                                                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors"
                                              >
                                                  Buat Gambar
                                              </button>
                                          )}
                                      </div>
                                      
                                      <div className="bg-black/40 rounded-lg p-2 min-h-[100px] flex items-center justify-center relative group/segimg">
                                          {seg.isLoading ? (
                                              <div className="flex flex-col items-center gap-2">
                                                  <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                  <span className="text-xs text-slate-500">Generating...</span>
                                              </div>
                                          ) : seg.base64 ? (
                                              <div className={`relative w-32 ${aspectRatioClasses[script.aspectRatio]} rounded overflow-hidden`}>
                                                  <img src={`data:image/png;base64,${seg.base64}`} alt={`Segment ${seg.segmentNumber}`} className="w-full h-full object-cover" />
                                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/segimg:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                      <button onClick={() => setPreviewImage(seg.base64!)} className="p-1.5 bg-slate-700 rounded-full text-white hover:bg-indigo-600"><Icon type="preview" className="w-4 h-4" /></button>
                                                      <button onClick={() => handleDownloadImage(seg.base64!, `segment_${seg.segmentNumber}`)} className="p-1.5 bg-slate-700 rounded-full text-white hover:bg-indigo-600"><Icon type="download" className="w-4 h-4" /></button>
                                                      <button onClick={() => onGenerateLipsyncImage && onGenerateLipsyncImage(script.id, index)} className="p-1.5 bg-slate-700 rounded-full text-white hover:bg-indigo-600"><Icon type="regenerate" className="w-4 h-4" /></button>
                                                  </div>
                                              </div>
                                          ) : (
                                              <div className="text-center w-full">
                                                  <p className="text-[10px] text-slate-500 mb-1 line-clamp-2 text-left">{seg.imagePrompt}</p>
                                                  {seg.error && <p className="text-xs text-red-400">{seg.error}</p>}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>

                              {/* Right: Video Prompt */}
                              <div className="bg-slate-800 rounded-lg p-3 flex flex-col h-full">
                                  <div className="flex justify-between items-center mb-2">
                                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Prompt Video (I2V Flow)</label>
                                      {seg.videoPrompt ? (
                                          <button 
                                              onClick={() => handleCopyLipsyncVideoPrompt(seg.videoPrompt, index)}
                                              className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                                          >
                                              {copiedLipsyncPromptIndex === index ? <Icon type="check" className="w-3 h-3 text-green-400" /> : <Icon type="copy" className="w-3 h-3" />}
                                              Salin
                                          </button>
                                      ) : null}
                                  </div>
                                  
                                  <div className="flex-grow bg-slate-900/50 rounded p-2 overflow-y-auto max-h-[150px] custom-scrollbar flex flex-col">
                                      {seg.videoPrompt ? (
                                        <p className="text-[10px] text-slate-300 whitespace-pre-wrap font-mono leading-tight">{seg.videoPrompt}</p>
                                      ) : (
                                        <div className="flex-grow flex flex-col items-center justify-center text-center p-2">
                                            {/* We only allow video prompt generation if base64 image exists */}
                                            {seg.base64 ? (
                                                <button
                                                    onClick={() => onGenerateFlowVideoPrompt && onGenerateFlowVideoPrompt(script.id, index)}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <Icon type="bolt" className="w-3 h-3" />
                                                    Buat Video Prompt
                                                </button>
                                            ) : (
                                                <p className="text-xs text-slate-500">Silakan buat gambar terlebih dahulu untuk dapat membuat Video Prompt.</p>
                                            )}
                                        </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default ScriptCard;
