// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useAccountName, useTranslation } from '../hooks';
import useMetadata from '../hooks/useMetadata';
import { DEFAULT_TYPE } from '../util/defaultType';
import { AccountContext, Checkbox2, Identicon, SettingsContext, ShortAddress } from './';

export interface Props {
  actions?: React.ReactNode;
  address?: string | null;
  children?: React.ReactNode;
  className?: string;
  genesisHash?: string | null;
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
  backgroundColor?: string;
  check?: boolean;
  showCheckbox?: boolean;
  handleCheck?: (event: React.ChangeEvent<HTMLInputElement>, address: string) => void;
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

function Address({ address, backgroundColor, className = '', genesisHash, margin = '20px auto', name, showCopy = true, style, type: givenType, width = '92%', check, showCheckbox, handleCheck }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { accounts } = useContext(AccountContext);
  const accountName = useAccountName(address || '');
  const settings = useContext(SettingsContext);
  const [{ formatted, genesisHash: recodedGenesis, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash || recodedGenesis, true);

  useEffect((): void => {
    if (!address) {
      return setRecoded(defaultRecoded);
    }

    try {
      const account = findAccountByAddress(accounts, address);

      setRecoded(
        (
          chain?.definition.chainType === 'ethereum' ||
          account?.type === 'ethereum' ||
          (!account && givenType === 'ethereum')
        )
          ? { account, formatted: address, type: 'ethereum' }
          : recodeAddress(address, accounts, chain as Chain | null, settings)
      );
    } catch (e) {
      console.error(e);
      setRecoded(defaultRecoded);
    }
  }, [accounts, address, chain, givenType, settings]);

  const theme = (
    type === 'ethereum'
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  return (
    <Grid container className={className} alignItems='center' direction='row' justifyContent='space-between' sx={{ backgroundColor: backgroundColor || 'background.paper', border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', height: '70px', m: { margin }, p: '14px 8px', width: { width }, ...style }}>
      {showCheckbox && handleCheck &&
        <Grid item width='5%'>
          <Checkbox2
            checked={check}
            onChange={(e) => handleCheck(e, address || '')}
          />
        </Grid>
      }
      <Grid item width='40px'>
        <Identicon
          className='identityIcon'
          iconTheme={theme}
          prefix={prefix}
          size={40}
          value={formatted || address}
        />
      </Grid>
      <Grid container direction={'column'} item width={`calc(${showCheckbox ? 95 : 100}% - 40px)`} pl='10px'>
        <Typography fontSize={'16px'} fontWeight={400} maxWidth={`calc(${showCheckbox ? 95 : 100}% - 40px)`} overflow='hidden' variant='h3' whiteSpace='nowrap'>
          {name || accountName || t('<unknown>')}
        </Typography>
        <Grid container direction={'row'} item justifyContent={'space-between'}>
          {(formatted || address)
            ? (
              <ShortAddress
                address={(formatted || address) as string}
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
  );
}

export default (Address);
