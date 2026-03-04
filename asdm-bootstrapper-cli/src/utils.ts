import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { ToolsetRegistry, SpecsRegistry, ContextsRegistry, Toolset, Spec, Context } from './types';
import { 
  TOOLSET_REGISTRY_URL, 
  SPECS_REGISTRY_URL, 
  CONTEXTS_REGISTRY_URL,
  TOOLSET_BASE_URL, 
  SPECS_BASE_URL,
  CONTEXTS_BASE_URL,
  LOCAL_TOOLSETS_DIR,
  LOCAL_SPECS_DIR,
  LOCAL_CONTEXTS_DIR,
  SKIP_SSL_VERIFICATION
} from './config';
import * as https from 'https';

// Create axios instance with SSL configuration
const createAxiosInstance = () => {
  return axios.create({
    httpsAgent: SKIP_SSL_VERIFICATION 
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined
  });
};

/**
 * Fetch the toolset registry
 */
export async function fetchToolsetRegistry(): Promise<ToolsetRegistry> {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get<ToolsetRegistry>(TOOLSET_REGISTRY_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch toolset registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch the specs registry
 */
export async function fetchSpecsRegistry(): Promise<SpecsRegistry> {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get<SpecsRegistry>(SPECS_REGISTRY_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch specs registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch the contexts registry
 * Note: Not implemented yet, reserved for future use
 */
export async function fetchContextsRegistry(): Promise<ContextsRegistry> {
  if (!CONTEXTS_REGISTRY_URL) {
    throw new Error('Contexts registry is not implemented yet');
  }
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get<ContextsRegistry>(CONTEXTS_REGISTRY_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch contexts registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download a toolset ZIP file
 */
export async function downloadToolset(toolsetId: string, downloadUrl: string): Promise<{ buffer: Buffer; actualUrl: string }> {
  // If downloadUrl is a relative path, combine it with TOOLSET_BASE_URL
  const fullDownloadUrl = downloadUrl.startsWith('http') 
    ? downloadUrl 
    : `${TOOLSET_BASE_URL}/${downloadUrl}`;
  
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get(fullDownloadUrl, {
      responseType: 'arraybuffer'
    });
    return { 
      buffer: Buffer.from(response.data),
      actualUrl: fullDownloadUrl
    };
  } catch (error) {
    throw new Error(`Failed to download toolset: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download a spec ZIP file
 */
export async function downloadSpec(specId: string, downloadUrl: string): Promise<{ buffer: Buffer; actualUrl: string }> {
  const fullDownloadUrl = downloadUrl.startsWith('http') 
    ? downloadUrl 
    : `${SPECS_BASE_URL}/${downloadUrl}`;
  
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get(fullDownloadUrl, {
      responseType: 'arraybuffer'
    });
    return { 
      buffer: Buffer.from(response.data),
      actualUrl: fullDownloadUrl
    };
  } catch (error) {
    throw new Error(`Failed to download spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download a context ZIP file
 */
export async function downloadContext(contextId: string, downloadUrl: string): Promise<{ buffer: Buffer; actualUrl: string }> {
  const fullDownloadUrl = downloadUrl.startsWith('http') 
    ? downloadUrl 
    : `${CONTEXTS_BASE_URL}/${downloadUrl}`;
  
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get(fullDownloadUrl, {
      responseType: 'arraybuffer'
    });
    return { 
      buffer: Buffer.from(response.data),
      actualUrl: fullDownloadUrl
    };
  } catch (error) {
    throw new Error(`Failed to download context: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract a ZIP file to the target directory
 * Handles nested folder structure in ZIP files
 */
export function extractZip(zipBuffer: Buffer, targetDir: string): void {
  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    // Check if all entries are in a single root folder
    const rootFolders = new Set<string>();
    zipEntries.forEach(entry => {
      if (!entry.entryName.startsWith('__MACOSX')) {
        const parts = entry.entryName.split('/');
        if (parts.length > 0 && parts[0]) {
          rootFolders.add(parts[0]);
        }
      }
    });
    
    // If there's a single root folder (excluding __MACOSX), extract and flatten
    if (rootFolders.size === 1) {
      const rootFolder = Array.from(rootFolders)[0];
      const tempDir = path.join(path.dirname(targetDir), `.temp-${Date.now()}`);
      
      // Extract to temp directory
      zip.extractAllTo(tempDir, true);
      
      // Move contents from nested folder to target
      const nestedPath = path.join(tempDir, rootFolder);
      if (fs.existsSync(nestedPath)) {
        // Ensure target directory exists
        ensureDirectoryExists(targetDir);
        
        // Move all files from nested folder to target
        const items = fs.readdirSync(nestedPath);
        items.forEach(item => {
          const srcPath = path.join(nestedPath, item);
          const destPath = path.join(targetDir, item);
          fs.renameSync(srcPath, destPath);
        });
      }
      
      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });
    } else {
      // Extract normally if no single root folder
      zip.extractAllTo(targetDir, true);
    }
  } catch (error) {
    throw new Error(`Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Ensure a directory exists, create it if it doesn't
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get the installation path for a toolset
 */
export function getToolsetInstallPath(toolsetId: string): string {
  const cwd = process.cwd();
  return path.join(cwd, LOCAL_TOOLSETS_DIR, toolsetId);
}

/**
 * Get the installation path for a spec
 */
export function getSpecInstallPath(specId: string): string {
  const cwd = process.cwd();
  return path.join(cwd, LOCAL_SPECS_DIR, specId);
}

/**
 * Get the installation path for a context
 */
export function getContextInstallPath(contextId: string): string {
  const cwd = process.cwd();
  return path.join(cwd, LOCAL_CONTEXTS_DIR, contextId);
}

/**
 * Check if a toolset is already installed
 */
export function isToolsetInstalled(toolsetId: string): boolean {
  const installPath = getToolsetInstallPath(toolsetId);
  return fs.existsSync(installPath);
}

/**
 * Check if a spec is already installed
 */
export function isSpecInstalled(specId: string): boolean {
  const installPath = getSpecInstallPath(specId);
  return fs.existsSync(installPath);
}

/**
 * Check if a context is already installed
 */
export function isContextInstalled(contextId: string): boolean {
  const installPath = getContextInstallPath(contextId);
  return fs.existsSync(installPath);
}

/**
 * Remove an installed toolset
 */
export function removeToolset(toolsetId: string): void {
  const installPath = getToolsetInstallPath(toolsetId);
  if (fs.existsSync(installPath)) {
    fs.rmSync(installPath, { recursive: true, force: true });
  }
}

/**
 * Remove an installed spec
 */
export function removeSpec(specId: string): void {
  const installPath = getSpecInstallPath(specId);
  if (fs.existsSync(installPath)) {
    fs.rmSync(installPath, { recursive: true, force: true });
  }
}

/**
 * Remove an installed context
 */
export function removeContext(contextId: string): void {
  const installPath = getContextInstallPath(contextId);
  if (fs.existsSync(installPath)) {
    fs.rmSync(installPath, { recursive: true, force: true });
  }
}
