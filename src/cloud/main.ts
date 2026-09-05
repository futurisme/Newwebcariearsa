import { createIcons, icons } from 'lucide';
import { createClient } from '@supabase/supabase-js';
import { renderHeaderControls, renderSidebar } from './ui-layout-2';
import { renderFileCard } from './ui-card';
import { renderStorageIndicator } from './ui-layout-1';
import { renderSettingsModal, THEME_VARIANTS } from './ui-settings';
import { FileData, FileCategory, SortField } from './types';
import { cleanDisplayName, getFileCategory, getFileExtension, formatFileSize, isVideoFile, isAudioFile, isImageFile } from './utils/fileHelpers';

// Initialize direct Supabase client for resilient fallback
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://gnhkhnmvggltqszbhfev.supabase.co';
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_secret_E7C1i2kfhrHHBdbrCbIfZA_5I12RT6C';
const BUCKET_NAME = 'vault_files';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const initialTheme = localStorage.getItem('cariearsa_cloud_theme') || 'neo-tokyo';
const savedScanlines = localStorage.getItem('cariearsa_cloud_scanlines');
const initialScanlines = savedScanlines === null ? true : savedScanlines === 'true';
const initialCompact = localStorage.getItem('cariearsa_cloud_compact') === 'true';

// Instant Cache Retrieval (Ultra-fast 0ms load)
const CACHE_KEY = 'cariearsa_cloud_cache_v2';
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

// Apply theme to document element immediately
document.documentElement.dataset.theme = initialTheme;
if (document.body) {
  document.body.dataset.theme = initialTheme;
  if (initialScanlines) document.body.classList.add('cyber-scanlines');
}

const state = {
  files: cachedFiles,
  loading: cachedFiles.length === 0,
  uploadProgress: null as { current: number, total: number } | null,
  currentSort: 'date_desc' as SortField,
  selectedCategory: 'all' as FileCategory,
  searchQuery: '',
  activeAudioFile: null as FileData | null,
  isSelectionMode: false,
  selectedFileNames: new Set<string>(),
  isDeletingBulk: false,
  fileToRename: null as FileData | null,
  filesToDelete: null as string[] | null,
  previewFile: null as FileData | null,
  previewBg: 'checker' as 'checker' | 'light' | 'dark',
  previewZoom: 1, // 1 = fit, 100 = 1:1, 2 = 2x, etc.
  previewPixelated: false,
  previewDimensions: null as { width: number, height: number } | null,
  theme: initialTheme,
  scanlinesEnabled: initialScanlines,
  compactGrid: initialCompact,
  isSettingsOpen: false,
  isCategoryMenuOpen: false,
  isSortMenuOpen: false,
  isMobileSearchOpen: false,
};

// Derived getters
function getFilteredAndSorted() {
  let result = [...state.files];
  if (state.selectedCategory !== 'all') {
    result = result.filter(f => getFileCategory(f.name) === state.selectedCategory);
  }
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    result = result.filter(f => cleanDisplayName(f.name).toLowerCase().includes(q));
  }
  result.sort((a, b) => {
    switch (state.currentSort) {
      case 'date_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name_asc': return cleanDisplayName(a.name).localeCompare(cleanDisplayName(b.name));
      case 'name_desc': return cleanDisplayName(b.name).localeCompare(cleanDisplayName(a.name));
      case 'size_desc': return (b.metadata?.size || 0) - (a.metadata?.size || 0);
      case 'size_asc': return (a.metadata?.size || 0) - (b.metadata?.size || 0);
      default: return 0;
    }
  });
  return result;
}

function getCategoryCounts() {
  const counts = { all: state.files.length, image: 0, video: 0, audio: 0, document: 0, other: 0 };
  state.files.forEach(f => {
    const cat = getFileCategory(f.name);
    if (cat in counts) (counts as any)[cat]++;
  });
  return counts;
}

function getTotalStorageBytes() {
  return state.files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
}

