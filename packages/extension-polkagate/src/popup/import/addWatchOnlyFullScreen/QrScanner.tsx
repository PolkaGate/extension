// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { Camera } from 'iconsax-react';
import React, { useCallback } from 'react';

import { GradientButton } from '@polkadot/extension-polkagate/src/components/index';
import { QrScanSignature } from '@polkadot/react-qr';

import { DraggableModal } from '../../../fullscreen/components/DraggableModal';
import { useTranslation } from '../../../hooks';

interface Props {
  setOpenCamera: React.Dispatch<React.SetStateAction<boolean>>;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>> | ((newAddr?: string) => void);
}

export default function QrScanner({ setAddress, setOpenCamera }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const onClose = useCallback(() => setOpenCamera(false), [setOpenCamera]);

  const onScan = useCallback(({ signature }: { signature: string }): void => {
    if (!signature) {
      return;
    }

    let address = '';

    if (signature.includes(':')) {
      const parts = signature.split(':');

      if (parts.length >= 2) {
        address = parts[1];
      }
    } else if (signature.startsWith('0x')) { // NOVA WALLET QR CODE
      address = signature.slice(2);
    }

    setAddress(address ?? signature);
    setOpenCamera(false);
  }, [setAddress, setOpenCamera]);

  const page = (
    <Grid alignItems='flex-start' container display='block' item justifyItems='center' position='relative' sx={{ height: 'parent.innerHeight', zIndex: 1 }}>
      <Typography color='#EAEBF1' sx={{ textAlign: 'center', width: '100%' }} variant='B-1'>
        {t('Scan account QR code')}
      </Typography>
      <QrScanSignature // TODO: consider using ScanAddress component
        onScan={onScan}
        style={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '14px',
          height: '200px',
          margin: '15px auto 5px',
          minHeight: '200Px',
          padding: '3px',
          width: '200px'
        }}
      />
      <Stack alignItems='center' direction='row' justifyContent='center' sx={{ mt: '20px' }}>
        <Typography color='#BEAAD8' sx={{ textAlign: 'left' }} variant='B-1'>
          {t('Hold the QR code in front of the ')}
        </Typography>
        <Camera color='#AA83DC' size={16} style={{ marginLeft: '4px', marginRight: '4px' }} variant='Bold' />
        <Typography color='#AA83DC' variant='B-1'>
          {t('device’s camera')}
        </Typography>
      </Stack>
      <GradientButton
        contentPlacement='center'
        onClick={onClose}
        style={{
          borderRadius: '18px',
          margin: '25px 0 5px',
          width: '92%'
        }}
        text={t('Cancel')}
      />
    </Grid>
  );

  return (
    <DraggableModal
      onClose={onClose}
      open
      style={{ minHeight: '100px' }}
      title={t('Scan account QR code')}>
      {page}
    </DraggableModal>
  );
}
