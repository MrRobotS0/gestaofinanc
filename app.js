// ============================================================
// Bank — Gestão Financeira Pessoal
// Persistência: localStorage (por perfil) — sem backend
// ============================================================

const STORAGE_PREFIX = 'bank_v1_';
const STORAGE_META = 'bank_meta_v1';
const APP_NAME = 'Bank';

const DEFAULT_PROFILES = ['Guilherme', 'Almir'];

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
  profile: null,
  theme: 'dark',
  profiles: [...DEFAULT_PROFILES],
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

// ---------- PERSISTÊNCIA ----------
function loadMeta() {
  try { return JSON.parse(localStorage.getItem(STORAGE_META) || 'null'); }
  catch { return null; }
}
function saveMeta() {
  localStorage.setItem(STORAGE_META, JSON.stringify({
    profile: state.profile, profiles: state.profiles, theme: state.theme,
  }));
}
function profileKey(name) { return STORAGE_PREFIX + name.toLowerCase().replace(/\s+/g, '_'); }

function loadProfileData(name) {
  try {
    const raw = localStorage.getItem(profileKey(name));
    if (!raw) return buildDefaultData();
    return { ...buildDefaultData(), ...JSON.parse(raw) };
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
function saveData() { localStorage.setItem(profileKey(state.profile), JSON.stringify(state.data)); }

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
  const monthTxs = state.data.transactions
    .filter(tx => monthKey(tx.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 8);

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
      </div>
      <div class="stat-card expense">
        <div class="stat-head">
          <div class="stat-label">Despesas do mês</div>
          <div class="stat-icon">${icon('trending-down')}</div>
        </div>
        <div class="stat-value" style="color:var(--danger);">${fmtBRL(stats.expense)}</div>
      </div>
      <div class="stat-card ${stats.balance >= 0 ? 'savings' : 'expense'}">
        <div class="stat-head">
          <div class="stat-label">Resultado do mês</div>
          <div class="stat-icon">${icon('piggy-bank')}</div>
        </div>
        <div class="stat-value" style="color:${stats.balance >= 0 ? 'var(--success)' : 'var(--danger)'};">${fmtBRL(stats.balance)}</div>
      </div>
    </div>

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
      ${monthTxs.length === 0 ? emptyState('inbox', 'Sem transações este mês', 'Clique em "Nova Transação" para começar.', `<button class="btn btn-primary btn-sm" id="emptyAdd">${icon('plus')}<span>Adicionar</span></button>`) : `<div class="transaction-list">${monthTxs.map(txItemHTML).join('')}</div>`}
    </div>
  `;

  // Month navigation
  $('#prevMonth').addEventListener('click', () => { state.dashMonth = addMonths(month, -1); render(); });
  $('#nextMonth').addEventListener('click', () => { state.dashMonth = addMonths(month, +1); render(); });
  c.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => { state.view = b.dataset.nav; render(); }));
  c.querySelectorAll('[data-tx-edit]').forEach(b => b.addEventListener('click', () => openTransactionModal(b.dataset.txEdit)));
  c.querySelectorAll('[data-tx-del]').forEach(b => b.addEventListener('click', () => deleteTransaction(b.dataset.txDel)));
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

  let list = [...state.data.transactions];
  if (filters.type) list = list.filter(t => t.type === filters.type);
  if (filters.categoryId) list = list.filter(t => t.categoryId === filters.categoryId);
  if (filters.accountId) list = list.filter(t => t.accountId === filters.accountId || t.toAccountId === filters.accountId);
  if (filters.from) list = list.filter(t => t.date >= filters.from);
  if (filters.to) list = list.filter(t => t.date <= filters.to);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(t => (t.description || '').toLowerCase().includes(q));
  }
  list.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));

  const income = list.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  c.innerHTML = `
    <div class="grid grid-3" style="margin-bottom:1rem;">
      <div class="stat-card income">
        <div class="stat-head">
          <div class="stat-label">Entradas</div>
          <div class="stat-icon">${icon('arrow-down-left')}</div>
        </div>
        <div class="stat-value" style="color:var(--success);">${fmtBRL(income)}</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-head">
          <div class="stat-label">Saídas</div>
          <div class="stat-icon">${icon('arrow-up-right')}</div>
        </div>
        <div class="stat-value" style="color:var(--danger);">${fmtBRL(expense)}</div>
      </div>
      <div class="stat-card balance">
        <div class="stat-head">
          <div class="stat-label">Resultado</div>
          <div class="stat-icon">${icon('equal')}</div>
        </div>
        <div class="stat-value" style="color:${income-expense>=0?'var(--success)':'var(--danger)'};">${fmtBRL(income - expense)}</div>
      </div>
    </div>

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

      ${list.length === 0 ? emptyState('search-x', 'Nenhuma transação encontrada', 'Ajuste os filtros ou adicione uma nova.') : `<div class="transaction-list">${list.map(txItemHTML).join('')}</div>`}
    </div>
  `;

  const refresh = () => {
    filters.q = $('#fQ').value;
    filters.type = $('#fType').value;
    filters.categoryId = $('#fCat').value;
    filters.accountId = $('#fAcc').value;
    filters.from = $('#fFrom').value;
    filters.to = $('#fTo').value;
    render();
  };
  $('#fQ').addEventListener('input', debounce(refresh, 250));
  $('#fType').addEventListener('change', refresh);
  $('#fCat').addEventListener('change', refresh);
  $('#fAcc').addEventListener('change', refresh);
  $('#fFrom').addEventListener('change', refresh);
  $('#fTo').addEventListener('change', refresh);
  $('#fClear').addEventListener('click', () => { state.txFilters = null; render(); });

  c.querySelectorAll('[data-tx-edit]').forEach(b => b.addEventListener('click', () => openTransactionModal(b.dataset.txEdit)));
  c.querySelectorAll('[data-tx-del]').forEach(b => b.addEventListener('click', () => deleteTransaction(b.dataset.txDel)));
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// ============================================================
// TRANSACTION MODAL
// ============================================================
function openTransactionModal(editId = null) {
  if (state.data.accounts.length === 0) {
    toast('Crie uma conta antes de adicionar transações', 'warning');
    state.view = 'accounts'; render();
    return;
  }
  const editing = editId ? state.data.transactions.find(t => t.id === editId) : null;
  const tx = editing || {
    type: 'expense', amount: '', date: todayISO(), description: '',
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
          <label class="form-label">${icon('dollar-sign')}<span>Valor (R$)</span></label>
          <input type="number" step="0.01" min="0" class="form-input" name="amount" value="${tx.amount}" required autofocus>
        </div>
        <div class="form-group">
          <label class="form-label">${icon('calendar')}<span>Data</span></label>
          <input type="date" class="form-input" name="date" value="${tx.date}" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${icon('file-text')}<span>Descrição</span></label>
        <input type="text" class="form-input" name="description" value="${escapeHtml(tx.description)}" placeholder="Ex: Supermercado, Salário...">
      </div>

      <div id="txFields"></div>

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

    $('#txForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const amount = parseFloat(f.amount.value);
      if (!(amount > 0)) return toast('Valor inválido', 'error');

      const newTx = {
        id: editing?.id || uid(), type: currentType, amount,
        date: f.date.value, description: f.description.value.trim(),
        notes: f.notes.value.trim(),
        createdAt: editing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (currentType === 'transfer') {
        newTx.accountId = f.accountId.value;
        newTx.toAccountId = f.toAccountId.value;
        if (newTx.accountId === newTx.toAccountId) return toast('Contas devem ser diferentes', 'error');
      } else {
        newTx.categoryId = f.categoryId.value;
        const pay = f.payment.value;
        if (pay.startsWith('card:')) { newTx.cardId = pay.slice(5); newTx.accountId = null; }
        else { newTx.accountId = pay.slice(4); newTx.cardId = null; }
      }

      if (editing) {
        const idx = state.data.transactions.findIndex(t => t.id === editing.id);
        state.data.transactions[idx] = newTx;
      } else {
        state.data.transactions.push(newTx);
      }
      saveData();
      closeModal();
      toast(editing ? 'Transação atualizada' : 'Transação adicionada');
      render();
    });
  });
}

function deleteTransaction(id) {
  confirmDialog('Excluir esta transação?', () => {
    state.data.transactions = state.data.transactions.filter(t => t.id !== id);
    saveData();
    toast('Transação excluída');
    render();
  });
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
        <div class="section-subtitle">Aplicadas automaticamente todo mês</div>
      </div>
      <button class="btn btn-primary btn-sm" id="addRec">${icon('plus')}<span>Nova recorrente</span></button>
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
  c.innerHTML = `
    <div class="grid grid-2">
      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('users')}<span>Perfis</span></div></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.75rem;">Renomeie os perfis. Os dados de cada perfil ficam separados.</p>
        <div class="form-group">
          <label class="form-label">Perfil 1</label>
          <input type="text" class="form-input" id="p1" value="${escapeHtml(state.profiles[0] || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Perfil 2</label>
          <input type="text" class="form-input" id="p2" value="${escapeHtml(state.profiles[1] || '')}">
        </div>
        <button class="btn btn-primary btn-sm" id="saveProfiles">${icon('check')}<span>Salvar nomes</span></button>
      </div>

      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('database')}<span>Backup</span></div></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.75rem;">Exporte/importe os dados do perfil atual como JSON.</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" id="exportBtn">${icon('download')}<span>Exportar</span></button>
          <button class="btn btn-ghost btn-sm" id="importBtn">${icon('upload')}<span>Importar</span></button>
          <input type="file" id="importFile" accept=".json" style="display:none;">
        </div>
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
          <button class="btn btn-danger btn-sm" id="resetBtn">${icon('alert-triangle')}<span>Resetar perfil</span></button>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('info')}<span>Sobre</span></div></div>
        <p style="font-size:0.8125rem;color:var(--text-muted);line-height:1.6;">
          <strong>${APP_NAME}</strong> é 100% local. Todos os dados ficam no navegador (localStorage).
          Não há servidor nem sincronização. Use a opção de exportar para fazer backups.
        </p>
        <div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem;font-size:0.8125rem;">
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Perfil ativo</span><strong>${escapeHtml(state.profile)}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Transações</span><strong>${state.data.transactions.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Contas</span><strong>${state.data.accounts.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Cartões</span><strong>${state.data.cards.length}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Categorias</span><strong>${state.data.categories.length}</strong></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><div class="card-title-left">${icon('palette')}<span>Aparência</span></div></div>
        <div class="form-group">
          <label class="form-label">Tema</label>
          <div class="type-selector" style="grid-template-columns:1fr 1fr;">
            <div class="type-option ${state.theme==='light'?'active income':''}" data-theme="light">${icon('sun')}<span>Claro</span></div>
            <div class="type-option ${state.theme==='dark'?'active income':''}" data-theme="dark">${icon('moon')}<span>Escuro</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  $('#saveProfiles').addEventListener('click', () => {
    const p1 = $('#p1').value.trim();
    const p2 = $('#p2').value.trim();
    if (!p1 || !p2) return toast('Nomes não podem ser vazios', 'error');
    if (p1.toLowerCase() === p2.toLowerCase()) return toast('Perfis devem ter nomes diferentes', 'error');
    const oldProfiles = [...state.profiles], oldActive = state.profile, newProfiles = [p1, p2];
    [0, 1].forEach(i => {
      if (oldProfiles[i] !== newProfiles[i]) {
        const oldKey = profileKey(oldProfiles[i]);
        const raw = localStorage.getItem(oldKey);
        if (raw) { localStorage.setItem(profileKey(newProfiles[i]), raw); localStorage.removeItem(oldKey); }
      }
    });
    state.profiles = newProfiles;
    if (oldActive === oldProfiles[0]) state.profile = newProfiles[0];
    else if (oldActive === oldProfiles[1]) state.profile = newProfiles[1];
    saveMeta();
    renderProfileButtons();
    toast('Perfis atualizados');
    render();
  });

  $('#exportBtn').addEventListener('click', exportData);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', importData);
  $('#resetBtn').addEventListener('click', () => {
    confirmDialog(`Apagar TODOS os dados do perfil "${state.profile}"?`, () => {
      state.data = buildDefaultData();
      saveData();
      toast('Dados resetados');
      render();
    });
  });

  c.querySelectorAll('[data-theme]').forEach(el => {
    el.addEventListener('click', () => {
      state.theme = el.dataset.theme;
      applyTheme();
      saveMeta();
      render();
    });
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify({
    app: APP_NAME, profile: state.profile,
    exportedAt: new Date().toISOString(), data: state.data,
  }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bank_${state.profile}_${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup exportado');
}
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      const data = parsed.data || parsed;
      if (!data.accounts || !data.categories) throw new Error('invalid');
      confirmDialog(`Importar dados? Isso SUBSTITUI tudo do perfil "${state.profile}".`, () => {
        state.data = { ...buildDefaultData(), ...data };
        saveData();
        toast('Dados importados');
        render();
      });
    } catch { toast('Arquivo inválido', 'error'); }
  };
  reader.readAsText(file);
  e.target.value = '';
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
// THEME
// ============================================================
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const ic = $('#themeIcon');
  const lb = $('#themeLabel');
  if (ic) {
    ic.setAttribute('data-lucide', state.theme === 'dark' ? 'sun' : 'moon');
    renderIcons($('#themeToggle'));
  }
  if (lb) lb.textContent = state.theme === 'dark' ? 'Modo claro' : 'Modo escuro';
}

// ============================================================
// PROFILE SWITCHER
// ============================================================
function renderProfileButtons() {
  const c = $('#profileButtons');
  c.innerHTML = state.profiles.map(p =>
    `<button class="profile-btn ${p===state.profile?'active':''}" data-profile="${escapeHtml(p)}">${escapeHtml(p)}</button>`
  ).join('');
  c.querySelectorAll('[data-profile]').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.profile === state.profile) return;
      state.profile = b.dataset.profile;
      state.data = loadProfileData(state.profile);
      saveMeta();
      renderProfileButtons();
      applyRecurringRules();
      render();
      toast(`Perfil: ${state.profile}`, 'info');
    });
  });
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
function init() {
  const meta = loadMeta();
  if (meta) {
    state.profiles = meta.profiles || DEFAULT_PROFILES;
    state.profile = meta.profile || state.profiles[0];
    state.theme = meta.theme || 'dark';
  } else {
    state.profile = state.profiles[0];
  }
  state.data = loadProfileData(state.profile);

  applyTheme();
  renderProfileButtons();
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

  $('#themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveMeta();
    render();
  });

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
    if (e.key.toLowerCase() === 't') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveMeta(); render(); return; }
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