// DOM updating
function updateDOM() {
  // Sync theme to root DOM
  document.documentElement.dataset.theme = state.theme;
  if (document.body) {
    document.body.dataset.theme = state.theme;
    if (state.scanlinesEnabled) {
      document.body.classList.add('cyber-scanlines');
    } else {
      document.body.classList.remove('cyber-scanlines');
    }
  }

  const counts = getCategoryCounts();
  const filtered = getFilteredAndSorted();
  const totalBytes = getTotalStorageBytes();
  const totalFiles = state.files.length;

  // Header Controls
  const headerControls = document.getElementById('header-controls');
  if (headerControls) headerControls.innerHTML = renderHeaderControls(state, totalBytes, totalFiles, counts);

  // Sidebar
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.innerHTML = renderSidebar(state, counts, totalBytes, totalFiles);

  // Search clear desktop button visibility
  const clearSearchDesktop = document.getElementById('clear-search-desktop');
  if (clearSearchDesktop) {
    if (state.searchQuery) clearSearchDesktop.classList.remove('hidden');
    else clearSearchDesktop.classList.add('hidden');
  }

  // Mobile Search Bar Drawer synchronization
  const mobileSearchBar = document.getElementById('mobile-search-bar');
  if (mobileSearchBar) {
    if (state.isMobileSearchOpen) {
      mobileSearchBar.classList.remove('hidden');
    } else {
      mobileSearchBar.classList.add('hidden');
    }
  }
  const clearSearchMobile = document.getElementById('clear-search-mobile');
  if (clearSearchMobile) {
    if (state.searchQuery) clearSearchMobile.classList.remove('hidden');
    else clearSearchMobile.classList.add('hidden');
  }

  // Workspace Header
  const workspaceHeader = document.getElementById('workspace-header');
  if (workspaceHeader) {
    workspaceHeader.innerHTML = `
      <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-[11px] font-mono">
          ${state.isSelectionMode ? `
            <span class="cyber-btn-chamfer cyber-btn-solid-accent px-2 py-0.5 text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_12px_var(--c-accent-glow)]">
              <span class="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span> MODE MULTI-SELECT: ${state.selectedFileNames.size} DIPILIH
            </span>
          ` : `
            <div class="flex items-center gap-1.5 text-[var(--c-text-muted)] flex-wrap">
              <span>Berkas: <strong class="text-[var(--c-accent)]">${filtered.length}</strong>/${totalFiles}</span>
              ${state.selectedCategory !== 'all' ? `<span class="px-1.5 py-0.5 rounded bg-[var(--c-surface-card)] border border-[var(--c-border)] text-[var(--c-secondary)] font-bold uppercase text-[9px]">// ${state.selectedCategory}</span>` : ''}
              ${state.searchQuery ? `<span class="px-1.5 py-0.5 rounded bg-[var(--c-surface-card)] border border-[var(--c-border)] text-[var(--c-accent)] text-[9px]">// "${state.searchQuery}"</span>` : ''}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // File Grid
  const fileGrid = document.getElementById('file-grid');
  if (fileGrid) {
    if (state.compactGrid) {
      fileGrid.classList.add('file-grid-compact');
    } else {
      fileGrid.classList.remove('file-grid-compact');
    }

    if (state.loading && state.files.length === 0) {
      fileGrid.innerHTML = `
        <div class="col-span-full py-20 flex flex-col items-center justify-center text-[var(--c-text-muted)] font-mono">
          <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-[var(--c-accent)] mb-3"></i>
          <p class="text-xs font-medium tracking-wide">MEMUAT BERKAS VAULT...</p>
        </div>
      `;
    } else if (filtered.length === 0) {
      fileGrid.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center text-[var(--c-text-muted)] text-center px-4 font-mono">
          <div class="w-14 h-14 rounded-2xl bg-[var(--c-surface-card)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-text-muted)] mb-3 shadow-[0_0_15px_var(--c-accent-glow)]">
            <i data-lucide="folder-open" class="w-7 h-7 text-[var(--c-accent)]"></i>
          </div>
          <p class="text-sm font-bold text-[var(--c-text-main)] mb-1 uppercase tracking-wider">Tidak ada berkas ditemukan</p>
          <p class="text-[11px] text-[var(--c-text-muted)] max-w-sm">Tarik dan lepas berkas ke area ini atau tekan UPLOAD untuk menambahkan berkas.</p>
        </div>
      `;
    } else {
      fileGrid.innerHTML = filtered.map((f, i) => renderFileCard(f, i, state)).join('');
    }
  }

  // Bulk Action Bar
  const bulkBar = document.getElementById('bulk-action-bar');
  if (bulkBar) {
    if (state.isSelectionMode) {
      bulkBar.classList.remove('hidden');
      const sc = state.selectedFileNames.size;
      const tc = filtered.length;
      bulkBar.innerHTML = `
        <div class="flex items-center gap-2 font-mono">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--c-accent)] shadow-[0_0_10px_var(--c-accent)] animate-pulse"></span>
          <span class="text-xs font-bold whitespace-nowrap text-[var(--c-text-main)]"><span class="text-[var(--c-accent)] text-sm">${sc}</span> / ${tc} dipilih</span>
        </div>
        <div class="flex items-center gap-1.5 font-mono flex-wrap justify-end">
          ${sc === tc ? `
            <button type="button" id="deselect-all-btn" class="cyber-btn-chamfer cyber-btn-solid-surface px-2.5 py-1 text-xs font-bold flex items-center gap-1 hover:border-white transition-colors" title="Batal Pilih Semua"><i data-lucide="square" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Batal Semua</span></button>
          ` : `
            <button type="button" id="select-all-btn" class="cyber-btn-chamfer cyber-btn-solid-surface px-2.5 py-1 text-xs font-bold flex items-center gap-1 text-[var(--c-accent)] hover:border-[var(--c-accent)] transition-colors" title="Pilih Semua"><i data-lucide="check-square" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Pilih Semua</span></button>
          `}
          <button type="button" id="bulk-download-btn" class="cyber-btn-chamfer px-3 py-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${sc === 0 ? 'opacity-40 pointer-events-none' : ''}" title="Unduh Semua File Terpilih"><i data-lucide="download" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Unduh</span> (${sc})</button>
          <button type="button" id="bulk-delete-btn" class="cyber-btn-chamfer px-3 py-1 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${sc === 0 || state.isDeletingBulk ? 'opacity-40 pointer-events-none' : ''}" title="Hapus File Terpilih"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i><span>Hapus</span></button>
          <button type="button" id="close-select-mode" class="cyber-btn-chamfer cyber-btn-solid-surface px-2 py-1 text-xs text-[var(--c-text-muted)] hover:text-white ml-0.5 font-bold" title="Selesai mode pilih (Esc)">✕ Selesai</button>
        </div>
      `;
    } else {
      bulkBar.classList.add('hidden');
    }
  }

  // Rename Modal
  const renameModal = document.getElementById('rename-modal');
  if (renameModal) {
    if (state.fileToRename) {
      renameModal.classList.remove('hidden');
      const ext = getFileExtension(state.fileToRename.name);
      const clean = cleanDisplayName(state.fileToRename.name);
      const baseName = ext && clean.toLowerCase().endsWith('.' + ext.toLowerCase()) ? clean.slice(0, -(ext.length + 1)) : clean;
      
      renameModal.innerHTML = `
        <div class="w-full max-w-md bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-5 shadow-2xl space-y-4 text-[var(--c-text-main)] animate-in zoom-in-95 duration-150 mx-2 font-mono">
          <div class="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
            <div class="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
              <div class="p-1.5 rounded-lg bg-[var(--c-accent)]/20 text-[var(--c-accent)] border border-[var(--c-accent)]/40"><i data-lucide="edit-3" class="w-4 h-4"></i></div>
              <span>Ubah Nama File</span>
            </div>
            <button type="button" id="close-rename" class="p-1 rounded-md text-[var(--c-text-muted)] hover:text-white hover:bg-[var(--c-surface-hover)] transition-colors" title="Tutup (Esc)"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>
          <form id="rename-form" class="space-y-3.5">
            <div>
              <label class="block text-[11px] font-medium text-[var(--c-text-muted)] mb-1">Nama File Baru</label>
              <div class="flex items-center gap-1.5">
                <input id="rename-input" type="text" value="${baseName}" class="flex-1 px-3 py-2 bg-black/50 border border-[var(--c-border)] focus:border-[var(--c-accent)] rounded-lg text-xs text-[var(--c-text-main)] placeholder-slate-500 focus:outline-none shadow-inner" />
                ${ext ? `<span class="px-2.5 py-2 bg-[var(--c-surface-card)] border border-[var(--c-border)] rounded-lg text-xs font-mono font-semibold text-[var(--c-accent)]">.${ext}</span>` : ''}
              </div>
              <p class="text-[10px] text-[var(--c-text-muted)] mt-1 truncate">Nama Asli: ${clean}</p>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-[var(--c-border)]">
              <button type="button" id="cancel-rename" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[var(--c-text-muted)] hover:text-white hover:bg-[var(--c-surface-hover)] transition-colors">Batal</button>
              <button type="submit" class="cyber-accent-btn px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-all"><i data-lucide="check" class="w-3.5 h-3.5"></i> Simpan Perubahan</button>
            </div>
          </form>
        </div>
      `;
      setTimeout(() => { document.getElementById('rename-input')?.focus(); }, 50);
    } else {
      renameModal.classList.add('hidden');
    }
  }

  // Delete Confirmation Modal
  const deleteModal = document.getElementById('delete-modal');
  if (deleteModal) {
    if (state.filesToDelete && state.filesToDelete.length > 0) {
      deleteModal.classList.remove('hidden');
      const count = state.filesToDelete.length;
      const isBulk = count > 1;
      const singleFileName = state.filesToDelete[0];
      const singleDisplayName = cleanDisplayName(singleFileName);
      
      deleteModal.innerHTML = `
        <div class="w-full max-w-sm bg-[var(--c-surface)] border border-rose-500/40 rounded-2xl p-5 shadow-2xl space-y-4 text-[var(--c-text-main)] animate-in zoom-in-95 duration-150 mx-2 font-mono">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider">${isBulk ? `Hapus ${count} File?` : 'Hapus File?'}</h3>
                <p class="text-[11px] text-[var(--c-text-muted)] mt-1 leading-relaxed">
                  ${isBulk 
                    ? `Apakah Anda yakin ingin menghapus <span class="font-bold text-[var(--c-text-main)]">${count} file</span> terpilih?` 
                    : `Apakah Anda yakin ingin menghapus file <span class="font-semibold text-[var(--c-text-main)] break-all">"${singleDisplayName}"</span>?`}
                </p>
                <p class="text-[10px] text-rose-400 mt-1.5 font-bold">Tindakan ini permanen di CARIEARSA-CLOUD.</p>
              </div>
            </div>
            <button type="button" id="close-delete-modal-btn" class="p-1 rounded-lg text-[var(--c-text-muted)] hover:text-white hover:bg-[var(--c-surface-hover)] transition-colors shrink-0" title="Tutup (Esc)">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-[var(--c-border)]">
            <button type="button" id="cancel-delete-modal-btn" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[var(--c-text-muted)] hover:text-white hover:bg-[var(--c-surface-hover)] transition-colors">
              Batal
            </button>
            <button type="button" id="confirm-delete-modal-btn" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.4)] transition-all">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Hapus Sekarang</span>
            </button>
          </div>
        </div>
      `;
    } else {
      deleteModal.classList.add('hidden');
    }
  }

  // Universal Media Preview Modal
  const previewModal = document.getElementById('preview-modal');
  if (previewModal) {
    if (state.previewFile) {
      previewModal.classList.remove('hidden');
      const pFile = state.previewFile;
      const vName = cleanDisplayName(pFile.name);
      const isVid = isVideoFile(pFile.name);
      const isImg = isImageFile(pFile.name);
      const ext = getFileExtension(pFile.name).toLowerCase();
      const isPdf = ext === 'pdf';

      previewModal.innerHTML = `
        <div class="w-full max-w-4xl bg-[#0c1220] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-200 animate-in zoom-in-95 duration-150 mx-2 max-h-[92vh]">
          <!-- Modal Header -->
          <div class="flex flex-wrap items-center justify-between px-3 sm:px-5 py-2.5 bg-[#0a0f1c] border-b border-slate-800 gap-2">
            <div class="flex items-center gap-2.5 min-w-0 pr-2">
              <div class="p-1.5 rounded-lg ${isVid ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : isImg ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'} shrink-0">
                <i data-lucide="${isVid ? 'video' : isImg ? 'image' : isPdf ? 'file-text' : 'file'}" class="w-4 h-4"></i>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-sm" title="${vName}">${vName}</span>
                  ${state.previewDimensions ? `<span class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-sky-400 font-mono shrink-0">${state.previewDimensions.width} × ${state.previewDimensions.height} px</span>` : ''}
                </div>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>${formatFileSize(pFile.metadata?.size)}</span>
                  ${isImg && state.previewZoom !== 1 ? `<span class="text-amber-400 font-medium">Skala: ${state.previewZoom === 100 ? '1:1 Asli' : `${state.previewZoom}x`}</span>` : ''}
                  ${isImg && state.previewPixelated ? `<span class="text-sky-300 font-medium">(Crisp)</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Toolbar Controls -->
            <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
              ${isImg ? `
                <div class="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700/80 mr-1" title="Pilih Latar Belakang (Grid / Putih / Gelap)">
                  <button type="button" data-preview-bg="checker" class="px-2 py-1 rounded text-[10px] font-medium transition-all ${state.previewBg === 'checker' ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'}" title="Latar Belakang Kotak-kotak (Transparan)">
                    🏁 Grid
                  </button>
                  <button type="button" data-preview-bg="light" class="px-2 py-1 rounded text-[10px] font-medium transition-all ${state.previewBg === 'light' ? 'bg-white text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}" title="Latar Belakang Putih Terang">
                    ☀️ Putih
                  </button>
                  <button type="button" data-preview-bg="dark" class="px-2 py-1 rounded text-[10px] font-medium transition-all ${state.previewBg === 'dark' ? 'bg-slate-950 text-slate-200 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'}" title="Latar Belakang Gelap">
                    🌙 Gelap
                  </button>
                </div>

                <div class="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700/80 mr-1">
                  <button type="button" id="preview-zoom-out" class="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Perkecil (-)"><i data-lucide="zoom-out" class="w-3.5 h-3.5"></i></button>
                  <button type="button" id="preview-zoom-fit" class="px-1.5 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors ${state.previewZoom === 1 ? 'text-sky-400 font-bold' : ''}" title="Sesuaikan Layar">Fit</button>
                  <button type="button" id="preview-zoom-100" class="px-1.5 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors ${state.previewZoom === 100 ? 'text-sky-400 font-bold' : ''}" title="Ukuran 100% Asli (1:1)">1:1</button>
                  <button type="button" id="preview-zoom-2x" class="px-1.5 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors ${state.previewZoom === 2 ? 'text-sky-400 font-bold' : ''}" title="Perbesar 2x">2x</button>
                  <button type="button" id="preview-zoom-in" class="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Perbesar (+)"><i data-lucide="zoom-in" class="w-3.5 h-3.5"></i></button>
                  <button type="button" id="preview-toggle-pixelated" class="p-1 rounded transition-colors ${state.previewPixelated ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'}" title="Ketajaman Piksel">
                    <i data-lucide="scan-eye" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              ` : ''}

              <!-- Direct Download in Preview Modal -->
              <a href="${pFile.publicUrl}" download="${vName}" class="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm" title="Unduh File Langsung">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">Unduh</span>
              </a>

              <!-- Open in New Tab -->
              <a href="${pFile.publicUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors" title="Buka di tab baru">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>

              <!-- Close (X) button -->
              <button type="button" id="close-preview-modal-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 border border-slate-700/60 transition-colors ml-0.5" title="Tutup (Esc)">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Stage Viewport -->
          <div class="relative flex items-center justify-center p-3 sm:p-6 min-h-[300px] max-h-[74vh] overflow-auto select-none ${state.previewBg === 'checker' ? 'checkerboard-dark' : state.previewBg === 'light' ? 'bg-white' : 'bg-[#060911]'} transition-colors duration-200">
            ${isVid ? `
              <div class="relative w-full flex items-center justify-center bg-black/90 rounded-xl overflow-hidden shadow-xl">
                <video src="${pFile.publicUrl}" controls autoplay playsinline class="max-h-[70vh] max-w-full w-auto rounded-lg"></video>
              </div>
            ` : isImg ? `
              <div id="preview-image-container" class="relative flex items-center justify-center transition-transform duration-150 ${state.previewPixelated ? 'pixelated-render' : ''}" style="${state.previewZoom === 100 ? 'width:auto; height:auto;' : state.previewZoom !== 1 ? `transform: scale(${state.previewZoom}); transform-origin: center center;` : ''}">
                <img 
                  id="preview-active-image" 
                  src="${pFile.publicUrl}" 
                  alt="${vName}" 
                  class="${state.previewZoom === 100 ? 'max-none' : 'max-h-[66vh] max-w-full min-w-[64px] min-h-[64px] object-contain'} rounded-md drop-shadow-md select-none pointer-events-none" 
                />
              </div>
            ` : isPdf ? `
              <iframe src="${pFile.publicUrl}" class="w-full h-[68vh] rounded-xl border border-slate-700 bg-white"></iframe>
            ` : `
              <div class="p-8 text-center text-slate-400 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-xl max-w-md mx-auto">
                <i data-lucide="file-text" class="w-12 h-12 mx-auto mb-3 text-slate-500"></i>
                <p class="text-sm font-semibold text-slate-200">Pratinjau langsung tidak tersedia</p>
                <p class="text-xs text-slate-400 mt-1">Format ini dapat diunduh atau dibuka secara eksternal.</p>
                <div class="mt-4 flex items-center justify-center gap-2">
                  <a href="${pFile.publicUrl}" download="${vName}" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i> Unduh File
                  </a>
                  <a href="${pFile.publicUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700">
                    Buka Asli
                  </a>
                </div>
              </div>
            `}
          </div>
        </div>
      `;

      if (isImg) {
        setTimeout(() => {
          const imgEl = document.getElementById('preview-active-image') as HTMLImageElement;
          if (imgEl) {
            const checkDimensions = () => {
              if (imgEl.naturalWidth && imgEl.naturalHeight) {
                const nw = imgEl.naturalWidth;
                const nh = imgEl.naturalHeight;
                if (!state.previewDimensions || state.previewDimensions.width !== nw || state.previewDimensions.height !== nh) {
                  state.previewDimensions = { width: nw, height: nh };
                  if (nw <= 256 && nh <= 256 && state.previewZoom === 1) {
                    state.previewZoom = 2;
                    state.previewPixelated = true;
                  }
                  updateDOM();
                }
              }
            };
            if (imgEl.complete) {
              checkDimensions();
            } else {
              imgEl.onload = checkDimensions;
            }
          }
        }, 30);
      }
    } else {
      previewModal.classList.add('hidden');
    }
  }

  // Audio Player
  const audioPlayer = document.getElementById('audio-player');
  if (audioPlayer) {
    if (state.activeAudioFile) {
      audioPlayer.classList.remove('hidden', 'translate-y-full');
      audioPlayer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 font-mono">
          <div class="flex items-center gap-3 w-full sm:w-64 shrink-0">
            <div class="w-10 h-10 rounded-full bg-[var(--c-surface-card)] flex items-center justify-center shrink-0 border border-[var(--c-border)] shadow-[0_0_10px_var(--c-accent-glow)]">
              <i data-lucide="music" class="w-4 h-4 text-[var(--c-accent)]"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-[var(--c-text-main)] truncate">${cleanDisplayName(state.activeAudioFile.name)}</p>
              <p class="text-[10px] text-[var(--c-accent)] font-mono mt-0.5 truncate">${formatFileSize(state.activeAudioFile.metadata?.size)}</p>
            </div>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center w-full max-w-2xl gap-2">
            <div class="flex items-center gap-4">
              <button id="player-play-pause" class="w-9 h-9 rounded-full bg-[var(--c-accent)] hover:brightness-110 text-slate-950 flex items-center justify-center shadow-[0_0_12px_var(--c-accent-glow)] transition-transform active:scale-95">
                 <i data-lucide="${(window as any).isAudioPlaying ? 'pause' : 'play'}" class="w-4 h-4 fill-slate-950"></i>
              </button>
            </div>
            <div class="w-full flex items-center gap-2 text-[10px] text-[var(--c-text-muted)] font-mono">
              <span id="audio-time">0:00 / 0:00</span>
              <div id="audio-progress-bar" class="flex-1 h-1.5 bg-black/60 rounded-full cursor-pointer relative overflow-hidden group border border-[var(--c-border)]">
                <div id="audio-progress" class="absolute top-0 left-0 h-full bg-[var(--c-accent)] w-0 shadow-[0_0_8px_var(--c-accent)]"></div>
              </div>
            </div>
          </div>
          <div class="hidden sm:flex items-center justify-end w-32 shrink-0 gap-3">
             <button id="close-player" class="p-1.5 text-[var(--c-text-muted)] hover:text-white rounded-full hover:bg-[var(--c-surface-hover)]"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>
        </div>
      `;
    } else {
      audioPlayer.classList.add('translate-y-full');
      setTimeout(() => { if (!state.activeAudioFile) audioPlayer.classList.add('hidden'); }, 300);
    }
  }

  // Settings Modal
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    if (state.isSettingsOpen) {
      settingsModal.classList.remove('hidden');
      settingsModal.innerHTML = renderSettingsModal(state);
    } else {
      settingsModal.classList.add('hidden');
    }
  }

  createIcons({ icons });

  // Seek video thumbnails to second 1
  document.querySelectorAll<HTMLVideoElement>('video.video-preview-thumb').forEach((video) => {
    const setTime = () => {
      try {
        if (Math.abs(video.currentTime - 1) > 0.1) {
          video.currentTime = 1;
        }
      } catch (e) {}
    };

    if (video.readyState >= 1) {
      setTime();
    } else {
      video.addEventListener('loadedmetadata', setTime, { once: true });
    }

    video.addEventListener('seeked', () => {
      const fallback = video.parentElement?.querySelector('.video-fallback-icon') as HTMLElement;
      if (fallback) fallback.style.display = 'none';
    }, { once: true });
  });
}

// Helper: Show Toast
function showToast(text: string, type: 'success' | 'error' = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.className = `fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shadow-2xl backdrop-blur-md border animate-toast ${type === 'error' ? 'bg-rose-950/90 text-rose-200 border-rose-800' : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'}`;
  toast.innerHTML = `<i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle-2'}" class="w-3.5 h-3.5 ${type === 'error' ? 'text-rose-400' : 'text-emerald-400'}"></i><span>${text}</span>`;
  createIcons({ icons, root: toast });
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

// Synchronize Dropdown Menus without full-page DOM recreation
function syncDropdowns() {
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

  const sortMenu = document.getElementById('sort-dropdown-menu');
  const sortBtn = document.getElementById('sort-menu-button');
  if (sortMenu && sortBtn) {
    if (state.isSortMenuOpen) {
      sortMenu.classList.remove('hidden');
      sortMenu.classList.add('block');
      sortBtn.classList.add('cyber-btn-solid-accent', 'ring-2', 'ring-white/40');
      sortBtn.classList.remove('cyber-btn-solid-surface');
      const chev = sortBtn.querySelector('.sort-btn-chevron, [data-lucide="chevron-down"], svg.lucide-chevron-down');
      if (chev) {
        chev.classList.add('rotate-180', 'text-slate-950');
        chev.classList.remove('text-[var(--c-text-muted)]');
      }
      const icon = sortBtn.querySelector('.sort-btn-icon, [data-lucide="arrow-up-down"], svg.lucide-arrow-up-down');
      if (icon) {
        icon.classList.add('text-slate-950');
        icon.classList.remove('text-[var(--c-accent)]');
      }
      const label = sortBtn.querySelector('.sort-btn-label');
      if (label) {
        label.classList.add('text-slate-950', 'font-black');
        label.classList.remove('text-[var(--c-text-main)]');
      }
    } else {
      sortMenu.classList.add('hidden');
      sortMenu.classList.remove('block');
      sortBtn.classList.remove('cyber-btn-solid-accent', 'ring-2', 'ring-white/40');
      sortBtn.classList.add('cyber-btn-solid-surface');
      const chev = sortBtn.querySelector('.sort-btn-chevron, [data-lucide="chevron-down"], svg.lucide-chevron-down');
      if (chev) {
        chev.classList.remove('rotate-180', 'text-slate-950');
        chev.classList.add('text-[var(--c-text-muted)]');
      }
      const icon = sortBtn.querySelector('.sort-btn-icon, [data-lucide="arrow-up-down"], svg.lucide-arrow-up-down');
      if (icon) {
        icon.classList.remove('text-slate-950');
        icon.classList.add('text-[var(--c-accent)]');
      }
      const label = sortBtn.querySelector('.sort-btn-label');
      if (label) {
        label.classList.remove('text-slate-950', 'font-black');
        label.classList.add('text-[var(--c-text-main)]');
      }
    }
  }
}

// Setup App Events
let hasSetupEvents = false;
function setupEvents() {
  if (hasSetupEvents) return;
  hasSetupEvents = true;
  const globalAudio = document.getElementById('global-audio') as HTMLAudioElement;

  // Search input delegation
  document.body.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'search-input-desktop' || target.id === 'search-input-mobile') {
      state.searchQuery = (target as HTMLInputElement).value;
      const otherId = target.id === 'search-input-desktop' ? 'search-input-mobile' : 'search-input-desktop';
      const other = document.getElementById(otherId) as HTMLInputElement;
      if (other && other.value !== state.searchQuery) other.value = state.searchQuery;
      updateDOM();
    }
  });

  // Event Delegation for clicks
  document.body.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    // 1. CLEAR SEARCH
    if (target.closest('#clear-search-desktop') || target.closest('#clear-search-mobile')) {
      e.preventDefault(); e.stopPropagation();
      state.searchQuery = '';
      const d = document.getElementById('search-input-desktop') as HTMLInputElement;
      if (d) d.value = '';
      const m = document.getElementById('search-input-mobile') as HTMLInputElement;
      if (m) m.value = '';
      updateDOM();
      return;
    }

    // 2. MODAL BACKDROP CLICKS
    if (target.id === 'settings-modal') {
      state.isSettingsOpen = false;
      updateDOM();
      return;
    }
    if (target.id === 'delete-modal') {
      state.filesToDelete = null;
      updateDOM();
      return;
    }
    if (target.id === 'rename-modal') {
      state.fileToRename = null;
      updateDOM();
      return;
    }
    if (target.id === 'preview-modal') {
      state.previewFile = null;
      updateDOM();
      return;
    }

    // 3. SETTINGS MODAL OPEN & CLOSE
    if (target.closest('#open-settings-btn') || target.closest('#sidebar-settings-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.isSettingsOpen = true;
      updateDOM();
      return;
    }
    if (target.closest('#close-settings-btn') || target.closest('#done-settings-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.isSettingsOpen = false;
      updateDOM();
      return;
    }

    // THEME VARIANT SELECTION
    const themeBtn = target.closest('.theme-select-btn') as HTMLElement;
    if (themeBtn) {
      e.preventDefault(); e.stopPropagation();
      const themeId = themeBtn.dataset.themeId;
      if (themeId) {
        state.theme = themeId;
        localStorage.setItem('cariearsa_cloud_theme', themeId);
        const themeObj = THEME_VARIANTS.find(t => t.id === themeId);
        showToast(`Tema diaktifkan: ${themeObj?.name || themeId}`, 'success');
        updateDOM();
      }
      return;
    }

    // SCANLINES TOGGLE
    if (target.closest('#toggle-scanlines-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.scanlinesEnabled = !state.scanlinesEnabled;
      localStorage.setItem('cariearsa_cloud_scanlines', String(state.scanlinesEnabled));
      updateDOM();
      return;
    }

    // COMPACT GRID TOGGLE
    if (target.closest('#toggle-compact-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.compactGrid = !state.compactGrid;
      localStorage.setItem('cariearsa_cloud_compact', String(state.compactGrid));
      updateDOM();
      return;
    }

    // 4. CLOSE (x) AND CANCEL BUTTONS
    if (target.closest('#close-delete-modal-btn') || target.closest('#cancel-delete-modal-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.filesToDelete = null;
      updateDOM();
      return;
    }
    if (target.closest('#close-rename') || target.closest('#cancel-rename')) {
      e.preventDefault(); e.stopPropagation();
      state.fileToRename = null;
      updateDOM();
      return;
    }
    if (target.closest('#close-preview-modal-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.previewFile = null;
      updateDOM();
      return;
    }

    // Preview Background Switcher
    const bgBtn = target.closest('[data-preview-bg]') as HTMLElement;
    if (bgBtn) {
      e.preventDefault(); e.stopPropagation();
      state.previewBg = bgBtn.dataset.previewBg as any;
      updateDOM();
      return;
    }

    // Preview Zoom / Scale Controls
    if (target.closest('#preview-zoom-in')) {
      e.preventDefault(); e.stopPropagation();
      const cur = state.previewZoom === 100 ? 1 : state.previewZoom;
      state.previewZoom = Math.min(8, Number((cur + (cur >= 2 ? 1 : 0.5)).toFixed(1)));
      updateDOM();
      return;
    }
    if (target.closest('#preview-zoom-out')) {
      e.preventDefault(); e.stopPropagation();
      const cur = state.previewZoom === 100 ? 1 : state.previewZoom;
      state.previewZoom = Math.max(0.5, Number((cur - (cur > 2 ? 1 : 0.5)).toFixed(1)));
      updateDOM();
      return;
    }
    if (target.closest('#preview-zoom-fit')) {
      e.preventDefault(); e.stopPropagation();
      state.previewZoom = 1;
      updateDOM();
      return;
    }
    if (target.closest('#preview-zoom-100')) {
      e.preventDefault(); e.stopPropagation();
      state.previewZoom = 100;
      updateDOM();
      return;
    }
    if (target.closest('#preview-zoom-2x')) {
      e.preventDefault(); e.stopPropagation();
      state.previewZoom = 2;
      updateDOM();
      return;
    }
    if (target.closest('#preview-toggle-pixelated')) {
      e.preventDefault(); e.stopPropagation();
      state.previewPixelated = !state.previewPixelated;
      updateDOM();
      return;
    }

    // Close Select Mode
    if (target.closest('#close-select-mode')) {
      e.preventDefault(); e.stopPropagation();
      state.isSelectionMode = false;
      state.selectedFileNames.clear();
      updateDOM();
      return;
    }

    // Close Audio Player
    if (target.closest('#close-player')) {
      e.preventDefault(); e.stopPropagation();
      globalAudio.pause();
      state.activeAudioFile = null;
      (window as any).isAudioPlaying = false;
      updateDOM();
      return;
    }

    // 4. CONFIRM DELETE ACTION
    if (target.closest('#confirm-delete-modal-btn')) {
      e.preventDefault(); e.stopPropagation();
      if (state.filesToDelete && state.filesToDelete.length > 0) {
        deleteFiles(state.filesToDelete);
      }
      return;
    }

    // 5. BULK DELETE TRIGGER
    if (target.closest('#bulk-delete-btn') && !state.isDeletingBulk) {
      e.preventDefault(); e.stopPropagation();
      if (state.selectedFileNames.size > 0) {
        state.filesToDelete = Array.from(state.selectedFileNames);
        updateDOM();
      }
      return;
    }

    // Download button click - stop propagation
    if (target.closest('.download-btn')) {
      e.stopPropagation();
      return;
    }

    // 6. CARD ACTION BUTTONS
    const delBtn = target.closest('.delete-btn');
    if (delBtn) {
      e.preventDefault(); e.stopPropagation();
      const card = delBtn.closest('.file-card') as HTMLElement;
      const name = card?.dataset.name;
      if (name) {
        state.filesToDelete = [name];
        updateDOM();
      }
      return;
    }

    const renBtn = target.closest('.rename-btn');
    if (renBtn) {
      e.preventDefault(); e.stopPropagation();
      const card = renBtn.closest('.file-card') as HTMLElement;
      const name = card?.dataset.name;
      if (name) {
        state.fileToRename = state.files.find(f => f.name === name) || null;
        updateDOM();
      }
      return;
    }

    const prevVidBtn = target.closest('.preview-video-btn');
    if (prevVidBtn) {
      e.preventDefault(); e.stopPropagation();
      const card = prevVidBtn.closest('.file-card') as HTMLElement;
      const name = card?.dataset.name;
      if (name) {
        const file = state.files.find(f => f.name === name);
        if (file) {
          state.previewFile = file;
          state.previewZoom = 1;
          state.previewDimensions = null;
          updateDOM();
        }
      }
      return;
    }

    const playBtn = target.closest('.play-btn');
    if (playBtn) {
      e.preventDefault(); e.stopPropagation();
      const card = playBtn.closest('.file-card') as HTMLElement;
      const name = card?.dataset.name;
      if (name) {
        if (state.activeAudioFile?.name === name) {
          if (!globalAudio.paused) { globalAudio.pause(); (window as any).isAudioPlaying = false; }
          else { globalAudio.play(); (window as any).isAudioPlaying = true; }
        } else {
          const file = state.files.find(f => f.name === name);
          state.activeAudioFile = file || null;
          if (file) { globalAudio.src = file.publicUrl; globalAudio.play(); (window as any).isAudioPlaying = true; }
        }
        updateDOM();
      }
      return;
    }

    // Checkbox in selection mode
    const chk = target.closest('.select-checkbox');
    if (chk) {
      e.preventDefault(); e.stopPropagation();
      const card = chk.closest('.file-card') as HTMLElement;
      const name = card?.dataset.name;
      if (name) {
        if (state.selectedFileNames.has(name)) state.selectedFileNames.delete(name);
        else state.selectedFileNames.add(name);
        updateDOM();
      }
      return;
    }

    // 7. WHOLE FILE CARD CLICK
    const card = target.closest('.file-card') as HTMLElement;
    if (card) {
      const name = card.dataset.name!;

      if (justTriggeredLongPress) {
        e.preventDefault();
        e.stopPropagation();
        justTriggeredLongPress = false;
        return;
      }

      if (state.isSelectionMode) {
        e.preventDefault();
        if (state.selectedFileNames.has(name)) state.selectedFileNames.delete(name);
        else state.selectedFileNames.add(name);
        updateDOM();
        return;
      }

      if (!state.isSelectionMode) {
        const file = state.files.find(f => f.name === name);
        if (file) {
          if (isVideoFile(file.name) || isImageFile(file.name) || getFileExtension(file.name).toLowerCase() === 'pdf') {
            e.preventDefault();
            state.previewFile = file;
            state.previewZoom = 1;
            state.previewDimensions = null;
            updateDOM();
            return;
          } else if (isAudioFile(file.name)) {
            e.preventDefault();
            if (state.activeAudioFile?.name === name) {
              if (!globalAudio.paused) { globalAudio.pause(); (window as any).isAudioPlaying = false; }
              else { globalAudio.play(); (window as any).isAudioPlaying = true; }
            } else {
              state.activeAudioFile = file;
              globalAudio.src = file.publicUrl;
              globalAudio.play();
              (window as any).isAudioPlaying = true;
            }
            updateDOM();
            return;
          }
        }
      }
    }

    // 8. DROPDOWNS & MENUS
    if (target.closest('#category-menu-button')) {
      e.preventDefault(); e.stopPropagation();
      state.isCategoryMenuOpen = !state.isCategoryMenuOpen;
      state.isSortMenuOpen = false;
      syncDropdowns();
      return;
    }
    if (target.closest('#sort-menu-button')) {
      e.preventDefault(); e.stopPropagation();
      state.isSortMenuOpen = !state.isSortMenuOpen;
      state.isCategoryMenuOpen = false;
      syncDropdowns();
      return;
    }

    // Close open menus when clicking outside
    if (state.isCategoryMenuOpen && !target.closest('#category-dropdown-container')) {
      state.isCategoryMenuOpen = false;
      syncDropdowns();
    }
    if (state.isSortMenuOpen && !target.closest('#sort-dropdown-container')) {
      state.isSortMenuOpen = false;
      syncDropdowns();
    }

    // Category selection (dropdown options, sidebar buttons, and mobile pills)
    const catBtn = target.closest('.category-option-btn, .sidebar-category-btn') as HTMLElement;
    if (catBtn) {
      e.preventDefault(); e.stopPropagation();
      state.selectedCategory = catBtn.dataset.category as any;
      state.isCategoryMenuOpen = false;
      state.isSortMenuOpen = false;
      updateDOM();
      return;
    }

    // Sort selection
    const sortBtn = target.closest('.sort-option-btn') as HTMLElement;
    if (sortBtn) {
      e.preventDefault(); e.stopPropagation();
      state.currentSort = sortBtn.dataset.sort as any;
      state.isSortMenuOpen = false;
      state.isCategoryMenuOpen = false;
      updateDOM();
      return;
    }

    // Mobile Search Bar Toggle & Close
    if (target.closest('#mobile-search-toggle')) {
      e.preventDefault(); e.stopPropagation();
      state.isMobileSearchOpen = !state.isMobileSearchOpen;
      updateDOM();
      if (state.isMobileSearchOpen) {
        setTimeout(() => {
          (document.getElementById('search-input-mobile') as HTMLInputElement)?.focus();
        }, 60);
      }
      return;
    }
    if (target.closest('#close-mobile-search')) {
      e.preventDefault(); e.stopPropagation();
      state.isMobileSearchOpen = false;
      updateDOM();
      return;
    }

    // 9. TOOLBAR & MULTI-SELECT CONTROLS
    if (target.closest('#toggle-selection-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.isSelectionMode = !state.isSelectionMode;
      if (!state.isSelectionMode) state.selectedFileNames.clear();
      state.isCategoryMenuOpen = false;
      state.isSortMenuOpen = false;
      updateDOM();
      return;
    }

    if (target.closest('#close-select-mode')) {
      e.preventDefault(); e.stopPropagation();
      state.isSelectionMode = false;
      state.selectedFileNames.clear();
      updateDOM();
      return;
    }

    if (target.closest('#refresh-files-btn')) {
      e.preventDefault(); e.stopPropagation();
      fetchFiles();
      return;
    }

    if (target.closest('#select-all-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.selectedFileNames = new Set(getFilteredAndSorted().map(f => f.name));
      updateDOM();
      return;
    }
    if (target.closest('#deselect-all-btn')) {
      e.preventDefault(); e.stopPropagation();
      state.selectedFileNames.clear();
      updateDOM();
      return;
    }

    // Bulk Download
    if (target.closest('#bulk-download-btn')) {
      e.preventDefault(); e.stopPropagation();
      const filesToDl = state.files.filter(f => state.selectedFileNames.has(f.name));
      if (filesToDl.length === 0) return;
      showToast(`Mengunduh ${filesToDl.length} berkas terpilih...`, 'success');
      filesToDl.forEach((f, idx) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = `/api/files/download?name=${encodeURIComponent(f.name)}`;
          a.download = cleanDisplayName(f.name);
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, idx * 250);
      });
      return;
    }

    // 10. AUDIO PLAYER BAR CONTROLS
    if (target.closest('#player-play-pause')) {
      e.preventDefault(); e.stopPropagation();
      if (globalAudio.paused) { globalAudio.play(); (window as any).isAudioPlaying = true; }
      else { globalAudio.pause(); (window as any).isAudioPlaying = false; }
      updateDOM();
      return;
    }
    if (target.closest('#audio-progress-bar')) {
      const bar = target.closest('#audio-progress-bar') as HTMLElement;
      const rect = bar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      globalAudio.currentTime = Math.max(0, Math.min(1, pos)) * (globalAudio.duration || 0);
      return;
    }
  });

  // Rename Submit Form
  document.body.addEventListener('submit', async (e) => {
    const form = e.target as HTMLFormElement;
    if (form.id === 'rename-form') {
      e.preventDefault();
      const input = document.getElementById('rename-input') as HTMLInputElement;
      const newName = input.value.trim();
      if (!newName || !state.fileToRename) return;
      const oldName = state.fileToRename.name;
      const ext = getFileExtension(oldName);
      let targetName = newName.replace(/[/\\?%*:|"<>]/g, '_');
      if (ext && !targetName.toLowerCase().endsWith('.'+ext.toLowerCase())) targetName += `.${ext}`;
      const prefix = oldName.match(/^(\d+_)/)?.[1] || '';
      targetName = prefix + targetName;
      
      if (targetName !== oldName) {
        await renameFile(oldName, targetName);
      }
      state.fileToRename = null;
      updateDOM();
    }
  });

  // Long-press / Hold gesture for multi-select
  let pressTimer: any = null;
  let startCoords = { x: 0, y: 0 };
  let justTriggeredLongPress = false;
  let activePressCard: HTMLElement | null = null;

  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (activePressCard) {
      activePressCard.classList.remove('touch-press-active');
      activePressCard = null;
    }
  };

  document.body.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Don't trigger long press if interacting with buttons, modals, form inputs, or checkbox
    if (target.closest('button, a, input, select, textarea, #rename-modal, #delete-modal, #preview-modal, .select-checkbox, #audio-player-bar, #settings-modal')) {
      return;
    }
    const card = target.closest('.file-card') as HTMLElement;
    if (!card) return;

    cancelPress();
    startCoords = { x: e.clientX, y: e.clientY };
    activePressCard = card;
    card.classList.add('touch-press-active');

    pressTimer = setTimeout(() => {
      justTriggeredLongPress = true;
      cancelPress();
      if (navigator.vibrate) {
        try { navigator.vibrate(40); } catch (_) {}
      }
      state.isSelectionMode = true;
      const name = card.dataset.name!;
      state.selectedFileNames.add(name);
      updateDOM();

      // Suppress immediate card click handling
      setTimeout(() => {
        justTriggeredLongPress = false;
      }, 350);
    }, 320);
  });

  document.body.addEventListener('pointermove', (e) => {
    if (pressTimer) {
      if (Math.hypot(e.clientX - startCoords.x, e.clientY - startCoords.y) > 12) {
        cancelPress();
      }
    }
  });

  document.body.addEventListener('pointerup', () => { cancelPress(); });
  document.body.addEventListener('pointercancel', () => { cancelPress(); });

  // Desktop context menu toggle selection mode
  document.body.addEventListener('contextmenu', (e) => {
    const card = (e.target as HTMLElement).closest('.file-card') as HTMLElement;
    if (card) {
      e.preventDefault();
      state.isSelectionMode = true;
      const name = card.dataset.name!;
      if (state.selectedFileNames.has(name)) {
        state.selectedFileNames.delete(name);
      } else {
        state.selectedFileNames.add(name);
      }
      updateDOM();
    }
  });

  // Global Keyboard Shortcuts (Escape)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.isSettingsOpen) {
        state.isSettingsOpen = false;
        updateDOM();
        return;
      }
      if (state.previewFile) {
        state.previewFile = null;
        updateDOM();
        return;
      }
      if (state.filesToDelete) {
        state.filesToDelete = null;
        updateDOM();
        return;
      }
      if (state.fileToRename) {
        state.fileToRename = null;
        updateDOM();
        return;
      }
      if (state.isSelectionMode) {
        state.isSelectionMode = false;
        state.selectedFileNames.clear();
        updateDOM();
        return;
      }
    }
  });

  // Global Audio Time Update
  globalAudio.addEventListener('timeupdate', () => {
    const timeDisplay = document.getElementById('audio-time');
    const prog = document.getElementById('audio-progress');
    const fmt = (t:number) => `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2, '0')}`;
    if (timeDisplay) timeDisplay.innerText = `${fmt(globalAudio.currentTime)} / ${fmt(globalAudio.duration || 0)}`;
    if (prog && globalAudio.duration) prog.style.width = `${(globalAudio.currentTime/globalAudio.duration)*100}%`;
  });
  globalAudio.addEventListener('ended', () => { (window as any).isAudioPlaying = false; updateDOM(); });

  // Drag and drop overlay
  let dragCount = 0;
  const overlay = document.getElementById('drop-overlay')!;
  document.body.addEventListener('dragenter', e => { e.preventDefault(); dragCount++; if(e.dataTransfer?.items.length) overlay.classList.remove('hidden', 'pointer-events-none'); });
  document.body.addEventListener('dragleave', e => { e.preventDefault(); dragCount--; if(dragCount===0) overlay.classList.add('hidden', 'pointer-events-none'); });
  document.body.addEventListener('dragover', e => e.preventDefault());
  document.body.addEventListener('drop', e => { e.preventDefault(); dragCount=0; overlay.classList.add('hidden', 'pointer-events-none'); if(e.dataTransfer?.files.length) uploadFiles(Array.from(e.dataTransfer.files)); });
}

