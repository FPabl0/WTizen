import { ISCliCmd } from '../SCli';
import { File } from '../helpers/file.helper';
import chalk from 'chalk';
const execSync = require( 'child_process' ).execSync;

/***
 * Command declaration
 */
export const cmd_launch: ISCliCmd = {
  name: 'launch',
  desc: 'Launch Tizen App on Emulator or Device',
  callback: async ( args: any, opts: any ) => {
    const configxml = File.getFile( File.getWorkerPath(), 'config.xml' );
    if ( configxml === null ) {
      return console.log( chalk.red( 'Invalid tizen project' ) );
    }

    const startidx = configxml.indexOf( ' package="' ) + ' package="'.length;
    const packageid = configxml.substring( startidx,
      configxml.indexOf( '"', startidx ) );

    try {
      execSync( `tizen run -p ${packageid}`,
        { stdio: 'inherit' } );
    } catch ( err ) { }
  }
}