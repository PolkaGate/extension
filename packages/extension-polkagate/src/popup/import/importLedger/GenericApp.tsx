// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AddRounded as AddRoundedIcon, Engineering as AdvancedModeIcon, Layers as StandardModeIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { FULLSCREEN_WIDTH, POLKADOT_SLIP44 } from '@polkadot/extension-polkagate/src/util/constants';
import settings from '@polkadot/ui-settings';
import { noop } from '@polkadot/util';

import { ActionContext, Address, TwoButtons, VaadinIcon, Warning } from '../../../components';
import { useGenericLedger, useTranslation } from '../../../hooks';
import { createAccountHardware, updateMeta } from '../../../messaging';
import ManualLedgerImport from './ManualLedgerImport';
import { hideAddressAnimation, showAddressAnimation } from './partials';
import { MODE } from '.';

interface AddressOptions {
  index: number;
  selected?: boolean;
}

type AddressList = Record<string, AddressOptions>;

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

interface AddItemProps {
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
}

interface AdvancedModeBtnProps {
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
  isAdvancedMode: boolean;
}

export const AddItem = ({ disabled, label, onClick }: AddItemProps) => (
  <Grid container item sx={{ my: '20px', opacity: disabled ? 0.5 : 1, width: 'fit-content' }}>
    <Grid alignItems='center' display='inline-flex' item onClick={disabled ? noop : onClick} sx={{ cursor: disabled ? 'context-menu' : 'pointer' }}>
      <AddRoundedIcon sx={{ bgcolor: 'primary.main', borderRadius: '50px', color: '#fff', fontSize: '30px' }} />
      <Typography fontSize='16px' fontWeight={400} lineHeight='36px' pl='10px' sx={{ textDecoration: 'underline' }}>
        {label}
      </Typography>
    </Grid>
  </Grid>
);

