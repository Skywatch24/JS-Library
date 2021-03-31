import flvjs from 'flv.js';
import {Requests, CoreManager} from '../util';

const {API_KEY} = CoreManager;

const FlvPlayer = async (videoEl, deviceId) => {
  if (CoreManager.get(API_KEY) === '') {
    throw 'Please initiate token';
  }

  if (!videoEl || !deviceId) {
    throw 'Invalid Parameter';
  }

  const res = await Requests.getFlvStream(deviceId);
  if (res.data && flvjs.isSupported()) {
    const flvPlayer = flvjs.createPlayer({
      type: 'flv',
      url: res.data,
      config: {
        enableWorker: true,
        enableStashBuffer: false,
        stashInitialSize: 128,
      },
    });
    flvPlayer.attachMediaElement(videoEl);
    flvPlayer.load();
    flvPlayer.play();
    flvPlayer.on(flvjs.Events.ERROR, (errType, errDetail) => {
      console.log(errType, errDetail);
    });

    return flvPlayer;
  }
};

export default FlvPlayer;
