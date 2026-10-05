/* Relatório Ana Paula Siqueira × trabalho da MOBI — monta a página a partir de dados.js (só números agregados) */
"use strict";
const D = window.DADOS, C = D.candidata, LD = D.leads, T = D.totais, M = D.mobi, B = D.base, F = D.formularios.formularios, R0 = M.rede, EX = D.lovable_extras;
const $ = s => document.querySelector(s);
const nf = new Intl.NumberFormat("pt-BR");
const int = v => v == null ? "–" : nf.format(Math.round(v));
const pct = (v, d = 1) => v == null || !isFinite(v) ? "–" : (v * 100).toLocaleString("pt-BR", {minimumFractionDigits: d, maximumFractionDigits: d}) + "%";
const pp = (v, d = 2) => v == null || !isFinite(v) ? "–" : (v > 0 ? "+" : "") + v.toLocaleString("pt-BR", {minimumFractionDigits: d, maximumFractionDigits: d}) + " p.p.";
const dec = (v, d = 1) => v == null || !isFinite(v) ? "–" : v.toLocaleString("pt-BR", {minimumFractionDigits: d, maximumFractionDigits: d});
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const titulo = s => String(s ?? "").toLowerCase().replace(/(^|[\s(/-])\S/g, c => c.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E)\b/g, m => m.toLowerCase()).replace(/\(Bh\)/, "(BH)");
const dataBR = s => s ? s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(2, 4) : "–";
const COR = {roxo: "#6d1eb2", vermelho: "#f33114", amarelo: "#fdc402", lilas: "#d7adf2", esc: "#40116b", cinza: "#b9aec4"};
Chart.defaults.font.family = "Montserrat, system-ui, sans-serif"; Chart.defaults.color = "#4b3b5c";
// Gráficos só são desenhados quando aparecem na tela (assim a animação de entrada é vista)
const SEM_MOVIMENTO = matchMedia("(prefers-reduced-motion: reduce)").matches;
Chart.defaults.animation.duration = SEM_MOVIMENTO ? 0 : 1300; Chart.defaults.animation.easing = "easeOutQuart";
function grafico(canvas, cfg) {
  if (SEM_MOVIMENTO || !("IntersectionObserver" in window)) return new Chart(canvas, cfg);
  const io = new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); new Chart(canvas, cfg); } }, {threshold: .2});
  io.observe(canvas);
}
const cresc = C.votos26 / C.votos22 - 1;
// quantas vezes a participação cresceu (comparação justa entre quem parte de bases muito diferentes)
const vezes = (a, b) => a == null || b == null ? "–" : a <= 0 ? (b > 0 ? "novo" : "–") : dec(b / a, 1) + "×";
const fonte = Object.fromEntries(B.por_fonte);
const PESQ = ["Pesquisa Alto Vera Cruz", "Questionário Ana (São Geraldo)", "Questionário Reinaldinho"];
const totalPesq = PESQ.reduce((t, k) => t + F[k].respostas, 0);
const totalAssin = 24433 + ["Água Sem Lucro", "Asfaltamento da MG-229", "SOS Oncologia", "Fim da Escala 6x1"].reduce((t, k) => t + F[k].respostas, 0) + EX["Feira Hippie Mais Segura"].total + EX["Cuidar com Dignidade"].total;
const mult = R0.indicadores_faixas.find(f => f[0] === "100+");
const casos = Object.fromEntries(M.casos.map(c => [c.campanha, c]));
const cBH = M.comparacao.bh, cM = M.comparacao.mun;

/* ---------- capa: primeiro a votação da Ana, depois a mobilização */
const bhM = D.municipios.find(m => m.mun === 41238);
$("#kpis").innerHTML = [
  ["dest", int(C.votos26), "votos em 2026"], ["", "+" + pct(cresc, 0), `sobre 2022 (${int(C.votos22)} votos)`],
  ["", C.pos_federacao + "ª", `mais votada da federação, eleita por quociente partidário`], ["", int(T.municipios_com_voto26), `cidades com voto (eram ${int(T.municipios_com_voto22)} em 2022)`],
  ["", int(T.bh_v26), `votos em Belo Horizonte (+${pct(T.bh_v26 / T.bh_v22 - 1, 0)})`], ["dest", int(B.total_unicos), "contatos construídos com a MOBI"],
].map(([c, v, t]) => `<div class="kpi ${c}"><b>${v}</b><span>${t}</span></div>`).join("");

/* ---------- resumo */
const mg229 = casos["Asfaltamento da MG-229"], sos = casos["SOS Oncologia"], agua = casos["Água Sem Lucro"];
const dom = mg229.territorios.find(t => /DOM JOAQUIM/.test(t.nome)), vic = sos.territorios.find(t => /^VI.OSA$/.test(t.nome));
const RG = D.regionais.slice().sort((a, b) => b.dpp - a.dpp);
$("#achados").innerHTML = [
  ["", "+" + pct(cresc, 0), `Ana mais que dobrou a votação: de ${int(C.votos22)} votos em 2022 para ${int(C.votos26)} em 2026, ${pct(C.pct26 / 100, 2)} dos válidos. Foi reeleita por quociente partidário, como a ${C.pos_federacao}ª mais votada da ${titulo(C.federacao)}, que fez ${C.fed_cadeiras} cadeiras.`],
  ["verm", int(T.municipios_com_voto26), `cidades com voto, contra ${int(T.municipios_com_voto22)} em 2022: ${int(M.territorios.cidades_novas)} cidades passaram a votar na Ana pela primeira vez. Fora da capital, os destaques foram ${D.municipios.filter(m => m.mun !== 41238).slice(0, 3).map(m => titulo(m.nome)).join(", ")}.`],
  ["amar", int(T.bh_v26), `votos em Belo Horizonte (${pct(T.bh_v26 / C.votos26, 0)} do total), ${pct(T.bh_v26 / T.bh_v22 - 1, 0)} a mais que em 2022. A Regional ${D.regionais[0].nome} segue como a principal base; ${RG[0].nome} e ${RG[1].nome} foram as que mais cresceram.`],
  ["", int(B.total_unicos), `contatos únicos construídos com a mobilização da MOBI em 10 frentes (Time Ana, petições temáticas e pesquisas de campo), ${int(mult[2])} assinaturas trazidas por uma rede de ${int(mult[1])} lideranças.`],
  ["verm", `${int(dom.v22)} → ${int(dom.v26)}`, `votos em Dom Joaquim, onde a pauta do asfaltamento da MG-229 reuniu ${int(dom.assinaturas)} assinaturas; em Viçosa, cidade da petição SOS Oncologia, foram ${int(vic.v22)} → ${int(vic.v26)} votos.`],
  ["amar", pp(cBH[3].ana_dpp), `(pontos percentuais) foi quanto a Ana cresceu nos bairros de BH com mais contatos por eleitor, mais que o dobro dos bairros com menos contatos (${pp(cBH[0].ana_dpp)}).`],
].map(([c, n, t]) => `<div class="achado ${c}"><b class="n">${n}</b><div>${t}</div></div>`).join("");

