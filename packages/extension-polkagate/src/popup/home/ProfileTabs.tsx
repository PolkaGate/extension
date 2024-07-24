// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
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

  useLayoutEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile')
      .then((res) => {
        setSelectedProfile(res as string || t('All'));
      })
      .catch(console.error);

    watchStorage('profile', setSelectedProfile).catch(console.error);
  }, [t]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const profilesToShow = useMemo(() => {
    if (defaultProfiles.length === 0 && userDefinedProfiles.length === 0) {
      return [];
    }

    return defaultProfiles.concat(userDefinedProfiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProfiles.length, userDefinedProfiles.length]);

  const containerWidth = useMemo(() =>
    `${profilesToShow.length * (ITEM_WIDTH + OFFSET)}px`
    , [profilesToShow.length]);

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

  return (
    <Grid container item ref={scrollContainerRef} sx={{ maxWidth: '357px', overflowX: 'scroll', overflowY: 'hidden', position: 'absolute', top: '69px', whiteSpace: 'nowrap', width: '357px', zIndex: 2 }}>
      <Grid container item sx={{ backgroundColor: 'backgroundFL.secondary', columnGap: '5px', display: 'flex', px: '10px', flexDirection: 'row', flexWrap: 'nowrap', width: containerWidth }}>
        {profilesToShow.map((profile, index) => {
          const isSelected = selectedProfile === profile;

          return (
            <ProfileTab
              index={index}
              isSelected={isSelected}
              key={`${index}:${profile}`}
              orderedAccounts={orderedAccounts}
              selectedProfile={selectedProfile}
              text={profile}
            />);
        })}
      </Grid>
    </Grid>
  );
}

export default React.memo(ProfileTabs);
