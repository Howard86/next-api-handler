import { useCallback, useEffect, useState } from 'react';

import { TableOfContents } from '@/utils/parser';

export default function useTableOfContents(
  defaultTableOfContents: TableOfContents
) {
  const [currentSection, setCurrentSection] = useState(
    defaultTableOfContents[0]?.id
  );

  const getHeadings = useCallback((tableOfContents: TableOfContents) => {
    return tableOfContents
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const style = window.getComputedStyle(el);
        const scrollMt = parseFloat(style.scrollMarginTop);

        const top = window.scrollY + el.getBoundingClientRect().top - scrollMt;
        return { id, top };
      });
  }, []);

  useEffect(() => {
    if (defaultTableOfContents.length === 0) return;
    const headings = getHeadings(defaultTableOfContents);

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
  }, [getHeadings, defaultTableOfContents]);

  return currentSection;
}
