import React, {useRef, useEffect} from 'react';
import videojs from 'video.js';
import PropTypes from 'prop-types';
import 'video.js/dist/video-js.min.css';
import {CoreManager, Requests} from '../util';

const {API_KEY} = CoreManager;

const defaultPlayerOptions = {
  autoplay: true,
  muted: true,
  aspectRatio: '16:9',
  mobileView: false,
};

const Player = ({
  playerOptions,
  onPlayerInit,
  onPlayerDispose,
  deviceId,
  scope,
  archiveId,
  smart_ff,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const initPlayer = async () => {
      const res = await Requests.getArchives(
        deviceId,
        scope,
        archiveId,
        smart_ff,
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

        onPlayerInit && onPlayerInit(player);

        // for debug purpose
        window.player = player;

        return () => {
          onPlayerDispose && onPlayerDispose(null);
          player.dispose();
        };
      }
    };

    initPlayer();
  }, [onPlayerInit, onPlayerDispose, playerOptions]);

  return (
    <div className="player" ref={containerRef}>
      <video className="video-js" controls />
    </div>
  );
};

Player.propTypes = {
  deviceId: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  archiveId: PropTypes.string.isRequired,
  smart_ff: PropTypes.string.isRequired,
  onPlayerInit: PropTypes.func.isRequired,
  onPlayerDispose: PropTypes.func.isRequired,
  playerOptions: PropTypes.object,
};

export default Player;
