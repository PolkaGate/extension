// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Identity2 } from '../../../components';
import { useTranslation } from '../../../hooks';
import AccountListModal from '../../components/AccountListModal';
import NumberedTitle from './NumberedTitle';
import OpenerButton from './OpenerButton';

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
          <OpenerButton flip />
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
