// pages/api/health-check.ts
// Simple health check endpoint to verify the server is working

import { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: 'ok';
  timestamp: string;
  environment: {
    hasOpenAI: boolean;
    hasPexels: boolean;
    nodeEnv: string;
  };
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse | { error: string }>
) {
  try {
    const healthResponse: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasPexels: !!process.env.PEXELS_API_TOKEN,
        nodeEnv: process.env.NODE_ENV || 'unknown'
      },
      message: 'Server is running correctly'
    };

    console.log('✅ Health check successful:', healthResponse);
    
    res.status(200).json(healthResponse);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    res.status(500).json({
      error: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
}
