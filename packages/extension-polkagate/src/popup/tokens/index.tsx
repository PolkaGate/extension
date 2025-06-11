// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { BN } from '@polkadot/util';
import type { FetchedBalance } from '../../hooks/useAssetsBalances';
import type { BalancesInfo } from '../../util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Coin, Lock1, Trade } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { BN_ZERO } from '@polkadot/util';

import { AssetLogo, BackWithLabel, FadeOnScroll, FormatBalance2, FormatPrice, Motion } from '../../components';
import { useAccountAssets, useBackground, useChainInfo, useFormatted3, useLockedInReferenda2, usePrices, useReservedDetails2, useSelectedAccount, useTranslation } from '../../hooks';
import { calcChange, calcPrice } from '../../hooks/useYouHave';
import { windowOpen } from '../../messaging';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { GlowBox } from '../../style';
import { toTitleCase, updateStorage } from '../../util';
import { GOVERNANCE_CHAINS, MIGRATED_NOMINATION_POOLS_CHAINS } from '../../util/constants';
import getLogo2, { type LogoInfo } from '../../util/getLogo2';
import { getValue } from '../account/util';
import DailyChange from '../home/partial/DailyChange';
import ReservedLockedPopup from './partial/ReservedLockedPopup';
import TokenDetailBox from './partial/TokenDetailBox';
import TokenHistory from './partial/TokenHistory';
import TokenStakingInfo from './partial/TokenStakingInfo';

const BackButton = ({ logoInfo, token }: { token: FetchedBalance | undefined; logoInfo: LogoInfo | undefined }) => (
  <Grid alignItems='center' container item sx={{ columnGap: '6px', width: 'fit-content' }}>
    <AssetLogo assetSize='24px' baseTokenSize='16px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={undefined} subLogoPosition='' />
    <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
      {token?.chainName ? toTitleCase(token.chainName) : ''}
    </Typography>
  </Grid>
);

export type Type = 'locked' | 'reserved';

interface LockedReservedState {
  type: Type | undefined;
  data: {
    items: Record<string, BN | undefined>;
    titleIcon: Icon;
  } | undefined;
}

type Action =
  | { type: 'OPEN_MENU'; payload: { menuType: Type; items: Record<string, BN | undefined>; titleIcon: Icon } }
  | { type: 'CLOSE_MENU' }
  | { type: 'UPDATE_ITEMS'; payload: Record<string, BN | undefined> };

const lockedReservedReducer = (state: LockedReservedState, action: Action): LockedReservedState => {
  switch (action.type) {
    case 'OPEN_MENU':
      return {
        data: {
          items: action.payload.items,
          titleIcon: action.payload.titleIcon
        },
        type: action.payload.menuType
      };
    case 'CLOSE_MENU':
      return {
        data: undefined,
        type: undefined
      };
    case 'UPDATE_ITEMS':
      return state.data
        ? {
          ...state,
          data: {
            ...state.data,
            items: action.payload
          }
        }
        : state;
    default:
      return state;
  }
};