// Global upload handler for the file input
(window as any).handleUploadInput = (e: any) => { if(e.target.files?.length) uploadFiles(Array.from(e.target.files)); };

// Resilient API Functions with Direct Supabase Fallback
async function fetchFiles(showLoading = true) {
  if (showLoading) {
    state.loading = true;
    updateDOM();
  }

  // 1. Try server API
  try {
    const res = await fetch('/api/files');
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
  } catch (_) {}

  // 2. Direct Supabase Storage fallback if valid JWT
  if (typeof SUPABASE_KEY === 'string' && SUPABASE_KEY.startsWith('eyJ')) {
    try {
      const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (!error && data) {
        const files = data.filter((f) => f.name !== '.emptyFolderPlaceholder');
        state.files = files.map((file) => {
          const { data: urlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(file.name);
          return {
            ...file,
            publicUrl: urlData.publicUrl,
          };
        });
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(state.files));
        } catch (_) {}
      } else if (state.files.length === 0) {
        showToast('Gagal memuat file', 'error');
      }
    } catch(e) {
      if (state.files.length === 0) {
        showToast('Gagal memuat file', 'error');
      }
    }
  }

  state.loading = false;
  updateDOM();
}

async function uploadFiles(files: File[]) {
  if (!files.length) return;
  state.uploadProgress = { current: 0, total: files.length };
  updateDOM();
  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    state.uploadProgress.current = i + 1;
    updateDOM();
    const file = files[i];

    // Try server API first
    let uploaded = false;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        successCount++;
        uploaded = true;
      }
    } catch (_) {}

    // If server upload failed, fallback to direct Supabase upload
    if (!uploaded) {
      try {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error } = await supabaseClient.storage.from(BUCKET_NAME).upload(fileName, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });
        if (!error) {
          successCount++;
        }
      } catch (_) {}
    }
  }

  state.uploadProgress = null;
  if (successCount > 0) {
    showToast(`${successCount} file berhasil diunggah`, 'success');
    fetchFiles(false);
  } else {
    showToast('Gagal unggah file', 'error');
    updateDOM();
  }
}

