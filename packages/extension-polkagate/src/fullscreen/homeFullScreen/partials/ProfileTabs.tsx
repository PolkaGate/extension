// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import type { AccountsOrder } from '..';
import { Grid } from '@mui/material';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ProfileTab from './ProfileTab';
import { useProfiles } from '../../../hooks';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
}

export const HIDDEN_PERCENT = '50%';

export default function ProfileTabs({ orderedAccounts }: Props): React.ReactElement {
  const { defaultProfiles, userDefinedProfiles } = useProfiles();

  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isHovered, setIsHovered] = useState<boolean>();

  const [showLeftMore, setShowLeftMore] = useState(false);
  const [showRightMore, setShowRightMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const profilesToShow = useMemo(() => {
    if (defaultProfiles.length === 0 && userDefinedProfiles.length === 0) {
      return [];
    }

    return defaultProfiles.concat(userDefinedProfiles);
  }, [defaultProfiles.length, userDefinedProfiles.length]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

      const isScrollable = scrollWidth > clientWidth;
      const tolerance = 10;

      setShowLeftMore(scrollLeft > 0);
      setShowRightMore(scrollLeft + clientWidth < scrollWidth - tolerance && isScrollable);
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (scrollContainerRef.current) {
      event.preventDefault();
      scrollContainerRef.current.scrollLeft += (event.deltaY || event.deltaX);
      handleScroll();
    }
  };

  useEffect(() => {
    handleScroll(); // Set initial shadow states on mount
    const ref = scrollContainerRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      ref.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        ref.removeEventListener('scroll', handleScroll);
        ref.removeEventListener('wheel', handleWheel);
      };
    }
    return undefined;
  }, [profilesToShow.length, scrollContainerRef.current]);

  return (
    <Grid container sx={{ display: 'flex', position: 'relative', height: '30px', mb: '10px' }}>
      {showLeftMore && <ArrowForwardIosRoundedIcon sx={{ color: 'text.disabled', fontSize: '20px', transform: 'rotate(-180deg)', width: 'fit-content', zIndex: 1 }} />}
      <Grid container item justifyContent='left'
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        columnGap='5px'
        sx={{
          bgcolor: 'backgroundFL.secondary',
          px: '25px',
          pb: '5px',
          flexFlow: 'nowrap',
          overflowX: 'scroll',
          whiteSpace: 'nowrap'
        }}
        ref={scrollContainerRef}
        xs
      >
        {
          profilesToShow.map((profile, index) => (
            <ProfileTab
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              key={index}
              index={index}
              isHovered={isHovered}
              text={profile as string}
              orderedAccounts={orderedAccounts}
            />
          ))
        }
      </Grid>
      {showRightMore && <ArrowForwardIosRoundedIcon sx={{ color: 'text.disabled', fontSize: '20px', width: 'fit-content', zIndex: 1 }} />}
    </Grid>
  );
}
