// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountId } from '@polkadot/types/interfaces';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Divider, Grid, SxProps, Theme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, ShowBalance } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { AllValidators, ValidatorInfo } from '../../../../../util/types';

interface Props {
  api?: ApiPromise;
  chain?: Chain;
  allValidatorsInfo: AllValidators | null | undefined
  selectedValidatorsId: AccountId[] | null | undefined
  style?: SxProps<Theme> | undefined;
}

export default function ValidatorsTable({ allValidatorsInfo, api, chain, selectedValidatorsId, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef();

  const [selectedValidatorsInfo, setSelectedValidatorsInfo] = useState<ValidatorInfo[]>();

  useEffect(() => {
    if (allValidatorsInfo && selectedValidatorsId) {
      // find all information of nominated validators from all validatorsInfo(current and waiting)
      const nominations = allValidatorsInfo.current
        .concat(allValidatorsInfo.waiting)
        .filter((v: DeriveStakingQuery) => selectedValidatorsId.includes(String(v.accountId)));

      setSelectedValidatorsInfo(nominations);
    }
  }, [allValidatorsInfo, selectedValidatorsId]);

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
      <Grid container direction='column' sx={{ scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> div:not(:last-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight: window.innerHeight - 200, minHeight: '59px', overflowY: 'scroll', scrollbarWidth: 'none', textAlign: 'center' }}>
        {selectedValidatorsInfo?.map((v: ValidatorInfo, index: number) => {

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
                  <Grid fontSize='12px' item overflow='hidden' pl='5px' textAlign='left' textOverflow='ellipsis' whiteSpace='nowrap' xs>
                    <Identity chain={chain} formatted={String(v.accountId)} identiconSize={24} showShortAddress />
                  </Grid>
                </Grid>
                <Grid container item>
                  <Grid alignItems='center' container item maxWidth='50%' width='fit-content' sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }}>
                    {t<string>('Staked:')}
                    <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='5px'>
                      {v.exposure.total
                        ? <ShowBalance
                          api={api}
                          balance={v.exposure.total}
                          decimalPoint={2}
                          height={22}
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
