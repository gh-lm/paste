// SPDX-License-Identifier: GPL-3.0-or-later
/* Pastemorphic storage layer.
   Everything lives in bookmarks, so the browser's own sync carries it.

   Bookmarks/Other bookmarks/
     Pastemorphic Data (do not edit)/
       <tab name>/                 one folder per tab
         <note title>              one bookmark per note
                                   url holds the note body + shortcut slot

   Note order   = bookmark index inside its tab folder.
   Tab order    = folder index inside the root folder.
*/

var PM = (function () {
  const ROOT_TITLE = 'Pastemorphic';
  const OLD_TITLES = ['Pastemorphic Data (do not edit)'];
  // The note text is parked in the bookmark's url. A reserved .invalid host is
  // used so a stray click goes nowhere and no browser treats it as code.
  const HEAD = 'https://pastemorphic.invalid/#pm1:';
  const TAIL = '';
  const OLD_HEAD = "javascript:void('pm1:";
  const OLD_TAIL = "')";
  // Four, because that is every shortcut a browser lets an extension arrive
  // with. More slots than keys would only be slots nothing can reach.
  const MAX_SLOT = 4;

  // Tab names are capped at seven letters, which makes every tab at most 100px
  // wide. Three of those fit across the 308px strip, and the strip is two rows
  // tall, so six tabs is exactly what can be shown without anything scrolling.
  const MAX_TAB_NAME = 7;
  const MAX_TABS = 6;

  function trimTabName(title) {
    return String(title == null ? '' : title).trim().slice(0, MAX_TAB_NAME);
  }

  // Placeholder names help nobody find anything, and two tabs with the same
  // name cannot be told apart.
  // Compared against the trimmed name, so each is cut to the same length first.
  const RESERVED_TAB_NAMES = ['new', 'new tab', 'newtab', 'untitled']
    .map((n) => n.slice(0, MAX_TAB_NAME).toLowerCase());

  async function tabNameProblem(title, exceptId) {
    const clean = trimTabName(title);
    if (!clean) return 'Give the tab a name.';
    if (RESERVED_TAB_NAMES.indexOf(clean.toLowerCase()) !== -1) {
      return 'Pick a name of your own rather than "' + clean + '".';
    }
    const rootId = await getRootId();
    const taken = (await getChildren(rootId)).some(
      (k) => !k.url && k.id !== exceptId &&
        trimTabName(k.title).toLowerCase() === clean.toLowerCase()
    );
    return taken ? 'There is already a tab called "' + clean + '".' : '';
  }

  /* ---- accent ------------------------------------------------------------ */

  // Twelve well separated hues rather than a wall of near-identical ones.
  const ACCENTS = [
    ['brand', 'Brand yellow', '#fbc711'],
    ['orange', 'Orange', '#fe9700'],
    ['red', 'Red', '#f34236'],
    ['pink', 'Pink', '#e8207e'],
    ['purple', 'Purple', '#9b26ae'],
    ['indigo', 'Indigo', '#3d51b4'],
    ['blue', 'Blue', '#2295f1'],
    ['cyan', 'Cyan', '#00bcd3'],
    ['teal', 'Teal', '#019587'],
    ['green', 'Green', '#4bae4f'],
    ['brown', 'Brown', '#795649'],
    ['grey', 'Grey', '#9e9d9e']
  ];

  const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

  // Accepts #2295f1, 2295f1, #fff and fff alike.
  function normaliseHex(value) {
    const hit = HEX.exec(String(value || '').trim());
    if (!hit) return '';
    let body = hit[1].toLowerCase();
    if (body.length === 3) body = body.replace(/./g, (c) => c + c);
    return '#' + body;
  }

  function toRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function toHex(rgb) {
    return '#' + rgb.map((v) => {
      const c = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return c.length === 1 ? '0' + c : c;
    }).join('');
  }

  function mix(a, b, amount) {
    return toHex([0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * amount));
  }

  // Rough perceived brightness, enough to pick black or white text on top.
  function isLight(rgb) {
    return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 > 150;
  }

  const WHITE = [255, 255, 255];
  const BLACK = [0, 0, 0];

  // Build the same set of shades the built-in accents declare in the
  // stylesheet, so a custom colour behaves exactly like a chosen one.
  function accentVars(hex) {
    const rgb = toRgb(hex);
    return {
      '--accent-light': hex,
      '--accent-hover-light': mix(rgb, BLACK, 0.12),
      '--accent-container-light': mix(rgb, WHITE, 0.88),
      '--on-accent-container-light': mix(rgb, BLACK, 0.65),
      '--accent-dark': hex,
      '--accent-hover-dark': mix(rgb, WHITE, 0.12),
      '--accent-container-dark': mix(rgb, BLACK, 0.72),
      '--on-accent-container-dark': mix(rgb, WHITE, 0.6),
      '--on-accent': isLight(rgb) ? mix(rgb, BLACK, 0.82) : '#ffffff'
    };
  }

  const ACCENT_VAR_NAMES = Object.keys(accentVars('#000000'));

  // Used by both the popup and the settings page, so one colour cannot drift
  // from the other.
  function applyAccent(root, settings) {
    ACCENT_VAR_NAMES.forEach((name) => root.style.removeProperty(name));
    const custom = settings.accent === 'custom' && normaliseHex(settings.accentHex);
    if (custom) {
      const vars = accentVars(custom);
      Object.keys(vars).forEach((name) => root.style.setProperty(name, vars[name]));
      root.setAttribute('data-accent', 'custom');
      return;
    }
    // 'custom' without a usable colour behaves as the default rather than
    // leaving an accent named after nothing.
    if (settings.accent && settings.accent !== 'brand' && settings.accent !== 'custom') {
      root.setAttribute('data-accent', settings.accent);
    } else {
      root.removeAttribute('data-accent');
    }
  }

  const bm = chrome.bookmarks;

  function getChildren(id) {
    return new Promise((res) => bm.getChildren(String(id), (r) => res(r || [])));
  }
  function create(props) {
    return new Promise((res) => bm.create(props, res));
  }
  function update(id, props) {
    return new Promise((res) => bm.update(String(id), props, res));
  }
  function move(id, props) {
    return new Promise((res) => bm.move(String(id), props, res));
  }
  function removeTree(id) {
    return new Promise((res) => bm.removeTree(String(id), res));
  }
  function remove(id) {
    return new Promise((res) => bm.remove(String(id), res));
  }
  function getNode(id) {
    return new Promise((res) => bm.get(String(id), (r) => res(r && r[0])));
  }

  /* ---- note encoding ---------------------------------------------------- */

  // encodeURIComponent leaves ' ( ) ! * ~ alone; push those to hex too so the
  // stored url can never be confused with its own wrapper.
  function enc(s) {
    return encodeURIComponent(s).replace(/['()!*~]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  function encodeNote(body, slot) {
    const payload = { c: body || '' };
    if (slot) payload.s = slot;
    return HEAD + enc(JSON.stringify(payload)) + TAIL;
  }

  function decodeNote(url) {
    if (!url) return null;
    let raw = null;
    if (url.slice(0, HEAD.length) === HEAD) {
      raw = url.slice(HEAD.length);
    } else if (url.slice(0, OLD_HEAD.length) === OLD_HEAD) {
      raw = url.slice(OLD_HEAD.length, url.length - OLD_TAIL.length);
    }
    if (raw === null) return null;
    try {
      const obj = JSON.parse(decodeURIComponent(raw));
      return { body: obj.c || '', slot: obj.s || 0 };
    } catch (e) {
      return null;
    }
  }

  /* ---- folders ---------------------------------------------------------- */

  let rootIdCache = null;

  // Chrome numbers its roots 1/2/3; Firefox names them menu____/toolbar___/
  // unfiled___. Ask the tree rather than assuming either.
  async function rootFolders() {
    const tree = await getTree();
    return (tree[0] && tree[0].children) || [];
  }

  async function defaultParentId() {
    const roots = await rootFolders();
    const other =
      roots.find((r) => r.id === 'unfiled_____') ||
      roots.find((r) => r.id === '2') ||
      roots.find((r) => /other/i.test(r.title || ''));
    const pick = other || roots[roots.length - 1] || roots[0];
    return pick ? pick.id : '2';
  }

  async function findIn(parentId, title, foldersOnly) {
    const kids = await getChildren(parentId);
    for (const k of kids) {
      if (k.title === title && (!foldersOnly || !k.url)) return k;
    }
    return null;
  }

  function getTree() {
    return new Promise((res) => bm.getTree((t) => res(t || [])));
  }

  function rememberedId() {
    return new Promise((res) =>
      chrome.storage.local.get(['rootId'], (r) => res(r && r.rootId))
    );
  }
  function rememberId(id) {
    return new Promise((res) => chrome.storage.local.set({ rootId: id }, res));
  }

  // Everything that could be our folder, oldest first. There should only ever
  // be one, but the popup and the background worker can both go looking on the
  // very first run, so we cope with having made two.
  async function findCandidates() {
    const seen = {};
    const out = [];
    const keep = (node) => {
      if (!node || node.url || seen[node.id]) return;
      seen[node.id] = true;
      out.push(node);
    };

    for (const root of await rootFolders()) {
      const kids = await getChildren(root.id);
      kids.forEach((k) => {
        if (!k.url && (k.title === ROOT_TITLE || OLD_TITLES.indexOf(k.title) !== -1)) keep(k);
      });
    }

    const tree = await getTree();
    (function walk(node, parent, grandparent) {
      if (node.url && decodeNote(node.url) && grandparent) keep(grandparent);
      (node.children || []).forEach((c) => walk(c, node, parent));
    })(tree[0] || {}, null, null);

    const saved = await rememberedId();
    if (saved) keep(await getNode(saved));

    out.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0) || Number(a.id) - Number(b.id));
    return out;
  }

  // Pour one folder's tabs into another, joining tabs that share a name.
  async function mergeInto(keeperId, extraId) {
    const extras = await getChildren(extraId);
    for (const child of extras) {
      if (child.url) {
        const tabs = (await getChildren(keeperId)).filter((t) => !t.url);
        const target = tabs[0] || (await create({ parentId: keeperId, title: 'Notes' }));
        await move(child.id, { parentId: target.id });
        continue;
      }
      const twin = await findIn(keeperId, child.title, true);
      if (!twin) {
        await move(child.id, { parentId: keeperId });
        continue;
      }
      const notes = await getChildren(child.id);
      for (const n of notes) await move(n.id, { parentId: twin.id });
      await removeTree(child.id);
    }
    await removeTree(extraId);
  }

  async function resolveRoot() {
    const found = await findCandidates();
    if (!found.length) {
      const made = await create({ parentId: await defaultParentId(), title: ROOT_TITLE });
      await rememberId(made.id);
      return made.id;
    }
    const keeper = found[0];
    for (let i = 1; i < found.length; i++) await mergeInto(keeper.id, found[i].id);
    if (keeper.title !== ROOT_TITLE) await update(keeper.id, { title: ROOT_TITLE });
    await rememberId(keeper.id);
    return keeper.id;
  }

  // One lookup at a time per page, so a burst of calls cannot race each other.
  let rootPending = null;

  async function getRootId() {
    if (rootIdCache) {
      const still = await getNode(rootIdCache);
      if (still) return rootIdCache;
      rootIdCache = null;
    }
    if (!rootPending) {
      rootPending = resolveRoot().then(
        (id) => { rootPending = null; rootIdCache = id; return id; },
        (err) => { rootPending = null; throw err; }
      );
    }
    return rootPending;
  }

  let firstTabPending = null;

  // "Other bookmarks / Pastemorphic", for showing people where to look.
  async function getRootPath() {
    const rootId = await getRootId();
    const names = [];
    let id = rootId;
    while (id) {
      const node = await getNode(id);
      if (!node) break;
      if (node.title) names.unshift(node.title);
      id = node.parentId;
    }
    return names;
  }

  async function getTabs() {
    const rootId = await getRootId();
    let kids = (await getChildren(rootId)).filter((k) => !k.url);
    if (!kids.length) {
      if (!firstTabPending) {
        firstTabPending = create({ parentId: rootId, title: 'Notes' }).then(
          (n) => { firstTabPending = null; return n; },
          (e) => { firstTabPending = null; throw e; }
        );
      }
      await firstTabPending;
      kids = (await getChildren(rootId)).filter((k) => !k.url);
    }
    return kids.map((k, i) => ({ id: k.id, title: k.title, index: i }));
  }

  async function addTab(title) {
    const rootId = await getRootId();
    const existing = (await getChildren(rootId)).filter((k) => !k.url);
    if (existing.length >= MAX_TABS) {
      throw new Error('Pastemorphic holds ' + MAX_TABS + ' tabs at most.');
    }
    const problem = await tabNameProblem(title);
    if (problem) throw new Error(problem);
    return create({ parentId: rootId, title: trimTabName(title) });
  }

  async function renameTab(id, title) {
    const problem = await tabNameProblem(title, id);
    if (problem) throw new Error(problem);
    return update(id, { title: trimTabName(title) });
  }

  /*
   * Put a bookmark at an exact position among its siblings.
   *
   * Browsers disagree about the index bookmarks.move expects when something
   * moves within its own folder: Chromium reads it against the list with the
   * item still in place, so moving rightwards needs one more than the position
   * wanted, while a plain remove-then-insert reading does not. Getting this
   * wrong lands everything one place short. So ask the way Chromium wants,
   * check where it actually went, and correct it once if need be.
   */
  async function placeAt(id, parentId, wanted) {
    const at = async () =>
      (await getChildren(parentId)).findIndex((k) => k.id === id);

    const from = await at();
    if (from < 0 || from === wanted) return;

    await move(id, { parentId: parentId, index: wanted > from ? wanted + 1 : wanted });
    if ((await at()) !== wanted) await move(id, { parentId: parentId, index: wanted });
  }

  // Drop a tab at a given position in the strip.
  async function moveTabTo(id, index) {
    const rootId = await getRootId();
    return placeAt(id, rootId, index);
  }

  // Drop a note at a given position within its tab.
  async function moveNoteTo(id, tabId, index) {
    return placeAt(id, tabId, index);
  }

  async function removeTab(id) {
    return removeTree(id);
  }


  /* ---- notes ------------------------------------------------------------ */

  function toNote(node, tabId, index) {
    const d = decodeNote(node.url);
    if (!d) return null;
    return {
      id: node.id,
      tabId: tabId,
      title: node.title || '',
      body: d.body,
      slot: d.slot,
      index: index
    };
  }

  async function getNotes(tabId) {
    const kids = await getChildren(tabId);
    const out = [];
    kids.forEach(function (k, i) {
      const n = toNote(k, tabId, i);
      if (n) out.push(n);
    });
    return out;
  }

  async function getAllNotes() {
    const tabs = await getTabs();
    const out = [];
    for (const t of tabs) {
      const notes = await getNotes(t.id);
      notes.forEach((n) => {
        n.tabTitle = t.title;
        out.push(n);
      });
    }
    return out;
  }

  // A slot belongs to one note at a time, wherever it lives.
  async function clearSlotElsewhere(slot, keepId) {
    if (!slot) return;
    const all = await getAllNotes();
    for (const n of all) {
      if (n.slot === slot && n.id !== keepId) {
        await update(n.id, { url: encodeNote(n.body, 0) });
      }
    }
  }

  async function addNote(tabId, title, body, slot) {
    await clearSlotElsewhere(slot, null);
    return create({
      parentId: String(tabId),
      index: 0,
      title: title || labelFor(body),
      url: encodeNote(body, slot)
    });
  }

  async function saveNote(id, title, body, slot) {
    await clearSlotElsewhere(slot, id);
    return update(id, { title: title || labelFor(body), url: encodeNote(body, slot) });
  }

  async function removeNote(id) {
    return remove(id);
  }

  async function moveNote(id, delta) {
    const node = await getNode(id);
    if (!node) return;
    const notes = await getNotes(node.parentId);
    const at = notes.findIndex((n) => n.id === id);
    const to = at + delta;
    if (at < 0 || to < 0 || to >= notes.length) return;
    return move(id, { parentId: node.parentId, index: delta > 0 ? to + 1 : to });
  }

  async function moveNoteToTab(id, tabId) {
    return move(id, { parentId: String(tabId), index: 0 });
  }

  function labelFor(body) {
    const first = String(body || '').split('\n')[0].trim();
    return first.slice(0, 60) || 'Untitled';
  }

  /* ---- bringing notes over from an older extension ----------------------- */

  function legacyField(xml, name) {
    const m = xml.match(new RegExp('<' + name + '>([\\s\\S]*?)</' + name + '>'));
    if (!m) return '';
    let v = m[1];
    try {
      v = unescape(v);
    } catch (e) {
      /* leave as-is if it was never escape()d */
    }
    return v
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }

  function parseLegacy(url) {
    if (!url || url.indexOf("javascript:void('") !== 0) return null;
    let s = url.slice("javascript:void('".length, url.length - 2);
    s = s.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (s.indexOf('<content>') === -1) return null;
    return {
      title: legacyField(s, 'title'),
      body: legacyField(s, 'content'),
      tabId: legacyField(s, 'tabID') || '0',
      tabName: legacyField(s, 'tabName') || 'Notes',
      enabled: legacyField(s, 'enabled') !== 'false'
    };
  }

  // Found by the shape of the bookmarks themselves rather than by the name of
  // the folder holding them, so a renamed or moved folder is still picked up.
  async function findLegacyNotes() {
    const tree = await getTree();
    const rootId = await getRootId();
    const found = [];
    (function walk(node, insideOurs) {
      const ours = insideOurs || node.id === rootId;
      if (node.url && !ours) {
        const p = parseLegacy(node.url);
        if (p) found.push(p);
      }
      (node.children || []).forEach((c) => walk(c, ours));
    })(tree[0] || {}, false);
    return found;
  }

  async function previewImport() {
    const notes = await findLegacyNotes();
    if (!notes.length) return { found: false, notes: 0, tabs: [] };
    const byTab = {};
    let count = 0;
    notes.forEach((p) => {
      if (!p.enabled) return;
      const name = p.tabName || 'Notes';
      (byTab[name] = byTab[name] || []).push(p);
      count++;
    });
    return { found: true, notes: count, tabs: Object.keys(byTab), byTab: byTab };
  }

  // The old format lists newest first; keep that order by adding in reverse.
  async function runImport() {
    const pre = await previewImport();
    if (!pre.found || !pre.notes) return { imported: 0, tabs: 0 };
    const rootId = await getRootId();
    let imported = 0;
    let madeTabs = 0;
    let skipped = 0;
    for (const name of pre.tabs) {
      const tabName = trimTabName(name) || 'Notes';
      let folder = await findIn(rootId, tabName, true);
      if (!folder) {
        folder = await create({ parentId: rootId, title: tabName });
        madeTabs++;
      }
      // importing twice should not double everything up
      const already = {};
      (await getNotes(folder.id)).forEach((n) => { already[n.body] = true; });
      const list = pre.byTab[name].slice().reverse();
      for (const p of list) {
        if (already[p.body]) {
          skipped++;
          continue;
        }
        already[p.body] = true;
        await create({
          parentId: folder.id,
          index: 0,
          title: p.title || labelFor(p.body),
          url: encodeNote(p.body, 0)
        });
        imported++;
      }
    }
    return { imported: imported, tabs: madeTabs, skipped: skipped };
  }

  /* ---- plain export / import -------------------------------------------- */

  async function exportAll() {
    const tabs = await getTabs();
    const out = { format: 'pastemorphic-1', tabs: [] };
    for (const t of tabs) {
      const notes = await getNotes(t.id);
      out.tabs.push({
        name: t.title,
        notes: notes.map((n) => ({ title: n.title, body: n.body, slot: n.slot }))
      });
    }
    return out;
  }

  async function importAll(data) {
    if (!data || data.format !== 'pastemorphic-1') throw new Error('Not a Pastemorphic backup file.');
    const rootId = await getRootId();
    let imported = 0;
    for (const t of data.tabs || []) {
      let folder = await findIn(rootId, t.name, true);
      if (!folder) folder = await create({ parentId: rootId, title: t.name || 'Notes' });
      const list = (t.notes || []).slice().reverse();
      for (const n of list) {
        await create({
          parentId: folder.id,
          index: 0,
          title: n.title || labelFor(n.body),
          url: encodeNote(n.body, n.slot || 0)
        });
        imported++;
      }
    }
    return imported;
  }

  /* ---- settings --------------------------------------------------------- */

  const DEFAULTS = {
    seenNotice: false,
    accent: 'brand',
    accentHex: '',
    theme: 'system',
    currentTab: '',
    clickPastes: false
  };

  function getSettings() {
    return new Promise((res) => {
      chrome.storage.sync.get(DEFAULTS, (s) => res(Object.assign({}, DEFAULTS, s)));
    });
  }
  function setSettings(patch) {
    return new Promise((res) => chrome.storage.sync.set(patch, res));
  }

  return {
    ROOT_TITLE: ROOT_TITLE,
    MAX_SLOT: MAX_SLOT,
    MAX_TABS: MAX_TABS,
    MAX_TAB_NAME: MAX_TAB_NAME,
    trimTabName: trimTabName,
    tabNameProblem: tabNameProblem,
    ACCENTS: ACCENTS,
    normaliseHex: normaliseHex,
    applyAccent: applyAccent,
    DEFAULTS: DEFAULTS,
    encodeNote: encodeNote,
    decodeNote: decodeNote,
    labelFor: labelFor,
    getRootId: getRootId,
    getRootPath: getRootPath,
    getTabs: getTabs,
    addTab: addTab,
    renameTab: renameTab,
    moveTabTo: moveTabTo,
    moveNoteTo: moveNoteTo,
    removeTab: removeTab,
    getNotes: getNotes,
    getAllNotes: getAllNotes,
    addNote: addNote,
    saveNote: saveNote,
    removeNote: removeNote,
    moveNote: moveNote,
    moveNoteToTab: moveNoteToTab,
    previewImport: previewImport,
    runImport: runImport,
    exportAll: exportAll,
    importAll: importAll,
    getSettings: getSettings,
    setSettings: setSettings
  };
})();

if (typeof self !== 'undefined') self.PM = PM;
