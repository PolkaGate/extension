// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowBackIos as ArrowBackIosIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN } from '@polkadot/util';

import { AccountContext, ActionContext } from '../../components';
import { useAccount, useAccountAssets, useBalances, useCurrency, useFullscreen, useInfo, usePrices, useTranslation } from '../../hooks';
import { Lock } from '../../hooks/useAccountLocks';
import { FetchedBalance } from '../../hooks/useAssetsBalances';
import { getValue } from '../../popup/account/util';
import ExportAccountModal from '../../popup/export/ExportAccountModal';
import ForgetAccountModal from '../../popup/forgetAccount/ForgetAccountModal';
import HistoryModal from '../../popup/history/modal/HistoryModal';
import { label } from '../../popup/home/AccountsTree';
import DeriveAccountModal from '../../popup/newAccount/deriveAccount/modal/DeriveAccountModal';
import ReceiveModal from '../../popup/receive/ReceiveModal';
import RenameModal from '../../popup/rename/RenameModal';
import { EXTRA_PRICE_IDS } from '../../util/api/getPrices';
import { ASSET_HUBS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';
import { amountToHuman, sanitizeChainName } from '../../util/utils';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import { openOrFocusTab } from './components/CommonTasks';
import LockedInReferenda from './unlock/Review';
import { AccountInformation, AccountSetting, ChangeAssets, CommonTasks, DisplayBalance, ExternalLinks, LockedBalanceDisplay, TotalChart } from './components';

export const popupNumbers = {
  LOCKED_IN_REFERENDA: 1,
  FORGET_ACCOUNT: 2,
  RENAME: 3,
  EXPORT_ACCOUNT: 4,
  DERIVE_ACCOUNT: 5,
  RECEIVE: 6,
  HISTORY: 7
};

export interface UnlockInformationType {
  classToUnlock: Lock[];
  totalLocked: BN;
  unlockableAmount: BN;
}

const isRelayChain = (chainName: string) =>
  chainName.toLowerCase() === 'kusama' ||
  chainName.toLowerCase() === 'polkadot' ||
  chainName.toLowerCase() === 'westend';

export default function AccountDetails (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address, paramAssetId } = useParams<{ address: string, paramAssetId?: string }>();
  const account = useAccount(address);
  const { accounts } = useContext(AccountContext);

  const currency = useCurrency();
  const { api, chain, chainName, formatted } = useInfo(address);
  const onAction = useContext(ActionContext);
  const accountAssets = useAccountAssets(address);
  const pricesInCurrency = usePrices();

  const [refreshNeeded, setRefreshNeeded] = useState<boolean>(false);
  const [assetIdOnAssetHub, setAssetIdOnAssetHub] = useState<number>();
  const [selectedAsset, setSelectedAsset] = useState<FetchedBalance>();
  const [displayPopup, setDisplayPopup] = useState<number | undefined>();
  const [unlockInformation, setUnlockInformation] = useState<UnlockInformationType | undefined>();

  const assetId = useMemo(() => assetIdOnAssetHub || selectedAsset?.assetId, [assetIdOnAssetHub, selectedAsset?.assetId]);

  const balances = useBalances(address, refreshNeeded, setRefreshNeeded, undefined, assetId);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette]);
  const isOnAssetHub = useMemo(() => ASSET_HUBS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportGov = useMemo(() => GOVERNANCE_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportStaking = useMemo(() => STAKING_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const showTotalChart = useMemo(() => accountAssets && accountAssets.length > 0 && accountAssets.filter((_asset) => pricesInCurrency && currency && pricesInCurrency.prices[_asset?.priceId]?.value > 0 && !new BN(_asset.totalBalance).isZero()), [accountAssets, currency, pricesInCurrency]);
  const hasParent = useMemo(() => account ? accounts.find(({ address }) => address === account.parentAddress) : undefined, [account, accounts]);

  const balancesToShow = useMemo(() => {
    // TODO: if we add solo balance to fetched assets then we can dismiss this condition and just use selectedAsset || balances
    if (!chainName) {
      return;
    }

    return isRelayChain(chainName) ? balances : (selectedAsset || balances);
  }, [balances, chainName, selectedAsset]);

  const currentPrice = useMemo((): number | undefined => {
    const selectedAssetPriceId = selectedAsset?.priceId;

    if (selectedAsset && !selectedAssetPriceId) {
      // price is 0 for assets with no priceId
      return 0;
    }

    const currentChainName = sanitizeChainName(chainName)?.toLocaleLowerCase();
    const currentAssetPrices = pricesInCurrency?.prices?.[(selectedAssetPriceId || EXTRA_PRICE_IDS[currentChainName || ''] || currentChainName) as string];
    const mayBeTestNetPrice = pricesInCurrency?.prices && !currentAssetPrices ? 0 : undefined;

    return currentAssetPrices?.value || mayBeTestNetPrice;
  }, [selectedAsset, chainName, pricesInCurrency?.prices]);

  const nativeAssetPrice = useMemo(() => {
    if (!pricesInCurrency || !balances || !currentPrice) {
      return undefined;
    }

    const totalBalance = getValue('total', balances);

    return parseFloat(amountToHuman(totalBalance, balances.decimal)) * currentPrice;
  }, [balances, currentPrice, pricesInCurrency]);

  useEffect(() => {
    // reset assetId on chain switch
    assetIdOnAssetHub && setAssetIdOnAssetHub(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  useEffect(() => {
    // will match the selected assetId when you select another asset through AOC
    selectedAsset && setAssetIdOnAssetHub(selectedAsset?.assetId);
  }, [selectedAsset]);

  useEffect(() => {
    onAction(`/accountfs/${address}/${assetId || '0'}`);
  }, [address, assetId, onAction]);

  useEffect(() => {
    const mayBeAssetIdSelectedInHomePage = parseInt(paramAssetId);

    if (mayBeAssetIdSelectedInHomePage && accountAssets) {
      const found = accountAssets.find(({ assetId, genesisHash }) => assetId === mayBeAssetIdSelectedInHomePage && account?.genesisHash === genesisHash);

      setSelectedAsset(found);
    }
  }, [account?.genesisHash, accountAssets, paramAssetId]);

  const onChangeAsset = useCallback((id: number) => {
    if (id === -1) { // this is the id of native token
      setSelectedAsset(undefined);

      return setAssetIdOnAssetHub(undefined);
    }

    setAssetIdOnAssetHub(id); // this works for assethubs atm
  }, []);

  const goToSend = useCallback(() => {
    address && onAction(`/send/${address}/${assetId || ''}`);
  }, [address, assetId, onAction]);

  const goToSoloStaking = useCallback(() => {
    address && account?.genesisHash && STAKING_CHAINS.includes(account.genesisHash) &&
    openOrFocusTab(`/solofs/${address}/`);
  }, [account?.genesisHash, address]);

  const goToPoolStaking = useCallback(() => {
    address && account?.genesisHash && STAKING_CHAINS.includes(account.genesisHash) && openOrFocusTab(`/poolfs/${address}/`);
  }, [account?.genesisHash, address]);

  const onBackClick = useCallback(() => {
    openOrFocusTab('/', true);
  }, []);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='AccountDetails' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '5%' }}>
          <Grid alignItems='center' container item>
            <Grid container item width='fit-content'>
              <ArrowBackIosIcon
                onClick={onBackClick}
                sx={{
                  ':hover': { opacity: 1 },
                  color: 'secondary.light',
                  cursor: 'pointer',
                  fontSize: 36,
                  opacity: 0.5,
                  stroke: theme.palette.secondary.light,
                  strokeWidth: 1
                }}
              />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t('Account Details')}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent='space-between' mb='15px'>
            <Grid container direction='column' item mb='10px' minWidth='735px' rowGap='10px' width='calc(100% - 300px - 3%)'>
              <AccountInformation
                accountAssets={accountAssets}
                address={address}
                api={api}
                balances={balances}
                chain={chain}
                chainName={chainName}
                formatted={formatted}
                isDarkTheme={isDarkTheme}
                label={label(account, hasParent?.name || '', t)}
                price={currentPrice}
                pricesInCurrency={pricesInCurrency}
                selectedAsset={selectedAsset}
                setAssetIdOnAssetHub={setAssetIdOnAssetHub}
                setSelectedAsset={setSelectedAsset}
              />
              {account?.genesisHash &&
                <>
                  {isOnAssetHub &&
                    <ChangeAssets
                      address={address}
                      assetId={assetId}
                      label={t('Assets')}
                      onChange={onChangeAsset}
                      setAssetId={setAssetIdOnAssetHub}
                      style={{ '> div div div#selectChain': { borderRadius: '5px' }, '> div p': { fontSize: '16px' } }}
                    />
                  }
                  <DisplayBalance
                    amount={balancesToShow?.availableBalance}
                    decimal={balancesToShow?.decimal}
                    isDarkTheme={isDarkTheme}
                    onClick={goToSend}
                    price={currentPrice}
                    theme={theme}
                    title={t('Transferable')}
                    token={balancesToShow?.token}
                  />
                  {isOnAssetHub &&
                    <DisplayBalance
                      amount={balancesToShow?.lockedBalance}
                      decimal={balancesToShow?.decimal}
                      isDarkTheme={isDarkTheme}
                      price={currentPrice} // TODO: double check
                      title={t('Locked')}
                      token={balancesToShow?.token}
                    />}
                  {supportStaking &&
                    <DisplayBalance
                      amount={balancesToShow?.soloTotal}
                      decimal={balancesToShow?.decimal}
                      disabled={!balancesToShow?.soloTotal || balancesToShow?.soloTotal?.isZero()}
                      isDarkTheme={isDarkTheme}
                      onClick={goToSoloStaking}
                      price={currentPrice}
                      theme={theme}
                      title={t('Solo Stake')}
                      token={balancesToShow?.token}
                    />}
                  {supportStaking &&
                    <DisplayBalance
                      amount={balancesToShow?.pooledBalance}
                      decimal={balancesToShow?.decimal}
                      disabled={!balancesToShow?.pooledBalance || balancesToShow?.pooledBalance?.isZero()}
                      isDarkTheme={isDarkTheme}
                      onClick={goToPoolStaking}
                      price={currentPrice}
                      theme={theme}
                      title={t('Pool Stake')}
                      token={balancesToShow?.token}
                    />}
                  {supportGov &&
                    <LockedBalanceDisplay
                      address={address}
                      api={api}
                      chain={chain}
                      decimal={balancesToShow?.decimal}
                      formatted={String(formatted)}
                      isDarkTheme={isDarkTheme}
                      price={currentPrice}
                      refreshNeeded={refreshNeeded}
                      setDisplayPopup={setDisplayPopup}
                      setUnlockInformation={setUnlockInformation}
                      title={t('Locked in Referenda')}
                      token={balancesToShow?.token}
                    />
                  }
                  {!isOnAssetHub &&
                    <DisplayBalance
                      amount={balancesToShow?.reservedBalance}
                      decimal={balancesToShow?.decimal}
                      isDarkTheme={isDarkTheme}
                      price={currentPrice} // TODO: double check
                      title={t('Reserved')}
                      token={balancesToShow?.token}
                    />}
                </>
              }
            </Grid>
            <Grid container direction='column' gap='15px' item width='300px'>
              {showTotalChart &&
                <TotalChart
                  accountAssets={accountAssets}
                  isDarkTheme={isDarkTheme}
                  nativeAssetPrice={nativeAssetPrice}
                  pricesInCurrency={pricesInCurrency}
                />
              }
              {account?.genesisHash &&
                <CommonTasks
                  address={address}
                  assetId={assetId}
                  balance={balancesToShow}
                  genesisHash={account?.genesisHash}
                  setDisplayPopup={setDisplayPopup}
                />
              }
              <AccountSetting
                address={address}
                setDisplayPopup={setDisplayPopup}
              />
              {account?.genesisHash &&
                <ExternalLinks
                  address={address}
                />
              }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {displayPopup === popupNumbers.LOCKED_IN_REFERENDA && unlockInformation && api &&
        <LockedInReferenda
          address={address}
          api={api}
          classToUnlock={unlockInformation.classToUnlock}
          setDisplayPopup={setDisplayPopup}
          setRefresh={setRefreshNeeded}
          show={displayPopup === popupNumbers.LOCKED_IN_REFERENDA}
          totalLocked={unlockInformation.totalLocked}
          unlockableAmount={unlockInformation.unlockableAmount}
        />
      }
      {displayPopup === popupNumbers.FORGET_ACCOUNT && account &&
        <ForgetAccountModal
          account={account}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === popupNumbers.RENAME &&
        <RenameModal
          address={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === popupNumbers.EXPORT_ACCOUNT &&
        <ExportAccountModal
          address={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === popupNumbers.DERIVE_ACCOUNT &&
        <DeriveAccountModal
          parentAddress={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === popupNumbers.RECEIVE &&
        <ReceiveModal
          address={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === popupNumbers.HISTORY &&
        <HistoryModal
          address={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
    </Grid>
  );
}
