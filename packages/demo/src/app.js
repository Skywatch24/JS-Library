import React, {useEffect, useState} from 'react';
import JSONPretty from 'react-json-pretty';
import Skywatch from '@skywatch/js';
import oauthImg from './images/oauth.png';
import './styles/app.css';

const {Lock, Device} = Skywatch;

const server_url =
  process.env.NODE_ENV === 'development'
    ? '/api/v2'
    : 'https://service.skywatch24.com/api/v2';
//const redirect_uri = window.location.origin;
const redirect_uri =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/'
    : 'https://skywatch24.github.io/JS-Library/';
const general_url =
  process.env.NODE_ENV === 'development'
    ? '/api/general'
    : 'https://service.skywatch24.com/api/general';

const APP_ID = '123456';
const APP_SECRET = 'DB419E28FC3BD38C7F577291A576E8E2';

const oauth_url = `https://service.skywatch24.com/oauth2?app_id=${APP_ID}&redirect_uri=${redirect_uri}`;

const APP = () => {
  const [apiToken, setApiToken] = useState('');
  const [oauthCode, setOauthCode] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [statusInfo, setStatusInfo] = useState({});
  const [deviceList, setDeviceList] = useState([]);
  const [passcodeList, setPasscodeList] = useState([]);
  const [isUpdatedStatus, setIsUpdateStatus] = useState('');
  const [isInitStatus, setIsInitStatus] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [passcodeName, setPasscodeName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let search = window.location.search;

    if (search.split('code=')[1]) {
      setOauthCode(search.split('code=')[1]);
    }
  }, []);

  const getAccessToken = (appId, appSecret, code) => {
    const params = {
      app_id: appId,
      app_secret: appSecret,
      code: code,
      method_type: 'POST',
    };

    const query = Object.keys(params)
      .map(k => `${k}=${params[k]}`)
      .join('&');

    fetch(`${general_url}/oauth_access_token.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: query,
    })
      .then(response => response.text())
      .then(res => {
        setApiToken(res);
      });
  };

  const renderOauth = () => {
    return (
      <>
        <h2>Use Oauth 2.0 to get access token</h2>
        <h3>Authorization URL</h3>
        <div className="code">
          service.skywatch24.com/oauth2?app_id='app_ip'&redirect_uri='redirect_uri'
        </div>
        <p />
        When user grants authorization,the page will redirect to the
        `redirect_url` and contain `code` in the url.
        <p />
        <button onClick={() => window.open(oauth_url)}>Login</button>
        <h4>Authorization Code</h4>
        <div className="code">{oauthCode}</div>
        <h3>Exchange Access Token with Authorization code</h3>
        <div className="code">
          curl -X "POST"
          "https://service.skywatch24.com/api/general/oauth_access_token.php" \
          <br /> -H 'Content-Type:application/x-www-form-urlencoded;' \
          <br /> --data-urlencode "app_id=xxxx" \
          <br /> --data-urlencode "app_secret=xxxx" \
          <br /> --data-urlencode "code=xxxx" \
          <br /> --data-urlencode "method_type=POST"
        </div>
        <button onClick={() => getAccessToken(APP_ID, APP_SECRET, oauthCode)}>
          Get Access Token
        </button>
        <h4>Access Token</h4>
        <div className="code">{apiToken}</div>
        <h3>Flow Chart</h3>
        <img src={oauthImg} alt="Background" width="609" height="374" />
        <br />
      </>
    );
  };

  const initToken = (url, token) => {
    Skywatch.initialize(url, token);
    setIsInitStatus('success!');
  };

  const renderInitToken = () => {
    return (
      <>
        <h2>Initialize</h2>
        <div className="code">
          import Skywatch from '@skywatch/js';
          <br />
          Skywatch.initialize('https://service.skywatch24.com/api/v2', 'token');
        </div>
        <label htmlFor="token">Enter a token:</label>
        <br />
        <input
          name="token"
          type="text"
          value={apiToken}
          onChange={e => setApiToken(e.target.value)}
        />
        <br />
        <br />
        <button onClick={() => initToken(server_url, apiToken)}>
          Initialize
        </button>
        <h4>Result</h4>
        <div className="code">{isInitStatus}</div>
      </>
    );
  };

  const getDeviceList = () => {
    Device.getInfo().then(data => {
      setDeviceList(data);
    });
  };

  const renderDeviceList = () => {
    return (
      <>
        <h3>Device List</h3>
        <div className="code">Skywatch.Device.getInfo();</div>
        <button onClick={() => getDeviceList()}>Get Device List</button>
        <h4>Result</h4>
        <JSONPretty className="code" data={deviceList}></JSONPretty>
      </>
    );
  };

  const renderDeviceInput = () => {
    return (
      <>
        <h3>Door Lock:</h3>
        <label htmlFor="device_id">Enter your device id:</label>
        <br />
        <input
          name="device_id"
          type="text"
          value={deviceId}
          onChange={e => setDeviceId(e.target.value)}
        />
      </>
    );
  };

  const getLockInfo = deviceId => {
    Lock.getInfo(deviceId).then(data => {
      setStatusInfo(data);
    });
  };

  const renderLockInfo = () => {
    return (
      <>
        <h4>Lock Info</h4>
        <div className="code">Skywatch.Lock.getInfo(deviceId);</div>
        <button onClick={() => getLockInfo(deviceId)}>Get Lock Info</button>
        <h4>Result</h4>
        <JSONPretty className="code" data={statusInfo}></JSONPretty>
      </>
    );
  };

  const getPasscodeList = deviceId => {
    Lock.getPasscodeList(deviceId).then(data => {
      setPasscodeList(data);
    });
  };

  const renderPasscodeList = () => {
    return (
      <>
        <h4>Passcode List</h4>
        <div className="code">Skywatch.Lock.getPasscodeList(deviceId);</div>
        <button onClick={() => getPasscodeList(deviceId)}>
          Get Passcode List
        </button>
        <h4>Result</h4>
        <JSONPretty className="code" data={passcodeList}></JSONPretty>
      </>
    );
  };

  const updateStatus = (deviceId, status) => {
    Lock.updateStatus(deviceId, status)
      .then(data => {
        console.log(data);
        setIsUpdateStatus('success!');
      })
      .catch(err => {
        console.log(err);
        setIsUpdateStatus('failed!');
      });
  };

  const renderUpdateStatus = () => {
    return (
      <>
        <h4>Update Lock Status</h4>
        <div className="code">
          Skywatch.Lock.updateStatus(deviceId, status);
        </div>
        <button onClick={() => updateStatus(deviceId, '1')}>Lock</button>
        <button onClick={() => updateStatus(deviceId, '0')}>Unlock</button>
        <h4>Result</h4>
        <div className="code">{isUpdatedStatus}</div>
      </>
    );
  };

  const createAlwaysPasscode = (deviceId, name, passcode, email) => {
    Lock.createAlwaysPasscode(deviceId, name, email, passcode).then(data => {
      setPasscode('');
      setPasscodeName('');
      setEmail('');
      setPasscodeList(data.data);
    });
  };

  const renderAddAlwaysCode = () => {
    return (
      <>
        <h4>Add Always Passcode</h4>
        <div className="code">
          Skywatch.Lock.createAlwaysPasscde(deviceId, name, email, passcode);
        </div>
        <label htmlFor="passcode-name">Passcode name:</label>
        <br />
        <input
          name="passcode-name"
          value={passcodeName}
          type="text"
          onChange={e => setPasscodeName(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="passcode">Passcode (4 - 8 digits):</label>
        <br />
        <input
          name="passcode"
          type="text"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="email">Email:</label>
        <br />
        <input
          name="email"
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br />
        <br />
        <button
          onClick={() => {
            createAlwaysPasscode(deviceId, passcodeName, passcode, email);
          }}>
          Create Passcode
        </button>
      </>
    );
  };

  const createSchudlePasscode = (
    deviceId,
    name,
    passcode,
    email,
    startTime,
    endTime,
  ) => {
    Lock.createSchudlePasscode(
      deviceId,
      name,
      email,
      passcode,
      startTime,
      endTime,
    ).then(data => {
      setPasscode('');
      setPasscodeName('');
      setEmail('');
      setPasscodeList(data.data);
    });
  };

  const renderAddScheduleCode = () => {
    return (
      <>
        <h4>Add Schedule Passcode</h4>
        <div className="code">
          Skywatch.Lock.createSchudlePasscode(deviceId, name, email, passcode,
          startTime, endTime);
        </div>
        <label htmlFor="passcode-name">Passcode name:</label>
        <br />
        <input
          name="passcode-name"
          value={passcodeName}
          type="text"
          onChange={e => setPasscodeName(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="passcode">Passcode (4 - 8 digits):</label>
        <br />
        <input
          name="passcode"
          type="text"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="email">Email:</label>
        <br />
        <input
          name="email"
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="start">Choose a start time:</label>
        <br />
        <input
          type="datetime-local"
          name="start"
          onChange={e => {
            const timestamp = new Date(e.target.value).getTime();
            setStartTime(timestamp);
          }}></input>
        <br />
        <br />
        <label htmlFor="end">Choose a end time:</label>
        <br />
        <input
          type="datetime-local"
          name="end"
          onChange={e => {
            const timestamp = new Date(e.target.value).getTime();
            setEndTime(timestamp);
          }}></input>
        <br />
        <br />
        <button
          onClick={() => {
            createSchudlePasscode(
              deviceId,
              passcodeName,
              passcode,
              email,
              startTime,
              endTime,
            );
          }}>
          Create Passcode
        </button>
      </>
    );
  };

  return (
    <>
      {renderOauth()}
      {renderInitToken()}
      {renderDeviceList()}
      {renderDeviceInput()}
      {renderLockInfo()}
      {renderPasscodeList()}
      {renderAddAlwaysCode()}
      {renderAddScheduleCode()}
      {renderUpdateStatus()}
    </>
  );
};

export default APP;
