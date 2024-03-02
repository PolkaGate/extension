// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ActionContext } from '../../components';
import { useAccount, useAccountAssets, useApi, useBalances, useChain, useChainName, useDecimal, useFormatted, useFullscreen, usePrice2, useToken, useTranslation } from '../../hooks';
import { Lock } from '../../hooks/useAccountLocks';
import { ASSET_HUBS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';
import { amountToHuman } from '../../util/utils';
import { getValue } from '../account/util';
import ExportAccountModal from '../export/ExportAccountModal';
import ForgetAccountModal from '../forgetAccount/ForgetAccountModal';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HistoryModal from '../history/modal/HistoryModal';
import DeriveAccountModal from '../newAccount/deriveAccount/modal/DeriveAccountModal';
import ReceiveModal from '../receive/ReceiveModal';
import RenameModal from '../rename/RenameModal';
import LockedInReferenda from './unlock/Review';
import { AccountInformation, AccountSetting, ChangeAssets, CommonTasks, DisplayBalance, ExternalLinks, LockedBalanceDisplay, TotalChart } from './components';

export type AssetsOnOtherChains = { assetId?: number, totalBalance: BN, chainName: string, decimal: number, genesisHash: string, price: number | undefined, token: string };
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

export default function AccountDetails (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const account = useAccount(address);
  const formatted = useFormatted(address);
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const onAction = useContext(ActionContext);
  const accountAssets = useAccountAssets(address);

  const [refreshNeeded, setRefreshNeeded] = useState<boolean>(false);
  const [assetId, setAssetId] = useState<number>();

  const balance = useBalances(address, refreshNeeded, setRefreshNeeded, undefined, assetId);
  const price = usePrice2(address, assetId);

  const [displayPopup, setDisplayPopup] = useState<number | undefined>();
  const [unlockInformation, setUnlockInformation] = useState<UnlockInformationType | undefined>();

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette]);
  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);
  const supportGov = useMemo(() => GOVERNANCE_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportStaking = useMemo(() => STAKING_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportAssetHubs = useMemo(() => ASSET_HUBS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const showTotalChart = useMemo(() => accountAssets && accountAssets.length > 0 && accountAssets.filter((asset) => asset.price && asset.price > 0 && !asset.totalBalance.isZero()), [accountAssets]);
  const nativeAssetPrice = useMemo(() => {
    if (!price || !balance) {
      return undefined;
    }

    const totalBalance = getValue('total', balance);

    return parseFloat(amountToHuman(totalBalance, balance.decimal)) * price.price;
  }, [balance, price]);

  useEffect(() => {
    assetId && setAssetId(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  const _onChangeAsset = useCallback((id: number) => {
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
              <AccountInformation
                accountAssets={accountAssets}
                address={address}
                api={api}
                assetId={assetId}
                balances={balance}
                chain={chain}
                chainName={chainName}
                formatted={formatted}
                isDarkTheme={isDarkTheme}
                price={price}
                setAssetId={setAssetId}
              />
              {supportAssetHubs &&
                <ChangeAssets
                  address={address}
                  assetId={assetId}
                  label={t('Assets')}
                  onChange={_onChangeAsset}
                  setAssetId={setAssetId}
                  style={{ '> div div div#selectChain': { borderRadius: '5px' }, '> div p': { fontSize: '16px' } }}
                />}
              <DisplayBalance
                amount={balance?.availableBalance}
                decimal={balance?.decimal}
                isDarkTheme={isDarkTheme}
                onClick={goToSend}
                price={price?.price}
                theme={theme}
                title={t<string>('Transferable')}
                token={balance?.token}
              />
              {supportStaking &&
                <DisplayBalance
                  amount={balance?.soloTotal}
                  decimal={balance?.decimal}
                  isDarkTheme={isDarkTheme}
                  onClick={goToSoloStaking}
                  price={price?.price}
                  theme={theme}
                  title={t<string>('Solo Stake')}
                  token={balance?.token}
                />}
              {supportStaking &&
                <DisplayBalance
                  amount={balance?.pooledBalance}
                  decimal={balance?.decimal}
                  isDarkTheme={isDarkTheme}
                  onClick={goToPoolStaking}
                  price={price?.price}
                  theme={theme}
                  title={t<string>('Pool Stake')}
                  token={balance?.token}
                />}
              {supportGov &&
                <LockedBalanceDisplay
                  address={address}
                  api={api}
                  chain={chain}
                  decimal={balance?.decimal}
                  formatted={String(formatted)}
                  isDarkTheme={isDarkTheme}
                  price={price?.price}
                  refreshNeeded={refreshNeeded}
                  setDisplayPopup={setDisplayPopup}
                  setUnlockInformation={setUnlockInformation}
                  title={t<string>('Locked in Referenda')}
                  token={balance?.token}
                />
              }
              <DisplayBalance
                amount={balance?.reservedBalance}
                decimal={balance?.decimal}
                isDarkTheme={isDarkTheme}
                price={price?.price}
                title={t<string>('Reserved')}
                token={balance?.token}
              />
            </Grid>
            <Grid container direction='column' gap='15px' item width='275px'>
              {showTotalChart &&
                <TotalChart
                  accountAssets={accountAssets}
                  isDarkTheme={isDarkTheme}
                  nativeAssetPrice={nativeAssetPrice}
                />
              }
              <CommonTasks
                address={address}
                api={api}
                assetId={assetId}
                balance={balance}
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
