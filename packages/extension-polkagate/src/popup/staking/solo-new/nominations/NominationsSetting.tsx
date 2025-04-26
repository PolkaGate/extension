// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, Motion } from '../../../../components';
import { useSelectedAccount, useSoloStakingInfo, useTranslation, useValidatorsInformation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import NominationSettingButtons from '../../partial/NominationSettingButtons';
import NominatorsTable from '../../partial/NominatorsTable';
import StakingMenu from '../../partial/StakingMenu';

export default function NominationsSetting (): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);

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

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' noAccountSelected />
      <Motion variant='slide'>
        <BackWithLabel
          onClick={onBack}
          style={{ pb: 0 }}
          text={t('Validators')}
        />
        <NominationSettingButtons
          nominatedValidatorsInformation={nominatedValidatorsInformation}
          soloStakingInfo={stakingInfo}
          style={{ mt: '12px', px: '15px' }}
        />
        <Stack direction='row' sx={{ mt: '12px', px: '15px', width: '100%' }}>
          <NominatorsTable
            genesisHash={genesisHash ?? ''}
            validatorsInformation={nominatedValidatorsInformation}
          />
        </Stack>
      </Motion>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        type='solo'
      />
    </Grid>
  );
}
