// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BalancesInfo, Proxy, TxInfo } from '../../util/types';
import type { Inputs } from '.';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ChainLogo, Identity, Motion, ShowBalance, SignArea2, WrongPasswordAlert } from '../../components';
import { useInfo } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import { PROXY_TYPE } from '../../util/constants';
import { amountToMachine, pgBoxShadow } from '../../util/utils';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import { STEPS } from '../stake/pool/stake';

interface Props {
  address: string;
  balances: BalancesInfo | undefined;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
}

export default function Review({ address, balances, inputs, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { api, chain } = useInfo(address);

  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const extraInfo = useMemo(() => ({
    action: 'Transfer',
    amount: inputs?.amount,
    fee: String(inputs?.totalFee || 0),
    recipientChainName: inputs?.recipientChainName,
    subAction: 'send',
    to: { address: String(inputs?.recipientAddress) }
  }), [inputs?.amount, inputs?.recipientAddress, inputs?.recipientChainName, inputs?.totalFee]);

  const handleClose = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  return (
    <Motion style={{ height: '100%', width: '100%' }}>
      <>
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), mb: '20px' }}>
          <DisplayValue title={t('From')} topDivider={false}>
            <Grid alignItems='center' container item justifyContent='center' sx={{ height: '42px', width: '600px' }}>
              <Identity
                address={address}
                api={api}
                chain={chain}
                direction='row'
                identiconSize={31}
                showSocial={false}
                style={{ maxWidth: '100%', width: 'fit-content' }}
                withShortAddress
              />
            </Grid>
          </DisplayValue>
          {selectedProxyAddress &&
            <Grid container m='auto' maxWidth='92%'>
              <ThroughProxy address={selectedProxyAddress} chain={chain} />
            </Grid>
          }
          <DisplayValue dividerHeight='1px' title={t('Amount')}>
            <Grid alignItems='center' container item sx={{ height: '42px' }}>
              <ShowBalance
                balance={inputs?.amount && balances?.decimal ? amountToMachine(inputs.amount, balances?.decimal) : undefined}
                decimal={balances?.decimal}
                decimalPoint={4}
                token={balances?.token}
              />
            </Grid>
          </DisplayValue>
          <DisplayValue dividerHeight='1px' title={t('Chain')}>
            <Grid alignItems='center' container item sx={{ height: '42px' }}>
              <ChainLogo chainName={chain?.name} genesisHash={chain?.genesisHash} size={31} />
              <Typography fontSize='26px' pl='10px'>
                {chain?.name}
              </Typography>
            </Grid>
          </DisplayValue>
          <Divider sx={{ bgcolor: 'secondary.main', height: '3px', mx: 'auto', my: '5px', width: '170px' }} />
          <DisplayValue title={t('To')} topDivider={false}>
            <Grid alignItems='center' container item justifyContent='center' sx={{ height: '42px', width: '600px' }}>
              <Identity
                address={inputs?.recipientAddress}
                api={api}
                chain={chain}
                direction='row'
                identiconSize={31}
                showSocial={false}
                style={{ maxWidth: '100%', width: 'fit-content' }}
                withShortAddress
              />
            </Grid>
          </DisplayValue>
          <DisplayValue dividerHeight='1px' title={t('Chain')}>
            <Grid alignItems='center' container item sx={{ height: '42px' }}>
              <ChainLogo chainName={inputs?.recipientChainName} genesisHash={inputs?.recipientGenesisHashOrParaId} size={31} />
              <Typography fontSize='26px' pl='10px'>
                {inputs?.recipientChainName}
              </Typography>
            </Grid>
          </DisplayValue>
          <DisplayValue dividerHeight='3px' title={inputs?.recipientChainName === chain?.name ? t('Fee') : t('Total transaction fee')}>
            <Grid alignItems='center' container item sx={{ height: '42px' }}>
              <ShowBalance
                api={api}
                balance={inputs?.totalFee}
                decimalPoint={4}
              />
            </Grid>
          </DisplayValue>
        </Grid>
        <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
          <SignArea2
            address={address}
            call={inputs?.call}
            extraInfo={extraInfo}
            isPasswordError={isPasswordError}
            onSecondaryClick={handleClose}
            params={inputs?.params}
            primaryBtnText={t('Confirm')}
            proxyTypeFilter={PROXY_TYPE.SEND_FUND}
            secondaryBtnText={t('Cancel')}
            selectedProxy={selectedProxy}
            setIsPasswordError={setIsPasswordError}
            setRefresh={setRefresh}
            setSelectedProxy={setSelectedProxy}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
            steps={STEPS}
            token={balances?.token}
          />
        </Grid>
      </>
    </Motion>
  );
}
