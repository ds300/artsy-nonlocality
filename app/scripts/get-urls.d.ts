declare module "get-urls" {
  const getUrls: (
    text: string,
    options?: {
      extractFromQueryString?: boolean;
      defaultProtocol?: string;
      normalizeProtocol?: boolean;
      forceHttp?: boolean;
      forceHttps?: boolean;
      stripHash?: boolean;
      stripWWW?: boolean;
      removeQueryParameters?: boolean;
      removeTrailingSlash?: boolean;
      removeDirectoryIndex?: boolean;
      sortQueryParameters?: boolean;
    }
  ) => Set<string>;

  export = getUrls;
}
