import { getWebContainer, getFileTree } from './webcontainer';

interface RestoreFile {
  fileName: string;
  filePath: string;
  content: string;
  size: number;
  lastModified: Date;
}

/**
 * Enhanced file restoration function specifically for loading previous chat sessions
 */
export async function restoreFilesToWebContainer(
  files: RestoreFile[] | Record<string, string>,
  setFileStructure?: (structure: string[]) => void
): Promise<boolean> {
  const webContainer = getWebContainer();
  if (!webContainer) {
    console.warn('⚠️ WebContainer not ready for file restoration');
    return false;
  }

  console.log('🔄 Starting enhanced file restoration...');

  try {
    // Convert to consistent format
    const fileMap: Record<string, string> = Array.isArray(files) 
      ? files.reduce((acc, file) => {
          acc[file.filePath] = file.content;
          return acc;
        }, {} as Record<string, string>)
      : files;

    console.log(`📁 Restoring ${Object.keys(fileMap).length} files...`);

    // Clear existing project files (but keep system files)
    try {
      const existingFiles = await getFileTree();
      const filesToClear = existingFiles.filter(file => 
        !file.includes('node_modules') && 
        !file.includes('.git') &&
        !file.startsWith('.')
      );
      
      for (const file of filesToClear) {
        try {
          await webContainer.fs.rm(file, { force: true });
        } catch (rmError) {
          // File might not exist, continue
        }
      }
      console.log(`🗑️ Cleared ${filesToClear.length} existing files`);
    } catch (clearError) {
      console.warn('⚠️ Could not clear existing files:', clearError);
    }

    // Create all necessary directories first
    const directories = new Set<string>();
    for (const filePath of Object.keys(fileMap)) {
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
      if (dirPath && dirPath !== filePath) {
        directories.add(dirPath);
      }
    }

    for (const dir of directories) {
      try {
        await webContainer.fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      } catch (dirError) {
        console.log(`📁 Directory exists: ${dir}`);
      }
    }

    // Write files with verification
    let successCount = 0;
    const errors: string[] = [];

    for (const [filePath, content] of Object.entries(fileMap)) {
      try {
        await webContainer.fs.writeFile(filePath, content);
        
        // Verify file was written correctly
        const verifyContent = await webContainer.fs.readFile(filePath, 'utf-8');
        if (verifyContent === content) {
          console.log(`✅ Verified: ${filePath} (${content.length} chars)`);
          successCount++;
        } else {
          console.error(`❌ Verification failed for ${filePath}`);
          errors.push(`Verification failed for ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to write ${filePath}:`, error);
        errors.push(`Failed to write ${filePath}: ${error}`);
      }
    }

    console.log(`✅ Successfully restored ${successCount}/${Object.keys(fileMap).length} files`);
    
    if (errors.length > 0) {
      console.warn('⚠️ Restoration errors:', errors);
    }

    // Wait for filesystem to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update file structure if callback provided
    if (setFileStructure) {
      try {
        const updatedStructure = await getFileTree();
        setFileStructure(updatedStructure);
        console.log(`🌲 Updated file structure: ${updatedStructure.length} files`);
      } catch (structureError) {
        console.warn('⚠️ Could not update file structure:', structureError);
      }
    }

    return successCount === Object.keys(fileMap).length;

  } catch (error) {
    console.error('❌ Critical error during file restoration:', error);
    return false;
  }
}

/**
 * Verify that all required files exist in WebContainer
 */
export async function verifyRestoredFiles(expectedFiles: string[]): Promise<{
  missing: string[];
  existing: string[];
  success: boolean;
}> {
  const webContainer = getWebContainer();
  if (!webContainer) {
    return {
      missing: expectedFiles,
      existing: [],
      success: false
    };
  }

  const missing: string[] = [];
  const existing: string[] = [];

  for (const filePath of expectedFiles) {
    try {
      await webContainer.fs.readFile(filePath, 'utf-8');
      existing.push(filePath);
    } catch (error) {
      missing.push(filePath);
    }
  }

  return {
    missing,
    existing,
    success: missing.length === 0
  };
}
