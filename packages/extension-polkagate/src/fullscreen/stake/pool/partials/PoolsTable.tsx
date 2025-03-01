// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { BN } from '@polkadot/util';
import type { PoolFilter, PoolInfo } from '../../../../util/types';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FilterAltOutlined as FilterIcon, MoreVert as MoreVertIcon, SearchOff as SearchOffIcon, SearchOutlined as SearchOutlinedIcon } from '@mui/icons-material';
import { Divider, FormControlLabel, Grid, LinearProgress, Radio, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import Filters from '@polkadot/extension-polkagate/src/popup/staking/pool/stake/joinPool/partials/Filters';

import { InputFilter, Progress, ShowBalance } from '../../../../components';
import { useInfo, useStakingConsts, useTranslation } from '../../../../hooks';
import PoolMoreInfo from '../../../../popup/staking/partial/PoolMoreInfo';
import { DEFAULT_POOL_FILTERS } from '../../../../util/constants';

interface Props {
  api?: ApiPromise;
  address: string;
  pools: PoolInfo[] | null | undefined;
  style?: SxProps<Theme> | undefined;
  totalNumberOfPools: number | undefined;
  numberOfFetchedPools: number;
  selected?: PoolInfo;
  setSelected: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
  minHeight?: number;
  maxHeight?: number;
  setFilteredPools: React.Dispatch<React.SetStateAction<PoolInfo[] | null | undefined>>;
  filteredPools: PoolInfo[] | null | undefined;
  poolsToShow: PoolInfo[] | null | undefined;
  setSearchedPools: React.Dispatch<React.SetStateAction<PoolInfo[] | null | undefined>>;
}

export default function PoolsTable({ address, api, filteredPools, maxHeight = window.innerHeight / 2.4, minHeight, numberOfFetchedPools, pools, poolsToShow, selected, setFilteredPools, setSearchedPools, setSelected, style, totalNumberOfPools }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { chain, decimal, token } = useInfo(address);
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

    if (ref.current) {
      ref.current.scrollTop = 0;
    }
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
      label=''
      sx={{ '> span': { p: 0 }, m: 'auto' }}
      value={index}
    />
  );

  const poolStaked = (points: BN) => api?.createType('Balance', points);

  const onSearch = useCallback((filter: string) => {
    setSearchKeyword(filter);
    setSearchedPools((filteredPools || pools)?.filter((pool) => pool.metadata?.toLowerCase().includes(filter?.toLowerCase()) || String(pool.poolId) === filter));
  }, [filteredPools, pools, setSearchedPools]);

  const onSearchClick = useCallback(() => {
    if (isSearching) {
      setSearchKeyword(undefined);
      setSearchedPools(null); // to revert search
    }

    setIsSearching(!isSearching);
  }, [isSearching, setSearchedPools]);

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
      <Grid alignItems='center' container item justifyContent='space-between' wrap='nowrap'>
        <Grid item textAlign='left' xs>
          {t<string>('Pick one of {{totalNumberOfPools}} staking pools to join', { replace: { totalNumberOfPools: totalNumberOfPools || '  .  .  .  ' } })}
        </Grid>
        <Grid container item width='fit-content'>
          <Div height='19px' />
          <Grid alignItems='center' container item onClick={onSearchClick} sx={{ cursor: 'pointer' }} width='fit-content'>
            {isSearching
              ? <SearchOffIcon sx={{ color: 'secondary.light' }} />
              : <SearchOutlinedIcon sx={{ color: 'secondary.light' }} />
            }
          </Grid>
          <Div height='19px' />
          <Grid alignItems='center' container item onClick={onFilters} sx={{ cursor: 'pointer' }} width='fit-content'>
            <FilterIcon sx={{ color: 'secondary.light' }} />
          </Grid>
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
      <Grid container direction='column' ref={ref} sx={{ '> div.pools:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight: maxHeight - (isSearching ? 50 : 0), minHeight: minHeight || '59px', overflowY: 'scroll', scrollBehavior: 'smooth', textAlign: 'center' }}>
        {numberOfFetchedPools !== totalNumberOfPools &&
          <LinearProgress color='success' sx={{ position: 'sticky', top: 0 }} value={totalNumberOfPools ? numberOfFetchedPools * 100 / totalNumberOfPools : 0} variant='determinate' />
        }
        {poolsToShow
          ? poolsToShow.length
            ? poolsToShow.map((pool, index) => {
              const maybeCommission = pool.bondedPool.commission.current.isSome ? pool.bondedPool.commission.current.value[0] : 0;
              const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

              return (
                <Grid className='pools' container item key={index}>
                  <Grid container direction='column' item p='3px 8px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='92%'>
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
                            decimalPoint={2}
                            height={22}
                            token={token}
                          />
                        </Grid>
                      </Grid>
                      <Div />
                      <Grid alignItems='center' container item width='fit-content'>
                        <Typography fontSize='12px' fontWeight={300} lineHeight='23px'>
                          {t<string>('Com.:')}
                        </Typography>
                        <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                          {commission}%
                        </Grid>
                      </Grid>
                      <Div />
                      <Grid alignItems='end' container item width='fit-content'>
                        <Typography fontSize='12px' fontWeight={300} lineHeight='23px'>
                          {t<string>('Member:')}
                        </Typography>
                        <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                          {pool.bondedPool?.memberCounter?.toString()}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid alignItems='center' container item justifyContent='center' onClick={() => openPoolMoreInfo(pool.poolId)} sx={{ cursor: 'pointer' }} width='8%'>
                    <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
                  </Grid>
                </Grid>
              );
            })
            : <Grid display='inline-flex' p='10px'>
              <FontAwesomeIcon className='warningImage' icon={faExclamationTriangle} />
              <Typography fontSize='12px' fontWeight={400} lineHeight='20px' pl='8px'>
                {t<string>('There is no pool to join!')}
              </Typography>
            </Grid>
          : <Progress pt='140px' title={t<string>('Loading pools...')} type='grid' />
        }
      </Grid>
      {
        showPoolMoreInfo &&
        <PoolMoreInfo
          address={address}
          api={api}
          chain={chain as any}
          pool={poolId === selected?.poolId && selected}
          poolId={poolId}
          setShowPoolInfo={setShowPoolMoreInfo}
          showPoolInfo={showPoolMoreInfo}
        />
      }
      {showFilters && !!pools?.length && token && decimal &&
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
      }
    </Grid>
  );
}
