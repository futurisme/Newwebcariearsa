import { createIcons, icons } from 'lucide';
import { createClient } from '@supabase/supabase-js';
import { FileData, FileCategory, SortField, AudioPlaybackState } from '../types';
import { 
  cleanDisplayName, 
  getFileCategory, 
  getFileExtension, 
  formatFileSize, 
  isVideoFile, 
  isAudioFile, 
  isImageFile, 
  getFileTypeBadge 
} from '../utils/fileHelpers';
import { THEME_VARIANTS } from '../ui-settings';

function applyTheme(themeId: string) {
  document.documentElement.dataset.theme = themeId;
  if (document.body) {
    document.body.dataset.theme = themeId;
  }
}

// Initialize direct Supabase client for resilient fallback
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://gnhkhnmvggltqszbhfev.supabase.co';
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_secret_E7C1i2kfhrHHBdbrCbIfZA_5I12RT6C';
const BUCKET_NAME = 'vault_files';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Storage Cache Keys
const CACHE_KEY = 'cariearsa_cloud_cache_v2';
const THEME_KEY = 'cariearsa_cloud_theme';
const SCANLINES_KEY = 'cariearsa_cloud_scanlines';
const VIEW_MODE_KEY = 'cariearsa_cloud_mobile_view';

// Read persistent preferences
const initialTheme = localStorage.getItem(THEME_KEY) || 'neo-tokyo';
const savedScanlines = localStorage.getItem(SCANLINES_KEY);
const initialScanlines = savedScanlines === null ? true : savedScanlines === 'true';
const initialViewMode = (localStorage.getItem(VIEW_MODE_KEY) as 'grid' | 'list') || 'grid';

// Instant Cache Retrieval (0ms load)
let cachedFiles: FileData[] = [];
try {
  const raw = localStorage.getItem(CACHE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedFiles = parsed;
    }
  }
} catch (_) {}

// Apply initial visual settings
document.documentElement.dataset.theme = initialTheme;
if (document.body) {
  document.body.dataset.theme = initialTheme;
  if (initialScanlines) {
    document.body.classList.add('cyber-scanlines');
  } else {
    document.body.classList.remove('cyber-scanlines');
  }
}

// Mobile Application State
const state = {
  files: cachedFiles,
  loading: cachedFiles.length === 0,
  uploadProgress: null as { current: number; total: number } | null,
  currentSort: 'date_desc' as SortField,
  selectedCategory: 'all' as FileCategory,
  searchQuery: '',
  selectedFileIds: new Set<string>(),
  isSelectionMode: false,
  viewMode: initialViewMode,
  currentTheme: initialTheme,
  scanlinesActive: initialScanlines,
  isSearchOpen: false,
  activeAudio: {
    file: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
  } as AudioPlaybackState,
  pendingDeleteIds: [] as string[],
  pendingRenameFile: null as FileData | null,
};

// Sort Options definition
const SORT_OPTIONS: { id: SortField; label: string; desc: string }[] = [
  { id: 'date_desc', label: 'Terbaru', desc: 'Tanggal unggah paling baru' },
  { id: 'date_asc', label: 'Terlama', desc: 'Tanggal unggah paling awal' },
  { id: 'name_asc', label: 'Nama (A-Z)', desc: 'Alfabet menaik' },
  { id: 'name_desc', label: 'Nama (Z-A)', desc: 'Alfabet menurun' },
  { id: 'size_desc', label: 'Ukuran Terbesar', desc: 'Kapasitas byte tertinggi' },
  { id: 'size_asc', label: 'Ukuran Terkecil', desc: 'Kapasitas byte terendah' },
];

