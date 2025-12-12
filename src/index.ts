#!/usr/bin/env node
import { Command } from 'commander';
import { input, select, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import path from 'path';
import { execSync } from 'child_process';
import { generateProject } from './generator';

const program = new Command();

program
    .name('create-nitro-project')
    .description('Scaffold a production-grade React Native Nitro Module')
    .version('0.0.1')
    .option('-n, --name <name>', 'Project name')
    .option('--android <lang>', 'Android language (kotlin/cpp)')
    .option('--ios <lang>', 'iOS language (swift/cpp)')
    .option('--addon <addons...>', 'Additional addons (macos, windows)')
    .option('--author <author>', 'Author name')
    .option('--author-url <url>', 'GitHub username or URL')
    .option('--repo-url <url>', 'Repository URL');

program.action(async (opts) => {
    console.log(chalk.bold.cyan('\n🚀 Welcome to create-nitro-project!\n'));
    console.log(chalk.gray('Let\'s set up your new Nitro Module.\n'));

    let { name, android, ios, addon } = opts;

    if (!name) {
        name = await input({
            message: 'What is the name of your project?',
            default: 'my-nitro-module',
            validate: (v) => /^[a-z0-9-_]+$/i.test(v) ? true : 'Invalid name'
        });
    }

    if (!android) {
        android = await select({
            message: 'Which language do you want to use for Android?',
            choices: [{ name: 'Kotlin (Default)', value: 'kotlin' }, { name: 'C++ (Advanced)', value: 'cpp' }],
            default: 'kotlin',
        });
    }

    if (!ios) {
        ios = await select({
            message: 'Which language do you want to use for iOS?',
            choices: [{ name: 'Swift (Default)', value: 'swift' }, { name: 'C++ (Advanced)', value: 'cpp' }],
            default: 'swift',
        });
    }

    if (!addon) {
        if (process.env.CI) {
            addon = [];
        } else {
            addon = await checkbox({
                message: 'Select additional platforms to support (addons):',
                choices: [{ name: 'macOS', value: 'macos' }, { name: 'Windows', value: 'windows' }],
            });
        }
    }

    const exampleConfig = await select({
        message: 'How do you want to configure the example app?',
        choices: [
            { name: 'Default (Minimal)', value: 'default' },
            { name: 'Full (Tests, Benchmarks, Navigation)', value: 'full' }
        ],
        default: 'default',
    });

    let gitName = 'Your Name';
    let gitUsername = '';
    try {
        gitName = execSync('git config user.name', { encoding: 'utf8' }).trim();
    } catch (e) { }
    try {
        const gitEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
        gitUsername = gitEmail.split('@')[0];
    } catch (e) { }

    const authorName = opts.author || await input({
        message: 'Author name:',
        default: gitName,
    });

    const authorGithub = opts.authorUrl || await input({
        message: 'GitHub username:',
        default: gitUsername,
    });

    const homepage = opts.repoUrl || await input({
        message: 'GitHub repository URL:',
        default: authorGithub ? `https://github.com/${authorGithub}/${name}` : `https://github.com/username/${name}`,
    });

    const config = {
        projectName: name,
        androidLang: android,
        iosLang: ios,
        platforms: addon || [],
        targetDir: path.resolve(process.cwd(), name),
        exampleConfig: exampleConfig as 'default' | 'full',
        author: authorName,
        authorGithub: authorGithub,
        homepage: homepage,
    };

    console.log(chalk.bold('\n📋 Configuration:'));
    console.log(`  Project Name: ${chalk.green(config.projectName)}`);
    console.log(`  Android: ${chalk.blue(config.androidLang)}`);
    console.log(`  iOS: ${chalk.blue(config.iosLang)}`);
    console.log(`  Addons: ${config.platforms.length ? chalk.blue(config.platforms.join(', ')) : chalk.gray('None')}`);
    console.log(`  Location: ${chalk.gray(config.targetDir)}\n`);

    await generateProject(config);
});

program.parse(process.argv);
