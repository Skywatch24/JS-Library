import React, {useRef, useEffect, useState} from 'react';
import videojs from 'video.js';
import PropTypes from 'prop-types';
import 'video.js/dist/video-js.min.css';
import {Requests} from '@skywatch/api';
import LoadingSpinner from '../../../../skywatch_platform/service_frontend/images/v2/loading.gif';

const defaultPlayerOptions = {
  autoplay: true,
  muted: true,
  aspectRatio: '16:9',
  mobileView: false,
};

const ArchivesPlayer = ({
  playerOptions,
  onPlayerInit,
  onPlayerDispose,
  deviceId,
  archiveId,
  smart_ff,
  seek,
  style,
  controls,
  onTimeUpdate,
  onEnded,
}) => {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const initPlayer = async () => {
      const res = await Requests.getArchives(
        deviceId,
        archiveId,
        smart_ff.toString(),
      );
      if (res.data && containerRef.current) {
        const videoEl = containerRef.current.querySelector('video');
        const player = videojs(videoEl, {
          ...defaultPlayerOptions,
          ...playerOptions,
          sources: [
            {
              src: res.data,
            },
          ],
        });

        player.currentTime(seek);

        onPlayerInit && onPlayerInit(player);

        // // for debug purpose
        // window.player = player;

        return () => {
          onPlayerDispose && onPlayerDispose(null);
          player.dispose();
        };
      }
    };

    initPlayer();
  }, [onPlayerInit, onPlayerDispose, playerOptions, archiveId, seek]);

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
    <div className="player" ref={containerRef} style={{}}>
      {loading && <div style={loadingStyle}></div>}
      <video
        className="video-js"
        controls={controls}
        style={style}
        id="archive-video"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onSeeked={() => setLoading(false)}
        onPlaying={() => {
          if (!seek) setLoading(false);
        }}
      />
    </div>
  );
};

ArchivesPlayer.defaultProps = {
  seek: 0,
  smart_ff: 0,
  controls: true,
  onTimeUpdate: () => {},
  onEnded: () => {},
};

ArchivesPlayer.propTypes = {
  deviceId: PropTypes.string.isRequired,
  archiveId: PropTypes.string.isRequired,
  smart_ff: PropTypes.number.isRequired,
  onPlayerInit: PropTypes.func.isRequired,
  onPlayerDispose: PropTypes.func.isRequired,
  seek: PropTypes.number,
  playerOptions: PropTypes.object,
  style: PropTypes.object,
  controls: PropTypes.bool,
  onTimeUpdate: PropTypes.func,
  onEnded: PropTypes.func,
};

export default ArchivesPlayer;
