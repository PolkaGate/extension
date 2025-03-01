// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show Active validators list in fullscreen mode
 * */

import { faRunning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { useActiveValidators, useInfo, useStakingConsts, useTranslation } from '../../../../hooks';
import ShowValidator from './ShowValidator';

interface Props {
  address?: string;
  isValidator: boolean | null | undefined

}

export default function ActiveValidators({ address, isValidator }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, decimal, token } = useInfo(address);

  const { activeValidators, nonActiveValidators } = useActiveValidators(address);
  const stakingConsts = useStakingConsts(address);
  const [showDetails, setShowDetails] = useState<boolean>();

  const SKELETON_COUNT = 5;

  const toggleDetails = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', maxHeight: 'fit-content', p: '10px', width: 'inherit' }}>
      <Grid alignItems='center' container item justifyContent='center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <FontAwesomeIcon
          color={`${theme.palette.text.primary}`}
          icon={faRunning}
          style={{ height: '20px', marginRight: '10px', width: '20px' }}
        />
        <Typography color={'text.primary'} fontSize='18px' fontWeight={500}>
          {activeValidators?.length && activeValidators.length > 1 ? t('Active validators') : t('Active validator')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' mt='10px'>
        {activeValidators?.length
          ? <>
            {activeValidators.map((v, index) => (
              <Grid container item key={index} sx={{ borderTop: index > 0 ? '1px solid' : undefined, borderTopColor: 'divider', overflowY: 'scroll' }}>
                <ShowValidator
                  accountInfo={v.accountInfo}
                  allInOneRow={false}
                  api={api}
                  chain={chain}
                  decimal={decimal}
                  isActive={true}
                  isOversubscribed={v.isOversubscribed}
                  stakingConsts={stakingConsts}
                  token={token}
                  v={v}
                />
              </Grid>
            ))
            }
            <Grid container item justifyContent='flex-end'>
              <Collapse in={showDetails} orientation='vertical' sx={{ '> .MuiCollapse-wrapper .MuiCollapse-wrapperInner': { display: 'grid', rowGap: '10px' }, width: '100%' }}>
                <Grid container sx={{ '> .MuiPaper-root': { backgroundImage: 'none', boxShadow: 'none' }, '> .MuiPaper-root::before': { bgcolor: 'transparent' }, maxHeight: parent.innerHeight - 450, overflowX: 'hidden', overflowY: 'scroll' }}>
                  {nonActiveValidators?.map((v, index) => (
                    <Grid container item key={index} sx={{ backgroundColor: 'backgroundFL.secondary', borderTop: '1px solid', borderTopColor: 'divider', overflowY: 'scroll' }}>
                      <ShowValidator
                        accountInfo={v.accountInfo}
                        allInOneRow={false}
                        api={api}
                        chain={chain}
                        decimal={decimal}
                        isActive={true}
                        isOversubscribed={v.isOversubscribed}
                        stakingConsts={stakingConsts}
                        token={token}
                        v={v}
                      />
                    </Grid>
                  ))
                  }
                </Grid>
              </Collapse>
              {!!nonActiveValidators?.length &&
                <>
                  <Divider sx={{ bgcolor: 'divider', height: '2px', mt: '5px', width: '100%' }} />
                  <Grid alignItems='center' container item onClick={toggleDetails} sx={{ cursor: 'pointer', p: '5px', width: 'fit-content' }}>
                    <Typography color='secondary.light' fontSize='16px' fontWeight={400}>
                      {t(showDetails ? t('Hide') : t('Others ({{count}})', { replace: { count: nonActiveValidators?.length } }))}
                    </Typography>
                    <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showDetails ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
                  </Grid>
                </>
              }
            </Grid>
          </>
          : activeValidators === undefined || isValidator === undefined
            ? <>
              {
                Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <Grid container key={index}>
                    <Skeleton
                      animation='wave'
                      height='20px'
                      sx={{ display: 'inline-block', fontWeight: 'bold', my: '5px', transform: 'none', width: `${100 / (SKELETON_COUNT - index)}%` }}
                    />
                  </Grid>
                ))
              }
            </>
            : isValidator
              ? <Typography color={'text.primary'} fontSize='16px' fontWeight={400}>
                {t('This account is a validator!')}
              </Typography>
              : <Typography color={'text.primary'} fontSize='16px' fontWeight={400}>
                {t('No Active Validators Found!')}
              </Typography>
        }
      </Grid>
    </Grid>
  );
}
