// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExpandMore } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Identity2, TwoToneText } from '../../../components';
import { useTranslation } from '../../../hooks';
import AccountListModal from '../../components/AccountListModal';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export default function SelectYourAccount ({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [openAccountList, setOpenAccountList] = useState<boolean>(false);

  const onToggleAccountSelection = useCallback(() => {
    setOpenAccountList(!openAccountList);
  }, [openAccountList, setOpenAccountList]);

  return (
    <>
      <Stack sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '108px', p: '15px', width: '308px' }}>
        <Stack columnGap='5px' direction='row'>
          <Box sx={{ alignItems: 'center', background: '#6743944D', borderRadius: '50%', display: 'flex', height: '20px', justifyContent: 'center', width: '20px' }}>
            <Typography color='#AA83DC' sx={{ textAlign: 'center' }} variant='B-3'>
              1
            </Typography>
          </Box>
          <Typography color='text.primary' sx={{ textAlign: 'center' }} variant='B-1'>
            <TwoToneText
              text={t('Select your account')}
              textPartInColor={t('your')}
            />
          </Typography>
        </Stack>
        <Stack alignItems='end' direction='row' justifyContent='space-between' width='100%'>
          <Identity2
            address={address}
            addressStyle={{ variant: 'B-2' }}
            genesisHash={genesisHash ?? ''}
            identiconSize={36}
            identiconStyle={{ marginRight: '7px' }}
            nameStyle={{ color: '#AA83DC' }}
            showShortAddress
            style={{ marginTop: '15px', maxWidth: '77%', variant: 'B-4' }}
            withShortAddress
          />
          <Box onClick={onToggleAccountSelection} sx={{ '&:hover': { background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', cursor: 'pointer' }, transition: 'all 250ms ease-out', border: '2px solid #1B133C', borderRadius: '10px', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
