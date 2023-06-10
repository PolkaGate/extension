// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { BN } from '@polkadot/util';

import { Checkbox2, Infotip2 } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { Lock } from '../../../../hooks/useAccountLocks';
import { Track } from '../../utils/types';
import { getLockedUntil, toTitleCase } from '../../utils/util';

interface Props {
  selectedTracks: BN[];
  unvotedTracks: Track[] | undefined;
  setSelectedTracks: React.Dispatch<React.SetStateAction<BN[]>>;
  maximumHeight?: string;
  filterLockedTracks?: {
    lockTracks: object | null | undefined;
    currentBlockNumber: number | undefined;
    accountLocks: Lock[] | null | undefined;
  };
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

export default function ReferendaTracks ({ filterLockedTracks, maximumHeight = '175px', selectedTracks, setSelectedTracks, unvotedTracks }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const allSelected: BN[] = useMemo(() => {
    if (!unvotedTracks || unvotedTracks.length === 0) {
      return [];
    }

    if (filterLockedTracks && filterLockedTracks.lockTracks) {
      // eslint-disable-next-line no-prototype-builtins
      const availableTracks = unvotedTracks.filter((track) => !filterLockedTracks.lockTracks?.hasOwnProperty(track[0]));
      const toSelect = availableTracks.map((track) => track[0]);

      return toSelect;
    }

    if (!filterLockedTracks) {
      const toSelect = selectedTracks.length !== unvotedTracks.length ? unvotedTracks.map((value) => value[0]) : [];

      return toSelect;
    }

    return [];
  }, [filterLockedTracks, selectedTracks.length, unvotedTracks]);

  const onSelectAll = useCallback(() => {
    const toCheck = selectedTracks.length === allSelected.length ? [] : allSelected;

    setSelectedTracks(toCheck);
  }, [allSelected, selectedTracks.length, setSelectedTracks]);

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
          <Infotip2 iconTop={26} showQuestionMark text={t<string>('Please select all the categories in which you would like to delegate your votes.')}>
            <Typography fontSize='16px' fontWeight={400} sx={{ textAlign: 'left' }}>
              {t('Referenda Category')}
            </Typography>
          </Infotip2>
        </Grid>
        <Grid item onClick={onSelectAll}>
          <Typography fontSize='16px' fontWeight={400} sx={{ color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: 'pointer', textAlign: 'left', textDecorationLine: 'underline' }}>
            {selectedTracks.length === allSelected.length ? t('Deselect All') : t('Select All')}
          </Typography>
        </Grid>
      </Grid>
      <List disablePadding sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'primary.main', borderRadius: '5px', maxHeight: maximumHeight, maxWidth: '100%', minHeight: '175px', overflowY: 'scroll', width: '100%' }}>
        {unvotedTracks?.length
          ? unvotedTracks.map((value, index) => {
            const checked = selectedTracks.length !== 0 && !!selectedTracks.find((track) => track.eq(value[0]));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-prototype-builtins
            const trackVotes: number = filterLockedTracks?.lockTracks?.hasOwnProperty(value[0]) ? filterLockedTracks.lockTracks[value[0]] : 0;
            const lockedTrack = filterLockedTracks?.accountLocks?.find((lock) => lock.classId.eq(value[0]));
            const trackLockExpired: boolean | undefined = filterLockedTracks && lockedTrack && !!filterLockedTracks.currentBlockNumber && getLockedUntil(lockedTrack.endBlock, filterLockedTracks.currentBlockNumber) === 'finished';

            return (
              <ListItem
                disablePadding
                key={index}
                sx={{ bgcolor: trackLockExpired ? '#ffb80080' : trackVotes ? '#E8E0E5' : 'inherit', height: '25px' }}
              >
                <ListItemButton dense onClick={handleToggle(value[0], !!trackVotes)} role={undefined} sx={{ py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        {trackVotes && !trackLockExpired
                          ? <Typography fontSize='16px' fontWeight={checked ? 500 : 400}>
                            {`${toTitleCase(value[1].name as unknown as string) as string} (Has already ${trackVotes} votes)`}
                          </Typography>
                          : trackVotes && trackLockExpired
                            ? <Infotip2 showWarningMark text={t<string>('This category contains expired locks, which can be unlocked and available.')}>
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
                      disabled={!!trackVotes}
                      iconStyle={{ backgroundColor: !!trackVotes || trackLockExpired ? '#747474' : 'inherit', borderRadius: '5px', transform: 'scale(1.13)' }}
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
