// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';
import { ThroughProxy } from '@polkadot/extension-polkagate/src/partials';
import { Proxy, TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import { Progress, ShortAddress, ShowValue, SignArea2, WrongPasswordAlert } from '../../../../components';
import { useEstimatedFee, useInfo, useTranslation } from '../../../../hooks';
import { Inputs } from '../../Entry';
import Confirmation from '../partials/Confirmation';
import { MODAL_IDS } from '..';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
  redeemable: BN | undefined;
  availableBalance: Balance | undefined;
}

export const STEPS = {
  PROGRESS: 1,
  REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  PROXY: 100
};

export default function WithdrawRedeem ({ address, availableBalance, redeemable, setRefresh, setShow }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, decimal, formatted, token } = useInfo(address);

  const [step, setStep] = useState(STEPS.PROGRESS);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<Inputs>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  const availableBalanceAfter = useMemo(() => {
    if (!redeemable || !availableBalance) {
      return undefined;
    }

    return redeemable?.add(availableBalance);
  }, [availableBalance, redeemable]);

  const extraInfo = {
    action: 'Pool Staking',
    amount: amountToHuman(redeemable?.toString(), decimal),
    subAction: 'Redeem'
  };

  const onClose = useCallback(() => {
    setShow(MODAL_IDS.NONE);
  }, [setShow]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleInputs = async () => {
      const call = api.tx.nominationPools.withdrawUnbonded;

      const optSpans = await api.query.staking.slashingSpans(formatted);
      const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1;
      const params = [formatted, spanCount];

      const extraInfo = {
        action: 'Pool Staking',
        amount: amountToHuman(redeemable, decimal),
        subAction: 'Redeem'
      };

      setInputs({
        call,
        extraInfo,
        params
      });
    };

    step === STEPS.PROGRESS &&
      handleInputs()
        .then(
          () => setStep(STEPS.REVIEW)
        )
        .catch(console.error);
  }, [api, decimal, formatted, redeemable, step]);

  const onCancel = useCallback(() => {
    setShow(MODAL_IDS.NONE);
    setInputs(undefined);
  }, [setShow]);

  return (
    <DraggableModal minHeight={600} onClose={onCancel} open>
      <Grid container>
        <Grid alignItems='center' container justifyContent='space-between' py='15px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Withdraw Redeemable')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={onClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {step === STEPS.PROGRESS &&
          <Grid container item p='30px'>
            <Progress
              fontSize={16}
              pt={10}
              size={150}
              title={t('Loading information, please wait ...')}
            />
          </Grid>
        }
        {[STEPS.REVIEW, STEPS.PROXY].includes(step) && address &&
          <Grid container direction='column' item pt='20px'>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <DisplayValue dividerHeight='1px' title={t('Redeemable')} topDivider={false}>
              <Grid alignItems='center' container item justifyContent='center' sx={{ height: '42px' }}>
                <ShowValue
                  unit={token}
                  value={amountToHuman(redeemable, decimal)}
                />
              </Grid>
            </DisplayValue>
            <DisplayValue dividerHeight='1px' title={t('Your available balance after')}>
              <Grid alignItems='center' container item sx={{ fontSize: 'large', height: '42px' }}>
                <ShowValue height={16} unit={token} value={amountToHuman(availableBalanceAfter, decimal)} width='150px' />
              </Grid>
            </DisplayValue>
            <DisplayValue dividerHeight='1px' title={t('Fee')}>
              <Grid alignItems='center' container item sx={{ fontSize: 'large', height: '42px' }}>
                <ShowValue height={16} value={estimatedFee?.toHuman()} width='150px' />
              </Grid>
            </DisplayValue>
            <Grid container item sx={{ bottom: '15px', height: '120px', position: 'absolute', width: '86%' }}>
              <SignArea2
                address={address}
                call={inputs?.call}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={onClose}
                params={inputs?.params}
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
                secondaryBtnText={t('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setRefresh={setRefresh}
                setSelectedProxy={setSelectedProxy}
                setStep={setStep}
                setTxInfo={setTxInfo}
                showBackButtonWithUseProxy
                step={step}
                steps={STEPS}
              />
            </Grid>
          </Grid>
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo &&
          <Confirmation
            handleClose={onCancel}
            modalHeight={600}
            txInfo={txInfo}
          >
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t<string>('Account holder:')}
              </Typography>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                {txInfo.from.name}
              </Typography>
              <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                <ShortAddress
                  address={txInfo.from.address}
                  inParentheses
                  style={{ fontSize: '16px' }}
                />
              </Grid>
            </Grid>
            {txInfo.throughProxy &&
              <Grid container m='auto' maxWidth='92%'>
                <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
              </Grid>
            }
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t<string>('Redeem')}:
              </Typography>
              <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                {`${amountToHuman(redeemable, decimal)} ${token ?? ''}`}
              </Grid>
            </Grid>
          </Confirmation>
        }
      </Grid>
    </DraggableModal>
  );
}
