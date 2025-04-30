// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Container, Grid, Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BackWithLabel, Motion } from '../../../../components';
import { useChainInfo, useEstimatedFee2, useFormatted3, useSelectedAccount, useSoloStakingInfo, useTransactionFlow, useTranslation } from '../../../../hooks';
import UserDashboardHeader from '../../../../partials/UserDashboardHeader';
import { amountToHuman } from '../../../../util/utils';
import PRadio from '../../components/Radio';
import StakingActionButton from '../../partial/StakingActionButton';
import StakingMenu from '../../partial/StakingMenu';
import ChooseAccount from './ChooseAccount';

type RewardDestinationType = 'Others' | 'Staked' | undefined;

interface OptionBoxProps {
  setRewardDestinationType: React.Dispatch<React.SetStateAction<RewardDestinationType>>;
  rewardDestinationType: RewardDestinationType;
}

const OptionBox = ({ rewardDestinationType, setRewardDestinationType }: OptionBoxProps) => {
  const { t } = useTranslation();

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as RewardDestinationType;

    setRewardDestinationType(value);
  }, [setRewardDestinationType]);

  return (
    <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', padding: '12px', rowGap: '18px', width: '100%' }}>
      <Typography color='text.primary' variant='B-1' width='fit-content'>
        {t('Reward destination')}
      </Typography>
      <PRadio
        checked={rewardDestinationType === 'Staked'}
        label={t('Add to staked amount')}
        onChange={handleChange}
        value='Staked'
      />
      <PRadio
        checked={rewardDestinationType === 'Others'}
        label={t('Transfer to a specific account')}
        onChange={handleChange}
        value='Others'
      />
    </Stack>
  );
};

interface SpecificAccountOptionProps {
  genesisHash: string | undefined;
  setSpecificAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  specificAccount: string | undefined;
  showOption: boolean;
  onNext: () => void;
  ED: BN | undefined;
}

const SpecificAccountOption = ({ ED, genesisHash, onNext, setSpecificAccount, showOption, specificAccount }: SpecificAccountOptionProps) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack direction='column' sx={{ opacity: showOption ? 1 : 0, rowGap: '10px', transition: 'all 150ms ease-out' }}>
      <Typography color='text.highlight' variant='B-2' width='fit-content'>
        {t('Specific account')}
      </Typography>
      <ChooseAccount
        genesisHash={genesisHash}
        setSpecificAccount={setSpecificAccount}
        specificAccount={specificAccount}
      />
      <Container disableGutters sx={{ columnGap: '8px', display: 'flex' }}>
        <Warning2 color='#596AFF' size='35' style={{ height: 'fit-content', marginTop: '4px' }} variant='Bold' />
        <Typography color='text.highlight' textAlign='left' variant='B-4'>
          {t('The balance for the recipient must be at least {{ED}} {{token}} in order to keep the amount', { replace: { ED: ED ? amountToHuman(ED, decimal) : '--', token } })}
        </Typography>
      </Container>
      <StakingActionButton
        onClick={onNext}
        style={{ mt: '10px' }}
        text={t('Next')}
      />
    </Stack>
  );
};

export default function Settings (): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const setPayee = api?.tx['staking']['setPayee'];

  const stashId = stakingInfo.stakingAccount?.stashId.toString() ?? formatted ?? selectedAccount?.address;
  const ED = stakingInfo.stakingConsts?.existentialDeposit;

  const [rewardDestinationType, setRewardDestinationType] = useState<RewardDestinationType>(undefined);
  const [specificAccount, setSpecificAccount] = useState<string | undefined>(stashId);
  const [review, setReview] = useState<boolean>(false);

  useEffect(() => {
    if (!stakingInfo.stakingAccount || rewardDestinationType) {
      return;
    }

    // initialize settings
    const parsedStakingAccount = stakingInfo.stakingAccount;

    /** in Westend it is null recently if user has not staked yet */
    if (!parsedStakingAccount.rewardDestination) {
      return;
    }

    const destinationType = Object.keys(parsedStakingAccount.rewardDestination)[0];

    if (destinationType === 'account') {
      setRewardDestinationType('Others');
    } else {
      setRewardDestinationType('Staked');
    }
  }, [rewardDestinationType, stakingInfo.stakingAccount]);

  const makePayee = useCallback((value: RewardDestinationType, account: string | undefined) => {
    if (!value) {
      return;
    }

    if (value === 'Staked') {
      return 'Staked';
    }

    if (account === stashId) {
      return 'Stash';
    }

    if (account) {
      return { Account: account };
    }

    return undefined;
  }, [stashId]);

  const rewardDestination = useMemo(() => makePayee(rewardDestinationType, specificAccount), []);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, setPayee, [rewardDestination ?? 'Staked']);

  const transactionInformation = useMemo(() => {
    return [{
      content: specificAccount,
      title: t('Reward destination')
    },
      {
      content: estimatedFee2,
      title: t('Fee')
    }];
  }, [estimatedFee2, t]);
  const tx = useMemo(() => {
    return rewardDestination && setPayee
      ? setPayee('Staked')
      : undefined;
  }, [makePayee, rewardDestinationType, setPayee, specificAccount]);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Settings'),
    closeReview,
    genesisHash: genesisHash ?? '',
    review,
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noAccountSelected />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('Settings')}
          />
          <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', mx: '15px', rowGap: '18px' }}>
            <OptionBox
              rewardDestinationType={rewardDestinationType}
              setRewardDestinationType={setRewardDestinationType}
            />
            <SpecificAccountOption
              ED={ED}
              genesisHash={genesisHash}
              onNext={onNext}
              setSpecificAccount={setSpecificAccount}
              showOption={rewardDestinationType === 'Others'}
              specificAccount={specificAccount}
            />
          </Stack>
        </Motion>
      </Grid>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        type='solo'
      />
    </>
  );
}
