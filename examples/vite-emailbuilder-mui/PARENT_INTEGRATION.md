# Integração com Projeto Pai

## Recebendo HTML do iframe

No seu projeto pai, escute as mensagens do iframe:

```javascript
// Escuta o HTML vindo do iframe
window.addEventListener('message', (event) => {
  // Em produção, valide o origin:
  // if (event.origin !== 'https://seu-editor-url.com') return;
  
  if (event.data.type === 'EMAIL_HTML') {
    const html = event.data.html;
    console.log('HTML recebido do editor:', html);
    
    // Aqui você pode:
    // - Salvar no backend
    // - Mostrar preview
    // - Enviar email
    // etc.
  }
});
```

## Enviando JSON para o iframe

Para carregar um template no editor, envie o documento JSON:

```javascript
// Referência para o iframe
const iframe = document.getElementById('email-editor-frame');

// Documento no formato EmailBuilder.js
const documento = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#262626',
      fontFamily: 'MODERN_SANS',
      childrenIds: ['block-1']
    }
  },
  'block-1': {
    type: 'Text',
    data: {
      style: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left'
      },
      props: {
        text: 'Olá! Este é um template carregado do parent.'
      }
    }
  }
};

// Envia para o iframe
iframe.contentWindow.postMessage({
  type: 'LOAD_EMAIL_JSON',
  document: documento
}, '*');
```

## Exemplo completo HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Email Builder Parent</title>
</head>
<body>
  <h1>Meu Projeto</h1>
  
  <button id="loadTemplate">Carregar Template</button>
  <button id="getHTML">Obter HTML Atual</button>
  
  <iframe 
    id="email-editor-frame" 
    src="http://localhost:5173"
    width="100%" 
    height="800px"
  ></iframe>

  <script>
    let currentHTML = '';

    // Recebe HTML do iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'EMAIL_HTML') {
        currentHTML = event.data.html;
        console.log('HTML atualizado:', currentHTML);
      }
    });

    // Carregar template de exemplo
    document.getElementById('loadTemplate').addEventListener('click', () => {
      const iframe = document.getElementById('email-editor-frame');
      
      iframe.contentWindow.postMessage({
        type: 'LOAD_EMAIL_JSON',
        document: {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['text-1', 'button-1']
            }
          },
          'text-1': {
            type: 'Text',
            data: {
              style: {
                color: '#000000',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                padding: { top: 20, bottom: 20, left: 20, right: 20 }
              },
              props: {
                text: 'Bem-vindo ao seu novo template!'
              }
            }
          },
          'button-1': {
            type: 'Button',
            data: {
              style: {
                backgroundColor: '#0066FF',
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
                padding: { top: 16, bottom: 16, left: 32, right: 32 }
              },
              props: {
                text: 'Clique Aqui',
                url: 'https://example.com'
              }
            }
          }
        }
      }, '*');
    });

    // Obter HTML atual
    document.getElementById('getHTML').addEventListener('click', () => {
      alert('HTML Atual:\n\n' + currentHTML.substring(0, 500) + '...');
    });
  </script>
</body>
</html>
```

## Notas Importantes

1. **Formato JSON**: O iframe aceita o documento no formato JSON do EmailBuilder.js, não HTML puro.
2. **Segurança**: Em produção, sempre valide o `event.origin` para aceitar mensagens apenas de origens confiáveis.
3. **Conversão HTML → JSON**: Não é suportado nativamente. Se você tem HTML, precisa convertê-lo para o formato de documento.
4. **Blocos disponíveis**: `EmailLayout`, `Text`, `Button`, `Image`, `Heading`, `Divider`, `Spacer`, `Avatar`, `Container`, `ColumnsContainer`, `Html`.
