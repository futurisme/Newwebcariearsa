import { FileData } from './types';
import { cleanDisplayName, formatFileSize, formatTimestamp, getFileTypeBadge, isAudioFile, isImageFile, isVideoFile } from './utils/fileHelpers';

export function renderFileCard(file: FileData, index: number, state: any) {
  const isSelected = state.selectedFileNames.has(file.name);
  const isPlaying = state.activeAudioFile?.name === file.name;
  const isSelectionMode = state.isSelectionMode;
  
  const isAudio = isAudioFile(file.name);
  const isImage = isImageFile(file.name);
  const isVideo = isVideoFile(file.name);
  const badgeInfo = getFileTypeBadge(file.name);
  const displayName = cleanDisplayName(file.name);
  const fileSize = formatFileSize(file.metadata?.size);
  const fileDate = formatTimestamp(file.created_at);
  const delay = Math.min(index * 0.02, 0.25);

  let visualHTML = '';
  if (isImage) {
    visualHTML = `
      <div class="w-full h-full checkerboard-dark flex items-center justify-center overflow-hidden">
        <img src="${file.publicUrl}" alt="${displayName}" class="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105 select-none pointer-events-none" loading="lazy" />
      </div>`;
  } else if (isAudio) {
    visualHTML = `
      <div class="flex flex-col items-center justify-center gap-1.5 p-3 text-amber-400 select-none">
        <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500/25 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/60' : 'bg-slate-800 text-amber-400 group-hover:bg-slate-700/90'}">
          <i data-lucide="music" class="w-5 h-5"></i>
        </div>
        ${isPlaying ? `<div class="flex items-center gap-0.5 mt-1"><span class="w-1 h-2 bg-amber-400 rounded-full animate-bounce"></span><span class="w-1 h-3.5 bg-amber-400 rounded-full animate-bounce delay-100"></span><span class="w-1 h-2 bg-amber-400 rounded-full animate-bounce delay-200"></span></div>` : ''}
      </div>`;
  } else if (isVideo) {
    visualHTML = `
      <div class="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
        <video 
          src="${file.publicUrl}#t=1" 
          preload="metadata" 
          muted 
          playsinline 
          class="video-preview-thumb w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none select-none"
        ></video>
        <div class="video-fallback-icon absolute inset-0 flex items-center justify-center text-purple-400/80 pointer-events-none">
          <div class="w-10 h-10 rounded-full bg-slate-900/80 flex items-center justify-center backdrop-blur-sm border border-slate-700/60 shadow-md">
            <i data-lucide="video" class="w-5 h-5"></i>
          </div>
        </div>
        <div class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/90 border border-purple-500/40 backdrop-blur-sm text-purple-300 flex items-center gap-1 text-[9px] font-mono z-10 pointer-events-none shadow-sm">
          <i data-lucide="play" class="w-2.5 h-2.5 fill-purple-400 text-purple-400"></i>
          <span>0:01</span>
        </div>
      </div>`;
  } else if (badgeInfo.iconType === 'pdf' || badgeInfo.iconType === 'word') {
    visualHTML = `<div class="flex items-center justify-center p-3 ${badgeInfo.iconType==='pdf'?'text-rose-400':'text-blue-400'} select-none"><div class="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700/60 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-sm"><i data-lucide="file-text" class="w-5 h-5"></i></div></div>`;
  } else if (badgeInfo.iconType === 'sheet') {
    visualHTML = `<div class="flex items-center justify-center p-3 text-teal-400 select-none"><div class="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700/60 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-sm"><i data-lucide="file-spreadsheet" class="w-5 h-5"></i></div></div>`;
  } else if (badgeInfo.iconType === 'code') {
    visualHTML = `<div class="flex items-center justify-center p-3 text-cyan-400 select-none"><div class="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700/60 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-sm"><i data-lucide="file-code" class="w-5 h-5"></i></div></div>`;
  } else if (badgeInfo.iconType === 'archive') {
    visualHTML = `<div class="flex items-center justify-center p-3 text-yellow-400 select-none"><div class="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700/60 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-sm"><i data-lucide="file-archive" class="w-5 h-5"></i></div></div>`;
  } else {
    visualHTML = `<div class="flex items-center justify-center p-3 text-slate-400 select-none"><div class="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700/60 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-sm"><i data-lucide="file" class="w-5 h-5"></i></div></div>`;
  }

  const borderClass = isSelected 
    ? 'border-[var(--c-accent)] ring-2 ring-[var(--c-accent)]/60 bg-[var(--c-surface-hover)] shadow-[0_0_18px_var(--c-accent-glow)]' 
    : isPlaying 
      ? 'border-[var(--c-secondary)] shadow-[0_0_16px_rgba(var(--c-secondary-rgb),0.35)] ring-1 ring-[var(--c-secondary)] bg-[var(--c-surface-hover)]' 
      : 'border-[var(--c-border)] hover:border-[var(--c-border-hover)] hover:shadow-[0_0_15px_var(--c-accent-glow)] hover:-translate-y-0.5';

  return `
    <div class="file-card group relative bg-[var(--c-surface-card)] border rounded-xl p-2 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none touch-manipulation animate-file-card ${borderClass}" data-name="${file.name}" style="animation-delay: ${delay}s">
      <div class="file-card-thumb relative aspect-[4/3] bg-black/60 rounded-lg overflow-hidden flex items-center justify-center border border-[var(--c-border)] mb-1.5">
        ${visualHTML}
        
        <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider border backdrop-blur-sm z-10 ${badgeInfo.badgeBg} ${badgeInfo.badgeText} ${badgeInfo.borderColor}">${badgeInfo.tag}</span>
        
        ${isSelectionMode ? `
          <div class="select-checkbox absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center transition-all z-30 cursor-pointer shadow-md ${isSelected ? 'bg-[var(--c-accent)] text-slate-950 ring-2 ring-[var(--c-accent)]/80' : 'bg-black/70 border border-[var(--c-border)] text-transparent hover:border-[var(--c-accent)]'}" title="Pilih file">
            <i data-lucide="check" class="w-3 h-3 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}"></i>
          </div>
        ` : ''}

        ${!isSelectionMode && isAudio ? `
          <button type="button" class="play-btn absolute bottom-1.5 right-1.5 p-1 rounded-md bg-[var(--c-accent)] text-slate-950 shadow-md transition-transform active:scale-90 z-20" title="${isPlaying ? 'Pause' : 'Play'}">
            <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-3.5 h-3.5 fill-slate-950 ${!isPlaying ? 'ml-0.5' : ''}"></i>
          </button>
        ` : ''}

        ${!isSelectionMode ? `
          <div class="hover-actions-overlay absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 backdrop-blur-[2px] z-20">
            ${isAudio ? `
              <button type="button" class="play-btn p-1.5 bg-[var(--c-accent)] text-slate-950 rounded-lg shadow transition-transform active:scale-95" title="${isPlaying ? 'Pause' : 'Play'}">
                <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-3.5 h-3.5 fill-slate-950 ${!isPlaying ? 'ml-0.5' : ''}"></i>
              </button>
            ` : ''}
            ${isVideo ? `
              <button type="button" class="preview-video-btn p-1.5 bg-[var(--c-secondary)] text-slate-950 rounded-lg shadow transition-transform active:scale-95" title="Putar Video">
                <i data-lucide="play" class="w-3.5 h-3.5 fill-slate-950 ml-0.5"></i>
              </button>
            ` : ''}
            <button type="button" class="rename-btn p-1.5 bg-[var(--c-surface)] hover:bg-[var(--c-accent)]/20 text-[var(--c-text-muted)] hover:text-[var(--c-accent)] rounded-lg border border-[var(--c-border)] hover:border-[var(--c-accent)]/50 transition-colors shadow-sm" title="Ubah Nama"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i></button>
            <a href="/api/files/download?name=${encodeURIComponent(file.name)}" download="${displayName}" class="download-btn p-1.5 bg-[var(--c-surface)] hover:bg-emerald-500/20 text-[var(--c-text-muted)] hover:text-emerald-400 rounded-lg border border-[var(--c-border)] hover:border-emerald-500/50 transition-colors shadow-sm" title="Download File"><i data-lucide="download" class="w-3.5 h-3.5"></i></a>
            <a href="${file.publicUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text-muted)] hover:text-white rounded-lg border border-[var(--c-border)] transition-colors shadow-sm" title="Buka di Tab Baru"><i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>
            <button type="button" class="delete-btn p-1.5 bg-[var(--c-surface)] hover:bg-rose-500/20 text-[var(--c-text-muted)] hover:text-rose-400 rounded-lg border border-[var(--c-border)] hover:border-rose-500/50 transition-colors shadow-sm" title="Hapus File"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        ` : ''}
      </div>
      <div class="px-0.5">
        <div class="flex items-center justify-between gap-1">
          <p class="text-[11px] font-semibold text-[var(--c-text-main)] truncate leading-snug flex-1 group-hover:text-[var(--c-accent)] transition-colors" title="${displayName}">${displayName}</p>
          ${!isSelectionMode ? `
            <div class="flex items-center gap-0.5 shrink-0">
              <button type="button" class="rename-btn p-1 text-[var(--c-text-muted)] hover:text-[var(--c-accent)] hover:bg-[var(--c-surface-hover)] rounded transition-colors" title="Ubah Nama"><i data-lucide="edit-2" class="w-3 h-3"></i></button>
              <a href="/api/files/download?name=${encodeURIComponent(file.name)}" download="${displayName}" class="download-btn p-1 text-[var(--c-text-muted)] hover:text-emerald-400 hover:bg-[var(--c-surface-hover)] rounded transition-colors" title="Download File"><i data-lucide="download" class="w-3 h-3"></i></a>
              <button type="button" class="delete-btn p-1 text-[var(--c-text-muted)] hover:text-rose-400 hover:bg-[var(--c-surface-hover)] rounded transition-colors" title="Hapus File"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
            </div>
          ` : ''}
        </div>
        <div class="flex items-center justify-between text-[9px] text-[var(--c-text-muted)] mt-1 font-mono">
          <span>${fileDate}</span>
          ${fileSize ? `<span class="text-[var(--c-text-muted)] font-bold">${fileSize}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}
