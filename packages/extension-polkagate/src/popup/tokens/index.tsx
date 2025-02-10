// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { FetchedBalance } from '../../hooks/useAssetsBalances';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Coin, Lock1, Trade } from 'iconsax-react';
import React, { memo, useCallback, useContext, useMemo } from 'react';
import { useParams } from 'react-router';

import { BN_ZERO } from '@polkadot/util';

import { ActionContext, AssetLogo, BackWithLabel, FormatBalance2, FormatPrice } from '../../components';
import { useAccountAssets, usePrices, useSelectedAccount, useTranslation } from '../../hooks';
import { calcChange, calcPrice } from '../../hooks/useYouHave';
import { windowOpen } from '../../messaging';
import { UserDashboardHeader } from '../../partials';
import { GlowBox } from '../../style';
import getLogo2, { type LogoInfo } from '../../util/getLogo2';
import DailyChange from '../home/partial/DailyChange';
import TokenDetailBox from './partial/TokenDetailBox';
import TokenHistory from './partial/TokenHistory';
import TokenStakingInfo from './partial/TokenStakingInfo';

interface ColumnAmountsProps {
  dollarAmount: number;
  tokenAmount: BN;
  token: string;
  decimal: number;
}

export const ColumnAmounts = ({ decimal, dollarAmount, token, tokenAmount }: ColumnAmountsProps) => {
  const theme = useTheme();

  return (
    <Grid container direction='column' item width='fit-content'>
      <FormatPrice
        commify
        decimalColor={theme.palette.text.secondary}
        dotStyle='normal'
        fontFamily='Inter'
        fontSize='14px'
        fontWeight={600}
        height={18}
        num={dollarAmount}
        width='fit-content'
        withSmallDecimal
      />
      <FormatBalance2
        decimalPoint={2}
        decimals={[decimal]}
        style={{
          color: '#BEAAD8',
          fontFamily: 'Inter',
          fontSize: '12px',
          fontWeight: 500,
          width: 'max-content'
        }}
        tokens={[token]}
        value={tokenAmount}
      />
    </Grid>
  );
};

const BackButton = ({ logoInfo, token }: { token: FetchedBalance | undefined; logoInfo: LogoInfo | undefined }) => (
  <Grid alignItems='center' container item sx={{ columnGap: '6px', width: 'fit-content' }}>
    <AssetLogo assetSize='24px' baseTokenSize='16px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={undefined} subLogoPosition='' />
    <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
      {token?.chainName}
    </Typography>
  </Grid>
);

function Tokens (): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { genesisHash, paramAssetId } = useParams<{ genesisHash: string; paramAssetId: string }>();
  const pricesInCurrency = usePrices();
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const token = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === paramAssetId)
  , [accountAssets, genesisHash, paramAssetId]);

  const hasTransferableBalance = token?.availableBalance && !token.availableBalance.isZero();
  const tokenPrice = pricesInCurrency?.prices[token?.priceId ?? '']?.value ?? 0;
  const tokenPriceChange = pricesInCurrency?.prices[token?.priceId ?? '']?.change ?? 0;
  const change = calcChange(tokenPrice, Number(token?.totalBalance) / (10 ** (token?.decimal ?? 0)), tokenPriceChange);

  const totalBalance = useMemo(() => calcPrice(priceOf(token?.priceId ?? '0'), token?.totalBalance ?? BN_ZERO, token?.decimal ?? 0), [priceOf, token?.decimal, token?.priceId, token?.totalBalance]);

  const logoInfo = getLogo2(token?.genesisHash, token?.token);

  const toSendFund = useCallback(() => {
    account?.address && windowOpen(`/send/${account.address}/${paramAssetId}`).catch(console.error);
  }, [account?.address, paramAssetId]);

  const backHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader />
      <BackWithLabel
        content={<BackButton logoInfo={logoInfo} token={token} />}
        onClick={backHome}
        style={{ pb: 0 }}
      />
      <Container disableGutters sx={{ display: 'block', height: 'fit-content', maxHeight: '495px', overflowY: 'scroll', pt: '15px' }}>
        <GlowBox style={{ justifyContent: 'center', justifyItems: 'center', rowGap: '5px' }}>
          <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', mt: '-12px', width: 'fit-content' }}>
            <AssetLogo assetSize='48px' baseTokenSize='24px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
          </Grid>
          <Typography color='text.secondary' variant='B-2'>
            {token?.token}
          </Typography>
          <FormatPrice
            commify
            decimalColor={theme.palette.text.secondary}
            dotStyle={'big'}
            fontFamily='OdibeeSans'
            fontSize='40px'
            fontWeight={400}
            height={40}
            num={totalBalance}
            width='fit-content'
            withSmallDecimal
          />
          <Grid alignItems='center' container item sx={{ columnGap: '5px', lineHeight: '10px', width: 'fit-content' }}>
            <FormatPrice
              commify
              fontFamily='Inter'
              fontSize='12px'
              fontWeight={500}
              ignoreHide
              num={tokenPrice}
              skeletonHeight={14}
              textColor='#AA83DC'
              width='fit-content'
            />
            {token?.priceId && pricesInCurrency?.prices[token?.priceId]?.change &&
              <DailyChange
                change={change}
                textVariant='B-1'
              />
            }
          </Grid>
        </GlowBox>
        <Grid container item sx={{ display: 'flex', gap: '4px', p: '15px', pb: '10px' }}>
          <TokenDetailBox
            Icon={Trade}
            amount={token?.availableBalance}
            decimal={token?.decimal}
            onClick={hasTransferableBalance ? toSendFund : undefined}
            priceId={token?.priceId}
            title={t('Transferable')}
            token={token?.token}
          />
          <TokenDetailBox
            Icon={Lock1}
            amount={token?.lockedBalance}
            decimal={token?.decimal}
            description='locked'
            priceId={token?.priceId}
            title={t('Locked')}
            token={token?.token}
          />
          <TokenDetailBox
            Icon={Coin}
            amount={token?.reservedBalance}
            decimal={token?.decimal}
            description='locked'
            priceId={token?.priceId}
            title={t('Reserved')}
            token={token?.token}
          />
          <TokenStakingInfo tokenDetail={token} />
        </Grid>
        <TokenHistory
          address={account?.address}
          decimal={token?.decimal}
          genesisHash={genesisHash}
          token={token?.token}
        />
      </Container>
    </Grid>
  );
}

export default memo(Tokens);
