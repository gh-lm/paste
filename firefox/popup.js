/* Popup: the list of notes, and the two sheets that sit over it. */

const $ = (id) => document.getElementById(id);

const ICONS = {
  copy: '<path d="M9 9V5.5A1.5 1.5 0 0 1 10.5 4h8A1.5 1.5 0 0 1 20 5.5v8a1.5 1.5 0 0 1-1.5 1.5H15"/><rect x="4" y="9" width="11" height="11" rx="1.5"/>',
  paste: '<path d="M12 3v12"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M14.5 5.5 18.5 9.5"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M6.5 7 7.5 20h9L17.5 7"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m15.5 15.5 4 4"/>',
  // A ring with teeth on it, not a disc with rays — that reads as a sun.
  gear: '<circle cx="12" cy="12" r="7.3"/><circle cx="12" cy="12" r="3"/>' +
    '<path d="M19.3 12h2.5M17.2 17.2l1.7 1.7M12 19.3v2.5M6.8 17.2l-1.7 1.7' +
    'M4.7 12H2.2M6.8 6.8 5.1 5.1M12 4.7V2.2M17.2 6.8l1.7-1.7"/>',
  tabs: '<rect x="3" y="6" width="7" height="12" rx="1.5"/><rect x="12" y="6" width="9" height="12" rx="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  // a line of text being added, so it is not mistaken for the new-tab plus
  notePlus: '<path d="M4 7h11M4 12h7M4 17h5"/><path d="M17 12v8M13 16h8"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M3 12h2M19 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none"/>',
  grip: '<circle cx="9" cy="7" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="9" cy="17" r="1.3"/><circle cx="15" cy="7" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="15" cy="17" r="1.3"/>'
};

function svg(name) {
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>'
  );
}

const state = {
  shortcuts: {},
  tabs: [],
  currentTab: '',
  notes: [],
  search: '',
  searching: false,
  editing: null,
  settings: null
};

// With the footer gone, messages appear briefly over the bottom of the list.
let statusTimer = null;
function say(message, good) {
  const el = $('status');
  el.textContent = message || '';
  el.classList.toggle('good', !!good);
  el.hidden = !message;
  if (statusTimer) clearTimeout(statusTimer);
  if (message) statusTimer = setTimeout(() => say(''), 2600);
}

// Whatever the browser actually has bound right now, rather than what the
// manifest asked for — people move these, and browsers refuse some outright.
function loadShortcuts() {
  return new Promise((res) => {
    if (!chrome.commands || !chrome.commands.getAll) return res({});
    chrome.commands.getAll((list) => {
      const slots = {};
      (list || []).forEach((c) => {
        const m = /^slot(\d)$/.exec(c.name || '');
        if (m && c.shortcut) slots[Number(m[1])] = c.shortcut;
      });
      res(slots);
    });
  });
}

function slotLabel(slot) {
  return state.shortcuts[slot] || 'Slot ' + slot;
}

function slotIsSet(slot) {
  return !!state.shortcuts[slot];
}

function slotTooltip(slot) {
  return state.shortcuts[slot]
    ? 'Press ' + state.shortcuts[slot] + ' to paste this'
    : 'No keys are set for slot ' + slot + ' — set them from Settings';
}

/* ---- theme -------------------------------------------------------------- */

const THEME_ICON = { light: 'sun', dark: 'moon' };
const THEME_WORDS = {
  system: 'Following the browser',
  light: 'Always light',
  dark: 'Always dark'
};

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

// What is actually on screen right now, once "follow the browser" is resolved.
function resolvedTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  return darkQuery.matches ? 'dark' : 'light';
}

function applySettings(s) {
  state.settings = s;
  const root = document.documentElement;
  PM.applyAccent(root, s);
  if (s.theme === 'light' || s.theme === 'dark') root.setAttribute('data-theme', s.theme);
  else root.removeAttribute('data-theme');
  paintThemeButton();
}

function paintThemeButton() {
  const button = $('btnTheme');
  if (!button) return;
  const theme = (state.settings && state.settings.theme) || 'system';
  const showing = resolvedTheme(theme);

  // In automatic mode the button shows what is actually on screen, with a small
  // dot to say the browser is choosing rather than you.
  button.innerHTML = svg(THEME_ICON[showing]);
  button.classList.toggle('auto', theme === 'system');

  const now = theme === 'system' ? ' (' + showing + ' just now)' : '';
  const label = THEME_WORDS[theme] + now + ' — click for ' +
    THEME_WORDS[nextTheme(theme)].toLowerCase();
  button.title = label;
  button.setAttribute('aria-label', label);
}

