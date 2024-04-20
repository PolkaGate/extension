// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens review page
 * */

import { Container, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';
import { BN } from '@polkadot/util';

import { AccountHolderWithProxy, Identity, ShortAddress, ShowBalance, ShowValue, SignArea2, WrongPasswordAlert } from '../../../components';
import { useEstimatedFee, useInfo, useTranslation } from '../../../hooks';
import { SubTitle } from '../../../partials';
import { Payee, Proxy, TxInfo } from '../../../util/types';
import { Inputs } from '../Entry';
import { STEPS } from '../solo/commonTasks/configurePayee';

interface Props {
  address: string | undefined;
  step: number;
  inputs: Inputs | undefined;
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
      : payee.Account as string
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
            <Identity chain={chain} formatted={destinationAddress} identiconSize={31} style={{ height: '40px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
            <ShortAddress address={destinationAddress} />
          </Grid>
        }
      </Grid>
    </Grid>
  );
}

export default function Review({ address, inputs, onClose, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, chain, token } = useInfo(address);
  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const extraInfo = useMemo(() => {
    if (inputs?.extraInfo) {
      return {
        fee: String(estimatedFee || 0),
        ...inputs.extraInfo
      };
    }
  }, [estimatedFee, inputs]);

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
      <SubTitle label={t('Review')} style={{ paddingTop: isPasswordError ? '10px' : '25px' }} />
      <Container disableGutters sx={{ px: '30px' }}>
        <AccountHolderWithProxy
          address={address}
          chain={chain}
          selectedProxyAddress={selectedProxyAddress}
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
          <DisplayValue dividerHeight='1px' title={t('Amount')}>
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
                balance={inputs.extraInfo.totalStakeAfter as BN}
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
          proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
          secondaryBtnText={t('Back')}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setRefresh={setRefresh}
          setSelectedProxy={setSelectedProxy}
          setStep={setStep}
          setTxInfo={setTxInfo}
          step={step}
          steps={STEPS}
        />
      </Grid>
    </Grid>
  );
}
