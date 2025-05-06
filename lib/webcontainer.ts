import { WebContainer } from '@webcontainer/api';

export async function bootWebContainer() {
  // Optionally, you can use the client ID for analytics or advanced features
  // (WebContainer API does not require the client ID for basic usage)
  const webcontainer = await WebContainer.boot();
  return webcontainer;
}