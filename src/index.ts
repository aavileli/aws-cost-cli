import { Command } from 'commander';
import packageJson from '../package.json' assert { type: 'json' };
import { getAccountAlias } from './account';
import { getAwsConfigFromOptionsOrFile } from './config';
import { getTotalCosts } from './cost';
import { printFancy } from './printers/fancy';
import { printJson } from './printers/json';
import { printPlainText } from './printers/text';

const program = new Command();

program
  .version(packageJson.version)
  .name('aws-cost')
  .description(packageJson.description)
  .option('-p, --profile [profile]', 'AWS profile to use', 'default')
  // AWS credentials to override reading from the config files
  .option('-k, --access-key [key]', 'AWS access key')
  .option('-s, --secret-key [key]', 'AWS secret key')
  .option('-r, --region [region]', 'AWS region')
  // Output variants
  .option('-j, --json', 'Get the output as JSON')
  .option('-s, --summary', 'Get only the summary without service breakdown')
  .option('-t, --text', 'Get the output as plain text (no colors / tables)')
  // Other options
  .option('-v, --version', 'Get the version of the CLI')
  .option('-h, --help', 'Get the help of the CLI')
  .parse(process.argv);

type OptionsType = {
  // AWS credentials to override reading from the config files
  accessKey: string;
  secretKey: string;
  region: string;
  // AWS profile to use
  profile: string;
  // Output variants
  text: boolean;
  json: boolean;
  summary: boolean;
  // Other options
  help: boolean;
};

const options = program.opts<OptionsType>();

if (options.help) {
  program.help();
  process.exit(0);
}

const awsConfig = await getAwsConfigFromOptionsOrFile({
  profile: options.profile,
  accessKey: options.accessKey,
  secretKey: options.secretKey,
  region: options.region,
});

const alias = await getAccountAlias(awsConfig);
const costs = await getTotalCosts(awsConfig);

if (options.json) {
  printJson(alias, costs, options.summary);
} else if (options.text) {
  printPlainText(alias, costs, options.summary);
} else {
  printFancy(alias, costs, options.summary);
}
