// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import CheckIcon from '@mui/icons-material/Check';
import { Avatar, Container, Divider, Grid, Link, Skeleton, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { isend, send as sendIcon } from '../../assets/icons';
import { AccountContext, ActionContext, Button, Header, Identicon, Motion, Password, PButton, ShortAddress } from '../../components';
import { useMetadata, useRedirectOnRefresh, useTranslation } from '../../hooks';
import broadcast from '../../util/api/broadcast';
import { FLOATING_POINT_DIGIT } from '../../util/constants';
import getLogo from '../../util/getLogo';
import { FormattedAddressState } from '../../util/types';

interface TxLog {
  from: string;
  to?: string;
  block: number;
  txHash: string;
  amount?: BN;
  failureText?: string;
  fee: string;
  status: 'failed' | 'success';
}

export default function Review(): React.ReactElement {
  const { t } = useTranslation();

  // useRedirectOnRefresh('/');
  const theme = useTheme();
  const { address, formatted, genesisHash } = useParams<FormattedAddressState>();
  const { state } = useLocation();
  const onAction = useContext(ActionContext);
  const chain = useMetadata(genesisHash, true);
  const { accounts } = useContext(AccountContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [txLog, setTxLog] = useState<TxLog | undefined>();

  const prevUrl = isConfirming ? '' : `/send/${genesisHash}/${address}/${formatted}/`;
  const accountName = useMemo(() => accounts?.find((a) => a.address === address)?.name, [accounts, address]);
  const network = chain ? chain.name.replace(' Relay Chain', '') : 'westend';
  const subscanLink = (txHash: string) => 'https://' + network + '.subscan.io/extrinsic/' + String(txHash);
  const decimals = state?.api?.registry?.chainDecimals[0] ?? 1;

  const icon = (
    <Avatar
      alt={'logo'}
      src={theme.palette.mode === 'dark' ? sendIcon : isend}
      sx={{ height: '64px', width: '86px' }}
    />);

  const identicon = (
    <Identicon
      className='identityIcon'
      iconTheme={chain?.icon || 'polkadot'}
      // isExternal={isExternal}
      // onCopy={_onCopy}
      prefix={chain?.ss58Format ?? 42}
      size={25}
      value={formatted}
    />
  );

  const ChainLogo = (
    <Avatar
      alt={'logo'}
      src={getLogo(chain)}
      sx={{ height: 25, width: 25 }}
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

      const { api, amount, transferType, transfer, recepient } = state;
      const signer = keyring.getPair(formatted);

      signer.unlock(password);
      setIsConfirming(true);
      let params = [];

      if (['All', 'Max'].includes(transferType)) {
        const keepAlive = transferType === 'Max';

        params = [recepient, keepAlive];
      } else {
        const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));

        params = [recepient, amountAsBN];
      }

      const { block, failureText, fee, status, txHash } = await broadcast(api, transfer, params, signer, formatted);

      setTxLog({
        from: formatted,
        to: recepient,
        block: block || 0,
        txHash: txHash || '',
        amount,
        failureText,
        fee: fee || '',
        status
      });

      // setIsConfirming(false);
    } catch (e) {
      console.log('error:', e);
      setIsConfirming(false);
    }
  }, [decimals, formatted, password, state]);

  const backToMyAccounts = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const Trilogy = ({ part1, part2, part3, showDivider = false }: { part1: any, part2: any, part3?: any, showDivider?: boolean }) => (
    <>
      <Grid alignItems='center' container justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em', pb: showDivider ? '0px' : '4px' }}>
        <Grid item sx={{ fontSize: '16px', maxWidth: '30%', width: 'fit-content' }}>
          {part1}:
        </Grid>
        <Grid item sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '16px', px: '8px', maxWidth: part3 ? '40%' : '70%', width: 'fit-content' }}>
          {part2}
        </Grid>
        <Grid item sx={{ maxWidth: '30%' }}>
          {part3}
        </Grid>
      </Grid>
      {showDivider && <Divider sx={{ bgcolor: 'secondary.main', height: '1px', my: '8px' }} />
      }
    </>
  );

  return (
    <Motion>
      <Container disableGutters sx={{ px: '30px' }}>
        <Header address={address} genesisHash={genesisHash} icon={icon} preUrl={prevUrl} state={state}>
          <div style={{ fontWeight: 500, fontSize: '24px', lineHeight: '36px', letterSpacing: '-0.015em', textAlign: 'center' }}>
            {t('Send Fund')}
          </div>
          <div style={{ fontWeight: 700, fontSize: '11px', lineHeight: '25px', letterSpacing: '-0.015em', textAlign: 'center' }}>
            {isConfirming ? t('Confirmation') : t('Review')}
          </div>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '81px', margin: 'auto' }} />
        </Header>
      </Container>
      {!isConfirming &&
        <>
          <Container disableGutters sx={{ px: '30px' }}>
            <Grid alignItems='top' container justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em' }}>
              <Grid item sx={{ fontSize: '16px', paddingTop: '15px' }} xs={4}>
                {t('From')}:
              </Grid>
              <Grid alignItems='center' container item sx={{ pt: '15px' }} xs={8}>
                <Grid item mt='7px' xs={1.5}>
                  {identicon}
                </Grid>
                <Grid item sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '26px', pl: '8px' }} xs={10.5}>
                  {accountName}
                </Grid>
                <Grid item>
                  <ShortAddress address={formatted} addressStyle={{ fontSize: '16px' }} />
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mt: '8px' }} />
            <Grid alignItems='top' container justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em' }}>
              <Grid item sx={{ fontSize: '16px', paddingTop: '15px' }} xs={4}>
                {t('Amount')}:
              </Grid>
              <Grid alignItems='center' container item sx={{ pt: '15px' }} xs={8}>
                <Grid item xs={1.5}>
                  {ChainLogo}
                </Grid>
                <Grid item sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '26px', pl: '8px' }} xs={10.5}>
                  {state?.amount} {state?.api?.registry?.chainTokens[0]}
                </Grid>
                <Grid container item pt='10px'>
                  <Grid item sx={{ fontSize: '14px', pr: '8px' }}>
                    {t('Fee')}:
                  </Grid>
                  <Grid item sx={{ fontSize: '16px' }}>
                    {state?.fee?.toHuman()}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mt: '8px' }} />
            <Grid alignItems='top' container justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em' }}>
              <Grid item sx={{ fontSize: '16px', paddingTop: '15px' }} xs={4}>
                {t('To')}:
              </Grid>
              <Grid alignItems='center' container item sx={{ pt: '15px' }} xs={8}>
                <Grid item sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '26px' }} xs={10.5}>
                  {state?.recepientName}
                </Grid>
                <Grid item>
                  <ShortAddress address={state?.recepient} addressStyle={{ fontSize: '16px' }} />
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mt: '8px' }} />
            <Grid item sx={{ fontSize: '16px', paddingTop: '15px' }} xs={4}>
              {t('Password')}:
            </Grid>
            <Password setValue={setPassword} value={password} />
          </Container>
          <PButton
            _mt='20px'
            _onClick={send}
            _variant='contained'
            disabled={isConfirming}
            text={t('Send')}
          />
        </>}
      {isConfirming &&
        <>
          <Container disableGutters sx={{ px: '30px' }}>
            <Grid container justifyContent='center' py='15px'>
              {!txLog?.status
                ? <Circle color='#E30B7B' scaleEnd={0.7} scaleStart={0.4} size={78} />
                : <CheckIcon sx={{ bgcolor: 'green', color: 'white', borderRadius: '50%', fontSize: '78px', fontWeight: 600, p: '8px' }} />
              }
            </Grid>
            <Trilogy part1={t('From')} part2={accountName} part3={<ShortAddress address={formatted} addressStyle={{ fontSize: '16px' }} inParentheses />} showDivider />
            <Trilogy part1={t('Amount')} part2={state?.amount} part3={state?.api?.registry?.chainTokens[0]} />
            <Trilogy part1={t('Fee')} part2={state?.fee?.toHuman()} showDivider />
            <Trilogy part1={t('To')} part2={state?.recepientName} part3={<ShortAddress address={state?.recepient} addressStyle={{ fontSize: '16px' }} inParentheses />} showDivider />
            <Trilogy part1={t('Block')} part2={txLog?.block ? `#${txLog?.block}` : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />} />
            <Trilogy part1={t('Hash')} part2={txLog?.txHash ? <ShortAddress address={txLog?.txHash} addressStyle={{ fontSize: '16px' }} charsCount={6} showCopy /> : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />} />
            <Grid container item justifyContent='center' pt='5px' xs={12}>
              <Link
                href={`${subscanLink(txLog?.txHash)}`}
                rel='noreferrer'
                target='_blank'
                underline='none'
              >
                <Grid
                  alt={'subscan'}
                  component='img'
                  src={getLogo('subscan')}
                  sx={{ height: 44, width: 44 }}
                />
              </Link>
            </Grid>
          </Container>
          <PButton
            _mt='15px'
            _onClick={backToMyAccounts}
            _variant='contained'
            text={t('Back to My Account(s)')}
          />
        </>}
    </Motion>
  );
}
