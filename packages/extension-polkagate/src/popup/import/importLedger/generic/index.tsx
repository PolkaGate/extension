// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { AddCircle } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import OnboardTitle from '@polkadot/extension-polkagate/src/fullscreen/components/OnboardTitle';
import LedgerErrorMessage from '@polkadot/extension-polkagate/src/popup/signing/ledger/LedgerErrorMessage';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';
import { POLKADOT_SLIP44, SELECTED_PROFILE_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';
import { switchToOrOpenTab } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';
import settings from '@polkadot/ui-settings';
import { noop } from '@polkadot/util';

import { ledgerErrorImage } from '../../../../assets/img/index';
import { Address, DecisionButtons } from '../../../../components';
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
  <Grid alignItems='center' container item justifyContent='center' onClick={disabled ? noop : onClick} sx={{ '&:hover': { background: '#6743944D' }, border: '1px solid #2D1E4A', borderRadius: '18px', cursor: disabled ? 'context-menu' : 'pointer', height: '44px', opacity: disabled ? 0.5 : 1, transition: 'all 250ms ease-out', width: '100%' }}>
    <AddCircle color='#AA83DC' size='20' variant='Bold' />
    <Typography color='#BEAAD8' pl='10px' variant='B-2'>
      {label}
    </Typography>
  </Grid>
);

export default function GenericApp ({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef(null);
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);
  const finishedCountRef = useRef(0);

  const [isBusy, setIsBusy] = useState(false);
  const [addressList, setAddressList] = useState<AddressList>({});
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedMode, setAdvancedMode] = useState<boolean>(false);

  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh, warning: ledgerWarning } = useGenericLedger(accountIndex, addressOffset, POLKADOT_SLIP44);

  const selectedAddresses = useMemo(() =>
    Object.entries(addressList).filter(([_, options]) => options.selected),
  [addressList]);

  const importDisabled = useMemo((): boolean =>
    isAdvancedMode
      ? !address
      : !selectedAddresses.length // if there is at least one address is selected
  , [address, selectedAddresses, isAdvancedMode]);

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

  const handleCreateAccount = useCallback((address: string, index: number, offset?: number) => {
    createAccountHardware(address, 'ledger', index, offset ?? 0, name(index, offset), POLKADOT_GENESIS)
      .then(() => {
        const metaData = JSON.stringify({ isGeneric: true });

        updateMeta(String(address), metaData)
          .then(() => {
            if (isAdvancedMode) {
              setStorage(SELECTED_PROFILE_NAME_IN_STORAGE, PROFILE_TAGS.LEDGER).catch(console.error);
              switchToOrOpenTab('/', true);
            } else {
              finishedCountRef.current++;

              if (
                finishedCountRef.current === selectedAddresses.length &&
                !hasNavigatedRef.current
              ) {
                hasNavigatedRef.current = true;
                setStorage(SELECTED_PROFILE_NAME_IN_STORAGE, PROFILE_TAGS.LEDGER)
                  .then(() => navigate('/'))
                  .catch(console.error);
              }
            }
          }
          ).catch(console.error);
      })
      .catch((error: Error) => {
        console.error(error);

        setIsBusy(false);
        setError(error.message);
      });
  }, [name, isAdvancedMode, navigate, selectedAddresses.length]);

  const onImport = useCallback(() => {
    if (isAdvancedMode) {
      setIsBusy(true);
      address && handleCreateAccount(address, accountIndex, addressOffset);
    } else if (selectedAddresses.length) {
      setIsBusy(true);

      selectedAddresses.forEach(([_address, options]) => {
        // create account if it is selected by user
        if (options.selected) {
          handleCreateAccount(_address, options.index);
        }
      });
    }
  }, [accountIndex, address, addressOffset, selectedAddresses, isAdvancedMode, handleCreateAccount]);

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
    <Stack direction='column' sx={{ maxHeight: 'calc(100vh - 260px)', minHeight: '545px', position: 'relative', width: '500px' }}>
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
              ? <Grid container sx={{ maxHeight: 'calc(100vh - 575px)', overflowY: 'auto' }}>
                <Grid container ref={ref} sx={{ minHeight: '50px', overflowY: 'auto', pt: '10px', scrollBehavior: 'auto', scrollbarWidth: 'thin' }}>
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
        style={{ flexDirection: 'row-reverse', marginTop: '30px' }}
      />
    </Stack>
  );
}
