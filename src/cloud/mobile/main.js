import { createIcons, icons } from 'lucide';
import { createClient } from '@supabase/supabase-js';
import { 
  cleanDisplayName, 
  getFileCategory, 
  getFileExtension, 
  formatFileSize, 
  isVideoFile, 
  isAudioFile, 
  isImageFile, 
  getFileTypeBadge 
} from '../utils/fileHelpers.js';
import { THEME_VARIANTS } from '../ui-settings.js';
import { renderCategoryDropdown } from '../ui-layout-1.js';

// Device capability detection (Check for real desktop or laptop)
export function isDesktopOrLaptopDevice() {
  try {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';

    // Check for desktop operating systems
    const isWindows = /Windows NT|Win64|WOW64|Win32/i.test(ua) || platform.indexOf('Win') !== -1;
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua);
    const isLinuxDesktop = /Linux/i.test(ua) && !/Android/i.test(ua);
    const isCrOS = /CrOS/i.test(ua);
    const isDesktopOS = isWindows || isMac || isLinuxDesktop || isCrOS;

    // Viewport width check (typical desktop or laptop viewport)
    const isLargeScreen = window.innerWidth >= 1024 || (window.screen && Math.min(window.screen.width, window.screen.height) >= 900);

    return isDesktopOS || isLargeScreen;
  } catch (_) {
    return true;
  }
}

function applyTheme(themeId) {
  document.documentElement.dataset.theme = themeId;
  if (document.body) {
    document.body.dataset.theme = themeId;
  }
}

// Initialize direct Supabase client
const SUPABASE_URL = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://skxsvioheebxidqafmoo.supabase.co';
const SUPABASE_KEY = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_3RFdAZVw-8qqJiWgQpEpwQ_Q_peRYlq';
const BUCKET_NAME = 'vault_files';
const isSupabaseConfigured = typeof SUPABASE_KEY === 'string' && (SUPABASE_KEY.startsWith('sb_') || SUPABASE_KEY.startsWith('eyJ') || SUPABASE_KEY.length > 20);

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Storage Cache Keys
const CACHE_KEY = 'cariearsa_cloud_cache_v2';
const THEME_KEY = 'cariearsa_cloud_theme';
const SCANLINES_KEY = 'cariearsa_cloud_scanlines';
const VIEW_MODE_KEY = 'cariearsa_cloud_mobile_view';

// Read persistent preferences
const initialTheme = localStorage.getItem(THEME_KEY) || 'neo-tokyo';
const savedScanlines = localStorage.getItem(SCANLINES_KEY);
const initialScanlines = savedScanlines === null ? true : savedScanlines === 'true';
const initialViewMode = localStorage.getItem(VIEW_MODE_KEY) || 'grid';

// Instant Cache Retrieval (0ms load)
let cachedFiles = [];
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
  uploadProgress: null,
  currentSort: 'date_desc',
  selectedCategory: 'all',
  isCategoryMenuOpen: false,
  searchQuery: '',
  selectedFileIds: new Set(),
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
  },
  pendingDeleteIds: [],
  pendingRenameFile: null,
};

// Sort Options definition
const SORT_OPTIONS = [
  { id: 'date_desc', label: 'Terbaru', desc: 'Tanggal unggah paling baru' },
  { id: 'date_asc', label: 'Terlama', desc: 'Tanggal unggah paling awal' },
  { id: 'name_asc', label: 'Nama (A-Z)', desc: 'Alfabet menaik' },
  { id: 'name_desc', label: 'Nama (Z-A)', desc: 'Alfabet menurun' },
  { id: 'size_desc', label: 'Ukuran Terbesar', desc: 'Kapasitas byte tertinggi' },
  { id: 'size_asc', label: 'Ukuran Terkecil', desc: 'Kapasitas byte terendah' },
];

