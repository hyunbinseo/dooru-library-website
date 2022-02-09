import { tick } from 'svelte';
import { writable, derived } from 'svelte/store';

import focusLock from 'dom-focus-lock';

import stories from '$lib/stories/data';

import type { SortOption, Language, Level, Topic, Story } from '$lib/stories/types';

export const isLoaded = writable<boolean>(false);

export const selSort = writable<SortOption>('number');
export const selLanguage = writable<Language>('ko-kr');
export const selLevel = writable<Level | undefined>();
export const selTopic = writable<Topic | undefined>();

export const sidebarEl = writable<HTMLElement>();
export const sidebarToggleEl = writable<HTMLElement>();
export const sidebarState = (() => {
  const { subscribe, set } = writable<boolean>(false);
  return {
    subscribe,
    expand: async () => {
      document.body.classList.add('overflow-hidden');
      set(true);
      await tick();
      sidebarEl.subscribe((el) => {
        if (el) focusLock.on(el);
      });
    },
    collapse: () => {
      document.body.classList.remove('overflow-hidden');
      sidebarEl.subscribe((el) => {
        if (el) focusLock.off(el);
      });
      set(false);
      sidebarToggleEl.subscribe((el) => {
        el?.focus();
      });
    },
  };
})();

export const reqStories = derived(
  [isLoaded, selSort, selLanguage, selLevel, selTopic],
  ([$isLoaded, $selSort, $selLanguage, $selLevel, $selTopic]): Story[] => {
    if (!$isLoaded) return [];

    const filtered = stories
      .filter(({ language }) => language === $selLanguage)
      .filter(({ level }) => ($selLevel ? level === $selLevel : true))
      .filter(({ topics }) => ($selTopic ? topics.has($selTopic) : true));

    // Data is currently sorted by story number
    if ($selSort === 'number') return filtered;

    if ($selSort === 'abc') return filtered
      .sort(({ title: titleA }, { title: titleB }) => {
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });

    return filtered;
  },
);
