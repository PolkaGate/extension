// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { CheckBoxOutlineBlankRounded as CheckBoxOutlineBlankRoundedIcon, CheckBoxOutlined as CheckBoxOutlinedIcon } from '@mui/icons-material';
import { DirectionsRun as DirectionsRunIcon, WarningRounded as WarningRoundedIcon } from '@mui/icons-material/';
import { Checkbox, Divider, Grid, SxProps, Theme, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { Checkbox2, Identity, Infotip, ShowBalance } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { StakingConsts, ValidatorInfo } from '../../../../../util/types';

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
  height?: number;
  isSelected: (v: ValidatorInfo) => boolean;
  maxSelected?: boolean;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined
}

export default function ValidatorsTable({ activeValidators, allValidatorsIdentities, api, chain, handleCheck, height, isSelected, maxSelected, showCheckbox, staked, stakingConsts, style, validatorsToList }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef();

  const overSubscriptionAlert1 = t('This validator is oversubscribed but you are within the top {{max}}.', { replace: { max: stakingConsts?.maxNominatorRewardedPerValidator } });
  const overSubscriptionAlert2 = t('This validator is oversubscribed and you are not within the top {{max}} and won’t get rewards.', { replace: { max: stakingConsts?.maxNominatorRewardedPerValidator } });

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

  const Div = () => (
    <Grid alignItems='center' item justifyContent='center'>
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.light', height: '15px', m: '3px 5px', width: '1px' }} />
    </Grid>
  );

  return (
    <Grid sx={{ ...style }}>
      <Grid container direction='column' sx={{ scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> div:not(:last-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', minHeight: '59px', overflowY: 'scroll', scrollbarWidth: 'none', textAlign: 'center' }}>
        {validatorsToList?.length !== 0 &&
          <List
            height={height}
            itemCount={validatorsToList?.length}
            itemSize={55}
            ref={ref}
            width={'100%'}
          >
            {({ index, key, style }) => {
              const v = validatorsToList[index];
              const isActive = activeValidators?.find((av) => v.accountId === av?.accountId);
              const isOversubscribed = overSubscribed(v);
              const accountInfo = allValidatorsIdentities?.find((a) => a.accountId === v?.accountId);
              const check = isSelected && isSelected(v);

              return (
                <Grid container key={key} item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main', ...style }}>
                  <Grid container direction='column' item p='3px 5px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='94%'>
                    <Grid alignItems='center' container item lineHeight='30px'>
                      {showCheckbox &&
                        <Grid item width='10%'>
                          <Checkbox2
                            checked={check}
                            onChange={(e) => handleCheck(e, v)}
                          />
                        </Grid>
                      }
                      <Grid container fontSize='12px' item overflow='hidden' textAlign='left' textOverflow='ellipsis' whiteSpace='nowrap' width={showCheckbox ? '90%' : '100%'} >
                        <Identity
                          accountInfo={accountInfo}
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
                          <Infotip text={t('Active')}>
                            <DirectionsRunIcon sx={{ color: '#1F7720', fontSize: '15px' }} />
                          </Infotip>
                        }
                        {(isOversubscribed?.safe || isOversubscribed?.notSafe) &&
                          <Infotip text={isOversubscribed?.safe ? overSubscriptionAlert1 : overSubscriptionAlert2}>
                            <WarningRoundedIcon sx={{ color: isOversubscribed?.safe ? '#FFB800' : '#FF002B', fontSize: '15px' }} />
                          </Infotip>
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
    </Grid >
  );
}
