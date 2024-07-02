// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, PButton, Popup } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { HeaderBrand } from '../../partials';
import { EXTENSION_NAME, NEW_VERSION_ALERT } from '../../util/constants';

interface Props {
  show: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Alert({ setShowAlert, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const onClose = useCallback(() => {
    window.localStorage.setItem('inUse_version', NEW_VERSION_ALERT);
    setShowAlert(false);
    onAction('/');
  }, [onAction, setShowAlert]);

  const UL = ({ notes }: { notes: string[] }) => {
    return (
      <Grid container direction='column' py='15px'>
        <Grid container item>
          <ul style={{ margin: 0, paddingLeft: '25px' }}>
            {notes.map((note, index) => {
              const splitted = note.split(':');

              return (
                <li key={index} style={{ color: `${theme.palette.secondary.light}`, paddingBottom: '5px', paddingTop: '5px' }}>
                  <Typography color='text.primary' fontSize='14px' fontWeight={400} textAlign='left'>
                    <b>{splitted[0]}:</b>  {splitted[1]}
                  </Typography>
                </li>
              );
            }
            )}
          </ul>
        </Grid>
      </Grid>
    );
  };

  return (
    <Popup show={show}>
      <HeaderBrand
        backgroundDefault
        onClose={onClose}
        showBrand
        showClose
        text={EXTENSION_NAME}
      />
      <Grid container direction='column' px='15px'>
        <Grid container item justifyContent='center' pb='20px' pt='40px'>
          <Typography fontSize='22px' fontWeight={400}>
            {t('Important Updates 🚀')}
          </Typography>
        </Grid>
        <Grid container item sx={{ backgroundColor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', p: '10px' }}>
          <UL
            notes={[
              'Paseo Support: The Paseo testnet and its asset hub are now accessible through the wallet.',
              'Multiple Profile Accounts: An account can now be added to multiple profiles, allowing for better organization of accounts.',
              'Bug Fixes and Performance Improvements: This update enhances performance and provides a more streamlined user experience by fixing known issues.'
            ]}
          />
        </Grid>
      </Grid>
      <PButton _onClick={onClose} text={t('Close')} />
    </Popup>
  );
}
