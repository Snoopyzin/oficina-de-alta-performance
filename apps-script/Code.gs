/**
 * Diagnóstico 360° · armazenamento e envio de e-mail.
 *
 * Publique este script com a conta imersao@volmastertech.com.
 *  - As respostas dos mentorados ficam numa planilha Google criada
 *    automaticamente no Drive dessa conta ("Diagnóstico 360° – Respostas").
 *  - O e-mail do relatório sai em nome dessa conta, com a logo da oficina.
 *  - Ler as respostas e enviar e-mail exigem a senha de um administrador.
 */

// Administradores: "nome": "senha" (mínimo de 8 caracteres). Quem não está aqui não vê nada.
const ADMINS = {
  "Administrador": "TROQUE-ESTA-SENHA"
  // , "Sócio": "outra-senha-forte"
};
const MAX_TENTATIVAS = 10;                 // senhas erradas seguidas antes de bloquear por 15 minutos
const REMETENTE = "Oficina de Alta Performance";
const LOGO_URL = "https://snoopyzin.github.io/oficina-de-alta-performance/images/logo.png";
const LIMITE_EMAILS_DIA = 100;             // trava de segurança

const NOME_PLANILHA = "Diagnóstico 360° – Respostas";
const AREAS = [
  ["estrategia", "Estratégia"], ["comercial", "Comercial"], ["oficina", "Oficina"],
  ["pecas", "Peças"], ["financeiro", "Financeiro"], ["pessoas", "Pessoas"],
  ["processos", "Processos"], ["tecnologia", "Tecnologia"], ["legal", "Jurídico e SSMA"], ["mercado", "Mercado"]
];
const FIXAS = ["ID", "Atualizado em", "Enviado em", "Status", "% preenchido", "Nome", "Oficina", "E-mail", "WhatsApp"];
const COL_JSON = FIXAS.length + AREAS.length + 1;   // primeira coluna com o JSON completo
const PEDACOS = 6;                                  // o JSON é dividido em células de até 45 mil caracteres
const TAM_PEDACO = 45000;


/* ---------- Entrada ---------- */

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    switch (d.acao) {
      case "salvar":      return resposta(salvar(d));
      case "listar":      exigirSenha(d); return resposta(listar());
      case "enviarEmail": exigirSenha(d); return resposta(enviarEmail(d));
      default:            return resposta({ ok: false, erro: "Ação desconhecida." });
    }
  } catch (err) {
    if (err && (err.codigo === "senha" || err.codigo === "bloqueado")) return resposta({ ok: false, codigo: err.codigo, erro: err.message });
    return resposta({ ok: false, erro: String(err && err.message || err) });
  }
}

function doGet() {
  return resposta({ ok: true, servico: "Diagnóstico 360°" });
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Confere a senha e devolve o nome do administrador. Bloqueia após muitas tentativas erradas. */
function exigirSenha(d) {
  const cache = CacheService.getScriptCache();
  const falhas = Number(cache.get("falhas") || 0);
  if (falhas >= MAX_TENTATIVAS) {
    const e = new Error("Muitas tentativas erradas. Aguarde 15 minutos.");
    e.codigo = "bloqueado";
    throw e;
  }

  const senha = String(d.senha || "");
  const nome = senha.length >= 8 && Object.keys(ADMINS).find(n => ADMINS[n] === senha);
  if (!nome) {
    cache.put("falhas", String(falhas + 1), 900);
    const e = new Error("Senha incorreta.");
    e.codigo = "senha";
    throw e;
  }
  cache.remove("falhas");
  return nome;
}


/* ---------- Planilha ---------- */

function planilha() {
  const props = PropertiesService.getScriptProperties();
  let ss = null;
  const id = props.getProperty("planilha");
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(NOME_PLANILHA);
    props.setProperty("planilha", ss.getId());
  }

  let aba = ss.getSheetByName("Respostas");
  if (!aba) {
    aba = ss.getSheets()[0];
    aba.setName("Respostas");
    const cab = FIXAS.concat(AREAS.map(a => "Nota · " + a[1]), ["Respostas completas (JSON)"]);
    aba.getRange(1, 1, aba.getMaxRows(), Math.max(aba.getMaxColumns(), COL_JSON + PEDACOS)).setNumberFormat("@");
    aba.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight("bold").setBackground("#E08A2E");
    aba.setFrozenRows(1);
  }
  return aba;
}