/* ---------- o trabalho: linha do tempo, contatos por ação, sobreposição */
const acoes = [
  ["Água Sem Lucro", F["Água Sem Lucro"], COR.vermelho], ["Asfaltamento da MG-229", F["Asfaltamento da MG-229"], COR.vermelho], ["SOS Oncologia", F["SOS Oncologia"], COR.vermelho],
  ["Fim da Escala 6x1", F["Fim da Escala 6x1"], COR.vermelho], ["Pesquisa Alto Vera Cruz", F["Pesquisa Alto Vera Cruz"], COR.amarelo],
  ["Time Ana", {inicio: LD.por_dia[0][0], fim: LD.por_dia[LD.por_dia.length - 1][0], respostas: 24433}, COR.roxo],
  ["Questionário São Geraldo", F["Questionário Ana (São Geraldo)"], COR.amarelo], ["Feira Hippie Mais Segura", {...EX["Feira Hippie Mais Segura"], respostas: EX["Feira Hippie Mais Segura"].total}, COR.vermelho],
  ["Questionário Reinaldinho", F["Questionário Reinaldinho"], COR.amarelo], ["Cuidar com Dignidade", {...EX["Cuidar com Dignidade"], respostas: EX["Cuidar com Dignidade"].total}, COR.vermelho],
];
const t0 = new Date("2025-10-01").getTime(), t1 = new Date("2026-10-05").getTime();
const posT = s => (new Date(s).getTime() - t0) / (t1 - t0) * 100;
$("#gantt").innerHTML = acoes.map(([n, f, c]) => `<div class="row"><div class="n" title="${esc(n)}">${esc(n)} <small>· ${int(f.respostas)}</small></div>
  <div class="t"><i style="left:${posT(f.inicio)}%;width:${Math.max(1.2, posT(f.fim) - posT(f.inicio))}%;background:${c}" title="${dataBR(f.inicio)} a ${dataBR(f.fim)}"></i></div></div>`).join("")
  + `<div class="eixo"><span></span><div><span>out/25</span><span>jan/26</span><span>abr/26</span><span>jul/26</span><span>out/26</span></div></div>
  <div class="legenda"><span><b style="background:${COR.roxo}"></b>mobilização digital</span><span><b style="background:${COR.vermelho}"></b>petições temáticas</span><span><b style="background:${COR.amarelo}"></b>pesquisas de campo</span></div>`;
$("#trabTexto").innerHTML = `Ao longo de um ano, a MOBI conduziu <b>${acoes.length} frentes de mobilização</b> com a Ana: o Time Ana (rede de apoiadores com link próprio), petições ligadas a pautas do mandato (água, saúde, estradas, trabalho, segurança e cuidado) e pesquisas porta a porta. Tudo isso formou uma base de <b>${int(B.total_unicos)} contatos únicos</b>, com cidade e, em BH, bairro, que segue em contato com a Ana pelo WhatsApp.`;
const fontesOrd = B.por_fonte.filter(([f]) => f !== "CRM (outras origens)"), mxF = fontesOrd[0][1];
$("#porFonte").innerHTML = fontesOrd.map(([f, n]) => `<div class="l"><span>${esc(f)}</span><i style="width:${n / mxF * 100}%;max-width:55%"></i><em>${int(n)}</em></div>`).join("");
$("#porFonteNota").textContent = `Contatos únicos de cada ação, identificados pelo WhatsApp. O Time Ana aparece com os ${int(fonte["Time Ana"])} contatos já integrados à base; contando as assinaturas que ficaram só no site, são 24.433.`;
const mv = B.em_varias_campanhas, v2 = Object.entries(mv).filter(([k]) => +k >= 2).reduce((t, [, v]) => t + v, 0);
grafico($("#gMulti"), {type: "doughnut", data: {labels: ["Participaram de 1 ação", "Participaram de 2 ou mais"], datasets: [{data: [mv["1"], v2], backgroundColor: [COR.lilas, COR.roxo], borderColor: "#fff", borderWidth: 2}]},
  options: {plugins: {legend: {position: "bottom"}}, cutout: "60%"}});
$("#multiNota").textContent = `${int(v2)} pessoas participaram de duas ou mais ações (por exemplo, assinaram a Água Sem Lucro e a Fim da Escala 6x1). Quem chega por uma pauta passa a acompanhar as outras.`;

/* ---------- Time Ana */
const fu = R0.funil;
$("#taTexto").innerHTML = `O Time Ana funcionou como uma rede: cada apoiador recebia um link próprio para convidar outras pessoas. Foram <b>${int(fu.visualizacoes)} acessos</b> de <b>${int(fu.visitantes)} visitantes</b>, ${pct(R0.dispositivos.mobile / fu.visitantes, 0)} pelo celular, e <b>${pct(R0.origem_visitantes[0][1] / fu.visitantes, 0)} chegaram por um link de indicação</b>. Em dois meses, 24.433 assinaturas, ${int(LD.timeana_bh_com_bairro)} delas em BH com bairro informado.`;
const funil = [["Acessos às páginas", fu.visualizacoes, COR.lilas], ["Cliques em links de indicação", fu.cliques_indicacao, COR.lilas], ["Assinaturas", fu.assinaturas, COR.roxo], ["Visitantes únicos", fu.visitantes, COR.cinza], ["Visitantes que iniciaram o formulário", fu.form_inicio_visitantes, COR.cinza]];
$("#funil").innerHTML = funil.map(([k, v, c]) => `<div class="l"><span>${k}</span><i style="width:${v / funil[0][1] * 100}%;max-width:55%;background:${c}"></i><em>${int(v)}</em></div>`).join("");
$("#funilNota").textContent = "Há mais assinaturas que visitantes porque muitas lideranças coletaram assinaturas pessoalmente, pelo próprio celular: uma mesma pessoa registrava vizinhos, colegas e familiares.";
grafico($("#gRede"), {type: "bar", data: {labels: R0.indicadores_faixas.map(f => f[0] === "1" ? "1 assinatura" : f[0] + " assinaturas"),
  datasets: [{label: "Lideranças", data: R0.indicadores_faixas.map(f => f[1]), backgroundColor: COR.lilas, yAxisID: "y"}, {label: "Assinaturas trazidas", data: R0.indicadores_faixas.map(f => f[2]), backgroundColor: COR.roxo, yAxisID: "y2"}]},
  options: {scales: {y: {title: {display: true, text: "lideranças"}, grid: {color: "#f1e8f6"}}, y2: {position: "right", title: {display: true, text: "assinaturas"}, grid: {display: false}}}}});
$("#redeNota").textContent = `${int(mult[1])} lideranças trouxeram ${int(mult[2])} assinaturas (${pct(mult[2] / 24433, 0)}); as 15 maiores trouxeram entre ${int(R0.top15_indicadores[14])} e ${int(R0.top15_indicadores[0])} cada.`;
const dias = LD.por_dia, acum = []; dias.reduce((t, [, n]) => (acum.push(t + n), t + n), 0);
grafico($("#gDias"), {data: {labels: dias.map(d => d[0].slice(8, 10) + "/" + d[0].slice(5, 7)),
  datasets: [{type: "bar", label: "Assinaturas no dia", data: dias.map(d => d[1]), backgroundColor: COR.lilas, yAxisID: "y"},
    {type: "line", label: "Acumulado", data: acum, borderColor: COR.roxo, backgroundColor: COR.roxo, pointRadius: 0, borderWidth: 3, yAxisID: "y2", tension: .25}]},
  options: {interaction: {mode: "index", intersect: false}, scales: {y: {beginAtZero: true, grid: {color: "#f1e8f6"}}, y2: {position: "right", beginAtZero: true, grid: {display: false}}, x: {grid: {display: false}, ticks: {maxTicksLimit: 14}}}}});
function barras(el, lista, cor = COR.roxo, n = 12) {
  const mx = Math.max(...lista.slice(0, n).map(x => x[1]));
  $(el).innerHTML = lista.slice(0, n).map(([k, v]) => `<div class="l"><span>${esc(k)}</span><i style="width:${v / mx * 100}%;max-width:55%;background:${cor}"></i><em>${int(v)}</em></div>`).join("");
}
barras("#taCidades", D.municipios.filter(m => m.leads_ta > 0).sort((a, b) => b.leads_ta - a.leads_ta).map(m => [titulo(m.nome), m.leads_ta]));
barras("#taBairros", R0.bairros_rede.map(b => [b[0], b[1]]), COR.vermelho);

