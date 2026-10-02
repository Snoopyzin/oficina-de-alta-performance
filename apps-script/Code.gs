/**
 * Envio do relatório do Diagnóstico 360° por e-mail.
 * Publique este script com a conta imersao@volmastertech.com:
 * o e-mail sai em nome dela, com a logo da Oficina de Alta Performance.
 */

const TOKEN = "TROQUE-ESTE-CODIGO";   // invente um código longo e repita em config.js
const REMETENTE = "Oficina de Alta Performance";
const LOGO_URL = "https://snoopyzin.github.io/oficina-de-alta-performance/images/logo.png";
const LIMITE_POR_DIA = 100;           // trava de segurança

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    if (d.token !== TOKEN) return resposta({ ok: false, erro: "Não autorizado." });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.para || ""))) return resposta({ ok: false, erro: "E-mail inválido." });
    if (!contarEnvio()) return resposta({ ok: false, erro: "Limite diário de envios atingido." });

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
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  }
}

function doGet() {
  return resposta({ ok: true, servico: "Diagnóstico 360° · envio de e-mail" });
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function contarEnvio() {
  const props = PropertiesService.getScriptProperties();
  const hoje = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");
  const [dia, n] = String(props.getProperty("contador") || "").split("|");
  const atual = dia === hoje ? Number(n) : 0;
  if (atual >= LIMITE_POR_DIA) return false;
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
