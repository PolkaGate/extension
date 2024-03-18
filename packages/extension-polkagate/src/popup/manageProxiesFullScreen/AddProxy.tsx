// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { AccountContext, AddressInput, InputWithLabel, Select, TwoButtons, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import { CHAIN_PROXY_TYPES } from '../../util/constants';
import { DropdownOption, ProxyItem } from '../../util/types';
import { sanitizeChainName } from '../../util/utils';
import ShowIdentity from '../manageProxies/partials/ShowIdentity';
import { STEPS } from '.';

interface Props {
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  chain: Chain | null | undefined;
  proxiedAddress: string | undefined;
  proxyItems: ProxyItem[] | null | undefined;
  setProxyItems: React.Dispatch<React.SetStateAction<ProxyItem[] | null | undefined>>;
}

export default function AddProxy ({ api, chain, proxiedAddress, proxyItems, setProxyItems, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);

  const [proxyAddress, setProxyAddress] = useState<string | null>();
  const [delay, setDelay] = useState<string>('0');
  const [accountInfo, setAccountInfo] = useState<DeriveAccountRegistration | undefined | null>();
  const [duplicateProxy, setDuplicateProxy] = useState<boolean>(false);

  const PROXY_TYPE = CHAIN_PROXY_TYPES[sanitizeChainName(chain?.name) as keyof typeof CHAIN_PROXY_TYPES];

  const proxyTypeOptions = PROXY_TYPE.map((type: string): DropdownOption => ({
    text: type,
    value: type
  }));

  const [proxyType, setProxyType] = useState<string | number>(proxyTypeOptions[0].value);

  const allAddresses = useMemo(() => {
    return accounts
      .filter(({ address }) => proxiedAddress !== address)
      .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => [address, genesisHash || null, name]);
  }, [accounts, proxiedAddress]);

  useEffect(() => {
    if (proxyAddress && api) {
      api.derive.accounts.info(proxyAddress).then((info) => {
        if (info.identity.display) {
          setAccountInfo(info.identity);
        } else {
          setAccountInfo(null);
        }
      }).catch(console.error);
    } else {
      setAccountInfo(undefined);
    }
  }, [api, proxyAddress]);

  useEffect(() => {
    duplicateProxy && setDuplicateProxy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyAddress, proxyType]);

  useEffect(() => {
    if (!proxyAddress) {
      return;
    }

    const duplicate = proxyItems?.filter(({ proxy }) => proxy.delegate === proxyAddress && proxy.proxyType === proxyType);

    setDuplicateProxy(!!(duplicate && duplicate.length > 0));
  }, [proxiedAddress, proxyAddress, proxyItems, proxyType]);

  const onDelayChange = useCallback((value: string) => {
    setDelay(value);
  }, []);

  const selectProxyType = useCallback((value: string | number) => {
    setProxyType(value);
  }, []);

  const onBack = useCallback(() => {
    setStep(STEPS.MANAGE);
  }, [setStep]);

  const onAddProxy = useCallback(() => {
    if (!proxyAddress || duplicateProxy) {
      return;
    }

    const newProxy = {
      proxy: {
        delay,
        delegate: proxyAddress,
        proxyType
      },
      status: 'new'
    } as unknown as ProxyItem;

    setProxyItems([...(proxyItems ?? []), newProxy]);

    onBack();
  }, [delay, duplicateProxy, onBack, proxyAddress, proxyItems, proxyType, setProxyItems]);

  return (
    <Grid container item>
      <Grid alignItems='center' container item pt='25px' width='fit-content'>
        <AddRoundedIcon sx={{ bgcolor: 'primary.main', borderRadius: '50px', color: '#fff', fontSize: '32px' }} />
        <Typography fontSize='30px' fontWeight={700} pl='15px'>
          {t('Add Proxy')}
        </Typography>
      </Grid>
      {duplicateProxy &&
        <Grid container sx={{ '> div': { m: 'auto', mt: '15px' } }}>
          <Warning
            fontWeight={500}
            iconDanger
            isBelowInput
            marginTop={0}
            theme={theme}
          >
            {t('You already have added this account as {{proxyType}} proxy', { replace: { proxyType } })}!
          </Warning>
        </Grid>}
      <Typography fontSize='14px' fontWeight={400} pt='25px'>
        {t("You can add an account included in this extension as a proxy of Alice to sign certain types of transactions on Alice's behalf.")}
      </Typography>
      <AddressInput
        addWithQr
        address={proxyAddress}
        allAddresses={allAddresses}
        chain={chain}
        label={t('Account ID')}
        setAddress={setProxyAddress}
        showIdenticon
        style={{ my: '30px' }}
      />
      <Grid container item justifyContent='space-between'>
        <Grid container item sx={{ width: '49%' }}>
          <Select
            defaultValue={proxyTypeOptions[0].value}
            helperText={t('The permissions allowed for this proxy account')}
            label={t('Proxy type')}
            onChange={selectProxyType}
            options={proxyTypeOptions}
            value={proxyType || proxyTypeOptions[0].value}
          />
        </Grid>
        <Grid alignItems='flex-end' container item width='49%'>
          <Grid container item xs>
            <InputWithLabel
              helperText={t('The announcement period required of the initial proxy. Generally will be zero.')}
              label={t('Delay')}
              onChange={onDelayChange}
              value={delay}
            />
          </Grid>
          <Grid container item pb='5px' pl='10px' width='fit-content'>
            <Typography fontSize='16px' fontWeight={400}>
              {t('Block(s)')}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      {proxyAddress &&
        <ShowIdentity
          accountIdentity={accountInfo}
          style={{ '> div:last-child div div p': { fontSize: '14px' }, '> div:last-child div div:last-child p': { fontSize: '16px', fontWeight: 400 }, m: '25px auto 0', width: '100%' }}
        />}
      <Grid container item sx={{ '> div': { mr: '10%' }, bottom: '25px', height: '50px', justifyContent: 'flex-end', left: 0, position: 'absolute', right: 0 }}>
        <Divider sx={{ bgcolor: 'text.primary', height: '1px', m: '0 auto 10px', width: '80%' }} />
        <TwoButtons
          disabled={!proxyAddress || duplicateProxy}
          mt='1px'
          onPrimaryClick={onAddProxy}
          onSecondaryClick={onBack}
          primaryBtnText={t('Add')}
          secondaryBtnText={t('Back')}
          width='50%'
        />
      </Grid>
    </Grid>
  );
}
