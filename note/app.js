(() => {
  const docInput = document.getElementById("doc-key");
  const titleInput = document.getElementById("note-title");
  const bodyInput = document.getElementById("note-body");
  const status = document.getElementById("save-status");
  const API = "/api/note";
  const CLIENT_ID = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("fadhil-note-sync") : null;

  const storage = (() => {
    try {
      const test = "note:test";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return localStorage;
    } catch (_) {
      return null;
    }
  })();

  let docKey = normalizeDoc(new URL(location.href).searchParams.get("doc") || storage?.getItem("note:doc") || "main");
  let version = 0;
  let dirty = false;
  let saving = false;
  let loading = false;
  let saveTimer = 0;
  let pullTimer = 0;
  let draftTimer = 0;
  let retryDelay = 1200;
  let pullDelay = 6000;
  let lastSaved = { title: "", body: "" };
  let lastDraftWrite = 0;

  const draftKey = () => `note:draft:${docKey}`;
  const setStatus = (text, tone = "") => {
    if (!status) return;
    status.textContent = text;
    status.dataset.tone = tone;
  };

  function normalizeDoc(value) {
    const clean = String(value || "main").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
    return clean || "main";
  }

  function snapshot() {
    return {
      title: titleInput ? titleInput.value.trimStart().slice(0, 120) : "",
      body: bodyInput ? bodyInput.value : ""
    };
  }

  function persistDraft(note = snapshot(), savedVersion = version) {
    if (!storage) return;
    const now = Date.now();
    if (now - lastDraftWrite < 120 && note.body === lastSaved.body && note.title === lastSaved.title) return;
    lastDraftWrite = now;
    try {
      storage.setItem(draftKey(), JSON.stringify({ note, version: savedVersion, savedAt: now, dirty }));
    } catch (_) {}
  }

  function scheduleDraftPersist(delay = 160) {
    clearTimeout(draftTimer);
    draftTimer = window.setTimeout(() => persistDraft(), delay);
  }

  function readDraft() {
    try {
      return JSON.parse(storage?.getItem(draftKey()) || "null");
    } catch (_) {
      return null;
    }
  }

  function applyNote(note, nextVersion, { keepDirty = false } = {}) {
    const title = String(note?.title || "");
    const body = String(note?.body || "");
    if (titleInput && document.activeElement !== titleInput) titleInput.value = title;
    if (bodyInput && document.activeElement !== bodyInput) bodyInput.value = body;
    lastSaved = { title, body };
    version = Number(nextVersion || 0);
    dirty = keepDirty;
    persistDraft({ title, body }, version);
  }

  async function request(method, payload, { keepalive = false } = {}) {
    try {
      const response = await fetch(`${API}?doc=${encodeURIComponent(docKey)}`, {
        method,
        headers: { "content-type": "application/json" },
        cache: "no-store",
        keepalive,
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function load({ quiet = false } = {}) {
    loading = true;
    if (!quiet) setStatus("Loading…");
    const draft = readDraft();

    if (draft?.note && !dirty && (!titleInput.value && !bodyInput.value)) {
      titleInput.value = String(draft.note.title || "");
      bodyInput.value = String(draft.note.body || "");
      version = Number(draft.version || 0);
      lastSaved = { title: titleInput.value, body: bodyInput.value };
      if (draft.dirty) {
        dirty = true;
        setStatus("Recovered local draft");
      }
    }

    try {
      const data = await request("GET");
      pullDelay = 6000; // Reset pull delay on success
      if (dirty) {
        version = Number(data.version || version || 0);
        scheduleSave(80);
      } else {
        applyNote(data.note, data.version);
        setStatus("Synced");
      }
      retryDelay = 1200;
    } catch (error) {
      const msg = String(error.message || "");
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        if (!dirty) applyNote(draft?.note || { title: "", body: "" }, Number(draft?.version || 0));
        setStatus(dirty ? "Local draft pending" : "New note");
      } else {
        // Storage unavailable / 500 error / Offline
        if (draft?.note) {
          applyNote(draft.note, draft.version || 0, { keepDirty: dirty });
        }
        setStatus("Offline — local draft safe", "warn");
        // Back off polling delay so we don't spam requests when backend storage is unavailable
        pullDelay = Math.min(pullDelay * 1.5, 30000);
      }
    } finally {
      loading = false;
    }
  }

  async function saveNow({ keepalive = false } = {}) {
    if (saving || loading) return;
    const note = snapshot();
    persistDraft(note, version);
    if (!dirty && note.title === lastSaved.title && note.body === lastSaved.body) return;

    saving = true;
    setStatus("Saving…");
    try {
      const data = await request("PUT", { note, expectedVersion: version || null, clientId: CLIENT_ID }, { keepalive });
      applyNote(data.note, data.version);
      dirty = false;
      persistDraft(data.note, data.version);
      setStatus("Saved");
      retryDelay = 1200;
      pullDelay = 6000;
      channel?.postMessage({ docKey, version, clientId: CLIENT_ID });
    } catch (error) {
      const msg = String(error?.message || "").toLowerCase();
      if (msg.includes("conflict")) {
        await load({ quiet: true });
        dirty = true;
        scheduleSave(100);
      } else {
        dirty = true;
        setStatus("Draft safe locally", "warn");
        scheduleSave(retryDelay);
        retryDelay = Math.min(retryDelay * 1.8, 15000);
      }
    } finally {
      saving = false;
    }
  }

  function scheduleSave(delay = 360) {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => saveNow(), { timeout: 900 });
      } else {
        saveNow();
      }
    }, delay);
  }

  function schedulePull() {
    clearTimeout(pullTimer);
    pullTimer = window.setTimeout(async () => {
      if (!dirty && !saving) {
        await load({ quiet: true });
      }
      schedulePull();
    }, pullDelay);
  }

  function markDirty() {
    if (loading) return;
    dirty = true;
    scheduleDraftPersist();
    setStatus("Editing");
    scheduleSave();
  }

  if (docInput) {
    docInput.value = docKey;
    docInput.addEventListener("change", () => {
      docKey = normalizeDoc(docInput.value);
      docInput.value = docKey;
      storage?.setItem("note:doc", docKey);
      history.replaceState(null, "", `/note?doc=${encodeURIComponent(docKey)}`);
      load();
    });
  }

  if (titleInput) {
    titleInput.addEventListener("input", markDirty, { passive: true });
  }

  if (bodyInput) {
    bodyInput.addEventListener("input", markDirty, { passive: true });
  }

  window.addEventListener("online", () => saveNow().then(() => load({ quiet: true })));
  window.addEventListener("pagehide", () => {
    clearTimeout(draftTimer);
    persistDraft();
    saveNow({ keepalive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      clearTimeout(draftTimer);
      persistDraft();
      saveNow({ keepalive: true });
    } else {
      load({ quiet: true });
    }
  });

  channel?.addEventListener("message", (event) => {
    if (event.data?.docKey === docKey && event.data?.clientId !== CLIENT_ID && !dirty) {
      load({ quiet: true });
    }
  });

  storage?.setItem("note:doc", docKey);
  history.replaceState(null, "", `/note?doc=${encodeURIComponent(docKey)}`);
  load();
  schedulePull();
})();