const AdvanceModeBtn = ({ disabled, isAdvancedMode, label, onClick }: AdvancedModeBtnProps) => (
  <Grid container justifyContent='flex-end' sx={{ mb: '10px', userSelect: 'none' }}>
    <Grid alignItems='center' display='inline-flex' item onClick={disabled ? noop : onClick} sx={{ cursor: disabled ? 'context-menu' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      {isAdvancedMode
        ? <StandardModeIcon sx={{ color: 'primary.main', fontSize: '25px' }} />
        : <AdvancedModeIcon sx={{ color: 'primary.main', fontSize: '25px' }} />
      }
      <Typography fontSize='16px' fontWeight={400} lineHeight='35px' pl='10px' sx={{ textDecoration: 'underline' }}>
        {label}
      </Typography>
    </Grid>
  </Grid>
);

export default function GenericApp({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef(null);
  const onAction = useContext(ActionContext);

  const [isBusy, setIsBusy] = useState(false);
  const [addressList, setAddressList] = useState<AddressList>({});
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [savedAccountCount, setSavedAccountCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedMode, setAdvancedMode] = useState<boolean>(false);

  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh, warning: ledgerWarning } = useGenericLedger(accountIndex, addressOffset, POLKADOT_SLIP44);

  const importDisabled = useMemo((): boolean =>
    isAdvancedMode
      ? !address
      : !Object.entries(addressList).find(([_, { selected }]) => selected)
    , [address, addressList, isAdvancedMode]);

  useEffect(() => {
    if (!address) {
      return;
    }

    settings.set({ ledgerConn: 'webusb' });

    setAddressList((prev) => {
      if (!prev[address]) { // do not change previous address since we have two useEffect dependencies
        prev[address] = {
          index: accountIndex,
          selected: false
        };
      }

      return prev;
    });

    if (ref.current) {
      //@ts-ignore
      ref.current.scrollTop = ref.current.scrollHeight - ref.current.offsetHeight;
    }
  }, [accountIndex, address]);

  const name = useCallback((index: number, offset?: number) => offset ? `Ledger ${index}-${offset}` : `Ledger ${index}`, []);

  const numberOfSelectedAccounts = useMemo(() =>
    Object.entries(addressList).filter(([_, options]) => options.selected).length
    , [addressList]);

  useEffect(() => {
    if (savedAccountCount && savedAccountCount === numberOfSelectedAccounts) {
      // return to home if all selected accounts are saved
      setStorage('profile', PROFILE_TAGS.LEDGER).catch(console.error);
      openOrFocusTab('/', true);
    }
  }, [savedAccountCount, numberOfSelectedAccounts, onAction]);

  const handleCreateAccount = useCallback((address: string, index: number, offset?: number) => {
    createAccountHardware(address, 'ledger', index, offset ?? 0, name(index, offset), POLKADOT_GENESIS)
      .then(() => {
        const metaData = JSON.stringify({ isGeneric: true });

        updateMeta(String(address), metaData)
          .then(() => {
            if (isAdvancedMode) {
              setStorage('profile', PROFILE_TAGS.LEDGER).catch(console.error);
              openOrFocusTab('/', true);
            } else {
              setSavedAccountCount((pre) => pre + 1);
            }
          }
          ).catch(console.error);
      })
      .catch((error: Error) => {
        console.error(error);

        setIsBusy(false);
        setError(error.message);
      });
  }, [name, isAdvancedMode]);

  const onImport = useCallback(() => {
    if (isAdvancedMode) {
      setIsBusy(true);
      address && handleCreateAccount(address, accountIndex, addressOffset);
    } else if (Object.entries(addressList).length) {
      setIsBusy(true);

      Object.entries(addressList).forEach(([_address, options]) => {
        // create account if it is selected by user
        if (options.selected) {
          handleCreateAccount(_address, options.index);
        }
      });
    }
  }, [accountIndex, address, addressOffset, addressList, isAdvancedMode, handleCreateAccount]);

  const onBack = useCallback(() => setMode(MODE.INDEX), [setMode]);

  const onNewAccount = useCallback(() => setAccountIndex((prev) => prev + 1), []);

  const onAdvancedMode = useCallback(() => {
    setAdvancedMode((prevMode) => !prevMode);
    setAccountIndex(0);
    setAddressOffset(0);
    const firstAddressEntry = Object.entries(addressList)[0];

    if (firstAddressEntry) {
      const [firstKey, firstValue] = firstAddressEntry;

      setAddressList({ [firstKey]: firstValue });
    }
  }, [addressList]);

  const handleCheck = useCallback((e: React.ChangeEvent<HTMLInputElement>, address: string) => {
    const checked = e.target.checked;

    const _addressList = { ...addressList };

    _addressList[address].selected = checked;

    setAddressList({ ..._addressList });
  }, [addressList]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
      <Grid container item sx={{ display: 'block', px: '10%' }}>
        <Title
          height='85px'
          logo={
            <VaadinIcon icon='vaadin:file-tree' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
          }
          text={t('Ledger Polkadot Generic')}
        />
        <Typography fontSize='16px' fontWeight={400} pt='15px' textAlign='left' width='100%'>
          <b>1</b>. {t('Connect your ledger device to the computer.')}<br />
          <b>2</b>. {t('Open Polkadot App on the ledger device.')}<br />
          <b>3</b>. {t('Select accounts to import, click "Add New Account" to create one, or use "Advanced Mode" for index and offset-based import.')}<br />
        </Typography>
        <AdvanceModeBtn
          disabled={ledgerLoading || !!ledgerWarning || !!error || !!ledgerError}
          isAdvancedMode={isAdvancedMode}
          label={isAdvancedMode ? t('Standard Mode') : t('Advanced Mode')}
          onClick={onAdvancedMode}
        />
        <Grid container sx={{ minHeight: '60px' }}>
          {address && !ledgerWarning && !error && !ledgerError &&
            <Grid container sx={{ minHeight: '200px' }}>
              {!isAdvancedMode
                ? <>
                  <Grid container ref={ref} sx={{ maxHeight: `${window.innerHeight - 475}px`, minHeight: '50px', overflowY: 'scroll', pt: '10px', scrollBehavior: 'auto', scrollbarWidth: 'thin' }}>
                    {!!Object.entries(addressList).length &&
                      <>
                        {Object.entries(addressList).map(([address, options]) => (
                          <Grid container display={address ? 'inherit' : 'none'} item key={address} overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '15px' }}>
                            <Address
                              address={address}
                              backgroundColor='background.main'
                              check={addressList[address].selected}
                              handleCheck={handleCheck}
                              margin='0px'
                              name={name(options.index)}
                              showCheckbox
                              style={{ width: '100%' }}
                            />
                          </Grid>
                        ))}
                      </>
                    }
                  </Grid>
                  <AddItem
                    disabled={!address || ledgerLoading}
                    label={t('Add New Account')}
                    onClick={onNewAccount}
                  />
                </>
                : <ManualLedgerImport
                  accountIndex={accountIndex}
                  address={address}
                  addressOffset={addressOffset}
                  genesisHash={POLKADOT_GENESIS}
                  ledgerLoading={ledgerLoading}
                  name={name}
                  ref={ref}
                  setAccountIndex={setAccountIndex}
                  setAddressOffset={setAddressOffset}
                />}
            </Grid>
          }
          {!!ledgerWarning &&
            <Warning theme={theme}>
              {ledgerWarning}
            </Warning>
          }
          {(!!error || !!ledgerError) &&
            <Warning
              isDanger
              theme={theme}
            >
              {error || ledgerError}
            </Warning>
          }
        </Grid>
        <Grid container item justifyContent='flex-end' pt='10px'>
          <Grid container item sx={{ '> div': { width: '100%' } }} xs={7}>
            <TwoButtons
              // FixMe: twoButtons are disabled on false input!
              disabled={ledgerLocked ? false : (!!error || !!ledgerError || importDisabled)}
              isBusy={ledgerLocked ? false : isBusy}
              mt='30px'
              onPrimaryClick={ledgerLocked ? refresh : onImport}
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
