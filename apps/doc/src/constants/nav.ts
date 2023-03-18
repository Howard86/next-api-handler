export type NavigationItem = {
  title: string;
  links: { title: string; href: string }[];
};

export const navigation: NavigationItem[] = [
  {
    title: 'Introduction',
    links: [
      { title: 'Overview', href: '/' },
      { title: 'Getting Started', href: '/docs/getting-started' },
    ],
  },
  {
    title: 'Core concepts',
    links: [
      { title: 'RESTful API', href: '/docs/restful-api' },
      { title: 'API Middleware', href: '/docs/api-middleware' },
      { title: 'Logger for debugging', href: '/docs/logger-for-debugging' },
    ],
  },
  {
    title: 'API reference',
    links: [
      { title: 'RouterBuilder', href: '/docs/router-builder' },
      { title: 'RouterBuilderOption', href: '/docs/router-builder-option' },
      { title: 'HttpException', href: '/docs/http-exception' },
      { title: 'Utility Types', href: '/docs/utility-types' },
    ],
  },
  {
    title: 'External references',
    links: [{ title: 'Related Libraries', href: '/docs/related-libraries' }],
  },
];
