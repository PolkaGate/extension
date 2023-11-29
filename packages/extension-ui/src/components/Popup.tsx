// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import { Container, Modal, Typography, useTheme } from '@mui/material';
import React from 'react';
import ReactDom from 'react-dom';
import styled from 'styled-components';

export interface Props {
  children: React.ReactNode;
  handleClose?: () => void;
  show: boolean;
  id?: string;
}

function Popup({ children, handleClose, id, show }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  
  return ReactDom.createPortal(
    <Modal
      disablePortal
      // eslint-disable-next-line react/jsx-no-bind
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') { handleClose && handleClose(); }
      }}
      open={show}
    >
      <div style={{
        backgroundColor: `${theme.palette.background.default}`,
        display: 'flex',
        height: '100%',
        position: 'relative',
        // top: '5px',
        transform: `translateX(${(window.innerWidth - 357) / 2}px)`,
        width: '357px'
      }}
      >
        <Container
          disableGutters
          id={id}
          maxWidth='md'
        >
          <Typography>
            {children}
          </Typography>
        </Container>
      </div>
    </Modal>
    , document.getElementById('root')
  );
}

export default styled(Popup)(() => `
  box-sizing: border-box;
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
`);
