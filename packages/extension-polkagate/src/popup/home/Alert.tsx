// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import CircleIcon from '@mui/icons-material/Circle';
import { Grid, useTheme, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, Header, PButton, Popup, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { NEW_VERSION_ALERT } from '../../util/constants';

interface Props {
  show: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function Alert({ setShowAlert, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const goHome = useCallback(() => {
    window.localStorage.setItem(NEW_VERSION_ALERT, 'ok');
    setShowAlert(false);
    onAction('/');
  }, [onAction, setShowAlert]);

  // const Item = ({ text }: { text: string }) => (
  //   <Grid container justifyContent='center' sx={{ mt: '10px' }}>
  //     <Grid item sx={{ textAlign: 'left' }} xs={1}>
  //       <CircleIcon sx={{ fontSize: '16px', mr: '10px', mt: '5px' }} />
  //     </Grid>
  //     <Grid item sx={{ textAlign: 'left' }} xs={11}>
  //       {text}
  //     </Grid>
  //   </Grid>
  // );

  const UL = ({ notes, title }: { title: string, notes: string[] }) => {
    return (
      <Grid container direction='column' pt='15px'>
        <Grid container item>
          <Typography fontSize='16px' fontWeight={500}>
            {title}
          </Typography>
        </Grid>
        <Grid container item>
          <ul style={{ margin: 0, paddingLeft: '25px' }}>
            {notes.map((note, index) => (
              <li key={index} style={{ paddingTop: '10px' }}>
                <Typography fontSize='14px' fontWeight={400} textAlign='left'>
                  {note}
                </Typography>
              </li>
            ))}
          </ul>
        </Grid>
      </Grid>
    );
  };

  return (
    <Popup show={show}>
      <Header onClose={goHome} text={t<string>('Polkagate')} />
      {/* <Grid alignItems='center' container height='120px' justifyContent='center'>
        <Warning fontWeight={400} isBelowInput theme={theme}>
          <Grid item sx={{ fontSize: 19, pb: '20px' }} xs={12}>
            The latest in this release:
          </Grid>
        </Warning>
      </Grid>
      <Grid container justifyContent='center' sx={{ mt: '20px', px: '20px' }}>
        <Item
          text={'The testnet is disabled by default. However, It can enabled through the main menu/settings by selecting "Enable testnet chain".'}
        />
        <Item
          text={'"Lucky Friday" has been added to both the Kusama and Polkadot networks as an endpoint.'}
        />
        <Item
          text={'Known issues have been fixed.'}
        />
      </Grid> */}
      <Grid container direction='column' px='15px'>
        <Grid container item justifyContent='center' py='50px'>
          <Typography fontSize='22px' fontWeight={700} pt='45px'>
            {t<string>('PolkaGate Updated!')}
          </Typography>
        </Grid>
        <Grid container item>
          <UL
            notes={[
              t<string>('The testnet is disabled by default. However, It can enabled through the main menu/settings by selecting "Enable testnet chain".'),
              t<string>('"Lucky Friday" has been added to both the Kusama and Polkadot networks as an endpoint.'),
              t<string>('Known issues have been fixed.'),
            ]}
            title={t<string>('The latest in this release:')}
          />
        </Grid>
      </Grid>
      <PButton _onClick={goHome} text={t<string>('Ok')} />
    </Popup>
  );
}
