import flvjs from 'flv.js';
import { Requests } from '@skywatch/api';

const FlvPlayer = async (videoEl, deviceId) => {
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
        stashInitialSize: 128
      }
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