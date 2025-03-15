// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PositionInfo } from '../../util/types';

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ActionContext, BackWithLabel, ChainLogo, FadeOnScroll, FormatBalance2, Motion, SearchField } from '../../components';
import { useAccountAssets, useIsDark, useSelectedAccount, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { VelvetBox } from '../../style';
import { NATIVE_TOKEN_ASSET_ID, STAKING_CHAINS } from '../../util/constants';
import { fetchStaking } from '../../util/fetchStaking';
import getChain from '../../util/getChain';
import { sanitizeChainName } from '../../util/utils';
import StakingInfo from './stakingInfo';
import { BN_ZERO } from '@polkadot/util';

export default function EarningOptions(): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);
  const onAction = useContext(ActionContext);
  const refContainer = useRef<HTMLDivElement>(null);

  const [rates, setRates] = useState<Record<string, number>>();
  const [searchKeyWord, setSearchKeyWord] = useState<string>();
  const [selectedPosition, setSelectedPosition] = useState<PositionInfo>();

  useEffect(() => {
    fetchStaking().then((res) => {
      setRates(res.rates);
    }).catch(console.error);
  }, []);

  const stakingTokens = useMemo(() => STAKING_CHAINS.map((genesisHash) => {
    const chain = getChain(genesisHash);

    if (!chain) {
      return undefined;
    }

    const nativeTokenBalance = accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && assetId === NATIVE_TOKEN_ASSET_ID);

    if ( // filter staked tokens
      (nativeTokenBalance?.soloTotal && !nativeTokenBalance?.soloTotal.isZero()) ||
      (nativeTokenBalance?.pooledBalance && !nativeTokenBalance?.pooledBalance.isZero())) {
      return undefined;
    }

    return {
      ...chain,
      ...nativeTokenBalance,
      chainName: sanitizeChainName(chain?.name || '') ?? 'Unknown'
    } as unknown as PositionInfo;
  }).filter((item) => !!item), [accountAssets]);

  const filteredToken = useMemo(() => {
    return searchKeyWord
      ? stakingTokens.filter((item) => item?.tokenSymbol?.toLowerCase().includes(searchKeyWord))
      : stakingTokens;
  }, [searchKeyWord, stakingTokens]);

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

  const onBack = useCallback(() => {
    onAction('/stakingIndex/');
  }, [onAction]);

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
            placeholder='🔍 Search Token'
            style={{ padding: '4%' }}
          />
          <VelvetBox style={{ minHeight: '63px', mx: '4%', width: '92%' }}>
            <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '15px', width: '100%' }}>
              {filteredToken?.map((token, index) => {
                const { availableBalance, chainName, decimal, genesisHash, tokenSymbol } = token;
                const info = { ...token, rate: rates?.[chainName.toLowerCase()] || 0 } as PositionInfo;

                return (
                  <Grid alignItems='center' container item justifyContent='space-between' key={index}
                    // eslint-disable-next-line react/jsx-no-bind
                    onClick={() => onPositionClick(info)}
                    sx={{
                      ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '8px' },
                      bgcolor: '#05091C',
                      borderBottom: '1px solid #1B133C',
                      borderBottomLeftRadius: index === filteredToken.length - 1 ? '14px' : 0,
                      borderBottomRightRadius: index === filteredToken.length - 1 ? '14px' : 0,
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
                            value={availableBalance ?? BN_ZERO}
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
                          {rates?.[chainName.toLowerCase()] || 0}%
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
