// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Grid, Stack, Typography } from '@mui/material';
import { AddCircle, HierarchySquare3, I3Dcube } from 'iconsax-react';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';

import { type BN } from '@polkadot/util';

import { ActionButton, ActionContext, BackWithLabel, ChainLogo, FadeOnScroll, Motion, SearchField } from '../../components';
import SnowFlake from '../../components/SVG/SnowFlake';
import { useAccountAssets, useIsDark, usePrices, useSelectedAccount, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { VelvetBox } from '../../style';
import { TEST_NETS } from '../../util/constants';
import { amountToHuman } from '../../util/utils';
import { TokenBalanceDisplay } from '../home/partial/TokensAssetsBox';

interface Props {
  balance: BN;
  decimal: number;
  genesisHash: string;
  key: number;
  isFirst: boolean;
  isLast: boolean;
  token: string;
  price: number;
  type: 'solo' | 'pool';
}

function PositionRow ({ balance, decimal, genesisHash, isFirst, isLast, key, price, token, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const hasPoolStaking = type === 'pool';
  const isTestNet = TEST_NETS.includes(genesisHash);
  const value = amountToHuman(balance.muln(price), decimal);

  return (
    <Grid
      alignItems='center' container item justifyContent='space-between' key={key}
      sx={{
        ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '8px' },
        bgcolor: '#05091C',
        borderBottom: '1px solid #1B133C',
        borderBottomLeftRadius: isLast ? '14px' : 0,
        borderBottomRightRadius: isLast ? '14px' : 0,
        borderTopLeftRadius: isFirst ? '14px' : 0,
        borderTopRightRadius: isFirst ? '14px' : 0,
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
            {token}
          </Typography>
          <Stack alignItems='center' columnGap='5px' direction='row' sx={{ bgcolor: hasPoolStaking ? '#A7DFB726' : '#C6AECC26', borderRadius: '9px', p: '3px 5px' }}>
            {hasPoolStaking
              ? <I3Dcube color='#A7DFB7' size='14' variant='Bulk' />
              : <SnowFlake color='#809ACB' size='14' />}
            <Typography color={hasPoolStaking ? '#A7DFB7' : '#809ACB'} fontSize='13px' sx={{ lineHeight: '10px' }} variant='B-2'>
              {hasPoolStaking ? 'Pool staking' : 'Solo staking'}
            </Typography>
          </Stack>
          {isTestNet &&
            <Stack alignItems='center' columnGap='5px' direction='row' sx={{ bgcolor: '#3988FF26', borderRadius: '9px', p: '3px 5px', mt: '5px' }}>
              <HierarchySquare3 color='#3988FF' size='14' variant='Bulk' />
              <Typography color='#3988FF' fontSize='13px' sx={{ lineHeight: '10px' }} variant='B-2'>
                {t('Testnet')}
              </Typography>
            </Stack>}
        </Stack>
      </Stack>
      <TokenBalanceDisplay
        decimal={decimal}
        token={token}
        totalBalanceBN={balance}
        totalBalancePrice={parseFloat(value)}
      />
    </Grid>

  );
}

export default function StakingPositions (): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const pricesInCurrency = usePrices();
  const accountAssets = useAccountAssets(account?.address);
  const onAction = useContext(ActionContext);
  const refContainer = useRef<HTMLDivElement>(null);

  const [searchKeyWord, setSearchKeyWord] = useState<string>();

  const positions = useMemo(() => accountAssets?.filter(({ pooledBalance, soloTotal }) => (soloTotal && !soloTotal.isZero()) || (pooledBalance && !pooledBalance.isZero())), [accountAssets]);

  const filteredToken = useMemo(() => {
    return searchKeyWord
      ? positions?.filter(({ token }) => token?.toLowerCase().includes(searchKeyWord))
      : positions;
  }, [positions, searchKeyWord]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setSearchKeyWord(undefined);
    }

    keyword = keyword.trim().toLowerCase();
    setSearchKeyWord(keyword);
  }, []);

  const backHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const onEarningOptions = useCallback(() => {
    onAction('/stakingIndex-options');
  }, [onAction]);

  return (
    <>
      <Grid
        alignContent='flex-start'
        container
        sx={{ position: 'relative' }}
      >
        <UserDashboardHeader homeType='default' />
        <BackWithLabel
          onClick={backHome}
          style={{ pb: 0 }}
          text={t('Your Staking Positions')}
        />
        <Motion variant='slide'>
          <SearchField
            onInputChange={onSearch}
            placeholder='🔍 Search Token'
            style={{ padding: '4%' }}
          />
          <VelvetBox style={{ margin: '0 4%', maxHeight: '305px', minHeight: '63px', overflowY: 'scroll', width: '92%' }}>
            <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '15px', width: '100%' }}>
              {filteredToken?.map(({ decimal, genesisHash, pooledBalance, priceId, soloTotal, token }, index) => {
                const price = pricesInCurrency?.prices[priceId ?? '']?.value ?? 0;

                return (
                  <>
                    {pooledBalance && !pooledBalance?.isZero() &&
                      <PositionRow
                        balance={pooledBalance}
                        decimal={decimal}
                        genesisHash={genesisHash}
                        isFirst={index === 0}
                        isLast={index === filteredToken.length - 1}
                        key={index}
                        price={price}
                        token={token}
                        type='pool'
                      />}
                    {soloTotal && !soloTotal?.isZero() &&
                      <PositionRow
                        balance={soloTotal}
                        decimal={decimal}
                        genesisHash={genesisHash}
                        isFirst={index === 0}
                        isLast={index === filteredToken.length - 1}
                        key={index}
                        price={price}
                        token={token}
                        type='solo'
                      />}
                  </>
                );
              })}
              <FadeOnScroll containerRef={refContainer} />
            </Grid>
          </VelvetBox>
          <Stack direction='row' justifyContent='center'>
            <ActionButton
              StartIcon={AddCircle as Icon}
              contentPlacement='center'
              onClick={onEarningOptions}
              style={{
                height: '44px',
                marginTop: '15px',
                width: '92%'
              }}
              text={t('Explore staking options')}
            />
          </Stack>
        </Motion>
      </Grid>
      <HomeMenu />
    </>
  );
}
