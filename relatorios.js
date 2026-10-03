/* =========================================================
   Relatórios (relatorios.html) — somente o administrador
   ========================================================= */

let lista = [], selecionado = null, urlPlanilha = "";

const SENHA_KEY = "diag360-senha";
const senhaAdmin = () => { try { return sessionStorage.getItem(SENHA_KEY) || ""; } catch (e) { return ""; } };

function corNota(v) {
  if (v === undefined || v === null || v === "") return "v";
  return v < 4 ? "b" : v < 7 ? "w" : "g";
}

function dataBR(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmt(v) {
  return Array.isArray(v) ? v.join(", ") : String(v);
}

/** Gráfico radar (SVG) com as notas de autoavaliação por área. */
function radar(resp) {
  const n = AREAS_RADAR.length, cx = 210, cy = 190, R = 130;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const poligono = r => AREAS_RADAR.map((_, i) => pt(i, r).join(",")).join(" ");
  let g = "";

  // Anéis de referência (2, 4, 6, 8, 10)
  [2, 4, 6, 8, 10].forEach(v => {
    g += `<polygon points="${poligono(R * v / 10)}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
  });

  // Eixos e rótulos
  AREAS_RADAR.forEach((s, i) => {
    const [x, y] = pt(i, R);
    g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`;
    const [lx, ly] = pt(i, R + 22);
    const ancora = Math.abs(lx - cx) < 8 ? "middle" : lx > cx ? "start" : "end";
    g += `<text x="${lx}" y="${ly + 4}" text-anchor="${ancora}" font-size="11" fill="var(--muted)" font-family="var(--f-body)">${esc(s.curto)}</text>`;
  });

  // Área das notas
  const vals = AREAS_RADAR.map(s => {
    const v = resp[s.id + ".nota"];
    return typeof v === "number" ? v : 0;
  });
  g += `<polygon points="${vals.map((v, i) => pt(i, R * v / 10).join(",")).join(" ")}" fill="var(--accent)" fill-opacity=".25" stroke="var(--accent)" stroke-width="2"/>`;
  vals.forEach((v, i) => {
    const [x, y] = pt(i, R * v / 10);
    g += `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--accent)"/>`;
  });

  // Marcas de escala
  g += `<text x="${cx + 4}" y="${cy - R * 0.5 - 2}" font-size="9" fill="var(--muted)" font-family="var(--f-mono)">5</text>`;
  g += `<text x="${cx + 4}" y="${cy - R - 2}" font-size="9" fill="var(--muted)" font-family="var(--f-mono)">10</text>`;

  return `<svg viewBox="0 0 420 380" role="img" aria-label="Radar das notas de autoavaliação por área">${g}</svg>`;
}

function renderPainel() {
  const P = $("#vistaPainel");

  if (selecionado) {
    const r = lista.find(x => x.id === selecionado);
    if (r) { renderDetalhe(P, r); return; }
    selecionado = null;
  }

  const enviados = lista.filter(x => x.status === "enviado").length;

  const cabecalho = AREAS_RADAR
    .map(s => `<th class="num" title="${esc(s.t)}">${esc(s.curto)}</th>`)
    .join("");

  const celulaNota = v =>
    `<td class="num"><span class="cel ${corNota(v)}">${typeof v === "number" ? v : "–"}</span></td>`;

  const linhas = lista.map(r => {
    const rs = r.respostas || {};
    const enviado = r.status === "enviado";
    return `
      <tr class="linha" data-id="${esc(r.id)}" tabindex="0">
        <td><b>${esc(r.empresa || "Sem nome da oficina")}</b><small>${esc(r.nome || "—")}</small></td>
        <td><span class="pill ${enviado ? "env" : "ras"}">${enviado ? "Enviado" : "Em andamento"}</span></td>
        <td class="num">${r.progresso ?? 0}%</td>
        ${AREAS_RADAR.map(s => celulaNota(rs[s.id + ".nota"])).join("")}
        <td class="num num-pequeno">${dataBR(r.atualizadoEm)}</td>
      </tr>`;
  }).join("");

  const medias = AREAS_RADAR.map(s => {
    const v = lista.map(r => (r.respostas || {})[s.id + ".nota"]).filter(x => typeof x === "number");
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  });

  const linhaMedia = lista.length ? `
    <tr>
      <td><b>Média da turma</b></td><td></td><td></td>
      ${medias.map(m => `<td class="num"><span class="cel ${corNota(m)}">${m === null ? "–" : m.toFixed(1).replace(".", ",")}</span></td>`).join("")}
      <td></td>
    </tr>` : "";

  const tabela = lista.length ? `
    <div class="rolar">
      <table>
        <thead><tr><th>Oficina / responsável</th><th>Status</th><th class="num">Preench.</th>${cabecalho}<th class="num">Atualizado</th></tr></thead>
        <tbody>${linhas}${linhaMedia}</tbody>
      </table>
    </div>` : `
    <div class="vazio">Nenhuma resposta ainda. Assim que um mentorado começar a preencher, ele aparece aqui, com as respostas salvas em tempo real.</div>`;

  P.innerHTML = `
    <div class="resumo">
      <div class="kpi"><b>${lista.length}</b><span>Mentorados que começaram</span></div>
      <div class="kpi"><b>${enviados}</b><span>Diagnósticos enviados</span></div>
      <div class="kpi"><b>${lista.length - enviados}</b><span>Ainda preenchendo</span></div>
      <div class="resumo-acao">
        <button class="btn steel" type="button" id="exportar" ${lista.length ? "" : "disabled"}>Exportar planilha (CSV)</button>
        <button class="btn" type="button" id="atualizar">Atualizar</button>
        ${urlPlanilha ? `<a class="btn" href="${esc(urlPlanilha)}" target="_blank" rel="noopener">Abrir no Google Planilhas</a>` : ""}
        <button class="btn" type="button" id="sair">Sair</button>
      </div>
    </div>
    <div class="msg" id="msgExport" role="status"></div>
    <div class="bloco">
      <h3>Mapa de autoavaliação</h3>
      <p>Nota de 0 a 10 que cada dono deu para a própria área. Vermelho abaixo de 4, amarelo de 4 a 6, verde a partir de 7. Clique numa linha para ler o diagnóstico completo.</p>
      ${tabela}
    </div>`;
}

/** Notas e destaques de um mentorado, usados no texto e no e-mail. */
function dadosRelatorio(r) {
  const rs = r.respostas || {};
  const notas = AREAS_RADAR
    .map(s => ({ area: s.curto, v: rs[s.id + ".nota"] }))
    .filter(x => typeof x.v === "number");
  const media = notas.length ? notas.reduce((a, x) => a + x.v, 0) / notas.length : null;
  return {
    nome: r.nome || "",
    empresa: r.empresa || "",
    notas,
    media: media === null ? null : +media.toFixed(1),
    atencao: notas.filter(x => x.v < 4).map(x => x.area),
    fortes: notas.filter(x => x.v >= 7).map(x => x.area)
  };
}

/** Texto do relatório que vai para o mentorado (e-mail e WhatsApp). */
function relatorioTexto(r) {
  const rs = r.respostas || {};
  const nome = (r.nome || "").split(" ")[0] || "tudo bem";
  const notas = AREAS_RADAR
    .map(s => ({ area: s.curto, v: rs[s.id + ".nota"] }))
    .filter(x => typeof x.v === "number");
  const media = notas.length ? notas.reduce((a, x) => a + x.v, 0) / notas.length : null;
  const atencao = notas.filter(x => x.v < 4).map(x => x.area);
  const fortes = notas.filter(x => x.v >= 7).map(x => x.area);

  const linhas = [
    `Olá, ${nome}! Segue o resumo do seu Diagnóstico 360° da ${r.empresa || "sua oficina"}.`,
    ""
  ];
  if (notas.length) {
    linhas.push("Sua autoavaliação (0 a 10):");
    notas.forEach(x => linhas.push(`• ${x.area}: ${x.v}`));
    linhas.push("", `Média geral: ${media.toFixed(1).replace(".", ",")}`);
    if (atencao.length) linhas.push(`Pontos de atenção: ${atencao.join(", ")}`);
    if (fortes.length)  linhas.push(`Pontos fortes: ${fortes.join(", ")}`);
  } else {
    linhas.push("Ainda não recebemos as notas de autoavaliação.");
  }
  linhas.push("", "Em breve conversamos para definir as prioridades da mentoria.", "", "Oficina de Alta Performance");
  return linhas.join("\n");
}

/** Só dígitos, com o DDI do Brasil quando faltar. */
function telefoneWa(v) {
  const n = String(v || "").replace(/\D/g, "");
  if (!n) return "";
  return n.length <= 11 ? "55" + n : n;
}

const emailAtivo = () => apiAtiva();

function acoesEnvio(r) {
  const rs = r.respostas || {};
  const texto = relatorioTexto(r);
  const email = String(rs["empresa.email"] || "").trim();
  const fone = telefoneWa(rs["empresa.whatsapp"]);

  const assunto = "Seu Diagnóstico 360° · " + (r.empresa || "Oficina de Alta Performance");
  let mail;
  if (!email) {
    mail = `<button class="btn" type="button" disabled>E-mail não informado</button>`;
  } else if (emailAtivo()) {
    mail = `<button class="btn prim" type="button" data-enviar-email="${esc(r.id)}">Enviar por e-mail</button>`;
  } else {
    mail = `<a class="btn prim" href="mailto:${esc(email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}">Enviar por e-mail</a>`;
  }
  const zap = fone
    ? `<a class="btn prim" target="_blank" rel="noopener" href="https://wa.me/${fone}?text=${encodeURIComponent(texto)}">Enviar por WhatsApp</a>`
    : `<button class="btn" type="button" disabled>WhatsApp não informado</button>`;

  const nota = emailAtivo()
    ? "O e-mail sai de imersao@volmastertech.com, com a logo da Oficina de Alta Performance. O WhatsApp abre com a mensagem pronta para você confirmar."
    : "Envio automático de e-mail ainda não configurado: o botão abre o seu programa de e-mail com a mensagem pronta.";

  return `
    <div class="envio">
      <b>Enviar relatório ao mentorado</b>
      <div class="acoes">${mail}${zap}</div>
      <small>${nota}</small>
      <div class="msg" id="msgEnvioRel" role="status"></div>
    </div>`;
}

async function enviarEmail(id, botao) {
  const r = lista.find(x => x.id === id);
  const m = $("#msgEnvioRel");
  if (!r || !m) return;

  const rs = r.respostas || {};
  const dados = { ...dadosRelatorio(r), para: String(rs["empresa.email"] || "").trim() };

  botao.disabled = true;
  m.className = "msg";
  m.textContent = "Enviando…";

  try {
    await api("enviarEmail", { ...dados, senha: senhaAdmin() });
    m.className = "msg ok";
    m.textContent = "E-mail enviado para " + dados.para + ".";
  } catch (err) {
    m.className = "msg err";
    m.textContent = "Não foi possível enviar o e-mail (" + (err.message || "erro") + "). Tente de novo.";
  }
  botao.disabled = false;
}

function renderDetalhe(P, r) {
  const rs = r.respostas || {};

  const secoes = SECOES.map(s => `
    <div class="resp-sec">
      <h4>${esc(s.t)}</h4>
      ${s.qs.map(q => {
        const txt = respostaTexto(rs, s, q);
        const tem = txt !== "";
        return `
        <div class="resp">
          <div class="p">${esc(tituloPergunta(q))}</div>
          <div class="a ${tem ? "" : "vz"}">${tem ? esc(txt) : "Sem resposta"}</div>
        </div>`;
      }).join("")}
    </div>`).join("");

  const situacao = r.status === "enviado" ? "Enviado em " + dataBR(r.enviadoEm) : "Em andamento";
  const subtitulo = esc(r.nome || "—")
    + (rs["empresa.cargo"] ? " · " + esc(rs["empresa.cargo"]) : "")
    + (rs["empresa.cidade"] ? " · " + esc(rs["empresa.cidade"]) : "");

  P.innerHTML = `
    <div><button class="btn" type="button" id="voltar">← Todos os mentorados</button></div>
    <div class="bloco">
      <div class="detalhe-top">
        <div class="detalhe-id">
          <span class="eyebrow">${situacao} · ${r.progresso ?? 0}% preenchido</span>
          <h3>${esc(r.empresa || "Sem nome da oficina")}</h3>
          <p>${subtitulo}</p>
        </div>
        <div class="radar">${radar(rs)}</div>
      </div>
      ${acoesEnvio(r)}
      ${secoes}
    </div>`;
}

async function exportar() {
  const m = $("#msgExport");
  m.className = "msg";
  m.textContent = "";

  const cols = [
    ["Oficina", r => r.empresa],
    ["Responsável", r => r.nome],
    ["Status", r => r.status === "enviado" ? "Enviado" : "Em andamento"],
    ["% preenchido", r => r.progresso],
    ["Atualizado em", r => dataBR(r.atualizadoEm)]
  ];
  SECOES.forEach(s => s.qs.forEach(q => {
    cols.push([s.curto + " | " + tituloPergunta(q), r => respostaTexto(r.respostas || {}, s, q)]);
  }));

  const cel = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  const csv = "﻿" + [
    cols.map(c => cel(c[0])).join(";"),
    ...lista.map(r => cols.map(c => cel(c[1](r))).join(";"))
  ].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "diagnostico-360-mentorados.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);

  m.className = "msg ok";
  m.textContent = "Planilha gerada.";
}




document.addEventListener("click", e => {
  const alvo = e.target;

  const linha = alvo.closest("tr.linha");
  if (linha) {
    selecionado = linha.dataset.id;
    renderPainel();
    window.scrollTo(0, 0);
    return;
  }

  const env = alvo.closest("[data-enviar-email]");
  if (env) { enviarEmail(env.dataset.enviarEmail, env); return; }

  if (alvo.id === "voltar")   { selecionado = null; renderPainel(); return; }
  if (alvo.id === "exportar") exportar();
  if (alvo.id === "atualizar") carregar();
  if (alvo.id === "entrar") entrar();
  if (alvo.id === "sair") sair();
});

// Linhas da tabela acessíveis por teclado
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "senha") { entrar(); return; }
  const linha = e.target.closest && e.target.closest("tr.linha");
  if (linha && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    linha.click();
  }
});

