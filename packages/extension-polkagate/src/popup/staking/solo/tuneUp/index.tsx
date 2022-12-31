// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens withdraw rewards review page
 * */


import { Divider, Grid, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import State from '@polkadot/extension-base/background/handlers/State';
import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';

import { AccountContext, ActionContext, Motion, PasswordUseProxyConfirm, Progress, Warning } from '../../../../components';
import { useAccountName, useApi, useChain, useFormatted, useNeedsPutInFrontOf, useNeedsRebag, useProxies, useTranslation } from '../../../../hooks';
import { updateMeta } from '../../../../messaging';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import broadcast from '../../../../util/api/broadcast';
import { Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData, saveAsHistory } from '../../../../util/utils';
import TxDetail from './TxDetail';

export default function TuneUp(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address, state?.api);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const onAction = useContext(ActionContext);

  const putInFrontInfo = useNeedsPutInFrontOf(address);
  const rebagInfo = useNeedsRebag(address);

  putInFrontInfo && console.log('putInFrontInfo:', putInFrontInfo);
  rebagInfo && console.log('rebagInfo:', rebagInfo);

  const proxies = useProxies(api, formatted);
  const name = useAccountName(address);

  const { accounts, hierarchy } = useContext(AccountContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);
  const rebaged = api && api.tx.voterList.rebag;
  const putInFrontOf = api && api.tx.voterList.putInFrontOf;

  const goToStakingHome = useCallback(() => {
    onAction(`/solo/${address}`);
  }, [address, onAction]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect((): void => {
    if (!rebaged || !putInFrontOf || !formatted) {
      return;
    }

    if (rebagInfo?.shouldRebag) {
      const params = [formatted];

      rebaged(...params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
    } else if (putInFrontInfo?.shouldPutInFront) {
      const params = [putInFrontInfo?.lighter];

      putInFrontOf(...params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
    }
  }, [formatted, rebaged, putInFrontOf, rebagInfo?.shouldRebag, putInFrontInfo?.shouldPutInFront, putInFrontInfo?.lighter]);

  const submit = useCallback(async () => {
    try {
      if (!formatted || !api || !rebaged || !putInFrontOf) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const tx = rebagInfo?.shouldRebag ? rebaged : putInFrontOf;
      const params = rebagInfo?.shouldRebag ? formatted : putInFrontInfo?.lighter;
      const { block, failureText, fee, success, txHash } = await broadcast(api, tx, [params], signer, formatted, selectedProxy);

      const info = {
        action: 'Solo Staking',
        // amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: from, name: selectedProxyName || name },
        subAction: 'Tune Up',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [formatted, api, rebaged, putInFrontOf, selectedProxyAddress, password, rebagInfo?.shouldRebag, putInFrontInfo?.lighter, selectedProxy, estimatedFee, name, selectedProxyName, chain]);

  const _onBackClick = useCallback(() => {
    onAction(`/solo/nominations/${address}`);
  }, [address, onAction]);

  const goToMyAccounts = useCallback(() => {
    setShowConfirmation(false);
    setShowWaitScreen(false);
    onAction('/');
  }, [onAction]);

  const LabelValue = ({ label, mt = '30px', noDivider, value }: { label: string, value: string, mt?: string, noDivider?: boolean }) => (
    <>
      <Grid item xs={12} mt={mt} textAlign='center'>
        <Typography fontSize='14px' fontWeight={300} >
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} textAlign='center'>
        <Typography fontSize='28px' fontWeight={400}>
          {value}
        </Typography>
      </Grid>
      {!noDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      }
    </>
  );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={_onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Tune Up')}
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
      <SubTitle label={t('Review')} />
      <>
        {!rebagInfo || !putInFrontInfo
          ? <Progress size={100} title={t('Loading staking information ...')} />
          : <Grid container justifyContent='center' mt='25px'>
            <Typography fontSize='14px' fontWeight={300}>
              {t('Changing your account\'s position to be a better one.')}
            </Typography>
            <LabelValue label={t('Current bag upper')} value={rebagInfo?.currentUpper} />
            <LabelValue label={t('My staked amount')} mt='5px' value={rebagInfo?.currentWeight} />
            {!putInFrontInfo?.shouldPutInFront
              ? <Grid item xs={12} textAlign='center' mt='10px'>
                <Typography fontSize='15px' fontWeight={400}>
                  {t('Your account doesn\'t need to be Tuned Up!')}
                </Typography>
              </Grid>
              : <LabelValue label={t('Account to be overtaken')} mt='5px' value={rebagInfo?.lighter} />
            }
          </Grid>
        }
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          confirmDisabled={!putInFrontInfo?.shouldPutInFront}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={submit}
          proxiedAddress={selectedProxyAddress}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'Staking']}
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
        <WaitScreen
          show={showWaitScreen}
          title={t('Staking')}
        />
        {txInfo &&
          <Confirmation
            headerTitle={t('Staking')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyAccounts}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My Accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail txInfo={txInfo} />
          </Confirmation>
        }
      </>
    </Motion>
  );
}
