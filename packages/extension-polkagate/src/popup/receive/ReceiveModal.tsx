// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import QRCode from 'qrcode.react';
import React, { useCallback } from 'react';

import { Identity, PButton } from '../../components';
import { DraggableModal } from '../../fullscreen/governance/components/DraggableModal';
import SimpleModalTitle from '../../fullscreen/partials/SimpleModalTitle';
import { useInfo, useTranslation } from '../../hooks';

interface Props {
  address: string;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function ReceiveModal({ address, setDisplayPopup }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  const { api, formatted } = useInfo(address);

  const backToAccount = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);

  return (
    <DraggableModal onClose={backToAccount} open>
      <>
        <SimpleModalTitle
          icon='vaadin:qrcode'
          onClose={backToAccount}
          title={t('Receive Fund')}
        />
        <Typography fontSize='14px' fontWeight={300} sx={{ m: '20px auto', width: 'fit-content' }}>
          {t('Scan the QR code with a camera to get the address.')}
        </Typography>
        <Identity
          address={address}
          api={api}
          showChainLogo
          style={{
            margin: '20px auto 10px',
            width: '90%'
          }}
        />
        <Grid sx={{ bgcolor: `${theme.palette.background.paper}`, borderRadius: '5px', height: '328px', m: 'auto', p: '25px', width: '92%' }}>
          {formatted &&
            <QRCode
              bgColor={`${theme.palette.background.paper}`}
              fgColor={`${theme.palette.text.primary}`}
              level='H'
              size={275}
              value={formatted}
            />}
        </Grid>
        <Typography fontSize='10px' fontWeight={300} sx={{ m: '20px auto 0', width: 'fit-content' }}>
          {formatted}
        </Typography>
        <Grid container item sx={{ '> button': { m: 'auto', position: 'initial' }, mt: '15px' }}>
          <PButton
            _mt='1px'
            _onClick={backToAccount}
            _width={100}
            text={t('Close')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
