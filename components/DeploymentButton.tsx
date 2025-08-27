"use client";

import { useState } from 'react';
import { Globe, Loader, ExternalLink, Copy, Terminal as TerminalIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Import DeploymentTerminal dynamically to avoid SSR issues with xterm.js
const DeploymentTerminal = dynamic(() => import('./DeploymentTerminal'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-sm font-medium">Loading Terminal...</span>
        </div>
      </div>
      <div className="h-64 w-full bg-[#1a1a1a] flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    </div>
  )
});

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
  const [showTerminal, setShowTerminal] = useState(false);

  const writeToTerminal = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    // Only access window object on client side
    if (typeof window === 'undefined') return;
    
    const terminal = (window as any).deploymentTerminal;
    if (terminal) {
      switch (type) {
        case 'success':
          terminal.writeSuccess(message);
          break;
        case 'error':
          terminal.writeError(message);
          break;
        case 'warning':
          terminal.writeWarning(message);
          break;
        default:
          terminal.writeInfo(message);
      }
    }
  };

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
    setShowTerminal(true);
    const deployingToast = toast.loading('Deploying to Vercel...');

    // Clear terminal and show initial messages
    setTimeout(() => {
      if (typeof window === 'undefined') return;
      
      const terminal = (window as any).deploymentTerminal;
      if (terminal) {
        terminal.clear();
        terminal.writeLine('🚀 Starting Vercel deployment...');
        terminal.writeLine('═══════════════════════════════════════');
        terminal.writeInfo(`Project: ${projectName || 'Generated Website'}`);
        terminal.writeInfo(`Files: ${Object.keys(projectFiles).length} files`);
        terminal.writeInfo(`User: ${userId}`);
        terminal.writeLine('');
      }
    }, 100);

    try {
      writeToTerminal('📦 Preparing files for deployment...');
      
      console.log('🚀 Starting deployment...', {
        projectName,
        filesCount: Object.keys(projectFiles).length
      });

      writeToTerminal('🌐 Sending to Vercel API...');

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
        writeToTerminal(`Deployment request failed: ${errorData.details || errorData.error}`, 'error');
        throw new Error(errorData.details || errorData.error || 'Deployment failed');
      }

      writeToTerminal('⚡ Deployment initiated successfully!', 'success');

      const data = await response.json();
      const deployment = data.deployment as DeploymentResult;
      
      setDeploymentResult(deployment);
      
      writeToTerminal(`🏗️  Building project...`, 'info');
      writeToTerminal(`📦 Installing dependencies...`, 'info');
      writeToTerminal(`🔨 Running build process...`, 'info');
      writeToTerminal(`🚀 Deploying to Vercel infrastructure...`, 'info');
      writeToTerminal('', 'info');
      writeToTerminal(`✅ Deployment successful!`, 'success');
      writeToTerminal(`🌍 Live URL: ${deployment.url}`, 'success');
      writeToTerminal(`📋 Deployment ID: ${deployment.deploymentId}`, 'info');
      writeToTerminal(`📊 Files deployed: ${data.filesDeployed || Object.keys(projectFiles).length}`, 'info');
      writeToTerminal(`📦 Project: ${data.projectName || projectName}`, 'info');
      
      // Show success toast with clickable link
      toast.success(
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600">🎉</span>
            <span className="font-semibold">Successfully deployed to Vercel!</span>
          </div>
          <button
            onClick={() => {
              window.open(deployment.url, '_blank', 'noopener,noreferrer');
              toast.success('🌍 Opening live website...', { duration: 3000 });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2 w-fit"
          >
            <Globe className="h-3 w-3" />
            View Live Website
          </button>
          <div className="text-xs text-gray-600 truncate">
            {deployment.url}
          </div>
        </div>,
        { 
          id: deployingToast,
          duration: 15000 
        }
      );
      
      console.log('✅ Deployment successful:', deployment);
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      writeToTerminal(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      
      toast.error(
        `❌ Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    <div className="flex flex-col gap-3">
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

      {/* Terminal Toggle */}
      {(isDeploying || deploymentResult) && (
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="flex items-center gap-2 px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <TerminalIcon className="h-3 w-3" />
          {showTerminal ? 'Hide' : 'Show'} Deployment Logs
        </button>
      )}

      {/* Deployment Terminal */}
      {showTerminal && (
        <div className="mt-2">
          <DeploymentTerminal 
            isVisible={showTerminal}
            onMessage={(message) => console.log('Terminal:', message)}
          />
        </div>
      )}

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
