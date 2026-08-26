(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RiffleSyncCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function timestamp(value) {
    const n = typeof value === "number" ? value : Date.parse(value);
    return Number.isFinite(n) ? n : 0;
  }

  // A pending mutation means the local record has not been acknowledged by
  // Supabase. Never replace such a record during a pull, regardless of clock skew.
  function mergeAction(local, remote, locallyPending) {
    if (!local) return "pull";
    if (locallyPending) return "push";
    const localTs = timestamp(local.updatedAt);
    const remoteTs = timestamp(remote.updatedAt ?? remote.updated_at);
    if (remoteTs > localTs) return "pull";
    if (localTs > remoteTs) return "push";
    return "none";
  }

  function sameMutation(a, b) {
    return !!a && !!b && a.uid === b.uid &&
      timestamp(a.updatedAt) === timestamp(b.updatedAt) &&
      !!a.deleted === !!b.deleted;
  }

  function collectDirtyUids(store, durableItems, pendingItems) {
    const dirty = new Set();
    for (const item of durableItems || []) {
      if (item?.store === store && item.rec?.uid) dirty.add(item.rec.uid);
    }
    for (const entry of pendingItems || []) {
      const item = Array.isArray(entry) ? entry[1] : entry;
      if (item?.store === store && item.rec?.uid) dirty.add(item.rec.uid);
    }
    return dirty;
  }

  return { collectDirtyUids, mergeAction, sameMutation, timestamp };
});
