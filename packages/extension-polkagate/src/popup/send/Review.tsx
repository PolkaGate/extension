// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens send review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { AnyTuple } from '@polkadot/types/types';

import { Avatar, Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';

import { ActionContext, ButtonWithCancel, FormatBalance, Identicon, Motion, ShortAddress } from '../../components';
import { useMetadata, useTranslation } from '../../hooks';
import { HeaderBrand, WaitScreen } from '../../partials';
import broadcast from '../../util/api/broadcast';
import { FLOATING_POINT_DIGIT } from '../../util/constants';
import getLogo from '../../util/getLogo';
import { FormattedAddressState, NameAddress, TransferTxInfo } from '../../util/types';
import Receipt from './Receipt';

type TransferType = 'All' | 'Max' | 'Normal';

interface LocationState {
  accountName: string | undefined;
  amount: string | undefined;
  api: ApiPromise | undefined;
  backPath: string | undefined;
  balances: DeriveBalancesAll;
  chain: Chain | null;
  fee: Balance | undefined;
  recipientAddress: string | undefined;
  recipientName: string | undefined;
  selectedProxyAddress: string | undefined;
  selectedProxyName: string | undefined;
  signer: KeyringPair;
  transfer: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  transferType: TransferType | undefined;
}

export default function Review(): React.ReactElement {
  const { t } = useTranslation();

  // useRedirectOnRefresh('/');
  const history = useHistory();
  const { state } = useLocation<LocationState>();
  const { address, formatted, genesisHash } = useParams<FormattedAddressState>();
  const onAction = useContext(ActionContext);
  const chain = useMetadata(genesisHash, true);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [txInfo, setTxInfo] = useState<TransferTxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const prevUrl = isConfirming ? '' : `/send/${genesisHash}/${address}/${formatted}/`;
  const decimals = state?.api?.registry?.chainDecimals[0] ?? 1;
  const token = state?.api?.registry?.chainTokens[0] ?? '';

  const ChainLogo = (
    <Avatar
      alt={'logo'}
      src={getLogo(chain)}
      sx={{ height: 31, width: 31 }}
      variant='square'
    />
  );

  useEffect(() => {
    !state?.amount && onAction(prevUrl);
  }, [state, onAction, prevUrl]);

  const send = useCallback(async () => {
    try {
      if (!state || !formatted) {
        return;
      }

      const { accountName, amount, api, recipientAddress, recipientName, selectedProxyAddress, selectedProxyName, signer, transfer, transferType } = state;

      setShowWaitScreen(true);
      let params = [];

      if (['All', 'Max'].includes(transferType)) {
        const keepAlive = transferType === 'Max';

        params = [recipientAddress, keepAlive];
      } else {
        const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));

        params = [recipientAddress, amountAsBN];
      }

      const { block, failureText, fee, status, txHash } = await broadcast(api, transfer, params, signer, formatted, selectedProxyAddress);

      setTxInfo({
        api,
        amount,
        block: block || 0,
        chain,
        failureText,
        fee: state?.fee || fee || '',
        from: { address: formatted, name: accountName },
        status,
        to: { address: recipientAddress, name: recipientName },
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : null,
        txHash: txHash || ''
      });

      setShowWaitScreen(false);
      setShowReceipt(true);
    } catch (e) {
      console.log('error:', e);
      setIsConfirming(false);
    }
  }, [chain, decimals, formatted, state]);

  const _onBackClick = useCallback(() => {
    state?.backPath && history.push({
      pathname: state?.backPath,
      state: { ...state }
    });
  }, [history, state]);

  const AsProxy = ({ address, name }: { name: string | Element, address: string }) => (
    <Grid alignItems='center' container justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em' }}>
      <Grid item sx={{ fontSize: '12px' }} xs={2}>
        {t('Through')}
      </Grid>
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.main', height: '27px', mb: '10px', mt: '5px', width: '1px' }} />
      <Grid alignItems='center' container item justifyContent='center' sx={{ width: 'fit-content', px: '2px', maxWidth: '66%' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ lineHeight: '28px' }}>
          {state?.chain &&
            <Grid item>
              <Identicon
                iconTheme={state?.chain?.icon || 'polkadot'}
                prefix={state?.chain?.ss58Format ?? 42}
                size={25}
                value={address}
              />
            </Grid>
          }
          <Grid item sx={{ fontSize: '16px', fontWeight: 400, maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pl: '10px' }}>
            {name}
            <Grid item sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '12px', width: 'fit-content' }}>
              <ShortAddress address={address} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.main', height: '27px', mb: '10px', mt: '5px', width: '1px' }} />
      <Grid item sx={{ fontSize: '12px', fontWeight: 300, textAlign: 'center' }} xs={2}>
        {t('as proxy')}
      </Grid>
    </Grid>
  );

  const Info = ({ pt1 = 0, pt2 = 5, mb = 10, data1, data2, fontSize1 = 28, label, noDivider = false, showIdenticon, showProxy }: { mb?: number, pt1?: number, pt2?: number, fontSize1?: number, label: string, data1: string | Element, data2?: string, noDivider?: boolean, showIdenticon?: boolean, showProxy?: boolean }) => (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em' }}>
      <Grid item sx={{ fontSize: '16px', pt: `${pt1}px` }}>
        {label}
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' sx={{ pt: `${pt2}px`, lineHeight: '28px' }}>
        {showIdenticon && state?.chain &&
          <Grid item pr='10px' >
            <Identicon
              iconTheme={state?.chain?.icon || 'polkadot'}
              prefix={state?.chain?.ss58Format ?? 42}
              size={31}
              value={data2}
            />
          </Grid>
        }
        <Grid item sx={{ fontSize: `${fontSize1}px`, fontWeight: 400, maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data1}
        </Grid>
      </Grid>
      {data2 &&
        <>
          {showIdenticon
            ? <ShortAddress address={data2} />
            : <Grid item sx={{ fontSize: '16px', fontWeight: 300 }}>
              {data2}
            </Grid>
          }
        </>
      }
      {state?.selectedProxyAddress && showProxy &&
        <AsProxy address={state?.selectedProxyAddress} name={state?.selectedProxyName} />
      }
      {!noDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mb: `${mb}px`, mt: '5px', width: '240px' }} />
      }
    </Grid>
  );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={_onBackClick}
        shortBorder
        showBackArrow
        text={t<string>('Send Fund')}
        withSteps={{
          currentStep: 2,
          totalSteps: 2
        }}
      />
      <Grid container direction='column' item justifyContent='center' sx={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: '25px', px: '5px' }}>
        <Grid item sx={{ m: 'auto' }}>
          {isConfirming ? t('Confirmation') : t('Review')}
        </Grid>
        <Grid item>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
        </Grid>
      </Grid>
      <Container disableGutters sx={{ px: '30px', pt: '10px' }}>
        <Info data1={state?.accountName} data2={formatted} label={t('From')} pt1={state?.selectedProxyAddress ? 0 : 20} showIdenticon showProxy />
        <Info data1={state?.recipientName} data2={state?.recipientAddress} label={t('To')} pt1={0} pt2={0} showIdenticon />
        <Info
          data1={
            <Grid alignItems='center' container item>
              <Grid item>
                {ChainLogo}
              </Grid>
              {state &&
                <Grid item sx={{ fontSize: '26px', pl: '8px' }}>
                  {token}
                </Grid>
              }
            </Grid>
          }
          label={t('Asset')}
          noDivider
          pt2={0}
        />
        <Info
          data1={
            state?.api && <FormatBalance api={state?.api} decimalPoint={2} value={state?.fee} />
          }
          fontSize1={20}
          label={t('Fee')}
          mb={0}
          pt1={0}
          pt2={0}
        />
        <Info
          data1={state?.amount}
          label={t('Amount')}
          noDivider
          pt2={0}
        />
      </Container>
      <ButtonWithCancel
        _onClick={send}
        _onClickCancel={_onBackClick}
        text={t('Send')}
      />
      <WaitScreen show={showWaitScreen} title={t('Send Fund')} />
      {txInfo && <Receipt show={showReceipt} title={t('Send Fund')} info={txInfo} />}
    </Motion>
  );
}
