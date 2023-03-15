import { RenderableTreeNode, RenderableTreeNodes, Tag } from '@markdoc/markdoc';
import { slugifyWithCounter } from '@sindresorhus/slugify';

function getNodeText(node: RenderableTreeNode) {
  if (!Tag.isTag(node)) return '';

  let text = '';
  for (const child of node.children) {
    if (typeof child === 'string') {
      text += child;
    }
    text += getNodeText(child);
  }
  return text;
}

export type Section = {
  title: string;
  children: Section[];
} & Tag['attributes'];

export type TableOfContents = Section[];

export function collectHeadings(
  nodes: RenderableTreeNodes,
  slugify = slugifyWithCounter()
) {
  if (!Array.isArray(nodes)) return [];

  const sections: Section[] = [];

  for (const node of nodes) {
    if (!Tag.isTag(node)) continue;

    if (node.name === 'h2' || node.name === 'h3') {
      const title = getNodeText(node);
      if (title) {
        const id = slugify(title);
        node.attributes.id = id;
        if (node.name === 'h3') {
          if (!sections[sections.length - 1]) {
            throw new Error(
              'Cannot add `h3` to table of contents without a preceding `h2`'
            );
          }
          sections[sections.length - 1].children.push({
            ...node.attributes,
            title,
            children: [],
          });
        } else {
          sections.push({ ...node.attributes, title, children: [] });
        }
      }
    }
    sections.concat(collectHeadings(node.children ?? [], slugify));
  }

  return sections;
}
