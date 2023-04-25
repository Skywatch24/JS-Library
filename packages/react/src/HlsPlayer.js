import React, {useRef, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Hls from 'hls.js';
import {Requests} from '@skywatch/api';

const HlsPlayer = ({
  deviceId,
  onPlayerInit,
  onPlayerDispose,
  style,
  controls,
  onReady,
}) => {
  const containerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    if (deviceId !== '') {
      initPlayer();
    }
  }, [deviceId]);

  const initPlayer = async () => {
    if (player) {
      onPlayerDispose && onPlayerDispose(null);
      player.destroy();
      setPlayer(null);
    }

    const res = await Requests.getHlsStream(deviceId);

    var hls = new Hls();
    if (res.data && Hls.isSupported() && containerRef.current) {
      var video = containerRef.current.querySelector('video');
      var videoSrc = res.data;

      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, e => {
        console.error(e);
      });

      video.play();
      onReady();
      setPlayer(video);
      onPlayerInit && onPlayerInit(video);
    }
    return () => {
      onPlayerDispose && onPlayerDispose(null);
      hls.destroy();
      setPlayer(null);
    };
  };

  return (
    <div className="player" ref={containerRef}>
      <video id="videoElement" controls={controls} muted style={style} />
    </div>
  );
};

HlsPlayer.defaultProps = {
  controls: true,
  onReady: () => {},
};

HlsPlayer.propTypes = {
  deviceId: PropTypes.string.isRequired,
  onPlayerInit: PropTypes.func.isRequired,
  onPlayerDispose: PropTypes.func.isRequired,
  style: PropTypes.object,
  controls: PropTypes.bool,
  onReady: PropTypes.func,
};

export default HlsPlayer;
