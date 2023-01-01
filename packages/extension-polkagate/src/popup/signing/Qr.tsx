// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { wrapBytes } from '@polkadot/extension-dapp/wrapBytes';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';

import { PButton } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { CMD_MORTAL, CMD_SIGN_MESSAGE } from './Request';

interface Props {
  address: string;
  children?: React.ReactNode;
  className?: string;
  cmd: number;
  genesisHash: string;
  onSignature: ({ signature }: { signature: HexString }) => void;
  payload: ExtrinsicPayload | string;
}

function Qr({ address, className, cmd, genesisHash, onSignature, payload }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);

  const payloadU8a = useMemo(
    () => {
      switch (cmd) {
        case CMD_MORTAL:
          return (payload as ExtrinsicPayload).toU8a();
        case CMD_SIGN_MESSAGE:
          return wrapBytes(payload as string);
        default:
          return null;
      }
    },
    [cmd, payload]
  );

  const _onShowQr = useCallback(
    () => setIsScanning(true),
    []
  );

  if (!payloadU8a) {
    return (
      <div className={className}>
        <div className='qrContainer'>
          Transaction command:{cmd} not supported.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {!isScanning
        ? <Typography fontSize='14px' fontWeight={300} m='5px auto' width='90%'>
          {t<string>('First scan the QR code with your mobile wallet. Then scan the generated QR code on your mobile wallet on the next screen.')}
        </Typography>
        : <Typography fontSize='14px' fontWeight={300} m='5px auto' textAlign='center' width='90%'>
          {t<string>('Scan your mobile wallet generated QR code.')}
        </Typography>
      }
      {isScanning
        ? <Grid sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', borderStyle: 'dashed', m: '10px auto', p: '20px', pb: '15px', width: '92%' }}>
          <QrScanSignature onScan={onSignature} />
        </Grid>
        : (
          <div className='qrContainer'>
            <QrDisplayPayload
              address={address}
              cmd={cmd}
              genesisHash={genesisHash}
              payload={payloadU8a}
            />
          </div>
        )
      }
      {isScanning &&
        <Typography fontSize='14px' fontWeight={300} m='5px auto' textAlign='center' width='90%'>
          {t<string>('Hold the QR code infront of the device’s camera.')}
        </Typography>
      }
      {!isScanning && (
        <PButton
          _onClick={_onShowQr}
          text={t<string>('Next')}
        />
      )}
    </div>
  );
}

export default styled(Qr)`
  height: 100%;

  .qrContainer {
    margin: 15px auto 10px auto;
    width: 80%;
    
    img {
      padding:15px;
      border: white solid 1px;
      border-radius:5px;
    }
  }
`;
