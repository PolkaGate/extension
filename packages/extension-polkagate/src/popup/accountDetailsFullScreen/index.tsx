// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ActionContext } from '../../components';
import { useAccount, useApi, useBalances, useChain, useChainName, useDecimal, useFormatted, useFullscreen, usePrice, useToken, useTranslation } from '../../hooks';
import { Lock } from '../../hooks/useAccountLocks';
import { windowOpen } from '../../messaging';
import { ASSET_HUBS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';
import { amountToHuman, isHexToBn } from '../../util/utils';
import { getValue } from '../account/util';
import DeriveAccountModal from '../deriveAccount/modal/DeriveAccountModal';
import ExportAccountModal from '../export/ExportAccountModal';
import ForgetAccountModal from '../forgetAccount/ForgetAccountModal';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HistoryModal from '../history/modal/HistoryModal';
import ReceiveModal from '../receive/ReceiveModal';
import RenameModal from '../rename/RenameModal';
import AccountInformation from './components/AccountInformation';
import AccountSetting from './components/AccountSetting';
import ChangeAssets from './components/ChangeAssets';
import CommonTasks from './components/CommonTasks';
import DisplayBalance from './components/DisplayBalance';
import ExternalLinks from './components/ExternalLinks';
import LockedBalanceDisplay from './components/LockedBalanceDisplay';
import TotalChart from './components/TotalChart';
import LockedInReferenda from './unlock/Review';

export type AssetsOnOtherChains = { totalBalance: BN, chainName: string, decimal: number, price: number | undefined, token: string };
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

  const [workerCalled, setWorkerCalled] = useState<{ address: string, worker: Worker }>();
  const [refreshNeeded, setRefreshNeeded] = useState<boolean>(false);
  const [assetId, setAssetId] = useState<number>();

  const balance = useBalances(address, refreshNeeded, setRefreshNeeded, undefined, assetId);
  const price = usePrice(address);
  const token = useToken(address);
  const decimal = useDecimal(address);

  const [assetsOnOtherChains, setAssetsOnOtherChains] = useState<AssetsOnOtherChains[] | undefined | null>();
  const [displayPopup, setDisplayPopup] = useState<number | undefined>();
  const [unlockInformation, setUnlockInformation] = useState<UnlockInformationType | undefined>();

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette]);
  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);
  const supportGov = useMemo(() => GOVERNANCE_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportStaking = useMemo(() => STAKING_CHAINS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const supportAssetHubs = useMemo(() => ASSET_HUBS.includes(chain?.genesisHash ?? ''), [chain?.genesisHash]);
  const showTotalChart = useMemo(() => assetsOnOtherChains && assetsOnOtherChains.length > 0 && assetsOnOtherChains.some((asset) => asset.price && asset.price > 0 && !asset.totalBalance.isZero()), [assetsOnOtherChains]);
  const nativeAssetPrice = useMemo(() => {
    if (!price || !balance) {
      return undefined;
    }

    const totalBalance = getValue('total', balance);

    return parseFloat(amountToHuman(totalBalance, decimal)) * price.amount;
  }, [balance, decimal, price]);

  const fetchAssetsOnOtherChains = useCallback((accountAddress: string) => {
    const worker: Worker = new Worker(new URL('../../util/workers/getAssetsOnOtherChains.js', import.meta.url));

    setWorkerCalled({
      address: accountAddress,
      worker
    });
    worker.postMessage({ accountAddress });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = e.data;

      if (message === 'null') {
        setAssetsOnOtherChains(null);
      } else if (message === 'Done') {
        worker.terminate();
      } else {
        const fetchedBalances = JSON.parse(message) as { balances: string, chain: string, decimal: number, price: number, token: string }[];

        setAssetsOnOtherChains(fetchedBalances.map((asset) => ({ chainName: asset.chain, decimal: Number(asset.decimal), price: asset.price, token: asset.token, totalBalance: isHexToBn(asset.balances) })));
      }
    };
  }, []);

  useEffect(() => {
    if (!address) {
      return;
    }

    if (!workerCalled) {
      fetchAssetsOnOtherChains(address);
    }

    if (workerCalled && workerCalled.address !== address) {
      setRefreshNeeded(true);
      workerCalled.worker.terminate();
      setAssetsOnOtherChains(undefined);
      fetchAssetsOnOtherChains(address);
    }
  }, [address, fetchAssetsOnOtherChains, workerCalled]);

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
    address && account?.genesisHash && STAKING_CHAINS.includes(account.genesisHash) && windowOpen(`/pool/${address}/`).catch(console.error);
  }, [account?.genesisHash, address]);

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
                address={address}
                api={api}
                assetsOnOtherChains={assetsOnOtherChains}
                balances={balance}
                chain={chain}
                chainName={chainName}
                formatted={String(formatted)}
                isDarkTheme={isDarkTheme}
                price={price}
              />
              {supportAssetHubs &&
                <ChangeAssets
                  address={address}
                  assetId={assetId}
                  label={t<string>('Assets')}
                  onChange={_onChangeAsset}
                  setAssetId={setAssetId}
                  style={{ '> div div div#selectChain': { borderRadius: '5px' }, '> div p': { fontSize: '16px' } }}
                />}
              <DisplayBalance
                amount={balance?.availableBalance}
                decimal={decimal}
                isDarkTheme={isDarkTheme}
                onClick={goToSend}
                price={price?.amount}
                theme={theme}
                title={t<string>('Transferable')}
                token={token}
              />
              {supportStaking &&
                <DisplayBalance
                  amount={balance?.soloTotal}
                  decimal={decimal}
                  isDarkTheme={isDarkTheme}
                  onClick={goToSoloStaking}
                  price={price?.amount}
                  theme={theme}
                  title={t<string>('Solo Stake')}
                  token={token}
                />}
              {supportStaking &&
                <DisplayBalance
                  amount={balance?.pooledBalance}
                  decimal={decimal}
                  isDarkTheme={isDarkTheme}
                  onClick={goToPoolStaking}
                  price={price?.amount}
                  theme={theme}
                  title={t<string>('Pool Stake')}
                  token={token}
                />}
              {supportGov &&
                <LockedBalanceDisplay
                  address={address}
                  api={api}
                  chain={chain}
                  decimal={decimal}
                  formatted={String(formatted)}
                  isDarkTheme={isDarkTheme}
                  price={price?.amount}
                  refreshNeeded={refreshNeeded}
                  setDisplayPopup={setDisplayPopup}
                  setUnlockInformation={setUnlockInformation}
                  title={t<string>('Locked in Referenda')}
                  token={token}
                />
              }
              <DisplayBalance
                amount={balance?.reservedBalance}
                decimal={decimal}
                isDarkTheme={isDarkTheme}
                price={price?.amount}
                title={t<string>('Reserved')}
                token={token}
              />
            </Grid>
            <Grid container direction='column' gap='15px' item width='275px'>
              {showTotalChart && assetsOnOtherChains &&
                <TotalChart
                  assetsOnOtherChains={assetsOnOtherChains}
                  isDarkTheme={isDarkTheme}
                  nativeAssetPrice={nativeAssetPrice}
                />
              }
              <CommonTasks
                address={address}
                api={api}
                assetId={assetId}
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
