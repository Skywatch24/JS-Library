import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import flvjs from 'flv.js';
import {Requests} from '../util';

const FlvPlayer = ({deviceId, onPlayerInit, onPlayerDispose, style}) => {
  const containerRef = useRef(null);
  useEffect(() => {
    const initPlayer = async () => {
      const res = await Requests.getFlvStream(deviceId);
      if (res.data && flvjs.isSupported() && containerRef.current) {
        const videoEl = containerRef.current.querySelector('video');
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

        onPlayerInit && onPlayerInit(flvPlayer);
      }
      return () => {
        onPlayerDispose && onPlayerDispose(null);
        flvPlayer.destroy();
      };
    };

    initPlayer();
  }, []);

  return (
    <div className="player" ref={containerRef}>
      <video id="videoElement" controls muted style={style} />
    </div>
  );
};

FlvPlayer.defaultProps = {};

FlvPlayer.propTypes = {
  deviceId: PropTypes.string.isRequired,
  onPlayerInit: PropTypes.func.isRequired,
  onPlayerDispose: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default FlvPlayer;
