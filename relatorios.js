/* =========================================================
   Relatórios (relatorios.html) — somente o administrador
   ========================================================= */

let lista = [], selecionado = null;

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
      </div>
    </div>
    <div class="msg" id="msgExport" role="status"></div>
    <div class="bloco">
      <h3>Mapa de autoavaliação</h3>
      <p>Nota de 0 a 10 que cada dono deu para a própria área. Vermelho abaixo de 4, amarelo de 4 a 6, verde a partir de 7. Clique numa linha para ler o diagnóstico completo.</p>
      ${tabela}
    </div>`;
}

function renderDetalhe(P, r) {
  const rs = r.respostas || {};

  const secoes = SECOES.map(s => `
    <div class="resp-sec">
      <h4>${esc(s.t)}</h4>
      ${s.qs.map(q => {
        const v = rs[key(s, q)];
        const tem = preenchido(v);
        return `
        <div class="resp">
          <div class="p">${esc(q.t)}</div>
          <div class="a ${tem ? "" : "vz"}">${tem ? esc(fmt(v)) : "Sem resposta"}</div>
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
    cols.push([s.curto + " | " + q.t, r => {
      const v = (r.respostas || {})[key(s, q)];
      return preenchido(v) ? fmt(v) : "";
    }]);
  }));

  const cel = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  const csv = "﻿" + [
    cols.map(c => cel(c[0])).join(";"),
    ...lista.map(r => cols.map(c => cel(c[1](r))).join(";"))
  ].join("\r\n");

  const dl = window.claude?.use ? await claude.use("downloads") : null;
  if (!dl) {
    m.className = "msg err";
    m.textContent = "A exportação não está disponível nesta visualização.";
    return;
  }

  try {
    await dl.save({ filename: "diagnostico-360-mentorados.csv", data: csv });
    m.className = "msg ok";
    m.textContent = "Planilha gerada.";
  } catch (err) {
    if (err && err.code === "declined") return;
    m.className = "msg err";
    m.textContent = "Não foi possível gerar a planilha. Tente novamente em alguns segundos.";
  }
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

  if (alvo.id === "voltar")   { selecionado = null; renderPainel(); return; }
  if (alvo.id === "exportar") exportar();
});

// Linhas da tabela acessíveis por teclado
document.addEventListener("keydown", e => {
  const linha = e.target.closest && e.target.closest("tr.linha");
  if (linha && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    linha.click();
  }
});

function bloqueado(msg) {
  $("#vistaPainel").innerHTML = `<div class="bloco"><div class="vazio">${esc(msg)}</div></div>`;
}

(async () => {
  const c = await conectar();

  if (!c.db) {
    status("Sem conexão", "err");
    bloqueado("Não foi possível verificar o seu acesso. Abra esta página pela plataforma, com a conta do administrador.");
    return;
  }
  if (!c.souDono) {
    status("Acesso restrito", "err");
    bloqueado("Esta página é exclusiva do administrador da mentoria.");
    return;
  }

  status("Administrador · tempo real", "ok");
  renderPainel();

  c.db.collection("respostas").onSnapshot(
    q => {
      lista = q.docs
        .map(x => ({ id: x.id, ...x.data() }))
        .sort((a, b) => String(b.atualizadoEm || "").localeCompare(String(a.atualizadoEm || "")));
      renderPainel();
    },
    () => bloqueado("Não foi possível carregar as respostas. Recarregue a página.")
  );
})();
