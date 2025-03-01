// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { getStorage, watchStorage } from '@polkadot/extension-polkagate/src/components/Loading';

import { useProfiles, useTranslation } from '../../hooks';
import ProfileTab from './ProfileTab';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
}

const ITEM_WIDTH = 130;
const OFFSET = 10;

function ProfileTabs({ orderedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { defaultProfiles, userDefinedProfiles } = useProfiles();

  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isContainerHovered, setIsContainerHovered] = useState<boolean>(false);

  useLayoutEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile')
      .then((res) => {
        setSelectedProfile(res as string || t('All'));
      })
      .catch(console.error);

    const unsubscribe = watchStorage('profile', setSelectedProfile);

    return () => {
      unsubscribe();
    };
  }, [t]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const profilesToShow = useMemo(() => {
    if (defaultProfiles.length === 0 && userDefinedProfiles.length === 0) {
      return [];
    }

    return defaultProfiles.concat(userDefinedProfiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProfiles.length, userDefinedProfiles.length]);

  const containerWidth = useMemo(() => `${profilesToShow.length * (ITEM_WIDTH + OFFSET)}px`, [profilesToShow.length]);

  const showProfileTabs = useMemo(() => profilesToShow?.length > 2, [profilesToShow.length]);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (scrollContainerRef.current) {
      event.preventDefault();
      scrollContainerRef.current.scrollLeft += (event.deltaY || event.deltaX);
    }
  }, []);

  useEffect(() => {
    const ref = scrollContainerRef.current;

    if (ref) {
      ref.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        ref.removeEventListener('wheel', handleWheel);
      };
    }

    return undefined;
  }, [profilesToShow.length, handleWheel]);

  const onMouseEnter = useCallback(() => setIsContainerHovered(true), []);
  const onMouseLeave = useCallback(() => setIsContainerHovered(false), []);

  return (
    <>
      {showProfileTabs &&
        <Grid container item onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} ref={scrollContainerRef} sx={{ maxWidth: '357px', overflowX: 'scroll', overflowY: 'hidden', whiteSpace: 'nowrap', width: '357px', zIndex: 2 }}>
          <Grid container item sx={{ columnGap: '5px', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', pl: '25px', pr: '15px', width: containerWidth }}>
            {profilesToShow.map((profile, index) => {
              const isSelected = selectedProfile === profile;

              return (
                <ProfileTab
                  index={index}
                  isContainerHovered={isContainerHovered}
                  isSelected={isSelected}
                  key={`${index}:${profile}`}
                  orderedAccounts={orderedAccounts}
                  text={profile}
                />);
            })}
          </Grid>
        </Grid>}
    </>
  );
}

export default React.memo(ProfileTabs);
