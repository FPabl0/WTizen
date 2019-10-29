import { ISCliCmd } from '../SCli';
import chalk from 'chalk';
import { selectOne } from '../helpers/inquirer.helper';
const execSync = require( 'child_process' ).execSync;

interface IProfileTemplate {
  profile: string;
  templates: string[];
}

/***
 * Command declaration
 */
export const cmd_create: ISCliCmd = {
  name: 'create',
  desc: 'Create a wtizen project',
  arguments: '<projectname>',
  callback: async ( args: any, opts: any ) => {
    if ( args.projectname === undefined ) {
      return console.log( chalk.red.bold( 'You need to specify the project name' ) );
    }
    let list = '';
    try {
      list = execSync( `tizen list web-project` );
    } catch ( err ) { }
    const alltemplates = list.toString().split( '\n' ).slice( 1, -1 );
    const profiles = [];
    const profile_template: IProfileTemplate[] = [];
    for ( const t of alltemplates ) {
      const splitter = t.replace( /\s+/g, ' ' ).split( ' ' );
      const coinc = profile_template.filter( v => v.profile === splitter[0] );
      if ( coinc.length === 0 ) {
        profile_template.push( { profile: splitter[0], templates: [] } );
      }
      profile_template.forEach( ( v, i, arr ) => {
        if ( v.profile === splitter[0] ) {
          arr[i].templates.push( splitter[1] );
          return;
        }
      } );
    }
    for ( const pt of profile_template ) {
      profiles.push( pt.profile );
    }

    const cprofile = await selectOne( 'Select the profile:', profiles );
    const ctemplate = await selectOne( 'Select a template:',
      profile_template.filter( v => v.profile === cprofile )[0].templates );

    console.log( 'Creando...' );
    try {
      execSync( `tizen create web-project -n ${args.projectname} -p ${cprofile} -t ${ctemplate}`,
        { stdio: 'inherit' } );
    } catch ( err ) { }

  }
}