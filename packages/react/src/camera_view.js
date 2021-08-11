// import $ from '../../../library/jquery/js/jquery-1.11.2.min.js';
import $ from 'jquery';
import videojs from 'video.js';
// const videojs = require('../lib/video-js/video.dev');
const flvjs = require('../../../../skywatch_platform/submodules/modules/js/flv.js');
import '../../../../skywatch_platform/submodules/library/lodash/lodash.min.js';
const shaka = require('../../../../skywatch_platform/submodules/modules/js/shaka-player.compiled.js');
import 'backbone';
window.Skywatch = window.Skywatch || {};
window.parent.$ = $;

export const camera_view = function(API_KEY, cameraId) {
  'use strict';

  $.ajaxSetup({
    cache: false,
  });
  // temp
  // videojs.options.flash.swf = './library/video-js/video-js.swf';
  // var API_KEY = $.cookie('api_key');
  var Video = (Skywatch.Video = {});
  // event object, proxy jquery and videojs events
  Video.events = {};
  _.extend(Video.events, Backbone.Events);

  var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  var isChrome = !!window.chrome && !isOpera;
  var isSafari =
    !isOpera &&
    !isChrome &&
    navigator.userAgent.toLowerCase().indexOf('safari') != -1;
  var isFirefox = typeof InstallTrigger !== 'undefined';
  var isIE = /*@cc_on!@*/ false || !!document.documentMode;

  Skywatch.CameraInfo = false; // please don't directly usethis variable

  function fetchCameraInfo(camera_id) {
    var deferred = $.Deferred();
    if (Skywatch.CameraInfo === false) {
      // get camera_protocol here
      $.get('api/v2/devices/' + camera_id + '/info', {api_key: API_KEY})
        .done(function(d) {
          // temp
          d = JSON.parse(d);
          Skywatch.CameraInfo = d;
          deferred.resolve(d);
          // if (model_id == 57 || model_id == 59) {
          //     $.get('api/v2/cameras/' + camera_id + '/ismute').done(function(d) {
          //         Skywatch.CameraInfo['is_mute'] = d;
          //         deferred.resolve(d);
          //     }).fail(function() {
          //         deferred.reject();
          //     });
          // }
        })
        .fail(function() {
          deferred.reject();
        });
    } else {
      deferred.resolve(Skywatch.CameraInfo);
    }
    return deferred.promise();
  }

  function ShakaController() {
    console.log(
      'isSafari: ' +
        isSafari +
        ' isChrome: ' +
        isChrome +
        ' isIE: ' +
        isIE +
        ' isOpera: ' +
        isOpera,
    );

    this.camera_id = 0;
    this.is_mute = false;

    this.need_webgl = isSafari || isIE ? false : true;

    this._last_update = true;
    this._playing_checker = 0;

    this._is_flv = false;

    this._player = null; // _player is Shaka.Player

    this._video = null;
    this._live_video = null; // _video is a html5 player
    this._archive_video = null;
    this._context = null;
    this._canvas = null;

    this._renderloop = 0;

    this.canvas_width = 0;
    this.canvas_height = 0;

    this.FPS = 24;

    this._template = _.template($('#template-shaka-player').html());
    this._deferred = $.Deferred().reject();

    this._show_fisheye_mode = false;
    this._retry_counter = 0;

    // WebGL
    this._scene = null;
    this._camera = null;
    this._loader = null;
    this._object = null;
    this._texture = null;
    this._renderer = null;

    // TouchController
    this.SCALE_FACTOR = 0.0028;
    this._mouse_mode = 0;

    this._click_x = 0;
    this._click_y = 0;
    // var maxX, maxY, minX, minY;
    this._mScale = 1;
    this._mX = 0;
    this._mY = 0;
    this._prevX = 0;
    this._prevY = 0;

    this._show_controls = false;
    this._control_bar = null;
    this._control_bar_callback = null;

    // temp
    // this._template_loading = _.template($('#template-loading').html());
    // this._template_empty = _.template($('#template-empty').html());
    // this._template_thumbnail = _.template($('#template-thumbnail').html());
    this._template_loading = () => `<div class="loading"></div>`;
    this._template_empty = () => `<div class="empty">
    <div class="empty-text">try_to_buy_CR</div>
    </div>`;
    this._template_thumbnail = () => `<div class="thumbnail"></div>`;

    this._is_group = window.parent.$('.live_view').length != 1;
    console.log('is group: ' + this._is_group);
  }

  ShakaController.prototype.live = function(camera_id) {
    if (this._deferred.state() === 'pending') {
      console.warn('there is a pending deferred');
      // return this._deferred.promise();
    }
    this._deferred = $.Deferred();
    this.camera_id = camera_id;
    this._live(camera_id);
    return this._deferred.promise();
  };

  ShakaController.prototype.source = function(url, camera_id) {
    console.log('ShakaController::source');
    console.log('camera_id = ' + camera_id);

    var deferred = $.Deferred();
    var self = this;

    self.camera_id = camera_id;

    if (url.startsWith('./api')) {
      // (TODO)
      url = url.replace('download', 'link');
      $.get(url, {api_key: API_KEY}).done(function(d) {
        console.log('get result from archive/link');
        console.log(d);
        if (self._deferred.state() === 'pending') {
          console.warn('previous playing is incomplete, do a cleanup');
          // just abandon previous event sequence, and assume nothing is done
          self._deferred = $.Deferred().reject();
        }

        self._deferred
          .done(function() {
            // main video ready
            self._stopLiveChecker();
            self._source(camera_id, d, deferred);
          })
          .fail(function() {
            // no video, create one
            self._deletePlayers();
            self._deleteLoading();
            self._deleteEmpty();
            self._createLoading(camera_id);
            self._source(camera_id, d, deferred);
            // other actions depend on this
            self._deferred = deferred;
          });
      });
    } else {
      self._stopLiveChecker();
      self._source(camera_id, url, deferred);
    }

    return deferred.promise();
  };

  ShakaController.prototype.empty = function(camera_id) {
    console.log('ShakaController::empty');
    var self = this;

    this._deferred
      .done(function() {
        // main video ready
        self._live_video.pause();
        //self._video.pause();
        self.pause;
        if (self._archive_video) {
          //check has archive
          self._archive_video.pause();
        }
      })
      .always(function() {
        self._deleteEmpty();
        self._deleteLoading();
        self._deletePlayers();
        self._createEmpty(camera_id);
        self._deferred = $.Deferred().reject();
      });
  };

  ShakaController.prototype.cache = function(camera_id, timestamp) {
    console.log('ShakaController::cache');
    var deferred = $.Deferred();
    var self = this;

    $.get('api/v2/cameras/' + camera_id + '/cachefile', {
      // api_key: API_KEY,
      timestamp: timestamp,
    })
      .done(function(url) {
        url = url.replace(/<script.*script>/, '');
        console.info(url);
        if (!url) {
          // no CR no file
          deferred.reject();
          return;
        }

        self
          .source(url, camera_id)
          .done(function() {
            deferred.resolve();
          })
          .fail(function() {
            deferred.reject();
          });
      })
      .fail(function(url) {
        // TODO: handle error
        deferred.reject();
      });

    return deferred.promise();
  };

  ShakaController.prototype.play = function(isMute) {
    console.log('ShakaController::play');
    var self = this;
    this.is_mute = isMute;
    if (this._video) {
      console.log(this._video);
      // remove pause hack
      clearInterval(this._pause_hack_timer);
      this._pause_hack_timer = 0;
      var waitTime = 1500;
      setTimeout(function() {
        // Resume play if the element if is paused.
        if (self._video.paused) {
          console.log('self._video.play in play');
          self._video.play();
          self._renderVideo('play');
        }
      }, waitTime);
      console.info('internal play');
    }
  };

  ShakaController.prototype.pause = function() {
    console.log('ShakaController::pause');
    var self = this;
    clearInterval(this._pause_hack_timer);
    this._pause_hack_timer = setInterval(function() {
      if (self._video) {
        self._video.pause();
        if (self._video.paused) {
          clearInterval(self._pause_hack_timer);
          self._pause_hack_timer = 0;
        }
      }
    }, 500);
  };

  ShakaController.prototype.seek = function(timestamp) {
    console.log('ShakaController::seek ' + timestamp);
    var self = this;
    self._archive_video.currentTime = timestamp;
    this._deferred.done(function() {
      self._archive_video.currentTime = timestamp;
    });
  };

  ShakaController.prototype.fullscreen = function() {
    console.log('ShakaController::fullscreen');
    var self = this;
    this._deferred.done(function() {
      self._video.requestFullScreen();
    });
  };

  ShakaController.prototype.mute = function(state) {
    console.log('ShakaController::mute ' + state);
    var self = this;
    if (_.isUndefined(state)) {
      state = !self.is_mute;
    }
    console.log(self.is_mute);
    console.log(self._video);
    self.is_mute = state;
    // this._deferred.done(function () {
    self._video.muted = self.is_mute;
    // });
  };

  ShakaController.prototype._live = function(camera_id) {
    console.log('ShakaController::_live ' + camera_id);
    var self = this;

    this._deletePlayers();
    // this._deleteLoading();
    // this._deleteEmpty();
    // this._createLoading(camera_id);

    // get camera_protocol here
    fetchCameraInfo(camera_id).done(function(d) {
      // temp
      // d = JSON.parse(d);

      var model_id = d['model_id'];
      self.need_webgl = self.need_webgl && d['sphere_available'] == '1';
      self.canvas_width = d['max_width'];
      self.canvas_height = d['max_height'];
      self._is_flv = d['is_flv'] == '1' ? true : false;

      console.log('create this._live_video');
      self._live_video = self._createPlayer(camera_id);
      self._video = self._live_video;

      if (self._live_video == null) {
        console.log('_createPlayer fail in _tryRelay');
        self._live();
        return;
      }

      if (self.need_webgl) {
        console.log('start to init WebGL');
        self._initWebGL(model_id);
        self._live_video.addEventListener(
          'play',
          function() {
            self._renderVideo('_live');
            // self._deleteLoading();
          },
          0,
        );
      }

      if (!self.need_webgl) {
        self._show_fisheye_mode = true;
        // temp
        self._live_video.style.display = 'inline';
      }

      $.when(self._startRelay(camera_id))
        .done(function() {
          self._startLiveChecker(camera_id);
          // self._deleteLoading();
          self._deferred.resolve();
        })
        .fail(function() {
          // something went wrong, retry again after 5s
          console.log('something went wrong, retry again after 5s');
          setTimeout(function() {
            // self._live(camera_id);
          }, 5000);
        });
    });
  };

  ShakaController.prototype._createPlayer = function(camera_id) {
    console.log(
      'ShakaController::_createPlayer ' +
        this.canvas_width +
        ' ' +
        this.canvas_height,
    );

    var self = this;

    if (this.canvas_width == 0) this.canvas_width = 1280;
    if (this.canvas_height == 0) this.canvas_height = 720;

    var container = $(
      this._template({
        width: this.canvas_width,
        height: this.canvas_height,
        id: camera_id,
      }),
    );

    // temp workaround (set video to muted)
    // DOMException: play() failed because the user didn't interact with the document first
    container = `<div id="relay_flash_api" style="display: none"></div>
    <div id=${camera_id} style="width: 100%; height: 100%">
      <canvas
        id="shaka-canvas"
        width="1920"
        height="1080"
        style="display: none"></canvas>
      <video
        muted
        id="live-video"
        style="width: 100%; height: auto; display: none;"></video>
      <video
        muted
        id="archive-video"
        style="width: 100%; height: auto; display: none;"
        crossOrigin="anonymous"></video>

      <div
        id="control-bar"
        class="control-bar"
        dir="ltr"
        role="group">
        <button
          id="play-button"
          class="play-control playing"></button>
        <span id="duration-text" class="duration-text">
          {' '}
          0:00 / 0:00{' '}
        </span>
        <input
          id="duration-seek-bar"
          class="duration-seek-bar"
          type="range"
          min="0"
          max="100"
          step="1"
          value="0"></input>
        <button
          id="volume-button"
          class="volume-control"></button>
        <input
          id="volume-seek-bar"
          class="volume-seek-bar"
          type="range"
          min="0"
          max="100"
          step="1"
          value="50"></input>
      </div>`;

    // temp
    $('#container').append(container);

    this._canvas = $('#container')
      .find('#shaka-canvas')
      .get(0);

    this._context = this._canvas.getContext('2d');
    this._context.translate(this.canvas_width, 0);
    this._context.scale(-1, 1);

    var live_player = $('#container')
      .find('#live-video')
      .get(0);

    if (this._is_flv) {
      if (flvjs.isSupported()) {
        var videoElement = $('#live-video').get(0);
        var flvPlayer = flvjs.createPlayer({
          type: 'flv',
          isLive: true,
        });
        flvPlayer.attachMediaElement(videoElement);
        // flvPLayer.load();
        // flvPlayer.play();
      }
    } else {
      shaka.polyfill.installAll();
      if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        var player = new shaka.Player(live_player);

        var config = {abr: {}, drm: {}, manifest: {dash: {}}};
        config.abr.enabled = false;
        player.configure(config);

        console.log(player);

        // Attach player to the window to make it easy to access in the JS console.
        this._player = player;

        // play -> remove -> add again
        this._player.addEventListener('error', function(event) {
          console.error(
            'Error code!',
            event.detail.code,
            'object',
            event.detail,
          );

          self._retry_counter += 1;
          console.log('retry conuter: ' + self._retry_counter);

          if (event.detail.code == 1001) {
            // streaming is removed
            setTimeout(function() {
              self.live(camera_id);
            }, 5000);
          } else if (event.detail.code == 9999) {
            setTimeout(function() {
              self.live(camera_id);
            }, 5000);
          }

          // retry
          if (self._retry_counter >= 5) {
            console.log('reconnect to RTMP server');
            $.post('api/v2/cameras/' + camera_id + '/dashstream', {
              api_key: API_KEY,
              warmup: 1,
            }).done(function(d) {
              console.log('restart rtmp server');
              self._retry_counter = 0;
            });
          }

          console.log(
            'ERROR OCCUR! Retry (' + self._retry_counter + ') in 5 secs!',
          );
          clearInterval(self._renderloop);
          self._player.unload();
          setTimeout(function() {
            // self.live(camera_id);
          }, 5000);
        });
      } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
        // (TODO) change to use videojs
      }
    }

    return live_player;
  };

  ShakaController.prototype._renderVideo = function(str) {
    console.log('ShakaController.prototype._renderVideo ' + str);
    var self = this;
    var counter = 1;
    var error_count = 0;
    var MAX_ERROR_COUNT = 16;
    var frame_number = 0;

    self._renderloop = setInterval(function() {
      // console.log(self._renderloop);
      // console.log(self._video);
      // console.log(self.canvas_width + " " + self.canvas_height);
      if (self.need_webgl == false) {
        return;
      }

      if (self._context) {
        self._context.drawImage(
          self._video,
          0,
          0,
          self.canvas_width,
          self.canvas_height,
        );
        self._texture.needsUpdate = true;
        self._render();
      }

      counter += 1;

      if (counter >= self.FPS * 10) {
        counter = 0;

        // if paused, ignore check
        if (self._video.paused) {
          return;
        }

        if (!self._is_flv) {
          // check at each seconds
          if (self._player != null) {
            var pre_frame_number = frame_number;
            frame_number = self._player.getStats().decodedFrames;

            if (pre_frame_number == frame_number) {
              console.log('error!!');
              error_count += 1;
            } else {
              console.log('no error...');
              error_count = 0;
            }

            if (error_count >= MAX_ERROR_COUNT) {
              // retry
              console.log('frame is stucked... retry');

              $.post('api/v2/cameras/' + self.camera_id + '/dashstream', {
                api_key: API_KEY,
                warmup: 1,
              }).done(function(d) {
                self._retry_counter = 0;
                error_count = 0;
              });
            }
          }
        }
      }
    }, 1000 / self.FPS);
  };

  ShakaController.prototype._initWebGL = function(model_id) {
    var self = this;

    // Set up texture
    console.log('_initWebGL');
    console.log(this._canvas);

    this._texture = new THREE.Texture(this._canvas);
    this._texture.maxFilter = THREE.NearestFilter;
    this._texture.minFilter = THREE.NearestFilter;
    this._texture.wrapS = THREE.ClampToEdgeWrapping;
    this._texture.wrapT = THREE.ClampToEdgeWrapping;

    var object_name = 'sphere_web_' + model_id + '.obj'; //can test sphere
    console.log('loading... ' + object_name);

    this._loader = new THREE.OBJLoader();
    this._loader.load(
      '//' + location.host + '/modules/js/model/' + object_name,
      function(obj) {
        self._object = obj;
        //video.play();
        self._scene = new THREE.Scene();
        self._camera = new THREE.PerspectiveCamera(
          42,
          self.canvas_width / self.canvas_height,
          1,
          100,
        );
        self._camera.position.set(0, 0, 0);
        self._camera.up = new THREE.Vector3(0, 1, 0);
        self._camera.lookAt(new THREE.Vector3(0, 0, 10));
        //animate();

        //OBJECT
        self._object.position.x = 0;
        self._object.position.y = 0;
        self._object.position.z = 0;
        self._object.rotation.y = 0;
        self._object.rotation.z = 0;
        // object.rotation.y -= 1;
        self._object.scale.set(10, 10, 10);

        var material = new THREE.MeshBasicMaterial({map: self._texture});
        self._object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            child.material.needsUpdate = true;
          }
        });

        self._scene.add(self._object);
        self._renderer = new THREE.WebGLRenderer();
        self._renderer.setSize(
          $('#live-video').width(),
          $('#live-video').height(),
        );

        self._renderer.domElement.setAttribute('id', 'renderer');

        var parent = window.parent.$('.live_view#' + self.camera_id);

        $('#' + self.camera_id).append(self._renderer.domElement);
        $('#renderer').css('width', '100%');
        $('#renderer').css('height', '100%');

        self._control_bar = $('#control-bar').get(0);
        self._control_bar_callback = new ControlBar(
          self._control_bar,
          self._video,
        );
        console.log('show controls: ' + self._show_controls);
        $('#archive-video').on(
          'timeupdate',
          self._control_bar_callback.onTimeUpdate,
        );
        $('#archive-video').on(
          'ended',
          self._control_bar_callback.onVideoEnded,
        );

        parent.unbind('mousemove');
        parent.unbind('mouseup');
        parent.unbind('mousedown');
        parent.unbind('mouseout');
        parent.unbind('dblclick');

        parent.on('click', self.onClick);
        parent.on('mousemove', self.onMouseMove);
        parent.on('mouseup', self.onMouseUp);
        parent.on('mousedown', self.onMouseDown);
        parent.on('mouseout', self.onMouseOut);
        parent.on('dblclick', self.onDoubleClick);
        parent.draggable({disabled: true});
        parent.children().draggable({disabled: true});

        $('#container').on('click', self.onClick);
        $('#container').on('mousemove', self.onMouseMove);
        $('#container').on('mouseup', self.onMouseUp);
        $('#container').on('mousedown', self.onMouseDown);
        $('#container').on('mouseout', self.onMouseOut);
        $('#container').on('dblclick', self.onDoubleClick);

        window.addEventListener('resize', self.onWindowResize, false);
        self._render();
      },
    );
  };

  ShakaController.prototype._animate = function() {
    this._render();
    requestAnimationFrame(animate);
  };

  ShakaController.prototype._render = function() {
    if (this._renderer == null) {
      console.log('renderer is null!');
    } else {
      // console.log(this._renderer);
      if (this._scene == null) {
        console.log('scene is null!');
      }
      if (this._camera == null) {
        console.log('camera is null!');
      }

      // var states = this._player.getStats().stateHistory;
      // console.log(states);

      // var buffered = this._video.buffered;
      // var currentTime = this._video.currentTime;
      // var ahead = buffered.end(0) - currentTime;
      // var behind = currentTime - buffered.start(0);

      this._renderer.render(this._scene, this._camera);
    }
  };

  ShakaController.prototype._deletePlayers = function() {
    console.log('ShakaController::_deletePlayers');
    this._stopLiveChecker();

    if (this._player) {
      this._player.destroy();
      this._player = null;
    }

    if (this._live_video) {
      this._live_video = null;
    }

    $('#live-video').remove();

    if (this._canvas) {
      this._canvas = null;
    }
    $('#shaka-canvas').remove();

    if (this._archive_video) {
      this._archive_video = null;
    }
    $('#archive-video').remove();

    if (this._renderer) {
      this._renderer.domElement.remove();
      // this._renderer.forceContextLoss();
      this._renderer = null;
    }

    // var parent = window.parent.$('.camera-view');
    var parent = window.parent.$('.live_view#' + self.camera_id);
    $('#container').unbind('click');
    $('#container').unbind('mousemove');
    $('#container').unbind('mouseup');
    $('#container').unbind('mousedown');
    $('#container').unbind('mouseout');
    $('#container').unbind('dblclick');

    $('#container').empty();

    parent.unbind('mousemove');
    parent.unbind('mouseup');
    parent.unbind('mousedown');
    parent.unbind('mouseout');
    parent.unbind('dblclick');

    this._context = null;
    this._texture = null;
    this._object = null;
    this._loader = null;
    this._camera = null;
    this._scene = null;

    clearInterval(this._renderloop);
  };

  ShakaController.prototype._createLoading = function(camera_id) {
    console.log('ShakaController::_createLoading');
    var $screen = $(this._template_loading());
    $screen.css(
      'background-image',
      'url("' + 'api/v2/cameras/' + camera_id + '/thumbnail")',
    );
    $('#container').append($screen);
    // $('#container').append($('.loading'));
    // $('#container').append($('.seeking'));
  };

  ShakaController.prototype._deleteLoading = function() {
    console.log('ShakaController::_deleteLoading');
    $('.loading').remove();
    // temp
    // $('.seeking').remove();

    var $el = window.parent.$('.live_view#' + this.camera_id);
    $el.find('.live-overlay-container').removeClass('seeking');
  };

  ShakaController.prototype._createEmpty = function(camera_id) {
    console.log('ShakaController::_createEmpty');
    var $screen = $(this._template_empty());
    var $subscreen = $(this._template_thumbnail());
    $subscreen.css(
      'background-image',
      'url("' + 'api/v2/cameras/' + camera_id + '/thumbnail")',
    );
    $('#container').append($subscreen);
    $('#container').append($screen);
    $screen.css('z-index', ++this._zindex);
  };

  ShakaController.prototype._deleteEmpty = function() {
    console.log('ShakaController::_deleteEmpty');
    $('.empty').remove();
    $('.thumbnail').remove();
  };

  ShakaController.prototype._source = function(camera_id, url, deferred) {
    console.log('ShakaController::_source');
    console.log('url = ' + url);
    console.log('camera_id = ' + camera_id);

    this._deletePlayers();
    this._deleteLoading();
    this._deleteEmpty();
    this._createLoading(camera_id);

    var self = this;

    self.canvas_width = 1920;
    self.canvas_height = 1080;

    console.log('ShakaController::_source');
    var $container = $(
      self._template({
        width: self.canvas_width,
        height: self.canvas_height,
        id: camera_id,
      }),
    );

    // temp
    $container = `<div id="relay_flash_api" style="display: none"></div>
    <div id=${camera_id} style="width: 100%; height: 100%">
      <canvas
        id="shaka-canvas"
        width=${self.canvas_width}
        height=${self.canvas_height}
        style="display: none"></canvas>
      <video
        muted
        id="live-video"
        style="width: 100%; height: auto; display: none;"></video>
      <video
        muted
        id="archive-video"
        style="width: 100%; height: auto; display: none;"
        crossOrigin="anonymous"></video>

      <div
        id="control-bar"
        class="control-bar"
        dir="ltr"
        role="group">
        <button
          id="play-button"
          class="play-control playing"></button>
        <span id="duration-text" class="duration-text">
          {' '}
          0:00 / 0:00{' '}
        </span>
        <input
          id="duration-seek-bar"
          class="duration-seek-bar"
          type="range"
          min="0"
          max="100"
          step="1"
          value="0"></input>
        <button
          id="volume-button"
          class="volume-control"></button>
        <input
          id="volume-seek-bar"
          class="volume-seek-bar"
          type="range"
          min="0"
          max="100"
          step="1"
          value="50"></input>
      </div>`;
    $('#container').append($container);

    if (self._archive_video == null) {
      self._archive_video = $('#archive-video').get(0);
      self._video = self._archive_video;
    }

    // $('#archive-video').on('timeupdate', self._control_bar_callback.onTimeUpdate);
    $('#archive-video').on('timeupdate', function() {
      // console.log('timeupdate: ' + $('#archive-video').get(0).currentTime);
      Video.events.trigger('tick', $('#archive-video').get(0).currentTime);
    });
    // $('#archive-video').on('ended', self._control_bar_callback.onVideoEnded);
    $('#archive-video').on('ended', function() {
      // console.log('ended');
      Video.events.trigger('ended');
    });

    self._canvas = $('#container')
      .find('#shaka-canvas')
      .get(0);

    self._context = self._canvas.getContext('2d');
    self._context.translate(self.canvas_width, 0);
    self._context.scale(-1, 1);

    // get camera_protocol here
    fetchCameraInfo(camera_id).done(function(d) {
      self._is_flv = d['is_flv'] == '1' ? true : false;
      console.log('archive, get camera info');

      var model_id = d['model_id'];
      self.need_webgl = self.need_webgl && d['sphere_available'] == '1';

      console.log(self._archive_video);
      self._archive_video.src = url;

      if (self.need_webgl) {
        console.log('start to init WebGL');
        self._initWebGL(model_id);
      }

      self._archive_video.addEventListener(
        'pause',
        function() {
          if (self._show_controls && !self.need_webgl) {
            const eventProperties = {};
            eventProperties.seek = self._archive_video.currentTime;
            eventProperties.length = self._archive_video.duration;
            if (amplitude) {
              amplitude
                .getInstance()
                .logEvent('Pause_Archive', eventProperties);
            }
          }
        },
        0,
      );

      self._archive_video.addEventListener(
        'play',
        function() {
          self._deleteLoading();
          self._renderVideo('_source');

          console.log((700 * d['max_height']) / d['max_width']);
          // Do it here so the archive view will not show the controls bar before the size of
          // video view changed

          if (self._show_controls && !self.need_webgl) {
            $('#archive-video').css(
              'height',
              (700 * d['max_height']) / d['max_width'],
            );
            window.parent
              .$('#play-archive')
              .find('#play-archive')
              .css('height', (700 * d['max_height']) / d['max_width']);
            console.log('_show_controls: ' + self._show_controls);
            self._archive_video.setAttribute('controls', 'controls');
            const eventProperties = {};
            eventProperties.seek = self._archive_video.currentTime;
            eventProperties.length = self._archive_video.duration;
            if (amplitude) {
              amplitude.getInstance().logEvent('Play_Archive', eventProperties);
            }
          }
        },
        0,
      );

      self._archive_video.play();

      if (!self.need_webgl) {
        // force to use fisheye mode
        self._show_fisheye_mode = true;
        video._video.style.display = 'inline';
      }

      // if (self._show_controls && !self.need_webgl) {
      //     // if need_webgl == false, always use custom control bar.
      //     console.log("_show_controls: " + self._show_controls);
      //     self._archive_video.setAttribute('controls', 'controls');
      // }
    });

    deferred.resolve();
  };

  ShakaController.prototype._makeMain = function(player) {
    console.log('ShakaController::_makeMain');
  };

  ShakaController.prototype._startLiveChecker = function(camera_id) {
    console.log('ShakaController::_startLiveChecker');
    var self = this;
    var counter = 0;
    var prev_time = 0;
    this._playing_checker = setInterval(function() {
      // console.log("live checker: " + self._last_update);
      if (!self._video || self._video.paused) {
        console.log('paused, not check live');
        counter = 0;
        return;
      }

      var time = $('#live-video').get(0).currentTime;
      if (time == prev_time) {
        counter++;
      }
      prev_time = time;

      if (counter >= 10) {
        console.info('live.disconnected');
        // self.live(camera_id);
      }
    }, 1000);
  };

  ShakaController.prototype._stopLiveChecker = function() {
    console.log('ShakaController::_stopLiveChecker');
    clearInterval(this._playing_checker);
    this._playing_checker = 0;
  };

  ShakaController.prototype._deleteRelay = function() {
    console.log('ShakaController::_deleteRelay');
  };

  ShakaController.prototype._tryRelay = function(camera_id, deferred) {
    console.log('ShakaController::_tryRelay');

    var self = this;
    var _deferred = deferred;

    fetchCameraInfo(camera_id)
      .done(function(data) {
        // temp
        // data = JSON.parse(data);

        var model_id = data['model_id'];

        self._is_flv = data['is_flv'] == '1' ? true : false;
        var hasAudio = data['mute'] == '1' ? false : true;

        var url = self._is_flv
          ? 'api/v2/cameras/' + camera_id + '/flvstream'
          : 'api/v2/cameras/' + camera_id + '/dashstream';

        console.log(url);
        $.get(url, {
          api_key: API_KEY,
          warmup: 1,
        }).done(function(data) {
          if (self._is_flv) {
            self._player = flvjs.createPlayer({
              type: 'flv',
              isLive: true,
              url: data,
              hasAudio: hasAudio,
            });

            // self._player.muted = true;
            self._player.attachMediaElement($('#live-video').get(0));
            self._player.load();

            var video_check = setTimeout(() => {
              if (hasAudio == false) {
                console.log('video not started but hasAudio is false.');
              } else {
                console.log(
                  'video is not started. Try to set hasAudio as false',
                );
                self._player.destroy();
                setTimeout(() => {
                  self._player = flvjs.createPlayer({
                    type: 'flv',
                    isLive: true,
                    url: data,
                    hasAudio: false,
                  });

                  self._player.attachMediaElement($('#live-video').get(0));
                  self._player.load();
                  try {
                    self._player.play().then(function() {
                      console.log('done play');
                      clearTimeout(video_check);
                      video_check = 0;
                      self._deleteLoading();
                    });
                  } catch (e) {
                    console.warn(e);
                    self._player.play();
                    setTimeout(function() {
                      self._deleteLoading();
                    }, 500);
                  }
                }, 300);
              }
            }, 10000);

            try {
              self._player.play().then(function() {
                console.log('done play');
                clearTimeout(video_check);
                video_check = 0;
                self._deleteLoading();

                if (
                  $('#' + camera_id).height() <
                  $('#live-video').height() * 0.95
                ) {
                  console.log('aspect ratio wrong');
                  $('#live-video').css('max-height', '100%');
                }
              });
            } catch (e) {
              console.warn(e);
              self._player.play();
              setTimeout(function() {
                self._deleteLoading();
              }, 500);
            }

            self._player.on('play', function() {
              console.log('on play');
            });

            self._player.on('playing', function() {
              console.log('on playing');
            });
          } else {
            // Try to load a manifest.
            // This is an asynchronous process.
            console.log(data);
            console.log(self);
            self._player
              .load(data)
              .then(function() {
                console.log('The video has now been loaded!');
                var waitTime = 200;
                setTimeout(function() {
                  // Resume play if the element if is paused.
                  if (self._live_video.paused) {
                    console.log('self._live_video.play in _tryRelay');
                    self._live_video.play();
                    self._deleteEmpty();
                    self._deleteLoading();
                    _deferred.resolve();
                  }
                }, waitTime);
              })
              .catch(function(error) {
                console.log(error);
                console.error('Error code', error.code, 'object', error);
                console.log('GET FILE FAIL, RELOAD AGAIN');
                setTimeout(function() {
                  clearTimeout(self._renderloop);
                  video.live(camera_id);
                }, 3000);
              });
            // (TODO) fire error if no response in 5 seconds
            // self._video.play();
          }
        });
      })
      .fail(function(error) {
        console.error(error);
        deferred.reject();
      });
    return deferred.promise();
  };

  ShakaController.prototype._startRelay = function(camera_id) {
    var deferred = $.Deferred();
    this._relay_ok = false;
    this._tryRelay(camera_id, deferred);
    return deferred.promise();
  };

  ShakaController.prototype._needHTML5 = function() {
    return true;
  };

  ShakaController.prototype.setObjectScaleAndTrans = function(dx, dy, scale) {
    video._object.rotation.y = -dx;
    video._object.rotation.x = dy;
  };

  ShakaController.prototype.onClick = function(event) {
    var x = event.screenX;
    var y = event.screenY;
  };

  ShakaController.prototype.onDoubleClick = function(event) {
    if (video.need_webgl == false) return;

    console.log('fisheye: ' + video._show_fisheye_mode);
    var camera_id = this.id;

    var $el = window.parent.$('.live_view#' + camera_id);
    var is_group = window.parent.$('.live_view').length != 1;

    if (video._show_fisheye_mode == true) {
      video._show_fisheye_mode = false;
      $el.draggable({disabled: true});
      $el.children().draggable({disabled: true});
      video._renderer.domElement.style.display = 'inline';
      video._video.style.display = 'none';
      if (video._live_video) {
        video._live_video.style.display = 'none';
      }
      if (video._archive_video) {
        video._archive_video.style.display = 'none';
      }
    } else {
      video._show_fisheye_mode = true;
      if (is_group) {
        $el.draggable({disabled: false});
        $el.children().draggable({disabled: false});
      }
      video._renderer.domElement.style.display = 'none';
      if (video._live_video) {
        video._live_video.style.display = 'none';
      }
      if (video._archive_video) {
        video._archive_video.style.display = 'none';
      }
      video._video.style.display = 'inline';
    }
  };

  ShakaController.prototype.onMouseMove = function(event) {
    if (video._show_controls) {
      video.showControls();
    }

    if (video._mouse_mode == 1) {
      var x = event.screenX - video._prevX;
      var y = event.screenY - video._prevY;
      video._mX += x * video.SCALE_FACTOR;
      video._mY += y * video.SCALE_FACTOR;
      video._prevX = event.screenX;
      video._prevY = event.screenY;
      video.setObjectScaleAndTrans(video._mX, video._mY, 1);

      if (video._mX > 0.89) {
        video._mX = 0.89;
      }
      if (video._mX < -0.89) {
        video._mX = -0.89;
      }
      if (video._mY > 0.38) {
        video._mY = 0.38;
      }
      if (video._mY < -0.38) {
        video._mY = -0.38;
      }
    } else {
    }
  };

  ShakaController.prototype.onMouseUp = function(event) {
    video._mouse_mode = 0;
  };

  ShakaController.prototype.onMouseDown = function(event) {
    video._mouse_mode = 1;
    video._click_x = event.screenX;
    video._click_y = event.screenY;
    video._prevX = event.screenX;
    video._prevY = event.screenY;
  };

  ShakaController.prototype.onMouseOut = function(event) {
    video._mouse_mode = 0;
    video.hideControls();
  };

  ShakaController.prototype.onWindowResize = function(event) {
    video._renderer.setSize(
      $('#live-video').width(),
      $('#live-video').height(),
    );
  };

  ShakaController.prototype.showControls = function() {
    console.log('showControls');

    if (video.need_webgl) {
      if (video._control_bar.style.display == 'none') {
        video._control_bar.style.display = 'inline';
      }
    } else {
      // non-webgl mode, use html5 video
      // video._archive_video.setAttribute("controls","controls")
    }
  };

  ShakaController.prototype.hideControls = function() {
    console.log('hideControls');

    if (video.need_webgl) {
      if (video._control_bar.style.display != 'none') {
        video._control_bar.style.display = 'none';
      }
    } else {
      // non-webgl mode, use html5 video
      if (video._archive_video.hasAttribute('controls')) {
        video._archive_video.removeAttribute('controls');
      }
    }
  };

  function ControlBar(control_bar, video) {
    this._control_bar = control_bar;
    this._video = video;

    $('#play-button').on('click', this.onPlayVideo);
    $('#duration-seek-bar').on('input change', this.onSeekVideo);
    $('#volume-button').on('click', this.onMute);

    var volume_bar = $('#volume-seek-bar');
    volume_bar.on('input change', this.onVolumeChanged);
    var volume = $('#archive-video').get(0).volume;
    volume_bar.get(0).value = volume * 100;
    volume_bar.css(
      'background-image',
      '-webkit-gradient(linear, left top, right top, color-stop(' +
        volume +
        ', #4488FF), color-stop(' +
        volume +
        ', #505050))',
    );
  }

  ControlBar.prototype.onPlayVideo = function() {
    if ($('#archive-video').get(0).paused) {
      console.log('onPlayVideo');
      $('#play-button')
        .get(0)
        .classList.remove('paused');
      $('#play-button')
        .get(0)
        .classList.add('playing');

      if (this.currentTime == this.duration) {
        this.currentTime = 0;
      }

      $('#archive-video')
        .get(0)
        .play();
    } else {
      console.log('onPauseVideo');
      $('#play-button')
        .get(0)
        .classList.remove('playing');
      $('#play-button')
        .get(0)
        .classList.add('paused');
      $('#archive-video')
        .get(0)
        .pause();
    }
  };

  ControlBar.prototype.onSeekVideo = function() {
    console.log('onSeekVideo');
    var value = $('#duration-seek-bar').get(0).value;
    var total = $('#archive-video').get(0).duration;
    var time = (value / 100) * total;
    console.log(value + ' ' + total + ' ' + time);
    $('#archive-video').get(0).currentTime = time;
  };

  ControlBar.prototype.onVolumeChanged = function() {
    var seekbar = $('#volume-seek-bar');
    var value = seekbar.get(0).value;
    var volume = value / 100;
    console.log('onVolumeChanged: ' + volume);
    $('#archive-video').get(0).volume = volume;
    var val =
      (seekbar.val() - seekbar.attr('min')) /
      (seekbar.attr('max') - seekbar.attr('min'));
    seekbar.css(
      'background-image',
      '-webkit-gradient(linear, left top, right top, color-stop(' +
        val +
        ', #4488FF), color-stop(' +
        val +
        ', #505050))',
    );
  };

  ControlBar.prototype.onMute = function() {
    if ($('#archive-video').get(0).muted) {
      console.log('unmute');
      $('#volume-button')
        .get(0)
        .classList.remove('muted');
      $('#volume-button')
        .get(0)
        .classList.add('unmuted');
      $('#archive-video').get(0).muted = false;
    } else {
      console.log('mute');
      $('#volume-button')
        .get(0)
        .classList.remove('unmuted');
      $('#volume-button')
        .get(0)
        .classList.add('muted');
      $('#archive-video').get(0).muted = true;
    }
  };

  ControlBar.prototype.onTimeUpdate = function() {
    var seekbar = $('#duration-seek-bar');
    // update text
    var text =
      Math.round(this.currentTime * 100) / 100 +
      ' / ' +
      Math.round(this.duration * 100) / 100;
    console.log('onTimeUpdate: ' + text);
    $('#duration-text').text(
      formatString(this.currentTime) + ' / ' + formatString(this.duration),
    );

    // update seekbar
    seekbar.get(0).value = Math.round((this.currentTime / this.duration) * 100);

    function formatString(t) {
      var sec = Math.floor(t % 60);
      var min = Math.floor(t / 60);
      return ('0' + min).slice(-2) + ' : ' + ('0' + sec).slice(-2);
    }

    var val =
      (seekbar.val() - seekbar.attr('min')) /
      (seekbar.attr('max') - seekbar.attr('min'));
    seekbar.css(
      'background-image',
      '-webkit-gradient(linear, left top, right top, color-stop(' +
        val +
        ', #4488FF), color-stop(' +
        val +
        ', #505050))',
    );
    Video.events.trigger('tick', this.currentTime);
  };

  ControlBar.prototype.onVideoEnded = function() {
    console.log('onVideoEnded');
    $('#play-button')
      .get(0)
      .classList.remove('playing');
    $('#play-button')
      .get(0)
      .classList.add('paused');
    // Video.events.trigger('ended');
  };

  function Controller() {
    this._main = null;
    this._local = null;
    this._relay = null;
    this._show_controls = false;
    this._last_update = true;
    // temp
    // this._template = _.template($('#template-player').html());
    this._template = () => `<video
    id=${cameraId}
    class="video-js vjs-default-skin vjs-big-play-centered"
    preload="auto"
    width="100%"
    height="100%"
    data-setup='{ "techOrder":["flash"] }'>
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider
      upgrading to a web browser that{' '}
      <a
        href="http://videojs.com/html5-video-support/"
        target="_blank"
        rel="noreferrer">
        supports HTML5 video
      </a>
    </p>
  </video>`;
    // this._template_loading = _.template($('#template-loading').html());
    // temp
    this._template_loading = () => `<div class="loading"></div>`;

    // temp
    // this._template_empty = _.template($('#template-empty').html());
    // this._template_thumbnail = _.template($('#template-thumbnail').html());
    this._template_empty = () => `<div class="empty">
    <div class="empty-text">try_to_buy_CR</div>
    </div>`;
    this._template_thumbnail = () => `<div class="thumbnail"></div>`;
    this._the_thumbnail = _.template($('.thumbnail').html());
    this._zindex = 0;
    this._playing_checker = 0;
    this._pause_hack_timer = 0;

    this._deferred = $.Deferred().reject();
    this._local_timeout = 0;
    this._relay_timeout = 0;
    this._local_ok = false;
    this._relay_ok = false;
    this._local_max_retry = 5;

    this.is_mute = false;
  }

  Controller.prototype.live = function(camera_id) {
    if (this._deferred.state() === 'pending') {
      console.warn('there is a pending deferred');
      return this._deferred.promise();
    }
    this._deferred = $.Deferred();
    this._live(camera_id);
    return this._deferred.promise();
  };

  Controller.prototype.source = function(url, camera_id) {
    var deferred = $.Deferred();
    var self = this;

    if (
      this._deferred.state() === 'pending' ||
      this._deferred.state() === 'resolved'
    ) {
      console.warn('previous playing is incomplete, do a cleanup');
      // just abandon previous event sequence, and assume nothing is done
      this._deferred = $.Deferred().reject();
    }
    this._deferred
      .done(function() {
        // main video ready
        self._stopLiveChecker();
        self._source(url, deferred);
      })
      .fail(function() {
        // no video, create one
        self._deletePlayers();
        self._deleteEmpty();
        var player = self._createPlayer('archive');
        self._makeMain(player);
        $('#archive').css('z-index', ++self._zindex);
        self._source(url, deferred);

        // other actions depend on this
        self._deferred = deferred;
      });

    return deferred.promise();
  };

  Controller.prototype.empty = function(camera_id) {
    var self = this;

    this._deferred
      .done(function() {
        // main video ready
        self._main.pause();
      })
      .always(function() {
        self._deleteEmpty();
        self._deleteLoading();
        self._deletePlayers();
        self._createEmpty(camera_id);
        self._deferred = $.Deferred().reject();
      });
  };

  Controller.prototype.cache = function(camera_id, timestamp) {
    var deferred = $.Deferred();
    var self = this;

    $.get('api/v2/cameras/' + camera_id + '/cachefile', {
      // api_key: API_KEY,
      timestamp: timestamp,
    })
      .done(function(url) {
        url = url.replace(/<script.*script>/, '');
        console.info(url);
        if (!url) {
          // no CR no file
          deferred.reject();
          return;
        }

        console.log(url);
        self
          .source(url, camera_id)
          .done(function() {
            deferred.resolve();
          })
          .fail(function() {
            deferred.reject();
          });
      })
      .fail(function(url) {
        // TODO: handle error
        deferred.reject();
      });

    return deferred.promise();
  };

  Controller.prototype.play = function(isMute) {
    console.warn('Controller.prototype.play', isMute);
    this.is_mute = isMute;
    if (this.is_mute) {
      this.mute(isMute);
    }
    if (this._main) {
      // remove pause hack
      clearInterval(this._pause_hack_timer);
      this._pause_hack_timer = 0;
      this._main.play();
      console.info('internal play');
    }
    if (this._local) {
      this._local.play();
    }
    if (this._relay) {
      this._relay.play();
    }
  };

  Controller.prototype.pause = function() {
    // HACK may not be able to pause
    var self = this;
    clearInterval(this._pause_hack_timer);
    this._pause_hack_timer = setInterval(function() {
      if (self._main) {
        self._main.pause();
        if (self._main.paused()) {
          clearInterval(self._pause_hack_timer);
          self._pause_hack_timer = 0;
        }
      }
    }, 500);
  };

  Controller.prototype.seek = function(timestamp) {
    var self = this;
    this._deferred.done(function() {
      self._main.currentTime(timestamp);
    });
  };

  Controller.prototype.fullscreen = function() {
    var self = this;
    this._deferred.done(function() {
      self._main.requestFullscreen();
    });
  };

  Controller.prototype.mute = function(state) {
    var self = this;
    if (_.isUndefined(state)) {
      state = !self.is_mute;
      // state = !self._main.muted();
    }
    self.is_mute = state;
    this._deferred.done(function() {
      self._main.muted(self.is_mute);
    });
  };

  Controller.prototype._live = function(camera_id) {
    var self = this;

    this._deletePlayers();
    this._deleteLoading();
    this._deleteEmpty();
    this._createLoading(camera_id);
    $.when(this._startLocal(camera_id), this._startRelay(camera_id))
      .done(function() {
        self._startLiveChecker(camera_id);
        self._deferred.resolve();
      })
      .fail(function() {
        // something went wrong, retry again after 5s
        setTimeout(function() {
          self._live(camera_id);
        }, 5000);
      });
  };

  Controller.prototype._createPlayer = function(id) {
    var $player = $(
      this._template({
        id: id,
      }),
    );
    $player
      .find('.vjs-loading-spinner')
      .html('<img src="./images/v2/loading.gif" alt="Loading...">');
    $('#container').append($player);
    var v = videojs(id, {
      controls: this._show_controls,
    });
    return v;
  };

  Controller.prototype._deletePlayers = function() {
    this._stopLiveChecker();
    this._deleteRelay();
    this._deleteLocal();
    if (this._main) {
      this._main.off();
      this._main.dispose();
      this._main = null;
    }
    if (this._local) {
      this._local.off();
      this._local.dispose();
      this._local = null;
    }
    if (this._relay) {
      this._relay.off();
      this._relay.dispose();
      this._relay = null;
    }
  };

  Controller.prototype._createLoading = function(camera_id) {
    var $screen = $(this._template_loading());
    $screen.css(
      'background-image',
      'url("' + 'api/v2/cameras/' + camera_id + '/thumbnail")',
    );
    $('#container').append($screen);
    $screen.css('z-index', ++this._zindex);
  };

  Controller.prototype._deleteLoading = function() {
    $('.loading').remove();
  };

  Controller.prototype._createEmpty = function(camera_id) {
    var $screen = $(this._template_empty());
    var $subscreen = $(this._template_thumbnail());
    $subscreen.css(
      'background-image',
      'url("' + 'api/v2/cameras/' + camera_id + '/thumbnail")',
    );
    $('#container').append($subscreen);
    $('#container').append($screen);
    $screen.css('z-index', ++this._zindex);
  };

  Controller.prototype._deleteEmpty = function() {
    $('.empty').remove();
    $('.thumbnail').remove();
  };

  Controller.prototype._source = function(url, deferred) {
    var src;
    try {
      src = this._main.currentSrc();
    } catch (e) {
      console.warn(e);
      deferred.reject();
      return;
    }

    if (src === url) {
      deferred.resolve();
      return;
    }

    this._stopLiveChecker();

    src = {
      type: VIDEO_TYPE,
      src: url,
    };
    if (this._needHTML5()) {
      this._main.loadTech('Html5');
    }
    this._main.src(src);

    this._main.one('loadedmetadata', function() {
      deferred.resolve();
      setTimeout(function() {
        // HACK sometimes the archive can not play immediately, send stuck signal just in case
        Video.events.trigger('stuck');
      }, 1000);
    });
  };

  Controller.prototype._makeMain = function(player) {
    var self = this;

    this._main = player;

    // clear temporary events
    this._main.off('error');
    this._main.off('firstplay');

    this._main.on('loadeddata', function() {
      this.muted(self.is_mute);
    });

    this._main.on('ended', function() {
      if (this.currentSrc().match(/^rtmp/)) {
        console.warn('live ended?');
        return;
      }
      if (this.duration() - this.currentTime() > 1) {
        // smart ff may enter this
        Video.events.trigger('stuck');
        return;
      }
      Video.events.trigger('ended');
    });
    var zero_counter = 0;
    this._main.on('timeupdate', function() {
      // fix smart ff jump to front issue
      var duration = parseInt(this.duration());
      if (this.currentTime() > duration && duration > 0) {
        return;
      }
      Video.events.trigger('tick', this.currentTime());
      if (this.currentTime() === 0) {
        ++zero_counter;
      } else {
        zero_counter = 0;
      }
      self._last_update = zero_counter < 20;
    });
    this._main.on('error', function() {
      console.info('video.error', arguments);
    });
    this._main.on('fullscreenchange', function() {
      Video.events.trigger('fullscreen', this.isFullscreen());
    });
    this._main.on('durationchange', function() {
      // smart ff may enter this
      Video.events.trigger('stuck');
    });
  };

  Controller.prototype._startLiveChecker = function(camera_id) {
    var self = this;
    this._playing_checker = setInterval(function() {
      if (!self._main || self._main.paused()) {
        return;
      }
      if (!self._last_update) {
        console.info('live.disconnected.reload');
        self.live(camera_id);
      }
      self._last_update = false;
    }, 1000);
  };

  Controller.prototype._stopLiveChecker = function() {
    clearInterval(this._playing_checker);
    this._playing_checker = 0;
    this._last_update = true;
  };

  Controller.prototype._deleteRelay = function() {
    clearTimeout(this._relay_timeout);
    this._relay_timeout = 0;

    if (!this._relay) {
      return;
    }
    // HACK see https://github.com/videojs/video.js/issues/1541
    var player = this._relay;
    this._relay = null;
    console.info('relay.remove');
    player.dispose();
  };

  Controller.prototype._deleteLocal = function() {
    clearTimeout(this._local_timeout);
    this._local_timeout = 0;

    if (!this._local) {
      return;
    }
    // HACK see https://github.com/videojs/video.js/issues/1541
    var player = this._local;
    this._local = null;
    console.info('local.remove');
    player.dispose();
  };

  Controller.prototype._useRelay = function() {
    console.info('relay.use');
    clearTimeout(this._relay_timeout);
    this._relay_timeout = 0;

    this._makeMain(this._relay);
    $('#relay').css('z-index', ++this._zindex);
    this._relay = null;
  };

  Controller.prototype._useLocal = function() {
    console.info('local.use');
    clearTimeout(this._local_timeout);
    this._local_timeout = 0;

    this._makeMain(this._local);
    $('#local').css('z-index', ++this._zindex);
    this._local = null;
  };

  Controller.prototype._tryLocal = function(camera_id, deferred) {
    console.info('local.try');
    var self = this;

    $.get('api/v2/cameras/' + camera_id + '/rtmpstream', {
      scope: 'local',
      // api_key: API_KEY,
    })
      .done(function(url) {
        url = url.replace(/<script.*script>/, '');
        self._local = self._createPlayer('local');
        self._local.src({
          type: 'rtmp/mp4',
          src: url,
        });
        self._local.one('firstplay', function() {
          self._local_max_retry = self._local_max_retry - 1;
          if (self._local_max_retry < 0) {
            console.info('local.pass');

            self._deleteLocal();

            self._useRelay();
          } else {
            console.info('local.ok');

            if (self._relay) {
              // if need to dispose relay, make sure the deferred is also resolved
              self._relay.trigger('error');
            }
            self._useLocal();
            self._local_ok = true;
          }
          deferred.resolve();
        });
        self._local.one('error', function() {
          console.info('local.error');

          self._deleteLocal();

          if (!self._relay_ok) {
            // try again
            self._tryLocal(camera_id, deferred);
            return;
          }

          self._useRelay();

          deferred.resolve();
        });
        // fire error if no response in 5 seconds
        self._local_timeout = setTimeout(function() {
          self._local.trigger('error');
        }, 5000);
        self._local.play();
      })
      .fail(function() {
        // TODO: handle error
        deferred.reject();
      });
  };

  Controller.prototype._tryRelay = function(camera_id, deferred) {
    console.info('relay.try');
    var self = this;

    $.get('api/v2/cameras/' + camera_id + '/rtmpstream', {
      scope: 'relay',
      // api_key: API_KEY,
    })
      .done(function(url) {
        url = url.replace(/<script.*script>/, '');
        if (url.indexOf('localhost') >= 0) {
          console.info('relay.not.found');
          deferred.resolve();
          return;
        }

        self._relay = self._createPlayer('relay');
        self._relay.src({
          type: 'rtmp/mp4',
          src: url,
        });
        self._relay.one('firstplay', function() {
          console.info('relay.firstplay');

          clearTimeout(self._relay_timeout);
          self._relay_timeout = 0;

          if (self._local_ok) {
            self._deleteRelay();
          } else {
            self._zindex++;
            $('#relay').css('z-index', self._zindex);

            self._relay_ok = true;
          }

          deferred.resolve();
        });
        self._relay.one('error', function() {
          console.info('relay.error');

          self._deleteRelay();

          if (!self._local_ok) {
            // try again
            self._tryRelay(camera_id, deferred);
            return;
          }

          deferred.resolve();
        });
        // fire error if no response in 5 seconds
        self._relay_timeout = setTimeout(function() {
          self._relay.trigger('error');
        }, 5000);
        self._relay.play();
      })
      .fail(function(url) {
        // TODO: handle error
        deferred.reject();
      });
  };

  Controller.prototype._startRelay = function(camera_id) {
    var deferred = $.Deferred();
    this._relay_ok = false;

    this._tryRelay(camera_id, deferred);

    return deferred.promise();
  };

  Controller.prototype._startLocal = function(camera_id) {
    var deferred = $.Deferred();
    this._local_ok = false;

    this._tryLocal(camera_id, deferred);

    return deferred.promise();
  };

  Controller.prototype._needHTML5 = function() {
    if (this._main.id_ == 'archive') {
      return isChrome || isSafari;
    }
    return isChrome || isFirefox || isSafari;
  };

  var flash_video = new Controller();
  //var flash_video = new ShakaController(); //can test sphere
  var shaka_video = new ShakaController();

  var video = flash_video;

  Video.live = function(camera_id) {
    var deferred = $.Deferred();
    fetchCameraInfo(camera_id).done(function(d) {
      // d = JSON.parse(d);
      var is_rtmp = d['is_rtmp'];
      console.log('is_rtmp = ' + is_rtmp);
      if (is_rtmp === '0') {
        video = shaka_video; //
      } else {
        video = flash_video; //
      }

      if (isIE) {
        console.log('Because of IE, force to use flash');
        video = flash_video;
      }

      return video.live(camera_id).done(function() {
        deferred.resolve();
      });
    });
    return deferred.promise();
  };

  Video.cache = function(camera_id, mac_address, timestamp) {
    console.log('video.cache');
    return video.cache(camera_id, mac_address, timestamp);
  };

  Video.source = function(url, camera_id) {
    var deferred = $.Deferred();
    console.log('Video.source: ' + url);
    if (typeof camera_id !== 'undefined') {
      fetchCameraInfo(camera_id).done(function(d) {
        var is_rtmp = d['is_rtmp'];
        console.log('is_rtmp = ' + is_rtmp);
        if (is_rtmp === '0') {
          video = shaka_video;
        } else {
          video = flash_video;
        }

        if (isIE) {
          console.log('Because of IE, force to use flash');
          video = flash_video;
        }
        // here
        return video.source(url, camera_id).done(function() {
          deferred.resolve();
        });
      });
    } else {
      video = flash_video;
      console.log('use videojs');
      video.source(url).done(function() {
        deferred.resolve();
      });
    }
    return deferred.promise();
  };

  Video.empty = function(camera_id) {
    video.empty(camera_id);
  };

  Video.isLocal = function() {
    return video._local_ok;
  };

  Video.play = function(isMute) {
    console.warn('Video.play', isMute);
    try {
      video.play(isMute);
    } catch (e) {
      console.warn(e);
    }
  };

  Video.pause = function() {
    try {
      video.pause();
    } catch (e) {
      console.warn(e);
    }
  };

  Video.seek = function(timestamp) {
    try {
      video.seek(timestamp);
    } catch (e) {
      console.warn(e);
    }
  };

  Video.fullscreen = function() {
    try {
      video.fullscreen();
    } catch (e) {
      console.warn(e);
    }
  };

  Video.mute = function() {
    try {
      video.mute();
    } catch (e) {
      console.warn(e);
    }
  };

  Video.showControls = function() {
    flash_video._show_controls = true;
    shaka_video._show_controls = true;
  };

  // fix Uncaught TypeError: url.indexOf is not a function
  $.fn.load = function(callback) {
    $(window).on('load', callback);
  };
};
