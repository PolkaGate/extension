// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { BN_ZERO } from '@polkadot/util';

import { AccountContext, ActionContext, Identicon, Motion, PasswordWithUseProxy, PButton, Popup, ShortAddress, Warning } from '../../../../../components';
import { useAccountName, useProxies, useTranslation } from '../../../../../hooks';
import { updateMeta } from '../../../../../messaging';
import { HeaderBrand, SubTitle, ThroughProxy, WaitScreen } from '../../../../../partials';
import Confirmation from '../../../../../partials/Confirmation';
import { signAndSend } from '../../../../../util/api';
import { MyPoolInfo, Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../../../../util/types';
import { getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../../util/utils';
import { ChangesProps } from '.';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  changes?: ChangesProps;
  formatted: string;
  pool: MyPoolInfo;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  state: string;
}

interface ShowRolesProps {
  roleTitle: string;
  roleAddress: string;
  showDivider?: boolean
}

export default function Review({ address, api, chain, changes, formatted, pool, setShow, show, state }: Props): React.ReactElement {
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
  const [txCalls, setTxCalls] = useState<SubmittableExtrinsic<'promise'>[]>();

  const batchAll = api.tx.utility.batchAll;
  const setMetadata = api.tx.nominationPools.setMetadata;

  const onBackClick = useCallback(() => {
    setShow(!show);
  }, [setShow, show]);

  useEffect(() => {
    const calls = [];

    const getRole = (role: string | undefined) => {
      if (role === undefined) {
        return 'Noop';
      } else if (role === '') {
        return 'Remove';
      } else {
        return { set: role };
      }
    };

    changes?.newPoolName !== undefined &&
      calls.push(setMetadata(pool.poolId, changes?.newPoolName));
    changes?.newRoles !== undefined &&
      calls.push(api.tx.nominationPools.updateRoles(pool.poolId, getRole(changes?.newRoles.newRoot), getRole(changes?.newRoles.newNominator), getRole(changes?.newRoles.newStateToggler)));

    setTxCalls(calls);

    calls.length && calls[0].paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee));
    });

    calls.length > 1 && calls[1].paymentInfo(formatted).then((i) => {
      setEstimatedFee((prevEstimatedFee) => api.createType('Balance', (prevEstimatedFee ?? BN_ZERO).add(i?.partialFee)));
    });
  }, [api, changes?.newPoolName, changes?.newRoles, formatted, pool.metadata, pool.poolId, setMetadata, setTxCalls]);

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

  const goEditPool = useCallback(async () => {
    const history: TransactionDetail[] = []; /** collects all records to save in the local history at the end */

    try {
      if (!formatted || !txCalls) {
        return;
      }

      const signer = keyring.getPair(selectedProxyAddress ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);

      const updated = txCalls.length > 1 ? batchAll(txCalls) : txCalls[0];
      const tx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, updated) : updated;

      const { block, failureText, fee, status, txHash } = await signAndSend(api, tx, signer, formatted);

      const info = {
        action: 'pool_edit',
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
  }, [api, batchAll, chain, estimatedFee, formatted, hierarchy, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, txCalls]);

  const ShowPoolRole = ({ roleAddress, roleTitle, showDivider }: ShowRolesProps) => {
    const roleName = useAccountName(getSubstrateAddress(roleAddress)) ?? t<string>('Unknown');

    return (
      <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Grid item>
          <Typography
            fontSize='16px'
            fontWeight={300}
            lineHeight='23px'
          >
            {roleTitle}
          </Typography>
        </Grid>
        {roleAddress
          ? (
            <Grid item container direction='row' justifyContent='center'>
              <Grid item container width='fit-content' alignItems='center'>
                <Identicon
                  iconTheme={chain?.icon ?? 'polkadot'}
                  prefix={chain?.ss58Format ?? 42}
                  size={25}
                  value={roleAddress}
                />
              </Grid>
              <Grid item container width='fit-content' alignItems='center' pl='5px' fontSize='28px' fontWeight={400} maxWidth='55%' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>{roleName}</Grid>
              <Grid item container width='fit-content' alignItems='center' pl='5px'><ShortAddress address={roleAddress} charsCount={4} inParentheses /></Grid>
            </Grid>)
          : (
            <Typography
              fontSize='20px'
              fontWeight={300}
              lineHeight='23px'
            >
              {t<string>('To be Removed')}
            </Typography>
          )
        }
        {showDivider && <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />}
      </Grid>
    )
  };

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Edit Pool')}
          withSteps={{ current: 2, total: 2 }}
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
        {changes?.newPoolName !== undefined &&
          <>
            <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '8px', width: '90%' }}>
              <Typography
                fontSize='16px'
                fontWeight={300}
                lineHeight='23px'
              >
                {t<string>('Pool name')}
              </Typography>
              <Typography
                fontSize='28px'
                fontWeight={400}
                lineHeight='30px'
                maxWidth='100%'
                overflow='hidden'
                textOverflow='ellipsis'
                whiteSpace='nowrap'
              >
                {changes?.newPoolName}
              </Typography>
            </Grid>
            {changes?.newRoles && <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />}
          </>}
        {changes?.newRoles?.newRoot !== undefined && <ShowPoolRole showDivider roleAddress={changes?.newRoles?.newRoot} roleTitle={t<string>('Root')} />}
        {changes?.newRoles?.newNominator !== undefined && <ShowPoolRole showDivider roleAddress={changes?.newRoles?.newNominator} roleTitle={t<string>('Nominator')} />}
        {changes?.newRoles?.newStateToggler !== undefined && <ShowPoolRole roleAddress={changes?.newRoles?.newStateToggler} roleTitle={t<string>('State toggler')} />}
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
          _onClick={goEditPool}
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
