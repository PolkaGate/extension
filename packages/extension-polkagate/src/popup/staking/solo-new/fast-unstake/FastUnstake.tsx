// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { TickCircle, Warning2 } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';

import { BN, BN_ZERO } from '@polkadot/util';

import { HourGlass, WarningGif } from '../../../../assets/gif';
import { BackWithLabel, GradientDivider, Motion, NeonButton } from '../../../../components';
import { useAccountAssets, useBackground, useChainInfo, useEstimatedFee2, useFormatted3, useIsExposed2, useSelectedAccount, useSoloStakingInfo, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import { amountToHuman } from '../../../../util/utils';
import StakingActionButton from '../../partial/StakingActionButton';
import StakingMenu from '../../partial/StakingMenu';

const CheckEligibility = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack direction='column' sx={{ mt: '12px', px: '15px', rowGap: '8px', width: '100%' }}>
      <Grid container item sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', justifyContent: 'center' }}>
        <SyncLoader color={theme.palette.text.highlight} loading={loading} size={4} speedMultiplier={0.6} />
        <Typography color='text.highlight' variant='B-2'>
          {t('Checking fast unstake eligibility')}
        </Typography>
      </Grid>
      <GradientDivider />
    </Stack>
  );
};

interface EligibilityItemProps {
  text: string;
  done: boolean | undefined;
}

const EligibilityItem = ({ done, text }: EligibilityItemProps) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '6px', display: 'flex' }}>
      {!done
        ? <Grid sx={{ bgcolor: '#3E4065', borderRadius: '999px', height: '18px', width: '18px' }} />
        : <TickCircle color='#82FFA5' size='18' variant='Bold' />
      }
      <Typography color={!done ? 'text.highlight' : '#82FFA5'} variant='B-2'>
        {text}
      </Typography>
    </Container>
  );
};

const EligibilityStatus = ({ onBack, status }: { status: boolean | undefined, onBack: () => void }) => {
  const { t } = useTranslation();

  const size = status === undefined ? '65px' : '80px';

  return (
    <Stack direction='column' sx={{ mt: '20px', px: '15px', rowGap: '8px', width: '100%' }}>
      <Grid container item sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', justifyContent: 'center' }}>
        <Box
          component='img'
          src={(status === undefined ? HourGlass : WarningGif) as string}
          sx={{ height: size, width: size }}
        />
        {status === undefined &&
          <>
            <Typography color='text.highlight' sx={{ mt: '12px', textAlign: 'center', width: '100%' }} variant='B-1'>
              {t('Please wait a few seconds')}
            </Typography>
            <Typography color='text.highlight' sx={{ textAlign: 'center', width: '100%' }} variant='B-1'>
              {t('and don’t close the extension')}
            </Typography>
          </>
        }
        {status === false &&
          <>
            <Typography color='text.primary' sx={{ my: '6px', textAlign: 'center', width: '85%' }} variant='B-1'>
              {t('This account is not eligible for fast unstake, because the requirements (highlighted above) are not met')}
            </Typography>
          </>
        }
      </Grid>
      {status === false &&
        <NeonButton
          contentPlacement='center'
          onClick={onBack}
          style={{ height: '44px', marginTop: '10px', width: '345px' }}
          text={t('Back')}
        />
      }
    </Stack>
  );
};

