// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ChainLogo, Identity, Motion, ShowBalance, SignArea2, WrongPasswordAlert } from '../../components';
import { useApi, useChain } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import { BalancesInfo, Proxy, TxInfo } from '../../util/types';
import { amountToMachine, pgBoxShadow } from '../../util/utils';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import Confirmation from './Confirmation';
import { Title } from './InputPage';
import { Inputs, STEPS } from './';

interface Props {
  address: string;
  balances: BalancesInfo | undefined;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Review({ address, balances, inputs, setRefresh, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const chain = useChain(address);
  const theme = useTheme();

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const extraInfo = useMemo(() => ({
    action: 'Transfer',
    amount: inputs?.amount,
    fee: String(inputs?.totalFee || 0),
    recipientChainName: inputs?.recipientChainName,
    subAction: 'send',
    to: { address: String(inputs?.recipientAddress), name: inputs?.recipientChainName }
  }), [inputs?.amount, inputs?.recipientAddress, inputs?.recipientChainName, inputs?.totalFee]);

  const handleClose = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.INDEX);
  }, [setRefresh, setStep]);

  return (
    <Motion style={{ height: '100%', paddingInline: '10%', width: '100%' }}>
      <>
        <Grid container>
          {(step === STEPS.REVIEW || step === STEPS.PROXY) && (
            <Title padding='30px 0 0' text={t<string>('Review')} />
          )}
          {step === STEPS.WAIT_SCREEN && (
            <Title text={t<string>('Sending Fund')} />
          )}
          {step === STEPS.CONFIRM && (
            <Title text={t<string>(txInfo?.success ? t('Fund Sent') : t('Fund Send Failed'))} />

          )}
        </Grid>
        {(step === STEPS.REVIEW || step === STEPS.PROXY) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), mb: '20px', p: '1% 3%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('From')}
                </Typography>
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
              {selectedProxyAddress &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={selectedProxyAddress} chain={chain} />
                </Grid>
              }
              <DisplayValue dividerHeight='1px' title={t<string>('Amount')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ShowBalance
                    balance={inputs?.amount && balances?.decimal && amountToMachine(inputs.amount, balances?.decimal)}
                    decimal={balances?.decimal}
                    decimalPoint={4}
                    token={balances?.token}
                  />
                </Grid>
              </DisplayValue>
              <DisplayValue dividerHeight='1px' title={t<string>('Chain')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ChainLogo chainName={chain?.name} size={31} />
                  <Typography fontSize='26px' pl='10px'>
                    {chain?.name}
                  </Typography>
                </Grid>
              </DisplayValue>
              <Divider sx={{ bgcolor: 'secondary.main', height: '3px', mx: 'auto', my: '5px', width: '170px' }} />
              <DisplayValue title={t<string>('To')} topDivider={false}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
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
              <DisplayValue dividerHeight='1px' title={t<string>('Chain')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ChainLogo chainName={inputs?.recipientChainName} size={31} />
                  <Typography fontSize='26px' pl='10px'>
                    {inputs?.recipientChainName}
                  </Typography>
                </Grid>
              </DisplayValue>
              <DisplayValue dividerHeight='3px' title={inputs?.recipientChainName === chain?.name ? t<string>('Fee') : t<string>('Total transaction fee')}>
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
                primaryBtnText={t<string>('Confirm')}
                proxyTypeFilter={['Any', 'NonTransfer']}
                secondaryBtnText={t<string>('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setSelectedProxy={setSelectedProxy}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
                to={inputs?.recipientAddress}
              />
            </Grid>
          </>
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM &&
          <Confirmation
            handleDone={closeConfirmation}
            txInfo={txInfo}
          />
        }
      </>
    </Motion>
  );
}
