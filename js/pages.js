/* ============================================================
   최재성® / pages.js — 서브페이지 공통 스크립트
   로더 · 메뉴 · 커스텀 커서/자석 · 진행바 · 리빌 · 카운트업
   GSAP 있으면 스크럽/스무스, 없으면 IntersectionObserver 폴백.
   ============================================================ */

/* ---------- 로더 ---------- */
(function loader() {
  const el = document.getElementById("loader");
  if (!el) return;
  const count = document.getElementById("loaderCount");
  const bar = document.getElementById("loaderBar");
  let n = 0;
  const t = setInterval(() => {
    n += Math.floor(Math.random() * 10) + 6;
    if (n >= 100) { n = 100; clearInterval(t); setTimeout(() => el.classList.add("done"), 350); }
    if (count) count.textContent = String(n).padStart(3, "0");
    if (bar) bar.style.width = n + "%";
  }, 70);
})();

/* ---------- 메뉴 토글 ---------- */
(function menu() {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  if (!btn || !menu) return;
  const toggle = (open) => { btn.classList.toggle("open", open); menu.classList.toggle("open", open); };
  btn.addEventListener("click", () => toggle(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
})();

/* ---------- 커스텀 커서 + 자석 ---------- */
(function cursor() {
  const cur = document.getElementById("cursor");
  const label = document.getElementById("cursorLabel");
  if (!cur || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  (function render() {
    cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
    cur.style.left = cx + "px"; cur.style.top = cy + "px";
    requestAnimationFrame(render);
  })();
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cur.classList.add("is-hover");
      const l = el.getAttribute("data-cursor-label");
      if (l) { cur.classList.add("has-label"); label.textContent = l; }
    });
    el.addEventListener("mouseleave", () => { cur.classList.remove("is-hover", "has-label"); if (label) label.textContent = ""; });
  });
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
})();

/* ---------- 진행바 ---------- */
(function progress() {
  const bar = document.querySelector("#progress span");
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- 리빌 + 카운트업 ---------- */
(function reveal() {
  document.documentElement.classList.add("gsap-ready");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 리빌: data-reveal 없는 요소도 .reveal 이면 처리
  const items = document.querySelectorAll(".reveal");
  if (reduce) { items.forEach((e) => e.classList.add("in-view")); }
  else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const el = e.target;
          const d = parseFloat(el.getAttribute("data-delay") || 0);
          setTimeout(() => el.classList.add("in-view"), d * 1000);
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else { items.forEach((e) => e.classList.add("in-view")); }

  // 스킬바 채우기
  document.querySelectorAll(".skill__bar i").forEach((el) => {
    // CSS 변수 --v 로 폭 지정. 진입 시 애니메이션.
    el.style.transform = "scaleX(0)";
    if ("IntersectionObserver" in window && !reduce) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { el.style.transition = "transform 1.1s var(--ease)"; el.style.transform = "scaleX(1)"; io.unobserve(el); } });
      }, { threshold: 0.4 });
      io.observe(el);
    } else { el.style.transform = "scaleX(1)"; }
  });

  // 카운트업
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = +el.getAttribute("data-count");
    if (reduce || !("IntersectionObserver" in window)) { el.textContent = target; return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          const dur = 1400; const t0 = performance.now();
          const step = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });
})();

/* ---------- 마퀴(있으면) ---------- */
(function marquee() {
  const tracks = document.querySelectorAll(".marquee__track");
  tracks.forEach((track) => {
    let x = 0; const speed = 0.4;
    (function loop() { x -= speed; if (x <= -50) x = 0; track.style.transform = `translateX(${x}%)`; requestAnimationFrame(loop); })();
  });
})();
