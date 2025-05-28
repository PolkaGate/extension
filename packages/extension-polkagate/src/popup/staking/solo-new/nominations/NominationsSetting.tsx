// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, Typography } from '@mui/material';
import { Refresh } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { EmptyWarning } from '../../../../assets/icons/index';
import { FadeOnScroll, Motion, NeonButton } from '../../../../components';
import { useBackground, useChainInfo, useEstimatedFee2, useFormatted3, useSelectedAccount, useSoloStakingInfo, useTransactionFlow, useTranslation, useValidatorsInformation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import NominationsBackButton from '../../partial/NominationsBackButton';
import NominatorsTable from '../../partial/NominatorsTable';
import Progress from '../../partial/Progress';
import StakingMenu from '../../partial/StakingMenu';

interface EmptyNominationProps {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

const EmptyNomination = ({ setRefresh }: EmptyNominationProps) => {
  const { t } = useTranslation();

  const onClick = useCallback(() => setRefresh(true), [setRefresh]);

  return (
    <Stack direction='column'>
      <Box
        component='img'
        src={EmptyWarning as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '150px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No validator found')}
      </Typography>
      <NeonButton
        StartIcon={Refresh}
        contentPlacement='center'
        onClick={onClick}
        style={{
          height: '44px',
          width: '345px'
        }}
        text={t('Refresh')}
      />
    </Stack>
  );
};

export default function NominationsSetting (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);
  const refContainer = useRef(null);

  const chill = api?.tx['staking']['chill'];

  const [refresh, setRefresh] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);

  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash, refresh, setRefresh);
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const nominatedValidatorsIds = useMemo(() =>
    stakingInfo.stakingAccount === null || stakingInfo.stakingAccount?.nominators?.length === 0
      ? null
      : stakingInfo.stakingAccount?.nominators.map((item) => item.toString())
  , [stakingInfo.stakingAccount]);

  const nominatedValidatorsInformation = useMemo(() => {
    if (!validatorsInfo || !nominatedValidatorsIds) {
      return undefined;
    }

    const allValidators = [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting];

    const filtered = allValidators.filter(({ accountId }) => nominatedValidatorsIds.includes(accountId.toString()));

    return filtered;
  }, [nominatedValidatorsIds, validatorsInfo]);

  const estimatedFee2 = useEstimatedFee2(review ? genesisHash ?? '' : undefined, formatted, chill, []);

  const transactionInformation = useMemo(() => {
    return [{
      content: nominatedValidatorsInformation?.length.toString() ?? '0',
      title: t('Validators')
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    }];
  }, [estimatedFee2, nominatedValidatorsInformation?.length, t]);
  const tx = useMemo(() => chill?.(), [chill]);

  // const goChill = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Chill'),
    closeReview,
    formatted,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' noSelection />
      <Motion variant='slide'>
        <NominationsBackButton style={{ mt: '8px' }} />
        <Stack direction='row' ref={refContainer} sx={{ maxHeight: '500px', mt: '12px', overflowY: 'auto', px: '15px', width: '100%' }}>
          {(stakingInfo.stakingAccount === undefined || nominatedValidatorsInformation === undefined) &&
            <Progress
              text={t("Loading the validators' list")}
            />
          }
          {nominatedValidatorsInformation && nominatedValidatorsInformation.length > 0 &&
            <NominatorsTable
              genesisHash={genesisHash ?? ''}
              validatorsInformation={nominatedValidatorsInformation}
            />}
          {stakingInfo.stakingAccount?.nominators && stakingInfo.stakingAccount.nominators.length === 0 &&
            <EmptyNomination
              setRefresh={setRefresh}
            />
          }
          <FadeOnScroll containerRef={refContainer} height='75px' ratio={0.6} />
        </Stack>
      </Motion>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        type='solo'
      />
    </Grid>
  );
}
