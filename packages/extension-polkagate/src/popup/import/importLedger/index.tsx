// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, keyframes, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import settings from '@polkadot/ui-settings';

import { AccountContext, ActionContext, Address, Select, SelectChain, TwoButtons, Warning } from '../../../components';
import { useFullscreen, useLedger, useTranslation } from '../../../hooks';
import { createAccountHardware, getMetadata } from '../../../messaging';
import { Name } from '../../../partials';
import getLogo from '../../../util/getLogo';
import ledgerChains from '../../../util/legerChains';
import { FullScreenHeader } from '../../governance/FullScreenHeader';

interface AccOption {
  text: string;
  value: number;
}

interface NetworkOption {
  text: string;
  value: string | null;
}

const AVAIL: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export default function ImportLedger(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();

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

  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
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

  const accOps = useRef(AVAIL.map((value): AccOption => ({
    text: t('Account type {{index}}', { replace: { index: value } }),
    value
  })));

  const addOps = useRef(AVAIL.map((value): AccOption => ({
    text: t('Address index {{index}}', { replace: { index: value } }),
    value
  })));

  const networkOps = useRef(
    [{
      text: t('No chain selected'),
      value: ''
    },
    ...ledgerChains.map(({ displayName, genesisHash }): NetworkOption => ({
      text: displayName,
      value: genesisHash[0]
    }))]
  );

  const _onSave = useCallback(() => {
    if (address && genesis && name) {
      setIsBusy(true);

      createAccountHardware(address, 'ledger', accountIndex, addressOffset, name, genesis)
        .then(() => onAction('/'))
        .catch((error: Error) => {
          console.error(error);

          setIsBusy(false);
          setError(error.message);
        });
    }
  }, [accountIndex, address, addressOffset, genesis, name, onAction]);

  // select element is returning a string
  const _onSetAccountIndex = useCallback((value: number) => {
    setAccountIndex(Number(value));
  }, []);

  const _onSetAddressOffset = useCallback((value: number) => {
    setAddressOffset(Number(value));
  }, []);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const onCloseTab = useCallback(() => window.close(), []);

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <vaadin-icon icon='vaadin:wallet' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Attach ledger device')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={400} textAlign='left' width='100%' pt='15px'>
            <b>1</b>. {t<string>('Connect your ledger device to the computer.')}<br />
            <b>2</b>. {t<string>('Open your desired App on the ledger device.')}<br />
            <b>3</b>. {t<string>('Select the relevant chain of your desired App from below.')}<br />
          </Typography>
          <Grid container item justifyContent='space-between' mb='25px' mt='10px'>
            <SelectChain
              address={address || 'dummy'} //dummy address just to make select enable
              defaultValue={newChain?.genesisHash || networkOps.current[0].text}
              icon={getLogo(newChain ?? undefined)}
              label={t<string>('Select the chain')}
              onChange={setGenesis}
              options={networkOps.current}
              style={{ mt: 3, width: '100%' }}
            />
          </Grid>
          {/* <Grid container item overflow='hidden' sx={{ mt: '45px' }}> */}
          <Grid container display={address ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '15px' }}>
            <Address
              address={address}
              backgroundColor='background.main'
              genesisHash={genesis}
              isHardware
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
              <Grid alignItems='flex-end' container item justifyContent='flex-start' onClick={() => setShowMore(!showMore)}>
                <Typography pt='20px' sx={{ color: 'secondary.light', cursor: 'pointer', textDecoration: 'underline', userSelect: 'none' }}>
                  {t('More ...')}
                </Typography>
                <ArrowForwardIosIcon sx={{ color: 'secondary.light', cursor: 'pointer', fontSize: 17, ml: '5px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
              </Grid>
              {showMore &&
                <Grid container item justifyContent='space-between' mt='15px'>
                  <Grid item md={5.5}>
                    <Select
                      defaultValue={accOps.current[0].text}
                      isDisabled={ledgerLoading}
                      label={t<string>('account type')}
                      onChange={_onSetAccountIndex}
                      options={accOps.current}
                    />
                  </Grid>
                  <Grid item md={5.5}>
                    <Select
                      defaultValue={addOps.current[0].text}
                      isDisabled={ledgerLoading}
                      label={t<string>('address index')}
                      onChange={_onSetAddressOffset}
                      options={addOps.current}
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
                onSecondaryClick={onCloseTab}
                primaryBtnText={ledgerLocked ? t<string>('Refresh') : t<string>('Import')}
                secondaryBtnText={t<string>('Close tab')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
