import React, { useEffect } from 'react';

import { Reader, renderToStaticMarkup } from '@usewaypoint/email-builder';
import { Box, Stack, SxProps, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { MonitorOutlined, PhoneIphoneOutlined } from '@mui/icons-material';

import EditorBlock from '../../documents/editor/EditorBlock';
import {
  resetDocument,
  setSelectedScreenSize,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '../../documents/editor/EditorContext';
import { TEditorConfiguration } from '../../documents/editor/core';
import ToggleInspectorPanelButton from '../InspectorDrawer/ToggleInspectorPanelButton';

import HtmlPanel from './HtmlPanel';
import JsonPanel from './JsonPanel';
import MainTabsGroup from './MainTabsGroup';
import ShareButton from './ShareButton';

export default function TemplatePanel() {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();

  // Envia o HTML para o parent quando o documento mudar
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      const html = renderToStaticMarkup(document, { rootBlockId: 'root' });
      window.parent.postMessage({ type: 'EMAIL_HTML', html }, '*');
    }
  }, [document]);

  // Recebe mensagens do parent para carregar documentos
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Por segurança, valide o origin em produção:
      // if (event.origin !== 'https://seu-dominio.com') return;

      if (event.data.type === 'LOAD_EMAIL_HTML') {
        // Recebe HTML do parent e cria um documento com bloco Html
        try {
          if (event.data.html) {
            const htmlDocument: TEditorConfiguration = {
              root: {
                type: 'EmailLayout',
                data: {
                  backdropColor: '#F5F5F5',
                  canvasColor: '#FFFFFF',
                  textColor: '#262626',
                  fontFamily: 'MODERN_SANS',
                  childrenIds: ['html-block'],
                },
              },
              'html-block': {
                type: 'Html',
                data: {
                  style: {},
                  props: {
                    contents: event.data.html,
                  },
                },
              },
            };
            resetDocument(htmlDocument);
          }
        } catch (error) {
          console.error('Erro ao carregar HTML:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  let mainBoxSx: SxProps = {
    height: '100%',
  };
  if (selectedScreenSize === 'mobile') {
    mainBoxSx = {
      ...mainBoxSx,
      margin: '32px auto',
      width: 370,
      height: 800,
      boxShadow:
        'rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px',
    };
  }

  const handleScreenSizeChange = (_: unknown, value: unknown) => {
    switch (value) {
      case 'mobile':
      case 'desktop':
        setSelectedScreenSize(value);
        return;
      default:
        setSelectedScreenSize('desktop');
    }
  };

  const renderMainPanel = () => {
    switch (selectedMainTab) {
      case 'editor':
        return (
          <Box sx={mainBoxSx}>
            <EditorBlock id="root" />
          </Box>
        );
      case 'preview':
        return (
          <Box sx={mainBoxSx}>
            <Reader document={document} rootBlockId="root" />
          </Box>
        );
      case 'html':
        return <HtmlPanel />;
      case 'json':
        return <JsonPanel />;
    }
  };

  return (
    <>
      <Stack
        sx={{
          height: 49,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          px: 1,
        }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* <ToggleSamplesPanelButton /> */}
        <Stack px={2} direction="row" gap={2} width="100%" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <MainTabsGroup />
          </Stack>
          <Stack direction="row" spacing={2}>
            {/* <DownloadJson />
            <ImportJson /> */}
            <ToggleButtonGroup value={selectedScreenSize} exclusive size="small" onChange={handleScreenSizeChange}>
              <ToggleButton value="desktop">
                <Tooltip title="Visualização desktop">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Visualização móvel">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <ShareButton />
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      <Box sx={{ height: 'calc(100vh - 49px)', overflow: 'auto', minWidth: 370 }}>{renderMainPanel()}</Box>
    </>
  );
}
