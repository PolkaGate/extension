// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';

import { Stack, type SxProps, Typography } from '@mui/material';
import React, { } from 'react';

import { useAccountName, useIsExtensionPopup, useTranslation } from '../hooks';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { toTitleCase } from '../util';
import { ShortAddress } from '.';

interface Props {
  address: string | undefined;
  charsCount?: number;
  identiconSize?: number;
  label?: string;
  labelMarginTop?: string;
  name?: string;
  inTitleCase?: boolean;
  showAddress?: boolean;
  showCopy?: boolean;
  showName?: boolean;
  style?: SxProps;
  variant?: Variant;
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
 * @param {boolean} [showName] - Whether to show the name of the account.
 *
 * @returns {React.ReactElement} The rendered address component.
 */
function Address2 ({ address, charsCount = 5, identiconSize = 24, inTitleCase, label, labelMarginTop, name, showAddress, showCopy = true, showName = true, style = {}, variant }: Props): React.ReactElement {
  const { t } = useTranslation();
  const accountName = useAccountName(address || '');
  const isExtension = useIsExtensionPopup();

  return (
    <Stack alignItems='center' direction='column' sx={{ rowGap: '10px', width: '100%' }}>
      {label &&
        <Typography color='text.primary' mt={labelMarginTop} textAlign='left' variant='B-1' width='100%'>
          {label}
        </Typography>
      }
      <Stack alignItems='center' direction='row' sx={{ bgcolor: '#05091C', borderRadius: '18px', columnGap: '10px', height: showAddress ? '71px' : '52px', pl: '10px', width: '100%', ...style }}>
        {address &&
          <PolkaGateIdenticon
            address={address}
            size={identiconSize}
          />}
        <Stack justifyContent='flex-start' sx={{ overflowX: 'auto', width: '100%' }}>
          {showName &&
            <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
              {inTitleCase
                ? toTitleCase(accountName || name || t('Unknown'))
                : accountName || name || t('Unknown')
              }
            </Typography>
          }
          {showAddress &&
            <ShortAddress
              address={address}
              charsCount={charsCount}
              showCopy={showCopy}
              style={{ color: isExtension ? 'text.secondary' : '#AA83DC', justifyContent: 'flex-start' }}
              variant={(variant || 'B-4') as Variant}
            />
          }
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(Address2);
