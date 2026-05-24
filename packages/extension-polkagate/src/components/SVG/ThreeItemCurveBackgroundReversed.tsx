// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import React from 'react';

interface Props {
  reverse?: boolean;
  mode?: 'dark' | 'light';
}

const ThreeItemCurveBackgroundReversed = ({ mode }: Props) => (
  <svg fill='none' height='91' transform={'rotate(180)'} viewBox='0 0 168 91' width='168' xmlns='http://www.w3.org/2000/svg'>
    <g filter='url(#filter0_d_248_3777)' opacity='0.9'>
      <mask fill='white' id='path-1-inside-1_248_3777'>
        <path clipRule='evenodd' d='M9.59619 74.463C14.2814 37.5448 45.805 9 83.9956 9C121.467 9 152.52 36.4801 158.102 72.3869L105.298 80.902C102.81 71.1839 93.9938 64 83.5 64C73.0873 64 64.3268 71.0731 61.7608 80.6768L9.59619 74.463Z' fillRule='evenodd' />
      </mask>
      <path clipRule='evenodd' d='M9.59619 74.463C14.2814 37.5448 45.805 9 83.9956 9C121.467 9 152.52 36.4801 158.102 72.3869L105.298 80.902C102.81 71.1839 93.9938 64 83.5 64C73.0873 64 64.3268 71.0731 61.7608 80.6768L9.59619 74.463Z' fill={mode === 'dark' ? 'black' : 'white'} fillRule='evenodd' />
      <path d='M9.59619 74.463L8.60415 74.3371L8.47728 75.3368L9.47791 75.456L9.59619 74.463ZM158.102 72.3869L158.261 73.3741L159.243 73.2158L159.09 72.2333L158.102 72.3869ZM105.298 80.902L104.329 81.1501L104.556 82.0346L105.457 81.8893L105.298 80.902ZM61.7608 80.6768L61.6425 81.6698L62.5031 81.7724L62.7269 80.935L61.7608 80.6768ZM83.9956 8C45.295 8 13.352 36.9256 8.60415 74.3371L10.5882 74.5889C15.2108 38.164 46.315 10 83.9956 10V8ZM159.09 72.2333C153.434 35.8469 121.968 8 83.9956 8V10C120.967 10 151.607 37.1133 157.114 72.5405L159.09 72.2333ZM157.943 71.3997L105.139 79.9148L105.457 81.8893L158.261 73.3741L157.943 71.3997ZM106.267 80.654C103.668 70.5042 94.4615 63 83.5 63V65C93.526 65 101.952 71.8637 104.329 81.1501L106.267 80.654ZM83.5 63C72.6232 63 63.4746 70.3885 60.7947 80.4187L62.7269 80.935C65.1789 71.7578 73.5515 65 83.5 65V63ZM61.8791 79.6839L9.71447 73.47L9.47791 75.456L61.6425 81.6698L61.8791 79.6839Z' fill='#BA2882' mask='url(#path-1-inside-1_248_3777)' />
    </g>
    <defs>
      <filter colorInterpolationFilters='sRGB' filterUnits='userSpaceOnUse' height='89.9019' id='filter0_d_248_3777' width='166.506' x='0.596191' y='0'>
        <feFlood floodOpacity='0' result='BackgroundImageFix' />
        <feColorMatrix in='SourceAlpha' result='hardAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' />
        <feOffset />
        <feComposite in2='hardAlpha' operator='out' />
        <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.8 0' />
        <feBlend in2='BackgroundImageFix' mode='normal' result='effect1_dropShadow_248_3777' />
        <feBlend in='SourceGraphic' in2='effect1_dropShadow_248_3777' mode='normal' result='shape' />
      </filter>
    </defs>
  </svg>

);

export default ThreeItemCurveBackgroundReversed;
