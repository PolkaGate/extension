// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy, TransactionDetail, TxInfo } from '@polkadot/extension-polkagate/util/types';

import { Fade, Grid, Typography } from '@mui/material';
import { ArrowLeft } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { PROXY_TYPE, TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '@polkadot/extension-polkagate/src/util/constants';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { DecisionButtons, SignArea3 } from '../../components';
import { useCanPayFeeAndDeposit, useFormatted, useTeleport, useTranslation } from '../../hooks';
import { WaitScreen2 } from '../../partials';
import { toBN } from '../../util/utils';
import HomeLayout from '../components/layout';
import Confirmation from '../manageProxies/Confirmation';
import StepsRow, { INPUT_STEPS } from './partials/StepsRow';
import Step1Sender from './Step1Sender';
import Step2Recipient from './Step2Recipient';
import Step3Amount from './Step3Amount';
import Step4Summary from './Step4Summary';
import { type Inputs } from './types';

export default function SendFund (): React.ReactElement {
  const { t } = useTranslation();
  const { address, assetId, genesisHash } = useParams<{ address: string, genesisHash: string, assetId: string }>();

  const ref = useRef<HTMLDivElement | null>(null);
  const teleportState = useTeleport(genesisHash);
  const navigate = useNavigate();
  const formatted = useFormatted(address, genesisHash);

  const [inputs, setInputs] = useState<Inputs>();
  const [inputStep, setInputStep] = useState<INPUT_STEPS>(INPUT_STEPS.SENDER);
  const [flowStep, setFlowStep] = useState<TransactionFlowStep>(TRANSACTION_FLOW_STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);

  const canPayFee = useCanPayFeeAndDeposit(address, genesisHash, selectedProxy?.delegate, inputs?.fee ? toBN(inputs?.fee) : undefined);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const onNext = useCallback(() => {
    setInputStep((prevStep) => prevStep + 1);
  }, []);

  const onBack = useCallback(() => {
    setInputStep((prevStep) => prevStep - 1);
  }, []);

  const onCloseModal = useCallback(() => {
    navigate(`/accountfs/${address}/${genesisHash}/${assetId}`) as void;
  }, [address, assetId, genesisHash, navigate]);

  const inputTransaction = inputs?.paraSpellTransaction ?? inputs?.transaction;

  const isLoading = useMemo(() => (inputStep === INPUT_STEPS.AMOUNT && !(inputs?.amount && inputTransaction && inputs?.fee)), [inputStep, inputs, inputTransaction]);

  const buttonDisable = useMemo(() =>
    (inputStep === INPUT_STEPS.SENDER && !inputs?.token) ||
    (inputStep === INPUT_STEPS.RECIPIENT && (!inputs?.recipientAddress || inputs?.recipientChain === undefined)) ||
    isLoading ||
    (inputStep === INPUT_STEPS.SUMMARY && !!inputs?.fee)
    ,
    [inputStep, inputs, isLoading]);

  const transactionDetail = useMemo(() => {
    return {
      amount: inputs?.amountAsBN,
      assetDecimal: inputs?.decimal,
      description: t('Amount'),
      extra: {
        from: formatted,
        to: inputs?.recipientAddress,
        // eslint-disable-next-line sort-keys
        recipientNetwork: inputs?.recipientChain?.text
      },
      ...txInfo,
      fee: inputs?.feeInfo,
      token: inputs?.token // since a token other than native token might be transferred, hence we overwrite native token
    } as TransactionDetail;
  }, [formatted, inputs?.amountAsBN, inputs?.decimal, inputs?.feeInfo, inputs?.recipientAddress, inputs?.recipientChain?.text, inputs?.token, t, txInfo]);

  return (
    <HomeLayout
      childrenStyle={{ paddingLeft: '25px', position: 'relative', zIndex: 1 }}
      genesisHash={genesisHash}
      selectedProxyAddress={selectedProxy?.delegate}
      setShowProxySelection={setShowProxySelection}
    >
      <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
        {t('Send funds')}
      </Typography>
      <StepsRow inputStep={inputStep} />
      <Grid container item ref={ref} sx={{ width: 'fit-content' }}>
        {
          inputStep === INPUT_STEPS.SENDER &&
          <Step1Sender
            inputs={inputs}
            setInputs={setInputs}
          />
        }
        {
          inputStep === INPUT_STEPS.RECIPIENT &&
          <Step2Recipient
            assetId={assetId}
            genesisHash={genesisHash}
            inputs={inputs}
            setInputs={setInputs}
            teleportState={teleportState}
          />
        }
        {
          inputStep === INPUT_STEPS.AMOUNT &&
          <Step3Amount
            inputs={inputs}
            setInputs={setInputs}
            teleportState={teleportState}
          />
        }
        {
          inputStep === INPUT_STEPS.SUMMARY && inputs &&
          <Step4Summary
            canPayFee={canPayFee}
            inputs={inputs}
            setInputs={setInputs}
            teleportState={teleportState}
          />
        }
      </Grid>
      {inputStep !== INPUT_STEPS.SUMMARY
        ? (
          <DecisionButtons
            cancelButton
            direction='horizontal'
            disabled={buttonDisable}
            divider
            dividerStyle={{
              background: 'linear-gradient(0deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)',
              height: '32px'
            }}
            onPrimaryClick={onNext}
            onSecondaryClick={onBack}
            primaryBtnText={!inputs?.amount || !isLoading ? t('Next') : t('Preparing, please wait ...')}
            primaryButtonProps={{
              style: { width: '85%' }
            }}
            secondaryBtnText={t('Back')}
            secondaryButtonProps={{
              StartIcon: ArrowLeft,
              disabled: inputStep === INPUT_STEPS.SENDER,
              iconVariant: 'Linear',
              style: { width: '15%' }
            }}
            style={{ justifyContent: 'start', margin: '0', marginTop: '32px', transition: 'all 250ms ease-out', width: ref?.current?.offsetWidth ? `${ref.current.offsetWidth}px` : '80%' }}
          />)
        : inputTransaction &&
        <Fade in={true} style={{ width: 'inherit' }} timeout={1000}>
          <div>
            <SignArea3
              address={address}
              direction='horizontal'
              genesisHash={genesisHash}
              ledgerStyle={{ position: 'unset' }}
              onClose={onBack}
              proxyTypeFilter={PROXY_TYPE.SEND_FUND}
              selectedProxy={selectedProxy}
              setFlowStep={setFlowStep}
              setSelectedProxy={setSelectedProxy}
              setShowProxySelection={setShowProxySelection}
              setTxInfo={setTxInfo}
              showProxySelection={showProxySelection}
              signUsingPasswordProps={{
                decisionButtonProps: {
                  primaryButtonProps: { style: { width: '148%' } },
                  secondaryButtonProps: {
                    StartIcon: ArrowLeft,
                    iconVariant: 'Linear',
                    text: t('Back')
                  }
                }
              }}
              signerOption={inputs?.feeInfo?.assetId ? { assetId: inputs.feeInfo.assetId } : undefined}
              style={{ position: 'unset', width: '73%' }}
              transaction={inputTransaction}
              withCancel
            />
          </div>
        </Fade>
      }
      {
        flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN &&
        <WaitScreen2
          isModal
          setFlowStep={setFlowStep}
        />
      }
      {
        flowStep === TRANSACTION_FLOW_STEPS.CONFIRMATION &&
        <Confirmation
          address={address ?? ''}
          genesisHash={genesisHash}
          isModal
          onCloseModal={onCloseModal}
          showDate
          transactionDetail={transactionDetail}
        />
      }
    </HomeLayout>
  );
}
