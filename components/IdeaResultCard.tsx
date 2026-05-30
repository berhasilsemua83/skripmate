
import React, { useState } from 'react';
import { GeneratedIdeaBatch } from '../types';
import Icon from './Icon';

interface IdeaResultCardProps {
  batch: GeneratedIdeaBatch;
  onDelete: (id: string) => void;
}

const IdeaResultCard: React.FC<IdeaResultCardProps> = ({ batch, onDelete }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyIdea = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleDownloadAll = () => {
    const content = batch.ideas.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ide_konten_${batch.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 relative group transition-all duration-300 hover:bg-slate-700/50 mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-4">
        <div>
           <h3 className="text-lg font-bold text-white mb-1">{batch.topic}</h3>
           <p className="text-xs text-slate-400">
             {new Date(batch.timestamp).toLocaleDateString()} • {batch.ideas.length} Ide
           </p>
        </div>
        <div className="flex items-center gap-2">
           <button
             onClick={handleDownloadAll}
             className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
             title="Download Semua Ide (TXT)"
           >
             <Icon type="download" className="w-5 h-5" />
           </button>
           <button
             onClick={() => onDelete(batch.id)}
             className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
             title="Hapus Riwayat"
           >
             <Icon type="trash" className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="space-y-3">
        {batch.ideas.map((idea, index) => (
          <div key={index} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg group/idea">
            <p className="text-slate-300 text-sm flex-grow pr-4">{idea}</p>
            <button
              onClick={() => handleCopyIdea(idea, index)}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              title="Salin Ide"
            >
              {copiedIndex === index ? (
                <Icon type="check" className="w-4 h-4 text-green-400" />
              ) : (
                <Icon type="copy" className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdeaResultCard;
