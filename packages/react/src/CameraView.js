import React, {useRef, useEffect} from 'react';
// import videojs from 'video.js';
import PropTypes from 'prop-types';
// import 'video.js/dist/video-js.min.css';

import '../new_main.css';
import '../../../../skywatch_platform/submodules/library/video-js/video-js.min.css';
import '../../../../skywatch_platform/submodules/modules/css/v2/camera_view.css';
import '../../../../skywatch_platform/submodules/library/jquery/css/ui-lightness/jquery-ui-1.8.23.custom.css';
import '../../../../skywatch_platform/submodules/modules/js/shaka-player.compiled.js';
import '../../../../skywatch_platform/submodules/modules/js/flv.js';
import '../../../../skywatch_platform/submodules/modules/js/three.min.js';
// import '../../../../skywatch_platform/submodules/modules/js/OBJLoader.js';

// import '../../../../skywatch_platform/submodules/library/lodash/lodash.min.js';
// import '../../../../skywatch_platform/submodules/library/jquery/js/jquery-1.11.2.min.js';
import 'jquery';
// import '../../../../skywatch_platform/submodules/library/jquery/js/jquery-ui-1.11.2.custom.min.js';
// import '../../../../skywatch_platform/submodules/library/backbone/backbone-min.js';
// import '../../../../skywatch_platform/submodules/library/video-js/video.dev.js';
// import '../../../../skywatch_platform/submodules/library/jquery-cookie/jquery.cookie-1.4.1.min.js';
import '../lib/jquery-cookie/jquery.cookie-1.4.1.min';
// import '../../../../skywatch_platform/submodules/modules/js/dist/camera_view.bundle';
// import '../../../../skywatch_platform/submodules/modules/js/v2/camera_view';
import {camera_view} from './camera_view';
import {view} from './view';
import {device_view} from './device_view';
import './model';
const keyholder = false;
const hide_ff = true;
const CameraView = () => {
  useEffect(() => {
    view();
    device_view();
    camera_view();
  }, []);

  return (
    <>
      <div id="group-view-camera">
        <div id="camera-grid-container">
          <div
            className="live_view"
            id="47436"
            style={{width: 765, height: 420}}>
            <div>
              {/* <div class="live-overlay-container <%= (typeof sphere_available != 'undefined' && sphere_available == '1') ? 'sphere' : 'rectangle' %>"> */}
              <div className="live-overlay-container rectangle">
                <div className="seeking-overlay"></div>
                <div className="live-overlay">
                  <img className="icon top left icon-service-status" />
                  <div className="dropdown">
                    <a
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false">
                      <div
                        className="icon top right icon-settings-menu"
                        src="./images/v2/TopSettings.png"></div>
                    </a>
                    <ul className="dropdown-menu" role="menu">
                      {keyholder && (
                        <>
                          <li role="presentation">
                            <a
                              className="button-settings"
                              role="menuitem"
                              href="#">
                              {'$lang.camera_setting'}
                            </a>
                          </li>
                          <li role="presentation" className="divider"></li>{' '}
                        </>
                      )}

                      <li role="presentation">
                        <a className="button-download" role="menuitem" href="#">
                          {'$lang.download_video'}
                        </a>
                      </li>
                      <li role="presentation">
                        <a
                          className="button-download-snapshot"
                          role="menuitem"
                          href="#">
                          {'$lang.download_snapshot'}
                        </a>
                      </li>
                      <li role="presentation" className="divider"></li>
                      <li role="presentation">
                        <a
                          className="button-local-recording"
                          role="menuitem"
                          href="#">
                          {'$lang.local_recording'}
                        </a>
                      </li>
                      <li role="presentation">
                        <a
                          className="button-device-timeline"
                          role="menuitem"
                          href="#">
                          {'$lang.device_timeline'}
                        </a>
                      </li>
                      <li role="presentation">
                        <a
                          className="button-boxe-recording"
                          role="menuitem"
                          href="#">
                          {'$lang.boxe_recording'}
                        </a>
                      </li>
                      {keyholder && (
                        <>
                          <li role="presentation" className="divider"></li>
                          <li role="presentation">
                            <a
                              className="button-upgrade-firmware"
                              role="menuitem"
                              href="#">
                              {'$lang.upgrade_firmware'}
                            </a>
                          </li>
                          <li role="presentation">
                            <a
                              className="button-reboot"
                              role="menuitem"
                              href="#">
                              {'$lang.reboot'}
                            </a>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="icon bottom right button-single-view"></div>
                  <div className="overlay-toolbar">
                    <div className="icon button-ptz"> </div>
                  </div>
                  <div className="camera-name-container">
                    <div className="camera-name">{'camera name'}</div>
                  </div>
                  {keyholder && (
                    <div className="pt-container">
                      <div className="ptz-panel"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* template-player*/}
              {/* <video
              id="<%= id %>"
              className="video-js vjs-default-skin vjs-big-play-centered"
              preload="auto"
              width="100%"
              height="100%"
              data-setup='{ "techOrder":["flash"] }'>
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider
                upgrading to a web browser that{' '}
                <a
                  href="http://videojs.com/html5-video-support/"
                  target="_blank"
                  rel="noreferrer">
                  supports HTML5 video
                </a>
              </p>
            </video> */}

              {/* template-shaka-player */}
              <div id="container">
                {/* <div id="relay_flash_api" style={{display: 'none'}}></div>
              <div id="47436" style={{width: '100%', height: '100%'}}>
                <canvas
                  id="shaka-canvas"
                  width="1920"
                  height="1080"
                  style={{display: 'none'}}></canvas>
                <video
                  id="live-video"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'none',
                  }}></video>
                <video
                  id="archive-video"
                  style={{width: '100%', height: '100%', display: 'none'}}
                  crossOrigin="anonymous"></video>

                <div
                  id="control-bar"
                  className="control-bar"
                  dir="ltr"
                  role="group">
                  <button
                    id="play-button"
                    className="play-control playing"></button>
                  <span id="duration-text" className="duration-text">
                    {' '}
                    0:00 / 0:00{' '}
                  </span>
                  <input
                    onChange={() => {}}
                    id="duration-seek-bar"
                    className="duration-seek-bar"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value="0"></input>
                  <button
                    id="volume-button"
                    className="volume-control"></button>
                  <input
                    onChange={() => {}}
                    id="volume-seek-bar"
                    className="volume-seek-bar"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value="50"></input>
                </div> 
              </div> */}
                {/* template-loading */}
                <div className="loading"></div>
                {/* template-thumbnail */}
                <div className="thumbnail"></div>
                {/* template-empty */}
                <div className="empty">
                  <div className="empty-text">{'try_to_buy_CR'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="buffer_container" style={{height: '174px'}}></div>
        <div id="controlbar_container" style={{marginTop: 280, height: 200}}>
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
                  {/* {$hide_ff && <div class="hidden">}
                    <div class="control_button">
                        <div id="control-fastforward"></div>
                    </div>
                    {$hide_ff && </div>} */}
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
                    <div id="control-hour">{'h'}</div>
                  </div>
                  <div className="control_button">
                    <div id="control-day">{'d'}</div>
                  </div>
                  <div className="control_button">
                    <div id="control-week">{'w'}</div>
                  </div>
                  <div className="control_button">
                    <div id="control-month">{'m'}</div>
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

export default CameraView;
