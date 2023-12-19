// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unlock review page
 * */

import type { ApiPromise } from '@polkadot/api';

import { useTheme } from '@emotion/react';
import { Close as CloseIcon } from '@mui/icons-material';
import { Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN, BN_ONE, isBn } from '@polkadot/util';

import { AccountHolderWithProxy, AmountFee, SignArea2, Warning, WrongPasswordAlert } from '../../../components';
import { useChain, useDecimal, useFormatted, useProxies, useToken, useTranslation } from '../../../hooks';
import { Lock } from '../../../hooks/useAccountLocks';
import { SubTitle } from '../../../partials';
import { Proxy, ProxyItem, TxInfo } from '../../../util/types';
import { amountToHuman } from '../../../util/utils';
import { DraggableModal } from '../../governance/components/DraggableModal';
import SelectProxyModal2 from '../../governance/components/SelectProxyModal2';
import WaitScreen from '../../governance/partials/WaitScreen';
import Confirmation from './Confirmation';

interface Props {
  address: string;
  api: ApiPromise;
  classToUnlock: Lock[]
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>
  show: boolean;
  unlockableAmount: BN;
  totalLocked: BN;
}

const STEPS = {
  REVIEW: 1,
  WAIT_SCREEN: 2,
  CONFIRMATION: 3,
  PROXY: 100
};

export default function Review ({ address, api, classToUnlock, setDisplayPopup, show, totalLocked, unlockableAmount }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const theme = useTheme();
  const proxies = useProxies(api, formatted);
  const chain = useChain(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<BN>();
  const [params, setParams] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>[]>();
  const [step, setStep] = useState<number>(STEPS.REVIEW);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const amount = useMemo(() => amountToHuman(unlockableAmount, decimal), [decimal, unlockableAmount]);
  const remove = api.tx.convictionVoting.removeVote; // (class, index)
  const unlockClass = api.tx.convictionVoting.unlock; // (class)
  const batchAll = api.tx.utility.batchAll;

  const extraInfo = useMemo(() => ({
    action: 'Unlock Referenda',
    amount,
    fee: String(estimatedFee || 0),
    subAction: 'Unlock'
  }), [amount, estimatedFee]);

  useEffect((): void => {
    if (!formatted) {
      return;
    }

    const removes = classToUnlock.map((r) => isBn(r.refId) ? remove(r.classId, r.refId) : undefined).filter((i) => !!i);
    const uniqueSet = new Set<string>();

    classToUnlock.forEach(({ classId }) => {
      const id = classId.toString();

      uniqueSet.add(id);
    });

    const unlocks = [...uniqueSet].map((id) => unlockClass(id, formatted));

    const params = [...removes, ...unlocks];

    setParams(params);

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    batchAll(params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, batchAll, formatted, classToUnlock, remove, unlockClass]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const tx = useMemo(() => {
    const extrinsic = batchAll(params);
    const ptx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, extrinsic) : extrinsic;

    return ptx;
  }, [api.tx.proxy, batchAll, formatted, params, selectedProxy]);

  const onClose = useCallback(() => {
    setDisplayPopup(undefined);
  }, [setDisplayPopup]);

  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), []);

  return (
    <DraggableModal onClose={onClose} open={show}>
      <Grid alignItems='center' container justifyContent='center' maxHeight='650px' overflow='hidden'>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {step === STEPS.PROXY ? t<string>('Select Proxy') : t<string>('Unlocking')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={step === STEPS.PROXY ? closeProxy : onClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        {step === STEPS.REVIEW &&
          <>
            <SubTitle label={t('Review')} style={{ paddingTop: isPasswordError ? '10px' : '25px' }} />
            <Container disableGutters sx={{ px: '30px' }}>
              <AccountHolderWithProxy
                address={address}
                chain={chain}
                selectedProxyAddress={selectedProxyAddress}
                showDivider
                style={{ mt: '-5px' }}
                title={t('Account holder')}
              />
              <AmountFee
                address={address}
                amount={amount}
                fee={estimatedFee}
                label={t('Available to unlock')}
                showDivider={!totalLocked.sub(unlockableAmount).isZero()}
                token={token}
                withFee
              />
              {!totalLocked.sub(unlockableAmount).isZero() &&
                <Warning
                  theme={theme}
                >
                  {t<string>('The rest will be available when the corresponding locks have expired.')}
                </Warning>
              }
            </Container>
            <Grid container item sx={{ bottom: '10px', left: '4%', position: 'absolute', width: '92%' }}>
              <SignArea2
                address={address}
                call={tx}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={onClose}
                primaryBtnText={t<string>('Confirm')}
                proxyTypeFilter={['Any', 'NonTransfer']}
                secondaryBtnText={t<string>('Back')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
              />
            </Grid>
          </>}
        {step === STEPS.PROXY &&
          <SelectProxyModal2
            address={address}
            closeSelectProxy={closeProxy}
            height={500}
            proxies={proxyItems}
            proxyTypeFilter={['Any', 'NonTransfer']}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen
            defaultText={t('Checking your votes and delegating status...')}
          />
        }
        {txInfo && step === STEPS.CONFIRMATION &&
          <Confirmation
            address={address}
            onPrimaryBtnClick={onClose}
            showConfirmation={true}
            txInfo={txInfo}
          />
        }
      </Grid>
    </DraggableModal>
  );
}
