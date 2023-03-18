import { useEffect, useState } from 'react';

import { TableOfContents } from '@/utils/parser';

const getHeadings = (tableOfContents: TableOfContents) =>
  tableOfContents
    .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
    .map((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const style = window.getComputedStyle(el);
      const scrollMt = parseFloat(style.scrollMarginTop);

      const top = window.scrollY + el.getBoundingClientRect().top - scrollMt;
      return { id, top };
    });

export default function useTableOfContents(tableOfContents: TableOfContents) {
  const [currentSection, setCurrentSection] = useState(tableOfContents[0]?.id);

  useEffect(() => {
    if (tableOfContents.length === 0) return;

    const headings = getHeadings(tableOfContents);

    function onScroll() {
      const top = window.scrollY;
      let current = headings[0]?.id;
      for (const heading of headings) {
        if (heading && top >= heading.top) {
          current = heading.id;
        } else {
          break;
        }
      }
      setCurrentSection(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [tableOfContents]);

  return currentSection;
}
