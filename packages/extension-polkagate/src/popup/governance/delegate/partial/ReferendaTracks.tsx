// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { BN } from '@polkadot/util';

import { Checkbox2, Infotip2 } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { Track } from '../../../../hooks/useTrack';
import { toTitleCase } from '../../utils/util';

interface Props {
  selectedTracks: BN[];
  unvotedTracks: Track[] | undefined;
  setSelectedTracks: React.Dispatch<React.SetStateAction<BN[]>>
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

export default function ReferendaTracks({ selectedTracks, setSelectedTracks, unvotedTracks }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const onSelectAll = useCallback(() => {
    const toChecked = unvotedTracks && selectedTracks.length !== unvotedTracks.length ? unvotedTracks.map((value) => value[0]) : [];

    setSelectedTracks(toChecked);
  }, [selectedTracks.length, setSelectedTracks, unvotedTracks]);

  const handleToggle = (value: BN) => () => {
    const currentIndex = selectedTracks.indexOf(value);
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
            {selectedTracks.length === unvotedTracks?.length ? t('Deselect All') : t('Select All')}
          </Typography>
        </Grid>
      </Grid>
      <List disablePadding sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'primary.main', borderRadius: '5px', height: '175px', maxWidth: '100%', overflowY: 'scroll', width: '100%' }}>
        {unvotedTracks?.length
          ? unvotedTracks.map((value, index) => (
            <ListItem
              disablePadding
              key={index}
              sx={{ height: '25px' }}
            >
              <ListItemButton dense onClick={handleToggle(value[0])} role={undefined} sx={{ py: 0 }}>
                <ListItemText
                  primary={
                    <Typography fontSize='16px'>
                      {toTitleCase(value[1].name as unknown as string) as string}
                    </Typography>
                  }
                />
                <ListItemIcon sx={{ minWidth: '20px' }}>
                  <Checkbox2
                    checked={selectedTracks.indexOf(value[0]) !== -1}
                    iconStyle={{ transform: 'scale(1.13)' }}
                    label={''}
                  />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))
          : <LoadingSkeleton skeletonsNum={7} withCheckBox />
        }
      </List>
    </>
  );
}
