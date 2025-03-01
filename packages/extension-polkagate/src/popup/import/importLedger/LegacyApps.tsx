// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';
import type { HexString } from '@polkadot/util/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import settings from '@polkadot/ui-settings';

import { Address, Select, SelectChain, TwoButtons, VaadinIcon, Warning } from '../../../components';
import { useLedger, useTranslation } from '../../../hooks';
import { createAccountHardware, getMetadata } from '../../../messaging';
import { Name } from '../../../partials';
import getLogo from '../../../util/getLogo';
import { accOps, addOps, hideAddressAnimation, networkOps, showAddressAnimation } from './partials';
import { MODE } from '.';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

export default function LegacyApps({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [isBusy, setIsBusy] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [addressOffset, setAddressOffset] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [genesis, setGenesis] = useState<string | null>(null);
  const { address, error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, refresh, warning: ledgerWarning } = useLedger(genesis, accountIndex, addressOffset);
  const [newChain, setNewChain] = useState<Chain | null>(null);
  const [showMore, setShowMore] = useState<boolean>(false);

  useEffect(() => {
    genesis && getMetadata(genesis, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesis]);

  useEffect(() => {
    if (address) {
      settings.set({ ledgerConn: 'webusb' });
    }
  }, [address]);

  const _onSave = useCallback(() => {
    if (address && genesis && name) {
      setIsBusy(true);

      createAccountHardware(address, 'ledger', accountIndex, addressOffset, name, genesis as HexString)
        .then(() => {
          setStorage('profile', PROFILE_TAGS.LEDGER).catch(console.error);
          openOrFocusTab('/', true);
        })
        .catch((error: Error) => {
          console.error(error);

          setIsBusy(false);
          setError(error.message);
        });
    }
  }, [accountIndex, address, addressOffset, genesis, name]);

  // select element is returning a string
  const _onSetAccountIndex = useCallback((_value: number | string) => {
    const index = accOps.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAccountIndex(Number(index));
  }, []);

  const _onSetAddressOffset = useCallback((_value: number | string) => {
    const index = addOps.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAddressOffset(Number(index));
  }, []);

  const onBack = useCallback(() => setMode(MODE.INDEX), [setMode]);
  const onShowMore = useCallback(() => setShowMore(!showMore), [showMore]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
      <Grid container item sx={{ display: 'block', px: '10%' }}>
        <Title
          height='85px'
          logo={
            <VaadinIcon icon='vaadin:form' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
          }
          text={t('Ledger Legacy')}
        />
        <Typography fontSize='16px' fontWeight={400} pt='15px' textAlign='left' width='100%'>
          <b>1</b>. {t('Connect your ledger device to the computer.')}<br />
          <b>2</b>. {t('Open your desired App on the ledger device.')}<br />
          <b>3</b>. {t('Select the relevant chain of your desired App from below.')}<br />
        </Typography>
        <Grid container item justifyContent='space-between' mb='25px' mt='10px'>
          <SelectChain
            address={address || 'dummy'} // dummy address just to make select enable
            defaultValue={newChain?.genesisHash || networkOps[0].text}
            icon={getLogo(newChain ?? undefined)}
            label={t('Select the chain')}
            onChange={setGenesis}
            options={networkOps as DropdownOption[]}
            style={{ mt: 3, width: '100%' }}
          />
        </Grid>
        <Grid container display={address ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '15px' }}>
          <Address
            address={address}
            backgroundColor='background.main'
            genesisHash={genesis}
            margin='0px'
            name={name}
            style={{ width: '100%' }}
          />
        </Grid>
        {!!genesis && !!address && !ledgerError && (
          <Name
            onChange={setName}
            style={{ width: '100%' }}
            value={name || ''}
          />
        )}
        {!!name && (
          <>
            <Grid alignItems='flex-end' container item justifyContent='flex-start' onClick={onShowMore}>
              <Typography pt='20px' sx={{ color: 'secondary.light', cursor: 'pointer', textDecoration: 'underline', userSelect: 'none' }}>
                {t('More ...')}
              </Typography>
              <ArrowForwardIosIcon sx={{ color: 'secondary.light', cursor: 'pointer', fontSize: 17, ml: '5px', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showMore ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
            </Grid>
            {showMore &&
              <Grid container item justifyContent='space-between' mt='15px'>
                <Grid item md={5.5} xs={12}>
                  <Select
                    defaultValue={accOps[0].value}
                    isDisabled={ledgerLoading}
                    label={t('Account index')}
                    onChange={_onSetAccountIndex}
                    options={accOps}
                    value={accountIndex}
                  />
                </Grid>
                <Grid item md={5.5} xs={12}>
                  <Select
                    defaultValue={addOps[0].value}
                    isDisabled={ledgerLoading}
                    label={t('Address offset')}
                    onChange={_onSetAddressOffset}
                    options={addOps}
                    value={addressOffset}
                  />
                </Grid>
              </Grid>
            }
          </>
        )}
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
              disabled={ledgerLocked ? false : (!!error || !!ledgerError || !address || !genesis || !name)}
              isBusy={ledgerLocked ? false : isBusy}
              mt='30px'
              onPrimaryClick={ledgerLocked ? refresh : _onSave}
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
