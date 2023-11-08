// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme } from '@mui/material';
import OpenAI from 'openai';

const API_KEY = process.env.OPEN_AI_API;

const openai = new OpenAI({
  organization: 'polkagate',
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

export const getImage = async (theme: Theme): Promise<string> => {
  const bgColor = theme.palette.mode === 'dark' ? 'black' : 'white';
  const response = await openai.images.generate({
    model: 'dall-e-2', //'dall-e-3',
    n: 1,
    prompt: `Create a visually appealing image with polkadot-inspired abstract patterns and a transparent gradient. The image background color must be ${bgColor}. The image should have circles, dots, and lines in different colors and sizes. The upper half of the image should be clear and simple, while the lower half should be more complex and colorful. The image should have a high contrast and a modern and sleek design that aligns with the Polkadot ecosystem. The image should be responsive to different screen sizes and orientations.`,
    response_format: 'b64_json',
    size: '256x256' // '1024x1792'
  });

  const image = response.data[0].b64_json as string;

  chrome.storage.local.set({ backgroundImage: { [theme.palette.mode]: image } }).catch(console.error);

  return image;
};
