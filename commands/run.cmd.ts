import { ISCliCmd } from '../SCli';
import { File } from '../helpers/file.helper';
import chalk from 'chalk';
const execSync = require( 'child_process' ).execSync;

/***
 * Command declaration
 */
export const cmd_run: ISCliCmd = {
  name: 'run',
  desc: 'Build, install and launch the project',
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

    const startidx = configxml.indexOf( ' package="' ) + ' package="'.length;
    const packageid = configxml.substring( startidx,
      configxml.indexOf( '"', startidx ) );

    try {
      execSync( 'tizen build-web --output .build', { stdio: 'inherit' } );
      execSync( `tizen package -t wgt${secprofile} -- ./.build/ ` +
        `&& tizen install -n ${projname}.wgt -- ./.build/`,
        { stdio: 'inherit' } );
      execSync( `tizen run -p ${packageid}`,
        { stdio: 'inherit' } );
    } catch ( err ) {
    }
  }
}