import axios from 'axios';

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

export async function fetchPexelsImages(query: string, perPage: number = 3): Promise<string[]> {
  if (!PEXELS_API_KEY) {
    throw new Error('Pexels API key is not set');
  }
  const response = await axios.get(PEXELS_API_URL, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
    params: {
      query,
      per_page: perPage,
    },
  });
  return response.data.photos.map((photo: any) => photo.src.large);
} 