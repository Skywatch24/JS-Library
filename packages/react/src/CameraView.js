import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

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
import {ArchivesPlayer, FlvPlayer} from '../src';
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

const scale_table = {
  get: function(scale, timestamp) {
    if (scale !== 'month') {
      return this.table[scale];
    } else {
      var date = new Date(timestamp * 1000);
      var month = date.getMonth() + 1;
      if (_.indexOf([1, 3, 5, 7, 8, 10, 12], month) !== -1) {
        return 31 * 24 * 60 * 60;
      } else if (_.indexOf([4, 6, 9, 11], month) !== -1) {
        return 30 * 24 * 60 * 60;
      } else {
        return 29 * 24 * 60 * 60;
      }
    }
  },
  table: {
    month: 30 * 24 * 60 * 60,
    week: 7 * 24 * 60 * 60,
    day: 24 * 60 * 60,
    hour: 60 * 60,
  },
};
const getTimeData = function(timestamp) {
  timestamp = parseInt(timestamp, 10);
  if (timestamp.toString().length == 10) timestamp = timestamp * 1000;
  var $time = new Date(parseInt(timestamp));
  var $time2 = new Date(parseInt(timestamp) + 24 * 60 * 60 * 1000);
  var $now = new Date();
  var date_display = '';
  if (
    $time.getFullYear() == $now.getFullYear() &&
    $time.getMonth() == $now.getMonth() &&
    $time.getDate() == $now.getDate()
  ) {
    // temp
    // date_display = Skywatch.lang.today;
    date_display = '今天';
  } else {
    // check for 'yesterday'
    if (
      $time2.getFullYear() == $now.getFullYear() &&
      $time2.getMonth() == $now.getMonth() &&
      $time2.getDate() == $now.getDate()
    ) {
      // temp
      // date_display = Skywatch.lang.yesterday;
      date_display = '昨天';
    } else {
      date_display = $time.getMonth() + 1 + '/';
      date_display +=
        $time.getDate() < 10 ? '0' + $time.getDate() : $time.getDate();
    }
  }

  var hour = $time.getHours() >= 10 ? $time.getHours() : '0' + $time.getHours();
  var minute =
    $time.getMinutes() >= 10 ? $time.getMinutes() : '0' + $time.getMinutes();
  var second =
    $time.getSeconds() >= 10 ? $time.getSeconds() : '0' + $time.getSeconds();
  var time_display = hour + ':' + minute + ':' + second;

  hour = $time.getHours();
  var post_fix = 'AM';
  if (hour >= 12) {
    post_fix = 'PM';
    if (hour > 12) {
      hour -= 12;
    }
  } else if (hour === 0) {
    hour = 12;
  }

  var hour_time_display = hour + ' ' + post_fix;

  return {
    date_display: date_display,
    time_display: time_display,
    hour_time_display: hour_time_display,
  };
};
const getScaleStartTime = function(timestamp, scale) {
  // use current as default
  if (typeof scale === 'undefined') scale = this.scale();

  var date = new Date(timestamp * 1000);
  date.setSeconds(0);
  if (scale === 'hour') {
    date.setMinutes(0);
  } else if (scale === 'day') {
    date.setMinutes(0);
    date.setHours(0);
  } else if (scale === 'week') {
    date.setMinutes(0);
    date.setHours(0);
    var day = date.getDay();
    date.setTime(date.getTime() - day * 24 * 60 * 60 * 1000);
  } else if (scale === 'month') {
    date.setMinutes(0);
    date.setHours(0);
    date.setDate(1);
  }

  return Math.floor(date.getTime() / 1000);
};
const setBubbleTime = (timestamp, type, set_cursor) => {
  var now = Math.floor(new Date().getTime() / 1000);
  var left_time = getScaleStartTime(now, 'hour');
  var right_time = left_time + scale_table.get('hour', left_time);
  var now = Math.ceil(new Date().getTime() / 1000);
  if (timestamp > now) {
    timestamp = now;
  }
  var new_left_time = left_time;
  var new_right_time = right_time;

  var offset =
    ((timestamp - new_left_time) / (new_right_time - new_left_time)) *
    $('#playbar-container').width();
  const $el = $('#timebar');
  const $bubble =
    type === 'normal' ? $('#cursor_bubble') : $('#cursor_bubble_preview');

  if (set_cursor) $el.find('#played').css('width', offset);
  var total_offset =
    ((now - new_left_time) / (new_right_time - new_left_time)) *
    $('#playbar-container').width();
  if (set_cursor) $el.find('#playbar').css('width', total_offset);

  // move seek cursor
  var $cursor = $el.find('#cursor');
  var left =
    $('#timebar_content').offset().left -
    $('#controlbar_container').offset().left +
    offset;
  if (set_cursor) $cursor.css('left', left);

  $bubble.removeClass('right');
  $bubble.removeClass('left');
  if (timestamp >= new_left_time && timestamp <= new_right_time) {
    $el.find('#cursor').show();

    var time_data = getTimeData(timestamp);
    $bubble
      .find('span')
      .first()
      .html(time_data.date_display);
    $bubble
      .find('span')
      .last()
      .html(time_data.time_display);
    $bubble.css('left', left - 28);
  } else {
    $el.find('#cursor').hide();
    var time_data = this.getTimeData(timestamp);

    if (timestamp < new_left_time) {
      $bubble
        .find('span')
        .first()
        .html(time_data.date_display);
      $bubble
        .find('span')
        .last()
        .html(time_data.time_display);
      $bubble.css(
        'left',
        $('#timebar_content').offset().left - $('#timebar').offset().left - 20,
      );
      $bubble.addClass('left');
    } else if (timestamp > new_right_time) {
      $bubble
        .find('span')
        .first()
        .html(time_data.date_display);
      $bubble
        .find('span')
        .last()
        .html(time_data.time_display);
      $bubble.css(
        'left',
        $('#timebar_content').width() +
          $('#timebar_content').offset().left -
          $('#timebar_container').offset().left -
          111,
      );
      $bubble.addClass('right');
    }
  }
};
let Skywatch = {archives: []};
const CameraView = ({deviceId}) => {
  const [player, setPlayer] = useState(null);
  const [showStreaming, setShowStreaming] = useState(true);
  const [timestamp, setTimestamp] = useState('');
  const [archiveId, setArchiveId] = useState('');

  const _fetchAllInterval = function(camera_id, scope, archives) {
    var deferred = $.Deferred();
    var now = Math.floor(new Date().getTime() / 1000);
    // get cachetime
    fetchCacheTime(now, camera_id).done(function(timestamp) {
      timestamp = timestamp.replace(/<script.*script>/, '');
      deferred.progress([]);
    });
    var current_time = new Date().getTime() / 1000;
    var current_timestamp = Math.round(current_time);
    _fetchNextInterval(
      camera_id,
      scope,
      archives,
      deferred,
      current_timestamp,
      false,
      false,
    );
    return deferred;
  };

  const fetchCacheTime = function(timestamp, deviceId) {
    return $.get(`api/v2/cameras/${deviceId}`, {
      timestamp: timestamp,
    }).done(function(timestamp) {
      timestamp = timestamp.replace(/<script.*script>/, '');
      if (timestamp) {
        const _cache_time = parseInt(timestamp, 10);
      } else {
        const _cache_time = 0;
      }
    });
  };

  const _fetchNextInterval = function(
    camera_id,
    scope,
    archives,
    deferred,
    end_timestamp = false,
    start_timestamp = false,
    next_url = false,
  ) {
    var self = this;
    var one_month_sec = 86400 * 30;
    var one_day_sec = 86400;

    var temp_archives_start_time = 0;
    var temp_archives_end_time = 0;
    if (end_timestamp) {
      temp_archives_end_time = parseInt(end_timestamp);
      if (!start_timestamp) {
        temp_archives_start_time = end_timestamp - one_month_sec;
      }
    }

    //parse next_url
    if (next_url) {
      var parse_start_time = new Array();
      var parse_end_time = new Array();

      var remove_ques = next_url.split('?');
      var remove_and = remove_ques[1].split('&');
      var size = remove_and.length;
      for (var i = 0; i < size; i++) {
        if (parse_start_time.length < 2)
          parse_start_time = remove_and[i].split('start_time=');
        if (parse_end_time.length < 2)
          parse_end_time = remove_and[i].split('end_time=');
      }
      temp_archives_start_time = parse_start_time[1];
      temp_archives_end_time = parse_end_time[1];
    }

    $.cookie('username', 'switch+');
    $.cookie('api_key', '9141240363b4687bd32d1fe9a03211dc');

    var xhr = $.get('api/v2/cameras/' + camera_id + '/archives', {
      // api_key: $.cookie('api_key'),
      scope: scope,
      start_time: temp_archives_start_time,
      end_time: temp_archives_end_time,
    })
      .done(function(data) {
        data = data.replace(/<script.*script>/, '');
        data = JSON.parse(data);

        if (data.stop === 'true') {
          if (scope == 'CloudArchives') {
            // TODO:
            self._fetched_cloud_archives_done = true;
            // remove pulling mark
            // if (self.collection) {
            //   self.collection.removePulling(self.get('id'));
            // }
            return deferred.resolve(self._cloud_archives.models);
          } else {
            self._fetched_local_archives_done = true;
            return deferred.resolve(self._local_archives.models);
          }
        } else {
          deferred.notify(data.archives);
          console.log(data);
          // archives.add(data.archives);
          Skywatch.archives = [...Skywatch.archives, ...data.archives];
          const _current_clould_archive_request_timer = setTimeout(function() {
            if (typeof data.next_url != 'undefined') {
              _fetchNextInterval(
                camera_id,
                scope,
                archives,
                deferred,
                false,
                false,
                data.next_url,
              );
            } else {
              _fetchNextInterval(camera_id, scope, archives, deferred);
            }
          }, 1000);
          return deferred;
        }
      })
      .fail(function() {
        console.warn('request failed');
        if (scope === 'CloudArchives') {
          self._current_clould_archive_request = null;
          self._current_clould_archive_request_timer = 0;
          // remove pulling mark
          // if (self.collection) {
          //   self.collection.removePulling(self.get('id'));
          // }
        }
      });

    if (scope === 'CloudArchives') {
      // this._current_clould_archive_request = xhr;
    }

    return xhr;
  };

  const handleTimebarContentClicked = e => {
    var time_position = e.pageX - $('#timebar_content').offset().left;
    // var left_time = Skywatch.Live.control_bar.leftTimestamp();
    // var right_time = Skywatch.Live.control_bar.rightTimestamp();
    var now = Math.floor(new Date().getTime() / 1000);
    var left_time = getScaleStartTime(now, 'hour');
    var right_time = left_time + scale_table.get('hour', left_time);
    var timebar_width = $('#timebar_content').width();
    var timestamp =
      (time_position / timebar_width) * (right_time - left_time) + left_time;
    setTimestamp(timestamp);
    // if (timestamp < now)
    //   document
    //     .getElementsByClassName('video-js')[0]
    //     .removeAttribute('controls');

    // see getCloudArchive in model.js
    const targetArchive = Skywatch.archives
      .map(archive => {
        let diff = archive.timestamp - timestamp;
        if (diff < 0 && Math.abs(diff) >= archive.length) {
          diff = Number.MAX_VALUE;
        }
        return {...archive, diff};
      })
      .sort((a, b) => a.diff - b.diff)[0];
    setArchiveId(targetArchive.id);
    setShowStreaming(timestamp >= now);
  };

  const refactor = () => {
    document.getElementById('timeline_container').classList.remove('loading');
    // setInterval(() => {
    //   setBubbleTime(Math.floor(new Date().getTime() / 1000));
    // }, 1000);
    setBubbleTime(Math.floor(new Date().getTime() / 1000), 'normal', true);
    const $timebar_content = $('#timebar_content');
    $timebar_content.on('mousemove', function(e) {
      var time_position = e.pageX - $('#timebar_content').offset().left;
      // var left_time = Skywatch.Live.control_bar.leftTimestamp();
      // var right_time = Skywatch.Live.control_bar.rightTimestamp();
      var now = Math.floor(new Date().getTime() / 1000);
      var left_time = getScaleStartTime(now, 'hour');
      var right_time = left_time + scale_table.get('hour', left_time);
      var timebar_width = $('#timebar_content').width();
      var timestamp =
        (time_position / timebar_width) * (right_time - left_time) + left_time;

      var $bubble = $('#cursor_bubble_preview');

      var date_data = getTimeData(timestamp);
      $bubble
        .find('span')
        .first()
        .html(date_data.date_display);
      $bubble
        .find('span')
        .last()
        .html(date_data.time_display);
      setBubbleTime(timestamp, 'preview', false);
      $bubble.addClass('active');
      $bubble.show();
      $('#cursor_bubble').hide();
    });

    $timebar_content.on('mouseout', function(e) {
      var $bubble = $('#cursor_bubble_preview');
      $bubble.removeClass('active');
      $bubble.hide();
      $('#cursor_bubble').show();
    });

    _fetchAllInterval(deviceId, 'CloudArchives', Skywatch.archives);
  };
  useEffect(() => {
    fetch(`api/v2/devices/${deviceId}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        // init(deviceId, data);
        refactor();
      });
  }, []);

  return (
    <>
      <div id="group-view-camera">
        <div id="camera-grid-container">
          {showStreaming ? (
            <FlvPlayer
              deviceId={deviceId}
              onPlayerInit={setPlayer}
              onPlayerDispose={setPlayer}
              style={{width: '768px', height: '432px'}}
              controls={false}
            />
          ) : (
            <ArchivesPlayer
              key={timestamp}
              onPlayerInit={setPlayer}
              onPlayerDispose={setPlayer}
              deviceId={deviceId}
              archiveId={archiveId}
              smart_ff={0}
              seek={timestamp - archiveId.split('-')[1]}
              style={{width: '768px', height: '432px'}}
              controls={false}
            />
          )}
        </div>
        <div id="buffer_container"></div>
        <div id="controlbar_container" style={{height: 140}}>
          <div id="controlbar">
            <div id="cursor_bubble">
              <span id="bubble_date"></span>
              <span id="bubble_time"></span>
            </div>
            <div id="cursor_bubble_preview">
              <span id="bubble_date"></span>
              <span id="bubble_time"></span>
            </div>
            <div id="timebar_container">
              <div id="timebar">
                <div className="left_button">
                  <div className="btn btn-default" id="to_previous"></div>
                </div>
                <div id="timebar_content" onClick={handleTimebarContentClicked}>
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
                  <div
                    className="control_button"
                    onClick={e => {
                      e.target.classList.add('active');
                      player && player.pause();
                    }}>
                    <div id="control-pause"></div>
                  </div>
                  <div
                    className="control_button active"
                    onClick={e => {
                      e.target.classList.add('active');
                      player && player.play();
                    }}>
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

                  <div
                    className={`switch_button button_long ${
                      showStreaming ? 'active' : ''
                    }`}>
                    <div
                      id="control-golive"
                      onClick={() => setShowStreaming(true)}></div>
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
