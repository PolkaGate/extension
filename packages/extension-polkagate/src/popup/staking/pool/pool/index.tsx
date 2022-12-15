// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { MyPoolInfo } from '../../../../util/types';

import { faPenToSquare, faPersonCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AutoDelete as AutoDeleteIcon, LockOpenRounded as UnblockIcon, LockPersonRounded as BlockIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { PButton, Warning } from '../../../../components';
import { useApi, useChain, useFormatted, usePool, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import ShowPool from '../../partial/ShowPool';
import ShowRoles from '../../partial/ShowRoles';
import EditPool from './editPool';
import RemoveAll from './removeAll';
import SetState from './SetState';

interface State {
  api: ApiPromise | undefined;
  pool?: MyPoolInfo;
}

interface ButtonsProps {
  children: any;
  disabled?: boolean;
  text: string;
  showDivider?: boolean;
  onClick: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };

export default function Pool(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { address } = useParams<{ address: string }>();
  const { state } = useLocation<State>();
  const api = useApi(address, state?.api);
  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, state?.pool, refresh);
  const history = useHistory();
  const chain = useChain(address);
  const formatted = useFormatted(address);

  const [goChange, setGoChange] = useState<boolean>(false);
  const [changeState, setChangeState] = useState<'Open' | 'Blocked' | 'Destroying'>();
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showRemoveAll, setShowRemoveAll] = useState<boolean>(false);

  const poolState = pool?.bondedPool?.state?.toString();
  const canChangeState = useMemo(() => pool?.bondedPool && formatted && [String(pool.bondedPool.roles.root), String(pool.bondedPool.roles.stateToggler)].includes(String(formatted)), [pool, formatted]);
  const poolRoot = useMemo(() => pool?.bondedPool && formatted && String(pool.bondedPool.roles.root) === (String(formatted)), [pool, formatted]);

  const blockHelperText = t<string>('The pool state will be changed to Blocked, and no member will be able to join and only some admin roles can remove members.');
  const destroyHelperText = t<string>('No one can join and all members can be removed without permissions. Once in destroying state, it cannot be reverted to another state.');
  const unblockHelperText = t<string>('The pool state will be changed to Open, and any member will be able to join the pool.');
  const isRemoveAllDisabled = !['Destroying', 'Blocked'].includes(poolState ?? '') || pool?.bondedPool?.memberCounter === 1;

  const backToStake = useCallback(() => {
    history.push({
      pathname: `/pool/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const goToPoolStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const goBlock = useCallback(() => {
    if (poolState === 'Destroying' || poolState === 'Blocked') {
      return;
    }

    setGoChange(true);
    setChangeState('Blocked');
  }, [poolState]);

  const goUnlock = useCallback(() => {
    if (poolState === 'Destroying' || poolState !== 'Blocked') {
      return;
    }

    setGoChange(true);
    setChangeState('Open');
  }, [poolState]);

  const goDestroying = useCallback(() => {
    if (poolState === 'Destroying') {
      return;
    }

    setGoChange(true);
    setChangeState('Destroying');
  }, [poolState]);

  const goEdit = useCallback(() => {
    setShowEdit(!showEdit);
  }, [showEdit]);

  const goRemoveAll = useCallback(() => {
    setShowRemoveAll(!showRemoveAll);
  }, [showRemoveAll]);

  const ActionBtn = ({ children, disabled, onClick, showDivider, text }: ButtonsProps) => (
    <>
      <Grid alignItems='center' container direction='row' item onClick={!disabled ? onClick : noop} sx={{ cursor: disabled ? 'default' : 'pointer' }} width='fit-content'>
        {children}
        <Typography fontSize='14px' fontWeight={400} sx={{ color: disabled ? 'action.disabledBackground' : 'text.primary', pl: '5px', textDecorationLine: 'underline' }} width='fit-content'>
          {text}
        </Typography>
      </Grid>
      {showDivider &&
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', m: 'auto 2px', width: '2px' }} />
      }
    </>
  );

  return (
    <>
      <HeaderBrand
        onBackClick={backToStake}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t<string>('Pool')} />
      {pool === undefined &&
        <>
          <Grid alignItems='center' container justifyContent='center' mt='100px'>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={125} />
          </Grid>
          <Typography
            fontSize='18px'
            fontWeight={300}
            m='60px auto 0'
            textAlign='center'
            width='80%'
          >
            {t<string>('Loading pool information...')}
          </Typography>
        </>
      }
      {pool === null &&
        <>
          <Grid container justifyContent='center' py='15px'>
            <Warning
              fontWeight={400}
              theme={theme}
            >
              {t<string>('You\'re not in any pools!')}
            </Warning>
          </Grid>
          <PButton _onClick={goToPoolStake} text={t<string>('Stake')} />
        </>
      }
      {pool &&
        <>
          <ShowPool
            api={api}
            chain={chain}
            mode='Default'
            pool={pool}
            showInfo
            style={{
              m: '20px auto',
              width: '92%'
            }}
          />
          <ShowRoles api={api} chain={chain} label={t<string>('Roles')} mode='Roles' pool={pool} style={{ m: 'auto', width: '92%' }} />
          {canChangeState &&
            <Grid alignItems='center' container justifyContent='space-between' m='20px auto' width='92%'>
              <ActionBtn disabled={poolState === 'Destroying'} onClick={goDestroying} showDivider text={t<string>('Destroy')}>
                <AutoDeleteIcon sx={{ color: poolState === 'Destroying' ? 'action.disabledBackground' : 'text.primary', fontSize: '21px' }} />
              </ActionBtn>
              {poolState === 'Blocked'
                ? (<ActionBtn onClick={goUnlock} showDivider text={t<string>('Unblock')}>
                  <UnblockIcon sx={{ color: 'text.primary', fontSize: '18px' }} />
                </ActionBtn>)
                : (<ActionBtn disabled={poolState === 'Destroying'} onClick={goBlock} showDivider text={t<string>('Block')}>
                  <BlockIcon sx={{ color: poolState === 'Destroying' ? 'action.disabledBackground' : 'text.primary', fontSize: '21px' }} />
                </ActionBtn>)
              }
              <ActionBtn disabled={isRemoveAllDisabled} onClick={goRemoveAll} showDivider text={t<string>('Remove all')}>
                <FontAwesomeIcon color={isRemoveAllDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='18px' icon={faPersonCircleXmark} />
              </ActionBtn>
              <ActionBtn disabled={poolState === 'Destroying' || !poolRoot} onClick={goEdit} text={t<string>('Edit')}>
                <FontAwesomeIcon color={(poolState === 'Destroying' || !poolRoot) ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='18px' icon={faPenToSquare} />
              </ActionBtn>
            </Grid>
          }
        </>
      }
      {goChange && changeState && pool && formatted &&
        <SetState
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          headerText={changeState === 'Blocked' ? 'Block Pool' : changeState === 'Open' ? 'Unblock Pool' : 'Destroy Pool'}
          helperText={changeState === 'Blocked' ? blockHelperText : changeState === 'Open' ? unblockHelperText : destroyHelperText}
          pool={pool}
          setRefresh={setRefresh}
          setShow={setGoChange}
          show={goChange}
          state={changeState}
        />
      }
      {showEdit && pool &&
        <EditPool
          address={address}
          apiToUse={api}
          pool={pool}
          setRefresh={setRefresh}
          setShowEdit={setShowEdit}
          showEdit={showEdit}
        />
      }
      {showRemoveAll && pool &&
        <RemoveAll
          address={address}
          api={api}
          pool={pool}
          setRefresh={setRefresh}
          setShowRemoveAll={setShowRemoveAll}
          showRemoveAll={showRemoveAll}
        />
      }
    </>
  );
}
