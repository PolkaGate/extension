// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/**
 * @description
 * this component opens contribute to crowdloan review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, ChainLogo, FormatBalance, PasswordUseProxyConfirm, Popup, ShortAddress, Warning } from '../../../components';
import { useAccountName, useChain, useProxies, useTranslation } from '../../../hooks';
import { Confirmation, HeaderBrand, SubTitle, ThroughProxy, WaitScreen } from '../../../partials';
import { broadcast } from '../../../util/api';
import { Crowdloan, Proxy, ProxyItem, TxInfo } from '../../../util/types';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../util/utils';
import ParachainInfo from '../partials/ParachainInfo';
import ShowParachain from '../partials/ShowParachain';

interface Props {
  api?: ApiPromise;
  contributionAmount?: BN;
  crowdloansId?: LinkOption[];
  crowdloanToContribute: Crowdloan;
  formatted: string | AccountId;
  showReview: boolean;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  estimatedFee?: Balance;
  currentBlockNumber?: number;
  myContribution?: string | Balance;
  decimal?: number;
  token?: string;
}

export default function Review({ api, contributionAmount, crowdloanToContribute, crowdloansId, currentBlockNumber, decimal, estimatedFee, formatted, myContribution, poolToJoin, setShowReview, showReview = false, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const address = getSubstrateAddress(formatted);
  const chain = useChain(formatted);
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const name = useAccountName(formatted);
  const proxies = useProxies(api, formatted);

  const contribute = api && api.tx.crowdloan.contribute;

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showCrowdloanInfo, setShowCrowdloanInfo] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const getName = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansId]);

  const _onBackClick = useCallback(() => {
    setShowReview(!showReview);
  }, [setShowReview, showReview]);

  const goToCrowdloans = useCallback(() => {
    address && onAction(`/crowdloans/${address}`);
  }, [address, onAction]);

  const goContribute = useCallback(async () => {
    if (!crowdloanToContribute || !formatted || !contribute) {
      return;
    }

    try {
      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const params = [crowdloanToContribute.fund.paraId, contributionAmount, null];

      const { block, failureText, fee, success, txHash } = await broadcast(api, contribute, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Crowdloan',
        amount: amountToHuman(contributionAmount?.toString(), decimal),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(from), name: selectedProxyName || name },
        subAction: 'Contribute',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : null,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(String(from), info);
      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, contribute, contributionAmount, crowdloanToContribute, decimal, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName]);

  useEffect(() => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  return (
    <>
      <Popup show={showReview}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Contribute')}
          withSteps={{ current: 2, total: 2 }}
        />
        {isPasswordError &&
          <Grid color='red' height='30px' m='auto' mt='-10px' width='92%'>
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
        <SubTitle
          label={t<string>('Review')}
        />
        <AccountHolderWithProxy
          address={address}
          chain={chain}
          selectedProxyAddress={selectedProxyAddress}
          showDivider
          style={{ m: 'auto', width: '90%' }}
        />
        <Typography fontSize='16px' fontWeight={300} textAlign='center'>
          {t<string>('Amount')}
        </Typography>
        <Grid alignItems='center' container item justifyContent='center' >
          <Grid item>
            <ChainLogo genesisHash={chain?.genesisHash} />
          </Grid>
          <Grid item sx={{ fontSize: '26px', pl: '8px' }}>
            <FormatBalance api={api} decimalPoint={2} value={contributionAmount} />
          </Grid>
        </Grid>
        <Grid container justifyContent='center'>
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t<string>('Fee:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <FormatBalance api={api} decimalPoint={4} value={estimatedFee} />
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
        <ShowParachain
          api={api}
          chain={chain}
          crowdloan={crowdloanToContribute}
          crowdloansId={crowdloansId}
          labelPosition='center'
          setShowCrowdloanInfo={setShowCrowdloanInfo}
          style={{ m: '15px auto 0', width: '92%' }}
        />
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={goContribute}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer']}
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
        {showCrowdloanInfo &&
          <ParachainInfo
            api={api}
            chain={chain}
            crowdloan={crowdloanToContribute}
            crowdloansId={crowdloansId}
            currentBlockNumber={currentBlockNumber}
            decimal={decimal}
            myContribution={myContribution}
            setShowParachainInfo={setShowCrowdloanInfo}
            showParachainInfo={showCrowdloanInfo}
            token={token}
          />
        }
      </Popup>
      <WaitScreen
        show={showWaitScreen}
        title={t('Contribute')}
      />
      {txInfo && (
        <Confirmation
          headerTitle={t('Contribute')}
          onPrimaryBtnClick={goToCrowdloans}
          primaryBtnText={t('My Contributions')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <>
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t<string>('Account holder')}:
              </Typography>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                {txInfo.from.name}
              </Typography>
              <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                <ShortAddress address={txInfo.from.address} inParentheses style={{ fontSize: '16px' }} />
              </Grid>
            </Grid>
            {txInfo.throughProxy &&
              <Grid container m='auto' maxWidth='92%'>
                <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
              </Grid>
            }
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t<string>('Parachain')}:
              </Typography>
              <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                {getName(crowdloanToContribute.fund.paraId) ?? `Unknown(${crowdloanToContribute.fund.paraId})`}
              </Grid>
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t<string>('Amount')}:
              </Typography>
              <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                {`${txInfo.amount} ${token}`}
              </Grid>
            </Grid>
          </>
        </Confirmation>)
      }
    </>
  );
}
