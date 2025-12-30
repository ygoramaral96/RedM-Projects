const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Helper function to convert string to PascalCase
function toPascalCase(str) {
  return str
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Helper function to convert string to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// Helper function to replace content in files
async function replaceInFile(filePath, searchValue, replaceValue) {
  const content = await fs.readFile(filePath, 'utf8');
  const newContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
  await fs.writeFile(filePath, newContent, 'utf8');
}

// Recursively replace in all files
async function replaceInDirectory(dir, searchValue, replaceValue, extensions = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await replaceInDirectory(fullPath, searchValue, replaceValue, extensions);
    } else if (entry.isFile()) {
      if (extensions.length === 0 || extensions.some(ext => entry.name.endsWith(ext))) {
        await replaceInFile(fullPath, searchValue, replaceValue);
      }
    }
  }
}

// Rename files containing a specific string
async function renameFilesInDirectory(dir, searchValue, replaceValue) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await renameFilesInDirectory(fullPath, searchValue, replaceValue);
      
      // Rename directory itself if it contains the search value
      if (entry.name.includes(searchValue)) {
        const newName = entry.name.replace(new RegExp(searchValue, 'g'), replaceValue);
        const newPath = path.join(dir, newName);
        await fs.rename(fullPath, newPath);
      }
    } else if (entry.isFile() && entry.name.includes(searchValue)) {
      const newName = entry.name.replace(new RegExp(searchValue, 'g'), replaceValue);
      const newPath = path.join(dir, newName);
      await fs.rename(fullPath, newPath);
    }
  }
}

async function generateResource(resourceName) {
  console.log(chalk.blue('🏭 RedM Resource Factory\n'));

  // Validate input
  if (!resourceName || resourceName.trim() === '') {
    console.error(chalk.red('❌ Error: Resource name is required'));
    console.log(chalk.yellow('Usage: pnpm run gen "resource-name"'));
    process.exit(1);
  }

  // Convert names
  const kebabName = toKebabCase(resourceName);
  const pascalName = toPascalCase(resourceName);

  console.log(chalk.cyan(`📝 Resource Name: ${kebabName}`));
  console.log(chalk.cyan(`📝 Class Name: ${pascalName}\n`));

  // Define paths
  const rootDir = path.resolve(__dirname, '..');
  const templatesDir = path.join(rootDir, '_templates');
  const uiTemplateDir = path.join(templatesDir, 'ui');
  const coreTemplateDir = path.join(templatesDir, 'core');
  const appsDir = path.join(rootDir, 'apps');
  const resourcesDir = path.join(rootDir, 'resources');

  const targetUIDir = path.join(appsDir, `${kebabName}-ui`);
  const targetCoreDir = path.join(resourcesDir, `${kebabName}-core`);

  // Check if templates exist
  if (!fs.existsSync(uiTemplateDir)) {
    console.error(chalk.red(`❌ Error: UI template not found at ${uiTemplateDir}`));
    process.exit(1);
  }

  if (!fs.existsSync(coreTemplateDir)) {
    console.error(chalk.red(`❌ Error: Core template not found at ${coreTemplateDir}`));
    process.exit(1);
  }

  // Check if target directories already exist
  if (fs.existsSync(targetUIDir)) {
    console.error(chalk.red(`❌ Error: UI directory already exists at ${targetUIDir}`));
    process.exit(1);
  }

  if (fs.existsSync(targetCoreDir)) {
    console.error(chalk.red(`❌ Error: Core directory already exists at ${targetCoreDir}`));
    process.exit(1);
  }

  try {
    // Create directories if they don't exist
    await fs.ensureDir(appsDir);
    await fs.ensureDir(resourcesDir);

    // Copy templates
    console.log(chalk.yellow('📦 Copying UI template...'));
    await fs.copy(uiTemplateDir, targetUIDir);

    console.log(chalk.yellow('📦 Copying Core template...'));
    await fs.copy(coreTemplateDir, targetCoreDir);

    // Replace Template with PascalCase name in Core files
    console.log(chalk.yellow('🔄 Renaming files and updating content in Core...'));
    
    // Rename files first
    await renameFilesInDirectory(targetCoreDir, 'Template', pascalName);

    // Replace content in all core files
    await replaceInDirectory(
      targetCoreDir,
      'Template',
      pascalName,
      ['.sln', '.csproj', '.cs', '.lua']
    );

    // Replace template with kebab-case name in UI files
    console.log(chalk.yellow('🔄 Updating content in UI...'));
    
    // Update package.json
    await replaceInFile(
      path.join(targetUIDir, 'package.json'),
      '@project/template-ui',
      `@project/${kebabName}-ui`
    );

    // Update vite.config.ts - replace the placeholder
    await replaceInFile(
      path.join(targetUIDir, 'vite.config.ts'),
      '{{RESOURCE_NAME}}',
      `${kebabName}-core`
    );

    // Update index.html title
    await replaceInFile(
      path.join(targetUIDir, 'index.html'),
      'Template Resource',
      `${pascalName} Resource`
    );

    // Update App.tsx
    await replaceInFile(
      path.join(targetUIDir, 'src', 'App.tsx'),
      'Template Resource',
      `${pascalName} Resource`
    );
    await replaceInFile(
      path.join(targetUIDir, 'src', 'App.tsx'),
      'Welcome to Template Resource!',
      `Welcome to ${pascalName} Resource!`
    );

    // Update fxmanifest.lua description
    await replaceInFile(
      path.join(targetCoreDir, 'fxmanifest.lua'),
      'Template Resource',
      `${pascalName} Resource`
    );

    // Success messages
    console.log(chalk.green('\n✅ Resource generated successfully!\n'));
    console.log(chalk.cyan('📁 Generated files:'));
    console.log(chalk.gray(`   - ${targetUIDir}`));
    console.log(chalk.gray(`   - ${targetCoreDir}`));

    console.log(chalk.cyan('\n📦 Installing dependencies...'));
    try {
      execSync('pnpm install', { cwd: rootDir, stdio: 'inherit' });
      console.log(chalk.green('✅ Dependencies installed!\n'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not run pnpm install automatically. Please run it manually.\n'));
    }

    // Print next steps
    console.log(chalk.blue('🚀 Next Steps:\n'));
    console.log(chalk.white('1. Build the UI:'));
    console.log(chalk.gray(`   cd apps/${kebabName}-ui`));
    console.log(chalk.gray('   pnpm run build\n'));
    
    console.log(chalk.white('2. Build the C# backend:'));
    console.log(chalk.gray(`   cd resources/${kebabName}-core`));
    console.log(chalk.gray(`   Open ${pascalName}.sln in Visual Studio or run:`));
    console.log(chalk.gray('   dotnet build\n'));
    
    console.log(chalk.white('3. Copy the resource to your RedM server:'));
    console.log(chalk.gray(`   Copy resources/${kebabName}-core/ to your RedM resources folder\n`));
    
    console.log(chalk.green('Happy coding! 🎉\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error generating resource:'));
    console.error(chalk.red(error.message));
    console.error(error);
    process.exit(1);
  }
}

// Get resource name from command line arguments
const resourceName = process.argv[2];

// Run the generator
generateResource(resourceName);

