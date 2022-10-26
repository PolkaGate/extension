// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid,Typography } from '@mui/material';
import QRCode from 'qrcode.react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { ActionContext, Identity } from '../../components';
import { useAccount, useMetadata, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';

interface Props {
  className?: string;
}

export default function Receive({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address } = useParams<{ address: string }>();
  const account = useAccount(address);
  const [formatted, setFormatted] = useState<string | undefined>();
  const chain = useMetadata(account?.genesisHash, true);

  useEffect(() => {
    const publicKey = decodeAddress(address);

    setFormatted(encodeAddress(publicKey, chain?.ss58Format));
  }, [address, chain]);

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Receive')}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        sx={{
          m: '20px auto',
          width: 'fit-content'
        }}
      >
        {t<string>('Scan the QR code with a camera to get the address.')}
      </Typography>
      <Identity
        address={address}
        showChainLogo
        style={{
          m: '20px auto 10px',
          width: '90%'
        }}
      />
      <Grid
        sx={{
          bgcolor: '#fff',
          borderRadius: '5px',
          height: '328px',
          m: 'auto',
          p: '25px',
          width: '92%'
        }}
      >
        <QRCode
          level='H'
          size={275}
          value={formatted}
        />
      </Grid>
      <Typography
        fontSize='10px'
        fontWeight={300}
        sx={{
          m: '20px auto 0',
          width: 'fit-content'
        }}
      >
        {formatted}
      </Typography>
    </>
  );
}
