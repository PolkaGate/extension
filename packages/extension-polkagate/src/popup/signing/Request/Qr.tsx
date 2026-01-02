// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { Box, Container, Grid, Typography } from '@mui/material';
import { Mobile } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import { wrapBytes } from '@polkadot/extension-dapp/wrapBytes';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';

import { DecisionButtons, GradientButton, NeonButton } from '../../../components';
import useTranslation from '../../../hooks/useTranslation';
import { CMD_MORTAL, CMD_SIGN_MESSAGE } from '../types';

export interface Props {
  address: string | undefined;
  cmd: number;
  genesisHash: string;
  onSignature: ({ signature }: { signature: HexString }) => void;
  payload: ExtrinsicPayload | string;
  onCancel?: () => void;
}

function Qr ({ address, cmd, genesisHash, onCancel, onSignature, payload }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);

  const payloadU8a = useMemo(() => {
    switch (cmd) {
      case CMD_MORTAL:
        return (payload as ExtrinsicPayload).toU8a();
      case CMD_SIGN_MESSAGE:
        return wrapBytes(payload as string);
      default:
        return null;
    }
  }, [cmd, payload]);

  const onClick = useCallback(() => setIsScanning(!isScanning), [isScanning]);

  if (!payloadU8a) {
    return (
      <div>
        <div className='qrContainer'>
          Transaction command:{cmd} not supported.
        </div>
      </div>
    );
  }

  return (
    <Container disableGutters sx={{ mb: '10px', position: 'relative', width: '100%', zIndex: 1 }}>
      <Typography color='#BEAAD8' display='flex' justifySelf='center' my='5px' variant='B-4'>
        {!isScanning
          ? <> {t('First scan the QR code with your mobile wallet. Then scan the generated QR code by your mobile wallet on the next screen')}</>
          : <> {t('Scan your mobile wallet generated QR code')}</>
        }
      </Typography>
      {isScanning &&
        <Grid alignItems='center' container direction='row' item justifyContent='center'>
          <Typography color='#EAEBF1' variant='B-2'>
            {t('Hold the QR code in front of the')}
          </Typography>
          <Mobile color='#AA83DC' size={16} style={{ marginLeft: '4px' }} variant='Bold' />
          <Typography color='#AA83DC' variant='B-2'>
            {t('device’s camera')}
          </Typography>
        </Grid>
      }
      <Box
        sx={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '14px',
          justifySelf: 'center',
          my: '25px',
          padding: '3.75px',
          position: 'relative',
          width: '85%'
        }}
      >
        <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '10px', height: '100%', padding: '1px', width: '100%' }}>
          <div className='qrContainer'>
            {isScanning
              ? <QrScanSignature onScan={onSignature} style={{ height: '265px' }} />
              : address && (
                <QrDisplayPayload
                  address={address}
                  cmd={cmd}
                  genesisHash={genesisHash}
                  payload={payloadU8a}
                  style={{ backgroundColor: '#fff', borderRadius: '8px', height: '258px', margin: '5px', overflow: 'clip', padding: '15px' }}
                />)}
          </div>
        </Grid>
      </Box>
      {isScanning
        ? <NeonButton
          contentPlacement='center'
          onClick={onClick}
          style={{ height: '44px', width: '100%' }}
          text={t('Back')}
          />
        : onCancel
          ? <DecisionButtons
            direction='vertical'
            onPrimaryClick={onClick}
            onSecondaryClick={onCancel}
            primaryBtnText={t('Next')}
            secondaryBtnText={t('Cancel')}
            />
          : <GradientButton
            onClick={onClick}
            text={t('Next')}
            />
      }
    </Container>
  );
}

export default React.memo(Qr);
