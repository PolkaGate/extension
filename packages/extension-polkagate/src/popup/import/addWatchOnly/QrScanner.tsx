// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { QrScanSignature } from '@polkadot/react-qr';

import { SlidePopUp } from '../../../components';
import { DraggableModal } from '../../../fullscreen/governance/components/DraggableModal';
import { useTranslation } from '../../../hooks';
import useIsExtensionPopup from '../../../hooks/useIsExtensionPopup';

interface Props {
  openCamera: boolean;
  setOpenCamera: React.Dispatch<React.SetStateAction<boolean>>;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>> | ((newAddr?: string) => void);
}

export default function QrScanner({ openCamera, setAddress, setOpenCamera }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const onClose = useCallback(() => setOpenCamera(false), [setOpenCamera]);

  const _onSignature = useCallback(({ signature }: { signature: string }): void => {
    if (!signature) {
      return;
    }

    let address: string;

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
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt={isExtension ? '46px' : 0} sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }}>
      <Grid container justifyContent='center' mb='20px' mt={isExtension ? '40px' : '10px'}>
        <Typography fontSize='20px' fontWeight={400} sx={{ textAlign: 'center', width: '100%' }}>
          {t('Account ID')}
        </Typography>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      </Grid>
      <Typography fontSize='14px' fontWeight={300} sx={{ textAlign: 'center', width: '100%' }}>
        {t('Scan address QR code')}
      </Typography>
      <Grid sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', borderStyle: 'dashed', m: '10px auto', p: '20px', pb: '15px', width: '92%' }}>
        <QrScanSignature onScan={_onSignature} />
      </Grid>
      <Typography fontSize='14px' fontWeight={300} sx={{ textAlign: 'center', width: '100%' }}>
        {t('Hold the QR code in front of the device’s camera.')}
      </Typography>
      <IconButton
        onClick={onClose}
        sx={{
          left: !isExtension ? undefined : '15px',
          p: 0,
          position: 'absolute',
          right: !isExtension ? '15px' : undefined,
          top: isExtension ? '65px' : '10px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <>
      {!isExtension
        ? <DraggableModal onClose={onClose} open>
          <Grid container position='relative'>
            {page}
          </Grid>
        </DraggableModal>
        : <SlidePopUp show={openCamera}>
          {page}
        </SlidePopUp>
      }
    </>
  );
}
