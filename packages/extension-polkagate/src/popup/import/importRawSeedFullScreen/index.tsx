// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { HexString } from '@polkadot/util/types';

import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { Collapse, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import { keyring } from '@polkadot/ui-keyring';
import { objectSpread } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { Address, GenesisHashOptionsContext, InputWithLabel, TextAreaWithLabel, TwoButtons, VaadinIcon, Warning } from '../../../components';
import FullScreenHeader from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen, useMetadata, useTranslation } from '../../../hooks';
import { createAccountSuri } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import Passwords2 from '../../newAccount/createAccountFullScreen/components/Passwords2';
import { resetOnForgotPassword } from '../../newAccount/createAccountFullScreen/resetAccounts';

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

export default function ImportRawSeed(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const genesisOptions = useContext(GenesisHashOptionsContext);

  const [isBusy, setIsBusy] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [genesis, setGenesis] = useState('');
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [address, setAddress] = useState('');
  const [type, setType] = useState(DEFAULT_TYPE);
  const [name, setName] = useState<string | null | undefined>();
  const [password, setPassword] = useState<string | null>();

  const chain = useMetadata(account?.genesis, true);

  const showAddress = useMemo(() => !!account?.address, [account]);

  useEffect((): void => {
    setGenesis(genesisOptions[1].value as string); // to set the polkadot as the default selected chain
  }, [genesisOptions]);

  useEffect((): void => {
    setType(
      chain && chain.definition.chainType === 'ethereum'
        ? 'ethereum'
        : DEFAULT_TYPE
    );
  }, [chain]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    if (!seed || !name || !password) {
      setAccount(null);
      setError(undefined);

      return;
    }

    if (!(seed.startsWith('0x') && seed.length === 66)) {
      setAddress('');
      setAccount(null);
      setError(t('The raw seed is invalid. It should be 66 characters long and start with 0x')
      );

      return;
    }

    try {
      const { pair } = keyring.addUri(seed, password, { name }, type);

      const validatedAccount = {
        address: pair.address,
        suri: seed
      };

      setError(undefined);
      setAddress(pair.address);
      setAccount(
        objectSpread<AccountInfo>({}, validatedAccount, { genesis, type })
      );
    } catch (error) {
      setAddress('');
      setAccount(null);
      setError(`${error}`);
    }
  }, [t, genesis, seed, setAccount, type, name, password]);

  const onImport = useCallback(async (): Promise<void> => {
    // this should always be the case
    if (name && password && account) {
      setIsBusy(true);
      await resetOnForgotPassword();

      createAccountSuri(name, password, account.suri, type, account.genesis as HexString)
        .then(() => {
          setStorage('profile', PROFILE_TAGS.LOCAL).catch(console.error);
          openOrFocusTab('/', true);
        })
        .catch((error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [account, name, password, type]);

  const pasteSeed = useCallback(() => {
    navigator.clipboard.readText().then((clipText) => {
      setSeed(clipText);
    }).catch(console.error);
  }, []);

  const onNameChange = useCallback((enteredName: string): void => {
    setName(enteredName ?? null);
  }, []);

  const onPassChange = useCallback((pass: string | null): void => {
    setPassword(pass);
  }, []);

  const onCancel = useCallback(() => window.close(), []);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', position: 'relative', px: '10%' }}>
          <Title
            height='100px'
            logo={
              <VaadinIcon icon='vaadin:book-dollar' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
            }
            text={t('Import from raw seed')}
          />
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t('Enter your account\'s raw seed to seamlessly import it into the extension wallet, giving you quick and secure access to your assets and transactions.')}
          </Typography>
          <Grid container item sx={{ '> div textarea': { height: '55px' }, mt: '20px', position: 'relative' }}>
            <TextAreaWithLabel
              fontSize='18px'
              height='70px'
              isError={!!error}
              isFocused
              label={t('Raw seed starting with 0x')}
              onChange={setSeed}
              rowsCount={1}
              style={{ width: '100%' }}
              value={seed || ''}
            />
            <IconButton
              onClick={pasteSeed}
              sx={{ bottom: '10px', p: 0, position: 'absolute', right: '10px' }}
            >
              <ContentPasteIcon sx={{ color: 'secondary.light', fontSize: '25px' }} />
            </IconButton>
          </Grid>
          {!!error && !!seed &&
            <Grid alignItems='center' container height='35px' pl='15px'>
              <Warning
                className='seedError'
                isBelowInput
                isDanger
                theme={theme}
              >
                {error}
              </Warning>
            </Grid>
          }
          <Collapse in={showAddress}>
            <Grid container item sx={{ mt: '15px' }}>
              <Address
                address={account?.address}
                backgroundColor='background.main'
                className='addr'
                genesisHash={account?.genesis}
                margin='0px'
                name={name}
                showCopy={!!account?.address}
                style={{ width: '100%' }}
              />
            </Grid>
          </Collapse>
          <Grid container sx={{ mt: '15px' }}>
            <InputWithLabel
              isError={name === null || name?.length === 0}
              label={t('Choose a name for this account')}
              onChange={onNameChange}
              value={name ?? ''}
            />
          </Grid>
          <Passwords2
            firstPassStyle={{ marginBlock: '10px' }}
            label={t('Password for this account (more than 5 characters)')}
            onChange={onPassChange}
            onEnter={password && name && !error && !!seed ? onImport : () => null}
          />
          <Grid container item justifyContent='flex-end' mt='50px'>
            <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
              <TwoButtons
                disabled={!password || !name || !address || !account}
                isBusy={isBusy}
                mt='1px'
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onPrimaryClick={onImport}
                onSecondaryClick={onCancel}
                primaryBtnText={t('Import')}
                secondaryBtnText={t('Cancel')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