/* ---------- campanhas no território */
$("#campTexto").innerHTML = `Cada petição nasceu de uma pauta do mandato e foi levada a um território. Para cada uma, as cidades com mais assinaturas e a votação da Ana em 2022 e 2026, ao lado do que aconteceu com os demais candidatos da federação nos mesmos lugares. Referência: no estado inteiro, a Ana passou de <b>${pct(M.total_mg.p22, 2)}</b> para <b>${pct(M.total_mg.p26, 2)}</b> dos votos válidos (${dec(M.total_mg.p26 / M.total_mg.p22, 1)}×).`;
const ORDEM = ["Asfaltamento da MG-229", "SOS Oncologia", "Água Sem Lucro", "Fim da Escala 6x1", "Feira Hippie Mais Segura", "Cuidar com Dignidade"];
const DESC = {"Asfaltamento da MG-229": "Pelo asfaltamento da rodovia que liga Dom Joaquim, Conceição do Mato Dentro, Guanhães e Senhora do Porto.",
  "SOS Oncologia": "Pela manutenção e ampliação do atendimento oncológico na Zona da Mata, com foco em Viçosa e cidades vizinhas.",
  "Água Sem Lucro": "Petição estadual pela Copasa pública e pela tarifa justa: a maior ação de captação, presente em centenas de cidades.",
  "Fim da Escala 6x1": "Pela redução da jornada de trabalho, com adesão concentrada em BH e na Região Metropolitana.",
  "Feira Hippie Mais Segura": "Por guaritas da Guarda Municipal na Feira Hippie de BH, com feirantes e frequentadores.",
  "Cuidar com Dignidade": "Pela valorização de quem cuida de pessoas idosas, na reta final da campanha."};
const cls = v => v > 0 ? "pos" : v < 0 ? "neg" : "";
$("#casos").innerHTML = ORDEM.map(n => {
  const c = casos[n]; if (!c || !c.territorios.length) return "";
  const ts = c.territorios.slice(0, n === "Água Sem Lucro" ? 12 : 8);
  return `<article class="caso"><header><h3>${esc(n)}</h3><span class="chip">petição</span><span class="nota">${dataBR(c.inicio)} a ${dataBR(c.fim)} · ${int(c.total)} assinaturas</span></header>
    <p class="nota" style="margin:0">${esc(DESC[n] || "")}</p>
    <div class="resumo"><div><b>${int(c.v22)}<span class="seta">→</span>${int(c.v26)}</b><span>votos da Ana nos territórios listados (2022 → 2026)</span></div>
      <div><b>${pct(c.p22, 2)}<span class="seta">→</span>${pct(c.p26, 2)}</b><span>participação nos votos válidos</span></div>
      <div><b>${dec(c.p26 / c.p22, 1)}×</b><span>multiplicação da participação (estado: ${dec(M.total_mg.p26 / M.total_mg.p22, 1)}×)</span></div></div>
    <div class="tab-wrap" style="max-height:none"><table><thead><tr><th style="cursor:default">Cidade / bairro</th><th style="cursor:default">Assinaturas</th><th style="cursor:default">Votos 2022</th><th style="cursor:default">Votos 2026</th><th style="cursor:default">Ana: participação</th><th style="cursor:default">Ana</th><th style="cursor:default">Federação</th></tr></thead>
    <tbody>${ts.map(t => `<tr><td>${esc(titulo(t.nome))}</td><td>${int(t.assinaturas)}</td><td>${int(t.v22)}</td><td><b>${int(t.v26)}</b></td><td>${pct(t.p22, 2)} → ${pct(t.p26, 2)}</td><td class="pos">${vezes(t.p22, t.p26)}</td><td class="${t.fed_p26 >= t.fed_p22 ? "" : "neg"}">${vezes(t.fed_p22, t.fed_p26)}</td></tr>`).join("")}</tbody></table></div>
  </article>`;
}).join("") + `<p class="nota" style="margin-top:10px" id="casosNota">Ana e Federação: quantas vezes a participação nos votos válidos para deputado estadual cresceu entre 2022 e 2026 ("novo" quando a Ana não tinha votos em 2022). "Federação" soma os demais candidatos e a legenda de PT, PCdoB e PV, sem a Ana. Cidades com pelo menos 15 assinaturas (50 na Água Sem Lucro); uma mesma cidade pode aparecer em mais de uma campanha.</p>`;

/* ---------- pesquisas */
const avc = F["Pesquisa Alto Vera Cruz"], sg = F["Questionário Ana (São Geraldo)"], rei = F["Questionário Reinaldinho"];
const resp = (f, txt) => { const p = f.perguntas.find(q => q.pergunta.toLowerCase().includes(txt)); if (!p) return {sim: null, o: {}, total: 0}; const o = Object.fromEntries(p.respostas); return {sim: (o["Sim"] || 0) / p.total, o, total: p.total}; };
const bAVC = D.bairros.find(b => b.nome === "Alto Vera Cruz"), bSG = D.bairros.find(b => b.nome === "São Geraldo");
$("#pesqTexto").innerHTML = `Além do digital, a MOBI levou <b>${int(totalPesq)} entrevistas</b> para a rua, com equipes de entrevistadores, para ouvir as demandas dos bairros e apresentar o trabalho da Ana. As respostas viraram contatos (com autorização) e informação para o mandato.`;
const cardP = (tit, f, extras) => `<div class="card"><h3>${tit}</h3><div class="mini-kpis"><div><b>${int(f.respostas)}</b><span>entrevistas</span></div>${f.entrevistadores ? `<div><b>${f.entrevistadores}</b><span>entrevistadores</span></div>` : ""}</div><p class="nota" style="margin:6px 0">${dataBR(f.inicio)} a ${dataBR(f.fim)}</p>${extras}</div>`;
const ind = resp(avc, "indicaria"), cam = resp(avc, "caminhar juntos"), con = resp(avc, "conhece a deputada"), indSG = resp(sg, "indicaria"), apoioR = resp(rei, "podemos contar com o seu apoio");
const ido = (sg.idades.find(i => i[0] === "60+") || [0, 0])[1];
$("#pesqCards").innerHTML = cardP("Alto Vera Cruz", avc, `<p><b>${pct(ind.sim, 0)}</b> indicariam a Ana a amigos e familiares; <b>${pct(cam.sim, 0)}</b> toparam caminhar juntos na pré-candidatura e ${pct((cam.o["Vou Pensar"] || 0) / cam.total, 0)} disseram "vou pensar". Antes da conversa, ${pct(con.sim, 0)} conheciam a Ana.</p>
  <p class="nota">Votação da Ana no bairro: ${int(bAVC.v22)} → ${int(bAVC.v26)} votos, ${pct(bAVC.p22, 1)} → ${pct(bAVC.p26, 1)} dos válidos. É o bairro de BH onde ela tem mais votos.</p>`)
  + cardP("São Geraldo e vizinhança", sg, `<p><b>${pct(indSG.sim, 0)}</b> indicariam a Ana; ${pct(resp(sg, "conhece a deputada").sim, 0)} já a conheciam. Público mais velho: ${pct(ido / sg.respostas, 0)} com 60 anos ou mais.</p>
  <p class="nota">Votação no São Geraldo: ${int(bSG.v22)} → ${int(bSG.v26)} votos (${pct(bSG.p22, 1)} → ${pct(bSG.p26, 1)}).</p>`)
  + cardP("Com o vereador Reinaldinho", rei, `<p><b>${pct(apoioR.sim, 0)}</b> declararam apoio ao trabalho do Reinaldinho e à reeleição da Ana; ${pct(resp(rei, "receber a visita").sim, 0)} pediram visita na rua.</p><p class="nota">Pesquisa feita em parceria com o vereador, apresentando entregas conjuntas (viaturas, revitalização do parque).</p>`);
