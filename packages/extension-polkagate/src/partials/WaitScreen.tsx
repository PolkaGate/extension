// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Stack, Typography, useTheme } from '@mui/material';
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

function WaitScreen ({ isModal }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const theme = useTheme();

  const [text, setText] = useState({ title: t('We are working on your transaction.'), inColor: t('working') });

  const handleTxEvent = useCallback((s: CustomEventInit<unknown>) => {
    const { detail } = s;

    if (detail) {
      const state = detail as string;

      switch (state.toLowerCase()) {
        case ('ready'):
          setText({ title: t('The transaction is ready.'), inColor: t('ready') });
          break;
        case ('broadcast'):
          setText({ title: t('The transaction has been sent.'), inColor: t('sent') });
          break;
        case ('inblock'):
          setText({ title: t('The transaction is now on-chain.'), inColor: t('on-chain') });
          break;
        default:
          setText({ title: t(`The transaction is in ${state} state`), inColor: t(`${state}`) });
      }
    }
  }, [t]);

  useEffect(() => {
    window.addEventListener('transactionState', handleTxEvent);
  }, [handleTxEvent]);

  const color = isExtension ? theme.palette.text.highlight : theme.palette.primary.main;

  const Content = () => (
    <Stack direction='column' sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : 'transparent', borderRadius: '14px', gap: '12px', justifyContent: 'center', m: '0 15px 15px', p: '0 32px 32px' }}>
      <DotLottieReact autoplay loop src={sendingLottie} style={{ height: 'auto', width: '300px' }} />
      <Typography color='text.primary' variant='B-3'>
        <TwoToneText
          color={color}
          text={text.title}
          textPartInColor={text?.inColor}
        />
      </Typography>
      <Typography color={color} pt='6px' variant='B-1' width='80%'>
        {t('Please wait a few seconds and don’t close the {{container}}', { replace: { container: isExtension ? t('extension') : t('window') } })}
      </Typography>
    </Stack>
  );

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
            <Content />
          </DraggableModal>)
        : <Motion variant='slide'>
          <Content />
        </Motion>
      }
    </>
  );
}

export default React.memo(WaitScreen);
