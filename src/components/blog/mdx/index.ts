// Shared MDX component registry. Pass this to <Content components={mdxComponents} />
// on every collection slug page (blog, projects, agent-convos) so these tags work
// in ANY .mdx without a per-file import. A local `import` inside an .mdx still wins
// over the registry, so existing files keep working unchanged.
//
// Note: these components live under blog/mdx/ for historical reasons but are not
// blog-specific — they render in every collection.
import Callout from './Callout.astro';
import DemoVideo from './DemoVideo.astro';
import Figure from './Figure.astro';
import ImageGrid from './ImageGrid.astro';
import Kbd from './Kbd.astro';
import Tweet from './Tweet.astro';
import Video from './Video.astro';
import YouTube from './YouTube.astro';

export const mdxComponents = {
	Callout,
	DemoVideo,
	Figure,
	ImageGrid,
	Kbd,
	Tweet,
	Video,
	YouTube,
};
