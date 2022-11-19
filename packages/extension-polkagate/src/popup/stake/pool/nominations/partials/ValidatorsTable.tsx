// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountId } from '@polkadot/types/interfaces';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DirectionsRun as DirectionsRunIcon, MoreVert as MoreVertIcon } from '@mui/icons-material/';
import { Divider, Grid, SxProps, Theme, Tooltip } from '@mui/material';
import React, { useMemo, useRef } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, ShowBalance } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { AllValidators, ValidatorInfo } from '../../../../../util/types';

interface Props {
  api?: ApiPromise;
  allValidatorsInfo: AllValidators | null | undefined
  chain?: Chain;
  stashId: string | undefined;
  selectedValidatorsId: AccountId[] | null | undefined
  style?: SxProps<Theme> | undefined;
}

export default function ValidatorsTable({ allValidatorsInfo, api, chain, selectedValidatorsId, stashId, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef();

  const selectedValidatorsInfo = useMemo(() =>
    allValidatorsInfo && selectedValidatorsId && allValidatorsInfo.current
      .concat(allValidatorsInfo.waiting)
      .filter((v: DeriveStakingQuery) => selectedValidatorsId.includes(String(v.accountId)))
    , [allValidatorsInfo, selectedValidatorsId]);

  const activeValidators = useMemo(() => selectedValidatorsInfo?.filter((sv) => sv.exposure.others.find(({ who }) => who.toString() === stashId)), [stashId, selectedValidatorsInfo]);

  /** put active validators at the top of the list **/
  React.useMemo(() => {
    activeValidators?.forEach((av) => {
      const index = selectedValidatorsInfo?.findIndex((v) => v.accountId === av?.accountId);

      if (selectedValidatorsInfo && index && av && index !== -1) {
        selectedValidatorsInfo.splice(index, 1);
        selectedValidatorsInfo.unshift(av);
      }
    });
  }, [selectedValidatorsInfo, activeValidators]);

  // const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  //   pools && setSelected && setSelected(pools[Number(event.target.value)]);
  //   ref.current.scrollTop = 0;
  // }, [pools, setSelected]);

  // const Select = ({ index, pool }: { pool: PoolInfo, index: number }) => (
  //   <FormControlLabel
  //     checked={pool === selected}
  //     control={
  //       <Radio
  //         onChange={handleSelect}
  //         size='small'
  //         sx={{ '&.Mui-disabled': { color: 'text.disabled' }, color: 'secondary.main' }}
  //         value={index}
  //       />
  //     }
  //     disabled={unableToJoinPools(pool)}
  //     label=''
  //     sx={{ '> span': { p: 0 }, m: 'auto' }}
  //     value={index}
  //   />
  // );

  const Div = () => (
    <Grid alignItems='center' item justifyContent='center'>
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.light', height: '15px', m: '3px 5px', width: '1px' }} />
    </Grid>
  );

  return (
    <Grid sx={{ ...style }}>
      <Grid container direction='column' sx={{ scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> div:not(:last-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight: window.innerHeight - 190, minHeight: '59px', overflowY: 'scroll', scrollbarWidth: 'none', textAlign: 'center' }}>
        {selectedValidatorsInfo?.map((v: ValidatorInfo, index: number) => {
          const isActive = activeValidators?.find((av) => v.accountId === av?.accountId);

          return (
            <Grid container item key={index} sx={{
              // bgcolor: unableToJoinPools(pool) ? '#212121' : 'transparent',
              borderBottom: '1px solid',
              borderBottomColor: 'secondary.main',
              // opacity: unableToJoinPools(pool) ? 0.7 : 1
            }}
            >
              <Grid container direction='column' item p='3px 8px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='92%'>
                <Grid container item lineHeight='30px'>
                  {/* <Grid item width='22px'> */}
                  {/* <Select index={index} pool={pool} /> */}
                  {/* </Grid>  */}
                  <Grid fontSize='12px' item overflow='hidden' textAlign='left' textOverflow='ellipsis' whiteSpace='nowrap' xs pr='20px'>
                    <Identity
                      api={api}
                      chain={chain}
                      formatted={String(v.accountId)}
                      identiconSize={24}
                      showShortAddress
                      style={{ fontSize: '12px' }}
                    />
                  </Grid>
                </Grid>
                <Grid alignItems='center' container item>
                  <Grid alignItems='center' container item maxWidth='50%' width='fit-content' sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }}>
                    {t<string>('Staked:')}
                    <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                      {v.exposure.total
                        ? <ShowBalance
                          api={api}
                          balance={v.exposure.total}
                          decimalPoint={0}
                          height={22}
                          skeletonWidth={50}
                        />
                        : t('waiting')
                      }
                    </Grid>
                  </Grid>
                  <Div />
                  <Grid alignItems='center' container item width='fit-content' sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }}>
                    {t<string>('Com.')}
                    <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                      {Number(v.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(v.validatorPrefs.commission) / (10 ** 7)}%
                    </Grid>
                  </Grid>
                  <Div />
                  <Grid alignItems='end' container item width='fit-content' sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }}>
                    {t<string>('Nominators:')}
                    <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                      {v.exposure.others.length || t('N/A')}
                    </Grid>
                  </Grid>
                  <Grid alignItems='center' justifyContent='flex-end' container item width='fit-content' sx={{ lineHeight: '23px', pl: '4px' }}>
                    {isActive &&
                      <Tooltip placement='left' title={t('Active')}>
                        <DirectionsRunIcon sx={{ color: '#1F7720', fontSize: '15px' }} />
                      </Tooltip>
                    }
                    <FontAwesomeIcon
                      color='#FFB800'
                      fontSize='12px'
                      icon={faExclamationTriangle}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid alignItems='center' container item justifyContent='center' sx={{ cursor: 'pointer' }} width='8%'>
                <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}
