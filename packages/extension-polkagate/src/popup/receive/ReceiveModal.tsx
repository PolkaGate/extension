// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import QRCode from 'qrcode.react';
import React, { useCallback } from 'react';

import { Identity, PButton } from '../../components';
import { useApi, useFormatted, useTranslation } from '../../hooks';
import { DraggableModal } from '../governance/components/DraggableModal';

interface Props {
  address: string;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function ReceiveModal({ address, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const api = useApi(address);
  const theme = useTheme();

  const backToAccount = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);

  return (
    <DraggableModal onClose={backToAccount} open>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t<string>('Receive Fund')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={backToAccount} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Typography fontSize='14px' fontWeight={300} sx={{ m: '20px auto', width: 'fit-content' }}>
          {t<string>('Scan the QR code with a camera to get the address.')}
        </Typography>
        <Identity
          address={address}
          api={api}
          showChainLogo
          style={{
            m: '20px auto 10px',
            width: '90%'
          }}
        />
        <Grid sx={{ bgcolor: '#fff', borderRadius: '5px', height: '328px', m: 'auto', p: '25px', width: '92%' }}>
          <QRCode
            level='H'
            size={275}
            value={formatted}
          />
        </Grid>
        <Typography fontSize='10px' fontWeight={300} sx={{ m: '20px auto 0', width: 'fit-content' }}>
          {formatted}
        </Typography>
        <Grid container item sx={{ '> button': { m: 'auto', position: 'initial' }, mt: '15px' }}>
          <PButton
            _mt='1px'
            _onClick={backToAccount}
            _width={100}
            text={t<string>('Close')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