const perg = avc.perguntas.filter(p => /sabia que/i.test(p.pergunta));
const rot = ["Recursos para escolas da Regional Leste", "Mais recursos para a saúde de BH", "Presidente da Comissão da Mulher", "Frente da Criança e do Adolescente"];
grafico($("#gConhece"), {type: "bar", data: {labels: ["Conhece a Ana"].concat(rot.slice(0, perg.length)),
  datasets: [{label: "Sim", data: [con.sim * 100].concat(perg.map(p => (Object.fromEntries(p.respostas)["Sim"] || 0) / p.total * 100)), backgroundColor: COR.roxo}]},
  options: {indexAxis: "y", plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => dec(c.raw, 0) + "% responderam sim"}}}, scales: {x: {max: 100, ticks: {callback: v => v + "%"}, grid: {color: "#f1e8f6"}}, y: {grid: {display: false}}}}});
const meios = avc.perguntas.find(p => /acompanha not/i.test(p.pergunta));
grafico($("#gMeios"), {type: "doughnut", data: {labels: meios.respostas.map(r => r[0]), datasets: [{data: meios.respostas.map(r => r[1]), backgroundColor: [COR.roxo, COR.vermelho, COR.amarelo, COR.lilas, COR.cinza, COR.esc], borderColor: "#fff", borderWidth: 2}]},
  options: {plugins: {legend: {position: "bottom"}}, cutout: "55%"}});

