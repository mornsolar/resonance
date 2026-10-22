import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedStories } from '../lib/stories';
import { url } from '../lib/url';
import { SITE_NAME } from '../lib/config';

export async function GET(context: APIContext) {
  const stories = await getPublishedStories();
  return rss({
    title: `${SITE_NAME}: stories`,
    description: 'Real days and small experiments about living more intentionally with technology.',
    site: context.site!,
    items: stories.map((story) => ({
      title: story.data.title,
      description: story.data.summary,
      pubDate: story.data.date,
      link: url(`/stories/${story.id}/`),
    })),
  });
}
