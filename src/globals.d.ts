export {};

declare global {
  const chrome: any;

  interface Window {
    EliminateShortsDebounce: any;
    EliminateShortsStorage: any;
    EliminateShortsStats: any;
    EliminateShortsDetector: any;
    EliminateShortsRemover: any;
    EliminateShortsRedirector: any;
  }
}