async function deleteFiles(filenames: string[]) {
  if (!filenames.length) return;
  state.isDeletingBulk = true;
  state.filesToDelete = null;

  // Optimistic UI update
  const deleteSet = new Set(filenames);
  state.files = state.files.filter(f => !deleteSet.has(f.name));
  filenames.forEach(fn => state.selectedFileNames.delete(fn));
  if (state.activeAudioFile && deleteSet.has(state.activeAudioFile.name)) {
    state.activeAudioFile = null;
    const globalAudio = document.getElementById('global-audio') as HTMLAudioElement;
    if (globalAudio) globalAudio.pause();
  }
  if (state.selectedFileNames.size === 0) {
    state.isSelectionMode = false;
  }
  updateDOM();

  // Try server delete
  let deleted = false;
  try {
    const res = await fetch('/api/files/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames })
    });
    if (res.ok) {
      deleted = true;
    }
  } catch (_) {}

  // Direct Supabase fallback
  if (!deleted) {
    try {
      const { error } = await supabaseClient.storage.from(BUCKET_NAME).remove(filenames);
      if (!error) {
        deleted = true;
      }
    } catch (_) {}
  }

  state.isDeletingBulk = false;
  if (deleted) {
    showToast(`${filenames.length} file berhasil dihapus`, 'success');
    fetchFiles(false);
  } else {
    showToast('Gagal menghapus file', 'error');
    fetchFiles(false);
  }
}

