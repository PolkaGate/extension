// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, RequestSign } from '@polkadot/extension-base/background/types';
import type { SignerPayloadRaw } from '@polkadot/types/types';

import { Avatar, Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Edit2, Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';

import { Address2 } from '../../../components';
import { useFavIcon, useTranslation } from '../../../hooks';
import { cancelSignRequest } from '../../../messaging';
import { type ModeData, SIGN_POPUP_MODE } from '../types';
import SignWithPassword from './SignWithPassword';

interface Props {
  account: AccountJson;
  error: string | null;
  request: RequestSign;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  signId: string;
  url: string;
}

export default function RawData({ account, error, request, setError, setMode, signId, url }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dapp = new URL(url).origin;
  const faviconUrl = useFavIcon(dapp);

  const { isExternal, isHardware } = account;

  const onCancel = useCallback((): void => {
    if (!signId) {
      return;
    }

    cancelSignRequest(signId)
      .then(() => navigate('/'))
      .catch((error: Error) => console.error(error));
  }, [navigate, signId]);

  useEffect(() => {
    setMode({
      Icon: Edit2,
      title: t('Sign Message'),
      type: SIGN_POPUP_MODE.RAW_DATA
    });
  }, [setMode, t]);

  const { address, data } = request.payload as SignerPayloadRaw;

  const text = useMemo(() =>
    isAscii(data)
      ? u8aToString(u8aUnwrapBytes(data))
      : data
    , [data]);

  return (
    <Grid container display='block' fontSize='16px' height='490px' justifyContent='center' justifyItems='center' position='relative'>
      <Grid alignItems='center' columnGap='5px' container direction='row' item justifyContent='center' sx={{ bgcolor: theme.palette.surface.badge, border: theme.palette.mode === 'dark' ? 'none' : `1px solid ${theme.palette.border.strong}`, borderRadius: '14px', height: '34px', pr: '5px', width: 'fit-content' }}>
        <Avatar
          src={faviconUrl ?? undefined}
          sx={{ borderRadius: '8px !important', height: '26px', width: '26px' }}
          variant='circular'
        />
        <Typography color={theme.palette.text.secondary} variant='B-1'>
          {dapp}
        </Typography>
      </Grid>
      <Grid container item>
        <Address2
          address={address}
          charsCount={4}
          identiconSize={36}
          inTitleCase
          showAddress
          showCopy={false}
          style={{ borderRadius: '14px', height: '55px', mt: '30px', width: '100%' }}
        />
      </Grid>
      <Box sx={{
        background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
        borderRadius: '14px',
        justifySelf: 'center',
        mb: '30px',
        mt: '10px',
        padding: '3.75px',
        position: 'relative',
        width: '100%'
      }}
      >
        <Grid container item justifyContent='center' sx={{ alignItems: 'center', bgcolor: theme.palette.surface.popover, borderRadius: '10px', height: '100%', maxHeight: '65px', minHeight: '50px', overflowWrap: 'anywhere', overflowY: 'auto', px: '10px', py: '5px', textAlign: 'center', width: '100%' }}>
          <Typography color={theme.palette.text.primary} variant='B-1'>
            {text}
          </Typography>
        </Grid>
      </Box>
      {(isHardware || isExternal) && (
        <Stack alignItems='center' columnGap='5px' direction='row' sx={{ p: '15px 8px 0px', width: '100%' }}>
          <Warning2 color={theme.palette.warning.light} size={24} variant='Bold' />
          <Typography sx={{ color: 'text.secondary', width: '100%' }} variant='B-4'>
            {isHardware
              ? t('Raw data signing is not supported for hardware wallets.')
              : t('Raw data signing is not supported for QR wallets.')}
          </Typography>
        </Stack>
      )}
      <SignWithPassword
        address={account.address}
        error={error}
        isSignable={!isHardware && !isExternal}
        onCancel={onCancel}
        setError={setError}
        signId={signId}
      />
    </Grid>
  );
}
