import videojs from 'video.js';
import { Requests } from '@skywatch/api';
import 'video.js/dist/video-js.min.css';
const defaultPlayerOptions = {
  autoplay: true,
  muted: true,
  aspectRatio: '16:9',
  mobileView: false
};

const ArchivesPlayer = async (tagEl, deviceId, archiveId, smart_ff = 0, seek = 0, options = {}) => {
  if (!tagEl || !deviceId || !archiveId) {
    throw 'Invalid Parameter';
  } // Get source url


  const res = await Requests.getArchives(deviceId, archiveId, smart_ff.toString());

  if (res.data) {
    // Create Video tag
    const videoEl = document.createElement('video');
    videoEl.controls = true;
    videoEl.className = 'video-js';
    tagEl.appendChild(videoEl); // Initiate video

    const player = videojs(videoEl, { ...defaultPlayerOptions,
      ...options,
      sources: [{
        src: res.data
      }]
    });
    player.currentTime(seek);
    return player;
  }
};

export default ArchivesPlayer;