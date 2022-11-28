// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { NominatorInfo, StakingConsts } from '../../../util/types';

import { Container, Divider, Grid } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { BN } from '@polkadot/util';

import { ActionContext, Popup, ShowBalance, ShowValue } from '../../../components';
import { useTranslation } from '../../../hooks';
import { HeaderBrand } from '../../../partials';
import { amountToHuman } from '../../../util/utils';

interface Props {
  api: ApiPromise | undefined;
  showInfo: boolean;
  info: StakingConsts | null | undefined;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>
  nominatorInfo: NominatorInfo | undefined
}

export default function Info({ api, info, nominatorInfo, setShowInfo, showInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = api && api.registry.chainTokens[0];
  const decimal = api && api.registry.chainDecimals[0];

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

  const Row = ({ label, showDivider = true, value }: { label: string, value: BN | string | number | undefined, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' p='5px 15px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', width: '75%' }}>
            {label}
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em' }} >
            {BN.isBN(value)
              // ? <ShowBalance api={api} balance={value} decimalPoint={2} />
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
      <SubTitle title={t('Information')} />
      <Container
        disableGutters
        sx={{ pt: '15px' }}
      >
        <Row label={t('Max validators you can select')} value={info?.maxNominations} />
        <Row label={t('Min {{token}} to be a staker', { replace: { token } })} value={info?.minNominatorBond} />
        <Row label={t('Min {{token}} to receive rewards', { replace: { token } })} value={nominatorInfo?.minNominated && new BN(String(nominatorInfo?.minNominated))} />
        <Row label={t('Max nominators of a validator, who may receive rewards')} value={info?.maxNominatorRewardedPerValidator} />
        <Row label={t('Days it takes to receive your funds back after unstaking')} value={info?.unbondingDuration} />
        <Row label={t('Min {{token}} that must remain in your account (ED)', { replace: { token } })} value={info?.existentialDeposit} />
      </Container>
    </Popup>
  );
}
