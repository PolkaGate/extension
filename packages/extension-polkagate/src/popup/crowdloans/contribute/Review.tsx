// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/**
 * @description
 * this component opens contribute to crowdloan review page
 * */

import type { LinkOption } from '@polkagate/apps-config/endpoints/types';
import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { BN } from '@polkadot/util';
import type { Crowdloan, Proxy, ProxyItem, TxInfo } from '../../../util/types';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { AccountHolderWithProxy, AccountWithProxyInConfirmation, ActionContext, ChainLogo, FormatBalance, PasswordUseProxyConfirm, Popup, Warning } from '../../../components';
import { useAccountDisplay, useChain, useProxies, useTranslation } from '../../../hooks';
import { Confirmation, HeaderBrand, SubTitle, WaitScreen } from '../../../partials';
import { broadcast } from '../../../util/api';
import { PROXY_TYPE } from '../../../util/constants';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../util/utils';
import ParachainInfo from '../partials/ParachainInfo';
import ShowParachainBrief from '../partials/ShowParachainBrief';

interface Props {
  api: ApiPromise | undefined;
  contributionAmount: BN;
  crowdloansId: LinkOption[] | undefined;
  crowdloanToContribute: Crowdloan;
  formatted: string | AccountId;
  showReview: boolean;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  estimatedFee: Balance | undefined;
  currentBlockNumber: number | undefined;
  myContribution: string | Balance | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

export default function Review({ api, contributionAmount, crowdloanToContribute, crowdloansId, currentBlockNumber, decimal, estimatedFee, formatted, myContribution, setShowReview, showReview, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const address = getSubstrateAddress(formatted);
  const chain = useChain(formatted);
  const onAction = useContext(ActionContext);
  const name = useAccountDisplay(address);
  const proxies = useProxies(api, formatted);

  const contribute = api?.tx['crowdloan']['contribute'];

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showCrowdloanInfo, setShowCrowdloanInfo] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const getName = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansId]);

  const _onBackClick = useCallback(() => {
    setShowReview(!showReview);
  }, [setShowReview, showReview]);

  const goToCrowdloans = useCallback(() => {
    setShowReview(false);
    address && onAction(`/crowdloans/${address}`);
  }, [address, onAction, setShowReview]);

  const goContribute = useCallback(async () => {
    if (!crowdloanToContribute || !formatted || !contribute || !decimal) {
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
        amount: amountToHuman(contributionAmount.toString(), decimal),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(from), name },
        subAction: 'Contribute',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain: chain as any });
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
          text={t('Contribute')}
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
              {t('You’ve used an incorrect password. Try again.')}
            </Warning>
          </Grid>
        }
        <SubTitle
          label={t('Review')}
        />
        <AccountHolderWithProxy
          address={address}
          chain={chain}
          selectedProxyAddress={selectedProxyAddress}
          showDivider
          style={{ m: 'auto', width: '90%' }}
        />
        <Typography fontSize='16px' fontWeight={300} textAlign='center'>
          {t('Amount')}
        </Typography>
        <Grid alignItems='center' container item justifyContent='center' >
          <Grid item>
            <ChainLogo genesisHash={chain?.genesisHash} />
          </Grid>
          <Grid item sx={{ fontSize: '26px', pl: '8px' }}>
            <FormatBalance api={api as ApiPromise} decimalPoint={2} value={contributionAmount} />
          </Grid>
        </Grid>
        <Grid container justifyContent='center'>
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t('Fee:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <FormatBalance api={api as ApiPromise} decimalPoint={4} value={estimatedFee} />
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
        <ShowParachainBrief
          crowdloan={crowdloanToContribute}
          crowdloansId={crowdloansId}
          setShowCrowdloanInfo={setShowCrowdloanInfo}
          style={{ m: '15px auto 0', width: '92%' }}
        />
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={goContribute}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={PROXY_TYPE.CROWDLOAN}
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
            chain={chain as any}
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
            <AccountWithProxyInConfirmation
              txInfo={txInfo}
            />
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t('Parachain')}:
              </Typography>
              <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                {getName(crowdloanToContribute.fund.paraId) ?? `Unknown(${crowdloanToContribute.fund.paraId})`}
              </Grid>
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t('Amount')}:
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
