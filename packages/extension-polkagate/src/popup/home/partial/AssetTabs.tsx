// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { UnfoldMore as UnfoldMoreIcon } from '@mui/icons-material';
import { Container, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { Triangle } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CustomCommand from '../../../components/SVG/CustomCommand';
import { useIsExtensionPopup, useTranslation } from '../../../hooks';
import { TAB } from './AssetsBox';

interface TabProps {
  isSelected?: boolean;
  tab?: TAB;
  setTab?: React.Dispatch<React.SetStateAction<TAB | undefined>>;
}

function ChainTokensTab ({ setTab, tab }: TabProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const nonSelectedSquareColor = theme.palette.mode === 'dark' ? '#67439480' : '#cfd5ec';

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
      setDisplayedText(tab === TAB.CHAINS ? t('Chains') : t('Tokens'));
    }
  }, [isActiveTab, showChains, t, tab]);

  const handleToggle = useCallback(() => {
    if (isActiveTab) {
      setTextOpacity(0.1);
      setTimeout(() => {
        setShowChains((active) => {
          const newValue = !active;

          setTab?.(newValue ? TAB.CHAINS : TAB.TOKENS);
          setDisplayedText(newValue ? t('Chains') : t('Tokens'));

          return newValue;
        });

        setTimeout(() => setTextOpacity(1), 50);
      }, 200);
    }
  }, [isActiveTab, setTab, t]);

  const { color, secondaryColor } = useMemo(() => ({
    color: showChains
      ? isActiveTab
        ? '#FF4FB9'
        : '#AA83DC'
      : nonSelectedSquareColor,
    secondaryColor: !showChains
      ? isActiveTab
        ? '#FF4FB9'
        : '#AA83DC'
      : nonSelectedSquareColor
  }), [isActiveTab, nonSelectedSquareColor, showChains]);

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
      <Typography color={isActiveTab ? 'text.primary' : 'secondary.main'} sx={{ opacity: textOpacity, paddingLeft: '4px', textTransform: 'capitalize', transition: 'opacity 0.3s ease-in-out, color 0.3s ease-in-out' }} variant='B-2'>
        {displayedText}
      </Typography>
      <UnfoldMoreIcon sx={{ color: isActiveTab ? 'text.primary' : 'secondary.main', fontSize: '15px' }} />
    </Container>
  );
}

function NFTTab ({ isSelected = false }: TabProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '3px', cursor: 'pointer', display: 'flex', width: 'fit-content' }}>
      <Triangle color={isSelected ? theme.palette.menuIcon.selected : theme.palette.menuIcon.active} size='16' variant='Bulk' />
      <Typography color={isSelected ? 'text.primary' : 'secondary.main'} textTransform='capitalize' variant='B-2'>
        {t('NFTs')}
      </Typography>
    </Container>
  );
}

interface Props {
  setTab: React.Dispatch<React.SetStateAction<TAB | undefined>>;
  tab: TAB | undefined;
}

function AssetTabs ({ setTab, tab }: Props): React.ReactElement {
  const isExtension = useIsExtensionPopup();

  const tabIndex = useMemo(() => !tab || [TAB.CHAINS, TAB.TOKENS].includes(tab)
    ? TAB.CHAINS
    : TAB.NFTS
    , [tab]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: TAB) => {
    const selectedTab = value === TAB.NFTS
      ? TAB.NFTS
      : value === tabIndex
        ? TAB.TOKENS
        : TAB.CHAINS;

    setTab(selectedTab);
  }, [setTab, tabIndex]);

  return (
    <Container disableGutters sx={{ display: 'flex', mx: isExtension ? '30px' : '15px', width: '100%' }}>
      <Tabs
        onChange={handleTabChange}
        sx={{
          '& div.MuiTabs-flexContainer': {
            columnGap: '20px'
          },
          '& span.MuiTabs-indicator': {
            background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
            borderRadius: '999px',
            height: '2px'
          },
          minHeight: 'unset'
        }}
        value={tabIndex}
      >
        <Tab
          label={
            <ChainTokensTab
              setTab={setTab}
              tab={tab}
            />
          }
          sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
          value={TAB.CHAINS}
        />
        <Tab
          label={
            <NFTTab
              isSelected={tab === TAB.NFTS}
            />
          }
          sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
          value={TAB.NFTS}
        />
      </Tabs>
    </Container>
  );
}

export default AssetTabs;
