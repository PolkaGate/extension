// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens review page
 * */

import { Container, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import SelectProxyModal2 from '@polkadot/extension-polkagate/src/fullscreen/governance/components/SelectProxyModal2';
import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';

import { AccountHolderWithProxy, Identity, ShortAddress, ShowBalance, ShowValue, SignArea2, WrongPasswordAlert } from '../../../../../components';
import { useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../../../hooks';
import { SubTitle } from '../../../../../partials';
import { Payee, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { Inputs } from '../../../Entry';
import { STEPS } from '.';

interface Props {
  address: string | undefined;
  step: number;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  onClose?: () => void
}

function RewardsDestination ({ address, payee }: { address: string | undefined, payee: Payee }) {
  const { t } = useTranslation();
  const { chain, formatted } = useInfo(address);

  const destinationAddress = useMemo(() =>
    payee === 'Stash'
      ? formatted
      : payee.Account as string
  , [formatted, payee]);

  return (
    <Grid container item justifyContent='center' sx={{ alignSelf: 'center', my: '5px' }}>
      <Typography sx={{ fontWeight: 300 }}>
        {t('Rewards destination')}
      </Typography>
      <Grid container item justifyContent='center'>
        {payee === 'Staked'
          ? <Typography sx={{ fontSize: '28px', fontWeight: 300, textAlign: 'center' }}>
            {t('Add to staked amount')}
          </Typography>
          : <Grid container item justifyContent='center'>
            <Identity chain={chain} formatted={destinationAddress} identiconSize={31} style={{ height: '40px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
            <ShortAddress address={destinationAddress} />
          </Grid>
        }
        <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mt: '5px', width: '240px' }} />
      </Grid>
    </Grid>
  );
}

export default function Review ({ address, inputs, onClose, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
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
      };
    }
  }, [estimatedFee, inputs]);

  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);

  const _onClose = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  return (
    <Grid alignItems='center' container justifyContent='center' maxHeight='650px' overflow='hidden'>
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      {step === STEPS.REVIEW &&
        <>
          <SubTitle label={t('Review')} style={{ paddingTop: isPasswordError ? '10px' : '25px' }} />
          <Container disableGutters sx={{ px: '30px' }}>
            <AccountHolderWithProxy
              address={address}
              chain={chain}
              selectedProxyAddress={selectedProxyAddress}
              showDivider
              style={{ mt: 'auto' }}
              title={t('Account holder')}
            />
            {inputs?.extraInfo?.payee &&
              <RewardsDestination
                address={address}
                payee={inputs.extraInfo.payee}
              />
            }
            {inputs?.extraInfo?.amount &&
              <DisplayValue dividerHeight='1px' title={t('Amount')} topDivider={false}>
                <Grid alignItems='center' container item justifyContent='center' sx={{ height: '42px' }}>
                  <ShowValue
                    unit={token}
                    value={inputs.extraInfo.amount}
                  />
                </Grid>
              </DisplayValue>
            }
            <DisplayValue dividerHeight='1px' title={t('Fee')}>
              <Grid alignItems='center' container item sx={{ fontSize: 'large', height: '42px' }}>
                <ShowValue height={16} value={estimatedFee?.toHuman()} width='150px' />
              </Grid>
            </DisplayValue>
            {inputs?.extraInfo?.availableBalanceAfter &&
              <DisplayValue dividerHeight='1px' title={t('Available Balance After')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ShowBalance
                    api={api}
                    balance={inputs.extraInfo.availableBalanceAfter}
                    decimalPoint={4}
                  />
                </Grid>
              </DisplayValue>
            }
            {inputs?.extraInfo?.totalStakeAfter &&
              <DisplayValue dividerHeight='1px' title={t('Total Stake After')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ShowBalance
                    api={api}
                    balance={inputs.extraInfo.totalStakeAfter}
                    decimalPoint={4}
                  />
                </Grid>
              </DisplayValue>
            }
          </Container>
          <Grid container item sx={{ bottom: '10px', left: '4%', position: 'absolute', width: '92%' }}>
            <SignArea2
              address={address}
              call={inputs?.call}
              extraInfo={extraInfo}
              isPasswordError={isPasswordError}
              onSecondaryClick={onClose || _onClose}
              params={inputs?.params}
              primaryBtnText={t('Confirm')}
              proxyTypeFilter={['Any', 'NonTransfer', 'Staking']}
              secondaryBtnText={t('Back')}
              selectedProxy={selectedProxy}
              setIsPasswordError={setIsPasswordError}
              setRefresh={setRefresh}
              setStep={setStep}
              setTxInfo={setTxInfo}
              step={step}
              steps={STEPS}
            />
          </Grid>
        </>
      }
      {step === STEPS.PROXY &&
        <SelectProxyModal2
          address={address}
          closeSelectProxy={closeProxy}
          height={500}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'Staking']}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
        />
      }
    </Grid>
  );
}
