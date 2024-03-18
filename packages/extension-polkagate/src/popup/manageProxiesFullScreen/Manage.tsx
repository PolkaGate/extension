// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { PButton, ShowBalance } from '../../components';
import { useTranslation } from '../../hooks';
import { ProxyItem } from '../../util/types';
import { nullFunction } from '../../util/utils';
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
}

export default function Manage ({ api, chain, depositedValue, isDisabledAddProxyButton, newDepositValue, proxyItems, setNewDepositedValue, setProxyItems, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const proxyDepositBase = api ? api.consts.proxy.proxyDepositBase as unknown as BN : BN_ZERO;
  const proxyDepositFactor = api ? api.consts.proxy.proxyDepositFactor as unknown as BN : BN_ZERO;
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

  const toAddProxy = useCallback(() => {
    isDisabledAddProxyButton === false && setStep(STEPS.ADD_PROXY);
  }, [isDisabledAddProxyButton, setStep]);

  const AddProxyButton = ({ disabled, onClick }: AddProxyButton) => (
    <Grid container sx={{ my: '40px', opacity: disabled ? 0.5 : 1, pl: '25px' }}>
      <Grid display='inline-flex' item onClick={disabled ? nullFunction : onClick} sx={{ cursor: disabled ? 'context-menu' : 'pointer' }}>
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
    }).filter(Boolean);

    setProxyItems(updatedProxyItems); // TODO: Check if there are undefined values
  }, [proxyItems, setProxyItems]);

  return (
    <Grid container item>
      <Grid alignItems='center' container item pt='25px' width='fit-content'>
        <vaadin-icon icon='vaadin:sitemap' style={{ fontSize: '25px', color: `${theme.palette.text.primary}` }} />
        <Typography fontSize='30px' fontWeight={700} pl='15px'>
          {t('Proxy Management')}
        </Typography>
      </Grid>
      <Typography fontSize='14px' fontWeight={400} pt='25px'>
        {t('You can add new proxies or remove existing ones for the account here.  Keep in mind that you need to reserve a deposit to have proxies.')}
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
            api={api}
            balance={depositedValue ?? newDepositValue ?? BN_ZERO}
            decimalPoint={4}
            height={22}
          />
        </Grid>
        {newDepositValue && depositedValue &&
          <>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px' px='8px'>
              {'-->'}
            </Typography>
            <Grid fontSize='16px' fontWeight={600} item lineHeight='22px'>
              <ShowBalance
                api={api}
                balance={newDepositValue}
                decimalPoint={4}
                height={22}
              />
            </Grid>
          </>
        }
      </Grid>
      <Grid container item sx={{ '> button': { mr: '10%' }, bottom: '25px', height: '50px', justifyContent: 'flex-end', left: 0, position: 'absolute', right: 0 }}>
        <Divider sx={{ bgcolor: 'text.primary', height: '1px', m: '0 auto 10px', width: '80%' }} />
        <PButton
          _mt='1px'
          _onClick={toReview}
          _width={30}
          disabled={confirmDisabled}
          text={t('Next')}
        />
      </Grid>
    </Grid>
  );
}
