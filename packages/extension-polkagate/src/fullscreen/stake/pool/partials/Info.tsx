// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Collapse, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Infotip2, ShowValue } from '@polkadot/extension-polkagate/src/components';
import { useInfo, usePoolConsts, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

interface Props {
  address: string;
}

export default function Info({ address }: Props): React.ReactElement {
  const { t } = useTranslation();
  const info = usePoolConsts(address);
  const { decimal, token } = useInfo(address);

  const [show, setShow] = useState<boolean>();

  const Row = ({ label, showDivider = true, value }: { label: string, value: BN | string | number | undefined, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' py='5px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }}>
            {label}
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em' }}>
            {BN.isBN(value)
              ? decimal && <>{amountToHuman(value, decimal)}</>
              : <ShowValue value={value} width='100px' />
            }
          </Grid>
        </Grid>
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'divider', width: '100%' }} />
          </Grid>
        }
      </>
    );
  };

  const onClick = useCallback(() => {
    setShow(!show);
  }, [setShow, show]);

  return (
    <Grid alignItems='end' container item justifyItems='flex-end' sx={{ mt: '15px' }}>
      <Infotip2 showInfoMark text={t('click to view')}>
        <Typography fontSize='14px' onClick={onClick} sx={{ color: 'secondary.light', cursor: 'pointer' }} width='100%'>
          {t('on-chain pool staking info')}
        </Typography>
      </Infotip2>
      <Collapse in={show} orientation='vertical' sx={{ '> .MuiCollapse-wrapper .MuiCollapse-wrapperInner': { display: 'grid', rowGap: '10px', mt: '1%' }, width: '100%' }}>
        <Grid container item sx={{ backgroundColor: 'backgroundFL.primary', borderRadius: '5px', pt: '5px', px: '10px' }}>
          <Row label={t('Min {{token}} to join a pool', { replace: { token } })} value={info?.minJoinBond} />
          <Row label={t('Min {{token}} to create a pool', { replace: { token } })} value={info?.minCreationBond} />
          <Row label={t('Number of existing pools')} value={info?.lastPoolId?.toString()} />
          <Row label={t('Max possible pools')} value={info?.maxPools === -1 ? t('unlimited') : info?.maxPools} />
          <Row label={t('Max possible pool members')} value={info?.maxPoolMembers === -1 ? t('unlimited') : info?.maxPoolMembers} />
          {info && info?.maxPoolMembersPerPool !== -1 &&
            <Row label={t('Max pool members per pool')} value={info?.maxPoolMembersPerPool} />
          }
          <Row label={t('To leave a pool as a member')} value={t('Unstake, wait for unstaking, then redeem')} />
          <Row label={t('To leave a pool as an owner')} value={t('Destroy pool, remove all, then leave as member')} />
        </Grid>
      </Collapse>
    </Grid>

  );
}
