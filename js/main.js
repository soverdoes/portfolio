/* ============================================================
   GROUND K® / main.js
   Lenis(스무스) + GSAP ScrollTrigger. 모바일/모션축소는 matchMedia로 분기.
   GSAP 로드 실패 시 기본 표시로 폴백.
   ============================================================ */

/* ---------- 1) 로더 (퍼센트 카운터) ---------- */
(function loader() {
  const el = document.getElementById("loader");
  const count = document.getElementById("loaderCount");
  const bar = document.getElementById("loaderBar");
  if (!el) return;
  let n = 0;
  const t = setInterval(() => {
    n += Math.floor(Math.random() * 8) + 4;
    if (n >= 100) { n = 100; clearInterval(t); setTimeout(() => { el.classList.add("done"); window.__loaded && window.__loaded(); }, 500); }
    count.textContent = String(n).padStart(3, "0");
    bar.style.width = n + "%";
  }, 80);
})();

/* ---------- 2) 메뉴 토글 ---------- */
(function menu() {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  if (!btn || !menu) return;
  const toggle = (open) => { btn.classList.toggle("open", open); menu.classList.toggle("open", open); };
  btn.addEventListener("click", () => toggle(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
})();

/* ---------- 3) 커스텀 커서 + 자석 효과 ---------- */
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
    el.addEventListener("mouseleave", () => { cur.classList.remove("is-hover", "has-label"); label.textContent = ""; });
  });
  // 자석 버튼
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

/* ---------- 4) 스크롤 애니메이션 ---------- */
(function scroll() {
  const hasGSAP = window.gsap && window.ScrollTrigger;
  if (!hasGSAP) { document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in-view")); return; }

  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  document.documentElement.classList.add("gsap-ready");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* 네이티브 스크롤 사용 (Lenis 미사용 → 즉각 반응). 앵커는 CSS scroll-behavior:smooth. */

  /* 진행바 */
  const progress = document.querySelector("#progress span");
  if (progress) gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3, onUpdate: (s) => (progress.style.transform = `scaleX(${s.progress})`) } });

  /* 히어로: 단어 마스크 리빌 (로더 끝나고 재생) */
  const heroWords = gsap.utils.toArray(".hero__title .word");
  gsap.set(heroWords, { yPercent: 115 });
  window.__loaded = () => {
    gsap.to(heroWords, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.08, delay: 0.1 });
    gsap.from(".hero__top, .hero__bottom", { opacity: 0, y: 20, duration: 1, ease: "power2.out", stagger: 0.15, delay: 0.5 });
  };
  // 로더가 이미 끝났을 수도 있으니 안전장치
  if (document.getElementById("loader").classList.contains("done")) window.__loaded();

  /* 히어로 타이틀 스크롤 시 살짝 위로 + 페이드 (패럴럭스) */
  gsap.to(".hero__title", { yPercent: -12, opacity: 0.6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* 매니페스토: 단어별 회색→흰색 하이라이트 (핀 + 스크럽) */
  const mani = document.querySelector("[data-highlight]");
  if (mani) {
    const words = mani.textContent.trim().split(/\s+/);
    mani.innerHTML = words.map((w) => `<span class="w" style="opacity:.2">${w}</span>`).join(" ");
    gsap.to(mani.querySelectorAll(".w"), {
      opacity: 1, ease: "none", stagger: 1,
      scrollTrigger: { trigger: mani, start: "top 75%", end: "bottom 60%", scrub: true },
    });
  }

  /* 마퀴: 무한 루프 + 스크롤 속도 반응 */
  const tracks = gsap.utils.toArray(".marquee__track");
  if (tracks.length) {
    // 모든 마퀴 밴드(라임 밴드 포함)에 동일한 무한 슬라이드 적용
    const loops = tracks.map((track) => gsap.to(track, { xPercent: -50, repeat: -1, duration: 24, ease: "none" }));
    ST.create({ onUpdate: (self) => { const ts = gsap.utils.clamp(-4, 4, 1 + self.getVelocity() / 400); loops.forEach((l) => l.timeScale(ts)); } });
  }

  /* 데스크톱 전용 무거운 연출 (가로 핀 갤러리 등) */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 861px)", () => {
    const track = document.getElementById("workTrack");
    const pin = document.getElementById("workPin");
    if (track && pin) {
      const amount = () => track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pad")) * 16;
      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 80),
        ease: "none",
        scrollTrigger: {
          trigger: "#work", pin: pin, scrub: 0.3, invalidateOnRefresh: true,
          // 가로 이동 거리의 0.75배만 스크롤해도 다 지나가도록(더 빠릿하게)
          end: () => "+=" + (track.scrollWidth - window.innerWidth + 80) * 0.75,
          onUpdate: (self) => {
            const now = document.getElementById("workNow");
            if (now) now.textContent = String(Math.min(8, Math.max(1, Math.round(self.progress * 7) + 1))).padStart(2, "0");
          },
        },
      });
      return () => tween.scrollTrigger && tween.scrollTrigger.kill();
    }
  });

  /* 모바일: 가로 갤러리 대신 세로 페이드업 */
  mm.add("(max-width: 860px)", () => {
    gsap.set("#workPin", { height: "auto" });
    gsap.set("#workTrack", { flexWrap: "wrap", width: "auto" });
    gsap.utils.toArray(".proj").forEach((el) => gsap.from(el, { opacity: 0, y: 40, duration: 0.8, scrollTrigger: { trigger: el, start: "top 88%" } }));
  });

  /* 스포트라이트 3개: 각각 이미지 패럴럭스 + 타이틀 등장 */
  gsap.utils.toArray(".spotlight").forEach((sp) => {
    const img = sp.querySelector(".spotlight__media > img");
    gsap.fromTo(img, { yPercent: -9 }, { yPercent: 9, ease: "none", scrollTrigger: { trigger: sp, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(sp.querySelector(".spotlight__title"), { yPercent: 45, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: sp.querySelector(".spotlight__media"), start: "top 72%" } });
  });

  /* Approach 스텝: 순차 등장 */
  gsap.utils.toArray(".astep").forEach((el) => gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));

  /* Philosophy: 가치 항목 순차 등장 */
  ST.batch(".pval", { start: "top 88%", onEnter: (els) => gsap.from(els, { opacity: 0, y: 36, duration: 0.7, stagger: 0.1, ease: "power3.out", overwrite: true }) });

  /* Awards 행: 순차 등장 */
  gsap.utils.toArray(".award").forEach((el) => gsap.from(el, { opacity: 0, x: -20, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" } }));

  /* 섹션 제목 공통 등장 */
  gsap.utils.toArray(".spotlights__title, .approach__title, .voices__title, .awards__title, .services__title").forEach((el) =>
    gsap.from(el, { opacity: 0, y: 30, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } })
  );

  /* 숫자 카운트업 */
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const target = +el.getAttribute("data-count");
    const o = { v: 0 };
    ST.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: target, duration: 1.6, ease: "power2.out", snap: { v: 1 }, onUpdate: () => (el.textContent = Math.round(o.v)) }) });
  });

  /* Philosophy 선언문 등장 */
  gsap.from(".philosophy__statement", { opacity: 0, y: 30, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".philosophy", start: "top 78%" } });

  /* 섹션 배경색 전환 (services=surface 진입 시 살짝) — 생략 가능한 미세연출 */
  gsap.utils.toArray(".mono, .services__title, .about__text, .contact__mail").forEach(() => {});

  /* 이미지 로드 후 위치 재계산 */
  window.addEventListener("load", () => ST.refresh());
})();
