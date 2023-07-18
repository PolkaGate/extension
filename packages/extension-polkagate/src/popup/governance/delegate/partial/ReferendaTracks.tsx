// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN } from '@polkadot/util';

import { Checkbox2, Infotip2 } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { Lock } from '../../../../hooks/useAccountLocks';
import { Track } from '../../utils/types';
import { getLockedUntil, toTitleCase } from '../../utils/util';

interface Props {
  selectedTracks: BN[];
  tracks: Track[] | undefined;
  setSelectedTracks: React.Dispatch<React.SetStateAction<BN[]>>;
  maximumHeight?: string;
  filterLockedTracks?: {
    currentBlockNumber: number | undefined;
    accountLocks: Lock[] | null | undefined;
  };
  filterDelegatedTracks?: BN[] | undefined;
  firstSelections?: BN[] | undefined;
}

export const LoadingSkeleton = ({ skeletonsNum, withCheckBox = false }: { skeletonsNum: number, withCheckBox: boolean }) => {
  const skeletonArray = [];

  for (let index = 0; index < skeletonsNum; index++) {
    skeletonArray.push(<Grid container item justifyContent='space-between' key={index} pt='5px' px='5%'>
      <Grid container direction='column' item xs={10}>
        <Skeleton height={20} sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: index % 2 === 0 ? '161px' : '123px' }} />
      </Grid>
      {withCheckBox &&
        <Grid container item width='fit-content'>
          <Checkbox2
            disabled
            iconStyle={{ transform: 'scale(1.13)' }}
            label={''}
          />
        </Grid>}
    </Grid>);
  }

  return skeletonArray;
};

