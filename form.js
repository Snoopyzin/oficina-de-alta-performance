/* =========================================================
   Formulário dos mentorados (index.html)
   ========================================================= */

const LS_KEY = "diag360-rascunho";
const ID_KEY = "diag360-id";

/** Identificação anônima deste mentorado, guardada no navegador. */
function meuId() {
  let id = null;
  try { id = localStorage.getItem(ID_KEY); } catch (e) {}
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    try { localStorage.setItem(ID_KEY, id); } catch (e) {}
  }
  return id;
}

let st = { respostas: {}, status: "rascunho" };   // rascunho local / espelho do doc remoto
let atual = 0;                                    // índice do departamento aberto
let salvando = false, pendente = false, timer = null;

try {
  const r = JSON.parse(localStorage.getItem(LS_KEY) || "null");
  if (r && r.respostas) st = r;
} catch (e) {}

function contSec(s, resp) {
  return s.qs.filter(q => preenchido((resp || st.respostas)[key(s, q)])).length;
}

function progresso(resp) {
  let n = 0;
  SECOES.forEach(s => n += contSec(s, resp));
  return Math.round(n / TOTAL * 100);
}

function salvarLocal() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(st)); } catch (e) {}
}


/* =========================================================
   3. FORMULÁRIO
   ========================================================= */

function campoNota(q, k, v, fid, dica) {
  let botoes = "";
  for (let i = 0; i <= 10; i++) {
    botoes += `<button type="button" data-k="${k}" data-v="${i}" aria-pressed="${v === i}">${i}</button>`;
  }
  return `
    <div class="q nota" role="group" aria-labelledby="${fid}">
      <div class="t" id="${fid}">${esc(q.t)}</div>
      ${dica}
      <div class="escala">${botoes}</div>
      <div class="escala-legenda"><span>0 · inexistente</span><span>10 · referência no mercado</span></div>
    </div>`;
}

function campoChecks(q, k, v, fid, dica) {
  const sel = Array.isArray(v) ? v : [];
  const opcoes = q.op.map((o, i) => `
    <label>
      <input type="checkbox" id="${fid}_${i}" data-k="${k}" value="${esc(o)}" ${sel.includes(o) ? "checked" : ""}>
      ${esc(o)}
    </label>`).join("");
  return `
    <div class="q" role="group" aria-labelledby="${fid}">
      <div class="t" id="${fid}">${esc(q.t)}</div>
      ${dica}
      <div class="checks">${opcoes}</div>
    </div>`;
}

function campoSimNao(q, k, v, fid, dica) {
  const opcoes = ["Sim", "Não"].map((o, i) => `
    <label>
      <input type="radio" id="${fid}_${i}" name="${fid}" data-k="${k}" value="${o}" ${v === o ? "checked" : ""}>
      ${o}
    </label>`).join("");
  const det = st.respostas[k + ".det"];
  const campoDet = q.det ? `
      <label class="t det" for="${fid}_det">${esc(q.det)}</label>
      <textarea id="${fid}_det" data-k="${k}.det">${esc(det)}</textarea>` : "";
  return `
    <div class="q" role="group" aria-labelledby="${fid}">
      <div class="t" id="${fid}">${esc(q.t)}</div>
      ${dica}
      <div class="checks">${opcoes}</div>${campoDet}
    </div>`;
}

function campo(s, q) {
  const k = key(s, q);
  const v = st.respostas[k];
  const fid = "q_" + s.id + "_" + q.id;
  const dica = q.h ? `<div class="h">${esc(q.h)}</div>` : "";

  if (q.tipo === "nota")   return campoNota(q, k, v, fid, dica);
  if (q.tipo === "checks") return campoChecks(q, k, v, fid, dica);
  if (q.tipo === "simnao") return campoSimNao(q, k, v, fid, dica);

  let input;
  if (q.tipo === "textarea") {
    input = `<textarea id="${fid}" data-k="${k}">${esc(v)}</textarea>`;
  } else if (q.tipo === "select") {
    const opcoes = q.op.map(o => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("");
    input = `<select id="${fid}" data-k="${k}"><option value="">Selecione…</option>${opcoes}</select>`;
  } else {
    const ehNumero = q.tipo === "number";
    input = `<input type="${ehNumero ? "number" : "text"}" id="${fid}" data-k="${k}" value="${esc(v)}" ${ehNumero ? 'inputmode="numeric"' : ""}>`;
  }
  return `
    <div class="q">
      <label class="t" for="${fid}">${esc(q.t)}</label>
      ${dica}
      ${input}
    </div>`;
}

function rodapeFicha(i) {
  const ultima = i === SECOES.length - 1;
  const proximo = ultima
    ? `<button class="btn prim" type="button" id="enviar">Enviar diagnóstico</button>`
    : `<button class="btn prim" type="button" data-nav="1">Próximo: ${esc(SECOES[i + 1].curto)} →</button>`;
  return `
    <div class="rodape-ficha">
      <button class="btn" type="button" data-nav="-1" ${i === 0 ? "disabled" : ""}>← Anterior</button>
      ${proximo}
    </div>
    ${ultima ? '<div class="msg" id="msgEnvio" role="status"></div>' : ""}`;
}

function montarFicha() {
  $("#ficha").innerHTML = SECOES.map((s, i) => `
    <div class="sec" data-i="${i}" ${i === atual ? "" : "hidden"}>
      <div class="ficha-top">
        <span class="eyebrow">Departamento ${String(i + 1).padStart(2, "0")} de ${SECOES.length}</span>
        <h2>${esc(s.t)}</h2>
        <p>${esc(s.intro)}</p>
      </div>
      <div class="perguntas">${s.qs.map(q => campo(s, q)).join("")}</div>
      ${rodapeFicha(i)}
    </div>`).join("");
}

function montarTrilho() {
  const nav = $("#trilho");
  nav.querySelectorAll(".dep").forEach(e => e.remove());

  SECOES.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dep";
    b.dataset.i = i;
    b.innerHTML = `<span class="n">${String(i + 1).padStart(2, "0")}</span><span>${esc(s.curto)}</span><span class="c"></span>`;
    nav.appendChild(b);
  });

  atualizarProg();
}

