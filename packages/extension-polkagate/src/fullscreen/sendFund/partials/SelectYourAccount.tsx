// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExpandMore } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Identity2 } from '../../../components';
import { useTranslation } from '../../../hooks';
import AccountListModal from '../../components/AccountListModal';
import NumberedTitle from './NumberedTitle';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export default function SelectYourAccount({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [openAccountList, setOpenAccountList] = useState<boolean>(false);

  const onToggleAccountSelection = useCallback(() => {
    setOpenAccountList(!openAccountList);
  }, [openAccountList, setOpenAccountList]);

  return (
    <>
      <Stack sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', p: '15px', width: '308px' }}>
        <NumberedTitle
          number={1}
          textPartInColor={t('your')}
          title={t('Select your account')}
        />
        <Stack alignItems='end' direction='row' justifyContent='space-between' onClick={onToggleAccountSelection} sx={{ cursor: 'pointer', mt: '7px' }} width='100%'>
          <Identity2
            address={address}
            addressStyle={{ variant: 'B-2' }}
            genesisHash={genesisHash ?? ''}
            identiconSize={36}
            identiconStyle={{ marginRight: '7px' }}
            nameStyle={{ color: '#AA83DC' }}
            showShortAddress
            style={{ marginTop: '15px', maxWidth: '80%', variant: 'B-4' }}
            withShortAddress
          />
          <Box sx={{ '&:hover': { background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', cursor: 'pointer' }, alignItems: 'center', border: '2px solid #1B133C', borderRadius: '10px', display: 'flex', height: '40px', justifyContent: 'center', transition: 'all 250ms ease-out', width: '40px' }}>
            <ExpandMore sx={{ color: '#AA83DC', fontSize: '20px' }} />
          </Box>
        </Stack>
      </Stack>
      {openAccountList &&
        <AccountListModal
          genesisHash={genesisHash}
          handleClose={onToggleAccountSelection}
          open={openAccountList}
        />
      }</>

  );
}
