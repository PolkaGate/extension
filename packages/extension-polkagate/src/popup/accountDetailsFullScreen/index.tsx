// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { useAccount, useApi, useBalances, useChain, useChainName, useDecimal, useFormatted, useFullscreen, usePrice, useToken, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { STAKING_CHAINS } from '../../util/constants';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import AccountInformation from './components/AccountInformation';
import AccountSetting from './components/AccountSetting';
import CommonTasks from './components/CommonTasks';
import DisplayBalance from './components/DisplayBalance';
import LockedBalanceDisplay from './components/LockedBalanceDisplay';

export type AssetsOnOtherChains = { totalBalance: BN, chainName: string, decimal: number, price: number, token: string };

export default function AccountDetails(): React.ReactElement {
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

  // const [refreshNeeded, setRefreshNeeded] = useState<boolean>(false);

  // useEffect(() => {
  //   address && setRefreshNeeded(true);
  //   address && console.log('heyyy ooooo')
  // }, [address]);

  const balance = useBalances(address);
  const price = usePrice(address);
  const token = useToken(address);
  const decimal = useDecimal(address);

  const [assetId, setAssetId] = useState<number>();
  const [assetsOnOtherChains, setAssetsOnOtherChains] = useState<AssetsOnOtherChains[]>();
console.log('assetsOnOtherChains:', assetsOnOtherChains)
  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette]);
  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);

  const fetchAssetsOnOtherChains = useCallback((accountAddress: string) => {
    const worker: Worker = new Worker(new URL('../../util/workers/getAssetsOnOtherChains.js', import.meta.url));

    worker.postMessage({ accountAddress });

    worker.onerror = (err) => {
      console.log(err);
    };

    worker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

      const fetchedBalances = JSON.parse(e.data) as { balances: number, chain: string, decimal: number, price: number, token: string }[];

      setAssetsOnOtherChains(fetchedBalances.map((asset) => ({ chainName: asset.chain, decimal: Number(asset.decimal), price: asset.price, token: asset.token, totalBalance: new BN(asset.balances) })));

      worker.terminate();
    };
  }, []);

  useEffect(() => {
    address && fetchAssetsOnOtherChains(address);
  }, [address, fetchAssetsOnOtherChains]);

  const goToSend = useCallback(() => {
    address && windowOpen(`/send/${address}/${assetId}`).catch(console.error);
  }, [address, assetId]);

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
          <Grid container item justifyContent='space-between'>
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
              <DisplayBalance
                amount={balance?.soloTotal}
                decimal={decimal}
                isDarkTheme={isDarkTheme}
                onClick={goToSoloStaking}
                price={price?.amount}
                theme={theme}
                title={t<string>('Solo Stake')}
                token={token}
              />
              <DisplayBalance
                amount={balance?.pooledBalance}
                decimal={decimal}
                isDarkTheme={isDarkTheme}
                onClick={goToPoolStaking}
                price={price?.amount}
                theme={theme}
                title={t<string>('Pool Stake')}
                token={token}
              />
              <LockedBalanceDisplay
                address={address}
                api={api}
                chain={chain}
                decimal={decimal}
                formatted={String(formatted)}
                isDarkTheme={isDarkTheme}
                price={price?.amount}
                // refreshNeeded={refreshNeeded}
                title={t<string>('Locked in Referenda')}
                token={token}
              />
              <DisplayBalance
                amount={balance?.reservedBalance}
                decimal={decimal}
                isDarkTheme={isDarkTheme}
                price={price?.amount}
                title={t<string>('Reserved')}
                token={token}
              />
            </Grid>
            <Grid container direction='column' gap='15px' item mb='15px' width='275px'>
              <CommonTasks
                address={address}
                api={api}
                assetId={assetId}
                genesisHash={account?.genesisHash}
              />
              <AccountSetting
                address={address}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
