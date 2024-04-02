// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { ActionContext, Checkbox2, InputWithLabel, TwoButtons } from '../../../components';
import { FullScreenHeader } from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen, useTranslation } from '../../../hooks';
import { createAccountSuri, createSeed } from '../../../messaging';
import CopySeedButton from './components/CopySeedButton';
import DownloadSeedButton from './components/DownloadSeedButton';
import Passwords2 from './components/Passwords2';

const MnemonicSeedDisplay = ({ seed, style }: { style?: SxProps<Theme>, seed: null | string }) => {
  const { t } = useTranslation();

  return (
    <Grid container display='block' item sx={style}>
      <Typography fontSize='16px' fontWeight={400}>
        {t<string>('Generated 12-word recovery phrase')}
      </Typography>
      <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', fontSize: '22px', fontWeight: 300, p: '8px 12px' }}>
        {seed}
      </Grid>
      <Grid container item>
        <DownloadSeedButton
          style={{ width: 'fit-content' }}
          value={seed ?? ''}
        />
        <CopySeedButton
          style={{ width: 'fit-content' }}
          value={seed ?? ''}
        />
      </Grid>
    </Grid>
  );
};

function CreateAccount (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [seed, setSeed] = useState<null | string>(null);
  const [name, setName] = useState<string | null | undefined>();
  const [password, setPassword] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false);

  useEffect((): void => {
    createSeed(undefined)
      .then(({ seed }): void => {
        setSeed(seed);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNameChange = useCallback((enteredName: string) => {
    // Remove leading white spaces
    const trimmedName = enteredName.replace(/^\s+/, '');

    // Remove multiple consecutive spaces in the middle or at the end
    const cleanedName = trimmedName.replace(/\s{2,}/g, ' ');

    setName(cleanedName);
  }, []);

  const onPasswordChange = useCallback((enteredPassword: string | null) => {
    setPassword(enteredPassword);
  }, []);

  const onCheck = useCallback(() => {
    setIsMnemonicSaved(!isMnemonicSaved);
  }, [isMnemonicSaved]);

  const onCreate = useCallback(() => {
    // this should always be the case
    if (name && password && seed) {
      setIsBusy(true);

      createAccountSuri(name, password, seed)
        .then(() => onAction('/'))
        .catch((error: Error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [name, onAction, password, seed]);

  const onCancel = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', position: 'relative', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <vaadin-icon icon='vaadin:plus-circle' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Create a new account')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t<string>('In order to create a new account you are given a 12-word recovery phrase which needs to be recorded and saved in a safe place. The recovery phrase can be used to restore your wallet. Keep it carefully to not lose your assets.')}
          </Typography>
          <MnemonicSeedDisplay seed={seed} style={{ marginBlock: '20px' }} />
          <InputWithLabel
            isError={name === null || name?.length === 0}
            isFocused
            label={t<string>('Choose a name for this account')}
            onChange={onNameChange}
            value={name ?? ''}

          />
          <Passwords2
            firstPassStyle={{ marginBlock: '10px' }}
            label={t<string>('Password for this account (more than 5 characters)')}
            onChange={onPasswordChange}
            // eslint-disable-next-line react/jsx-no-bind
            onEnter={isMnemonicSaved && password ? onCreate : () => null}
          />
          <Grid alignItems='center' container item pt='25px'>
            <Checkbox2
              checked={isMnemonicSaved}
              iconStyle={{ transform: 'scale(1.13)' }}
              label={t<string>('I have saved my recovery phrase safely.')}
              labelStyle={{ fontSize: '18px', fontWeight: 300, marginLeft: '7px', userSelect: 'none' }}
              onChange={onCheck}
            />
          </Grid>
          <Grid container item justifyContent='flex-end' pt='5px'>
            <Grid container item sx={{ '> div': { width: '100%' } }} xs={7}>
              <TwoButtons
                disabled={!(name && password && seed && isMnemonicSaved)}
                isBusy={isBusy}
                mt='15px'
                onPrimaryClick={onCreate}
                onSecondaryClick={onCancel}
                primaryBtnText={t<string>('Create account')}
                secondaryBtnText={t<string>('Cancel')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(CreateAccount);
