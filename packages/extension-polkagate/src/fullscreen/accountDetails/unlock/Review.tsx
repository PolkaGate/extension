// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unlock review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Lock } from '../../../hooks/useAccountLocks';
import type { Proxy, ProxyItem, TxInfo } from '../../../util/types';

import { faLockOpen, faUserAstronaut } from '@fortawesome/free-solid-svg-icons';
import { Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { isBn } from '@polkadot/util';

import { AccountHolderWithProxy, AmountFee, SignArea2, Warning, WrongPasswordAlert } from '../../../components';
import { useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../hooks';
import { SubTitle } from '../../../partials';
import { PROXY_TYPE } from '../../../util/constants';
import { amountToHuman } from '../../../util/utils';
import { DraggableModal } from '../../governance/components/DraggableModal';
import SelectProxyModal2 from '../../governance/components/SelectProxyModal2';
import WaitScreen from '../../governance/partials/WaitScreen';
import { STEPS } from '../../stake/pool/stake';
import { ModalTitle } from '../../stake/solo/commonTasks/configurePayee';
import Confirmation from './Confirmation';

interface Props {
  address: string;
  api: ApiPromise;
  classToUnlock: Lock[] | undefined
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  totalLocked: BN | null | undefined;
  unlockableAmount: BN | undefined;
}

export default function Review({ address, api, classToUnlock, setDisplayPopup, setRefresh, show, totalLocked, unlockableAmount }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { chain, decimal, formatted, token } = useInfo(address);
  const proxies = useProxies(api, formatted);

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [params, setParams] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>[]>();
  const [step, setStep] = useState<number>(STEPS.INDEX);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const amount = useMemo(() => amountToHuman(unlockableAmount, decimal), [decimal, unlockableAmount]);
  const remove = api.tx['convictionVoting']['removeVote']; // (class, index)
  const unlockClass = api.tx['convictionVoting']['unlock']; // (class)
  const batchAll = api.tx['utility']['batchAll'];

  const estimatedFee = useEstimatedFee(address, params ? batchAll(params) : undefined);

  const extraInfo = useMemo(() => ({
    action: 'Unlock Referenda',
    amount,
    fee: String(estimatedFee || 0),
    subAction: 'Unlock'
  }), [amount, estimatedFee]);

  useEffect((): void => {
    if (!formatted || !classToUnlock) {
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
  }, [classToUnlock, formatted, remove, unlockClass]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const tx = useMemo(() => batchAll(params), [batchAll, params]);

  const onClose = useCallback(() => {
    setDisplayPopup(undefined);
  }, [setDisplayPopup]);

  const closeProxy = useCallback(() => setStep(STEPS.INDEX), []);

  return (
    <DraggableModal onClose={onClose} open={show}>
      <Grid alignItems='center' container justifyContent='center' maxHeight='650px' overflow='hidden'>
        <ModalTitle
          closeProxy={closeProxy}
          icon={step === STEPS.PROXY ? faUserAstronaut : faLockOpen}
          onCancel={step === STEPS.PROXY ? closeProxy : onClose}
          setStep={setStep}
          step={step}
          text={step === STEPS.PROXY ? t('Select Proxy') : t('Unlocking')}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        {[STEPS.INDEX, STEPS.REVIEW, STEPS.SIGN_QR].includes(step) &&
          <>
            <SubTitle label={t('Review')} style={{ paddingTop: isPasswordError ? '10px' : '25px' }} />
            <Container disableGutters sx={{ px: '30px' }}>
              <AccountHolderWithProxy
                address={address}
                chain={chain}
                selectedProxyAddress={selectedProxyAddress}
                showDivider
                style={{ mt: '-5px' }}
                title={t('Account')}
              />
              <AmountFee
                address={address}
                amount={amount}
                fee={estimatedFee}
                label={t('Available to unlock')}
                showDivider={unlockableAmount && !totalLocked?.sub(unlockableAmount).isZero()}
                token={token}
                withFee
              />
              {unlockableAmount && !totalLocked?.sub(unlockableAmount).isZero() &&
                <Warning
                  theme={theme}
                >
                  {t('The rest will be available when the corresponding locks have expired.')}
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
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
                secondaryBtnText={t('Back')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setRefresh={setRefresh}
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
            proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen
            defaultText={t('Checking your votes and delegating status...')}
          />
        }
        {txInfo && step === STEPS.CONFIRM &&
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
