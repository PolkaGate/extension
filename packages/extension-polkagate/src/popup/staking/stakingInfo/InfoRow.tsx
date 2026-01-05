// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { TwoToneText } from '@polkadot/extension-polkagate/src/components';
import { useIsExtensionPopup } from '@polkadot/extension-polkagate/src/hooks';

interface Props {
  Icon: Icon;
  text: string;
  textPartInColor: string;
}

function InfoRow ({ Icon, text, textPartInColor }: Props): React.ReactElement {
  const isExtension = useIsExtensionPopup();
  const variant = isExtension ? 'B-3' : 'B-2';

  return (
    <Stack alignItems='center' columnGap='10px' direction='row'>
      <Stack
        alignItems='center' justifyContent='center' sx={{
          backgroundImage: 'linear-gradient(180deg, #674394 0%, #4B2A75 50%, #171739 100%)',
          borderRadius: '16px',
          height: 48,
          overflow: 'hidden',
          transform: 'rotate(-12deg)',
          width: 48
        }}
        width='70px'
      >
        <Icon
          color='#AA83DC'
          size={32}
          style={{ transform: 'rotate(-12deg)' }}
          variant='Bulk'
        />
      </Stack>
      <Stack sx={{ flexFlow: 'wrap' }} width='290px'>
        <Typography color='#BEAAD8' textAlign='left' variant={variant}>
          <TwoToneText
            color='#AA83DC'
            text={text}
            textPartInColor={textPartInColor}
          />
        </Typography>
      </Stack>
    </Stack>
  );
}

export default InfoRow;
