import type { NextApiRequest, NextApiResponse } from 'next';

type StatusResponse = {
  status: 'ok' | 'error';
  message: string;
  clientId?: string;
};

/**
 * API endpoint that returns the status of the WebContainer setup
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  // Check if WebContainer API is properly loaded
  try {
    // We can't directly check WebContainer here since it's client-side only
    // Just return that the endpoint is available
    
    return res.status(200).json({
      status: 'ok',
      message: 'WebContainer API endpoint is ready',
      clientId: 'wc_api_bhattom756_118513e5695a6bae1a97490aacdeed2a'
    });
  } catch (error) {
    console.error('WebContainer status check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check WebContainer status'
    });
  }
} 