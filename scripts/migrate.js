#!/usr/bin/env node
/**
 * Migration Management Script
 * 
 * This script helps manage migrations between the local development environment
 * and Supabase. It synchronizes migrations between /migrations and /supabase/migrations
 * directories to ensure consistency.
 * 
 * Usage:
 *   node scripts/migrate.js [command]
 * 
 * Commands:
 *   sync             - Sync migrations between directories
 *   create [name]    - Create a new migration and its rollback
 *   apply            - Apply pending migrations to Supabase
 *   list             - List all migrations and their status
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define directories
const localMigrationsDir = path.join(rootDir, 'migrations');
const supabaseMigrationsDir = path.join(rootDir, 'supabase', 'migrations');

// Ensure directories exist
if (!fs.existsSync(localMigrationsDir)) {
  fs.mkdirSync(localMigrationsDir, { recursive: true });
}

if (!fs.existsSync(supabaseMigrationsDir)) {
  fs.mkdirSync(supabaseMigrationsDir, { recursive: true });
}

// Helper function to get timestamp for migration names
function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Helper function to generate a UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Function to sync migrations between directories
function syncMigrations() {
  console.log('Syncing migrations between directories...');
  
  // Copy from local to supabase if not exists
  const localFiles = fs.readdirSync(localMigrationsDir);
  for (const file of localFiles) {
    if (file.endsWith('.sql') && !file.startsWith('rollback_')) {
      const localFilePath = path.join(localMigrationsDir, file);
      const timestamp = getTimestamp();
      const uuid = generateUUID();
      const supabaseFileName = `${timestamp}-${uuid}.sql`;
      const supabaseFilePath = path.join(supabaseMigrationsDir, supabaseFileName);
      
      // Check if this migration already exists in supabase directory
      let alreadyExists = false;
      const supabaseFiles = fs.readdirSync(supabaseMigrationsDir);
      for (const existingFile of supabaseFiles) {
        const existingContent = fs.readFileSync(path.join(supabaseMigrationsDir, existingFile), 'utf8');
        const localContent = fs.readFileSync(localFilePath, 'utf8');
        
        // Compare content (ignoring timestamps and UUIDs in file names)
        if (existingContent.trim() === localContent.trim()) {
          alreadyExists = true;
          console.log(`Migration ${file} already exists in Supabase as ${existingFile}`);
          break;
        }
      }
      
      if (!alreadyExists) {
        console.log(`Copying ${file} to Supabase migrations as ${supabaseFileName}`);
        fs.copyFileSync(localFilePath, supabaseFilePath);
      }
    }
  }
  
  console.log('Sync completed!');
}

// Function to create a new migration
function createMigration(name) {
  if (!name) {
    console.error('Error: Migration name is required');
    process.exit(1);
  }
  
  const sanitizedName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  const timestamp = getTimestamp();
  
  // Create main migration file
  const migrationFileName = `${sanitizedName}.sql`;
  const migrationPath = path.join(localMigrationsDir, migrationFileName);
  
  const migrationContent = `-- Migration: ${name}
-- Date: ${new Date().toISOString().split('T')[0]}
-- Description: 

-- Your SQL migration code here

`;
  
  fs.writeFileSync(migrationPath, migrationContent);
  
  // Create rollback file
  const rollbackFileName = `rollback_${sanitizedName}.sql`;
  const rollbackPath = path.join(localMigrationsDir, rollbackFileName);
  
  const rollbackContent = `-- Rollback for ${migrationFileName}
-- Date: ${new Date().toISOString().split('T')[0]}
-- Description: This script reverts the changes made in ${migrationFileName}

-- Your rollback SQL code here

`;
  
  fs.writeFileSync(rollbackPath, rollbackContent);
  
  console.log(`Created migration ${migrationPath}`);
  console.log(`Created rollback ${rollbackPath}`);
}

// Function to list all migrations
function listMigrations() {
  console.log('Local migrations:');
  const localFiles = fs.readdirSync(localMigrationsDir);
  for (const file of localFiles) {
    if (file.endsWith('.sql')) {
      console.log(`  - ${file}`);
    }
  }
  
  console.log('\nSupabase migrations:');
  const supabaseFiles = fs.readdirSync(supabaseMigrationsDir);
  for (const file of supabaseFiles) {
    if (file.endsWith('.sql')) {
      console.log(`  - ${file}`);
    }
  }
}

// Main function
function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'sync':
      syncMigrations();
      break;
    case 'create':
      createMigration(process.argv[3]);
      break;
    case 'list':
      listMigrations();
      break;
    case 'help':
    default:
      console.log(`
Migration Management Script

Usage:
  node scripts/migrate.js [command]

Commands:
  sync             - Sync migrations between directories
  create [name]    - Create a new migration and its rollback
  list             - List all migrations and their status
  help             - Show this help message
      `);
      break;
  }
}

// Run the script
main();
