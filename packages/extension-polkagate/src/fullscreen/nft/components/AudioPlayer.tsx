// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AudioPlayerProps } from '../utils/types';

import { PauseCircle as PauseCircleIcon, PlayCircle as PlayCircleIcon } from '@mui/icons-material';
import { Grid, IconButton, Slider, Typography } from '@mui/material';
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
    <Grid container item sx={{ bgcolor: 'background.paper', borderRadius: '50px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', width: '320px' }}>
      <audio
        ref={audioRef}
        src={audioUrl}
      />
      <Grid alignItems='center' container item>
        <IconButton
          onClick={togglePlayPause}
          sx={{ width: 'fit-content' }}
        >
          {isPlaying
            ? <PauseCircleIcon sx={{ color: 'primary.main' }} />
            : <PlayCircleIcon sx={{ color: 'primary.main' }} />
          }
        </IconButton>
        <Grid alignItems='center' container item justifyContent='space-between' px='10px' xs>
          <Typography fontSize='14px' fontWeight={400}>
            {formatTime(currentTime)}
          </Typography>
          <Slider
            aria-labelledby='continuous-slider'
            max={duration}
            min={0}
            onChange={handleSeek}
            sx={{
              color: 'primary.main',
              width: '170px'
            }}
            value={currentTime}
          />
          <Typography fontSize='14px' fontWeight={400}>
            {formatTime(duration)}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