function Tokens (): React.ReactElement {
  useBackground('default');

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { genesisHash, paramAssetId } = useParams<{ genesisHash: string; paramAssetId: string }>();
  const pricesInCurrency = usePrices();
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);
  const formatted = useFormatted3(account?.address, genesisHash);
  const reservedReason = useReservedDetails2(formatted, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const { delegatedBalance, totalLocked, unlockableAmount } = useLockedInReferenda2(account?.address, genesisHash, undefined); // TODO: timeToUnlock!
  const refContainer = useRef<HTMLDivElement>(null);

  const [lockedReservedState, dispatch] = useReducer(lockedReservedReducer, {
    data: undefined,
    type: undefined
  });

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const token = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === paramAssetId)
  , [accountAssets, genesisHash, paramAssetId]);

  const transferable = useMemo(() => getValue('transferable', token as unknown as BalancesInfo), [token]);
  const lockedBalance = useMemo(() => getValue('locked balance', token as unknown as BalancesInfo), [token]);
  const reservedBalance = useMemo(() => getValue('reserved', token as unknown as BalancesInfo)?.add(token?.poolReward ?? BN_ZERO), [token]);

  const tokenPrice = pricesInCurrency?.prices[token?.priceId ?? '']?.value ?? 0;
  const tokenPriceChange = pricesInCurrency?.prices[token?.priceId ?? '']?.change ?? 0;
  const change = calcChange(tokenPrice, Number(token?.totalBalance) / (10 ** (token?.decimal ?? 0)), tokenPriceChange);

  const isMigrationEnabled = useMemo(() => MIGRATED_NOMINATION_POOLS_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const totalBalancePrice = useMemo(() => calcPrice(priceOf(token?.priceId ?? '') ?? 0, token?.totalBalance ?? BN_ZERO, token?.decimal ?? 0), [priceOf, token?.decimal, token?.priceId, token?.totalBalance]);

  const { lockedReasonLoading, reservedReasonLoading } = useMemo(() => {
    const reasons = Object.values(reservedReason);
    const reservedReasonLoading = reasons.length === 0 || reasons.some((reason) => reason === undefined);

    const lockedReasonLoading = delegatedBalance === undefined || totalLocked === undefined;

    return {
      lockedReasonLoading,
      reservedReasonLoading
    };
  }, [delegatedBalance, reservedReason, totalLocked]);

  const lockedTooltip = useMemo(() => {
    if (!unlockableAmount || unlockableAmount.isZero() || !GOVERNANCE_CHAINS.includes(genesisHash ?? '') || !api) {
      return undefined;
    }

    return (t('{{amount}} can be unlocked', { replace: { amount: api.createType('Balance', unlockableAmount).toHuman() } }));
  }, [api, genesisHash, t, unlockableAmount]);

  const logoInfo = useMemo(() => getLogo2(token?.genesisHash, token?.token), [token?.genesisHash, token?.token]);

  const hasAmount = useCallback((amount: BN | undefined | null) => amount && !amount.isZero(), []);

  const toSendFund = useCallback(() => {
    account?.address && windowOpen(`/send/${account.address}/${token?.genesisHash}/${paramAssetId}`).catch(console.error);
  }, [account?.address, paramAssetId, token?.genesisHash]);

  const displayPopup = useCallback((type: Type) => () => {
    const items: Record<string, BN | undefined> = {};

    const addStakingItems = (shouldAdd: boolean) => {
      if (!shouldAdd) {
        return;
      }

      if (token?.soloTotal && hasAmount(token?.soloTotal)) {
        items['Solo Staking'] = token.soloTotal;
      }

      if (token?.pooledBalance && hasAmount(token?.pooledBalance)) {
        items['Pool Staking'] = token.pooledBalance.add(token.poolReward ?? BN_ZERO);
      }
    };

    if (type === 'locked') {
      addStakingItems(!isMigrationEnabled);

      if (hasAmount(unlockableAmount) && !items['Governance']) {
        items['Governance'] = unlockableAmount;
      }
    } else {
      if (reservedReason) {
        Object.entries(reservedReason)
          .forEach(([reason, amount]) => {
            if (amount && hasAmount(amount)) {
              items[reason] = amount;
            }
          });
      }

      addStakingItems(!!isMigrationEnabled);
    }

    dispatch({
      payload: {
        items,
        menuType: type,
        titleIcon: type === 'locked' ? Lock1 : Coin
      },
      type: 'OPEN_MENU'
    });
  }, [hasAmount, isMigrationEnabled, reservedReason, token?.poolReward, token?.pooledBalance, token?.soloTotal, unlockableAmount]);

  useEffect(() => {
    if (lockedReservedState.data === undefined || lockedReservedState.type === undefined) {
      return;
    }

    const items: Record<string, BN | undefined> = lockedReservedState.data.items;

    if (lockedReservedState.type === 'reserved') {
      Object.entries(reservedReason).forEach(([reason, amount]) => {
        if (amount && !amount.isZero() && !items[reason]) {
          items[reason] = amount;
        }
      });

      if (reservedReasonLoading) {
        items['loading'] = undefined;
      } else {
        delete items['loading'];
      }
    }

    if (lockedReservedState.type === 'locked') {
      if (delegatedBalance && !delegatedBalance.isZero() && !items['delegate']) {
        items['delegate'] = delegatedBalance;
      }

      const hasVote = delegatedBalance && totalLocked && !totalLocked.isZero() && totalLocked.sub(delegatedBalance).gt(BN_ZERO) && !items['vote'];

      if (hasVote) {
        items['vote'] = totalLocked.sub(delegatedBalance);
      }

      if (lockedReasonLoading) {
        items['loading'] = undefined;
      } else if (!lockedReasonLoading) {
        delete items['loading'];
      }
    }

    dispatch({
      payload: items,
      type: 'UPDATE_ITEMS'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatedBalance, lockedReasonLoading, JSON.stringify(lockedReservedState.data?.items), lockedReservedState.type, reservedReason, reservedReasonLoading, totalLocked]);

  useEffect(() => {
    account?.address && genesisHash && updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [account.address]: genesisHash }).catch(console.error);
  }, [account?.address, genesisHash]);

  const closeMenu = useCallback(() => {
    dispatch({ type: 'CLOSE_MENU' });
  }, []);

  const backHome = useCallback(() => navigate('/') as void, [navigate]);

  return (
    <Motion variant='flip'>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <BackWithLabel
          content={<BackButton logoInfo={logoInfo} token={token} />}
          onClick={backHome}
          style={{ height: '40px', pb: 0 }}
        />
        <Container disableGutters ref={refContainer} sx={{ display: 'block', height: 'fit-content', maxHeight: '504px', overflowY: 'auto', pb: '60px', pt: '15px' }}>
          <GlowBox style={{ justifyContent: 'center', justifyItems: 'center', rowGap: '5px' }}>
            <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', mt: '-12px', width: 'fit-content' }}>
              <AssetLogo assetSize='48px' baseTokenSize='24px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} subLogoPosition='-6px -8px auto auto' />
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
              num={totalBalancePrice}
              width='fit-content'
              withSmallDecimal
            />
            <Grid alignItems='center' container item sx={{ columnGap: '5px', lineHeight: '10px', width: 'fit-content' }}>
              <FormatBalance2
                decimalPoint={4}
                decimals={[token?.decimal ?? 0]}
                style={{
                  color: '#BEAAD8',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500,
                  width: 'max-content'
                }}
                tokens={[token?.token ?? '']}
                value={token?.totalBalance}
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
              amount={transferable}
              decimal={token?.decimal}
              onClick={hasAmount(transferable) ? toSendFund : undefined}
              priceId={token?.priceId}
              title={t('Transferable')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Lock1}
              amount={lockedBalance}
              decimal={token?.decimal}
              description={lockedTooltip}
              onClick={hasAmount(lockedBalance) ? displayPopup('locked') : undefined}
              priceId={token?.priceId}
              title={t('Locked')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Coin}
              amount={reservedBalance}
              decimal={token?.decimal}
              onClick={hasAmount(reservedBalance) ? displayPopup('reserved') : undefined}
              priceId={token?.priceId}
              title={t('Reserved')}
              token={token?.token}
            />
            <TokenStakingInfo
              genesisHash={genesisHash}
              tokenDetail={token}
            />
          </Grid>
          <TokenHistory
            address={account?.address}
            decimal={token?.decimal}
            genesisHash={genesisHash}
            token={token?.token}
          />
          <FadeOnScroll containerRef={refContainer} />
        </Container>
      </Grid>
      <HomeMenu />
      <ReservedLockedPopup
        TitleIcon={lockedReservedState.data?.titleIcon}
        decimal={token?.decimal}
        handleClose={closeMenu}
        items={lockedReservedState.data?.items ?? {}}
        openMenu={!!lockedReservedState.type}
        price={tokenPrice}
        title={lockedReservedState.type ?? ''}
        token={token?.token}
      />
    </Motion>
  );
}

export default memo(Tokens);
