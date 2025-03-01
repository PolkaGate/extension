// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Proxy, ProxyItem, TxInfo } from '../../../../util/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { Identity, ShowBalance, SignArea2, Warning } from '../../../../components';
import { useAccountDisplay, useBalances, useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import { getValue } from '../../../../popup/account/util';
import { PROXY_TYPE } from '../../../../util/constants';
import { DraggableModal } from '../../components/DraggableModal';
import SelectProxyModal2 from '../../components/SelectProxyModal2';
import WaitScreen from '../../partials/WaitScreen';
import { type Track } from '../../utils/types';
import DisplayValue from '../castVote/partial/DisplayValue';
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
  PROXY: 100,
  SIGN_QR: 200
};

export default function DecisionDeposit({ address, open, refIndex, setOpen, track }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, chain, decimal, formatted, token } = useInfo(address);
  const theme = useTheme();
  const name = useAccountDisplay(address);
  const balances = useBalances(address);
  const proxies = useProxies(api, formatted);

  const proxyItems = useMemo(() =>
    proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[]
    , [proxies]);

  const [step, setStep] = useState<number>(STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const tx = api?.tx['referenda']['placeDecisionDeposit'];
  const amount = track?.[1]?.decisionDeposit;
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const estimatedFee = useEstimatedFee(address, tx, [1]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const handleClose = useCallback(() => {
    if (step === STEPS.PROXY) {
      setStep(STEPS.REVIEW);

      return;
    }

    setOpen(false);
  }, [setOpen, step]);

  const extraInfo = useMemo(() => ({
    action: 'Governance',
    amount,
    fee: String(estimatedFee || 0),
    from: { address: formatted, name },
    subAction: 'Pay Decision Deposit'
  }), [amount, estimatedFee, formatted, name]);

  const title = useMemo(() => {
    if (step === STEPS.REVIEW) {
      return t('Pay Decision Deposit');
    }

    if (step === STEPS.PROXY) {
      return t('Select Proxy');
    }

    if (step === STEPS.WAIT_SCREEN) {
      return t('Paying');
    }

    if (step === STEPS.CONFIRM) {
      return t('Paying Confirmation');
    }

    return undefined;
  }, [step, t]);

  const HEIGHT = 550;

  const notEnoughBalance = useMemo(() => amount && estimatedFee && getValue('transferable', balances)?.lt(amount.add(estimatedFee)), [amount, balances, estimatedFee]);

  return (
    <DraggableModal onClose={handleClose} open={open} width={500}>
      <Grid container item justifyContent='center' sx={{ height: '625px' }}>
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
        {[STEPS.REVIEW, STEPS.SIGN_QR].includes(step) &&
          <Grid container item sx={{ display: 'block', height: '550px', mt: '20px' }}>
            {notEnoughBalance &&
              <Grid container height='42px' item justifyContent='center' my='15px'>
                <Warning
                  fontWeight={400}
                  isDanger
                  marginTop={0}
                  theme={theme}
                >
                  {t('You don\'t have sufficient funds available to complete this transaction.')}
                </Warning>
              </Grid>
            }
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t('Account')}
                </Typography>
                <Identity
                  address={address}
                  api={api}
                  chain={chain as any}
                  direction='row'
                  identiconSize={35}
                  showSocial={false}
                  style={{ maxWidth: '100%', width: 'fit-content' }}
                  withShortAddress
                />
              </Grid>
              {selectedProxyAddress &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={selectedProxyAddress} chain={chain as any} />
                </Grid>
              }
              <DisplayValue title={t('Referendum')}>
                <Typography fontSize='28px' fontWeight={400}>
                  #{refIndex}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t('Decision Deposit')}>
                <Grid alignItems='center' container height={42} item>
                  <ShowBalance balance={amount} decimal={decimal} skeletonWidth={130} token={token} />
                </Grid>
              </DisplayValue>
              <DisplayValue title={t('Fee')}>
                <Grid alignItems='center' container height={42} item>
                  <ShowBalance balance={estimatedFee} decimal={decimal} skeletonWidth={130} token={token} />
                </Grid>
              </DisplayValue>
            </Grid>
            <Grid container item sx={{ bottom: '20px', left: '4%', position: 'absolute', width: '92%' }}>
              <SignArea2
                address={address!}
                call={tx}
                disabled={notEnoughBalance}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={handleClose}
                params={[refIndex]}
                previousStep={STEPS.REVIEW}
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
                secondaryBtnText={t('Close')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
              />
            </Grid>
          </Grid>
        }
        {step === STEPS.PROXY &&
          <SelectProxyModal2
            address={address}
            // eslint-disable-next-line react/jsx-no-bind
            closeSelectProxy={() => setStep(STEPS.REVIEW)}
            height={HEIGHT}
            proxies={proxyItems}
            proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo && refIndex &&
          <Confirmation
            handleClose={handleClose}
            refIndex={refIndex}
            txInfo={txInfo}
          />
        }
      </Grid>
    </DraggableModal>
  );
}