// Helper: Toast Notifications
let toastTimer: any = null;
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const toast = document.getElementById('mobile-toast');
  if (!toast) return;
  clearTimeout(toastTimer);

  const colors = {
    success: 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    error: 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    info: 'bg-[var(--c-surface)]/95 border-[var(--c-accent)] text-[var(--c-text-main)] shadow-[0_0_15px_var(--c-accent-glow)]',
  };

  const iconsMap = {
    success: '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>',
    error: '<i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>',
    info: '<i data-lucide="info" class="w-4 h-4 text-[var(--c-accent)]"></i>',
  };

  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono shadow-2xl backdrop-blur-md border animate-toast ${colors[type]}`;
  toast.innerHTML = `${iconsMap[type]}<span>${message}</span>`;
  toast.classList.remove('hidden');

  try {
    createIcons({ icons, root: toast });
  } catch (_) {}

  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

// Filtering & Sorting Logic
function getFilteredAndSortedFiles(): FileData[] {
  let result = [...state.files];

  // Category filter
  if (state.selectedCategory !== 'all') {
    result = result.filter(f => getFileCategory(f.name) === state.selectedCategory);
  }

  // Search filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    result = result.filter(f => f.name.toLowerCase().includes(q));
  }

  // Sorting
  result.sort((a, b) => {
    switch (state.currentSort) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'date_asc':
        return new Date(a.created_at || a.updated_at).getTime() - new Date(b.created_at || b.updated_at).getTime();
      case 'date_desc':
        return new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime();
      case 'size_asc':
        return (a.metadata?.size || 0) - (b.metadata?.size || 0);
      case 'size_desc':
        return (b.metadata?.size || 0) - (a.metadata?.size || 0);
      default:
        return 0;
    }
  });

  return result;
}

// Category Counts
function getCategoryCounts() {
  const counts = { all: state.files.length, image: 0, audio: 0, video: 0, document: 0, other: 0 };
  state.files.forEach(f => {
    const cat = getFileCategory(f.name);
    if (counts[cat] !== undefined) {
      counts[cat]++;
    } else {
      counts.other++;
    }
  });
  return counts;
}

// Format Date for Mobile
function formatMobileDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Render: Category Ribbon
function renderCategoryRibbon() {
  const container = document.getElementById('mobile-category-ribbon');
  if (!container) return;

  const counts = getCategoryCounts();
  const categories: { id: FileCategory; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'Semua', icon: 'folder', count: counts.all },
    { id: 'image', label: 'Foto', icon: 'image', count: counts.image },
    { id: 'audio', label: 'Audio', icon: 'music', count: counts.audio },
    { id: 'video', label: 'Video', icon: 'video', count: counts.video },
    { id: 'document', label: 'Dokumen', icon: 'file-text', count: counts.document },
  ];

  container.innerHTML = categories.map(cat => {
    const isActive = state.selectedCategory === cat.id;
    return `
      <button 
        type="button" 
        data-category="${cat.id}"
        class="category-pill-btn shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
          isActive 
            ? 'bg-[var(--c-accent)] text-slate-950 shadow-[0_0_12px_var(--c-accent-glow)] font-black' 
            : 'bg-[var(--c-surface)] text-[var(--c-text-muted)] border border-[var(--c-border)] hover:text-white'
        }"
      >
        <i data-lucide="${cat.icon}" class="w-3.5 h-3.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-[var(--c-accent)]'}"></i>
        <span>${cat.label}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-[var(--c-surface-card)] text-[var(--c-text-muted)]'}">${cat.count}</span>
      </button>
    `;
  }).join('');
}

// Render: Storage Capacity Indicator
function renderStorageWidget() {
  const container = document.getElementById('mobile-storage-widget');
  if (!container) return;

  const totalBytes = state.files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
  const maxBytes = 1000 * 1024 * 1024; // 1000 MB demo limit
  const percent = Math.min(100, Math.round((totalBytes / maxBytes) * 100));

  container.innerHTML = `
    <i data-lucide="hard-drive" class="w-3.5 h-3.5 text-[var(--c-accent)] shrink-0"></i>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between text-[9px] text-[var(--c-text-muted)] mb-0.5">
        <span class="truncate font-bold text-[var(--c-text-main)]">${state.files.length} Berkas</span>
        <span class="font-mono">${formatFileSize(totalBytes)} / 1 GB (${percent}%)</span>
      </div>
      <div class="w-full h-1.5 bg-[var(--c-surface-card)] rounded-full overflow-hidden border border-[var(--c-border)]/80">
        <div class="h-full bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-secondary)] transition-all duration-300" style="width: ${Math.max(2, percent)}%"></div>
      </div>
    </div>
  `;
}

// Render: Main File Grid or List
function renderFileContainer() {
  const container = document.getElementById('mobile-file-container');
  if (!container) return;

  const files = getFilteredAndSortedFiles();

  // Configure layout class
  if (state.viewMode === 'grid') {
    container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 content-start';
  } else {
    container.className = 'flex flex-col gap-2 content-start';
  }

  // Update view mode icon
  const viewIcon = document.getElementById('mobile-view-icon');
  if (viewIcon) {
    viewIcon.setAttribute('data-lucide', state.viewMode === 'grid' ? 'layout-grid' : 'list');
  }

  // Loading State
  if (state.loading && state.files.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-20 flex flex-col items-center justify-center text-[var(--c-text-muted)] font-mono">
        <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-[var(--c-accent)] mb-3"></i>
        <p class="text-xs font-bold tracking-wider uppercase text-[var(--c-text-main)]">MEMUAT VAULT BERKAS...</p>
      </div>
    `;
    return;
  }

  // Empty State
  if (files.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-center px-4 font-mono">
        <div class="w-14 h-14 rounded-2xl bg-[var(--c-surface-card)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-accent)] mb-3 shadow-[0_0_20px_var(--c-accent-glow)]">
          <i data-lucide="folder-open" class="w-7 h-7"></i>
        </div>
        <p class="text-sm font-bold text-white uppercase tracking-wider mb-1">Vault Masih Kosong</p>
        <p class="text-xs text-[var(--c-text-muted)] max-w-xs mb-4">Belum ada berkas dalam kategori ini. Tekan tombol UNGGAH di bawah untuk menambahkan berkas.</p>
        <label for="mobile-hidden-file-input" class="cyber-btn-chamfer cyber-btn-solid-accent px-4 py-2 text-xs font-black cursor-pointer active:scale-95 shadow-[0_0_15px_var(--c-accent-glow)] flex items-center gap-2">
          <i data-lucide="upload-cloud" class="w-4 h-4"></i>
          <span>UNGGAH SEKARANG</span>
        </label>
      </div>
    `;
    return;
  }

  // Grid Mode Rendering
  if (state.viewMode === 'grid') {
    container.innerHTML = files.map(file => {
      const isSelected = state.selectedFileIds.has(file.name);
      const isImg = isImageFile(file.name);
      const isVid = isVideoFile(file.name);
      const isAud = isAudioFile(file.name);
      const ext = getFileExtension(file.name);
      const badgeInfo = getFileTypeBadge(ext);
      const displayName = cleanDisplayName(file.name);
      const formattedSize = formatFileSize(file.metadata?.size);
      const dateStr = formatMobileDate(file.created_at || file.updated_at);
      const isCurrentAudio = state.activeAudio.file?.name === file.name && state.activeAudio.isPlaying;

      return `
        <div 
          class="file-card group relative bg-[var(--c-surface)] border ${isSelected ? 'border-[var(--c-accent)] ring-2 ring-[var(--c-accent)]/60 shadow-[0_0_15px_var(--c-accent-glow)]' : 'border-[var(--c-border)]'} rounded-xl p-2 flex flex-col justify-between transition-all duration-150 animate-file-card select-none"
          data-name="${file.name}"
          data-url="${file.publicUrl}"
        >
          <!-- Top Row: Badge & Select Checkbox -->
          <div class="flex items-center justify-between mb-1.5 relative z-10">
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${badgeInfo.badgeBg} ${badgeInfo.badgeText} border border-current/30">
              ${badgeInfo.tag}
            </span>

            <button 
              type="button" 
              class="mobile-card-select-btn p-1 -m-1 rounded-md text-[var(--c-text-muted)] hover:text-white ${state.isSelectionMode ? 'opacity-100' : 'opacity-70'}"
              data-select-name="${file.name}"
              title="Pilih berkas"
            >
              <div class="w-4 h-4 rounded border ${isSelected ? 'bg-[var(--c-accent)] border-[var(--c-accent)] text-slate-950 flex items-center justify-center' : 'border-[var(--c-border)] bg-[var(--c-bg)]'}">
                ${isSelected ? '<i data-lucide="check" class="w-3 h-3 stroke-[3]"></i>' : ''}
              </div>
            </button>
          </div>

          <!-- Thumbnail / Preview Area -->
          <div class="file-card-thumb relative aspect-square w-full rounded-lg bg-[var(--c-bg)] overflow-hidden border border-[var(--c-border)] flex items-center justify-center mb-2 cursor-pointer active:opacity-80">
            ${isImg 
              ? `<img src="${file.publicUrl}" alt="${displayName}" class="w-full h-full object-cover select-none" loading="lazy" />`
              : isVid
              ? `<div class="relative w-full h-full flex items-center justify-center bg-black/40">
                  <video src="${file.publicUrl}#t=0.5" class="w-full h-full object-cover select-none pointer-events-none" preload="metadata"></video>
                  <div class="absolute p-2 rounded-full bg-black/70 text-white border border-white/30"><i data-lucide="play" class="w-4 h-4 fill-current"></i></div>
                 </div>`
              : isAud
              ? `<div class="flex flex-col items-center justify-center text-[var(--c-accent)]">
                  <div class="p-3 rounded-xl bg-[var(--c-accent)]/15 border border-[var(--c-accent)]/30 ${isCurrentAudio ? 'animate-pulse ring-2 ring-[var(--c-accent)]' : ''}">
                    <i data-lucide="${isCurrentAudio ? 'disc-3' : 'music'}" class="w-6 h-6 ${isCurrentAudio ? 'animate-spin' : ''}"></i>
                  </div>
                 </div>`
              : `<div class="flex flex-col items-center justify-center text-[var(--c-text-muted)]">
                  <i data-lucide="file-text" class="w-7 h-7 text-[var(--c-accent)]"></i>
                 </div>`
            }
          </div>

          <!-- Details & Quick Action Row -->
          <div class="pt-0.5">
            <h4 class="text-xs font-bold text-white truncate mb-1 leading-tight" title="${displayName}">${displayName}</h4>
            <div class="flex items-center justify-between text-[10px] text-[var(--c-text-muted)] font-mono">
              <span>${formattedSize}</span>
              <span class="text-[9px] opacity-70">${dateStr}</span>
            </div>

            <!-- Touch Action Buttons -->
            <div class="flex items-center justify-between gap-1 pt-2 mt-1 border-t border-[var(--c-border)]/60">
              <button type="button" class="mobile-rename-btn p-1.5 rounded-lg bg-[var(--c-surface-card)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text-muted)] hover:text-white transition-colors" data-name="${file.name}" title="Ubah Nama">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
              <a href="${file.publicUrl}" download="${cleanDisplayName(file.name)}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-[var(--c-surface-card)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text-muted)] hover:text-white transition-colors" title="Unduh">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
              </a>
              <button type="button" class="mobile-delete-btn p-1.5 rounded-lg bg-[var(--c-surface-card)] hover:bg-rose-500/20 text-[var(--c-text-muted)] hover:text-rose-400 transition-colors" data-name="${file.name}" title="Hapus">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    // List Mode Rendering
    container.innerHTML = files.map(file => {
      const isSelected = state.selectedFileIds.has(file.name);
      const isImg = isImageFile(file.name);
      const isVid = isVideoFile(file.name);
      const isAud = isAudioFile(file.name);
      const ext = getFileExtension(file.name);
      const badgeInfo = getFileTypeBadge(ext);
      const displayName = cleanDisplayName(file.name);
      const formattedSize = formatFileSize(file.metadata?.size);
      const dateStr = formatMobileDate(file.created_at || file.updated_at);
      const isCurrentAudio = state.activeAudio.file?.name === file.name && state.activeAudio.isPlaying;

      return `
        <div 
          class="file-card flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--c-surface)] border ${isSelected ? 'border-[var(--c-accent)] ring-2 ring-[var(--c-accent)]/50' : 'border-[var(--c-border)]'} animate-file-card"
          data-name="${file.name}"
          data-url="${file.publicUrl}"
        >
          <!-- Left: Selection Checkbox & Thumbnail -->
          <div class="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer">
            <button 
              type="button" 
              class="mobile-card-select-btn shrink-0 p-1 rounded-md"
              data-select-name="${file.name}"
            >
              <div class="w-4 h-4 rounded border ${isSelected ? 'bg-[var(--c-accent)] border-[var(--c-accent)] text-slate-950 flex items-center justify-center' : 'border-[var(--c-border)] bg-[var(--c-bg)]'}">
                ${isSelected ? '<i data-lucide="check" class="w-3 h-3 stroke-[3]"></i>' : ''}
              </div>
            </button>

            <div class="w-11 h-11 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)] shrink-0 overflow-hidden flex items-center justify-center relative file-card-thumb">
              ${isImg 
                ? `<img src="${file.publicUrl}" alt="${displayName}" class="w-full h-full object-cover" loading="lazy" />`
                : isVid
                ? `<div class="w-full h-full bg-black/60 flex items-center justify-center text-white"><i data-lucide="video" class="w-5 h-5 text-purple-400"></i></div>`
                : isAud
                ? `<div class="w-full h-full bg-[var(--c-accent)]/15 flex items-center justify-center text-[var(--c-accent)]"><i data-lucide="${isCurrentAudio ? 'disc-3' : 'music'}" class="w-5 h-5 ${isCurrentAudio ? 'animate-spin' : ''}"></i></div>`
                : `<i data-lucide="file-text" class="w-5 h-5 text-[var(--c-accent)]"></i>`
              }
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <h4 class="text-xs font-bold text-white truncate" title="${displayName}">${displayName}</h4>
              <div class="flex items-center gap-2 text-[10px] text-[var(--c-text-muted)] font-mono mt-0.5">
                <span class="text-[8px] font-black px-1 rounded uppercase ${badgeInfo.badgeBg} ${badgeInfo.badgeText}">${badgeInfo.tag}</span>
                <span>${formattedSize}</span>
                <span>•</span>
                <span>${dateStr}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" class="mobile-rename-btn p-2 rounded-lg bg-[var(--c-surface-card)] text-[var(--c-text-muted)] hover:text-white" data-name="${file.name}" title="Ubah Nama">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <a href="${file.publicUrl}" download="${cleanDisplayName(file.name)}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-[var(--c-surface-card)] text-[var(--c-text-muted)] hover:text-white" title="Unduh">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
            </a>
            <button type="button" class="mobile-delete-btn p-2 rounded-lg bg-[var(--c-surface-card)] text-[var(--c-text-muted)] hover:text-rose-400" data-name="${file.name}" title="Hapus">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Render: Bulk Selection Action Bar
function renderBulkBar() {
  const bar = document.getElementById('mobile-bulk-bar');
  if (!bar) return;

  const count = state.selectedFileIds.size;
  if (count === 0 && !state.isSelectionMode) {
    bar.classList.add('hidden');
    return;
  }

  bar.classList.remove('hidden');
  bar.innerHTML = `
    <div class="flex items-center gap-2 font-mono">
      <span class="w-5 h-5 rounded-full bg-[var(--c-accent)] text-slate-950 font-black text-[10px] flex items-center justify-center font-mono">${count}</span>
      <span class="text-xs font-bold text-white">Terpilih</span>
    </div>

    <div class="flex items-center gap-1.5 font-mono">
      <button id="bulk-select-all" type="button" class="px-2 py-1.5 rounded-lg bg-[var(--c-surface-card)] border border-[var(--c-border)] text-[10px] font-bold text-[var(--c-text-main)] hover:text-white active:scale-95">
        Semua
      </button>
      <button id="bulk-download" type="button" class="px-2 py-1.5 rounded-lg bg-[var(--c-surface-card)] border border-[var(--c-border)] text-[10px] font-bold text-[var(--c-accent)] hover:text-white active:scale-95 ${count === 0 ? 'opacity-40 pointer-events-none' : ''}">
        Unduh (${count})
      </button>
      <button id="bulk-delete" type="button" class="px-2 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-[10px] font-bold text-white active:scale-95 shadow-[0_0_10px_rgba(244,63,94,0.5)] ${count === 0 ? 'opacity-40 pointer-events-none' : ''}">
        Hapus (${count})
      </button>
      <button id="bulk-cancel" type="button" class="p-1.5 text-[var(--c-text-muted)] hover:text-white" title="Batal">
        ✕
      </button>
    </div>
  `;
}

// Render: Mobile Audio Player Bar
function renderAudioBar() {
  const bar = document.getElementById('mobile-audio-bar');
  if (!bar) return;

  const audio = state.activeAudio;
  if (!audio.file) {
    bar.classList.add('hidden');
    return;
  }

  bar.classList.remove('hidden');
  const displayName = cleanDisplayName(audio.file.name);
  const percent = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

  function formatTime(s: number): string {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  bar.innerHTML = `
    <div class="flex items-center justify-between gap-2 mb-1.5">
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <div class="p-1.5 rounded-lg bg-[var(--c-accent)]/20 text-[var(--c-accent)]">
          <i data-lucide="music" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0 flex-1">
          <h5 class="text-xs font-bold text-white truncate">${displayName}</h5>
          <span class="text-[9px] text-[var(--c-text-muted)] font-mono">${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}</span>
        </div>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <button id="audio-play-pause-btn" type="button" class="p-2 rounded-lg bg-[var(--c-accent)] text-slate-950 font-black shadow-[0_0_10px_var(--c-accent-glow)] active:scale-90">
          <i data-lucide="${audio.isPlaying ? 'pause' : 'play'}" class="w-4 h-4 fill-current"></i>
        </button>
        <button id="audio-close-btn" type="button" class="p-1.5 text-[var(--c-text-muted)] hover:text-white">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <!-- Scrubber Bar -->
    <div class="relative w-full h-2 bg-[var(--c-surface-card)] rounded-full overflow-hidden border border-[var(--c-border)]">
      <div class="h-full bg-[var(--c-accent)]" style="width: ${percent}%"></div>
    </div>
  `;
}

// Master DOM Update Function
function updateDOM() {
  renderCategoryRibbon();
  renderStorageWidget();
  renderFileContainer();
  renderBulkBar();
  renderAudioBar();

  // Update Sort Label
  const sortOption = SORT_OPTIONS.find(o => o.id === state.currentSort);
  const sortLabel = document.getElementById('mobile-sort-label');
  if (sortLabel && sortOption) {
    sortLabel.textContent = sortOption.label;
  }

  // Update selection button state
  const selectBtn = document.getElementById('mobile-select-mode-btn');
  if (selectBtn) {
    if (state.isSelectionMode) {
      selectBtn.className = 'cyber-btn-chamfer px-2 py-1 cyber-btn-solid-accent text-[10px] font-black flex items-center gap-1 shadow-[0_0_10px_var(--c-accent-glow)]';
      selectBtn.innerHTML = '<i data-lucide="check-check" class="w-3 h-3 stroke-[2.5]"></i><span>Selesai</span>';
    } else {
      selectBtn.className = 'cyber-btn-chamfer px-2 py-1 cyber-btn-solid-surface text-[10px] font-bold flex items-center gap-1 text-[var(--c-text-main)]';
      selectBtn.innerHTML = '<i data-lucide="check-square" class="w-3 h-3 text-[var(--c-accent)]"></i><span>Pilih</span>';
    }
  }

  // Refresh Lucide Icons
  try {
    createIcons({ icons });
  } catch (_) {}
}

// Fetch Files from Backend with Fallback
async function fetchFiles(showLoader = true) {
  if (showLoader && state.files.length === 0) {
    state.loading = true;
    updateDOM();
  }

  try {
    const res = await fetch('/api/cloud/files');
    if (res.ok) {
      const data = await res.json();
      state.files = data.files || [];
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(state.files));
      } catch (_) {}
      state.loading = false;
      updateDOM();
      return;
    }
  } catch (_) {
    console.warn('API route failed, trying direct Supabase client...');
  }

  // Fallback to Supabase
  try {
    const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).list('', {
      limit: 100,
      sortBy: { column: 'updated_at', order: 'desc' },
    });
    if (!error && data) {
      state.files = data.map((f: any) => {
        const { data: urlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(f.name);
        return {
          name: f.name,
          id: f.id || f.name,
          updated_at: f.updated_at || new Date().toISOString(),
          created_at: f.created_at || f.updated_at || new Date().toISOString(),
          last_accessed_at: f.last_accessed_at || '',
          metadata: f.metadata || { size: 0 },
          publicUrl: urlData.publicUrl,
        };
      });
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(state.files));
      } catch (_) {}
    } else {
      showToast('Gagal memuat berkas', 'error');
    }
  } catch (err) {
    console.error('Supabase direct list failed:', err);
    showToast('Koneksi storage terputus', 'error');
  } finally {
    state.loading = false;
    updateDOM();
  }
}

// Upload Files
async function handleFilesUpload(fileList: FileList) {
  if (!fileList || fileList.length === 0) return;
  const filesToUpload = Array.from(fileList);
  const total = filesToUpload.length;
  let successCount = 0;

  showToast(`Mengunggah ${total} berkas...`, 'info');

  for (let i = 0; i < total; i++) {
    const file = filesToUpload[i];
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloud/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        successCount++;
      } else {
        // Fallback directly to Supabase storage
        const timestamp = Date.now();
        const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error } = await supabaseClient.storage.from(BUCKET_NAME).upload(safeName, file, {
          cacheControl: '3600',
          upsert: true,
        });
        if (!error) successCount++;
      }
    } catch (_) {
      // Direct Supabase fallback
      try {
        const timestamp = Date.now();
        const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error } = await supabaseClient.storage.from(BUCKET_NAME).upload(safeName, file);
        if (!error) successCount++;
      } catch (e) {
        console.error('Upload failed:', e);
      }
    }
  }

  if (successCount > 0) {
    showToast(`${successCount} berkas berhasil diunggah`, 'success');
    fetchFiles(false);
  } else {
    showToast('Gagal mengunggah berkas', 'error');
  }
}

// Media Preview Handler
function openMediaPreview(file: FileData) {
  const modal = document.getElementById('mobile-preview-modal');
  if (!modal) return;

  const isImg = isImageFile(file.name);
  const isVid = isVideoFile(file.name);
  const isAud = isAudioFile(file.name);
  const displayName = cleanDisplayName(file.name);

  // If audio, start playback in audio player bar
  if (isAud) {
    playAudio(file);
    return;
  }

  let contentHtml = '';
  if (isImg) {
    contentHtml = `
      <div class="relative max-w-full max-h-[85vh] flex flex-col items-center justify-center p-2">
        <img src="${file.publicUrl}" alt="${displayName}" class="max-w-full max-h-[75vh] object-contain rounded-lg border border-[var(--c-border)] shadow-2xl" />
        <div class="mt-3 flex items-center gap-3">
          <a href="${file.publicUrl}" download="${displayName}" target="_blank" class="cyber-btn-chamfer cyber-btn-solid-accent px-4 py-2 text-xs font-black flex items-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>UNDUH GAMBAR</span>
          </a>
        </div>
      </div>
    `;
  } else if (isVid) {
    contentHtml = `
      <div class="w-full max-w-lg flex flex-col items-center p-2">
        <video src="${file.publicUrl}" controls autoplay playsinline class="w-full max-h-[75vh] rounded-lg border border-[var(--c-border)] shadow-2xl bg-black"></video>
        <div class="mt-3 flex items-center gap-3">
          <a href="${file.publicUrl}" download="${displayName}" target="_blank" class="cyber-btn-chamfer cyber-btn-solid-accent px-4 py-2 text-xs font-black flex items-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>UNDUH VIDEO</span>
          </a>
        </div>
      </div>
    `;
  } else {
    contentHtml = `
      <div class="p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] max-w-sm text-center flex flex-col items-center shadow-2xl">
        <div class="w-14 h-14 rounded-xl bg-[var(--c-accent)]/20 text-[var(--c-accent)] flex items-center justify-center mb-3">
          <i data-lucide="file-text" class="w-8 h-8"></i>
        </div>
        <h3 class="text-sm font-bold text-white mb-1 truncate max-w-full">${displayName}</h3>
        <p class="text-xs text-[var(--c-text-muted)] mb-4">${formatFileSize(file.metadata?.size)}</p>
        <a href="${file.publicUrl}" download="${displayName}" target="_blank" class="w-full cyber-btn-chamfer cyber-btn-solid-accent py-2.5 text-xs font-black flex items-center justify-center gap-2">
          <i data-lucide="download" class="w-4 h-4"></i>
          <span>UNDUH DOKUMEN</span>
        </a>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="relative w-full max-w-lg flex flex-col items-center animate-bottom-sheet">
      <div class="w-full flex items-center justify-between p-2 mb-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10">
        <h4 class="text-xs font-bold text-white truncate max-w-[70%]">${displayName}</h4>
        <button id="close-preview-btn" type="button" class="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
      ${contentHtml}
    </div>
  `;

  modal.classList.remove('hidden');
  try {
    createIcons({ icons, root: modal });
  } catch (_) {}

  const closeBtn = document.getElementById('close-preview-btn');
  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.add('hidden');
  }
}

// Audio Player Functions
function playAudio(file: FileData) {
  const globalAudio = document.getElementById('mobile-audio') as HTMLAudioElement;
  if (!globalAudio) return;

  if (state.activeAudio.file?.name === file.name) {
    if (globalAudio.paused) {
      globalAudio.play();
      state.activeAudio.isPlaying = true;
    } else {
      globalAudio.pause();
      state.activeAudio.isPlaying = false;
    }
  } else {
    state.activeAudio.file = file;
    state.activeAudio.isPlaying = true;
    state.activeAudio.currentTime = 0;
    state.activeAudio.duration = 0;
    globalAudio.src = file.publicUrl;
    globalAudio.play().catch(e => console.warn('Audio play error:', e));
  }
  updateDOM();
}

// Open Sort Bottom Sheet
function openSortSheet() {
  const sheet = document.getElementById('mobile-sort-sheet');
  const list = document.getElementById('sort-options-list');
  if (!sheet || !list) return;

  list.innerHTML = SORT_OPTIONS.map(opt => {
    const isActive = state.currentSort === opt.id;
    return `
      <button 
        type="button" 
        data-sort-id="${opt.id}" 
        class="sort-option-btn w-full p-3 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.98] ${
          isActive 
            ? 'bg-[var(--c-accent)] text-slate-950 font-black shadow-[0_0_12px_var(--c-accent-glow)]' 
            : 'bg-[var(--c-surface-card)] text-[var(--c-text-main)] border border-[var(--c-border)]'
        }"
      >
        <div>
          <p class="text-xs font-bold uppercase">${opt.label}</p>
          <p class="text-[10px] ${isActive ? 'text-slate-900' : 'text-[var(--c-text-muted)]'}">${opt.desc}</p>
        </div>
        ${isActive ? '<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>' : ''}
      </button>
    `;
  }).join('');

  sheet.classList.remove('hidden');
  try {
    createIcons({ icons, root: sheet });
  } catch (_) {}
}

// Open Settings Bottom Sheet
function openSettingsSheet() {
  const sheet = document.getElementById('mobile-settings-modal');
  const themeList = document.getElementById('mobile-theme-list');
  if (!sheet || !themeList) return;

  themeList.innerHTML = THEME_VARIANTS.map(t => {
    const isSelected = state.currentTheme === t.id;
    return `
      <button 
        type="button" 
        data-theme-id="${t.id}"
        class="theme-pick-btn p-2.5 rounded-xl border ${isSelected ? 'border-[var(--c-accent)] ring-2 ring-[var(--c-accent)] shadow-[0_0_15px_var(--c-accent-glow)]' : 'border-[var(--c-border)]'} bg-[var(--c-surface-card)] text-left flex flex-col justify-between transition-all active:scale-95"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-white">${t.name}</span>
          ${isSelected ? '<span class="text-[8px] font-mono px-1 rounded bg-[var(--c-accent)] text-slate-950 font-black">AKTIF</span>' : ''}
        </div>
        <div class="flex items-center gap-1.5 mt-1">
          <span class="w-3.5 h-3.5 rounded-full border border-black/40" style="background-color: ${t.primaryColor};"></span>
          <span class="w-3.5 h-3.5 rounded-full border border-black/40" style="background-color: ${t.secondaryColor};"></span>
          <span class="text-[9px] text-[var(--c-text-muted)] font-mono ml-auto">${t.tag}</span>
        </div>
      </button>
    `;
  }).join('');

  // Update scanlines toggle
  const scanBtn = document.getElementById('toggle-scanlines-btn');
  const scanKnob = document.getElementById('scanlines-knob');
  if (scanBtn && scanKnob) {
    if (state.scanlinesActive) {
      scanBtn.className = 'w-11 h-6 rounded-full bg-[var(--c-accent)] p-0.5 transition-colors relative';
      scanKnob.className = 'w-5 h-5 rounded-full bg-slate-950 shadow-md transition-transform translate-x-5';
    } else {
      scanBtn.className = 'w-11 h-6 rounded-full bg-[var(--c-border)] p-0.5 transition-colors relative';
      scanKnob.className = 'w-5 h-5 rounded-full bg-white shadow-md transition-transform translate-x-0';
    }
  }

  // Update view mode description
  const viewDesc = document.getElementById('current-view-mode-desc');
  if (viewDesc) {
    viewDesc.textContent = state.viewMode === 'grid' ? 'Tampilan Grid 2-Kolom' : 'Tampilan List Ringkas';
  }

  sheet.classList.remove('hidden');
  try {
    createIcons({ icons, root: sheet });
  } catch (_) {}
}

// Setup Event Listeners
function setupEvents() {
  // Category switching
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const catBtn = target.closest('.category-pill-btn') as HTMLElement;
    if (catBtn) {
      const cat = catBtn.dataset.category as FileCategory;
      if (cat) {
        state.selectedCategory = cat;
        updateDOM();
      }
    }
  });

  // Search Toggle
  const searchToggle = document.getElementById('mobile-search-toggle');
  const searchDrawer = document.getElementById('mobile-search-drawer');
  const searchInput = document.getElementById('mobile-search-input') as HTMLInputElement;
  const closeSearch = document.getElementById('mobile-close-search');
  const clearSearch = document.getElementById('mobile-clear-search');

  if (searchToggle && searchDrawer && searchInput) {
    searchToggle.onclick = () => {
      state.isSearchOpen = !state.isSearchOpen;
      if (state.isSearchOpen) {
        searchDrawer.classList.remove('hidden');
        searchInput.focus();
      } else {
        searchDrawer.classList.add('hidden');
      }
    };

    if (closeSearch) {
      closeSearch.onclick = () => {
        state.isSearchOpen = false;
        searchDrawer.classList.add('hidden');
      };
    }

    searchInput.oninput = () => {
      state.searchQuery = searchInput.value;
      if (clearSearch) {
        clearSearch.classList.toggle('hidden', !searchInput.value);
      }
      renderFileContainer();
    };

    if (clearSearch) {
      clearSearch.onclick = () => {
        searchInput.value = '';
        state.searchQuery = '';
        clearSearch.classList.add('hidden');
        renderFileContainer();
      };
    }
  }

  // View Mode Toggle (Grid vs List)
  const viewToggle = document.getElementById('mobile-view-toggle');
  if (viewToggle) {
    viewToggle.onclick = () => {
      state.viewMode = state.viewMode === 'grid' ? 'list' : 'grid';
      localStorage.setItem(VIEW_MODE_KEY, state.viewMode);
      updateDOM();
    };
  }

  // Settings Button
  const settingsBtn = document.getElementById('mobile-settings-btn');
  if (settingsBtn) {
    settingsBtn.onclick = () => openSettingsSheet();
  }

  const closeSettings = document.getElementById('close-settings-sheet');
  if (closeSettings) {
    closeSettings.onclick = () => {
      document.getElementById('mobile-settings-modal')?.classList.add('hidden');
    };
  }

  // Theme Pick
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const themeBtn = target.closest('.theme-pick-btn') as HTMLElement;
    if (themeBtn) {
      const themeId = themeBtn.dataset.themeId;
      if (themeId) {
        state.currentTheme = themeId;
        localStorage.setItem(THEME_KEY, themeId);
        applyTheme(themeId);
        openSettingsSheet();
        updateDOM();
      }
    }
  });

  // Toggle Scanlines
  const toggleScanBtn = document.getElementById('toggle-scanlines-btn');
  if (toggleScanBtn) {
    toggleScanBtn.onclick = () => {
      state.scanlinesActive = !state.scanlinesActive;
      localStorage.setItem(SCANLINES_KEY, String(state.scanlinesActive));
      if (state.scanlinesActive) {
        document.body.classList.add('cyber-scanlines');
      } else {
        document.body.classList.remove('cyber-scanlines');
      }
      openSettingsSheet();
    };
  }

  // Toggle View Mode inside Settings
  const toggleViewModeBtn = document.getElementById('toggle-view-mode-btn');
  if (toggleViewModeBtn) {
    toggleViewModeBtn.onclick = () => {
      state.viewMode = state.viewMode === 'grid' ? 'list' : 'grid';
      localStorage.setItem(VIEW_MODE_KEY, state.viewMode);
      openSettingsSheet();
      updateDOM();
    };
  }

  // Switch to Desktop Button in Settings & Dock
  const switchDesktopHandler = () => {
    sessionStorage.setItem('cariearsa_cloud_force', 'desktop');
    window.location.replace('/cloud/?view=desktop');
  };

  const forceDesktopBtn = document.getElementById('settings-force-desktop');
  if (forceDesktopBtn) forceDesktopBtn.onclick = switchDesktopHandler;

  const dockDesktopBtn = document.getElementById('mobile-switch-desktop-btn');
  if (dockDesktopBtn) dockDesktopBtn.onclick = switchDesktopHandler;

  // Sort Button & Sheet
  const sortBtn = document.getElementById('mobile-sort-btn');
  if (sortBtn) {
    sortBtn.onclick = () => openSortSheet();
  }

  const closeSort = document.getElementById('close-sort-sheet');
  if (closeSort) {
    closeSort.onclick = () => {
      document.getElementById('mobile-sort-sheet')?.classList.add('hidden');
    };
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const sortOptionBtn = target.closest('.sort-option-btn') as HTMLElement;
    if (sortOptionBtn) {
      const sortId = sortOptionBtn.dataset.sortId as SortField;
      if (sortId) {
        state.currentSort = sortId;
        document.getElementById('mobile-sort-sheet')?.classList.add('hidden');
        updateDOM();
      }
    }
  });

  // Select Mode Toggle Button
  const selectModeBtn = document.getElementById('mobile-select-mode-btn');
  if (selectModeBtn) {
    selectModeBtn.onclick = () => {
      state.isSelectionMode = !state.isSelectionMode;
      if (!state.isSelectionMode) {
        state.selectedFileIds.clear();
      }
      updateDOM();
    };
  }

  // Refresh Button
  const refreshBtn = document.getElementById('mobile-refresh-btn');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      showToast('Menyinkronkan berkas...', 'info');
      fetchFiles(true);
    };
  }

  // Upload file input change
  const uploadInput = document.getElementById('mobile-hidden-file-input') as HTMLInputElement;
  if (uploadInput) {
    uploadInput.onchange = (e: any) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFilesUpload(files);
        uploadInput.value = '';
      }
    };
  }

  // Long-press detection for multi-select
  let pressTimer: any = null;
  let startCoords = { x: 0, y: 0 };
  let justTriggeredLongPress = false;

  document.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, form, #mobile-preview-modal, #mobile-rename-modal, #mobile-delete-modal')) {
      return;
    }
    const card = target.closest('.file-card') as HTMLElement;
    if (!card) return;

    startCoords = { x: e.clientX, y: e.clientY };
    pressTimer = setTimeout(() => {
      justTriggeredLongPress = true;
      if (navigator.vibrate) {
        try { navigator.vibrate(40); } catch (_) {}
      }
      state.isSelectionMode = true;
      const name = card.dataset.name!;
      if (state.selectedFileIds.has(name)) {
        state.selectedFileIds.delete(name);
      } else {
        state.selectedFileIds.add(name);
      }
      updateDOM();

      setTimeout(() => {
        justTriggeredLongPress = false;
      }, 350);
    }, 320);
  });

  document.addEventListener('pointermove', (e) => {
    if (pressTimer && Math.hypot(e.clientX - startCoords.x, e.clientY - startCoords.y) > 10) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });

  document.addEventListener('pointerup', () => {
    clearTimeout(pressTimer);
    pressTimer = null;
  });

  // Card click (Preview or Select)
  document.addEventListener('click', (e) => {
    if (justTriggeredLongPress) return;
    const target = e.target as HTMLElement;

    // Check if clicked select checkbox directly
    const selectBtn = target.closest('.mobile-card-select-btn') as HTMLElement;
    if (selectBtn) {
      const name = selectBtn.dataset.selectName;
      if (name) {
        state.isSelectionMode = true;
        if (state.selectedFileIds.has(name)) {
          state.selectedFileIds.delete(name);
        } else {
          state.selectedFileIds.add(name);
        }
        updateDOM();
      }
      return;
    }

    // Check if clicked rename or delete or download
    if (target.closest('.mobile-rename-btn, .mobile-delete-btn, a[download], button')) {
      return;
    }

    // Otherwise, tap on card opens preview or toggles select in selection mode
    const card = target.closest('.file-card') as HTMLElement;
    if (card) {
      const name = card.dataset.name;
      const file = state.files.find(f => f.name === name);
      if (!file) return;

      if (state.isSelectionMode) {
        if (state.selectedFileIds.has(file.name)) {
          state.selectedFileIds.delete(file.name);
        } else {
          state.selectedFileIds.add(file.name);
        }
        updateDOM();
      } else {
        openMediaPreview(file);
      }
    }
  });

  // Rename Button Handler
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const renameBtn = target.closest('.mobile-rename-btn') as HTMLElement;
    if (renameBtn) {
      const name = renameBtn.dataset.name;
      const file = state.files.find(f => f.name === name);
      if (file) {
        state.pendingRenameFile = file;
        const renameModal = document.getElementById('mobile-rename-modal');
        const renameInput = document.getElementById('rename-input-field') as HTMLInputElement;
        const renameIdInput = document.getElementById('rename-file-id') as HTMLInputElement;
        if (renameModal && renameInput && renameIdInput) {
          renameInput.value = cleanDisplayName(file.name);
          renameIdInput.value = file.name;
          renameModal.classList.remove('hidden');
          renameInput.focus();
        }
      }
    }
  });

  // Rename Form Submission
  const renameForm = document.getElementById('mobile-rename-form') as HTMLFormElement;
  if (renameForm) {
    renameForm.onsubmit = async (e) => {
      e.preventDefault();
      const renameInput = document.getElementById('rename-input-field') as HTMLInputElement;
      const oldName = (document.getElementById('rename-file-id') as HTMLInputElement)?.value;
      const newBaseName = renameInput.value.trim();
      if (!oldName || !newBaseName) return;

      const ext = getFileExtension(oldName);
      const newFullName = ext && !newBaseName.endsWith(`.${ext}`) ? `${newBaseName}.${ext}` : newBaseName;

      showToast('Menyimpan nama berkas...', 'info');
      document.getElementById('mobile-rename-modal')?.classList.add('hidden');

      try {
        const res = await fetch('/api/cloud/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldName, newName: newFullName }),
        });
        if (res.ok) {
          showToast('Nama berkas berhasil diubah', 'success');
          fetchFiles(false);
          return;
        }
      } catch (_) {}

      // Supabase direct fallback
      try {
        const { error } = await supabaseClient.storage.from(BUCKET_NAME).move(oldName, newFullName);
        if (!error) {
          showToast('Nama berkas berhasil diubah', 'success');
          fetchFiles(false);
        } else {
          showToast('Gagal mengubah nama berkas', 'error');
        }
      } catch (err) {
        showToast('Gagal mengubah nama berkas', 'error');
      }
    };
  }

  const cancelRename = document.getElementById('cancel-rename-btn');
  const closeRename = document.getElementById('close-rename-sheet');
  if (cancelRename) cancelRename.onclick = () => document.getElementById('mobile-rename-modal')?.classList.add('hidden');
  if (closeRename) closeRename.onclick = () => document.getElementById('mobile-rename-modal')?.classList.add('hidden');

  // Single Delete Button Handler
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const deleteBtn = target.closest('.mobile-delete-btn') as HTMLElement;
    if (deleteBtn) {
      const name = deleteBtn.dataset.name;
      if (name) {
        state.pendingDeleteIds = [name];
        const modal = document.getElementById('mobile-delete-modal');
        const title = document.getElementById('delete-modal-title');
        const desc = document.getElementById('delete-modal-desc');
        if (modal && title && desc) {
          title.textContent = 'Hapus Berkas?';
          desc.innerHTML = `Apakah Anda yakin ingin menghapus <span class="font-bold text-white">${cleanDisplayName(name)}</span> secara permanen?`;
          modal.classList.remove('hidden');
        }
      }
    }
  });

  // Bulk Delete Button
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'bulk-delete' || target.closest('#bulk-delete')) {
      const ids = Array.from(state.selectedFileIds);
      if (ids.length === 0) return;
      state.pendingDeleteIds = ids;
      const modal = document.getElementById('mobile-delete-modal');
      const title = document.getElementById('delete-modal-title');
      const desc = document.getElementById('delete-modal-desc');
      if (modal && title && desc) {
        title.textContent = `Hapus ${ids.length} Berkas?`;
        desc.innerHTML = `Apakah Anda yakin ingin menghapus <span class="font-bold text-white">${ids.length} berkas</span> terpilih secara permanen?`;
        modal.classList.remove('hidden');
      }
    }
  });

  // Confirm Delete Handler
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = async () => {
      const names = state.pendingDeleteIds;
      if (names.length === 0) return;

      document.getElementById('mobile-delete-modal')?.classList.add('hidden');
      showToast(`Menghapus ${names.length} berkas...`, 'info');

      try {
        const res = await fetch('/api/cloud/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names }),
        });
        if (res.ok) {
          names.forEach(n => state.selectedFileIds.delete(n));
          showToast(`${names.length} berkas dihapus`, 'success');
          fetchFiles(false);
          return;
        }
      } catch (_) {}

      // Supabase direct fallback
      try {
        const { error } = await supabaseClient.storage.from(BUCKET_NAME).remove(names);
        if (!error) {
          names.forEach(n => state.selectedFileIds.delete(n));
          showToast(`${names.length} berkas dihapus`, 'success');
          fetchFiles(false);
        } else {
          showToast('Gagal menghapus berkas', 'error');
        }
      } catch (err) {
        showToast('Gagal menghapus berkas', 'error');
      }
    };
  }

  const cancelDelete = document.getElementById('cancel-delete-btn');
  if (cancelDelete) cancelDelete.onclick = () => document.getElementById('mobile-delete-modal')?.classList.add('hidden');

  // Bulk Actions: Select All, Download, Cancel
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.id === 'bulk-select-all' || target.closest('#bulk-select-all')) {
      const files = getFilteredAndSortedFiles();
      if (state.selectedFileIds.size === files.length) {
        state.selectedFileIds.clear();
      } else {
        files.forEach(f => state.selectedFileIds.add(f.name));
      }
      updateDOM();
    }

    if (target.id === 'bulk-cancel' || target.closest('#bulk-cancel')) {
      state.isSelectionMode = false;
      state.selectedFileIds.clear();
      updateDOM();
    }

    if (target.id === 'bulk-download' || target.closest('#bulk-download')) {
      const ids = Array.from(state.selectedFileIds);
      ids.forEach(name => {
        const file = state.files.find(f => f.name === name);
        if (file) {
          const a = document.createElement('a');
          a.href = file.publicUrl;
          a.download = cleanDisplayName(file.name);
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      });
    }
  });

  // Audio Player Event Bindings
  const globalAudio = document.getElementById('mobile-audio') as HTMLAudioElement;
  if (globalAudio) {
    globalAudio.ontimeupdate = () => {
      state.activeAudio.currentTime = globalAudio.currentTime;
      state.activeAudio.duration = globalAudio.duration || 0;
      renderAudioBar();
    };

    globalAudio.onended = () => {
      state.activeAudio.isPlaying = false;
      renderAudioBar();
      renderFileContainer();
    };

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'audio-play-pause-btn' || target.closest('#audio-play-pause-btn')) {
        if (globalAudio.paused) {
          globalAudio.play();
          state.activeAudio.isPlaying = true;
        } else {
          globalAudio.pause();
          state.activeAudio.isPlaying = false;
        }
        renderAudioBar();
        renderFileContainer();
      }

      if (target.id === 'audio-close-btn' || target.closest('#audio-close-btn')) {
        globalAudio.pause();
        state.activeAudio.file = null;
        state.activeAudio.isPlaying = false;
        renderAudioBar();
        renderFileContainer();
      }
    });
  }

  // Viewport resize redirection (if resized to desktop)
  let resizeTimer: any = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      try {
        if (sessionStorage.getItem('cariearsa_cloud_force') === 'mobile') return;
        var isLarge = window.innerWidth > 1024 && (!navigator.maxTouchPoints || navigator.maxTouchPoints === 0);
        if (isLarge) {
          window.location.replace('/cloud/' + window.location.search + window.location.hash);
        }
      } catch (_) {}
    }, 250);
  });
}

// Initial Boot
let hasBooted = false;
function bootApp() {
  if (hasBooted) return;
  hasBooted = true;
  setupEvents();
  if (state.files.length > 0) {
    updateDOM();
    fetchFiles(false);
  } else {
    updateDOM();
    fetchFiles(true);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