// Helper: Toast Notifications
let toastTimer = null;
function showToast(message, type = 'info') {
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

  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono shadow-2xl backdrop-blur-md border animate-toast ${colors[type] || colors.info}`;
  toast.innerHTML = `${iconsMap[type] || iconsMap.info}<span>${message}</span>`;
  toast.classList.remove('hidden');

  try {
    createIcons({ icons, root: toast });
  } catch (_) {}

  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

// Filtering & Sorting Logic
function getFilteredAndSortedFiles() {
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
function formatMobileDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

// Calculate Total Storage Used
function getTotalStorage() {
  return state.files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
}

// Sync Category Dropdown with Header
function renderCategoryDropdownButton() {
  const slot = document.getElementById('mobile-category-dropdown-slot');
  if (!slot) return;
  const counts = getCategoryCounts();
  slot.innerHTML = renderCategoryDropdown(state.selectedCategory, counts, state.isCategoryMenuOpen);
}

function syncCategoryDropdown() {
  const catMenu = document.getElementById('category-dropdown-menu');
  const catBtn = document.getElementById('category-menu-button');
  if (catMenu && catBtn) {
    if (state.isCategoryMenuOpen) {
      catMenu.classList.remove('hidden');
      catMenu.classList.add('block');
      catBtn.classList.add('cyber-btn-solid-accent', 'ring-2', 'ring-white/40');
      catBtn.classList.remove('cyber-btn-solid-surface');
      const chev = catBtn.querySelector('.category-btn-chevron, [data-lucide="chevron-down"], svg.lucide-chevron-down');
      if (chev) {
        chev.classList.add('rotate-180', 'text-slate-950');
        chev.classList.remove('text-[var(--c-text-muted)]');
      }
      const icon = catBtn.querySelector('.category-btn-icon, [data-lucide="filter"], svg.lucide-filter');
      if (icon) {
        icon.classList.add('text-slate-950');
        icon.classList.remove('text-[var(--c-accent)]');
      }
      const label = catBtn.querySelector('.category-btn-label');
      if (label) {
        label.classList.add('text-slate-950', 'font-black');
        label.classList.remove('text-[var(--c-text-main)]');
      }
    } else {
      catMenu.classList.add('hidden');
      catMenu.classList.remove('block');
      catBtn.classList.remove('cyber-btn-solid-accent', 'ring-2', 'ring-white/40');
      if (state.selectedCategory === 'all') {
        catBtn.classList.add('cyber-btn-solid-surface');
      }
      const chev = catBtn.querySelector('.category-btn-chevron, [data-lucide="chevron-down"], svg.lucide-chevron-down');
      if (chev) {
        chev.classList.remove('rotate-180', 'text-slate-950');
        chev.classList.add('text-[var(--c-text-muted)]');
      }
      const icon = catBtn.querySelector('.category-btn-icon, [data-lucide="filter"], svg.lucide-filter');
      if (icon) {
        icon.classList.remove('text-slate-950');
        icon.classList.add('text-[var(--c-accent)]');
      }
      const label = catBtn.querySelector('.category-btn-label');
      if (label) {
        label.classList.remove('text-slate-950', 'font-black');
        label.classList.add('text-[var(--c-text-main)]');
      }
    }
  }
}

// Storage Widget
function renderStorageWidget() {
  const widget = document.getElementById('mobile-storage-widget');
  if (!widget) return;
  const usedBytes = getTotalStorage();
  const maxBytes = 1 * 1024 * 1024 * 1024;
  const pct = Math.min((usedBytes / maxBytes) * 100, 100);
  const formattedUsed = formatFileSize(usedBytes);
  const totalFiles = state.files.length;

  widget.innerHTML = `
    <div class="flex items-center justify-between text-[10px] font-mono text-[var(--c-text-muted)] mb-1">
      <span class="flex items-center gap-1.5 text-[var(--c-text-main)] font-bold">
        <i data-lucide="hard-drive" class="w-3.5 h-3.5 text-[var(--c-accent)]"></i>
        <span>VAULT STORAGE</span>
      </span>
      <span class="text-[var(--c-accent)] font-bold">${pct < 0.1 && usedBytes > 0 ? '<0.1%' : pct.toFixed(1) + '%'}</span>
    </div>
    <div class="w-full bg-black/60 h-2 rounded-full overflow-hidden p-0.5 border border-[var(--c-border)] mb-1">
      <div class="bg-gradient-to-r from-[var(--c-accent)] via-[var(--c-secondary)] to-[var(--c-accent)] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_var(--c-accent-glow)]" style="width: ${Math.max(pct, usedBytes > 0 ? 3 : 0)}%"></div>
    </div>
    <div class="flex items-center justify-between text-[9px] font-mono text-[var(--c-text-muted)]">
      <span>${formattedUsed} / 1 GB</span>
      <span class="text-[var(--c-text-main)]">${totalFiles} Berkas</span>
    </div>
  `;
}

// Render Files (Grid or List View)
function renderFileContainer() {
  const container = document.getElementById('mobile-file-container');
  if (!container) return;

  const files = getFilteredAndSortedFiles();

  if (state.loading && state.files.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-[var(--c-text-muted)] font-mono">
        <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-[var(--c-accent)] mb-3"></i>
        <p class="text-xs font-bold tracking-wider text-[var(--c-accent)]">MEMUAT BERKAS VAULT...</p>
      </div>
    `;
    return;
  }

  if (files.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 px-4 flex flex-col items-center justify-center text-center font-mono">
        <div class="w-14 h-14 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-accent)] mb-3 shadow-[0_0_20px_var(--c-accent-glow)]">
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
          class="file-card group relative bg-[var(--c-surface)] border ${isSelected ? 'border-[var(--c-accent)] ring-2 ring-[var(--c-accent)]/60 shadow-[0_0_15px_var(--c-accent-glow)]' : 'border-[var(--c-border)]'} rounded-xl p-3 flex items-center gap-3 transition-all duration-150 animate-file-card select-none"
          data-name="${file.name}"
          data-url="${file.publicUrl}"
        >
          <!-- Select Checkbox -->
          <button 
            type="button" 
            class="mobile-card-select-btn p-1 rounded-md text-[var(--c-text-muted)] hover:text-white shrink-0 ${state.isSelectionMode ? 'opacity-100' : 'opacity-70'}"
            data-select-name="${file.name}"
            title="Pilih berkas"
          >
            <div class="w-4 h-4 rounded border ${isSelected ? 'bg-[var(--c-accent)] border-[var(--c-accent)] text-slate-950 flex items-center justify-center' : 'border-[var(--c-border)] bg-[var(--c-bg)]'}">
              ${isSelected ? '<i data-lucide="check" class="w-3 h-3 stroke-[3]"></i>' : ''}
            </div>
          </button>

          <!-- Thumbnail Icon -->
          <div class="file-card-thumb relative w-12 h-12 rounded-lg bg-[var(--c-bg)] overflow-hidden border border-[var(--c-border)] flex items-center justify-center shrink-0 cursor-pointer active:opacity-80">
            ${isImg 
              ? `<img src="${file.publicUrl}" alt="${displayName}" class="w-full h-full object-cover select-none" loading="lazy" />`
              : isVid
              ? `<div class="relative w-full h-full flex items-center justify-center bg-black/40"><i data-lucide="video" class="w-5 h-5 text-purple-400"></i></div>`
              : isAud
              ? `<div class="flex items-center justify-center text-[var(--c-accent)] ${isCurrentAudio ? 'animate-pulse' : ''}"><i data-lucide="${isCurrentAudio ? 'disc-3' : 'music'}" class="w-5 h-5 ${isCurrentAudio ? 'animate-spin' : ''}"></i></div>`
              : `<i data-lucide="file-text" class="w-5 h-5 text-[var(--c-accent)]"></i>`
            }
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-white truncate mb-1" title="${displayName}">${displayName}</h4>
            <div class="flex items-center gap-2 text-[10px] text-[var(--c-text-muted)] font-mono">
              <span class="text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${badgeInfo.badgeBg} ${badgeInfo.badgeText}">${badgeInfo.tag}</span>
              <span>${formattedSize}</span>
              <span class="opacity-60">• ${dateStr}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1 shrink-0">
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
      `;
    }).join('');
  }
}

// Bulk Action Bar
function renderBulkBar() {
  const bar = document.getElementById('mobile-bulk-bar');
  if (!bar) return;
  const count = state.selectedFileIds.size;

  if (state.isSelectionMode && count > 0) {
    bar.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
    bar.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[var(--c-accent)] animate-pulse"></span>
        <span class="text-xs font-mono font-bold text-white"><span class="text-[var(--c-accent)]">${count}</span> Berkas Terpilih</span>
      </div>
      <div class="flex items-center gap-2">
        <button id="bulk-select-all" class="p-1.5 rounded-lg bg-[var(--c-surface-card)] text-[var(--c-accent)] hover:bg-[var(--c-surface-hover)] border border-[var(--c-border)] transition-colors" title="Pilih Semua">
          <i data-lucide="check-square" class="w-4 h-4"></i>
        </button>
        <button id="bulk-download" class="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900 transition-colors" title="Unduh Terpilih">
          <i data-lucide="download" class="w-4 h-4"></i>
        </button>
        <button id="bulk-delete" class="p-1.5 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-500/50 hover:bg-rose-900 transition-colors" title="Hapus Terpilih">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
        <button id="bulk-cancel" class="px-2 py-1 rounded-lg bg-[var(--c-surface-card)] text-xs font-mono text-[var(--c-text-muted)] hover:text-white border border-[var(--c-border)] transition-colors">
          Batal
        </button>
      </div>
    `;
    try { createIcons({ icons, root: bar }); } catch (_) {}
  } else {
    bar.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
  }
}

