// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { RewardDestinationType } from '../../../../util/types';

import { Container, Grid, Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, Motion, Progress, VariantButton } from '../../../../components';
import { useBackground, useChainInfo, useIsBlueish, useSelectedAccount, useSoloSettings, useTransactionFlow, useTranslation } from '../../../../hooks';
import UserDashboardHeader from '../../../../partials/UserDashboardHeader';
import { amountToHuman } from '../../../../util';
import { PROXY_TYPE } from '../../../../util/constants';
import PRadio from '../../components/Radio';
import StakingMenu from '../../partial/StakingMenu';
import ChooseAccount from './ChooseAccount';

interface OptionBoxProps {
  setRewardDestinationType: React.Dispatch<React.SetStateAction<RewardDestinationType>>;
  rewardDestinationType: RewardDestinationType;
  disabled: boolean;
}

const OptionBox = ({ disabled, rewardDestinationType, setRewardDestinationType }: OptionBoxProps) => {
  const { t } = useTranslation();

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const value = event.target.value as RewardDestinationType;

    setRewardDestinationType(value);
  }, [disabled, setRewardDestinationType]);

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
  ED: BN | undefined;
  disabled: boolean;
  genesisHash: string | undefined;
  isBlueish: boolean | undefined;
  onNext: () => void;
  setSpecificAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  specificAccount: string | undefined;
  showOption: boolean;
}

const SetToOthers = ({ ED, disabled, genesisHash, isBlueish, onNext, setSpecificAccount, showOption, specificAccount }: SpecificAccountOptionProps) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack direction='column' sx={{ height: showOption ? 'auto' : 0, opacity: showOption ? 1 : 0, rowGap: '10px', transition: showOption ? 'all 150ms ease-out' : 'unset' }}>
      <Typography color={isBlueish ? 'text.highlight' : '#674394'} variant='B-2' width='fit-content'>
        {t('Specific account')}
      </Typography>
      <ChooseAccount
        genesisHash={genesisHash}
        isBlueish={isBlueish}
        setSpecificAccount={setSpecificAccount}
        specificAccount={specificAccount}
      />
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '8px', display: 'flex' }}>
        <Warning2 color={isBlueish ? '#596AFF' : '#FF4FB9'} size='35' style={{ height: 'fit-content', marginTop: '4px' }} variant='Bold' />
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} textAlign='left' variant='B-4'>
          {t('The balance for the recipient must be at least {{ED}} {{token}} in order to keep the amount', { replace: { ED: ED ? amountToHuman(ED, decimal) : '--', token } })}
        </Typography>
      </Container>
      <VariantButton
        disabled={disabled}
        isBlueish={isBlueish}
        onClick={onNext}
        style={{ ...(isBlueish ? { marginTop: '10px' } : { bottom: '15px', position: 'absolute', width: '92%' }) }}
        text={t('Next')}
      />
    </Stack>
  );
};

const SetToStaked = ({ onNext }: { onNext: () => void }) => {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  return (
    <Stack direction='column' sx={{ height: 'auto', transition: 'all 150ms ease-out', width: '100%' }}>
      <Container disableGutters sx={{ columnGap: '8px', display: 'flex' }}>
        <Warning2 color={isBlueish ? '#596AFF' : '#FF4FB9'} size='35' style={{ height: 'fit-content', marginTop: '4px' }} variant='Bold' />
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} textAlign='left' variant='B-4'>
          {t('The reward amount will be automatically added to your staked amount.')}
        </Typography>
      </Container>
      <VariantButton
        isBlueish={isBlueish}
        onClick={onNext}
        style={{ ...(isBlueish ? { marginTop: '10px' } : { bottom: '15px', position: 'absolute', width: '92%' }) }}
        text={t('Next')}
      />
    </Stack>
  );
};

interface ContentProps {
  ED: BN | undefined;
  changeToStaked: boolean;
  isBlueish?: boolean;
  nextDisabled: boolean;
  rewardDestinationAddress: string | undefined;
  rewardDestinationType: RewardDestinationType | undefined;
  setRewardDestinationType: React.Dispatch<React.SetStateAction<RewardDestinationType | undefined>>;
  specificAccount: string | undefined;
  genesisHash: string | undefined;
  onNext: () => void;
  setSpecificAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const Content = ({ ED, changeToStaked, genesisHash, isBlueish, nextDisabled, onNext, rewardDestinationAddress, rewardDestinationType, setRewardDestinationType, setSpecificAccount, specificAccount }: ContentProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', mx: '15px', rowGap: '18px' }}>
      <OptionBox
        disabled={rewardDestinationType === undefined}
        rewardDestinationType={rewardDestinationType}
        setRewardDestinationType={setRewardDestinationType}
      />
      {rewardDestinationType === undefined
        ? <Progress
        size={15}
        style={{ alignSelf: 'center', marginTop: '20px' }}
        title={t('Loading, please wait ...')}
          />
        : <>
          {changeToStaked
            ? <SetToStaked
              onNext={onNext}
              />
            : <SetToOthers
              ED={ED}
              disabled={nextDisabled}
              genesisHash={genesisHash}
              isBlueish={isBlueish}
              onNext={onNext}
              setSpecificAccount={setSpecificAccount}
              showOption={rewardDestinationType === 'Others'}
              specificAccount={specificAccount ?? rewardDestinationAddress}
              />
          }
        </>
      }
    </Stack>
  );
};

export default function Settings (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const isBlueish = useIsBlueish();

  const [review, setReview] = useState<boolean>(false);

  const { ED,
    changeToStaked,
    nextDisabled,
    rewardDestinationAddress,
    rewardDestinationType,
    setRewardDestinationType,
    setSpecificAccount,
    specificAccount,
    transactionInformation,
    tx } = useSoloSettings(address, genesisHash);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Settings'),
    closeReview,
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.STAKING,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative', zIndex: 1 }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + address + '/' + genesisHash} homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            stepCounter={{ currentStep: 1, totalSteps: 2 }}
            style={{ pb: 0 }}
            text={t('Settings')}
          />
          <Content
            ED={ED}
            changeToStaked={changeToStaked}
            genesisHash={genesisHash}
            isBlueish={isBlueish}
            nextDisabled={nextDisabled}
            onNext={onNext}
            rewardDestinationAddress={rewardDestinationAddress}
            rewardDestinationType={rewardDestinationType}
            setRewardDestinationType={setRewardDestinationType}
            setSpecificAccount={setSpecificAccount}
            specificAccount={specificAccount}
          />
        </Motion>
      </Grid>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        type='solo'
      />
    </>
  );
}
