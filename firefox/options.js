// SPDX-License-Identifier: GPL-3.0-or-later
const $ = (id) => document.getElementById(id);


let settings = null;

function applyTheme() {
  const root = document.documentElement;
  PM.applyAccent(root, settings);
  if (settings.theme === 'light' || settings.theme === 'dark') root.setAttribute('data-theme', settings.theme);
  else root.removeAttribute('data-theme');
}

function renderSwatches() {
  const box = $('swatches');
  box.textContent = '';
  const chosen = settings.accent || 'brand';

  PM.ACCENTS.forEach(([key, label, hex]) => {
    box.appendChild(swatch(key, label, hex, chosen === key));
  });

  const custom = PM.normaliseHex(settings.accentHex);
  box.appendChild(
    swatch('custom', custom ? 'Your colour, ' + custom : 'Your own colour',
      custom || 'transparent', chosen === 'custom')
  );

  $('accentHex').value = custom || '';
  $('accentPick').value = custom || '#fbc711';
}

function swatch(key, label, hex, on) {
  const b = document.createElement('button');
  b.className = 'swatch' + (key === 'custom' ? ' swatch-custom' : '');
  b.type = 'button';
  b.style.background = hex;
  b.title = label;
  b.setAttribute('aria-label', label);
  b.setAttribute('aria-pressed', String(on));
  const tick = document.createElement('span');
  tick.textContent = '✓';
  b.appendChild(tick);
  b.addEventListener('click', () => {
    if (key === 'custom' && !PM.normaliseHex(settings.accentHex)) return $('accentHex').focus();
    chooseAccent(key);
  });
  return b;
}

async function chooseAccent(key, hex) {
  settings.accent = key;
  const patch = { accent: key };
  if (hex !== undefined) {
    settings.accentHex = hex;
    patch.accentHex = hex;
  }
  await PM.setSettings(patch);
  applyTheme();
  renderSwatches();
}

function paintClickPastes() {
  const on = !!settings.clickPastes;
  const button = $('clickPastes');
  button.setAttribute('aria-checked', String(on));
  $('clickPastesLabel').textContent = on
    ? 'Clicking a note copies it and pastes it'
    : 'Clicking a note only copies it';
  $('clickPastesHint').textContent = on
    ? 'Notes will say "Copy and paste" when you hover over them, as a reminder that ' +
      'the text goes into whatever box the cursor was in.'
    : 'The paste button on each note still pastes, whatever this is set to.';
}

function wireCustomAccent() {
  const field = $('accentHex');
  const picker = $('accentPick');

  const use = async (value) => {
    if (!String(value || '').trim()) return msg('accentMsg', '', true);
    const hex = PM.normaliseHex(value);
    if (!hex) {
      msg('accentMsg', 'That is not a colour code. Try something like #2295f1.', false);
      return;
    }
    msg('accentMsg', '', true);
    await chooseAccent('custom', hex);
  };

  field.addEventListener('change', () => use(field.value));
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') use(field.value);
  });
  picker.addEventListener('change', () => use(picker.value));
}

function loadShortcuts() {
  return new Promise((res) => {
    if (!chrome.commands || !chrome.commands.getAll) return res({});
    chrome.commands.getAll((list) => {
      const map = {};
      (list || []).forEach((c) => {
        const m = /^slot(\d)$/.exec(c.name || '');
        if (m && c.shortcut) map[Number(m[1])] = c.shortcut;
      });
      res(map);
    });
  });
}

function renderSlotSetup(keys) {
  const missing = [];
  for (let i = 1; i <= PM.MAX_SLOT; i++) if (!keys[i]) missing.push(i);
  const hint = $('slotSetupHint');
  if (!missing.length) {
    hint.textContent = 'All four have keys.';
    hint.className = 'note-msg good';
    return;
  }
  hint.className = '';
  const one = missing.length === 1;
  hint.textContent =
    'Slot' + (one ? ' ' : 's ') + missing.join(', ') +
    (one ? ' has ' : ' have ') + 'no keys at the moment. Set ' +
    (one ? 'them' : 'each of them') + ' on the shortcuts page below.';
}

