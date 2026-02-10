import { TEditorConfiguration } from '../../documents/editor/core';

/**
 * Salva tanto o HTML quanto os dados dos blocos em formato compacto
 * para reconstrução perfeita ao reabrir
 */
export interface EmailTemplateData {
  html: string;
  blocks: TEditorConfiguration;
}

/**
 * Converte documento em HTML com metadados embutidos
 * Os metadados permitem reconstruir os blocos originais perfeitamente
 */
export function embedBlocksInHtml(html: string, document: TEditorConfiguration): string {
  // Compacta e serializa a estrutura de blocos
  const blocksMetadata = JSON.stringify(document);
  
  // Adiciona metadados como comentário HTML invisível no início
  const htmlWithMetadata = `<!-- EMAIL_BUILDER_DATA:${btoa(blocksMetadata)} -->
${html}`;
  
  return htmlWithMetadata;
}

/**
 * Extrai metadados de blocos embutidos no HTML
 * Retorna o documento original ou null se não houver metadados
 */
export function extractBlocksFromHtml(html: string): TEditorConfiguration | null {
  // Procura pelo comentário com metadados
  const metadataMatch = html.match(/<!-- EMAIL_BUILDER_DATA:([^-]+) -->/);
  
  if (!metadataMatch) {
    return null; // HTML não tem metadados, foi criado externamente
  }
  
  try {
    const base64Data = metadataMatch[1];
    const jsonData = atob(base64Data);
    const document = JSON.parse(jsonData) as TEditorConfiguration;
    return document;
  } catch (error) {
    console.error('Erro ao extrair metadados dos blocos:', error);
    return null;
  }
}

/**
 * Remove os metadados do HTML antes de enviar email
 * (opcional, se quiser HTML limpo para envio)
 */
export function cleanHtmlMetadata(html: string): string {
  return html.replace(/<!-- EMAIL_BUILDER_DATA:[^-]+ -->\n?/, '');
}
