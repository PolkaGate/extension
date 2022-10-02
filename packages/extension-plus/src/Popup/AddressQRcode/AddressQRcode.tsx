// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/** NOTE this component illustrates a QRCode for an address which is very handy while want receiving some funds */
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Grid } from '@mui/material';
import QRCode from 'qrcode.react';
import React, { Dispatch, SetStateAction, useCallback } from 'react';

import Identicon from '@polkadot/react-identicon';

import { Chain } from '../../../../extension-chains/src/types';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { PlusHeader } from '../../components';
import Popup from '../../components/Popup';

interface Props {
  address: string;
  chain?: Chain | null;
  name: string;
  showQRcodeModalOpen: boolean;
  setQRcodeModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AddressQRcode({ address, chain, name, setQRcodeModalOpen, showQRcodeModalOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const handleQRmodalClose = useCallback((): void => { setQRcodeModalOpen(false); },
    [setQRcodeModalOpen]);

  return (
    <Popup handleClose={handleQRmodalClose} showModal={showQRcodeModalOpen}>
      <PlusHeader action={handleQRmodalClose} chain={chain} closeText={'Close'} icon={<QrCodeScannerIcon fontSize='small' />} title={'Scan with camera'} />

      <Grid id='name' item sx={{ fontSize: 18, fontWeight: 'fontWeightBold', padding: '40px 20px 20px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} xs={12}>
        {name || t('unknown')}
      </Grid>

      <Grid item sx={{ textAlign: 'center' }} xs={12}>
        <QRCode level='H' size={300} value={address} />
      </Grid>

      <Grid alignItems='center' container justifyContent='center' spacing={1} sx={{ padding: '30px 50px' }}>
        <Grid item>
          <Identicon
            prefix={chain?.ss58Format ?? 42}
            size={24}
            theme={chain?.icon || 'polkadot'}
            value={address}
          />
        </Grid>
        <Grid id='address' item sx={{ fontSize: 14, paddingTop: '25px', textAlign: 'center' }}>
          {address}
        </Grid>
      </Grid>
    </Popup>
  );
}
