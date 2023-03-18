import { nodes as defaultNodes } from '@markdoc/markdoc';
import Link from 'next/link';

import { Fence } from '@/components/Fence';

/** @type {import('@markdoc/markdoc').ConfigType['nodes']} */
const nodes = {
  document: {
    render: undefined,
  },
  link: {
    ...defaultNodes.link,
    render: ({ href, children }) =>
      href && href.startsWith('/') ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener">
          {children}
        </a>
      ),
  },
  th: {
    ...defaultNodes.th,
    attributes: {
      ...defaultNodes.th.attributes,
      scope: {
        type: String,
        default: 'col',
      },
    },
  },
  fence: {
    render: Fence,
    attributes: {
      language: {
        type: String,
      },
    },
  },
};

export default nodes;
