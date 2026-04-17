// ============================================================
// Bank — Gestão Financeira Pessoal
// Persistência: localStorage (por perfil) — sem backend
// ============================================================

const STORAGE_PREFIX = 'bank_v1_';         // legado — usado apenas para migração
const STORAGE_META_OLD = 'bank_meta_v1';   // legado
const STORAGE_DATA = 'bank_data_v2';
const STORAGE_META = 'bank_meta_v2';
const APP_NAME = 'Bank';

const THEMES = [
  { id: 'midnight',  name: 'Midnight',  kind: 'dark',  colors: ['#070b19', '#818cf8', '#c084fc'] },
  { id: 'daylight',  name: 'Daylight',  kind: 'light', colors: ['#f5f7fb', '#6366f1', '#a855f7'] },
  { id: 'ocean',     name: 'Ocean',     kind: 'dark',  colors: ['#02131c', '#22d3ee', '#14b8a6'] },
  { id: 'sunset',    name: 'Sunset',    kind: 'dark',  colors: ['#1a0a1a', '#fb923c', '#f472b6'] },
  { id: 'forest',    name: 'Forest',    kind: 'dark',  colors: ['#0a1f15', '#4ade80', '#a3e635'] },
  { id: 'candy',     name: 'Candy',     kind: 'light', colors: ['#fdf2f8', '#ec4899', '#a855f7'] },
  { id: 'cyberpunk', name: 'Cyberpunk', kind: 'dark',  colors: ['#030712', '#00ff88', '#00e5ff'] },
  { id: 'royal',     name: 'Royal',     kind: 'dark',  colors: ['#0f0724', '#fbbf24', '#a78bfa'] },
  { id: 'dusk',      name: 'Dusk',      kind: 'dark',  colors: ['#1a0f05', '#f97316', '#eab308'] },
  { id: 'rose',      name: 'Rose',      kind: 'light', colors: ['#fef7ed', '#e11d48', '#f43f5e'] },
  { id: 'nord',      name: 'Nord',      kind: 'dark',  colors: ['#2e3440', '#88c0d0', '#b48ead'] },
  { id: 'graphite',  name: 'Graphite',  kind: 'dark',  colors: ['#0a0a0a', '#e5e7eb', '#9ca3af'] },
];

const ACCENT_PALETTE = [
  '#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e',
  '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e',
  '#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#64748b',
];

const AVATAR_OPTIONS = [
  '💼','🧑','👨','👩','🧑‍💻','👨‍💻','👩‍💻','🧑‍💼','👨‍💼','👩‍💼',
  '🦸','🧙','🧝','🤖','👑','🎩','🕶️','🦊','🐱','🐶',
  '🐼','🐨','🐯','🦁','🐸','🦄','🐙','🦉','🦅','🐺',
  '💰','💎','🏆','⚡','🔥','✨','🌟','💡','🎯','🚀',
];

const DEFAULT_USER = { name: 'Você', avatar: '💼', title: 'Gestão Financeira' };
const DEFAULT_APPEARANCE = {
  theme: 'graphite',
  accent: null,
  fontScale: 1,
  density: 'normal',
  radius: 'rounded',
  showGlow: true,
  hideBalance: false,
};

const DEFAULT_CATEGORIES = [
  { id: 'c_salario',     name: 'Salário',         icon: '💼', color: '#10b981', type: 'income' },
  { id: 'c_freela',      name: 'Freelance',       icon: '💻', color: '#22c55e', type: 'income' },
  { id: 'c_invest',      name: 'Investimentos',   icon: '📈', color: '#059669', type: 'income' },
  { id: 'c_outros_rec',  name: 'Outras Receitas', icon: '💰', color: '#14b8a6', type: 'income' },
  { id: 'c_alim',        name: 'Alimentação',     icon: '🍽️', color: '#ef4444', type: 'expense' },
  { id: 'c_merc',        name: 'Mercado',         icon: '🛒', color: '#f43f5e', type: 'expense' },
  { id: 'c_trans',       name: 'Transporte',      icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'c_mora',        name: 'Moradia',         icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: 'c_saude',       name: 'Saúde',           icon: '🏥', color: '#ec4899', type: 'expense' },
  { id: 'c_educ',        name: 'Educação',        icon: '📚', color: '#6366f1', type: 'expense' },
  { id: 'c_lazer',       name: 'Lazer',           icon: '🎮', color: '#a855f7', type: 'expense' },
  { id: 'c_compras',     name: 'Compras',         icon: '🛍️', color: '#f59e0b', type: 'expense' },
  { id: 'c_assin',       name: 'Assinaturas',     icon: '📱', color: '#06b6d4', type: 'expense' },
  { id: 'c_pets',        name: 'Pets',            icon: '🐾', color: '#84cc16', type: 'expense' },
  { id: 'c_outros_desp', name: 'Outras Despesas', icon: '📦', color: '#64748b', type: 'expense' },
];

const DEFAULT_ACCOUNTS = [
  { id: 'a_cc',   name: 'Conta Corrente', type: 'checking', balance: 0, icon: '🏦' },
  { id: 'a_poup', name: 'Poupança',       type: 'savings',  balance: 0, icon: '🐷' },
  { id: 'a_cart', name: 'Carteira',       type: 'cash',     balance: 0, icon: '👛' },
];

const ICON_OPTIONS = [
  '💰','💵','💳','🏦','🐷','👛','📈','💼','💻','🎯',
  '🏆','🏠','🚗','✈️','🍽️','🛒','☕','🍺','🎮','📚',
  '🎓','🏥','💊','💉','🐾','🐕','🐱','👕','👟','🛍️',
  '📱','💡','🔌','🚰','🔥','🧾','🏫','🎨','🎬','🎵',
  '⚽','🏋️','🧘','💄','✂️','🧹','🎁','🎂','💐','📦',
];

const COLOR_OPTIONS = [
  '#ef4444','#f43f5e','#ec4899','#a855f7','#8b5cf6','#6366f1',
  '#3b82f6','#06b6d4','#14b8a6','#10b981','#22c55e','#84cc16',
  '#eab308','#f59e0b','#f97316','#64748b','#78716c','#0f172a',
];

const CARD_COLORS = ['dark','purple','pink','green','orange','blue'];

// ---------- ESTADO ----------
let state = {
  user: { ...DEFAULT_USER },
  appearance: { ...DEFAULT_APPEARANCE },
  data: null,
  view: 'dashboard',
  charts: {},
  dashMonth: null,
};

// ---------- UTILITÁRIOS ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const fmtBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v || 0);
const fmtDate = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '';
const fmtDateFull = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR') : '';

const todayISO = () => {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

const monthKey = (iso) => (iso || '').slice(0, 7);
const currentMonthKey = () => todayISO().slice(0, 7);

function monthRange(key) {
  const [y, m] = key.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { start: `${key}-01`, end: `${key}-${String(last).padStart(2, '0')}` };
}
function addMonths(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

// Helper: render Lucide icons (after any DOM update)
function renderIcons(root) {
  if (window.lucide?.createIcons) {
    try { window.lucide.createIcons(root ? { attrs: {}, elements: root.querySelectorAll ? root.querySelectorAll('[data-lucide]') : undefined } : undefined); }
    catch { window.lucide.createIcons(); }
  }
}

// Lucide icon placeholder HTML (use inside templates)
const icon = (name, cls = '') => `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ''}></i>`;

// ---------- ELECTRON BRIDGE (opcional — app roda também em navegador) ----------
const IS_ELECTRON = typeof window !== 'undefined' && !!window.electronAPI;

function snapshotAll() {
  return {
    app: APP_NAME,
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    user: state.user,
    appearance: state.appearance,
    data: state.data,
  };
}

let _mirrorTimer = null;
let _lastBackupDay = null;
function scheduleMirrorAndBackup() {
  if (!IS_ELECTRON) return;
  clearTimeout(_mirrorTimer);
  _mirrorTimer = setTimeout(async () => {
    try {
      const json = JSON.stringify(snapshotAll(), null, 2);
      window.electronAPI.saveMirror(json);
      const today = todayISO();
      if (_lastBackupDay !== today) {
        _lastBackupDay = today;
        window.electronAPI.rotateBackup(json);
      }
    } catch {}
  }, 600);
}

// ---------- PERSISTÊNCIA ----------
function loadMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_META);
    if (raw) return JSON.parse(raw);
    // Migração: formato antigo bank_meta_v1 { profile, profiles, theme }
    const oldRaw = localStorage.getItem(STORAGE_META_OLD);
    if (oldRaw) {
      const old = JSON.parse(oldRaw);
      const name = old.profile || 'Você';
      const oldTheme = old.theme === 'light' ? 'daylight' : (old.theme === 'dark' ? 'midnight' : 'midnight');
      const migrated = {
        user: { name, avatar: '💼', title: 'Gestão Financeira' },
        appearance: { ...DEFAULT_APPEARANCE, theme: oldTheme },
      };
      localStorage.setItem(STORAGE_META, JSON.stringify(migrated));
      return migrated;
    }
    return null;
  } catch { return null; }
}
function saveMeta() {
  localStorage.setItem(STORAGE_META, JSON.stringify({
    user: state.user,
    appearance: state.appearance,
  }));
  scheduleMirrorAndBackup();
}

function loadData() {
  try {
    // Formato atual
    const raw = localStorage.getItem(STORAGE_DATA);
    if (raw) return { ...buildDefaultData(), ...JSON.parse(raw) };
    // Migração: pega qualquer perfil legado (bank_v1_*)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const legacy = localStorage.getItem(k);
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            localStorage.setItem(STORAGE_DATA, legacy);
            return { ...buildDefaultData(), ...parsed };
          } catch {}
        }
      }
    }
    return buildDefaultData();
  } catch { return buildDefaultData(); }
}

function buildDefaultData() {
  return {
    accounts: JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS)),
    cards: [],
    categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    transactions: [],
    budgets: [],
    goals: [],
    recurring: [],
  };
}

function saveData() {
  localStorage.setItem(STORAGE_DATA, JSON.stringify(state.data));
  scheduleMirrorAndBackup();
}

// Recuperação do mirror em arquivo (Electron) quando localStorage estiver vazio
async function tryRestoreFromMirror() {
  if (!IS_ELECTRON) return false;
  try {
    const hasData = !!localStorage.getItem(STORAGE_DATA);
    const hasMeta = !!localStorage.getItem(STORAGE_META) || !!localStorage.getItem(STORAGE_META_OLD);
    const hasLegacy = (() => {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) return true;
      }
      return false;
    })();
    if (hasData || hasMeta || hasLegacy) return false;
    const res = await window.electronAPI.loadMirror();
    if (!res?.ok || !res.data) return false;
    const m = res.data;
    if (m.user) state.user = { ...DEFAULT_USER, ...m.user };
    if (m.appearance) state.appearance = { ...DEFAULT_APPEARANCE, ...m.appearance };
    if (m.data) {
      state.data = { ...buildDefaultData(), ...m.data };
      localStorage.setItem(STORAGE_DATA, JSON.stringify(state.data));
    }
    saveMeta();
    toast('Dados restaurados do backup local', 'info');
    return true;
  } catch { return false; }
}

