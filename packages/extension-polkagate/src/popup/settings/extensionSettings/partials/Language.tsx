// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Stack, Typography } from '@mui/material';
import { ArrowDown2, Translate } from 'iconsax-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { SettingsContext } from '../../../../components/contexts';
import { useTranslation } from '../../../../components/translate';
import useIsDark from '../../../../hooks/useIsDark';
import SelectLanguage from '../../../../partials/SelectLanguage';
import { ExtensionPopups } from '../../../../util/constants';
import getLanguageOptions from '../../../../util/getLanguageOptions';

export default function Language (): React.ReactElement {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);

  const isDark = useIsDark();

  const [showPopUp, setShowPopUp] = useState<ExtensionPopups>(ExtensionPopups.NONE);
  const language = useMemo(() => {
    const options = getLanguageOptions();

    return options.find(({ value }) => value === settings.i18nLang)?.text || options[0].text;
  }, [settings.i18nLang]);

  const onClick = useCallback(() => {
    setShowPopUp(ExtensionPopups.LANGUAGE);
  }, []);

  return (
    <>
      <Stack direction='column'>
        <Typography color='label.secondary' mb='5px' mt='15px' sx={{ display: 'block', textAlign: 'left' }} variant='H-4'>
          {t('LANGUAGE')}
        </Typography>
        <Stack columnGap='10px' direction='row' sx={{ alignItems: 'center', mt: '5px' }}>
          <Translate color={ isDark ? '#AA83DC' : '#745D8B'} onClick={onClick} size='18' variant='Bulk' style={{ cursor: 'pointer' }} />
          <Stack columnGap='5px' direction='row' onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer' }}>
            <Typography variant='B-1'>
              {language}
            </Typography>
            <ArrowDown2 color={ isDark ? '#EAEBF1' : '#745D8B'} size='14px' style={{ marginTop: '5px' }} variant='Bold' />
          </Stack>
        </Stack>
      </Stack>
      <SelectLanguage
        openMenu={showPopUp === ExtensionPopups.LANGUAGE}
        setPopup={setShowPopUp}
      />
    </>
  );
}
