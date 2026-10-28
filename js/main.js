(function () {
  "use strict";

  var burger = document.querySelector(".hdr__burger");
  var drawer = document.getElementById("drawer");
  var navLinks = document.querySelectorAll(".hdr__nav a, .drawer a");

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    if (open) {
      drawer.removeAttribute("hidden");
    } else {
      drawer.setAttribute("hidden", "");
    }
  }

  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") !== "true";
      setDrawer(open);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setDrawer(false);
    });
  });

  // Highlight current section in sticky nav
  var sections = ["top", "rules", "teams", "schedule", "results"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function updateActiveNav() {
    var y = window.scrollY + 100;
    var current = "top";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= y) current = sec.id;
    });
    document.querySelectorAll(".hdr__nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", href === "#" + current);
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  // Countdown(s) to 2026-11-06 21:00 Asia/Tokyo — one tick drives all [data-countdown]
  var countdownRoots = Array.prototype.slice.call(
    document.querySelectorAll("[data-countdown]")
  );
  if (countdownRoots.length) {
    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function applyLive(root) {
      var grid = root.querySelector("[data-cd-grid]");
      var done = root.querySelector("[data-cd-done]");
      var label = root.querySelector(".cd__label");
      var sub = root.querySelector(".cd__sub");
      if (grid) grid.hidden = true;
      if (label) label.hidden = true;
      if (sub) sub.hidden = true;
      if (done) {
        done.hidden = false;
        done.textContent = "リーグ期間中";
      }
      root.classList.add("is-live");
    }

    function applyTick(root, diff) {
      var daysEl = root.querySelector('[data-cd="days"]');
      var hoursEl = root.querySelector('[data-cd="hours"]');
      var minsEl = root.querySelector('[data-cd="mins"]');
      var secsEl = root.querySelector('[data-cd="secs"]');
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minsEl) minsEl.textContent = pad(mins);
      if (secsEl) secsEl.textContent = pad(secs);
    }

    function tickAll() {
      var now = Date.now();
      var allLive = true;
      countdownRoots.forEach(function (root) {
        var targetIso = root.getAttribute("data-target") || "2026-11-06T21:00:00+09:00";
        var target = new Date(targetIso).getTime();
        var diff = target - now;
        if (diff <= 0) {
          applyLive(root);
          return;
        }
        allLive = false;
        applyTick(root, diff);
      });
      return allLive;
    }

    if (!tickAll()) {
      setInterval(function () {
        if (tickAll()) {
          /* stay live; interval can keep running harmlessly */
        }
      }, 1000);
    }
  }

  // —— Results: load data/results.json and render ——
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatScore(score) {
    if (score == null || score === "") return "—";
    var n = Number(score);
    if (Number.isNaN(n)) return escapeHtml(score);
    var sign = n > 0 ? "+" : "";
    return sign + n.toLocaleString("ja-JP");
  }


  function showEmpty(container) {
    if (!container) return;
    var empty = container.querySelector("[data-empty-state]");
    var filled = container.querySelector("[data-filled-state]");
    if (empty) empty.hidden = false;
    if (filled) filled.hidden = true;
  }

  function showFilled(container) {
    if (!container) return;
    var empty = container.querySelector("[data-empty-state]");
    var filled = container.querySelector("[data-filled-state]");
    if (empty) empty.hidden = true;
    if (filled) filled.hidden = false;
  }

  function renderTeamRanking(data) {
    var container = document.querySelector('[data-results="teamRanking"]');
    if (!container) return;
    var rows = (data && data.teamRanking) || [];
    var ready = data && data.updatedAt && rows.length &&
      rows.some(function (r) { return r.score != null; });
    if (!ready) {
      showEmpty(container);
      return;
    }
    var tbody = container.querySelector('[data-results-body="teamRanking"]');
    if (!tbody) return;
    var sorted = rows.slice().sort(function (a, b) {
      return (a.rank || 99) - (b.rank || 99);
    });
    tbody.innerHTML = sorted.map(function (row) {
      var rankClass = "rank" + (row.rank === 1 ? " rank--1" : "");
      return (
        "<tr>" +
        '<td class="' + rankClass + '">' + escapeHtml(row.rank) + "</td>" +
        '<td class="name-cell">' + escapeHtml(row.name) + "</td>" +
        '<td class="score">' + formatScore(row.score) + "</td>" +
        '<td class="games">' + escapeHtml(row.games != null ? row.games : "—") + "</td>" +
        "</tr>"
      );
    }).join("");
    showFilled(container);
  }

  function renderPlayerScores(data) {
    var container = document.querySelector('[data-results="playerScores"]');
    if (!container) return;
    var rows = (data && data.playerScores) || [];
    var ready = data && data.updatedAt && rows.length &&
      rows.some(function (r) { return r.name; });
    if (!ready) {
      showEmpty(container);
      return;
    }
    var tbody = container.querySelector('[data-results-body="playerScores"]');
    if (!tbody) return;
    var sorted = rows.slice().sort(function (a, b) {
      return (a.rank || 99) - (b.rank || 99);
    });
    tbody.innerHTML = sorted.map(function (row) {
      var rankClass = "rank" + (row.rank === 1 ? " rank--1" : "");
      return (
        "<tr>" +
        '<td class="' + rankClass + '">' + escapeHtml(row.rank) + "</td>" +
        '<td class="name-cell">' + escapeHtml(row.name) + "</td>" +
        '<td class="team-cell">' + escapeHtml(row.team) + "</td>" +
        '<td class="score">' + formatScore(row.score) + "</td>" +
        '<td class="games">' + escapeHtml(row.games != null ? row.games : "—") + "</td>" +
        "</tr>"
      );
    }).join("");
    showFilled(container);
  }

  function renderTopScores(data) {
    var container = document.querySelector('[data-results="topScores"]');
    if (!container) return;
    var rows = (data && data.topScores) || [];
    var ready = data && data.updatedAt && rows.length &&
      rows.some(function (r) { return r.name; });
    if (!ready) {
      showEmpty(container);
      return;
    }
    var list = container.querySelector('[data-results-body="topScores"]');
    if (!list) return;
    var sorted = rows.slice().sort(function (a, b) {
      return (a.rank || 99) - (b.rank || 99);
    }).slice(0, 3);
    list.innerHTML = sorted.map(function (row) {
      var metaParts = [];
      if (row.date) metaParts.push(escapeHtml(row.date));
      if (row.note) metaParts.push(escapeHtml(row.note));
      var meta = metaParts.length
        ? '<p class="top-score-card__meta">' + metaParts.join(" ／ ") + "</p>"
        : "";
      return (
        '<li class="top-score-card top-score-card--' + escapeHtml(row.rank) + '">' +
        '<span class="top-score-card__rank">TOP ' + escapeHtml(row.rank) + "</span>" +
        '<p class="top-score-card__score">' + formatScore(row.score) + "</p>" +
        '<p class="top-score-card__name">' + escapeHtml(row.name) + "</p>" +
        '<p class="top-score-card__team">' + escapeHtml(row.team) + "</p>" +
        meta +
        "</li>"
      );
    }).join("");
    showFilled(container);
  }

  function applyResults(data) {
    // Always keep empty UI when updatedAt is null (pre-kickoff)
    if (!data || data.updatedAt == null) {
      showEmpty(document.querySelector('[data-results="teamRanking"]'));
      showEmpty(document.querySelector('[data-results="playerScores"]'));
      showEmpty(document.querySelector('[data-results="topScores"]'));
      return;
    }
    renderTeamRanking(data);
    renderPlayerScores(data);
    renderTopScores(data);
  }

  function loadResults() {
    // Keep embedded empty state if fetch fails (e.g. file://)
    fetch("data/results.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("results.json " + res.status);
        return res.json();
      })
      .then(applyResults)
      .catch(function () {
        // Fall back to HTML empty state already in the page
        showEmpty(document.querySelector('[data-results="teamRanking"]'));
        showEmpty(document.querySelector('[data-results="playerScores"]'));
        showEmpty(document.querySelector('[data-results="topScores"]'));
      });
  }

  loadResults();
})();