// Order the three so the first click always changes what you can see: from
// automatic you go to the opposite of whatever the browser is doing.
function themeOrder() {
  const browser = darkQuery.matches ? 'dark' : 'light';
  return ['system', browser === 'dark' ? 'light' : 'dark', browser];
}

function nextTheme(theme) {
  const order = themeOrder();
  const at = order.indexOf(theme);
  return order[at < 0 ? 0 : (at + 1) % order.length];
}

async function cycleTheme() {
  const theme = nextTheme((state.settings && state.settings.theme) || 'system');
  await PM.setSettings({ theme: theme });
  applySettings(Object.assign({}, state.settings, { theme: theme }));
  say(THEME_WORDS[theme], true);
}

/* ---- rendering ---------------------------------------------------------- */

function renderTabs() {
  const box = $('tabs');
  box.textContent = '';
  state.tabs.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(t.id === state.currentTab));
    b.textContent = t.title;
    b.title = t.title; // long names are trimmed with an ellipsis in the strip
    b.dataset.id = t.id;
    b.addEventListener('click', () => selectTab(t.id));
    wireReorder(b, b, tabElements, 'x', async (id, index) => {
      await PM.moveTabTo(id, index);
      await reload();
    });
    box.appendChild(b);
  });
  const active = box.querySelector('[aria-selected="true"]');
  if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });

  const add = $('btnTabAdd');
  const full = state.tabs.length >= PM.MAX_TABS;
  add.disabled = full;
  add.title = full ? PM.MAX_TABS + ' tabs is as many as Pastemorphic holds' : 'New tab';
  markTabOverflow();
}

// A browser closes an extension popup as soon as a native HTML5 drag starts,
// so reordering is done with pointer events, which stay inside the popup.
let dragging = null;

// A thin line in the gap where the thing will land, rather than colouring the
// edge of its neighbour.
function dropLine(container) {
  let line = container.querySelector(':scope > .dropline');
  if (!line) {
    line = document.createElement('div');
    line.className = 'dropline';
    container.appendChild(line);
  }
  return line;
}

function showDropLine(container, item, axis, before) {
  const line = dropLine(container);
  const box = container.getBoundingClientRect();
  const r = item.getBoundingClientRect();
  if (axis === 'x') {
    const x = (before ? r.left : r.right) - box.left + container.scrollLeft;
    line.style.left = Math.round(x - 1) + 'px';
    line.style.top = Math.round(r.top - box.top + container.scrollTop) + 'px';
    line.style.width = '2px';
    line.style.height = Math.round(r.height) + 'px';
  } else {
    const y = (before ? r.top : r.bottom) - box.top + container.scrollTop;
    line.style.top = Math.round(y - 1) + 'px';
    line.style.left = '0';
    line.style.right = '0';
    line.style.width = 'auto';
    line.style.height = '2px';
  }
  line.hidden = false;
}

function clearDropMarks() {
  document.querySelectorAll('.dropline').forEach((l) => {
    l.hidden = true;
  });
}

// The item under the pointer, or the nearest one if the pointer is in a gap.
function itemUnder(items, x, y) {
  let best = null;
  let bestGap = Infinity;
  items.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      best = el;
      bestGap = -1;
      return;
    }
    if (bestGap < 0) return;
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    const gap = dx * dx + dy * dy;
    if (gap < bestGap) {
      bestGap = gap;
      best = el;
    }
  });
  return best;
}

/*
 * el        the thing being dragged
 * handle    where a drag may start from
 * items()   everything it can be dropped among, in order
 * axis      'x' for a row of tabs, 'y' for a list of notes
 * onDrop    given the id being moved and the index it should land at
 */
