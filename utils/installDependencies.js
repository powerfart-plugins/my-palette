const { spawn } = require('child_process');

module.exports = function installDependencies (dirname) {
  const command = (/^win/).test(process.platform) ? 'npm.cmd' : 'npm';
  const child = spawn(command, [ 'install' ], {
    cwd: dirname
  });

  return new Promise((resolve, reject) => {
    child.stdout.on('data', (data) => {
      console.info('%c[NPM]', 'color: #009200', data.toString().substr(1)); // remove \n
    });

    child.stderr.on('data', (data) => {
      console.error('%c[NPM ERROR]', 'color: #cc3534', data.toString());
    });

    child.on('close', (code) => {
      if (code) {
        const err = new Error();
        err.name = 'npm install error';
        err.code = 'NPM_INSTALL_ERROR';
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
