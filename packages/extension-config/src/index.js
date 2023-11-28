// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module using import.meta.url
const currentDir = fileURLToPath(new URL('.', import.meta.url));

const logosDir = path.join(currentDir, 'icons/logos/');
const tokensDir = path.join(currentDir, 'icons/tokens');

const buildDir = path.join(currentDir, 'build');
const indexJsPath = path.join(buildDir, 'index.js');

// Read SVG files from src/icons/
const logosSvgFiles = fs.readdirSync(logosDir).filter((file) => file.endsWith('.svg'));
const tokensSvgFiles = fs.readdirSync(tokensDir).filter((file) => file.endsWith('.svg'));

// Convert each SVG to base64 and generate export statements
const logosExportStatements = logosSvgFiles.map((file) => {
  const svgPath = path.join(logosDir, file);
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const base64 = Buffer.from(svgContent).toString('base64');

  return `export const ${file.replace('.svg', '')} = 'data:image/svg+xml;base64,${base64}';`;
});

const tokensExportStatements = tokensSvgFiles.map((file) => {
  const svgPath = path.join(tokensDir, file);
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const base64 = Buffer.from(svgContent).toString('base64');

  return `export const ${file.replace('.svg', '')} = 'data:image/svg+xml;base64,${base64}';`;
});

// Write index.js with export statements
fs.writeFileSync(indexJsPath, [...logosExportStatements, ...tokensExportStatements].join('\n'));

console.log('Icons converted and index.js created.');
