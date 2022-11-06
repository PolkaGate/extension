// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { AccountsBalanceType, MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../../util/types';

import { faHistory, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, MenuItem, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { ActionContext, FormatBalance, PButton, Popup, ShowBalance, ShowValue } from '../../../components';
import { useApi, useEndpoint, useMapEntries, useMetadata, useTranslation } from '../../../hooks';
import { updateMeta } from '../../../messaging';
import { HeaderBrand } from '../../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../../util/utils';
import { getValue } from '../../account/util';

interface Props {
  api: ApiPromise | undefined;
  backPath: string;
  showInfo: boolean;
  info: PoolStakingConsts;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>

}

export default function Info({ api, info, setShowInfo, showInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const token = api && api.registry.chainTokens[0];

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
        <Grid alignItems='center' p='5px 15px' container justifyContent='space-between'>
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
          <Grid item container justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'secondary.main', m: '1px auto', width: '90%' }} />
          </Grid>
        }
      </>
    );
  };

  const TextRow = ({ label, showDivider = true, text }: { label: string, text: string, showDivider?: boolean }) => {
    return (
      <>
        <Grid p='5px 15px' container sx={{ fontSize: '16px', letterSpacing: '-0.015em' }}>
          <Grid item sx={{ fontWeight: 300 }}>
            {label}
          </Grid>
          <Grid item sx={{ fontWeight: 400 }} >
            {text}
          </Grid>
        </Grid>
        {showDivider &&
          <Grid item container justifyContent='center' xs={12}>
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
        sx={{ pt: '5px' }}
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
