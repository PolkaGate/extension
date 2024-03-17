// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { AccountContext, ActionContext } from '../../components';
import { useAccount, useAccountAssets, useApi, useBalances, useChain, useChainName, useCurrency, useFormatted, useFullscreen, usePrices3, useTranslation } from '../../hooks';
import { Lock } from '../../hooks/useAccountLocks';
import { FetchedBalance } from '../../hooks/useAssetsOnChains2';
import { ASSET_HUBS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';
import { amountToHuman, sanitizeChainName } from '../../util/utils';
import { getValue } from '../account/util';
import ExportAccountModal from '../export/ExportAccountModal';
import ForgetAccountModal from '../forgetAccount/ForgetAccountModal';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HistoryModal from '../history/modal/HistoryModal';
import { label } from '../home/AccountsTree';
import DeriveAccountModal from '../newAccount/deriveAccount/modal/DeriveAccountModal';
import ReceiveModal from '../receive/ReceiveModal';
import RenameModal from '../rename/RenameModal';
import LockedInReferenda from './unlock/Review';
import { AccountInformation, AccountSetting, ChangeAssets, CommonTasks, DisplayBalance, ExternalLinks, LockedBalanceDisplay, TotalChart } from './components';

export type AssetsOnOtherChains = {
  assetId?: number,
  totalBalance: BN,
  chainName: string,
  decimal: number,
  genesisHash: string,
  price: number | undefined,
  token: string
};

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

export default function AccountDetails(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const account = useAccount(address);
  const { accounts } = useContext(AccountContext);

  const currency = useCurrency();
  const formatted = useFormatted(address);
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const onAction = useContext(ActionContext);
  const accountAssets = useAccountAssets(address);

  const [refreshNeeded, setRefreshNeeded] = useState<boolean>(false);
  const [assetId, setAssetId] = useState<number>();
  const [selectedAsset, setSelectedAsset] = useState<FetchedBalance>();

  const balances = useBalances(address, refreshNeeded, setRefreshNeeded, undefined, assetId || selectedAsset?.assetId);
  const pricesInCurrency = usePrices3();

  const [displayPopup, setDisplayPopup] = useState<number | undefined>();
  const [unlockInformation, setUnlockInformation] = useState<UnlockInformationType | undefined>();

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette]);
  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);
  const supportGov = useMemo(() => GOVERNANCE_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportStaking = useMemo(() => STAKING_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportAssetHubs = useMemo(() => ASSET_HUBS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const showTotalChart = useMemo(() => accountAssets && accountAssets.length > 0 && accountAssets.filter((_asset) => pricesInCurrency && currency && pricesInCurrency.prices[_asset?.priceId]?.value > 0 && !new BN(_asset.totalBalance).isZero()), [accountAssets, currency, pricesInCurrency]);
  const currentPrice = useMemo((): number | undefined => {
    const selectedAssetPriceId = selectedAsset?.priceId;

    if (selectedAsset && !selectedAssetPriceId) {
      return 0; // price is 0 for assets with no priceId
    }

    const currentChainName = sanitizeChainName(chainName)?.toLocaleLowerCase();
    const currentAssetPrices = pricesInCurrency?.prices?.[(selectedAssetPriceId || currentChainName) as string];

    return currentAssetPrices?.value;
  }, [selectedAsset, chainName, pricesInCurrency?.prices]);

  const hasParent = useMemo(() => account ? accounts.find(({ address }) => address === account.parentAddress) : undefined, [account, accounts]);

  const nativeAssetPrice = useMemo(() => {
    if (!pricesInCurrency || !balances || !currentPrice) {
      return undefined;
    }

    const totalBalance = getValue('total', balances);

    return parseFloat(amountToHuman(totalBalance, balances.decimal)) * currentPrice;
  }, [balances, currentPrice, pricesInCurrency]);

  useEffect(() => {
    assetId && setAssetId(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  const onChangeAsset = useCallback((id: number) => {
    if (id === -1) { // this is the id of native token
      return setAssetId(undefined);
    }

    setAssetId(id);
  }, []);

  const goToSend = useCallback(() => {
    address && onAction(`/send/${address}/${assetId ?? ''}`);
  }, [address, assetId, onAction]);

  const goToSoloStaking = useCallback(() => {
    address && account?.genesisHash && STAKING_CHAINS.includes(account.genesisHash) &&
      history.push({
        pathname: `/solo/${address}/`,
        state: { api, pathname: `account/${address}` }
      });
  }, [account?.genesisHash, address, api, history]);

  const goToPoolStaking = useCallback(() => {
    address && account?.genesisHash && STAKING_CHAINS.includes(account.genesisHash) && history.push({
      pathname: `/pool/${address}/`,
      state: { api, pathname: `account/${address}` }
    });
  }, [account?.genesisHash, address, api, history]);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader page='AccountDetails' />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '5%' }}>
          <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
            {t<string>('Account Details')}
          </Typography>
          <Grid container item justifyContent='space-between' mb='15px'>
            <Grid container direction='column' item rowGap='10px' width='calc(100% - 275px - 3%)'>
              <Grid item sx={{ bgcolor: theme.palette.nay.main, color: 'white', fontSize: '10px', ml: 5, position: 'absolute', px: 1, width: 'fit-content' }}>
                {label(account, hasParent?.name || '', t)}
              </Grid>
              <AccountInformation
                accountAssets={accountAssets}
                address={address}
                api={api}
                balances={balances}
                chain={chain}
                chainName={chainName}
                formatted={formatted}
                isDarkTheme={isDarkTheme}
                price={currentPrice}
                pricesInCurrency={pricesInCurrency}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
              />
              {supportAssetHubs &&
                <ChangeAssets
                  address={address}
                  assetId={assetId || selectedAsset?.assetId}
                  label={t('Assets')}
                  onChange={onChangeAsset}
                  setAssetId={setAssetId}
                  style={{ '> div div div#selectChain': { borderRadius: '5px' }, '> div p': { fontSize: '16px' } }}
                />}
              <DisplayBalance
                amount={balances?.availableBalance}
                decimal={balances?.decimal}
                isDarkTheme={isDarkTheme}
                onClick={goToSend}
                price={currentPrice}
                theme={theme}
                title={t<string>('Transferable')}
                token={balances?.token}
              />
              {supportStaking &&
                <DisplayBalance
                  amount={balances?.soloTotal}
                  decimal={balances?.decimal}
                  isDarkTheme={isDarkTheme}
                  onClick={goToSoloStaking}
                  price={currentPrice}
                  theme={theme}
                  title={t<string>('Solo Stake')}
                  token={balances?.token}
                />}
              {supportStaking &&
                <DisplayBalance
                  amount={balances?.pooledBalance}
                  decimal={balances?.decimal}
                  isDarkTheme={isDarkTheme}
                  onClick={goToPoolStaking}
                  price={currentPrice}
                  theme={theme}
                  title={t<string>('Pool Stake')}
                  token={balances?.token}
                />}
              {supportGov &&
                <LockedBalanceDisplay
                  address={address}
                  api={api}
                  chain={chain}
                  decimal={balances?.decimal}
                  formatted={String(formatted)}
                  isDarkTheme={isDarkTheme}
                  price={currentPrice}
                  refreshNeeded={refreshNeeded}
                  setDisplayPopup={setDisplayPopup}
                  setUnlockInformation={setUnlockInformation}
                  title={t<string>('Locked in Referenda')}
                  token={balances?.token}
                />
              }
              <DisplayBalance
                amount={balances?.reservedBalance}
                decimal={balances?.decimal}
                isDarkTheme={isDarkTheme}
                price={currentPrice} // TODO: double check
                title={t<string>('Reserved')}
                token={balances?.token}
              />
            </Grid>
            <Grid container direction='column' gap='15px' item width='275px'>
              {showTotalChart &&
                <TotalChart
                  accountAssets={accountAssets}
                  isDarkTheme={isDarkTheme}
                  nativeAssetPrice={nativeAssetPrice}
                  pricesInCurrency={pricesInCurrency}
                />
              }
              <CommonTasks
                address={address}
                api={api}
                assetId={assetId}
                balance={balances}
                genesisHash={account?.genesisHash}
                setDisplayPopup={setDisplayPopup}
              />
              <AccountSetting
                address={address}
                setDisplayPopup={setDisplayPopup}
              />
              <ExternalLinks
                address={address}
              />
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
