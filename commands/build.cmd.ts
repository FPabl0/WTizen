import { ISCliCmd } from '../SCli';
const execSync = require( 'child_process' ).execSync;

/***
 * Command declaration
 */
export const cmd_build: ISCliCmd = {
  name: 'build',
  desc: 'Build project',
  callback: async ( args: any, opts: any ) => {
    try {
      execSync( 'tizen build-web --output .build', { stdio: 'inherit' } );
    } catch ( err ) { }
  }
}