// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';

import Receive from '../../accountDetails/rightColumn/Receive';
import AccountListModal from '../AccountListModal';

interface Props {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function ReceiveGeneral ({ setOpen }: Props): React.ReactElement {
  const [address, setAddress] = useState<string | null | undefined>();
  const [openReceive, setOpenReceive] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  const onClose = useCallback(() => {
    setOpen(false);
    setAddress(undefined);
  }, [setOpen]);

  const onApply = useCallback(() => {
    setTimeout(() => {
      setOpenReceive(ExtensionPopups.RECEIVE);
    }, 50);
  }, []);

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
          onClose={onClose}
          open={openReceive === ExtensionPopups.RECEIVE}
          setOpen={setOpenReceive}
        />
      }
    </Grid>
  );
}

export default React.memo(ReceiveGeneral);
