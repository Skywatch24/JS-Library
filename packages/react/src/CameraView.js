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
import {_} from 'core-js';

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
  // if (typeof scale === 'undefined') scale = this.scale();
  if (typeof scale === 'undefined') scale = 'hour';

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
    $('#cursor').hide();
    var time_data = getTimeData(timestamp);

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
let Skywatch = {archives: [], all_dataset: {}};
const CameraView = ({deviceId}) => {
  const now = Math.floor(new Date().getTime() / 1000);
  const [player, setPlayer] = useState(null);
  const [showStreaming, setShowStreaming] = useState(true);
  const [timestamp, setTimestamp] = useState(now);
  const [currentTime, setCurrentTime] = useState(now);
  const [archive, setArchive] = useState(null);
  const [leftTimestamp, setLeftTimestamp] = useState(
    getScaleStartTime(now, 'hour'),
  );
  const [rightTimestamp, setRightTimestamp] = useState(
    leftTimestamp + scale_table.get('hour', leftTimestamp),
  );

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
        Skywatch._cache_time = parseInt(timestamp, 10);
      } else {
        Skywatch._cache_time = 0;
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
            // self._fetched_cloud_archives_done = true;
            // remove pulling mark
            // if (self.collection) {
            //   self.collection.removePulling(self.get('id'));
            // }
            // return deferred.resolve(self._cloud_archives.models);
            return deferred.resolve();
          } else {
            self._fetched_local_archives_done = true;
            // return deferred.resolve(self._local_archives.models);
            return deferred.resolve();
          }
        } else {
          deferred.notify(data.archives);
          // archives.add(data.archives);
          data.archives.forEach(a => parseMeta(a));
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
    var left_time = leftTimestamp;
    var right_time = rightTimestamp;
    var timebar_width = $('#timebar_content').width();
    var timestamp =
      (time_position / timebar_width) * (right_time - left_time) + left_time;
    var now = Math.ceil(new Date().getTime() / 1000);
    if (timestamp > now) {
      timestamp = now;
    }
    setTimestamp(timestamp);
    setCurrentTime(timestamp);

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

    setBubbleTime(timestamp, 'nomal', true);
    setArchive(targetArchive);
    Skywatch.highlight_start = parseInt(targetArchive.timestamp);
    Skywatch.highlight_end =
      parseInt(targetArchive.timestamp) + parseInt(targetArchive.length);
    onHighLightTimeChange(Skywatch.highlight_start, Skywatch.highlight_end);
    setShowStreaming(timestamp >= now);
  };
  const onPreviousClick = function() {
    // var scale = this.scale();
    var scale = 'hour';
    var start_time = getScaleStartTime(leftTimestamp - 100);
    var right_time = start_time + scale_table.get(scale, start_time);

    updateTimebar(leftTimestamp, rightTimestamp, start_time, right_time);
    setLeftTimestamp(start_time);
    setRightTimestamp(right_time);
  };
  const onNextClick = function() {
    // TODO
    // var scale = this.scale();
    var scale = 'hour';
    var start_time = getScaleStartTime(rightTimestamp + 100);
    var right_time = start_time + scale_table.get(scale, start_time);

    updateTimebar(leftTimestamp, rightTimestamp, start_time, right_time);
    setLeftTimestamp(start_time);
    setRightTimestamp(right_time);
  };
  const updateTimebar = (
    old_left_time,
    old_right_time,
    new_left_time,
    new_right_time,
  ) => {
    var self = this;

    var current_time = timestamp;

    // update display
    _.each(
      {
        '#date_left': new_left_time,
        '#date_right': new_right_time,
      },
      function(timestamp, selector) {
        var date_data = getTimeData(timestamp);
        $(
          $(selector)
            .find('span')
            .get(0),
        ).html(date_data.date_display);
        $(
          $(selector)
            .find('span')
            .get(1),
        ).html(date_data.hour_time_display);
      },
    );

    // calculate animation
    // var old_left_time = prevLeftTimestamp;
    // var old_right_time = prevRightTimestamp;

    var animate_time = 500;

    var timeline_animation = false;
    var timeline_child_animation = false;
    var cursor_animation = false;
    var played_animation = false;
    var timebar_width = $('#timebar_content').width();
    var shift;
    var distance;

    var bubble_animation = false;
    var bubble_dalay = false;
    var bubble_animate_time = animate_time;

    // calculate element delay
    var element_delay = false;
    var element_animation_time = animate_time;
    if (old_left_time !== 0 && old_right_time !== 0) {
      if (
        (old_left_time < new_left_time && old_right_time < new_right_time) ||
        (old_left_time > new_left_time && old_right_time > new_right_time)
      ) {
        if (
          !(current_time >= old_left_time && current_time <= old_right_time) &&
          current_time >= new_left_time &&
          current_time <= new_right_time
        ) {
          if (old_left_time < new_left_time) {
            element_delay =
              (animate_time * (current_time - new_left_time)) /
              (new_right_time - new_left_time);
            element_animation_time =
              (animate_time * (new_right_time - current_time)) /
              (new_right_time - new_left_time);
          } else {
            element_delay =
              (animate_time * (new_right_time - current_time)) /
              (new_right_time - new_left_time);
            element_animation_time =
              (animate_time * (current_time - new_left_time)) /
              (new_right_time - new_left_time);
          }
        }
      }
    }

    // ignore initial
    if (old_left_time !== 0 && old_right_time !== 0) {
      if (
        (old_left_time < new_left_time && old_right_time < new_right_time) ||
        (old_left_time > new_left_time && old_right_time > new_right_time)
      ) {
        // shifts
        if (old_left_time < new_left_time) {
          shift = '-=';
        } else {
          shift = '+=';
        }

        timeline_animation = {
          left: shift + '100%',
        };

        // animate out
        if (current_time >= old_left_time && current_time <= old_right_time) {
          // calculate distance
          if (shift == '-=') {
            distance =
              ((current_time - old_left_time) /
                (old_right_time - old_left_time)) *
              $('#timebar_content').width();
            bubble_animate_time =
              (bubble_animate_time * (current_time - old_left_time)) /
              (old_right_time - old_left_time);
          } else {
            distance =
              ((old_right_time - current_time) /
                (old_right_time - old_left_time)) *
              $('#timebar_content').width();
            bubble_animate_time =
              (bubble_animate_time * (old_right_time - current_time)) /
              (old_right_time - old_left_time);
          }
          bubble_animation = {
            left: shift + distance,
          };
        } else if (
          current_time >= new_left_time &&
          current_time <= new_right_time
        ) {
          // animate in
          if (shift == '-=') {
            distance =
              ((new_right_time - current_time) /
                (new_right_time - new_left_time)) *
                $('#timebar_content').width() +
              28;
            bubble_animate_time =
              (animate_time * (new_right_time - current_time)) /
              (new_right_time - new_left_time);
          } else {
            distance =
              ((current_time - new_left_time) /
                (new_right_time - new_left_time)) *
              $('#timebar_content').width();
            bubble_animate_time =
              (animate_time * (current_time - new_left_time)) /
              (new_right_time - new_left_time);
          }
          bubble_animation = {
            left: shift + distance,
          };
        }
      } else if (
        old_right_time - old_left_time !==
        new_right_time - new_left_time
      ) {
        // enlarge or reduce
        timeline_animation = {};
        var times =
          (old_right_time - old_left_time) / (new_right_time - new_left_time);
        timeline_animation.width = times * 300 + '%';
        timeline_animation.left =
          times * -100 +
          ((old_left_time - new_left_time) / (new_right_time - new_left_time)) *
            100 +
          '%';
        timeline_child_animation = {
          opacity: 0.4,
        };
      }
    }

    var show_cursor = false;
    if (current_time >= new_left_time && current_time <= new_right_time) {
      var offset =
        ((current_time - new_left_time) / (new_right_time - new_left_time)) *
        $('#playbar-container').width();
      played_animation = {
        width: offset,
      };
      cursor_animation = {
        left:
          $('#timebar_content').offset().left -
          $('#controlbar_container').offset().left +
          offset,
      };
      show_cursor = true;
    } else {
      if (current_time < new_left_time) {
        played_animation = {
          width: '-=100%',
        };
      } else {
        played_animation = {
          width: '+=100%',
        };
      }

      $('#cursor').hide();
    }

    var animations = [];
    var animation_queue = [];

    if (timeline_animation !== false) {
      animations.push(
        $('#timeline_container').animate(timeline_animation, animate_time),
      );
    }
    if (bubble_animation !== false) {
      if (element_delay !== false) {
        animations.push(
          $('#cursor_bubble')
            .delay(element_delay)
            .animate(bubble_animation, element_animation_time, function() {
              setBubbleTime(currentTime, 'normal', true);
            }),
        );
      } else {
        animations.push(
          $('#cursor_bubble').animate(
            bubble_animation,
            element_animation_time,
            function() {
              setBubbleTime(currentTime, 'normal', true);
            },
          ),
        );
      }
    }
    if (timeline_child_animation !== false) {
      animations.push(
        $('#timeline_container')
          .children()
          .animate(timeline_child_animation, animate_time),
      );
    }
    if (cursor_animation !== false) {
      if (element_delay !== false) {
        animations.push(
          $('#cursor')
            .delay(element_delay)
            .animate(cursor_animation, element_animation_time),
        );
      } else {
        animations.push(
          $('#cursor').animate(cursor_animation, element_animation_time),
        );
      }
    }
    if (played_animation !== false) {
      if (element_delay !== false) {
        animations.push(
          $('#played')
            .delay(element_delay)
            .animate(played_animation, element_animation_time),
        );
      } else {
        animations.push(
          $('#played').animate(played_animation, element_animation_time),
        );
      }
    }
    if (show_cursor) $('#cursor').fadeIn(80);

    // this._animating = true;
    // $.when.apply($, animations).done(function() {
    //   self._animating = false;
    //   if (Skywatch.Live.camera_grid.isSingle()) {
    //     // handle change camera case
    //     var camera_id = Skywatch.Live.camera_list.getActiveCameraId();
    //     if (camera_id !== null) {
    //       self.renderCameraTimebar(
    //         camera_id,
    //         timeline_child_animation !== false,
    //       );
    //     }
    //   } else {
    //     // handle change group case
    //     var group_id = Skywatch.Live.camera_list.getActiveGroupId();
    //     if (group_id !== null) {
    //       self.renderGroupTimebar(group_id, timeline_child_animation !== false);
    //     }
    //   }
    // });
  };

  const handleMouseMove = e => {
    var time_position = e.pageX - $('#timebar_content').offset().left;
    var left_time = leftTimestamp;
    var right_time = rightTimestamp;
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
  };
  const handleMouseOut = e => {
    var $bubble = $('#cursor_bubble_preview');
    $bubble.removeClass('active');
    $bubble.hide();
    $('#cursor_bubble').show();
  };
  const getCacheTime = () => Skywatch._cache_time;
  const getMetaList = function(time_i_width, left_time, right_time) {
    var i = false;
    // var scale_arr = this._cloud_archives.scale_arr;
    // var all_dataset = this._cloud_archives.all_dataset;
    var scale_arr = [20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240];
    var all_dataset = Skywatch.all_dataset;
    var is_nvr_camera = false;
    // TODO
    // if (this.get('model_id') == '61') {
    //   is_nvr_camera = true;
    //   scale_arr = this._local_archives.scale_arr;
    //   all_dataset = this._local_archives.all_dataset;
    // }
    var scale = scale_arr[scale_arr.length - 1]; // deafult use the largest
    for (i = 0; i < scale_arr.length; i++) {
      if (time_i_width < scale_arr[i]) {
        scale = scale_arr[i];
        break;
      }
    }

    if (typeof all_dataset['' + scale] == 'undefined') {
      return [];
    }

    var meta_list = [];
    var timebar_width = right_time - left_time;
    var data, index;
    var now = Math.floor(new Date().getTime() / 1000);
    for (i = 0; i * time_i_width < timebar_width; i++) {
      if (left_time + i * time_i_width >= now) break;
      index = '' + Math.floor((left_time + i * time_i_width) / scale) * scale;

      data = {
        start: left_time + i * time_i_width,
        end: left_time + (i + 1) * time_i_width,
      };
      if (typeof all_dataset['' + scale][index] == 'undefined') {
        data.meta = false;
        // check whether is cache time
        // NVR camera use local archives, can not fetchCacheTime
        // TODO
        if (is_nvr_camera) {
          data.meta = 1;
        } else {
          if (getCacheTime() !== 0 && data.start >= getCacheTime()) {
            data.meta = 1;
          }
        }
      } else {
        data.meta = all_dataset['' + scale][index];
      }
      meta_list.push(data);
    }
    return meta_list;
  };
  const getTimelineBlockMetric = function(
    start,
    end,
    left_time,
    right_time,
    timebar_width,
  ) {
    var left = ((start - left_time) / (right_time - left_time)) * 100;
    var width = ((end - start) / (right_time - left_time)) * 100;
    return {
      left: left,
      width: width,
    };
  };
  const getMetaTimebar = function(scale, start_time, targetArchive) {
    var start_time_index = '' + start_time;
    // var scale_table = Skywatch.Live.control_bar.scale_table;
    // scale = Skywatch.Live.control_bar.scale();
    scale = 'hour';
    var self = this;

    var highlight_start = Skywatch.highlight_start || 0;
    var highlight_end = Skywatch.highlight_end || 0;
    // console.log(targetArchive);
    // if (targetArchive) {
    //   highlight_start = parseInt(targetArchive.timestamp);
    //   highlight_end =
    //     parseInt(targetArchive.timestamp) + parseInt(targetArchive.length);
    // }
    // TODO
    // if (!Skywatch.Live.camera_grid.isSingle()) {
    //   highlight_start = 0;
    //   highlight_end = 0;
    // }

    // render 3 views for animation to use
    var timebar_width_i = $('#timebar_content').width();
    var timebar_width = timebar_width_i * 3;
    var time_width_i = scale_table.get(scale, start_time);
    var time_width = time_width_i * 3;
    var left_time = start_time - time_width_i;
    var right_time = start_time + time_width_i * 2;

    var meta_width = 5;
    var meta_count = Math.floor(timebar_width / meta_width);
    var meta_time_width = time_width / meta_width;

    var seconds_in_bar = time_width / meta_count;

    // use each although there should be only one camera_view
    var meta_list = [];
    var timeline_block_html = '';
    // _.each(this._camera_views, function(camera_view, index) {
    _.each([deviceId], function(camera_view, index) {
      // if (!camera_view || !camera_view.model) {
      //   return;
      // }
      meta_list = getMetaList(seconds_in_bar, left_time, right_time);
      var i, interval, metric;

      if (meta_list.length > 0) {
        timeline_block_html += '<div class="camera-' + deviceId + '">';
        for (i = 0; i < meta_list.length; i++) {
          interval = meta_list[i];
          metric = getTimelineBlockMetric(
            interval.start,
            interval.end,
            left_time,
            right_time,
            timebar_width,
          );
          timeline_block_html += '<div class="meta_timeline_i ';
          if (
            interval.start >= highlight_start &&
            interval.end <= highlight_end
          ) {
            timeline_block_html += 'highlight';
          }
          timeline_block_html +=
            '" start="' + interval.start + '" end="' + interval.end + '"';
          timeline_block_html += 'style="width:4px; bottom:0;height:';
          timeline_block_html +=
            interval.meta === false
              ? '0px;'
              : (interval.meta * 40) / 100 + 5 + 'px;';
          timeline_block_html += 'left:' + metric.left + '%;"></div>';
        }
        timeline_block_html += '</div>';
      }
    });

    return {
      html: timeline_block_html,
      timebar_width: timebar_width,
    };
  };
  const parseMeta = function(archive) {
    var scale_arr = [20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240];
    var scale,
      i,
      j,
      second,
      base_scale = false,
      meta_data,
      tmp_meta,
      timestamp,
      length,
      meta,
      index;
    // fake meta data for non-smart-ff file
    var default_meta = {
      '0': [false, 1],
      '20': [false, 1],
      '40': [false, 1],
      '60': [false, 1],
      '80': [false, 1],
      '100': [false, 1],
      '120': [false, 1],
      '140': [false, 1],
      '160': [false, 1],
      '180': [false, 1],
      '200': [false, 1],
      '220': [false, 1],
      '240': [false, 1],
      '260': [false, 1],
      '280': [false, 1],
      '300': [false, 1],
      '320': [false, 1],
      '340': [false, 1],
      '360': [false, 1],
      '380': [false, 1],
      '400': [false, 1],
      '420': [false, 1],
      '440': [false, 1],
      '460': [false, 1],
      '480': [false, 1],
      '500': [false, 1],
      '520': [false, 1],
      '540': [false, 1],
      '560': [false, 1],
      '580': [false, 1],
      '600': [false, 1],
    };

    timestamp = parseInt(archive.timestamp);
    if (
      typeof archive.length == 'undefined'
      // &&
      // this._camera.get('model_id') == '61'
    ) {
      length = 60;
    } else {
      length = parseInt(archive.length);
    }

    tmp_meta = false;
    meta_data = false;
    if (length <= 20) return;

    if (!archive.smart_ff || archive.smart_ff == '0') {
      // use zero as meta
      meta = default_meta;
    } else {
      try {
        meta = JSON.parse(archive.meta);
      } catch (e) {
        console.error('Parse json meta data error');
        console.error(archive.meta);
        return;
      }

      /**
       *  Shift min to 1 to seperate no data case
       */
      var i;
      for (i in meta) {
        meta[i][1]++;
      }
    }

    for (j = 0; j < scale_arr.length; j++) {
      scale = scale_arr[j];
      if (typeof Skywatch.all_dataset['' + scale] == 'undefined') {
        Skywatch.all_dataset['' + scale] = {};
      }
      if (meta_data === false) {
        meta_data = {};
        /**
         *   Drop meta that exceed length
         */
        var k = 0;
        for (k = 0; k < length; k += 20) {
          index = '' + Math.floor((k + timestamp) / scale) * scale;
          if (meta['' + k]) {
            meta_data[index] = meta['' + k][1];
          } else {
            meta_data[index] = 0; //default_meta[""+k][1];
          }
        }
      }
      tmp_meta = {};
      for (second in meta_data) {
        index = '' + Math.floor(parseInt(second) / scale) * scale;
        if (typeof Skywatch.all_dataset[scale][index] == 'undefined') {
          Skywatch.all_dataset[scale][index] = meta_data[second];
          tmp_meta[index] = meta_data[second];
        } else {
          if (Skywatch.all_dataset[scale][index] < meta_data[second]) {
            Skywatch.all_dataset[scale][index] = meta_data[second];
            tmp_meta[index] = meta_data[second];
          }
        }
      }
      meta_data = tmp_meta;
    }
  };

  const onHighLightTimeChange = function(highlight_start, highlight_end) {
    highlight_start = highlight_start || 0;
    highlight_end = highlight_end || 0;
    var camera_id = deviceId;
    if (!camera_id) {
      return;
    }
    $('#meta_container')
      .find('.camera-' + camera_id + ' .meta_timeline_i')
      .each(function() {
        var $el = $(this);
        if (
          parseInt($el.attr('start')) >= highlight_start &&
          parseInt($el.attr('end')) <= highlight_end
        ) {
          $el.addClass('highlight');
        } else {
          $el.removeClass('highlight');
        }
      });
  };

  const refactor = () => {
    // setInterval(() => {
    //   setBubbleTime(currentTime + 1000, 'normal', true);
    // }, 1000);
    setBubbleTime(Math.floor(new Date().getTime() / 1000), 'normal', true);
    _fetchAllInterval(deviceId, 'CloudArchives', Skywatch.archives).progress(
      () => {
        const view_info = getMetaTimebar('hour', leftTimestamp, archive);
        $('#meta_container').html(view_info.html);
        document
          .getElementById('timeline_container')
          .classList.remove('loading');
      },
    );
  };
  useEffect(() => {
    fetch(`api/v2/devices/${deviceId}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        Skywatch.archives ? refactor() : init(deviceId, data);
      });
  }, []);

  return (
    <>
      <div id="group-view-camera">
        <div id="camera-grid-container">
          {Skywatch.archives &&
            (showStreaming ? (
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
                archiveId={archive.id}
                smart_ff={0}
                seek={timestamp - archive.timestamp}
                style={{width: '768px', height: '432px'}}
                controls={false}
              />
            ))}
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
                <div className="left_button" onClick={onPreviousClick}>
                  <div className="btn btn-default" id="to_previous"></div>
                </div>
                <div
                  id="timebar_content"
                  onClick={handleTimebarContentClicked}
                  onMouseMove={handleMouseMove}
                  onMouseOut={handleMouseOut}>
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
                <div className="right_button" onClick={onNextClick}>
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
                      // TODO: set bubble time
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
