// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Chain } from '@polkadot/extension-chains/types';


import { AccountContext, AddressInput, InputWithLabel, PButton, Select, Warning } from '../../components';
import { useAccountDisplay, useFormatted, useIdentity, useTranslation } from '../../hooks';
import { CHAIN_PROXY_TYPES } from '../../util/constants';
import getAllAddresses from '../../util/getAllAddresses';
import type { Proxy, ProxyItem } from '../../util/types';
import { sanitizeChainName } from '../../util/utils';
import ShowIdentity from './partials/ShowIdentity';

interface Props {
  address: string;
  showAddProxy: boolean;
  setShowAddProxy: React.Dispatch<React.SetStateAction<boolean>>;
  chain: Chain;
  proxyItems: ProxyItem[];
  setProxyItems: React.Dispatch<React.SetStateAction<ProxyItem[] | undefined>>;
  onChange: () => void;
}

interface DropdownOption {
  text: string;
  value: string;
}

const isEqualProxy = (a: Proxy, b: Proxy) => {
  return a.delay === b.delay && a.delegate === b.delegate && a.proxyType === b.proxyType;
};

export default function AddProxy({ address, chain, onChange, proxyItems, setProxyItems, setShowAddProxy, showAddProxy }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const { hierarchy } = useContext(AccountContext);
  const formatted = useFormatted(address);
  const accountDisplayName = useAccountDisplay(formatted);

  const [realAddress, setRealAddress] = useState<string | null | undefined>();
  const [selectedProxyType, setSelectedProxyType] = useState<string | null>('Any');
  const [delay, setDelay] = useState<number>(0);
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(true);

  const proxyAccountIdentity = useIdentity(chain.genesisHash, realAddress as string);

  const myselfAsProxy = useMemo(() => formatted === realAddress, [formatted, realAddress]);
  const possibleProxy = useMemo(() => ({ delay, delegate: realAddress, proxyType: selectedProxyType }) as Proxy, [delay, realAddress, selectedProxyType]);
  const alreadyExisting = useMemo(() => !!(proxyItems?.find((item) => isEqualProxy(item.proxy, possibleProxy))), [possibleProxy, proxyItems]);

  const chainName = sanitizeChainName(chain?.name);
  const proxyTypeIndex = chainName?.toLowerCase()?.includes('assethub') ? 'AssetHubs' : chainName;
  const PROXY_TYPE = CHAIN_PROXY_TYPES[proxyTypeIndex as keyof typeof CHAIN_PROXY_TYPES];

  const proxyTypeOptions = PROXY_TYPE.map((type: string): DropdownOption => ({
    text: type,
    value: type
  }));

  const allAddresses = getAllAddresses(hierarchy, true, true, chain.ss58Format, address);

  const _addProxy = useCallback(() => {
    const proxy = { delay, delegate: realAddress, proxyType: selectedProxyType } as Proxy;

    setProxyItems([{ proxy, status: 'new' }, ...proxyItems]);
    setShowAddProxy(!showAddProxy);
    onChange();
  }, [delay, onChange, proxyItems, realAddress, selectedProxyType, setProxyItems, setShowAddProxy, showAddProxy]);

  const _selectProxyType = useCallback((type: string | number): void => {
    setSelectedProxyType(type as string);
  }, []);

  const _selectDelay = useCallback((value: string): void => {
    const nDelay = value ? parseInt(value.replace(/\D+/g, ''), 10) : 0;

    setDelay(nDelay);
  }, []);

  useEffect(() => {
    if (!realAddress || !selectedProxyType || myselfAsProxy) {
      setAddButtonDisabled(true);

      return;
    }

    if (alreadyExisting) {
      setAddButtonDisabled(true);

      return;
    }

    setAddButtonDisabled(false);
  }, [alreadyExisting, myselfAsProxy, realAddress, selectedProxyType]);

  return (
    <>
      <Typography fontSize='14px' fontWeight={300} m='20px auto 15px' textAlign='left' width='90%'>
        {t("You can add an account included in this extension as a proxy of {{accountDisplayName}} to sign certain types of transactions on {{accountDisplayName}}'s behalf.", { replace: { accountDisplayName } })}
      </Typography>
      <AddressInput
        address={realAddress as string}
        allAddresses={allAddresses}
        chain={chain as any}
        helperText={t('The account address which will be a proxy account')}
        label='Account ID'
        setAddress={setRealAddress}
        showIdenticon
        style={{
          m: '12px auto',
          width: '92%'
        }}
      />
      <Grid sx={{ m: 'auto', width: '92%' }}>
        <Select
          defaultValue={proxyTypeOptions[0].value}
          helperText={t('The permissions allowed for this proxy account')}
          label={t('Proxy type')}
          onChange={_selectProxyType}
          options={proxyTypeOptions}
          value={selectedProxyType || proxyTypeOptions[0].value}
        />
      </Grid>
      <Grid alignItems='end' container sx={{ m: '15px auto', width: '92%' }}>
        <Grid item xs={4}>
          <InputWithLabel
            helperText={t('The announcement period required of the initial proxy. Generally will be zero.')}
            label={t('Delay')}
            onChange={_selectDelay}
            value={delay.toString()}
          />
        </Grid>
        <Typography fontSize='16px' fontWeight={300} pb='4px' pl='10px'>
          {t('Block(s)')}
        </Typography>
      </Grid>
      {realAddress && !(myselfAsProxy || alreadyExisting) &&
        <ShowIdentity
          accountIdentity={proxyAccountIdentity !== undefined && proxyAccountIdentity?.identity || null}
          style={{ m: 'auto', width: '92%' }}
        />
      }
      {realAddress && (myselfAsProxy || alreadyExisting) &&
        <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0, pl: '5px' }, '> div.belowInput .warningImage': { fontSize: '20px' }, height: '45px', pt: '20px' }}>
          <Warning
            fontSize={'15px'}
            fontWeight={400}
            isBelowInput
            isDanger
            theme={theme}
          >
            {myselfAsProxy
              ? t('Cannot set your account as a proxy for itself.')
              : t('You\'ve already included this proxy.')}
          </Warning>
        </Grid>
      }
      <PButton
        _onClick={_addProxy}
        disabled={addButtonDisabled}
        text={t('Add')}
      />
    </>
  );
}