function atualizarProg() {
  document.querySelectorAll(".dep").forEach(b => {
    const s = SECOES[b.dataset.i];
    const c = contSec(s);
    const el = b.querySelector(".c");
    el.textContent = c + "/" + s.qs.length;
    el.classList.toggle("full", c === s.qs.length);
    b.setAttribute("aria-current", String(+b.dataset.i === atual));
  });

  const p = progresso();
  $("#progTxt").textContent = p + "% preenchido";
  $("#progBar").style.width = p + "%";
}

function irPara(i) {
  atual = Math.max(0, Math.min(SECOES.length - 1, i));
  document.querySelectorAll(".sec").forEach(e => e.hidden = +e.dataset.i !== atual);
  atualizarProg();

  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $("#ficha").scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
}

/** Chamado a cada edição: atualiza progresso, guarda local e agenda o salvamento remoto. */
function mudou() {
  atualizarProg();
  salvarLocal();
  if (apiAtiva()) {
    status("Alterações não salvas…", "busy");
    clearTimeout(timer);
    timer = setTimeout(salvar, 1200);
  }
}


/* =========================================================
   4. SALVAMENTO E ENVIO
   ========================================================= */

function docRemoto() {
  return {
    nome: st.respostas["empresa.nome"] || "",
    empresa: st.respostas["empresa.empresa"] || "",
    status: st.status,
    progresso: progresso(),
    atualizadoEm: new Date().toISOString(),
    enviadoEm: st.enviadoEm || null,
    respostas: st.respostas
  };
}

async function salvar() {
  if (!apiAtiva()) return false;
  if (salvando) { pendente = true; return false; }

  salvando = true;
  status("Salvando…", "busy");
  let ok = false;

  try {
    await api("salvar", { id: meuId(), doc: docRemoto() });
    ok = true;
    status("Salvo às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), "ok");
  } catch (err) {
    status("Sem conexão, tentando de novo…", "err");
    setTimeout(salvar, 4000 + Math.random() * 2000);
  }

  salvando = false;
  if (pendente) { pendente = false; return salvar(); }
  return ok;
}

function semServidor() {
  status("Salvo só neste navegador", "err");
  const a = $("#avisoLocal");
  a.hidden = false;
  a.textContent = "O envio ao seu mentor ainda não foi ativado. Suas respostas ficam guardadas neste navegador.";
}

async function enviar() {
  const m = $("#msgEnvio");
  m.className = "msg";

  if (!preenchido(st.respostas["empresa.nome"]) || !preenchido(st.respostas["empresa.empresa"])) {
    m.className = "msg err";
    m.textContent = "Preencha seu nome e o nome da oficina no departamento 01 antes de enviar.";
    return;
  }
  if (!apiAtiva()) {
    m.className = "msg err";
    m.textContent = "O envio ainda não está ativo. Avise o seu mentor.";
    return;
  }

  const antes = { status: st.status, enviadoEm: st.enviadoEm };
  st.status = "enviado";
  st.enviadoEm = new Date().toISOString();
  clearTimeout(timer);

  const ok = await salvar();
  if (ok) {
    salvarLocal();
    m.className = "msg ok";
    m.textContent = `Diagnóstico enviado com ${progresso()}% preenchido. Você pode voltar e completar as respostas quando quiser; tudo continua sendo salvo automaticamente.`;
  } else {
    Object.assign(st, antes);
    if (!m.textContent) {
      m.className = "msg err";
      m.textContent = "O envio não foi concluído. Verifique a conexão e tente de novo.";
    }
  }
}




/* =========================================================
   Eventos e inicialização
   ========================================================= */

document.addEventListener("click", e => {
  const alvo = e.target;

  const dep = alvo.closest(".dep");
  if (dep) { irPara(+dep.dataset.i); return; }

  const nav = alvo.closest("[data-nav]");
  if (nav) { irPara(atual + +nav.dataset.nav); return; }

  const nota = alvo.closest(".escala button");
  if (nota) {
    st.respostas[nota.dataset.k] = +nota.dataset.v;
    nota.parentElement.querySelectorAll("button")
      .forEach(x => x.setAttribute("aria-pressed", String(x === nota)));
    mudou();
    return;
  }

  if (alvo.id === "enviar") enviar();
});

document.addEventListener("input", e => {
  const el = e.target;
  if (!el.dataset || !el.dataset.k || !el.closest("#ficha")) return;

  const k = el.dataset.k;
  if (el.type === "checkbox") {
    st.respostas[k] = [...document.querySelectorAll(`input[type=checkbox][data-k="${k}"]:checked`)].map(x => x.value);
  } else {
    st.respostas[k] = el.value;
  }
  mudou();
});

montarFicha();
montarTrilho();

if (!apiAtiva()) {
  semServidor();
} else if (Object.keys(st.respostas).length) {
  salvar();   // sobe o rascunho que estava só no navegador
} else {
  status("Pronto · salvamento automático", "ok");
}
