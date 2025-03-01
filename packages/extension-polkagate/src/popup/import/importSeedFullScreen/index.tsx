// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';
import type { HexString } from '@polkadot/util/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { Collapse, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import { objectSpread } from '@polkadot/util';

import { Address, GenesisHashOptionsContext, InputWithLabel, SelectChain, TextAreaWithLabel, TwoButtons, VaadinIcon, Warning } from '../../../components';
import FullScreenHeader from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen, useMetadata, useTranslation } from '../../../hooks';
import { createAccountSuri, getMetadata, validateSeed } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import getLogo from '../../../util/getLogo';
import Passwords2 from '../../newAccount/createAccountFullScreen/components/Passwords2';
import { resetOnForgotPassword } from '../../newAccount/createAccountFullScreen/resetAccounts';

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

export default function ImportSeed(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const genesisOptions = useContext(GenesisHashOptionsContext);

  const [isBusy, setIsBusy] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [genesis, setGenesis] = useState('');
  const [newChain, setNewChain] = useState<Chain | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [address, setAddress] = useState('');
  const [type, setType] = useState(DEFAULT_TYPE);
  const [path, setPath] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [name, setName] = useState<string | null | undefined>();
  const [password, setPassword] = useState<string | null>();

  const chain = useMetadata(account?.genesis, true);

  const showAddress = useMemo(() => !!(account?.address), [account]);

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
    if (!seed) {
      setAccount(null);
      setError(undefined);

      return;
    }

    const suri = `${seed || ''}${path || ''}`;

    validateSeed(suri, type)
      .then((validatedAccount) => {
        setError(undefined);
        setAddress(validatedAccount.address);
        setAccount(
          objectSpread<AccountInfo>({}, validatedAccount, { genesis, type })
        );
      })
      .catch(() => {
        setAddress('');
        setAccount(null);
        setError(path
          ? t<string>('Invalid recovery phrase or derivation path')
          : t<string>('Invalid recovery phrase')
        );
      });
  }, [t, genesis, seed, path, setAccount, type]);

  useEffect(() => {
    genesis && getMetadata(genesis, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesis]);

  const onCreate = useCallback(async (): Promise<void> => {
    // this should always be the case
    if (name && password && account) {
      setIsBusy(true);
      await resetOnForgotPassword();

      createAccountSuri(name, password, account.suri, type, account.genesis as HexString | undefined)
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

  const onChangeNetwork = useCallback((newGenesisHash: string) => setGenesis(newGenesisHash), []);

  const onNameChange = useCallback((enteredName: string): void => {
    setName(enteredName ?? null);
  }, []);

  const onPassChange = useCallback((pass: string | null): void => {
    setPassword(pass);
  }, []);

  const onCancel = useCallback(() => window.close(), []);
  const toggleMore = useCallback(() => setShowMore(!showMore), [showMore]);

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
              <VaadinIcon icon='vaadin:book' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
            }
            text={t('Import from recovery phrase')}
          />
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t<string>('Enter your account\'s recovery phrase (mnemonic seed) to seamlessly import it into the extension wallet, giving you quick and secure access to your assets and transactions.')}
          </Typography>
          <Grid container item sx={{ '> div textarea': { height: '55px' }, mt: '20px', position: 'relative' }}>
            <TextAreaWithLabel
              fontSize='18px'
              height='70px'
              isError={!!error}
              isFocused
              label={t<string>('Existing 12 or 24-word recovery phrase')}
              onChange={setSeed}
              rowsCount={2}
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
              label={t<string>('Choose a name for this account')}
              onChange={onNameChange}
              value={name ?? ''}
            />
          </Grid>
          <Passwords2
            firstPassStyle={{ marginBlock: '10px' }}
            label={t<string>('Password for this account (more than 5 characters)')}
            onChange={onPassChange}
            onEnter={password && name && !error && !!seed ? onCreate : () => null}
          />
          <Grid alignItems='flex-end' container item justifyContent='flex-start' onClick={toggleMore}>
            <Typography pt='20px' sx={{ color: 'secondary.light', cursor: 'pointer', textDecoration: 'underline', userSelect: 'none' }}>
              {t('More ...')}
            </Typography>
            <ArrowForwardIosIcon sx={{ color: 'secondary.light', cursor: 'pointer', fontSize: 17, ml: '5px', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showMore ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
          </Grid>
          <Collapse in={showMore}>
            <Grid container item justifyContent='space-between' mb='25px' mt='10px'>
              <Grid container item width='49%'>
                <InputWithLabel
                  isError={!!path && !!error}
                  label={t<string>('Derived path (ignore if the account is not derived)')}
                  onChange={setPath}
                  value={path || ''}
                />
              </Grid>
              <SelectChain
                address={address}
                defaultValue={newChain?.genesisHash || genesisOptions[0].text}
                icon={getLogo(newChain ?? undefined)}
                label={t<string>('Select the chain')}
                onChange={onChangeNetwork}
                options={genesisOptions}
                style={{ p: 0, width: '49%' }}
              />
            </Grid>
          </Collapse>
          <Grid container item justifyContent='flex-end' py='10px'>
            <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
              <TwoButtons
                disabled={!password || !name || !address || !account}
                isBusy={isBusy}
                mt='1px'
                onPrimaryClick={onCreate}
                onSecondaryClick={onCancel}
                primaryBtnText={t<string>('Import')}
                secondaryBtnText={t<string>('Cancel')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
