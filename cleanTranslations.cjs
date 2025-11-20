// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
 
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, './packages/extension/public/locales');
const baseLang = 'en';
const baseFile = path.join(localesDir, baseLang, 'translation.json');

// Read the English base file
const baseKeys = Object.keys(JSON.parse(fs.readFileSync(baseFile, 'utf8')));

fs.readdirSync(localesDir).forEach(lang => {
  if (lang === baseLang) return; // Skip English

  const langFile = path.join(localesDir, lang, 'translation.json');
  if (!fs.existsSync(langFile)) return;

  const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));

  // Keep only keys that exist in English, preserve order
  const cleanedData = {};

  // First, add the keys that already exist in the language
  baseKeys.forEach(key => {
    if (key in langData) {
      cleanedData[key] = langData[key];
    }
  });

  // Add missing keys at the end with empty string value
  baseKeys.forEach(key => {
    if (!(key in cleanedData)) {
      cleanedData[key] = "";
    }
  });

  // Write back cleaned and sorted JSON with 2-space indentation
  const sortedData = {};
  baseKeys.forEach(key => {
    if (key in cleanedData) {
      sortedData[key] = cleanedData[key];
    }
  });

  // Write back to the file
  fs.writeFileSync(langFile, JSON.stringify(sortedData, null, 2), 'utf8');
  console.log(`Cleaned and sorted ${lang} translation.json`);
});