function wireReorder(el, handle, items, axis, onDrop) {
  let startX = 0;
  let startY = 0;
  let pointer = null;
  let moved = false;

  const finish = () => {
    try {
      if (pointer !== null && handle.hasPointerCapture(pointer)) {
        handle.releasePointerCapture(pointer);
      }
    } catch (err) {
      /* nothing to do */
    }
    pointer = null;
    el.classList.remove('dragging');
    clearDropMarks();
    dragging = null;
  };

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || el.dataset.fixed === 'yes') return;
    pointer = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
    // capture keeps the moves coming even when the pointer leaves the element;
    // if a browser refuses it, dragging still works over the item itself
    try {
      handle.setPointerCapture(pointer);
    } catch (err) {
      /* nothing to do */
    }
  });

  handle.addEventListener('pointermove', (e) => {
    if (pointer === null) return;
    if (!moved) {
      if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) return;
      moved = true;
      dragging = el.dataset.id;
      el.classList.add('dragging');
    }
    const list = items().filter((x) => x !== el);
    const over = itemUnder(list, e.clientX, e.clientY);
    clearDropMarks();
    if (!over) return;
    const r = over.getBoundingClientRect();
    const before = axis === 'x'
      ? e.clientX < r.left + r.width / 2
      : e.clientY < r.top + r.height / 2;
    showDropLine(el.parentElement, over, axis, before);
  });

  handle.addEventListener('pointerup', async (e) => {
    if (pointer === null) return;
    if (!moved) return finish();

    const all = items();
    const list = all.filter((x) => x !== el);
    const over = itemUnder(list, e.clientX, e.clientY);
    const movingId = el.dataset.id;
    if (!over) return finish();

    const r = over.getBoundingClientRect();
    const before = axis === 'x'
      ? e.clientX < r.left + r.width / 2
      : e.clientY < r.top + r.height / 2;
    const from = all.indexOf(el);
    const target = all.indexOf(over);
    finish();
    if (from < 0 || target < 0) return;

    let index = before ? target : target + 1;
    if (from < index) index -= 1;
    if (index === from) return;
    await onDrop(movingId, index);
  });

  handle.addEventListener('pointercancel', finish);

  // a drag must not also count as a click on the thing being dragged
  el.addEventListener('click', (e) => {
    if (moved) {
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }
  }, true);
}

function tabElements() {
  // the drop line lives in here too, so pick out only the tabs themselves
  return [...$('tabs').children].filter((el) => el.classList.contains('tab'));
}

function noteElements() {
  return [...$('list').querySelectorAll('.note')];
}

// Nothing is created until it has a name, so there is never a tab sitting
// around called "New".
function newTab() {
  if (state.tabs.length >= PM.MAX_TABS) {
    return say('That is the most tabs Pastemorphic holds — ' + PM.MAX_TABS + '.');
  }
  openTabPop(true);
}

// Only when there are more rows of tabs than fit does a fade appear along the
// bottom, so a cut-off row does not look like the end of the list.
function markTabOverflow() {
  const box = $('tabs');
  const wrap = $('tabWrap');
  const more = box.scrollHeight - box.clientHeight;
  wrap.classList.toggle('more-below', more > 1 && box.scrollTop < more - 1);
  wrap.classList.toggle('more-above', box.scrollTop > 1);
}

function matches(note, q) {
  return (
    note.title.toLowerCase().indexOf(q) !== -1 ||
    note.body.toLowerCase().indexOf(q) !== -1
  );
}

function renderList() {
  const list = $('list');
  list.textContent = '';

  let notes = state.notes;
  if (state.searching && state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    notes = notes.filter((n) => matches(n, q));
  }

  if (!notes.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = state.searching && state.search.trim()
      ? 'Nothing matches that.'
      : 'No notes in this tab yet. Press New note to add one.';
    list.appendChild(p);
    return;
  }

  notes.forEach((n) => list.appendChild(noteRow(n)));
}

function noteRow(n) {
  const row = document.createElement('div');
  row.className = 'note';
  row.dataset.id = n.id;
  // reordering is off while searching, because the list is not in tab order
  row.dataset.fixed = state.searching ? 'yes' : 'no';

  const grip = document.createElement('span');
  grip.className = 'grip';
  grip.innerHTML = svg('grip');
  row.appendChild(grip);

  const main = document.createElement('button');
  main.className = 'note-main';
  main.type = 'button';
  // Say plainly which of the two a click will do, because with pasting on it
  // puts text into whatever box the cursor was in.
  main.title = clickAction();
  main.setAttribute('aria-label', clickAction() + ' — ' + (n.title || PM.labelFor(n.body)));

  const title = document.createElement('span');
  title.className = 'note-title';
  title.textContent = n.title || PM.labelFor(n.body);
  main.appendChild(title);

  // When the name came from the text itself, the second line shows what the
  // name left out rather than repeating it.
  const derived = !n.title || n.title === PM.labelFor(n.body);
  const rest = derived ? n.body.split('\n').slice(1).join(' ') : n.body;
  const preview = rest.replace(/\s+/g, ' ').trim();
  if (preview && preview !== title.textContent) {
    const p = document.createElement('span');
    p.className = 'note-preview';
    p.textContent = preview;
    main.appendChild(p);
  }

  main.addEventListener('click', () => copyNote(n));
  row.appendChild(main);

  if (n.slot) {
    const s = document.createElement('span');
    s.className = 'slot';
    s.textContent = slotLabel(n.slot);
    if (!slotIsSet(n.slot)) s.classList.add('unset');
    s.title = slotTooltip(n.slot);
    row.appendChild(s);
  }

  const acts = document.createElement('div');
  acts.className = 'acts';
  acts.appendChild(iconButton('paste', 'Paste into the page', () => pasteNote(n)));
  acts.appendChild(iconButton('edit', 'Edit this note', () => openEditor(n)));
  acts.appendChild(deleteButton(n));
  row.appendChild(acts);

  if (!state.searching) {
    row.querySelector('.grip').classList.add('draghandle');
    wireReorder(row, row.querySelector('.grip'), noteElements, 'y', async (id, index) => {
      await PM.moveNoteTo(id, state.currentTab, index);
      await reload();
    });
  }
  return row;
}

