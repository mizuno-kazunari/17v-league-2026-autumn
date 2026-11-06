/**
 * Boundary tests for next-match countdown / 対局中 window (Asia/Tokyo).
 * Mirrors resolveNextMatch logic in js/main.js.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const src = fs.readFileSync(new URL("../js/main.js", import.meta.url), "utf8");

const MATCH_DAYS = [
  { ymd: "2026-11-06", startIso: "2026-11-06T21:00:00+09:00", sub: "2026年11月6日（金）21:00 配信開始予定（Asia/Tokyo）" },
  { ymd: "2026-11-15", startIso: "2026-11-15T21:00:00+09:00", sub: "2026年11月15日（日） 21:00 配信開始予定（Asia/Tokyo）" },
  { ymd: "2026-11-27", startIso: "2026-11-27T21:00:00+09:00", sub: "2026年11月27日（金） 21:00 配信開始予定（Asia/Tokyo）" },
  { ymd: "2026-12-06", startIso: "2026-12-06T21:00:00+09:00", sub: "2026年12月6日（日） 配信開始予定（Asia/Tokyo）※時刻は追って掲載" },
  { ymd: "2026-12-18", startIso: "2026-12-18T21:00:00+09:00", sub: "2026年12月18日（金） 配信開始予定（Asia/Tokyo）※時刻は追って掲載" },
  { ymd: "2026-12-27", startIso: "2026-12-27T21:00:00+09:00", sub: "2026年12月27日（日） 配信開始予定（Asia/Tokyo）※時刻は追って掲載" },
  { ymd: "2027-01-08", startIso: "2027-01-08T21:00:00+09:00", sub: "2027年1月8日（金） 配信開始予定（Asia/Tokyo）※時刻は追って掲載" },
  { ymd: "2027-01-17", startIso: "2027-01-17T21:00:00+09:00", sub: "2027年1月17日（日）・最終戦 配信開始予定（Asia/Tokyo）※時刻は追って掲載" }
];

function tokyoYmd(ms) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(ms));
}

function findMatchByYmd(ymd) {
  for (var i = 0; i < MATCH_DAYS.length; i++) {
    if (MATCH_DAYS[i].ymd === ymd) return MATCH_DAYS[i];
  }
  return null;
}

function resolveNextMatch(now) {
  var today = tokyoYmd(now);
  var todayMatch = findMatchByYmd(today);
  if (todayMatch) {
    var start = new Date(todayMatch.startIso).getTime();
    if (now >= start) {
      return { kind: "live", text: "対局中" };
    }
    return {
      kind: "countdown",
      target: start,
      sub: todayMatch.sub
    };
  }

  var next = null;
  for (var i = 0; i < MATCH_DAYS.length; i++) {
    if (MATCH_DAYS[i].ymd > today) {
      next = MATCH_DAYS[i];
      break;
    }
  }

  if (!next) {
    return { kind: "finished", text: "リーグ終了" };
  }

  return {
    kind: "countdown",
    target: new Date(next.startIso).getTime(),
    sub: next.sub
  };
}

function tickKickoff(now) {
  var target = new Date("2026-11-06T21:00:00+09:00").getTime();
  var diff = target - now;
  if (diff <= 0) return { kind: "status", text: "リーグ期間中" };
  return { kind: "countdown", target };
}

function msTokyo(ymd, hms) {
  // Interpret as Asia/Tokyo wall clock via explicit +09:00 offset.
  return new Date(`${ymd}T${hms}+09:00`).getTime();
}

assert.match(src, /function resolveNextMatch\(now\)/);
assert.match(src, /if \(now >= start\)/);
assert.doesNotMatch(src, /if \(findMatchByYmd\(today\)\) \{\s*showStatus\(root, "対局中"\)/);

const cases = [
  {
    name: "Nov6 20:59:59 JST → countdown to kickoff",
    now: msTokyo("2026-11-06", "20:59:59"),
    expect: (s) => {
      assert.equal(s.kind, "countdown");
      assert.equal(s.target, msTokyo("2026-11-06", "21:00:00"));
      assert.equal(s.target - msTokyo("2026-11-06", "20:59:59"), 1000);
    }
  },
  {
    name: "Nov6 21:00:00 JST → 対局中",
    now: msTokyo("2026-11-06", "21:00:00"),
    expect: (s) => {
      assert.equal(s.kind, "live");
      assert.equal(s.text, "対局中");
    }
  },
  {
    name: "Nov6 23:59:59 JST → 対局中",
    now: msTokyo("2026-11-06", "23:59:59"),
    expect: (s) => {
      assert.equal(s.kind, "live");
      assert.equal(s.text, "対局中");
    }
  },
  {
    name: "Nov7 00:00:00 JST → countdown to Nov15",
    now: msTokyo("2026-11-07", "00:00:00"),
    expect: (s) => {
      assert.equal(s.kind, "countdown");
      assert.equal(s.target, msTokyo("2026-11-15", "21:00:00"));
    }
  },
  {
    name: "non-match morning still countdowns",
    now: msTokyo("2026-11-10", "10:00:00"),
    expect: (s) => {
      assert.equal(s.kind, "countdown");
      assert.equal(s.target, msTokyo("2026-11-15", "21:00:00"));
    }
  },
  {
    name: "after final match day → リーグ終了",
    now: msTokyo("2027-01-18", "00:00:00"),
    expect: (s) => {
      assert.equal(s.kind, "finished");
      assert.equal(s.text, "リーグ終了");
    }
  },
  {
    name: "final match day after 21:00 → 対局中 (not finished yet)",
    now: msTokyo("2027-01-17", "22:00:00"),
    expect: (s) => {
      assert.equal(s.kind, "live");
      assert.equal(s.text, "対局中");
    }
  }
];

for (const c of cases) {
  c.expect(resolveNextMatch(c.now));
  console.log("PASS next-match:", c.name);
}

// Kickoff stays independent: after opening → リーグ期間中 (not 対局中)
const kickoffLive = tickKickoff(msTokyo("2026-11-06", "21:00:00"));
assert.equal(kickoffLive.kind, "status");
assert.equal(kickoffLive.text, "リーグ期間中");
console.log("PASS kickoff: after opening stays リーグ期間中");

const kickoffBefore = tickKickoff(msTokyo("2026-11-06", "20:59:59"));
assert.equal(kickoffBefore.kind, "countdown");
console.log("PASS kickoff: before opening still countdown");

// Timezone independence: same instant expressed as UTC and as US Pacific
const instant = msTokyo("2026-11-06", "21:00:00");
assert.equal(instant, Date.parse("2026-11-06T12:00:00.000Z"));
assert.equal(resolveNextMatch(instant).kind, "live");
assert.equal(resolveNextMatch(Date.parse("2026-11-06T12:00:00.000Z")).kind, "live");
assert.equal(resolveNextMatch(Date.parse("2026-11-06T04:00:00-08:00")).kind, "live"); // PST
assert.equal(resolveNextMatch(Date.parse("2026-11-06T11:59:59.000Z")).kind, "countdown"); // 20:59:59 JST
assert.equal(tokyoYmd(Date.parse("2026-11-06T15:00:00.000Z")), "2026-11-07"); // 00:00 Nov7 JST
assert.equal(resolveNextMatch(Date.parse("2026-11-06T15:00:00.000Z")).kind, "countdown");
console.log("PASS timezone independence (UTC / PST / JST midnight boundary)");

console.log("\nAll countdown boundary tests passed.");
