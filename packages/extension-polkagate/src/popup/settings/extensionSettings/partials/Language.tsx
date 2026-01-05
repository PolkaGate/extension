// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ArrowDown2, Translate } from 'iconsax-react';
import React, { useMemo } from 'react';

import { useSelectedLanguage } from '@polkadot/extension-polkagate/src/hooks/index';
import { getLanguageOptions } from '@polkadot/extension-polkagate/src/util/getLanguageOptions';

import { useTranslation } from '../../../../components/translate';
import useIsDark from '../../../../hooks/useIsDark';
import SelectLanguage from '../../../../partials/SelectLanguage';
import { ExtensionPopups } from '../../../../util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

export default function Language (): React.ReactElement {
  const { t } = useTranslation();
  const languageTicker = useSelectedLanguage();
  const isDark = useIsDark();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const language = useMemo(() => {
    const options = getLanguageOptions();

    return options.find(({ value }) => value === languageTicker)?.text || options[0].text;
  }, [languageTicker]);

  return (
    <>
      <Stack direction='column'>
        <Typography color='label.secondary' mb='5px' mt='15px' sx={{ display: 'block', textAlign: 'left' }} variant='H-4'>
          {t('LANGUAGE')}
        </Typography>
        <Stack columnGap='10px' direction='row' onClick={extensionPopupOpener(ExtensionPopups.LANGUAGE)} sx={{ alignItems: 'center', cursor: 'pointer', mt: '5px' }}>
          <Translate color={isDark ? '#AA83DC' : '#745D8B'} size='18' variant='Bulk' />
          <Stack columnGap='5px' direction='row' onClick={extensionPopupOpener(ExtensionPopups.LANGUAGE)} sx={{ alignItems: 'center' }}>
            <Typography variant='B-1'>
              {language}
            </Typography>
            <ArrowDown2 color={isDark ? '#EAEBF1' : '#745D8B'} size='14px' style={{ marginTop: '5px' }} variant='Bold' />
          </Stack>
        </Stack>
      </Stack>
      <SelectLanguage
        openMenu={extensionPopup === ExtensionPopups.LANGUAGE}
        onClose={extensionPopupCloser}
      />
    </>
  );
}
