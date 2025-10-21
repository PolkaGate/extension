// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Box, Stack, Typography } from '@mui/material';
import { ArrowCircleLeft, ArrowCircleRight } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { useProfileAccounts, useProfiles, useSelectedProfile, useTranslation } from '../../hooks';
import { setStorage } from '../../util';
import useProfileInfo from './useProfileInfo';

function Tab ({ initialAccountList, label }: { initialAccountList: AccountJson[] | undefined, label: string }): React.ReactElement {
  const { t } = useTranslation();
  const profileAccounts = useProfileAccounts(initialAccountList, label);
  const selectedProfile = useSelectedProfile();
  const profileInfo = useProfileInfo(label);

  const [hovered, setHovered] = useState(false);

  const toggleHover = useCallback(() => setHovered(!hovered), [hovered]);
  const isSelected = selectedProfile === label;

  const onClick = useCallback(() => {
    setStorage(STORAGE_KEY.SELECTED_PROFILE, label).catch(console.error);
  }, [label]);

  return (
    <Stack
      direction='column'
      onClick={onClick}
      onMouseEnter={toggleHover} onMouseLeave={toggleHover} sx={{ cursor: 'pointer', width: 'fit-content' }}
    >
      <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' sx={{ mt: '10px' }}>
        <profileInfo.Icon color={isSelected || hovered ? '#FF4FB9' : '#AA83DC'} size='18' variant='Bulk' />
        <Typography color={hovered ? '#FF4FB9' : '#EAEBF1'} sx={{ textWrap: 'nowrap', transition: 'all 250ms ease-out' }} variant='B-2'>
          {t(label)}
        </Typography>
        <Box alignItems='center' sx={{ bgcolor: isSelected ? '#FF4FB926' : '#AA83DC26', borderRadius: '1024px', display: 'flex', height: '19px', px: '10px' }}>
          <Typography color={isSelected ? '#FF4FB9' : '#AA83DC'} variant='B-1'>
            {profileAccounts?.length ?? 0}
          </Typography>
        </Box>
      </Stack>
      {isSelected &&
        <Box sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', height: '2px', mt: '10px', width: '100%' }} />
      }
    </Stack>
  );
}

function ProfileTabsFS ({ initialAccountList, width = '535px' }: { initialAccountList: AccountJson[] | undefined, width?: string }): React.ReactElement {
  const { defaultProfiles, userDefinedProfiles } = useProfiles();
  const containerRef = useRef<HTMLDivElement>(null);

  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [hovered, setIsHovered] = useState('');

  const checkScroll = () => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const isScrollable = container.scrollWidth > container.clientWidth;
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;

    setShowRightArrow(isScrollable && !isAtEnd);
    setShowLeftArrow(isScrollable && !isAtStart);
  };

  useEffect(() => {
    checkScroll(); // Check on mount

    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const profilesToShow = useMemo(() => {
    if (defaultProfiles.length === 0 && userDefinedProfiles.length === 0) {
      return [];
    }

    return defaultProfiles.concat(userDefinedProfiles);
  }, [defaultProfiles, userDefinedProfiles]);

  const handleHover = useCallback((input: string) => () => setIsHovered(input), []);

  const onClickLeftArrow = useCallback(() => {
    containerRef.current?.scrollBy({ behavior: 'smooth', left: -150 });
  }, []);

  const onClickRightArrow = useCallback(() => {
    containerRef.current?.scrollBy({ behavior: 'smooth', left: 150 });
  }, []);

  return (
    <Stack alignItems='center' direction='row' sx={{ position: 'relative', width }}>
      {
        showLeftArrow &&
        <Box justifyContent='start' sx={{ background: 'linear-gradient(90deg, #2A0A40 13.79%, rgba(42, 10, 64, 0) 100%)', display: 'flex', left: '0px', position: 'absolute', width: '40px' }}>
          <ArrowCircleLeft
            color={hovered === 'left' ? '#FF4FB9' : '#AA83DC'}
            onClick={onClickLeftArrow}
            onMouseEnter={handleHover('left')}
            onMouseLeave={handleHover('')}
            size='24' style={{ cursor: 'pointer' }} variant='Bold'
          />
        </Box>
      }
      <Stack columnGap='20px' direction='row' ref={containerRef} sx={{ ml: '10px', overflow: 'hidden', overflowX: 'auto', width: '100%' }}>
        {profilesToShow?.map((label, index) => (
          <Tab
            initialAccountList={initialAccountList}
            key={index}
            label={label}
          />
        ))}
      </Stack>
      {showRightArrow &&
        <Box justifyContent='end' sx={{ background: 'linear-gradient(270deg, #2A0A40 13.79%, rgba(42, 10, 64, 0) 100%)', display: 'flex', position: 'absolute', right: '-7px', width: '40px' }}>
          <ArrowCircleRight
            color={hovered === 'right' ? '#FF4FB9' : '#AA83DC'}
            onClick={onClickRightArrow}
            onMouseEnter={handleHover('right')}
            onMouseLeave={handleHover('')}
            size='24'
            style={{ cursor: 'pointer' }}
            variant='Bold'
          />
        </Box>
      }
    </Stack>
  );
}

export default React.memo(ProfileTabsFS);
