// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Divider, FormControlLabel, Grid, Radio, SxProps, Theme, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useRef } from 'react';

import { ApiPromise } from '@polkadot/api';

import { Label, ShowBalance } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { PoolInfo } from '../../../../../util/types';

interface Props {
  api?: ApiPromise;
  pools: PoolInfo[] | null | undefined;
  style?: SxProps<Theme> | undefined;
  label: string;
  selected?: PoolInfo;
  setSelected: React.Dispatch<React.SetStateAction<PoolInfo | undefined>>;
}

export default function PoolsTable({ api, label, pools, selected, setSelected, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef();

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    pools && setSelected && setSelected(pools[Number(event.target.value)]);
    ref.current.scrollTop = 0;
  }, [pools, setSelected]);

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

  const poolStaked = (points) => {
    const staked = points ? api?.createType('Balance', points) : undefined;

    return staked;
  };

  const unableToJoinPools = (pool: PoolInfo) => {
    const blockedOrDestroying = pool.bondedPool?.state?.toString() !== 'Open';

    return blockedOrDestroying;
  };

  const Div = () => (
    <Grid alignItems='center' item justifyContent='center' >
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.light', height: '15px', m: '3px 5px', width: '1px' }} />
    </Grid>
  );

  return (
    <Grid sx={{ ...style }}>
      <Label label={label} style={{ position: 'relative' }} >
        <Grid container direction='column' ref={ref} sx={{ scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> div:not(:last-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight: window.innerHeight / 2.4, minHeight: '59px', overflowY: 'scroll', scrollbarWidth: 'none', textAlign: 'center' }}          >
          {pools
            ? pools.length
              ? pools.map((pool, index) => (
                <Grid
                  container
                  item
                  key={index}
                  sx={{
                    bgcolor: unableToJoinPools(pool) ? '#212121' : 'transparent',
                    borderBottom: '1px solid',
                    borderBottomColor: 'secondary.main',
                    opacity: unableToJoinPools(pool) ? 0.7 : 1
                  }}
                >
                  <Grid
                    container
                    direction='column'
                    item
                    p='3px 8px'
                    sx={{
                      borderRight: '1px solid',
                      borderRightColor: 'secondary.main',
                    }}
                    width='92%'
                  >
                    <Grid
                      container
                      item
                      lineHeight='30px'
                    >
                      <Grid
                        item
                        width='22px'
                      >
                        <Select index={index} pool={pool} />
                      </Grid>
                      <Grid
                        item
                        overflow='hidden'
                        pl='5px'
                        textAlign='left'
                        textOverflow='ellipsis'
                        whiteSpace='nowrap'
                        width='calc(100% - 22px)'
                      >
                        {pool.metadata}
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      item
                    >
                      <Grid
                        alignItems='center'
                        container
                        item
                        maxWidth='50%'
                        width='fit-content'
                      >
                        <Typography
                          fontSize='12px'
                          fontWeight={300}
                          lineHeight='23px'
                        >
                          {t<string>('Staked:')}
                        </Typography>
                        <Grid
                          fontSize='12px'
                          fontWeight={400}
                          item
                          lineHeight='22px'
                          pl='5px'
                        >
                          <ShowBalance
                            api={api}
                            balance={poolStaked(pool.bondedPool?.points)}
                            decimalPoint={4}
                            height={22}
                          />
                        </Grid>
                      </Grid>
                      <Div />
                      <Grid
                        alignItems='center'
                        container
                        item
                        width='fit-content'
                      >
                        <Typography
                          fontSize='12px'
                          fontWeight={300}
                          lineHeight='23px'
                        >
                          {t<string>('Index:')}
                        </Typography>
                        <Grid
                          fontSize='12px'
                          fontWeight={400}
                          item
                          lineHeight='22px'
                          pl='5px'
                        >
                          {pool.poolId?.toString()}
                        </Grid>
                      </Grid>
                      <Div />
                      <Grid
                        alignItems='end'
                        container
                        item
                        width='fit-content'
                      >
                        <Typography
                          fontSize='12px'
                          fontWeight={300}
                          lineHeight='23px'
                        >
                          {t<string>('Members:')}
                        </Typography>
                        <Grid
                          fontSize='12px'
                          fontWeight={400}
                          item
                          lineHeight='22px'
                          pl='5px'
                        >
                          {pool.bondedPool?.memberCounter?.toString()}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    alignItems='center'
                    container
                    item
                    justifyContent='center'
                    sx={{
                      cursor: 'pointer'
                    }}
                    width='8%'
                  >
                    <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
                  </Grid>
                </Grid>
              ))
              : (
                <Grid
                  display='inline-flex'
                  p='10px'
                >
                  <FontAwesomeIcon
                    className='warningImage'
                    icon={faExclamationTriangle}
                  />
                  <Typography
                    fontSize='12px'
                    fontWeight={400}
                    lineHeight='20px'
                    pl='8px'
                  >
                    {t<string>('hooom! There is a problem, please let us know❤')}
                  </Typography>
                </Grid>)
            : (
              <Grid
                alignItems='center'
                container
                justifyContent='center'
              >
                <Grid
                  item
                >
                  <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
                </Grid>
                <Typography
                  fontSize='13px'
                  lineHeight='59px'
                  pl='10px'
                >
                  {t<string>('Loading pools...')}
                </Typography>
              </Grid>
            )
          }
        </Grid>
      </Label>
    </Grid>
  );
}
