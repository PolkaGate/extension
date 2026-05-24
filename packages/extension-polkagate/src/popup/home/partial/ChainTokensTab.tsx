// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TabProps } from './AssetTabs';

import { UnfoldMore as UnfoldMoreIcon } from '@mui/icons-material';
import { Container, Typography, useTheme } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CustomCommand from '../../../components/SVG/CustomCommand';
import { useTranslation } from '../../../hooks';
import { TAB } from './AssetsBox';

function ChainTokensTab({ setTab, tab }: TabProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fadeTimerRef = useRef<number | null>(null);

  const [showChains, setShowChains] = useState<boolean | undefined>(undefined);
  const [textOpacity, setTextOpacity] = useState(1); // State to handle text opacity
  const [displayedText, setDisplayedText] = useState<string | undefined>(undefined); // State for displayed text

  const isActiveTab = useMemo(() => tab === TAB.CHAINS || tab === TAB.TOKENS, [tab]);

  useEffect(() => {
    if (!tab) {
      return;
    }

    if (showChains === undefined) {
      setShowChains(tab === TAB.CHAINS);
      setDisplayedText(tab === TAB.CHAINS ? t('Networks') : t('Tokens'));
    }
  }, [isActiveTab, showChains, t, tab]);

  const handleToggle = useCallback(() => {
    if (isActiveTab && fadeTimerRef.current === null) {
      setTextOpacity(0.1);

      const newValue = !showChains;

      setTab?.(newValue ? TAB.CHAINS : TAB.TOKENS);
      setDisplayedText(newValue ? t('Networks') : t('Tokens'));
      setShowChains(newValue);

      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
      }

      fadeTimerRef.current = window.setTimeout(() => {
        setTextOpacity(1);
        fadeTimerRef.current = null;
      }, 50);
    }
  }, [isActiveTab, setTab, showChains, t]);

  // Clear the fade timer to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  const { color, secondaryColor } = useMemo(() => {
    const nonSelectedSquareColor = theme.palette.mode === 'dark' ? '#67439480' : '#cfd5ec';
    const selectedSquareColor = isActiveTab ? '#FF4FB9' : '#AA83DC';

    return {
      color: showChains ? selectedSquareColor : nonSelectedSquareColor,
      secondaryColor: !showChains ? selectedSquareColor : nonSelectedSquareColor
    };
  }, [isActiveTab, showChains, theme]);

  return (
    <Container disableGutters onClick={handleToggle} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', justifyContent: 'center', width: 'fit-content' }}>
      <CustomCommand
        color={color}
        secondaryColor={secondaryColor}
        size='12'
        style={{
          transition: 'all 250ms ease-out'
        }}
      />
      <Typography color={isActiveTab ? 'text.primary' : 'secondary.main'} sx={{ minWidth: '65px', opacity: textOpacity, paddingLeft: '4px', textAlign: 'left', textTransform: 'capitalize', transition: 'opacity 0.3s ease-in-out, color 0.3s ease-in-out' }} variant='B-2'>
        {displayedText}
      </Typography>
      <UnfoldMoreIcon sx={{ color: isActiveTab ? 'text.primary' : 'secondary.main', fontSize: '15px' }} />
    </Container>
  );
}

export default memo(ChainTokensTab);
