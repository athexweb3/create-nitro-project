import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import Handlebars from 'handlebars';

interface ProjectConfig {
    projectName: string;
    androidLang: 'kotlin' | 'cpp';
    iosLang: 'swift' | 'cpp';
    platforms: string[];
    targetDir: string;
    exampleConfig: 'default' | 'full';
    author: string;
    authorGithub: string;
    homepage: string;
}

export async function generateProject(config: ProjectConfig) {
    const spinner = ora('Scaffolding project...').start();

    try {
        if (await fs.pathExists(config.targetDir)) {
            spinner.fail(chalk.red(`Directory ${config.projectName} already exists.`));
            process.exit(1);
        }

        await fs.ensureDir(config.targetDir);
        const templateDir = path.resolve(__dirname, '../templates');

        spinner.text = 'Copying base templates...';
        await fs.copy(path.join(templateDir, 'base'), config.targetDir);

        const packagesDir = path.join(config.targetDir, 'packages');
        const libraryDir = path.join(packagesDir, 'library');
        const projectPackageDir = path.join(packagesDir, config.projectName);
        await fs.rename(libraryDir, projectPackageDir);

        spinner.text = 'Adding platform specific files...';

        if (config.androidLang === 'kotlin') {
            await copyTemplate(path.join(templateDir, 'android-kotlin'), path.join(projectPackageDir, 'android'));
        } else {
            await copyTemplate(path.join(templateDir, 'android-cpp'), path.join(projectPackageDir, 'android'));
        }

        if (config.iosLang === 'swift') {
            await copyTemplate(path.join(templateDir, 'ios-swift'), path.join(projectPackageDir, 'ios'));
        } else {
            await copyTemplate(path.join(templateDir, 'ios-cpp'), path.join(projectPackageDir, 'ios'));
        }

        if (config.androidLang === 'cpp' || config.iosLang === 'cpp') {
            await copyTemplate(path.join(templateDir, 'cpp-shared'), path.join(projectPackageDir, 'cpp'));
        }

        const className = toPascalCase(config.projectName);
        const useKotlin = config.androidLang === 'kotlin';
        const useSwift = config.iosLang === 'swift';
        const simpleNamespace = config.projectName.replace(/-/g, '').toLowerCase();
        const androidNamespace = simpleNamespace;
        const androidPackage = `com.margelo.nitro.${simpleNamespace}`;

        spinner.text = 'Processing templates...';
        await processTemplates(config.targetDir, {
            projectName: config.projectName,
            className: className,
            projectNamespace: simpleNamespace,
            androidNamespace: androidNamespace,
            androidPackage: androidPackage,
            useCpp: config.androidLang === 'cpp' || config.iosLang === 'cpp',
            useAndroidCpp: config.androidLang === 'cpp',
            useIosCpp: config.iosLang === 'cpp',
            useKotlin: useKotlin,
            useSwift: useSwift,
            iosLang: config.iosLang,
            androidLang: config.androidLang,
            cxxNamespace: simpleNamespace, // User request: namespace libname
            supportMacos: config.platforms.includes('macos'),
            supportWindows: config.platforms.includes('windows'),
            year: new Date().getFullYear(),
            author: config.author,
            homepage: config.homepage,
            description: 'A React Native Nitro Module'
        });

        spinner.text = 'Finalizing project structure...';
        const podspecPath = path.join(projectPackageDir, 'ios', 'library.podspec');
        if (await fs.pathExists(podspecPath)) {
            await fs.rename(podspecPath, path.join(projectPackageDir, `${className}.podspec`));
        }

        const androidSrcRoot = path.join(projectPackageDir, 'android', 'src', 'main', 'java');
        const androidPackagePath = path.join(androidSrcRoot, 'com', 'margelo', 'nitro', simpleNamespace);
        const oldPackagePath = path.join(androidSrcRoot, 'package');

        if (await fs.pathExists(oldPackagePath)) {
            await fs.ensureDir(androidPackagePath);

            if (useKotlin) {
                const moduleKt = path.join(oldPackagePath, 'HybridModule.kt');
                if (await fs.pathExists(moduleKt)) {
                    await fs.move(moduleKt, path.join(androidPackagePath, `Hybrid${className}.kt`));
                }
                const packageKt = path.join(oldPackagePath, 'HybridModulePackage.kt');
                if (await fs.pathExists(packageKt)) {
                    await fs.move(packageKt, path.join(androidPackagePath, `Hybrid${className}Package.kt`));
                }
            } else {
                const packageJava = path.join(oldPackagePath, 'HybridModulePackage.java');
                if (await fs.pathExists(packageJava)) {
                    await fs.move(packageJava, path.join(androidPackagePath, `Hybrid${className}Package.java`));
                } else {
                    await fs.copy(oldPackagePath, androidPackagePath);
                }
            }
            await fs.remove(oldPackagePath);
        }

        if (useSwift) {
            const iosDir = path.join(projectPackageDir, 'ios');
            const oldSwiftFile = path.join(iosDir, 'HybridModule.swift');
            if (await fs.pathExists(oldSwiftFile)) {
                await fs.rename(oldSwiftFile, path.join(iosDir, `Hybrid${className}.swift`));
            }
        }

        const cppDir = path.join(projectPackageDir, 'cpp');
        const oldCppFile = path.join(cppDir, 'HybridModule.cpp');
        const oldHppFile = path.join(cppDir, 'HybridModule.hpp');

        if (await fs.pathExists(oldCppFile)) {
            await fs.rename(oldCppFile, path.join(cppDir, `Hybrid${className}.cpp`));
        }
        if (await fs.pathExists(oldHppFile)) {
            await fs.rename(oldHppFile, path.join(cppDir, `Hybrid${className}.hpp`));
        }


        if (!(config.androidLang === 'cpp' || config.iosLang === 'cpp')) {
            await fs.remove(path.join(config.targetDir, 'CPPLINT.cfg'));
            await fs.remove(path.join(config.targetDir, '.clang-format'));
        }

        await fs.copy(path.join(config.targetDir, 'eslint.config.js'), path.join(projectPackageDir, 'eslint.config.js'));
        await fs.copy(path.join(config.targetDir, '.prettierrc.json'), path.join(projectPackageDir, '.prettierrc.json'));
        await fs.writeFile(path.join(projectPackageDir, '.prettierignore'), 'lib/\nandroid/build/\nios/build/\n');

        spinner.text = 'Initializing example app (this may take a few minutes)...';
        const exampleDir = path.join(config.targetDir, 'example');

        await fs.remove(exampleDir);

        const exampleName = `${toPascalCase(config.projectName)}Example`;
        try {
            require('child_process').execSync(`npx @react-native-community/cli@latest init ${exampleName} --directory example --skip-install --version latest --pm npm`, {
                cwd: config.targetDir,
                stdio: ['ignore', 'ignore', 'inherit']
            });
        } catch (e) {
            console.error('Failed to init example app:', e);
            throw e;
        }

        // Remove the git repository initialized by react-native init
        await fs.remove(path.join(exampleDir, '.git'));


        spinner.text = 'Configuring example app...';

        const metroConfig = `const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const root = path.resolve(__dirname, '..');
const packagesDir = path.join(root, 'packages');

const config = {
  watchFolders: [root],
  resolver: {
    nodeModulesPaths: [
      path.join(__dirname, 'node_modules'),
      path.join(root, 'node_modules'),
      packagesDir,
    ],
    extraNodeModules: {
      stream: require.resolve('readable-stream'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
`;

        const babelConfig = `module.exports = {
  presets: ['module:@react-native/babel-preset', '@babel/preset-typescript'],
  plugins: [
    ['@babel/plugin-transform-class-static-block'],
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
      },
    ],
  ],
};
`;
        await fs.writeFile(path.join(exampleDir, 'metro.config.js'), metroConfig);
        await fs.writeFile(path.join(exampleDir, 'babel.config.js'), babelConfig);

        const examplePkgJsonPath = path.join(exampleDir, 'package.json');
        if (await fs.pathExists(examplePkgJsonPath)) {
            const examplePkg = await fs.readJson(examplePkgJsonPath);
            examplePkg.dependencies = {
                ...examplePkg.dependencies,
                "react-native-nitro-modules": "^0.29.1",
                [`${config.projectName}`]: "workspace:*"
            };
            examplePkg.devDependencies = {
                ...examplePkg.devDependencies,
                "babel-plugin-module-resolver": "^5.0.0",
                "readable-stream": "^4.5.0"
            };
            await fs.writeJson(examplePkgJsonPath, examplePkg, { spaces: 2 });
            await fs.writeJson(examplePkgJsonPath, examplePkg, { spaces: 2 });
        }

        // Patch android/settings.gradle to point to root node_modules for plugins
        const settingsGradlePath = path.join(exampleDir, 'android', 'settings.gradle');
        if (await fs.pathExists(settingsGradlePath)) {
            let settingsGradle = await fs.readFile(settingsGradlePath, 'utf-8');
            settingsGradle = settingsGradle.replace(
                /includeBuild\(['"]\.\.\/node_modules\/@react-native\/gradle-plugin['"]\)/g,
                "includeBuild('../../node_modules/@react-native/gradle-plugin')"
            );
            await fs.writeFile(settingsGradlePath, settingsGradle);
        }

        if (config.exampleConfig === 'full') {
            spinner.text = 'Configuring full example app (Tests, Benchmarks, Navigation)...';
            const examplePkgJsonPath = path.join(exampleDir, 'package.json');

            if (await fs.pathExists(examplePkgJsonPath)) {
                const examplePkg = await fs.readJson(examplePkgJsonPath);
                examplePkg.dependencies = {
                    ...examplePkg.dependencies,
                    [`${config.projectName}`]: "workspace:*",
                    "chai": "^5.0.0",
                    "tinybench": "^2.0.0",
                    "@react-navigation/native": "^7.0.0",
                    "@react-navigation/native-stack": "^7.0.0",
                    "@react-navigation/bottom-tabs": "^7.0.0",
                    "react-native-screens": "^4.0.0",
                    "react-native-safe-area-context": "^5.0.0"
                };
                examplePkg.devDependencies = {
                    ...examplePkg.devDependencies,
                    "@types/chai": "^5.0.0"
                };
                examplePkg.scripts = {
                    ...examplePkg.scripts,
                    "pods": "pod-install ios"
                };
                await fs.writeJson(examplePkgJsonPath, examplePkg, { spaces: 2 });
            }

            await fs.ensureDir(path.join(exampleDir, 'src', 'tests'));
            await fs.ensureDir(path.join(exampleDir, 'src', 'benchmarks'));
            await fs.ensureDir(path.join(exampleDir, 'src', 'navigators'));
            await fs.ensureDir(path.join(exampleDir, 'src', 'components'));

            const exampleTemplateDir = path.join(__dirname, '../templates/example-full');
            if (await fs.pathExists(exampleTemplateDir)) {
                await fs.copy(exampleTemplateDir, exampleDir, { overwrite: true });
            }


            await processTemplates(exampleDir, {
                projectName: config.projectName,
                className: className,
                projectNamespace: simpleNamespace,
                androidNamespace: androidNamespace,
                androidPackage: androidPackage,
                useCpp: config.androidLang === 'cpp' || config.iosLang === 'cpp',

            });

            await fs.remove(path.join(exampleDir, 'App.tsx'));

            const indexJsPath = path.join(exampleDir, 'index.js');
            if (await fs.pathExists(indexJsPath)) {
                let indexJs = await fs.readFile(indexJsPath, 'utf-8');
                indexJs = indexJs.replace('./App', './src/App');
                await fs.writeFile(indexJsPath, indexJs);
            }

        } else {
            const simpleAppTsx = `import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ${className} } from '${config.projectName}';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Add (3+7): {${className}.add(3, 7)}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});

export default App;
`;
            await fs.writeFile(path.join(exampleDir, 'App.tsx'), simpleAppTsx);
        }

        spinner.succeed(chalk.green(`Project ${config.projectName} created successfully!`));

        spinner.text = 'Initializing git repository...';
        spinner.start();
        try {
            require('child_process').execSync('git init', {
                cwd: config.targetDir,
                stdio: 'ignore'
            });
            require('child_process').execSync('git add .', {
                cwd: config.targetDir,
                stdio: 'ignore'
            });
            require('child_process').execSync('git commit -m "Initial commit: Generated Nitro module"', {
                cwd: config.targetDir,
                stdio: 'ignore'
            });
            spinner.succeed(chalk.green('Git repository initialized with initial commit'));
        } catch (gitError) {
            spinner.warn(chalk.yellow('Failed to initialize git repository (optional step)'));
        }

        console.log('\nNext steps:');
        console.log(`  cd ${config.projectName}`);
        console.log('  bun install');
        console.log('  bun run build');
        console.log('  bun run example start');

    } catch (error) {
        spinner.fail(chalk.red('Failed to create project.'));
        console.error(error);
        process.exit(1);
    }
}

async function processTemplates(dir: string, data: any) {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            await processTemplates(filePath, data);
        } else if (file.endsWith('.hbs')) {
            const templateContent = await fs.readFile(filePath, 'utf-8');
            const template = Handlebars.compile(templateContent);
            const result = template(data);
            const newPath = path.join(dir, file.replace('.hbs', ''));
            await fs.writeFile(newPath, result);
            await fs.remove(filePath);
        }
    }
}

async function copyTemplate(src: string, dest: string) {
    if (await fs.pathExists(src)) {
        await fs.copy(src, dest, { overwrite: false });
    }
}

function toPascalCase(str: string) {
    return str.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text: string) {
    return text.replace(/-/, "").toUpperCase();
}
