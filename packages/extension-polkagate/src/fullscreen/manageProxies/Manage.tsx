// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { ProxyItem } from '../../util/types';

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { ActionContext, ShowBalance, TwoButtons, VaadinIcon } from '../../components';
import { useTranslation } from '../../hooks';
import { noop } from '../../util/utils';
import Bread from '../partials/Bread';
import { Title } from '../sendFund/InputPage';
import ProxyTableFL from './components/ProxyTableFL';
import { STEPS } from '.';

interface AddProxyButton {
  onClick?: () => void;
  disabled?: boolean;
}

interface Props {
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  isDisabledAddProxyButton: boolean;
  proxyItems: ProxyItem[] | null | undefined;
  chain: Chain | null | undefined;
  setProxyItems: React.Dispatch<React.SetStateAction<ProxyItem[] | null | undefined>>;
  depositedValue: BN | null | undefined;
  setNewDepositedValue: React.Dispatch<React.SetStateAction<BN | undefined>>;
  newDepositValue: BN | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

export default function Manage({ api, chain, decimal, depositedValue, isDisabledAddProxyButton, newDepositValue, proxyItems, setNewDepositedValue, setProxyItems, setStep, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const proxyDepositBase = api ? api.consts['proxy']['proxyDepositBase'] as unknown as BN : BN_ZERO;
  const proxyDepositFactor = api ? api.consts['proxy']['proxyDepositFactor'] as unknown as BN : BN_ZERO;
  const confirmDisabled = useMemo(() => !proxyItems || proxyItems.length === 0 || proxyItems.every(({ status }) => status === 'current'), [proxyItems]);

  useEffect(() => {
    if (!proxyItems || proxyItems.length === 0 || confirmDisabled) {
      setNewDepositedValue(undefined);

      return;
    }

    const toAdds = proxyItems.filter(({ status }) => status === 'new').length;
    const olds = proxyItems.filter(({ status }) => status === 'current').length;

    if (olds > 0) {
      return setNewDepositedValue(proxyDepositFactor.muln(olds + toAdds).add(proxyDepositBase));
    } else if (toAdds > 0) {
      return setNewDepositedValue(proxyDepositFactor.muln(toAdds).add(proxyDepositBase));
    } else {
      return setNewDepositedValue(BN_ZERO);
    }
  }, [confirmDisabled, proxyDepositBase, proxyDepositFactor, proxyItems, setNewDepositedValue]);

  const toReview = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const onCancel = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const toAddProxy = useCallback(() => {
    isDisabledAddProxyButton === false && setStep(STEPS.ADD_PROXY);
  }, [isDisabledAddProxyButton, setStep]);

  const AddProxyButton = ({ disabled, onClick }: AddProxyButton) => (
    <Grid container sx={{ my: '40px', opacity: disabled ? 0.5 : 1 }}>
      <Grid display='inline-flex' item onClick={disabled ? noop : onClick} sx={{ cursor: disabled ? 'context-menu' : 'pointer' }}>
        <AddRoundedIcon sx={{ bgcolor: 'primary.main', borderRadius: '50px', color: '#fff', fontSize: '32px' }} />
        <Typography fontSize='18px' fontWeight={400} lineHeight='36px' pl='10px' sx={{ textDecoration: 'underline' }}>
          {t('Add proxy')}
        </Typography>
      </Grid>
    </Grid>
  );

  const handleDelete = useCallback((proxyItem: ProxyItem) => {
    const updatedProxyItems = proxyItems?.map((_proxyItem) => {
      if (proxyItem.proxy.delegate === _proxyItem.proxy.delegate && proxyItem.proxy.proxyType === _proxyItem.proxy.proxyType) {
        if (_proxyItem.status === 'new') {
          return undefined;
        } else if (_proxyItem.status === 'current') {
          _proxyItem.status = 'remove';

          return _proxyItem;
        } else {
          _proxyItem.status = 'current';

          return _proxyItem;
        }
      }

      return _proxyItem;
    }).filter((item) => !!item);

    setProxyItems(updatedProxyItems);
  }, [proxyItems, setProxyItems]);

  return (
    <Grid container item>
      <Bread />
      <Title
        height='100px'
        logo={<VaadinIcon icon='vaadin:sitemap' style={{ color: `${theme.palette.text.primary}`, fontSize: '20px' }} />}
        text={t('Proxy Management')}
      />
      <Typography fontSize='14px' fontWeight={400}>
        {t('You can add new proxies or remove existing ones for the account here. Keep in mind that you need to reserve a deposit to have proxies.')}
      </Typography>
      <AddProxyButton
        disabled={isDisabledAddProxyButton}
        onClick={toAddProxy}
      />
      <ProxyTableFL
        api={api}
        chain={chain}
        handleDelete={handleDelete}
        proxyItems={proxyItems}
      />
      <Grid container item pl='15px' pt='15px'>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t('Deposit:')}
        </Typography>
        <Grid fontSize='16px' fontWeight={500} item lineHeight='22px' pl='5px'>
          <ShowBalance
            balance={depositedValue ?? newDepositValue ?? BN_ZERO}
            decimal={decimal}
            decimalPoint={4}
            height={22}
            token={token}
          />
        </Grid>
        {newDepositValue && depositedValue &&
          <>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px' px='8px'>
              {'-->'}
            </Typography>
            <Grid fontSize='16px' fontWeight={600} item lineHeight='22px'>
              <ShowBalance
                balance={newDepositValue}
                decimal={decimal}
                decimalPoint={4}
                height={22}
                token={token}
              />
            </Grid>
          </>
        }
      </Grid>
      <Grid container item justifyContent='flex-end' sx={{ borderColor: 'divider', borderTop: 1, bottom: '25px', height: '50px', left: 0, mx: '7%', position: 'absolute', width: '85%' }}>
        <Grid container item xs={7}>
          <TwoButtons
            disabled={confirmDisabled}
            mt='10px'
            onPrimaryClick={toReview}
            onSecondaryClick={onCancel}
            primaryBtnText={t('Next')}
            secondaryBtnText={t('Cancel')}
            width='100%'
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
