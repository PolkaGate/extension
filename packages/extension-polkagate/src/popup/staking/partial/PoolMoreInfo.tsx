// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIos as ArrowForwardIosIcon, Close as CloseIcon } from '@mui/icons-material';
import { Collapse, Grid, IconButton, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, Progress, ShowBalance, SlidePopUp } from '../../../components';
import { usePool, usePoolMembers, useTranslation } from '../../../hooks';
import { MemberPoints, MyPoolInfo } from '../../../util/types';
import ShowPool from './ShowPool';
import ShowRoles from './ShowRoles';

interface Props {
  address?: string;
  api: ApiPromise;
  chain: Chain;
  pool: MyPoolInfo | undefined;
  poolId?: number;
  showPoolInfo: boolean;
  setShowPoolInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CollapseProps {
  mode: 'Roles' | 'Ids' | 'Members' | 'Reward';
  pool: MyPoolInfo;
  title: string;
  show: boolean;
  open: () => void;
}

export default function PoolMoreInfo({ address, api, chain, pool, poolId, setShowPoolInfo, showPoolInfo }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const poolToShow = usePool(address, poolId, false, pool);
  const poolMembers = usePoolMembers(api, poolToShow?.poolId?.toString());

  const membersToShow = useMemo(() => {
    if (!poolMembers) {
      return;
    }

    return poolMembers.map((m) => ({ accountId: m.accountId, points: m.member.points }) as MemberPoints);
  }, [poolMembers]);

  const [showRoles, setShowRoles] = useState<boolean>(true);
  const [showIds, setShowIds] = useState<boolean>(false);
  const [showMembers, setShowMembers] = useState<boolean>(false);
  const [showReward, setShowReward] = useState<boolean>(false);

  const _closeMenu = useCallback(
    () => setShowPoolInfo(false),
    [setShowPoolInfo]
  );

  const openRoles = useCallback(() => {
    setShowReward(false);
    setShowIds(false);
    setShowMembers(false);
    setShowRoles(!showRoles);
  }, [showRoles]);

  const openIds = useCallback(() => {
    setShowReward(false);
    setShowRoles(false);
    setShowMembers(false);
    setShowIds(!showIds);
  }, [showIds]);

  const openMembers = useCallback(() => {
    setShowRoles(false);
    setShowIds(false);
    setShowReward(false);
    setShowMembers(!showMembers);
  }, [showMembers]);

  const openReward = useCallback(() => {
    setShowRoles(false);
    setShowIds(false);
    setShowMembers(false);
    setShowReward(!showReward);
  }, [showReward]);

  const poolMemberStaked = (points) => {
    const staked = points ? api?.createType('Balance', points) : undefined;

    return staked;
  };

  const ShowMembers = () => (
    <Grid container direction='column' display='block' sx={{ '&::-webkit-scrollbar': { display: 'none', width: 0 }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', maxHeight: window.innerHeight - 450, minHeight: '80px', mt: '10px', overflowX: 'hidden', overflowY: 'scroll', scrollbarWidth: 'none' }}>
      <Grid container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
        <Grid item sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='70%'>
          <Typography fontSize='12px' fontWeight={300} lineHeight='30px' textAlign='center'>{t<string>('Identity')}</Typography>
        </Grid>
        <Grid item width='30%'>
          <Typography fontSize='12px' fontWeight={300} lineHeight='30px' textAlign='center'>{t<string>('Staked')}</Typography>
        </Grid>
      </Grid>
      {membersToShow?.length
        ? membersToShow.map((member, index) => (
          <Grid container item key={index} sx={{ '&:last-child': { border: 'none' }, borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
            <Identity address={member.accountId} api={api} chain={chain} formatted={member.accountId} identiconSize={25} showShortAddress style={{ borderRight: '1px solid', borderRightColor: 'secondary.main', fontSize: '18px', minHeight: '45px', pl: '10px', width: '70%' }} />
            <Grid alignItems='center' container item justifyContent='center' width='30%'>
              <ShowBalance
                api={api}
                balance={poolMemberStaked(member.points)}
                decimalPoint={2}
                height={22}
              />
            </Grid>
          </Grid>
        ))
        : <Grid alignItems='center' container justifyContent='center'>
          <Grid item>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
          </Grid>
          <Typography fontSize='13px' lineHeight='40px' pl='10px'>
            {t<string>('Loading pool members...')}
          </Typography>
        </Grid>
      }
    </Grid>
  );

  const ShowReward = () => (
    <Grid container sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', my: '10px' }}>
      <Grid container item justifyContent='center' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
        <Typography fontSize='12px' fontWeight={300} lineHeight='25px'>{t<string>('Pool Claimable')}</Typography>
      </Grid>
      <Grid alignItems='center' container height='37px' item justifyContent='center'>
        <ShowBalance
          api={api}
          balance={poolToShow?.rewardClaimable?.toString()}
          decimalPoint={4}
          height={22}
        />
      </Grid>
    </Grid>
  );

  const CollapseData = ({ mode, open, pool, show, title }: CollapseProps) => (
    <Grid container direction='column' m='auto' width='92%'>
      <Grid container item justifyContent='space-between' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
        <Typography fontSize='18px' fontWeight={400} lineHeight='40px'>{title}</Typography>
        <Grid alignItems='center' container item onClick={open} sx={{ cursor: 'pointer' }} xs={1}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: show ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
        </Grid>
      </Grid>
      <Collapse in={show} sx={{ width: '100%' }} timeout='auto' unmountOnExit>
        {(mode === 'Ids' || mode === 'Roles') &&
          <ShowRoles api={api} chain={chain} mode={mode} pool={pool} style={{ my: '10px' }} />
        }
        {mode === 'Members' &&
          <ShowMembers />
        }
        {mode === 'Reward' &&
          <ShowReward />
        }
      </Collapse>
    </Grid>
  );

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='28px' fontWeight={400} lineHeight={1.4}>
          {t<string>('Pool Info')}
        </Typography>
      </Grid>
      {poolToShow
        ? <>
          <ShowPool api={api} chain={chain} mode='Default' pool={poolToShow} style={{ m: '20px auto', width: '92%' }} />
          <CollapseData mode='Roles' open={openRoles} pool={poolToShow} show={showRoles} title={t<string>('Roles')} />
          {poolToShow.accounts?.rewardId && <CollapseData mode='Ids' open={openIds} pool={poolToShow} show={showIds} title={t<string>('Ids')} />}
          {poolToShow.accounts?.rewardId && <CollapseData mode='Members' open={openMembers} pool={poolToShow} show={showMembers} title={t<string>('Members')} />}
          {poolToShow.accounts?.rewardId && <CollapseData mode='Reward' open={openReward} pool={poolToShow} show={showReward} title={t<string>('Rewards')} />}
        </>
        : <Progress pt='95px' size={125} title={t('Loading pool information...')} />
      }
      <IconButton
        onClick={_closeMenu}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <SlidePopUp show={showPoolInfo}>
      {page}
    </SlidePopUp>
  );
}
