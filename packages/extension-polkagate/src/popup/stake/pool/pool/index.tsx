// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { MyPoolInfo } from '../../../../util/types';

import { faPenToSquare, faPersonCircleXmark, faSquareArrowUpRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AutoDelete as AutoDeleteIcon, Block as BlockIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { PButton, Warning } from '../../../../components';
import { useApi, useChain, useFormatted, usePool, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import ShowPool from '../../partial/ShowPool';
import ShowRoles from '../../partial/ShowRoles';
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

export default function Pool(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { address } = useParams<{ address: string }>();
  const { state } = useLocation<State>();
  const api = useApi(address, state?.api);
  const pool = usePool(address, undefined, state?.pool);
  const history = useHistory();
  const chain = useChain(address);
  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');
  const formatted = useFormatted(address);

  const [goChange, setGoChange] = useState<boolean>(false);
  const [changeState, setChangeState] = useState<'Open' | 'Blocked' | 'Destroying'>();

  const poolState = pool?.bondedPool?.state.toString();
  const canChangeState = useMemo(() => pool?.bondedPool && formatted && [String(pool.bondedPool.roles.root), String(pool.bondedPool.roles.stateToggler)].includes(formatted), [pool, formatted]);

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
    console.log('goEdit')
  }, []);

  const goRemoveAll = useCallback(() => {
    console.log('goRemoveAll')
  }, []);

  const Buttons = ({ children, disabled, onClick, showDivider, text }: ButtonsProps) => (
    <>
      <Grid alignItems='center' container direction='row' item onClick={onClick} sx={{ cursor: disabled ? 'default' : 'pointer' }} width='fit-content'>
        {children}
        <Typography
          fontSize='14px'
          fontWeight={400}
          sx={{
            color: disabled ? 'action.disabledBackground' : 'text.primary',
            pl: '5px',
            textDecorationLine: 'underline'
          }}
          width='fit-content'
        >
          {text}
        </Typography>
      </Grid>
      {showDivider && <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', m: 'auto 2px', width: '2px' }} />}
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
          <Grid
            alignItems='center'
            container
            justifyContent='center'
            mt='100px'
          >
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={125} />
          </Grid>
          <Typography
            fontSize='18px'
            fontWeight={300}
            m='60px auto 0'
            textAlign='center'
            width='80%'
          >
            {t<string>('Loading your pool information...')}
          </Typography>
        </>
      }
      {pool === null &&
        <>
          <Grid
            container
            justifyContent='center'
            py='15px'
          >
            <Warning
              fontWeight={400}
              theme={theme}
            >
              {t<string>("You're not staked yet!")}
            </Warning>
          </Grid>
          <PButton _onClick={goToPoolStake} text={t<string>('Pool Stake')} />
        </>
      }
      {pool &&
        <>
          <ShowPool
            api={api}
            mode='Default'
            pool={pool}
            style={{
              m: '20px auto',
              width: '92%'
            }}
          />
          <ShowRoles chainName={chainName} label={t<string>('Roles')} mode='Roles' pool={pool} style={{ m: 'auto', width: '92%' }} />
          {canChangeState &&
            <Grid alignItems='center' container justifyContent='space-between' m='20px auto' width='92%'>
              <Buttons disabled={poolState === 'Destroying'} onClick={goDestroying} showDivider text={t<string>('Destroy')}>
                <AutoDeleteIcon sx={{ color: poolState === 'Destroying' ? 'action.disabledBackground' : 'text.primary', fontSize: '21px' }} />
              </Buttons>
              {poolState === 'Blocked'
                ? (<Buttons disabled={poolState === 'Destroying'} onClick={goUnlock} showDivider text={t<string>('Unblock')}>
                  <FontAwesomeIcon color={poolState === 'Destroying' ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='18px' icon={faSquareArrowUpRight} />
                </Buttons>)
                : (<Buttons disabled={poolState === 'Destroying'} onClick={goBlock} showDivider text={t<string>('Block')}>
                  <BlockIcon sx={{ color: poolState === 'Destroying' ? 'action.disabledBackground' : 'text.primary', fontSize: '21px' }} />
                </Buttons>)
              }
              <Buttons disabled={poolState !== 'Destroying'} onClick={goRemoveAll} showDivider text={t<string>('Remove all')}>
                <FontAwesomeIcon color={poolState !== 'Destroying' ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='18px' icon={faPersonCircleXmark} />
              </Buttons>
              <Buttons disabled={poolState === 'Destroying'} onClick={goEdit} text={t<string>('Edit')}>
                <FontAwesomeIcon color={poolState === 'Destroying' ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='18px' icon={faPenToSquare} />
              </Buttons>
            </Grid>
          }
        </>
      }
      {goChange && changeState &&
        <SetState
          api={api}
          chain={chain}
          formatted={formatted}
          pool={pool}
          address={address}
          setShow={setGoChange}
          show={goChange}
          state={changeState}
          helperText={t<string>('The pool state will be changed to Blocked, and no member will be able to join and only some admin roles can remove members.')}
          headerText={'Block Pool'}
        />
      }
    </>
  );
}
