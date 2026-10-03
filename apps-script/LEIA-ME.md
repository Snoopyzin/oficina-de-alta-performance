# Servidor do Diagnóstico 360° (uma vez só)

Este passo a passo liga o site a uma **planilha Google** (onde as respostas ficam guardadas)
e ao **envio de e-mail** em nome de imersao@volmastertech.com.

1. Entre no Google com a conta **imersao@volmastertech.com**.
2. Acesse https://script.google.com e clique em **Novo projeto**.
3. Apague o código que aparece e cole todo o conteúdo de `Code.gs`.
4. Em `const ADMINS = {...}`, troque `TROQUE-ESTA-SENHA` pela sua senha (mínimo 8 caracteres). Para ter mais administradores, acrescente uma linha por pessoa, com nome e senha própria.
5. Clique em **Implantar → Nova implantação**, tipo **App da Web**:
   - Executar como: **Eu** (imersao@volmastertech.com)
   - Quem pode acessar: **Qualquer pessoa**
6. Autorize quando o Google pedir (ele pede acesso a Planilhas e ao envio de e-mail)
   e copie o endereço terminado em `/exec`.
7. Abra `config.js` do site, cole o endereço em `url` e envie ao GitHub.

Pronto:
- A planilha **"Diagnóstico 360° – Respostas"** é criada sozinha no Drive dessa conta, na primeira resposta recebida.
  Cada mentorado é uma linha, com nome, oficina, e-mail, WhatsApp e as notas por área.
- A página de relatórios pede a senha de um administrador e mostra tudo em tempo quase real.
- Depois de 10 senhas erradas seguidas, o acesso fica bloqueado por 15 minutos.

## Privacidade
- A planilha pertence à conta imersao@volmastertech.com e **não é compartilhada com ninguém**. Só abre quem você convidar em Compartilhar.
- Os mentorados só conseguem enviar a própria resposta; não conseguem ler nada.
- Para tirar o acesso de um administrador, apague a linha dele em `ADMINS` e publique uma nova versão.

Se alterar o `Code.gs` depois, use **Implantar → Gerenciar implantações → editar → Nova versão**.
