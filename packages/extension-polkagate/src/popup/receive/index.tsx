// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import QRCode from 'qrcode.react';
import React, { useCallback, useContext } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { ActionContext, Identity } from '../../components';
import { useApi, useFormatted, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';

export default function Receive(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const location = useLocation();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const api = useApi(address);

  const _onBackClick = useCallback(() => {
    onAction(location?.state?.pathname ?? '/');
  }, [location?.state?.pathname, onAction]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Receive')}
      />
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
    </>
  );
}
