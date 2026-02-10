import { TEditorConfiguration } from '../../documents/editor/core';

/**
 * Converte HTML em estrutura de documento do EmailBuilder
 * Tenta identificar elementos comuns e criar blocos apropriados
 */
export function parseHtmlToDocument(html: string): TEditorConfiguration {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const childrenIds: string[] = [];
  const blocks: TEditorConfiguration = {};
  let blockCounter = 1;

  // Função auxiliar para gerar IDs únicos
  const generateId = (prefix: string) => `${prefix}-${blockCounter++}`;

  // Função para extrair estilos inline
  const extractStyles = (element: HTMLElement) => {
    const style: any = {};
    const computedStyle = element.style;

    if (computedStyle.color) style.color = computedStyle.color;
    if (computedStyle.backgroundColor) style.backgroundColor = computedStyle.backgroundColor;
    if (computedStyle.fontSize) style.fontSize = parseInt(computedStyle.fontSize);
    if (computedStyle.fontWeight) style.fontWeight = computedStyle.fontWeight;
    if (computedStyle.fontFamily) style.fontFamily = computedStyle.fontFamily;
    if (computedStyle.textAlign) style.textAlign = computedStyle.textAlign;
    
    // Padding
    const padding = {
      top: parseInt(computedStyle.paddingTop) || 0,
      bottom: parseInt(computedStyle.paddingBottom) || 0,
      left: parseInt(computedStyle.paddingLeft) || 0,
      right: parseInt(computedStyle.paddingRight) || 0,
    };
    if (padding.top || padding.bottom || padding.left || padding.right) {
      style.padding = padding;
    }

    return style;
  };

  // Função para processar elementos recursivamente
  const processElement = (element: Element): string | null => {
    const tagName = element.tagName.toLowerCase();
    const htmlEl = element as HTMLElement;

    // Headings (h1, h2, h3)
    if (['h1', 'h2', 'h3'].includes(tagName)) {
      const id = generateId('heading');
      const text = element.textContent?.trim() || '';
      const level = tagName as 'h1' | 'h2' | 'h3';
      
      blocks[id] = {
        type: 'Heading',
        data: {
          style: extractStyles(htmlEl),
          props: {
            text,
            level,
          },
        },
      };
      return id;
    }

    // Parágrafo -> Text
    if (tagName === 'p') {
      const id = generateId('text');
      const text = element.innerHTML || element.textContent || '';
      
      blocks[id] = {
        type: 'Text',
        data: {
          style: extractStyles(htmlEl),
          props: {
            text,
          },
        },
      };
      return id;
    }

    // Link/Button
    if (tagName === 'a') {
      const id = generateId('button');
      const anchor = element as HTMLAnchorElement;
      const text = anchor.textContent?.trim() || 'Clique aqui';
      const url = anchor.href || '#';
      
      blocks[id] = {
        type: 'Button',
        data: {
          style: extractStyles(htmlEl),
          props: {
            text,
            url,
          },
        },
      };
      return id;
    }

    // Imagem
    if (tagName === 'img') {
      const id = generateId('image');
      const img = element as HTMLImageElement;
      
      blocks[id] = {
        type: 'Image',
        data: {
          style: extractStyles(htmlEl),
          props: {
            url: img.src || '',
            alt: img.alt || '',
            linkHref: null,
          },
        },
      };
      return id;
    }

    // HR -> Divider
    if (tagName === 'hr') {
      const id = generateId('divider');
      blocks[id] = {
        type: 'Divider',
        data: {
          style: extractStyles(htmlEl),
          props: {},
        },
      };
      return id;
    }

    // Div/Section -> Container
    if (['div', 'section', 'article'].includes(tagName)) {
      const containerChildren: string[] = [];
      
      // Processa filhos
      Array.from(element.children).forEach((child) => {
        const childId = processElement(child);
        if (childId) containerChildren.push(childId);
      });

      // Se não tem filhos, tenta pegar o texto
      if (containerChildren.length === 0 && element.textContent?.trim()) {
        const textId = generateId('text');
        blocks[textId] = {
          type: 'Text',
          data: {
            style: extractStyles(htmlEl),
            props: {
              text: element.textContent.trim(),
            },
          },
        };
        containerChildren.push(textId);
      }

      if (containerChildren.length > 0) {
        const id = generateId('container');
        blocks[id] = {
          type: 'Container',
          data: {
            style: extractStyles(htmlEl),
            props: {
              childrenIds: containerChildren,
            },
          },
        };
        return id;
      }
    }

    // Table -> tenta processar como Container
    if (tagName === 'table') {
      const tableChildren: string[] = [];
      const cells = element.querySelectorAll('td, th');
      
      cells.forEach((cell) => {
        const cellId = processElement(cell);
        if (cellId) tableChildren.push(cellId);
      });

      if (tableChildren.length > 0) {
        const id = generateId('container');
        blocks[id] = {
          type: 'Container',
          data: {
            style: extractStyles(htmlEl),
            props: {
              childrenIds: tableChildren,
            },
          },
        };
        return id;
      }
    }

    return null;
  };

  // Processa o body ou elementos principais
  const bodyElements = doc.body.children.length > 0 
    ? Array.from(doc.body.children)
    : [doc.body];

  bodyElements.forEach((element) => {
    const id = processElement(element);
    if (id) childrenIds.push(id);
  });

  // Se não conseguiu parsear nada, cria um bloco Html com o conteúdo original
  if (childrenIds.length === 0) {
    const htmlId = 'html-block';
    blocks[htmlId] = {
      type: 'Html',
      data: {
        style: {},
        props: {
          contents: html,
        },
      },
    };
    childrenIds.push(htmlId);
  }

  // Cria o documento completo
  const document: TEditorConfiguration = {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: '#F5F5F5',
        canvasColor: '#FFFFFF',
        textColor: '#262626',
        fontFamily: 'MODERN_SANS',
        childrenIds,
      },
    },
    ...blocks,
  };

  return document;
}
