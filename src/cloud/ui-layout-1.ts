import { formatFileSize } from './utils/fileHelpers';

const MAX_STORAGE_BYTES = 1 * 1024 * 1024 * 1024;

export function renderStorageIndicator(totalBytes: number, totalFiles: number, compact = false) {
  const percentage = Math.min((totalBytes / MAX_STORAGE_BYTES) * 100, 100);
  const formattedUsed = formatFileSize(totalBytes);
  const formattedPercentage = percentage < 0.1 && totalBytes > 0 ? '<0.1%' : `${percentage.toFixed(1)}%`;

  if (compact) {
    return `
      <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--c-surface-card)] border border-[var(--c-border)] text-[11px] shadow-sm font-mono" title="Storage: ${formattedUsed} / 1 GB (${formattedPercentage})">
        <i data-lucide="hard-drive" class="w-3.5 h-3.5 text-[var(--c-accent)] shrink-0"></i>
        <div class="flex items-center gap-1">
          <span class="text-[var(--c-text-main)] font-bold text-[10px]">${formattedUsed}</span>
          <span class="text-[var(--c-text-muted)] text-[9px]">/ 1GB</span>
        </div>
        <div class="w-12 bg-black/50 h-1.5 rounded-full overflow-hidden shrink-0 border border-[var(--c-border)]">
          <div class="bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-secondary)] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_var(--c-accent-glow)]" style="width: ${Math.max(percentage, totalBytes > 0 ? 4 : 0)}%"></div>
        </div>
      </div>
    `;
  }

  return `
    <div class="p-2.5 bg-[var(--c-surface-card)] border border-[var(--c-border)] rounded-xl space-y-2 shadow-sm font-mono">
      <div class="flex items-center justify-between text-[11px]">
        <span class="text-[var(--c-text-main)] font-medium flex items-center gap-1.5">
          <i data-lucide="hard-drive" class="w-3.5 h-3.5 text-[var(--c-accent)]"></i>
          <span>Kapasitas Penyimpanan</span>
        </span>
        <span class="text-[var(--c-accent)] font-bold text-[10px]">${formattedPercentage}</span>
      </div>
      <div class="w-full bg-black/60 h-2 rounded-full overflow-hidden p-0.5 border border-[var(--c-border)]">
        <div class="bg-gradient-to-r from-[var(--c-accent)] via-[var(--c-secondary)] to-[var(--c-accent)] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_var(--c-accent-glow)]" style="width: ${Math.max(percentage, totalBytes > 0 ? 3 : 0)}%"></div>
      </div>
      <div class="flex items-center justify-between text-[9px] text-[var(--c-text-muted)] pt-0.5">
        <span>${formattedUsed} / 1 GB</span>
        <span class="text-[var(--c-text-main)] font-semibold">${totalFiles} file</span>
      </div>
    </div>
  `;
}

