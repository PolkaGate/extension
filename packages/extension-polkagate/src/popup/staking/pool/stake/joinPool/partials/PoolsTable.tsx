// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MoreVert as MoreVertIcon, SearchOff as SearchOffIcon, SearchOutlined as SearchOutlinedIcon } from '@mui/icons-material';
import { Divider, FormControlLabel, Grid, Radio, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { InputFilter, ShowBalance } from '../../../../../../components';
import { useChain, useDecimal, useStakingConsts, useToken, useTranslation } from '../../../../../../hooks';
import { DEFAULT_POOL_FILTERS } from '../../../../../../util/constants';
import { PoolFilter, PoolInfo } from '../../../../../../util/types';
import PoolMoreInfo from '../../../../partial/PoolMoreInfo';
import Filters from './Filters';

interface Props {
  api?: ApiPromise;
  address: string;
  pools: PoolInfo[] | null | undefined;
  style?: SxProps<Theme> | undefined;
  label: string;
  selected?: PoolInfo;
  setSelected: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
  maxHeight?: number;
  setFilteredPools: React.Dispatch<React.SetStateAction<PoolInfo[] | null | undefined>>;
  filteredPools: PoolInfo[] | null | undefined
  poolsToShow: PoolInfo[] | null | undefined
}

export default function PoolsTable({ address, api, label, pools, poolsToShow, filteredPools, setFilteredPools, selected, setSelected, maxHeight = window.innerHeight / 2.4, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef(null);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const theme = useTheme();
  const stakingConsts = useStakingConsts(address);

  const [showPoolMoreInfo, setShowPoolMoreInfo] = useState<boolean>(false);
  const [poolId, setPoolId] = useState<number>();
  const [searchKeyword, setSearchKeyword] = useState<string>();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [apply, setApply] = useState<boolean>(false);
  const [sortValue, setSortValue] = useState<number>();
  const [filters, setFilters] = useState<PoolFilter>(structuredClone(DEFAULT_POOL_FILTERS) as PoolFilter);

  const openPoolMoreInfo = useCallback((poolId: number) => {
    setPoolId(poolId);
    setShowPoolMoreInfo(!showPoolMoreInfo);
  }, [showPoolMoreInfo]);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    poolsToShow && setSelected && setSelected(poolsToShow[Number(event.target.value)]);
    ref.current.scrollTop = 0;
  }, [poolsToShow, setSelected]);

  const Select = ({ index, pool }: { pool: PoolInfo, index: number }) => (
    <FormControlLabel
      checked={pool === selected}
      control={
        <Radio
          onChange={handleSelect}
          size='small'
          sx={{ '&.Mui-disabled': { color: 'text.disabled' }, color: 'secondary.main' }}
          value={index}
        />
      }
      disabled={unableToJoinPools(pool)}
      label=''
      sx={{ '> span': { p: 0 }, m: 'auto' }}
      value={index}
    />
  );

  const poolStaked = (points: BN) => api?.createType('Balance', points);

  const unableToJoinPools = (pool: PoolInfo) => pool.bondedPool?.state?.toString() !== 'Open';

  const onSearch = useCallback((filter: string) => {
    setSearchKeyword(filter);
    setFilteredPools(pools?.filter((pool) => pool.metadata?.toLowerCase().includes(filter?.toLowerCase()) || String(pool.poolId) === filter));
  }, [pools, setFilteredPools]);

  useEffect(() => {
    if (!isSearching) {
      setSearchKeyword(undefined);
      filteredPools && setFilteredPools(pools); // to revert search
    }
  }, [filteredPools, isSearching, pools, setFilteredPools]);

  const onFilters = useCallback(() => {
    setShowFilters(true);
  }, []);

  const Div = ({ height = '15px' }) => (
    <Grid alignItems='center' item justifyContent='center'>
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.light', height, m: '3px 5px', width: '1px' }} />
    </Grid>
  );

  return (
    <Grid sx={{ ...style }}>
      <Grid alignItems='center' container item justifyContent='space-between'>
        {label}
        <Div height='19px' />
        <Grid alignItems='center' container item onClick={() => setIsSearching(!isSearching)} sx={{ cursor: 'pointer' }} width='fit-content'>
          <Typography fontWeight={400} mr='5px'>
            {t('Search')}
          </Typography>
          {isSearching
            ? <SearchOffIcon sx={{ color: 'secondary.light' }} />
            : <SearchOutlinedIcon sx={{ color: 'secondary.light' }} />
          }
        </Grid>
        <Div height='19px' />
        <Grid alignItems='center' container item onClick={onFilters} sx={{ cursor: 'pointer' }} width='fit-content'>
          <Typography fontWeight={400} mr='5px'>
            {t('Filters')}
          </Typography>
          <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '30px' }} />
        </Grid>
      </Grid>
      {isSearching &&
        <Grid item py='10px'>
          <InputFilter
            autoFocus={isSearching}
            onChange={onSearch}
            placeholder={t<string>('🔍 Search pool')}
            theme={theme}
            value={searchKeyword ?? ''}
          />
        </Grid>
      }
      <Grid container direction='column' ref={ref} sx={{ '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> div:not(:last-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight: maxHeight - (isSearching ? 50 : 0), minHeight: '59px', overflowY: 'scroll', scrollBehavior: 'smooth', scrollbarWidth: 'none', textAlign: 'center' }}>
        {poolsToShow
          ? poolsToShow.length
            ? poolsToShow.map((pool, index) => (
              <Grid container item key={index} sx={{ bgcolor: unableToJoinPools(pool) ? '#212121' : 'transparent', borderBottom: '1px solid', borderBottomColor: 'secondary.main', opacity: unableToJoinPools(pool) ? 0.7 : 1 }}>
                <Grid container direction='column' item p='3px 8px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main', }} width='92%'>
                  <Grid container item lineHeight='30px'>
                    <Grid item width='22px'>
                      <Select index={index} pool={pool} />
                    </Grid>
                    <Grid item overflow='hidden' pl='5px' textAlign='left' textOverflow='ellipsis' whiteSpace='nowrap' width='calc(100% - 22px)'>
                      {pool.metadata}
                    </Grid>
                  </Grid>
                  <Grid container item>
                    <Grid alignItems='center' container item maxWidth='50%' width='fit-content'>
                      <Typography fontSize='12px' fontWeight={300} lineHeight='23px'>
                        {t<string>('Staked:')}
                      </Typography>
                      <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                        <ShowBalance
                          api={api}
                          balance={poolStaked(pool.bondedPool?.points)}
                          decimal={decimal}
                          decimalPoint={4}
                          height={22}
                          token={token}
                        />
                      </Grid>
                    </Grid>
                    <Div />
                    <Grid alignItems='center' container item width='fit-content'>
                      <Typography fontSize='12px' fontWeight={300} lineHeight='23px'>
                        {t<string>('Index:')}
                      </Typography>
                      <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                        {pool.poolId?.toString()}
                      </Grid>
                    </Grid>
                    <Div />
                    <Grid alignItems='end' container item width='fit-content'>
                      <Typography fontSize='12px' fontWeight={300} lineHeight='23px'>
                        {t<string>('Members:')}
                      </Typography>
                      <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                        {pool.bondedPool?.memberCounter?.toString()}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid alignItems='center' container item justifyContent='center' onClick={() => openPoolMoreInfo(pool.poolId.toNumber())} sx={{ cursor: 'pointer' }} width='8%'>
                  <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
                </Grid>
              </Grid>
            ))
            : <Grid display='inline-flex' p='10px'>
              <FontAwesomeIcon className='warningImage' icon={faExclamationTriangle} />
              <Typography fontSize='12px' fontWeight={400} lineHeight='20px' pl='8px'>
                {t<string>('There is no pool to join!')}
              </Typography>
            </Grid>
          : <Grid alignItems='center' container justifyContent='center'>
            <Grid item>
              <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
            </Grid>
            <Typography fontSize='13px' lineHeight='59px' pl='10px'>
              {t<string>('Loading pools...')}
            </Typography>
          </Grid>
        }
      </Grid>
      {
        showPoolMoreInfo &&
        <Grid ml='-15px'>
          <PoolMoreInfo
            address={address}
            api={api}
            chain={chain}
            pool={poolId === selected?.poolId?.toNumber() && selected}
            poolId={poolId}
            setShowPoolInfo={setShowPoolMoreInfo}
            showPoolInfo={showPoolMoreInfo} />
        </Grid>
      }
      {showFilters && !!pools?.length && token && decimal &&
        <Grid ml='-15px' position='absolute'>
          <Filters
            apply={apply}
            decimal={decimal}
            filters={filters}
            pools={pools}
            setApply={setApply}
            setFilteredPools={setFilteredPools}
            setFilters={setFilters}
            setShow={setShowFilters}
            setSortValue={setSortValue}
            show={showFilters}
            sortValue={sortValue}
            stakingConsts={stakingConsts}
            token={token}
          />
        </Grid>
      }
    </Grid>
  );
}
