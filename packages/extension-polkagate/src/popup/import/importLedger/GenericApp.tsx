// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, keyframes, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AddRounded as AddRoundedIcon } from '@mui/icons-material';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import settings from '@polkadot/ui-settings';

import { AccountContext, ActionContext, Address, PButton, TwoButtons, VaadinIcon, Warning } from '../../../components';
import { useGenericLedger, useTranslation } from '../../../hooks';
import { createAccountHardware, updateMeta } from '../../../messaging';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { MODE } from '.';
import { noop } from '@polkadot/util';

const showAddressAnimation = keyframes`
0% {
  height: 0;
}
100% {
  height: 70px;
}
`;
const hideAddressAnimation = keyframes`
0% {
  height: 70px;
}
100% {
  height: 0;
}
`;

interface AddressOptions {
  index: number;
  selected?: boolean;
}

type AddressList = Record<string, AddressOptions>;

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

interface AddItem {
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
}

export const AddItem = ({ disabled, label, onClick }: AddItem) => (
  <Grid container sx={{ my: '20px', opacity: disabled ? 0.5 : 1 }}>
    <Grid display='inline-flex' item onClick={disabled ? noop : onClick} sx={{ cursor: disabled ? 'context-menu' : 'pointer' }}>
      <AddRoundedIcon sx={{ bgcolor: 'primary.main', borderRadius: '50px', color: '#fff', fontSize: '32px' }} />
      <Typography fontSize='18px' fontWeight={400} lineHeight='36px' pl='10px' sx={{ textDecoration: 'underline' }}>
        {label}
      </Typography>
    </Grid>
  </Grid>
);

export default function GenericApp({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef(null);

  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [addressList, setAddressList] = useState<AddressList>({});
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [savedAccountCount, setSavedAccountCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh, warning: ledgerWarning } = useGenericLedger(accountIndex, 0);

  const importDisabled = useMemo((): boolean =>
    !!Object.entries(addressList).find(([_, { selected }]) => selected)
    , [addressList]);

  useEffect(() => {
    if (!address) {
      return;
    }

    if (address) {
      settings.set({ ledgerConn: 'webusb' });
    }
    setAddressList((prev) => {
      prev[address] = {
        index: accountIndex,
        selected: false
      }

      return prev;
    })
    if (ref.current) {
      //@ts-ignore
      ref.current.scrollTop = ref.current.scrollHeight - ref.current.offsetHeight;
    }
  }, [address]);

  const name = useCallback((index: number) => `Ledger account ${index}`, []);

  const numberOfSelectedAccounts = useMemo(() =>
    Object.entries(addressList).filter(([_, options]) => options.selected).length
    , [addressList]);

  useEffect(() => {
    if (savedAccountCount && savedAccountCount === numberOfSelectedAccounts) {
      // return to home if all selected accounts are saved
      onAction('/');
    }
  }, [savedAccountCount, numberOfSelectedAccounts]);

  const onSave = useCallback(() => {
    if (Object.entries(addressList).length) {
      setIsBusy(true);

      Object.entries(addressList).forEach(([address, options]) => {
        // create account if it is selected by user
        if (options.selected) {
          createAccountHardware(address, 'ledger', options.index, 0, name(options.index), POLKADOT_GENESIS)
            .then(() => {
              const metaData = JSON.stringify({ isGeneric: true });

              updateMeta(String(address), metaData)
                .then(() => setSavedAccountCount((pre) => pre + 1))
            })
            .catch((error: Error) => {
              console.error(error);

              setIsBusy(false);
              setError(error.message);
            });
        }
      })
    }
  }, [accountIndex, address, onAction]);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const onBack = useCallback(() => {
    setMode(MODE.INDEX);
  }, []);

  const onNewAccount = useCallback(() => {
    setAccountIndex((prev) => prev + 1)
  }, []);

  const handleCheck = useCallback((e: React.ChangeEvent<HTMLInputElement>, address: string) => {
    const checked = e.target.checked;

    const _addressList = { ...addressList };
    _addressList[address].selected = checked;

    setAddressList({ ..._addressList });
  }, [addressList]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
      <Grid container item sx={{ display: 'block', px: '10%' }}>
        <Grid alignContent='center' alignItems='center' container item>
          <Grid item sx={{ mr: '20px' }}>
            <VaadinIcon icon='vaadin:file-tree' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
          </Grid>
          <Grid item>
            <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
              {t('Attach ledger - polkadot generic')}
            </Typography>
          </Grid>
        </Grid>
        <Typography fontSize='16px' fontWeight={400} pt='15px' textAlign='left' width='100%'>
          <b>1</b>. {t('Connect your ledger device to the computer.')}<br />
          <b>2</b>. {t('Open Polkadot App on the ledger device.')}<br />
          <b>3</b>. {t('Select the accounts you want to import')}<br />
        </Typography>
        <Grid container ref={ref} sx={{ minHeight: '50px', maxHeight: '500px', overflowY: 'scroll', scrollbarWidth: 'thin', scrollBehavior: 'auto' }}>
          {!!Object.entries(addressList).length &&
            <>
              {Object.entries(addressList).map(([address, options]) => (
                <Grid container display={address ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '15px' }}>
                  <Address
                    showCheckbox
                    handleCheck={handleCheck}
                    check={addressList[address].selected}
                    address={address}
                    backgroundColor='background.main'
                    margin='0px'
                    name={name(options.index)}
                    style={{ width: '100%' }}
                  />
                </Grid>
              ))}
            </>
          }
        </Grid>
        <AddItem
          label={t('Add New Account')}
          onClick={onNewAccount}
          disabled={!address || ledgerLoading}
        />
        {!!ledgerWarning && (
          <Warning theme={theme}>
            {ledgerWarning}
          </Warning>
        )}
        {(!!error || !!ledgerError) && (
          <Warning
            isDanger
            theme={theme}
          >
            {error || ledgerError}
          </Warning>
        )}
        <Grid container item justifyContent='flex-end' pt='10px'>
          <Grid container item sx={{ '> div': { width: '100%' } }} xs={7}>
            <TwoButtons
              // FixMe: twoButtons are disabled on false input!
              disabled={ledgerLocked ? false : (!!error || !!ledgerError || !importDisabled)}
              isBusy={ledgerLocked ? false : isBusy}
              mt='30px'
              onPrimaryClick={ledgerLocked ? refresh : onSave}
              onSecondaryClick={onBack}
              primaryBtnText={ledgerLocked ? t('Refresh') : t('Import')}
              secondaryBtnText={t('Back')}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