async function renderSlots() {
  const body = $('slotRows');
  body.textContent = '';
  const keys = await loadShortcuts();
  renderSlotSetup(keys);
  const notes = (await PM.getAllNotes()).filter((n) => n.slot);
  notes.sort((a, b) => a.slot - b.slot);
  if (!notes.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.className = 'hint';
    td.textContent = 'No notes have a slot yet.';
    tr.appendChild(td);
    body.appendChild(tr);
    return;
  }
  notes.forEach((n) => {
    const tr = document.createElement('tr');
    const key = keys[n.slot] || 'no keys set';
    [String(n.slot), key, n.title || PM.labelFor(n.body), n.tabTitle || ''].forEach((v) => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
}

async function renderImport() {
  const pre = await PM.previewImport();
  if (!pre.found) {
    $('importState').textContent =
      'No notes from an older snippet extension were found in this browser, so ' +
      'there is nothing to bring over.';
    return;
  }
  if (!pre.notes) {
    $('importState').textContent = 'Something was found, but there are no notes in it.';
    return;
  }
  $('importState').textContent =
    'Found ' + pre.notes + ' note' + (pre.notes === 1 ? '' : 's') +
    ' in ' + pre.tabs.length + ' tab' + (pre.tabs.length === 1 ? '' : 's') +
    ': ' + pre.tabs.join(', ') + '. They are copied, not moved — nothing is removed.';
  $('btnImport').disabled = false;
}

function msg(id, text, good) {
  const el = $(id);
  el.textContent = text;
  el.classList.toggle('good', good === true);
  el.classList.toggle('bad', good === false);
}

function openTab(url) {
  return new Promise((res) => {
    try {
      chrome.tabs.create({ url: url }, () => res(!chrome.runtime.lastError));
    } catch (e) {
      res(false);
    }
  });
}

// Chromium browsers keep the bookmark manager at chrome://bookmarks and accept
// a folder id, so it opens on the right folder. Firefox has no such address.
function wireOpenFolder() {
  const button = $('btnOpenFolder');
  if (navigator.userAgent.indexOf('Firefox') !== -1) {
    button.hidden = true;
    $('folderMsg').textContent = 'Open your bookmarks with Ctrl+Shift+O to see it.';
    return;
  }
  button.addEventListener('click', async () => {
    const id = await PM.getRootId();
    const opened = await openTab('chrome://bookmarks/?id=' + id);
    if (!opened) msg('folderMsg', 'Your browser would not open its bookmark manager from here.', false);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  settings = await PM.getSettings();
  applyTheme();
  renderSwatches();
  wireCustomAccent();

  $('whereHint').textContent =
    'Every note is a bookmark, so your browser\'s own bookmark sync carries them ' +
    'between computers with no account and no server. You can rename this folder ' +
    'or drag it somewhere else — it is found by what is inside it, not by its name.';
  $('whereWarning').textContent =
    'Because they are bookmarks, your notes are as visible as any other bookmark. ' +
    'Anyone who can open your browser can read them. Keep passwords, card numbers ' +
    'and anything else private out of Pastemorphic.';

  const path = await PM.getRootPath();
  $('wherePath').textContent = path.join('  ›  ');
  wireOpenFolder();

  $('theme').value = settings.theme || 'system';
  $('theme').addEventListener('change', async (e) => {
    settings.theme = e.target.value;
    await PM.setSettings({ theme: settings.theme });
    applyTheme();
  });

  // The popup has its own light/dark button; keep this page in step with it.
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.theme) {
      settings.theme = changes.theme.newValue;
      $('theme').value = settings.theme;
      applyTheme();
    }
    if (changes.accent) {
      settings.accent = changes.accent.newValue;
      applyTheme();
      renderSwatches();
    }
  });

  paintClickPastes();
  $('clickPastes').addEventListener('click', async () => {
    settings.clickPastes = !settings.clickPastes;
    paintClickPastes();
    await PM.setSettings({ clickPastes: settings.clickPastes });
  });

  const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  if (isFirefox) {
    $('btnShortcuts').hidden = true;
    $('shortcutHint').textContent =
      'In Firefox: open the add-ons page, click the gear at the top and choose ' +
      'Manage Extension Shortcuts.';
  } else {
    $('shortcutHint').textContent = 'Your keys are kept even when the extension updates.';
    $('btnShortcuts').addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }

  await renderSlots();
  await renderImport();

  $('btnImport').addEventListener('click', async () => {
    $('btnImport').disabled = true;
    msg('importMsg', 'Importing…');
    try {
      const r = await PM.runImport();
      const skipped = r.skipped
        ? ' ' + r.skipped + ' ' + (r.skipped === 1 ? 'was' : 'were') + ' already here.'
        : '';
      msg('importMsg', 'Brought over ' + r.imported + ' note' + (r.imported === 1 ? '' : 's') + '.' + skipped, true);
      await renderSlots();
    } catch (e) {
      msg('importMsg', 'That did not work: ' + e.message, false);
      $('btnImport').disabled = false;
    }
  });

  $('btnExport').addEventListener('click', async () => {
    const data = await PM.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pastemorphic-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    msg('backupMsg', 'Saved.', true);
  });

  $('btnPickFile').addEventListener('click', () => $('file').click());

  $('file').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const count = await PM.importAll(JSON.parse(await f.text()));
      msg('backupMsg', 'Restored ' + count + ' note' + (count === 1 ? '' : 's') + '.', true);
      await renderSlots();
    } catch (err) {
      msg('backupMsg', 'That file could not be read: ' + err.message, false);
    }
    e.target.value = '';
  });
});