/* ---------- tabelas ordenáveis */
function tabela(el, cols, linhas, ordIni) {
  const box = $(el); let ord = ordIni ?? 1, dir = -1, filtro = "";
  function desenhar() {
    const ls = linhas.filter(r => !filtro || cols.some(c => c.busca && String(r[c.k] ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(filtro)))
      .sort((a, b) => { const x = a[cols[ord].k], y = b[cols[ord].k]; return (typeof x === "string" ? x.localeCompare(y) : ((x ?? -1e9) - (y ?? -1e9))) * dir; });
    box.innerHTML = `<table><thead><tr>${cols.map((c, i) => `<th data-i="${i}" ${i === ord ? `aria-sort="${dir < 0 ? "descending" : "ascending"}"` : ""}>${c.t}</th>`).join("")}</tr></thead>
      <tbody>${ls.slice(0, 600).map(r => `<tr>${cols.map(c => `<td>${c.f ? c.f(r) : esc(r[c.k])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  box.addEventListener("click", e => { const th = e.target.closest("th"); if (!th) return; const i = +th.dataset.i; if (i === ord) dir = -dir; else { ord = i; dir = -1; } desenhar(); });
  desenhar();
  return q => { filtro = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); desenhar(); };
}
const fpp = v => `<span class="${cls(v)}">${pp(v)}</span>`;

/* ---------- Minas Gerais */
const fora = D.municipios.filter(m => m.mun !== 41238);
$("#mgTexto").innerHTML = `A Ana teve voto em <b>${int(T.municipios_com_voto26)} das 853 cidades</b> de Minas, contra ${int(T.municipios_com_voto22)} em 2022. Belo Horizonte deu ${int(T.bh_v26)} votos (${pct(T.bh_v26 / C.votos26, 0)} do total). Fora da capital, as maiores votações foram ${fora.slice(0, 5).map(m => `${titulo(m.nome)} (${int(m.v26)})`).join(", ")}.`;
const filtroMun = tabela("#tabMun", [
  {t: "Cidade", k: "nome", busca: true, f: r => titulo(r.nome)}, {t: "Votos 2026", k: "v26", f: r => int(r.v26)}, {t: "% 2026", k: "p26", f: r => pct(r.p26, 2)},
  {t: "Votos 2022", k: "v22", f: r => int(r.v22)}, {t: "Ana (p.p.)", k: "dpp", f: r => fpp(r.dpp)}, {t: "Federação (p.p.)", k: "fed_dpp", f: r => fpp(r.fed_dpp)},
  {t: "Contatos", k: "leads", f: r => int(r.leads)}, {t: "Contatos/mil eleit.", k: "leads_mil", f: r => dec(r.leads_mil)}, {t: "Eleitores", k: "eleitores", f: r => int(r.eleitores)},
], D.municipios, 1);
$("#qMun").addEventListener("input", e => filtroMun(e.target.value));
const RAMPA = ["#f3e9fb", "#dcc2f2", "#b98ae4", "#8d4fcf", "#6d1eb2", "#40116b"], DIV = ["#c0261a", "#f08a7a", "#f6e9f0", "#b98ae4", "#6d1eb2"];
function quebras(vals, n = 6) { const v = vals.filter(x => x != null && isFinite(x) && x > 0).sort((a, b) => a - b); return Array.from({length: n - 1}, (_, i) => v[Math.floor((i + 1) / n * (v.length - 1))]); }
function corDe(x, q, rampa = RAMPA) { if (x == null || !isFinite(x)) return "#ece6f1"; return rampa[q.filter(t => x > t).length]; }
function legenda(el, q, fmt, rampa = RAMPA) { $(el).innerHTML = rampa.map((c, i) => `<span><b style="background:${c}"></b>${i === 0 ? "até " + fmt(q[0]) : i === rampa.length - 1 ? "acima de " + fmt(q[q.length - 1]) : fmt(q[i - 1]) + " – " + fmt(q[i])}</span>`).join("") + `<span><b style="background:#ece6f1"></b>sem dado</span>`; }
const tiles = m => L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {attribution: "Esri · OpenStreetMap · IBGE · TSE", maxZoom: 16}).addTo(m);
const porIbge = new Map(D.municipios.map(m => [String(m.ibge), m]));
const mMG = L.map("mapaMG", {scrollWheelZoom: false, zoomSnap: .25}); tiles(mMG); let camMG;
function desenharMG(modo) {
  const div = modo === "dpp", q = div ? [-0.5, -0.05, 0.05, 0.5] : quebras(D.municipios.map(m => m[modo]));
  const fmt = modo === "leads_mil" ? (v => dec(v)) : div ? (v => pp(v, 1)) : (v => pct(v, 2));
  if (camMG) camMG.remove();
  camMG = L.geoJSON(window.GEO_MG, {style: f => { const m = porIbge.get(f.properties.ibge); return {color: "#fff", weight: .4, fillOpacity: .9, fillColor: corDe(m?.[modo], q, div ? DIV : RAMPA)}; },
    onEachFeature: (f, l) => { const m = porIbge.get(f.properties.ibge); if (!m) return;
      l.bindTooltip(`<b>${esc(titulo(m.nome))}</b><br>2026: ${int(m.v26)} votos (${pct(m.p26, 2)})<br>2022: ${int(m.v22)} votos (${pct(m.p22, 2)})<br>Contatos: ${int(m.leads)} (${dec(m.leads_mil)}/mil eleitores)`, {className: "dica", sticky: true}); }}).addTo(mMG);
  if (!mMG._ok) { mMG.fitBounds(camMG.getBounds()); mMG._ok = true; }
  legenda("#legMG", q, fmt, div ? DIV : RAMPA);
}
desenharMG("p26");
$("#modoMG").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $("#modoMG").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); desenharMG(b.dataset.m); });

/* ---------- BH */
const R = D.regionais;
$("#bhTexto").innerHTML = `Em Belo Horizonte a Ana passou de ${int(T.bh_v22)} para <b>${int(T.bh_v26)} votos</b>. ` + R.slice().sort((a, b) => b.dpp - a.dpp).slice(0, 3).map(r => `a Regional ${r.nome} cresceu ${pp(r.dpp)}`).join(", ") + `. A Leste continua sendo a principal base, com ${int(R[0].v26)} votos.`;
grafico($("#gReg"), {type: "bar", data: {labels: R.map(r => r.nome), datasets: [{label: "2022", data: R.map(r => r.v22), backgroundColor: COR.lilas}, {label: "2026", data: R.map(r => r.v26), backgroundColor: COR.roxo}]}, options: {indexAxis: "y", scales: {x: {grid: {color: "#f1e8f6"}}, y: {grid: {display: false}}}}});
grafico($("#gRegLeads"), {type: "bar", data: {labels: R.map(r => r.nome), datasets: [{label: "Contatos", data: R.map(r => r.leads), backgroundColor: COR.vermelho}, {label: "Votos 2026", data: R.map(r => r.v26), backgroundColor: COR.roxo}]}, options: {indexAxis: "y", scales: {x: {grid: {color: "#f1e8f6"}}, y: {grid: {display: false}}}}});
D.bairros.forEach(b => { b.conv = b.leads >= 20 ? b.v26 / b.leads * 100 : null; });
const porBairro = new Map(D.bairros.map(b => [b.nome, b]));
const mBH = L.map("mapaBH", {scrollWheelZoom: false, zoomSnap: .25}); tiles(mBH); let camBH;
L.geoJSON(window.GEO_REG, {style: {color: COR.esc, weight: 2, fill: false, opacity: .6}, interactive: false}).addTo(mBH);
function desenharBH(modo) {
  const div = modo === "dpp", q = div ? [-1, -0.1, 0.1, 1] : quebras(D.bairros.map(b => b[modo]));
  const fmt = (modo === "leads_mil" || modo === "mult_mil") ? (v => dec(v)) : div ? (v => pp(v, 1)) : (v => pct(v, 2));
  if (camBH) camBH.remove();
  camBH = L.geoJSON(window.GEO_BH, {style: f => { const b = porBairro.get(f.properties.nome); return {color: "#fff", weight: .6, fillOpacity: .88, fillColor: corDe(b?.[modo], q, div ? DIV : RAMPA)}; },
    onEachFeature: (f, l) => { const b = porBairro.get(f.properties.nome);
      l.bindTooltip(b ? `<b>${esc(b.nome)}</b> · ${esc(b.regional)}<br>2026: ${int(b.v26)} votos (${pct(b.p26, 2)})<br>2022: ${int(b.v22)} votos (${pct(b.p22, 2)})<br>Contatos: ${int(b.leads)} · rede de lideranças: ${int(b.rede_mult)} assinaturas` : `<b>${esc(f.properties.nome)}</b><br>sem escola de votação`, {className: "dica", sticky: true}); }}).addTo(mBH);
  camBH.bringToBack();
  if (!mBH._ok) { mBH.fitBounds(camBH.getBounds()); mBH._ok = true; }
  legenda("#legBH", q, fmt, div ? DIV : RAMPA);
}
desenharBH("p26");
$("#modoBH").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $("#modoBH").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); desenharBH(b.dataset.m); });
const filtroBai = tabela("#tabBai", [
  {t: "Bairro", k: "nome", busca: true}, {t: "Regional", k: "regional", busca: true}, {t: "Contatos", k: "leads", f: r => int(r.leads)}, {t: "Votos 2026", k: "v26", f: r => int(r.v26)},
  {t: "% 2026", k: "p26", f: r => pct(r.p26, 2)}, {t: "Votos 2022", k: "v22", f: r => int(r.v22)}, {t: "Ana (p.p.)", k: "dpp", f: r => fpp(r.dpp)}, {t: "Federação (p.p.)", k: "fed_dpp", f: r => fpp(r.fed_dpp)},
  {t: "Contatos/mil eleit.", k: "leads_mil", f: r => dec(r.leads_mil)}, {t: "Eleitores", k: "eleitores", f: r => int(r.eleitores)},
], D.bairros, 2);
$("#qBai").addEventListener("input", e => filtroBai(e.target.value));

/* ---------- contraste com 2022 e com a federação */
function graficoComp(el, qs) {
  grafico($(el), {type: "bar", data: {labels: qs.map((q, i) => [`${["Menos", "Pouco", "Mais", "Muito mais"][i]} contatos`, `${dec(q.leads_mil)}/mil eleit.`]),
    datasets: [{label: "Ana (eixo esquerdo)", data: qs.map(q => q.ana_dpp), backgroundColor: COR.roxo, yAxisID: "y"}, {label: "Federação sem a Ana (eixo direito)", data: qs.map(q => q.fed_dpp), backgroundColor: COR.cinza, yAxisID: "y2"}]},
    options: {plugins: {tooltip: {callbacks: {label: c => `${c.dataset.label.replace(/ \(.*\)/, "")}: ${pp(c.raw)}`}}},
      scales: {y: {beginAtZero: true, title: {display: true, text: "Ana: crescimento (p.p.)"}, grid: {color: "#f1e8f6"}},
        y2: {beginAtZero: true, position: "right", title: {display: true, text: "Federação: crescimento (p.p.)"}, grid: {display: false}}}}});
}
graficoComp("#gCompBH", cBH); graficoComp("#gCompMun", cM);
$("#compBHnota").innerHTML = `Nos bairros com mais contatos, a Ana cresceu ${pp(cBH[3].ana_dpp)}; nos de menos, ${pp(cBH[0].ana_dpp)}: ${dec(cBH[3].ana_dpp / cBH[0].ana_dpp, 1)} vezes mais. Os demais candidatos da federação cresceram em toda a cidade, também um pouco mais nesses bairros (de ${pp(cBH[0].fed_dpp, 1)} para ${pp(cBH[3].fed_dpp, 1)}, ${dec(cBH[3].fed_dpp / cBH[0].fed_dpp, 1)} vezes).`;
$("#compMunNota").innerHTML = `Cidades com pelo menos 2 mil eleitores, fora BH. A Ana cresceu ${pp(cM[3].ana_dpp)} no grupo com mais contatos e ${pp(cM[0].ana_dpp)} no grupo com menos.`;
const disp = D.bairros.filter(b => b.eleitores >= 2000 && b.leads_mil > 0);
grafico($("#gDisp"), {type: "scatter", data: {datasets: [{label: "Bairros", data: disp.map(b => ({x: b.leads_mil, y: b.votos_mil, nome: b.nome})), backgroundColor: "rgba(109,30,178,.55)", pointRadius: 4}]},
  options: {plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => `${c.raw.nome}: ${dec(c.raw.x)} contatos/mil · ${dec(c.raw.y)} votos/mil`}}},
    scales: {x: {type: "logarithmic", title: {display: true, text: "Contatos por mil eleitores (escala log)"}, grid: {color: "#f1e8f6"}}, y: {title: {display: true, text: "Votos da Ana por mil eleitores"}, grid: {color: "#f1e8f6"}}}}});
const mb = M.modelos.bh_ana, mf = M.modelos.bh_fed;
$("#dispNota").textContent = `Cada ponto é um bairro. Levando em conta também a força de cada bairro em 2022, a relação entre contatos e crescimento é clara para a Ana (estatística t = ${dec(mb.t.leads_mil, 1)}) e fraca para os demais candidatos da federação (t = ${dec(mf.t.leads_mil, 1)}). Valores de t acima de 2 indicam uma relação que dificilmente é acaso.`;
const tn = M.territorios;
$("#novos").innerHTML = `<div class="big">${int(tn.cidades_novas)} cidades</div><p>onde a Ana não teve nenhum voto em 2022 e passou a ter em 2026, somando <b>${int(tn.votos_novos)} votos</b>.</p>
  <div class="mini-kpis"><div><b>${int(tn.com_leads.cidades)}</b><span>delas tinham contatos na base: média de ${dec(tn.com_leads.media, 0)} votos por cidade</span></div><div><b>${int(tn.sem_leads.cidades)}</b><span>sem contatos: média de ${dec(tn.sem_leads.media, 0)} votos por cidade</span></div></div>
  <div class="bars">${tn.top.slice(0, 8).map(m => `<div class="l"><span>${esc(titulo(m.nome))}</span><i style="width:${m.v26 / tn.top[0].v26 * 100}%;max-width:50%"></i><em>${int(m.v26)}</em></div>`).join("")}</div>`;

/* ---------- próximos passos */
const med = arr => { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const convMed = med(D.bairros.filter(b => b.conv != null).map(b => b.conv));
tabela("#tabOp1", [{t: "Bairro", k: "nome"}, {t: "Contatos", k: "leads", f: r => int(r.leads)}, {t: "Votos 2026", k: "v26", f: r => int(r.v26)}, {t: "Votos/100 contatos", k: "conv", f: r => dec(r.conv, 0)}],
  D.bairros.filter(b => b.leads >= 60 && b.conv != null && b.conv < convMed), 1);
tabela("#tabOp2", [{t: "Bairro", k: "nome"}, {t: "Votos 2026", k: "v26", f: r => int(r.v26)}, {t: "Contatos", k: "leads", f: r => int(r.leads)}, {t: "Regional", k: "regional"}],
  D.bairros.filter(b => b.v26 >= 120).sort((a, b) => (a.leads / a.v26) - (b.leads / b.v26)).slice(0, 25), 1);
tabela("#tabEsc", [{t: "Escola", k: "nome"}, {t: "Bairro", k: "bairro"}, {t: "Votos 2026", k: "v26", f: r => int(r.v26)}, {t: "% 2026", k: "p26", f: r => pct(r.p26, 1)}, {t: "Ana (p.p.)", k: "dpp", f: r => fpp(r.dpp)}], D.escolas.slice(0, 120), 2);
const cc = D.concorrentes_bh, mxc = cc[0].votos;
$("#concBH").innerHTML = cc.map(c => `<div class="l"><span>${c.eu ? "<b>" : ""}${esc(titulo(c.nome))}${c.eu ? "</b>" : ""} <span class="chip">${esc(c.partido)}</span></span><i style="width:${c.votos / mxc * 100}%;max-width:40%;background:${c.eu ? COR.vermelho : COR.lilas}"></i><em>${int(c.votos)}</em></div>`).join("");

/* ---------- metodologia */
$("#metodoTexto").innerHTML = `<p><b>Como ler os números:</b> <b>p.p.</b> (pontos percentuais) é a diferença entre duas porcentagens; se a Ana foi de 2,13% para 3,25% dos votos válidos, cresceu +1,12 p.p. <b>Participação</b> é a fatia dos votos válidos para deputado estadual que foi para a Ana. <b>×</b> indica quantas vezes a participação cresceu (2,2× = mais que o dobro). <b>Contatos por mil eleitores</b> mede o tamanho da base de contatos em relação ao eleitorado de cada lugar.</p>
<p><b>Votação 2026:</b> boletins de urna publicados pelo TSE, seção por seção, conferidos com o arquivo oficial de detalhe da votação por seção (100% iguais). Total oficial: ${int(C.votos26)} votos, situação "${esc(C.situacao)}".</p>
<p><b>Votação 2022:</b> arquivo oficial "votação por seção" do TSE (${int(C.votos22)} votos). Bairros e escolas de 2022 foram ligados aos locais de votação de 2026 pela zona e seção; cidades usam o total oficial.</p>
<p><b>Federação:</b> votos nominais e de legenda para deputado estadual de PT, PCdoB e PV, sem os votos da Ana, nos dois anos (em 2022 a Ana concorreu pela REDE).</p>
<p><b>Contatos sem repetição:</b> CRM, petições, pesquisas e páginas foram unidos pelo WhatsApp (últimos 8 dígitos): ${int(B.contatos_base)} contatos. As 24.433 assinaturas do Time Ana foram somadas descontando as que já estavam na base (${pct(B.timeana_ja_na_base, 0)} em uma amostra de ${int(LD.sobreposicao.amostra)}). Total estimado: ${int(B.total_unicos)}.</p>
<p><b>Bairros:</b> escolas posicionadas pelas coordenadas do TSE dentro dos limites oficiais de bairros e regionais de BH (OpenStreetMap); bairros informados pelos contatos casados pelo nome.</p>
<p><b>Limites:</b> o voto é secreto. As comparações mostram onde a mobilização esteve e como a votação se comportou nesses lugares; não permitem afirmar que um contato específico votou na Ana, nem atribuir votos a uma ação. A pesquisa da Giga Dados em Viçosa (${int(D.giga.entrevistas)} entrevistas, disco com 8 nomes) é comparada com a urna somando apenas os votos desses 8 candidatos na cidade.</p>`;

/* ---------- menu ativo */
const secs = [...document.querySelectorAll("main section")];
addEventListener("scroll", () => { const y = scrollY + 120; let at = secs[0].id; for (const s of secs) if (s.offsetTop <= y) at = s.id; document.querySelectorAll("nav.menu a").forEach(a => a.classList.toggle("ativo", a.getAttribute("href") === "#" + at)); }, {passive: true});

/* ---------- campanhas em abas: uma por vez, com transição */
(function abasCasos() {
  const box = $("#casos"), casosEl = [...box.querySelectorAll(".caso")];
  if (casosEl.length < 2) return;
  const nomes = casosEl.map(c => c.querySelector("h3").textContent);
  box.insertAdjacentHTML("afterbegin", `<div class="abas-casos" role="tablist">${nomes.map((n, i) => `<button role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(n)}</button>`).join("")}</div>`);
  casosEl.forEach((c, i) => { c.hidden = i !== 0; c.setAttribute("role", "tabpanel"); });
  box.querySelector(".abas-casos").addEventListener("click", e => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    box.querySelectorAll(".abas-casos button").forEach(x => x.setAttribute("aria-selected", x === b));
    casosEl.forEach((c, i) => { c.hidden = i !== +b.dataset.i; if (!c.hidden) { c.classList.remove("entra"); void c.offsetWidth; c.classList.add("entra"); window.animarNumeros?.(c); } });
  });
})();

/* ---------- reflexos: pauta do mandato → ação de mobilização → território */
(function reflexos() {
  const PAUTAS = [
    ["Água e saneamento", "Água Sem Lucro", "Petição estadual pela Copasa pública e pela tarifa justa."],
    ["Estradas", "Asfaltamento da MG-229", "Mobilização pelo asfaltamento da rodovia no Vale do Rio Doce e Serra do Espinhaço."],
    ["Saúde", "SOS Oncologia", "Atendimento oncológico na Zona da Mata."],
    ["Trabalho", "Fim da Escala 6x1", "Redução da jornada de trabalho."],
    ["Segurança", "Feira Hippie Mais Segura", "Guaritas da Guarda Municipal na Feira Hippie de BH."],
    ["Cuidado", "Cuidar com Dignidade", "Valorização de quem cuida de pessoas idosas."],
  ];
  const fedTerr = c => { let f22 = 0, a22 = 0, f26 = 0, a26 = 0;
    for (const t of c.territorios) { if (t.fed_p22 != null && t.p22) { const v = t.v22 / t.p22; f22 += t.fed_p22 * v; a22 += v; } if (t.fed_p26 != null && t.p26) { const v = t.v26 / t.p26; f26 += t.fed_p26 * v; a26 += v; } }
    return {p22: a22 ? f22 / a22 : null, p26: a26 ? f26 / a26 : null}; };
  const cards = PAUTAS.filter(([, n]) => casos[n]?.territorios.length).map(([pauta, n, txt]) => {
    const c = casos[n], fed = fedTerr(c);
    const lugares = c.territorios.slice(0, 3).map(t => titulo(t.nome.replace(/ \(BH\)$/, ""))).join(", ");
    return `<div class="reflexo"><span class="pauta">${pauta}</span><h4>${esc(n)}</h4>
      <div class="acao">${esc(txt)} ${int(c.total)} assinaturas · ${esc(lugares)}${c.territorios.length > 3 ? " e outros" : ""}.</div>
      <div class="num">${int(c.v22)} → ${int(c.v26)} <small>votos da Ana nesses lugares</small></div>
      <div class="linha"><span>Participação da Ana</span><b>${pct(c.p22, 2)} → ${pct(c.p26, 2)}</b></div>
      <div class="linha"><span>Crescimento da participação</span><b>Ana ${vezes(c.p22, c.p26)} · federação ${vezes(fed.p22, fed.p26)}</b></div></div>`;
  });
  const bA = D.bairros.find(b => b.nome === "Alto Vera Cruz"), bS = D.bairros.find(b => b.nome === "São Geraldo");
  const escuta = (pauta, nome, b, n, txt) => `<div class="reflexo"><span class="pauta">${pauta}</span><h4>${esc(nome)}</h4>
      <div class="acao">${txt}</div>
      <div class="num">${int(b.v22)} → ${int(b.v26)} <small>votos da Ana no bairro</small></div>
      <div class="linha"><span>Participação da Ana</span><b>${pct(b.p22, 1)} → ${pct(b.p26, 1)}</b></div>
      <div class="linha"><span>Crescimento da participação</span><b>Ana ${vezes(b.p22, b.p26)} · federação ${vezes(b.fed_p22, b.fed_p26)}</b></div></div>`;
  cards.push(escuta("Escuta", "Alto Vera Cruz", bA, 0, `${int(F["Pesquisa Alto Vera Cruz"].respostas)} entrevistas porta a porta com ${F["Pesquisa Alto Vera Cruz"].entrevistadores} entrevistadores, apresentando as entregas da Ana na Regional Leste.`));
  cards.push(escuta("Escuta", "São Geraldo", bS, 0, `${int(F["Questionário Ana (São Geraldo)"].respostas)} entrevistas no bairro e na vizinhança.`));
  $("#reflexos").innerHTML = cards.join("");
  $("#reflexoTexto").innerHTML = `As ações de mobilização partiram das pautas do mandato da Ana: água, saúde, estradas, trabalho, segurança e cuidado. Em cada uma, os lugares onde a pauta foi levada e como a votação da Ana se comportou ali entre 2022 e 2026, ao lado de quanto cresceu a participação dos demais candidatos da federação nos mesmos lugares. No estado inteiro, a participação dela foi de <b>${pct(M.total_mg.p22, 2)}</b> para <b>${pct(M.total_mg.p26, 2)}</b> (${vezes(M.total_mg.p22, M.total_mg.p26)}): é a referência para comparar cada território.`;
})();

/* ---------- 2022 × 2026: o contraste da votação dela */
(function evolucao() {
  const bh = D.municipios.find(m => m.mun === 41238);
  const fora22 = C.votos22 - T.bh_v22, fora26 = C.votos26 - T.bh_v26;
  const pares = [
    ["Votos no estado", int(C.votos22), int(C.votos26), "+" + pct(C.votos26 / C.votos22 - 1, 0)],
    ["Participação nos votos válidos", pct(M.total_mg.p22, 2), pct(M.total_mg.p26, 2), dec(M.total_mg.p26 / M.total_mg.p22, 1) + "×"],
    ["Cidades com voto", int(T.municipios_com_voto22), int(T.municipios_com_voto26), "+" + int(T.municipios_com_voto26 - T.municipios_com_voto22)],
    ["Votos em Belo Horizonte", int(T.bh_v22), int(T.bh_v26), "+" + pct(T.bh_v26 / T.bh_v22 - 1, 0)],
    ["Votos fora de BH", int(fora22), int(fora26), "+" + pct(fora26 / fora22 - 1, 0)],
    ["Partido e resultado", "REDE · média", "PT · QP", "reeleita"],
  ];
  $("#comparativo").innerHTML = pares.map(([t, a, b, d]) => `<div class="par"><span>${t}</span><div class="v"><span class="a">${a}</span><span class="seta">→</span><span class="b">${b}</span></div><small>${d}</small></div>`).join("");
  $("#evolTexto").innerHTML = `Em 2022, pela REDE, Ana teve ${int(C.votos22)} votos e foi eleita por média. Em 2026, já pelo PT, chegou a <b>${int(C.votos26)} votos</b> e foi reeleita por quociente partidário. O crescimento veio dos dois lados: BH cresceu ${pct(T.bh_v26 / T.bh_v22 - 1, 0)} e o restante de Minas quase triplicou (+${pct(fora26 / fora22 - 1, 0)}), com ${int(M.territorios.cidades_novas)} cidades novas.`;
  const top = D.municipios.slice(0, 15);
  grafico($("#gTopCid"), {type: "bar", data: {labels: top.map(m => titulo(m.nome)), datasets: [{label: "2022", data: top.map(m => m.v22), backgroundColor: COR.lilas}, {label: "2026", data: top.map(m => m.v26), backgroundColor: COR.roxo}]},
    options: {indexAxis: "y", scales: {x: {type: "logarithmic", title: {display: true, text: "votos (escala log)"}, grid: {color: "#f1e8f6"}}, y: {grid: {display: false}}}}});
  const cres = D.municipios.filter(m => m.mun !== 41238).map(m => [titulo(m.nome), m.v26 - m.v22, m]).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const mx = cres[0][1];
  $("#maisCresceu").innerHTML = cres.map(([n, d, m]) => `<div class="l"><span>${esc(n)} <small class="nota">${int(m.v22)} → ${int(m.v26)}</small></span><i style="width:${d / mx * 100}%;max-width:45%;background:${COR.vermelho}"></i><em>+${int(d)}</em></div>`).join("");
})();

/* ---------- reflexo na campanha: dentro das seções da mobilização */
function soma(lista) {
  const v22 = lista.reduce((t, x) => t + x.v22, 0), v26 = lista.reduce((t, x) => t + x.v26, 0);
  const a22 = lista.reduce((t, x) => t + (x.val22 || 0), 0), a26 = lista.reduce((t, x) => t + (x.val26 || 0), 0);
  return {n: lista.length, v22, v26, p22: a22 ? v22 / a22 : null, p26: a26 ? v26 / a26 : null};
}
(function refTrabalho() {
  const fora = D.municipios.filter(m => m.mun !== 41238);
  const com = soma(fora.filter(m => m.leads > 0)), sem = soma(fora.filter(m => m.leads === 0));
  const bh = D.municipios.find(m => m.mun === 41238);
  $("#refTrabalho").innerHTML = `<p style="margin:0 0 8px">A base de contatos chegou a ${int(com.n)} cidades fora de BH, e é nelas que está quase toda a votação da Ana no interior e na Região Metropolitana: ${pct(com.v26 / (com.v26 + sem.v26), 0)} dos votos fora da capital. Nessas cidades, ela passou de ${int(com.v22)} para <b>${int(com.v26)} votos</b> (+${int(com.v26 - com.v22)}).</p>
    <div class="ref-grid">
      <div><b>${int(com.n)}</b><span>cidades com contatos · ${pct(com.v26 / (com.v26 + sem.v26), 0)} dos votos da Ana fora de BH</span></div>
      <div><b>${int(com.v22)} → ${int(com.v26)}</b><span>votos da Ana nas cidades com contatos da mobilização</span></div>
      <div><b>${pct(com.p22, 2)} → ${pct(com.p26, 2)}</b><span>participação da Ana nessas cidades</span></div>
      <div><b>${pct(bh.p22, 2)} → ${pct(bh.p26, 2)}</b><span>em Belo Horizonte, onde está a maior parte da base</span></div>
    </div>`;
})();
(function refTimeAna() {
  const bh = D.municipios.find(m => m.mun === 41238);
  const top = D.bairros.filter(b => b.rede_assin > 0).sort((a, b) => b.rede_assin - a.rede_assin).slice(0, 15);
  const s15 = soma(top);
  const cid = D.municipios.filter(m => m.mun !== 41238 && m.leads_ta >= 80).sort((a, b) => b.leads_ta - a.leads_ta);
  const sc = soma(cid);
  $("#refTimeAna").innerHTML = `<p style="margin:0 0 8px">Nos 15 bairros de BH com mais assinaturas do Time Ana, a votação da Ana passou de ${int(s15.v22)} para <b>${int(s15.v26)} votos</b>. A participação dela nesses bairros subiu ${pp((s15.p26 - s15.p22) * 100)} (de ${pct(s15.p22, 2)} para ${pct(s15.p26, 2)}), contra ${pp((bh.p26 - bh.p22) * 100)} na cidade inteira.</p>
    <div class="ref-grid">
      <div><b>${int(s15.v22)} → ${int(s15.v26)}</b><span>votos nos 15 bairros com mais assinaturas (${top.slice(0, 4).map(b => b.nome).join(", ")}…)</span></div>
      <div><b>${pct(s15.p22, 2)} → ${pct(s15.p26, 2)}</b><span>participação nesses bairros: ${pp((s15.p26 - s15.p22) * 100)}, contra ${pp((bh.p26 - bh.p22) * 100)} em BH</span></div>
      <div><b>${int(sc.v22)} → ${int(sc.v26)}</b><span>votos nas ${cid.length} cidades da Grande BH e do interior com mais assinaturas (${cid.slice(0, 3).map(m => titulo(m.nome)).join(", ")}…)</span></div>
    </div>`;
})();

/* ---------- Pesquisa Giga Dados (Viçosa) × urna */
(function giga() {
  const G = D.giga; if (!G) return;
  const p1 = Object.fromEntries(G.p1), nomes = Object.keys(G.urna.candidatos);
  const somaP = nomes.reduce((t, n) => t + (p1[n] || 0), 0), somaU = nomes.reduce((t, n) => t + G.urna.candidatos[n], 0);
  const ordem = nomes.slice().sort((a, b) => G.urna.candidatos[b] - G.urna.candidatos[a]);
  const posU = ordem.indexOf("Ana Paula Siqueira") + 1, posP = nomes.slice().sort((a, b) => (p1[b] || 0) - (p1[a] || 0)).indexOf("Ana Paula Siqueira") + 1;
  const vic = D.municipios.find(m => /^VI.OSA$/.test(m.nome));
  const dt = s => s.split("/").slice(0, 2).join("/");
  $("#gigaTexto").innerHTML = `Entre ${dt(G.inicio)} e ${dt(G.fim)}, a Giga Dados ouviu <b>${int(G.entrevistas)} moradores de Viçosa</b> com um disco de 8 nomes para deputado estadual. A Ana apareceu em <b>${posP}º lugar</b>, com ${pct(p1["Ana Paula Siqueira"] / G.entrevistas, 0)} das entrevistas (${pct(p1["Ana Paula Siqueira"] / somaP, 0)} de quem escolheu um nome). Nas urnas, ela fez <b>${int(G.urna.candidatos["Ana Paula Siqueira"])} votos</b> na cidade (${pct(G.urna.candidatos["Ana Paula Siqueira"] / G.urna.validos, 1)} dos válidos; eram ${int(vic?.v22)} em 2022) e também ficou em <b>${posU}º entre os nomes do disco</b>, atrás de Roberto Andrade (${int(G.urna.candidatos["Roberto Andrade"])} votos) e praticamente empatada com Leleco Pimentel (${int(G.urna.candidatos["Leleco Pimentel"])}) e Bruno Engler (${int(G.urna.candidatos["Bruno Engler"])}). A pesquisa acertou a ordem dos dois primeiros, mas mostrou a Ana acima do que ela teve na urna: a amostra é pequena e o disco tinha só 8 nomes, enquanto a urna tinha centenas de candidatos.`;
  const fem = G.sexo.Feminino, mas = G.sexo.Masculino;
  $("#gigaKpis").innerHTML = [[int(G.entrevistas), "entrevistas"], [posP + "º", "lugar da Ana na pesquisa"], [posU + "º", "entre os 8 nomes, na urna"], [int(G.urna.candidatos["Ana Paula Siqueira"]), "votos da Ana em Viçosa"], [pct(fem.ana / fem.n, 0), "das mulheres escolheram a Ana"]]
    .map(([v, t]) => `<div><b>${v}</b><span>${t}</span></div>`).join("");
  grafico($("#gGiga"), {type: "bar", data: {labels: ordem, datasets: [
    {label: "Pesquisa", data: ordem.map(n => (p1[n] || 0) / somaP * 100), backgroundColor: COR.lilas},
    {label: "Urna", data: ordem.map(n => G.urna.candidatos[n] / somaU * 100), backgroundColor: ordem.map(n => n === "Ana Paula Siqueira" ? COR.vermelho : COR.roxo)}]},
    options: {indexAxis: "y", plugins: {tooltip: {callbacks: {label: c => `${c.dataset.label}: ${dec(c.raw, 1)}%`}}}, scales: {x: {ticks: {callback: v => v + "%"}, grid: {color: "#f1e8f6"}}, y: {grid: {display: false}}}}});
  const fx = ["18 a 24", "25 a 34", "35 a 44", "45 a 59", "60 ou mais"].filter(f => G.faixa[f]);
  grafico($("#gGigaPerfil"), {type: "bar", data: {labels: ["Mulheres", "Homens"].concat(fx),
    datasets: [{label: "Escolheram a Ana", data: [fem.ana / fem.n * 100, mas.ana / mas.n * 100].concat(fx.map(f => G.faixa[f].ana / G.faixa[f].n * 100)), backgroundColor: [COR.vermelho, COR.vermelho].concat(fx.map(() => COR.roxo))}]},
    options: {plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => `${dec(c.raw, 0)}% das entrevistas`}}}, scales: {y: {ticks: {callback: v => v + "%"}, grid: {color: "#f1e8f6"}}, x: {grid: {display: false}}}}});
  $("#gigaPerfilNota").textContent = `% de cada grupo que escolheu a Ana. Entre as mulheres (${int(fem.n)} entrevistas) ela foi a preferida; entre os homens, Roberto Andrade. Grupos pequenos: leia como tendência.`;
})();
