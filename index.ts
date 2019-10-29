#!/usr/bin/env node

import { SCli } from './SCli';
import chalk from 'chalk';
import figlet from 'figlet';
import { cmd_create } from './commands/create.cmd';
import { cmd_build } from './commands/build.cmd';
import { cmd_install } from './commands/install.cmd';
import { cmd_launch } from './commands/launch.cmd';
import { cmd_run } from './commands/run.cmd';

SCli.init( chalk.red.bold(
  figlet.textSync( 'wtizen', { font: 'Serifcap', horizontalLayout: 'full' } )
), 'wtizen', '1.0.0', 'Web Tizen CLI', true );

SCli.add( cmd_create );
SCli.add( cmd_build );
SCli.add( cmd_install );
SCli.add( cmd_launch );
SCli.add( cmd_run );

SCli.loop();
