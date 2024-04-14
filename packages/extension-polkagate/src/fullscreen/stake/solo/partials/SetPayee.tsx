// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, SxProps, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import { AccountStakingInfo, Payee, SoloSettings } from '@polkadot/extension-polkagate/src/util/types';
import { amountToHuman, upperCaseFirstChar } from '@polkadot/extension-polkagate/src/util/utils';

import { AccountInputWithIdentity, TwoButtons, Warning } from '../../../../components';
import { useInfo, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setShowReview?: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
}

export default function SetPayee ({ address, setShow, setShowReview, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chain, decimal, token } = useInfo(address);

  const stakingConsts = useStakingConsts(address);
  const stakingAccount = useStakingAccount(address);

  const [rewardDestinationValue, setRewardDestinationValue] = useState<'Staked' | 'Others'>();
  const [rewardDestinationAccount, setRewardDestinationAccount] = useState<string | undefined>();

  const settings = useMemo(() => {
    if (!stakingAccount) {
      return;
    }

    // initialize settings
    const parsedStakingAccount = JSON.parse(JSON.stringify(stakingAccount)) as AccountStakingInfo;
    
    /** in Westend it is null recently if user has not staked yet */
    if (!parsedStakingAccount.rewardDestination) {
      return;
    }
    
    const destinationType = Object.keys(parsedStakingAccount.rewardDestination)[0];

    console.log('parsedStakingAccount:', parsedStakingAccount);

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
  }, [stakingAccount]);

  const getOptionLabel = useCallback((s: SoloSettings): 'Staked' | 'Others' => s?.payee === 'Staked' ? 'Staked' : 'Others', []);
  const optionDefaultVal = useMemo(() => settings && getOptionLabel(settings), [getOptionLabel, settings]);

  console.log('settings:', settings);
  console.log('optionDefaultVal:', optionDefaultVal);
  console.log('rewardDestinationAccount:', rewardDestinationAccount);

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
  }, [settings]);

  const payeeNotChanged = useMemo(
    () =>
      settings && rewardDestinationValue && JSON.stringify(settings.payee) === JSON.stringify(makePayee(rewardDestinationValue, rewardDestinationAccount))
    , [makePayee, rewardDestinationAccount, rewardDestinationValue, settings]);

  const onSet = useCallback(() => {
    if (!rewardDestinationValue || !settings) {
      return;
    }

    set((s) => {
      const payee = makePayee(rewardDestinationValue, rewardDestinationAccount);

      if (payee && JSON.stringify(settings.payee) !== JSON.stringify(payee)) {
        s.payee = payee;
      } else {
        s.payee = undefined;
      }

      if (rewardDestinationAccount && s.payee === 'Stash') {
        s.stashId = rewardDestinationAccount;
      } else {
        s.stashId = undefined;
      }

      return s;
    });

    setShowReview && setShowReview(true);
    !setShowReview && setShow(false); // can be left open when settings accessed from home
  }, [makePayee, rewardDestinationAccount, rewardDestinationValue, setShow, setShowReview, settings]);

  const onCancel = useCallback(() => setShow(false), [setShow]);

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
    <DraggableModal onClose={onCancel} open={show}>
      <>
        <Grid container item>
          <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
            <Grid alignItems='center' container justifyContent='flex-start' sx={{ width: 'fit-content' }}>
              <Grid item>
                <FontAwesomeIcon
                  color={`${theme.palette.text.primary}`}
                  fontSize='25px'
                  icon={faCog}
                />
              </Grid>
              <Grid item sx={{ pl: '10px' }}>
                <Typography fontSize='22px' fontWeight={700}>
                  {t('Configure Reward destination')}
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <CloseIcon onClick={onCancel} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
            </Grid>
          </Grid>
          <Grid container item justifyContent='flex-start' mt='35px' mx='15px' width='100%'>
            <FormControl sx={{ textAlign: 'left' }}>
              <FormLabel sx={{ '&.Mui-focused': { color: 'text.primary' }, color: 'text.primary', fontSize: '16px' }}>
                {t('Reward destination')}
              </FormLabel>
              <RadioGroup defaultValue={optionDefaultVal} onChange={onSelectionMethodChange}>
                <FormControlLabel control={<Radio size='small' sx={{ color: 'secondary.main' }} value='Staked' />} label={<Typography sx={{ fontSize: '18px' }}>{t('Add to staked amount')}</Typography>} />
                <FormControlLabel control={<Radio size='small' sx={{ color: 'secondary.main', py: '2px' }} value='Others' />} label={<Typography sx={{ fontSize: '18px' }}>{t('Transfer to a specific account')}</Typography>} />
              </RadioGroup>
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
          disabled={ payeeNotChanged || (rewardDestinationValue === 'Others' && !rewardDestinationAccount) }
          ml='0'
          onPrimaryClick={onSet}
          onSecondaryClick={onCancel}
          primaryBtnText={t('Next')}
          secondaryBtnText={t('Cancel')}
          width='87%'
        />
      </>
    </DraggableModal>
  );
}
