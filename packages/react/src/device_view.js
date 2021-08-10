/* eslint-disable */
window.Skywatch = window.Skywatch || {};

export const device_view = function() {
  'use strict';

  var Live = Skywatch.Live;

  Live.DeviceView = Skywatch.View.extend({
    tagName: 'div',
    className: 'live_view',
    id: '',
    template_empty: _.template($('#template-camera-empty').html()),
    template_offline: _.template($('#template-camera-offline').html()),
    template_wrong_password: _.template(
      $('#template-camera-wrong-password').html(),
    ),
    // temp
    // template_loading: _.template($('#template-camera-loading').html()),
    template_loading: () => `<div><div class="camera-view unknown"/></div>`,
    events: {
      'click .button-settings': '_onSettingsClicked', // setting
      'click .button-single-view': '_onSingleViewClicked',
      'show.bs.dropdown': '_onDropdownShow',
      'hide.bs.dropdown': '_onDropdownHide',
      drop: '_onDrop',
      dropover: '_onDropOver',
      dropout: '_onDropOut',
    },

    initialize: function(options) {
      this._ = {
        $content: null,
        $frame: null,
        $overlay: null,
        rendered: false,
        frame: null,
        parent: options.parent,
        view_index: options.view_index,
        current_archive: null,
        next_archive: null,
        tick_counter: 0,
        rendering: $.Deferred().reject(),
        offline: true,
        show_cloud_archive: false,
        show_local_archive: false,
        seeking: false,
      };

      this.listenTo(this._.parent, 'focus', this.onFocus);
      this.listenTo(this._.parent, 'blur', this.onBlur);
      //detect if change the browser tab
      $(document).on('visibilitychange', _.bind(this.onVisibilityChange, this));
    },
    // NOTE return promise instead of this
    render: function() {
      if (this._.rendered || this._.rendering.state() === 'pending') {
        return this;
      }

      var self = this;

      if (this.isEmpty()) {
        console.info('render.empty', this._.$content);
        this.$el.empty();
        this._.$content = $(this.template_empty());
        this.$el.append(this._.$content);
        if (!this._.parent.isSingle()) {
          this._.$content.droppable();
        }
        this._.rendered = true;
        // temp
        // if (typeof this.customRender == 'function') {
        //   this.customRender()
        // }

        return this;
      }

      // new deferred to wait load events
      this._.rendering = $.Deferred();

      // loading spinner
      console.info('render.loading', this._.$content);
      this.$el.empty();
      this._.$content = $(this.template_loading(this.model.attributes));
      this.$el.append(this._.$content);

      // child class render functions
      this.$el.empty();
      this._.$content = $(this.template(this.model.attributes));
      this.$el.append(this._.$content);
      this._.$frame = this._.$content.find('> iframe').first();
      this._.$overlay = this._.$content.find('> div').first();
      this._.$content.data('view', this);

      if (typeof this.customRender == 'function') {
        this.customRender();
      }

      this._.rendered = true;

      return this;
    },
    //detect if change the browser tab
    onVisibilityChange: function() {
      var device_type;
      try {
        device_type = this.model.attributes.device_type;
      } catch (e) {
        console.log('attributes didnt exist');
      }

      if (device_type != 'sensor') {
        console.log('inside onVisibilityChange');
        //document.title = document.hidden;
        if (!document.hidden) {
          this.onFocus();
        } else {
          this.onBlur();
        }
      }
    },

    onFocus: function() {
      this.render();

      if (typeof this.customOnFocus == 'function') {
        this.customOnFocus();
      }
    },

    onBlur: function() {
      this.close();
    },

    close: function() {
      if (!this._.$content) {
        return;
      }

      if (this._.frame) {
        if (this._.frame.Skywatch) {
          if (this._.frame.Skywatch.Video) {
            if (this._.frame.Skywatch.Video.events) {
              this.stopListening(this._.frame.Skywatch.Video.events);
            }
          }
        }
      }

      this._.$content.remove();
      this._.$frame = null;
      this._.$overlay = null;
      this._.$content = null;
      this._.rendered = false;
      this._.rendering = $.Deferred().reject(); 
      this._.frame = null;
      // unbind event from control bar
      this.stopListening(Skywatch.Live.control_bar);
    },

    isEmpty: function() {
      // this.model should be non-null, but just in case
      return typeof this.model === 'undefined' || this.model.get('id') === 0;
    },

    getViewIndex: function() {
      return this._.view_index;
    },

    setCamera: function(camera_id) {
      var old_camera_id = this.model ? this.model.get('id') : 0;
      this.close();

      if (this.model) {
        this.stopListening(this.model);
      }
      this.model = Skywatch.Live.cameras.get(camera_id);

      // not found?
      if (!this.model) {
        this.model = new Skywatch.Live.CameraModel({
          id: 0,
        });
      }
      // NOTE re-bind model events if any

      // render
      this.onFocus();
    },

    // TODO extract class
    getType: function() {
      return Skywatch.keyholder ? 'camera' : 'readonly';
    },

    isOffline: function() {
      return this._.offline;
    },

    getRenderer: function() {
      return this._.rendering.promise();
    },

    _onSettingsClicked: function(event) {
      event.preventDefault();
      event.stopPropagation();
      Skywatch.Setting.camera_setting.show(this.model.get('id'));
    },

    _onCloseClicked: function() {
      this._.parent.model.removeCamera(this.model.get('id'));
      this._.parent.model.save();
    },

    _onSingleViewClicked: function() {
      var $item = this.$el.find('.button-single-view');
      if ($item.hasClass('back')) {
        var group = Live.groups.findCamera(this.model.get('id'));
        Live.camera_list.activate(group.get('id'), true);
      } else {
        Live.camera_list.activate(this.model.get('id'));
      }
    },

    // TODO extract class
    _onDrop: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');
      var model_id = this.model ? this.model.get('id') : 0;
      if (drag_view.getType() === 'camera') {
        // require swap
        this._.parent.model.swapCamera(
          this._.view_index,
          drag_view._.view_index,
        );
        // commit
        this._.parent.model.save();
      } else if (drag_view.getType() === 'label') {
        // replace camera
        if (drag_view.getGroup() == this._.parent._group_id) {
          // same group
        } else {
          this._.parent.model.setCamera(
            this._.view_index,
            drag_view.model.get('id'),
          );
          // may also changed other groups that have this camera
          var changed_models = Live.groups
            .chain()
            .filter(function(group) {
              return group.hasChanged();
            })
            .each(function(group) {
              group.save();
            });

          // HACK
          $('#drag-helper').remove();
        }
      }
      this._onDropOut();
    },

    // TODO extract class
    _onDropOver: function(event, ui) {
      this.$el.addClass('strong');
    },

    // TODO extract class
    _onDropOut: function(event, ui) {
      this.$el.removeClass('strong');
    },

    _onDropdownShow: function() {
      this.$el
        .find('.live-overlay-container')
        .first()
        .css('z-index', 2);
    },

    _onDropdownHide: function() {
      this.$el
        .find('.live-overlay-container')
        .first()
        .css('z-index', 1);
    },

    _renderOffline: function() {
      console.info('render.offline');
      this.$el.empty();
      this._.$content = $(this.template_offline(this.model.attributes));
      this.$el.append(this._.$content);
      this._.$frame = this._.$content.find('> iframe').first();
      this._.$overlay = this._.$content.find('> div').first();
      this._.$content.data('view', this);

      this._offlinePostActions();
    },

    _renderWrongPassword: function() {
      console.info('render.wrong_password');
      var self = this;
      this.$el.empty();
      this._.$content = $(this.template_wrong_password(this.model.attributes));
      this.$el.append(this._.$content);
      this._.$frame = this._.$content.find('> iframe').first();
      this._.$overlay = this._.$content.find('> div').first();
      this._.$content.data('view', this);

      this._.$content.on('click', '.live-overlay-container', function(e) {
        var $target = $(e.target);
        if ($target.hasClass('icon-settings-menu')) {
          return;
        }
        var device_id = $target.parents('.live_view').attr('id');
        var device = Skywatch.Live.cameras.get(device_id);
        var device_name = device.get('name', 'device');

        var html =
          '<div>' +
          Skywatch.lang.please_update_device_password.replace(
            '%DeviceName%',
            device_name,
          );
        html += '<br/><span>' + Skywatch.lang.password + '</span>';
        html += '<div class="device-password-wrapper">';
        html += '<input class="device-password" type="password"></input>';
        html +=
          "<div class=\"show-btn\" onclick=\"$('.device-password-wrapper input').attr('type','text')\">SHOW</div>";
        html += '<div class="error-msg"></div></div>';
        html += '<br/></div>';

        swal(
          {
            title: Skywatch.lang.unable_to_access,
            // type: "input",
            text: html,
            customClass: 'device-wrong-password',
            html: true,
            animation: false,
            closeOnConfirm: false,
            closeOnCancel: true,
            showCancelButton: false,
            confirmButtonColor: '#00adee',
            confirmButtonText: Skywatch.lang.update,
            // cancelButtonText: Skywatch.lang.cancel,
            allowOutsideClick: true,
          },
          function(isConfirm) {
            var $device_pass_container = $('.device-password-wrapper');
            var new_password = $device_pass_container.find('input').val();
            var params = {
              password: new_password,
            };
            $.post(
              'api/v2/devices/' + device_id + '/password',
              params,
              function(result) {
                if (result == '1') {
                  swal.close();
                  self._.rendered = false;
                  Skywatch.Live.camera_grid.trigger('focus');
                } else {
                  // update error
                  $device_pass_container
                    .find('.error-msg')
                    .text(Skywatch.lang.update_fail);
                }
              },
            ).fail(function() {
              // update error
              $device_pass_container
                .find('.error-msg')
                .text(Skywatch.lang.update_fail);
            });
          },
        );
      });

      this._offlinePostActions();

      if (
        Skywatch.Live.camera_list.getActiveCameraId() ===
        self._.$content.parents('.live_view').attr('id')
      ) {
        setTimeout(function() {
          self._.$content.find('.live-overlay-container').trigger('click');
        }, 500);
      }
    },

    _offlinePostActions: function() {
      var self = this;
      self.trigger('cr_changed');

      setTimeout(function() {
        self._.$frame.load(function() {
          console.log('reload frame after 1000 ms');
          self._.frame = self.contentWindow;

          // on archive ended
          self.listenTo(
            self._.frame.Skywatch.Video.events,
            'ended',
            self._onVideoEnded,
          );
          // on player tick
          self.listenTo(
            self._.frame.Skywatch.Video.events,
            'tick',
            self._onVideoTick,
          );
          // on player stuck
          self.listenTo(
            self._.frame.Skywatch.Video.events,
            'stuck',
            self._playOrPause,
          );

          // done
          self._.rendering.resolve();
        });
      }, 2000);

      this.listenTo(Skywatch.Live.control_bar, 'seek', this.seek);
      this.listenTo(Skywatch.Live.control_bar, 'play', this.play);
      this.listenTo(Skywatch.Live.control_bar, 'pause', this.pause);
      this.listenTo(Skywatch.Live.control_bar, 'fastforward', this.fastforward);

      self.model.fetchInfo().done(function(data) {
        data = data.replace(/<script.*script>/, '');
        data = JSON.parse(data);
        if (data.ptz_available != 1) {
          self.$el.find('.button-ptz').css('visibility', 'hidden');
        }

        if (data.local_archive_show_available === 0) {
          self.$el
            .find('.button-local-recording')
            .parent()
            .addClass('disabled');
        }
      });

      if (!this._.parent.isSingle() && Skywatch.keyholder) {
        this._.$content
          .draggable({
            revert: true,
            handle: '.live-overlay-container',
            zIndex: 65535,
            distance: 10,
          })
          .droppable();
      }
      // remove the canvasMax.png image if camera is offline
      // or change the image to the DevGroup.png if camera has a group
      else {
        this._enableSingleView(false, true);
      }
    },

    _enableSingleView: function(enable, back_to_group_image) {
      var $item = this.$el.find('.button-single-view');
      if (enable) {
        $item.removeClass('hidden back');
      } else {
        var has_group = Skywatch.Live.groups.hasCamera(this.model.get('id'));
        if (has_group) {
          $item.addClass('back');
          if (back_to_group_image) {
            $item.attr('src', './images/v2/DevGroupWhite2.png');
          }
        } else {
          $item.addClass('hidden');
        }
      }
    },
  });

  Live.CameraView = Live.DeviceView.extend({
    // temp
    // template: _.template($('#template-camera-view').html()),
    template: () => `<div>
    <div class="live-overlay-container rectangle">
      <div class="seeking-overlay"></div>
      <div class="live-overlay">
        <img class="icon top left icon-service-status" />
        <div class="dropdown">
          <a
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false">
            <div
              class="icon top right icon-settings-menu"
              src="./images/v2/TopSettings.png"></div>
          </a>
          <ul class="dropdown-menu" role="menu">
                <li role="presentation">
                  <a
                    class="button-settings"
                    role="menuitem"
                    href="#">
                    設備設定
                  </a>
                </li>
                <li role="presentation" class="divider"></li>
            <li role="presentation">
              <a class="button-download" role="menuitem" href="#">
                {'$lang.download_video'}
              </a>
            </li>
            <li role="presentation">
              <a
                class="button-download-snapshot"
                role="menuitem"
                href="#">
                下載截圖
              </a>
            </li>
            <li role="presentation" class="divider"></li>
            <li role="presentation">
              <a
                class="button-local-recording"
                role="menuitem"
                href="#">
                本地錄影
              </a>
            </li>
            <li role="presentation">
              <a
                class="button-device-timeline"
                role="menuitem"
                href="#">
                雲端錄影
              </a>
            </li>
            <li role="presentation">
              <a
                class="button-boxe-recording"
                role="menuitem"
                href="#">
                {'$lang.boxe_recording'}
              </a>
            </li>
          </ul>
        </div>
        <div class="icon bottom right button-single-view"></div>
        <div class="overlay-toolbar">
          <div class="icon button-ptz"> </div>
        </div>
        <div class="camera-name-container">
          <div class="camera-name">${Skywatch.Live.cameras.get('47436').get('name', 'device')}</div>
        </div>

      </div>
    </div>
    <div id="container"></div>
  </div>
`,

    events: {
      'click .button-local-recording': '_onLocalRecordingClicked',
      'click .button-device-timeline': '_onDeviceTimelineClicked',
      'click .button-boxe-recording': '_onBoxeRecordingClicked',
      'click .button-download': '_onDownloadClicked',
      'click .button-download-snapshot': '_onDownloadSnapshotClicked',
      'click .button-ptz': '_onPTZControlClicked',
      'click .button-upgrade-firmware': '_onUpgradeFirmwareClicked',
      'click .button-reboot': '_onRebootClicked',
      'click .live-overlay-container': '_onOverlayClicked',
      'mouseenter .live-overlay-container': 'onHover',
      'mouseleave .live-overlay-container': 'onHoverOff',
      'mousedown .ptz-control': '_onPTZMouseDown',
      'mouseup .ptz-control': '_onPTZMouseUp',
    },

    initialize: function(options) {
      // merge parent events
      this.events = _.extend(Live.DeviceView.prototype.events, this.events);
      // call parent constructor
      Live.DeviceView.prototype.initialize.call(this, options);

      this._.parent.listenTo(this, 'cr_changed', this._.parent.onCRChanged);
      this.listenTo(this, 'cr_changed', this._onCRChanged);
      Live.control_bar.listenTo(this, 'tick', Live.control_bar.onPlayerTick);
      Live.control_bar.listenTo(this, 'hole', Live.control_bar.onPlayerHole);
      Live.control_bar.listenTo(this, 'ended', Live.control_bar.onPlayerEnded);
      this.listenTo(Live.control_bar, 'pause', this.pause);
      this.listenTo(this._.parent, 'mute', this.onMute);

      // apply camera-id to div.live_view
      this.$el.attr('id', this.model.id);
    },

    customRender: function() {
      this._renderPlayer();
    },

    onMute: function() {
      var self = this;
      this._.rendering.done(function() {
        if (self._.offline) {
          return;
        }
        self._.frame.Skywatch.Video.mute();
      });
    },

    httpGet: function(url) {
      try {
        $.get(url, function(data) {
          console.log('pre-fetch local archives of NVR');
        });
      } catch (e) {}
    },

    onHover: function() {
      if (this.isEmpty()) {
        return;
      }
      // show meta on control bar
      var self = this;
      this.model.fetchCloudArchives().done(function() {
        Skywatch.Live.control_bar.showMeta(self.model.get('id'));
      });
    },

    onHoverOff: function() {
      if (this.isEmpty()) {
        return;
      }
      // hide meta on control bar
      Skywatch.Live.control_bar.hideMeta();
    },

    customOnFocus: function() {
      console.log(
        'customOnFocus',
        'seek',
        new Date(Skywatch.Live.control_bar.currentTime() * 1000),
      );
      this.seek(Skywatch.Live.control_bar.currentTime());
      this._playOrPause();
    },

    play: function(isMute) {
      if (this.isEmpty()) {
        return this;
      }

      var self = this;
      this._.rendering.done(function() {
        if (!self._shouldUseArchive() && self.isOffline()) {
          return;
        }
        // temp
        // self._.frame.Skywatch.Video.play(isMute);
        Skywatch.Video.play(isMute);
      });
      return this;
    },

    pause: function() {
      if (this.isEmpty()) {
        return this;
      }

      var self = this;
      this._.rendering.done(function() {
        if (!self._shouldUseArchive() && self.isOffline()) {
          return;
        }
        // temp
        // self._.frame.Skywatch.Video.pause();
        Skywatch.Video.pause();
      });

      return this;
    },

    seek: function(timestamp) {
      if (this.isEmpty()) {
        return this;
      }
      var self = this;

      this._.rendering.done(function() {
        self._seek(timestamp);
      });

      return this;
    },

    fullscreen: function() {
      if (this.isEmpty()) {
        return this;
      }

      var self = this;
      this._.rendering.done(function() {
        if (!self._shouldUseArchive() && self.isOffline()) {
          return;
        }
        self._.frame.Skywatch.Video.fullscreen();
      });

      return this;
    },

    getNextEdge: function() {
      return this._.next_archive ? this._.next_archive.get('timestamp') * 1 : 0;
    },

    isEnded: function() {
      return !this._.current_archive;
    },

    isCloudArchiveVisible: function() {
      return this._.show_cloud_archive;
    },

    isLocalArchiveVisible: function() {
      return this._.show_local_archive;
    },

    isLocalBackupVisible: function() {
      return this._.show_local_backup;
    },

    _onVideoEnded: function() {
      console.info('_onVideoEnded');
      var data = this.model.getNextPlaybackArchive(
        this._.current_archive,
        Live.control_bar.isFastForward(),
      );
      if (data.status === 'end') {
        console.info('no archive');
        this._.current_archive = null;
        this._.next_archive = null;
        // let control bar decide what should do
        this.trigger('ended');
      } else if (data.status === 'hole') {
        console.info('player.hole');
        this.pause();
        this._.next_archive = data.archive;
        this.trigger('hole');
      } else if (data.status === 'ok') {
        console.info('player.ok');
        var archive = data.archive;
        this._.current_archive = archive;
        this._.next_archive = null;

        var camera_id = this.model.id;

        Live.control_bar.highlight(
          parseInt(archive.get('timestamp')),
          parseInt(archive.get('timestamp')) + parseInt(archive.get('length')),
        );
        var self = this;
        // load next file
        archive.fetchURL(Live.control_bar.isFastForward()).done(function(url) {
          // temp
          // self._.frame.Skywatch.Video.source(url, camera_id).done(function() {
          //   self._.frame.Skywatch.Video.seek(0);
          // });
          Skywatch.Video.source(url, camera_id).done(function() {
            Skywatch.Video.seek(0);
          });
          if (Live.control_bar.isFastForward()) {
            // if fastforward, touch the next link so server can compute the next
            var data = self.model.getNextPlaybackArchive(
              archive,
              Live.control_bar.isFastForward(),
            );
            if (data.archive) {
              data.archive.fetchURL(Live.control_bar.isFastForward());
            }
          }
        });
      }
    },

    _onVideoTick: function(video_time) {
      if (!this._.current_archive || this._.next_archive) {
        return;
      }
      var timestamp;
      if (Live.control_bar.state() === 'fastforward') {
        // smart ff need to update timestamp frequently
        if (this._.tick_counter === 0) {
          // video timestamp will not immediately update to seeked time
          // so we need to filter out 0
          if (video_time !== 0 && !this._.seeking) {
            timestamp = this._.current_archive.getSmartFFTimestamp(video_time);
            this.trigger('tick', this, timestamp);
          }
        }
        // report every 1 seconds
        this._.tick_counter = (this._.tick_counter + 1) % 4;
      } else {
        if (this._.tick_counter === 0) {
          timestamp =
            parseInt(this._.current_archive.get('timestamp'), 10) +
            Math.floor(video_time);
          this.trigger('tick', this, timestamp);
        }
        // report every 5 seconds
        this._.tick_counter = (this._.tick_counter + 1) % (4 * 5);
      }
    },

    _shouldGoLive: function(timestamp) {
      if (timestamp < 1) {
        return true;
      }

      var now = new Date();
      var delta = Math.floor(now.getTime() / 1000) - timestamp;
      return delta < 30;
    },

    _shouldUseCache: function(timestamp) {
      return (
        this.model.getCacheTime() > 0 && this.model.getCacheTime() <= timestamp
      );
    },

    _shouldUseArchive: function(timestamp) {
      timestamp =
        typeof timestamp === 'undefined'
          ? Skywatch.Live.control_bar.currentTime()
          : timestamp;
      return !this._shouldGoLive(timestamp) && !this._shouldUseCache(timestamp);
    },

    _playOrPause: function() {
      // check global playback mode
      var state = Skywatch.Live.control_bar.state();
      var mute = Skywatch.Live.control_bar.model.get('mute');
      console.info('play|pause', state);
      if (state == 'normal' || state == 'fastforward') {
        this.play(mute);
      } else if (state == 'pause') {
        this.pause();
      }
      this.$el.find('.live-overlay-container').removeClass('seeking');
    },

    // precondition: iframe is ready
    _goLive: function() {
      Skywatch.Live.control_bar.setLiveButtonActive(true);
      this._enableDownload(false);
      this._enablePTControl(true);
      this._.current_archive = null;

      var self = this;
      // temp
      // var live_deferred = this._.frame.Skywatch.Video.live(
      //   this.model.get('id'),
      // );
      var live_deferred = Skywatch.Video.live(this.model.get('id'));
      var status_deferred = $.Deferred();
      this._enableSingleView(!self._.parent.isSingle());
      this.model.fetchStatus().done(function(data) {
        data = data.replace(/<script.*script>/, '');
        data = JSON.parse(data);

        self._.offline = data.cameraStatusCode !== 'online';
        self._.wrong_password = data.wrong_password == '1';

        self._enableFirmwareUpgrade(JSON.parse(data.firmwareUpgradeAvailable));
        self._enableRebootCamera(JSON.parse(data.rebootAvailable));
        self._updateServiceStatus(data.cameraServiceImage);

        if (self._.wrong_password) {
          status_deferred.reject('wrong_password');
        } else {
          if (self._.offline) {
            status_deferred.reject();
          } else {
            status_deferred.resolve();
          }
        }

        self._.show_local_archive =
          self._.show_local_archive && data.recover_from_sd == '0';

        if (self._.show_local_archive) {
          self.$el
            .find('.button-local-recording')
            .parent()
            .removeClass('disabled');
        } else {
          self.$el
            .find('.button-local-recording')
            .parent()
            .addClass('disabled');
        }
      });

      $.when(live_deferred, status_deferred)
        .done(function() {
          self._playOrPause();
        })
        .fail(function(reason) {
          if (reason == 'wrong_password') {
            return self._renderWrongPassword();
          }
          // that means this is offline
          if (self._.frame.Skywatch.Video.isLocal()) {
            // but local is alive!
            console.info('no wan');
            self.$el.find('.live-overlay-container').removeClass('seeking');
            self._playOrPause();
          } else {
            // render as offline
            self._.rendering = $.Deferred();
            self._renderOffline();
          }
        });
      Live.control_bar.highlight(false);
    },

    _seek: function(timestamp) {
      var self = this;
      self.$el.find('.live-overlay-container').addClass('seeking');
      var camera_id = this.model.id;

      // check if live
      if (this._shouldGoLive(timestamp)) {
        console.info('live');
        this._goLive();
        return;
      }

      Skywatch.Live.control_bar.setLiveButtonActive(false);

      // check if use cache
      if (this._shouldUseCache(timestamp)) {
        console.info('cache');
        this._enableDownload(false);
        this._enablePTControl(false);
        this._.current_archive = null;
        this._.frame.Skywatch.Video.cache(this.model.get('id'), timestamp)
          .done(function() {
            timestamp = Math.floor(timestamp - self.model.getCacheTime());
            self._.frame.Skywatch.Video.seek(timestamp);
            self._playOrPause();
          })
          .fail(function() {
            self._.frame.Skywatch.Video.empty(camera_id);
          });
        return;
      }

      this._.$frame.removeClass('hidden');
      this._.$content
        .find('> img.camera-view')
        .first()
        .addClass('hidden');
      this._.$content
        .find('.offline')
        .first()
        .addClass('hidden');
      var use_local = this.model.get('model_id') == '61';
      var archive;
      var archive_prefetch;
      if (use_local) {
        var now = Math.floor(new Date().getTime() / 1000);
        archive = this.model.getLocalArchive(timestamp);

        //check if timestamp + 60 is valid
        if (timestamp + 60 < now) {
          archive_prefetch = this.model.getLocalArchive(timestamp + 60);
        }
      } else {
        archive = this.model.getCloudArchive(timestamp);
      }
      // if curcor was put into empty gap, go to live
      if (archive == -1) {
        this._goLive();
        return;
      }

      if (!archive) {
        this._.frame.Skywatch.Video.empty(camera_id);
        this.$el.find('.live-overlay-container').removeClass('seeking');
        return;
      }

      // if current archive is not matched
      if (Live.control_bar.isFastForward() && !archive.fastforwardAvailable()) {
        var data = self.model.getNextPlaybackArchive(
          archive,
          Live.control_bar.isFastForward(),
        );
        if (!data.archive) {
          // TODO go live?
          return;
        }
        archive = data.archive;
      }

      // high-light the playing archive
      Live.control_bar.highlight(
        parseInt(archive.get('timestamp')),
        parseInt(archive.get('timestamp')) + parseInt(archive.get('length')),
      );

      if (timestamp < parseInt(archive.get('timestamp'))) {
        timestamp = parseInt(archive.get('timestamp'));
        Live.control_bar._updateCurrentTime(timestamp);
      }
      if (this._.next_archive && archive === this._.next_archive) {
        this._.next_archive = null;
      }
      // disable previous seeking request
      if (this._.current_archive) {
        this._.current_archive.cancelURLFetching();
      }
      // pause video until seeking complete
      this.pause();
      // update to current archive
      this._.current_archive = archive;
      this._enableDownload(true);
      this._enablePTControl(false);
      console.info('cloud archive', archive.get('id'));

      // combine url and timestamp
      timestamp = archive.toArchiveTime(
        timestamp,
        Live.control_bar.isFastForward(),
      );
      console.info('video.time', timestamp);
      this._.seeking = true;
      // temp
      // if (self._.frame.Skywatch) {
      //   archive.fetchURL(Live.control_bar.isFastForward()).done(function(url) {
      //     self._.frame.Skywatch.Video.source(url, camera_id).done(function() {
      //       self._.frame.Skywatch.Video.seek(timestamp);
      //       self._playOrPause();
      //       self._.seeking = false;
      //     });

      if (Skywatch) {
        archive.fetchURL(Live.control_bar.isFastForward()).done(function(url) {
          Skywatch.Video.source(url, camera_id).done(function() {
            Skywatch.Video.seek(timestamp);
            self._playOrPause();
            self._.seeking = false;
          });
          // if fastforward, touch the next link so server can compute the next
          if (Live.control_bar.isFastForward()) {
            var data = self.model.getNextPlaybackArchive(
              archive,
              Live.control_bar.isFastForward(),
            );
            if (data.archive) {
              data.archive.fetchURL(Live.control_bar.isFastForward());
            }
          }
        });
        // for nvr camera pre-fetch local archives
        if (use_local && archive_prefetch) {
          var self = this;
          archive_prefetch
            .fetchURL(Live.control_bar.isFastForward())
            .done(function(url) {
              self.httpGet(url);
              console.info('prefetch local archives done');
            });
        }
      }
    },

    _onLocalRecordingClicked: function(event) {
      event.preventDefault();
      if (
        $(event.currentTarget)
          .parent()
          .hasClass('disabled')
      ) {
        return;
      }
      //Skywatch.Setting.local_recording.show(this.model.get('id'));
      Skywatch.Archives.LocalArchivesShow(this.model.get('id'));
    },
    _onDeviceTimelineClicked: function(event) {
      event.preventDefault();
      if (
        $(event.currentTarget)
          .parent()
          .hasClass('disabled')
      ) {
        return;
      }
      //Skywatch.Setting.device_timeline.show(this.model.get('id'));
      Skywatch.Archives.DeviceTimelineShow(this.model.get('id'));
    },
    _onBoxeRecordingClicked: function(event) {
      event.preventDefault();
      if (
        $(event.currentTarget)
          .parent()
          .hasClass('disabled')
      ) {
        return;
      }
      //Skywatch.Setting.boxe_recording.show(this.model.get('id'));
      Skywatch.Archives.BoxeRecordingShow(this.model.get('id'));
    },

    _onDownloadClicked: function(event) {
      event.preventDefault();
      if (!this._.current_archive) {
        return;
      }
      if (amplitude) {
        amplitude.getInstance().logEvent('Download_ControlBarCurrentArchive');
      }
      this._.current_archive
        .fetchURL(Live.control_bar.isFastForward())
        .done(function(url) {
          window.location.href = url;
        });
    },

    _onDownloadSnapshotClicked: function(event) {
      // temp 
      const amplitude = false
      event.preventDefault();
      if (amplitude) {
        amplitude.getInstance().logEvent('Trigger_CaptureSnapshot');
      }
      var url = _.template('api/v2/cameras/<%= id %>/thumbnail?scope=download');
      window.location.href = url({
        id: this.model.get('id'),
        // api_key: $.cookie('api_key'),
      });
    },

    _onPTZControlClicked: function(event) {
      var $el = $(event.target)
        .parents('.live-overlay-container')
        .find('.ptz-panel');
      if ($el.is(':visible')) {
        $el.hide();
        return;
      }
      var self = this;
      // init ptz
      var options = ['tilt_up', 'tilt_down', 'pan_left', 'pan_right', 'home'];
      var i;
      var content = '<div>';
      for (i = 0; i < options.length; i++) {
        if (options[i] == 'home') {
          content += '<div class="ptz-control ptz-control-' + options[i] + '">';
          content += '</div>';
        } else {
          content += '<div class="ptz-control ptz-control-' + options[i] + '">';
          content += '</div>';
        }
      }
      content += '</div>';
      $el.html(content);
      $el.show();

      $el.on('click', '.ptz-control', function() {
        var command = false;
        if ($(this).hasClass('ptz-control-tilt_up')) {
          command = 'tilt_up';
        } else if ($(this).hasClass('ptz-control-tilt_down')) {
          command = 'tilt_down';
        } else if ($(this).hasClass('ptz-control-pan_left')) {
          command = 'pan_left';
        } else if ($(this).hasClass('ptz-control-pan_right')) {
          command = 'pan_right';
        } else if ($(this).hasClass('ptz-control-home')) {
          command = 'home';
        }

        if (command !== false) {
          var params = {
            // api_key: $.cookie('api_key'),
            command: command,
          };
          $.post(
            'api/v2/cameras/' + self.model.get('id') + '/ptzcontrol',
            params,
            function(flag) {
              flag = flag.replace(/<script.*script>/, '');
            },
          );
        }
      });
    },
    _onUpgradeFirmwareClicked: function(event) {
      event.preventDefault();

      var $item = this.$el.find('.button-upgrade-firmware').parent();
      if ($item.hasClass('disabled')) {
        return;
      }

      // show simple confirm modal
      var camera = this.model.attributes;
      var content = _.template($('#template-upgrade-firmware').html())(camera);
      var $modal = $(
        _.template($('#template-simple-modal').html())({content: content}),
      );
      $modal.on('click', '.confirm', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).button('loading');
        // upgrade
        var params = {
          // api_key: $.cookie('api_key')
        };
        $.post('api/v2/cameras/' + camera.id + '/upgrade', params)
          .done(function() {
            $modal.modal('hide');
          })
          .fail(function() {
            content = _.template($('#template-upgrade-firmware-fail').html())(
              camera,
            );
            $modal.find('.modal-body').html(content);
          });
      });

      $('body').append($modal);
      $modal.modal('show');
    },

    _onRebootClicked: function(event) {
      event.preventDefault();
      var camera = this.model.attributes;
      var content = _.template($('#template-reboot').html())(camera);
      var $modal = $(
        _.template($('#template-simple-modal').html())({content: content}),
      );
      $modal.on('click', '.confirm', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).button('loading');
        // reboot
        var params = {
          // api_key: $.cookie('api_key')
        };
        $.post('api/v2/cameras/' + camera.id + '/reboot', params)
          .done(function() {
            $modal.modal('hide');
          })
          .fail(function() {
            content = _.template($('#template-reboot-fail').html())(camera);
            $modal.find('.modal-body').html(content);
          });
      });

      $('body').append($modal);
      $modal.modal('show');
    },

    _onOverlayClicked: function(event) {
      if (Skywatch.Live.camera_grid.isSingle()) {
        return;
      }
      var $self = $(event.target);
      if (!$self.hasClass('live-overlay-container')) {
        $self = $self.parents('.live-overlay-container');
      }
      if (!$self.hasClass('live-overlay-container')) {
        return;
      }

      Skywatch.Live.camera_grid.activate(
        $self.hasClass('active') ? 0 : this.model.get('id'),
      );
    },

    _onCRChanged: function() {
      var menu = this._.$overlay.find('.button-device-timeline').parent();
      if (this.isCloudArchiveVisible()) {
        menu.removeClass('disabled');
      } else {
        menu.addClass('disabled');
      }

      menu = this._.$overlay.find('.button-boxe-recording').parent();
      if (this.isLocalBackupVisible()) {
        menu.show();
      } else {
        menu.hide();
      }
      menu = this._.$overlay.find('.button-local-recording').parent();
      if (this.isLocalArchiveVisible()) {
        menu.removeClass('disabled');
      } else {
        menu.addClass('disabled');
      }
    },
    getBrowser: function() {
      var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      var isChrome = !!window.chrome && !isOpera;
      var isSafari =
        navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && !isChrome;
      var isFirefox = typeof InstallTrigger !== 'undefined';
      var isIE = /*@cc_on!@*/ false || !!document.documentMode;
      if (isOpera) return 'opera';
      if (isChrome) return 'chrome';
      if (isSafari) return 'safari';
      if (isFirefox) return 'firefox';
      if (isIE) return 'ie';
      return 'unknown';
    },
    _isFlashAvailable: function() {
      var flashAvailable = false;
      try {
        var flash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (flash) {
          flashAvailable = true;
        }
      } catch (e) {
        if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) {
          flashAvailable = true;
        }
      }
      return flashAvailable;
    },
    _renderPlayer: function() {
      console.info('render.player');
      this.listenTo(Skywatch.Live.control_bar, 'seek', this.seek);
      this.listenTo(Skywatch.Live.control_bar, 'play', this.play);
      this.listenTo(Skywatch.Live.control_bar, 'pause', this.pause);
      this.listenTo(Skywatch.Live.control_bar, 'fastforward', this.fastforward);

      var self = this;
      var inner_deferred = $.Deferred();
      // temp
      self.listenTo(
        Skywatch.Video.events,
        'ended',
        self._onVideoEnded,
      );
      // on player tick
      self.listenTo(
        Skywatch.Video.events,
        'tick',
        self._onVideoTick,
      );
      // on player stuck
      self.listenTo(
        Skywatch.Video.events,
        'stuck',
        self._playOrPause,
      );
      inner_deferred.resolve();

      // temp
      // this._.$frame.load(function() {
      //   self._.frame = this.contentWindow;

      //   // on archive ended
      //   self.listenTo(
      //     // temp
      //     // self._.frame.Skywatch.Video.events,
      //     Skywatch.Video.events,
      //     'ended',
      //     self._onVideoEnded,
      //   );
      //   // on player tick
      //   self.listenTo(
      //     // temp
      //     // self._.frame.Skywatch.Video.events,
      //     Skywatch.Video.events,
      //     'tick',
      //     self._onVideoTick,
      //   );
      //   // on player stuck
      //   self.listenTo(
      //     // temp
      //     // self._.frame.Skywatch.Video.events,
      //     Skywatch.Video.events,
      //     'stuck',
      //     self._playOrPause,
      //   );

      //   // done
      //   inner_deferred.resolve();
      // });

      var info_deferred = this.model.fetchInfo().done(function(data) {
        data = data.replace(/<script.*script>/, '');
        data = JSON.parse(data);
        if (data.ptz_available != 1) {
          self.$el.find('.button-ptz').css('visibility', 'hidden');
        }
        self._.show_cloud_archive = data.cloud_archive_show_available == 1;
        self._.show_local_archive = data.local_archive_show_available == 1;
        self._.show_local_backup = data.local_backup_show_available == 1;
        self.trigger('cr_changed');
      });

      $.when(inner_deferred, info_deferred).done(function() {
        self._.rendering.resolve();
      });

      // make draggable if not single for read-only
      if (!this._.parent.isSingle() && Skywatch.keyholder) {
        this._.$content
          .draggable({
            revert: true,
            handle: '.live-overlay-container',
            zIndex: 65535,
            distance: 10,
          })
          .droppable();
      }
    },

    _enableDownload: function(enable) {
      var $item = this.$el.find('.button-download').parent();
      if (enable) {
        $item.removeClass('hidden');
      } else {
        $item.addClass('hidden');
      }
      this._enableDownloadSnapshot(!enable);
    },

    _enableFirmwareUpgrade: function(enable) {
      var $item = this.$el.find('.button-upgrade-firmware').parent();
      if (enable) {
        $item.removeClass('hidden');
      } else {
        $item.addClass('hidden');
      }
    },

    _enableRebootCamera: function(enable) {
      var $item = this.$el.find('.button-reboot').parent();
      if (enable) {
        $item.removeClass('hidden');
      } else {
        $item.addClass('hidden');
      }
    },

    _updateServiceStatus: function(image_path) {
      var $el = this.$el.find('.icon-service-status');
      if (image_path.length == 0) {
        $el.hide();
      } else {
        $el.attr('src', image_path);
        $el.show();
      }
    },

    _enablePTControl: function(enable) {
      var $ptz = this.$el.find('.icon.button-ptz').first();
      if (enable) {
        $ptz.removeClass('hidden');
      } else {
        $ptz.addClass('hidden');
      }
    },

    _enableDownloadSnapshot: function(enable) {
      var $item = this.$el.find('.button-download-snapshot').parent();
      if (enable) {
        $item.removeClass('hidden');
      } else {
        $item.addClass('hidden');
      }
    },
  });

  Live.SensorView = Live.DeviceView.extend({
    template: _.template($('#template-sensor-view').html()),
    customRender: function() {
      var self = this;
      this._.$frame.load(function() {
        self._.frame = this.contentWindow;

        // // on archive ended
        // self.listenTo(self._.frame.Skywatch.Video.events, 'ended', self._onVideoEnded);
        // // on player tick
        // self.listenTo(self._.frame.Skywatch.Video.events, 'tick', self._onVideoTick);
        // // on player stuck
        // self.listenTo(self._.frame.Skywatch.Video.events, 'stuck', self._playOrPause);

        // done
        self._.rendering.resolve();
      });
    },
  });
};
