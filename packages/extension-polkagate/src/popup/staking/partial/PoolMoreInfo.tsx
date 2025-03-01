// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/src/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { FormattedAddressState, MemberPoints, MyPoolInfo, PoolInfo } from '../../../util/types';

import { ArrowForwardIos as ArrowForwardIosIcon, Close as CloseIcon } from '@mui/icons-material';
import { Collapse, Grid, IconButton, Typography, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import useIsExtensionPopup from '@polkadot/extension-polkagate/src/hooks/useIsExtensionPopup';
import { BN, BN_ONE } from '@polkadot/util';

import { Identity, PButton, Progress, ShowBalance, SlidePopUp } from '../../../components';
import { useInfo, usePool, usePoolMembers, useTranslation } from '../../../hooks';
import ClaimCommission from '../pool/claimCommission';
import ShowPool from './ShowPool';
import ShowRoles from './ShowRoles';

interface Props {
  address?: string;
  api: ApiPromise | undefined;
  chain: Chain;
  pool: MyPoolInfo | PoolInfo | undefined;
  poolId?: number;
  showPoolInfo: boolean;
  setShowPoolInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

type TabTitles = 'Commission' | 'Ids' | 'Members' | 'Reward' | 'Roles' | 'None';
interface CollapseProps {
  title: string;
  show: boolean;
  open: () => void;
  children: React.ReactNode;
}

interface InsidersProps {
  address: string;
  poolToShow: MyPoolInfo;
  setShowClaimCommission?: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

const ShowMembers = ({ address, poolToShow }: InsidersProps) => {
  const { t } = useTranslation();
  const isExtensionPopup = useIsExtensionPopup();

  const { api, chain, decimal, token } = useInfo(address);

  const poolMembers = usePoolMembers(api, poolToShow?.poolId?.toString());
  const poolPoints = useMemo(() => (poolToShow?.bondedPool ? new BN(String(poolToShow.bondedPool.points)) : BN_ONE), [poolToShow]);

  const toBalance = (points: BN) => {
    const staked = points ? api?.createType('Balance', points) : undefined;

    return staked;
  };

  const percent = useCallback((memberPoints: BN) => {
    return (Number(memberPoints.muln(100)) / Number(poolPoints.isZero() ? BN_ONE : poolPoints)).toFixed(2);
  }, [poolPoints]);

  const membersToShow = useMemo(() => {
    if (!poolMembers) {
      return;
    }

    return poolMembers.map((m) => ({ accountId: m.accountId, points: m.member.points }) as MemberPoints);
  }, [poolMembers]);

  return (
    <Grid container direction='column' display='block' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', maxHeight: isExtensionPopup ? '130px' : '220px', minHeight: '80px', mt: '10px', overflowX: 'hidden', overflowY: 'scroll' }}>
      <Grid container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
        <Grid item width='50%'>
          <Typography fontSize='12px' fontWeight={300} lineHeight='30px' textAlign='center'>
            {t('Identity')}
          </Typography>
        </Grid>
        <Grid item sx={{ borderColor: 'secondary.light', borderInline: '1px solid' }} width='30%'>
          <Typography fontSize='12px' fontWeight={300} lineHeight='30px' textAlign='center'>
            {t('Staked')}
          </Typography>
        </Grid>
        <Grid item width='20%'>
          <Typography fontSize='12px' fontWeight={300} lineHeight='30px' textAlign='center'>
            {t('Percent')}
          </Typography>
        </Grid>
      </Grid>
      {membersToShow?.length
        ? membersToShow.map((member, index) => (
          <Grid container item key={index} sx={{ '&:last-child': { border: 'none' }, borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
            <Identity address={member.accountId} api={api} chain={chain} formatted={member.accountId} identiconSize={25} showShortAddress style={{ fontSize: '14px', minHeight: '45px', width: '50%' }} />
            <Grid alignItems='center' container fontSize='14px' fontWeight='400' item justifyContent='center' sx={{ borderColor: 'secondary.light', borderInline: '1px solid' }} width='30%'>
              <ShowBalance
                balance={toBalance(member.points) as Balance}
                decimal={decimal}
                decimalPoint={2}
                height={22}
                token={token}
              />
            </Grid>
            <Typography fontSize='14px' fontWeight='400' lineHeight='45px' textAlign='center' width='20%'>
              {percent(member.points)}%
            </Typography>
          </Grid>
        ))
        : <Grid alignItems='center' container justifyContent='center'>
          <Grid item>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
          </Grid>
          <Typography fontSize='13px' lineHeight='40px' pl='10px'>
            {t('Loading pool members...')}
          </Typography>
        </Grid>
      }
    </Grid>
  );
};

const ShowReward = ({ address, poolToShow }: InsidersProps) => {
  const { t } = useTranslation();
  const { decimal, token } = useInfo(address);

  return (
    <Grid container sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', my: '10px' }}>
      <Grid container item justifyContent='center' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
        <Typography fontSize='12px' fontWeight={300} lineHeight='25px'>
          {t('Pool Claimable')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container height='37px' item justifyContent='center'>
        <ShowBalance
          balance={poolToShow?.rewardClaimable?.toString()}
          decimal={decimal}
          decimalPoint={4}
          height={22}
          token={token}
        />
      </Grid>
    </Grid>
  );
};

const ShowClaimableCommission = ({ address, poolToShow, setShowClaimCommission }: InsidersProps) => {
  const { t } = useTranslation();
  const isExtensionPopup = useIsExtensionPopup();
  const { decimal, formatted, token } = useInfo(address);

  const onClaimCommission = useCallback(() => {
    setShowClaimCommission && setShowClaimCommission(true);
  }, [setShowClaimCommission]);

  return (
    <Grid container sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', my: '10px', pb: '5px' }}>
      <Grid container item justifyContent='center' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
        <Typography fontSize='12px' fontWeight={300} lineHeight='25px'>
          {t('Claimable Commission')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container height='37px' item justifyContent='center'>
        <ShowBalance
          balance={poolToShow?.rewardPool?.totalCommissionPending?.toString()}
          decimal={decimal}
          decimalPoint={4}
          height={22}
          token={token}
        />
      </Grid>
      <PButton
        _mt='2px'
        _onClick={onClaimCommission}
        _variant='contained'
        /** We disabled claim commission in fullscreen */
        disabled={
          !isExtensionPopup ||
          poolToShow?.rewardPool?.totalCommissionPending as unknown as number === 0 ||
          poolToShow?.bondedPool?.roles?.root as unknown as string !== formatted
        }
        text={t('Claim')}
      />
    </Grid>
  );
};

const CollapseData = ({ children, open, show, title }: CollapseProps) => {
  const theme = useTheme();

  return (
    <Grid container direction='column' sx={{ m: 'auto', width: '92%' }}>
      <Grid container item justifyContent='space-between' onClick={open} sx={{ borderBottom: '1px solid', borderBottomColor: 'divider', cursor: 'pointer' }}>
        <Typography fontSize='18px' fontWeight={400} lineHeight='40px'>
          {title}
        </Typography>
        <Grid alignItems='center' container item xs={1}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: show ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
        </Grid>
      </Grid>
      <Collapse in={show} sx={{ width: '100%' }}>
        {children}
      </Collapse>
    </Grid>
  );
};

export default function PoolMoreInfo({ api, chain, pool, poolId, setShowPoolInfo, showPoolInfo }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const isExtensionPopup = useIsExtensionPopup();

  const { address } = useParams<FormattedAddressState>();
  const { formatted } = useInfo(address);
  const poolToShow = usePool(address, poolId, false, pool);
  const [itemToShow, setShow] = useState<TabTitles>('None');
  const [showClaimCommission, setShowClaimCommission] = useState<boolean>();

  const _closeMenu = useCallback(
    () => setShowPoolInfo(false),
    [setShowPoolInfo]
  );

  const openTab = useCallback((tab: TabTitles) => () => {
    setShow(tab === itemToShow ? 'None' : tab);
  }, [itemToShow]);

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt={isExtensionPopup ? '46px' : 0} sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='20px' fontWeight={400} lineHeight={1.4}>
          {t('Pool Info')}
        </Typography>
      </Grid>
      {poolToShow
        ? <Grid container direction='column' item rowGap='5px'>
          <ShowPool
            api={api}
            chain={chain}
            mode='Default'
            pool={poolToShow}
            style={{ m: '10px auto', width: '92%' }}
          />
          <CollapseData
            open={openTab('Roles')}
            show={itemToShow === 'Roles'}
            title={t('Roles')}
          >
            <ShowRoles
              api={api}
              chain={chain}
              mode='Roles'
              pool={pool}
              style={{ my: '10px' }}
            />
          </CollapseData>
          {poolToShow.accounts?.rewardId &&
            <CollapseData
              open={openTab('Ids')}
              show={itemToShow === 'Ids'}
              title={t('Ids')}
            >
              <ShowRoles
                api={api}
                chain={chain}
                mode='Ids'
                pool={pool}
                style={{ my: '10px' }}
              />
            </CollapseData>
          }
          {poolToShow.accounts?.rewardId &&
            <CollapseData
              open={openTab('Members')}
              show={itemToShow === 'Members'}
              title={t('Members')}
            >
              <ShowMembers
                address={address}
                poolToShow={pool as MyPoolInfo}
              />
            </CollapseData>
          }
          {poolToShow.accounts?.rewardId &&
            <CollapseData
              open={openTab('Reward')}
              show={itemToShow === 'Reward'}
              title={t('Rewards')}
            >
              <ShowReward
                address={address}
                poolToShow={pool as MyPoolInfo}
              />
            </CollapseData>
          }
          {poolToShow.bondedPool?.roles && Object.values(poolToShow.bondedPool.roles).includes(formatted) &&
            <CollapseData
              open={openTab('Commission')}
              show={itemToShow === 'Commission'}
              title={t('Commission')}
            >
              <ShowClaimableCommission
                address={address}
                poolToShow={pool as MyPoolInfo}
                setShowClaimCommission={setShowClaimCommission}
              />
            </CollapseData>
          }
          {showClaimCommission && poolToShow &&
            <ClaimCommission
              address={address}
              pool={poolToShow}
              setShow={setShowClaimCommission}
              show={showClaimCommission}
            />
          }
        </Grid>
        : <Progress pt='95px' size={125} title={t('Loading pool information...')} type='grid' />
      }
      <IconButton onClick={_closeMenu} sx={{ left: isExtensionPopup ? '15px' : undefined, p: 0, position: 'absolute', right: isExtensionPopup ? undefined : '30px', top: isExtensionPopup ? '65px' : '35px' }}>
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <>
      {isExtensionPopup
        ? <SlidePopUp show={showPoolInfo}>
          {page}
        </SlidePopUp>
        : <DraggableModal blurBackdrop minHeight={650} onClose={_closeMenu} open={showPoolInfo} pt={0} px={0}>
          {page}
        </DraggableModal>
      }
    </>
  );
}
