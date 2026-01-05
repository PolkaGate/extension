// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import { Copy } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { noop } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useAccountName, useIsDark, useTranslation } from '../hooks';
import useMetadata from '../hooks/useMetadata';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { DEFAULT_TYPE } from '../util/defaultType';
import { AccountContext, ActionButton, GlowCheckbox, SettingsContext, ShortAddress } from './';

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
  handleCheck?: (checked: boolean, address: string) => void
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

function Address({ address, backgroundColor, check, genesisHash, handleCheck, margin = '20px auto', name, showCheckbox, showCopy = true, style, type: givenType, width = '92%' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const { accounts } = useContext(AccountContext);
  const accountName = useAccountName(address || '');
  const settings = useContext(SettingsContext);
  const [{ formatted, genesisHash: recodedGenesis }, setRecoded] = useState<Recoded>(defaultRecoded);
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

  const _address = formatted || address;

  const _handleCheck = useCallback((checked: boolean) => {
    handleCheck && handleCheck(checked, address || '');
  }, [address, handleCheck]);

  return (
    <Grid alignItems='center' container direction='row' justifyContent='space-between' sx={{ backgroundColor: backgroundColor || '#1B133CB2', border: '0.5px solid', borderColor: '#BEAAD833', borderRadius: '12px', height: '56px', m: { margin }, px: '8px', width: { width }, ...style }}>
      {showCheckbox && handleCheck &&
        <Grid item width='5%'>
          <GlowCheckbox
            changeState={_handleCheck}
            checked={check}
            style={{ justifyContent: 'start' }}
          />
        </Grid>
      }
      <Grid item width='42px'>
        {_address &&
          <PolkaGateIdenticon
            address={_address}
            size={36}
          />}
      </Grid>
      <Grid alignItems='center' container direction='row' item justifyContent='space-between' pl='8px' width={`calc(${showCheckbox ? 95 : 100}% - 42px)`}>
        <Stack direction='column' width='inherit'>
          <Typography maxWidth={`calc(${showCheckbox ? 95 : 100}% - 40px)`} overflow='hidden' textAlign='left' variant='B-2' whiteSpace='nowrap'>
            {name || accountName || t('<unknown>')}
          </Typography>
          {_address &&
            <ShortAddress
              address={_address}
              clipped
              style={{
                color: '#BEAAD8',
                justifyContent: 'space-between',
                width: '100%'
              }}
              variant='B-4'
            />
          }
        </Stack>
        {showCopy &&
          <CopyToClipboard text={String(address)}>
            <ActionButton
              StartIcon={Copy}
              contentPlacement='start'
              iconSize={16}
              iconVariant='Bulk'
              iconVariantOnHover='Bold'
              onClick={noop}
              style={{
                '& .MuiButton-startIcon': {
                  marginLeft: '9px',
                  marginRight: '0px'
                },
                '&:hover': {
                  background: isDark ? '#674394' : '#EFF1F9',
                  transition: 'all 250ms ease-out'
                },
                background: isDark ? '#BFA1FF26' : '#FFFFFF',
                borderRadius: '10px',
                height: '36px',
                minWidth: '0px',
                padding: 0,
                width: '36px'
              }}
              variant='contained'
            />
          </CopyToClipboard>}
      </Grid>
    </Grid>
  );
}

export default (Address);
