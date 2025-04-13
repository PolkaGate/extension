// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Stack, Typography } from '@mui/material';
import { Camera } from 'iconsax-react';
import React, { useCallback } from 'react';

import { QrScanSignature } from '@polkadot/react-qr';

import { DraggableModal } from '../../../fullscreen/governance/components/DraggableModal';
import { useTranslation } from '../../../hooks';

interface Props {
  setOpenCamera: React.Dispatch<React.SetStateAction<boolean>>;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>> | ((newAddr?: string) => void);
}

export default function QrScanner({ setAddress, setOpenCamera }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const onClose = useCallback(() => setOpenCamera(false), [setOpenCamera]);

  const _onSignature = useCallback(({ signature }: { signature: string }): void => {
    if (!signature) {
      return;
    }

    let address = '';

    if (signature.includes(':')) {
      const firstColon = signature.indexOf(':');
      const secondColon = signature.indexOf(':', firstColon + 1);

      address = signature.substring(firstColon + 1, secondColon);
    } else if (signature.startsWith('0x')) { // NOVA WALLET QR CODE
      address = signature.slice(2);
    }

    setAddress(address ?? signature);
    setOpenCamera(false);
  }, [setAddress, setOpenCamera]);

  const page = (
    <Grid alignItems='flex-start' container display='block' item position='relative' sx={{ height: 'parent.innerHeight' }}>
      <Typography color='#EAEBF1' sx={{ textAlign: 'center', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
        {t('Account ID')}
      </Typography>
      <Divider sx={{ bgcolor: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', justifySelf: 'center', m: '5px 0 15px', width: '90%' }} />
      <Typography color='#EAEBF1' sx={{ textAlign: 'center', width: '100%' }} variant='B-1'>
        {t('Scan address QR code')}
      </Typography>
      <QrScanSignature
        onScan={_onSignature}
        style={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '14px',
          height: 'fit-content',
          margin: '15px auto 5px',
          minHeight: '200Px',
          padding: '3px',
          width: '272px'
        }}
      />
      <Stack alignItems='center' direction='row' justifyContent='center'>
        <Typography color='#BEAAD8' sx={{ textAlign: 'left' }} variant='B-1'>
          {t('Hold the QR code in front of your ')}
        </Typography>
        <Camera color='#AA83DC' size={16} style={{ marginLeft: '4px', marginRight: '4px' }} variant='Bold' />
        <Typography color='#AA83DC' variant='B-1'>
          {t('device’s camera')}
        </Typography>
      </Stack>
    </Grid>
  );

  return (
    <DraggableModal onClose={onClose} open style={{ minHeight: '100px' }}>
      {page}
    </DraggableModal>
  );
}
