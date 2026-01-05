// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser, ExtensionPopupOpener } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';

import Receive from '../../accountDetails/rightColumn/Receive';
import AccountListModal from '../AccountListModal';

interface Props {
  closePopup: ExtensionPopupCloser;
  openPopup: ExtensionPopupOpener;
}

function ReceiveGeneral ({ closePopup, openPopup }: Props): React.ReactElement {
  const [address, setAddress] = useState<string | null | undefined>();

  const onClose = useCallback(() => {
    closePopup();
    setAddress(undefined);
  }, [closePopup]);

  const onApply = useCallback(() => {
    setTimeout(() => {
      openPopup(ExtensionPopups.RECEIVE)();
    }, 50);
  }, [openPopup]);

  return (
    <Grid alignContent='start' container item sx={{ height: '760px', position: 'relative', width: '196px' }}>
      <AccountListModal
        handleClose={onClose}
        isSelectedAccountApplicable
        onApply={onApply}
        open={!address}
        setAddress={setAddress}
      />
      {address &&
        <Receive
          address={address}
          closePopup={closePopup}
          setAddress={setAddress}
        />
      }
    </Grid>
  );
}

export default React.memo(ReceiveGeneral);
