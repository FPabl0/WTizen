import clui from 'clui';

export default class Loader {

  private static started = false;
  private static loader_: clui.Spinner = new clui.Spinner( '', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'] );

  static start = ( msg: string ) => {
    if ( Loader.started ) return;
    Loader.loader_.message( msg );
    Loader.loader_.start();
    Loader.started = true;
  }

  static stop = () => {
    if ( !Loader.started ) return;
    Loader.loader_.stop();
    Loader.started = false;
  }
}