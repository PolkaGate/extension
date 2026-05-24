// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface TabProps {
  payload: string;
  type: 'NAVIGATE_TO'
}

export const switchToOrOpenTab = (relativeUrl: string, closeCurrentTab?: boolean): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]?.url) {
      const extensionUrl = tabs[0].url;
      const extensionBaseUrl = extensionUrl.split('#')[0];

      const tabUrl = `${extensionBaseUrl}#${relativeUrl}`;

      chrome.tabs.query({}, function (allTabs) {
        const existingTab = allTabs.find(function (tab) {
          return tab.url === tabUrl;
        });

        const tabId = existingTab?.id;

        if (tabId) {
          chrome.tabs.update(tabId, { active: true }, () => {
            chrome.tabs.sendMessage(tabId, {
              payload: relativeUrl,
              type: 'NAVIGATE_TO'
            }, (res) => {
              if (!res?.success) {
                chrome.tabs.reload(tabId).catch(console.error);
              }
            });
          });
        } else {
          chrome.tabs.create({ url: tabUrl }).catch(console.error);
        }

        closeCurrentTab && window.close();
      });
    } else {
      console.error('Unable to retrieve extension URL.');
    }
  });
};
