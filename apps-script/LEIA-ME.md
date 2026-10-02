# Envio de e-mail pelo Google (uma vez só)

1. Entre no Google com a conta **imersao@volmastertech.com**.
2. Acesse https://script.google.com e clique em **Novo projeto**.
3. Apague o código que aparece e cole todo o conteúdo de `Code.gs`.
4. Na linha `const TOKEN = ...`, troque por um código longo inventado por você (letras e números).
5. Clique em **Implantar → Nova implantação**, tipo **App da Web**:
   - Executar como: **Eu** (imersao@volmastertech.com)
   - Quem pode acessar: **Qualquer pessoa**
6. Autorize quando o Google pedir e copie o endereço terminado em `/exec`.
7. Abra `config.js` do site, cole o endereço em `url` e o mesmo código em `token`, e envie ao GitHub.

Se você alterar o `Code.gs` depois, use **Implantar → Gerenciar implantações → editar → Nova versão**.
