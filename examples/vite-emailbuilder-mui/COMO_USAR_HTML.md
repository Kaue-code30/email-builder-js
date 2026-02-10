# Como Enviar e Receber HTML do iframe

## 📤 Enviar HTML para o iframe

Do seu projeto pai, envie HTML assim:

```javascript
const iframe = document.getElementById('email-editor-frame');

// HTML que você tem no banco de dados
const htmlDoBanco = '<h1>Meu Email</h1><p>Conteúdo aqui</p>';

iframe.contentWindow.postMessage({
  type: 'LOAD_EMAIL_HTML',
  html: htmlDoBanco
}, '*');
```

## 📥 Receber HTML do iframe

O iframe envia automaticamente o HTML sempre que o usuário faz alterações:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'EMAIL_HTML') {
    const htmlAtualizado = event.data.html;
    
    // Salvar no banco de dados
    salvarNoBanco(htmlAtualizado);
  }
});
```

## 🎯 Exemplo Completo

```javascript
let htmlAtual = '';

// 1. Receber HTML do iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'EMAIL_HTML') {
    htmlAtual = event.data.html;
    console.log('HTML recebido:', htmlAtual);
  }
});

// 2. Carregar HTML do banco quando a página abre
async function carregarEmail(id) {
  const response = await fetch(`/api/emails/${id}`);
  const data = await response.json();
  
  const iframe = document.getElementById('email-editor-frame');
  iframe.contentWindow.postMessage({
    type: 'LOAD_EMAIL_HTML',
    html: data.html
  }, '*');
}

// 3. Salvar HTML no banco
async function salvarEmail() {
  await fetch('/api/emails/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html: htmlAtual })
  });
}
```

## 🚀 Testar Localmente

1. Inicie o dev server:
   ```bash
   cd examples/vite-emailbuilder-mui
   npm run dev
   ```

2. Abra o arquivo `exemplo-parent.html` no navegador

3. Teste os botões:
   - **Carregar Email Simples**: Envia um HTML básico
   - **Carregar do Banco**: Simula carregar HTML completo
   - **Salvar HTML**: Mostra o HTML atual no console
   - **Ver HTML**: Abre o HTML em nova janela

## 🔒 Segurança em Produção

Valide o origin das mensagens:

```javascript
window.addEventListener('message', (event) => {
  // Aceitar apenas do seu domínio
  if (event.origin !== 'https://seu-editor.com') return;
  
  if (event.data.type === 'EMAIL_HTML') {
    // processar...
  }
});
```

## 💾 Auto-save

```javascript
let saveTimeout;

window.addEventListener('message', (event) => {
  if (event.data.type === 'EMAIL_HTML') {
    const html = event.data.html;
    
    // Cancela save anterior
    clearTimeout(saveTimeout);
    
    // Salva após 2 segundos sem mudanças
    saveTimeout = setTimeout(() => {
      salvarNoBanco(html);
    }, 2000);
  }
});
```

## 📝 Notas

- O iframe **aceita HTML puro** que você salva no banco
- Toda alteração no editor envia novo HTML automaticamente
- O HTML gerado está pronto para envio de email
- Funciona com qualquer HTML válido (tabelas, inline styles, etc)
