// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { PoolStakingConsts } from '../../../util/types';

import { Container, Divider, Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { BN } from '@polkadot/util';

import { Popup, ShowBalance, ShowValue } from '../../../components';
import { useToken, useTranslation } from '../../../hooks';
import { HeaderBrand } from '../../../partials';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  backPath: string;
  showInfo: boolean;
  info: PoolStakingConsts;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>

}

export default function Info({ address, api, info, setShowInfo, showInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = useToken(address);

  const onBackClick = useCallback(() => {
    setShowInfo(false);
  }, [setShowInfo]);

  const SubTitle = ({ title }: { title: string }) => (
    <Grid container direction='column' item justifyContent='center' sx={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: '25px', px: '5px' }}>
      <Grid item sx={{ m: 'auto' }}>
        {title}
      </Grid>
      <Grid item>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
      </Grid>
    </Grid>
  );

  const Row = ({ label, showDivider = true, value }: { label: string, value: BN | undefined, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' p='5px 15px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }}>
            {label}
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em' }} >
            {BN.isBN(value)
              ? <ShowBalance api={api} balance={value} decimalPoint={2} />
              : <ShowValue value={value} />
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

  const TextRow = ({ label, showDivider = true, text }: { label: string, text: string, showDivider?: boolean }) => {
    return (
      <>
        <Grid container p='5px 15px' sx={{ fontSize: '16px', letterSpacing: '-0.015em' }}>
          <Grid item sx={{ fontWeight: 300 }}>
            {label}
          </Grid>
          <Grid item sx={{ fontWeight: 400 }} >
            {text}
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
        text={t<string>('Pool Staking')}
      />
      <SubTitle title={t('Information')} />
      <Container
        disableGutters
        sx={{ pt: '15px' }}
      >
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
