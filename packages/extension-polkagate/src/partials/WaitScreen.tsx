// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DotLottie } from '@lottiefiles/dotlottie-react';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Fade, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { noop } from '@polkadot/util';

import { sendingLottie } from '../assets/animations';
import { Motion, TwoToneText } from '../components';
import { DraggableModal } from '../fullscreen/components/DraggableModal';
import { useIsExtensionPopup, useTranslation } from '../hooks';
import { PROCESSING_TITLE } from '../util/constants';

interface Props {
  isModal?: boolean;
}

function Content ({ isModal }: Props) {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const theme = useTheme();

  const [text, setText] = useState({ highlightText: t('working'), title: t('We are working on your transaction.') });
  const [lottiePlay, setLottiePlay] = useState(false);
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

  const color = isExtension ? theme.palette.text.highlight : theme.palette.primary.main;

  const onAnimationComplete = useCallback(() => {
    setLottiePlay(true);
  }, []);

  useEffect(() => {
  if (lottiePlay && dotLottie) {
    dotLottie.play();
  }
  }, [dotLottie, lottiePlay]);

  const handleTxEvent = useCallback((s: CustomEventInit<unknown>) => {
    const { detail } = s;

    if (detail) {
      const state = detail as string;

      switch (state.toLowerCase()) {
        case ('ready'):
          setText({ highlightText: t('ready'), title: t('The transaction is ready.') });
          break;
        case ('broadcast'):
          setText({ highlightText: t('sent'), title: t('The transaction has been sent.') });
          break;
        case ('inblock'):
          setText({ highlightText: t('on-chain'), title: t('The transaction is now on-chain.') });
          break;
        default:
          setText({ highlightText: t(`${state}`), title: t(`The transaction is in ${state} state`) });
      }
    }
  }, [t]);

  useEffect(() => {
    window.addEventListener('transactionState', handleTxEvent);
  }, [handleTxEvent]);

  return (
    <Motion
      onAnimationComplete={onAnimationComplete}
      variant={isModal ? undefined : 'slide'}
    >
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : 'transparent', borderRadius: '14px', gap: '12px', justifyContent: 'center', m: '0 15px 15px', p: '0 32px 32px' }}>
        <DotLottieReact
          autoplay={false}
          dotLottieRefCallback={setDotLottie}
          loop
          src={sendingLottie}
          style={{ height: 'auto', width: '300px' }}
        />
        <Fade in={true} timeout={1000}>
          <Typography color='text.primary' variant='B-3'>
            <TwoToneText
              color={color}
              text={text.title}
              textPartInColor={text?.highlightText}
            />
          </Typography>
        </Fade>
        <Typography color={color} pt='6px' variant='B-1' width='80%'>
          {t('Please wait a few seconds and don’t close the {{container}}', { replace: { container: isExtension ? t('extension') : t('window') } })}
        </Typography>
      </Stack>
    </Motion>
  );
}

function WaitScreen ({ isModal }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      {isModal
        ? (
          <DraggableModal
            noCloseButton
            onClose={noop}
            open={true}
            style={{ minHeight: '300px' }}
            title={t(PROCESSING_TITLE)}
          >
            <Content isModal />
          </DraggableModal>)
        : <Content />
      }
    </>
  );
}

export default React.memo(WaitScreen);