// ---------- TOAST ----------
const TOAST_ICONS = { success: 'check-circle-2', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icon(TOAST_ICONS[type] || 'info')}<span>${escapeHtml(msg)}</span>`;
  $('#toastContainer').appendChild(el);
  renderIcons(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s';
    setTimeout(() => el.remove(), 220);
  }, 2800);
}

// ---------- MODAL ----------
function openModal(title, bodyHTML, onMount) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHTML;
  $('#modalOverlay').classList.add('active');
  renderIcons($('#modalBody'));
  if (onMount) onMount($('#modalBody'));
}
function closeModal() {
  $('#modalOverlay').classList.remove('active');
  $('#modalBody').innerHTML = '';
}
function confirmDialog(message, onConfirm, opts = {}) {
  $('#confirmTitle').textContent = opts.title || 'Confirmar';
  $('#confirmMessage').textContent = message;
  $('#confirmOk').textContent = opts.okText || 'Confirmar';
  $('#confirmOk').className = opts.danger === false ? 'btn btn-primary' : 'btn btn-danger';
  $('#confirmOverlay').classList.add('active');
  const ok = $('#confirmOk'), cancel = $('#confirmCancel');
  const close = () => $('#confirmOverlay').classList.remove('active');
  const onOk = () => { close(); onConfirm(); cleanup(); };
  const onCancel = () => { close(); cleanup(); };
  const cleanup = () => { ok.removeEventListener('click', onOk); cancel.removeEventListener('click', onCancel); };
  ok.addEventListener('click', onOk);
  cancel.addEventListener('click', onCancel);
}

// ---------- CÁLCULOS ----------
function accountBalance(accountId) {
  const acc = state.data.accounts.find(a => a.id === accountId);
  if (!acc) return 0;
  let b = Number(acc.balance || 0);
  state.data.transactions.forEach(tx => {
    if (tx.type === 'income' && tx.accountId === accountId) b += Number(tx.amount);
    else if (tx.type === 'expense' && tx.accountId === accountId) b -= Number(tx.amount);
    else if (tx.type === 'transfer') {
      if (tx.accountId === accountId) b -= Number(tx.amount);
      if (tx.toAccountId === accountId) b += Number(tx.amount);
    }
  });
  return b;
}
function totalBalance() { return state.data.accounts.reduce((s, a) => s + accountBalance(a.id), 0); }

function monthlyStats(key) {
  const { start, end } = monthRange(key);
  let income = 0, expense = 0;
  state.data.transactions.forEach(tx => {
    if (tx.date < start || tx.date > end) return;
    if (tx.type === 'income') income += Number(tx.amount);
    else if (tx.type === 'expense') expense += Number(tx.amount);
  });
  return { income, expense, balance: income - expense };
}

function cardInvoice(cardId, key) {
  const { start, end } = monthRange(key);
  let total = 0;
  state.data.transactions.forEach(tx => {
    if (tx.type !== 'expense' || tx.cardId !== cardId) return;
    if (tx.date < start || tx.date > end) return;
    total += Number(tx.amount);
  });
  return total;
}

// ---------- RENDER ROOT ----------
const VIEW_TITLES = {
  dashboard: 'Painel', transactions: 'Transações', accounts: 'Contas', cards: 'Cartões',
  categories: 'Categorias', budgets: 'Orçamentos', goals: 'Metas', recurring: 'Recorrentes',
  reports: 'Relatórios', settings: 'Configurações',
};

function render() {
  $('#topbarTitle').textContent = VIEW_TITLES[state.view] || 'Painel';
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === state.view));

  destroyCharts();
  const c = $('#viewContainer');
  c.className = 'view-container fade-in';

  switch (state.view) {
    case 'dashboard':    renderDashboard(c); break;
    case 'transactions': renderTransactions(c); break;
    case 'accounts':     renderAccounts(c); break;
    case 'cards':        renderCards(c); break;
    case 'categories':   renderCategories(c); break;
    case 'budgets':      renderBudgets(c); break;
    case 'goals':        renderGoals(c); break;
    case 'recurring':    renderRecurring(c); break;
    case 'reports':      renderReports(c); break;
    case 'settings':     renderSettings(c); break;
  }
  renderIcons(c);
}

function destroyCharts() {
  Object.values(state.charts).forEach(c => { try { c.destroy(); } catch {} });
  state.charts = {};
}

// ============================================================
// VIEW: DASHBOARD
// ============================================================
function renderDashboard(c) {
  const month = state.dashMonth || currentMonthKey();
  state.dashMonth = month;
  const stats = monthlyStats(month);
  const total = totalBalance();
  const prevStats = monthlyStats(addMonths(month, -1));
  const deltaInc = computeDelta(stats.income, prevStats.income);
  const deltaExp = computeDelta(stats.expense, prevStats.expense);
  const projection = month === currentMonthKey() ? projectEndOfMonthBalance() : null;
  const monthTxs = state.data.transactions
    .filter(tx => monthKey(tx.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 10);

  c.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-top">
          <div>
            <div class="hero-label">${icon('wallet')}<span>Saldo total</span></div>
            <div class="hero-value">${fmtBRL(total)}</div>
            <div class="hero-sub">${icon('landmark')}<span>${state.data.accounts.length} conta${state.data.accounts.length !== 1 ? 's' : ''} • ${state.data.transactions.length} transações</span></div>
          </div>
          <div class="month-nav">
            <button id="prevMonth" aria-label="Mês anterior">${icon('chevron-left')}</button>
            <div class="label">${monthLabel(month)}</div>
            <button id="nextMonth" aria-label="Próximo mês">${icon('chevron-right')}</button>
          </div>
        </div>
      </div>
    </section>

    <div class="grid grid-3" style="margin-bottom:1.25rem;">
      <div class="stat-card income">
        <div class="stat-head">
          <div class="stat-label">Receitas do mês</div>
          <div class="stat-icon">${icon('trending-up')}</div>
        </div>
        <div class="stat-value" style="color:var(--success);">${fmtBRL(stats.income)}</div>
        ${deltaBadgeHtml(deltaInc, 'inverse')}
      </div>
      <div class="stat-card expense">
        <div class="stat-head">
          <div class="stat-label">Despesas do mês</div>
          <div class="stat-icon">${icon('trending-down')}</div>
        </div>
        <div class="stat-value" style="color:var(--danger);">${fmtBRL(stats.expense)}</div>
        ${deltaBadgeHtml(deltaExp, 'normal-expense')}
      </div>
      <div class="stat-card ${stats.balance >= 0 ? 'savings' : 'expense'}">
        <div class="stat-head">
          <div class="stat-label">Resultado do mês</div>
          <div class="stat-icon">${icon('piggy-bank')}</div>
        </div>
        <div class="stat-value" style="color:${stats.balance >= 0 ? 'var(--success)' : 'var(--danger)'};">${fmtBRL(stats.balance)}</div>
        <div class="stat-sub">vs ${monthLabel(addMonths(month, -1))}: ${fmtBRL(prevStats.balance)}</div>
      </div>
    </div>

    ${projection ? `
      <div class="card projection-card" style="margin-bottom:1.25rem;">
        <div class="card-title">
          <div class="card-title-left">${icon('trending-up')}<span>Projeção para fim do mês</span></div>
          ${projection.pending > 0 ? `<span class="badge" style="background:var(--primary-light);color:var(--primary);">${projection.pending} recorrente${projection.pending!==1?'s':''} pendente${projection.pending!==1?'s':''}</span>` : ''}
        </div>
        <div style="display:flex;align-items:baseline;gap:1rem;flex-wrap:wrap;">
          <div class="stat-value" style="color:${projection.balance>=0?'var(--success)':'var(--danger)'};font-size:2rem;">${fmtBRL(projection.balance)}</div>
          ${projection.delta !== 0 ? `<div style="font-size:0.875rem;color:var(--text-muted);">
            (${projection.delta >= 0 ? '+' : ''}${fmtBRL(projection.delta)} com recorrentes)
          </div>` : ''}
        </div>
      </div>
    ` : ''}

    <div class="grid grid-2" style="grid-template-columns: 2fr 1fr;">
      <div class="chart-card">
        <div class="card-title">
          <div class="card-title-left">${icon('activity')}<span>Evolução (últimos 6 meses)</span></div>
        </div>
        <div class="chart-wrap"><canvas id="chartEvolution"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="card-title">
          <div class="card-title-left">${icon('pie-chart')}<span>Por Categoria</span></div>
        </div>
        <div class="chart-wrap"><canvas id="chartCategories"></canvas></div>
      </div>
    </div>

    <div style="margin-top:1.25rem;" class="card">
      <div class="card-title">
        <div class="card-title-left">${icon('clock')}<span>Transações recentes</span></div>
        <button class="btn btn-ghost btn-sm" data-nav="transactions">Ver todas ${icon('arrow-right')}</button>
      </div>
      ${monthTxs.length === 0 ? emptyState('inbox', 'Sem transações este mês', 'Clique em "Nova Transação" para começar.', `<button class="btn btn-primary btn-sm" id="emptyAdd">${icon('plus')}<span>Adicionar</span></button>`) : renderGroupedTransactionList(monthTxs)}
    </div>
  `;

  // Month navigation
  $('#prevMonth').addEventListener('click', () => { state.dashMonth = addMonths(month, -1); render(); });
  $('#nextMonth').addEventListener('click', () => { state.dashMonth = addMonths(month, +1); render(); });
  c.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => { state.view = b.dataset.nav; render(); }));
  c.querySelectorAll('[data-tx-edit]').forEach(b => b.addEventListener('click', () => openTransactionModal(b.dataset.txEdit)));
  c.querySelectorAll('[data-tx-del]').forEach(b => b.addEventListener('click', () => deleteTransaction(b.dataset.txDel)));
  c.querySelectorAll('[data-tx-dup]').forEach(b => b.addEventListener('click', () => duplicateTransaction(b.dataset.txDup)));
  const emptyAdd = $('#emptyAdd'); if (emptyAdd) emptyAdd.addEventListener('click', () => openTransactionModal());

  drawEvolutionChart();
  drawCategoriesChart(month);
}

function emptyState(lucideName, title, text, actionHtml = '') {
  return `<div class="empty">
    <div class="empty-icon">${icon(lucideName)}</div>
    <div class="empty-title">${escapeHtml(title)}</div>
    <div class="empty-text">${escapeHtml(text)}</div>
    ${actionHtml}
  </div>`;
}

function txItemHTML(tx) {
  const cat = state.data.categories.find(c => c.id === tx.categoryId);
  const acc = state.data.accounts.find(a => a.id === tx.accountId);
  const toAcc = state.data.accounts.find(a => a.id === tx.toAccountId);
  const card = state.data.cards.find(c => c.id === tx.cardId);
  const ic = cat ? cat.icon : (tx.type === 'transfer' ? '🔄' : (tx.type === 'income' ? '⬆️' : '⬇️'));
  const color = cat ? cat.color : (tx.type === 'income' ? '#10b981' : tx.type === 'transfer' ? '#3b82f6' : '#ef4444');
  const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : '';
  const metaParts = [fmtDate(tx.date)];
  if (cat) metaParts.push(cat.name);
  if (tx.type === 'transfer' && acc && toAcc) metaParts.push(`${acc.name} → ${toAcc.name}`);
  else if (card) metaParts.push(`💳 ${card.name}`);
  else if (acc) metaParts.push(acc.name);

  return `
    <div class="transaction-item">
      <div class="tx-icon" style="background:${color}22;color:${color};">${ic}</div>
      <div class="tx-body">
        <div class="tx-title">${escapeHtml(tx.description || (cat ? cat.name : 'Transação'))}</div>
        <div class="tx-meta">${metaParts.map(escapeHtml).join(' • ')}</div>
      </div>
      <div class="tx-amount ${tx.type}">${sign}${fmtBRL(tx.amount)}</div>
      <div class="tx-actions">
        <button class="icon-btn icon-btn-sm" data-tx-dup="${tx.id}" title="Duplicar">${icon('copy')}</button>
        <button class="icon-btn icon-btn-sm" data-tx-edit="${tx.id}" title="Editar">${icon('pencil')}</button>
        <button class="icon-btn icon-btn-sm" data-tx-del="${tx.id}" title="Excluir">${icon('trash-2')}</button>
      </div>
    </div>
  `;
}

// ============================================================
// VIEW: TRANSACTIONS
// ============================================================
function renderTransactions(c) {
  const filters = state.txFilters || { type: '', categoryId: '', accountId: '', from: '', to: '', q: '' };
  state.txFilters = filters;

  c.innerHTML = `
    <div class="grid grid-3" style="margin-bottom:1rem;" id="txStats"></div>

    <div class="card">
      <div class="filters">
        <div class="search-wrap">
          ${icon('search')}
          <input type="text" class="filter-input" id="fQ" placeholder="Buscar descrição..." value="${escapeHtml(filters.q)}">
        </div>
        <select class="filter-input" id="fType">
          <option value="">Todos tipos</option>
          <option value="income" ${filters.type==='income'?'selected':''}>Receita</option>
          <option value="expense" ${filters.type==='expense'?'selected':''}>Despesa</option>
          <option value="transfer" ${filters.type==='transfer'?'selected':''}>Transferência</option>
        </select>
        <select class="filter-input" id="fCat">
          <option value="">Todas categorias</option>
          ${state.data.categories.map(cat => `<option value="${cat.id}" ${filters.categoryId===cat.id?'selected':''}>${escapeHtml(cat.name)}</option>`).join('')}
        </select>
        <select class="filter-input" id="fAcc">
          <option value="">Todas contas</option>
          ${state.data.accounts.map(a => `<option value="${a.id}" ${filters.accountId===a.id?'selected':''}>${escapeHtml(a.name)}</option>`).join('')}
        </select>
        <input type="date" class="filter-input" id="fFrom" value="${filters.from}">
        <input type="date" class="filter-input" id="fTo" value="${filters.to}">
        <button class="btn btn-ghost btn-sm" id="fClear">${icon('x')}<span>Limpar</span></button>
      </div>

      <div id="txListWrap"></div>
    </div>
  `;

  // Partial render: não re-renderiza a view toda (preserva foco dos inputs)
  const applyTxRender = () => {
    const filtered = filterTransactions(filters);
    const inc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    $('#txStats').innerHTML = `
      <div class="stat-card income">
        <div class="stat-head">
          <div class="stat-label">Entradas</div>
          <div class="stat-icon">${icon('arrow-down-left')}</div>
        </div>
        <div class="stat-value" style="color:var(--success);">${fmtBRL(inc)}</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-head">
          <div class="stat-label">Saídas</div>
          <div class="stat-icon">${icon('arrow-up-right')}</div>
        </div>
        <div class="stat-value" style="color:var(--danger);">${fmtBRL(exp)}</div>
      </div>
      <div class="stat-card balance">
        <div class="stat-head">
          <div class="stat-label">Resultado</div>
          <div class="stat-icon">${icon('equal')}</div>
        </div>
        <div class="stat-value" style="color:${inc-exp>=0?'var(--success)':'var(--danger)'};">${fmtBRL(inc - exp)}</div>
      </div>`;
    $('#txListWrap').innerHTML = filtered.length === 0
      ? emptyState('search-x', 'Nenhuma transação encontrada', 'Ajuste os filtros ou adicione uma nova.')
      : renderGroupedTransactionList(filtered);
    renderIcons($('#txStats'));
    renderIcons($('#txListWrap'));
  };

  applyTxRender();

  const refresh = () => {
    filters.q = $('#fQ').value;
    filters.type = $('#fType').value;
    filters.categoryId = $('#fCat').value;
    filters.accountId = $('#fAcc').value;
    filters.from = $('#fFrom').value;
    filters.to = $('#fTo').value;
    applyTxRender();
  };
  $('#fQ').addEventListener('input', debounce(refresh, 180));
  $('#fType').addEventListener('change', refresh);
  $('#fCat').addEventListener('change', refresh);
  $('#fAcc').addEventListener('change', refresh);
  $('#fFrom').addEventListener('change', refresh);
  $('#fTo').addEventListener('change', refresh);
  $('#fClear').addEventListener('click', () => { state.txFilters = null; render(); });

  // Delegação dos botões da lista — sobrevive a atualizações parciais
  $('#txListWrap').addEventListener('click', (e) => {
    const ed = e.target.closest('[data-tx-edit]');
    if (ed) return openTransactionModal(ed.dataset.txEdit);
    const dl = e.target.closest('[data-tx-del]');
    if (dl) return deleteTransaction(dl.dataset.txDel);
    const dp = e.target.closest('[data-tx-dup]');
    if (dp) return duplicateTransaction(dp.dataset.txDup);
  });
}

function filterTransactions(filters) {
  let list = [...state.data.transactions];
  if (filters.type) list = list.filter(t => t.type === filters.type);
  if (filters.categoryId) list = list.filter(t => t.categoryId === filters.categoryId);
  if (filters.accountId) list = list.filter(t => t.accountId === filters.accountId || t.toAccountId === filters.accountId);
  if (filters.from) list = list.filter(t => t.date >= filters.from);
  if (filters.to) list = list.filter(t => t.date <= filters.to);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(t => (t.description || '').toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q));
  }
  list.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
  return list;
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// ---------- TOAST COM AÇÃO (Desfazer, etc.) ----------
function toastWithAction(msg, actionLabel, onAction, opts = {}) {
  const type = opts.type || 'info';
  const duration = opts.duration || 6000;
  const el = document.createElement('div');
  el.className = `toast ${type} toast-action`;
  el.innerHTML = `
    ${icon(TOAST_ICONS[type] || 'info')}
    <span>${escapeHtml(msg)}</span>
    <button class="toast-action-btn">${escapeHtml(actionLabel)}</button>
  `;
  $('#toastContainer').appendChild(el);
  renderIcons(el);
  let done = false;
  const close = () => {
    if (done) return;
    done = true;
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s';
    setTimeout(() => el.remove(), 220);
  };
  const timer = setTimeout(close, duration);
  el.querySelector('.toast-action-btn').addEventListener('click', () => {
    clearTimeout(timer); close(); onAction();
  });
}

// ---------- CALCULADORA INLINE ----------
// Aceita expressões tipo "12,50 + 7,80", "100-15*2". Apenas dígitos e operadores básicos.
function tryEvalAmount(raw) {
  if (raw === null || raw === undefined) return NaN;
  const s = String(raw).trim().replace(/\./g, '').replace(/,/g, '.');
  // caracter permitidos
  if (!/^[\d\s+\-*/().]+$/.test(s)) return NaN;
  // bloqueia sequências suspeitas
  if (/[+\-*/]{2,}/.test(s.replace(/--/g, '-'))) return NaN;
  try {
    const r = Function(`"use strict"; return (${s})`)();
    return typeof r === 'number' && isFinite(r) ? Math.round(r * 100) / 100 : NaN;
  } catch { return NaN; }
}

