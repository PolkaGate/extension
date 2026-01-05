// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '../util/handleExtensionPopup';

import CheckIcon from '@mui/icons-material/Check';
import { Box, Fade, Grid, styled, Typography } from '@mui/material';
import * as flags from 'country-flag-icons/string/3x2';
import { Translate } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import uiSetting from '@polkadot/ui-settings';

import { FadeOnScroll, GradientButton } from '../components';
import { useSelectedLanguage, useTranslation } from '../hooks';
import { GradientDivider } from '../style';
import { getLanguageOptions, type LanguageOptions } from '../util/getLanguageOptions';
import { SharePopup } from '.';

interface Props {
  onClose: ExtensionPopupCloser;
  openMenu: boolean;
}

interface LanguageOptionProps {
  handleLanguageSelect: (lang: string) => () => void;
  onDoubleClick: () => void;
  options: LanguageOptions[];
  selectedLanguage: string | undefined;
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
  function F ({ handleLanguageSelect, onDoubleClick, options, selectedLanguage }: LanguageOptionProps): React.ReactElement {
    const refContainer = useRef<HTMLDivElement>(null);
    const flag = useCallback((value: string) => {
      const option = options.find((item) => item?.flag?.toUpperCase() === value.toUpperCase() || String(item.value).toUpperCase() === value.toUpperCase());
      const key = String(option?.flag ?? option?.value ?? 'EN');
      const svg = (flags as Record<string, string>)[key.toUpperCase()];

      return svg ? `data:image/svg+xml;base64,${btoa(svg)}` : '';
    }, [options]);

    return (
      <>
        <Grid container item justifyContent='center' ref={refContainer} sx={{ maxHeight: '370px', overflowY: 'auto' }}>
          {options.map(({ text, value }, index) => (
            <React.Fragment key={index}>
              <ListItem className={selectedLanguage === value ? 'selected' : ''} container item key={value} onClick={handleLanguageSelect(value as string)} onDoubleClick={onDoubleClick}>
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
            </React.Fragment>
          ))}
        </Grid>
        <FadeOnScroll containerRef={refContainer} height='110px' ratio={0.25} style={{ borderRadius: '14px', bottom: '6px' }} />
      </>
    );
  });

function Content ({ onClose }: { onClose: ExtensionPopupCloser }): React.ReactElement {
  const { t } = useTranslation();
  const languageTicker = useSelectedLanguage();

  const [maybeSelectedLanguage, setSelectedLanguage] = useState<string | undefined>();

  const options = useMemo(() => getLanguageOptions(), []);

  const handleLanguageSelect = useCallback((lang: string) => () => setSelectedLanguage(lang), []);

  const applyLanguageChange = useCallback(() => {
    maybeSelectedLanguage && uiSetting.set({ i18nLang: maybeSelectedLanguage });
    onClose();
  }, [maybeSelectedLanguage, onClose]);

  return (
    <Grid container item justifyContent='center' sx={{ position: 'relative', py: '5px', zIndex: 1 }}>
      <LanguageSelect
        handleLanguageSelect={handleLanguageSelect}
        onDoubleClick={applyLanguageChange}
        options={options}
        selectedLanguage={maybeSelectedLanguage ?? languageTicker}
      />
      <GradientButton
        contentPlacement='center'
        disabled={!maybeSelectedLanguage || languageTicker === maybeSelectedLanguage}
        onClick={applyLanguageChange}
        style={{
          height: '44px',
          marginTop: '20px',
          width: '100%',
          zIndex: 1
        }}
        text={t('Apply')}
      />
    </Grid>
  );
}

function SelectLanguage ({ onClose, openMenu }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <SharePopup
      modalProps={{ showBackIconAsClose: true }}
      modalStyle={{ minHeight: '400px', padding: '20px' }}
      onClose={onClose}
      open={openMenu}
      popupProps={{
        TitleIcon: Translate
      }}
      title={t('Select your language')}
    >
      <Content
        onClose={onClose}
      />
    </SharePopup>
  );
}

export default SelectLanguage;