export default function FastUnstake (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();
  const { api, decimal, token } = useChainInfo(genesisHash);
  const accountAssets = useAccountAssets(selectedAccount?.address);
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const isExposed = useIsExposed2(genesisHash, stakingInfo);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
  , [accountAssets, genesisHash]);

  const fastUnstake = api?.tx['fastUnstake']['registerFastUnstake'];
  const estimatedFee = useEstimatedFee2(genesisHash, formatted, fastUnstake?.());

  const fastUnstakeDeposit = api ? api.consts['fastUnstake']['deposit'] as unknown as BN : undefined;
  const hasEnoughDeposit = fastUnstakeDeposit && estimatedFee && asset?.availableBalance
    ? new BN(fastUnstakeDeposit).add(estimatedFee).lt(asset.availableBalance || BN_ZERO)
    : undefined;

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const redeemable = stakingInfo.stakingAccount?.redeemable;

  const hasUnlockingAndRedeemable = redeemable !== undefined && stakingInfo.stakingAccount
    ? !!(!redeemable.isZero() || stakingInfo.stakingAccount.unlocking?.length)
    : undefined;

  const isEligible = useMemo(() => isExposed !== undefined && hasUnlockingAndRedeemable !== undefined && hasEnoughDeposit !== undefined
    ? !isExposed && !hasUnlockingAndRedeemable && hasEnoughDeposit
    : undefined, [hasEnoughDeposit, hasUnlockingAndRedeemable, isExposed]);

  const eligibilityCheck = useMemo(() => {
    return [
      { status: hasEnoughDeposit, text: t('Having {{deposit}} {{token}} available to deposit', { replace: { deposit: fastUnstakeDeposit ? amountToHuman(fastUnstakeDeposit, decimal) : '--', token } }) },
      { status: hasUnlockingAndRedeemable !== undefined ? !hasUnlockingAndRedeemable : undefined, text: t('No redeemable or unstaking funds') },
      { status: isExposed !== undefined ? !isExposed : undefined, text: t('Not being rewarded in the past {{day}} days', { replace: { day: stakingInfo.stakingConsts?.bondingDuration } }) }
    ];
  }, [decimal, fastUnstakeDeposit, hasEnoughDeposit, hasUnlockingAndRedeemable, isExposed, stakingInfo.stakingConsts?.bondingDuration, t, token]);

  const checkDone = useMemo(() => eligibilityCheck.every(({ status }) => status !== undefined), [eligibilityCheck]);

  const transactionInformation = useMemo(() => {
    return [{
      content: staked as unknown as BN,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: staked && asset ? (asset.availableBalance).add(staked as unknown as BN) : undefined,
      title: t('Available balance after'),
      withLogo: true
    }];
  }, [asset, estimatedFee, staked, t]);
  const tx = useMemo(() => fastUnstake?.(), [fastUnstake]);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Withdraw redeemable'),
    closeReview,
    formatted,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
      <UserDashboardHeader homeType='default' noSelection />
      <Motion variant='slide'>
        <BackWithLabel
          onClick={onBack}
          stepCounter={{ currentStep: 1, totalSteps: 2 }}
          style={{ pb: 0 }}
          text={t('Fast Unstake')}
        />
        <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', mt: '12px', mx: '15px', p: '15px', pt: '5px', rowGap: '12px', transition: 'all 250ms ease-out', width: 'calc(100% - 30px)' }}>
          <CheckEligibility loading={!checkDone} />
          {
            eligibilityCheck.map(({ status, text }, index) => (
              <EligibilityItem
                done={status}
                key={index}
                text={text}
              />
            ))
          }
        </Stack>
        {!isEligible &&
          <EligibilityStatus
            onBack={onBack}
            status={isEligible}
          />
        }
        {isEligible &&
          <Stack direction='column' sx={{ bottom: '15px', height: '120px', position: 'absolute', px: '15px', rowGap: '24px', width: '100%' }}>
            <Container disableGutters sx={{ columnGap: '8px', display: 'flex' }}>
              <Warning2 color='#596AFF' size='55' style={{ height: 'fit-content', marginTop: '4px' }} variant='Bold' />
              <Typography color='text.highlight' textAlign='left' variant='B-4'>
                {t('You can proceed to do fast unstake. Note your stake amount will be available within a few minutes after submitting the transaction')}
              </Typography>
            </Container>
            <StakingActionButton
              onClick={onNext}
              text={t('Next')}
            />
          </Stack>
        }
      </Motion>
      {!isEligible &&
        <StakingMenu
          genesisHash={genesisHash ?? ''}
          type='solo'
        />}
    </Grid>
  );
}