function bloqueado(msg) {
  $("#vistaPainel").innerHTML = `<div class="bloco"><div class="vazio">${esc(msg)}</div></div>`;
}

function telaLogin(erro) {
  $("#vistaPainel").innerHTML = `
    <div class="bloco login">
      <h3>Acesso do administrador</h3>
      <p>Digite a senha para ver as respostas dos mentorados.</p>
      <div class="q">
        <label class="t" for="senha">Senha</label>
        <input type="password" id="senha" autocomplete="current-password">
      </div>
      <div class="acoes"><button class="btn prim" type="button" id="entrar">Entrar</button></div>
      <div class="msg err" role="alert">${esc(erro || "")}</div>
    </div>`;
  const campo = $("#senha");
  if (campo) campo.focus();
}

function entrar() {
  const v = ($("#senha") || {}).value || "";
  if (!v) return;
  try { sessionStorage.setItem(SENHA_KEY, v); } catch (e) {}
  carregar();
}

function sair() {
  try { sessionStorage.removeItem(SENHA_KEY); } catch (e) {}
  lista = [];
  selecionado = null;
  status("Desconectado", "");
  telaLogin();
}

async function carregar() {
  if (!senhaAdmin()) { telaLogin(); return; }
  status("Carregando…", "busy");
  try {
    const j = await api("listar", { senha: senhaAdmin() });
    lista = j.docs.sort((a, b) => String(b.atualizadoEm || "").localeCompare(String(a.atualizadoEm || "")));
    urlPlanilha = j.planilha || "";
    status("Atualizado às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), "ok");
    renderPainel();
  } catch (err) {
    if (err.codigo === "senha") {
      try { sessionStorage.removeItem(SENHA_KEY); } catch (e) {}
      status("Acesso restrito", "err");
      telaLogin("Senha incorreta.");
    } else if (err.codigo === "bloqueado") {
      try { sessionStorage.removeItem(SENHA_KEY); } catch (e) {}
      status("Acesso bloqueado", "err");
      telaLogin(err.message);
    } else {
      status("Sem conexão", "err");
      if (!lista.length) bloqueado("Não foi possível carregar as respostas. Verifique a conexão e tente de novo.");
    }
  }
}

if (!apiAtiva()) {
  status("Servidor não configurado", "err");
  bloqueado("O servidor ainda não foi ativado. Siga o passo a passo em apps-script/LEIA-ME.md e preencha o config.js.");
} else {
  carregar();
  setInterval(() => { if (senhaAdmin() && !document.hidden) carregar(); }, 60000);
}
