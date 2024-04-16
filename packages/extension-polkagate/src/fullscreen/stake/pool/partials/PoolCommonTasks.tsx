// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faHand, faLock, faLockOpen, faPenToSquare, faPersonCircleXmark, faRightFromBracket, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AutoDelete as AutoDeleteIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { MenuItem } from '@polkadot/extension-polkagate/src/components';
import { TaskButton } from '@polkadot/extension-polkagate/src/fullscreen/accountDetailsFullScreen/components/CommonTasks';
import { useInfo, usePool, useTranslation, useUnSupportedNetwork } from '@polkadot/extension-polkagate/src/hooks';
import ManageValidators from '@polkadot/extension-polkagate/src/popup/staking/pool/nominations/index';
import { STAKING_CHAINS } from '@polkadot/extension-polkagate/src/util/constants';
import { BN } from '@polkadot/util';

import EditPool from '../commonTasks/editPool';
import LeavePool from '../commonTasks/leavePool';
import RemoveAll from '../commonTasks/removeAll';
import SetState from '../commonTasks/SetState';

interface Props {
  address: string | undefined;
}

const MODALS_NUMBER = {
  NO_MODALS: 0,
  MANAGE_VALIDATORS: 1,
  EDIT_POOL: 2,
  CHANGE_STATE: 3,
  LEAVE: 4,
  REMOVE_ALL: 5
};

export type PoolState = 'Destroying' | 'Open' | 'Blocked';

