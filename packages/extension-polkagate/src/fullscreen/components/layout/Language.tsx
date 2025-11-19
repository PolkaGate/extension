// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChevronRight } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import { Translate } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { getLanguageOptions } from '@polkadot/extension-polkagate/src/util/getLanguageOptions';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';
import uiSetting from '@polkadot/ui-settings';

import { SettingsContext } from '../../../components/contexts';
import useIsDark from '../../../hooks/useIsDark';
import SelectLanguage from '../../../partials/SelectLanguage';
import { ExtensionPopups } from '../../../util/constants';

export default function Language (): React.ReactElement {
  const settings = useContext(SettingsContext);
  const isDark = useIsDark();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const [language, setLanguage] = useState('');
  const [hovered, setHovered] = useState(false);

  const toggleHover = useCallback(() => setHovered(!hovered), [hovered]);

  useEffect(() => {
    const options = getLanguageOptions();

    const updateLanguage = (langValue: string) => {
      const current = options.find(({ value }) => value === langValue)?.text || options[0].text;

      setLanguage(current);
    };

    updateLanguage(settings.i18nLang);

    uiSetting.on('change', (newSettings) => {
      updateLanguage(newSettings.i18nLang);
    });
  }, [settings]);

  return (
    <>
      <Stack
        columnGap='10px'
        direction='row'
        justifyContent='space-between'
        onClick={extensionPopupOpener(ExtensionPopups.LANGUAGE)}
        onMouseEnter={toggleHover}
        onMouseLeave={toggleHover}
        sx={{ alignItems: 'center', bgcolor: hovered ? '#2D1E4A' : 'transparent', border: '1px solid #1B133C', borderRadius: '12px', cursor: 'pointer', height: '36px', width: '100%', px: '10px' }}
      >
        <Stack alignItems='center' columnGap='8px' direction='row' sx={{ alignItems: 'center' }}>
          <Translate color={isDark ? '#AA83DC' : '#745D8B'} size='14' variant='Bulk' />
          <Typography color='#BEAAD8' variant='B-4'>
            {language}
          </Typography>
        </Stack>
        <ChevronRight sx={{ color: '#AA83DC', fontSize: '20px' }} />
      </Stack>
      <SelectLanguage
        onClose={extensionPopupCloser}
        openMenu={extensionPopup === ExtensionPopups.LANGUAGE}
      />
    </>
  );
}
