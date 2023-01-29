// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { QrScanSignature } from '@polkadot/react-qr';

import { SlidePopUp } from '../../../components';
import { useTranslation } from '../../../hooks';

interface Props {
  openCamera: boolean;
  setOpenCamera: React.Dispatch<React.SetStateAction<boolean>>;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function QrScanner({ openCamera, setAddress, setOpenCamera }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const onClose = useCallback(() => setOpenCamera(false), [setOpenCamera]);

  const _onSignature = useCallback(({ signature }: { signature: string }): void => {
    if (!signature) {
      return;
    }

    const firstColon = signature.indexOf(':');
    const secondColon = signature.indexOf(':', firstColon + 1);
    const address = signature.substring(firstColon + 1, secondColon);

    setAddress(address);
    setOpenCamera(false);
  }, [setAddress, setOpenCamera]);

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }}>
      <Grid container justifyContent='center' mb='20px' mt='40px'>
        <Typography fontSize='20px' fontWeight={400} sx={{ width: '100%', textAlign: 'center' }}>
          {t<string>('Account ID')}
        </Typography>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      </Grid>
      <Typography fontSize='14px' fontWeight={300} sx={{ width: '100%', textAlign: 'center' }}>
        {t<string>('Scan address QR code')}
      </Typography>
      <Grid sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', borderStyle: 'dashed', m: '10px auto', p: '20px', pb: '15px', width: '92%' }}>
        <QrScanSignature onScan={_onSignature} />
      </Grid>
      <Typography fontSize='14px' fontWeight={300} sx={{ width: '100%', textAlign: 'center' }}>
        {t<string>('Hold the QR code infront of the device’s camera.')}
      </Typography>
      <IconButton
        onClick={onClose}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <SlidePopUp show={openCamera}>
      {page}
    </SlidePopUp>
  );
}
