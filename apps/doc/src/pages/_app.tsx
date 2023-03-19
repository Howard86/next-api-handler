import { MarkdocNextJsPageProps } from '@markdoc/next.js';
import type { AppProps } from 'next/app';
import { Inter, Lexend } from 'next/font/google';
import Head from 'next/head';

import { Layout } from '@/components/Layout';
import { collectHeadings } from '@/utils/parser';

import 'focus-visible';
import '@/styles/tailwind.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  display: 'block',
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-lexend',
});

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
      <Layout
        className={`${inter.variable} ${lexend.variable} font-sans`}
        title={title}
        tableOfContents={tableOfContents}
      >
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
