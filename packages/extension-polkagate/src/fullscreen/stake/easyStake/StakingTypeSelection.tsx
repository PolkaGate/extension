// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../util/types';

import { Collapse, Container, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight2, Discover } from 'iconsax-react';
import React, { useCallback } from 'react';

import { noop } from '@polkadot/util';

import { FormatBalance2 } from '../../../components';
import { useChainInfo, usePoolConst, useStakingConsts2, useTranslation } from '../../../hooks';
import PRadio from '../../../popup/staking/components/Radio';
import { StakingInfoStack } from '../../../popup/staking/partial/NominatorsTable';
import { PoolIdenticon } from '../../../popup/staking/partial/PoolIdenticon';
import { isHexToBn } from '../../../util/utils';
import StakingIcon from '../partials/StakingIcon';
import { EasyStakeSide, type SelectedEasyStakingType } from '../util/utils';

const LoadingPoolInformation = () => (
  <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#1B133C', borderRadius: '10px', display: 'flex', flexDirection: 'row', p: '2px', pl: '16px' }}>
    <Skeleton animation='wave' height='24px' sx={{ borderRadius: '999px', transform: 'none', width: '24px' }} variant='text' />
    <Stack direction='column' sx={{ gap: '4px', ml: '12px', width: 'fit-content' }}>
      <Skeleton animation='wave' height='20px' sx={{ borderRadius: '6px', transform: 'none', width: '190px' }} variant='text' />
      <Skeleton animation='wave' height='20px' sx={{ borderRadius: '6px', transform: 'none', width: '90px' }} variant='text' />
    </Stack>
    <Skeleton animation='wave' height='55px' sx={{ borderRadius: '6px', ml: 'auto', transform: 'none', width: '35px' }} variant='text' />
  </Container>
);

interface SelectedValidatorsInformationProps {
  validators: string[] | undefined;
  onClick: (event: React.MouseEvent) => void;
  open: boolean;
}

const SelectedValidatorsInformation = ({ onClick, open, validators }: SelectedValidatorsInformationProps) => {
  const { t } = useTranslation();

  return (
    <Collapse in={open}>
      {validators
        ? (
          <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#1B133C', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'row', p: '2px', pl: '16px' }}>
            <Discover color='#AA83DC' size='24' variant='Bulk' />
            <Stack direction='column' sx={{ ml: '10px', mr: 'auto', width: 'fit-content' }}>
              <Typography color='text.primary' sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
                {`${validators.length} ` + t('Validators')}
              </Typography>
              <Typography color='#82FFA5' variant='B-5'>
                {t('Recommended')}
              </Typography>
            </Stack>
            <Grid container item sx={{ bgcolor: '#2D1E4A', borderRadius: '6px', p: '20px 10px', width: 'fit-content' }}>
              <ArrowRight2 color='#AA83DC' size='18' variant='Bold' />
            </Grid>
          </Container>)
        : <LoadingPoolInformation />}
    </Collapse>
  );
};

interface SelectedPoolInformationProps {
  genesisHash: string | undefined;
  poolDetail: PoolInfo | null | undefined;
  onClick: (event: React.MouseEvent) => void;
  open: boolean;
}

const SelectedPoolInformation = ({ genesisHash, onClick, open, poolDetail }: SelectedPoolInformationProps) => {
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash);

  return (
    <Collapse in={open}>
      {poolDetail
        ? (
          <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#1B133C', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'row', p: '2px', pl: '16px' }}>
            <PoolIdenticon
              poolInfo={poolDetail}
              size={24}
            />
            <Stack direction='column' sx={{ ml: '10px', mr: 'auto', width: 'fit-content' }}>
              <Typography color='text.primary' sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
                {poolDetail.metadata}
              </Typography>
              <FormatBalance2
                decimals={[decimal ?? 0]}
                style={{ ...theme.typography['B-4'], color: '#AA83DC', width: 'fit-content' }}
                tokenColor='#AA83DC'
                tokens={[token ?? '']}
                value={isHexToBn(poolDetail.bondedPool?.points.toString() ?? '0')}
              />
            </Stack>
            <Grid container item sx={{ bgcolor: '#2D1E4A', borderRadius: '6px', p: '20px 10px', width: 'fit-content' }}>
              <ArrowRight2 color='#AA83DC' size='18' variant='Bold' />
            </Grid>
          </Container>)
        : <LoadingPoolInformation />}
    </Collapse>
  );
};

