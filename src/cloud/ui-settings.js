export const THEME_VARIANTS = [
  {
    id: 'neo-tokyo',
    name: 'Neo Tokyo',
    tag: 'Cyberpunk 2026',
    primaryColor: '#00f0ff',
    secondaryColor: '#ff007f',
    bgColor: '#060813',
  },
  {
    id: 'akira',
    name: 'Akira Crimson',
    tag: 'Neo-Edo Mecha',
    primaryColor: '#ff003c',
    secondaryColor: '#ffb300',
    bgColor: '#0b0204',
  },
  {
    id: 'eva-01',
    name: 'EVA-01 Mecha',
    tag: 'Nerv Unit-01',
    primaryColor: '#a855f7',
    secondaryColor: '#22c55e',
    bgColor: '#080312',
  },
  {
    id: 'ghost',
    name: 'Ghost Cybernet',
    tag: 'Section 9',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    bgColor: '#020b08',
  },
  {
    id: 'monochrome',
    name: 'Monochrome Manga',
    tag: 'Screen-Tone',
    primaryColor: '#ffffff',
    secondaryColor: '#a1a1aa',
    bgColor: '#080808',
  },
  {
    id: 'midnight-cosmos',
    name: 'Midnight Cosmos',
    tag: 'Gundam Orbital',
    primaryColor: '#38bdf8',
    secondaryColor: '#818cf8',
    bgColor: '#040716',
  },
];

export function renderSettingsModal(state) {
  const currentTheme = state.theme || 'neo-tokyo';
  const hasScanlines = state.scanlinesEnabled;
  const isCompact = state.compactGrid;

  return `
    <div class="relative w-full max-w-lg bg-[var(--c-surface)] border-2 border-[var(--c-accent)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_var(--c-accent-glow)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono">
      <!-- Top HUD Header -->
      <div class="px-4 py-3 bg-[var(--c-surface-card)] border-b-2 border-[var(--c-border)] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-[var(--c-accent)] shadow-[0_0_10px_var(--c-accent)] animate-pulse"></div>
          <div>
            <h3 class="text-xs font-black tracking-wider text-[var(--c-text-main)] uppercase flex items-center gap-2">
              <span>PENGATURAN TEMA & TAMPILAN</span>
            </h3>
            <p class="text-[9px] text-[var(--c-text-muted)] font-mono">CARIEARSA-CLOUD Cyber Core 2026-09-04</p>
          </div>
        </div>
        <button id="close-settings-btn" type="button" class="cyber-btn-chamfer p-1 cyber-btn-solid-surface text-[var(--c-text-muted)] hover:text-white transition-colors" title="Tutup (Esc)">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <!-- Theme Variant Selector -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] font-bold">Varian Tema Cyber</span>
            <span class="text-[10px] text-[var(--c-accent)] font-bold px-2 py-0.5 rounded bg-[var(--c-surface-card)] border border-[var(--c-border)]">${THEME_VARIANTS.find(t => t.id === currentTheme)?.name || 'Neo Tokyo'}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${THEME_VARIANTS.map(theme => {
              const isActive = currentTheme === theme.id;
              return `
                <button 
                  type="button" 
                  data-theme-id="${theme.id}" 
                  class="theme-select-btn text-left p-2.5 rounded-xl border-2 transition-all relative overflow-hidden group ${
                    isActive 
                      ? 'border-[var(--c-accent)] ring-2 ring-[var(--c-accent)] shadow-[0_0_18px_var(--c-accent-glow)] scale-[1.02]' 
                      : 'border-[var(--c-border)] hover:border-[var(--c-border-hover)] hover:scale-[1.01]'
                  }"
                  style="background-color: ${theme.bgColor};"
                >
                  <!-- Visual Color Palette Pill -->
                  <div class="flex items-center gap-1.5 mb-2">
                    <span class="w-3.5 h-3.5 rounded-full shadow-sm" style="background-color: ${theme.primaryColor}; box-shadow: 0 0 8px ${theme.primaryColor};"></span>
                    <span class="w-3.5 h-3.5 rounded-full shadow-sm" style="background-color: ${theme.secondaryColor};"></span>
                    ${isActive ? `<span class="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded cyber-btn-solid-accent shadow-sm">AKTIF</span>` : ''}
                  </div>
                  
                  <p class="text-xs font-bold text-white truncate group-hover:text-[var(--c-accent)] transition-colors">${theme.name}</p>
                  <div class="flex items-center justify-between mt-1 text-[9px] text-slate-300 font-mono">
                    <span class="opacity-80">${theme.tag}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- HUD Effects & Compact Mode -->
        <div class="pt-3 border-t-2 border-[var(--c-border)] space-y-2.5">
          <div class="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] font-bold mb-1.5">Efek Tampilan HUD</div>
          
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-[var(--c-surface-card)] border-2 border-[var(--c-border)]">
            <div class="flex items-center gap-2">
              <i data-lucide="tv" class="w-4 h-4 text-[var(--c-accent)]"></i>
              <div>
                <p class="text-xs font-bold text-[var(--c-text-main)]">Garis Pindai Cyber (Scanlines)</p>
                <p class="text-[9px] text-[var(--c-text-muted)]">Garis halus CRT hardware-accelerated (Default Aktif)</p>
              </div>
            </div>
            <button 
              id="toggle-scanlines-btn" 
              type="button" 
              class="cyber-btn-chamfer px-3 py-1 text-xs font-black transition-all ${
                hasScanlines 
                  ? 'cyber-btn-solid-accent shadow-[0_0_12px_var(--c-accent-glow)]' 
                  : 'cyber-btn-solid-surface text-[var(--c-text-muted)] hover:text-white'
              }"
            >
              ${hasScanlines ? 'AKTIF' : 'NONAKTIF'}
            </button>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded-xl bg-[var(--c-surface-card)] border-2 border-[var(--c-border)]">
            <div class="flex items-center gap-2">
              <i data-lucide="layout-grid" class="w-4 h-4 text-[var(--c-secondary)]"></i>
              <div>
                <p class="text-xs font-bold text-[var(--c-text-main)]">Kerapatan Grid Berkas (Compact)</p>
                <p class="text-[9px] text-[var(--c-text-muted)]">Tampilan hemat ruang dengan kartu mini</p>
              </div>
            </div>
            <button 
              id="toggle-compact-btn" 
              type="button" 
              class="cyber-btn-chamfer px-3 py-1 text-xs font-black transition-all ${
                isCompact 
                  ? 'cyber-btn-solid-accent shadow-[0_0_12px_var(--c-accent-glow)]' 
                  : 'cyber-btn-solid-surface text-[var(--c-text-muted)] hover:text-white'
              }"
            >
              ${isCompact ? 'KOMPAK' : 'STANDAR'}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="px-4 py-2.5 bg-[var(--c-surface-card)] border-t-2 border-[var(--c-border)] flex items-center justify-between text-[10px] text-[var(--c-text-muted)]">
        <span class="flex items-center gap-1.5">
          <i data-lucide="cpu" class="w-3 h-3 text-[var(--c-accent)]"></i>
          <span>Otomatis tersimpan di browser</span>
        </span>
        <button id="done-settings-btn" type="button" class="px-3 py-1 bg-[var(--c-accent)] hover:brightness-110 text-slate-950 font-bold rounded-lg transition-all shadow-sm">
          Selesai
        </button>
      </div>
    </div>
  `;
}
