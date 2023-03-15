import { MarkdocNextJsPageProps } from '@markdoc/next.js';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import { Layout } from '@/components/Layout';
import { collectHeadings } from '@/utils/parser';

import 'focus-visible';
import '@/styles/tailwind.css';

export default function App({
  Component,
  pageProps,
}: AppProps<MarkdocNextJsPageProps>) {
  const title = pageProps.markdoc?.frontmatter.title;

  const pageTitle =
    pageProps.markdoc?.frontmatter.pageTitle ||
    `${pageProps.markdoc?.frontmatter.title} - Docs`;

  const description = pageProps.markdoc?.frontmatter.description;

  const tableOfContents = pageProps.markdoc?.content
    ? collectHeadings(pageProps.markdoc.content)
    : [];

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <Layout title={title} tableOfContents={tableOfContents}>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
