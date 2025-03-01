// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import semver from 'semver';

import { ActionContext, PButton, Popup } from '../../components';
import { useManifest } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { HeaderBrand } from '../../partials';
import { EXTENSION_NAME } from '../../util/constants';
import { type News, news } from './news';

interface Props {
  show: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WhatsNew({ setShowAlert, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const onAction = useContext(ActionContext);
  const manifest = useManifest();

  const [localNews, setLocalNews] = useState<News[]>([]);

  useEffect(() => {
    try {
      const usingVersion = window.localStorage.getItem('using_version');

      if (!usingVersion) {
        return;
      }

      const filteredNews = news.filter(({ version }) => semver.lt(usingVersion, version));

      setLocalNews([...filteredNews]);
    } catch (error) {
      console.error('Error while checking version:', error);
    }
  }, []);

  const onClose = useCallback(() => {
    window.localStorage.setItem('using_version', manifest?.version || '0.1.0');
    setShowAlert(false);
    onAction('/');
  }, [onAction, setShowAlert, manifest?.version]);

  useEffect(() => {
    if (manifest && localNews?.length === 0) {
      onClose();
    }
  }, [manifest, localNews, onClose]);

  const onDismiss = useCallback((_version: string) => {
    const index = localNews.findIndex(({ version }) => version === _version);

    localNews.splice(index, 1);

    setLocalNews([...localNews]);
  }, [localNews]);

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
        <Grid container item justifyContent='center' pb='20px' pt='30px'>
          <Typography fontSize='22px' fontWeight={400}>
            {t('What\'s New 🚀')}
          </Typography>
        </Grid>
        <Grid container item justifyContent='center' sx={{ height: '440px', overflow: 'scroll' }}>
          {localNews.map(({ notes, version }) =>
          (<Grid alignContent='flex-start' container item key={version} sx={{ backgroundColor: 'background.paper', borderColor: 'secondary.light', borderTop: 1, p: '10px' }}>
            <Grid container item justifyContent='center'>
              <Typography fontSize='14px'>
                {t('Version {{version}}', { replace: { version } })}
              </Typography>
            </Grid>
            <UL
              notes={notes}
            />
            <PButton
              _ml={0}
              _mt='10px'
              // eslint-disable-next-line react/jsx-no-bind
              _onClick={() => onDismiss(version)}
              _width={100}
              text={t('Dismiss')}
            />
          </Grid>
          ))}
          {!!localNews?.length && localNews.length > 1 &&
            <PButton
              _ml={0}
              _mt='10px'
              _onClick={onClose}
              _variant='outlined'
              _width={100}
              text={t('Dismiss All')}
            />}
        </Grid>
      </Grid>
    </Popup>
  );
}