export default function PoolCommonTasks({ address }: Props): React.ReactElement {
  useUnSupportedNetwork(address, STAKING_CHAINS);
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, formatted } = useInfo(address);

  const [showManagePool, setShowManagePool] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<number>(MODALS_NUMBER.NO_MODALS);
  const [state, setState] = useState<PoolState>();
  const [refresh, setRefresh] = useState<boolean>(false);

  const pool = usePool(address, undefined, refresh);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const poolState = useMemo(() => pool?.bondedPool?.state?.toString(), [pool?.bondedPool?.state]);
  const canChangeState = useMemo(() => pool?.bondedPool && formatted && [String(pool?.bondedPool?.roles?.root), String(pool?.bondedPool?.roles?.bouncer)].includes(String(formatted)), [pool?.bondedPool, formatted]);
  const poolRoot = useMemo(() => pool?.bondedPool && formatted && String(pool?.bondedPool?.roles?.root) === (String(formatted)), [pool?.bondedPool, formatted]);
  const poolBouncer = useMemo(() => pool?.bondedPool && formatted && String(pool?.bondedPool?.roles?.bouncer) === (String(formatted)), [formatted, pool?.bondedPool]);
  const isRemoveAllDisabled = !['Destroying', 'Blocked'].includes(poolState ?? '') || (pool && Number(pool?.bondedPool?.memberCounter) === 1);
  const isPoolBlocked = useMemo(() => pool?.bondedPool?.state.toString() === 'Blocked', [pool?.bondedPool?.state]);
  const justMember = useMemo(() => !([String(pool?.bondedPool?.roles?.root), String(pool?.bondedPool?.roles?.bouncer), String(pool?.bondedPool?.roles?.nominator), String(pool?.bondedPool?.roles?.depositor)].includes(String(formatted))), [formatted, pool?.bondedPool?.roles?.bouncer, pool?.bondedPool?.roles?.depositor, pool?.bondedPool?.roles?.nominator, pool?.bondedPool?.roles?.root]);
  const staked = useMemo(() => {
    if (!justMember || !pool) {
      return undefined;
    }

    return new BN(pool.member?.points ?? '0');
  }, [justMember, pool]);

  const onManageValidators = useCallback(() => {
    setShowModal(MODALS_NUMBER.MANAGE_VALIDATORS);
  }, []);

  const onEditPool = useCallback(() => {
    setShowModal(MODALS_NUMBER.EDIT_POOL);
  }, []);

  const onLockPool = useCallback(() => {
    setState('Blocked');
    setShowModal(MODALS_NUMBER.CHANGE_STATE);
  }, []);

  const onUnlockPool = useCallback(() => {
    setState('Open');
    setShowModal(MODALS_NUMBER.CHANGE_STATE);
  }, []);

  const onDestroyPool = useCallback(() => {
    setState('Destroying');
    setShowModal(MODALS_NUMBER.CHANGE_STATE);
  }, []);

  const onRemoveAll = useCallback(() => {
    setShowModal(MODALS_NUMBER.REMOVE_ALL);
  }, []);

  const onLeavePool = useCallback(() => {
    setShowModal(MODALS_NUMBER.LEAVE);
  }, []);

  const resetModal = useCallback(() => {
    setShowModal(MODALS_NUMBER.NO_MODALS);
  }, []);

  const toggleManagePool = useCallback(() => {
    setShowManagePool(!showManagePool);
  }, [showManagePool]);

  return (
    <>
      <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='inherit'>
        <Typography fontSize='22px' fontWeight={700}>
          {t('Most common tasks')}
        </Typography>
        <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto 15px', width: '90%' }} />
        <Grid alignItems='center' container direction='column' display='block' item justifyContent='center'>
          <TaskButton
            disabled={!justMember || !staked || staked.isZero()}
            icon={
              <FontAwesomeIcon
                color={poolState === 'Destroying' || !poolRoot ? theme.palette.action.disabledBackground : theme.palette.text.primary}
                fontSize='22px'
                icon={faRightFromBracket}
              />
            }
            mr='0px'
            noBorderButton={justMember}
            onClick={onLeavePool}
            secondaryIconType='popup'
            text={t('Leave Pool')}
          />
          <TaskButton
            disabled={poolState === 'Destroying' || !poolRoot}
            icon={
              <FontAwesomeIcon
                color={`${poolState === 'Destroying' || !poolRoot ? theme.palette.action.disabledBackground : theme.palette.text.primary}`}
                fontSize='22px'
                icon={faHand}
              />
            }
            mr='0px'
            onClick={onManageValidators}
            secondaryIconType='popup'
            show={!justMember}
            text={t('Manage Validators')}
          />
          {!justMember && canChangeState &&
            <Grid container item sx={{ '> div': { px: '12px' }, mx: 'auto', width: '90%' }}>
              <MenuItem
                iconComponent={
                  <FontAwesomeIcon
                    color={`${!poolRoot ? theme.palette.action.disabledBackground : theme.palette.text.primary}`}
                    fontSize='22px'
                    icon={faWrench}
                  />
                }
                onClick={toggleManagePool}
                showSubMenu={showManagePool}
                text={t('Manage Pool')}
                withHoverEffect
              >
                <Collapse in={showManagePool} sx={{ width: '100%' }}>
                  <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto', width: '100%' }} />
                  <TaskButton
                    disabled={poolState === 'Destroying' || !poolRoot}
                    icon={
                      <FontAwesomeIcon
                        color={poolState === 'Destroying' || !poolRoot ? theme.palette.action.disabledBackground : theme.palette.text.primary}
                        fontSize='22px'
                        icon={faPenToSquare}
                      />
                    }
                    mr='0px'
                    onClick={onEditPool}
                    secondaryIconType='popup'
                    text={t('Edit Pool')}
                  />
                  <TaskButton
                    disabled={isRemoveAllDisabled || (!poolRoot && !poolBouncer)}
                    icon={
                      <FontAwesomeIcon
                        color={isRemoveAllDisabled || (!poolRoot && !poolBouncer) ? theme.palette.action.disabledBackground : theme.palette.text.primary}
                        fontSize='22px'
                        icon={faPersonCircleXmark}
                      />
                    }
                    mr='0px'
                    onClick={onRemoveAll}
                    secondaryIconType='popup'
                    text={t('Remove All')}
                  />
                  <TaskButton
                    disabled={poolState === 'Destroying' || (!poolRoot && !poolBouncer)}
                    icon={
                      <FontAwesomeIcon
                        color={poolState === 'Destroying' || (!poolRoot && !poolBouncer) ? theme.palette.action.disabledBackground : theme.palette.text.primary}
                        fontSize='20px'
                        icon={poolState !== 'Block' ? faLock : faLockOpen}
                      />
                    }
                    mr='0px'
                    onClick={isPoolBlocked ? onUnlockPool : onLockPool}
                    secondaryIconType='popup'
                    text={isPoolBlocked ? t('Unlock Pool') : t('Lock Pool')}
                  />
                  <TaskButton
                    disabled={poolState === 'Destroying' || (!poolRoot && !poolBouncer)}
                    icon={
                      <AutoDeleteIcon
                        sx={{ color: poolState === 'Destroying' || (!poolRoot && !poolBouncer) ? 'action.disabledBackground' : 'text.primary', fontSize: '23px' }}
                      />
                    }
                    mr='0px'
                    noBorderButton
                    onClick={onDestroyPool}
                    secondaryIconType='popup'
                    text={t('Destroy Pool')}
                  />
                </Collapse>
              </MenuItem>
            </Grid>}
        </Grid>
      </Grid>
      {MODALS_NUMBER.MANAGE_VALIDATORS === showModal &&
        <ManageValidators />
      }
      {MODALS_NUMBER.EDIT_POOL === showModal && pool && address &&
        <EditPool
          address={address}
          api={api}
          chain={chain}
          onClose={resetModal}
          pool={pool}
          setRefresh={setRefresh}
        />
      }
      {MODALS_NUMBER.CHANGE_STATE === showModal && pool && address && state && formatted && chain &&
        <SetState
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          onClose={resetModal}
          pool={pool}
          setRefresh={setRefresh}
          state={state}
        />
      }
      {MODALS_NUMBER.LEAVE === showModal && address && pool &&
        <LeavePool
          address={address}
          onClose={resetModal}
          pool={pool}
          setRefresh={setRefresh}
        />
      }
      {MODALS_NUMBER.REMOVE_ALL === showModal && address && pool &&
        <RemoveAll
          address={address}
          api={api}
          chain={chain}
          onClose={resetModal}
          pool={pool}
          setRefresh={setRefresh}
        />
      }
    </>
  );
}