interface StakingTypeItemProps {
  children: React.ReactNode;
  type: 'solo' | 'pool';
  isSelected: boolean;
  onClick: () => void;
}

const StakingTypeItem = ({ children, isSelected, onClick, type }: StakingTypeItemProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' onClick={onClick} sx={{ bgcolor: '#05091C', border: `2px solid ${isSelected ? '#FF4FB9' : 'transparent'}`, borderRadius: '14px', cursor: 'pointer', gap: '8px', p: '6px', pt: '24px' }}>
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, pb: '14px', px: '24px' }}>
        <Grid container item sx={{ alignItems: 'center', flexWrap: 'nowrap', gap: '10px', width: 'fit-content' }}>
          <PRadio
            checked={isSelected}
            circleSize={20}
            onChange={noop}
            value={type}
          />
          <Typography color={isSelected ? '#FF4FB9' : 'text.primary'} variant='B-3' width='max-content'>
            {type === 'pool'
              ? t('Pool Staking')
              : t('Solo Staking')}
          </Typography>
        </Grid>
        <StakingIcon noText style={{ width: 'fit-content' }} type={type} variant='people' />
      </Container>
      {children}
    </Stack>
  );
};

interface Props {
  genesisHash: string | undefined;
  setSelectedStakingType: React.Dispatch<React.SetStateAction<SelectedEasyStakingType | undefined>>;
  selectedStakingType: SelectedEasyStakingType | undefined;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
  initialPool: PoolInfo | null | undefined;
}

export default function StakingTypeSelection({ genesisHash, initialPool, selectedStakingType, setSelectedStakingType, setSide }: Props) {
  const { t } = useTranslation();
  const poolStakingConsts = usePoolConst(genesisHash);
  const stakingConsts = useStakingConsts2(genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const onOptions = useCallback((type: 'pool' | 'solo') => () => {
    type === 'pool' && setSelectedStakingType((perv) => ({
      pool: perv?.pool,
      type,
      validators: undefined
    }));

    type === 'solo' && setSelectedStakingType({
      pool: undefined,
      type,
      validators: undefined
    });
  }, [setSelectedStakingType]);

  const openSelectPool = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setSide(EasyStakeSide.SELECT_POOL);
  }, [setSide]);

  const openSelectValidator = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setSide(EasyStakeSide.SELECT_VALIDATORS);
  }, [setSide]);

  return (
    <Stack direction='column' sx={{ gap: '8px', p: '18px' }}>
      <StakingTypeItem
        isSelected={selectedStakingType?.type === 'pool'}
        onClick={onOptions('pool')}
        type='pool'
      >
        <Stack direction='column'>
          <Grid container item sx={{ alignItems: 'center', gap: '16px', pb: '24px', pl: '24px' }}>
            <StakingInfoStack adjustedColorForTitle='#AA83DC' amount={poolStakingConsts?.minJoinBond} decimal={decimal} title={t('Minimum Stake')} token={token} />
            <StakingInfoStack adjustedColorForTitle='#AA83DC' text={t('Claim manually')} title={t('Rewards')} />
          </Grid>
          <SelectedPoolInformation
            genesisHash={genesisHash}
            onClick={openSelectPool}
            open={selectedStakingType?.type === 'pool'}
            poolDetail={selectedStakingType?.pool ?? initialPool}
          />
        </Stack>
      </StakingTypeItem>
      <StakingTypeItem
        isSelected={selectedStakingType?.type === 'solo'}
        onClick={onOptions('solo')}
        type='solo'
      >
        <Stack direction='column'>
          <Stack direction='column' sx={{ gap: '18px', pb: '24px', pl: '24px' }}>
            <Typography color='#AA83DC' textAlign='left' variant='B-4'>
              {t('Advanced staking management')}
            </Typography>
            <Grid container item sx={{ alignItems: 'center', gap: '16px' }}>
              <StakingInfoStack adjustedColorForTitle='#AA83DC' amount={stakingConsts?.minNominatorBond} decimal={decimal} title={t('Minimum Stake')} token={token} />
              <StakingInfoStack adjustedColorForTitle='#AA83DC' text={t('Paid automatically')} title={t('Rewards')} />
            </Grid>
          </Stack>
          <SelectedValidatorsInformation
            onClick={openSelectValidator}
            open={selectedStakingType?.type === 'solo'}
            validators={[]}
          />
        </Stack>
      </StakingTypeItem>
    </Stack>
  );
}
