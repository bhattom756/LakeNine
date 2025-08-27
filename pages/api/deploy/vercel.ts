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
    console.log('📋 File list:', Object.keys(files));

    // Prepare files for Vercel deployment (CORRECT Array format!)
    const vercelFiles: Array<{ file: string; data: string }> = [];
    
    Object.entries(files).forEach(([filePath, content]) => {
      // Convert file paths to work with Vercel
      let vercelPath = filePath;
      
      // Remove leading slash if present
      if (vercelPath.startsWith('/')) {
        vercelPath = vercelPath.substring(1);
      }
      
      // Add to array with correct Vercel API format
      vercelFiles.push({
        file: vercelPath,  // Path/name of the file
        data: content      // Content of the file
      });
    });

    // Add deployment configuration files
    vercelFiles.push({
      file: 'vercel.json',
      data: JSON.stringify({
        "version": 2,
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
    });

    // Add build script if package.json exists and doesn't have build script
    const packageJsonFile = vercelFiles.find(f => f.file === 'package.json');
    if (packageJsonFile) {
      try {
        const packageJson = JSON.parse(packageJsonFile.data);
        if (!packageJson.scripts?.build) {
          packageJson.scripts = packageJson.scripts || {};
          packageJson.scripts.build = 'vite build';
          packageJson.scripts.preview = 'vite preview';
          packageJsonFile.data = JSON.stringify(packageJson, null, 2);
        }
      } catch (error) {
        console.warn('⚠️ Could not parse package.json:', error);
      }
    }

    // Log the final payload structure for debugging
    console.log('📤 Deployment payload structure:', {
      name: uniqueProjectName,
      filesCount: vercelFiles.length,
      filesFormat: 'array',
      totalSize: vercelFiles.reduce((sum, f) => sum + f.data.length, 0),
      sampleFile: vercelFiles[0] ? { file: vercelFiles[0].file, dataLength: vercelFiles[0].data.length } : null
    });

    // Deploy to Vercel using correct API format with projectSettings
    const deploymentPayload = {
      name: uniqueProjectName,
      files: vercelFiles,
      target: "production",
      projectSettings: {
        framework: "vite",
        installCommand: "npm install",
        buildCommand: "npm run build",
        outputDirectory: "dist",
        devCommand: "vite --port $PORT",
        rootDirectory: null
      }
    };

    console.log('🔧 Final deployment payload preview:', {
      name: deploymentPayload.name,
      filesCount: deploymentPayload.files.length,
      target: deploymentPayload.target,
      isArray: Array.isArray(deploymentPayload.files),
      framework: deploymentPayload.projectSettings.framework,
      hasProjectSettings: !!deploymentPayload.projectSettings
    });

    // Deploy to Vercel
    const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentPayload),
    });

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.text();
      console.error('❌ Vercel deployment failed:', errorData);
      console.error('❌ Response status:', deploymentResponse.status);
      console.error('❌ Response headers:', Object.fromEntries(deploymentResponse.headers.entries()));
      throw new Error(`Vercel deployment failed: ${deploymentResponse.status} ${errorData}`);
    }

    const deploymentData = await deploymentResponse.json();
    console.log('✅ Deployment successful:', deploymentData.url);

    const result: VercelDeploymentResponse = {
      url: `https://${deploymentData.url}`,
      deploymentId: deploymentData.uid,
      status: deploymentData.readyState || 'BUILDING'
    };

    // Log deployment success for debugging
    console.log('🎉 Deployment Response:', {
      url: result.url,
      deploymentId: result.deploymentId,
      status: result.status,
      filesCount: Object.keys(files).length
    });

    res.status(200).json({
      success: true,
      deployment: result,
      message: 'Website deployed successfully to Vercel!',
      filesDeployed: Object.keys(files).length,
      projectName: uniqueProjectName
    });

  } catch (error) {
    console.error('❌ Deployment error:', error);
    res.status(500).json({ 
      error: 'Deployment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
