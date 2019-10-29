import fs from 'fs';
import path from 'path';

export const File = {

  getWorkerPath: () => {
    let currentPath = process.cwd();
    currentPath = currentPath.replace( /\\/g, '/' );
    return currentPath;
  },

  getRootPath: () => {
    const scriptPath = path.resolve( __dirname, '../' );
    return scriptPath;
  },

  getJSONFile: ( path: string, fname: string ) => {
    const f = `${path}/${fname}`;
    if ( File.fileExists( f ) ) {
      const rawdata = fs.readFileSync( f );
      const resp = JSON.parse( rawdata.toString() );
      return resp;
    } else {
      return null;
    }
  },

  getFile: ( path: string, fname: string ) => {
    const f = `${path}/${fname}`;
    if ( File.fileExists( f ) ) {
      const rawdata = fs.readFileSync( f );
      const resp = rawdata.toString();
      return resp;
    } else {
      return null;
    }
  },

  directoryExists: ( filePath: string ) => {
    try {
      return fs.statSync( filePath ).isDirectory();
    } catch ( err ) {
      return false;
    }
  },

  fileExists: ( filePath: string ) => {
    try {
      return fs.statSync( filePath ).isFile();
    } catch ( err ) {
      return false;
    }
  }
};