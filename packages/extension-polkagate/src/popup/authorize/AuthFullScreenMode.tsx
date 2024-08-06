// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Avatar, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext, AccountsTable, ActionContext, AuthorizeReqContext, TwoButtons, VaadinIcon, Warning } from '../../components';
import { FullScreenHeader } from '../../fullscreen/governance/FullScreenHeader';
import { useFavIcon, useFullscreen, useTranslation } from '../../hooks';
import { approveAuthRequest, rejectAuthRequest } from '../../messaging';
import { areArraysEqual, extractBaseUrl } from '../../util/utils';

function AuthFullScreenMode (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const requests = useContext(AuthorizeReqContext);
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);

  const [requestIndex, setRequestIndex] = useState<number>(0);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const faviconUrl = useFavIcon(requests[requestIndex].url);

  const allAccounts = useMemo(() => accounts.map(({ address }) => address), [accounts]);
  const areAllCheck = useMemo(() => areArraysEqual([allAccounts, selectedAccounts]), [allAccounts, selectedAccounts]);

  const onApprove = useCallback((): void => {
    approveAuthRequest(selectedAccounts, requests[requestIndex].id)
      .then(() => onAction())
      .catch((error: Error) => console.error(error));
  }, [onAction, requestIndex, requests, selectedAccounts]);

  const onReject = useCallback((): void => {
    rejectAuthRequest(requests[requestIndex].id)
      .then(() => onAction())
      .catch((error: Error) => console.error(error));
  }, [onAction, requestIndex, requests]);

  const onLeftArrow = useCallback(() => {
    if (requestIndex > 0 && requestIndex <= requests.length - 1) {
      setRequestIndex((requestIndex) => requestIndex - 1);
    }
  }, [requestIndex, requests.length]);

  const onRightArrow = useCallback(() => {
    if (requestIndex >= 0 && requestIndex < requests.length - 1) {
      setRequestIndex((requestIndex) => requestIndex + 1);
    }
  }, [requestIndex, requests.length]);

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
              <VaadinIcon icon='vaadin:plug' style={{ color: `${theme.palette.text.primary}`, height: '40px', width: '40px' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t('Authentication Request')}
              </Typography>
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '5px', columnGap: '10px', m: '30px auto', p: '20px 10px', position: 'relative' }}>
            {requests.length > 1 &&
              <>
                <IconButton
                  disabled={requestIndex === 0}
                  onClick={onLeftArrow}
                  sx={{ left: '10px', p: 0, position: 'absolute', top: '30%' }}
                >
                  <KeyboardDoubleArrowLeftIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
                </IconButton>
                <IconButton
                  disabled={requestIndex === requests.length - 1}
                  onClick={onRightArrow}
                  sx={{ p: 0, position: 'absolute', right: '10px', top: '30%' }}
                >
                  <KeyboardDoubleArrowRightIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
                </IconButton>
              </>
            }
            <Avatar
              src={faviconUrl ?? undefined}
              sx={{ borderRadius: '50%', height: '30px', width: '30px' }}
              variant='circular'
            />
            <span style={{ fontSize: '15px', fontWeight: 400, overflowWrap: 'anywhere' }}>
              {extractBaseUrl(requests[requestIndex].url)}
            </span>
          </Grid>
          <Grid container item sx={{ '>div': { marginBottom: '15px', marginTop: '10px' } }}>
            <Warning theme={theme}>
              <span style={{ fontSize: '14px', fontWeight: 400, overflowWrap: 'anywhere' }}>
                {t('The application is requesting access to your accounts. Please select the accounts you wish to connect.')}
              </span>
            </Warning>
          </Grid>
          <AccountsTable
            areAllCheck={areAllCheck}
            maxHeight='250px'
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
            style={{ my: '20px' }}
          />
          <Grid container item sx={{ '>div': { margin: '10px auto 15px' } }}>
            <Warning theme={theme}>
              <Typography fontSize='14px' fontWeight={400}>
                {t('only approve this request if you trust the application. Approving gives the application access to the addresses of your accounts.')}
              </Typography>
            </Warning>
          </Grid>
          <Grid container item justifyContent='flex-end' pt='5px'>
            <Grid container item sx={{ '> div': { width: '100%' } }} xs={7}>
              <TwoButtons
                mt='15px'
                onPrimaryClick={onApprove}
                onSecondaryClick={onReject}
                primaryBtnText={t('Allow')}
                secondaryBtnText={t('Reject')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(AuthFullScreenMode);
