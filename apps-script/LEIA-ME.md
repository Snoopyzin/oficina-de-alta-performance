# Servidor do Diagnóstico 360° (uma vez só)

Este passo a passo liga o site a uma **planilha Google** (onde as respostas ficam guardadas)
e ao **envio de e-mail** em nome de imersao@volmastertech.com.

1. Entre no Google com a conta **imersao@volmastertech.com**.
2. Acesse https://script.google.com e clique em **Novo projeto**.
3. Apague o código que aparece e cole todo o conteúdo de `Code.gs`.
4. Na linha `const ADMIN_SENHA = ...`, troque por a senha que **você** vai digitar na página de relatórios.
5. Clique em **Implantar → Nova implantação**, tipo **App da Web**:
   - Executar como: **Eu** (imersao@volmastertech.com)
   - Quem pode acessar: **Qualquer pessoa**
6. Autorize quando o Google pedir (ele pede acesso a Planilhas e ao envio de e-mail)
   e copie o endereço terminado em `/exec`.
7. Abra `config.js` do site, cole o endereço em `url` e envie ao GitHub.

Pronto:
- A planilha **"Diagnóstico 360° – Respostas"** é criada sozinha no Drive dessa conta, na primeira resposta recebida.
  Cada mentorado é uma linha, com nome, oficina, e-mail, WhatsApp e as notas por área.
- A página de relatórios pede a senha do passo 4 e mostra tudo em tempo quase real.

Se alterar o `Code.gs` depois, use **Implantar → Gerenciar implantações → editar → Nova versão**.
