// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Collapse, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Infotip2, ShowValue } from '@polkadot/extension-polkagate/src/components';
import { useInfo, useMinToReceiveRewardsInSolo, useStakingConsts, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN, bnMax } from '@polkadot/util';

interface Props {
  address: string;
}

export default function Info({ address }: Props): React.ReactElement {
  const { t } = useTranslation();
  const info = useStakingConsts(address);
  const minimumActiveStake = useMinToReceiveRewardsInSolo(address);
  const { decimal, token } = useInfo(address);

  const [show, setShow] = useState<boolean>();

  const Row = ({ label, showDivider = true, value }: { label: string, value: BN | string | number | undefined, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' py='5px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', width: '75%' }}>
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
  }, [show]);

  return (
    <Grid alignItems='end' container item justifyItems='flex-end' sx={{ mt: '15px' }}>
      <Infotip2 showInfoMark text={t('click to view')}>
        <Typography
          fontSize='14px'
          onClick={onClick}
          sx={{
            '&:hover': {
              textDecoration: 'underline'
            },
            color: 'secondary.light',
            cursor: 'pointer',
            ml: '30px'
          }}
          width='100%'
        >
          {t('on-chain staking info')}
        </Typography>
      </Infotip2>
      <Collapse in={show} orientation='vertical' sx={{ '> .MuiCollapse-wrapper .MuiCollapse-wrapperInner': { display: 'grid', rowGap: '10px', mt: '1%' }, width: '100%' }}>
        <Grid container item sx={{ backgroundColor: 'backgroundFL.primary', borderRadius: '5px', pt: '5px', px: '10px' }}>
          <Row label={t('Max validators you can select')} value={info?.maxNominations} />
          <Row label={t('Min {{token}} to be a staker', { replace: { token } })} value={info?.minNominatorBond} />
          <Row label={t('Min {{token}} to receive rewards', { replace: { token } })} value={minimumActiveStake && info?.minNominatorBond && bnMax(info.minNominatorBond, minimumActiveStake)} />
          <Row label={t('Max nominators of a validator, who may receive rewards')} value={info?.maxNominatorRewardedPerValidator} />
          <Row label={t('Days it takes to receive your funds back after unstaking')} value={info?.unbondingDuration} />
          <Row label={t('Min {{token}} that must remain in your account (ED)', { replace: { token } })} value={info?.existentialDeposit} />
        </Grid>
      </Collapse>
    </Grid>

  );
}
