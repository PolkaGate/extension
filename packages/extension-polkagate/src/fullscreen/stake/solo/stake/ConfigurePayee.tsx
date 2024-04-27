// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Skeleton, SxProps, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountStakingInfo, Payee, SoloSettings } from '@polkadot/extension-polkagate/src/util/types';
import { amountToHuman, upperCaseFirstChar } from '@polkadot/extension-polkagate/src/util/utils';

import { AccountInputWithIdentity, TwoButtons, Warning } from '../../../../components';
import { useInfo, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';
import { STEPS } from '../..';
import { Inputs } from '../../Entry';

interface Props {
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function ConfigurePayee ({ setInputs, setStep }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const [rewardDestinationValue, setRewardDestinationValue] = useState<'Staked' | 'Others'>();
  const [rewardDestinationAccount, setRewardDestinationAccount] = useState<string | undefined>();
  const [newPayee, setNewPayee] = useState();

  const settings = useMemo(() => {

    let payee: Payee;

    if (destinationType === 'account') {
      payee = {
        Account: parsedStakingAccount.rewardDestination.account as string
      };

      setRewardDestinationAccount(parsedStakingAccount.rewardDestination.account as string);
    } else {
      payee = upperCaseFirstChar(destinationType) as Payee;

      if (payee === 'Stash') {
        setRewardDestinationAccount(parsedStakingAccount.stashId.toString());
      }
    }

    setRewardDestinationValue(payee === 'Staked' ? 'Staked' : 'Others');

    return ({ payee, stashId: parsedStakingAccount.stashId });
  }, []);

  const getOptionLabel = useCallback((s: SoloSettings): 'Staked' | 'Others' => s?.payee === 'Staked' ? 'Staked' : 'Others', []);
  const optionDefaultVal = useMemo(() => settings && getOptionLabel(settings), [getOptionLabel, settings]);

  const setPayee = api && api.tx.staking.setPayee;

  useEffect(() => {
    if (!setPayee || !api || !address || !newPayee) {
      return;
    }

    const call = setPayee;
    const params = [newPayee];

    const extraInfo = {
      action: 'Solo Staking',
      payee: newPayee,
      subAction: 'Config reward destination'
    };

    setInputs({
      call,
      extraInfo,
      params
    });
  }, [address, api, newPayee, setInputs, setPayee]);

  const ED = useMemo(() => stakingConsts?.existentialDeposit && decimal && amountToHuman(stakingConsts.existentialDeposit, decimal), [decimal, stakingConsts?.existentialDeposit]);

  const onSelectionMethodChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: 'Staked' | 'Others'): void => {
    setRewardDestinationValue(value);

    if (value === 'Staked') {
      setRewardDestinationAccount(undefined);// to reset
    }
  }, []);

  const makePayee = useCallback((value: 'Staked' | 'Others', account?: string) => {
    if (!settings) {
      return;
    }

    if (value === 'Staked') {
      return 'Staked';
    }

    if (account === settings?.stashId?.toString()) {
      return 'Stash';
    }

    if (account) {
      return { Account: account };
    }

    return undefined;
  }, [settings]);

  const payeeNotChanged = useMemo(
    () =>
      settings && rewardDestinationValue && JSON.stringify(settings.payee) === JSON.stringify(makePayee(rewardDestinationValue, rewardDestinationAccount))
    , [makePayee, rewardDestinationAccount, rewardDestinationValue, settings]);

  useEffect(() => {
    if (!rewardDestinationValue || !settings) {
      return;
    }

    const mayBeNew = makePayee(rewardDestinationValue, rewardDestinationAccount);
    const payee = mayBeNew && JSON.stringify(settings.payee) !== JSON.stringify(mayBeNew) ? mayBeNew : undefined;

    setNewPayee(payee);
  }, [makePayee, rewardDestinationAccount, rewardDestinationValue, settings]);

  const onNext = useCallback(() => {
    setStep(STEPS.SOLO_REVIEW);
  }, [setStep]);

  const onBack = useCallback(() => {
    setStep(STEPS.STAKE_SOLO);
  }, [setStep]);

  const Warn = ({ text, style = {} }: { text: string, style?: SxProps }) => (
    <Grid container justifyContent='center' sx={style}>
      <Warning
        fontWeight={400}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  return (
    <>
      <Grid container item>
        <Grid container item justifyContent='flex-start' mt='35px' mx='15px' width='100%'>
          <FormControl sx={{ textAlign: 'left' }}>
            <FormLabel sx={{ '&.Mui-focused': { color: 'text.primary' }, color: 'text.primary', fontSize: '16px' }}>
              {t('Reward destination')}
            </FormLabel>
            {rewardDestinationValue || optionDefaultVal
              ? <RadioGroup defaultValue={rewardDestinationValue || optionDefaultVal} onChange={onSelectionMethodChange}>
                <FormControlLabel control={<Radio size='small' sx={{ color: 'secondary.main' }} value='Staked' />} label={<Typography sx={{ fontSize: '18px' }}>{t('Add to staked amount')}</Typography>} />
                <FormControlLabel control={<Radio size='small' sx={{ color: 'secondary.main', py: '2px' }} value='Others' />} label={<Typography sx={{ fontSize: '18px' }}>{t('Transfer to a specific account')}</Typography>} />
              </RadioGroup>
              : <Skeleton
                animation='wave'
                height={20}
                sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '200px', mt: '10px' }}
                />
            }
          </FormControl>
        </Grid>
        {rewardDestinationValue === 'Others' &&
                <>
                  <AccountInputWithIdentity
                    address={rewardDestinationAccount}
                    chain={chain}
                    label={t('Specific account')}
                    setAddress={setRewardDestinationAccount}
                    style={{ pt: '25px', px: '15px' }}
                  />
                  <Warn style={{ mt: '-20px' }} text={t('The balance for the recipient must be at least {{ED}} in order to keep the amount.', { replace: { ED: `${ED} ${token}` } })} />
                </>
        }
      </Grid>
      <TwoButtons
        disabled={payeeNotChanged || (rewardDestinationValue === 'Others' && !rewardDestinationAccount)}
        ml='0'
        onPrimaryClick={onNext}
        onSecondaryClick={onBack}
        primaryBtnText={t('Next')}
        secondaryBtnText={t('Back')}
        width='87%'
      />
    </>
  );
}