// Audio Bar
function renderAudioBar() {
  const bar = document.getElementById('mobile-audio-bar');
  if (!bar) return;
  const audio = state.activeAudio;

  if (audio.file) {
    bar.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
    const name = cleanDisplayName(audio.file.name);
    const timeFormatted = `${Math.floor(audio.currentTime / 60)}:${Math.floor(audio.currentTime % 60).toString().padStart(2, '0')}`;
    const durFormatted = `${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60).toString().padStart(2, '0')}`;
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;

    bar.innerHTML = `
      <div class="flex items-center gap-3">
        <button id="audio-play-pause-btn" class="w-8 h-8 rounded-full bg-[var(--c-accent)] text-slate-950 flex items-center justify-center shrink-0 shadow-[0_0_10px_var(--c-accent-glow)]">
          <i data-lucide="${audio.isPlaying ? 'pause' : 'play'}" class="w-4 h-4 fill-current"></i>
        </button>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-white truncate font-mono">${name}</p>
          <div class="flex items-center gap-2 text-[9px] text-[var(--c-text-muted)] font-mono">
            <span>${timeFormatted} / ${durFormatted}</span>
            <div class="flex-1 h-1 bg-black/60 rounded-full overflow-hidden border border-[var(--c-border)]">
              <div class="bg-[var(--c-accent)] h-full transition-all" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>
        <button id="audio-close-btn" class="p-1 text-[var(--c-text-muted)] hover:text-white shrink-0">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    try { createIcons({ icons, root: bar }); } catch (_) {}
  } else {
    bar.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
  }
}

// Update Desktop Switch Visibility
function updateDesktopSwitchVisibility() {
  const isDesktop = isDesktopOrLaptopDevice();
  const switchBtns = document.querySelectorAll('.desktop-switch-target');
  switchBtns.forEach(btn => {
    if (isDesktop) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  });
}

// Open Sort Sheet
function openSortSheet() {
  const sheet = document.getElementById('mobile-sort-sheet');
  const container = document.getElementById('mobile-sort-options-container');
  if (!sheet || !container) return;

  container.innerHTML = SORT_OPTIONS.map(opt => {
    const isSelected = state.currentSort === opt.id;
    return `
      <button 
        type="button" 
        class="sort-option-btn w-full flex items-center justify-between p-3 rounded-xl border ${isSelected ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-white shadow-[0_0_12px_var(--c-accent-glow)]' : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text-muted)]'} transition-all"
        data-sort-id="${opt.id}"
      >
        <div class="text-left font-mono">
          <p class="text-xs font-bold ${isSelected ? 'text-[var(--c-accent)]' : 'text-white'}">${opt.label}</p>
          <p class="text-[10px] text-[var(--c-text-muted)]">${opt.desc}</p>
        </div>
        ${isSelected ? '<i data-lucide="check" class="w-4 h-4 text-[var(--c-accent)]"></i>' : ''}
      </button>
    `;
  }).join('');

  sheet.classList.remove('hidden');
  try { createIcons({ icons, root: sheet }); } catch (_) {}
}

// Open Settings Sheet
function openSettingsSheet() {
  const sheet = document.getElementById('mobile-settings-modal');
  const themeContainer = document.getElementById('mobile-theme-list');
  if (!sheet || !themeContainer) return;

  themeContainer.innerHTML = THEME_VARIANTS.map(t => {
    const isSelected = state.currentTheme === t.id;
    return `
      <button 
        type="button" 
        class="theme-pick-btn w-full p-2.5 rounded-xl border ${isSelected ? 'border-[var(--c-accent)] ring-2 ring-[var(--c-accent)]/60 bg-[var(--c-surface-card)]' : 'border-[var(--c-border)] bg-[var(--c-surface)]'} transition-all text-left"
        data-theme-id="${t.id}"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-white font-mono">${t.name}</span>
          ${isSelected ? '<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--c-accent)] text-slate-950 font-black">AKTIF</span>' : ''}
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
  try { createIcons({ icons, root: sheet }); } catch (_) {}
}

// Setup Event Listeners
function setupEvents() {
  const globalAudio = document.getElementById('global-audio');

  // Category Dropdown
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Toggle Category Menu Button
    if (target.closest('#category-menu-button')) {
      e.preventDefault();
      e.stopPropagation();
      state.isCategoryMenuOpen = !state.isCategoryMenuOpen;
      syncCategoryDropdown();
      return;
    }

    // Close Category Dropdown when clicking outside
    if (state.isCategoryMenuOpen && !target.closest('#category-dropdown-container')) {
      state.isCategoryMenuOpen = false;
      syncCategoryDropdown();
    }

    // Category option selected inside dropdown
    const catBtn = target.closest('.category-option-btn');
    if (catBtn) {
      e.preventDefault();
      e.stopPropagation();
      const cat = catBtn.dataset.category;
      if (cat) {
        state.selectedCategory = cat;
        state.isCategoryMenuOpen = false;
        updateDOM();
      }
      return;
    }
  });

  // Search Toggle
  const searchToggle = document.getElementById('mobile-search-toggle');
  const searchDrawer = document.getElementById('mobile-search-drawer');
  const searchInput = document.getElementById('mobile-search-input');
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
  const handleToggleViewMode = () => {
    state.viewMode = state.viewMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem(VIEW_MODE_KEY, state.viewMode);
    updateDOM();
  };

  const viewToggle = document.getElementById('mobile-view-toggle');
  if (viewToggle) viewToggle.onclick = handleToggleViewMode;
  const dockViewToggle = document.getElementById('mobile-dock-view-toggle');
  if (dockViewToggle) dockViewToggle.onclick = handleToggleViewMode;

  // Settings Button
  const settingsBtn = document.getElementById('mobile-settings-btn');
  if (settingsBtn) settingsBtn.onclick = () => openSettingsSheet();

  const closeSettings = document.getElementById('close-settings-sheet');
  if (closeSettings) {
    closeSettings.onclick = () => {
      document.getElementById('mobile-settings-modal')?.classList.add('hidden');
    };
  }

  // Theme Pick
  document.addEventListener('click', (e) => {
    const target = e.target;
    const themeBtn = target.closest('.theme-pick-btn');
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

  // Initialize desktop switch buttons visibility
  updateDesktopSwitchVisibility();

  // Sort Button & Sheet
  const sortBtn = document.getElementById('mobile-sort-btn');
  if (sortBtn) sortBtn.onclick = () => openSortSheet();

  const closeSort = document.getElementById('close-sort-sheet');
  if (closeSort) {
    closeSort.onclick = () => {
      document.getElementById('mobile-sort-sheet')?.classList.add('hidden');
    };
  }

  document.addEventListener('click', (e) => {
    const target = e.target;
    const sortOptionBtn = target.closest('.sort-option-btn');
    if (sortOptionBtn) {
      const sortId = sortOptionBtn.dataset.sortId;
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
  const uploadInput = document.getElementById('mobile-hidden-file-input');
  if (uploadInput) {
    uploadInput.onchange = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFilesUpload(files);
        uploadInput.value = '';
      }
    };
  }

  // Long-press detection for multi-select
  let pressTimer = null;
  let startCoords = { x: 0, y: 0 };
  let justTriggeredLongPress = false;

  document.addEventListener('pointerdown', (e) => {
    const target = e.target;
    if (target.closest('button, a, input, form, #mobile-preview-modal, #mobile-rename-modal, #mobile-delete-modal')) {
      return;
    }
    const card = target.closest('.file-card');
    if (!card) return;

    startCoords = { x: e.clientX, y: e.clientY };
    pressTimer = setTimeout(() => {
      justTriggeredLongPress = true;
      if (navigator.vibrate) {
        try { navigator.vibrate(40); } catch (_) {}
      }
      state.isSelectionMode = true;
      const name = card.dataset.name;
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
    const target = e.target;

    // Check if clicked select checkbox directly
    const selectBtn = target.closest('.mobile-card-select-btn');
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
    const card = target.closest('.file-card');
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
    const target = e.target;
    const renameBtn = target.closest('.mobile-rename-btn');
    if (renameBtn) {
      const name = renameBtn.dataset.name;
      const file = state.files.find(f => f.name === name);
      if (file) {
        state.pendingRenameFile = file;
        const renameModal = document.getElementById('mobile-rename-modal');
        const renameInput = document.getElementById('rename-input-field');
        const renameIdInput = document.getElementById('rename-file-id');
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
  const renameForm = document.getElementById('mobile-rename-form');
  if (renameForm) {
    renameForm.onsubmit = async (e) => {
      e.preventDefault();
      const renameInput = document.getElementById('rename-input-field');
      const oldName = document.getElementById('rename-file-id')?.value;
      const newBaseName = renameInput.value.trim();
      if (!oldName || !newBaseName) return;

      const ext = getFileExtension(oldName);
      const newFullName = ext && !newBaseName.endsWith(`.${ext}`) ? `${newBaseName}.${ext}` : newBaseName;

      showToast('Menyimpan nama berkas...', 'info');
      document.getElementById('mobile-rename-modal')?.classList.add('hidden');

      let renamed = false;

      // 1. Direct Supabase Storage move
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabaseClient.storage.from(BUCKET_NAME).move(oldName, newFullName);
          if (!error) {
            renamed = true;
          }
        } catch (_) {}
      }

      // 2. Server API rename fallback
      if (!renamed) {
        try {
          const res = await fetch('/api/files/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName, newName: newFullName }),
          });
          if (res.ok) renamed = true;
        } catch (_) {}
      }

      if (renamed) {
        showToast('Nama berkas berhasil diubah', 'success');
        fetchFiles(false);
      } else {
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
    const target = e.target;
    const deleteBtn = target.closest('.mobile-delete-btn');
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
    const target = e.target;
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

      let deleted = false;

      // 1. Direct Supabase Storage delete
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabaseClient.storage.from(BUCKET_NAME).remove(names);
          if (!error) {
            deleted = true;
          }
        } catch (_) {}
      }

      // 2. Server API delete fallback
      if (!deleted) {
        try {
          const res = await fetch('/api/files/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names }),
          });
          if (res.ok) deleted = true;
        } catch (_) {}
      }

      if (deleted) {
        names.forEach(n => state.selectedFileIds.delete(n));
        showToast(`${names.length} berkas dihapus`, 'success');
        fetchFiles(false);
      } else {
        showToast('Gagal menghapus berkas', 'error');
      }
    };
  }

  const cancelDelete = document.getElementById('cancel-delete-btn');
  if (cancelDelete) cancelDelete.onclick = () => document.getElementById('mobile-delete-modal')?.classList.add('hidden');

  // Bulk Actions: Select All, Download, Cancel
  document.addEventListener('click', (e) => {
    const target = e.target;

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
      const filesToDownload = state.files.filter(f => ids.includes(f.name));
      if (filesToDownload.length === 0) return;

      showToast(`Mengunduh ${filesToDownload.length} berkas...`, 'info');
      filesToDownload.forEach((file, idx) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = file.publicUrl;
          a.download = cleanDisplayName(file.name);
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, idx * 250);
      });
    }
  });

  // Audio Player Controls
  if (globalAudio) {
    globalAudio.addEventListener('timeupdate', () => {
      state.activeAudio.currentTime = globalAudio.currentTime;
      state.activeAudio.duration = globalAudio.duration || 0;
      renderAudioBar();
    });

    globalAudio.addEventListener('ended', () => {
      state.activeAudio.isPlaying = false;
      renderAudioBar();
      renderFileContainer();
    });

    document.addEventListener('click', (e) => {
      const target = e.target;

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

  // Viewport resize handling: If real desktop or laptop is detected, redirect back to /cloud!
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      try {
        updateDesktopSwitchVisibility();
        if (sessionStorage.getItem('cariearsa_cloud_force') === 'mobile') return;
        if (isDesktopOrLaptopDevice()) {
          window.location.replace('/cloud/' + window.location.search + window.location.hash);
        }
      } catch (_) {}
    }, 300);
  });
}

