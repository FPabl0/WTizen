import minimist from 'minimist';
import chalk from 'chalk';

export interface ISCliOpt {
  flag: string;
  desc: string;
}

export interface ISCliCmd {
  name: string;
  alias?: string;
  desc: string;
  arguments?: string;
  subcommands?: string[];
  options?: ISCliOpt[];
  callback?: ( args: any, opts: any ) => void;
}

const cmdNameEqualTo = ( input: any[], name: string, subcommands: string[] | undefined ) => {
  let hasChildren = false;
  if ( subcommands !== null && subcommands !== undefined && subcommands.length > 0 ) {
    hasChildren = true;
  }
  if ( name === undefined || name === null || !input ) { return false; }
  const splitter = name.split( ' ' );
  if ( input.length === 0 && splitter.length === 1 && splitter[0] === '' ) { return true; }
  if ( input.length < splitter.length ) { return false; }
  if ( input.length > splitter.length && hasChildren ) { return false; }
  let acum = '';
  for ( let i = 0; i < splitter.length; i++ ) {
    acum += splitter[i];
    if ( input[i] !== splitter[i] ) {
      const pcmd = SCli.commands.filter( v => v.name == acum );
      if ( pcmd.length === 0 ) { return false; }
      if ( pcmd[0].alias === undefined ) { return false; }
      if ( input[i] !== pcmd[0].alias ) { return false }
    }
    acum += ' ';
  }
  return true;
}

const isShortLongOpt = ( opt: string ) => {
  if ( opt.charAt( 0 ) !== '-' ) return 0; // no valid opt
  if ( opt.charAt( 1 ) !== '-' ) return 1; // short
  return 2; // long
}

const buildOpts = ( opt: string, alias: any, boolean: string[] ) => {
  let short = '';
  let long = '';
  const splitter1 = opt.split( '<' );
  const splitter2 = splitter1[0].replace( /\s/g, '' )
    .split( ',' );
  for ( let s of splitter2 ) {
    if ( short === '' && isShortLongOpt( s ) === 1 ) {
      short = s.slice( 1 );
    } else if ( long === '' && isShortLongOpt( s ) === 2 ) {
      long = s.slice( 2 );
    }
  }
  if ( short !== '' && long === '' ) { long = short; }
  if ( long !== '' && short === '' ) { short = long; }
  if ( splitter1.length === 1 ) {
    boolean.push( long );
  }
  alias[short] = long;
}

const maxStrLen = ( arr: string[] ) => {
  return arr.reduce( function ( max, arg ) {
    return Math.max( max, arg.length );
  }, 0 );
}

const pad = ( str: string, width: number ) => {
  const len = Math.max( 0, width - str.length );
  return str + Array( len + 1 ).join( ' ' );
}


export class SCli {

  private static cliBanner = 'CLI_BANNER';

  private static cliVersion = '0.0.1';

  private static cliName = 'CLI_NAME';

  private static cyanColor = true;

  static commands: ISCliCmd[] = [];

  static init( banner: string, name: string, version: string, desc: string, cyanColor: boolean ) {
    SCli.cliBanner = banner;
    SCli.cliVersion = version;
    SCli.cliName = name;
    SCli.cyanColor = cyanColor;
    SCli.add( {
      name: '',
      desc,
      options: []
    } );
  }

  private static baseColor() {
    if ( SCli.cyanColor ) {
      return 'cyan';
    }
    return 'white';
  }

  private static getCleanArg( arg: string ) {
    return arg.replace( '<', '' ).replace( '>', '' );
  }

  private static padWidth( cmd: ISCliCmd ) {
    let maxlen = 0;
    const optflags: string[] = ['-h, --help'];
    for ( const o of cmd.options || [] ) { optflags.push( o.flag ); }
    maxlen = maxStrLen( optflags );
    if ( cmd.subcommands ) {
      const l = maxStrLen( cmd.subcommands ) + '|abcd <arguments>'.length;
      if ( l > maxlen ) {
        maxlen = l;
      }
    }
    return maxlen;
  }

