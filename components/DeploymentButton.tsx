"use client";

import { useState } from 'react';
import { Globe, Loader, ExternalLink, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeploymentButtonProps {
  projectFiles: Record<string, string>;
  projectName: string;
  userId?: string;
  disabled?: boolean;
}

interface DeploymentResult {
  url: string;
  deploymentId: string;
  status: string;
}

const DeploymentButton = ({ 
  projectFiles, 
  projectName, 
  userId,
  disabled = false 
}: DeploymentButtonProps) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const deployToVercel = async () => {
    if (!userId) {
      toast.error('Please sign in to deploy websites');
      return;
    }

    if (!projectFiles || Object.keys(projectFiles).length === 0) {
      toast.error('No files to deploy. Generate a website first.');
      return;
    }

    setIsDeploying(true);
    const deployingToast = toast.loading('Deploying to Vercel...');

    try {
      console.log('🚀 Starting deployment...', {
        projectName,
        filesCount: Object.keys(projectFiles).length
      });

      const response = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: projectFiles,
          projectName: projectName || 'Generated Website',
          userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Deployment failed');
      }

      const data = await response.json();
      const deployment = data.deployment as DeploymentResult;
      
      setDeploymentResult(deployment);
      
      toast.success(
        <div className="flex flex-col">
          <span>🎉 Website deployed successfully!</span>
          <a 
            href={deployment.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mt-1"
          >
            View live website →
          </a>
        </div>,
        { 
          id: deployingToast,
          duration: 8000 
        }
      );
      
      console.log('✅ Deployment successful:', deployment);
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      toast.error(
        `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { 
          id: deployingToast,
          duration: 6000 
        }
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const copyDeploymentUrl = () => {
    if (deploymentResult?.url) {
      navigator.clipboard.writeText(deploymentResult.url);
      toast.success('Deployment URL copied to clipboard!');
    }
  };

  const hasFiles = projectFiles && Object.keys(projectFiles).length > 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Deploy Button */}
      <button
        onClick={deployToVercel}
        disabled={disabled || isDeploying || !hasFiles || !userId}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
          ${disabled || !hasFiles || !userId
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isDeploying
            ? 'bg-blue-500 text-white cursor-wait'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }
        `}
        title={
          !userId 
            ? 'Sign in to deploy websites'
            : !hasFiles 
            ? 'Generate a website first'
            : 'Deploy website to Vercel'
        }
      >
        {isDeploying ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Deploying...
          </>
        ) : (
          <>
            <Globe className="h-4 w-4" />
            Deploy to Vercel
          </>
        )}
      </button>

      {/* Deployment Result */}
      {deploymentResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
            <Globe className="h-4 w-4" />
            Live Website Ready!
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={deploymentResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View Website
            </a>
            
            <button
              onClick={copyDeploymentUrl}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm hover:underline"
              title="Copy URL"
            >
              <Copy className="h-3 w-3" />
              Copy URL
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            Status: {deploymentResult.status}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!userId && (
        <p className="text-xs text-gray-500 text-center">
          Sign in to deploy your generated websites to Vercel
        </p>
      )}
    </div>
  );
};

export default DeploymentButton;