function iconButton(icon, label, onClick) {
  const b = document.createElement('button');
  b.className = 'icon-btn';
  b.type = 'button';
  b.title = label;
  b.setAttribute('aria-label', label);
  b.innerHTML = svg(icon);
  b.addEventListener('click', onClick);
  return b;
}

// Every delete works the same way: a bin, which turns into a tick. Nothing is
// removed until the tick is clicked, and it gives up after a few seconds.
function armDelete(button, restLabel, armedLabel, run, hintId) {
  let armed = false;
  let timer = null;
  const hint = hintId ? $(hintId) : null;

  const rest = () => {
    armed = false;
    if (timer) clearTimeout(timer);
    button.classList.remove('armed');
    button.innerHTML = svg('trash');
    button.title = restLabel;
    button.setAttribute('aria-label', restLabel);
    if (hint) {
      hint.textContent = restLabel;
      hint.classList.remove('danger-text');
    }
  };

  button.resetDelete = rest;
  rest();
  button.addEventListener('click', async () => {
    if (!armed) {
      armed = true;
      button.classList.add('armed');
      button.innerHTML = svg('check');
      button.title = armedLabel;
      button.setAttribute('aria-label', armedLabel);
      if (hint) {
        hint.textContent = armedLabel;
        hint.classList.add('danger-text');
      }
      say(armedLabel);
      timer = setTimeout(rest, 4000);
      return;
    }
    rest();
    await run();
  });
  return button;
}

function deleteButton(n) {
  const name = n.title || PM.labelFor(n.body);
  const b = iconButton('trash', 'Delete this note', () => {});
  armDelete(b, 'Delete this note', 'Click the tick to delete "' + name + '"', async () => {
    await PM.removeNote(n.id);
    await reload();
    say('Deleted.', true);
  });
  return b;
}

/* ---- drag to reorder ---------------------------------------------------- */


// A thin line in the gap where the thing will land, rather than colouring the
// edge of its neighbour.
function dropLine(container) {
  let line = container.querySelector(':scope > .dropline');
  if (!line) {
    line = document.createElement('div');
    line.className = 'dropline';
    container.appendChild(line);
  }
  return line;
}

function showDropLine(container, item, axis, before) {
  const line = dropLine(container);
  const box = container.getBoundingClientRect();
  const r = item.getBoundingClientRect();
  if (axis === 'x') {
    const x = (before ? r.left : r.right) - box.left + container.scrollLeft;
    line.style.left = Math.round(x - 1) + 'px';
    line.style.top = Math.round(r.top - box.top + container.scrollTop) + 'px';
    line.style.width = '2px';
    line.style.height = Math.round(r.height) + 'px';
  } else {
    const y = (before ? r.top : r.bottom) - box.top + container.scrollTop;
    line.style.top = Math.round(y - 1) + 'px';
    line.style.left = '0';
    line.style.right = '0';
    line.style.width = 'auto';
    line.style.height = '2px';
  }
  line.hidden = false;
}

function clearDropMarks() {
  document.querySelectorAll('.dropline').forEach((l) => {
    l.hidden = true;
  });
}

/* ---- actions ------------------------------------------------------------ */

function clickPastes() {
  return !!(state.settings && state.settings.clickPastes);
}

function clickAction() {
  return clickPastes() ? 'Copy and paste' : 'Copy';
}

