declare module 'next' {
  interface NextApiRequest<
    T extends Record<string, unknown> = Record<string, unknown>
  > {
    middleware: T;
  }
}

export {};
