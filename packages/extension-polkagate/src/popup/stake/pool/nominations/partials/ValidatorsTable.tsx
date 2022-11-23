// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DirectionsRun as DirectionsRunIcon, MoreVert as MoreVertIcon } from '@mui/icons-material/';
import { Divider, Grid, SxProps, Theme, Tooltip, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { Checkbox, Identity, ShowBalance } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { AllValidators, StakingConsts, ValidatorInfo } from '../../../../../util/types';

interface Props {
  api?: ApiPromise;
  activeValidators: ValidatorInfo[] | undefined;
  chain?: Chain;
  style?: SxProps<Theme> | undefined;
  staked: BN | undefined
  stakingConsts: StakingConsts | null | undefined;
  validatorsToList: ValidatorInfo[] | null | undefined
  showCheckbox?: boolean;
  handleCheck: (checked: boolean, validator: ValidatorInfo) => void;
  isSelected: (v: ValidatorInfo) => boolean;
  maxSelected?: boolean;
}

export default function ValidatorsTable({ activeValidators, api, chain, handleCheck, isSelected, maxSelected, showCheckbox, staked, stakingConsts, style, validatorsToList }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef();

  const overSubscribed = useCallback((v: ValidatorInfo): { notSafe: boolean, safe: boolean } | undefined => {
    if (!stakingConsts) {
      return;
    }

    const threshold = stakingConsts.maxNominatorRewardedPerValidator;
    const sortedNominators = v.exposure.others.sort((a, b) => b.value - a.value);
    const maybeMyIndex = staked ? sortedNominators.findIndex((n) => n.value < staked.toNumber()) : -1;

    return {
      notSafe: v.exposure.others.length > threshold && (maybeMyIndex > threshold || maybeMyIndex === -1),
      safe: v.exposure.others.length > threshold && (maybeMyIndex < threshold || maybeMyIndex === -1)
    };
  }, [staked, stakingConsts]);

  useEffect(() => {
    if (maxSelected) {
      ref.current.scrollTop = 0;
    }
  }, [maxSelected]);

  /** put active validators at the top of the list **/
  React.useMemo(() => {
    activeValidators?.forEach((av) => {
      const index = validatorsToList?.findIndex((v) => v.accountId === av?.accountId);

      if (validatorsToList && index && av && index !== -1) {
        validatorsToList.splice(index, 1);
        validatorsToList.unshift(av);
      }
    });
  }, [validatorsToList, activeValidators]);

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
      <Grid container direction='column' ref={ref} sx={{ scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> div:not(:last-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', minHeight: '59px', overflowY: 'scroll', scrollbarWidth: 'none', textAlign: 'center' }}>
        {validatorsToList?.length &&
          <List
            height={window.innerHeight - (showCheckbox ? 250 : 190)}
            itemCount={validatorsToList?.length}
            itemSize={55}
            width={'100%'}
          >
            {({ index, key, style }) => {
              const v = validatorsToList[index];
              const isActive = activeValidators?.find((av) => v.accountId === av?.accountId);
              const isOversubscribed = overSubscribed(v);

              return (
                <Grid container key={key} item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main', ...style }}>
                  <Grid container direction='column' item p='3px 5px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='94%'>
                    <Grid alignItems='center' container item lineHeight='30px'>
                      {showCheckbox &&
                        <Grid item width='10%'>
                          <Checkbox
                            checked={isSelected(v)}
                            onChange={(checked) => handleCheck(checked, v)}
                            style={{ fontSize: '18px' }}
                            theme={theme}
                          />
                        </Grid>
                      }
                      <Grid container fontSize='12px' item overflow='hidden' textAlign='left' textOverflow='ellipsis' whiteSpace='nowrap' width={showCheckbox ? '90%' : '100%'} >
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
                      <Grid alignItems='center' container item maxWidth='50%' sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }} width='fit-content'>
                        {t<string>('Staked:')}
                        <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='3px'>
                          {v.exposure.total
                            ? <ShowBalance
                              api={api}
                              balance={v.exposure.total}
                              decimalPoint={1}
                              height={22}
                              skeletonWidth={50}
                            />
                            : t('waiting')
                          }
                        </Grid>
                      </Grid>
                      <Div />
                      <Grid alignItems='center' container item sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }} width='fit-content'>
                        {t<string>('Com.')}
                        <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='3px'>
                          {Number(v.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(v.validatorPrefs.commission) / (10 ** 7)}%
                        </Grid>
                      </Grid>
                      <Div />
                      <Grid alignItems='end' container item sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }} width='fit-content'>
                        {t<string>('Nominators:')}
                        <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='3px'>
                          {v.exposure.others.length || t('N/A')}
                        </Grid>
                      </Grid>
                      <Grid alignItems='center' container item justifyContent='flex-end' sx={{ lineHeight: '23px', pl: '4px' }} width='fit-content'>
                        {isActive &&
                          <Tooltip placement='left' title={t('Active')}>
                            <DirectionsRunIcon sx={{ color: '#1F7720', fontSize: '15px' }} />
                          </Tooltip>
                        }
                        {(isOversubscribed?.safe || isOversubscribed?.notSafe) &&
                          <FontAwesomeIcon
                            color={isOversubscribed?.safe ? '#FFB800' : '#FF002B'}
                            fontSize='12px'
                            icon={faExclamationTriangle}
                          />
                        }
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid alignItems='center' container item justifyContent='center' sx={{ cursor: 'pointer' }} width='6%'>
                    <vaadin-icon
                      icon='vaadin:ellipsis-dots-v'
                      style={{ color: `${theme.palette.secondary.light}`, width: '33px' }}
                    />
                  </Grid>
                </Grid>
              );
            }}
          </List>
        }
      </Grid>
    </Grid>
  );
}
