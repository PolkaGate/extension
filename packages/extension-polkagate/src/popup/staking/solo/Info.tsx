// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { MinToReceiveRewardsInSolo, StakingConsts } from '../../../util/types';

import { Container, Divider, Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { BN, bnMax } from '@polkadot/util';

import { Popup, ShowValue } from '../../../components';
import { useDecimal, useToken, useTranslation } from '../../../hooks';
import { HeaderBrand, SubTitle } from '../../../partials';
import { amountToHuman } from '../../../util/utils';

interface Props {
  address: string;
  showInfo: boolean;
  info: StakingConsts | null | undefined;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>
  nominatorInfo: MinToReceiveRewardsInSolo | undefined
}

export default function Info({ address, info, nominatorInfo, setShowInfo, showInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = useToken(address);
  const decimal = useDecimal(address);

  const onBackClick = useCallback(() => {
    setShowInfo(false);
  }, [setShowInfo]);

  const Row = ({ label, showDivider = true, value }: { label: string, value: BN | string | number | undefined, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' p='5px 15px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', width: '75%' }}>
            {label}
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em' }} >
            {BN.isBN(value)
              ? decimal && <>{amountToHuman(value, decimal)}</>
              : <ShowValue value={value} width='50px' />
            }
          </Grid>
        </Grid>
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'secondary.main', m: '1px auto', width: '90%' }} />
          </Grid>
        }
      </>
    );
  };

  return (
    <Popup show={showInfo}>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Solo Staking')}
      />
      <SubTitle label={t('Information')} />
      <Container disableGutters sx={{ pt: '20px' }}>
        <Row label={t('Max validators you can select')} value={info?.maxNominations} />
        <Row label={t('Min {{token}} to be a staker', { replace: { token } })} value={info?.minNominatorBond} />
        <Row label={t('Min {{token}} to receive rewards', { replace: { token } })} value={nominatorInfo?.minToGetRewards && info?.minNominatorBond && bnMax(info.minNominatorBond, new BN(String(nominatorInfo?.minToGetRewards)))} />
        <Row label={t('Max nominators of a validator, who may receive rewards')} value={info?.maxNominatorRewardedPerValidator} />
        <Row label={t('Days it takes to receive your funds back after unstaking')} value={info?.unbondingDuration} />
        <Row label={t('Min {{token}} that must remain in your account (ED)', { replace: { token } })} value={info?.existentialDeposit} />
      </Container>
    </Popup>
  );
}
