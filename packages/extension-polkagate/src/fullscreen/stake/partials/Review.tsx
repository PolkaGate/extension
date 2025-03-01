// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens review page
 * */

import type { BN } from '@polkadot/util';
import type { MyPoolInfo, Payee, Proxy, ProxyItem, TxInfo } from '../../../util/types';
import type { StakingInputs } from '../type';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import SelectProxyModal2 from '@polkadot/extension-polkagate/src/fullscreen/governance/components/SelectProxyModal2';
import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { BN_ZERO } from '@polkadot/util';

import { AccountHolderWithProxy, Identity, ShortAddress, ShowBalance, ShowValue, SignArea2, WrongPasswordAlert } from '../../../components';
import { useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../hooks';
import { SubTitle } from '../../../partials';
import { PROXY_TYPE } from '../../../util/constants';
import { STEPS } from '../pool/stake';

interface Props {
  address: string | undefined;
  step: number;
  inputs: StakingInputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  onClose?: () => void
}

function RewardsDestination({ address, payee }: { address: string | undefined, payee: Payee }) {
  const { t } = useTranslation();
  const { chain, formatted } = useInfo(address);

  const destinationAddress = useMemo(() =>
    payee === 'Stash'
      ? formatted
      : typeof payee === 'object' && 'Account' in payee
        ? payee.Account
        : undefined
    , [formatted, payee]);

  return (
    <Grid container item justifyContent='center' sx={{ alignSelf: 'center', my: '5px' }}>
      <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mt: '5px', width: '240px' }} />
      <Typography sx={{ fontWeight: 300 }}>
        {t('Rewards destination')}
      </Typography>
      <Grid container item justifyContent='center'>
        {payee === 'Staked'
          ? <Typography sx={{ fontSize: '28px', fontWeight: 300, textAlign: 'center' }}>
            {t('Add to staked amount')}
          </Typography>
          : <Grid container item justifyContent='center'>
            <Identity chain={chain as any} formatted={destinationAddress} identiconSize={31} style={{ height: '40px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
            <ShortAddress address={destinationAddress} />
          </Grid>
        }
      </Grid>
    </Grid>
  );
}

export default function Review({ address, inputs, onClose, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, chain, formatted, token } = useInfo(address);
  const proxies = useProxies(api, formatted);
  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const extraInfo = useMemo(() => {
    if (inputs?.extraInfo) {
      return {
        fee: String(estimatedFee || 0),
        ...inputs.extraInfo
      } as Record<string, unknown>;
    }

    return undefined;
  }, [estimatedFee, inputs]);

  const proxyTypeFilter = useMemo(
    () =>
      inputs?.extraInfo?.['pool']
        ? PROXY_TYPE.NOMINATION_POOLS
        : PROXY_TYPE.STAKING
    , [inputs]);

  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);

  const _onClose = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  return (
    <Grid alignItems='center' container justifyContent='center' maxHeight='650px' overflow='hidden'>
      {isPasswordError &&
        <WrongPasswordAlert
          fontSize='14px'
        />
      }
      {[STEPS.REVIEW, STEPS.SIGN_QR].includes(step) &&
        <>
          <SubTitle label={t('Review')} style={{ paddingTop: isPasswordError ? '10px' : '25px' }} />
          <Grid container item sx={{ px: '30px' }}>
            <AccountHolderWithProxy
              address={address}
              chain={chain}
              selectedProxyAddress={selectedProxyAddress}
              style={{ mt: 'auto' }}
              title={t('Account')}
            />
            <>
              {inputs?.extraInfo?.['payee'] &&
                <RewardsDestination
                  address={address}
                  payee={inputs.extraInfo['payee'] as Payee}
                />
              }
              {inputs?.extraInfo?.['redeemText'] && inputs?.extraInfo?.['helperText'] &&
                <Grid container item justifyContent='center' sx={{ fontSize: '14px', fontWeight: 400, pt: '15px', textAlign: 'center' }}>
                  <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mx: 'auto', my: '5px', width: '170px' }} />
                  {inputs?.extraInfo?.['helperText'] as string}
                </Grid>
              }
              {inputs?.extraInfo?.['amount'] &&
                <DisplayValue dividerHeight='1px' title={t('Amount')}>
                  <Grid alignItems='center' container item justifyContent='center' sx={{ height: '42px' }}>
                    <ShowValue
                      unit={token}
                      value={inputs.extraInfo['amount'] as string}
                    />
                  </Grid>
                </DisplayValue>
              }
              {inputs?.extraInfo?.['redeemText'] &&
                <Grid container item justifyContent='center' sx={{ fontSize: '14px', pt: '10px', textAlign: 'center' }}>
                  {inputs?.extraInfo?.['redeemText'] as string}
                </Grid>
              }
              {inputs?.extraInfo?.['helperText'] && inputs?.extraInfo?.['pool'] &&
                <>
                  <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mx: 'auto', my: '5px', width: '170px' }} />
                  <Typography fontSize='14px' fontWeight={400} m='20px auto' textAlign='left' width='100%'>
                    {inputs.extraInfo['helperText'] as string}
                  </Typography>
                  <ShowPool
                    api={api}
                    chain={chain}
                    mode='Default'
                    pool={inputs.extraInfo['pool'] as MyPoolInfo}
                    showInfo
                    style={{ m: '20px auto' }}
                  />
                </>
              }
              <DisplayValue dividerHeight='1px' title={t('Fee')}>
                <Grid alignItems='center' container item sx={{ fontSize: 'large', height: '42px' }}>
                  <ShowValue height={16} value={estimatedFee?.toHuman()} width='150px' />
                </Grid>
              </DisplayValue>
              {inputs?.extraInfo?.['availableBalanceAfter'] &&
                <DisplayValue dividerHeight='1px' title={t('Available Balance After')}>
                  <Grid alignItems='center' container item sx={{ height: '42px' }}>
                    <ShowBalance
                      api={api}
                      balance={(inputs.extraInfo['availableBalanceAfter'] as BN).sub(estimatedFee || BN_ZERO)}
                      decimalPoint={4}
                    />
                  </Grid>
                </DisplayValue>
              }
              {inputs?.extraInfo?.['totalStakeAfter'] &&
                <DisplayValue dividerHeight='1px' title={t('Total Stake After')}>
                  <Grid alignItems='center' container item sx={{ height: '42px' }}>
                    <ShowBalance
                      api={api}
                      balance={inputs.extraInfo['totalStakeAfter'] as BN}
                      decimalPoint={4}
                    />
                  </Grid>
                </DisplayValue>
              }
            </>
          </Grid>
          <Grid container item sx={{ bottom: '10px', left: '4%', position: 'absolute', width: '92%' }}>
            {address &&
              <SignArea2
                address={address}
                call={inputs?.call}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={onClose || _onClose}
                params={inputs?.params}
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={proxyTypeFilter}
                secondaryBtnText={t('Back')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setRefresh={setRefresh}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
              />}
          </Grid>
        </>
      }
      {step === STEPS.PROXY &&
        <SelectProxyModal2
          address={address}
          closeSelectProxy={closeProxy}
          height={500}
          proxies={proxyItems}
          proxyTypeFilter={proxyTypeFilter}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
        />
      }
    </Grid>
  );
}
