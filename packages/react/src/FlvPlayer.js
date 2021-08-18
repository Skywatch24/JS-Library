import React, {useRef, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import flvjs from 'flv.js';
import {Requests} from '@skywatch/api';
import LoadingSpinner from '../../../../skywatch_platform/service_frontend/images/v2/loading.gif';

const FlvPlayer = ({
  deviceId,
  onPlayerInit,
  onPlayerDispose,
  style,
  controls,
}) => {
  const [loading, setLoading] = useState(true);
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
        flvPlayer.play().then(() => setLoading(false));
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
  const loadingStyle = {
    height: style.height,
    width: style.width,
    backgroundImage: `url(${LoadingSpinner})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '70px 70px',
    transition: 'opacity .20s linear',
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    zIndex: 5,
  };
  return (
    <div className="player" ref={containerRef}>
      {loading && <div style={loadingStyle}></div>}
      <video id="videoElement" controls={controls} muted style={style} />
    </div>
  );
};

FlvPlayer.defaultProps = {
  controls: true,
};

FlvPlayer.propTypes = {
  deviceId: PropTypes.string.isRequired,
  onPlayerInit: PropTypes.func.isRequired,
  onPlayerDispose: PropTypes.func.isRequired,
  style: PropTypes.object,
  controls: PropTypes.bool,
};

export default FlvPlayer;
