/* eslint-disable */
// prettier-ignore
// import '../lib/backbone/backbone-min.js';
import 'backbone'
import 'jquery-ui-dist/jquery-ui';

export const view = function() {
  'use strict';

  var Skywatch = (window.Skywatch = window.Skywatch || {});
  if (!Skywatch.Live) {
    Skywatch.Live = {};
  }
  if (!Skywatch.Setting) {
    Skywatch.Setting = {};
  }
  var Live = Skywatch.Live;
  var Setting = Skywatch.Setting;

  Skywatch.View = Backbone.View.extend({
    camera_count_table: {
      view_1x1: 1,
      view_2x2: 4,
      view_3x3: 9,
      view_4x4: 16,
    },
    layout_table: {
      1: 'view_1x1',
      4: 'view_2x2',
      9: 'view_3x3',
      16: 'view_4x4',
    },
    toTimeString: function(timestamp) {
      timestamp = parseInt(timestamp, 10);
      if (timestamp.toString().length == 10) timestamp = timestamp * 1000;
      var $time = new Date(parseInt(timestamp));
      var year = $time.getFullYear();
      var month =
        $time.getMonth() + 1 >= 10
          ? $time.getMonth() + 1
          : '0' + ($time.getMonth() + 1);
      var day = $time.getDate() >= 10 ? $time.getDate() : '0' + $time.getDate();
      var hour =
        $time.getHours() >= 10 ? $time.getHours() : '0' + $time.getHours();
      var minute =
        $time.getMinutes() >= 10
          ? $time.getMinutes()
          : '0' + $time.getMinutes();
      var second =
        $time.getSeconds() >= 10
          ? $time.getSeconds()
          : '0' + $time.getSeconds();

      return (
        year +
        '/' +
        month +
        '/' +
        day +
        ' ' +
        hour +
        ':' +
        minute +
        ':' +
        second
      );
    },

    getTimeData: function(timestamp) {
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

      var hour =
        $time.getHours() >= 10 ? $time.getHours() : '0' + $time.getHours();
      var minute =
        $time.getMinutes() >= 10
          ? $time.getMinutes()
          : '0' + $time.getMinutes();
      var second =
        $time.getSeconds() >= 10
          ? $time.getSeconds()
          : '0' + $time.getSeconds();
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
    },
  });

  // camera list widget, associate with Live.CameraCollection
  Live.CameraListView = Skywatch.View.extend({
    events: {
      drop: '_onDrop',
      dropover: '_onDropOver',
      dropout: '_onDropOut',
      'dropover #scroll-up-area': '_onEnterScrollUp',
      'dropout #scroll-up-area': '_onLeaveScrollUp',
      'dropover #scroll-down-area': '_onEnterScrollDown',
      'dropout #scroll-down-area': '_onLeaveScrollDown',
    },

    initialize: function() {
      // added camera
      this.listenTo(this.model, 'add', this._onCameraAdd);
      // removed camera
      this.listenTo(this.model, 'change:active', this._onCameraActiveChanged);
      // removed shared camera
      this.listenTo(this.model, 'remove', this._onSharedCameraRemoved);

      this._group_model = Live.groups;
      // added group
      this.listenTo(this._group_model, 'add', this._onGroupAdd);
      // removed group
      this.listenTo(this._group_model, 'remove', this._onGroupRemove);

      // groups container
      this._$container = $('#camera-group-container');
      this._$groups_container = $('#group-container');
      this._$cameras_container = $('#camera-container');
      // tab container
      this._$camera_grid_container = $('#camera-grid-container');
      // event helper
      this._$scroll_up = $('#scroll-up-area');
      this._$scroll_down = $('#scroll-down-area');
      // free camera lebel
      this._camera_views = {};

      this.$el.droppable();
      this._$scroll_up.droppable();
      this._$scroll_down.droppable();
    },

    _onActiveChange: function(camera_model, new_value) {
      if (new_value == '0') {
        this._onCameraRemove(camera_model);
      } else {
        this._onCameraAdd(camera_model);
      }
    },

    _onCameraAdd: function(camera_model) {
      if (this._group_model.hasCamera(camera_model.id)) {
        // already belong to a group
        return;
      }

      if (camera_model.get('active') == '1') {
        this._addLabel(camera_model.get('id'));
      }
    },

    _onCameraActiveChanged: function(camera_model, new_value) {
      if (new_value == '1') {
        if (this._group_model.hasCamera(camera_model.id)) {
          // already belong to a group
          return;
        }
        this._addLabel(camera_model.get('id'));
      } else {
        this._removeLabel(camera_model.get('id'));
      }
    },

    _onSharedCameraRemoved: function(camera_model) {
      this._removeLabel(camera_model.get('id'));
    },

    _onGroupAdd: function(group_model) {
      this.listenTo(group_model, 'change:cameras', this._onGroupCamerasChange);
      this.listenTo(group_model, 'destroy', this._onGroupDestroy);

      var group_view = new Live.CameraGroupListView({
        model: group_model,
      });
      group_view.render();

      // find insert position
      var $next = this._$groups_container
        .children()
        .filter(function() {
          var $self = $(this);
          var that_name = $self.data('view').model.get('name');
          var this_name = group_view.model.get('name');
          return that_name > this_name;
        })
        .first();
      if ($next.length <= 0) {
        this._$groups_container.append(group_view.$el);
      } else {
        $next.before(group_view.$el);
      }

      // remove duplicated cameras
      var self = this;
      _.each(group_model.get('cameras'), function(camera) {
        self._removeLabel(camera.id);
      });
    },

    _onGroupRemove: function(group_model) {
      // add released free camera
      var cameras = group_model.get('cameras');
      var self = this;
      _.each(cameras, function(camera) {
        if (camera.id != '0') {
          self._addLabel(camera.id);
        }
      });
    },

    _onGroupCamerasChange: function(model, new_cameras) {
      var self = this;
      var old_cameras = model.previous('cameras');

      // check deleted cameras
      _.each(old_cameras, function(old_camera) {
        if (old_camera.id == '0') {
          return;
        }
        var i = _.findIndex(new_cameras, function(new_camera) {
          return old_camera.id == new_camera.id;
        });
        if (i < 0) {
          // add free camera
          self._addLabel(old_camera.id);
        }
      });

      // check added cameras
      _.each(new_cameras, function(new_camera) {
        if (new_camera.id == '0') {
          return;
        }
        var i = _.findIndex(old_cameras, function(old_camera) {
          return new_camera.id == old_camera.id;
        });
        if (i < 0) {
          // remove free camera
          self._removeLabel(new_camera.id);
        }
      });
    },

    _onGridRemoveCamera: function(camera_id) {
      if (this._group_model.hasCamera(camera_id)) {
        return;
      }
      var view = new Live.CameraLabelView({
        model: this.model.get(camera_id),
      });
      this._$cameras_container.append(view.$el);
    },

    // TODO extract class
    _onDrop: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      if (!drag_view || drag_view.getType() !== 'label') {
        // only handle label
        return;
      }

      var $gc = this._$groups_container;
      var $cc = this._$cameras_container;

      if (this._isMouseIn(event, $gc) || this._isMouseIn(event, $cc)) {
        // dropped on a camera, already handled by other ui
        // don't strong the camera-group-container
        return;
      } else if (!drag_view.getGroup()) {
        // not from a group, nop
        $('#camera-group-container').removeClass('strong');
        return;
      }
      // only handle from group to free area
      $('#drag-helper').remove();

      $('#camera-group-container').removeClass('strong');

      // modify model, also fires event to update CameraCollection
      var group_model = drag_view.getGroup();
      group_model.removeCamera(drag_view.model.get('id'));
      group_model.save();
    },

    // TODO extract class
    _onDropOver: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      if (!drag_view || drag_view.getType() !== 'label') {
        // only handle label
        return;
      }

      var $gc = this._$groups_container;
      var $cc = this._$cameras_container;

      if (this._isMouseIn(event, $gc) || this._isMouseIn(event, $cc)) {
        // dropped on a camera, already handled by other ui
        // don't strong the camera-group-container
        // $('#camera-group-container').removeClass('strong');
        return;
      } else if (!drag_view.getGroup()) {
        // not from a group, nop
        $('#camera-group-container').addClass('strong');
        return;
      }

      $('#camera-group-container').addClass('strong');
    },

    // TODO extract class
    _onDropOut: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      if (!drag_view || drag_view.getType() !== 'label') {
        // only handle label
        return;
      }

      var $gc = this._$groups_container;
      var $cc = this._$cameras_container;

      if (this._isMouseIn(event, $gc)) {
        // dropped on a group, already handled by other ui
        // $('#camera-group-container').addClass('strong');
        return;
      } else if (this._isMouseIn(event, $cc)) {
        // dropped on a camera, already handled by other ui
        // $('#camera-group-container').addClass('strong');
        return;
      } else if (!drag_view.getGroup()) {
        // not from a group, nop
        $('#camera-group-container').removeClass('strong');
        return;
      }

      $('#camera-group-container').removeClass('strong');
    },

    _onEnterScrollUp: function(event, ui) {
      this._startScrollUp();
    },

    _onLeaveScrollUp: function(event, ui) {
      this.stopScrolling();
    },

    _onEnterScrollDown: function(event, ui) {
      this._startScrollDown();
    },

    _onLeaveScrollDown: function(event, ui) {
      this.stopScrolling();
    },

    _startScrollUp: function() {
      this.stopScrolling();
      var self = this;
      this._scroll_timer = setInterval(function() {
        self._$container.scrollTop(self._$container.scrollTop() - 50);
      }, 50);
    },

    _startScrollDown: function() {
      this.stopScrolling();
      var self = this;
      this._scroll_timer = setInterval(function() {
        self._$container.scrollTop(self._$container.scrollTop() + 50);
      }, 50);
    },

    stopScrolling: function() {
      clearInterval(this._scroll_timer);
      this._scroll_timer = 0;
    },

    _isMouseIn: function(event, $el) {
      return (
        event.pageY > $el.offset().top &&
        event.pageY < $el.offset().top + $el.height() &&
        event.pageX > $el.offset().left &&
        event.pageX < $el.offset().left + $el.width()
      );
    },

    _addLabel: function(camera_id) {
      var camera = Live.cameras.get(camera_id);

      if (camera.get('active') == '0') {
        return;
      }

      if (camera.get('device_type') == 'gateway') {
        return;
      }

      if (camera.get('device_type') == 'nvr') {
        return;
      } //for nvr, do not show label

      var view = new Live.CameraLabelView({
        model: camera,
      });

      this._camera_views[camera_id] = view;

      // find insert position
      var $next = this._$cameras_container
        .children()
        .filter(function() {
          var $self = $(this);
          var that_name = $self.data('view').model.get('name');
          var this_name = view.model.get('name');
          return that_name > this_name;
        })
        .first();

      if ($next.length <= 0) {
        this._$cameras_container.append(view.$el);
      } else {
        $next.before(view.$el);
      }
    },

    _removeLabel: function(camera_id) {
      var view = this._camera_views[camera_id];
      if (!view) {
        return;
      }

      var active_loss = view.$el.hasClass('active');

      view.remove();
      delete this._camera_views[camea_id];

      if (active_loss) {
        // TODO trigger event?
        Live.camera_list.activate();
      }
    },

    getActiveGroupId: function() {
      var $group = this._$groups_container.find('.group-name.active');
      if ($group && $group.attr('id')) {
        return $group.attr('id').replace('group-', '') || null;
      }
      return null;
    },

    getActiveCameraId: function() {
      var $camera = this._$cameras_container.find('.device-item.active');
      if ($camera.length === 0) {
        $camera = this._$groups_container
          .find('.group-name.active')
          .next()
          .find('.device-item.active');
      }
      if ($camera && $camera.attr('id')) {
        return (
          $camera
            .attr('id')
            .replace('group-', '')
            .replace('device-', '') || null
        );
      }
      return null;
    },

    // if id is undefined, activate first tab
    activate: function(id, is_group) {
      // if no active camera, reset UI
      if (Skywatch.Live.cameras.getCameraCount() === 0) {
        Skywatch.Live.camera_grid.reset();
        Skywatch.Live.control_bar.reset();
        return;
      }

      var $group;
      if (typeof id === 'undefined') {
        // check cookie
        var last_playing = $.cookie('playing_status');
        var playing_status = false;
        if ($('.menu-container .menu-tab:not(#group-tab).active').length > 0) {
          return;
        }
        try {
          playing_status = JSON.parse(last_playing);
          if (
            typeof playing_status.type != 'undefined' &&
            typeof playing_status.id != 'undefined'
          ) {
            var type = playing_status.type;
            var subgroup = playing_status.subgroup || false;
            id = playing_status.id;
            if (type == 'camera') {
              // check element exists
              var $camera = $('#device-' + id);
              if ($camera.length > 0) {
                // check in group
                if ($camera.parents('.group-content').length > 0) {
                  var control_by = $camera
                    .parents('.group-content')
                    .attr('control-by');
                  $('#' + control_by).trigger('click');
                }
                $('#device-' + id).trigger('click');
              } else {
                // reset status and activate first
                playing_status = false;
              }
            } else {
              var el = 'group-' + id;
              var $el = $('#' + el);
              if ($el.length > 0) {
                $el.trigger('click');

                if (subgroup) {
                  var $title = $el.next().find('.title-' + subgroup);
                  if ($title.length > 0) {
                    $title.trigger('click');
                  }
                }
              } else {
                // reset status and activate first
                playing_status = false;
              }
            }
          }
        } catch (e) {}

        if (playing_status === false) {
          var $groups = this._$groups_container.children();

          if ($groups.length > 0) {
            // group first
            $group = $groups.first();
            $group
              .find('.group-name')
              .first()
              .click();
            return;
          } else {
            // find first camera
            $groups = this._$cameras_container.children();
            $group = $groups.first();
            $group.click();
          }
        }
      } else if (id instanceof jQuery) {
        var $new = id;
        var $old;
        // get current active
        if ($new.hasClass('group-name')) {
          $old = this.$el.find('.sidebar-item.active').first();
        } else {
          $old = $new
            .parent()
            .find('.sidebar-item.active')
            .first();
        }

        // if this item is invisible, activate the next item
        if ($new.hasClass('hide')) {
          $new = $new.next();
        }

        $old.removeClass('active');
        $new.addClass('active');
      } else if (!is_group) {
        // camera id?
        var $camera = this.$el.find('.device-item').filter(function() {
          return $(this).data('id') == id;
        });
        $camera.click();
      } else {
        // group id
        $group = this._$groups_container.find('.group-area').filter(function() {
          return (
            $(this)
              .find('.group-name')
              .attr('id') ==
            'group-' + id
          );
        });

        // check original device type
        if ($group.find('.device-item.active').length > 0) {
          if (
            $group
              .find('.device-item.active')
              .first()
              .attr('device-type') == 'sensor'
          ) {
            $group
              .find('.title-gateway')
              .first()
              .click();
          } else {
            $group
              .find('.title-camera')
              .first()
              .click();
          }
        } else {
          $group
            .find('.title-camera')
            .first()
            .click();
        }
      }
    },

    // only show matched cameras
    filter: function(pattern) {
      this.trigger('filter', pattern);
    },
  });

  Live.CameraGroupListView = Skywatch.View.extend({
    template: _.template($('#template-group-area').html()),
    events: {
      'click .expand': '_onExpandClick',
      'click .group-name': '_onClick',
      'mousedown .delete-group': '_onDeleteGroupClick',
      'drop .group-area': '_onDrop',
      'dropover .group-area': '_onDropOver',
      'dropout .group-area': '_onDropOut',
      'dblclick .group-name .camera-item-title-read': '_onEditTitle',
      'blur .group-name .camera-item-title-write': '_onEditTitleComplete',
      'keydown .group-name .camera-item-title-write': '_onEditTitleKeyDown',
      'dblclick .group-name .camera-item-title-write':
        '_onEditTitleDbClickDown',
      'shown.bs.collapse': '_onGroupCollapseShow',
      'hidden.bs.collapse': '_onGroupCollapseHide',
    },

    initialize: function() {
      this._camera_views = {};
      this._$ul = null;
      this._$title = null;

      this.listenTo(this.model, 'change:name', this._onNameChange);
      this.listenTo(this.model, 'change:cameras', this._onCamerasChange);
      this.listenTo(this.model, 'change:id', this._onIdChange);
      this.listenTo(this.model, 'destroy', this._onGroupDestroy);

      this.listenTo(Live.camera_list, 'filter', this._onFilter);
    },

    render: function() {
      var $group = $(this.template(this.model.attributes));
      $group.find('[data-toggle="tooltip"]').tooltip();
      this.$el.append($group);
      this._$ul = $group.find('.group-content').first();
      this._$title = $group.find('.camera-item-title-read');
      this.$el.data('view', this);

      var self = this;
      var camera_title_inserted = false;
      var gateway_title_inserted = false;
      var cameras = _.filter(this.model.attributes.cameras, function(camera) {
        return camera.id != '0';
      });
      // create list ui
      // group cameras first
      var sensor_devices = _.filter(cameras, function(camera) {
        return (
          camera.device_type == 'sensor' || camera.device_type == 'smart_sense'
        );
      });

      var camera_devices = _.filter(cameras, function(camera) {
        return camera.device_type == 'camera';
      });

      var total_device = camera_devices.length + sensor_devices.length;

      if (sensor_devices.length > 0) {
        self._addReadOnlyLabal(
          'access',
          Skywatch.lang.group_title_access,
          total_device > 0,
        );
      }

      if (camera_devices.length > 0) {
        self._addReadOnlyLabal(
          'camera',
          Skywatch.lang.group_title_cameras,
          total_device > 1,
        );
        _.each(camera_devices, function(camera) {
          self._addLabel(camera.id);
        });
      }

      if (sensor_devices.length > 0) {
        self._addReadOnlyLabal(
          'gateway',
          Skywatch.lang.group_title_gateway,
          total_device > 1,
        );
        _.each(sensor_devices, function(camera) {
          self._addLabel(camera.id);
        });
      }

      // make droppable
      $group.droppable();

      return this;
    },

    expand: function() {
      var $body = this.$el.find('.collapse').first();
      $body.collapse('show');
    },
    _onExpandClick: function(e) {
      // HACK: should not activate group when clicking expand
      e.stopPropagation();
      $($(e.target).attr('data-target')).collapse('toggle');
    },
    _onClick: function(e, force_do) {
      force_do = force_do || false;
      if (!$('#group-tab').hasClass('active')) {
        $('#group-tab').trigger('click');
      }
      var active_group_id = Live.camera_list.getActiveGroupId();
      if (active_group_id == this.model.get('id') && !force_do) {
        return;
      }

      var $sidebar = $('#camera-group-container');
      var $this = $(e.target);
      if (!$this.hasClass('group-name')) {
        $this = $this.parents('.group-name');
      }
      if ($this.hasClass('active')) {
        $sidebar.find('.group-content').removeClass('active');
        $sidebar.find('.group-content').css('max-height', 0);
        $this.removeClass('active');
      } else {
        $sidebar.find('.group-name').removeClass('active');
        $sidebar.find('.group-content').removeClass('active');
        $sidebar.find('.group-content .active').removeClass('active');
        $sidebar.find('.group-content').css('max-height', 0);
        $this.addClass('active');
        var $group_content = $sidebar.find(
          '#group-' + $this.attr('id').replace('group-', '') + '-body',
        );
        $group_content.addClass('active');
        $group_content.css('max-height', $group_content.children().length * 40);

        // find active child
        if ($group_content.find('.sidebar-item.active').length === 0) {
          // activate first
          // $group_content.find('.sidebar-item').first().addClass('active');
          $group_content
            .find('.sidebar-item')
            .first()
            .trigger('click');
        }
        if (!$('#group-tab').hasClass('active')) {
          $('#group-tab').trigger('click');
        }

        // deactive camera item
        $('#camera-container')
          .find('.device-item.active')
          .removeClass('active');
        var type;
        if (
          $group_content
            .children()
            .first()
            .hasClass('title-camera')
        )
          type = 'camera';
        else if (
          $group_content
            .children()
            .first()
            .hasClass('title-gateway')
        )
          type = 'sensor';
        else if (
          $group_content
            .children()
            .first()
            .hasClass('title-access')
        )
          type = 'access';
        else type = 'empty';
        Live.camera_grid.setGroup(this.model.get('id'), type);
      }

      // if only one device
      if ($this.parent().find('.group-content .device-item').length === 1) {
        // if the device is sensor, click accessList
        if (
          $this
            .parent()
            .find('.group-content .device-item')
            .first()
            .attr('device-type') === 'sensor'
        ) {
          $this
            .parent()
            .find('.group-content .title-access')
            .trigger('click');
        } else {
          // click the device
          $this
            .parent()
            .find('.group-content .device-item')
            .trigger('click');
        }
      }
    },
    _onDeleteGroupClick: function(e) {
      var self = this;
      var group_name = $(e.target)
        .parents('.sidebar-item')
        .find('.camera-item-title-read')
        .text();
      swal(
        {
          title: Skywatch.lang.delete_group,
          text: Skywatch.lang.delete_group_text.replace(
            '%GroupName%',
            group_name,
          ),
          html: true,
          animation: false,
          closeOnConfirm: true,
          closeOnCancel: true,
          showCancelButton: true,
          confirmButtonColor: '#DC0000',
          confirmButtonText: Skywatch.lang.do_it_anyway,
          cancelButtonText: Skywatch.lang.cancel,
        },
        function(isConfirm) {
          if (isConfirm) {
            var group_id = self.model.get('id');
            if (Live.groups.get(group_id)) {
              Live.groups.get(group_id).destroy();
            }
          }
        },
      );
    },

    // TODO extract class
    _onDrop: function(event, ui) {
      // do not disturbe parent elements
      event.stopPropagation();

      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      if (!drag_view || drag_view.getType() !== 'label') {
        return;
      }

      if (drag_view.getGroup()) {
        if (drag_view.getGroup().get('id') == this.model.get('id')) {
          // in same group
          console.info('group', 'same group');
          return;
        } else {
          // remove from the group;
          drag_view.getGroup().removeCamera(drag_view.model.get('id'));
          $('#camera-group-container').removeClass('strong');
        }
      } else {
        // add to group

        this.$el.removeClass('strong');

        if (this.model.isFull()) {
          // group is full, do nothing
          return;
        }
        // modify model, also fires event to update CameraCollection
        this.model.addCamera(drag_view.model.get('id'));
      }

      $('#drag-helper').remove();

      // other group may delete duplicated cameras
      Live.groups
        .chain()
        .filter(function(group) {
          return group.hasChanged();
        })
        .each(function(group) {
          group.save();
        });

      // post check for readonly title visibility
      $('#group-container')
        .find('.group-content')
        .each(function() {
          var $el = $(this);

          if ($el.find('div[device-type="sensor"]').length === 0) {
            $el.find('.title-access').addClass('hide');
          } else {
            $el.find('.title-access').removeClass('hide');
          }

          if ($el.find('.device-item').length <= 1) {
            $el.find('.title-camera').addClass('hide');
            $el.find('.title-gateway').addClass('hide');
          } else if ($el.find('div[device-type="camera"]').length > 0) {
            $el.find('.title-camera').removeClass('hide');
          } else if ($el.find('div[device-type="sensor"]').length > 0) {
            $el.find('.title-gateway').removeClass('hide');
          }
        });
    },

    // TODO extract class
    _onDropOver: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      // only accept label
      if (!drag_view || drag_view.getType() !== 'label') {
        return;
      }
      // don't handle labels from other groups
      if (drag_view.getGroup()) {
        if (drag_view.getGroup().get('id') != this.model.get('id')) {
          $('#camera-group-container').addClass('strong');
        }
        return;
      }

      // HACK force remove border
      setTimeout(function() {
        $('#camera-group-container').removeClass('strong');
      }, 10);

      this.$el.addClass('strong');
    },

    // TODO extract class
    _onDropOut: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      // only accept label
      if (!drag_view || drag_view.getType() !== 'label') {
        return;
      }
      // don't handle labels from other groups
      if (drag_view.getGroup()) {
        if (drag_view.getGroup().get('id') != this.model.get('id')) {
          $('#camera-group-container').removeClass('strong');
        }
        return;
      }

      this.$el.removeClass('strong');
    },

    _onNameChange: function(model, new_name) {
      if (new_name) {
        this._$title.html(new_name);
        this._$title.attr('title', new_name);
      }
    },

    _onCamerasChange: function(model, new_cameras) {
      var self = this;
      var old_cameras = model.previous('cameras');

      // check deleted cameras
      _.each(old_cameras, function(old_camera) {
        if (old_camera.id == '0') {
          return;
        }
        var i = _.findIndex(new_cameras, function(new_camera) {
          return old_camera.id == new_camera.id;
        });
        if (i < 0) {
          // deleted
          self._removeLabel(old_camera.id);
          var $group_content = self.$el.find('.group-content');
          var camera = Live.cameras.get(old_camera.id);
          if (
            camera.get('device_type') == 'camera' &&
            $group_content.find('div[device-type="camera"]').length === 0 &&
            $group_content.find('.title-camera').length > 0
          ) {
            $group_content.find('.title-camera').remove();
          }

          if (
            (camera.get('device_type') == 'sensor' ||
              camera.device_type == 'smart_sense') &&
            $group_content.find('div[device-type="sensor"]').length === 0 &&
            $group_content.find('.title-gateway').length > 0
          ) {
            $group_content.find('.title-gateway').remove();
          }

          if (
            (camera.get('device_type') == 'sensor' ||
              camera.device_type == 'smart_sense') &&
            $group_content.find('div[device-type="sensor"]').length === 0 &&
            $group_content.find('.title-access').length > 0
          ) {
            $group_content.find('.title-access').remove();
          }
        }
      });

      // check added cameras
      _.each(new_cameras, function(new_camera) {
        if (new_camera.id == '0') {
          return;
        }
        var i = _.findIndex(old_cameras, function(old_camera) {
          return new_camera.id == old_camera.id;
        });
        if (i < 0) {
          // added
          var $group_content = self.$el.find('.group-content');
          var camera = Live.cameras.get(new_camera.id);

          // when add sensor
          if (
            (camera.get('device_type') == 'sensor' ||
              camera.device_type == 'smart_sense') &&
            $group_content.find('.title-access').length === 0
          ) {
            self._addReadOnlyLabal(
              'access',
              Skywatch.lang.group_title_access,
              new_cameras.length > 0,
            );
          }

          if (
            camera.get('device_type') == 'camera' &&
            $group_content.find('.title-camera').length === 0
          ) {
            self._addReadOnlyLabal(
              'camera',
              Skywatch.lang.group_title_cameras,
              new_cameras.length > 1,
            );
          }

          if (
            (camera.get('device_type') == 'sensor' ||
              camera.device_type == 'smart_sense') &&
            $group_content.find('.title-gateway').length === 0
          ) {
            self._addReadOnlyLabal(
              'gateway',
              Skywatch.lang.group_title_gateway,
              new_cameras.length > 1,
            );
          }
          self._addLabel(new_camera.id);

          // update css
          $group_content.css(
            'max-height',
            $group_content.children().length * 40,
          );
        }
      });
    },

    _onIdChange: function(model, new_id) {
      // change container id
      var $root = this.$el.find('#group-' + model.previous('id')).first();
      var $head = this.$el
        .find('#group-' + model.previous('id') + '-head')
        .first();
      var $expand = $head.find('h4.panel-title > div').first();
      var $body = this.$el
        .find('#group-' + model.previous('id') + '-body')
        .first();

      $root.attr('id', 'group-' + new_id).data('id', new_id);
      $head.attr('id', 'group-' + new_id + '-head');
      $expand.attr({
        'aria-controls': 'group-' + new_id + '-body',
        'data-parent': '#group-' + new_id,
        'data-target': '#group-' + new_id + '-body',
      });
      $body
        .attr('id', 'group-' + new_id + '-body')
        .attr('aria-labelledby', 'group-' + new_id + '-head');
    },

    _onGroupDestroy: function() {
      var active_loss = this.$el
        .children()
        .first()
        .hasClass('active');

      this.$el.find('li').each(function() {
        // prevent pending event error
        $(this)
          .data('view')
          .remove();
      });

      this.remove();

      if (active_loss) {
        // TODO trigger event?
        Live.camera_list.activate();
      }
    },

    _onFilter: function(pattern) {
      pattern = pattern.toLowerCase();
      var matched = _.some(this._camera_views, function(label) {
        var i = label.model
          .get('name')
          .toLowerCase()
          .indexOf(pattern);
        return i >= 0;
      });
      if (matched) {
        this.$el.css('display', '');
        // expand only if not empty string
        if (pattern) {
          this.expand();
        }
      } else {
        this.$el.css('display', 'none');
      }
    },

    _onEditTitle: function(event) {
      if (!Skywatch.keyholder) {
        return;
      }
      var $el = $(event.target).parents('.sidebar-item');
      $el.removeClass('read');
      var $input = $el.find('.camera-item-title-write');
      $input.focus();

      if (amplitude) {
        amplitude.getInstance().logEvent('Start_EditGroupName');
      }
    },

    _onEditTitleDbClickDown: function(event) {
      event.stopPropagation();
    },

    _onEditTitleKeyDown: function(event) {
      if (event.keyCode === 13 || event.keyCode === 10) {
        this._onEditTitleComplete(event);
      }
    },

    _onEditTitleComplete: function(event) {
      var self = this;
      var $input = $(event.target);
      var title = $input.val();

      if (!title) {
        self._$title.html(self.model.get('name'));
        self._$title.attr('title', self.model.get('name'));
      } else {
        self._$title.html(title);
        self._$title.attr('title', title);
        self.model.set('name', title);
        self.model.save();
      }
      setTimeout(function() {
        $input.parents('.sidebar-item').addClass('read');
      }, 100);

      if (amplitude) {
        amplitude.getInstance().logEvent('Done_EditGroupName');
      }
    },

    _removeLabel: function(camera_id) {
      var view = this._camera_views[camera_id];
      if (view && view.$el) {
        var active_loss = view.$el.hasClass('active');

        view.remove();
        delete this._camera_views[camera_id];

        if (active_loss) {
          // TODO trigger event?
          Live.camera_list.activate();
        }
      }
    },

    _addReadOnlyLabal: function(type, text, is_show) {
      var view = new Live.CameraReadOnlyLabelView({
        model: {
          type: type,
          text: text,
          is_show: is_show,
        },
        parent: this,
      });
      this._$ul.append(view.$el);
    },

    _addLabel: function(camera_id) {
      var camera = Live.cameras.get(camera_id);
      var view = new Live.CameraLabelView({
        model: Live.cameras.get(camera_id),
        parent: this,
      });
      this._camera_views[camera_id] = view;

      // find insert position
      var $search_from = [];
      var index;
      if (camera.get('device_type') == 'camera') {
        $search_from = this._$ul.find('.title-camera').nextAll();
        index = $search_from.index(this._$ul.find('.title-gateway'));
        if (index >= 0) {
          $search_from = $search_from.slice(0, index);
        }
      } else {
        $search_from = this._$ul.find('.title-gateway').nextAll();
        index = $search_from.index(this._$ul.find('.title-camera'));
        if (index >= 0) {
          $search_from = $search_from.slice(0, index);
        }
      }
      if ($search_from.length === 0) {
        this._$ul.append(view.$el);
        return;
      }

      var $next = $search_from
        .filter(function() {
          var $self = $(this);
          if (!$self.data('view')) return false;
          var that_name = $self.data('view').model.get('name');
          var this_name = view.model.get('name');
          return that_name > this_name;
        })
        .first();

      if ($next.length <= 0) {
        $search_from.last().after(view.$el);
        // this._$ul.append(view.$el);
      } else {
        $next.before(view.$el);
      }
    },

    _onGroupCollapseShow: function(event) {
      $(event.target)
        .parents('.panel-group')
        .addClass('collapsed');
    },

    _onGroupCollapseHide: function(event) {
      $(event.target)
        .parents('.panel-group')
        .removeClass('collapsed');
    },
  });

  Live.CameraReadOnlyLabelView = Skywatch.View.extend({
    template: _.template($('#template-device-title-label').html()),
    events: {
      click: '_onClick',
    },
    initialize: function(options) {
      this.$el = $(
        this.template({
          id: 0,
          name: this.model.text,
          type: this.model.type,
          is_show: this.model.is_show,
        }),
      );
      this.parent = options.parent;
    },
    _onClick: function() {
      if (!$('#group-tab').hasClass('active')) {
        $('#group-tab').trigger('click');
      }
      // var type = this.$el.hasClass('title-camera') ? 'camera' : 'sensor';
      var type;
      if (this.$el.hasClass('title-camera')) type = 'camera';
      else if (this.$el.hasClass('title-gateway')) type = 'sensor';
      else if (this.$el.hasClass('title-access')) type = 'access';

      Live.camera_list.activate(this.$el);
      Live.camera_grid.setGroup(this.parent.model.get('id'), type);

      if (type == 'camera') {
        $('#controlbar_container').show();
      } else if (type == 'sensor') {
        $('#controlbar_container').hide();
      } else if (type == 'access') {
        var groupContent = this.$el.parent();
        var groupId = groupContent.attr('id').split('-')[1];
        window.GROUP_ID = groupId;
        $('#group-view-access-list').removeClass();
        $('#group-view-access-list').addClass(`group-id-${groupId}`);
        $('#controlbar_container').hide();
        $('#group-view-camera').hide();
        $('#group-view-gateway').hide();
        $('#group-view-access-list').show();
      }
    },
  });

  Live.CameraLabelView = Skywatch.View.extend({
    template: _.template($('#template-device-label').html()),
    events: {
      click: '_onClick',
      drop: '_onDrop',
      dropover: '_onDropOver',
      dropout: '_onDropOut',
      'dblclick .camera-item-title-read': '_onEditTitle',
      'blur .camera-item-title-write': '_onEditTitleComplete',
      'keydown .camera-item-title-write': '_onEditTitleKeyDown',
      'dblclick .camera-item-title-write': '_onEditTitleDbClickDown',
    },

    initialize: function(options) {
      this._parent = options.parent || null;

      this.$el = $(this.template(this.model.attributes));
      this._$title = this.$el.find('.camera-item-title-read');

      this.$el.data('view', this);
      this.$el.data('id', this.model.get('id'));
      var self = this;

      if (Skywatch.keyholder) {
        this.$el.draggable({
          revert: true,
          zIndex: 65535,
          distance: 10,
          scroll: false,
          helper: function() {
            var $self = $(this);
            return $self
              .clone()
              .width($self.outerWidth())
              .attr('id', 'drag-helper')
              .addClass('dragging');
          },
          appendTo: '#camera-group-container',
          start: function() {
            var $self = $(this);
            $self.css('visibility', 'hidden');
          },
          stop: function() {
            var $self = $(this);
            $self.css('visibility', '');
            $('#drag-helper').remove();
            Live.camera_list.stopScrolling();
          },
        });

        // only droppable if no group
        if (!this._parent) {
          this.$el.droppable();
        }
      }

      this.listenTo(this.model, 'change:name', this._onNameChange);
      this.listenTo(this.model, 'change:model', this._onNameChange);
      this.listenTo(Live.camera_list, 'filter', this._onFilter);

      var $tooltips = this.$el.find('[data-toggle="tooltip"]');
      if ($tooltips) {
        $tooltips.tooltip();
      }
    },

    getGroup: function() {
      return this._parent ? this._parent.model : null;
    },

    // TODO extract class
    getType: function() {
      return Skywatch.keyholder ? 'label' : 'readonly';
    },

    _onNameChange: function() {
      this.$el.html($(this.template(this.model.attributes)).html());
    },

    _onClick: function() {
      // back to group tab
      if (!$('#group-tab').hasClass('active')) {
        $('#group-tab').trigger('click');
      }

      var active_camera_id = Live.camera_list.getActiveCameraId();
      if (active_camera_id == this.model.get('id')) {
        return;
      }
      // camera id may be the same with group id
      if (this._parent) {
        this._parent.expand();
      }

      // deactivate all group
      if (this.$el.parents('#group-container').length === 0) {
        _.each($('#group-container').find('.group-name.active'), function(
          item,
        ) {
          var $item = $(item);
          var $group = $item.parent();
          $group.find('.group-content').removeClass('active');
          $group.find('.group-content').css('max-height', 0);
          $item.removeClass('active');
        });
      }

      Live.camera_list.activate(this.$el);

      Live.camera_grid.setCamera(this.model.get('id'));
      $('#group-view-camera').show();
      $('#group-view-gateway').hide();
      $('#group-view-access-list').hide();

      if (this.model.get('device_type') == 'camera') {
        $('#controlbar_container').show();
      } else {
        $('#controlbar_container').hide();
      }
    },

    // TODO extract class
    _onDrop: function(event, ui) {
      // dont mess up parents
      event.stopPropagation();

      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      if (!drag_view || drag_view.getType() !== 'label') {
        return;
      }

      $('#drag-helper').remove();
      this.$el.removeClass('strong');

      var group_model = drag_view.getGroup();
      if (!group_model) {
        // create new group for two free camera
        this._createGroup(this.model.get('id'), drag_view.model.get('id'));
      } else {
        // just remove dragged camera from group
        group_model.removeCamera(drag_view.model.get('id'));
        group_model.save();
      }
    },

    // TODO extract class
    _onDropOver: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      if (!drag_view || drag_view.getType() !== 'label') {
        return;
      }
      if (drag_view.getGroup()) {
        return;
      }
      if (this._parent) {
        return;
      }

      this.$el.addClass('strong');
    },

    // TODO extract class
    _onDropOut: function(event, ui) {
      var $draggable = ui.draggable;
      var drag_view = $draggable.data('view');

      if (!drag_view || drag_view.getType() !== 'label') {
        return;
      }
      if (drag_view.getGroup()) {
        return;
      }
      if (this._parent) {
        return;
      }

      this.$el.removeClass('strong');
    },

    _onFilter: function(pattern) {
      var i = this.model
        .get('name')
        .toLowerCase()
        .indexOf(pattern.toLowerCase());

      var highlight = this.model
        .get('name')
        .replace(new RegExp(pattern, 'i'), function(m0) {
          return '<span style="color: red;">' + m0 + '</span>';
        });
      this.$el
        .find('h4')
        .first()
        .html(highlight);

      if (this._parent) {
        // only works on free cameras
        return;
      }
      if (i >= 0) {
        this.$el.css('display', '');
      } else {
        this.$el.css('display', 'none');
      }
    },

    _createGroup: function(id_1, id_2) {
      var group_model = new Live.GroupModel({
        name: Skywatch.lang.group,
        cameras: [
          {
            id: id_1,
            name: Live.cameras.get(id_1).get('name'),
            device_type: Live.cameras.get(id_1).get('device_type'),
            model: Live.cameras.get(id_1).get('model'),
            type: Live.cameras.get(id_1).get('own'),
          },
          {
            id: id_2,
            name: Live.cameras.get(id_2).get('name'),
            device_type: Live.cameras.get(id_2).get('device_type'),
            model: Live.cameras.get(id_2).get('model'),
            type: Live.cameras.get(id_2).get('own'),
          },
          {
            id: 0,
            name: '',
          },
          {
            id: 0,
            name: '',
          },
        ],
      });

      // commit new group
      group_model
        .save()
        .done(function(tab_id) {
          group_model.set('id', tab_id);
        })
        .fail(function() {
          group_model.destroy();
        });
      group_model.attributes.id = group_model.cid;
      Live.groups.add(group_model);
    },

    _onEditTitle: function(event) {
      if (!Skywatch.keyholder || this.model.get('type') != 'own') {
        return;
      }
      var $el = $(event.target).parents('.sidebar-item');
      $el.removeClass('read');
      var $input = $el.find('.camera-item-title-write');
      $input.focus();

      if (amplitude) {
        amplitude.getInstance().logEvent('Start_EditCameraName');
      }
    },

    _onEditTitleDbClickDown: function(event) {
      event.stopPropagation();
    },

    _onEditTitleKeyDown: function(event) {
      if (event.keyCode === 13 || event.keyCode === 10) {
        this._onEditTitleComplete(event);
      }
    },

    _onEditTitleComplete: function(event) {
      var $input = $(event.target);
      var title = $input.val();
      if (!title) {
        this._$title.html(this.model.get('name'));
        this._$title.attr('title', this.model.get('name'));
      } else {
        this._$title.html(title);
        this._$title.attr('title', title);
        this.model.set('name', title);
        this.model.save();
      }
      $input.parents('.sidebar-item').addClass('read');

      if (amplitude) {
        amplitude.getInstance().logEvent('Done_EditCameraName');
      }
    },
  });

  // base class, contents of each tab
  Live.TabView = Skywatch.View.extend({
    initialize: function() {
      // handle resize event?
    },
  });

  // layout cameras, bound to Live.CameraCollection
  /**
   * @events focus
   * @events blur
   */
  Live.CameraGridView = Live.TabView.extend({
    className: 'view',
    // temp
    // template: _.template($('#template-camera-grid').html()),
    // row_template: _.template($('#template-camera-row').html()),
    template: () => `<div id="group-4248-grid" class="view">
    </div>`,
    row_template: () => `<div class="view_row">
    </div>`,

    _mode_table: {
      '1': 'view_1x1',
      '4': 'view_2x2',
      '9': 'view_3x3',
      '16': 'view_4x4',
    },

    initialize: function(options) {
      this._group_id = 0;
      this._camera_id = 0;
      this._cameras = [];
      this._camera_views = [];
      this._activated_camera = 0;
    },

    render: function() {
      var is_camera_group =
        $('#group-container').find('.title-camera.active').length > 0;
      var is_gateway_group =
        $('#group-container').find('.title-gateway.active').length > 0;
      var is_single = this._cameras.length === 1;

      var cameras = this._cameras.filter(function(data) {
        if (is_single) return true;
        var camera = Skywatch.Live.cameras.get(data.id);
        if (camera && is_camera_group) {
          return camera.get('device_type') == 'camera';
        }
        if (camera && is_gateway_group) {
          return camera.get('device_type') == 'sensor';
        }
        return false;
      });

      if (cameras.length > 16) {
        cameras = cameras.slice(0, 16);
      }

      // layout cameras
      var grid = Math.ceil(Math.sqrt(cameras.length));

      try {
        // clear previous views
        _.each(this._camera_views, function(_tmpview) {
          if (_tmpview) {
            _tmpview.remove();
          }
        });
      } catch (e) {
        console.error(e);
      }

      // create new views
      var camera_views = [];
      var self = this;

      var data, index;
      for (var row = 0; row < grid; ++row) {
        for (var col = 0; col < grid; ++col) {
          index = row * grid + col;
          data = cameras[index] || {
            id: '0',
          };
          var camera = Skywatch.Live.cameras.get(data.id);
          var view = false;
          if (camera && camera.get('device_type') == 'camera') {
            view = new Live.CameraView({
              model: camera,
              parent: self,
              view_index: index,
            });
          } else {
            view = new Live.SensorView({
              model: camera,
              parent: self,
              view_index: index,
            });
          }

          // Skywatch.Live.camera_grid._camera_views
          camera_views.push(view);
        }
      }

      this._camera_views = camera_views;

      this._render(grid);

      $(window).trigger('resize');

      return this;
    },

    _render: function(grid) {
      grid = Math.ceil(grid);
      this.$el.empty();
      var $grid = $(this.template(this.model.attributes));
      $grid.addClass(this.layout_table[this._camera_views.length]);
      for (var row = 0; row < grid; ++row) {
        var $row_block = $(this.row_template());
        $grid.append($row_block);
        for (var col = 0; col < grid; ++col) {
          var camera_view = this._camera_views[row * grid + col];
          $row_block.append(camera_view.$el);
        }
      }
      this.$el.append($grid);
    },

    setGroup: function(group_id, type) {
      this._group_id = group_id;
      this._camera_id = 0;

      type = type || 'camera';

      // update model
      if (this.model) {
        this.stopListening(this.model);
      }

      this.model = Live.groups.get(group_id);

      var device_list = _.map(this.model.get('cameras'), function(data) {
        var device = Skywatch.Live.cameras.get(data.id);
        if (device && device.get('device_type') == 'sensor') {
          return device.attributes;
        }
        return false;
      }).filter(function(device) {
        return device;
      });

      if (type == 'camera') {
        this.listenTo(this.model, 'change:cameras', this.onLayoutChange);
        this.listenTo(this.model, 'change:id', this._onGroupIdChange);
        this._cameras = _.filter(this.model.get('cameras'), function(data) {
          var device = Skywatch.Live.cameras.get(data.id);
          if (type == 'camera') {
            return device && device.get('device_type') == 'camera';
          } else {
            return device && device.get('device_type') == 'sensor';
          }
        });

        // update html
        this.render();

        // update control bar
        Skywatch.Live.control_bar.setActiveGroup(this._group_id, 'camera');

        // trigger event
        this.trigger('focus');
        $('#group-view-camera').show();
        $('#group-view-gateway').hide();
        $('#group-view-access-list').hide();
      } else if (type == 'sensor') {
        this.listenTo(this.model, 'change:cameras', this.onGatewayLayoutChange);
        if (device_list.length > 1) {
          if (typeof Skywatch.setGatewayOverviewDevice == 'function') {
            Skywatch.setGatewayOverviewDevice(device_list);
          }
          this.render();

          // to invoke save playing_status
          Skywatch.Live.control_bar.setActiveGroup(this._group_id, 'gateway');

          this.trigger('focus');

          $('#group-view-camera').hide();
          $('#group-view-access-list').hide();
          $('#group-view-gateway').show();
        } else if (device_list.length === 1) {
          this.setCamera(device_list[0]['id']);
          $('#group-view-gateway').hide();
          $('#group-view-access-list').hide();
          $('#group-view-camera').show();
        }
      } else if (type == 'access' && device_list.length > 0) {
        $('#group-view-gateway').hide();
        $('#group-view-camera').hide();
        $('#group-view-access-list').show();
      } else {
        // show group-view-camera by default if there is no device
        $('#group-view-gateway').hide();
        $('#group-view-access-list').hide();
        $('#group-view-camera').show();
      }
    },

    onGatewayLayoutChange: function(model, new_cameras) {
      if (typeof Skywatch.setGatewayOverviewDevice == 'function') {
        var device_list = _.map(this.model.get('cameras'), function(data) {
          var device = Skywatch.Live.cameras.get(data.id);
          if (device && device.get('device_type') == 'sensor') {
            return device.attributes;
          }
          return false;
        }).filter(function(device) {
          return device;
        });

        Skywatch.setGatewayOverviewDevice(device_list);
      }
    },

    setCamera: function(camera_id) {
      this._group_id = 0;
      this._camera_id = camera_id;
      // update model
      if (this.model) {
        this.stopListening(this.model);
      }

      this.model = Live.cameras.get(camera_id);

      this._cameras = [
        {
          id: camera_id,
        },
      ];

      // update html
      this.render();

      // update control bar
      // setActiveCamera if device is not sensor and gatewy
      // temp
      // var device_type = this.model.get('device_type');
      // if (device_type != 'sensor' && device_type != 'gateway') {
      //   Skywatch.Live.control_bar.setActiveCamera(this._camera_id);
      // }
      Skywatch.Live.control_bar.setActiveCamera(camera_id);

      // trigger event
      this.trigger('focus');
    },

    onCRChanged: function() {
      var views = _.filter(this._camera_views, function(camera_view) {
        return camera_view.model && camera_view.model.get('id') > 0;
      });
      var rendering = _.map(views, function(camera_view) {
        return camera_view.getRenderer();
      });
      $.when.apply($, rendering).done(function() {
        var no_cr = _.every(views, function(view) {
          if (view.isCloudArchiveVisible) {
            return !view.isCloudArchiveVisible();
          }
          return false;
        });
        Skywatch.Live.control_bar.disableTimeline(no_cr);
      });
    },

    _onGroupIdChange: function(model, new_id) {
      this._group_id = new_id;
    },

    onLayoutChange: function(model, new_cameras) {
      console.info('refresh layout');
      var previous_cameras = model.previous('cameras');
      this._cameras = new_cameras;
      var self = this;
      var is_camera_group =
        $('#group-container').find('.title-camera.active').length > 0;
      var is_gateway_group =
        $('#group-container').find('.title-gateway.active').length > 0;

      if (is_camera_group) {
        new_cameras = _.filter(new_cameras, function(item) {
          var camera = Skywatch.Live.cameras.get(item.id);
          return camera && camera.get('device_type') == 'camera';
        });

        previous_cameras = _.filter(previous_cameras, function(item) {
          var camera = Skywatch.Live.cameras.get(item.id);
          return camera && camera.get('device_type') == 'camera';
        });
      }

      if (is_gateway_group) {
        new_cameras = _.filter(new_cameras, function(item) {
          var camera = Skywatch.Live.cameras.get(item.id);
          return camera && camera.get('device_type') == 'sensor';
        });

        previous_cameras = _.filter(previous_cameras, function(item) {
          var camera = Skywatch.Live.cameras.get(item.id);
          return camera && camera.get('device_type') == 'sensor';
        });
      }

      if (new_cameras.length !== previous_cameras.length) {
        // shrink view
        this.render();
        this.trigger('focus');
      } else {
        // just replace diff, much lighter
        _.each(new_cameras, function(camera, index) {
          if (camera.id != previous_cameras[index].id) {
            if (self._camera_views[index]) {
              self._camera_views[index].setCamera(camera.id, true);
            } else {
              camera = Skywatch.Live.cameras.get(camera.id);
              var view = false;
              if (camera && camera.get('device_type') == 'camera') {
                self._camera_views[index] = new Live.CameraView({
                  model: camera,
                  parent: self,
                  view_index: index,
                });
              } else {
                self._camera_views[index] = new Live.SensorView({
                  model: camera,
                  parent: self,
                  view_index: index,
                });
              }
            }
          }
        });
      }
    },

    fetchCloudArchives: function() {
      if (Live.camera_list.getActiveCameraId() !== null) {
        Live.cameras.cancelInactivePulling([
          Live.camera_list.getActiveCameraId(),
        ]);
      } else {
        var group_id = Live.camera_list.getActiveGroupId();
        var group_model = Live.groups.get(group_id);
        // temp
        // Live.cameras.cancelInactivePulling(group_model.get('cameras'));
      }
      return Live.cameras.fetchCloudArchives(
        _.map(this._cameras, function(data) {
          return data.id;
        }),
      );
    },

    getArchivesByRange: function(start, end) {
      var self = this;
      var archives = [];
      var i;
      _.each(self._camera_views, function(camera_view, index) {
        if (typeof camera_view.model === 'undefined') {
          return;
        }
        archives = archives.concat(
          camera_view.model.getArchivesByRange(start, end),
        );
        // check cache time
        var now = _.now() / 1000;
        if (now - end <= 10 * 60 && camera_view.model.getCacheTime() > 0) {
          archives.push(
            new Live.ArchiveModel({
              timestamp: camera_view.model.getCacheTime(),
              length: now - camera_view.model.getCacheTime(),
            }),
          );
        }
      });
      //sort in reverse order
      archives.sort(function(a, b) {
        return (
          parseInt(b.get('timestamp'), 10) - parseInt(a.get('timestamp'), 10)
        );
      });
      return archives;
    },

    getMetaTimebar: function(scale, start_time) {
      var start_time_index = '' + start_time;
      var scale_table = Skywatch.Live.control_bar.scale_table;
      scale = Skywatch.Live.control_bar.scale();
      var self = this;

      // console.log(Live.control_bar.model.attributes);
      var highlight_start = parseInt(
        Live.control_bar.model.get('highlight_start'),
      );
      var highlight_end = parseInt(Live.control_bar.model.get('highlight_end'));
      if (!Skywatch.Live.camera_grid.isSingle()) {
        highlight_start = 0;
        highlight_end = 0;
      }
      // console.log('highlight_start', highlight_start, 'highlight_end', highlight_end);

      // render 3 views for animation to use
      var timebar_width_i = Skywatch.Live.control_bar.$el
        .find('#timebar_content')
        .width();
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
      _.each(this._camera_views, function(camera_view, index) {
        if (!camera_view || !camera_view.model) {
          return;
        }
        meta_list = camera_view.model.getMetaList(
          seconds_in_bar,
          left_time,
          right_time,
        );
        var i, interval, metric;

        if (meta_list.length > 0) {
          timeline_block_html +=
            '<div class="camera-' + camera_view.model.get('id') + '">';
          for (i = 0; i < meta_list.length; i++) {
            interval = meta_list[i];
            metric = self.getTimelineBlockMetric(
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
    },

    // NOTE deprecated? never called
    getTimebar: function(scale, start_time) {
      var start_time_index = '' + start_time;
      var scale_table = Skywatch.Live.control_bar.scale_table;
      scale = Skywatch.Live.control_bar.scale();
      var timebar_width_i = Skywatch.Live.control_bar.$el
        .find('#timebar_content')
        .width();
      var timebar_width = timebar_width_i * 3;

      // render 3 views for animation to use
      var time_width_i = scale_table.get(scale, start_time);
      var time_width = time_width_i * 3;
      var fetch_start = start_time - time_width_i - 10 * 60;
      var fetch_end = start_time + time_width_i * 2;
      var left_time = start_time - time_width_i;
      var right_time = start_time + time_width_i * 2;

      // merge all interrupt < 3px
      var merge_threshold = Math.floor((time_width_i / timebar_width_i) * 3);

      var meta_width = 5;
      var meta_count = Math.floor(timebar_width / meta_width);
      var meta_time_width = time_width / meta_width;
      var timeline_block_html = '';
      var self = this;

      _.each(this._camera_views, function(camera_view, index) {
        if (typeof camera_view.model === 'undefined') {
          return;
        }
        var interval_list = [];
        var archives = camera_view.model.getArchivesByRange(
          fetch_start - 600,
          fetch_end + 600,
        );
        var i, j, k;

        // render
        var meta_block_html = '';
        var archive, camera, metric;

        var end, interval, timestamp, next_timestamp, next_length, previous_end;
        var add = false;
        var meta_index = 0;
        var meta;
        var end_index;
        var time_start, time_end;
        var second, max;

        // check cache time
        var now = _.now() / 1000;
        console.info(new Date(camera_view.model.getCacheTime() * 1000));
        if (
          now - (fetch_end + 600) <= 10 * 60 &&
          camera_view.model.getCacheTime() > 0
        ) {
          archives.push(
            new Live.ArchiveModel({
              timestamp: camera_view.model.getCacheTime(),
              length: now - camera_view.model.getCacheTime(),
            }),
          );
        }
        //sort in reverse order
        archives.sort(function(a, b) {
          return (
            parseInt(b.get('timestamp'), 10) - parseInt(a.get('timestamp'), 10)
          );
        });

        if (archives.length > 0) {
          // get normal timebar
          end =
            parseInt(archives[0].get('timestamp')) +
            parseInt(archives[0].get('length'));

          for (i = 0; i < archives.length; i++) {
            timestamp = parseInt(archives[i].get('timestamp'));

            add = false;
            if (i === archives.length - 1) {
              add = true;
            } else {
              previous_end =
                parseInt(archives[i + 1].get('timestamp'), 10) +
                parseInt(archives[i + 1].get('length'), 10);
              if (timestamp - previous_end > merge_threshold) add = true;
            }

            if (add) {
              interval_list.push({
                start: timestamp,
                end: end,
              });

              if (i < archives.length - 1) {
                end = previous_end;
              }
            }
          }
        }

        timeline_block_html +=
          '<div class="camera-' + camera_view.model.get('id') + '">';
        var width;
        var meta_width = 5;
        var meta_count = Math.floor(timebar_width / meta_width);
        var time_i_width = (meta_width / timebar_width) * time_width;
        for (i = 0; i < interval_list.length; i++) {
          interval = interval_list[i];
          metric = self.getTimelineBlockMetric(
            interval.start,
            interval.end,
            left_time,
            right_time,
            timebar_width,
          );
          meta_count = Math.floor(
            ((metric.width / 100) * timebar_width) / meta_width,
          );
          for (j = 0; j < meta_count; j++) {
            metric = self.getTimelineBlockMetric(
              interval.start + j * time_i_width,
              interval.end,
              left_time,
              right_time,
              timebar_width,
            );
            timeline_block_html +=
              '<div class="meta_timeline_i" start="' +
              interval.start +
              '" end="' +
              interval.end +
              '"';
            timeline_block_html += 'style="width:4px; bottom:0;height:';
            timeline_block_html += '10px;';
            timeline_block_html += 'left:' + metric.left + '%;"></div>';
          }
        }
        timeline_block_html += '</div>';
      });

      return {
        html: timeline_block_html,
        timebar_width: timebar_width,
      };
    },

    getTimelineBlockMetric: function(
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
    },

    isSingle: function() {
      return (
        (this._camera_id != '0' && this._group_id == '0') ||
        this._cameras.length <= 1
      );
    },

    mute: function() {
      var mute = Live.control_bar.model.get('mute');
      console.log('camera_grid mute', mute);
      this.trigger('mute', mute);
    },

    getNextEdge: function() {
      var timestamp = _.chain(this._camera_views)
        .filter(function(view) {
          return !view.isEmpty() && !view.isOffline();
        })
        .map(function(view) {
          return view.getNextEdge();
        })
        .filter(function(edge) {
          return edge > 0;
        })
        .min()
        .value();
      return timestamp;
    },

    isAllEnded: function() {
      var ended = _.chain(this._camera_views)
        .filter(function(view) {
          return !view.isEmpty() && !view.isOffline();
        })
        .every(function(view) {
          return view.isEnded();
        })
        .value();
      return ended;
    },

    activate: function(camera_id) {
      this._activated_camera = camera_id;
      // clear active state
      this.$el.find('.live-overlay-container').removeClass('active');
      if (camera_id <= 0) {
        return;
      }
      var view = _.find(this._camera_views, function(camera_view) {
        return camera_view.model && camera_view.model.get('id') == camera_id;
      });
      view.$el
        .find('.live-overlay-container')
        .first()
        .addClass('active');
    },

    getActiveCameraIdInGroup: function() {
      return this._activated_camera;
    },

    // remove all grid, as if user has no camera
    reset: function() {
      this.$el.empty();
    },
  });

  // player bar
  Live.ControlBarView = Skywatch.View.extend({
    events: {
      'click #timeline_container,#playbar,#played,#cursor_bubble_preview':
        'onSeek',
      'click #to_previous': 'onPreviousClick',
      'click #to_next': 'onNextClick',
      'mousedown .control_button,.state_button,.switch_button': 'onMouseDown',
      'mouseup .control_button,.state_button,.switch_button': 'onMouseUp',
      'click .control_button,.switch_button': 'onControlButtonClick',
    },

    scale_table: {
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
    },

    initialize: function() {
      this._inited = false;
      this.is_dragging = false;

      // trigger by each camera view
      this.listenTo(this.model, 'all', this.onControlbarUpdate);

      var self = this;
      var $cursor = this.$el.find('#cursor');
      $cursor.css('color', 'red');
      $cursor.draggable({
        axis: 'x',
        containment: '#playbar-container',
        stop: function(e, ui) {
          // send seek event
          var $target = $(e.target);
          var containment = $target.draggable('option', 'containment');
          var offset = ui.offset.left - $(containment).offset().left;
          var timebar_width = $(containment).width();
          var time_width = self.scale_table.get(
            self.scale(),
            self.leftTimestamp(),
          );
          var timestamp = parseInt(
            (offset / timebar_width) * time_width + self.leftTimestamp(),
            10,
          );
          self.currentTime(timestamp);
          self.trigger('seek', timestamp);
          Skywatch.Live.control_bar.$el
            .find('#cursor_bubble')
            .removeClass('active');
          self.is_dragging = false;
        },
        drag: function(e, ui) {
          // set played bar width
          var $target = $(e.target);
          var containment = $target.draggable('option', 'containment');
          var time_position = ui.offset.left - $(containment).offset().left;
          Skywatch.Live.control_bar.$el
            .find('#played')
            .css('width', time_position);
          var left_time = Skywatch.Live.control_bar.leftTimestamp();
          var right_time = Skywatch.Live.control_bar.rightTimestamp();
          var timebar_width = $(containment).width();
          var timestamp =
            (time_position / timebar_width) * (right_time - left_time) +
            left_time;

          if (
            timestamp > Math.ceil(new Date().getTime() / 1000) &&
            self.last_timestamp !== false &&
            timestamp > self.last_timestamp
          ) {
            return false;
          }
          self.last_timestamp = timestamp;
          self._setBubbleTime(timestamp);
        },
        start: function(e, ui) {
          if (self.model.get('timeline_disabled')) {
            return false;
          }
          self.last_timestamp = false;
          Skywatch.Live.control_bar.$el
            .find('#cursor_bubble')
            .addClass('active');
          self.is_dragging = true;
        },
      });

      $cursor.on('mousemove', function(e) {
        var $bubble = Skywatch.Live.control_bar.$el.find('#cursor_bubble');

        var date_data = self.getTimeData(self.currentTime());
        $bubble
          .find('span')
          .first()
          .html(date_data.date_display);
        $bubble
          .find('span')
          .last()
          .html(date_data.time_display);
        self._setBubbleTime(self.currentTime());
        $bubble.addClass('active');
      });

      $cursor.on('mouseout', function() {
        Skywatch.Live.control_bar.$el
          .find('#cursor_bubble')
          .removeClass('active');
      });

      var $timebar_content = self.$el.find('#timebar_content');
      $timebar_content.on('mousemove', function(e) {
        var time_position =
          e.pageX - self.$el.find('#timebar_content').offset().left;
        var left_time = Skywatch.Live.control_bar.leftTimestamp();
        var right_time = Skywatch.Live.control_bar.rightTimestamp();

        var timebar_width = self.$el.find('#timebar_content').width();
        var timestamp =
          (time_position / timebar_width) * (right_time - left_time) +
          left_time;

        var $bubble = Skywatch.Live.control_bar.$el.find(
          '#cursor_bubble_preview',
        );

        var date_data = self.getTimeData(timestamp);
        $bubble
          .find('span')
          .first()
          .html(date_data.date_display);
        $bubble
          .find('span')
          .last()
          .html(date_data.time_display);
        self._setPreviewBubbleTime(timestamp);
        $bubble.addClass('active');
        $bubble.show();
        Skywatch.Live.control_bar.$el.find('#cursor_bubble').hide();
      });

      $timebar_content.on('mouseout', function(e) {
        var $bubble = Skywatch.Live.control_bar.$el.find(
          '#cursor_bubble_preview',
        );
        $bubble.removeClass('active');
        $bubble.hide();
        Skywatch.Live.control_bar.$el.find('#cursor_bubble').show();
      });

      var $preview_bubble = self.$el.find('#cursor_bubble_preview');
      $preview_bubble.on('mousemove', function(e) {
        var time_position =
          e.pageX - self.$el.find('#timebar_content').offset().left;
        var left_time = Skywatch.Live.control_bar.leftTimestamp();
        var right_time = Skywatch.Live.control_bar.rightTimestamp();
        var timebar_width = self.$el.find('#timebar_content').width();
        var timestamp =
          (time_position / timebar_width) * (right_time - left_time) +
          left_time;

        var $bubble = Skywatch.Live.control_bar.$el.find(
          '#cursor_bubble_preview',
        );

        var date_data = self.getTimeData(timestamp);
        $bubble
          .find('span')
          .first()
          .html(date_data.date_display);
        $bubble
          .find('span')
          .last()
          .html(date_data.time_display);
        self._setPreviewBubbleTime(timestamp);
        $bubble.addClass('active');
        $bubble.show();
        Skywatch.Live.control_bar.$el.find('#cursor_bubble').hide();
      });

      $preview_bubble.on('mouseout', function(e) {
        var $bubble = Skywatch.Live.control_bar.$el.find(
          '#cursor_bubble_preview',
        );
        $bubble.removeClass('active');
        $bubble.hide();
        Skywatch.Live.control_bar.$el.find('#cursor_bubble').show();
      });

      this._timer = 0;
      this._animating = false;
    },
    onControlButtonClick: function(e) {
      // divide events
      var $el = $(e.target);
      if (!$el.hasClass('control_button') && !$el.hasClass('switch_button')) {
        if ($el.parents('.control_button').length > 0) {
          $el = $el.parents('.control_button');
        } else {
          $el = $el.parents('.switch_button');
        }
      }
      $el = $el.children().first();
      var id = $el.attr('id');
      switch (id) {
        case 'control-pause':
          this.onPauseClick();
          break;
        case 'control-play':
          this.onPlayClick();
          break;
        case 'control-fastforward':
          this.onFastforwardClick();
          break;
        case 'control-golive':
          this.onGoLiveClick();
          break;
        case 'control-hour':
        case 'control-day':
        case 'control-week':
        case 'control-month':
          this.onScaleClick($el);
          break;
        case 'control-volume':
          var is_mute = !$el.parent().hasClass('active');
          this.changeVolume(is_mute);
          break;
        default:
          break;
      }
    },

    highlight: function(highlight_start, highlight_end) {
      this.model.set({
        highlight_start: highlight_start,
        highlight_end: highlight_end,
      });
    },

    _onHighLightTimeChange: function(highlight_start, highlight_end) {
      highlight_start = highlight_start || 0;
      highlight_end = highlight_end || 0;
      if (!Skywatch.Live.camera_grid.isSingle()) {
        highlight_start = 0;
        highlight_end = 0;
      }
      var camera_id = this.model.get('camera_id');
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
    },

    init: function(camera_id, group_id) {
      if (this._inited) {
        return;
      }
      this._inited = true;
      var params = {};
      params.group_id = group_id;
      params.camera_id = camera_id;
      params.scale = 'hour';
      params.state = 'normal';
      params.current_time = Math.floor(new Date().getTime() / 1000);
      params.timeline_disabled = false;

      var date = new Date();
      date.setMinutes(60);
      date.setSeconds(0);

      params.right_time = Math.floor(date.getTime() / 1000, 10);
      params.left_time =
        params.right_time -
        this.scale_table.get(params.scale, params.left_time);
      this.model.set(params);
    },
    currentTime: function() {
      // use arguments length to determine the behavior
      var key = 'current_time';
      if (arguments.length === 0) return this.model.get(key);
      else this.model.set(key, arguments[0]);
    },
    scale: function() {
      // use arguments length to determine the behavior
      var key = 'scale';
      if (arguments.length === 0) return this.model.get(key);
      else this.model.set(key, arguments[0]);
    },
    state: function() {
      // use arguments length to determine the behavior
      var key = 'state';
      if (arguments.length === 0) return this.model.get(key);
      else this.model.set(key, arguments[0]);
    },
    isFastForward: function() {
      return this.model.get('state') == 'fastforward';
    },
    leftTimestamp: function() {
      // use arguments length to determine the behavior
      var key = 'left_time';
      if (arguments.length === 0) return this.model.get(key);
      else this.model.set(key, arguments[0]);
    },
    rightTimestamp: function() {
      // use arguments length to determine the behavior
      var key = 'right_time';
      if (arguments.length === 0) return this.model.get(key);
      else this.model.set(key, arguments[0]);
    },

    setActiveGroup: function(group_id, subgroup) {
      $('#control-pause').click();
      if (!this._inited) {
        this.init(0, group_id);
      } else {
        var now = Math.floor(new Date().getTime() / 1000);
        var left_time = this.getScaleStartTime(now, 'hour');
        var right_time = left_time + this.scale_table.get('hour', left_time);

        Skywatch.Live.control_bar.model.set({
          left_time: left_time,
          right_time: right_time,
          current_time: now,
          scale: 'hour',
          state: 'normal',
          group_id: group_id,
          subgroup: subgroup,
          type: 'group',
        });
      }
      // FIXME: temp solution, may render twice
      Skywatch.Live.control_bar.renderGroupTimebar(group_id, false);
      // $('#control-golive').click();
      // $('#control-volume').trigger('click', false);
    },

    setActiveCamera: function(camera_id) {
      $('#control-pause').click();
      if (!this._inited) {
        this.init(camera_id, 0);
      } else {
        var now = Math.floor(new Date().getTime() / 1000);
        var left_time = this.getScaleStartTime(now, 'hour');
        var right_time = left_time + this.scale_table.get('hour', left_time);

        Skywatch.Live.control_bar.model.set({
          left_time: left_time,
          right_time: right_time,
          current_time: now,
          scale: 'hour',
          state: 'normal',
          camera_id: camera_id,
          type: 'camera',
        });
      }
      // FIXME: temp solution, may render twice
      Skywatch.Live.control_bar.renderCameraTimebar(camera_id, false);
      // $('#control-golive').click();
      // $('#control-volume').trigger('click', false);
    },

    getScaleStartTime: function(timestamp, scale) {
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
    },

    onMouseDown: function(e) {
      var $target = $(e.target);
      if (
        !$target.hasClass('control_button') &&
        !$target.hasClass('state_button') &&
        !$target.hasClass('switch_button')
      ) {
        $target = $target.parent();
      }
      $target.addClass('pressed');
    },

    onMouseUp: function(e) {
      var $target = $(e.target);
      if (
        !$target.hasClass('control_button') &&
        !$target.hasClass('state_button') &&
        !$target.hasClass('switch_button')
      ) {
        $target = $target.parent();
      }
      $target.removeClass('pressed');
    },

    onSeek: function(event) {
      if (this.model.get('timeline_disabled')) {
        return false;
      }

      var x = event.pageX;
      var timebar_width = $('#timebar_content').width();
      var offset = x - $('#timebar_content').offset().left;
      var time_width = this.scale_table.get(this.scale(), this.leftTimestamp());
      var timestamp = parseInt(
        (offset / timebar_width) * time_width + this.leftTimestamp(),
        10,
      );

      var now = Math.ceil(new Date().getTime() / 1000);
      if (timestamp > now) {
        timestamp = now;
      }

      var left_time = this.getScaleStartTime(timestamp);
      var right_time = left_time + this.scale_table.get(this.scale());

      var params = {
        current_time: timestamp,
        left_time: left_time,
        right_time: right_time,
      };
      this.model.set(params);
      console.log(timestamp);
      this.trigger('seek', timestamp);
    },

    onCurrentTimeUpdate: function(timestamp) {
      // set cursor position
      // this.onControlbarUpdate(timestamp);
    },
    onPlayClick: function() {
      // trigger play to active camera list
      console.log('onPlayClick invoked');
      if (this.state() === 'normal') {
        return;
      }
      // this.state('normal');
      this.model.set('state', 'normal');
      this.trigger('seek', this.currentTime());
    },
    onPauseClick: function() {
      var timeline_loading_check = this.$el.find('#timeline_container.loading')
        .length; // 1 : is loading, 0: finish loading
      if (timeline_loading_check == 0) {
        console.log('onPauseClick invoked');
        if (this.state() === 'pause') {
          return;
        }

        this._stopTimer();
        // this.state('pause');
        this.model.set('state', 'pause');
        this.trigger('pause');
      }
    },
    onFastforwardClick: function() {
      var timeline_loading_check = this.$el.find('#timeline_container.loading')
        .length; // 1 : is loading, 0: finish loading
      if (timeline_loading_check == 0) {
        if (this.state() === 'fastforward') {
          return;
        }
        // this.state('fastforward');
        this.model.set('state', 'fastforward');
        this.trigger('seek', this.currentTime());
      }
    },
    onScaleClick: function($el) {
      var timeline_loading_check = this.$el.find('#timeline_container.loading')
        .length; // 1 : is loading, 0: finish loading
      if (timeline_loading_check == 0) {
        var key = 'hour';
        var id = $el.attr('id');
        if (id == 'control-day') {
          key = 'day';
        } else if (id == 'control-week') {
          key = 'week';
        } else if (id == 'control-month') {
          key = 'month';
        }
        this.changeScale(key);

        $el
          .parents('.button_group')
          .find('.control_button')
          .removeClass('active');
        $el.parents('.control_button').addClass('active');
      }
    },
    changeVolume: function(mute) {
      var timeline_loading_check = this.$el.find('#timeline_container.loading')
        .length; // 1 : is loading, 0: finish loading
      if (timeline_loading_check == 0) {
        if (mute) {
          this.$el
            .find('#control-volume')
            .parent()
            .addClass('active');
        } else {
          this.$el
            .find('#control-volume')
            .parent()
            .removeClass('active');
        }

        console.log('change volume', mute);
        this.model.set('mute', mute);
        Live.camera_grid.mute();
      }
    },
    changeScale: function(scale) {
      // calculate new left & right
      var current_time = this.currentTime();
      var left_time = this.leftTimestamp();
      var right_time = this.rightTimestamp();
      var start_time = false;
      start_time = this.getScaleStartTime(current_time, scale);
      this.model.set({
        scale: scale,
        left_time: start_time,
        right_time: start_time + this.scale_table.get(scale),
      });
    },
    onGoLiveClick: function() {
      var now = Math.floor(new Date().getTime() / 1000);
      var left_time = this.getScaleStartTime(now);
      this.model.set({
        state: 'normal',
        current_time: now,
        left_time: this.getScaleStartTime(now),
        right_time: left_time + this.scale_table.get(this.scale()),
      });
      this._setButtonState('normal');
      this.trigger('seek', now);
    },
    setLiveButtonActive: function(active) {
      if (active) {
        this.$el
          .find('#control-golive')
          .parent()
          .addClass('active');
        this.$el.find('#cursor').addClass('live');
      } else {
        this.$el
          .find('#control-golive')
          .parent()
          .removeClass('active');
        this.$el.find('#cursor').removeClass('live');
      }
    },
    onLayoutClick: function(event) {
      var layout = $(event.target).attr('data-layout');
      var camera_count = this.camera_count_table[layout];
      // get active group id
      var group_id = Skywatch.Live.camera_list.getActiveGroupId();
      var group_model = Skywatch.Live.groups.get(group_id);
      group_model.changeCameraCount(camera_count);
      group_model.save();
    },
    onPreviousClick: function() {
      var scale = this.scale();
      var start_time = this.getScaleStartTime(this.leftTimestamp() - 100);
      var right_time = start_time + this.scale_table.get(scale, start_time);

      this.model.set({
        left_time: start_time,
        right_time: right_time,
      });
    },
    onNextClick: function() {
      var scale = this.scale();
      var start_time = this.getScaleStartTime(this.rightTimestamp() + 100);
      var right_time = start_time + this.scale_table.get(scale, start_time);

      this.model.set({
        left_time: start_time,
        right_time: right_time,
      });
    },

    // public slot
    onPlayerTick: function(view, timestamp) {
      console.error('onPlayerTick');
      var current_time = this.model.get('current_time');

      if (this.model.get('state') === 'fastforward') {
        // ff mode, sync cursor to video
        this._updateCurrentTime(timestamp);
      } else {
        // normal mode, sync video to cursor
        if (Math.abs(timestamp - current_time) >= 10) {
          // console.log('sync video to cursor', new Date(current_time * 1000));
          view.seek(current_time);
        }
      }
    },

    // public slot
    onPlayerHole: function() {
      var edge = Skywatch.Live.camera_grid.getNextEdge();
      console.info('edge', edge);
      if (edge > 0) {
        this._updateCurrentTime(edge);
        this.trigger('seek', this.currentTime());
      }
    },

    // public slot
    onPlayerEnded: function() {
      if (this.model.get('state') !== 'normal') {
        return;
      }
      var ended = Skywatch.Live.camera_grid.isAllEnded();
      if (ended) {
        this._updateCurrentTime(_.now() / 1000);
        this.trigger('seek', _.now() / 1000);
      }
    },

    onControlbarUpdate: function(event_tag, model) {
      if (event_tag != 'change') return;
      var changed_attrs = model.changedAttributes();
      var previous_attrs = model.previousAttributes();

      var new_left_time = model.get('left_time');
      var new_right_time = model.get('right_time');
      var current_time = model.get('current_time');

      var self = this;

      if (typeof changed_attrs.state !== 'undefined') {
        self._setButtonState(changed_attrs.state);
      }
      // changed_attrs.state may be undefined, because model.attributes.state init is normal, there are changes
      else if (model.attributes.state == 'normal') {
        self._setButtonState(model.attributes.state);
      }

      if (
        typeof changed_attrs.left_time !== 'undefined' ||
        typeof changed_attrs.right_time !== 'undefined'
      ) {
        self._moveTimebar(model);
      }

      if (
        typeof changed_attrs.group_id !== 'undefined' ||
        (typeof changed_attrs.type !== 'undefined' &&
          changed_attrs.type == 'group') ||
        typeof changed_attrs.subgroup !== 'undefined'
      ) {
        self._onChangeGroup(model);
      }

      if (
        typeof changed_attrs.camera_id !== 'undefined' ||
        (typeof changed_attrs.type !== 'undefined' &&
          changed_attrs.type == 'camera')
      ) {
        // show / hide ff button
        self._onChangeCamera(model);
      }

      if (typeof changed_attrs.current_time !== 'undefined') {
        // set current time
        self._onChangeCurrentTime(model);
      }

      if (
        typeof changed_attrs.highlight_start !== 'undefined' ||
        typeof changed_attrs.highlight_end !== 'undefined'
      ) {
        self._onHighLightTimeChange(
          parseInt(changed_attrs.highlight_start),
          parseInt(changed_attrs.highlight_end),
        );
      }

      if (
        typeof changed_attrs.current_time !== 'undefined' ||
        typeof changed_attrs.scale !== 'undefined' ||
        typeof changed_attrs.left_time !== 'undefined' ||
        typeof changed_attrs.right_time !== 'undefined'
      ) {
        self._onChangeTimeAndScale(model);
      }
    },

    _onChangeGroup: function(model) {
      var self = this;
      var changed_attrs = model.changedAttributes();
      // show / hide ff button
      var group_id =
        typeof changed_attrs.group_id !== 'undefined'
          ? changed_attrs.group_id
          : model.get('group_id');
      var subgroup =
        typeof changed_attrs.subgroup !== 'undefined'
          ? changed_attrs.subgroup
          : false;

      var devices = Skywatch.Live.camera_list._group_model
        .get(group_id)
        .get('cameras')
        .filter(function(item) {
          return item.device_type != '';
        });
      if (devices.length === 1 && devices[0].device_type == 'camera') {
        self.$el
          .find('#control-fastforward')
          .parent()
          .css('visibility', 'visible');
        self.$el
          .find('#control-fastforward')
          .parent()
          .removeClass('disabled');
      } else {
        self.$el
          .find('#control-fastforward')
          .parent()
          .css('visibility', 'hidden');
        self.$el
          .find('#control-fastforward')
          .parent()
          .addClass('disabled');
      }

      // render correct alert view
      if (group_id != '0') {
        // save active group in cookie
        var playing_status = {
          type: 'group',
          id: group_id,
          subgroup: subgroup,
        };

        $.cookie('playing_status', JSON.stringify(playing_status), {
          path: '/',
        });
      }
    },
    _onChangeCamera: function(model) {
      var self = this;
      var changed_attrs = model.changedAttributes();
      var camera_id =
        typeof changed_attrs.camera_id !== 'undefined'
          ? changed_attrs.camera_id
          : model.get('camera_id');
      if (camera_id !== false && camera_id != '0') {
        self.$el
          .find('#control-fastforward')
          .parent()
          .css('visibility', 'visible');
        self.$el
          .find('#control-fastforward')
          .parent()
          .removeClass('disabled');
      } else {
        self.$el
          .find('#control-fastforward')
          .parent()
          .css('visibility', 'hidden');
        self.$el
          .find('#control-fastforward')
          .parent()
          .addClass('disabled');
      }
      // render correct alert view
      if (camera_id != '0') {
        // save active camera in cookie
        var playing_status = {
          type: 'camera',
          id: camera_id,
          subgroup: false,
        };

        $.cookie('playing_status', JSON.stringify(playing_status), {
          path: '/',
        });
      }
    },
    _setPreviewBubbleTime: function(timestamp) {
      this._doSetBubbleTime(
        this.$el.find('#cursor_bubble_preview'),
        timestamp,
        false,
      );
    },
    _setBubbleTime: function(timestamp) {
      this._doSetBubbleTime(this.$el.find('#cursor_bubble'), timestamp, true);
    },
    _doSetBubbleTime: function($bubble, timestamp, set_cursor) {
      var now = Math.ceil(new Date().getTime() / 1000);
      if (timestamp > now) {
        timestamp = now;
      }
      var new_left_time = this.model.get('left_time');
      var new_right_time = this.model.get('right_time');

      var offset =
        ((timestamp - new_left_time) / (new_right_time - new_left_time)) *
        $('#playbar-container').width();
      if (set_cursor) this.$el.find('#played').css('width', offset);
      var total_offset =
        ((now - new_left_time) / (new_right_time - new_left_time)) *
        $('#playbar-container').width();
      if (set_cursor) this.$el.find('#playbar').css('width', total_offset);

      // move seek cursor
      var $cursor = this.$el.find('#cursor');
      var left =
        $('#timebar_content').offset().left -
        $('#controlbar_container').offset().left +
        offset;
      if (set_cursor) $cursor.css('left', left);

      $bubble.removeClass('right');
      $bubble.removeClass('left');
      if (timestamp >= new_left_time && timestamp <= new_right_time) {
        this.$el.find('#cursor').show();

        var time_data = this.getTimeData(timestamp);
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
        this.$el.find('#cursor').hide();
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
            $('#timebar_content').offset().left -
              $('#timebar').offset().left -
              20,
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
    },
    _onChangeCurrentTime: function(model) {
      // this.$el.find('#cursor_bubble').show();
      if (this.is_dragging) return;
      var self = this;
      var changed_attrs = model.changedAttributes();
      var previous_attrs = model.previousAttributes();

      var new_left_time = model.get('left_time');
      var new_right_time = model.get('right_time');
      var current_time = model.get('current_time');

      // set current time
      this._setBubbleTime(changed_attrs.current_time);
    },

    _onChangeTimeAndScale: function(model) {
      var new_left_time = model.get('left_time');
      var new_right_time = model.get('right_time');
      var now = Math.floor(new Date().getTime() / 1000);
      if (now < new_right_time) {
        this.$el.find('#to_next').attr('disabled', 'disabled');
      } else {
        this.$el.find('#to_next').attr('disabled', false);
      }
      if (now - this.scale_table.get('month', now) > new_left_time) {
        this.$el.find('#to_previous').attr('disabled', 'disabled');
      } else {
        this.$el.find('#to_previous').attr('disabled', false);
      }
      this.renderScaleIndicator();
    },

    _setButtonState: function(state) {
      // change button state
      var self = this;
      this.$el
        .find('#control-pause')
        .parent()
        .removeClass('active');
      this.$el
        .find('#control-fastforward')
        .parent()
        .removeClass('active');
      this.$el
        .find('#control-play')
        .parent()
        .removeClass('active');
      if (state === 'normal') {
        //check if seeking
        var el_parent = this.$el.parents('#group-view-camera');
        var video_loading_check = el_parent.find(
          '.live-overlay-container.rectangle.seeking',
        ).length; // 1 : is loading, 0: finish loading
        //if seeking, do not move cursor, and create another timer thread to check seeking dismiss
        if (video_loading_check) {
          this._stopTimer();
          this._timer = setInterval(function() {
            self._checkVideoActive();
          }, 1000);
        } else {
          this._startTimer();
        }
        this.$el
          .find('#control-play')
          .parent()
          .addClass('active');
      } else if (state === 'fastforward') {
        this._stopTimer();
        this.$el
          .find('#control-fastforward')
          .parent()
          .addClass('active');
      } else {
        // pause?
        this._stopTimer();
        this.$el
          .find('#control-pause')
          .parent()
          .addClass('active');
      }
    },

    _checkVideoActive: function() {
      var el_parent = this.$el.parents('#group-view-camera');
      var video_loading_check = el_parent.find(
        '.live-overlay-container.rectangle.seeking',
      ).length; // 1 : is loading, 0: finish loading
      if (!video_loading_check) {
        this._startTimer();
      }
    },

    _moveTimebar: function(model) {
      var self = this;
      var changed_attrs = model.changedAttributes();
      var previous_attrs = model.previousAttributes();

      var new_left_time = model.get('left_time');
      var new_right_time = model.get('right_time');
      var current_time = model.get('current_time');

      // update display
      _.each(
        {
          '#date_left': new_left_time,
          '#date_right': new_right_time,
        },
        function(timestamp, selector) {
          var date_data = self.getTimeData(timestamp);
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
      var old_left_time = previous_attrs.left_time;
      var old_right_time = previous_attrs.right_time;

      var animate_time = 500;

      var timeline_animation = false;
      var timeline_child_animation = false;
      var cursor_animation = false;
      var played_animation = false;
      var timebar_width = this.$el.find('#timebar_content').width();
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
            !(
              current_time >= old_left_time && current_time <= old_right_time
            ) &&
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
            ((old_left_time - new_left_time) /
              (new_right_time - new_left_time)) *
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

        self.$el.find('#cursor').hide();
      }

      var animations = [];
      var animation_queue = [];

      if (timeline_animation !== false) {
        animations.push(
          this.$el
            .find('#timeline_container')
            .animate(timeline_animation, animate_time),
        );
      }
      if (bubble_animation !== false) {
        if (element_delay !== false) {
          animations.push(
            this.$el
              .find('#cursor_bubble')
              .delay(element_delay)
              .animate(bubble_animation, element_animation_time, function() {
                self._setBubbleTime(self.currentTime());
              }),
          );
        } else {
          animations.push(
            this.$el
              .find('#cursor_bubble')
              .animate(bubble_animation, element_animation_time, function() {
                self._setBubbleTime(self.currentTime());
              }),
          );
        }
      }
      if (timeline_child_animation !== false) {
        animations.push(
          this.$el
            .find('#timeline_container')
            .children()
            .animate(timeline_child_animation, animate_time),
        );
      }
      if (cursor_animation !== false) {
        if (element_delay !== false) {
          animations.push(
            this.$el
              .find('#cursor')
              .delay(element_delay)
              .animate(cursor_animation, element_animation_time),
          );
        } else {
          animations.push(
            this.$el
              .find('#cursor')
              .animate(cursor_animation, element_animation_time),
          );
        }
      }
      if (played_animation !== false) {
        if (element_delay !== false) {
          animations.push(
            this.$el
              .find('#played')
              .delay(element_delay)
              .animate(played_animation, element_animation_time),
          );
        } else {
          animations.push(
            this.$el
              .find('#played')
              .animate(played_animation, element_animation_time),
          );
        }
      }
      if (show_cursor) self.$el.find('#cursor').fadeIn(80);

      this._animating = true;
      $.when.apply($, animations).done(function() {
        self._animating = false;
        if (Skywatch.Live.camera_grid.isSingle()) {
          // handle change camera case
          var camera_id = Skywatch.Live.camera_list.getActiveCameraId();
          if (camera_id !== null) {
            self.renderCameraTimebar(
              camera_id,
              timeline_child_animation !== false,
            );
          }
        } else {
          // handle change group case
          var group_id = Skywatch.Live.camera_list.getActiveGroupId();
          if (group_id !== null) {
            self.renderGroupTimebar(
              group_id,
              timeline_child_animation !== false,
            );
          }
        }
      });
    },

    showMeta: function(camera_id) {
      var $timeline_container = this.$el.find('#timeline_container');
      var $meta_container = $timeline_container.find('#meta_container');
      this.$el.find('#meta_container > div').removeClass('active');
      $meta_container.find('.camera-' + camera_id).addClass('active');
    },

    hideMeta: function() {
      var $timeline_container = this.$el.find('#timeline_container');
      var $meta_container = $timeline_container.find('#meta_container');
      $meta_container.find('> div').removeClass('active');

      var camera_id = Skywatch.Live.camera_grid.getActiveCameraIdInGroup();
      if (camera_id > 0) {
        this.showMeta(camera_id);
      }
    },

    renderGroupTimebar: function(group_id, animate) {
      console.warn('renderGroupTimebar');
      var $timeline_container = this.$el.find('#timeline_container');
      var $meta_container = $timeline_container.find('#meta_container');
      $meta_container.empty();
      $meta_container.addClass('group');

      this._setBubbleTime(this.currentTime());

      if (group_id == '0') {
        return;
      } else if (group_id == -1) {
        $timeline_container.addClass('loading');
        return;
      }
      $timeline_container.addClass('loading');

      var camera_grid_view = Live.camera_grid;
      var self = this;

      function render() {
        // temp
        // check if this tab still active
        // if (Skywatch.Live.control_bar.model.get('group_id') != group_id) {
        //   return;
        // }

        var view_info = camera_grid_view.getMetaTimebar(
          self.scale(),
          self.leftTimestamp(),
        );
        var html = view_info.html;

        $timeline_container.removeClass('loading');

        if (animate) {
          var $el = $(html);
          $el.css('opacity', 0.5);
          $meta_container.html($el);
          $el.animate(
            {
              opacity: 1,
            },
            100,
          );
          $timeline_container.children().animate(
            {
              opacity: 1,
            },
            100,
          );
        } else {
          $meta_container.html(html);
        }

        var camera_id = Skywatch.Live.camera_grid.getActiveCameraIdInGroup();
        if (camera_id > 0) {
          self.showMeta(camera_id);
        }

        $timeline_container.css('left', '-100%');
        $timeline_container.css('width', '300%');
        self.renderScaleIndicator();
        self._setBubbleTime(self.currentTime());
      }
      camera_grid_view.fetchCloudArchives().progress(render);
      render();
    },

    renderCameraTimebar: function(camera_id, animate) {
      console.warn('renderCameraTimebar');
      var $timeline_container = this.$el.find('#timeline_container');
      var $meta_container = $timeline_container.find('#meta_container');
      $meta_container.empty();
      $meta_container.removeClass('group');

      this._setBubbleTime(this.currentTime());

      if (camera_id == '0') {
        return;
      } else if (camera_id == -1) {
        $timeline_container.addClass('loading');
        return;
      }
      $timeline_container.addClass('loading');

      var camera_grid_view = Live.camera_grid;
      var self = this;
      function render() {
        // check if this tab still active
        if (Skywatch.Live.control_bar.model.get('camera_id') != camera_id) {
          return;
        }

        // FIXME: should re-write getTimebar to get correct meta|archive timebar html
        var view_info = camera_grid_view.getMetaTimebar(
          self.scale(),
          self.leftTimestamp(),
        );
        var html = view_info.html;

        $timeline_container.removeClass('loading');

        if (animate) {
          var $el = $(html);
          $el.css('opacity', 0.5);
          $meta_container.html($el);
          $el.animate(
            {
              opacity: 1,
            },
            100,
          );
          $timeline_container.children().animate(
            {
              opacity: 1,
            },
            100,
          );
        } else {
          $meta_container.html(html);
        }

        $timeline_container.css('left', '-100%');
        $timeline_container.css('width', '300%');
        $meta_container.css('left', '0');
        $meta_container.css('width', '100%');
        self._setBubbleTime(self.currentTime());
      }

      camera_grid_view.fetchCloudArchives().progress(render);
      render();
    },

    renderScaleIndicator: function() {
      // render
      var scale = this.scale();
      var left_time = this.leftTimestamp();
      var right_time = this.rightTimestamp();

      var time_width = 24 * 60 * 60;
      if (scale == 'hour') {
        time_width = 10 * 60;
      } else if (scale == 'day') {
        time_width = 2 * 60 * 60;
      } else {
        time_width = 24 * 60 * 60;
      }

      // shade
      var start_time = left_time; // - (right_time - left_time);
      var end_time = right_time; // + (right_time - left_time);

      var content = '';
      var label = '';
      var width = (time_width / (end_time - start_time)) * 100;
      var left = 0;
      var time = start_time;
      var date;
      var month, day, hour, min;
      var offset = new Date().getTimezoneOffset();
      var i = 0;
      while (time < end_time) {
        content += '<div class="';
        content += 'shade ';
        if (scale == 'hour' || scale == 'day') {
          content += 'shade-grid';
        } else {
          if (Math.floor((time - offset * 60) / (24 * 60 * 60)) % 2 === 1) {
            content += 'shade-light';
          } else {
            content += 'shade-dark';
          }
        }

        content += '" style="width:' + width + '%;left:' + left + '%;"></div>';
        // calculate label
        date = new Date(parseInt(time) * 1000);
        if (i > 0) {
          // 1 label/ 2 days when month mode
          if (!(scale == 'month' && date.getDate() % 2 === 1)) {
            label += '<span class="time_label" style="left:' + left + '%;">';
            if (scale == 'month' || scale == 'week') {
              month = date.getMonth() + 1;
              day = date.getDate();
              if (month < 10) month = '0' + month;
              if (day < 10) day = '0' + day;
              label += month + '/' + day;
            } else {
              hour = date.getHours();
              min = date.getMinutes();
              if (hour < 10) hour = '0' + hour;
              if (min < 10) min = '0' + min;
              label += hour + ':' + min;
            }
            label += '</span>';
          }
        }

        left += width;
        time += time_width;
        i++;
      }
      this.$el.find('#shades').html(content);
      this.$el.find('#label_content').html(label);
      this.$el
        .find('#timeline_container')
        .children()
        .css('opacity', 1);
    },

    disableTimeline: function(disable) {
      this.model.set('timeline_disabled', disable);
      if (disable) {
        $('#control-golive').click();
        $(
          '#control-hour, #control-day, #control-week, #control-month, #to_previous, #to_next, #control-golive',
        )
          .parent()
          .css('visibility', 'hidden');
        if (Skywatch.Live.camera_grid.isSingle()) {
          $('#control-fastforward')
            .parent()
            .css('visibility', 'hidden');
        }
      } else {
        $(
          '#control-hour, #control-day, #control-week, #control-month, #to_previous, #to_next, #control-golive',
        )
          .parent()
          .css('visibility', 'visible');
      }
    },

    _startTimer: function() {
      this._stopTimer();
      // setup cursor time tick
      var self = this;
      this._timer = setInterval(function() {
        self._updateCurrentTime();
        self._updateMeta();
      }, 1000);
    },

    _stopTimer: function() {
      clearInterval(this._timer);
    },

    _updateMeta: function() {
      // updata timeline meta
      var $timeline_container = this.$el.find('#timeline_container');
      var $meta_container = $timeline_container.find('#meta_container');
      $meta_container.empty();
      $meta_container.removeClass('group');

      var camera_grid_view = Live.camera_grid;
      var self = this;

      var view_info = camera_grid_view.getMetaTimebar(
        self.scale(),
        self.leftTimestamp(),
      );
      var html = view_info.html;
      //console.log("self.leftTimestamp()");
      //console.log(self.leftTimestamp());

      $meta_container.html(html);
      $meta_container.css('left', '0');
      $meta_container.css('width', '100%');
    },

    _updateCurrentTime: function(timestamp) {
      // check data to update
      var left_time = this.leftTimestamp();
      var right_time = this.rightTimestamp();
      var current_time = this.isLive()
        ? _.now() / 1000
        : this.currentTime() + 1;
      timestamp = timestamp || current_time;
      var params = {
        current_time: timestamp,
      };
      // right_time <= current_time && right_time < timestamp  is the same ??
      // determine that user is face to cursor page

      if (
        left_time <= current_time &&
        right_time <= current_time &&
        timestamp > right_time
      ) {
        params.right_time = this.getScaleStartTime(right_time + 10);
        params.left_time =
          params.right_time -
          this.scale_table.get(this.scale(), right_time + 10);
        // if live only and is not animating timeline, automatically go next block
        if (this.model.get('timeline_disabled') && !this._animating) {
          // avoid event mess up
          setTimeout(function() {
            $('#to_next').click();
          }, 100);
        } else if (right_time + 1 == current_time) {
          setTimeout(function() {
            $('#to_next').click();
          }, 100);
        }
      }

      if (left_time <= current_time && right_time <= current_time) {
        this._setBubbleTime(current_time);
      } else if (left_time >= current_time && right_time >= current_time) {
        this._setBubbleTime(current_time);
      }

      this.model.set(params);
    },

    isLive: function() {
      return this.$el
        .find('#control-golive')
        .parent()
        .hasClass('active');
    },

    // remove time bar, as it does not belong to any camera
    reset: function() {
      var $timeline_container = this.$el.find('#timeline_container');
      var $meta_container = $timeline_container.find('#meta_container');
      $meta_container.empty();
      this.disableTimeline(true);
    },
  });

  Live.SearchCameraView = Backbone.View.extend({
    events: {
      'input #search-device': '_onInput',
    },

    _onInput: function(event) {
      Live.camera_list.filter($(event.currentTarget).val());
    },
  });

  Setting.CameraSettingView = Skywatch.View.extend({
    events: {
      'hide.bs.modal': 'onHide',
    },

    initialize: function() {
      this._$frame = $('#camera-setting iframe');
    },

    // Override
    onHide: function() {
      this._$frame.attr('src', 'about:blank');
    },

    show: function(camera_id) {
      this.$el.modal('show');
      this._$frame.attr(
        'src',
        'camera_setting.php?camera_id=' +
          camera_id +
          '&lang=' +
          Skywatch.lang_selector,
      );
    },
  });

  Setting.PlayArchiveView = Skywatch.View.extend({
    events: {
      'click .download': 'onDownloadClick',
      'hide.bs.modal': 'onHide',
    },

    initialize: function() {
      this._$frame = $('#play-archive iframe');
    },

    // Override
    onHide: function() {
      this._$frame.attr('src', 'about:blank');
      this.$el.find('.download').off('click');
    },

    show: function(camera_id, scope, archive_id, start_time, display_time) {
      start_time = start_time || 0;
      var self = this;
      this._rendering = $.Deferred();

      this.$el.modal('show');
      this._$frame.attr('src', 'camera_view.php?camera_id=' + camera_id);
      this._$frame.load(function() {
        self._frame = this.contentWindow;
        // done
        self._rendering.resolve();
      });

      // get archive
      Skywatch.Live.cameras
        .get(camera_id)
        .getArchiveById(scope, archive_id)
        .done(function(archive) {
          var url = archive.getArchiveURL(scope, false, true);
          // set title
          display_time = display_time || archive.get('timestamp');
          self.$el.find('.modal-title').text(self.toTimeString(display_time));

          self._rendering.done(function() {
            self._frame.Skywatch.Video.showControls();
            self._frame.Skywatch.Video.source(url, camera_id).done(function() {
              self._frame.Skywatch.Video.seek(start_time);
              self._frame.Skywatch.Video.play();
            });
          });

          self.$el.find('.download').on('click', function(e) {
            // redirect to download path
            window.open(url, '_blank');
          });
        });
    },
  });

  // global instances

  Live.camera_list = new Live.CameraListView({
    el: '#camera-list',
    model: Live.cameras,
  });

  Live.camera_grid = new Live.CameraGridView({
    el: '#camera-grid-container',
  });
  Live.control_bar = new Live.ControlBarView({
    el: '#controlbar',
    model: Live.control_state,
  });

  Live.search_camera = new Live.SearchCameraView({
    el: '#camera-list #search-tab',
  });

  Setting.camera_setting = new Setting.CameraSettingView({
    el: '#camera-setting',
  });
  Setting.play_archive = new Setting.PlayArchiveView({
    el: '#play-archive',
  });
};
