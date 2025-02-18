// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Variant } from '@mui/material/styles/createTypography';

import { Stack, type SxProps, Typography } from '@mui/material';
import React, { } from 'react';

import { useTranslation } from '../hooks';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { ShortAddress } from '.';

interface Props {
  address: string;
  label?: string;
  labelMarginTop?: string;
  name?: string;
  style?: SxProps;
  variant?: Variant;
  showAddress?: boolean;
}

/**
 * Displays an address with an optional label and name, along with an identicon.
 * Optionally shows the full address in a shortened format.
 *
 * @param {string} address - The address to display.
 * @param {string} [label] - Optional label text to display above the address.
 * @param {string} [name] - Optional name to display under the address.
 * @param {SxProps} [style] - Optional style overrides for the container.
 * @param {Variant} [variant] - Optional typography variant for the address.
 * @param {boolean} [showAddress] - Whether to show the full address in shortened form.
 *
 * @returns {React.ReactElement} The rendered address component.
 */
function Address2 ({ address, label, labelMarginTop, name, showAddress, style = {}, variant }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Stack alignItems='center' direction='column' sx={{ rowGap: '10px', width: '100%' }}>
      {label &&
        <Typography color='text.primary' mt={labelMarginTop} textAlign='left' variant='B-1' width='100%'>
          {label}
        </Typography>}
      <Stack alignItems='center' direction='row' sx={{ bgcolor: '#05091C', borderRadius: '18px', columnGap: '10px', height: showAddress ? '71px' : '52px', pl: '10px', width: '100%', ...style }}>
        <PolkaGateIdenticon
          address={address}
          size={24}
        />
        <Stack justifyContent='flex-start' sx={{ overflowX: 'scroll', width: '100%' }}>
          <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
            {name || t('Unknown')}
          </Typography>
          {showAddress &&
            <ShortAddress
              address={address}
              charsCount={5}
              showCopy
              style={{ color: 'text.secondary', justifyContent: 'flex-start' }}
              variant={(variant || 'B-4') as Variant}
            />}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(Address2);
