// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Container, Grid, Stack, styled, Typography } from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type BN } from '@polkadot/util';

import { CreatePoolIcon, JoinPoolIcon } from '../../../../assets/icons';
import { BackWithLabel, DisplayBalance, Motion } from '../../../../components';
import { useBackground, useChainInfo, useIsExtensionPopup, useIsHovered, usePoolConst, useSelectedAccount, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';

const OptionBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExtension' && prop !== 'isSelected'
})(({ isExtension, isSelected }: { isExtension: boolean, isSelected?: boolean; }) => ({
  backgroundColor: isExtension ? '#222540A6' : '#05091C',
  border: isExtension ? 'none' : isSelected ? '2px solid #FF4FB9' : '2px solid transparent',
  borderRadius: '14px',
  display: 'grid',
  padding: '16px 0 26px',
  position: 'relative',
  width: 'inherit'
}));

const Circle = styled(Grid)(() => ({
  backgroundColor: '#110F2A',
  borderRadius: '999px',
  height: '80px',
  position: 'absolute',
  right: '50%',
  top: '16px',
  transform: 'translateX(50%)',
  width: '80px'
}));

interface OptionProp {
  title: string;
  minimumText: string;
  decimal: number | undefined;
  token: string | undefined;
  icon: string;
  value: BN | undefined;
  onClick: () => void;
  isSelected?: boolean;
}

export const Option = ({ decimal, icon, isSelected, minimumText, onClick, title, token, value }: OptionProp) => {
  const isExtension = useIsExtensionPopup();
  const refContainer = useRef(null);
  const hovered = useIsHovered(refContainer);

  return (
    <OptionBox isExtension={isExtension} isSelected={isSelected} onClick={onClick} ref={refContainer} sx={{ cursor: 'pointer', transform: hovered ? 'scale(1.02)' : 'scale(1)', transition: 'all 250ms ease-out' }}>
      <Circle />
      <Box
        component='img'
        src={icon}
        sx={{ height: '100px', m: 'auto', width: '133px', zIndex: 1 }}
      />
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', m: 'auto', mb: '12px', width: 'fit-content' }}>
        <Typography color='text.primary' variant='B-3'>
          {title}
        </Typography>
        {isExtension &&
          <ArrowForwardIosIcon sx={{ color: 'text.primary', fontSize: '15px', transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'all 250ms ease-out' }} />}
      </Container>
      <Stack direction='column' sx={{ alignItems: 'center', gap: '4px', justifyContent: 'center', width: '100%' }}>
        <Typography color='text.highlight' variant='B-1'>
          {minimumText}
        </Typography>
        <DisplayBalance
          balance={value}
          decimal={decimal}
          skeletonStyle={{ height: '18px', width: '80px' }}
          token={token}
        />
      </Stack>
    </OptionBox>
  );
};

export default function Stake() {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string; }>();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const poolStakingConsts = usePoolConst(genesisHash);

  const joinPool = useCallback(() => navigate('/pool/' + genesisHash + '/join') as void, [genesisHash, navigate]);
  const createPool = useCallback(() => navigate('/pool/' + genesisHash + '/create') as void, [genesisHash, navigate]);
  const onBack = useCallback(() => navigate('/stakingIndex') as void, [navigate]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/pool/' + address + '/' + genesisHash} homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('Stake')}
          />
          <Container disableGutters sx={{ bgcolor: '#060518', borderRadius: '15px', display: 'flex', flexDirection: 'row', gap: '4px', m: '15px', p: '4px', width: 'calc(100% - 30px)' }}>
            <Option
              decimal={decimal}
              icon={JoinPoolIcon as string}
              minimumText={t('Minimum to join')}
              onClick={joinPool}
              title={t('Join Pool')}
              token={token}
              value={poolStakingConsts?.minJoinBond}
            />
            <Option
              decimal={decimal}
              icon={CreatePoolIcon as string}
              minimumText={t('Minimum to create')}
              onClick={createPool}
              title={t('Create Pool')}
              token={token}
              value={poolStakingConsts?.minCreationBond}
            />
          </Container>
        </Motion>
      </Grid>
    </>
  );
}
