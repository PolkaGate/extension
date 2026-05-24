// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { GenericExtrinsicPayload } from '@polkadot/types/extrinsic';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useTheme } from '@mui/material';
import { ScanBarcode } from 'iconsax-react';
import React from 'react';

import { useTranslation } from '../hooks';
import { SharePopup } from '../partials';
import Qr from '../popup/signing/Request/Qr';
import { CMD_MORTAL } from '../popup/signing/types';

export interface SignUsingQRProps {
  handleClose: () => void;
  openMenu: boolean;
  onSignature: ({ signature }: { signature: HexString; }) => void;
  payload: GenericExtrinsicPayload | undefined;
  signerPayload: SignerPayloadJSON | undefined;
}

export const SignUsingQR = ({ handleClose, onSignature, openMenu, payload, signerPayload }: SignUsingQRProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SharePopup
      modalProps={{
        dividerStyle: { margin: '5px 0 0' }
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open={openMenu}
      popupProps={{
        TitleIcon: ScanBarcode,
        iconColor: theme.palette.text.highlight,
        iconSize: 25,
        maxHeight: '450px',
        withoutTopBorder: true
      }}
      title={t('Sign with QR-Code')}
    >
      {/* darkBackground */}
      <Qr
        address={signerPayload?.address ?? ''}
        cmd={CMD_MORTAL}
        genesisHash={signerPayload?.genesisHash ?? ''}
        onSignature={onSignature}
        payload={payload as ExtrinsicPayload}
      />
    </SharePopup>
  );
};
