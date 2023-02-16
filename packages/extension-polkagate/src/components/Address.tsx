// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useAccountName, useTranslation } from '../hooks';
import useMetadata from '../hooks/useMetadata';
import { DEFAULT_TYPE } from '../util/defaultType';
import { AccountContext, Identicon, SettingsContext, ShortAddress } from './';

export interface Props {
  actions?: React.ReactNode;
  address?: string | null;
  children?: React.ReactNode;
  className?: string;
  genesisHash?: string | null;
  isHardware?: boolean | null;
  isHidden?: boolean;
  name?: string | null;
  parentName?: string | null;
  suri?: string;
  toggleActions?: number;
  type?: KeypairType;
  style?: SxProps<Theme> | undefined;
  showCopy?: boolean;
  width?: string;
  margin?: string;
}

interface Recoded {
  account: AccountJson | null;
  formatted: string | null;
  genesisHash?: string | null;
  prefix?: number;
  type: KeypairType;
}

// find an account in our list
function findSubstrateAccount(accounts: AccountJson[], publicKey: Uint8Array): AccountJson | null {
  const pkStr = publicKey.toString();

  return accounts.find(({ address }): boolean =>
    decodeAddress(address).toString() === pkStr
  ) || null;
}

// find an account in our list
function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | null {
  return accounts.find(({ address }): boolean =>
    address === _address
  ) || null;
}

// recodes an supplied address using the prefix/genesisHash, include the actual saved account & chain
function recodeAddress(address: string, accounts: AccountWithChildren[], chain: Chain | null, settings: SettingsStruct): Recoded {
  // decode and create a shortcut for the encoded address
  const publicKey = decodeAddress(address);

  // find our account using the actual publicKey, and then find the associated chain
  const account = findSubstrateAccount(accounts, publicKey);
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

function Address({ address, className, genesisHash, isHardware, margin = '20px auto', name, width = '92%', showCopy = true, style, type: givenType }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const accountName = useAccountName(address);
  const settings = useContext(SettingsContext);
  const [{ formatted, genesisHash: recodedGenesis, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash || recodedGenesis, true);

  useEffect((): void => {
    if (!address) {
      return setRecoded(defaultRecoded);
    }

    const account = findAccountByAddress(accounts, address);

    setRecoded(
      (
        chain?.definition.chainType === 'ethereum' ||
        account?.type === 'ethereum' ||
        (!account && givenType === 'ethereum')
      )
        ? { account, formatted: address, type: 'ethereum' }
        : recodeAddress(address, accounts, chain, settings)
    );
  }, [accounts, address, chain, givenType, settings]);

  const theme = (
    type === 'ethereum'
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  return (
    <>
      <Grid
        className={className}
        container
        direction={'row'}
        justifyContent={'space-between'}
        sx={{
          backgroundColor: 'background.paper',
          border: '0.5px solid',
          borderColor: 'secondary.light',
          borderRadius: '5px',
          height: '70px',
          m: { margin },
          p: '14px 8px',
          width: { width },
          ...style
        }}
      >
        <Grid
          item
          width='40px'
        >
          <Identicon
            className='identityIcon'
            iconTheme={theme}
            // onCopy={_onCopy}
            prefix={prefix}
            size={40}
            value={formatted || address}
          />
        </Grid>
        <Grid
          container
          direction={'column'}
          item
          width='calc(95% - 40px)'
        >
          <Typography
            fontSize={'16px'}
            fontWeight={400}
            maxWidth='95%'
            overflow='hidden'
            variant='h3'
            whiteSpace='nowrap'
          >
            {name || accountName || t('<unknown>')}
          </Typography>
          <Grid
            container
            direction={'row'}
            item
            justifyContent={'space-between'}
          >
            {(formatted || address)
              ? (
                <ShortAddress
                  address={formatted || address}
                  style={{
                    fontSize: '10px',
                    fontWeight: 300,
                    justifyContent: 'space-between',
                    lineHeight: '23px'
                  }}
                  clipped
                  showCopy={showCopy}
                />)
              : (
                <Typography
                  fontSize={'10px'}
                  fontWeight={300}
                  variant='h3'
                  whiteSpace='nowrap'
                >
                  {t('<unknown>')}
                </Typography>)
            }
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default (Address);
