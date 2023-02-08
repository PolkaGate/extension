// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useAccount, useAccountName, useTranslation } from '../hooks';
import useMetadata from '../hooks/useMetadata';
import { DEFAULT_TYPE } from '../util/defaultType';
import { Identicon, SettingsContext, ShortAddress } from '.';

interface Props {
  address?: string | null;
  className?: string;
  genesisHash?: string | null;
  name?: string | null;
  type?: KeypairType;
  style?: SxProps<Theme> | undefined;
  showCopy?: boolean;
  width?: string;
  margin?: string;
}

interface Recoded {
  account: AccountJson | undefined | null;
  formatted: string | null;
  genesisHash?: string | null;
  prefix?: number;
  type: KeypairType;
}

// recodes an supplied address using the prefix/genesisHash, include the actual saved account & chain
function recodeAddress(address: string, account: AccountJson | null | undefined, chain: Chain | null, settings: SettingsStruct): Recoded {
  // decode and create a shortcut for the encoded address
  const publicKey = decodeAddress(address);

  const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

  // always allow the actual settings to override the display
  return {
    account,
    formatted: account?.type === 'ethereum'
      ? address
      : encodeAddress(publicKey, prefix),
    genesisHash: account?.genesisHash,
    prefix,
    type: account?.type || DEFAULT_TYPE
  };
}

const defaultRecoded = { account: null, formatted: null, prefix: 42, type: DEFAULT_TYPE };

export default function Address ({ address, className, genesisHash, margin = '20px auto', name, showCopy = true, style, type: givenType, width = '92%' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const account = useAccount(address);

  const accountName = useAccountName(address);
  const settings = useContext(SettingsContext);
  const [{ formatted, genesisHash: recodedGenesis, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash || recodedGenesis, true);

  useEffect((): void => {
    if (!address) {
      return setRecoded(defaultRecoded);
    }

    setRecoded((chain?.definition.chainType === 'ethereum' || account?.type === 'ethereum' || (!account && givenType === 'ethereum'))
      ? { account, formatted: address, type: 'ethereum' }
      : recodeAddress(address, account, chain, settings));
  }, [account, address, chain, givenType, settings]);

  const theme = (type === 'ethereum' ? 'ethereum' : (chain?.icon || 'polkadot')) as IconTheme;

  return (
    <>
      <Grid className={className} container direction='row' justifyContent='space-between' sx={{ backgroundColor: 'background.paper', border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', height: '70px', m: { margin }, p: '14px 8px', width: { width }, ...style }}>
        <Grid item width='40px'>
          <Identicon
            className='identityIcon'
            iconTheme={theme}
            prefix={prefix}
            size={40}
            value={formatted || address}
          />
        </Grid>
        <Grid container direction='column' item width='calc(95% - 40px)'>
          <Typography fontSize={'16px'} fontWeight={400} maxWidth='95%' overflow='hidden' variant='h3' whiteSpace='nowrap'>
            {name || accountName || t('<unknown>')}
          </Typography>
          <Grid container direction={'row'} item justifyContent={'space-between'}>
            {(formatted || address)
              ? (
                <ShortAddress
                  address={formatted || address}
                  clipped
                  showCopy={showCopy}
                  style={{
                    fontSize: '10px',
                    fontWeight: 300,
                    justifyContent: 'space-between',
                    lineHeight: '23px'
                  }}
                />)
              : (
                <Typography fontSize={'10px'} fontWeight={300} variant='h3' whiteSpace='nowrap'>
                  {t('<unknown>')}
                </Typography>)
            }
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
