// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { TickCircle, Warning2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';

import { HourGlass, WarningGif } from '../../../../assets/gif';
import { ActionButton, BackWithLabel, GradientDivider, Motion, NeonButton } from '../../../../components';
import { useBackground, useFastUnstaking, useIsExtensionPopup, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingActionButton from '../../partial/StakingActionButton';
import StakingMenu from '../../partial/StakingMenu';

export const CheckEligibility = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const style = isExtension
    ? { mt: '12px', px: '15px', rowGap: '8px', width: '100%' }
    : { bgcolor: '#05091C', borderRadius: '14px', m: 'auto', mb: '23px', py: '18px', width: '100%' };

  const adjustedColor = isExtension ? theme.palette.text.highlight : theme.palette.primary.main;

  return (
    <Stack direction='column' sx={style}>
      <Grid container item sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', justifyContent: 'center' }}>
        <SyncLoader color={adjustedColor} loading={loading} size={4} speedMultiplier={0.6} />
        <Typography color={adjustedColor} variant='B-2'>
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
  const theme = useTheme();

  const adjustedColor = isExtension ? theme.palette.text.highlight : theme.palette.primary.main;

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '6px', display: 'flex', justifyContent: isExtension ? 'normal' : 'center' }}>
      {!done
        ? <Grid sx={{ bgcolor: isExtension ? '#3E4065' : '#2D1E4A', borderRadius: '999px', height: '18px', width: '18px' }} />
        : <TickCircle color='#82FFA5' size='18' variant='Bold' />
      }
      <Typography color={!done ? adjustedColor : '#82FFA5'} variant='B-2'>
        {text}
      </Typography>
    </Container>
  );
};

export const EligibilityStatus = ({ onBack, status }: { status: boolean | undefined, onBack: () => void }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const size = status === undefined ? '65px' : '80px';
  const adjustedColor = isExtension ? theme.palette.text.highlight : theme.palette.text.secondary;
  const Button = isExtension ? NeonButton : ActionButton;

  return (
    <Stack direction='column' sx={{ mt: '20px', px: isExtension ? '15px' : 0, rowGap: '8px', width: '100%' }}>
      <Stack direction='column' sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          component='img'
          src={(status === undefined ? HourGlass : WarningGif) as string}
          sx={{ height: size, width: size }}
        />
        {status === undefined &&
          <>
            <Typography color={adjustedColor} sx={{ mt: '12px', textAlign: 'center', width: '100%' }} variant='B-1'>
              {t('Please wait a few seconds')}
            </Typography>
            <Typography color={adjustedColor} sx={{ textAlign: 'center', width: '100%' }} variant='B-1'>
              {t('and don’t close the extension')}
            </Typography>
          </>
        }
        {status === false &&
          <>
            <Typography color={isExtension ? 'text.primary' : 'text.secondary'} sx={{ my: '6px', textAlign: 'center', width: '294px' }} variant='B-1'>
              {t('This account is not eligible for fast unstake, because the requirements (highlighted above) are not met')}
            </Typography>
          </>
        }
      </Stack>
      {status === false &&
        <Button
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

  const address = useSelectedAccount()?.address;
  const navigate = useNavigate();

  const { checkDone,
    eligibilityCheck,
    isEligible,
    transactionInformation,
    tx } = useFastUnstaking(address, genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onNext = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Withdraw redeemable'),
    closeReview,
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.STAKING,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + address + '/' + genesisHash} homeType='default' />
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