// ---------- AGRUPAMENTO POR DATA ----------
function formatDateGroup(iso) {
  if (!iso) return '';
  const today = todayISO();
  if (iso === today) return 'Hoje';
  const d = new Date(iso + 'T00:00:00');
  const now = new Date(today + 'T00:00:00');
  const diffDays = Math.round((now - d) / 86400000);
  if (diffDays === 1) return 'Ontem';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} dias atrás`;
  if (diffDays < 0 && diffDays >= -7) return `Em ${Math.abs(diffDays)} dia${Math.abs(diffDays)!==1?'s':''}`;
  if (monthKey(iso) === currentMonthKey()) return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, m => m.toUpperCase());
}
function renderGroupedTransactionList(list) {
  if (!list.length) return '';
  const out = [];
  let curr = null;
  for (const tx of list) {
    const label = formatDateGroup(tx.date);
    if (!curr || curr.label !== label) {
      if (curr) out.push(curr);
      curr = { label, items: [] };
    }
    curr.items.push(tx);
  }
  if (curr) out.push(curr);
  return out.map(g => `
    <div class="tx-date-group"><span>${escapeHtml(g.label)}</span></div>
    <div class="transaction-list">${g.items.map(txItemHTML).join('')}</div>
  `).join('');
}

// ---------- HISTÓRICO DE DESCRIÇÕES (auto-complete) ----------
function buildDescriptionIndex() {
  const map = new Map();
  for (const t of state.data.transactions) {
    const d = (t.description || '').trim();
    if (!d) continue;
    if (!map.has(d)) map.set(d, { count: 0, categoryId: t.categoryId, accountId: t.accountId, cardId: t.cardId, type: t.type });
    const e = map.get(d); e.count++;
    // mantém a mais recente (última combinação de categoria/conta)
    e.categoryId = t.categoryId || e.categoryId;
    e.accountId = t.accountId || e.accountId;
    e.cardId = t.cardId || e.cardId;
    e.type = t.type || e.type;
  }
  return [...map.entries()].sort((a, b) => b[1].count - a[1].count);
}

// ---------- DUPLICAR ----------
function duplicateTransaction(id) {
  const tx = state.data.transactions.find(t => t.id === id);
  if (!tx) return;
  const copy = {
    ...JSON.parse(JSON.stringify(tx)),
    id: uid(),
    date: todayISO(),
    description: ((tx.description || '') + ' (cópia)').slice(0, 200),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  delete copy.recurringId;
  state.data.transactions.push(copy);
  saveData();
  toast('Transação duplicada');
  render();
}

// ---------- COMPARATIVO vs MÊS ANTERIOR ----------
function computeDelta(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
function deltaBadgeHtml(pct, semantic = 'normal') {
  if (pct === null || !isFinite(pct)) return '<div class="stat-sub" style="opacity:0.6;">—</div>';
  const up = pct >= 0;
  // semantic: 'inverse' (receita: subir é bom), 'normal-expense' (despesa: subir é ruim), 'normal' neutro
  let color = 'var(--text-muted)';
  if (semantic === 'inverse') color = up ? 'var(--success)' : 'var(--danger)';
  else if (semantic === 'normal-expense') color = up ? 'var(--danger)' : 'var(--success)';
  const sign = up ? '+' : '';
  return `<div class="stat-sub" style="color:${color};font-weight:600;">${sign}${pct.toFixed(0)}% vs mês anterior</div>`;
}

// ---------- PROJEÇÃO DE SALDO ----------
function projectEndOfMonthBalance() {
  const today = todayISO();
  const todayDay = parseInt(today.slice(8, 10));
  const curMonth = today.slice(0, 7);
  let delta = 0;
  let pending = 0;
  state.data.recurring.forEach(r => {
    if (r.lastApplied === curMonth) return;
    if (r.day <= todayDay) return; // deveria ter sido aplicada já
    if (r.type === 'income') delta += Number(r.amount);
    else delta -= Number(r.amount);
    pending++;
  });
  return { balance: totalBalance() + delta, delta, pending };
}

// ============================================================
// TRANSACTION MODAL
// ============================================================
function openTransactionModal(editId = null, preset = {}) {
  if (state.data.accounts.length === 0) {
    toast('Crie uma conta antes de adicionar transações', 'warning');
    state.view = 'accounts'; render();
    return;
  }
  const editing = editId ? state.data.transactions.find(t => t.id === editId) : null;
  const tx = editing || {
    type: preset.type || 'expense', amount: '', date: todayISO(), description: '',
    categoryId: '', accountId: state.data.accounts[0].id, toAccountId: '', cardId: '', notes: '',
  };

  const body = `
    <form id="txForm">
      <div class="type-selector" id="typeSelector">
        <div class="type-option income ${tx.type==='income'?'active':''}" data-type="income">${icon('arrow-down-left')}<span>Receita</span></div>
        <div class="type-option expense ${tx.type==='expense'?'active':''}" data-type="expense">${icon('arrow-up-right')}<span>Despesa</span></div>
        <div class="type-option transfer ${tx.type==='transfer'?'active':''}" data-type="transfer">${icon('arrow-right-left')}<span>Transf.</span></div>
      </div>

      <div class="form-row" style="margin-top:1rem;">
        <div class="form-group">
          <label class="form-label">${icon('dollar-sign')}<span>Valor (R$) <span class="hint">· aceita 12,50 + 7,80</span></span></label>
          <input type="text" inputmode="decimal" class="form-input" name="amount" value="${tx.amount}" required autofocus placeholder="0,00 ou expressão">
        </div>
        <div class="form-group">
          <label class="form-label">${icon('calendar')}<span>Data</span></label>
          <input type="date" class="form-input" name="date" value="${tx.date}" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${icon('file-text')}<span>Descrição</span></label>
        <input type="text" class="form-input" name="description" value="${escapeHtml(tx.description)}" placeholder="Ex: Supermercado, Salário..." list="txDescList" autocomplete="off">
        <datalist id="txDescList"></datalist>
      </div>

      <div id="txFields"></div>

      <div id="installmentWrap" class="form-group" style="display:${editing ? 'none' : 'block'};">
        <label class="form-label" style="cursor:pointer;">
          <input type="checkbox" id="installmentToggle" style="margin-right:6px;vertical-align:middle;">
          ${icon('layers')}<span>Parcelar em várias vezes</span>
        </label>
        <div id="installmentFields" style="display:none;margin-top:0.5rem;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Número de parcelas</label>
              <input type="number" id="installmentN" min="2" max="48" value="2" class="form-input">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Valor de cada parcela</label>
              <div id="installmentPreview" class="form-input" style="background:var(--surface-2);display:flex;align-items:center;">—</div>
            </div>
          </div>
          <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">Serão criadas N transações mensais a partir da data selecionada.</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${icon('sticky-note')}<span>Observações</span></label>
        <textarea class="form-textarea" name="notes">${escapeHtml(tx.notes || '')}</textarea>
      </div>

      <div class="form-actions">
        ${editing ? `<button type="button" class="btn btn-danger" id="txDel">${icon('trash-2')}<span>Excluir</span></button>` : ''}
        <button type="button" class="btn btn-ghost" id="txCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>${editing ? 'Salvar' : 'Adicionar'}</span></button>
      </div>
    </form>
  `;

  openModal(editing ? 'Editar Transação' : 'Nova Transação', body, () => {
    let currentType = tx.type;
    const renderFields = () => {
      const cats = state.data.categories.filter(c => currentType === 'transfer' ? false : c.type === currentType);
      const fields = $('#txFields');
      if (currentType === 'transfer') {
        fields.innerHTML = `
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${icon('arrow-up-from-line')}<span>De</span></label>
              <select class="form-select" name="accountId" required>
                ${state.data.accounts.map(a => `<option value="${a.id}" ${a.id===tx.accountId?'selected':''}>${escapeHtml(a.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${icon('arrow-down-to-line')}<span>Para</span></label>
              <select class="form-select" name="toAccountId" required>
                <option value="">Selecione</option>
                ${state.data.accounts.map(a => `<option value="${a.id}" ${a.id===tx.toAccountId?'selected':''}>${escapeHtml(a.name)}</option>`).join('')}
              </select>
            </div>
          </div>
        `;
      } else {
        const useCard = currentType === 'expense' && tx.cardId;
        fields.innerHTML = `
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${icon('tag')}<span>Categoria</span></label>
              <select class="form-select" name="categoryId" required>
                <option value="">Selecione</option>
                ${cats.map(c => `<option value="${c.id}" ${c.id===tx.categoryId?'selected':''}>${c.icon} ${escapeHtml(c.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${icon('wallet')}<span>${currentType === 'income' ? 'Conta de destino' : 'Pagar com'}</span></label>
              <select class="form-select" name="payment" required>
                <optgroup label="Contas">
                  ${state.data.accounts.map(a => `<option value="acc:${a.id}" ${(!useCard && a.id===tx.accountId)?'selected':''}>${escapeHtml(a.name)}</option>`).join('')}
                </optgroup>
                ${currentType === 'expense' && state.data.cards.length > 0 ? `
                  <optgroup label="Cartões">
                    ${state.data.cards.map(c => `<option value="card:${c.id}" ${useCard && c.id===tx.cardId?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}
                  </optgroup>
                ` : ''}
              </select>
            </div>
          </div>
        `;
      }
      renderIcons(fields);
    };
    renderFields();

    $('#typeSelector').addEventListener('click', (e) => {
      const opt = e.target.closest('[data-type]'); if (!opt) return;
      currentType = opt.dataset.type;
      $$('#typeSelector .type-option').forEach(el => el.classList.remove('active'));
      opt.classList.add('active');
      renderFields();
    });

    $('#txCancel').addEventListener('click', closeModal);
    if (editing) $('#txDel').addEventListener('click', () => { closeModal(); deleteTransaction(editing.id); });

    // ---- Auto-complete de descrições ----
    const descIndex = buildDescriptionIndex();
    const datalist = $('#txDescList');
    datalist.innerHTML = descIndex.slice(0, 50).map(([d]) => `<option value="${escapeHtml(d)}">`).join('');
    const descInput = document.querySelector('#txForm input[name="description"]');
    descInput.addEventListener('change', () => {
      const hit = descIndex.find(([d]) => d === descInput.value);
      if (!hit) return;
      const info = hit[1];
      const catSel = document.querySelector('#txForm select[name="categoryId"]');
      const paySel = document.querySelector('#txForm select[name="payment"]');
      if (catSel && !catSel.value && info.categoryId) catSel.value = info.categoryId;
      if (paySel && !paySel.value) {
        if (info.cardId) paySel.value = 'card:' + info.cardId;
        else if (info.accountId) paySel.value = 'acc:' + info.accountId;
      }
    });

    // ---- Calculadora no campo valor ----
    const amountInput = document.querySelector('#txForm input[name="amount"]');
    const tryCompute = () => {
      const r = tryEvalAmount(amountInput.value);
      if (isFinite(r) && r > 0 && String(amountInput.value).match(/[+\-*/]/)) {
        amountInput.value = r.toFixed(2).replace('.', ',');
      }
    };
    amountInput.addEventListener('blur', tryCompute);
    amountInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && /[+\-*/]/.test(amountInput.value)) { e.preventDefault(); tryCompute(); }
    });

    // ---- Parcelamento ----
    const instToggle = $('#installmentToggle');
    const instFields = $('#installmentFields');
    const instN = $('#installmentN');
    const instPreview = $('#installmentPreview');
    const updateInstPreview = () => {
      const amount = tryEvalAmount(amountInput.value);
      const n = Math.max(2, Math.min(48, parseInt(instN?.value) || 2));
      if (!isFinite(amount) || amount <= 0) { instPreview.textContent = '—'; return; }
      instPreview.textContent = fmtBRL(amount / n) + ` × ${n}x`;
    };
    if (instToggle) {
      instToggle.addEventListener('change', () => {
        instFields.style.display = instToggle.checked ? 'block' : 'none';
        updateInstPreview();
      });
      instN.addEventListener('input', updateInstPreview);
      amountInput.addEventListener('input', updateInstPreview);
    }

    $('#txForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;

      // Avalia a expressão antes de validar
      let amount = tryEvalAmount(f.amount.value);
      if (!isFinite(amount)) amount = parseFloat(String(f.amount.value).replace(',', '.'));
      if (!(amount > 0)) return toast('Valor inválido', 'error');

      const wantsInstallment = !editing && currentType === 'expense' && instToggle?.checked;
      const installmentN = wantsInstallment ? Math.max(2, Math.min(48, parseInt(instN.value) || 2)) : 1;

      const base = {
        type: currentType,
        date: f.date.value, description: f.description.value.trim(),
        notes: f.notes.value.trim(),
      };

      if (currentType === 'transfer') {
        base.accountId = f.accountId.value;
        base.toAccountId = f.toAccountId.value;
        if (base.accountId === base.toAccountId) return toast('Contas devem ser diferentes', 'error');
      } else {
        base.categoryId = f.categoryId.value;
        const pay = f.payment.value;
        if (pay.startsWith('card:')) { base.cardId = pay.slice(5); base.accountId = null; }
        else { base.accountId = pay.slice(4); base.cardId = null; }
      }

      if (editing) {
        const newTx = {
          id: editing.id, ...base, amount,
          createdAt: editing.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const idx = state.data.transactions.findIndex(t => t.id === editing.id);
        state.data.transactions[idx] = newTx;
        saveData();
        closeModal();
        toast('Transação atualizada');
        checkBudgetAlert(newTx);
        render();
        return;
      }

      // Nova(s) transação(ões)
      if (installmentN > 1) {
        const per = Math.round((amount / installmentN) * 100) / 100;
        const [y, m, d] = base.date.split('-').map(Number);
        const groupTag = uid();
        for (let i = 0; i < installmentN; i++) {
          const dt = new Date(y, m - 1 + i, d);
          // ajusta se cair em mês com menos dias
          const iso = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
          const tx = {
            id: uid(), ...base, amount: per, date: iso,
            description: `${base.description} (${i+1}/${installmentN})`.trim(),
            installmentGroup: groupTag,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          state.data.transactions.push(tx);
        }
        saveData();
        closeModal();
        toast(`${installmentN} parcelas criadas (${fmtBRL(per)} cada)`);
        render();
      } else {
        const newTx = {
          id: uid(), ...base, amount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.data.transactions.push(newTx);
        saveData();
        closeModal();
        toast('Transação adicionada');
        checkBudgetAlert(newTx);
        render();
      }
    });
  });
}

