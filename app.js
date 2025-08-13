// ============ IndexedDB ============
const dbPromise = new Promise((resolve, reject) => {
  const open = indexedDB.open('productionDB', 1);
  open.onupgradeneeded = () => {
    const db = open.result;
    db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
  };
  open.onsuccess = () => resolve(open.result);
  open.onerror = () => reject(open.error);
});
async function db(store, mode, cb) {
  const database = await dbPromise;
  return new Promise((res, rej) => {
    const tx = database.transaction(store, mode);
    const req = cb(tx.objectStore(store));
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
const $ = s => document.querySelector(s);

// ============ Навигация ============
document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('section').forEach(sec => sec.hidden = true);
    document.querySelector(`#${btn.dataset.page}`).hidden = false;
    document.querySelectorAll('nav button').forEach(b => b.removeAttribute('data-active'));
    btn.setAttribute('data-active', '');
    if (btn.dataset.page === "reports-section") setTimeout(drawProductChart, 80);
  });
});

// ============ Быстрые кнопки количества ============
function renderQtyQuickBtns() {
  const saved = localStorage.getItem('qtyPresets') || '10,20,50,100,200,300,400,500';
  const values = saved.split(',').map(v => +v.trim()).filter(Boolean);
  const container = document.getElementById('qty-quick-btns');
  container.innerHTML = '';
  values.forEach(v => {
    const btn = document.createElement('button');
    btn.textContent = `+${v}`;
    btn.type = 'button';
    btn.className = 'qty-preset-btn';
    btn.onclick = () => {
      const input = document.getElementById('qty-input');
      input.value = ((parseFloat(input.value) || 0) + v);
      input.focus();
    };
    container.appendChild(btn);
  });
}
document.getElementById('save-qty-presets-btn').onclick = () => {
  localStorage.setItem('qtyPresets', document.getElementById('qty-presets').value.trim());
  renderQtyQuickBtns();
  updateStatus('✅ Быстрые значения сохранены');
};
function loadQtyPresetsUI() {
  document.getElementById('qty-presets').value =
    localStorage.getItem('qtyPresets') || '10,20,50,100,200,300,400,500';
}

// ============ Видимость голосового ввода/комментариев ============
document.getElementById('save-visibility-btn').onclick = function () {
  localStorage.setItem('showVoice', document.getElementById('enable-voice').checked ? '1' : '');
  localStorage.setItem('showComments', document.getElementById('enable-comments').checked ? '1' : '');
  applyVisibilityPrefs();
  updateStatus('⚙️ Видимость элементов обновлена');
};
function applyVisibilityPrefs() {
  const showVoice = !!localStorage.getItem('showVoice');
  const showComments = !!localStorage.getItem('showComments');
  document.getElementById('voice-btn').style.display = showVoice ? '' : 'none';
  document.getElementById('comment-input').style.display = showComments ? '' : 'none';
  document.getElementById('comment-suggest').style.display = showComments ? '' : 'none';
  const label = document.getElementById('comment-label');
  if (label) label.style.display = showComments ? '' : 'none';
}
function loadVisibilityPrefsUI() {
  document.getElementById('enable-voice').checked =
    localStorage.getItem('showVoice') !== '' ? !!localStorage.getItem('showVoice') : true;
  document.getElementById('enable-comments').checked =
    localStorage.getItem('showComments') !== '' ? !!localStorage.getItem('showComments') : true;
}

// ============ Персонализация ============
function applyUIPrefs() {
  const prefs = JSON.parse(localStorage.getItem('uiPrefs') || '{}');
  ['add', 'products', 'reports', 'settings'].forEach(id => {
    const sec = document.getElementById(id + '-section');
    if (sec) sec.style.display = (prefs['show-' + id] === false) ? 'none' : '';
    document.querySelectorAll(`nav button[data-page="${id}-section"]`).forEach(btn => {
      btn.style.display = (prefs['show-' + id] === false) ? 'none' : '';
    });
  });
}
function loadUIPrefsUI() {
  const prefs = JSON.parse(localStorage.getItem('uiPrefs') || '{}');
  ['add', 'products', 'reports', 'settings'].forEach(id => {
    document.getElementById('show-' + id).checked = prefs['show-' + id] !== false;
  });
}
document.getElementById('save-ui-prefs-btn').onclick = function () {
  const prefs = {};
  ['add', 'products', 'reports', 'settings'].forEach(id => {
    prefs['show-' + id] = document.getElementById('show-' + id).checked;
  });
  localStorage.setItem('uiPrefs', JSON.stringify(prefs));
  applyUIPrefs();
  updateStatus('✅ Отображение разделов обновлено');
};

