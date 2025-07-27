// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { TickCircle, Warning2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';

import { HourGlass, WarningGif } from '../../../../assets/gif';
import { BackWithLabel, GradientDivider, Motion, NeonButton } from '../../../../components';
import { useBackground, useFastUnstaking, useIsExtensionPopup, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import StakingActionButton from '../../partial/StakingActionButton';
import StakingMenu from '../../partial/StakingMenu';

export const CheckEligibility = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const style = isExtension
    ? { mt: '12px', px: '15px', rowGap: '8px', width: '100%' }
    : { bgcolor: '#05091C', borderRadius: '14px', m: 'auto', mb: '23px', p: '16px', width: '100%' };

  return (
    <Stack direction='column' sx={style}>
      <Grid container item sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', justifyContent: 'center' }}>
        <SyncLoader color={theme.palette.text.highlight} loading={loading} size={4} speedMultiplier={0.6} />
        <Typography color='text.highlight' variant='B-2'>
          {t('Checking fast unstake eligibility')}
        </Typography>
      </Grid>
      {isExtension && <GradientDivider />}
    </Stack>
  );
};

interface EligibilityItemProps {
  text: string;
  done: boolean | undefined;
}

export const EligibilityItem = ({ done, text }: EligibilityItemProps) => {
  const isExtension = useIsExtensionPopup();

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '6px', display: 'flex', justifyContent: isExtension ? 'normal' : 'center' }}>
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

export const EligibilityStatus = ({ onBack, status }: { status: boolean | undefined, onBack: () => void }) => {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const size = status === undefined ? '65px' : '80px';

  return (
    <Stack direction='column' sx={{ mt: '20px', px: isExtension ? '15px' : 0, rowGap: '8px', width: '100%' }}>
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
          style={{ height: '44px', marginTop: '10px', width: isExtension ? '345px' : '100%' }}
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

  const { checkDone,
    eligibilityCheck,
    isEligible,
    transactionInformation,
    tx } = useFastUnstaking(selectedAccount?.address, genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    address: selectedAccount?.address,
    backPathTitle: t('Withdraw redeemable'),
    closeReview,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + genesisHash} homeType='default' />
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