async function renameFile(oldFilename: string, newFilename: string) {
  let renamed = false;
  try {
    const res = await fetch('/api/files/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldFilename, newFilename })
    });
    if (res.ok) {
      renamed = true;
    }
  } catch (_) {}

  if (!renamed) {
    try {
      const { error } = await supabaseClient.storage.from(BUCKET_NAME).move(oldFilename, newFilename);
      if (!error) {
        renamed = true;
      }
    } catch (_) {}
  }

  if (renamed) {
    showToast('Nama file berhasil diubah', 'success');
    fetchFiles(false);
  } else {
    showToast('Gagal mengubah nama file', 'error');
  }
}

// Initial boot (guaranteed single run)
let hasBooted = false;
function bootApp() {
  if (hasBooted) return;
  hasBooted = true;
  setupEvents();
  if (state.files.length > 0) {
    // Render cached items instantly (0ms load)
    updateDOM();
    // Silently revalidate fresh files in background
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

// Responsive redirection on viewport resize
let resizeTimer: any = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    try {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle|PlayBook/i.test(navigator.userAgent || '');
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isCoarse = window.matchMedia && (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches);
      const isSmallOrTablet = window.innerWidth <= 1024 || (window.screen && Math.min(window.screen.width, window.screen.height) <= 1024);
      if (isMobileUA || isTouch || isCoarse || isSmallOrTablet) {
        window.location.replace('/cloud/mobile/' + window.location.search + window.location.hash);
      }
    } catch (_) {}
  }, 250);
});
