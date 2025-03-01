// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { AnyTuple } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useBalances, useChain, useFullscreen, useTranslation } from '../../hooks';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import FullScreenHeader from '../governance/FullScreenHeader';
import WaitScreen from '../governance/partials/WaitScreen';
import Bread from '../partials/Bread';
import { STEPS } from '../stake/pool/stake';
import Confirmation from './Confirmation';
import InputPage, { Title } from './InputPage';
import Review from './Review';

export interface Inputs {
  amount: string | undefined;
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  params: unknown[] | (() => unknown[]);
  recipientAddress: string | undefined;
  recipientGenesisHashOrParaId: string | undefined;
  totalFee?: BN;
  recipientChainName: string | undefined;
}
type StepsType = typeof STEPS[keyof typeof STEPS];

export default function SendFund(): React.ReactElement {
  const { t } = useTranslation();

  useFullscreen();
  const { address, assetId } = useParams<{ address: string, assetId: string }>();
  const chain = useChain(address);
  const ref = useRef(chain);
  const history = useHistory();

  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh, undefined, assetId);

  const [step, setStep] = useState<StepsType>(STEPS.INDEX);
  const [inputs, setInputs] = useState<Inputs>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    /** To remove assetId from the url when chain has changed */
    if (!chain) {
      return;
    }

    if (ref.current && ref.current !== chain) {
      history.push({
        pathname: `/send/${address}`
      });
      setInputs(undefined);
      setStep(STEPS.INDEX); // to return back to index when change is changed on review of confirm page!
    }

    ref.current = chain;
  }, [address, chain, history]);

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    openOrFocusTab(`/accountfs/${address}/${assetId}`, true);
  }, [address, assetId]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='send' unableToChangeAccount={step !== STEPS.INDEX} />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', display: 'block', px: '5%' }}>
        <Bread />
        <Title
          height='100px'
          icon={faPaperPlane}
          text={
            step === STEPS.INDEX
              ? t('Send Fund')
              : [STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step)
                ? t('Review')
                : step === STEPS.WAIT_SCREEN
                  ? t('Sending Fund')
                  : t(txInfo?.success
                    ? t('Fund Sent')
                    : t('Fund Send Failed'))
          }
        />
        {(step === STEPS.INDEX) &&
          <InputPage
            address={address}
            assetId={assetId}
            balances={balances}
            inputs={inputs}
            setInputs={setInputs}
            setStep={setStep}
          />
        }
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
          <Review
            address={address}
            balances={balances}
            inputs={inputs}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
          />
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
      </Grid>
    </Grid>
  );
}
