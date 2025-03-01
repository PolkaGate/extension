// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
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

function ProfileTabsFullScreen({ orderedAccounts }: Props): React.ReactElement {
  const { defaultProfiles, userDefinedProfiles } = useProfiles();

  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isHovered, setIsHovered] = useState<boolean>();

  const [showLeftMore, setShowLeftMore] = useState(false);
  const [showRightMore, setShowRightMore] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const profilesToShow = useMemo(() => {
    if (defaultProfiles.length === 0 && userDefinedProfiles.length === 0) {
      return [];
    }

    return defaultProfiles.concat(userDefinedProfiles);
  }, [defaultProfiles, userDefinedProfiles]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;

    if (container && isContentReady) {
      let { clientWidth, scrollLeft, scrollWidth } = container;

      scrollLeft = Math.round(scrollLeft);

      // Check if content is actually scrollable
      const isScrollable = scrollWidth > clientWidth;

      // Show left arrow if we've scrolled at least 1px
      setShowLeftMore(scrollLeft > 1);

      // Show right arrow if there's more content to scroll to
      // We add a small buffer (1px) to account for rounding errors
      const remainingScroll = scrollWidth - (scrollLeft + clientWidth);

      setShowRightMore(isScrollable && remainingScroll > 1);
    }
  }, [isContentReady]);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (scrollContainerRef.current) {
      event.preventDefault();

      // Make the scroll amount more controlled
      const scrollAmount = event.deltaY || event.deltaX;
      const normalizedScroll = Math.sign(scrollAmount) * Math.min(Math.abs(scrollAmount), 50);

      scrollContainerRef.current.scrollLeft += normalizedScroll;
      handleScroll();
    }
  }, [handleScroll]);

  // Initial setup and content ready check
  useEffect(() => {
    const container = scrollContainerRef.current;

    if (container) {
      // Clear any existing timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // Function to check if content is stable
      const checkContentStability = () => {
        const { clientWidth, scrollWidth } = container;

        if (scrollWidth && clientWidth) {
          setIsContentReady(true);
          handleScroll();
        } else {
          // If content isn't ready, check again in a moment
          checkTimeoutRef.current = setTimeout(checkContentStability, 50);
        }
      };

      // Start checking content stability
      checkContentStability();

      return () => {
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
      };
    }

    return undefined;
  }, [handleScroll, profilesToShow]);

  // Scroll and resize handlers
  useEffect(() => {
    const container = scrollContainerRef.current;

    if (container && isContentReady) {
      // Add scroll event listener
      const scrollListener = () => {
        requestAnimationFrame(handleScroll);
      };

      container.addEventListener('scroll', scrollListener);
      container.addEventListener('wheel', handleWheel, { passive: false });

      // Check on resize
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(handleScroll);
      });

      resizeObserver.observe(container);

      return () => {
        container.removeEventListener('scroll', scrollListener);
        container.removeEventListener('wheel', handleWheel);
        resizeObserver.disconnect();
      };
    }

    return undefined;
  }, [handleScroll, handleWheel, isContentReady]);

  return (
    <Grid container sx={{ display: 'flex', height: '30px', mb: '10px', position: 'relative' }}>
      {isHovered && isContentReady && showLeftMore && <ArrowForwardIosRoundedIcon sx={{ color: 'text.disabled', fontSize: '20px', transform: 'rotate(-180deg)', width: 'fit-content', zIndex: 1 }} />}
      <Grid container display='ruby'
        item
        justifyContent='left'
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={scrollContainerRef}
        sx={{
          bgcolor: 'backgroundFL.secondary',
          flexFlow: 'nowrap',
          overflowX: 'scroll',
          pb: '6px',
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
      {isHovered && isContentReady && showRightMore && <ArrowForwardIosRoundedIcon sx={{ color: 'text.disabled', fontSize: '20px', width: 'fit-content', zIndex: 1 }} />}
    </Grid>
  );
}

export default React.memo(ProfileTabsFullScreen);
