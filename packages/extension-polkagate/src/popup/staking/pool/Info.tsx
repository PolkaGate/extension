// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { PoolStakingConsts } from '../../../util/types';

import { Container, Divider, Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { BN } from '@polkadot/util';

import { Popup, ShowValue } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { HeaderBrand, SubTitle } from '../../../partials';
import { amountToHuman } from '../../../util/utils';

interface Props {
  address: string | undefined;
  showInfo: boolean;
  info: PoolStakingConsts;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>

}

export default function Info({ address, info, setShowInfo, showInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { decimal, token } = useInfo(address);

  const onBackClick = useCallback(() => {
    setShowInfo(false);
  }, [setShowInfo]);

  const Row = ({ label, showDivider = true, value }: { label: string, value: BN | string | number | undefined, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' p='5px 15px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs>
            {label}
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', width: 'fit-content' }}>
            {BN.isBN(value)
              ? decimal && <>{amountToHuman(value, decimal)}</>
              : <ShowValue value={value} />
            }
          </Grid>
        </Grid>
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'divider', m: '1px auto', width: '90%' }} />
          </Grid>
        }
      </>
    );
  };

  const TextRow = ({ label, showDivider = true, text }: { label: string, text: string, showDivider?: boolean }) => {
    return (
      <>
        <Grid container p='5px 15px' sx={{ fontSize: '16px', letterSpacing: '-0.015em' }}>
          <Grid item sx={{ fontWeight: 300 }}>
            {label}
          </Grid>
          <Grid item sx={{ fontWeight: 400 }}>
            {text}
          </Grid>
        </Grid>
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'divider', m: '1px auto', width: '90%' }} />
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
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t('Information')} />
      <Container disableGutters sx={{ pt: '20px' }}>
        <Row label={t('Min {{token}} to join a pool', { replace: { token } })} value={info?.minJoinBond} />
        <Row label={t('Min {{token}} to create a pool', { replace: { token } })} value={info?.minCreationBond} />
        <Row label={t('Number of existing pools')} value={info?.lastPoolId?.toString()} />
        <Row label={t('Max possible pools')} value={info?.maxPools === -1 ? t('unlimited') : info?.maxPools} />
        <Row label={t('Max possible pool members')} value={info?.maxPoolMembers === -1 ? t('unlimited') : info?.maxPoolMembers} />
        {info && info?.maxPoolMembersPerPool !== -1 &&
          <Row label={t('Max pool members per pool')} value={info?.maxPoolMembersPerPool} />
        }
        <TextRow label={t('To leave a pool as a member')} text={t('Unstake, wait for unstaking, then redeem')} />
        <TextRow label={t('To leave a pool as an owner')} text={t('Destroy pool, remove all, then leave as member')} />
      </Container>
    </Popup>
  );
}