export default function ReferendaTracks({ filterDelegatedTracks, filterLockedTracks, firstSelections, maximumHeight = '175px', selectedTracks, setSelectedTracks, tracks }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const existingVotes = useMemo(() => {
    if (tracks && filterLockedTracks?.accountLocks !== undefined) {
      if (filterLockedTracks.accountLocks === null) {
        return null;
      }

      const result = {};

      filterLockedTracks.accountLocks.forEach((lock) => {
        if (!result[lock.classId]) {
          result[lock.classId] = 1;
        } else {
          result[lock.classId]++;
        }
      });

      // const replacedKey = Object.keys(result).reduce((acc, key) => {
      //   const newKey = tracks.find((value) => String(value[0]) === key)?.[1].name; // Convert numeric key to track names

      //   acc[newKey] = result[key];

      //   return acc;
      // }, {});

      return result;
    }

    return undefined;
  }, [filterLockedTracks?.accountLocks, tracks]);

  const availableToSelect = useMemo(() => {
    if (!tracks || tracks.length === 0) {
      return [];
    }

    let toSelect = [];

    if (filterLockedTracks && existingVotes) {
      const availableTracks = tracks.filter((track) => !(track[0] in existingVotes));

      toSelect = availableTracks.map((track) => track[0]);
    } else if (!filterLockedTracks) {
      toSelect = selectedTracks.length !== tracks.length ? tracks.map((value) => value[0]) : [];
    } else {
      toSelect = tracks.map((track) => track[0]);
    }

    if (filterDelegatedTracks) {
      toSelect = toSelect.filter((track) => !filterDelegatedTracks.some((delegatedTrack) => delegatedTrack.eq(track)));
    }

    return toSelect;
  }, [existingVotes, filterLockedTracks, filterDelegatedTracks, selectedTracks.length, tracks]);

  const allSelected = useMemo(() => {
    const sortFunction = (valueOne: BN, valueTwo: BN) => valueOne.gt(valueTwo) ? -1 : 1;
    const arrOne = [...availableToSelect];
    const arrTwo = [...selectedTracks];

    return JSON.stringify(arrOne.sort(sortFunction)) === JSON.stringify(arrTwo.sort(sortFunction));
  }, [availableToSelect, selectedTracks]);

  const onSelectAll = useCallback(() => {
    const toCheck = allSelected ? [] : availableToSelect;

    setSelectedTracks(toCheck);
  }, [allSelected, availableToSelect, setSelectedTracks]);

  const handleToggle = (value: BN, nullifier: boolean) => () => {
    if (nullifier) {
      return;
    }

    const currentIndex = selectedTracks.findIndex((track) => track.eq(value));
    const newChecked = [...selectedTracks];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedTracks(newChecked);
  };

  return (
    <>
      <Grid container justifyContent='space-between' pt='15px'>
        <Grid item>
          <Infotip2 iconTop={26} showQuestionMark text={t<string>('Please select the categories for which you would like to delegate your votes.')}>
            <Typography fontSize='16px' fontWeight={400} sx={{ textAlign: 'left' }}>
              {t('Referenda Category')}
            </Typography>
          </Infotip2>
        </Grid>
        <Grid item onClick={onSelectAll}>
          <Typography fontSize='16px' fontWeight={400} sx={{ color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: 'pointer', textAlign: 'left', textDecorationLine: 'underline' }}>
            {allSelected ? t('Deselect All') : t('Select All')}
          </Typography>
        </Grid>
      </Grid>
      <List disablePadding sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'primary.main', borderRadius: '5px', maxHeight: maximumHeight, maxWidth: '100%', minHeight: '175px', overflowY: 'scroll', width: '100%' }}>
        {tracks?.length
          ? tracks.map((value, index) => {
            const checked = selectedTracks.length !== 0 && !!selectedTracks.find((track) => track.eq(value[0]));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-prototype-builtins
            const trackVotes: number = existingVotes?.hasOwnProperty(value[0]) ? existingVotes[value[0]] : 0;
            const lockedTrack = filterLockedTracks?.accountLocks?.find((lock) => lock.classId.eq(value[0]));
            const trackLockExpired: boolean | undefined = filterLockedTracks && lockedTrack && !!filterLockedTracks.currentBlockNumber && getLockedUntil(lockedTrack.endBlock, filterLockedTracks.currentBlockNumber) === 'finished';
            const filterTrack = filterDelegatedTracks && filterDelegatedTracks.some((filterT) => filterT.eq(value[0]));
            const deselected = firstSelections?.some((track) => track.eq(value[0]));

            return (
              <ListItem
                disablePadding
                key={index}
                sx={{ bgcolor: deselected ? '#EBCCDC' : 'inherit', height: '25px' }}
              >
                <ListItemButton dense onClick={handleToggle(value[0], !!trackVotes || !!filterTrack)} role={undefined} sx={{ py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        {(!!trackVotes && !trackLockExpired) || filterTrack || (!!trackVotes && trackLockExpired)
                          ? <Infotip2
                            showInfoMark={!trackLockExpired}
                            showWarningMark={trackLockExpired}
                            text={
                              filterTrack
                                ? t<string>('Already delegated to another account')
                                : trackLockExpired
                                  ? t<string>('This category includes expired locks that can be unlocked and made available.')
                                  : t<string>('Has already {{trackVotes}} vote(s)/lock', { replace: { trackVotes } })
                            }
                          >
                            <Typography fontSize='16px' fontWeight={checked ? 500 : 400}>
                              {`${toTitleCase(value[1].name as unknown as string) as string}`}
                            </Typography>
                          </Infotip2>
                          : <Typography fontSize='16px' fontWeight={checked ? 500 : 400}>
                            {`${toTitleCase(value[1].name as unknown as string) as string}`}
                          </Typography>
                        }
                      </>
                    }
                  />
                  <ListItemIcon sx={{ minWidth: '20px' }}>
                    <Checkbox2
                      checked={checked}
                      disabled={!!trackVotes || filterTrack}
                      iconStyle={{ backgroundColor: !!trackVotes || trackLockExpired || filterTrack ? '#747474' : 'inherit', borderRadius: '5px', transform: 'scale(1.13)' }}
                      label={''}
                    />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            );
          })
          : <LoadingSkeleton skeletonsNum={7} withCheckBox />
        }
      </List>
    </>
  );
}
