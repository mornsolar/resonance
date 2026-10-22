import { getCollection, type CollectionEntry } from 'astro:content';

export type Story = CollectionEntry<'stories'>;

const WORDS_PER_MINUTE = 220;

export async function getPublishedStories(): Promise<Story[]> {
  const stories = await getCollection('stories', ({ data }) => !data.draft);
  return stories.toSorted((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function readingMinutes(story: Story): number {
  const wordCount = (story.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
