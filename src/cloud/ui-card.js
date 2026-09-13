import { cleanDisplayName, formatFileSize, formatTimestamp, getFileTypeBadge, isAudioFile, isImageFile, isVideoFile } from './utils/fileHelpers.js';

export function renderFileCard(file, index, state) {
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
    <div 
      class="file-card group relative bg-[var(--c-surface-card)] rounded-xl border-2 ${borderClass} transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between font-mono animate-in fade-in zoom-in-95 select-none"
      style="animation-delay: ${delay}s"
      data-name="${file.name}"
      data-category="${badgeInfo.iconType}"
    >
      <!-- Corner chamfer accent tab on top right -->
      <div class="absolute -top-6 -right-6 w-12 h-12 bg-[var(--c-accent)]/10 group-hover:bg-[var(--c-accent)]/20 rotate-45 transition-colors pointer-events-none"></div>

      <!-- Header: Type Badge & Selection Checkbox -->
      <div class="p-2 pb-1 flex items-center justify-between z-10">
        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${badgeInfo.borderColor} ${badgeInfo.badgeBg} ${badgeInfo.badgeText}">
          ${badgeInfo.tag}
        </span>
        
        <div class="flex items-center gap-1">
          <!-- Selection Checkbox -->
          <div 
            class="select-checkbox w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-[var(--c-accent)] border-[var(--c-accent)] text-slate-950 shadow-sm' 
                : isSelectionMode 
                  ? 'border-[var(--c-border-hover)] bg-black/40 hover:border-[var(--c-accent)]' 
                  : 'opacity-0 group-hover:opacity-100 border-[var(--c-border)] hover:border-[var(--c-accent)]'
            }"
            title="${isSelected ? 'Batal pilih' : 'Pilih file'}"
            data-select="${file.name}"
          >
            ${isSelected ? '<i data-lucide="check" class="w-3.5 h-3.5 stroke-[3]"></i>' : ''}
          </div>
        </div>
      </div>

      <!-- Card Thumbnail / Visual Preview Area -->
      <div class="flex-1 min-h-[90px] max-h-[120px] flex items-center justify-center relative overflow-hidden bg-[var(--c-bg)]/40 border-y border-[var(--c-border)]/40">
        ${visualHTML}
      </div>

      <!-- Card Footer: Name, Metadata & Actions -->
      <div class="p-2 pt-1.5 bg-[var(--c-surface-card)]">
        <p class="text-xs font-bold text-[var(--c-text-main)] truncate group-hover:text-[var(--c-accent)] transition-colors" title="${displayName}">
          ${displayName}
        </p>
        
        <div class="flex items-center justify-between text-[9px] text-[var(--c-text-muted)] mt-1">
          <span class="font-medium">${fileSize}</span>
          <span class="truncate ml-1 opacity-70">${fileDate}</span>
        </div>

        <!-- Hover Quick Actions Bar -->
        <div class="mt-1.5 pt-1.5 border-t border-[var(--c-border)]/50 flex items-center justify-between text-xs text-[var(--c-text-muted)]">
          <div class="flex items-center gap-1">
            <button 
              type="button" 
              class="card-action-btn hover:text-[var(--c-accent)] p-1 rounded hover:bg-[var(--c-surface-hover)] transition-colors" 
              data-action="preview" 
              data-name="${file.name}" 
              title="Pratinjau / Putar"
            >
              <i data-lucide="${isAudio ? (isPlaying ? 'pause' : 'play') : 'eye'}" class="w-3.5 h-3.5"></i>
            </button>
            <button 
              type="button" 
              class="card-action-btn hover:text-emerald-400 p-1 rounded hover:bg-[var(--c-surface-hover)] transition-colors" 
              data-action="download" 
              data-name="${file.name}" 
              title="Unduh"
            >
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <div class="flex items-center gap-1">
            <button 
              type="button" 
              class="card-action-btn hover:text-cyan-400 p-1 rounded hover:bg-[var(--c-surface-hover)] transition-colors" 
              data-action="rename" 
              data-name="${file.name}" 
              title="Ganti nama"
            >
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button 
              type="button" 
              class="card-action-btn hover:text-rose-400 p-1 rounded hover:bg-[var(--c-surface-hover)] transition-colors" 
              data-action="delete" 
              data-name="${file.name}" 
              title="Hapus"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
