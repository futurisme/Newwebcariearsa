import { renderStorageIndicator, renderCategoryDropdown, renderSortDropdown } from './ui-layout-1.js';

export function renderHeaderControls(state, totalBytes, totalFiles, categoryCounts) {
  const selectedCount = state.selectedFileNames?.size || 0;

  return `
    <div class="hidden lg:block">
      ${renderStorageIndicator(totalBytes, totalFiles, true)}
    </div>

    <!-- Mobile Search Toggle Button -->
    <button 
      id="mobile-search-toggle" 
      type="button" 
      class="md:hidden cyber-btn-chamfer px-2 py-1.5 text-xs font-mono transition-all flex items-center gap-1 ${
        state.isMobileSearchOpen 
          ? 'cyber-btn-solid-accent ring-2 ring-white/40' 
          : 'cyber-btn-solid-surface hover:border-[var(--c-accent)]'
      }" 
      title="Cari berkas"
    >
      <i data-lucide="search" class="w-3.5 h-3.5 ${state.isMobileSearchOpen ? 'text-slate-950' : 'text-[var(--c-accent)]'}"></i>
    </button>

    <!-- Category Dropdown with explicit isOpen state -->
    ${renderCategoryDropdown(state.selectedCategory, categoryCounts, state.isCategoryMenuOpen)}

    <!-- Sort Dropdown with explicit isOpen state -->
    ${renderSortDropdown(state.currentSort, state.isSortMenuOpen)}
    
    <!-- Multi-Select Mode Toggle Button -->
    <button 
      id="toggle-selection-btn" 
      type="button"
      class="cyber-btn-chamfer px-2.5 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 ${
        state.isSelectionMode 
          ? 'cyber-btn-solid-accent ring-2 ring-white/40 shadow-[0_0_15px_var(--c-accent-glow)]' 
          : 'cyber-btn-solid-surface hover:border-[var(--c-accent)]'
      }" 
      title="${state.isSelectionMode ? 'Keluar mode pilih' : 'Pilih banyak berkas'}"
    >
      <i data-lucide="${state.isSelectionMode ? 'check-check' : 'check-square'}" class="w-3.5 h-3.5 ${state.isSelectionMode ? 'text-slate-950 stroke-[2.5]' : 'text-[var(--c-accent)]'}"></i>
      <span class="text-[11px] font-bold ${state.isSelectionMode ? 'text-slate-950' : 'text-[var(--c-text-main)]'}">
        ${state.isSelectionMode ? (selectedCount > 0 ? `(${selectedCount})` : 'PILIH') : '<span class="hidden sm:inline">PILIH</span>'}
      </span>
    </button>
    
    <!-- Refresh Button -->
    <button 
      id="refresh-files-btn" 
      type="button"
      class="cyber-btn-chamfer p-1.5 cyber-btn-solid-surface hover:border-[var(--c-accent)] transition-all font-mono shadow-sm" 
      title="Segarkan berkas"
    >
      <i data-lucide="refresh-cw" class="w-3.5 h-3.5 ${state.loading && !state.uploadProgress ? 'animate-spin text-[var(--c-accent)]' : 'text-[var(--c-text-muted)] hover:text-white'}"></i>
    </button>

    <!-- Settings Button -->
    <button 
      id="open-settings-btn" 
      type="button" 
      class="cyber-btn-chamfer px-2 py-1.5 cyber-btn-solid-surface hover:border-[var(--c-accent)] transition-all shadow-sm flex items-center gap-1.5 font-mono text-xs" 
      title="Pengaturan Tema & Tampilan"
    >
      <i data-lucide="settings-2" class="w-3.5 h-3.5 text-[var(--c-accent)]"></i>
      <span class="hidden xl:inline text-[10px] text-[var(--c-accent)] font-bold">TEMA</span>
    </button>
    
    <!-- Upload Button -->
    <label 
      for="hidden-file-input" 
      class="cursor-pointer cyber-btn-chamfer cyber-btn-solid-accent active:scale-95 px-3 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 font-mono shrink-0 ${
        state.uploadProgress ? 'opacity-60 pointer-events-none' : ''
      }"
      title="Unggah berkas baru"
    >
      ${state.uploadProgress 
        ? `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-slate-950"></i>` 
        : `<i data-lucide="upload" class="w-3.5 h-3.5 text-slate-950 stroke-[3]"></i>`
      }
      <span class="text-slate-950">${state.uploadProgress ? `${state.uploadProgress.current}/${state.uploadProgress.total}` : 'UPLOAD'}</span>
    </label>
  `;
}

export function renderSidebar(state, categoryCounts, totalBytes, totalFiles) {
  const cats = [
    { id: 'all', icon: 'folder', label: 'Semua File', count: categoryCounts.all, color: 'text-[var(--c-accent)]' },
    { id: 'image', icon: 'image', label: 'Foto / Gambar', count: categoryCounts.image, color: 'text-emerald-400' },
    { id: 'audio', icon: 'music', label: 'Audio / Musik', count: categoryCounts.audio, color: 'text-amber-400' },
    { id: 'video', icon: 'video', label: 'Video', count: categoryCounts.video, color: 'text-purple-400' },
    { id: 'document', icon: 'file-text', label: 'Dokumen / PDF', count: categoryCounts.document, color: 'text-rose-400' }
  ];

  return `
    <div>
      <div class="flex items-center justify-between px-2 mb-2.5 pb-1 border-b border-[var(--c-border)]">
        <p class="text-[10px] uppercase tracking-widest text-[var(--c-text-muted)] font-mono font-bold">KATEGORI</p>
        <span class="text-[9px] font-mono text-[var(--c-accent)] font-bold">[VAULT]</span>
      </div>
      <nav class="space-y-1">
        ${cats.map(c => {
          const isActive = state.selectedCategory === c.id;
          return `
            <button 
              type="button" 
              data-category="${c.id}" 
              class="sidebar-category-btn w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all font-mono ${
                isActive 
                  ? 'cyber-btn-solid-accent shadow-[0_0_12px_var(--c-accent-glow)] font-black' 
                  : 'text-[var(--c-text-main)] hover:bg-[var(--c-surface-hover)] border border-transparent hover:border-[var(--c-border)]'
              }"
            >
              <span class="flex items-center gap-2 truncate">
                <i data-lucide="${c.icon}" class="w-4 h-4 ${isActive ? 'text-slate-950' : c.color}"></i>
                <span class="truncate ${isActive ? 'text-slate-950 font-bold' : ''}">${c.label}</span>
              </span>
              <span class="text-[10px] font-mono ${isActive ? 'text-slate-950 font-black' : 'text-[var(--c-text-muted)]'} ml-1">
                ${c.count}
              </span>
            </button>
          `;
        }).join('')}
      </nav>
    </div>
    <div class="mt-auto pt-3 border-t-2 border-[var(--c-border)]">
      ${renderStorageIndicator(totalBytes, totalFiles)}
      <button 
        id="sidebar-settings-btn" 
        type="button" 
        class="mt-2.5 w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono cyber-btn-solid-surface hover:border-[var(--c-accent)] transition-all shadow-sm"
      >
        <span class="flex items-center gap-2">
          <i data-lucide="palette" class="w-4 h-4 text-[var(--c-accent)]"></i>
          <span class="font-bold">Tema & Tampilan</span>
        </span>
        <span class="text-[10px] text-[var(--c-accent)] font-bold font-mono">HUD</span>
      </button>
    </div>
  `;
}
