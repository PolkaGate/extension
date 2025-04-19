// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CheckIcon from '@mui/icons-material/Check';
import { Box, Fade, Grid, styled, Typography } from '@mui/material';
import * as flags from 'country-flag-icons/string/3x2';
import { Translate } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import uiSetting from '@polkadot/ui-settings';

import { ExtensionPopup, GradientButton, SettingsContext } from '../components';
import { DraggableModal } from '../fullscreen/governance/components/DraggableModal';
import { useIsExtensionPopup, useTranslation } from '../hooks';
import { GradientDivider } from '../style';
import { ExtensionPopups } from '../util/constants';
import { getLanguageOptions, type LanguageOptions } from '../util/getLanguageOptions';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  openMenu: boolean;
}

interface LanguageOptionProps {
  options: LanguageOptions[];
  selectedLanguage: string | undefined;
  handleLanguageSelect: (lang: string) => () => void;
}

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

const LanguageSelect = React.memo(
  function F ({ handleLanguageSelect, options, selectedLanguage }: LanguageOptionProps): React.ReactElement {
    const flag = useCallback((value: string) => {
      const option = options.find((item) => item?.flag?.toUpperCase() === value.toUpperCase() || String(item.value).toUpperCase() === value.toUpperCase());
      const key = String(option?.flag ?? option?.value ?? 'EN');
      const svg = (flags as Record<string, string>)[key.toUpperCase()];

      return svg ? `data:image/svg+xml;base64,${btoa(svg)}` : '';
    }, [options]);

    return (
      <Grid container item justifyContent='center' sx={{ maxHeight: '380px', overflow: 'scroll' }}>
        {options.map(({ text, value }, index) => (
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
            {index !== options.length - 1 &&
              <GradientDivider style={{ my: '5px' }} />
            }
          </>
        ))}
      </Grid>
    );
  });

function Content ({ setPopup }: { setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>; }): React.ReactElement {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);

  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>();

  const options = useMemo(() => getLanguageOptions(), []);

  useEffect(() => {
    if (selectedLanguage === undefined) {
      setSelectedLanguage(settings.i18nLang !== 'default' ? settings.i18nLang : options[0].value as string);
    }
  }, [options, selectedLanguage, settings.i18nLang]);

  const handleLanguageSelect = useCallback((lang: string) => () => setSelectedLanguage(lang), []);
  const handleClose = useCallback(() => setPopup(ExtensionPopups.NONE), [setPopup]);

  const applyLanguageChange = useCallback(() => {
    selectedLanguage && uiSetting.set({ i18nLang: selectedLanguage });
    handleClose();
  }, [selectedLanguage, handleClose]);

  return (
    <Grid container item justifyContent='center' sx={{ position: 'relative', py: '5px', zIndex: 1 }}>
      <LanguageSelect
        handleLanguageSelect={handleLanguageSelect}
        options={options}
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
  );
}

function SelectLanguage ({ openMenu, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const title = t('Select your language');
  const handleClose = useCallback(() => setPopup(ExtensionPopups.NONE), [setPopup]);

  return (
    <>
      {
        isExtension
          ? <ExtensionPopup
            TitleIcon={Translate}
            handleClose={handleClose}
            openMenu={openMenu}
            title={title}
          >
            <Content
              setPopup={setPopup}
            />
          </ExtensionPopup>
          : <DraggableModal
            onClose={handleClose}
            open={openMenu}
            style={{ minHeight: '400px', padding: '20px' }}
            title={title}
          >
            <Content
              setPopup={setPopup}
            />
          </DraggableModal>
      }
    </>
  );
}

export default SelectLanguage;
