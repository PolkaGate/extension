// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface Commit {
  commit: {
    author: {
      date: string;
    };
  };
}

export interface MsData {
  address: string;
  tag_name_verbose: string;
  tag_type_verbose: string;
  tag_subtype_verbose: string;
  address_type: string;
  updated_at: string;
  record_type: string;
}

interface Data {
  results: {
    address: string;
    tag_name_verbose: string;
    tag_type_verbose: string;
    tag_subtype_verbose: string;
    address_type: string;
    updated_at: string;
    record_type: string;
  }[];
}

const OWNER = 'Nick-1979';
const REPO = 'mScience';
const FILE_PATH = 'data.json';

export async function getLastMsUpdateTime(): Promise<string> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/commits?path=${FILE_PATH}`;

  try {
    const response = await fetch(url);
    const commits: Commit[] = await response.json();

    if (commits.length > 0) {
      const lastCommit = commits[0];
      const lastUpdate = lastCommit.commit.author.date;

      console.log('Last update time:', lastUpdate);

      return lastUpdate;
    }
  } catch (error) {
    console.error('Error occurred while fetching the last update time:', error.message);
  }

  return '';
}

export async function getJsonFileFromRepo(): Promise<MsData[] | undefined> {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/master/${FILE_PATH}`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      const json = await response.json() as Data;

      return json?.results;
    } else {
      throw new Error(`Failed to fetch JSON file. Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch JSON file: ${error.message}`);
  }
}
