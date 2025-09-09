// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import { AddCircle, HierarchySquare3, I3Dcube } from 'iconsax-react';
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type BN } from '@polkadot/util';

import { ActionButton, BackWithLabel, ChainLogo, FadeOnScroll, Motion, SearchField } from '../../components';
import SnowFlake from '../../components/SVG/SnowFlake';
import { useAccountAssets, useBackground, useIsDark, usePrices, useSelectedAccount, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { VelvetBox } from '../../style';
import { TEST_NETS } from '../../util/constants';
import { amountToHuman } from '../../util/utils';
import { TokenBalanceDisplay } from '../home/partial/TokenBalanceDisplay';

export const TestnetBadge = ({ style }: { style?: SxProps<Theme>; }) => {
  const { t } = useTranslation();

  return (
    <Stack alignItems='center' columnGap='5px' direction='row' sx={{ bgcolor: '#3988FF26', borderRadius: '9px', mt: '5px', p: '3px 5px', ...style }}>
      <HierarchySquare3 color='#3988FF' size='14' variant='Bulk' />
      <Typography color='#3988FF' fontSize='13px' sx={{ lineHeight: '10px' }} variant='B-2'>
        {t('Test Network')}
      </Typography>
    </Stack>
  );
};

interface StakingBadgeProps {
  hasPoolStaking: boolean;
  isFullscreen?: boolean;
  style?: SxProps<Theme>;
}

export const StakingBadge = ({ hasPoolStaking, isFullscreen, style }: StakingBadgeProps) => {
  const { t } = useTranslation();

  const poolColor = isFullscreen ? ' #82FFA5' : '#A7DFB7';
  const soloColor = '#809ACB';
  const textColor = hasPoolStaking ? poolColor : soloColor;

  const soloBgcolor = isFullscreen ? '#809ACB26' : '#C6AECC26';
  const poolBgcolor = isFullscreen ? '#82FFA526' : '#A7DFB726';
  const bgcolor = hasPoolStaking ? poolBgcolor : soloBgcolor;

  return (
    <Stack alignItems='center' columnGap='5px' direction='row' sx={{ bgcolor, borderRadius: '9px', p: '3px 5px', ...style }}>
      {hasPoolStaking
        ? <I3Dcube color={poolColor} size='14' variant='Bulk' />
        : <SnowFlake color={soloColor} size='14' />}
      <Typography color={textColor} fontSize='13px' sx={{ lineHeight: '10px' }} variant='B-2'>
        {hasPoolStaking ? t('Pool staking') : t('Solo staking')}
      </Typography>
    </Stack>
  );
};

interface Props {
  balance: BN;
  decimal: number;
  genesisHash: string;
  isFirst: boolean;
  isLast: boolean;
  token: string;
  price: number;
  type: 'solo' | 'pool';
}

function PositionRow ({ balance, decimal, genesisHash, isFirst, isLast, price, token, type }: Props): React.ReactElement {
  const navigate = useNavigate();
  const isDark = useIsDark();
  const hasPoolStaking = type === 'pool';
  const isTestNet = TEST_NETS.includes(genesisHash);
  const value = amountToHuman(balance.muln(price), decimal);

  const openStaking = useCallback(() => navigate(`/${type}/` + genesisHash) as void, [genesisHash, navigate, type]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={openStaking} sx={{ ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '8px' }, bgcolor: '#05091C', borderBottom: '1px solid #1B133C', borderBottomLeftRadius: isLast ? '14px' : 0, borderBottomRightRadius: isLast ? '14px' : 0, borderTopLeftRadius: isFirst ? '14px' : 0, borderTopRightRadius: isFirst ? '14px' : 0, cursor: 'pointer', lineHeight: '25px', p: '10px', transition: 'all 250ms ease-out' }}>
      <Stack alignItems='center' direction='row' justifyContent='start'>
        <ChainLogo genesisHash={genesisHash} size={36} />
        <Stack alignItems='start' direction='column' sx={{ ml: '10px' }}>
          <Typography sx={{ mt: '-7px' }} variant='B-2'>
            {token}
          </Typography>
          <StakingBadge hasPoolStaking={hasPoolStaking} />
          {isTestNet &&
            <TestnetBadge />}
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
  useBackground('default');

  const { t } = useTranslation();
  const account = useSelectedAccount();
  const pricesInCurrency = usePrices();
  const accountAssets = useAccountAssets(account?.address);
  const navigate = useNavigate();
  const refContainer = useRef<HTMLDivElement>(null);

  const [searchKeyWord, setSearchKeyWord] = useState<string>();

  const positions = useMemo(() => accountAssets?.filter(({ pooledBalance, soloTotal }) => (soloTotal && !soloTotal.isZero()) || (pooledBalance && !pooledBalance.isZero())), [accountAssets]);

  const filteredToken = useMemo(() => {
    return (
      searchKeyWord
        ? positions?.filter(({ token }) => token?.toLowerCase().includes(searchKeyWord))
        : positions
    )?.sort((a, b) => {
      if (a.pooledBalance && b.pooledBalance) {
        return b.pooledBalance.cmp(a.pooledBalance);
      } else if (a.soloTotal && b.soloTotal) {
        return b.soloTotal.cmp(a.soloTotal);
      } else {
        return 0;
      }
    });
  }, [positions, searchKeyWord]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setSearchKeyWord(undefined);
    }

    keyword = keyword.trim().toLowerCase();
    setSearchKeyWord(keyword);
  }, []);

  const backHome = useCallback(() => navigate('/') as void, [navigate]);
  const onEarningOptions = useCallback(() => navigate('/stakingIndex-options') as void, [navigate]);

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
            placeholder={t('🔍 Search Token')}
            style={{ padding: '4%' }}
          />
          <VelvetBox style={{ margin: '0 4%', maxHeight: '305px', minHeight: '63px', overflowY: 'auto', width: '92%' }}>
            <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '15px', width: '100%' }}>
              {filteredToken?.map(({ decimal, genesisHash, pooledBalance, priceId, soloTotal, token }, index) => {
                const price = pricesInCurrency?.prices[priceId ?? '']?.value ?? 0;

                return (
                  <Fragment key={`${index}_fragment`}>
                    {
                      pooledBalance && !pooledBalance?.isZero() &&
                      <PositionRow
                        balance={pooledBalance}
                        decimal={decimal}
                        genesisHash={genesisHash}
                        isFirst={index === 0}
                        isLast={index === filteredToken.length - 1}
                        key={`${index}_pool`}
                        price={price}
                        token={token}
                        type='pool'
                      />
                    }
                    {
                      soloTotal && !soloTotal?.isZero() &&
                      <PositionRow
                        balance={soloTotal}
                        decimal={decimal}
                        genesisHash={genesisHash}
                        isFirst={index === 0}
                        isLast={index === filteredToken.length - 1}
                        key={`${index}_solo`}
                        price={price}
                        token={token}
                        type='solo'
                      />
                    }
                  </Fragment>
                );
              })}
              <FadeOnScroll containerRef={refContainer} />
            </Grid>
          </VelvetBox>
          <Stack direction='row' justifyContent='center'>
            <ActionButton
              StartIcon={AddCircle}
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
