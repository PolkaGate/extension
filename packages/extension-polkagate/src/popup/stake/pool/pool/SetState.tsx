// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';

import { AccountContext, AccountHolderWithProxy, ActionContext, Motion, PasswordWithUseProxy, PButton, Popup, ShortAddress, ShowBalance, Warning } from '../../../../components';
import { useAccountName, useProxies, useTranslation } from '../../../../hooks';
import { updateMeta } from '../../../../messaging';
import { HeaderBrand, SubTitle, ThroughProxy, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { MyPoolInfo, Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../util/utils';
import ShowPool from '../../partial/ShowPool';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  formatted: string;
  pool: MyPoolInfo;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  state: string;
  helperText: string;
  headerText: string;
}

export default function SetState({ address, api, chain, formatted, headerText, helperText, pool, setShow, show, state }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, formatted);
  const name = useAccountName(address);
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { accounts, hierarchy } = useContext(AccountContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const batchAll = api.tx.utility.batchAll;
  const chilled = api.tx.nominationPools.chill;
  const poolSetState = api.tx.nominationPools.setState(pool.poolId.toString(), state); // (poolId, state)

  const backToStake = useCallback(() => {
    setShow(false);
  }, [setShow]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void poolSetState.paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee));
  }, [formatted, poolSetState]);

  function saveHistory(chain: Chain, hierarchy: AccountWithChildren[], address: string, history: TransactionDetail[]) {
    if (!history.length) {
      return;
    }

    const accountSubstrateAddress = getSubstrateAddress(address);

    if (!accountSubstrateAddress) {
      return; // should not happen !
    }

    const savedHistory: TransactionDetail[] = getTransactionHistoryFromLocalStorage(chain, hierarchy, accountSubstrateAddress);

    savedHistory.push(...history);

    updateMeta(accountSubstrateAddress, prepareMetaData(chain, 'history', savedHistory)).catch(console.error);
  }

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/pool/${address}`);
  }, [address, onAction, setShow]);

  const goToMyPool = useCallback(() => {
    onAction(`/pool/stake/pool/${address}`);
  }, [address, onAction]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const changeState = useCallback(async () => {
    const history: TransactionDetail[] = []; /** collects all records to save in the local history at the end */

    try {
      if (!formatted) {
        return;
      }

      const signer = keyring.getPair(selectedProxyAddress ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);

      const mayNeedChill = state === 'Destroying' && pool.stashIdAccount?.nominators?.length ? chilled(pool.poolId) : undefined;
      const calls = mayNeedChill ? batchAll([mayNeedChill, poolSetState]) : poolSetState;

      const tx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, calls) : calls;
      const { block, failureText, fee, status, txHash } = await signAndSend(api, tx, signer, formatted);

      const action = state === 'Destroying' ? 'pool_destroy' : state === 'Open' ? 'pool_unblock' : 'block';

      const info = {
        action,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee),
        from: { address: formatted, name },
        status,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      history.push(info);
      setTxInfo({ ...info, api, chain });

      // eslint-disable-next-line no-void
      void saveHistory(chain, hierarchy, formatted, history);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [address, api, batchAll, chain, chilled, estimatedFee, formatted, hierarchy, name, password, pool.poolId, pool.stashIdAccount?.nominators?.length, poolSetState, selectedProxy, selectedProxyAddress, selectedProxyName, state]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={backToStake}
          shortBorder
          showBackArrow
          showClose
          text={headerText}
        />
        {isPasswordError &&
          <Grid
            color='red'
            height='30px'
            m='auto'
            mt='-10px'
            width='92%'
          >
            <Warning
              fontWeight={400}
              isBelowInput
              isDanger
              theme={theme}
            >
              {t<string>('You’ve used an incorrect password. Try again.')}
            </Warning>
          </Grid>
        }
        <SubTitle label={t<string>('Review')} />
        <ShowPool
          api={api}
          mode='Default'
          pool={pool}
          style={{
            m: '20px auto',
            width: '92%'
          }}
        />
        <Grid
          container
          m='auto'
          width='92%'
        >
          <Typography
            fontSize='14px'
            fontWeight={300}
            lineHeight='23px'
          >
            {t<string>('Fee:')}
          </Typography>
          <Grid
            item
            lineHeight='22px'
            pl='5px'
          >
            <ShowBalance
              api={api}
              balance={estimatedFee}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
        <Typography
          fontSize='12px'
          fontWeight={300}
          m='20px auto 0'
          textAlign='left'
          width='90%'
        >
          {helperText}
        </Typography>
        <PasswordWithUseProxy
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any']}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setSelectedProxy={setSelectedProxy}
          style={{
            bottom: '80px',
            left: '4%',
            position: 'absolute',
            width: '92%'
          }}
        />
        <PButton
          _onClick={changeState}
          disabled={!password}
          text={t<string>('Confirm')}
        />
        <WaitScreen
          show={showWaitScreen}
          title={t(`${state} Pool`)}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Pool Staking')}
            onPrimaryBtnClick={goToStakingHome}
            primaryBtnText={t('Staking Home')}
            onSecondaryBtnClick={goToMyPool}
            secondaryBtnText={t('My pool')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <>
              <Grid
                alignItems='end'
                container
                justifyContent='center'
                sx={{
                  m: 'auto',
                  pt: '5px',
                  width: '90%'
                }}
              >
                <Typography
                  fontSize='16px'
                  fontWeight={400}
                  lineHeight='23px'
                >
                  {t<string>('Account holder:')}
                </Typography>
                <Typography
                  fontSize='16px'
                  fontWeight={400}
                  lineHeight='23px'
                  maxWidth='45%'
                  overflow='hidden'
                  pl='5px'
                  textOverflow='ellipsis'
                  whiteSpace='nowrap'
                >
                  {txInfo.from.name}
                </Typography>
                <Grid
                  fontSize='16px'
                  fontWeight={400}
                  item
                  lineHeight='22px'
                  pl='5px'
                >
                  <ShortAddress
                    address={txInfo.from.address}
                    style={{ fontSize: '16px' }}
                    inParentheses
                  />
                </Grid>
              </Grid>
              {txInfo.throughProxy &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} name={txInfo.throughProxy.name} />
                </Grid>
              }
              <Divider sx={{
                bgcolor: 'secondary.main',
                height: '2px',
                m: '5px auto',
                width: '75%'
              }}
              />
              <Grid
                alignItems='end'
                container
                justifyContent='center'
                sx={{
                  m: 'auto',
                  pt: '5px',
                  width: '90%'
                }}
              >
                <Typography
                  fontSize='16px'
                  fontWeight={400}
                  lineHeight='23px'
                >
                  {t<string>('Pool:')}
                </Typography>
                <Typography
                  fontSize='16px'
                  fontWeight={400}
                  lineHeight='23px'
                  maxWidth='45%'
                  overflow='hidden'
                  pl='5px'
                  textOverflow='ellipsis'
                  whiteSpace='nowrap'
                >
                  {pool.metadata}
                </Typography>
              </Grid>
              <Divider sx={{
                bgcolor: 'secondary.main',
                height: '2px',
                m: '5px auto',
                width: '75%'
              }}
              />
            </>
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
