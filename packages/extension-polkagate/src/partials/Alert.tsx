// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AlertType } from '../util/types';

import { Alert as MuiAlert, Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import { CloseCircle, Danger, InfoCircle, TickCircle } from 'iconsax-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Transition } from 'react-transition-group';

import { useAlerts, useIsExtensionPopup, useTranslation } from '../hooks';
import { TIME_TO_REMOVE_ALERT } from '../util/constants';

const progressAnimation = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

interface Props {
  alert: AlertType;
}

const TRANSITION_DURATION = 250;
const defaultTransitionStyle = {
  opacity: 0,
  transform: 'translateX(100%)',
  transition: `opacity ${TRANSITION_DURATION}ms ease, transform ${TRANSITION_DURATION}ms ease`
};

const transitionStyles = {
  entered: { opacity: 1, transform: 'translateX(0)' },
  entering: { opacity: 1, transform: 'translateX(0)' },
  exited: { opacity: 0, transform: 'translateX(100%)' },
  exiting: { opacity: 0, transform: 'translateX(100%)' },
  unmounted: { opacity: 0, transform: 'translateX(100%)' }
} as const;

function Alert({ alert }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { removeAlert } = useAlerts();
  const isExtension = useIsExtensionPopup();
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeAlert = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (alert.persist) {
      return;
    }

    autoCloseTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, TIME_TO_REMOVE_ALERT);

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [alert.persist]);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    removeTimeoutRef.current = setTimeout(() => {
      removeAlert(alert.id);
    }, TRANSITION_DURATION);

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }

      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
      }
    };
  }, [alert.id, isVisible, removeAlert]);

  const baseStyle = {
    alignItems: 'center',
    border: '2px solid #',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    padding: '2px'
  };

  return (
    <Transition appear in={isVisible} mountOnEnter nodeRef={nodeRef} timeout={TRANSITION_DURATION} unmountOnExit>
      {(state) => (
        <Box ref={nodeRef} sx={{ ...defaultTransitionStyle, ...transitionStyles[state], pointerEvents: 'auto', width: 'fit-content' }}>
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
              transform: 'none',
              width: 'fit-content',
              zIndex: 1
            }}
          >
            <Typography sx={{ display: 'block', textAlign: 'left' }} variant={isExtension ? 'B-1' : 'B-2'}>
              {t(alert.text)}
            </Typography>
            {!alert.persist &&
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
            }
          </MuiAlert>
        </Box>
      )}
    </Transition>
  );
}

export default React.memo(Alert);
