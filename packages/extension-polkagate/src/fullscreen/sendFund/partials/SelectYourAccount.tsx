// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Identity } from '../../../components';
import { useTranslation } from '../../../hooks';
import AccountListModal from '../../components/AccountListModal';
import NumberedTitle from './NumberedTitle';
import OpenerButton from './OpenerButton';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export default function SelectYourAccount({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [openAccountList, setOpenAccountList] = useState<boolean>(false);

  const onToggleAccountSelection = useCallback(() => {
    setOpenAccountList(!openAccountList);
  }, [openAccountList, setOpenAccountList]);

  return (
    <>
      <Stack sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', border: '1px solid', borderColor: isDark ? 'transparent' : '#DDE3F4', borderRadius: '14px', boxShadow: isDark ? 'none' : '0 10px 24px rgba(133, 140, 176, 0.12)', height: '108px', p: '15px', width: '308px' }}>
        <NumberedTitle
          number={1}
          textPartInColor={t('your')}
          title={t('Select your account')}
        />
        <Stack alignItems='end' direction='row' justifyContent='space-between' onClick={onToggleAccountSelection} sx={{ cursor: 'pointer', mt: '7px' }} width='100%'>
          <Identity
            address={address}
            addressStyle={{ variant: 'B-2' }}
            genesisHash={genesisHash ?? ''}
            identiconSize={36}
            identiconStyle={{ marginRight: '7px' }}
            nameStyle={{ color: isDark ? '#AA83DC' : theme.palette.text.primary }}
            showShortAddress
            style={{ marginTop: '15px', maxWidth: '80%', variant: 'B-4' }}
            withShortAddress
          />
          <OpenerButton flip />
        </Stack>
      </Stack>
      {openAccountList &&
        <AccountListModal
          genesisHash={genesisHash}
          handleClose={onToggleAccountSelection}
          open={openAccountList}
          showAll
        />
      }
    </>
  );
}
