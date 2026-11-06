/* Quiz Tâm Lý Giới Tính: dùng chung cho trang chủ, trang Nam và trang Nữ.
   Tiến độ lưu trên trình duyệt (localStorage); trang Nam và Nữ dùng chung thống kê học tập. */
(function () {
  const $ = id => document.getElementById(id);
  const mem = {};
  const store = {
    get(k) { let v = null; try { v = localStorage.getItem(k); } catch (e) {} return v ?? (k in mem ? mem[k] : null); },
    set(k, v) { mem[k] = String(v); try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmtN = n => n.toLocaleString("vi-VN");

  /* ===== Giao diện sáng/tối ===== */
  const THEMES = ["auto", "light", "dark"], THEME_NAME = { auto: "Tự động", light: "Sáng", dark: "Tối" };
  let theme = store.get("tlgt-theme") || "auto";
  function applyTheme() {
    if (theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
    $("themeBtn").textContent = "Giao diện: " + THEME_NAME[theme];
  }
  $("themeBtn").onclick = () => { theme = THEMES[(THEMES.indexOf(theme) + 1) % 3]; store.set("tlgt-theme", theme); applyTheme(); };
  applyTheme();

  /* ===== Thống kê học tập ===== */
  const GOALS = [10, 20, 50, 100];
  const MILESTONES = [10, 25, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000];
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  function loadStats() {
    try { const x = JSON.parse(store.get("tlgt-stats")); if (x && typeof x.total === "number") return { right: 0, days: {}, best: 0, ...x }; } catch (e) {}
    return { total: 0, right: 0, days: {}, best: 0 };
  }
  let stats = loadStats();
  const goal = () => GOALS.includes(+store.get("tlgt-goal")) ? +store.get("tlgt-goal") : 20;
  function streakNow() {
    const d = new Date(); let n = 0;
    if (!stats.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (stats.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  let toastTimer;
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 3200);
  }
  function recordAnswer(ok) {
    const k = dayKey();
    stats.total++; if (ok) stats.right++;
    stats.days[k] = (stats.days[k] || 0) + 1;
    const st = streakNow(); if (st > stats.best) stats.best = st;
    store.set("tlgt-stats", JSON.stringify(stats));
    if (MILESTONES.includes(stats.total)) toast(`🎉 Cột mốc ${fmtN(stats.total)} câu đã trả lời!`);
    else if (stats.days[k] === goal()) toast(`✅ Hoàn thành mục tiêu hôm nay: ${goal()} câu!`);
    renderStats();
  }
  function renderStats() {
    const today = stats.days[dayKey()] || 0, g = goal(), st = streakNow();
    const nextM = MILESTONES.find(m => m > stats.total);
    const acc = stats.total ? Math.round(stats.right / stats.total * 100) : 0;
    const week = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return stats.days[dayKey(d)] || 0; });
    const max = Math.max(g, ...week);
    $("stats").innerHTML = `
      <div class="stat"><span class="label">Tổng đã trả lời</span><b>${fmtN(stats.total)}</b><small>${stats.total ? `Đúng ${fmtN(stats.right)} câu · ${acc}%` : "Trả lời câu đầu tiên để bắt đầu"}</small></div>
      <button type="button" class="stat${today >= g ? " done" : ""}" id="goalBtn" title="Bấm để đổi mục tiêu mỗi ngày"><span class="label">Hôm nay</span><b>${fmtN(today)}<small>/${g}</small></b><span class="sbar"><i style="width:${Math.min(100, today / g * 100)}%"></i></span><small>${today >= g ? "Đạt mục tiêu ✓" : `Mục tiêu ${g} câu`} · bấm để đổi</small></button>
      <div class="stat"><span class="label">Chuỗi ngày học</span><b>${st}<small> ngày</small></b><span class="week" title="7 ngày gần nhất">${week.map(n => `<i class="${n ? "on" : ""}" style="height:${n ? Math.max(15, n / max * 100) : 15}%"></i>`).join("")}</span></div>
      <div class="stat"><span class="label">Mốc tiếp theo</span><b>${nextM ? fmtN(nextM) : "🏆"}</b><small>${nextM ? `Còn ${fmtN(nextM - stats.total)} câu` : "Đã vượt mọi cột mốc"} · Kỷ lục chuỗi ${Math.max(stats.best, st)} ngày</small></div>`;
    $("goalBtn").onclick = () => { store.set("tlgt-goal", GOALS[(GOALS.indexOf(g) + 1) % GOALS.length]); renderStats(); };
  }
  renderStats();

  /* ===== Trang chủ ===== */
  if (!window.PAGE) {
    document.querySelectorAll("[data-home]").forEach(el => {
      const key = el.dataset.home, parts = el.dataset.parts.split(",");
      const best = parts.map(p => +store.get(`tlgt-${key}-${p}-best`) || 0);
      const done = best.filter(Boolean).length;
      el.querySelector(".meta").innerHTML = `<span><b>${done}/${parts.length}</b> phần đã làm</span><span>Cao nhất <b>${done ? Math.max(...best) + "%" : "–"}</b></span>`;
    });
    return;
  }

  /* ===== Trang quiz ===== */
  const PG = window.PAGE, K = PG.key;
  const all = PG.parts.flatMap(p => p.items.map(it => ({ ...it, from: p.title })));
  const PARTS = [...PG.parts.map((p, i) => ({ ...p, num: "Phần " + (i + 1), ci: i + 1 })),
    { id: "tonghop", title: "Tổng hợp", desc: "Trộn ngẫu nhiên câu hỏi từ tất cả các phần.", items: all, num: "Tổng hợp", ci: PG.parts.length + 1 }];
  const PART = Object.fromEntries(PARTS.map(p => [p.id, p]));
  const LENGTHS = [10, 20, 30, 50, "all"];
  const L = "ABCD";

  $("mastLabel").textContent = PG.label; $("mastTitle").innerHTML = PG.title; $("mastIntro").textContent = PG.intro;
  $("otherLink").href = PG.other.href; $("otherLink").textContent = PG.other.label;

  const fromHash = () => PART[location.hash.slice(1)];
  let part = (fromHash() || PART[store.get(`tlgt-${K}-part`)] || PARTS[0]).id;
  let game = null;
  const lenOf = id => { const v = store.get(`tlgt-${K}-${id}-len`); return v === "all" ? "all" : (+v || 10); };

  function show(which) {
    for (const s of ["setup", "play", "result"]) $(s).hidden = s !== which;
  }
  function renderParts() {
    $("parts").innerHTML = PARTS.map(p => {
      const best = store.get(`tlgt-${K}-${p.id}-best`), cur = store.get(`tlgt-${K}-${p.id}-cur`);
      return `<button type="button" class="part" role="tab" data-p="${p.id}" aria-selected="${p.id === part}" style="--c:var(--c${p.ci})">
        <span class="num">${p.num}</span><h2>${esc(p.title)}</h2><p>${esc(p.desc)}</p>
        <span class="meta"><span><b>${p.items.length}</b> câu</span><span>Lượt này <b>${cur !== null ? cur + "%" : "–"}</b></span><span>Cao nhất <b>${best ? best + "%" : "–"}</b></span></span></button>`;
    }).join("");
  }
  function renderSetup() {
    const P = PART[part], n = P.items.length, len = lenOf(part);
    $("setupLabel").textContent = P.num; $("setupTitle").textContent = P.title; $("setupDesc").textContent = P.desc;
    $("lengths").innerHTML = LENGTHS.filter(x => x === "all" || x < n).map(x =>
      `<button type="button" class="chip" data-l="${x}" aria-pressed="${len === x || (x === "all" && len !== "all" && len >= n)}">${x === "all" ? `Tất cả (${n})` : x + " câu"}</button>`).join("");
    const nlen = len === "all" ? n : Math.min(len, n);
    $("countNote").textContent = nlen < 8 ? "Lượt dưới 8 câu không tính điểm cao nhất." : `Lượt này gồm ${nlen} câu, được tính phần trăm đúng và điểm cao nhất.`;
  }
  function setPart(id) {
    part = id; store.set(`tlgt-${K}-part`, id);
    history.replaceState(null, "", "#" + id);
    document.body.style.setProperty("--accent", `var(--c${PART[id].ci})`);
    game = null; $("search").value = "";
    renderParts(); renderSetup(); renderBoard(); show("setup");
  }
  $("parts").onclick = e => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    if (b.dataset.p !== part) setPart(b.dataset.p); else show("setup");
    $("setup").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("lengths").onclick = e => {
    const b = e.target.closest("[data-l]"); if (!b) return;
    store.set(`tlgt-${K}-${part}-len`, b.dataset.l); renderSetup();
  };
  window.addEventListener("hashchange", () => { const p = fromHash(); if (p && p.id !== part) setPart(p.id); });

  /* ===== Chơi ===== */
  function makeQ(it) {
    const o = shuffle(it.a.map((t, k) => ({ t, k })));
    return { ...it, opts: o.map(x => x.t), ans: o.findIndex(x => x.k === it.c) };
  }
  function start(items, retry) {
    const P = PART[part], len = lenOf(part);
    const pick = items || shuffle(P.items).slice(0, len === "all" ? P.items.length : len);
    game = { items: pick, i: 0, right: 0, misses: [], retry: !!retry, q: null, answered: false };
    if (!retry) { store.set(`tlgt-${K}-${part}-cur`, 0); renderParts(); }
    show("play"); renderQ();
  }
  function hudText() {
    const g = game;
    if (g.retry) return "Ôn lại câu sai · không tính điểm";
    return `Đúng ${g.right}/${g.items.length} · ${Math.round(g.right / g.items.length * 100)}%`;
  }
  function renderQ() {
    const g = game, q = g.q = makeQ(g.items[g.i]);
    g.answered = false;
    $("hudPos").textContent = `${PART[part].num} · Câu ${g.i + 1}/${g.items.length}`;
    $("hudScore").textContent = hudText();
    $("hudBar").style.width = (g.i / g.items.length * 100) + "%";
    $("qLabel").textContent = part === "tonghop" ? q.from : PART[part].title;
    $("qMain").textContent = q.q;
    $("explain").hidden = true; $("nextBtn").hidden = true;
    $("opts").innerHTML = q.opts.map((t, k) => `<button type="button" class="opt" data-i="${k}"><kbd>${k + 1}</kbd><span>${esc(t)}</span></button>`).join("");
  }
  function answer(k) {
    const g = game; if (!g || g.answered) return;
    g.answered = true;
    const q = g.q, ok = k === q.ans;
    recordAnswer(ok);
    if (ok) g.right++; else g.misses.push(g.items[g.i]);
    if (!g.retry) { store.set(`tlgt-${K}-${part}-cur`, Math.round(g.right / g.items.length * 100)); renderParts(); }
    [...$("opts").children].forEach((b, j) => {
      b.disabled = true;
      if (j === q.ans) b.classList.add("right"); else if (j === k) b.classList.add("wrong");
    });
    const ex = $("explain");
    ex.className = "explain" + (ok ? "" : " bad");
    ex.innerHTML = `<b class="t">${ok ? "Chính xác!" : "Chưa đúng · Đáp án " + L[q.ans]}</b><p>${esc(q.e)}</p>`;
    ex.hidden = false;
    $("hudScore").textContent = hudText();
    $("nextBtn").textContent = g.i + 1 < g.items.length ? "Câu tiếp →" : "Xem kết quả";
    $("nextBtn").hidden = false; $("nextBtn").focus();
  }
  function next() { if (++game.i < game.items.length) renderQ(); else finish(); }
  function finish() {
    const g = game, P = PART[part], pct = Math.round(g.right / g.items.length * 100), key = `tlgt-${K}-${part}-best`;
    if (!g.retry) {
      store.set(`tlgt-${K}-${part}-cur`, pct);
      if (g.items.length >= 8 && pct > (+store.get(key) || 0)) store.set(key, pct);
    }
    renderParts();
    $("rLabel").textContent = `Kết quả · ${P.num}: ${P.title}` + (g.retry ? " · Ôn lại câu sai (không tính điểm)" : "");
    $("rScore").textContent = `${g.right}/${g.items.length}`;
    $("rScore").className = "score " + (pct >= 80 ? "up" : pct >= 50 ? "ref" : "down");
    $("rMsg").textContent = pct === 100 ? "Tuyệt đối! Bạn nắm phần này rất chắc." :
      pct >= 80 ? "Rất tốt. Chỉ còn vài câu cần ôn lại." :
      pct >= 50 ? "Nền tảng ổn. Xem lại các câu dưới đây nhé." : "Còn nhiều điều mới để khám phá. Xem bảng tra cứu rồi thử lại!";
    $("rReview").innerHTML = g.misses.length
      ? `<span class="label">Cần ôn lại (${g.misses.length})</span>` + g.misses.map(it => `<div><span>${esc(it.q)}</span><small>Đáp án: ${esc(it.a[it.c])}</small></div>`).join("")
      : "";
    $("rTotal").textContent = `Tổng cộng ${fmtN(stats.total)} câu đã trả lời · Hôm nay ${fmtN(stats.days[dayKey()] || 0)}/${goal()} câu.`;
    $("retryBtn").hidden = !g.misses.length;
    $("retryBtn").textContent = `Ôn lại ${g.misses.length} câu sai`;
    show("result");
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $("startBtn").onclick = () => start();
  $("againBtn").onclick = () => start();
  $("retryBtn").onclick = () => start(shuffle(game.misses), true);
  $("setupBtn").onclick = () => show("setup");
  $("quitBtn").onclick = () => {
    const done = game.i + (game.answered ? 1 : 0);
    if (!done) return show("setup");
    game.items = game.items.slice(0, done); finish();
  };
  $("nextBtn").onclick = next;
  $("opts").onclick = e => { const b = e.target.closest(".opt"); if (b) answer(+b.dataset.i); };
  document.addEventListener("keydown", e => {
    if ($("play").hidden || !game || e.target.tagName === "INPUT") return;
    if (!game.answered && /^[1-4]$/.test(e.key)) { const b = $("opts").children[+e.key - 1]; if (b) b.click(); }
    else if (game.answered && e.key === "Enter" && document.activeElement !== $("nextBtn")) next();
  });

  /* ===== Bảng tra cứu ===== */
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
  function renderBoard() {
    const P = PART[part], qy = norm($("search").value.trim());
    $("boardLabel").textContent = `Bảng tra cứu · ${P.num}: ${P.title}`;
    const rows = P.items.filter(it => !qy || norm(it.q + " " + it.a[it.c] + " " + it.e).includes(qy));
    $("boardBody").innerHTML = rows.length
      ? rows.map(it => `<tr><td>${esc(it.q)}</td><td><b>${esc(it.a[it.c])}</b><small>${esc(it.e)}</small></td></tr>`).join("")
      : `<tr><td colspan="2" class="empty">Không tìm thấy câu nào khớp với từ khóa.</td></tr>`;
  }
  $("search").oninput = renderBoard;

  setPart(part);
})();
