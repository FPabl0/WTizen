import { ISCliCmd } from '../SCli';
import { File } from '../helpers/file.helper';
import chalk from 'chalk';
const execSync = require( 'child_process' ).execSync;

/***
 * Command declaration
 */
export const cmd_install: ISCliCmd = {
  name: 'install',
  desc: 'Install Tizen App',
  options: [
    { flag: '-s, --sign <sign>', desc: 'Specifies the security profile name for signing' }
  ],
  callback: async ( args: any, opts: any ) => {
    let secprofile = '';
    if ( opts.sign !== undefined ) { secprofile = ` -s ${opts.sign}`; }

    const configxml = File.getFile( File.getWorkerPath(), 'config.xml' );
    if ( configxml === null ) {
      return console.log( chalk.red( 'Invalid tizen project' ) );
    }

    const projname = configxml.substring( configxml.indexOf( '<name>' ) + '<name>'.length,
      configxml.indexOf( '</name>' ) );

    try {
      execSync( `tizen package -t wgt${secprofile} -- ./.build/ ` +
        `&& tizen install -n ${projname}.wgt -- ./.build/`,
        { stdio: 'inherit' } );
    } catch ( err ) { }
  }
}