/* Injected on demand. Drops text into whatever field has the cursor,
   and falls back to the clipboard when the page will not take it. */

if (!window.__pastemorphicReady) {
  window.__pastemorphicReady = true;

  const fire = (el, type, init) => el.dispatchEvent(new (type === 'input' ? InputEvent : Event)(type, init));

  function intoField(el, text) {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value || '';
    if (start === null || start === undefined) {
      el.value = value + text;
    } else {
      el.value = value.slice(0, start) + text + value.slice(end);
    }
    fire(el, 'input', { bubbles: true, inputType: 'insertText', data: text });
    fire(el, 'change', { bubbles: true });
    if (start !== null && start !== undefined) {
      const at = start + text.length;
      try {
        el.setSelectionRange(at, at);
      } catch (e) {
        /* number and email inputs refuse a selection range */
      }
    }
    el.focus();
    return true;
  }

  function intoEditable(el, text) {
    el.focus();
    if (document.execCommand && document.execCommand('insertText', false, text)) return true;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return false;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    fire(el, 'input', { bubbles: true, inputType: 'insertText', data: text });
    return true;
  }

  async function toClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      return false;
    }
  }

  function toast(message) {
    const box = document.createElement('div');
    box.textContent = message;
    box.setAttribute('style', [
      'position:fixed', 'z-index:2147483647', 'right:16px', 'bottom:16px',
      'background:#111827', 'color:#fff', 'font:14px/1.4 system-ui,sans-serif',
      'padding:10px 14px', 'border-radius:10px', 'max-width:280px',
      'box-shadow:0 8px 24px rgba(0,0,0,.3)'
    ].join(';'));
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }

  chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    if (!msg || msg.from !== 'pastemorphic' || typeof msg.text !== 'string') return;
    const el = document.activeElement;
    let done = false;
    if (el && el !== document.body) {
      if (el.isContentEditable) done = intoEditable(el, msg.text);
      else if ('value' in el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) done = intoField(el, msg.text);
    }
    if (done) {
      respond({ ok: true, pasted: true });
      return;
    }
    toClipboard(msg.text).then((copied) => {
      toast(copied
        ? 'Pastemorphic: no text box in focus, so it was copied instead.'
        : 'Pastemorphic could not paste or copy on this page.');
      respond({ ok: true, pasted: false, copied: copied });
    });
    return true;
  });
}
