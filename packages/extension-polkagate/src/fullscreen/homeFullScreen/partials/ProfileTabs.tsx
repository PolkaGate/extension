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
  const profiles = useProfiles();

  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isHovered, setIsHovered] = useState<boolean>();

  const [showLeftMore, setShowLeftMore] = useState(false);
  const [showRightMore, setShowRightMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const profilesToShow = useMemo(() => {
    if (!profiles) {
      return undefined;
    }

    return profiles.defaultProfiles.concat(profiles.userDefinedProfiles);
  }, [profiles, profiles?.defaultProfiles.length, profiles?.userDefinedProfiles.length]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftMore(scrollLeft > 0);
      setShowRightMore(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (scrollContainerRef.current) {
      event.preventDefault();
      scrollContainerRef.current.scrollLeft += event.deltaY;
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
  }, []);

  return (
    <Grid container sx={{ display: 'flex', position: 'relative', height: '30px', mb: '10px' }}>
      {showLeftMore && <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '20px', transform: 'rotate(-180deg)', width: 'fit-content', zIndex: 1 }} />}
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
          profilesToShow?.map((profile, index) => (
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
      {showRightMore && <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '20px', width: 'fit-content', zIndex: 1 }} />}
    </Grid>
  );
}
