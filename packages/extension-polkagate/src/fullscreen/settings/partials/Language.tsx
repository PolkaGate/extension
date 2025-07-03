// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ArrowDown2, Translate } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import useSelectedLanguage from '@polkadot/extension-polkagate/src/hooks/useSelectedLanguage';
import { getLanguageOptions } from '@polkadot/extension-polkagate/src/util/getLanguageOptions';

import { useTranslation } from '../../../components/translate';
import useIsDark from '../../../hooks/useIsDark';
import SelectLanguage from '../../../partials/SelectLanguage';
import { ExtensionPopups } from '../../../util/constants';

export default function Language (): React.ReactElement {
  const { t } = useTranslation();
  const languageTicker = useSelectedLanguage();
  const isDark = useIsDark();

  const [showPopUp, setShowPopUp] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  const language = useMemo(() => {
    const options = getLanguageOptions();

    return options.find(({ value }) => value === languageTicker)?.text || options[0].text;
  }, [languageTicker]);

  const onClick = useCallback(() => {
    setShowPopUp(ExtensionPopups.LANGUAGE);
  }, []);

  return (
    <>
      <Stack direction='column'>
        <Typography color='text.primary' fontSize='22px' mb='5px' mt='15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4' >
          {t('Language')}
        </Typography>
        <Stack
          columnGap='10px' direction='row' sx={{ ':hover': { background: '#2D1E4A' },
            alignItems: 'center',
            bgcolor: '#1B133CB2',
            border: '1px solid #BEAAD833',
            borderRadius: '12px',
            height: '44px',
            mt: '5px',
            px: '8px',
            transition: 'all 250ms ease-out',
            width: '454px' }}
        >
          <Translate color={isDark ? '#AA83DC' : '#745D8B'} onClick={onClick} size='18' style={{ cursor: 'pointer' }} variant='Bulk' />
          <Stack columnGap='5px' direction='row' justifyContent= 'space-between' onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer', width: '100%' }}>
            <Typography color= '#BEAAD8' variant='B-4'>
              {language}
            </Typography>
            <ArrowDown2 color={isDark ? '#AA83DC' : '#745D8B'} size='14px' style={{ marginTop: '5px' }} variant='Bold' />
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
