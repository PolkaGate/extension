// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Link, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import semver from 'semver';

import { SharePopup } from '@polkadot/extension-polkagate/src/partials';

import { celebration } from '../../assets/gif';
import { CometStar, Gear } from '../../assets/icons';
import { logoTransparent } from '../../assets/logos';
import { GradientButton, GradientDivider, Progress } from '../../components';
import { useManifest } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { RedGradient } from '../../style';
import { EXTENSION_NAME } from '../../util/constants';
import { type News, news } from './news';

interface ChangeItemsType {
  title?: string;
  issueNumber?: string;
  issueUrl?: string;
  commitNumber?: string;
  commitUrl?: string;
  description?: string;
}

type ChangesType = 'features' | 'bug fixes';

interface Changes {
  type: ChangesType;
  items: ChangeItemsType[];
}

interface ChangeLogEntry {
  version: string;
  date: string;
  changes: Changes[];
}

/**
* Parses changelog markdown text into structured data.
* Expected changelog format:
* - Each version starts with '# [version] (date)' or '## [version] (date)'.
* - Change types (e.g., 'Added', 'Fixed') are indicated by '### ChangeType'.
* - Individual changes are listed under change types, prefixed by '* '.
* - Supports optional issue numbers (#123) and commit hashes (abcdef1).
*
* @param {string} changelogText - Raw changelog content as a string.
* @returns {ChangeLogEntry[]} - Parsed list of change entries with their types and descriptions.
*/
function parseChangelog (changelogText: string): ChangeLogEntry[] {
  const entries: ChangeLogEntry[] = []; // Stores parsed changelog entries
  const lines = changelogText.split('\n'); // Split input text into lines

  let currentEntry: ChangeLogEntry | null = null; // Holds the current version being processed
  let currentChangeType: ChangesType | null = null; // Keeps track of the current change category
  let currentChangeItems: ChangeItemsType[] = []; // Holds  the current change items

  for (const line of lines) {
    // Detects the start of a new version entry
    if (line.startsWith('# [') || line.startsWith('## [')) {
      // If there's an active entry, push it to the entries list
      if (currentEntry) {
        entries.push(currentEntry);

        // Add the change to the current entry
        if (currentChangeType && currentChangeItems.length > 0) {
          currentEntry.changes.push({
            items: currentChangeItems,
            type: currentChangeType
          });

          currentChangeItems = [];
        }
      }

      // Extract version and date using regular expression
      const [_, version, date] = line.match(/\[\s*([\d.]+)\s*].*?(\d{4}-\d{2}-\d{2})/) || [];

      // Initialize a new entry for the detected version
      currentEntry = { changes: [], date, version };
      currentChangeType = null; // Reset change type for the new version

      // Detects a new change type (e.g., '### Added')
    } else if (line.startsWith('### ')) {
      // Add the change to the current entry
      if (currentChangeType && currentEntry && currentChangeItems.length > 0) {
        currentEntry.changes.push({
          items: currentChangeItems,
          type: currentChangeType
        });

        currentChangeItems = [];
      }

      currentChangeType = line.replace('### ', '').trim().toLowerCase() as ChangesType;

      // Parses individual changes under a change type
    } else if (line.startsWith('* ') && currentEntry && currentChangeType) {
      // Extracts the change description
      const description = line.replace('* ', '').trim();
      const titleMatch = description.match(/^(.*?) \(\[/);
      const issueMatch = description.match(/\[#(\d+)\]\((https:\/\/github\.com\/.*?\/issues\/\d+)\)/);
      const commitMatch = description.match(/\[([a-f0-9]+)\]\((https:\/\/github\.com\/.*?\/commit\/[a-f0-9]+)\)/);

      currentChangeItems.push({
        commitNumber: commitMatch ? commitMatch[1] : '',
        commitUrl: commitMatch ? commitMatch[2] : '',
        issueNumber: issueMatch ? `#${issueMatch[1]}` : '',
        issueUrl: issueMatch ? issueMatch[2] : '',
        title: titleMatch ? titleMatch[1] : ''
      });
    }
  }

  // Push the final entry if it exists
  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

function UL ({ note }: { note: string }) {
  const [title, description] = note.split(':');

  return (
    <Grid columnGap='8px' container item sx={{ overflowWrap: 'anywhere' }}>
      <Box sx={{ bgcolor: '#FF4FB9', borderRadius: '1px', height: '8px', m: '6px', rotate: '45deg', width: '8px' }} />
      <Typography color='text.secondary' sx={{ maxWidth: 'calc(100% - 40px)', textAlign: 'left', textTransform: 'capitalize', width: 'fit-content' }} variant='B-2'>
        {title}{': '}
        <Typography color='text.secondary' variant='B-1'>
          {description}
        </Typography>
      </Typography>
    </Grid>
  );
}

function ChangeItem ({ item }: { item: ChangeItemsType }) {
  return (
    <Grid columnGap='8px' container item>
      <Box sx={{ bgcolor: '#FF4FB9', borderRadius: '1px', height: '8px', m: '6px', rotate: '45deg', width: '8px' }} />
      <Typography color='text.secondary' sx={{ maxWidth: 'calc(100% - 40px)', textAlign: 'left', textTransform: 'capitalize', width: 'fit-content' }} variant='B-1'>
        {item.title}
        {item.issueNumber && item.issueUrl &&
          <Link href={item.issueUrl} sx={{ color: '#AA83DC', pl: '5px' }}>
            ({item.issueNumber})
          </Link>}
        {item.commitUrl && item.commitNumber &&
          <Link href={item.commitUrl} sx={{ color: '#AA83DC', pl: '5px' }}>
            ({item.commitNumber})
          </Link>}
      </Typography>
    </Grid>
  );
}

function ChangeItems ({ change }: { change: Changes }) {
  const icon = (change.type === 'features' ? CometStar : Gear) as string;
  const { bugFixesDescriptions, featuresDescriptions, pullRequests } = useMemo(() => {
    const filterDescriptions = (items: ChangeItemsType[]) =>
      items
        .filter(({ description, title }) => !title && description)
        .map(({ description }) => description)
        .filter((description) => !!description) as string[];

    return {
      bugFixesDescriptions: change.type === 'bug fixes' ? filterDescriptions(change.items) : [],
      featuresDescriptions: change.type === 'features' ? filterDescriptions(change.items) : [],
      pullRequests: change.items.filter(({ description, title }) => title && !description)
    };
  }, [change.items, change.type]);

  return (
    <Stack sx={{ rowGap: '10px', width: '100%' }}>
      <Grid alignItems='center' columnGap='8px' container item>
        <Box
          component='img'
          src={icon}
          sx={{ height: '18px', width: '18px' }}
        />
        <Typography color='#AA83DC' textTransform='capitalize' variant='B-2' width='fit-content'>
          {change.type}
        </Typography>
      </Grid>
      {featuresDescriptions.map((description, index) => (
        <UL key={index} note={description} />
      ))}
      {pullRequests.map((item, index) => (
        <ChangeItem
          item={item}
          key={index}
        />
      ))}
      {bugFixesDescriptions.map((description, index) => (
        <UL key={index} note={description} />
      ))}
    </Stack>
  );
}

function NewVersionItem ({ item }: { item: ChangeLogEntry }) {
  return (
    <Stack sx={{ rowGap: '15px', width: '100%' }}>
      <Grid alignItems='center' columnGap='5px' container item>
        <Typography color='text.secondary' fontFamily='Inter' fontSize='16px' fontWeight={600} width='fit-content'>
          {EXTENSION_NAME}
        </Typography>
        <Typography color='text.primary' variant='B-3' width='fit-content'>
          {item.version}
        </Typography>
        <Typography color='text.secondary' variant='B-2' width='fit-content'>
          ({item.date})
        </Typography>
      </Grid>
      {item.changes.map((change, index) => (
        <ChangeItems
          change={change}
          key={index}
        />
      ))}
    </Stack>
  );
}

const CHANGE_LOG_PATH = 'https://raw.githubusercontent.com/PolkaGate/extension/main/CHANGELOG.md';

interface Props {
  openMenu: boolean;
  newVersion?: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChangeLog ({ newVersion, openMenu, setShowAlert }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const manifest = useManifest();

  const [localNews, setLocalNews] = useState<News[]>([]);
  const [changelog, setChangelog] = useState<ChangeLogEntry[] | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const openPopup = useMemo(() => newVersion ? Boolean(openMenu && changelog) : openMenu, [changelog, newVersion, openMenu]);

  const getVersion = useCallback((version: string | undefined) => semver.valid(version) || semver.coerce(version)?.version, []);

  const newVersionsToShow: ChangeLogEntry[] | undefined = useMemo(() => {
    if (!changelog || !localNews) {
      return undefined;
    }

    const usingVersionRaw = window.localStorage.getItem('using_version') || '';
    const usingVersion = getVersion(usingVersionRaw) || '0.0.0';
    const extensionCurrentVersionRaw = manifest?.version || usingVersionRaw;
    const extensionCurrentVersion = getVersion(extensionCurrentVersionRaw) || null;

    const filteredChangelog = changelog.filter(({ version }) => {
      const v = getVersion(version);

      return v
        ? (!newVersion || semver.gt(v, usingVersion)) && (!extensionCurrentVersion || semver.lte(v, extensionCurrentVersion))
        : false;
    });

    const mergedChangelog = filteredChangelog.map((entry) => {
      const localEntry = localNews.find((local) => local.version === entry.version);

      if (!localEntry) {
        return entry;
      }

      let bugFixesChanges;
      const bugFixesChangesItems = entry.changes.filter(({ type }) => type === 'bug fixes').flatMap(({ items }) => items);
      let featuresChanges;
      const featuresChangesItems = entry.changes.filter(({ type }) => type === 'features').flatMap(({ items }) => items);

      if (localEntry['bug fixes']?.length || bugFixesChangesItems.length > 0) {
        const localBugFixesChangesItems = localEntry['bug fixes']?.map((description) => ({ description } as ChangeItemsType)) ?? [];

        bugFixesChanges = {
          items: [...bugFixesChangesItems, ...localBugFixesChangesItems],
          type: 'bug fixes'
        } as Changes;
      }

      if (localEntry.features?.length || featuresChangesItems.length > 0) {
        const localFeaturesChangesItems = localEntry.features?.map((description) => ({ description } as ChangeItemsType)) ?? [];

        featuresChanges = {
          items: [...featuresChangesItems, ...localFeaturesChangesItems],
          type: 'features'
        } as Changes;
      }

      return {
        ...entry,
        changes: [featuresChanges, bugFixesChanges].filter((item) => item !== undefined)
      };
    });

    return mergedChangelog;
  }, [changelog, getVersion, localNews, manifest?.version, newVersion]);

  useEffect(() => {
    const fetchChangelog = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(CHANGE_LOG_PATH);

        if (!response.ok) {
          throw new Error(`Failed to fetch changelog: ${response.statusText}`);
        }

        const markdown = await response.text();
        const parsedChangelog = parseChangelog(markdown);

        setChangelog(parsedChangelog);

        const usingVersion = window.localStorage.getItem('using_version');

        if (usingVersion) {
          const filteredNews = news.filter(
            ({ version }) => semver.lt(usingVersion, version)
          );

          setLocalNews(filteredNews);
        }
      } catch (error) {
        console.error('Error fetching changelog:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChangelog().catch(console.error);
  }, []);

  const handleClose = useCallback(() => {
    setShowAlert(false);
  }, [setShowAlert]);

  const onClose = useCallback(() => {
    newVersion && window.localStorage.setItem('using_version', getVersion(manifest?.version) || '0.1.0');
    setShowAlert(false);
  }, [getVersion, setShowAlert, manifest?.version, newVersion]);

  return (
    <SharePopup
      modalProps={{
        noDivider: true
      }}
      modalStyle={{ minHeight: '500px', overflow: 'hidden', paddingTop: '33px' }}
      onClose={handleClose}
      open={openPopup}
      popupProps={{
        maxHeight: '514px',
        px: 0,
        withoutTopBorder: true
      }}
    >
      <Stack direction='column' sx={{ p: '10px 10px 0', position: 'relative', width: '100%', zIndex: 1 }}>
        {!isLoading && newVersion &&
          <Box
            component='img'
            src={celebration as string}
            sx={{ height: '235px', left: 0, position: 'absolute', right: 0, top: 0, width: '100%' }}
          />
        }
        <Grid alignItems='center' columnGap='10px' container item justifyContent='center' p='10px' sx={{ flexWrap: 'nowrap' }}>
          <Box
            component='img'
            src={logoTransparent as string}
            sx={{ height: '30px', width: '30px' }}
          />
          <Typography color='#fff' sx={{ whiteSpace: 'nowrap' }} textTransform='uppercase' variant='H-2'>
            {t('change log')}
          </Typography>
        </Grid>
        <RedGradient style={{ top: '-130px' }} />
        <GradientDivider />
        <Box sx={{ maxHeight: '440px', overflowY: 'auto', position: 'relative', width: '100%' }}>
          {!isLoading &&
            <>
              <Grid container item sx={{ pb: '5px', position: 'relative', zIndex: 1 }}>
                <Stack sx={{ height: '380px', overflow: 'hidden', overflowY: 'auto', pt: '20px', rowGap: '20px', width: '100%' }}>
                  {newVersionsToShow?.map((change, index) => (
                    <NewVersionItem
                      item={change}
                      key={index}
                    />
                  ))}
                </Stack>
                <GradientButton
                  contentPlacement='center'
                  onClick={onClose}
                  style={{
                    height: '44px',
                    marginTop: '10px',
                    width: '345px'
                  }}
                  text={t('Wow, it’s great!')}
                />
              </Grid>
            </>
          }
        </Box>
        {isLoading &&
          <Progress
            title={t('Loading, please wait')}
            withEllipsis
          />
        }
      </Stack>
    </SharePopup>
  );
}
