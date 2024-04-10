// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens stake review page
 * */

import type { SubmittableExtrinsic } from '@polkadot/api/types';

import { Container, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import SelectProxyModal2 from '@polkadot/extension-polkagate/src/fullscreen/governance/components/SelectProxyModal2';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { Identity, ShortAddress, ShowValue, SignArea2, WrongPasswordAlert } from '../../../../components';
import { useInfo, useProxies, useTranslation } from '../../../../hooks';
import { SubTitle } from '../../../../partials';
import { Payee, Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { STEPS } from '.';

interface Props {
  address: string | undefined;
  payee: Payee | undefined;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>
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
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
    </Grid>
  );
}

export default function Review ({ address, payee, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { api, formatted } = useInfo(address);
  const proxies = useProxies(api, formatted);

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [tx, setTx] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>>();

  const setPayee = api && api.tx.staking.setPayee;

  useEffect(() => {
    if (!setPayee || !api || !formatted) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const _tx = setPayee(payee);

    setTx(_tx);

    _tx && _tx.paymentInfo(formatted)
      .then((i) => setEstimatedFee(api.createType('Balance', i?.partialFee ?? BN_ZERO)))
      .catch(console.error);
  }, [api, formatted, payee, setPayee]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const extraInfo = useMemo(() => ({
    action: 'Solo Staking',
    fee: String(estimatedFee || 0),
    payee,
    subAction: 'Config reward destination'
  }), [estimatedFee, payee]);

  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);

  const onClose = useCallback(() => {
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
              {payee &&
               <RewardsDestination
                 address={address}
                 payee={payee}
               />
              }
              <Grid alignItems='center' container item justifyContent='center' lineHeight='20px' mt='10px'>
                <Grid item>
                  {t('Fee')}:
                </Grid>
                <Grid item sx={{ pl: '5px' }}>
                  <ShowValue height={16} value={estimatedFee?.toHuman()} />
                </Grid>
              </Grid>
            </Container>
            <Grid container item sx={{ bottom: '10px', left: '4%', position: 'absolute', width: '92%' }}>
              <SignArea2
                address={address}
                call={tx}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={onClose}
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