async function copyNote(n) {
  try {
    await navigator.clipboard.writeText(n.body);
    say(clickPastes() ? 'Copied and pasted.' : 'Copied.', true);
    if (clickPastes()) {
      chrome.runtime.sendMessage({ action: 'paste', text: n.body });
      window.close();
      return;
    }
    setTimeout(() => window.close(), 350);
  } catch (e) {
    say('Could not copy that.');
  }
}

function pasteNote(n) {
  chrome.runtime.sendMessage({ action: 'paste', text: n.body });
  window.close();
}

async function selectTab(id) {
  state.currentTab = id;
  await PM.setSettings({ currentTab: id });
  await reload();
}

/* ---- editor sheet ------------------------------------------------------- */

function fillSelects(note) {
  const tabSel = $('fTab');
  tabSel.textContent = '';
  state.tabs.forEach((t) => {
    const o = document.createElement('option');
    o.value = t.id;
    o.textContent = t.title;
    tabSel.appendChild(o);
  });
  tabSel.value = (note && note.tabId) || state.currentTab;

  const slotSel = $('fSlot');
  slotSel.textContent = '';
  const none = document.createElement('option');
  none.value = '0';
  none.textContent = 'None';
  slotSel.appendChild(none);
  for (let i = 1; i <= PM.MAX_SLOT; i++) {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = state.shortcuts[i] || 'Slot ' + i + ' (no keys set)';
    slotSel.appendChild(o);
  }
  slotSel.value = String((note && note.slot) || 0);
}

function openEditor(note) {
  state.editing = note || null;
  $('editorTitle').textContent = note ? 'Edit note' : 'New note';
  $('fTitle').value = note ? note.title : '';
  $('fBody').value = note ? note.body : '';
  fillSelects(note);
  const del = $('btnDelete');
  del.hidden = !note;
  $('noteDeleteHint').hidden = del.hidden;
  if (del.resetDelete) del.resetDelete();
  $('editor').hidden = false;
  (note ? $('fBody') : $('fTitle')).focus();
}

function closeEditor() {
  $('editor').hidden = true;
  state.editing = null;
}

async function saveEditor() {
  const title = $('fTitle').value.trim();
  const body = $('fBody').value;
  const slot = parseInt($('fSlot').value, 10) || 0;
  const tabId = $('fTab').value;
  if (!body.trim()) {
    say('Type some text first.');
    $('fBody').focus();
    return;
  }
  if (state.editing) {
    await PM.saveNote(state.editing.id, title, body, slot);
    if (tabId !== state.editing.tabId) await PM.moveNoteToTab(state.editing.id, tabId);
  } else {
    await PM.addNote(tabId, title, body, slot);
  }
  if (tabId !== state.currentTab) await selectTab(tabId);
  closeEditor();
  await reload();
  say('Saved.', true);
}

/* ---- tab sheet ---------------------------------------------------------- */

let makingTab = false;

function openTabPop(making) {
  const t = state.tabs.find((x) => x.id === state.currentTab);
  $('fTabName').value = making ? '' : (t ? t.title : '');
  $('tabHint').textContent = making
    ? 'Give the new tab a name.'
    : 'Drag tabs to reorder them.';
  makingTab = !!making;
  const del = $('btnTabDelete');
  // nothing to delete while naming a new one, and the last tab cannot go
  // either: there would be nowhere to keep notes
  del.hidden = makingTab || state.tabs.length < 2;
  $('tabDeleteHint').hidden = del.hidden;
  if (del.resetDelete) del.resetDelete();
  $('tabPopBack').hidden = false;
  const pop = $('tabPop');
  pop.hidden = false;
  placeTabPop();
  $('fTabName').focus();
  $('fTabName').select();
}

// Sit the popover under the button that opened it, kept inside the popup.
function placeTabPop() {
  const pop = $('tabPop');
  const anchor = $('btnTabMenu').getBoundingClientRect();
  const width = pop.offsetWidth;
  const left = Math.max(8, Math.min(anchor.right - width, window.innerWidth - width - 8));
  pop.style.left = Math.round(left) + 'px';
  pop.style.top = Math.round(anchor.bottom + 6) + 'px';
}

function closeTabPop() {
  $('tabPop').hidden = true;
  $('tabPopBack').hidden = true;
}

function tabPopOpen() {
  return !$('tabPop').hidden;
}

/* ---- loading ------------------------------------------------------------ */

