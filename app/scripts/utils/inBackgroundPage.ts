export const inBackgroundPage = (f: () => void) => {
  if (chrome.extension.getBackgroundPage() === window) {
    f()
  }
}
