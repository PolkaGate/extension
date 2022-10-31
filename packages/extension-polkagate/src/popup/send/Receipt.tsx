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

import { Container, Divider, Grid, Link, Skeleton, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';

import { ActionContext, Motion, PButton, ShortAddress, TwoButtons } from '../../components';
import Popup from '../../components/Popup';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import getLogo from '../../util/getLogo';
import { TransferTxInfo } from '../../util/types';
import FailSuccessIcon from '../history/partials/FailSuccessIcon';

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

interface Props {
  show: boolean;
  title?: string;
  info: TransferTxInfo;
}

export default function Receipt({ info, show, title }: Props): React.ReactElement {
  const { t } = useTranslation();

  // useRedirectOnRefresh('/');
  const theme = useTheme();
  const history = useHistory();
  const { state } = useLocation<LocationState>();
  const onAction = useContext(ActionContext);

  const network = info.chain.name.replace(' Relay Chain', '');
  const subscanLink = (txHash: string) => 'https://' + network + '.subscan.io/extrinsic/' + String(txHash);

  const backToMyAccounts = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const _onBackClick = useCallback(() => {
    state?.backPath && history.push({
      pathname: state?.backPath,
      state: { ...state }
    });
  }, [history, state]);

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
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          text={title}
        />
        <Grid container direction='column' item justifyContent='center' sx={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: '25px', px: '5px' }}>
          <Grid item sx={{ m: 'auto' }}>
            {info.status === 'success' ? t<string>('Completed') : t<string>('Failed')}
          </Grid>
          <Grid item>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
          </Grid>
        </Grid>
        <Container disableGutters sx={{ px: '20px' }}>
          <FailSuccessIcon success={info?.status === 'success'} showLabel={false} style={{ fontSize: '87px', pt: '30px', textAlign: 'center' }} />
          <Trilogy part1={t<string>('From')} part2={info.from.name} part3={<ShortAddress address={info.from.address} addressStyle={{ fontSize: '16px' }} inParentheses />} showDivider />
          <Trilogy part1={t<string>('Amount')} part2={info.amount} part3={info.token} />
          <Trilogy part1={t<string>('Fee')} part2={state?.fee?.toHuman()} showDivider />
          <Trilogy part1={t<string>('To')} part2={state?.recipientName} part3={<ShortAddress address={state?.recipientAddress} addressStyle={{ fontSize: '16px' }} inParentheses />} showDivider />
          <Trilogy part1={t<string>('Block')} part2={info?.block ? `#${info?.block}` : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />} />
          <Trilogy part1={t<string>('Hash')} part2={info?.txHash ? <ShortAddress address={info?.txHash} addressStyle={{ fontSize: '16px' }} charsCount={6} showCopy /> : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />} />
          <Grid container item justifyContent='center' pt='5px' xs={12}>
            <Link
              href={`${subscanLink(info?.txHash)}`}
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
        <TwoButtons
          primaryBtnText={t('My accounts')}
          secondaryBtnText={t('History')}
          onPrimaryClick={backToMyAccounts}
          onSecondaryClick={backToMyAccounts}
        />
        {/* <PButton
          _mt='15px'
          _onClick={backToMyAccounts}
          _variant='contained'
          text={t<string>('Back to My Account(s)')}
        /> */}
      </Popup>
    </Motion>
  );
}
