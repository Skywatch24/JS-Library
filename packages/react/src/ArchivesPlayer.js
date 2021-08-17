import React, {useRef, useEffect, useState} from 'react';
import videojs from 'video.js';
import PropTypes from 'prop-types';
import 'video.js/dist/video-js.min.css';
import {Requests} from '@skywatch/api';

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

  return (
    <div className="player" ref={containerRef}>
      <video
        className="video-js"
        controls={controls}
        style={style}
        id="archive-video"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
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