function checkBudgetAlert(tx) {
  if (tx.type !== 'expense' || !tx.categoryId) return;
  const budget = state.data.budgets.find(b => b.categoryId === tx.categoryId);
  if (!budget || !budget.amount) return;
  const { start, end } = monthRange(monthKey(tx.date));
  const spent = state.data.transactions
    .filter(t => t.type === 'expense' && t.categoryId === tx.categoryId && t.date >= start && t.date <= end)
    .reduce((s, t) => s + Number(t.amount), 0);
  const pct = (spent / budget.amount) * 100;
  const cat = state.data.categories.find(c => c.id === tx.categoryId);
  const name = cat?.name || 'Categoria';
  if (pct >= 100) {
    setTimeout(() => toast(`⚠ "${name}" estourou o orçamento (${pct.toFixed(0)}% • ${fmtBRL(spent)}/${fmtBRL(budget.amount)})`, 'error'), 400);
  } else if (pct >= 80) {
    setTimeout(() => toast(`${name}: ${pct.toFixed(0)}% do orçamento usado`, 'warning'), 400);
  }
}

function deleteTransaction(id) {
  const idx = state.data.transactions.findIndex(t => t.id === id);
  if (idx < 0) return;
  const tx = state.data.transactions[idx];
  state.data.transactions.splice(idx, 1);
  saveData();
  render();
  toastWithAction('Transação excluída', 'Desfazer', () => {
    state.data.transactions.splice(idx, 0, tx);
    saveData();
    render();
  }, { type: 'info', duration: 8000 });
}

// ============================================================
// VIEW: ACCOUNTS
// ============================================================
function renderAccounts(c) {
  const total = totalBalance();
  c.innerHTML = `
    <div class="section-header">
      <div class="section-title-group">
        <div class="section-title">Suas contas</div>
        <div class="section-subtitle">Total: <strong style="color:var(--text);">${fmtBRL(total)}</strong></div>
      </div>
      <button class="btn btn-primary btn-sm" id="addAcc">${icon('plus')}<span>Nova conta</span></button>
    </div>
    ${state.data.accounts.length === 0
      ? emptyState('landmark', 'Nenhuma conta ainda', 'Adicione sua primeira conta bancária ou carteira.', `<button class="btn btn-primary btn-sm" id="firstAcc">${icon('plus')}<span>Adicionar conta</span></button>`)
      : `<div class="grid grid-auto">${state.data.accounts.map(a => {
          const bal = accountBalance(a.id);
          return `
            <div class="account-card">
              <div class="account-header">
                <div class="account-icon">${a.icon || '🏦'}</div>
                <div class="tx-actions">
                  <button class="icon-btn icon-btn-sm" data-acc-edit="${a.id}" title="Editar">${icon('pencil')}</button>
                  <button class="icon-btn icon-btn-sm" data-acc-del="${a.id}" title="Excluir">${icon('trash-2')}</button>
                </div>
              </div>
              <div class="account-name">${escapeHtml(a.name)}</div>
              <div class="account-type">${accTypeLabel(a.type)}</div>
              <div class="account-balance" style="color:${bal >= 0 ? 'var(--text)' : 'var(--danger)'};">${fmtBRL(bal)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.375rem;">Saldo inicial: ${fmtBRL(a.balance)}</div>
            </div>
          `;
        }).join('')}</div>`
    }
  `;

  $('#addAcc')?.addEventListener('click', () => openAccountModal());
  $('#firstAcc')?.addEventListener('click', () => openAccountModal());
  c.querySelectorAll('[data-acc-edit]').forEach(b => b.addEventListener('click', () => openAccountModal(b.dataset.accEdit)));
  c.querySelectorAll('[data-acc-del]').forEach(b => b.addEventListener('click', () => deleteAccount(b.dataset.accDel)));
}
function accTypeLabel(t) {
  return { checking: 'Conta Corrente', savings: 'Poupança', cash: 'Dinheiro', investment: 'Investimento', other: 'Outra' }[t] || t;
}

function openAccountModal(editId = null) {
  const editing = editId ? state.data.accounts.find(a => a.id === editId) : null;
  const a = editing || { name: '', type: 'checking', balance: 0, icon: '🏦' };
  const body = `
    <form id="accForm">
      <div class="form-group">
        <label class="form-label">${icon('landmark')}<span>Nome</span></label>
        <input type="text" class="form-input" name="name" value="${escapeHtml(a.name)}" required autofocus>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${icon('layers')}<span>Tipo</span></label>
          <select class="form-select" name="type">
            <option value="checking" ${a.type==='checking'?'selected':''}>Conta Corrente</option>
            <option value="savings"  ${a.type==='savings'?'selected':''}>Poupança</option>
            <option value="cash"     ${a.type==='cash'?'selected':''}>Dinheiro</option>
            <option value="investment" ${a.type==='investment'?'selected':''}>Investimento</option>
            <option value="other"    ${a.type==='other'?'selected':''}>Outra</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${icon('dollar-sign')}<span>Saldo inicial (R$)</span></label>
          <input type="number" step="0.01" class="form-input" name="balance" value="${a.balance}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('smile')}<span>Ícone</span></label>
        <div class="icon-picker" id="iconPicker"></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="accCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>${editing ? 'Salvar' : 'Criar'}</span></button>
      </div>
    </form>
  `;
  openModal(editing ? 'Editar Conta' : 'Nova Conta', body, () => {
    let chosenIcon = a.icon || '🏦';
    const picker = $('#iconPicker');
    picker.innerHTML = ICON_OPTIONS.map(ic => `<div class="icon-option ${ic===chosenIcon?'active':''}" data-icon="${ic}">${ic}</div>`).join('');
    picker.addEventListener('click', (e) => {
      const opt = e.target.closest('[data-icon]'); if (!opt) return;
      chosenIcon = opt.dataset.icon;
      picker.querySelectorAll('.icon-option').forEach(el => el.classList.toggle('active', el.dataset.icon === chosenIcon));
    });
    $('#accCancel').addEventListener('click', closeModal);
    $('#accForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const newAcc = {
        id: editing?.id || uid(),
        name: f.elements['name'].value.trim(),
        type: f.elements['type'].value,
        balance: parseFloat(f.elements['balance'].value) || 0,
        icon: chosenIcon,
      };
      if (editing) state.data.accounts[state.data.accounts.findIndex(x => x.id === editing.id)] = newAcc;
      else state.data.accounts.push(newAcc);
      saveData();
      closeModal();
      toast(editing ? 'Conta atualizada' : 'Conta criada');
      render();
    });
  });
}

function deleteAccount(id) {
  const usedBy = state.data.transactions.filter(t => t.accountId === id || t.toAccountId === id).length;
  const msg = usedBy > 0 ? `Esta conta tem ${usedBy} transação(ões) vinculada(s). Excluir mesmo assim?` : 'Excluir esta conta?';
  confirmDialog(msg, () => {
    state.data.accounts = state.data.accounts.filter(a => a.id !== id);
    state.data.transactions = state.data.transactions.filter(t => t.accountId !== id && t.toAccountId !== id);
    saveData();
    toast('Conta excluída');
    render();
  });
}

// ============================================================
// VIEW: CARDS
// ============================================================
function renderCards(c) {
  const month = currentMonthKey();
  c.innerHTML = `
    <div class="section-header">
      <div class="section-title-group">
        <div class="section-title">Cartões de Crédito</div>
        <div class="section-subtitle">Fatura atual (${monthLabel(month)})</div>
      </div>
      <button class="btn btn-primary btn-sm" id="addCard">${icon('plus')}<span>Novo cartão</span></button>
    </div>
    ${state.data.cards.length === 0
      ? emptyState('credit-card', 'Sem cartões', 'Adicione um cartão para controlar faturas, limites e vencimentos.', `<button class="btn btn-primary btn-sm" id="firstCard">${icon('plus')}<span>Adicionar cartão</span></button>`)
      : `<div class="grid grid-auto">${state.data.cards.map(card => {
          const invoice = cardInvoice(card.id, month);
          const limit = Number(card.limit || 0);
          const pct = limit > 0 ? Math.min(100, (invoice / limit) * 100) : 0;
          const cls = pct > 80 ? 'danger' : pct > 60 ? 'warning' : 'success';
          return `
            <div>
              <div class="credit-card ${card.color || 'dark'}">
                <div class="cc-header">
                  <div class="cc-chip"></div>
                  <div class="cc-brand">${escapeHtml(card.name)}</div>
                </div>
                <div class="cc-number">•••• •••• •••• ${escapeHtml(card.last4 || '••••')}</div>
                <div class="cc-footer">
                  <div>
                    <div class="cc-label">Fatura atual</div>
                    <div class="cc-value">${fmtBRL(invoice)}</div>
                  </div>
                  <div style="text-align:right;">
                    <div class="cc-label">Limite</div>
                    <div class="cc-value">${fmtBRL(limit)}</div>
                  </div>
                </div>
              </div>
              <div style="background:var(--surface);border:1px solid var(--border);border-top:none;border-radius:0 0 var(--radius-lg) var(--radius-lg);padding:0.875rem 1rem;margin-top:-4px;">
                <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem;">
                  <span>Usado: <strong style="color:var(--text);">${pct.toFixed(0)}%</strong></span>
                  <span>Disp: <strong style="color:var(--text);">${fmtBRL(limit - invoice)}</strong></span>
                </div>
                <div class="progress"><div class="progress-bar ${cls}" style="width:${pct}%"></div></div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.625rem;display:flex;justify-content:space-between;align-items:center;">
                  <span>Fecha ${card.closingDay || '—'} • Vence ${card.dueDay || '—'}</span>
                  <div style="display:flex;gap:2px;">
                    <button class="icon-btn icon-btn-sm" data-card-edit="${card.id}">${icon('pencil')}</button>
                    <button class="icon-btn icon-btn-sm" data-card-del="${card.id}">${icon('trash-2')}</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}</div>`
    }
  `;

  $('#addCard')?.addEventListener('click', () => openCardModal());
  $('#firstCard')?.addEventListener('click', () => openCardModal());
  c.querySelectorAll('[data-card-edit]').forEach(b => b.addEventListener('click', () => openCardModal(b.dataset.cardEdit)));
  c.querySelectorAll('[data-card-del]').forEach(b => b.addEventListener('click', () => deleteCard(b.dataset.cardDel)));
}

function openCardModal(editId = null) {
  const editing = editId ? state.data.cards.find(c => c.id === editId) : null;
  const cc = editing || { name: '', last4: '', limit: 0, closingDay: 25, dueDay: 5, color: 'purple' };
  const body = `
    <form id="cardForm">
      <div class="form-group">
        <label class="form-label">${icon('credit-card')}<span>Nome</span></label>
        <input type="text" class="form-input" name="name" value="${escapeHtml(cc.name)}" placeholder="Ex: Nubank, Itaú..." required autofocus>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${icon('hash')}<span>Últimos 4 dígitos</span></label>
          <input type="text" class="form-input" name="last4" value="${escapeHtml(cc.last4)}" maxlength="4" pattern="[0-9]{0,4}">
        </div>
        <div class="form-group">
          <label class="form-label">${icon('dollar-sign')}<span>Limite (R$)</span></label>
          <input type="number" step="0.01" class="form-input" name="limit" value="${cc.limit}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${icon('calendar-clock')}<span>Dia de fechamento</span></label>
          <input type="number" min="1" max="31" class="form-input" name="closingDay" value="${cc.closingDay}">
        </div>
        <div class="form-group">
          <label class="form-label">${icon('calendar-check')}<span>Dia de vencimento</span></label>
          <input type="number" min="1" max="31" class="form-input" name="dueDay" value="${cc.dueDay}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('palette')}<span>Cor</span></label>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;" id="cardColors">
          ${CARD_COLORS.map(color => `
            <div class="credit-card ${color}" style="width:100px;height:60px;padding:0.5rem;cursor:pointer;min-height:auto;border:2px solid ${color===cc.color?'var(--primary)':'transparent'};" data-color="${color}">
              <div style="font-size:0.625rem;text-transform:capitalize;opacity:0.9;">${color}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="cardCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>${editing ? 'Salvar' : 'Criar'}</span></button>
      </div>
    </form>
  `;
  openModal(editing ? 'Editar Cartão' : 'Novo Cartão', body, () => {
    let chosen = cc.color;
    $('#cardColors').addEventListener('click', (e) => {
      const t = e.target.closest('[data-color]'); if (!t) return;
      chosen = t.dataset.color;
      $('#cardColors').querySelectorAll('[data-color]').forEach(el => {
        el.style.border = '2px solid ' + (el.dataset.color === chosen ? 'var(--primary)' : 'transparent');
      });
    });
    $('#cardCancel').addEventListener('click', closeModal);
    $('#cardForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const nc = {
        id: editing?.id || uid(),
        name: f.elements['name'].value.trim(),
        last4: f.elements['last4'].value.trim(),
        limit: parseFloat(f.elements['limit'].value) || 0,
        closingDay: parseInt(f.elements['closingDay'].value) || 1,
        dueDay: parseInt(f.elements['dueDay'].value) || 1,
        color: chosen,
      };
      if (editing) state.data.cards[state.data.cards.findIndex(x => x.id === editing.id)] = nc;
      else state.data.cards.push(nc);
      saveData();
      closeModal();
      toast(editing ? 'Cartão atualizado' : 'Cartão criado');
      render();
    });
  });
}

function deleteCard(id) {
  const usedBy = state.data.transactions.filter(t => t.cardId === id).length;
  const msg = usedBy > 0 ? `Este cartão tem ${usedBy} transação(ões). Excluir mesmo assim?` : 'Excluir este cartão?';
  confirmDialog(msg, () => {
    state.data.cards = state.data.cards.filter(c => c.id !== id);
    state.data.transactions = state.data.transactions.filter(t => t.cardId !== id);
    saveData();
    toast('Cartão excluído');
    render();
  });
}

// ============================================================
// VIEW: CATEGORIES
// ============================================================
function renderCategories(c) {
  const income = state.data.categories.filter(x => x.type === 'income');
  const expense = state.data.categories.filter(x => x.type === 'expense');
  c.innerHTML = `
    <div class="section-header">
      <div class="section-title-group">
        <div class="section-title">Categorias</div>
        <div class="section-subtitle">${state.data.categories.length} no total</div>
      </div>
      <button class="btn btn-primary btn-sm" id="addCat">${icon('plus')}<span>Nova categoria</span></button>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <div class="card-title">
          <div class="card-title-left" style="color:var(--success);">${icon('arrow-down-left')}<span>Receitas</span></div>
          <span class="badge income">${income.length}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.375rem;">
          ${income.length === 0 ? `<div class="empty-text" style="padding:0.5rem;">Nenhuma categoria.</div>` : income.map(catItemHTML).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-title">
          <div class="card-title-left" style="color:var(--danger);">${icon('arrow-up-right')}<span>Despesas</span></div>
          <span class="badge expense">${expense.length}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.375rem;">
          ${expense.length === 0 ? `<div class="empty-text" style="padding:0.5rem;">Nenhuma categoria.</div>` : expense.map(catItemHTML).join('')}
        </div>
      </div>
    </div>
  `;
  $('#addCat').addEventListener('click', () => openCategoryModal());
  c.querySelectorAll('[data-cat-edit]').forEach(b => b.addEventListener('click', () => openCategoryModal(b.dataset.catEdit)));
  c.querySelectorAll('[data-cat-del]').forEach(b => b.addEventListener('click', () => deleteCategory(b.dataset.catDel)));
}

function catItemHTML(cat) {
  return `
    <div class="cat-item">
      <div class="cat-item-icon" style="background:${cat.color};">${cat.icon}</div>
      <div class="cat-item-body">
        <div class="cat-item-name">${escapeHtml(cat.name)}</div>
        <div class="cat-item-type">${cat.type === 'income' ? 'Receita' : 'Despesa'}</div>
      </div>
      <div class="tx-actions">
        <button class="icon-btn icon-btn-sm" data-cat-edit="${cat.id}">${icon('pencil')}</button>
        <button class="icon-btn icon-btn-sm" data-cat-del="${cat.id}">${icon('trash-2')}</button>
      </div>
    </div>
  `;
}

function openCategoryModal(editId = null) {
  const editing = editId ? state.data.categories.find(c => c.id === editId) : null;
  const cat = editing || { name: '', type: 'expense', icon: '📦', color: '#6366f1' };
  const body = `
    <form id="catForm">
      <div class="form-group">
        <label class="form-label">${icon('tag')}<span>Nome</span></label>
        <input type="text" class="form-input" name="name" value="${escapeHtml(cat.name)}" required autofocus>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('filter')}<span>Tipo</span></label>
        <div class="type-selector" style="grid-template-columns:1fr 1fr;">
          <div class="type-option income ${cat.type==='income'?'active':''}" data-type="income">${icon('arrow-down-left')}<span>Receita</span></div>
          <div class="type-option expense ${cat.type==='expense'?'active':''}" data-type="expense">${icon('arrow-up-right')}<span>Despesa</span></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('smile')}<span>Ícone</span></label>
        <div class="icon-picker" id="catIcons"></div>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('palette')}<span>Cor</span></label>
        <div class="color-picker" id="catColors">
          ${COLOR_OPTIONS.map(c => `<div class="color-option ${c===cat.color?'active':''}" style="background:${c};" data-color="${c}"></div>`).join('')}
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="catCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>${editing ? 'Salvar' : 'Criar'}</span></button>
      </div>
    </form>
  `;
  openModal(editing ? 'Editar Categoria' : 'Nova Categoria', body, () => {
    let chosenType = cat.type, chosenIcon = cat.icon, chosenColor = cat.color;
    const icons = $('#catIcons');
    icons.innerHTML = ICON_OPTIONS.map(ic => `<div class="icon-option ${ic===chosenIcon?'active':''}" data-icon="${ic}">${ic}</div>`).join('');
    icons.addEventListener('click', (e) => {
      const t = e.target.closest('[data-icon]'); if (!t) return;
      chosenIcon = t.dataset.icon;
      icons.querySelectorAll('.icon-option').forEach(el => el.classList.toggle('active', el.dataset.icon === chosenIcon));
    });
    $('#catColors').addEventListener('click', (e) => {
      const t = e.target.closest('[data-color]'); if (!t) return;
      chosenColor = t.dataset.color;
      $('#catColors').querySelectorAll('.color-option').forEach(el => el.classList.toggle('active', el.dataset.color === chosenColor));
    });
    document.querySelector('#catForm .type-selector').addEventListener('click', (e) => {
      const t = e.target.closest('[data-type]'); if (!t) return;
      chosenType = t.dataset.type;
      $$('#catForm .type-option').forEach(el => el.classList.remove('active'));
      t.classList.add('active');
    });
    $('#catCancel').addEventListener('click', closeModal);
    $('#catForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const nc = {
        id: editing?.id || uid(),
        name: e.target.elements['name'].value.trim(),
        type: chosenType, icon: chosenIcon, color: chosenColor,
      };
      if (editing) state.data.categories[state.data.categories.findIndex(x => x.id === editing.id)] = nc;
      else state.data.categories.push(nc);
      saveData();
      closeModal();
      toast(editing ? 'Categoria atualizada' : 'Categoria criada');
      render();
    });
  });
}

