# Como Enviar e Receber HTML do iframe

## 🎯 Conversão Automática de HTML

O iframe agora **converte automaticamente** HTML em blocos visuais editáveis:

- `<h1>`, `<h2>`, `<h3>` → **Heading**
- `<p>` → **Text**
- `<a>` → **Button**
- `<img>` → **Image**
- `<hr>` → **Divider**
- `<div>`, `<section>` → **Container**
- Outros elementos → **Html** (fallback)

```javascript
// Este HTML será convertido automaticamente em blocos
const html = `
  <h1 style="color: #333;">Título Principal</h1>
  <p style="font-size: 16px;">Texto do parágrafo</p>
  <a href="https://example.com" style="background: #0066FF; color: white; padding: 12px 24px;">
    Clique Aqui
  </a>
  <img src="https://via.placeholder.com/400" alt="Imagem" />
`;

// Resultado: 4 blocos editáveis (Heading + Text + Button + Image)
```

## 📤 Enviar HTML para o iframe

### Importante: Timing do iframe

O iframe precisa estar **completamente carregado** antes de receber mensagens. Use um delay:

```javascript
const iframe = document.getElementById('email-editor-frame');

// HTML que você tem no banco de dados
const htmlDoBanco = '<h1>Meu Email</h1><p>Conteúdo aqui</p>';

// AGUARDE o iframe estar pronto (recomendado: 1-2 segundos após o load)
iframe.addEventListener('load', () => {
  setTimeout(() => {
    iframe.contentWindow.postMessage({
      type: 'LOAD_EMAIL_HTML',
      html: htmlDoBanco
    }, '*');
  }, 1500); // Aguarda 1.5 segundos
});
```

### Ou envie múltiplas vezes (mais confiável)

```javascript
function enviarHtml(html) {
  const iframe = document.getElementById('email-editor-frame');
  if (!iframe?.contentWindow) return;
  
  iframe.contentWindow.postMessage({
    type: 'LOAD_EMAIL_HTML',
    html: html
  }, '*');
}

// Tenta enviar 3 vezes com intervalos
iframe.addEventListener('load', () => {
  const htmlDoBanco = '<h1>Meu Email</h1><p>Conteúdo aqui</p>';
  
  setTimeout(() => enviarHtml(htmlDoBanco), 1000);
  setTimeout(() => enviarHtml(htmlDoBanco), 2000);
  setTimeout(() => enviarHtml(htmlDoBanco), 3000);
});
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

## � Exemplo Angular (Solução do Problema)

```typescript
@ViewChild('builderFrame', { static: true })
builderFrame!: ElementRef<HTMLIFrameElement>;

private htmlPendente: string | null = null;
iframeReady: boolean = false;

onIframeLoad() {
  console.log('Iframe load event disparado');
  
  // Aguarda um pouco mais para garantir que o app interno está pronto
  setTimeout(() => {
    this.iframeReady = true;
    console.log('Iframe marcado como pronto');
    
    // Se tinha HTML esperando, envia agora
    if (this.htmlPendente) {
      this.loadHtmlIntoIframe(this.htmlPendente);
      this.htmlPendente = null;
    }
  }, 2000); // 2 segundos após o evento load
}

private loadHtmlIntoIframe(html: string) {
  console.log('Tentando enviar HTML...', {
    iframeReady: this.iframeReady,
    hasContentWindow: !!this.builderFrame?.nativeElement?.contentWindow,
    htmlLength: html.length
  });

  if (!this.iframeReady) {
    console.log('Iframe não está pronto ainda, guardando HTML para depois');
    this.htmlPendente = html;
    return;
  }

  const iframe = this.builderFrame.nativeElement;
  if (!iframe?.contentWindow) {
    console.error('ContentWindow não disponível');
    return;
  }

  // Envia a mensagem
  iframe.contentWindow.postMessage(
    {
      type: 'LOAD_EMAIL_HTML',
      html: html
    },
    'https://email-builder-js-vite-emailbuilder.vercel.app'
  );

  console.log('✅ Mensagem postMessage enviada com sucesso');
  
  // Reenvia após 1 segundo para garantir
  setTimeout(() => {

## ⚠️ Problemas Comuns

### 1. HTML não aparece no iframe
**Causa**: Você está enviando o HTML muito cedo, antes do iframe estar pronto.

**Solução**: Aguarde 1-2 segundos após o evento `load` do iframe:
```typescript
onIframeLoad() {
  setTimeout(() => {
    this.loadHtmlIntoIframe(this.htmlContent);
  }, 2000); // 2 segundos
}
```

### 2. postMessage não funciona
**Causa**: O `contentWindow` pode não estar disponível ou o iframe não está no DOM.

**Solução**: Verifique se o iframe existe e tente múltiplas vezes:
```typescript
private enviarComRetentativa(html: string, tentativas: number = 3) {
  const intervalo = 1000;
  
  for (let i = 0; i < tentativas; i++) {
    setTimeout(() => {
      this.builderFrame.nativeElement.contentWindow?.postMessage(
        { type: 'LOAD_EMAIL_HTML', html },
        '*'
      );
    }, intervalo * (i + 1));
  }
}
```

### 3. Console não mostra erros mas nada acontece
**Causa**: O iframe pode estar bloqueado por CORS ou CSP.

**Solução**: 
- Verifique o console do navegador (F12)
- Teste com `*` no targetOrigin primeiro
- Confirme que a URL do iframe está correta
    iframe.contentWindow?.postMessage(
      { type: 'LOAD_EMAIL_HTML', html: html },
      'https://email-builder-js-vite-emailbuilder.vercel.app'
    );
    console.log('✅ Mensagem reenviada (backup)');
  }, 1000);
}

ngAfterViewInit() {
  window.addEventListener('message', this.onMessage);
  
  this.isEditMode = !!this.NotificacaoTemplate?.conteudo;
  
  // Aguarda o iframe estar pronto antes de tentar enviar
  // O onIframeLoad() vai lidar com o envio
  if (this.isEditMode && this.NotificacaoTemplate.conteudo) {
    console.log('Modo edição: HTML será enviado após iframe carregar');
  }
}
```

## �🚀 Testar Localmente

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
- HTML é **automaticamente convertido** em blocos editáveis quando possível
- Toda alteração no editor envia novo HTML automaticamente
- O HTML gerado está pronto para envio de email
- Funciona com qualquer HTML válido (tabelas, inline styles, etc)

## 🔄 Conversão: O que acontece?

### HTML Simples → Blocos Estruturados

```html
<!-- Você envia isso: -->
<h1>Título</h1>
<p>Parágrafo de texto</p>
<a href="#">Botão</a>

<!-- O editor cria: -->
- 1 bloco Heading (editável visualmente)
- 1 bloco Text (editável visualmente)  
- 1 bloco Button (editável visualmente)
```

### HTML Complexo → Mantém estrutura

```html
<!-- Você envia HTML com tabelas complexas: -->
<table>...</table>

<!-- O editor tenta parsear, mas pode criar: -->
- 1 bloco Container com múltiplos Text/Button dentro
- OU 1 bloco Html se não conseguir parsear
```

### Vantagens

✅ **Edição Visual**: Usuário edita com interface gráfica  
✅ **Preserva Estilos**: Cores, fontes, padding são mantidos  
✅ **Flexível**: Se não conseguir parsear, usa bloco Html  
✅ **Bi-direcional**: HTML → Blocos → HTML