// ============ Режим одной руки ============
document.getElementById('save-one-hand-btn').onclick = function () {
  const enabled = document.getElementById('one-hand-mode').checked;
  localStorage.setItem('oneHandMode', enabled ? '1' : '');
  setOneHandMode(enabled);
  updateStatus(`✅ Режим одной руки ${enabled ? 'включён' : 'выключен'}`);
};
function setOneHandMode(flag) {
  document.body.classList.toggle('one-hand', !!flag);
}
function loadOneHandModeUI() {
  const flag = !!localStorage.getItem('oneHandMode');
  document.getElementById('one-hand-mode').checked = flag;
  setOneHandMode(flag);
}

// ============ Темы ============
const trendyColors = [
  { name: 'Синий', code: '#1976d2' },
  { name: 'Оранжевый', code: '#fd6f21' },
  { name: 'Фиолетовый', code: '#9b45e4' },
  { name: 'Изумруд', code: '#43a047' },
  { name: 'Красный', code: '#ef5350' },
  { name: 'Тёмный', code: '#373737' },
  { name: 'Классика', code: '#222' },
  { name: 'Белый', code: '#fff' },
  { name: 'Розовый', code: '#ff80ab' }
];
function renderColorPalette() {
  const palette = document.getElementById('color-palette');
  const savedColor = localStorage.getItem('themeColor') || '#1976d2';
  palette.innerHTML = '';
  trendyColors.forEach(col => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = col.name;
    btn.style.background = col.code;
    btn.style.border = (savedColor === col.code) ? '2px solid #555' : '1px solid #aaa';
    btn.style.width = '28px';
    btn.style.height = '28px';
    btn.style.borderRadius = '50%';
    btn.onclick = () => {
      document.getElementById('custom-color').value = col.code;
      [...palette.children].forEach(x => x.style.border = '1px solid #aaa');
      btn.style.border = '2px solid #555';
    };
    palette.appendChild(btn);
  });
  document.getElementById('custom-color').value = savedColor;
}
function applyTheme(theme, mainColor) {
  document.body.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--main-color', mainColor);
}
function loadThemeSettings() {
  const savedTheme = localStorage.getItem('themeMode') || 'light';
  const savedColor = localStorage.getItem('themeColor') || '#1976d2';
  document.getElementById('theme-select').value = savedTheme;
  document.getElementById('custom-color').value = savedColor;
  applyTheme(savedTheme, savedColor);
  renderColorPalette();
}
document.getElementById('save-theme-btn').onclick = function () {
  const theme = document.getElementById('theme-select').value;
  const color = document.getElementById('custom-color').value;
  localStorage.setItem('themeMode', theme);
  localStorage.setItem('themeColor', color);
  applyTheme(theme, color);
  renderColorPalette();
  updateStatus('🎨 Оформление сохранено');
};

// ======= Зарплата/смены/добавление записей/экспорт/график ==========
// >>> Здесь вставляется весь основной функционал из вашей предыдущей версии (без изменений),
// включая:
// - loadSalarySettingsUI, save-salary
// - loadShiftSettingsUI, save-shift, clear-shift, add-shift
// - refreshProducts, loadToday, loadMonthSum, loadRecentEntries
// - deleteProduct, deleteEntry
// - добавление товара/записи
// - автодополнение комментариев
// - экспорт JSON/CSV/HTML
// - updateSalaryStats
// - drawProductChart
// - voice-btn.onclick
// - свайпы по today-list
// - refreshAll()
// - updateStatus()
// - serviceWorker регистрация

// ======= Init =======
function customInitUI() {
  applyVisibilityPrefs();
  loadVisibilityPrefsUI();
}
(async function init() {
  await refreshAll();
  customInitUI();
  updateStatus('🚀 Приложение готово');
})();
