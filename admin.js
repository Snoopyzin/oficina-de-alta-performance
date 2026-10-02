/* =========================================================
   Página do administrador (index.html): escolher qual link enviar
   ========================================================= */

const PAGINAS = [
  {
    arquivo: "diagnostico.html",
    titulo: "Formulário dos mentorados",
    tag: "Pode enviar",
    classe: "enviar",
    texto: "É o link que os mentorados recebem. Eles só enxergam o próprio diagnóstico.",
    compartilhar: true
  },
  {
    arquivo: "relatorios.html",
    titulo: "Relatórios",
    tag: "Só para você",
    classe: "guardar",
    texto: "Respostas de todos os mentorados, mapa de notas e exportação. Não envie este link.",
    compartilhar: false
  }
];

/** Endereço completo de um arquivo, na mesma pasta desta página. */
const urlDe = arquivo => new URL(arquivo, location.href).href;

function card(p) {
  const url = urlDe(p.arquivo);
  const zap = p.compartilhar
    ? `<a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent("Olá! Preencha o seu Diagnóstico 360° aqui: " + url)}">Enviar por WhatsApp</a>`
    : "";
  return `
    <article class="card-link ${p.compartilhar ? "" : "privado"}">
      <span class="tag ${p.classe}">${esc(p.tag)}</span>
      <h3>${esc(p.titulo)}</h3>
      <p>${esc(p.texto)}</p>
      <div class="url" id="url_${p.arquivo}">${esc(url)}</div>
      <div class="acoes">
        <button class="btn prim" type="button" data-copiar="${esc(url)}">Copiar link</button>
        <a class="btn" href="${esc(p.arquivo)}" target="_blank" rel="noopener">Abrir</a>
        ${zap}
      </div>
    </article>`;
}

$("#hub").innerHTML = PAGINAS.map(card).join("");

document.addEventListener("click", async e => {
  const b = e.target.closest("[data-copiar]");
  if (!b) return;

  const texto = b.dataset.copiar;
  const original = b.textContent;
  try {
    await navigator.clipboard.writeText(texto);
    b.textContent = "Link copiado!";
  } catch (err) {
    // Sem permissão de área de transferência: seleciona o endereço para copiar à mão
    const alvo = b.closest(".card-link").querySelector(".url");
    getSelection().selectAllChildren(alvo);
    b.textContent = "Selecionado: Ctrl+C";
  }
  setTimeout(() => { b.textContent = original; }, 2000);
});