export function renderCategoryDropdown(selectedCategory: string, categoryCounts: Record<string, number>, isOpen = false) {
  const options = [
    { id: 'all', label: 'Semua File', icon: 'folder', color: 'text-[var(--c-accent)]' },
    { id: 'image', label: 'Foto / Gambar', icon: 'image', color: 'text-emerald-400' },
    { id: 'audio', label: 'Audio / Musik', icon: 'music', color: 'text-amber-400' },
    { id: 'video', label: 'Video', icon: 'video', color: 'text-purple-400' },
    { id: 'document', label: 'Dokumen / PDF', icon: 'file-text', color: 'text-rose-400' },
  ];
  
  const currentOption = options.find(o => o.id === selectedCategory) || options[0];
  const countStr = categoryCounts[selectedCategory] !== undefined ? `<span class="ml-1 text-[10px] opacity-80 font-mono">(${categoryCounts[selectedCategory]})</span>` : '';

  return `
    <div class="relative inline-block font-mono" id="category-dropdown-container">
      <button 
        id="category-menu-button" 
        type="button" 
        title="Filter kategori" 
        class="cyber-btn-chamfer px-2.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none ${
          isOpen
            ? 'cyber-btn-solid-accent ring-2 ring-white/40'
            : selectedCategory !== 'all' 
              ? 'bg-[var(--c-accent)]/20 text-[var(--c-accent)] border-2 border-[var(--c-accent)] shadow-[0_0_12px_var(--c-accent-glow)]' 
              : 'cyber-btn-solid-surface hover:border-[var(--c-accent)]'
        }"
      >
        <i data-lucide="filter" class="category-btn-icon w-3.5 h-3.5 ${isOpen ? 'text-slate-950' : 'text-[var(--c-accent)]'}"></i>
        <span class="category-btn-label text-[11px] ${isOpen ? 'text-slate-950 font-black' : 'text-[var(--c-text-main)]'}">${currentOption.label.split(' ')[0]}${countStr}</span>
        <i data-lucide="chevron-down" class="category-btn-chevron w-3 h-3 transition-transform ${isOpen ? 'rotate-180 text-slate-950' : 'text-[var(--c-text-muted)]'}"></i>
      </button>

      <div 
        id="category-dropdown-menu" 
        class="absolute right-0 top-full mt-2 w-56 sm:w-60 max-w-[calc(100vw-24px)] rounded-xl bg-[var(--c-surface)] border-2 border-[var(--c-accent)] shadow-[0_16px_40px_rgba(0,0,0,0.95),0_0_25px_var(--c-accent-glow)] backdrop-blur-xl p-2 z-50 transition-all ${
          isOpen ? 'block' : 'hidden'
        }"
      >
        <div class="px-2.5 py-1.5 text-[9px] uppercase font-bold tracking-widest text-[var(--c-text-muted)] border-b border-[var(--c-border)] mb-1.5 flex items-center justify-between">
          <span>KATEGORI</span>
          <span class="text-[10px] text-[var(--c-accent)] font-bold">${categoryCounts.all} berkas</span>
        </div>
        <div class="space-y-1">
          ${options.map(option => {
            const isSelected = option.id === selectedCategory;
            const count = categoryCounts[option.id] ?? 0;
            return `
              <button 
                type="button" 
                data-category="${option.id}" 
                class="category-option-btn w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected 
                    ? 'cyber-btn-solid-accent shadow-[0_0_10px_var(--c-accent-glow)]' 
                    : 'text-[var(--c-text-main)] hover:bg-[var(--c-surface-hover)] hover:border border border-transparent hover:border-[var(--c-border)]'
                }"
              >
                <span class="flex items-center gap-2 truncate">
                  <i data-lucide="${option.icon}" class="w-4 h-4 ${isSelected ? 'text-slate-950' : option.color}"></i>
                  <span class="${isSelected ? 'text-slate-950 font-bold' : ''}">${option.label}</span>
                </span>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[10px] font-mono ${isSelected ? 'text-slate-950 font-bold' : 'text-[var(--c-text-muted)]'}">(${count})</span>
                  ${isSelected ? `<i data-lucide="check" class="w-3.5 h-3.5 text-slate-950 stroke-[3]"></i>` : ''}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderSortDropdown(currentSort: string, isOpen = false) {
  const options = [
    { id: 'date_desc', label: 'Terbaru lebih dulu' },
    { id: 'date_asc', label: 'Terlama lebih dulu' },
    { id: 'name_asc', label: 'Nama (A-Z)' },
    { id: 'name_desc', label: 'Nama (Z-A)' },
    { id: 'size_desc', label: 'Ukuran terbesar' },
    { id: 'size_asc', label: 'Ukuran terkecil' },
  ];
  
  return `
    <div class="relative inline-block font-mono" id="sort-dropdown-container">
      <button 
        id="sort-menu-button" 
        type="button" 
        title="Urutkan berkas" 
        class="cyber-btn-chamfer px-2.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none ${
          isOpen
            ? 'cyber-btn-solid-accent ring-2 ring-white/40'
            : 'cyber-btn-solid-surface hover:border-[var(--c-accent)]'
        }"
      >
        <i data-lucide="arrow-up-down" class="sort-btn-icon w-3.5 h-3.5 ${isOpen ? 'text-slate-950' : 'text-[var(--c-accent)]'}"></i>
        <span class="sort-btn-label hidden sm:inline text-[11px] ${isOpen ? 'text-slate-950 font-black' : 'text-[var(--c-text-main)]'}">SORT</span>
        <i data-lucide="chevron-down" class="sort-btn-chevron w-3 h-3 transition-transform ${isOpen ? 'rotate-180 text-slate-950' : 'text-[var(--c-text-muted)]'}"></i>
      </button>

      <div 
        id="sort-dropdown-menu" 
        class="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[var(--c-surface)] border-2 border-[var(--c-accent)] shadow-[0_16px_40px_rgba(0,0,0,0.95),0_0_25px_var(--c-accent-glow)] backdrop-blur-xl p-2 z-50 transition-all ${
          isOpen ? 'block' : 'hidden'
        }"
      >
        <div class="px-2.5 py-1.5 text-[9px] uppercase font-bold tracking-widest text-[var(--c-text-muted)] border-b border-[var(--c-border)] mb-1.5">
          URUTAN BERKAS
        </div>
        <div class="space-y-1">
          ${options.map(option => {
            const isSelected = currentSort === option.id;
            return `
              <button 
                type="button" 
                data-sort="${option.id}" 
                class="sort-option-btn w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected 
                    ? 'cyber-btn-solid-accent shadow-[0_0_10px_var(--c-accent-glow)]' 
                    : 'text-[var(--c-text-main)] hover:bg-[var(--c-surface-hover)] hover:border border border-transparent hover:border-[var(--c-border)]'
                }"
              >
                <div>
                  <div class="${isSelected ? 'text-slate-950 font-bold' : ''}">${option.label}</div>
                </div>
                ${isSelected ? `<i data-lucide="check" class="w-3.5 h-3.5 text-slate-950 stroke-[3] shrink-0"></i>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