async function reload() {
  state.tabs = await PM.getTabs();
  if (!state.tabs.find((t) => t.id === state.currentTab)) {
    state.currentTab = state.tabs[0].id;
    await PM.setSettings({ currentTab: state.currentTab });
  }
  state.notes = state.searching && state.search.trim()
    ? await PM.getAllNotes()
    : await PM.getNotes(state.currentTab);
  renderTabs();
  renderList();
}

/* ---- wiring ------------------------------------------------------------- */


document.addEventListener('DOMContentLoaded', async () => {
  $('btnAdd').innerHTML = svg('notePlus');
  $('btnTabAdd').innerHTML = svg('plus');
  $('btnTabSave').innerHTML = svg('check');
  $('btnSearch').innerHTML = svg('search');
  $('btnSettings').innerHTML = svg('gear');
  $('btnTabMenu').innerHTML = svg('tabs');

  applySettings(await PM.getSettings());
  // shown once, the first time the list is opened after installing
  $('notice').hidden = !!state.settings.seenNotice;
  state.shortcuts = await loadShortcuts();
  state.currentTab = state.settings.currentTab || '';
  await reload();

  $('btnAdd').addEventListener('click', () => openEditor(null));
  $('btnCancel').addEventListener('click', closeEditor);
  $('btnSave').addEventListener('click', saveEditor);
  $('tabs').addEventListener('scroll', markTabOverflow);
  // the strip grows and shrinks as tabs are added, renamed or removed
  if (window.ResizeObserver) new ResizeObserver(markTabOverflow).observe($('tabs'));
  window.addEventListener('resize', markTabOverflow);

  $('btnTabAdd').addEventListener('click', newTab);

  $('btnNoticeOk').addEventListener('click', async () => {
    $('notice').hidden = true;
    state.settings.seenNotice = true;
    await PM.setSettings({ seenNotice: true });
  });

  $('btnTheme').addEventListener('click', cycleTheme);

  // If the browser flips to dark while this is open, follow it straight away.
  const onSystemTheme = () => {
    if (!state.settings || state.settings.theme === 'system') paintThemeButton();
  };
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemTheme);
  else darkQuery.addListener(onSystemTheme);

  $('btnSettings').addEventListener('click', () => {
    // Opening settings always closes the popup, so leave no doubt it happened.
    try {
      chrome.runtime.openOptionsPage(() => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
        }
      });
    } catch (e) {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
  });

  armDelete($('btnDelete'), 'Delete this note', 'Click the tick to delete this note',
    async () => {
      if (!state.editing) return;
      await PM.removeNote(state.editing.id);
      closeEditor();
      await reload();
      say('Deleted.', true);
    }, 'noteDeleteHint');

  $('btnSearch').addEventListener('click', async () => {
    state.searching = !state.searching;
    $('searchWrap').hidden = !state.searching;
    state.search = '';
    $('search').value = '';
    await reload();
    if (state.searching) $('search').focus();
  });

  $('search').addEventListener('input', async (e) => {
    state.search = e.target.value;
    if (!state.notes.length || state.search.trim()) state.notes = await PM.getAllNotes();
    renderList();
  });

  $('btnTabMenu').addEventListener('click', () => {
    if (tabPopOpen() && !makingTab) return closeTabPop();
    openTabPop(false);
  });
  $('tabPopBack').addEventListener('click', closeTabPop);

  const saveTabName = async () => {
    const name = $('fTabName').value.trim();
    try {
      if (makingTab) {
        const made = await PM.addTab(name);
        closeTabPop();
        await selectTab(made.id);
        say('Tab added.', true);
        return;
      }
      await PM.renameTab(state.currentTab, name);
      closeTabPop();
      await reload();
      say('Renamed.', true);
    } catch (e) {
      // the popover stays open so the name can be corrected
      say(e.message || 'That name will not work.');
      $('fTabName').focus();
      $('fTabName').select();
    }
  };
  $('btnTabSave').addEventListener('click', saveTabName);
  $('fTabName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveTabName();
  });

  armDelete($('btnTabDelete'), 'Delete this tab',
    'Click the tick to delete this tab and every note in it',
    async () => {
      await PM.removeTab(state.currentTab);
      state.currentTab = '';
      closeTabPop();
      await reload();
      say('Tab deleted.', true);
    }, 'tabDeleteHint');

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('notice').hidden) return;          // must be acknowledged, not dismissed
    if (!$('editor').hidden) return closeEditor();
    if (tabPopOpen()) return closeTabPop();
    window.close();
  });
});
