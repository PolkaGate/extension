// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { ActionContext, ButtonWithCancel, Checkbox2 as Checkbox, NewAddress, Password, Warning, WrongPasswordAlert } from '../../components';
import { useTranslation } from '../../hooks';
import { forgetAccount } from '../../messaging';
import { DraggableModal } from '../../fullscreen/governance/components/DraggableModal';

interface Props {
  account: AccountJson;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function ForgetAccountModal({ account, setDisplayPopup }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [checkConfirmed, setCheckConfirmed] = useState<boolean>(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const theme = useTheme();
  const needsPasswordConfirmation = !account.isExternal;

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const backToAccount = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);

  const onForget = useCallback((): void => {
    try {
      setIsBusy(true);

      if (needsPasswordConfirmation) {
        const signer = keyring.getPair(account.address);

        signer.unlock(password);
      }

      forgetAccount(account.address)
        .then(() => {
          setIsBusy(false);
          backToAccount();
          onAction('/');
        })
        .catch((error: Error) => {
          setIsBusy(false);
          console.error(error);
        });
    } catch (e) {
      setIsPasswordError(true);
      setIsBusy(false);
    }
  }, [account.address, backToAccount, needsPasswordConfirmation, onAction, password]);

  const onChangePass = useCallback((pass: string): void => {
    setPassword(pass);
    setIsPasswordError(false);
  }, []);

  const toggleConfirm = useCallback(() => setCheckConfirmed(!checkConfirmed), [checkConfirmed]);

  return (
    <DraggableModal onClose={backToAccount} open>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t<string>('Forget Account')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={backToAccount} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <NewAddress
          address={account.address}
          style={{ my: '25px' }}
        />
        <Grid alignItems='center' container height='45px' m='auto' width='88%'>
          <Warning
            iconDanger
            marginTop={0}
            theme={theme}
          >
            {t('Removing this account means losing access via this extension. To recover it later, use the recovery phrase.')}
          </Warning>
        </Grid>
        <Grid container item sx={{ bottom: '75px', position: 'absolute' }}>
          {needsPasswordConfirmation
            ? <>
              <Password
                isError={isPasswordError}
                isFocused
                label={t<string>('Password for this account')}
                onChange={onChangePass}
                onEnter={onForget}
                style={{ width: '87.5%' }}
              />
            </>
            : (
              <Checkbox
                checked={checkConfirmed}
                iconStyle={{ transform: 'scale:(1.13)' }}
                label={t<string>('I want to forget this account.')}
                labelStyle={{ fontSize: '16px', marginLeft: '7px' }}
                onChange={toggleConfirm}
                style={{ ml: '5px' }}
              />)
          }
        </Grid>
        <Grid container item sx={{ '> div': { ml: 'auto', width: '87.5%' }, bottom: 0, height: '36px', position: 'absolute' }}>
          <ButtonWithCancel
            _isBusy={isBusy}
            _onClick={onForget}
            _onClickCancel={backToAccount}
            disabled={!checkConfirmed && !password?.length}
            text={t<string>('Forget')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
