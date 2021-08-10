import React, {useRef, useEffect, useState} from 'react';
import PropTypes, {string} from 'prop-types';

import '../new_main.css';
import '../../../../skywatch_platform/submodules/library/video-js/video-js.min.css';
import '../../../../skywatch_platform/submodules/modules/css/v2/camera_view.css';
import '../../../../skywatch_platform/submodules/library/jquery/css/ui-lightness/jquery-ui-1.8.23.custom.css';
import '../../../../skywatch_platform/submodules/modules/js/shaka-player.compiled.js';
import '../../../../skywatch_platform/submodules/modules/js/flv.js';
import '../../../../skywatch_platform/submodules/modules/js/three.min.js';
import '../../../../skywatch_platform/submodules/library/jquery/js/jquery-1.11.2.min.js';

import '../lib/jquery-cookie/jquery.cookie-1.4.1.min';
import '../../../../skywatch_platform/submodules/library/bootstrap-3.0.0/css/bootstrap.min.css';
import '../lib/bootstrap.custom.min.js';

import {camera_view} from './camera_view';
import {view} from './view';
import {device_view} from './device_view';
import './model';
const API_KEY = '9141240363b4687bd32d1fe9a03211dc';
const keyholder = true;
const hide_ff = false;

const init = (deviceId, {name, device_type, model_id, type}) => {
  view();
  device_view();
  camera_view(API_KEY, deviceId);
  Skywatch.Live.cameras.add({
    id: deviceId,
    name,
    device_type,
    model: model_id,
    type,
  });
  Skywatch.Live.camera_grid.setCamera(deviceId);
};

const CameraView = ({deviceId}) => {
  useEffect(() => {
    fetch(`api/v2/devices/${deviceId}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        init(deviceId, data);
      });
  }, []);

  return (
    <>
      <div id="group-view-camera">
        <div id="camera-grid-container"></div>
        <div id="buffer_container" style={{height: 440}}></div>
        <div id="controlbar_container" style={{height: 140}}>
          <div id="controlbar">
            <div id="cursor_bubble">
              <span id="bubble_date"></span> <span id="bubble_time"></span>
            </div>
            <div id="cursor_bubble_preview">
              <span id="bubble_date"></span> <span id="bubble_time"></span>
            </div>
            <div id="timebar_container">
              <div id="timebar">
                <div className="left_button">
                  <div className="btn btn-default" id="to_previous"></div>
                </div>
                <div id="timebar_content">
                  <div id="timeline_container" className="loading">
                    <div id="scale_container">
                      <div id="shades">
                        <div className="shade shade-light"></div>
                      </div>
                      <div id="grids"></div>
                    </div>
                    <div id="meta_container"></div>
                  </div>
                  <div id="playbar-container">
                    <div id="playbar"></div>
                    <div id="played"></div>
                  </div>
                </div>
                <div id="cursor">
                  <div id="cursor_clickable"></div>
                </div>
                <div className="right_button">
                  <div className="btn btn-default" id="to_next"></div>
                </div>
              </div>
            </div>
            <div id="label_container">
              <div id="label_content"></div>
            </div>
            <div id="controlbar_content">
              <div id="date_left">
                <div>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="button_group_container">
                <div className="button_group playback-control-group">
                  <div className="control_button">
                    <div id="control-pause"></div>
                  </div>
                  <div className="control_button">
                    <div id="control-play"></div>
                  </div>
                  {!hide_ff && (
                    <div className="control_button">
                      <div id="control-fastforward"></div>
                    </div>
                  )}
                </div>
                <div className="button_group">
                  <div className="switch_button">
                    <div id="control-volume"></div>
                  </div>

                  <div className="switch_button button_long">
                    <div id="control-golive"></div>
                  </div>
                </div>
                <div className="button_group pull-right">
                  <div className="control_button active">
                    <div id="control-hour">{'時'}</div>
                  </div>
                  <div className="control_button">
                    <div id="control-day">{'日'}</div>
                  </div>
                  <div className="control_button">
                    <div id="control-week">{'週'}</div>
                  </div>
                  <div className="control_button">
                    <div id="control-month">{'月'}</div>
                  </div>
                </div>
              </div>
              <div id="date_right">
                <div>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
CameraView.propTypes = {
  deviceId: PropTypes.string.isRequired,
};
export default CameraView;
