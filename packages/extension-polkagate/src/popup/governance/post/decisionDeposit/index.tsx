// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN_ONE } from '@polkadot/util';

import { AccountContext, Identity, ShowBalance } from '../../../../components';
import { useAccountName, useApi, useChain, useDecimal, useFormatted, useProxies, useToken, useTranslation } from '../../../../hooks';
import { Track } from '../../../../hooks/useTrack';
import { broadcast } from '../../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import { DraggableModal } from '../../components/DraggableModal';
import PasswordWithTwoButtonsAndUseProxy from '../../components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../../components/SelectProxyModal';
import DisplayValue from '../castVote/partial/DisplayValue';
import WaitScreen from '../../partials/WaitScreen';
import Confirmation from './Confirmation';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>
  refIndex: number | undefined;
  track: Track | undefined;

}

const STEPS = {
  REVIEW: 1,
  CONFIRM: 2,
  WAIT_SCREEN: 3,
  PROXY: 100
};

export default function DecisionDeposit({ address, open, refIndex, setOpen, track }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const theme = useTheme();
  const name = useAccountName(address);
  const { accounts } = useContext(AccountContext);
  const proxies = useProxies(api, formatted);
  const [step, setStep] = useState<number>(STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const proxyItems = useMemo(() =>
    proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[]
    , [proxies]);

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const tx = api && api.tx.referenda.placeDecisionDeposit;
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const amount = track?.[1]?.decisionDeposit;
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  useEffect(() => {
    if (!formatted || !tx) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const feeDummyParams = [1];

    tx(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, tx]);

  const handleClose = useCallback(() => {
    if (step === STEPS.PROXY) {
      setStep(STEPS.REVIEW);

      return;
    }

    setOpen(false);
  }, [setOpen, step]);

  const confirm = useCallback(async () => {
    try {
      if (!formatted || !tx || !api || !decimal || !refIndex) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setStep(STEPS.WAIT_SCREEN);

      const { block, failureText, fee, success, txHash } = await broadcast(api, tx, [refIndex], signer, formatted, selectedProxy);

      const info = {
        action: 'Governance',
        amount,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: formatted, name },
        subAction: 'Pay Decision Deposit',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [amount, api, chain, decimal, estimatedFee, formatted, name, password, refIndex, selectedProxy, selectedProxyAddress, selectedProxyName, tx]);

  const title = useMemo(() =>
    step === STEPS.REVIEW
      ? t<string>('Pay Decision Deposit')
      : t<string>('Select Proxy')
    , [step, t]);

  const HEIGHT = 550;

  return (
    <DraggableModal onClose={handleClose} open={open} width={500}>
      <Grid container>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={HEIGHT}>
              {title}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {step === STEPS.REVIEW &&
          <Grid container item sx={{ height: '550px' }}>
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '30px', width: '90%' }}>
              <DisplayValue title={t<string>('Referendum')} topDivider={false}>
                <Typography fontSize='28px' fontWeight={400}>
                  #{refIndex}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t<string>('Account')}>
                <Identity address={address} api={api} chain={chain} direction='row' identiconSize={35} showSocial={false} withShortAddress />
              </DisplayValue>
              <DisplayValue title={t<string>('Decision Deposit')}>
                <ShowBalance balance={amount} decimal={decimal} height={42} skeletonWidth={130} token={token} />
              </DisplayValue>
              <DisplayValue title={t<string>('Fee')}>
                <ShowBalance balance={estimatedFee} decimal={decimal} height={42} skeletonWidth={130} token={token} />
              </DisplayValue>
            </Grid>
            <Grid container item sx={{ pt: '40px' }}>
              <PasswordWithTwoButtonsAndUseProxy
                chain={chain}
                isPasswordError={isPasswordError}
                label={`${t<string>('Password')} for ${selectedProxyName || name || ''}`}
                onChange={setPassword}
                onPrimaryClick={confirm}
                onSecondaryClick={() => setOpen(false)}
                primaryBtnText={t<string>('Confirm')}
                proxiedAddress={formatted}
                proxies={proxyItems}
                proxyTypeFilter={['Any']}
                secondaryBtnText={t<string>('Reject')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
                showBackButtonWithUseProxy={false}
              />
            </Grid>
          </Grid>
        }
        {step === STEPS.PROXY &&
          <SelectProxyModal
            address={address}
            height={HEIGHT}
            proxies={proxyItems}
            proxyTypeFilter={['Any', 'Governance', 'NonTransfer']}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
            setStep={setStep}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo && refIndex &&
          <Confirmation
            address={address}
            handleClose={handleClose}
            refIndex={refIndex}
            txInfo={txInfo}
          />
        }
      </Grid>
    </DraggableModal>
  );
}
