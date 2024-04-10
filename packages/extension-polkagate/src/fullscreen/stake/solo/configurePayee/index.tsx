// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, SxProps, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import { AccountStakingInfo, Payee, SoloSettings, TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import { amountToHuman, upperCaseFirstChar } from '@polkadot/extension-polkagate/src/util/utils';

import { AccountInputWithIdentity, TwoButtons, Warning } from '../../../../components';
import { useInfo, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';
import Confirmation from './Confirmation';
import Review from './Review';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export const STEPS = {
  INDEX: 1,
  REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  PROXY: 100
};

export default function ConfigurePayee({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chain, decimal, token } = useInfo(address);

  const stakingConsts = useStakingConsts(address);
  const stakingAccount = useStakingAccount(address);

  const [rewardDestinationValue, setRewardDestinationValue] = useState<'Staked' | 'Others'>();
  const [rewardDestinationAccount, setRewardDestinationAccount] = useState<string | undefined>();
  const [newPayee, setNewPayee] = useState();
  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const settings = useMemo(() => {
    if (!stakingAccount) {
      return;
    }

    // initialize settings
    const parsedStakingAccount = JSON.parse(JSON.stringify(stakingAccount)) as AccountStakingInfo;
    const destinationType = Object.keys(parsedStakingAccount.rewardDestination)[0];

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

  const onNext = useCallback(() => {
    if (!rewardDestinationValue || !settings) {
      return;
    }

    const mayBeNew = makePayee(rewardDestinationValue, rewardDestinationAccount);
    const payee = mayBeNew && JSON.stringify(settings.payee) !== JSON.stringify(mayBeNew) ? mayBeNew : undefined;

    setNewPayee(payee);

    setStep(STEPS.REVIEW); // can be left open when settings accessed from home
  }, [makePayee, rewardDestinationAccount, rewardDestinationValue, settings]);

  const onCancel = useCallback(() => {
    setStep(STEPS.INDEX);
    setShow(false);
  }, [setShow]);

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

  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);

  const onClose = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  const Title = () => (
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
            {step === STEPS.PROXY ? t('Select Proxy') : t('Configuring Reward Destination')}
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <CloseIcon
          onClick={
            step === STEPS.INDEX
              ? onCancel
              : step === STEPS.PROXY
                ? closeProxy
                : onClose
          }
          sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }}
        />
      </Grid>
    </Grid>
  );

  return (
    <DraggableModal onClose={onCancel} open={show}>
      <>
        {step !== STEPS.WAIT_SCREEN &&
          <Title />
        }
        {step === STEPS.INDEX &&
          <>
            <Grid container item>
              <Grid container item justifyContent='flex-start' mt='35px' mx='15px' width='100%'>
                <FormControl sx={{ textAlign: 'left' }}>
                  <FormLabel sx={{ '&.Mui-focused': { color: 'text.primary' }, color: 'text.primary', fontSize: '16px' }}>
                    {t('Reward destination')}
                  </FormLabel>
                  <RadioGroup defaultValue={rewardDestinationValue || optionDefaultVal} onChange={onSelectionMethodChange}>
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
              disabled={payeeNotChanged || (rewardDestinationValue === 'Others' && !rewardDestinationAccount)}
              ml='0'
              onPrimaryClick={onNext}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Cancel')}
              width='87%'
            />
          </>
        }
        {[STEPS.REVIEW, STEPS.PROXY].includes(step) &&
          <Review
            address={address}
            payee={newPayee}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo &&
          <Confirmation
            handleDone={onCancel}
            txInfo={txInfo}
          />
        }
      </>
    </DraggableModal>
  );
}