function salvar(d) {
  const id = String(d.id || "");
  if (!/^[A-Za-z0-9-]{16,64}$/.test(id)) throw new Error("Identificação inválida.");

  const doc = d.doc || {};
  const resp = doc.respostas || {};
  const json = JSON.stringify(resp);
  if (json.length > TAM_PEDACO * PEDACOS) throw new Error("Respostas grandes demais.");

  const pedacos = [];
  for (let i = 0; i < PEDACOS; i++) pedacos.push(json.slice(i * TAM_PEDACO, (i + 1) * TAM_PEDACO));

  const linha = [
    id, doc.atualizadoEm || "", doc.enviadoEm || "", doc.status || "rascunho", String(doc.progresso || 0),
    String(doc.nome || ""), String(doc.empresa || ""), String(resp["empresa.email"] || ""), String(resp["empresa.whatsapp"] || "")
  ].concat(AREAS.map(a => resp[a[0] + ".nota"] === undefined ? "" : String(resp[a[0] + ".nota"])), pedacos);

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const aba = planilha();
    const ultima = aba.getLastRow();
    let alvo = 0;
    if (ultima > 1) {
      const ids = aba.getRange(2, 1, ultima - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) if (ids[i][0] === id) { alvo = i + 2; break; }
    }
    if (!alvo) alvo = ultima + 1;
    aba.getRange(alvo, 1, 1, linha.length).setNumberFormat("@").setValues([linha]);
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

function listar() {
  const aba = planilha();
  const ultima = aba.getLastRow();
  const docs = [];

  if (ultima > 1) {
    const dados = aba.getRange(2, 1, ultima - 1, COL_JSON + PEDACOS - 1).getValues();
    dados.forEach(l => {
      if (!l[0]) return;
      let respostas = {};
      try { respostas = JSON.parse(l.slice(COL_JSON - 1, COL_JSON - 1 + PEDACOS).join("") || "{}"); } catch (err) {}
      docs.push({
        id: String(l[0]),
        atualizadoEm: String(l[1] || ""),
        enviadoEm: String(l[2] || "") || null,
        status: String(l[3] || "rascunho"),
        progresso: Number(l[4]) || 0,
        nome: String(l[5] || ""),
        empresa: String(l[6] || ""),
        respostas: respostas
      });
    });
  }
  return { ok: true, docs: docs, planilha: aba.getParent().getUrl() };
}


/* ---------- E-mail do relatório ---------- */

function enviarEmail(d) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.para || ""))) throw new Error("E-mail inválido.");
  if (!contarEnvio()) throw new Error("Limite diário de envios atingido.");

  const opcoes = {
    to: d.para,
    subject: "Seu Diagnóstico 360° · " + (d.empresa || "Oficina de Alta Performance"),
    htmlBody: montarHtml(d),
    body: textoSimples(d),
    name: REMETENTE,
    replyTo: Session.getEffectiveUser().getEmail()
  };

  try {
    opcoes.inlineImages = { logo: UrlFetchApp.fetch(LOGO_URL).getBlob().setName("logo.png") };
  } catch (err) {
    // sem a logo embutida o e-mail ainda é enviado
  }

  MailApp.sendEmail(opcoes);
  return { ok: true };
}

function contarEnvio() {
  const props = PropertiesService.getScriptProperties();
  const hoje = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");
  const partes = String(props.getProperty("contador") || "").split("|");
  const atual = partes[0] === hoje ? Number(partes[1]) : 0;
  if (atual >= LIMITE_EMAILS_DIA) return false;
  props.setProperty("contador", hoje + "|" + (atual + 1));
  return true;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function cor(v) {
  return v < 4 ? "#C2452F" : v < 7 ? "#C98A12" : "#2F8A55";
}

function textoSimples(d) {
  const linhas = ["Olá, " + (d.nome || "") + "! Segue o resumo do seu Diagnóstico 360°.", ""];
  (d.notas || []).forEach(n => linhas.push("• " + n.area + ": " + n.v));
  if (d.media != null) linhas.push("", "Média geral: " + String(d.media).replace(".", ","));
  linhas.push("", "Oficina de Alta Performance");
  return linhas.join("\n");
}

function montarHtml(d) {
  const notas = d.notas || [];
  const linhas = notas.map(n => `
    <tr>
      <td style="padding:7px 0;font-size:14px;color:#1A2026;width:34%;">${esc(n.area)}</td>
      <td style="padding:7px 10px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E6E9EC;border-radius:4px;">
          <tr><td width="${Math.max(n.v * 10, 2)}%" style="background:${cor(n.v)};height:10px;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td><td style="font-size:0;">&nbsp;</td></tr>
        </table>
      </td>
      <td style="padding:7px 0;font-size:14px;font-weight:bold;color:${cor(n.v)};text-align:right;width:36px;">${esc(n.v)}</td>
    </tr>`).join("");

  const chip = (titulo, lista, c) => lista && lista.length ? `
    <p style="margin:14px 0 0;font-size:14px;color:#1A2026;"><b style="color:${c};">${titulo}:</b> ${esc(lista.join(", "))}</p>` : "";

  return `
<!DOCTYPE html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:#EDEFF1;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEFF1;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;overflow:hidden;">
      <tr>
        <td align="center" style="background:#0F171B;padding:22px 20px;border-bottom:4px solid #E08A2E;">
          <img src="cid:logo" alt="Oficina de Alta Performance" width="260" style="display:block;border:0;max-width:100%;height:auto;">
        </td>
      </tr>
      <tr>
        <td style="padding:30px 30px 8px;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9A5210;">Diagnóstico 360° Diesel</p>
          <h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;color:#1A2026;">Olá, ${esc((d.nome || "").split(" ")[0])}!</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#44505A;">Segue o resumo do diagnóstico da <b>${esc(d.empresa || "sua oficina")}</b>. As notas abaixo são a sua autoavaliação, de 0 a 10, em cada área.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 30px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linhas}</table>
          ${d.media != null ? `<p style="margin:18px 0 0;padding-top:14px;border-top:1px solid #D2D7DC;font-size:15px;color:#1A2026;">Média geral: <b style="font-size:20px;color:${cor(Number(d.media))};">${esc(String(d.media).replace(".", ","))}</b></p>` : ""}
          ${chip("Pontos de atenção", d.atencao, "#C2452F")}
          ${chip("Pontos fortes", d.fortes, "#2F8A55")}
        </td>
      </tr>
      <tr>
        <td style="padding:22px 30px 30px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#44505A;">Em breve conversamos para definir as prioridades da mentoria.</p>
        </td>
      </tr>
      <tr>
        <td align="center" style="background:#0F171B;padding:16px;font-size:12px;color:#93A0AA;">
          Oficina de Alta Performance · Desenvolvendo oficinas de sucesso.
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
