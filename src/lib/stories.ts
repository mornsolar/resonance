import { getCollection, type CollectionEntry } from 'astro:content';

export type Story = CollectionEntry<'stories'>;

export async function getPublishedStories(): Promise<Story[]> {
  const stories = await getCollection('stories', ({ data }) => !data.draft);
  return stories.toSorted((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
