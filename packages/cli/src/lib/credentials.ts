import fs from 'fs';
import path from 'path';
import os from 'os';
import { Credentials } from '../types.js';

const CREDENTIALS_DIR = path.join(os.homedir(), '.annoty');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials');

export function readCredentials(): Credentials | null {
  try {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      return null;
    }
    const content = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
    const data = JSON.parse(content);
    if (data && typeof data.token === 'string' && typeof data.email === 'string') {
      return data as Credentials;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function writeCredentials(credentials: Credentials): void {
  try {
    if (!fs.existsSync(CREDENTIALS_DIR)) {
      fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
    }
    const content = JSON.stringify(credentials, null, 2);
    // Write with 0o600 mode (read/write by owner only)
    fs.writeFileSync(CREDENTIALS_FILE, content, { encoding: 'utf8', mode: 0o600 });
  } catch (error) {
    throw new Error(`Failed to save credentials: ${(error as Error).message}`);
  }
}

export function deleteCredentials(): void {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
    }
  } catch (error) {
    throw new Error(`Failed to delete credentials: ${(error as Error).message}`);
  }
}
