// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AlertType } from '../util/types';

import { Alert as MuiAlert, Box, Slide, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import { CloseCircle, Danger, InfoCircle, TickCircle } from 'iconsax-react';
import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';

import { useAlerts, useTranslation } from '../hooks';
import { TIME_TO_REMOVE_ALERT } from '../util/constants';

const progressAnimation = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

interface Props {
  alert: AlertType;
}

function AlertPortal({ children }: { children: React.ReactNode }) {
  const [el, setEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const portalEl = document.getElementById('alert-root');

    setEl(portalEl);
  }, []);

  if (!el) {
    return null;
  }

  return createPortal(children, el);
}

function Alert({ alert }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { removeAlert } = useAlerts();

  const closeAlert = useCallback(() => {
    removeAlert(alert.id);
  }, [alert.id, removeAlert]);

  const baseStyle = {
    alignItems: 'center',
    border: '2px solid #',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    padding: '2px'
  };

  return (
    <AlertPortal>
      <Slide direction='left' in mountOnEnter style={{ zIndex: 9999 }} unmountOnExit>
        <MuiAlert
          action={
            <span onClick={closeAlert} style={{ cursor: 'pointer', fontSize: '26px', fontWeight: 300, transform: 'translateY(-12px)' }}>
              ×
            </span>
          }
          iconMapping={{
            error: <div style={{ background: '#992c60', boxShadow: '0 0 20px 0 #FF165C', ...baseStyle }}>
              <CloseCircle color='#FF165C' size='27' variant='Bold' />
            </div>,
            info: <div style={{ background: '#314f9a', boxShadow: '0 0 20px 0 #3988FF', ...baseStyle }}>
              <InfoCircle color='#3988FF' size='27' variant='Bold' />
            </div>,
            success:
              <div style={{ background: '#517e71', boxShadow: '0 0 20px 0 #82FFA5', ...baseStyle }}>
                <TickCircle color='#82FFA5' size='27' variant='Bold' />
              </div>,
            warning: (
              <div style={{ boxShadow: 'inset 0 0 20px 12px rgba(255, 206, 79, 0.3), 0 0 19px 4px rgba(255, 206, 79, 0.6)', ...baseStyle }}>
                <Danger color='#FFCE4F' size='27' variant='Bold' />
              </div>
            )
          }}
          onClose={closeAlert}
          severity={alert.severity}
          sx={{
            alignItems: 'center',
            bgcolor: '#2D1E4A',
            borderRadius: '12px',
            padding: '4px 16px',
            position: 'fixed',
            right: '20px',
            top: '20px',
            transform: 'none',
            width: 'fit-content',
            zIndex: 99999
          }}
        >
          <Typography variant='B-2'>
            {t(alert.text)}
          </Typography>
          <Box
            sx={{
              backgroundColor: 'transparent',
              borderBottomLeftRadius: '14px',
              borderBottomRightRadius: '14px',
              bottom: '1px',
              height: '3px',
              left: '4px',
              overflow: 'hidden',
              position: 'absolute',
              width: '96%'
            }}
          >
            <Box
              sx={{
                animation: `${progressAnimation} ${(TIME_TO_REMOVE_ALERT / 1000) - 1}s linear`,
                backgroundColor: '#EAEBF1',
                height: '100%',
                width: '100%'
              }}
            />
          </Box>
        </MuiAlert>
      </Slide>
    </AlertPortal>
  );
}

export default React.memo(Alert);