  private static showHelp( cmd: ISCliCmd ) {
    let helper = '';
    let args = null;
    if ( cmd.arguments && cmd.arguments.length > 0 ) {
      args = cmd.arguments.split( ' ' );
    }
    let subcommands = false;
    let options = false;
    let pad_width = SCli.padWidth( cmd );
    if ( ( cmd.subcommands && cmd.subcommands.length > 0 ) || cmd.name === '' ) {
      subcommands = true;
    }
    if ( cmd.options && cmd.options.length > 0 ) {
      options = true;
    }
    if ( cmd.name === '' ) {
      helper += '\n' + SCli.cliBanner + chalk.white.bold( ` CLI v${SCli.cliVersion}` ) + '\n';
    } else {
      helper += chalk[SCli.baseColor()].bold( `\n${SCli.cliName} ${cmd.name}` );
      helper += chalk.bold( ` - ${cmd.desc}\n` );
    }
    // -- usage
    helper += chalk['white'].bold( `\nUsage:\n\n` );
    helper += `  ${chalk.gray( '$' )} `;
    if ( cmd.name === '' ) {
      helper += chalk[SCli.baseColor()]( `${SCli.cliName}` );
    } else {
      helper += chalk[SCli.baseColor()]( `${SCli.cliName} ${cmd.name}` );
    }
    if ( subcommands ) {
      helper += chalk.gray( ` <commands>` );
    } else if ( args ) {
      helper += chalk.gray( ` ${cmd.arguments}` );
    }
    helper += chalk.gray( ` [options]` );
    // -- options
    helper += chalk['white'].bold( `\n\nOptions:\n` );
    helper += `\n  ${chalk[SCli.baseColor()]( pad( '-h, --help', pad_width ) )}   Show this help info`;
    if ( options ) {
      for ( const o of cmd.options || [] ) {
        helper += `\n  ${chalk[SCli.baseColor()]( pad( o.flag, pad_width ) )}   ${o.desc}`;
      }
    }
    // -- subcommands
    if ( subcommands && SCli.commands.length > 1 ) {
      helper += chalk['white'].bold( `\n\nCommands:\n` );
      if ( cmd.name === '' ) {
        const clist: string[] = [];
        for ( const c of SCli.commands ) {
          if ( c.name.split( ' ' ).length === 1 && c.name !== '' ) {
            clist.push( c.name );
          }
        }
        pad_width = maxStrLen( clist ) + '|abcd <arguments>'.length;
        for ( const c of SCli.commands ) {
          if ( c.name.split( ' ' ).length === 1 && c.name !== '' ) {
            let lf = c.name;
            if ( c.alias ) { lf += `|${c.alias}`; }
            if ( c.arguments !== undefined && c.arguments !== '' ) {
              lf += ` <arguments>`;
              //pad_width += ` <arguments>`.length;
            }
            helper += '\n  ' + chalk[SCli.baseColor()]( pad( lf, pad_width ) );
            helper += '   ' + c.desc;
          }
        }
      }
      for ( const sc of cmd.subcommands || [] ) {
        const fullsc = cmd.name + ' ' + sc;
        for ( const c of SCli.commands ) {
          if ( c.name === fullsc ) {
            let lf = sc;
            if ( c.alias ) { lf += `|${c.alias}`; }
            if ( c.arguments !== undefined && c.arguments !== '' ) {
              lf += ` <arguments>`;
            }
            helper += '\n  ' + chalk[SCli.baseColor()]( pad( lf, pad_width ) );
            helper += '   ' + c.desc;
          }
        }
      }
    }
    helper += '\n';
    console.log( helper );
  }

  static add( cmd: ISCliCmd ) {
    SCli.commands.push( cmd );
  }

  static loop() {
    const args = minimist( process.argv.slice( 2 ) )._;
    let valid = false;
    for ( let cmd of SCli.commands ) {
      if ( cmdNameEqualTo( args, cmd.name, cmd.subcommands ) ) {
        let argcounter = 0;
        const argslen = ( cmd.arguments || '' ).split( ' ' ).length;
        valid = true;
        let alias: any = { 'h': 'help' };
        const boolean: string[] = [];
        for ( let subopt of cmd.options || [] ) {
          buildOpts( subopt.flag, alias, boolean );
        }
        let skip = cmd.name.split( ' ' ).length + 2;
        if ( cmd.name === '' ) { skip = 2; }
        const subcmd = minimist( process.argv.slice( skip ),
          {
            boolean,
            alias,
            unknown: ( args: string ) => {
              if ( args.startsWith( '-' ) || args.startsWith( '--' ) ) {
                console.log( chalk.red( `Unknown option '${args}'` ) );
                process.exit( 1 );
                return false;
              }
              if ( argcounter >= argslen ) {
                return false;
              }
              argcounter++;
              return true;
            }
          } );
        const otherargs = subcmd._;
        let cmdargs: any = {};
        otherargs.forEach( ( v, i ) => {
          const argname = SCli.getCleanArg( ( cmd.arguments || '' ).split( ' ' )[i] );
          cmdargs[argname] = v;
        } );
        delete subcmd._;
        const opts = subcmd;
        if ( opts.help ) {
          this.showHelp( cmd );
          return;
        }
        if ( cmd.callback ) {
          cmd.callback( cmdargs, opts );
        } else {
          SCli.showHelp( cmd );
        }
      }
    }
    if ( !valid ) {
      console.log( chalk.red( `No such command '${args.join( ' ' )}'` ) );
    }
  }

}