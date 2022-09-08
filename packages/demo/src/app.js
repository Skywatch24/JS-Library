import React, {useEffect, useState} from 'react';
import Skywatch from '@skywatch/js';
import {MuiTabs, TabContainer} from './components';
import {
  Login,
  GetToken,
  InitToken,
  DeviceList,
  DeviceInfo,
  GetPasscodes,
  AddAlwaysPasscode,
  AddSchedulePasscode,
  DeletePasscode,
  UpdateLockStatus,
} from './steps';
import {
  oauth_url,
  server_url,
  general_url,
  APP_ID,
  APP_SECRET,
  API_RESULT,
  STEPS,
  TABS,
  STATUS_CODE,
  EMPTY_STRING,
} from './utils/constants';

const {Lock, Device, User} = Skywatch;

const APP = () => {
  const [oauthCode, setOauthCode] = useState(EMPTY_STRING);
  const [getTokenResult, setGetTokenResult] = useState(EMPTY_STRING);
  const [apiToken, setApiToken] = useState(EMPTY_STRING);
  const [deviceId, setDeviceId] = useState(EMPTY_STRING);
  const [statusInfo, setStatusInfo] = useState({});
  const [deviceList, setDeviceList] = useState([]);
  const [passcodeList, setPasscodeList] = useState([]);
  const [addAlwaysCodeResult, setAddAlwaysCodeResult] = useState([]);
  const [addScheduleCodeResult, setAddScheduleCodeResult] = useState([]);
  const [deleteScheduleCodeResult, setDeleteScheduleCodeResult] = useState([]);
  const [isUpdatedStatus, setIsUpdateStatus] = useState(EMPTY_STRING);
  const [isInitStatus, setIsInitStatus] = useState(EMPTY_STRING);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [passcodeName, setPasscodeName] = useState(EMPTY_STRING);
  const [passcodeId, setPasscodeId] = useState(EMPTY_STRING);
  const [passcode, setPasscode] = useState(EMPTY_STRING);
  const [email, setEmail] = useState(EMPTY_STRING);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isApiProcessing, setIsApiProcessing] = useState(false);

  useEffect(() => {
    let search = window.location.search;

    if (search.split('code=')[1]) {
      setOauthCode(search.split('code=')[1]);
    }
  }, []);

  const isCurrentTab = tab => {
    return (
      selectedTabIndex < Object.keys(TABS).length &&
      Object.values(TABS)[selectedTabIndex].index === tab.index
    );
  };

  const checkStepAvailable = step => {
    if (isApiProcessing) {
      return false;
    }
    switch (step.key) {
      case STEPS.login.key:
        return true;
      case STEPS.getToken.key:
        return (
          APP_ID !== EMPTY_STRING &&
          APP_SECRET !== EMPTY_STRING &&
          oauthCode !== EMPTY_STRING
        );
      case STEPS.initToken.key:
        return apiToken !== EMPTY_STRING;
      case STEPS.deviceList.key:
        return (
          apiToken !== EMPTY_STRING && isInitStatus === API_RESULT.success.msg
        );
      case STEPS.lockInfo.key:
      case STEPS.passcodeList.key:
      case STEPS.addAlwaysCode.key:
      case STEPS.addScheduleCode.key:
      case STEPS.deletePasscode.key:
      case STEPS.updateStatus.key:
        return (
          apiToken !== EMPTY_STRING &&
          isInitStatus === API_RESULT.success.msg &&
          deviceId !== EMPTY_STRING
        );
      default:
        return true;
    }
  };

  const renderOAuthTab = () => {
    let show = isCurrentTab(TABS.oAuth);
    return (
      <>
        {show && (
          <>
            <Login
              oauthCode={oauthCode}
              disabled={!checkStepAvailable(STEPS.login)}
              onLoginClick={() => window.open(oauth_url)}
            />
            <GetToken
              getTokenResult={getTokenResult}
              disabled={!checkStepAvailable(STEPS.getToken)}
              onGetAccessTokenClick={() =>
                getAccessToken(APP_ID, APP_SECRET, oauthCode)
              }
            />
            <InitToken
              apiToken={apiToken}
              isInitStatus={isInitStatus}
              disabled={!checkStepAvailable(STEPS.initToken)}
              initToken={() => initToken(server_url, apiToken)}
            />
          </>
        )}
      </>
    );
  };

  const renderDevicesTab = () => {
    let show = isCurrentTab(TABS.devices);
    return (
      <>
        {show && (
          <>
            <DeviceList
              deviceList={deviceList}
              disabled={!checkStepAvailable(STEPS.deviceList)}
              getDeviceList={getDeviceList}
            />
            <DeviceInfo
              deviceList={deviceList}
              deviceId={deviceId}
              statusInfo={statusInfo}
              disabled={!checkStepAvailable(STEPS.lockInfo)}
              setDeviceId={setDeviceId}
              getLockInfo={getLockInfo}
            />
          </>
        )}
      </>
    );
  };

  const renderLockPasscodeTab = () => {
    let show = isCurrentTab(TABS.lockPasscode);
    return (
      <>
        {show && (
          <>
            <GetPasscodes
              deviceId={deviceId}
              passcodeList={passcodeList}
              disabled={!checkStepAvailable(STEPS.passcodeList)}
              getPasscodeList={() => getPasscodeList(deviceId)}
            />
            <AddAlwaysPasscode
              deviceId={deviceId}
              passcodeName={passcodeName}
              passcode={passcode}
              email={email}
              addAlwaysCodeResult={addAlwaysCodeResult}
              disabled={!checkStepAvailable(STEPS.addAlwaysCode)}
              setPasscodeName={setPasscodeName}
              setPasscode={setPasscode}
              setEmail={setEmail}
              createAlwaysPasscode={() => {
                createAlwaysPasscode(deviceId, passcodeName, passcode, email);
              }}
            />
            <AddSchedulePasscode
              deviceId={deviceId}
              passcodeName={passcodeName}
              passcode={passcode}
              email={email}
              addScheduleCodeResult={addScheduleCodeResult}
              disabled={!checkStepAvailable(STEPS.addScheduleCode)}
              setPasscodeName={setPasscodeName}
              setPasscode={setPasscode}
              setEmail={setEmail}
              onStartTimeChange={e => {
                const timestamp = new Date(e.target.value).getTime() / 1000;
                setStartTime(timestamp);
              }}
              onEndTimeChange={e => {
                const timestamp = new Date(e.target.value).getTime() / 1000;
                setEndTime(timestamp);
              }}
              createSchudlePasscode={() => {
                createSchudlePasscode(
                  deviceId,
                  passcodeName,
                  passcode,
                  email,
                  startTime,
                  endTime,
                );
              }}
            />
            <DeletePasscode
              deviceId={deviceId}
              passcodeId={passcodeId}
              passcode={passcode}
              deleteScheduleCodeResult={deleteScheduleCodeResult}
              disabled={!checkStepAvailable(STEPS.deletePasscode)}
              setPasscodeId={setPasscodeId}
              setPasscode={setPasscode}
              deletePasscode={() => {
                deletePasscode(deviceId, passcodeId, passcode);
              }}
            />
          </>
        )}
      </>
    );
  };

  const renderLockStatusTab = () => {
    let show = isCurrentTab(TABS.lockStatus);
    return (
      <>
        {show && (
          <>
            <UpdateLockStatus
              deviceId={deviceId}
              isUpdatedStatus={isUpdatedStatus}
              disabled={!checkStepAvailable(STEPS.updateStatus)}
              updateStatus={updateStatus}
            />
          </>
        )}
      </>
    );
  };

  const getAccessToken = (appId, appSecret, code) => {
    setIsApiProcessing(true);
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
      .then(response => {
        if (response.status === STATUS_CODE.STATUS_CODE_200_SUCCESS) {
          return response.text();
        } else {
          return EMPTY_STRING;
        }
      })
      .then(token => {
        if (token !== EMPTY_STRING) {
          setApiToken(token);
          setGetTokenResult(token);
        } else {
          setApiToken(EMPTY_STRING);
          setGetTokenResult(API_RESULT.fail.msg);
        }
        setIsApiProcessing(false);
      });
  };

  const initToken = (url, token) => {
    setIsApiProcessing(true);
    if (url !== EMPTY_STRING && token !== EMPTY_STRING) {
      Skywatch.initialize(url, token);
      setIsInitStatus(API_RESULT.success.msg);
      setIsApiProcessing(false);
    } else {
      setIsInitStatus(API_RESULT.fail.msg);
      setIsApiProcessing(false);
    }
  };

  const getDeviceList = () => {
    setIsApiProcessing(true);
    Device.getInfo().then(data => {
      setDeviceList(data);
      setIsApiProcessing(false);
    });
  };

  const getLockInfo = deviceId => {
    setIsApiProcessing(true);
    Lock.getInfo(deviceId).then(data => {
      setStatusInfo(data);
      setIsApiProcessing(false);
    });
  };

  const getPasscodeList = deviceId => {
    setIsApiProcessing(true);
    Lock.getPasscodeList(deviceId).then(data => {
      setPasscodeList(data);
      setIsApiProcessing(false);
    });
  };

  const createAlwaysPasscode = (deviceId, name, passcode, email) => {
    setIsApiProcessing(true);
    Lock.createAlwaysPasscode(deviceId, name, passcode, email).then(data => {
      if (data.result === API_RESULT.success.value) {
        setAddAlwaysCodeResult(data.data);
      } else {
        setAddAlwaysCodeResult(data.data + '\n' + data.message);
      }
      setIsApiProcessing(false);
    });
  };

  const createSchudlePasscode = (
    deviceId,
    name,
    passcode,
    email,
    startTime,
    endTime,
  ) => {
    setIsApiProcessing(true);
    Lock.createSchudlePasscode(
      deviceId,
      name,
      passcode,
      startTime,
      endTime,
      email,
    ).then(data => {
      if (data.result === API_RESULT.success.value) {
        setAddScheduleCodeResult(data.data);
      } else {
        setAddScheduleCodeResult(data.data + '\n' + data.message);
      }
      setIsApiProcessing(false);
    });
  };

  const deletePasscode = (deviceId, passcodeId, passcode) => {
    setIsApiProcessing(true);
    Lock.deletePasscode(deviceId, passcodeId, passcode).then(data => {
      if (data.result === API_RESULT.success.value) {
        setDeleteScheduleCodeResult(data.data);
      } else {
        setDeleteScheduleCodeResult(data.data + '\n' + data.message);
      }
      setIsApiProcessing(false);
    });
  };

  const updateStatus = (deviceId, status) => {
    setIsApiProcessing(true);
    Lock.updateStatus(deviceId, status)
      .then(data => {
        console.log(data);
        setIsApiProcessing(false);
        setIsUpdateStatus(API_RESULT.success.msg);
      })
      .catch(err => {
        setIsApiProcessing(false);
        setIsUpdateStatus(API_RESULT.fail.msg + err);
      });
  };

  const scrollToTop = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  };

  return (
    <>
      <MuiTabs
        tabs={TABS}
        selectedTabIndex={selectedTabIndex}
        onSelectedTabChanged={index => {
          setSelectedTabIndex(index);
          scrollToTop();
        }}
      />
      <TabContainer>
        {renderOAuthTab()}
        {renderDevicesTab()}
        {renderLockPasscodeTab()}
        {renderLockStatusTab()}
      </TabContainer>
    </>
  );
};

export default APP;
