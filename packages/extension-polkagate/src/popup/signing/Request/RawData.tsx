// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, RequestSign } from '@polkadot/extension-base/background/types';
import type { SignerPayloadRaw } from '@polkadot/types/types';

import { Avatar, Box, Grid, Typography, useTheme } from '@mui/material';
import { Edit2 } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';

import { ActionContext, Address2, Warning } from '../../../components';
import { useFavIcon, useTranslation } from '../../../hooks';
import { cancelSignRequest } from '../../../messaging';
import { type ModeData, SIGN_POPUP_MODE } from '../types';
import SignWithPassword from './SignWithPassword';

interface Props {
  account: AccountJson;
  error: string | null;
  isFirst: boolean;
  request: RequestSign;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  signId: string;
  url: string;
}

export default function RawData ({ account, error, isFirst, request, setError, setMode, signId, url }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const dapp = new URL(url).origin;
  const faviconUrl = useFavIcon(dapp);

  const { isExternal, isHardware } = account;

  const onCancel = useCallback((): void => {
    if (!signId) {
      return;
    }

    cancelSignRequest(signId)
      .then(() => onAction('/'))
      .catch((error: Error) => console.error(error));
  }, [onAction, signId]);

  useEffect(() => {
    setMode({
      Icon: Edit2,
      title: t('Sign Message'),
      type: SIGN_POPUP_MODE.RAW_DATA
    });
  }, [setMode, t]);

  const { address, data } = request.payload as SignerPayloadRaw;

  const text = useMemo(() => isAscii(data)
    ? u8aToString(u8aUnwrapBytes(data))
    : data
    , [data]);

  return (
    <Grid container display='block' fontSize='16px' height='440px' justifyContent='center' justifyItems='center'>
      <Grid alignItems='center' columnGap='5px' container direction='row' item justifyContent='center' sx={{ bgcolor: '#05091C80', borderRadius: '14px', height: '34px', pr: '5px', width: 'fit-content' }}>
        <Avatar
          src={faviconUrl ?? undefined}
          sx={{ borderRadius: '8px !important', height: '26px', width: '26px' }}
          variant='circular'
        />
        <Typography color='#BEAAD8' variant='B-1'>
          {dapp}
        </Typography>
      </Grid>
      <Grid container item >
        <Address2
          address={address}
          charsCount={4}
          identiconSize={36}
          inTitleCase
          showAddress
          showCopy={false}
          style={{ bgcolor: '#05091C', borderRadius: '14px', height: '55px', mt: '30px', width: '100%' }}
        />
      </Grid>
      <Box sx={{
        background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
        borderRadius: '14px',
        justifySelf: 'center',
        mt: '10px',
        mb: '30px',
        padding: '3.75px',
        position: 'relative',
        width: '100%'
      }}
      >
        <Grid container justifyContent='center' item sx={{ bgcolor: '#1B133C', borderRadius: '10px', height: '100%', px: '10px', py: '5px', width: '100%', maxHeight: '65px', overflowY: 'scroll', minHeight: '50px', textAlign: 'center' }}>
          <Typography color='#EAEBF1' variant='B-1'>
            {text}
          </Typography>
        </Grid>
      </Box>
      {(isHardware || isExternal) && (
        <>
          <Warning theme={theme}>{
            isHardware
              ? t('Raw data signing is not supported for hardware wallets.')
              : t('Raw data signing is not supported for QR wallets.')
          }</Warning>
        </>
      )}
      <SignWithPassword
        address={account.address}
        error={error}
        isFirst={isFirst}
        isSignable={!isHardware && !isExternal}
        onCancel={onCancel}
        setError={setError}
        signId={signId}
      />
    </Grid>
  )
}
