import type { NextApiRequest, NextApiResponse } from 'next';

interface DeploymentRequest {
  files: Record<string, string>;
  projectName: string;
  userId: string;
}

interface VercelDeploymentResponse {
  url: string;
  deploymentId: string;
  status: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting Vercel deployment...');
    
    const { files, projectName, userId }: DeploymentRequest = req.body;

    // Validate required fields
    if (!files || !projectName || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: files, projectName, userId' 
      });
    }

    // Validate Vercel token
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      console.error('❌ Vercel token not configured');
      return res.status(500).json({ 
        error: 'Deployment not configured. Please set VERCEL_TOKEN environment variable.' 
      });
    }

    // Clean project name for Vercel (lowercase, no spaces, valid characters)
    const cleanProjectName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) || 'generated-website';

    // Add unique suffix to avoid conflicts
    const uniqueProjectName = `${cleanProjectName}-${Date.now().toString(36)}`;

    console.log('📦 Preparing deployment for:', uniqueProjectName);
    console.log('📁 Files to deploy:', Object.keys(files).length);

    // Prepare files for Vercel deployment
    const vercelFiles: Record<string, { file: string }> = {};
    
    Object.entries(files).forEach(([filePath, content]) => {
      // Convert file paths to work with Vercel
      let vercelPath = filePath;
      
      // Remove leading slash if present
      if (vercelPath.startsWith('/')) {
        vercelPath = vercelPath.substring(1);
      }
      
      // Ensure we have proper file structure for Vite
      vercelFiles[vercelPath] = {
        file: content
      };
    });

    // Add deployment configuration files
    vercelFiles['vercel.json'] = {
      file: JSON.stringify({
        "builds": [
          {
            "src": "package.json",
            "use": "@vercel/static-build",
            "config": {
              "distDir": "dist"
            }
          }
        ],
        "routes": [
          {
            "src": "/(.*)",
            "dest": "/index.html"
          }
        ]
      }, null, 2)
    };

    // Add build script if package.json exists and doesn't have build script
    if (vercelFiles['package.json']) {
      try {
        const packageJson = JSON.parse(vercelFiles['package.json'].file);
        if (!packageJson.scripts?.build) {
          packageJson.scripts = packageJson.scripts || {};
          packageJson.scripts.build = 'vite build';
          packageJson.scripts.preview = 'vite preview';
          vercelFiles['package.json'].file = JSON.stringify(packageJson, null, 2);
        }
      } catch (error) {
        console.warn('⚠️ Could not parse package.json:', error);
      }
    }

    // Deploy to Vercel
    const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: uniqueProjectName,
        files: vercelFiles,
        projectSettings: {
          framework: 'vite',
          outputDirectory: 'dist',
          installCommand: 'npm install',
          buildCommand: 'npm run build'
        },
        meta: {
          generator: 'LakeNine-AI',
          userId: userId,
          createdAt: new Date().toISOString()
        }
      }),
    });

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.text();
      console.error('❌ Vercel deployment failed:', errorData);
      throw new Error(`Vercel deployment failed: ${deploymentResponse.status} ${errorData}`);
    }

    const deploymentData = await deploymentResponse.json();
    console.log('✅ Deployment successful:', deploymentData.url);

    const result: VercelDeploymentResponse = {
      url: `https://${deploymentData.url}`,
      deploymentId: deploymentData.uid,
      status: deploymentData.readyState || 'BUILDING'
    };

    res.status(200).json({
      success: true,
      deployment: result,
      message: 'Website deployed successfully to Vercel!'
    });

  } catch (error) {
    console.error('❌ Deployment error:', error);
    res.status(500).json({ 
      error: 'Deployment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
