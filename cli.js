#!/usr/bin/env node

const { program, Help } = require("commander");
const fs = require("fs");
const path = require("path")
const validateProjectName = require('validate-npm-package-name');
const chalk = require('chalk');

const version = require("./package.json").version;

program
    .version(version)
    .description("create vue2 project with vite!")
    .usage("create <app-name>")
    .on("--help", () => {
        console.log()
        console.log()
        console.log('  Example:')
        console.log()
        console.log(chalk.green(" $vite-vue2-app create <app-name>"))
        console.log()
        console.log()
    })

function createCommand() {
    program
        .command("create <app-name>")
        .description("create a project with vite and vue2")
        .action(async(projectName) => {
            const cwd = process.cwd() //当前目录
            const inCurrent = projectName === '.' //是否存在当前目录
            const name = inCurrent ? path.relative('../', cwd) : projectName //项目名称
            const targetDir = path.resolve(cwd, projectName || '.') //生成项目所在目录
            const result = validateProjectName(name) // 验证名称是否符合规范
                //关于更多的规范了解请参考：
            if (!result.validForNewPackages) {
                console.error(chalk.red(`Invalid project name: "${name}"`))
                result.errors && result.errors.forEach(err => {
                    console.error(chalk.red.dim('Error: ' + err))
                })
                result.warnings && result.warnings.forEach(warn => {
                    console.error(chalk.red.dim('Warning: ' + warn))
                })
                return;
            }
            if (fs.existsSync(targetDir)) {
                console.log(chalk.red(`★The targetDir:${targetDir} isn't empty, create project failed.`))
                return;
            }
            const templateDir = path.join(
                __dirname,
                `template`
            );
            const root = path.join(cwd, targetDir)
            const renameFiles = {
                _gitignore: '.gitignore',
            }
            const files = fs.readdirSync(templateDir)
            const write = async(file, content) => {
                const targetPath = renameFiles[file] ?
                    path.join(root, renameFiles[file]) :
                    path.join(root, file)
                if (content) {
                    fs.writeFileSync(targetPath, content)
                } else {
                    fs.copyFileSync(path.join(templateDir, file), targetPath)
                }
            }
            for (const file of files.filter((f) => (f !== 'package.json' || f !== '.git'))) {
                await write(file)
            }

            const pkg = require(path.join(templateDir, `package.json`))
            pkg.name = path.basename(root)
            await write('package.json', JSON.stringify(pkg, null, 2))

            console.log(`\nDone. Now run:\n`)
            if (root !== cwd) {
                console.log(`  cd ${path.relative(cwd, root)}`)
            }
            console.log(`  npm install (or \`yarn\`)`)
            console.log(`  npm run dev (or \`yarn dev\`)`)
            console.log()
        })
}

createCommand();
program.parse(process.argv);