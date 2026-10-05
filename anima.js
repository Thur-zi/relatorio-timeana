/* Animações do relatório: entrada ao rolar, números que contam, barras que crescem, progresso de leitura.
   Tudo desligado quando o aparelho pede menos movimento (prefers-reduced-motion). */
"use strict";
(function () {
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document.documentElement;
  if (reduz || !("IntersectionObserver" in window)) { doc.classList.add("sem-movimento"); return; }
  doc.classList.add("com-movimento");

  /* ---- números que contam (preserva o formato: 1.923, 0,26%, +126%, 257 → 1.923, 7,4×) */
  const RE = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;
  function contar(el) {
    if (el.dataset.contado) return;
    el.dataset.contado = "1";
    const nos = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) if (RE.test(n.nodeValue)) { RE.lastIndex = 0; nos.push({n, orig: n.nodeValue}); }
    if (!nos.length) return;
    const t0 = performance.now(), dur = 1400;
    const passo = agora => {
      const p = Math.min(1, (agora - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      for (const {n, orig} of nos) n.nodeValue = orig.replace(RE, m => {
        const dec = (m.split(",")[1] || "").length;
        const v = parseFloat(m.replace(/\./g, "").replace(",", "."));
        return (v * e).toLocaleString("pt-BR", {minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: m.includes(".") || v >= 10000});
      });
      if (p < 1) requestAnimationFrame(passo);
      else for (const {n, orig} of nos) n.nodeValue = orig;
    };
    requestAnimationFrame(passo);
  }
  window.animarNumeros = raiz => raiz.querySelectorAll(".resumo b, .mini-kpis b").forEach(el => { delete el.dataset.contado; contar(el); });

  /* ---- barras que crescem */
  function prepararBarras(raiz) {
    raiz.querySelectorAll(".bars .l i, .gantt .t i").forEach(i => {
      if (i.dataset.w) return;
      const prop = i.closest(".gantt") ? "width" : "width";
      i.dataset.w = i.style[prop]; i.style[prop] = "0";
    });
  }
  function crescer(raiz) { raiz.querySelectorAll("[data-w]").forEach((i, k) => setTimeout(() => { i.style.width = i.dataset.w; }, 40 * k)); }

  /* ---- entrada ao rolar */
  const ALVOS = ".card, .achado, .caso, .kpi, section > h2, section .kicker, section .lead, .aviso, .solta img, .metodo";
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const el = e.target; io.unobserve(el);
      el.classList.add("visivel");
      setTimeout(() => { el.style.transitionDelay = ""; }, 1400);   // o atraso escalonado não deve atrasar o efeito de passar o mouse
      crescer(el);
      el.querySelectorAll(".resumo b, .mini-kpis b, .big").forEach(contar);
      if (el.matches(".kpi, .achado")) contar(el.querySelector("b"));
    }
  }, {threshold: .12, rootMargin: "0px 0px -6% 0px"});
  function observar() {
    document.querySelectorAll(ALVOS).forEach((el) => {
      if (el.dataset.rev) return;
      el.dataset.rev = "1"; el.classList.add("revela");
      // atraso escalonado entre irmãos (cartões lado a lado entram um depois do outro)
      const irmaos = [...el.parentElement.children].filter(x => x.matches(ALVOS));
      el.style.transitionDelay = Math.min(irmaos.indexOf(el), 6) * 90 + "ms";
      prepararBarras(el);
      io.observe(el);
    });
  }
  observar();
  // conteúdo que aparece depois (troca de abas, mapas) também ganha animação
  new MutationObserver(() => observar()).observe(document.querySelector("main"), {childList: true, subtree: true});

  /* ---- barra de progresso de leitura e botão de voltar ao topo */
  document.body.insertAdjacentHTML("beforeend", `<div class="progresso" aria-hidden="true"><i></i></div>
    <button class="topo-btn" aria-label="Voltar ao topo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>`);
  const barra = document.querySelector(".progresso i"), btn = document.querySelector(".topo-btn");
  addEventListener("scroll", () => {
    const h = doc.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    btn.classList.toggle("on", scrollY > innerHeight * 1.2);
  }, {passive: true});
  btn.addEventListener("click", () => scrollTo({top: 0, behavior: "smooth"}));

  /* ---- menu com rolagem suave */
  document.querySelectorAll('nav.menu a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const alvo = document.querySelector(a.getAttribute("href")); if (!alvo) return;
    e.preventDefault(); scrollTo({top: alvo.getBoundingClientRect().top + scrollY - 54, behavior: "smooth"});
    history.replaceState(null, "", a.getAttribute("href"));
  }));

  /* ---- segurança: na impressão/PDF, ou se a página ficar visível sem a animação disparar, tudo aparece */
  window.revelarTudo = () => document.querySelectorAll(".revela").forEach(el => { el.classList.add("visivel"); crescer(el); });
  addEventListener("beforeprint", window.revelarTudo);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") setTimeout(() => {
    document.querySelectorAll(".revela:not(.visivel)").forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < 0) { el.classList.add("visivel"); crescer(el); } });
  }, 300); });

  /* ---- capa: números contam assim que a página abre */
  setTimeout(() => document.querySelectorAll(".capa .kpi b").forEach(contar), 450);
})();
