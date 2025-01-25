// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { UnfoldMore as UnfoldMoreIcon } from '@mui/icons-material';
import { Container, Tab, Tabs, Typography } from '@mui/material';
import { Triangle } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import CustomCommand from '../../../components/SVG/CustomCommand';
import { useTranslation } from '../../../hooks';

interface TabProps {
  isActive?: boolean;
}

function ChainTokensTab ({ isActive = false }: TabProps) {
  const { t } = useTranslation();

  const [showChains, setShowChains] = useState(true);
  const [textOpacity, setTextOpacity] = useState(1); // State to handle text opacity
  const [displayedText, setDisplayedText] = useState(t('Chains') as unknown as string); // State for displayed text

  const handleToggle = useCallback(() => {
    if (!isActive) {
      return;
    }

    setTextOpacity(0.1);
    setTimeout(() => {
      setShowChains((active) => {
        const newValue = !active;

        setDisplayedText(newValue ? t('Chains') : t('Tokens'));

        return newValue;
      });

      setTimeout(() => setTextOpacity(1), 50);
    }, 200);
  }, [isActive, t]);

  return (
    <Container disableGutters onClick={handleToggle} sx={{ alignItems: 'center', columnGap: '3px', cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '82px' }}>
      <CustomCommand
        color={showChains ? '#67439480' : '#FF4FB9'}
        secondaryColor={showChains ? '#FF4FB9' : '#67439480'}
        size='12'
        style={{
          transition: 'all 250ms ease-out'
        }}
      />
      <Typography color={showChains ? '#EAEBF1' : '#AA83DC'} fontFamily='Inter' fontSize='14px' fontWeight={600} sx={{ color: showChains ? '#EAEBF1' : '#AA83DC', opacity: textOpacity, textTransform: 'capitalize', transition: 'opacity 0.3s ease-in-out, color 0.3s ease-in-out' }}>
        {displayedText}
      </Typography>
      <UnfoldMoreIcon sx={{ color: '#EAEBF1', fontSize: '15px' }} />
    </Container>
  );
}

function NFTTab ({ isActive = false }: TabProps) {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '3px', cursor: 'pointer', display: 'flex', width: 'fit-content' }}>
      <Triangle color='#AA83DC' size='16' variant='Bulk' />
      <Typography color={isActive ? '#EAEBF1' : '#AA83DC'} fontFamily='Inter' fontSize='14px' fontWeight={600} textTransform='capitalize'>
        {t('NFTs')}
      </Typography>
    </Container>
  );
}

enum TAB_MAP {
  CHAIN,
  NFT
}

function AssetTabs (): React.ReactElement {
  const [tabIndex, setTabIndex] = useState<TAB_MAP>(TAB_MAP.CHAIN);

  const handleTabChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: TAB_MAP) => {
    setTabIndex(value);
  }, [setTabIndex]);

  return (
    <Container disableGutters sx={{ display: 'flex', mx: '30px', width: '100%' }}>
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
          label={<ChainTokensTab isActive={tabIndex === TAB_MAP.CHAIN} />}
          sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
          value={TAB_MAP.CHAIN}
        />
        <Tab
          label={<NFTTab isActive={tabIndex === TAB_MAP.NFT} />}
          sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
          value={TAB_MAP.NFT}
        />
      </Tabs>
    </Container>
  );
}

export default AssetTabs;
