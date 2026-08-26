const test = require("node:test");
const assert = require("node:assert/strict");
const { collectDirtyUids, mergeAction, sameMutation, timestamp } = require("../sync-core.js");

test("a remote-only record is pulled", () => {
  assert.equal(mergeAction(null, { updatedAt: 10 }, false), "pull");
});

test("a newer remote record replaces a clean local record", () => {
  assert.equal(mergeAction({ updatedAt: 10 }, { updatedAt: 20 }, false), "pull");
});

test("an older remote record does not replace a clean local record", () => {
  assert.equal(mergeAction({ updatedAt: 20 }, { updatedAt: 10 }, false), "push");
});

test("an unsent offline edit wins even when the device clock is behind", () => {
  assert.equal(mergeAction({ updatedAt: 10 }, { updatedAt: 999999 }, true), "push");
});

test("an unsent tombstone is pushed instead of resurrected", () => {
  assert.equal(mergeAction({ uid: "t-1", updatedAt: 10, deleted: true }, { updatedAt: 20, deleted: false }, true), "push");
});

test("a memory-only pending edit is dirty before IndexedDB persistence finishes", () => {
  const pending = new Map([
    ["rivers:r-memory", { store: "rivers", rec: { uid: "r-memory", updatedAt: 10 } }],
    ["trips:t-other", { store: "trips", rec: { uid: "t-other", updatedAt: 20 } }],
  ]);
  const dirty = collectDirtyUids("rivers", [], pending.entries());

  assert.deepEqual([...dirty], ["r-memory"]);
  assert.equal(
    mergeAction({ uid: "r-memory", updatedAt: 10 }, { uid: "r-memory", updatedAt: 999999 }, dirty.has("r-memory")),
    "push",
  );
});

test("catch mutations participate in the same durable conflict protection", () => {
  const durable = [{ store: "catches", rec: { uid: "c-1", tripUid: "t-1", deleted: false, updatedAt: 15 } }];
  const dirty = collectDirtyUids("catches", durable, []);
  assert.equal(dirty.has("c-1"), true);
  assert.equal(mergeAction(durable[0].rec, { uid: "c-1", updatedAt: 50 }, dirty.has("c-1")), "push");
});

test("equal timestamps converge without another write", () => {
  assert.equal(mergeAction({ updatedAt: 10 }, { updatedAt: 10 }, false), "none");
});

test("outbox acknowledgement only matches the exact mutation", () => {
  const sent = { uid: "r-1", updatedAt: 10, deleted: false };
  assert.equal(sameMutation(sent, { ...sent }), true);
  assert.equal(sameMutation(sent, { ...sent, updatedAt: 11 }), false);
  assert.equal(sameMutation(sent, { ...sent, deleted: true }), false);
});

test("invalid timestamps sort as the oldest value", () => {
  assert.equal(timestamp("not-a-date"), 0);
  assert.equal(timestamp(undefined), 0);
});