function deleteCategory(id) {
  const usedBy = state.data.transactions.filter(t => t.categoryId === id).length;
  const msg = usedBy > 0 ? `${usedBy} transação(ões) usam esta categoria. Elas ficarão sem categoria. Continuar?` : 'Excluir esta categoria?';
  confirmDialog(msg, () => {
    state.data.categories = state.data.categories.filter(c => c.id !== id);
    state.data.transactions.forEach(t => { if (t.categoryId === id) t.categoryId = ''; });
    state.data.budgets = state.data.budgets.filter(b => b.categoryId !== id);
    saveData();
    toast('Categoria excluída');
    render();
  });
}

// ============================================================
// VIEW: BUDGETS
// ============================================================
function renderBudgets(c) {
  const month = currentMonthKey();
  const { start, end } = monthRange(month);
  c.innerHTML = `
    <div class="section-header">
      <div class="section-title-group">
        <div class="section-title">Orçamentos</div>
        <div class="section-subtitle">${monthLabel(month)}</div>
      </div>
      <button class="btn btn-primary btn-sm" id="addBudget">${icon('plus')}<span>Novo orçamento</span></button>
    </div>
    ${state.data.budgets.length === 0
      ? emptyState('target', 'Sem orçamentos', 'Defina limites por categoria para controlar seus gastos.', `<button class="btn btn-primary btn-sm" id="firstBudget">${icon('plus')}<span>Criar orçamento</span></button>`)
      : `<div class="grid grid-auto">${state.data.budgets.map(b => {
          const cat = state.data.categories.find(c => c.id === b.categoryId);
          if (!cat) return '';
          const spent = state.data.transactions
            .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date >= start && t.date <= end)
            .reduce((s, t) => s + Number(t.amount), 0);
          const pct = Math.min(999, (spent / b.amount) * 100);
          const cls = pct > 100 ? 'danger' : pct > 80 ? 'warning' : 'success';
          return `
            <div class="budget-item">
              <div class="bg-header">
                <div class="bg-title">
                  <div class="bg-title-icon" style="background:${cat.color}22;color:${cat.color};">${cat.icon}</div>
                  <span>${escapeHtml(cat.name)}</span>
                </div>
                <div class="tx-actions">
                  <button class="icon-btn icon-btn-sm" data-bud-edit="${b.id}">${icon('pencil')}</button>
                  <button class="icon-btn icon-btn-sm" data-bud-del="${b.id}">${icon('trash-2')}</button>
                </div>
              </div>
              <div class="progress"><div class="progress-bar ${cls}" style="width:${Math.min(100, pct)}%;"></div></div>
              <div class="bg-values">
                <span>${fmtBRL(spent)} de ${fmtBRL(b.amount)}</span>
                <span style="color:${pct > 100 ? 'var(--danger)' : 'var(--text-muted)'};font-weight:600;">${pct.toFixed(0)}%</span>
              </div>
            </div>
          `;
        }).join('')}</div>`
    }
  `;
  $('#addBudget')?.addEventListener('click', () => openBudgetModal());
  $('#firstBudget')?.addEventListener('click', () => openBudgetModal());
  c.querySelectorAll('[data-bud-edit]').forEach(b => b.addEventListener('click', () => openBudgetModal(b.dataset.budEdit)));
  c.querySelectorAll('[data-bud-del]').forEach(b => b.addEventListener('click', () => deleteBudget(b.dataset.budDel)));
}

