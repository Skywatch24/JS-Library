import React, {useEffect, useState} from 'react';
import JSONPretty from 'react-json-pretty';
import Skywatch from '@skywatch/js';
import oauthImg from './images/oauth.png';
import './styles/app.css';

const {LockController} = Skywatch;

const test_lock_id = '54164';
const server_url = '/api/v2';
const redirect_uri = window.location.origin;
const oauth_url = `https://service.skywatch24.com/oauth2?redirect_uri=${redirect_uri}`;

const APP = () => {
  const [apiToken, setApiToken] = useState('');
  const [statusInfo, setStatusInfo] = useState({});
  const [passcodeList, setPasscodeList] = useState([]);
  const [isUpdatedStatus, setIsUpdateStatus] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [passcodeName, setPasscodeName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let search = window.location.search;
    if (search.split('=')[2]) {
      setApiToken(search.split('=')[2]);
    }
  }, []);

  const renderOauth = () => {
    return (
      <>
        <h2>Use Oauth 2.0 to get user token</h2>
        <div className="code">
          Step 1: service.skywatch24.com/oauth2?redirect_uri='redirect_uri'
          <br />
          Then user grants authorization
          <br />
          Step 2: Redirect to redirect_uri?code='code' ={'>'} use code to
          initialize JS library
        </div>
        <h3>Flow Chart</h3>
        <img src={oauthImg} alt="Background" width="609" height="374" />
        <br />
        <button onClick={() => window.open(oauth_url)}>Try Oauth</button>
      </>
    );
  };

  const initToken = (url, token) => {
    Skywatch.initialize(url, token);
  };

  const renderInitToken = () => {
    return (
      <>
        <h2>Initialize</h2>
        <div className="code">
          import Skywatch from '@skywatch/js';
          <br />
          Skywatch.initialize('https://service.skywatch24.com/api', 'token');
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
      </>
    );
  };

  const getInfo = deviceId => {
    LockController.getInfo(deviceId).then(data => {
      setStatusInfo(data);
    });
  };

  const renderLockInfo = () => {
    return (
      <>
        <h4>Lock Info</h4>
        <div className="code">Skywatch.LockController.getInfo(deviceId);</div>
        <button onClick={() => getInfo(test_lock_id)}>Get Lock Info</button>
        <h4>Result</h4>
        <JSONPretty className="code" data={statusInfo}></JSONPretty>
      </>
    );
  };

  const getPasscodeList = deviceId => {
    LockController.getPasscodeList(deviceId).then(data => {
      setPasscodeList(data);
    });
  };

  const renderPasscodeList = () => {
    return (
      <>
        <h4>Passcode List</h4>
        <div className="code">
          Skywatch.LockController.getPasscodeList(deviceId);
        </div>
        <button onClick={() => getPasscodeList(test_lock_id)}>
          Get Passcode List
        </button>
        <h4>Result</h4>
        <JSONPretty className="code" data={passcodeList}></JSONPretty>
      </>
    );
  };

  const updateStatus = (deviceId, status) => {
    LockController.updateStatus(deviceId, status)
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
          Skywatch.LockController.updateStatus(deviceId, status);
        </div>
        <button onClick={() => updateStatus(test_lock_id, '1')}>Lock</button>
        <button onClick={() => updateStatus(test_lock_id, '0')}>Unlock</button>
        <h4>Result</h4>
        <div className="code">{isUpdatedStatus}</div>
      </>
    );
  };

  const createSchudlePasscde = (
    deviceId,
    name,
    passcode,
    email,
    startTime,
    endTime,
  ) => {
    LockController.createSchudlePasscde(
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
          Skywatch.LockController.createSchudlePasscde(deviceId, name, email,
          passcode, scheduleTime);
        </div>
        <label htmlFor="passcode-name">Passcode name:</label>
        <br />
        <input
          name="passcode-name"
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
          onChange={e => setPasscode(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="email">Email:</label>
        <br />
        <input
          name="email"
          type="text"
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
            createSchudlePasscde(
              test_lock_id,
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
      <h3>Door Lock:</h3>
      {renderLockInfo()}
      {renderPasscodeList()}
      {renderAddScheduleCode()}
      {renderUpdateStatus()}
    </>
  );
};

export default APP;
