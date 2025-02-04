// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DropdownOption } from '../util/types';

import CheckIcon from '@mui/icons-material/Check';
import { Box, Fade, Grid, styled, Typography } from '@mui/material';
import * as flags from 'country-flag-icons/string/3x2';
import { Translate } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import uiSetting from '@polkadot/ui-settings';

import { ExtensionPopup, GradientButton, SettingsContext } from '../components';
import { useTranslation } from '../hooks';
import { GradientDivider } from '../style';
import getLanguageOptions from '../util/getLanguageOptions';
import { WelcomeHeaderPopups } from './WelcomeHeader';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<WelcomeHeaderPopups>>;
  openMenu: boolean;
}

interface LanguageOptionProps {
  languageOptions: DropdownOption[];
  selectedLanguage: string | undefined;
  handleLanguageSelect: (lang: string) => () => void;
}

const COUNTRY_CODES = {
  EN: 'GB', // English - United Kingdom
  ES: 'ES', // Spanish - Spain
  FR: 'FR', // French - France
  HI: 'IN', // Hindi - India
  RU: 'RU', // Russian - Russia
  ZH: 'CN' // Chinese - China
} as const;

type CountryCodeKey = keyof typeof COUNTRY_CODES;

const ListItem = styled(Grid)(() => ({
  '&.selected': {
    backgroundColor: '#6743944D',
    paddingLeft: '20px'
  },
  '&:hover': {
    backgroundColor: '#6743944D'
  },
  alignItems: 'center',
  borderRadius: '12px',
  cursor: 'pointer',
  height: '50px',
  justifyContent: 'space-between',
  padding: '10px',
  transition: 'padding-left 0.3s ease, background-color 0.3s ease'
}));

const LanguageOptions = React.memo(function LanguageOptions ({ handleLanguageSelect, languageOptions, selectedLanguage }: LanguageOptionProps): React.ReactElement {
  const flag = useCallback((value: string) => {
    const key = value.toUpperCase() as CountryCodeKey;
    const languageCode = COUNTRY_CODES[key] ?? '';

    const svg = (flags as Record<string, string>)[languageCode];

    if (svg) {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    return '';
  }, []);

  return (
    <Grid container item justifyContent='center' sx={{ maxHeight: '380px', overflow: 'scroll' }}>
      {languageOptions.map(({ text, value }, index) => (
        <>
          <ListItem className={selectedLanguage === value ? 'selected' : ''} container item key={value} onClick={handleLanguageSelect(value as string)}>
            <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
              <Box
                component='img'
                src={flag(value as string)}
                sx={{ borderRadius: '5px', height: '18px', width: '18px' }}
              />
              <Typography color='text.primary' variant='B-2'>
                {text}
              </Typography>
            </Grid>
            <Fade in={selectedLanguage === value} timeout={300}>
              <CheckIcon sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '999px', fontSize: '20px', p: '3px' }} />
            </Fade>
          </ListItem>
          {index !== languageOptions.length - 1 &&
            <GradientDivider style={{ my: '5px' }} />
          }
        </>
      ))}
    </Grid>
  );
});

function SelectLanguage ({ openMenu, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);

  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>();

  const languageOptions = useMemo(() => getLanguageOptions(), []);

  useEffect(() => {
    if (selectedLanguage === undefined) {
      setSelectedLanguage(settings.i18nLang !== 'default' ? settings.i18nLang : languageOptions[0].value as string);
    }
  }, [languageOptions, selectedLanguage, settings.i18nLang]);

  const handleLanguageSelect = useCallback((lang: string) => () => {
    setSelectedLanguage(lang);
  }, []);

  const handleClose = useCallback(() => setPopup(WelcomeHeaderPopups.NONE), [setPopup]);

  const applyLanguageChange = useCallback(() => {
    selectedLanguage && uiSetting.set({ i18nLang: selectedLanguage });
    handleClose();
  }, [selectedLanguage, handleClose]);

  return (
    <ExtensionPopup
      TitleIcon={Translate}
      handleClose={handleClose}
      openMenu={openMenu}
      title={t('Select your language')}
    >
      <Grid container item justifyContent='center' sx={{ position: 'relative', py: '5px', zIndex: 1 }}>
        <LanguageOptions
          handleLanguageSelect={handleLanguageSelect}
          languageOptions={languageOptions}
          selectedLanguage={selectedLanguage}
        />
        <GradientButton
          contentPlacement='center'
          disabled={settings.i18nLang === selectedLanguage}
          onClick={applyLanguageChange}
          style={{
            height: '44px',
            marginTop: '20px',
            width: '345px'
          }}
          text={t('Apply')}
        />
      </Grid>
    </ExtensionPopup>
  );
}

export default SelectLanguage;
