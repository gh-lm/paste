/* Service worker: keyboard slots, right-click menus, and pasting into a page. */

// Chrome runs this as a service worker and pulls the store in here; Firefox
// runs it as an event page and lists store.js in the manifest instead.
if (typeof importScripts === 'function') importScripts('lib/store.js');

const SLOT_COMMANDS = {
  slot1: 1, slot2: 2, slot3: 3, slot4: 4, slot5: 5,
  slot6: 6, slot7: 7, slot8: 8, slot9: 9
};

const MENU_ADD = 'pm-add';
const MENU_PASTE_ROOT = 'pm-paste-root';
const menuBodies = {};

/* ---- talking to the page ------------------------------------------------ */

function activeTab() {
  return new Promise((res) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (t) => res(t && t[0]));
  });
}

async function pasteIntoPage(text) {
  const tab = await activeTab();
  if (!tab) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      files: ['content.js']
    });
  } catch (e) {
    // chrome:// pages and the web store block injection; nothing we can do.
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, { from: 'pastemorphic', text: text });
  } catch (e) {
    /* the page went away mid-flight */
  }
}

/* ---- keyboard slots ----------------------------------------------------- */

chrome.commands.onCommand.addListener(async (command) => {
  const slot = SLOT_COMMANDS[command];
  if (!slot) return;
  const notes = await PM.getAllNotes();
  const hit = notes.find((n) => n.slot === slot);
  if (hit) pasteIntoPage(hit.body);
});

/* ---- right-click menus -------------------------------------------------- */

let rebuildToken = 0;

async function rebuildMenus() {
  const token = ++rebuildToken;
  const settings = await PM.getSettings();
  const tabs = await PM.getTabs();
  const current = tabs.find((t) => t.id === settings.currentTab) || tabs[0];
  const notes = current ? await PM.getNotes(current.id) : [];
  if (token !== rebuildToken) return;

  await new Promise((res) => chrome.contextMenus.removeAll(res));
  if (token !== rebuildToken) return;

  for (const k of Object.keys(menuBodies)) delete menuBodies[k];

  const quietly = () => chrome.runtime.lastError;

  chrome.contextMenus.create({
    id: MENU_ADD,
    title: 'Add to Pastemorphic',
    contexts: ['selection']
  }, quietly);

  if (!notes.length) return;

  chrome.contextMenus.create({
    id: MENU_PASTE_ROOT,
    title: 'Pastemorphic',
    contexts: ['editable']
  }, quietly);

  notes.slice(0, 30).forEach((n) => {
    const id = 'pm-note-' + n.id;
    menuBodies[id] = n.body;
    chrome.contextMenus.create({
      id: id,
      parentId: MENU_PASTE_ROOT,
      title: (n.title || PM.labelFor(n.body)).slice(0, 60),
      contexts: ['editable']
    }, quietly);
  });
}

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === MENU_ADD) {
    const settings = await PM.getSettings();
    const tabs = await PM.getTabs();
    const current = tabs.find((t) => t.id === settings.currentTab) || tabs[0];
    if (current) await PM.addNote(current.id, '', info.selectionText || '', 0);
    rebuildMenus();
    return;
  }
  let body = menuBodies[info.menuItemId];
  if (body === undefined && String(info.menuItemId).indexOf('pm-note-') === 0) {
    // The worker can be shut down and started again between building the menu
    // and someone using it, so fall back to reading the bookmark itself.
    const id = String(info.menuItemId).slice('pm-note-'.length);
    const node = await new Promise((res) => chrome.bookmarks.get(id, (r) => res(r && r[0])));
    const note = node && PM.decodeNote(node.url);
    if (note) body = note.body;
  }
  if (body !== undefined) pasteIntoPage(body);
});

/* ---- keep the menus in step --------------------------------------------- */

let pending = null;
function scheduleRebuild() {
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    rebuildMenus();
  }, 300);
}

chrome.runtime.onInstalled.addListener(rebuildMenus);
chrome.runtime.onStartup.addListener(rebuildMenus);
chrome.bookmarks.onCreated.addListener(scheduleRebuild);
chrome.bookmarks.onChanged.addListener(scheduleRebuild);
chrome.bookmarks.onRemoved.addListener(scheduleRebuild);
chrome.bookmarks.onMoved.addListener(scheduleRebuild);
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentTab) scheduleRebuild();
});

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg && msg.action === 'paste') {
    pasteIntoPage(msg.text).then(() => respond({ ok: true }));
    return true;
  }
  if (msg && msg.action === 'rebuildMenus') {
    rebuildMenus().then(() => respond({ ok: true }));
    return true;
  }
});

rebuildMenus();
