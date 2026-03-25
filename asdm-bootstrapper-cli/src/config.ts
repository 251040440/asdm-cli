import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Base URL for ASDM platform (ensure no trailing slash for consistent URL building)
const normalizeUrl = (url: string): string => url.replace(/\/+$/, '');
export const BASE_URL = normalizeUrl(process.env.BASE_URL || 'https://platform.asdm.ai');

// Registry URLs for different resource types
export const TOOLSET_REGISTRY_URL = process.env.TOOLSET_REGISTRY_URL || `${BASE_URL}/_ai/toolsets/registry`;
export const SPECS_REGISTRY_URL = process.env.SPECS_REGISTRY_URL || `${BASE_URL}/_ai/specs/registry`;
export const CONTEXTS_REGISTRY_URL = process.env.CONTEXTS_REGISTRY_URL || ''; // Reserved for future implementation
export const SKILLS_REGISTRY_URL = process.env.SKILLS_REGISTRY_URL || `${BASE_URL}/_ai/skills/registry`;

// Base URLs for downloading resources
export const TOOLSET_BASE_URL = `${BASE_URL}/_artifacts/toolsets`;
export const SPECS_BASE_URL = `${BASE_URL}/_artifacts/specs`;
export const CONTEXTS_BASE_URL = `${BASE_URL}/_artifacts/contexts`;
export const SKILLS_BASE_URL = `${BASE_URL}/_artifacts/skills`;

// SSL verification (set to 'false' to enable SSL verification in production)
// Default: true (skip SSL verification) to handle self-signed certificates in development
export const SKIP_SSL_VERIFICATION = process.env.SKIP_SSL_VERIFICATION !== 'false';

// Local directories for installed resources
export const LOCAL_TOOLSETS_DIR = '.asdm/toolsets';
export const LOCAL_SPECS_DIR = '.asdm/specs';
export const LOCAL_CONTEXTS_DIR = '.asdm/contexts';
export const LOCAL_SKILLS_DIR = '.asdm/skills';
