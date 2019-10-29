import inquirer from 'inquirer';

export const selectOne = ( message: string, choices: string[] ) => {
  const questions: inquirer.Questions = [
    {
      type: 'list',
      name: 'chosen',
      message,
      choices
    }
  ];
  return new Promise<string>( async ( resolve ) => {
    const resp = await inquirer.prompt( questions );
    resolve( resp.chosen );
  } );
}