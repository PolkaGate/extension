// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { AdvancedDropdownOption, ProxyItem, ProxyTypes } from '../../util/types';

import { Grid, Stack, Typography } from '@mui/material';
import { Clock, Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { isMigratedByChainName } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { AddressInput, DecisionButtons, DropSelect, MyTextField } from '../../components';
import { useAccountDisplay, useFormatted, useTranslation } from '../../hooks';
import { sanitizeChainName, toTitleCase } from '../../util';
import { CHAIN_PROXY_TYPES, MIGRATED_PROXY_TYPES } from '../../util/constants';
import { DraggableModal } from '../components/DraggableModal';
import { PROXY_ICONS, STEPS } from './consts';
import { type ProxyFlowStep } from './types';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<ProxyFlowStep>>;
  step: string;
  chain: Chain | null | undefined;
  proxiedAddress: string | undefined;
  proxyItems: ProxyItem[] | null | undefined;
  setProxyItems: React.Dispatch<React.SetStateAction<ProxyItem[] | null | undefined>>;
  setNewDepositedValue: React.Dispatch<React.SetStateAction<BN | undefined>>;
}

export default function AddProxy({ chain, proxiedAddress, proxyItems, setNewDepositedValue, setProxyItems, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(proxiedAddress, chain?.genesisHash);
  const accountDisplayName = useAccountDisplay(proxiedAddress, chain?.genesisHash);

  const [proxyAddress, setProxyAddress] = useState<string | null>();
  const [delay, setDelay] = useState<number>(0);
  const [duplicateProxy, setDuplicateProxy] = useState<boolean>(false);

  const myselfAsProxy = useMemo(() => formatted === proxyAddress, [formatted, proxyAddress]);

  const chainName = sanitizeChainName(chain?.name);
  const proxyTypeIndex = chainName?.toLowerCase()?.includes('assethub') ? 'AssetHubs' : chainName;
  const PROXY_TYPE = useMemo(() => {
    const baseType = CHAIN_PROXY_TYPES[proxyTypeIndex as keyof typeof CHAIN_PROXY_TYPES];

    if (chainName && isMigratedByChainName(chainName)) {
      return baseType.concat(MIGRATED_PROXY_TYPES);
    }

    return baseType;
  }, [chainName, proxyTypeIndex]);

  const proxyTypeOptions = PROXY_TYPE.map((type: string): AdvancedDropdownOption => ({
    Icon: PROXY_ICONS[type as ProxyTypes] as Icon,
    text: toTitleCase(type) ?? '',
    value: type
  }));

  const [proxyType, setProxyType] = useState<string | number>(proxyTypeOptions[0].value);

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
    const nDelay = value ? parseInt(value.replace(/\D+/g, ''), 10) : 0;

    setDelay(nDelay);
  }, []);

  const selectProxyType = useCallback((value: string | number) => {
    setProxyType(value);
  }, []);

  const onCancel = useCallback(() => {
    // remove new proxy from list if canceled
    proxyItems?.length && setProxyItems([...proxyItems.filter(({ status }) => status !== 'new')]);
    setNewDepositedValue(undefined);

    setStep(STEPS.INIT);
  }, [proxyItems, setNewDepositedValue, setProxyItems, setStep]);

  const onAddProxy = useCallback(() => {
    if (!proxyAddress || duplicateProxy || myselfAsProxy) {
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

    setProxyItems([newProxy, ...(proxyItems ?? [])]);
    setStep(STEPS.REVIEW);
  }, [delay, duplicateProxy, myselfAsProxy, proxyAddress, proxyItems, proxyType, setProxyItems, setStep]);

  return (
    <DraggableModal
      noDivider
      onClose={onCancel}
      open={step === STEPS.ADD_PROXY}
      style={{ backgroundColor: '#1B133C', minHeight: '460px', padding: '20px 15px' }}
      title={t('Add proxy')}
    >
      <Grid container item sx={{ px: '5px' }}>
        <Typography color='#BEAAD8' sx={{ padding: '20px 10px 0px', textAlign: 'left' }} variant='B-4'>
          {t("You can add an account included in this extension as a proxy of {{accountDisplayName}} to sign certain types of transactions on {{accountDisplayName}}'s behalf.", { replace: { accountDisplayName } })}
        </Typography>
        <AddressInput
          address={proxyAddress}
          chain={chain}
          label={t('Account ID')}
          setAddress={setProxyAddress}
          style={{ mt: '25px', width: '100%' }}
          withSelect
        />
        {(duplicateProxy || myselfAsProxy) &&
          <Stack alignItems='center' columnGap='4px' direction='row' paddingTop='2px'>
            <Warning2 color='#FF4FB9' size='18px' variant='Bold' />
            <Typography color='#FF4FB9' variant='B-4'>
              {duplicateProxy && t('This account is already added as a {{proxyType}} proxy.', { replace: { proxyType } })}
              {myselfAsProxy && t('An account cannot be its own proxy.')}
            </Typography>
          </Stack>
        }
        <Stack columnGap='20px' direction='row' sx={{ mt: '25px', width: '100%' }}>
          <Stack direction='column' justifyContent='start' rowGap='3px' sx={{ width: '52%' }}>
            <Typography color='#EAEBF1' sx={{ mb: '3px', width: 'fit-content' }} variant='B-1'>
              {t('Proxy type')}
            </Typography>
            <DropSelect
              Icon={(proxyTypeOptions.find(({ value }) => value === proxyType)?.Icon ?? proxyTypeOptions[0].Icon) as Icon}
              contentDropWidth={300}
              displayContentType='icon'
              onChange={selectProxyType}
              options={proxyTypeOptions}
              showCheckAsIcon
              style={{
                height: '44px'
              }}
              value={proxyType ?? proxyTypeOptions[0].value}
            />
          </Stack>
          <Stack alignItems='end' columnGap='8px' direction='row' justifyContent='start' sx={{ width: '40%' }}>
            <MyTextField
              Icon={Clock}
              iconSize={18}
              inputType='number'
              inputValue={delay}
              onEnterPress={onAddProxy}
              onTextChange={onDelayChange}
              placeholder={'0'}
              title={t('Delay')}
            />
            <Typography color='#BEAAD8' sx={{ marginBottom: '13px' }} variant='B-4'>
              {t('block(s)')}
            </Typography>
          </Stack>
        </Stack>
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={!proxyAddress || duplicateProxy || myselfAsProxy}
          onPrimaryClick={onAddProxy}
          onSecondaryClick={onCancel}
          primaryBtnText={t('Next')}
          secondaryBtnText={t('Cancel')}
          style={{
            height: '44px',
            marginTop: '85px',
            width: '100%'
          }}
        />
      </Grid>
    </DraggableModal>
  );
}