// Master DOM Update Function
function updateDOM() {
  renderCategoryDropdownButton();
  renderStorageWidget();
  renderFileContainer();
  renderBulkBar();
  renderAudioBar();
  updateDesktopSwitchVisibility();

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

// Fetch Files from Backend with Direct Supabase Primary
async function fetchFiles(showLoader = true) {
  if (showLoader && state.files.length === 0) {
    state.loading = true;
    updateDOM();
  }

  // 1. Direct Supabase Storage list (primary - real-time & static-host proof)
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (!error && data) {
        const validFiles = data.filter(f => f.name !== '.emptyFolderPlaceholder');
        state.files = validFiles.map(f => {
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
        state.loading = false;
        updateDOM();
        return;
      }
    } catch (err) {}
  }

  // 2. Server API fallback
  try {
    const res = await fetch('/api/files');
    if (res && res.ok) {
      const data = await res.json();
      state.files = data.files || [];
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(state.files));
      } catch (_) {}
      state.loading = false;
      updateDOM();
      return;
    }
  } catch (_) {}

  state.loading = false;
  updateDOM();
}

// Upload Files with Direct Supabase Primary (Prevents 405 error on static servers)
async function handleFilesUpload(fileList) {
  if (!fileList || fileList.length === 0) return;
  const filesToUpload = Array.from(fileList);
  const total = filesToUpload.length;
  let successCount = 0;

  showToast(`Mengunggah ${total} berkas...`, 'info');

  for (let i = 0; i < total; i++) {
    const file = filesToUpload[i];
    let uploaded = false;

    // 1. Direct Supabase Storage upload first
    if (isSupabaseConfigured) {
      try {
        const timestamp = Date.now();
        const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error } = await supabaseClient.storage.from(BUCKET_NAME).upload(safeName, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });
        if (!error) {
          successCount++;
          uploaded = true;
        }
      } catch (e) {}
    }

    // 2. Fallback to Server API
    if (!uploaded) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (res && res.ok) {
          successCount++;
        }
      } catch (_) {}
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
function openMediaPreview(file) {
  const modal = document.getElementById('mobile-preview-modal');
  if (!modal) return;

  const isImg = isImageFile(file.name);
  const isVid = isVideoFile(file.name);
  const isAud = isAudioFile(file.name);
  const ext = getFileExtension(file.name);
  const badgeInfo = getFileTypeBadge(ext);
  const displayName = cleanDisplayName(file.name);
  const formattedSize = formatFileSize(file.metadata?.size);
  const globalAudio = document.getElementById('global-audio');

  if (isAud) {
    if (globalAudio) {
      globalAudio.src = file.publicUrl;
      globalAudio.play();
      state.activeAudio.file = file;
      state.activeAudio.isPlaying = true;
      renderAudioBar();
      renderFileContainer();
    }
    return;
  }

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col animate-fade-in font-mono">
      <!-- Top Bar -->
      <div class="p-3 bg-[var(--c-surface)] border-b border-[var(--c-border)] flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0 pr-2">
          <span class="text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${badgeInfo.badgeBg} ${badgeInfo.badgeText} shrink-0">
            ${badgeInfo.tag}
          </span>
          <div class="min-w-0">
            <h3 class="text-xs font-bold text-white truncate" title="${displayName}">${displayName}</h3>
            <p class="text-[9px] text-[var(--c-text-muted)]">${formattedSize}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <a href="${file.publicUrl}" download="${displayName}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-[var(--c-surface-card)] text-white hover:bg-[var(--c-surface-hover)]">
            <i data-lucide="download" class="w-4 h-4"></i>
          </a>
          <button id="close-mobile-preview-btn" class="p-2 rounded-lg bg-[var(--c-surface-card)] text-white hover:bg-rose-500/20 hover:text-rose-400">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Preview Body -->
      <div class="flex-1 flex items-center justify-center p-4 overflow-auto">
        ${isImg 
          ? `<img src="${file.publicUrl}" alt="${displayName}" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />`
          : isVid
          ? `<video src="${file.publicUrl}" controls autoplay playsinline class="max-w-full max-h-full rounded-lg shadow-2xl"></video>`
          : `<div class="text-center text-[var(--c-text-muted)]">
              <i data-lucide="file-text" class="w-16 h-16 mx-auto mb-2 text-[var(--c-accent)]"></i>
              <p class="text-sm font-bold text-white mb-2">${displayName}</p>
              <p class="text-xs mb-4">Pratinjau langsung tidak tersedia untuk format ini.</p>
              <a href="${file.publicUrl}" download="${displayName}" class="cyber-btn-chamfer cyber-btn-solid-accent px-4 py-2 text-xs font-bold inline-flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>UNDUH BERKAS</span>
              </a>
             </div>`
        }
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  try { createIcons({ icons, root: modal }); } catch (_) {}

  const closeBtn = document.getElementById('close-mobile-preview-btn');
  if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
}

// Initial Boot
let hasBooted = false;
function bootApp() {
  if (hasBooted) return;
  hasBooted = true;

  // Immediate redirect for Desktop/Laptop users opening /cloud/mobile directly
  if (sessionStorage.getItem('cariearsa_cloud_force') !== 'mobile' && isDesktopOrLaptopDevice()) {
    window.location.replace('/cloud/' + window.location.search + window.location.hash);
    return;
  }

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
