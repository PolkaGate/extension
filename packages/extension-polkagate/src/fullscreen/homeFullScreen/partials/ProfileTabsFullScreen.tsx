// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useProfiles } from '../../../hooks';
import ProfileTabFullScreen from './ProfileTabFullScreen';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
}

export const HIDDEN_PERCENT = '50%';

export default function ProfileTabsFullScreen ({ orderedAccounts }: Props): React.ReactElement {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProfiles.length, userDefinedProfiles.length]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { clientWidth, scrollLeft, scrollWidth } = scrollContainerRef.current;

      const isScrollable = scrollWidth > clientWidth;
      const tolerance = 10;

      setShowLeftMore(scrollLeft > 0);
      setShowRightMore(scrollLeft + clientWidth < scrollWidth - tolerance && isScrollable);
    }
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    if (scrollContainerRef.current) {
      event.preventDefault();
      scrollContainerRef.current.scrollLeft += (event.deltaY || event.deltaX);
      handleScroll();
    }
  }, []);

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
  }, [handleWheel, profilesToShow.length]);

  return (
    <Grid container sx={{ display: 'flex', height: '30px', mb: '10px', position: 'relative' }}>
      {showLeftMore && <ArrowForwardIosRoundedIcon sx={{ color: 'text.disabled', fontSize: '20px', transform: 'rotate(-180deg)', width: 'fit-content', zIndex: 1 }} />}
      <Grid columnGap='5px' container item
        justifyContent='left'
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={scrollContainerRef}
        sx={{
          bgcolor: 'backgroundFL.secondary',
          flexFlow: 'nowrap',
          overflowX: 'scroll',
          pb: '5px',
          px: '25px',
          whiteSpace: 'nowrap'
        }}
        xs
      >
        {
          profilesToShow.map((profile, index) => (
            <ProfileTabFullScreen
              index={index}
              isHovered={isHovered}
              key={index}
              orderedAccounts={orderedAccounts}
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              text={profile}
            />
          ))
        }
      </Grid>
      {showRightMore && <ArrowForwardIosRoundedIcon sx={{ color: 'text.disabled', fontSize: '20px', width: 'fit-content', zIndex: 1 }} />}
    </Grid>
  );
}
