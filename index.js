const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { exec } = require('child_process');
const Settings = require('./Settings');

function _pulse (pyName, settings) {
  if (settings.get('YeeLight', false) === true) {
    const hex = settings.get('BulbColor', '#7289DA');
    const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex);
    const r =  parseInt(result[1], 16);
    const g =  parseInt(result[2], 16);
    const b =  parseInt(result[3], 16);
    const color = `${r},${g},${b}`;
    exec(`${pyName} ${__dirname}/pulse_yeelight.py ${settings.get('BulbIP', '192.168.0.100')} ${color} ${settings.get('PulseDuration', 250)} ${settings.get('YeeAutoOn', true)} ${settings.get('BulbBright', 100)}`);
  }
}

function _noPY () {
  powercord.pluginManager.get('pc-announcements').sendNotice({
    id: 'lightify-no-py',
    type: powercord.pluginManager.get('pc-announcements').Notice.TYPES.RED,
    message: 'Python 3.x is required for the plugin Lightify to function.',
    button: {
      text: 'Download',
      onClick: () => {
        require('electron').shell.openExternal('https://www.python.org/downloads');
        powercord.pluginManager.get('pc-announcements').closeNotice('lightify-no-py');
      }
    }
  });
}

function _needsDeps (pyName,) {
  powercord.pluginManager.get('pc-announcements').sendNotice({
    id: 'lightify-no-deps',
    type: powercord.pluginManager.get('pc-announcements').Notice.TYPES.BLUE,
    message: 'Lightify needs to install additional dependencies',
    button: {
      text: 'Install',
      onClick: () => {
        exec(`${pyName} -m pip install -r ${__dirname}/requirements.txt`);
        powercord.pluginManager.get('pc-announcements').closeNotice('lightify-no-deps');
        powercord.pluginManager.remount('lightify');
      }
    }
  });
}

async function _checkPings (pyName, settings) {
  const { isMentioned } = await getModule([ 'isMentioned' ]);
  const { getCurrentUser } = await getModule([ 'getCurrentUser' ]);

  // Shoutout to Ghost-Buster plugin!
  const mdl = await getModule([ 'shouldNotify' ]);
  inject('lightify-showMention', mdl, 'shouldNotify', (args, res) => {
    const self = getCurrentUser();
    const message = args[0];

    if (self.id !== message.author.id && isMentioned(message, self.id, true)) {
      _pulse(pyName, settings);
    }

    return res;
  });
}

module.exports = class Lightify extends Plugin {
  async startPlugin () {
    this.registerSettings('lightify', 'Lightify', Settings);
    const pyName = process.platform === 'win32' ? 'py' : 'python3';
    exec(`${pyName} --version`, { windowsHide: true }, (error) => {
      // eslint-disable-next-line no-empty
      if (error) {
        _noPY();
      }
    });
    exec(`${pyName} -c "import yeelight"`, (error, stdout, stderr) => {
      if (stderr || stdout) {
        _needsDeps(pyName);
      }
    });
    _checkPings(pyName, this.settings);
  }
};
