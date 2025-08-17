// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { LoaderGif, Motion } from '../components';
import { DraggableModal } from '../fullscreen/components/DraggableModal';
import { useIsExtensionPopup, useTranslation } from '../hooks';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';

interface Props{
  isModal?: boolean;
  setFlowStep?: React.Dispatch<React.SetStateAction<TransactionFlowStep>>;
}

function WaitScreen2 ({ isModal, setFlowStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const [text, setText] = useState<string>(t('We are working on your transaction.'));

  const handleTxEvent = useCallback((s: CustomEventInit<unknown>) => {
    const event = s.detail;

    if (event) {
      const state = Object.keys(event)[0];

      switch (state) {
        case ('ready'):
          setText(t('The transaction is ready.'));
          break;
        case ('broadcast'):
          setText(t('The transaction is sent.'));
          break;
        case ('inBlock'):
          setText(t('The transaction is now in Blockchain.'));
          break;
        default:
          setText(t(`The transaction is in ${state} state`));
      }
    }
  }, [t]);

  useEffect(() => {
    window.addEventListener('transactionState', handleTxEvent);
  }, [handleTxEvent]);

  const onClose = useCallback(() => {
    setFlowStep && setFlowStep(TRANSACTION_FLOW_STEPS.CONFIRMATION);
  }, [setFlowStep]);

  const Content = () => (
    <Stack direction='column' sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : 'transparent', borderRadius: '14px', gap: '12px', justifyContent: 'center', m: '15px', p: '32px' }}>
      <LoaderGif />
      <Typography color='text.primary' variant='B-3'>
        {text}
      </Typography>
      <Typography color={isExtension ? 'text.highlight' : '#AA83DC'} pt='6px' variant='B-1' width='80%'>
        {t('Please wait a few seconds and don’t close the {{container}}', { replace: { container: isExtension ? t('extension') : t('window') } })}
      </Typography>
    </Stack>
  );

  return (
    <>
      {isModal
        ? (
          <DraggableModal
            onClose={onClose}
            open={true}
            style={{ minHeight: '300px' }}
            title={t('Processing')}
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

export default React.memo(WaitScreen2);
