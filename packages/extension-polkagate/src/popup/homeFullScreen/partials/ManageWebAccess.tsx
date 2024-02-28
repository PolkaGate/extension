// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { AuthUrlInfo, AuthUrls } from '@polkadot/extension-base/background/handlers/State';

import { InputFilter, Label, PButton } from '../../../components/';
import { useTranslation } from '../../../hooks';
import { getAuthList, removeAuthorization, toggleAuthorization } from '../../../messaging';
import WebsiteEntry from '../../authManagement/WebsiteEntry';
import { DraggableModal } from '../../governance/components/DraggableModal';

interface Props {
  open: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ManageWebAccess ({ open, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [authList, setAuthList] = useState<AuthUrls | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getAuthList()
      .then(({ list }) => setAuthList(list))
      .catch((e) => console.error(e));
  }, []);

  const _onChangeFilter = useCallback((filter: string) => {
    setFilter(filter);
  }, []);

  const toggleAuth = useCallback((url: string) => {
    toggleAuthorization(url)
      .then(({ list }) => setAuthList(list))
      .catch(console.error);
  }, []);

  const removeAuth = useCallback((url: string) => {
    removeAuthorization(url)
      .then(({ list }) => setAuthList(list))
      .catch(console.error);
  }, []);

  const backToAccount = useCallback(() => setDisplayPopup(false), [setDisplayPopup]);

  return (
    <DraggableModal onClose={backToAccount} open={open}>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid alignItems='flex-start' container justifyContent='flex-start' sx={{ width: 'fit-content' }}>
            <Grid item>
              <vaadin-icon icon='vaadin:lines-list' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            </Grid>
            <Grid item sx={{ pl: '10px' }}>
              <Typography fontSize='22px' fontWeight={700}>
                {t('Manage Website Access')}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <CloseIcon onClick={backToAccount} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Typography fontSize='16px' m='25px auto' textAlign='left' width='90%'>
          {t<string>('Allow or deny website(s) to request access to the extension\'s visible accounts')}
        </Typography>
        <Grid item position='relative' px='15px'>
          <InputFilter
            label={t<string>('Search')}
            onChange={_onChangeFilter}
            placeholder={'www.example.com'}
            theme={theme}
            value={filter}
            withReset
          />
        </Grid>
        <Label
          label={t('Websites')}
          style={{
            margin: '20px auto 0',
            width: '92%'
          }}
        >
          <Grid container direction='column' justifyContent='center' minHeight='38px' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', fontSize: '12px', fontWeight: '400', maxHeight: window.innerHeight - 320 }}>
            {!authList || !Object.entries(authList)?.length
              ? <Grid alignItems='center' container item pl='10px' textAlign='left'>
                {t<string>('No website request yet!')}
              </Grid>
              : <Grid container item sx={{ overflow: 'scroll' }}>
                {Object.entries(authList)
                  .filter(([url]: [string, AuthUrlInfo]) => url.includes(filter))
                  .map(
                    ([url, info]: [string, AuthUrlInfo]) =>
                      <WebsiteEntry
                        info={info}
                        key={url}
                        removeAuth={removeAuth}
                        toggleAuth={toggleAuth}
                        url={url}
                      />
                  )}
              </Grid>
            }
          </Grid>
        </Label>
        <Grid item>
          <PButton
            _ml={0}
            _mt='20px'
            _onClick={backToAccount}
            text={t('Close')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
