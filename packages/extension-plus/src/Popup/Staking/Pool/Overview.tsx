// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable header/header */
/* eslint-disable react/jsx-first-prop-new-line */

/**
 * @description
 *  render an overview of current staking state of an account like currently staked/redemmable amount,
 *  claimable reward, etc.
 * */

import type { MyPoolInfo } from '../../../util/plusTypes';

import { AddCircleOutline as AddCircleOutlineIcon, MoreHoriz as MoreHorizIcon, Redeem as RedeemIcon, SystemUpdateAltOutlined as SystemUpdateAltOutlinedIcon } from '@mui/icons-material';
import { Grid, Grow, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import useTranslation from '../../../../../extension-ui/src/hooks/useTranslation';
import { ShowBalance2 } from '../../../components';

interface Props {
  availableBalance: BN,
  api: ApiPromise | undefined;
  myPool: MyPoolInfo | undefined | null;
  handleConfirmStakingModalOpen: (state?: string | undefined, amount?: BN | undefined) => void;
  currentEraIndex: number | undefined;
}

export default function Overview({ api, availableBalance, currentEraIndex, handleConfirmStakingModalOpen, myPool }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [redeemable, setRedeemable] = useState<BN | undefined>();
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();

  const staked = myPool === undefined ? undefined : new BN(myPool?.member?.points ?? 0);
  const claimable = useMemo(() => myPool === undefined ? undefined : new BN(myPool?.myClaimable ?? 0), [myPool]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (myPool === undefined || !api || !currentEraIndex) {
      return;
    }

    let unlockingValue = BN_ZERO;
    let redeemValue = BN_ZERO;

    if (myPool !== null && myPool.member?.unbondingEras) { // if pool is fetched but account belongs to no pool then pool===null
      for (const [era, unbondingPoint] of Object.entries(myPool.member?.unbondingEras)) {
        if (currentEraIndex > Number(era)) {
          redeemValue = redeemValue.add(new BN(unbondingPoint as string));
        } else {
          unlockingValue = unlockingValue.add(new BN(unbondingPoint as string));
        }
      }
    }

    setRedeemable(redeemValue);
    setUnlockingAmount(unlockingValue);
  }, [myPool, api, currentEraIndex]);

  const handleWithdrawUnbounded = useCallback(() => {
    handleConfirmStakingModalOpen('withdrawUnbound', redeemable);
  }, [redeemable, handleConfirmStakingModalOpen]);

  const handleRewardsMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClaim = useCallback(() => {
    handleClose();
    claimable?.gtn(0) && handleConfirmStakingModalOpen('withdrawClaimable', claimable);
  }, [claimable, handleClose, handleConfirmStakingModalOpen]);

  const handleStakeClaimable = useCallback(() => {
    handleClose();
    claimable?.gtn(0) && handleConfirmStakingModalOpen('bondExtraRewards', claimable);
  }, [claimable, handleClose, handleConfirmStakingModalOpen]);

  return (
    <>
      <Paper elevation={4} sx={{ borderRadius: '10px', fontSize: 12, height: 95, margin: '25px 30px 10px', p: 2, width: '90%' }}>
        <Grid container>
          <Grid item sx={{ flexGrow: 1 }}>
            <Grid alignItems='center' container item justifyContent='space-between' sx={{ pb: '20px', textAlign: 'center' }}>
              <Grid item xs={4}>
                <ShowBalance2 api={api} balance={availableBalance} direction='column' title={t('Available')} />
              </Grid>
              <Grid item xs={4}>
                <ShowBalance2 api={api} balance={staked} direction='column' title={t('Staked')} />
              </Grid>
            </Grid>
            <Grid container item justifyContent='space-between' sx={{ textAlign: 'center' }}>
              <Grid item xs={4}>
                <ShowBalance2 api={api} balance={claimable} direction='column'
                  title={
                    <Grid container item justifyContent='center'>
                      <Grid item>
                        {t('Rewards')}
                      </Grid>
                      <Grid item>
                        <Tooltip placement='top' title={t('Reward decision')}>
                          <MoreHorizIcon
                            color={claimable?.gtn(0) ? 'warning' : 'disabled'}
                            onClick={handleRewardsMenuClick}
                            sx={{ cursor: 'pointer', fontSize: 15 }}
                          />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  }
                />
              </Grid>
              <Grid container item justifyContent='center' xs={4}>
                <ShowBalance2 api={api} balance={redeemable} direction='column'
                  title={
                    <Grid container item justifyContent='center'>
                      <Grid item>
                        {t('Redeemable')}
                      </Grid>
                      <Grid item>
                        <Tooltip placement='top' title={t('Withdraw unbounded')}>
                          <RedeemIcon color={redeemable?.gtn(0) ? 'warning' : 'disabled'} onClick={handleWithdrawUnbounded} sx={{ cursor: 'pointer', fontSize: 15 }} />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <ShowBalance2 api={api} balance={unlockingAmount} direction='column' title={t('Unstaking')} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <Menu
        TransitionComponent={Grow}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        onClose={handleClose}
        open={open}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <MenuList dense>
          <MenuItem color={claimable?.gtn(0) ? 'warning' : 'disabled'} onClick={handleClaim}>
            <ListItemIcon>
              <SystemUpdateAltOutlinedIcon />
            </ListItemIcon>
            <ListItemText>
              <Typography variant='caption'> {t('Claim')} </Typography>
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleStakeClaimable}>
            <ListItemIcon>
              <AddCircleOutlineIcon />
            </ListItemIcon>
            <ListItemText>
              <Typography variant='caption'> {t('Stake')} </Typography>
            </ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}