function openBudgetModal(editId = null) {
  const editing = editId ? state.data.budgets.find(b => b.id === editId) : null;
  const b = editing || { categoryId: '', amount: '' };
  const expenseCats = state.data.categories.filter(c => c.type === 'expense');
  const body = `
    <form id="budForm">
      <div class="form-group">
        <label class="form-label">${icon('tag')}<span>Categoria</span></label>
        <select class="form-select" name="categoryId" required autofocus>
          <option value="">Selecione</option>
          ${expenseCats.map(c => `<option value="${c.id}" ${c.id===b.categoryId?'selected':''}>${c.icon} ${escapeHtml(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('dollar-sign')}<span>Limite mensal (R$)</span></label>
        <input type="number" step="0.01" min="0" class="form-input" name="amount" value="${b.amount}" required>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="budCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>${editing ? 'Salvar' : 'Criar'}</span></button>
      </div>
    </form>
  `;
  openModal(editing ? 'Editar Orçamento' : 'Novo Orçamento', body, () => {
    $('#budCancel').addEventListener('click', closeModal);
    $('#budForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const catId = f.categoryId.value;
      if (!editing && state.data.budgets.some(x => x.categoryId === catId)) return toast('Já existe orçamento para esta categoria', 'warning');
      const nb = { id: editing?.id || uid(), categoryId: catId, amount: parseFloat(f.amount.value) };
      if (editing) state.data.budgets[state.data.budgets.findIndex(x => x.id === editing.id)] = nb;
      else state.data.budgets.push(nb);
      saveData();
      closeModal();
      toast(editing ? 'Orçamento atualizado' : 'Orçamento criado');
      render();
    });
  });
}
function deleteBudget(id) {
  confirmDialog('Excluir este orçamento?', () => {
    state.data.budgets = state.data.budgets.filter(b => b.id !== id);
    saveData();
    toast('Orçamento excluído');
    render();
  });
}

// ============================================================
// VIEW: GOALS
// ============================================================
function renderGoals(c) {
  c.innerHTML = `
    <div class="section-header">
      <div class="section-title-group">
        <div class="section-title">Metas de Economia</div>
        <div class="section-subtitle">${state.data.goals.length} meta${state.data.goals.length !== 1 ? 's' : ''}</div>
      </div>
      <button class="btn btn-primary btn-sm" id="addGoal">${icon('plus')}<span>Nova meta</span></button>
    </div>
    ${state.data.goals.length === 0
      ? emptyState('trophy', 'Sem metas', 'Defina objetivos: viagem, reserva, compra...', `<button class="btn btn-primary btn-sm" id="firstGoal">${icon('plus')}<span>Criar meta</span></button>`)
      : `<div class="grid grid-auto">${state.data.goals.map(g => {
          const saved = Number(g.current || 0);
          const pct = g.target > 0 ? Math.min(100, (saved / g.target) * 100) : 0;
          const remaining = Math.max(0, g.target - saved);
          return `
            <div class="goal-item">
              <div class="bg-header">
                <div class="bg-title">
                  <div class="bg-title-icon" style="background:var(--gradient-soft);">${g.icon || '🏆'}</div>
                  <span>${escapeHtml(g.name)}</span>
                </div>
                <div class="tx-actions">
                  <button class="icon-btn icon-btn-sm" data-goal-add="${g.id}" title="Adicionar valor">${icon('plus')}</button>
                  <button class="icon-btn icon-btn-sm" data-goal-edit="${g.id}">${icon('pencil')}</button>
                  <button class="icon-btn icon-btn-sm" data-goal-del="${g.id}">${icon('trash-2')}</button>
                </div>
              </div>
              <div class="progress"><div class="progress-bar success" style="width:${pct}%;"></div></div>
              <div class="bg-values">
                <span>${fmtBRL(saved)} / ${fmtBRL(g.target)}</span>
                <span style="font-weight:600;">${pct.toFixed(0)}%</span>
              </div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;display:flex;align-items:center;gap:0.375rem;">
                ${remaining > 0 ? `${icon('trending-up', 'xs')}<span>Faltam ${fmtBRL(remaining)}</span>` : `${icon('party-popper', 'xs')}<span style="color:var(--success);font-weight:600;">Meta atingida!</span>`}
                ${g.deadline ? ` <span style="margin-left:auto;">${fmtDateFull(g.deadline)}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}</div>`
    }
  `;
  $('#addGoal')?.addEventListener('click', () => openGoalModal());
  $('#firstGoal')?.addEventListener('click', () => openGoalModal());
  c.querySelectorAll('[data-goal-edit]').forEach(b => b.addEventListener('click', () => openGoalModal(b.dataset.goalEdit)));
  c.querySelectorAll('[data-goal-del]').forEach(b => b.addEventListener('click', () => deleteGoal(b.dataset.goalDel)));
  c.querySelectorAll('[data-goal-add]').forEach(b => b.addEventListener('click', () => addToGoal(b.dataset.goalAdd)));
}

function openGoalModal(editId = null) {
  const editing = editId ? state.data.goals.find(g => g.id === editId) : null;
  const g = editing || { name: '', target: '', current: 0, deadline: '', icon: '🏆' };
  const body = `
    <form id="goalForm">
      <div class="form-group">
        <label class="form-label">${icon('trophy')}<span>Nome da meta</span></label>
        <input type="text" class="form-input" name="name" value="${escapeHtml(g.name)}" placeholder="Ex: Viagem, Reserva de emergência..." required autofocus>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${icon('target')}<span>Valor alvo (R$)</span></label>
          <input type="number" step="0.01" min="0" class="form-input" name="target" value="${g.target}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${icon('piggy-bank')}<span>Já economizado</span></label>
          <input type="number" step="0.01" min="0" class="form-input" name="current" value="${g.current}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('calendar')}<span>Data limite (opcional)</span></label>
        <input type="date" class="form-input" name="deadline" value="${g.deadline || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">${icon('smile')}<span>Ícone</span></label>
        <div class="icon-picker" id="goalIcons"></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="goalCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>${editing ? 'Salvar' : 'Criar'}</span></button>
      </div>
    </form>
  `;
  openModal(editing ? 'Editar Meta' : 'Nova Meta', body, () => {
    let chosenIcon = g.icon;
    const ic = $('#goalIcons');
    ic.innerHTML = ICON_OPTIONS.map(i => `<div class="icon-option ${i===chosenIcon?'active':''}" data-icon="${i}">${i}</div>`).join('');
    ic.addEventListener('click', (e) => {
      const t = e.target.closest('[data-icon]'); if (!t) return;
      chosenIcon = t.dataset.icon;
      ic.querySelectorAll('.icon-option').forEach(el => el.classList.toggle('active', el.dataset.icon === chosenIcon));
    });
    $('#goalCancel').addEventListener('click', closeModal);
    $('#goalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const ng = {
        id: editing?.id || uid(),
        name: f.elements['name'].value.trim(),
        target: parseFloat(f.elements['target'].value) || 0,
        current: parseFloat(f.elements['current'].value) || 0,
        deadline: f.elements['deadline'].value || null,
        icon: chosenIcon,
      };
      if (editing) state.data.goals[state.data.goals.findIndex(x => x.id === editing.id)] = ng;
      else state.data.goals.push(ng);
      saveData();
      closeModal();
      toast(editing ? 'Meta atualizada' : 'Meta criada');
      render();
    });
  });
}

function addToGoal(id) {
  const goal = state.data.goals.find(g => g.id === id);
  if (!goal) return;
  const body = `
    <form id="goalAddForm">
      <div class="form-group">
        <label class="form-label">${icon('plus-circle')}<span>Adicionar à ${escapeHtml(goal.name)}</span></label>
        <input type="number" step="0.01" min="0" class="form-input" name="amount" placeholder="0,00" required autofocus>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="gaCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>Adicionar</span></button>
      </div>
    </form>
  `;
  openModal('Adicionar à Meta', body, () => {
    $('#gaCancel').addEventListener('click', closeModal);
    $('#goalAddForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = parseFloat(e.target.amount.value);
      if (!(v > 0)) return;
      goal.current = Number(goal.current || 0) + v;
      saveData();
      closeModal();
      toast('Valor adicionado à meta');
      render();
    });
  });
}

function deleteGoal(id) {
  confirmDialog('Excluir esta meta?', () => {
    state.data.goals = state.data.goals.filter(g => g.id !== id);
    saveData();
    toast('Meta excluída');
    render();
  });
}

// ============================================================
// VIEW: RECURRING
// ============================================================
function renderRecurring(c) {
  c.innerHTML = `
    <div class="section-header">
      <div class="section-title-group">
        <div class="section-title">Transações Recorrentes</div>
        <div class="section-subtitle">Aplicadas automaticamente no dia do mês configurado</div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" id="applyRecNow" title="Aplica agora as pendentes deste mês">${icon('play')}<span>Aplicar agora</span></button>
        <button class="btn btn-primary btn-sm" id="addRec">${icon('plus')}<span>Nova recorrente</span></button>
      </div>
    </div>
    ${state.data.recurring.length === 0
      ? emptyState('repeat', 'Sem recorrências', 'Cadastre salário, aluguel, assinaturas...', `<button class="btn btn-primary btn-sm" id="firstRec">${icon('plus')}<span>Criar recorrência</span></button>`)
      : `<div class="transaction-list">${state.data.recurring.map(r => {
          const cat = state.data.categories.find(c => c.id === r.categoryId);
          const acc = state.data.accounts.find(a => a.id === r.accountId);
          return `
            <div class="transaction-item">
              <div class="tx-icon" style="background:${(cat?.color||'#6366f1')}22;color:${cat?.color||'#6366f1'};">${cat?.icon || '🔁'}</div>
              <div class="tx-body">
                <div class="tx-title">${escapeHtml(r.description)}</div>
                <div class="tx-meta">Dia ${r.day} • ${cat?.name || 'Sem categoria'}${acc ? ' • ' + escapeHtml(acc.name) : ''}</div>
              </div>
              <div class="tx-amount ${r.type}">${r.type==='income'?'+':'−'}${fmtBRL(r.amount)}</div>
              <div class="tx-actions">
                <button class="icon-btn icon-btn-sm" data-rec-edit="${r.id}">${icon('pencil')}</button>
                <button class="icon-btn icon-btn-sm" data-rec-del="${r.id}">${icon('trash-2')}</button>
              </div>
            </div>
          `;
        }).join('')}</div>`
    }
  `;
  $('#addRec')?.addEventListener('click', () => openRecurringModal());
  $('#firstRec')?.addEventListener('click', () => openRecurringModal());
  $('#applyRecNow')?.addEventListener('click', () => {
    const n = applyRecurringRules();
    if (n === 0) toast('Nenhuma recorrência pendente para este mês', 'info');
    render();
  });
  c.querySelectorAll('[data-rec-edit]').forEach(b => b.addEventListener('click', () => openRecurringModal(b.dataset.recEdit)));
  c.querySelectorAll('[data-rec-del]').forEach(b => b.addEventListener('click', () => deleteRecurring(b.dataset.recDel)));
}

function openRecurringModal(editId = null) {
  const editing = editId ? state.data.recurring.find(r => r.id === editId) : null;
  const r = editing || {
    type: 'expense', amount: '', day: 5, description: '', categoryId: '',
    accountId: state.data.accounts[0]?.id || '', lastApplied: ''
  };
  const body = `
    <form id="recForm">
      <div class="type-selector" style="grid-template-columns:1fr 1fr;">
        <div class="type-option income ${r.type==='income'?'active':''}" data-type="income">${icon('arrow-down-left')}<span>Receita</span></div>
        <div class="type-option expense ${r.type==='expense'?'active':''}" data-type="expense">${icon('arrow-up-right')}<span>Despesa</span></div>
      </div>
      <div class="form-row" style="margin-top:1rem;">
        <div class="form-group">
          <label class="form-label">${icon('dollar-sign')}<span>Valor (R$)</span></label>
          <input type="number" step="0.01" min="0" class="form-input" name="amount" value="${r.amount}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${icon('calendar')}<span>Dia do mês</span></label>
          <input type="number" min="1" max="31" class="form-input" name="day" value="${r.day}" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${icon('file-text')}<span>Descrição</span></label>
        <input type="text" class="form-input" name="description" value="${escapeHtml(r.description)}" placeholder="Ex: Salário, Aluguel..." required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${icon('tag')}<span>Categoria</span></label>
          <select class="form-select" name="categoryId" id="recCat"></select>
        </div>
        <div class="form-group">
          <label class="form-label">${icon('wallet')}<span>Conta</span></label>
          <select class="form-select" name="accountId">
            ${state.data.accounts.map(a => `<option value="${a.id}" ${a.id===r.accountId?'selected':''}>${escapeHtml(a.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="recCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icon('check')}<span>${editing ? 'Salvar' : 'Criar'}</span></button>
      </div>
    </form>
  `;
  openModal(editing ? 'Editar Recorrente' : 'Nova Recorrente', body, () => {
    let chosenType = r.type;
    const refreshCats = () => {
      $('#recCat').innerHTML = state.data.categories
        .filter(c => c.type === chosenType)
        .map(c => `<option value="${c.id}" ${c.id===r.categoryId?'selected':''}>${c.icon} ${escapeHtml(c.name)}</option>`).join('');
    };
    refreshCats();
    document.querySelector('#recForm .type-selector').addEventListener('click', (e) => {
      const t = e.target.closest('[data-type]'); if (!t) return;
      chosenType = t.dataset.type;
      $$('#recForm .type-option').forEach(el => el.classList.remove('active'));
      t.classList.add('active');
      refreshCats();
    });
    $('#recCancel').addEventListener('click', closeModal);
    $('#recForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const nr = {
        id: editing?.id || uid(), type: chosenType,
        amount: parseFloat(f.amount.value),
        day: Math.min(31, Math.max(1, parseInt(f.day.value))),
        description: f.description.value.trim(),
        categoryId: f.categoryId.value,
        accountId: f.accountId.value,
        lastApplied: editing?.lastApplied || '',
      };
      if (editing) state.data.recurring[state.data.recurring.findIndex(x => x.id === editing.id)] = nr;
      else state.data.recurring.push(nr);
      saveData();
      closeModal();
      toast(editing ? 'Recorrência atualizada' : 'Recorrência criada');
      render();
    });
  });
}
function deleteRecurring(id) {
  confirmDialog('Excluir esta recorrência? (Transações passadas permanecem)', () => {
    state.data.recurring = state.data.recurring.filter(r => r.id !== id);
    saveData();
    toast('Recorrência excluída');
    render();
  });
}

function applyRecurringRules() {
  const today = todayISO();
  const todayDay = parseInt(today.slice(8, 10));
  const curMonth = today.slice(0, 7);
  let applied = 0;

  state.data.recurring.forEach(r => {
    if (r.lastApplied === curMonth) return;
    if (r.day > todayDay) return;

    const dateToUse = `${curMonth}-${String(r.day).padStart(2, '0')}`;
    state.data.transactions.push({
      id: uid(), type: r.type, amount: r.amount, date: dateToUse,
      description: r.description + ' (recorrente)',
      categoryId: r.categoryId, accountId: r.accountId,
      createdAt: new Date().toISOString(), recurringId: r.id,
    });
    r.lastApplied = curMonth;
    applied++;
  });

  if (applied > 0) {
    saveData();
    toast(`${applied} recorrência(s) aplicada(s)`, 'info');
  }
  return applied;
}

// ============================================================
// VIEW: REPORTS
// ============================================================
function renderReports(c) {
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(addMonths(currentMonthKey(), -i));
  c.innerHTML = `
    <div class="grid grid-2">
      <div class="chart-card">
        <div class="card-title"><div class="card-title-left">${icon('bar-chart-3')}<span>Receitas vs Despesas (6 meses)</span></div></div>
        <div class="chart-wrap"><canvas id="chartBars"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="card-title"><div class="card-title-left">${icon('trending-up')}<span>Saldo mensal</span></div></div>
        <div class="chart-wrap"><canvas id="chartLine"></canvas></div>
      </div>
    </div>
    <div class="grid grid-2" style="margin-top:1.25rem;">
      <div class="chart-card">
        <div class="card-title"><div class="card-title-left">${icon('list-ordered')}<span>Top categorias (despesas)</span></div></div>
        <div class="chart-wrap"><canvas id="chartTop"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="card-title"><div class="card-title-left">${icon('pie-chart')}<span>Distribuição por conta</span></div></div>
        <div class="chart-wrap"><canvas id="chartAcc"></canvas></div>
      </div>
    </div>
  `;
  drawReportsCharts(months);
}

// ============================================================
// VIEW: SETTINGS
// ============================================================
function renderSettings(c) {
  const ap = state.appearance;
  const u = state.user;

  c.innerHTML = `
    <div class="grid grid-2">
      <!-- ================== PERFIL ================== -->
      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('user')}<span>Seu perfil</span></div></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.875rem;">Personalize como você aparece no aplicativo.</p>

        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
          <div class="user-avatar" style="width:64px;height:64px;font-size:2rem;">${u.avatar || '💼'}</div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:1.125rem;">${escapeHtml(u.name || 'Você')}</div>
            <div style="font-size:0.8125rem;color:var(--text-muted);">${escapeHtml(u.title || '')}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">${icon('type')}<span>Nome</span></label>
          <input type="text" class="form-input" id="uName" value="${escapeHtml(u.name || '')}" maxlength="40" placeholder="Seu nome">
        </div>
        <div class="form-group">
          <label class="form-label">${icon('briefcase')}<span>Título / subtítulo</span></label>
          <input type="text" class="form-input" id="uTitle" value="${escapeHtml(u.title || '')}" maxlength="60" placeholder="Ex: Gestão Financeira, Analista...">
        </div>
        <div class="form-group">
          <label class="form-label">${icon('smile')}<span>Avatar</span></label>
          <div class="avatar-grid" id="avatarGrid">
            ${AVATAR_OPTIONS.map(av => `<div class="avatar-opt ${av===u.avatar?'active':''}" data-avatar="${av}">${av}</div>`).join('')}
          </div>
        </div>
      </div>

      <!-- ================== TEMA ================== -->
      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('palette')}<span>Tema de cores</span></div><span class="badge income">${THEMES.length}</span></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.875rem;">Escolha a paleta. Dica: pressione <kbd>T</kbd> para alternar rápido entre claro e escuro.</p>
        <div class="theme-grid">
          ${THEMES.map(t => `
            <div class="theme-swatch ${ap.theme===t.id?'active':''}" data-theme-id="${t.id}" title="${t.name}">
              <div class="theme-swatch-preview">
                <div style="background:${t.colors[0]};"></div>
                <div style="background:${t.colors[1]};"></div>
                <div style="background:${t.colors[2]};"></div>
              </div>
              <div class="theme-swatch-label">
                <span class="theme-swatch-name">${t.name}</span>
                <span class="theme-swatch-kind">${t.kind}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================== COR DE DESTAQUE ================== -->
      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('droplet')}<span>Cor de destaque</span></div></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.875rem;">Sobrescreve a cor primária do tema escolhido. Afeta botões, links e realces.</p>
        <div class="accent-picker">
          <div class="accent-chip accent-auto ${!ap.accent ? 'active' : ''}" data-accent="" title="Usar cor do tema"></div>
          ${ACCENT_PALETTE.map(hex => `
            <div class="accent-chip ${ap.accent === hex ? 'active' : ''}" style="background:${hex};" data-accent="${hex}" title="${hex}"></div>
          `).join('')}
          <label class="accent-chip accent-custom" title="Cor personalizada" style="position:relative;">
            ${icon('pipette', 'xs')}
            <input type="color" id="accentCustom" value="${ap.accent || '#6366f1'}" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
          </label>
        </div>
        ${ap.accent ? `<p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.625rem;">Atual: <code style="color:${ap.accent};font-weight:700;">${ap.accent}</code></p>` : ''}
      </div>

      <!-- ================== LAYOUT & TIPOGRAFIA ================== -->
      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('sliders')}<span>Layout & Tipografia</span></div></div>

        <div class="setting-row">
          <div>
            <div class="setting-row-label">Escala da fonte</div>
            <div class="setting-row-desc">Tamanho geral dos textos</div>
          </div>
          <div class="segmented" id="fontScaleSeg">
            <button data-fs="0.9" class="${ap.fontScale===0.9?'active':''}">90%</button>
            <button data-fs="1" class="${ap.fontScale===1?'active':''}">100%</button>
            <button data-fs="1.1" class="${ap.fontScale===1.1?'active':''}">110%</button>
            <button data-fs="1.25" class="${ap.fontScale===1.25?'active':''}">125%</button>
          </div>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-row-label">Densidade</div>
            <div class="setting-row-desc">Espaçamento interno dos cards</div>
          </div>
          <div class="segmented" id="densitySeg">
            <button data-dn="compact" class="${ap.density==='compact'?'active':''}">Compacto</button>
            <button data-dn="normal" class="${ap.density==='normal'?'active':''}">Normal</button>
            <button data-dn="comfortable" class="${ap.density==='comfortable'?'active':''}">Confortável</button>
          </div>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-row-label">Cantos</div>
            <div class="setting-row-desc">Arredondamento dos componentes</div>
          </div>
          <div class="segmented" id="radiusSeg">
            <button data-rd="sharp" class="${ap.radius==='sharp'?'active':''}">Reto</button>
            <button data-rd="rounded" class="${ap.radius==='rounded'?'active':''}">Arredondado</button>
            <button data-rd="pill" class="${ap.radius==='pill'?'active':''}">Pílula</button>
          </div>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-row-label">Brilho ambiente</div>
            <div class="setting-row-desc">Gradientes coloridos no fundo</div>
          </div>
          <div class="switch ${ap.showGlow !== false ? 'on' : ''}" id="glowSwitch" role="switch" aria-checked="${ap.showGlow !== false}"></div>
        </div>

        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);display:flex;gap:0.5rem;">
          <button class="btn btn-ghost btn-sm" id="resetAppearance">${icon('rotate-ccw')}<span>Restaurar padrão</span></button>
        </div>
      </div>

      <!-- ================== BACKUP & DADOS ================== -->
      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('database')}<span>Backup & Dados</span></div></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.75rem;">${IS_ELECTRON ? 'Backups automáticos diários são salvos na pasta de dados. Você também pode exportar manualmente.' : 'Exporte para fazer backup dos seus dados.'}</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" id="exportBtn">${icon('download')}<span>Exportar JSON</span></button>
          <button class="btn btn-ghost btn-sm" id="exportCsvBtn">${icon('file-text')}<span>Exportar CSV</span></button>
          <button class="btn btn-ghost btn-sm" id="importBtn">${icon('upload')}<span>Importar</span></button>
          <input type="file" id="importFile" accept=".json" style="display:none;">
        </div>
        ${IS_ELECTRON ? `
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.625rem;">
            <button class="btn btn-ghost btn-sm" id="openUserDataBtn">${icon('folder-open')}<span>Pasta de dados</span></button>
            <button class="btn btn-ghost btn-sm" id="openBackupsBtn">${icon('archive')}<span>Pasta de backups</span></button>
            <button class="btn btn-ghost btn-sm" id="listBackupsBtn">${icon('history')}<span>Ver backups</span></button>
          </div>
        ` : ''}
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
          <button class="btn btn-danger btn-sm" id="resetBtn">${icon('alert-triangle')}<span>Resetar todos os dados</span></button>
        </div>
      </div>

      <!-- ================== SOBRE ================== -->
      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('info')}<span>Sobre</span></div></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);line-height:1.6;">
          <strong>${APP_NAME}</strong> • Gestão financeira 100% local e offline.
        </p>
        <div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem;font-size:0.8125rem;">
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Transações</span><strong>${state.data.transactions.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Contas</span><strong>${state.data.accounts.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Cartões</span><strong>${state.data.cards.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Categorias</span><strong>${state.data.categories.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Orçamentos</span><strong>${state.data.budgets.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Metas</span><strong>${state.data.goals.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Recorrentes</span><strong>${state.data.recurring.length}</strong></div>
        </div>
      </div>
    </div>
  `;

  // ----- Perfil -----
  const saveUserDebounced = debounce(() => { saveMeta(); renderUserCard(); }, 250);
  $('#uName').addEventListener('input', e => { state.user.name = e.target.value.slice(0, 40); saveUserDebounced(); });
  $('#uTitle').addEventListener('input', e => { state.user.title = e.target.value.slice(0, 60); saveUserDebounced(); });
  $('#avatarGrid').addEventListener('click', (e) => {
    const t = e.target.closest('[data-avatar]'); if (!t) return;
    state.user.avatar = t.dataset.avatar;
    $$('#avatarGrid .avatar-opt').forEach(el => el.classList.toggle('active', el.dataset.avatar === state.user.avatar));
    $('.card .user-avatar').textContent = state.user.avatar;
    saveMeta();
    renderUserCard();
  });

  // ----- Tema -----
  c.querySelectorAll('[data-theme-id]').forEach(el => {
    el.addEventListener('click', () => {
      state.appearance.theme = el.dataset.themeId;
      applyAppearance();
      saveMeta();
      c.querySelectorAll('[data-theme-id]').forEach(x => x.classList.toggle('active', x.dataset.themeId === state.appearance.theme));
    });
  });

  // ----- Accent -----
  c.querySelectorAll('[data-accent]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      state.appearance.accent = el.dataset.accent || null;
      applyAppearance();
      saveMeta();
      render();
    });
  });
  $('#accentCustom').addEventListener('input', (e) => {
    state.appearance.accent = e.target.value;
    applyAppearance();
  });
  $('#accentCustom').addEventListener('change', () => { saveMeta(); render(); });

  // ----- Font scale -----
  $('#fontScaleSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-fs]'); if (!b) return;
    state.appearance.fontScale = Number(b.dataset.fs);
    applyAppearance(); saveMeta();
    $$('#fontScaleSeg button').forEach(x => x.classList.toggle('active', x === b));
  });

  // ----- Densidade -----
  $('#densitySeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-dn]'); if (!b) return;
    state.appearance.density = b.dataset.dn;
    applyAppearance(); saveMeta();
    $$('#densitySeg button').forEach(x => x.classList.toggle('active', x === b));
  });

  // ----- Raio -----
  $('#radiusSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rd]'); if (!b) return;
    state.appearance.radius = b.dataset.rd;
    applyAppearance(); saveMeta();
    $$('#radiusSeg button').forEach(x => x.classList.toggle('active', x === b));
  });

  // ----- Glow switch -----
  $('#glowSwitch').addEventListener('click', () => {
    state.appearance.showGlow = !(state.appearance.showGlow !== false);
    applyAppearance(); saveMeta();
    $('#glowSwitch').classList.toggle('on', state.appearance.showGlow !== false);
  });

  $('#resetAppearance').addEventListener('click', () => {
    confirmDialog('Restaurar aparência padrão?', () => {
      state.appearance = { ...DEFAULT_APPEARANCE };
      applyAppearance();
      saveMeta();
      render();
      toast('Aparência restaurada');
    }, { danger: false, okText: 'Restaurar' });
  });

  // ----- Backup & Dados -----
  $('#exportBtn').addEventListener('click', exportData);
  $('#exportCsvBtn')?.addEventListener('click', exportCsv);
  $('#importBtn').addEventListener('click', () => {
    if (IS_ELECTRON) importData();
    else $('#importFile').click();
  });
  $('#importFile').addEventListener('change', importData);
  $('#openUserDataBtn')?.addEventListener('click', () => window.electronAPI.openUserDataFolder());
  $('#openBackupsBtn')?.addEventListener('click', () => window.electronAPI.openBackupsFolder());
  $('#listBackupsBtn')?.addEventListener('click', showBackupsModal);
  $('#resetBtn').addEventListener('click', () => {
    confirmDialog('Apagar TODOS os seus dados financeiros? (configurações de aparência serão preservadas)', () => {
      state.data = buildDefaultData();
      saveData();
      toast('Dados resetados');
      render();
    });
  });
}

// ---------- VALIDAÇÃO DE SCHEMA (import) ----------
const VALID_TX_TYPES = new Set(['income', 'expense', 'transfer']);
const VALID_ACC_TYPES = new Set(['checking', 'savings', 'cash', 'investment', 'other']);
const VALID_CAT_TYPES = new Set(['income', 'expense']);
const SAFE_ICON_RE = /^[\p{Extended_Pictographic}\u200d\uFE0F0-9#*]{1,6}$/u;
const SAFE_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

function sanitizeIcon(v, fallback = '📦') {
  const s = String(v ?? '');
  return SAFE_ICON_RE.test(s) ? s : fallback;
}
function sanitizeColor(v, fallback = '#6366f1') {
  const s = String(v ?? '');
  return SAFE_COLOR_RE.test(s) ? s : fallback;
}
function sanitizeStr(v, max = 200) {
  return String(v ?? '').slice(0, max);
}
function validateAndNormalizeData(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('JSON não é um objeto');
  const errs = [];
  const out = buildDefaultData();

  if (Array.isArray(raw.accounts)) {
    out.accounts = raw.accounts.filter(a => a && typeof a === 'object' && a.id && a.name).map(a => ({
      id: sanitizeStr(a.id, 40),
      name: sanitizeStr(a.name, 80),
      type: VALID_ACC_TYPES.has(a.type) ? a.type : 'other',
      balance: Number(a.balance) || 0,
      icon: sanitizeIcon(a.icon, '🏦'),
    }));
  } else errs.push('accounts');

  if (Array.isArray(raw.categories)) {
    out.categories = raw.categories.filter(c => c && c.id && c.name).map(c => ({
      id: sanitizeStr(c.id, 40),
      name: sanitizeStr(c.name, 60),
      type: VALID_CAT_TYPES.has(c.type) ? c.type : 'expense',
      icon: sanitizeIcon(c.icon),
      color: sanitizeColor(c.color),
    }));
  } else errs.push('categories');

  if (Array.isArray(raw.cards)) {
    out.cards = raw.cards.filter(c => c && c.id && c.name).map(c => ({
      id: sanitizeStr(c.id, 40),
      name: sanitizeStr(c.name, 60),
      last4: sanitizeStr(c.last4, 4).replace(/[^0-9]/g, ''),
      limit: Number(c.limit) || 0,
      closingDay: Math.min(31, Math.max(1, parseInt(c.closingDay) || 1)),
      dueDay: Math.min(31, Math.max(1, parseInt(c.dueDay) || 1)),
      color: CARD_COLORS.includes(c.color) ? c.color : 'purple',
    }));
  }

  if (Array.isArray(raw.transactions)) {
    out.transactions = raw.transactions.filter(t => t && t.id && VALID_TX_TYPES.has(t.type) && /^\d{4}-\d{2}-\d{2}$/.test(t.date)).map(t => ({
      id: sanitizeStr(t.id, 40),
      type: t.type,
      amount: Math.max(0, Number(t.amount) || 0),
      date: t.date,
      description: sanitizeStr(t.description, 200),
      notes: sanitizeStr(t.notes, 1000),
      categoryId: sanitizeStr(t.categoryId, 40),
      accountId: t.accountId ? sanitizeStr(t.accountId, 40) : null,
      toAccountId: t.toAccountId ? sanitizeStr(t.toAccountId, 40) : null,
      cardId: t.cardId ? sanitizeStr(t.cardId, 40) : null,
      createdAt: sanitizeStr(t.createdAt, 40) || new Date().toISOString(),
      updatedAt: sanitizeStr(t.updatedAt, 40),
      recurringId: t.recurringId ? sanitizeStr(t.recurringId, 40) : undefined,
    }));
  }

  if (Array.isArray(raw.budgets)) {
    out.budgets = raw.budgets.filter(b => b && b.id && b.categoryId).map(b => ({
      id: sanitizeStr(b.id, 40),
      categoryId: sanitizeStr(b.categoryId, 40),
      amount: Math.max(0, Number(b.amount) || 0),
    }));
  }

  if (Array.isArray(raw.goals)) {
    out.goals = raw.goals.filter(g => g && g.id && g.name).map(g => ({
      id: sanitizeStr(g.id, 40),
      name: sanitizeStr(g.name, 100),
      target: Math.max(0, Number(g.target) || 0),
      current: Math.max(0, Number(g.current) || 0),
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(g.deadline) ? g.deadline : null,
      icon: sanitizeIcon(g.icon, '🏆'),
    }));
  }

  if (Array.isArray(raw.recurring)) {
    out.recurring = raw.recurring.filter(r => r && r.id && VALID_CAT_TYPES.has(r.type)).map(r => ({
      id: sanitizeStr(r.id, 40),
      type: r.type,
      amount: Math.max(0, Number(r.amount) || 0),
      day: Math.min(31, Math.max(1, parseInt(r.day) || 1)),
      description: sanitizeStr(r.description, 200),
      categoryId: sanitizeStr(r.categoryId, 40),
      accountId: sanitizeStr(r.accountId, 40),
      lastApplied: sanitizeStr(r.lastApplied, 10),
    }));
  }

  if (errs.length) throw new Error('Campos obrigatórios ausentes: ' + errs.join(', '));
  return out;
}

// ---------- EXPORT ----------
function buildExportPayload() {
  return {
    app: APP_NAME, version: '2.0.0',
    exportedAt: new Date().toISOString(),
    user: state.user, appearance: state.appearance,
    data: state.data,
  };
}

function buildCsv() {
  const header = ['data', 'tipo', 'valor', 'categoria', 'conta', 'cartao', 'conta_destino', 'descricao', 'observacoes'];
  const catById = Object.fromEntries(state.data.categories.map(c => [c.id, c.name]));
  const accById = Object.fromEntries(state.data.accounts.map(a => [a.id, a.name]));
  const cardById = Object.fromEntries(state.data.cards.map(c => [c.id, c.name]));
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [...state.data.transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => [
      t.date, t.type, Number(t.amount).toFixed(2).replace('.', ','),
      catById[t.categoryId] || '',
      accById[t.accountId] || '',
      cardById[t.cardId] || '',
      accById[t.toAccountId] || '',
      t.description || '',
      (t.notes || '').replace(/\n/g, ' '),
    ].map(esc).join(';'));
  return '\ufeff' + [header.join(';'), ...rows].join('\r\n');
}

async function exportData() {
  const payload = buildExportPayload();
  const json = JSON.stringify(payload, null, 2);
  const safeName = (state.user.name || 'bank').replace(/[^a-zA-Z0-9_-]/g, '_');
  const defaultName = `bank_${safeName}_${todayISO()}.json`;

  if (IS_ELECTRON) {
    const r = await window.electronAPI.saveDialog({
      defaultName,
      content: json,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (r.ok) toast('Backup exportado');
    else if (!r.canceled) toast('Falha ao exportar', 'error');
    return;
  }
  downloadBlob(json, defaultName, 'application/json');
  toast('Backup exportado');
}

async function exportCsv() {
  if (state.data.transactions.length === 0) return toast('Sem transações para exportar', 'warning');
  const csv = buildCsv();
  const safeName = (state.user.name || 'bank').replace(/[^a-zA-Z0-9_-]/g, '_');
  const defaultName = `bank_${safeName}_${todayISO()}.csv`;

  if (IS_ELECTRON) {
    const r = await window.electronAPI.saveDialog({
      defaultName,
      content: csv,
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    });
    if (r.ok) toast('CSV exportado');
    else if (!r.canceled) toast('Falha ao exportar', 'error');
    return;
  }
  downloadBlob(csv, defaultName, 'text/csv;charset=utf-8');
  toast('CSV exportado');
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function showBackupsModal() {
  const res = await window.electronAPI.listBackups();
  if (!res?.ok) return toast('Falha ao listar backups', 'error');
  const files = res.files || [];
  const body = `
    <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.75rem;">Backups diários automáticos (últimos 14 dias). Abra a pasta para restaurar manualmente.</p>
    ${files.length === 0 ? `<div class="empty-text" style="padding:0.5rem;">Nenhum backup ainda. Faça alguma alteração para gerar o primeiro.</div>` : `
      <div class="transaction-list">
        ${files.map(f => `
          <div class="transaction-item">
            <div class="tx-icon" style="background:#6366f122;color:#6366f1;">📦</div>
            <div class="tx-body">
              <div class="tx-title">${escapeHtml(f.name)}</div>
              <div class="tx-meta">${new Date(f.mtime).toLocaleString('pt-BR')} • ${(f.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
    <div class="form-actions" style="margin-top:1rem;">
      <button class="btn btn-ghost" id="bkClose">Fechar</button>
      <button class="btn btn-primary" id="bkOpen">${icon('folder-open')}<span>Abrir pasta</span></button>
    </div>
  `;
  openModal('Backups automáticos', body, () => {
    $('#bkClose').addEventListener('click', closeModal);
    $('#bkOpen').addEventListener('click', () => window.electronAPI.openBackupsFolder());
  });
}

async function importData(e) {
  let text;
  if (IS_ELECTRON) {
    const r = await window.electronAPI.openDialog();
    if (!r.ok) { if (!r.canceled) toast('Falha ao abrir arquivo', 'error'); return; }
    text = r.content;
  } else {
    const file = e?.target?.files?.[0];
    if (!file) return;
    text = await file.text();
    e.target.value = '';
  }

  let parsed;
  try { parsed = JSON.parse(text); }
  catch { return toast('Arquivo não é JSON válido', 'error'); }

  // Extrai o bloco de dados (aceita formato novo, formato antigo multi-perfil, ou raw)
  let payload = null;
  let importedUser = null;
  let importedAppearance = null;

  if (parsed && parsed.data && typeof parsed.data === 'object') {
    payload = parsed.data;
    importedUser = parsed.user;
    importedAppearance = parsed.appearance;
  } else if (parsed && parsed.profiles && typeof parsed.profiles === 'object') {
    // Legado multi-perfil: pega o ativo ou o primeiro
    const activeKey = parsed.activeProfile;
    const firstKey = activeKey && parsed.profiles[activeKey] ? activeKey : Object.keys(parsed.profiles)[0];
    payload = firstKey ? parsed.profiles[firstKey] : null;
  } else if (parsed && (parsed.accounts || parsed.categories || parsed.transactions)) {
    payload = parsed;
  }

  if (!payload) return toast('Arquivo não contém dados reconhecíveis', 'error');

  let validated;
  try { validated = validateAndNormalizeData(payload); }
  catch (err) { return toast('Arquivo inválido: ' + err.message, 'error'); }

  confirmDialog('Importar dados? Isso SUBSTITUI todos os dados atuais.', () => {
    state.data = validated;
    if (importedUser) state.user = { ...DEFAULT_USER, ...importedUser };
    if (importedAppearance) {
      state.appearance = { ...DEFAULT_APPEARANCE, ...importedAppearance };
      applyAppearance();
    }
    saveData(); saveMeta(); renderUserCard();
    toast('Dados importados');
    render();
  });
}

// ============================================================
// CHARTS
// ============================================================
const cssVar = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();
const chartTextColor = () => cssVar('--text-muted');
const chartGridColor = () => cssVar('--border');

function drawEvolutionChart() {
  const ctx = document.getElementById('chartEvolution');
  if (!ctx) return;
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(addMonths(currentMonthKey(), -i));
  const income = months.map(m => monthlyStats(m).income);
  const expense = months.map(m => monthlyStats(m).expense);
  state.charts.evolution = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(monthLabel),
      datasets: [
        { label: 'Receitas', data: income, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)', tension: 0.4, fill: true, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointBorderWidth: 2 },
        { label: 'Despesas', data: expense, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.12)', tension: 0.4, fill: true, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointBorderWidth: 2 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: chartTextColor(), usePointStyle: true, pointStyle: 'circle' } } },
      scales: {
        x: { ticks: { color: chartTextColor() }, grid: { color: chartGridColor(), drawBorder: false } },
        y: { ticks: { color: chartTextColor(), callback: v => 'R$' + v }, grid: { color: chartGridColor(), drawBorder: false } },
      }
    }
  });
}

function drawCategoriesChart(month) {
  const ctx = document.getElementById('chartCategories');
  if (!ctx) return;
  const { start, end } = monthRange(month);
  const buckets = {};
  state.data.transactions.forEach(t => {
    if (t.type !== 'expense') return;
    if (t.date < start || t.date > end) return;
    buckets[t.categoryId] = (buckets[t.categoryId] || 0) + Number(t.amount);
  });
  const entries = Object.entries(buckets)
    .map(([id, v]) => ({ cat: state.data.categories.find(c => c.id === id), v }))
    .filter(x => x.cat).sort((a, b) => b.v - a.v);

  if (entries.length === 0) {
    ctx.parentElement.innerHTML = `<div class="empty" style="padding:1.5rem 0;"><div class="empty-icon">${icon('pie-chart')}</div><div class="empty-text">Sem despesas este mês</div></div>`;
    renderIcons(ctx.parentElement);
    return;
  }
  state.charts.categories = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: entries.map(e => e.cat.name), datasets: [{
      data: entries.map(e => e.v), backgroundColor: entries.map(e => e.cat.color),
      borderWidth: 2, borderColor: cssVar('--surface')
    }]},
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { color: chartTextColor(), boxWidth: 10, font: { size: 11 }, padding: 8, usePointStyle: true } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmtBRL(ctx.raw)}` } }
      }
    }
  });
}

function drawReportsCharts(months) {
  const income = months.map(m => monthlyStats(m).income);
  const expense = months.map(m => monthlyStats(m).expense);
  const balance = months.map(m => monthlyStats(m).balance);

  const bars = document.getElementById('chartBars');
  if (bars) state.charts.bars = new Chart(bars, {
    type: 'bar',
    data: { labels: months.map(monthLabel), datasets: [
      { label: 'Receitas', data: income, backgroundColor: '#10b981', borderRadius: 6 },
      { label: 'Despesas', data: expense, backgroundColor: '#ef4444', borderRadius: 6 },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: chartTextColor(), usePointStyle: true } } },
      scales: {
        x: { ticks: { color: chartTextColor() }, grid: { display: false } },
        y: { ticks: { color: chartTextColor(), callback: v => 'R$' + v }, grid: { color: chartGridColor(), drawBorder: false } },
      }
    }
  });

  const line = document.getElementById('chartLine');
  if (line) state.charts.line = new Chart(line, {
    type: 'line',
    data: { labels: months.map(monthLabel), datasets: [{
      label: 'Saldo', data: balance, borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.15)', tension: 0.4, fill: true,
      borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 2,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: chartTextColor(), usePointStyle: true } } },
      scales: {
        x: { ticks: { color: chartTextColor() }, grid: { color: chartGridColor(), drawBorder: false } },
        y: { ticks: { color: chartTextColor(), callback: v => 'R$' + v }, grid: { color: chartGridColor(), drawBorder: false } },
      }
    }
  });

  const buckets = {};
  state.data.transactions.forEach(t => {
    if (t.type !== 'expense') return;
    buckets[t.categoryId] = (buckets[t.categoryId] || 0) + Number(t.amount);
  });
  const top = Object.entries(buckets)
    .map(([id, v]) => ({ cat: state.data.categories.find(c => c.id === id), v }))
    .filter(x => x.cat).sort((a, b) => b.v - a.v).slice(0, 8);

  const topCtx = document.getElementById('chartTop');
  if (topCtx && top.length > 0) {
    state.charts.top = new Chart(topCtx, {
      type: 'bar',
      data: { labels: top.map(e => e.cat.name), datasets: [{ data: top.map(e => e.v), backgroundColor: top.map(e => e.cat.color), borderRadius: 6 }]},
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmtBRL(c.raw) } } },
        scales: {
          x: { ticks: { color: chartTextColor(), callback: v => 'R$' + v }, grid: { color: chartGridColor(), drawBorder: false } },
          y: { ticks: { color: chartTextColor() }, grid: { display: false } },
        }
      }
    });
  } else if (topCtx) {
    topCtx.parentElement.innerHTML = `<div class="empty" style="padding:1.5rem 0;"><div class="empty-icon">${icon('bar-chart-3')}</div><div class="empty-text">Sem despesas</div></div>`;
    renderIcons(topCtx.parentElement);
  }

  const accCtx = document.getElementById('chartAcc');
  if (accCtx) {
    const data = state.data.accounts.map(a => ({ name: a.name, v: accountBalance(a.id) })).filter(a => a.v > 0);
    if (data.length === 0) {
      accCtx.parentElement.innerHTML = `<div class="empty" style="padding:1.5rem 0;"><div class="empty-icon">${icon('landmark')}</div><div class="empty-text">Sem saldos positivos</div></div>`;
      renderIcons(accCtx.parentElement);
    } else {
      state.charts.acc = new Chart(accCtx, {
        type: 'doughnut',
        data: { labels: data.map(d => d.name), datasets: [{
          data: data.map(d => d.v),
          backgroundColor: ['#6366f1','#a855f7','#ec4899','#10b981','#f59e0b','#3b82f6','#14b8a6','#ef4444'],
          borderWidth: 2, borderColor: cssVar('--surface')
        }]},
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: chartTextColor(), boxWidth: 10, font: { size: 11 }, padding: 8, usePointStyle: true } },
            tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmtBRL(ctx.raw)}` } }
          }
        }
      });
    }
  }
}

// ============================================================
// APARÊNCIA (temas, densidade, fonte, raio, accent)
// ============================================================
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function shadeHex(hex, amount) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const channels = [0, 2, 4].map(i => {
    let n = parseInt(v.slice(i, i + 2), 16) + amount;
    return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  });
  return '#' + channels.join('');
}

function applyAppearance() {
  const ap = state.appearance;
  const root = document.documentElement;

  // Tema base
  root.setAttribute('data-theme', ap.theme || 'midnight');
  root.setAttribute('data-density', ap.density || 'normal');
  root.setAttribute('data-radius', ap.radius || 'rounded');

  // Cor de destaque customizada — sobrescreve o --primary do tema
  if (ap.accent) {
    root.style.setProperty('--primary', ap.accent);
    root.style.setProperty('--primary-hover', shadeHex(ap.accent, -20));
    root.style.setProperty('--primary-light', hexToRgba(ap.accent, 0.14));
    root.style.setProperty('--primary-ring', hexToRgba(ap.accent, 0.28));
    root.style.setProperty('--shadow-glow', `0 8px 32px ${hexToRgba(ap.accent, 0.3)}`);
  } else {
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-hover');
    root.style.removeProperty('--primary-light');
    root.style.removeProperty('--primary-ring');
    root.style.removeProperty('--shadow-glow');
  }

  // Escala de fonte (muda o tamanho do <html>)
  const scale = Number(ap.fontScale) || 1;
  root.style.setProperty('font-size', `${Math.round(14 * scale * 10) / 10}px`);

  // Brilho ambiente
  const glow = document.querySelector('.bg-gradients');
  if (glow) glow.style.display = ap.showGlow === false ? 'none' : '';

  // Atualiza botão de tema rápido (moon/sun) da sidebar
  const curr = THEMES.find(t => t.id === ap.theme);
  const isDark = curr?.kind === 'dark';
  const ic = $('#themeIcon');
  const lb = $('#themeLabel');
  if (ic) {
    ic.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    renderIcons($('#themeToggle'));
  }
  if (lb) lb.textContent = isDark ? 'Modo claro' : 'Modo escuro';
}

function quickToggleTheme() {
  // Alterna entre o tema claro e escuro "padrão" preservando outras preferências
  const curr = THEMES.find(t => t.id === state.appearance.theme);
  const isDark = curr?.kind === 'dark';
  state.appearance.theme = isDark ? 'daylight' : 'midnight';
  applyAppearance();
  saveMeta();
  render();
}

// ============================================================
// USER CARD (sidebar)
// ============================================================
function renderUserCard() {
  const c = $('#userCard');
  if (!c) return;
  c.innerHTML = `
    <button class="user-card-btn" id="userCardBtn" title="Editar perfil">
      <div class="user-avatar">${state.user.avatar || '💼'}</div>
      <div class="user-meta">
        <div class="user-name">${escapeHtml(state.user.name || 'Você')}</div>
        <div class="user-title">${escapeHtml(state.user.title || 'Gestão Financeira')}</div>
      </div>
      ${icon('settings-2', 'xs')}
    </button>
  `;
  renderIcons(c);
  $('#userCardBtn').addEventListener('click', () => { state.view = 'settings'; render(); });
}

// ============================================================
// SHORTCUTS MODAL
// ============================================================
function openShortcuts() {
  const body = `
    <div class="shortcuts-list">
      <div class="shortcut-row"><span class="label">Nova transação</span><span class="keys"><kbd>N</kbd></span></div>
      <div class="shortcut-row"><span class="label">Ir para Painel</span><span class="keys"><kbd>G</kbd> <kbd>D</kbd></span></div>
      <div class="shortcut-row"><span class="label">Ir para Transações</span><span class="keys"><kbd>G</kbd> <kbd>T</kbd></span></div>
      <div class="shortcut-row"><span class="label">Ir para Relatórios</span><span class="keys"><kbd>G</kbd> <kbd>R</kbd></span></div>
      <div class="shortcut-row"><span class="label">Mostrar atalhos</span><span class="keys"><kbd>?</kbd></span></div>
      <div class="shortcut-row"><span class="label">Fechar diálogo</span><span class="keys"><kbd>Esc</kbd></span></div>
      <div class="shortcut-row"><span class="label">Alternar tema</span><span class="keys"><kbd>T</kbd></span></div>
    </div>
  `;
  openModal('Atalhos do teclado', body);
}

// ============================================================
// INIT
// ============================================================
async function init() {
  // Se localStorage estiver vazio mas existir mirror em arquivo (Electron), restaura
  await tryRestoreFromMirror();

  const meta = loadMeta();
  if (meta) {
    state.user = { ...DEFAULT_USER, ...(meta.user || {}) };
    state.appearance = { ...DEFAULT_APPEARANCE, ...(meta.appearance || {}) };
  }
  state.data = loadData();

  applyAppearance();
  renderUserCard();
  saveMeta();
  applyRecurringRules();

  // Render Lucide icons in the static HTML
  renderIcons();

  // Navigation
  $$('.nav-item').forEach(n => n.addEventListener('click', () => {
    state.view = n.dataset.view;
    $('#sidebar').classList.remove('open');
    render();
  }));

  // Topbar
  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.add('open'));
  $('#sidebarClose').addEventListener('click', () => $('#sidebar').classList.remove('open'));
  $('#quickAddBtn').addEventListener('click', () => openTransactionModal());
  $('#fab').addEventListener('click', () => openTransactionModal());
  $('#shortcutsBtn').addEventListener('click', openShortcuts);

  $('#themeToggle').addEventListener('click', quickToggleTheme);

  $('#modalClose').addEventListener('click', closeModal);
  $('#modalOverlay').addEventListener('click', (e) => { if (e.target.id === 'modalOverlay') closeModal(); });
  $('#confirmOverlay').addEventListener('click', (e) => { if (e.target.id === 'confirmOverlay') $('#confirmOverlay').classList.remove('active'); });

  // Keyboard
  let goChord = false;
  document.addEventListener('keydown', (e) => {
    // ignore when typing
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = ['input', 'textarea', 'select'].includes(tag);

    if (e.key === 'Escape') {
      if ($('#modalOverlay').classList.contains('active')) closeModal();
      if ($('#confirmOverlay').classList.contains('active')) $('#confirmOverlay').classList.remove('active');
      return;
    }
    if (typing) return;

    if (e.key === '?') { e.preventDefault(); openShortcuts(); return; }
    if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); openTransactionModal(); return; }
    if (e.key.toLowerCase() === 't') { quickToggleTheme(); return; }
    if (e.key.toLowerCase() === 'g') { goChord = true; setTimeout(() => { goChord = false; }, 1200); return; }
    if (goChord) {
      const map = { d: 'dashboard', t: 'transactions', a: 'accounts', c: 'cards', r: 'reports', s: 'settings', b: 'budgets', m: 'goals', p: 'recurring' };
      const v = map[e.key.toLowerCase()];
      if (v) { state.view = v; render(); goChord = false; }
    }
  });

  render();
}

document.addEventListener('DOMContentLoaded', init);
