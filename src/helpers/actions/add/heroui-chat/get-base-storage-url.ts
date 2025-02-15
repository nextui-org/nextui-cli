import {fetchRequest} from '@helpers/fetch';

/**
 * Get the base storage url from the given url
 */
export async function getBaseStorageUrl(url: string) {
  const removedHttp = url.replace(/^https:\/\//, '');
  const [baseUrl, chatId, recentlyMessageId, chatTitle] = removedHttp.split('/');

  const dubUrl = `https://${baseUrl}/${chatId}`;
  let baseStorageUrl = '';

  const response = await fetchRequest(dubUrl, {fetchInfo: 'base storage url'});

  if (response.redirected) {
    baseStorageUrl = response.url.replace(/\/$/, '');
  }

  return {
    baseStorageUrl,
    chatId,
    chatTitle,
    recentlyMessageId,
    url: `${baseStorageUrl}/${chatId}/${recentlyMessageId}`
  };
}
