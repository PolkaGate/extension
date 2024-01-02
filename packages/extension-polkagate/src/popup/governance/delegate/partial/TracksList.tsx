// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React from 'react';

import { BN } from '@polkadot/util';

import { Infotip2 } from '../../../../components';
import { Track } from '../../utils/types';
import { toTitleCase } from '../../utils/util';

interface Props {
  tracks: Track[] | undefined;
  selectedTracks: BN[] | undefined;
}

export default function TracksList({ selectedTracks, tracks }: Props): React.ReactElement {
  const tracksToShow = React.useMemo(() => {
    if (!tracks || !selectedTracks) {
      return undefined;
    }

    return tracks.filter((track) => selectedTracks.find((selectedTrack) => selectedTrack.eq(track[0])));
  }, [selectedTracks, tracks]);

  const ListedTracks = () => (
    <>
      <Typography sx={{ maxHeight: '300px', maxWidth: '180px', overflowY: 'scroll' }} variant='body2'>
        <Grid container spacing={1}>
          {tracksToShow?.map((track, index) =>
            <React.Fragment key={index}>
              <Grid container item>
                <Typography fontSize='16px' fontWeight={400}>
                  {toTitleCase(track[1].name as unknown as string)}
                </Typography>
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </Typography>
    </>
  );

  return (
    <Grid container item xs={1}>
      <Infotip2 text={<ListedTracks />}>
        <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
      </Infotip2>
    </Grid>
  );
}
