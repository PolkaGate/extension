// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TxInfo } from '../../util/types';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { CanPayErrorAlert, ShowBalance, SignArea2, VaadinIcon, WrongPasswordAlert } from '../../components';
import { useCanPayFeeAndDeposit, useEstimatedFee, useFormatted, useTranslation } from '../../hooks';
import { ThroughProxy } from '../../partials';
import { PROXY_TYPE } from '../../util/constants';
import { pgBoxShadow } from '../../util/utils';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import { toTitleCase } from '../governance/utils/util';
import { Title } from '../sendFund/InputPage';
import ProxyTableFL from './components/ProxyTableFL';
import Confirmation from './Confirmation';
import { STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  proxyItems: ProxyItem[] | null | undefined;
  chain: Chain | null | undefined;
  depositedValue: BN | null | undefined;
  step: number;
  newDepositValue: BN | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

function Review({ address, api, chain, depositedValue, newDepositValue, proxyItems, setRefresh, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);

  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const depositToPay = useMemo(() => {
    if (depositedValue === undefined || newDepositValue === undefined) {
      return undefined;
    }

    if (depositedValue === null) {
      return newDepositValue;
    } else if (depositedValue.gte(newDepositValue)) {
      return BN_ZERO;
    } else {
      return newDepositValue.sub(depositedValue);
    }
  }, [depositedValue, newDepositValue]);

  const removeProxy = api?.tx['proxy']['removeProxy']; /** (delegate, proxyType, delay) **/
  const addProxy = api?.tx['proxy']['addProxy']; /** (delegate, proxyType, delay) **/
  const batchAll = api?.tx['utility']['batchAll'];

  const changedItems = useMemo(() => proxyItems?.filter(({ status }) => status !== 'current'), [proxyItems]);

  const { mode, reviewText } = useMemo(() => {
    const settingProxy = proxyItems?.every(({ status }) => status === 'new');

    if (settingProxy) {
      return {
        mode: 'adding proxy(ies)',
        reviewText: `You are adding ${proxyItems && proxyItems.length > 1 ? `${proxyItems.length} proxies` : 'a proxy'}`
      };
    }

    const clearingProxy = proxyItems?.every(({ status }) => status === 'remove');

    if (clearingProxy) {
      return {
        mode: 'clearing proxy(ies)',
        reviewText: `You are clearing your ${proxyItems && proxyItems?.length > 1 ? 'proxies' : 'proxy'}`
      };
    }

    const toAdds = proxyItems?.filter(({ status }) => status === 'new').length;
    const toRemoves = proxyItems?.filter(({ status }) => status === 'remove').length;

    return {
      mode: 'managing proxy(ies)',
      reviewText: `You are ${toAdds && toAdds > 0 ? `adding ${toAdds} ${toRemoves && toRemoves > 0 ? ' and' : ''}` : ''} ${toRemoves && toRemoves > 0 ? `removing ${toRemoves}` : ''} ${(toAdds ?? 0) + (toRemoves ?? 0) > 1 ? 'proxies' : 'proxy'}`
    };
  }, [proxyItems]);

  const call = useMemo(() => {
    if (!removeProxy || !addProxy || !batchAll) {
      return undefined;
    }

    const temp: SubmittableExtrinsic<'promise'>[] = [];

    proxyItems?.forEach(({ proxy, status }) => {
      const { delay, delegate, proxyType } = proxy;

      status === 'remove' && temp.push(removeProxy(delegate, proxyType, delay));
      status === 'new' && temp.push(addProxy(delegate, proxyType, delay));
    });

    return temp.length > 1
      ? batchAll(temp)
      : temp[0];
  }, [addProxy, batchAll, proxyItems, removeProxy]);

  const estimatedFee = useEstimatedFee(address, call);
  const feeAndDeposit = useCanPayFeeAndDeposit(formatted?.toString(), selectedProxy?.delegate, estimatedFee, depositToPay);

  const extraInfo = useMemo(() => ({
    action: 'Proxy Management',
    fee: String(estimatedFee || 0),
    subAction: toTitleCase(mode)
  }), [estimatedFee, mode]);

  const backToManage = useCallback(() => {
    setStep(STEPS.MANAGE);
  }, [setStep]);

  const handleClose = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.CHECK);
  }, [setRefresh, setStep]);

  return (
    <Grid container item>
      <Title
        logo={
          <VaadinIcon icon='vaadin:sitemap' style={{ fontSize: '20px', color: `${theme.palette.text.primary}` }} />
        }
        text={
          [STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step)
            ? t('Review')
            : step === STEPS.WAIT_SCREEN
              ? t('Waiting')
              : t('Confirmation')
        }
      />
      {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
        <>
          <Grid container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), mb: '20px', p: '1% 3%' }}>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            {feeAndDeposit.isAbleToPay === false &&
              <CanPayErrorAlert canPayStatements={feeAndDeposit.statement} />
            }
            <Typography fontSize='20px' fontWeight={700} mt='15px' textAlign='center'>
              {t(reviewText)}.
            </Typography>
            {selectedProxyAddress &&
              <Grid container m='auto' maxWidth='92%'>
                <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
                <ThroughProxy address={selectedProxyAddress} chain={chain as any} />
              </Grid>
            }
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
            <ProxyTableFL
              api={api}
              chain={chain as any}
              labelAlignment='center'
              proxyItems={changedItems}
              status='Read-Only'
              style={{ '> div div.contextBox': { border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', maxHeight: '150px' } }}
              tableLabel={t('Proxy changes')}
            />
            <DisplayValue
              childrenFontSize='24px'
              title={t('Deposit')}
            >
              <ShowBalance
                api={api}
                balance={newDepositValue}
                decimalPoint={4}
                height={22}
              />
            </DisplayValue>
            <DisplayValue title={t('Fee')}>
              <Grid alignItems='center' container item sx={{ fontSize: '24px', height: '42px' }}>
                <ShowBalance
                  api={api}
                  balance={estimatedFee}
                  decimalPoint={4}
                />
              </Grid>
            </DisplayValue>
          </Grid>
          <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
            <SignArea2
              address={address}
              call={call}
              disabled={!depositToPay || feeAndDeposit.isAbleToPay !== true || !changedItems || changedItems.length === 0}
              extraInfo={extraInfo}
              isPasswordError={isPasswordError}
              onSecondaryClick={backToManage}
              primaryBtnText={t('Confirm')}
              proxyTypeFilter={PROXY_TYPE.GENERAL}
              secondaryBtnText={t('Cancel')}
              selectedProxy={selectedProxy}
              setIsPasswordError={setIsPasswordError}
              setSelectedProxy={setSelectedProxy}
              setStep={setStep}
              setTxInfo={setTxInfo}
              step={step}
              steps={STEPS}
            />
          </Grid>
        </>
      }
      {step === STEPS.WAIT_SCREEN &&
        <WaitScreen />
      }
      {step === STEPS.CONFIRM && txInfo && newDepositValue && changedItems &&
        <Confirmation
          address={address}
          depositAmount={newDepositValue}
          handleClose={handleClose}
          proxyItems={changedItems}
          txInfo={txInfo}
        />
      }
    </Grid>
  );
}

export default React.memo(Review);
