// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AudioPlayerProps } from '../utils/types';

import { Grid, IconButton, Slider, Stack, Typography } from '@mui/material';
import { PauseCircle, PlayCircle } from 'iconsax-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ audioUrl }: AudioPlayerProps): React.ReactElement {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }

    return undefined;
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }

      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((_event: Event, newValue: number | number[]) => {
    const time = newValue as number;

    setCurrentTime(time);

    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '8px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)' }}>
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
      />
      <Grid alignItems='center' container item sx={{ m: '5px' }}>
        <IconButton
          onClick={togglePlayPause}
          sx={{ p: '5px', width: 'fit-content' }}
        >
          {isPlaying
            ? <PauseCircle color='#AA83DC' size='18' variant='Bold' />
            : <PlayCircle color='#AA83DC' size='18' variant='Bold' />
          }
        </IconButton>
        <Grid alignItems='center' container item justifyContent='space-between' px='10px' xs>
          <Slider
            aria-labelledby='continuous-slider'
            max={duration}
            min={0}
            onChange={handleSeek}
            sx={{
              '& .MuiSlider-thumb': {
                height: 8,
                width: 8
              },
              color: '#AA83DC',
              height: '2px',
              py: '5px',
              width: '100%'
            }}
            value={currentTime}
          />
          <Stack direction='row' justifyContent='space-between' width='100%'>
            <Typography color='#EAEBF1' fontSize='10px' variant='S-2'>
              {formatTime(currentTime)}
            </Typography>
            <Typography color='#AA83DC' fontSize='10px' variant='S-2'>
              {formatTime(duration)}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
}
