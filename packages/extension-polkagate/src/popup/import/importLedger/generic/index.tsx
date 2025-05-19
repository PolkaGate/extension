// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { AddCircle } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import OnboardTitle from '@polkadot/extension-polkagate/src/fullscreen/components/OnboardTitle';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import LedgerErrorMessage from '@polkadot/extension-polkagate/src/popup/signing/ledger/LedgerErrorMessage';
import { POLKADOT_SLIP44 } from '@polkadot/extension-polkagate/src/util/constants';
import settings from '@polkadot/ui-settings';
import { noop } from '@polkadot/util';

import { ledgerErrorImage } from '../../../../assets/img/index';
import { ActionContext, Address, DecisionButtons } from '../../../../components';
import { useGenericLedger, useTranslation } from '../../../../hooks';
import { createAccountHardware, updateMeta } from '../../../../messaging';
import ManualLedgerImport from '../partials/ManualLedgerImport';
import { hideAddressAnimation, showAddressAnimation } from '../partials/partials';
import { MODE } from '..';
import ModeSwitch from './ModeSwitch';
import Steps from './Steps';

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

export const AddItem = ({ disabled, label, onClick }: AddItemProps) => (
  <Grid alignItems='center' container item justifyContent='center' onClick={disabled ? noop : onClick} sx={{ borderRadius: '18px', cursor: disabled ? 'context-menu' : 'pointer', height: '44px', opacity: disabled ? 0.5 : 1, width: '100%', border: '1px solid #2D1E4A' }}>
    <AddCircle color='#AA83DC' size='20' variant='Bold' />
    <Typography color='#BEAAD8' pl='10px' variant='B-2'>
      {label}
    </Typography>
  </Grid>
);

export default function GenericApp ({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
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
      : !Object.entries(addressList).find(([_, { selected }]) => selected) // if there is at least one address is selected
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
      // @ts-ignore
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

  const onModeSwitch = useCallback(() => {
    setAdvancedMode((prevMode) => !prevMode);
    setAccountIndex(0);
    setAddressOffset(0);
    const firstAddressEntry = Object.entries(addressList)[0];

    if (firstAddressEntry) {
      const [firstKey, firstValue] = firstAddressEntry;

      setAddressList({ [firstKey]: firstValue });
    }
  }, [addressList]);

  const handleCheck = useCallback((checked: boolean, address: string) => {
    const _addressList = { ...addressList };

    _addressList[address].selected = checked;

    setAddressList({ ..._addressList });
  }, [addressList]);

  const hasError = !!ledgerWarning || !!error || !!ledgerError;

  return (
    <Stack direction='column' sx={{ height: '545px', position: 'relative', width: '500px' }}>
      <OnboardTitle
        label={t('Ledger Polkadot Generic')}
        labelPartInColor={t('Polkadot Generic')}
        onBack={onBack}
      />
      <Steps />
      <Grid container justifyContent='center' sx={{ minHeight: '60px' }}>
        {address && !hasError &&
          <Grid container sx={{ minHeight: '200px' }}>
            <ModeSwitch
              isAdvancedMode={isAdvancedMode}
              onClick={onModeSwitch}
            />
            {!isAdvancedMode
              ? <Grid container sx={{ maxHeight: '264px', overflowY: 'auto' }}>
                <Grid container ref={ref} sx={{ maxHeight: `${window.innerHeight - 475}px`, minHeight: '50px', overflowY: 'auto', pt: '10px', scrollBehavior: 'auto', scrollbarWidth: 'thin' }}>
                  {!!Object.entries(addressList).length &&
                    <>
                      {Object.entries(addressList).map(([address, options]) => (
                        <Grid container display={address ? 'inherit' : 'none'} item key={address} overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear' }}>
                          <Address
                            address={address}
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
              </Grid>
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
              />
            }
          </Grid>
        }
        {hasError &&
          <Box
            component='img'
            src={ledgerErrorImage as string}
            sx={{ my: '65px' }}
          />}
        {!!ledgerWarning &&
          <LedgerErrorMessage error={ledgerWarning} />
        }
        {(!!error || !!ledgerError) &&
          <LedgerErrorMessage error={error || ledgerError || ''} />
        }
      </Grid>
      <DecisionButtons
        cancelButton
        direction='horizontal'
        disabled={ledgerLocked ? false : (!!error || !!ledgerError || importDisabled)}
        isBusy={ledgerLocked ? false : isBusy}
        onPrimaryClick={ledgerLocked ? refresh : onImport}
        onSecondaryClick={onBack}
        primaryBtnText={ledgerLocked ? t('Refresh') : t('Import')}
        secondaryBtnText={t('Back')}
        showChevron
        style={{ bottom: Object.entries(addressList).length > 2 ? '-20px' : 0, flexDirection: 'row-reverse', position: 'absolute', width: '65%' }}
      />
    </Stack>
  );
}
