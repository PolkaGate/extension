// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import type { PositionInfo } from '../../util/types';

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { extractRelayChainName } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';
import { BN_ZERO } from '@polkadot/util';

import { BackWithLabel, ChainLogo, FadeOnScroll, FormatBalance2, Motion, SearchField } from '../../components';
import { useAccountAssets, useBackground, useIsDark, useIsTestnetEnabled, useSelectedAccount, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { VelvetBox } from '../../style';
import { fetchStaking } from '../../util/fetchStaking';
import StakingInfo from './stakingInfo';
import { getEarningOptions } from './utils';

export default function EarningOptions (): React.ReactElement {
  useBackground('default');

  const { t } = useTranslation();
  const isDark = useIsDark();
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);
  const navigate = useNavigate();
  const refContainer = useRef<HTMLDivElement>(null);
  const isTestnetEnabled = useIsTestnetEnabled();

  const [rates, setRates] = useState<Record<string, number>>();
  const [searchKeyWord, setSearchKeyWord] = useState<string>();
  const [selectedPosition, setSelectedPosition] = useState<PositionInfo>();

  useEffect(() => {
    fetchStaking().then((res) => {
      setRates(res.rates);
    }).catch(console.error);
  }, []);

  const earning = useMemo(() => getEarningOptions(accountAssets, isTestnetEnabled), [accountAssets, isTestnetEnabled]);

  const earningItems = useMemo(() => {
    return searchKeyWord
      ? earning.filter((item) => item?.tokenSymbol?.toLowerCase().includes(searchKeyWord))
      : earning;
  }, [searchKeyWord, earning]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setSearchKeyWord(undefined);
    }

    keyword = keyword.trim().toLowerCase();
    setSearchKeyWord(keyword);
  }, []);

  const onPositionClick = useCallback((token: PositionInfo) => {
    setSelectedPosition(token);
  }, []);

  const onBack = useCallback(() => navigate('/') as void, [navigate]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <BackWithLabel
          onClick={onBack}
          style={{ pb: 0 }}
          text={t('Staking Options')}
        />
        <Motion variant='slide'>
          <SearchField
            onInputChange={onSearch}
            placeholder={t('🔍 Search Token')}
            style={{ padding: '4%' }}
          />
          <VelvetBox style={{ margin: '0 4%', minHeight: '63px', width: '92%' }}>
            <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '15px', width: '100%' }}>
              {earningItems?.map((token, index) => {
                const { availableBalance, chainName, decimal, freeBalance, genesisHash, tokenSymbol } = token;
                const relayChainName = (extractRelayChainName(chainName) ?? chainName).toLowerCase();
                const info = { ...token, rate: rates?.[relayChainName] || 0 } as PositionInfo;

                return (
                  <Grid alignItems='center' container item justifyContent='space-between' key={index}
                    // eslint-disable-next-line react/jsx-no-bind
                    onClick={() => onPositionClick(info)}
                    sx={{
                      ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '8px' },
                      bgcolor: '#05091C',
                      borderBottom: '1px solid #1B133C',
                      borderBottomLeftRadius: index === earningItems.length - 1 ? '14px' : 0,
                      borderBottomRightRadius: index === earningItems.length - 1 ? '14px' : 0,
                      borderTopLeftRadius: index === 0 ? '14px' : 0,
                      borderTopRightRadius: index === 0 ? '14px' : 0,
                      cursor: 'pointer',
                      lineHeight: '25px',
                      p: '10px',
                      transition: 'all 250ms ease-out'
                    }}
                  >
                    <Stack alignItems='center' direction='row' justifyContent='start'>
                      <ChainLogo genesisHash={genesisHash} size={36} />
                      <Stack alignItems='start' direction='column' sx={{ ml: '10px' }}>
                        <Typography sx={{ mt: '-7px' }} variant='B-2'>
                          {tokenSymbol}
                        </Typography>
                        <Typography color='#BEAAD8' sx={{ lineHeight: '10px' }} variant='B-4'>
                          <FormatBalance2
                            decimals={[decimal]}
                            label={`${t('Available')}:`}
                            tokens={[tokenSymbol]}
                            value={freeBalance || availableBalance || BN_ZERO}
                          />
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack alignItems='center' direction='row' justifyContent='center' sx={{ bgcolor: '#82FFA533', borderRadius: '8px', minWidth: '64px', p: '7px', pt: '2px' }}>
                      <Stack alignItems='center' direction='column'>
                        <Typography color='#82FFA5' fontSize='10px' sx={{ lineHeight: '10px' }} variant='S-2'>
                          {t('up to')}
                        </Typography>
                        <Typography color='#82FFA5' sx={{ lineHeight: '17px' }} variant='B-2'>
                          {info.rate }%
                        </Typography>
                        <Typography color='#EAEBF1' fontSize='10px' sx={{ lineHeight: '10px' }} variant='S-2'>
                          {t('per year')}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                );
              })}
              <FadeOnScroll containerRef={refContainer} />
            </Grid>
          </VelvetBox>
        </Motion>
      </Grid>
      <HomeMenu />
      {selectedPosition &&
        <StakingInfo
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
        />}
    </>
  );
}
