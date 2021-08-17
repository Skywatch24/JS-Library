/* eslint-disable */
'use strict';

var Skywatch = window.Skywatch || {};
var document = window.document;

$(document).ajaxError(function(event, jqXHR, ajaxOptions, data) {
  if (jqXHR.status === 401) {
    console.info('invalid user');
    $.removeCookie('api_key', {
      path: '/',
    });
    $(document).trigger('session.expired');
  }
});

$.ajaxSetup({
  cache: false,
  dataType: 'text',
});

// Use post to emulate PUT and DELETE
Backbone.emulateHTTP = true;

// replace default ajax to rectify possible attack
Backbone.ajax = function(options) {
  // default is json, force text
  options.dataType = 'text';
  // dont append callbacks directly
  var success = options.success;
  var error = options.error;
  delete options.success;
  delete options.error;
  // rebuild arguments
  var args = Array.prototype.slice.call(arguments, 1);
  args.unshift(options);
  // do ajax, proxy via promise
  return Backbone.$.ajax.apply(Backbone.$, args).then(
    function(data) {
      // rectify response
      data = data.replace(/<script.*script>/, '');
      var d = $.Deferred();
      try {
        // never assume server is right
        data = $.parseJSON(data);
      } catch (e) {
        // report error
        error.call(this, e);
        return d.reject(e);
      }
      // rebuild arguments
      var args = Array.prototype.slice.call(arguments, 1);
      args.unshift(data);
      // return proxied response
      success.apply(this, args);
      return d.resolve.apply(d, args);
    },
    function() {
      error.apply(this, arguments);
      var d = $.Deferred();
      return d.reject.apply(d, arguments);
    },
    function() {
      var d = $.Deferred();
      return d.progress.apply(d, arguments);
    },
  );
};

// Customize base classes
var SkywatchModel = Backbone.Model.extend({
  sync: function(method, model, options) {
    // default values
    options = options || {};
    options.data = options.data || {};
    options.data = $.extend(options.data, model.attributes);
    // extract api key
    // options.data.api_key = $.cookie('api_key');
    // set method_type when
    if (method == 'update') {
      options.data.method_type = 'PUT';
    } else if (method == 'delete') {
      options.data.method_type = 'DELETE';
    }
    // normalize parameters
    options.data = $.param(options.data);

    // call super.sync
    return Backbone.Model.prototype.sync.call(this, method, model, options);
  },
});

// Customize base classes
var SkywatchCollection = Backbone.Collection.extend({
  sync: function(method, model, options) {
    // default values
    options = options || {};
    options.data = options.data || {};
    // extract api key
    // options.data.api_key = $.cookie('api_key');
    // set method_type
    if (method == 'delete') {
      options.data.method_type = 'DELETE';
    } else if (method == 'update') {
      options.data.method_type = 'PUT';
    }
    // normalize parameters
    options.data = $.param(options.data);
    // call super.sync
    return Backbone.Collection.prototype.sync.call(
      this,
      method,
      model,
      options,
    );
  },
});

var RealtimeCollection = SkywatchCollection.extend({
  FETCH_LENGTH: 10,

  initialize: function() {},
  fetchMore: function() {
    var self = this;
    var data = {
      offset: self.length,
      length: self.FETCH_LENGTH,
      lang: Skywatch.lang_selector,
    };
    var deferred = $.Deferred();
    this.fetch({data: data, add: true, remove: false}).done(function(data) {
      deferred.resolve(data);
    });
    return deferred.promise();
  },
  updateExisting: function(data) {
    // also update existing data
    this.add(data, {merge: true});
  },
});

// live view namespace
var Live = (Skywatch.Live = {});

// describe each camera/live property
Live.CameraModel = SkywatchModel.extend({
  urlRoot: Skywatch.api_path + 'cameras',

  initialize: function() {
    this._cloud_archives = new Live.ArchiveCollection(undefined, {
      camera: this,
      scope: 'CloudArchives',
    });
    this._fetched_cloud_archives = false;
    this._fetched_cloud_archives_done = false;
    this._fetch_cloud_promise = false;
    this._current_clould_archive_request = null;
    this._current_clould_archive_request_timer = 0;

    this._local_archives = new Live.ArchiveCollection(undefined, {
      camera: this,
      scope: 'LocalArchives',
    });
    this._fetched_local_archives = false;
    this._fetched_archives_lock = false;
    this._fetched_local_archives_done = false;
    this._fetch_local_promise = false;

    this._info = null;
    this._cache_time = 0;
  },

  fetchCloudArchives: function() {
    if (this._fetched_cloud_archives) {
      if (this._fetched_cloud_archives_done) {
        return $.Deferred().resolve(this._cloud_archives.models);
      } else {
        return this._fetch_cloud_deffered.notify(this._cloud_archives.models);
      }
    }
    this._fetched_cloud_archives = true;
    this._fetch_cloud_deffered = this._fetchAllInterval(
      this.get('id'),
      'CloudArchives',
      this._cloud_archives,
    );
    // remember which camera is pulling archive, so we can cancel it later
    if (this.collection) {
      this.collection.addPulling(this.get('id'));
    }
    return this._fetch_cloud_deffered.promise();
  },

  fetchLocalArchives: function() {
    if (this._fetched_local_archives) {
      if (this._fetched_local_archives_done) {
        return $.Deferred().resolve(this._local_archives.models);
      } else {
        return this._fetch_local_deffered.notify(this._local_archives.models);
      }
    }
    this._fetched_local_archives = true;
    this._fetch_local_deffered = this._fetchAllInterval(
      this.get('id'),
      'LocalArchives',
      this._local_archives,
    );
    return this._fetch_local_deffered.promise();
  },

  getLoadingArchivesState: function() {
    return this._fetched_archives_lock;
  },

  lockLoadingArchives: function() {
    this._fetched_archives_lock = true;
    return this._fetched_archives_lock;
  },

  unlockLoadingArchives: function() {
    this._fetched_archives_lock = false;
    return this._fetched_archives_lock;
  },

  // NOTE only CR
  getCloudArchive: function(timestamp) {
    timestamp = Math.floor(timestamp);
    var cloud_archive = this._cloud_archives
      .chain()
      .filter(function(model) {
        return model.get('event_type') === '10';
      })
      .min(function(model) {
        var temp = model.get('timestamp');
        var diff = model.get('timestamp') - timestamp;
        if (diff < 0 && Math.abs(diff) >= model.get('length')) {
          return Number.MAX_VALUE;
        }
        return diff;
      })
      .value();

    if (!cloud_archive.get) {
      return null;
    }
    // check if click into non-archive gap
    try {
      if (cloud_archive.attributes.timestamp) {
        var timestamp_found = parseInt(cloud_archive.attributes.timestamp);
        var length = parseInt(cloud_archive.attributes.length); // archive length

        // if there are no archives in the right side of cursor,
        // the first archive may be gotten

        if (timestamp > timestamp_found + length) {
          // length == 600 : 10 min for one cloud archives
          return -1; // go to live
        }
      }
    } catch (e) {
      console.log('cloud_archive.attributes.timestamp not found');
    }
    return cloud_archive;
  },

  // NOTE only CR
  getLocalArchive: function(timestamp) {
    timestamp = Math.floor(timestamp);
    var local_archive = this._local_archives
      .chain()
      .filter(function(model) {
        return model.get('type') === 'record';
      })
      .min(function(model) {
        var diff = model.get('timestamp') - timestamp;
        if (diff < 0 && Math.abs(diff) >= model.get('length')) {
          return Number.MAX_VALUE;
        }
        return diff;
      })
      .value();
    // check if click into non-archive gap
    try {
      if (local_archive.attributes.timestamp) {
        var timestamp_found = parseInt(local_archive.attributes.timestamp);
        var length = parseInt(local_archive.attributes.length);

        // if there are no archives in the right side of cursor,
        // the first archive may be gotten

        try {
          //if(this.attributes.model_id){
          //var model_id = this.attributes.model_id;
          if (timestamp > timestamp_found + length) {
            return -1; // go to live
          }
          //}
        } catch (e) {}
      }
    } catch (e) {
      console.log('local_archive.attributes.timestamp not found');
    }

    if (!local_archive.get) {
      return null;
    }
    return local_archive;
  },

  // gateway for getArchive of different scope
  getArchiveById: function(scope, archive_id) {
    var deferred = $.Deferred();
    if (scope == 'LocalArchives') {
      return this.getLocalArchiveById(archive_id, deferred);
    } else {
      return this.getCloudArchiveById(archive_id, deferred);
    }
  },

  getCloudArchiveById: function(archive_id, deferred) {
    var collection = this._cloud_archives;
    var cloud_archive = collection.get(archive_id);

    if (typeof cloud_archive != 'undefined' && cloud_archive.get) {
      return deferred.resolve(cloud_archive);
    } else {
      var params = {
        // api_key: $.cookie('api_key'),
        scope: 'CloudArchives',
        archive_id: archive_id,
      };
      $.get(
        'api/v2/cameras/' + this.get('id') + '/archives/info',
        params,
        function(data) {
          data = data.replace(/<script.*script>/, '');
          data = JSON.parse(data);
          var archive = new Skywatch.Live.ArchiveModel(data);
          // backbone will add collection attribute to archive model
          collection.add(archive, {merge: true});
          return deferred.resolve(collection.get(archive.get('id')));
        },
      );
    }
    return deferred.promise();
  },

  getLocalArchiveById: function(archive_id, deferred) {
    var collection = this._local_archives;
    var local_archive = collection.get(archive_id);

    if (typeof local_archive != 'undefined' && local_archive.get) {
      return deferred.resolve(local_archive);
    } else {
      var params = {
        // api_key: $.cookie('api_key'),
        scope: 'LocalArchives',
        archive_id: archive_id,
      };
      $.get(
        'api/v2/cameras/' + this.get('id') + '/archives/info',
        params,
        function(data) {
          data = data.replace(/<script.*script>/, '');
          data = JSON.parse(data);
          var archive = new Skywatch.Live.ArchiveModel(data);
          // backbone will add collection attribute to archive model
          collection.add(archive, {merge: true});
          return deferred.resolve(collection.get(archive.get('id')));
        },
      );
    }
    return local_archive;
  },

  // NOTE only CR
  getArchivesByRange: function(from, to) {
    var start_index = false;
    var end_index = false;
    _.each(this._cloud_archives.models, function(archive, index) {
      if (archive.get('timestamp') >= from && archive.get('timestamp') <= to) {
        if (start_index === false) {
          start_index = index;
        }
        end_index = index;
      }
    });

    if (start_index === false && end_index === false) return [];

    return this._cloud_archives
      .chain()
      .slice(start_index, end_index + 1)
      .filter(function(model) {
        return model.get('event_type') === '10';
      })
      .value();
  },

  getNextPlaybackArchive: function(archive, smart_ff) {
    if (archive.get('source') == 'sdcard') {
      return this.getNextLocalArchive(archive, smart_ff);
    } else {
      return this.getNextCloudArchive(archive, smart_ff);
    }
  },

  getNextCloudArchive: function(archive, smart_ff) {
    var i = this._cloud_archives.indexOf(archive);
    console.log(this.this._cloud_archives[i]);
    var next_archive;
    while (true) {
      ++i;
      next_archive = this._cloud_archives.at(i);
      // invalid
      if (!next_archive) {
        break;
      }
      // valid && CR && smart_ff
      if (
        next_archive &&
        next_archive.get('event_type') === '10' &&
        (!smart_ff || next_archive.fastforwardAvailable())
      ) {
        break;
      }
    }
    var status = 'ok';
    if (!next_archive) {
      status = 'end';
    } else if (
      next_archive.get('timestamp') -
        (archive.get('timestamp') * 1 + archive.get('length') * 1) >=
      3
    ) {
      status = 'hole';
    }
    return {
      status: status,
      archive: next_archive,
    };
  },

  getNextLocalArchive: function(archive, smart_ff) {
    var i = this._local_archives.indexOf(archive);
    var next_archive;
    while (true) {
      ++i;
      next_archive = this._local_archives.at(i);
      // invalid
      if (!next_archive) {
        break;
      }
      // valid && CR && smart_ff
      if (
        next_archive &&
        next_archive.get('type') === 'record' &&
        (!smart_ff || next_archive.fastforwardAvailable())
      ) {
        break;
      }
    }
    var status = 'ok';
    if (!next_archive) {
      status = 'end';
    } else if (
      next_archive.get('timestamp') -
        (archive.get('timestamp') * 1 + archive.get('length') * 1) >=
      3
    ) {
      status = 'hole';
    }
    return {
      status: status,
      archive: next_archive,
    };
  },

  getCacheTime: function() {
    return this._cache_time;
  },

  _fetchAllInterval: function(camera_id, scope, archives) {
    var deferred = $.Deferred();
    // get cachetime
    this.fetchCacheTime(_.now() / 1000).done(function(timestamp) {
      timestamp = timestamp.replace(/<script.*script>/, '');
      deferred.progress([]);
    });
    var current_time = new Date().getTime() / 1000;
    var current_timestamp = Math.round(current_time);
    this._fetchNextInterval(
      camera_id,
      scope,
      archives,
      deferred,
      current_timestamp,
      false,
      false,
    );
    return deferred;
  },

  _fetchNextInterval: function(
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

    // temp
    Skywatch.api_path = 'http://localhost:3000/api/v2/';
    $.cookie('username', 'switch+');
    $.cookie('api_key', '377db4a8c589b71011250d131b5da390');

    var xhr = $.get(Skywatch.api_path + 'cameras/' + camera_id + '/archives', {
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
            self._fetched_cloud_archives_done = true;
            // remove pulling mark
            if (self.collection) {
              self.collection.removePulling(self.get('id'));
            }
            return deferred.resolve(self._cloud_archives.models);
          } else {
            self._fetched_local_archives_done = true;
            return deferred.resolve(self._local_archives.models);
          }
        } else {
          deferred.notify(data.archives);
          archives.add(data.archives);
          self._current_clould_archive_request_timer = setTimeout(function() {
            if (typeof data.next_url != 'undefined') {
              self._fetchNextInterval(
                camera_id,
                scope,
                archives,
                deferred,
                false,
                false,
                data.next_url,
              );
            } else {
              self._fetchNextInterval(camera_id, scope, archives, deferred);
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
          if (self.collection) {
            self.collection.removePulling(self.get('id'));
          }
        }
      });

    if (scope === 'CloudArchives') {
      this._current_clould_archive_request = xhr;
    }

    return xhr;
  },

  // puclic interface for node to update data
  addCloudArchive: function(archive) {
    this._cloud_archives.add(archive, {merge: true});
  },

  addLocalArchive: function(archive) {
    this._local_archives.add(archive);
  },

  fetchStatus: function() {
    return $.get(Skywatch.api_path + 'cameras/' + this.get('id') + '/status', {
      // api_key: $.cookie('api_key')
    }).done(function(data) {
      data = data.replace(/<script.*script>/, '');
      return $.Deferred().resolve(data);
    });
  },

  fetchInfo: function() {
    if (this._info) {
      return $.Deferred()
        .resolve(this._info)
        .promise();
    }
    var self = this;
    return $.get(Skywatch.api_path + 'cameras/' + this.get('id') + '/info', {
      // api_key: $.cookie('api_key')
    }).done(function(data) {
      data = data.replace(/<script.*script>/, '');
      self._info = data;
    });
  },

  fetchCacheTime: function(timestamp) {
    var self = this;
    return $.get(
      Skywatch.api_path + 'cameras/' + this.get('id') + '/cachetime',
      {
        // api_key: $.cookie('api_key'),
        timestamp: timestamp,
      },
    ).done(function(timestamp) {
      timestamp = timestamp.replace(/<script.*script>/, '');
      if (timestamp) {
        self._cache_time = parseInt(timestamp, 10);
      } else {
        self._cache_time = 0;
      }
    });
  },

  // model.destroy will remove entire model, which is not desired
  inactive: function(clear_settings) {
    // custom deletion to handle 'inactive' camera
    var self = this;
    var deferred = $.Deferred();
    var url = this.url();
    var params = {
      // api_key: $.cookie('api_key'),
      method_type: 'DELETE',
      clear_settings: clear_settings,
    };
    var camera_id = this.get('id');
    $.post(url, params)
      .done(function(flag) {
        flag = flag.replace(/<script.*script>/, '');
        var camera = {
          id: camera_id,
          active: '0',
        };
        // to fire correct event
        Live.groups.removeCamera(camera_id);
        self.set('active', 0);
        deferred.resolve();
      })
      .fail(function() {
        deferred.reject();
      });

    return deferred.promise();
  },

  deleteArchives: function(scope, event_list) {
    var camera_id = this.get('id');
    var params = {
      // api_key: $.cookie('api_key'),
      archive_list: JSON.stringify(event_list),
      scope: scope,
      method_type: 'DELETE',
    };
    var self = this;
    return $.post(
      Skywatch.api_path + 'cameras/' + this.get('id') + '/archives',
      params,
    ).done(function() {
      var models = [];
      _.each(event_list, function(event_id) {
        models.push({id: event_id});
      });
      if (scope == 'CloudArchives') {
        self._cloud_archives.remove(models);
      } else {
        self._local_archives.remove(models);
      }
    });
  },

  cancelFetchCloudArchives: function() {
    return;
    if (this._fetched_cloud_archives_done) {
      // already finished
      return;
    }
    if (!this._fetched_cloud_archives) {
      // not started yet
      return;
    }
    // reject pending request
    clearTimeout(this._current_clould_archive_request_timer);
    // reject current request
    if (this._current_clould_archive_request) {
      this._current_clould_archive_request.abort();
    }
    // reset flag
    this._fetched_cloud_archives = false;
  },

  getMetaList: function(time_i_width, left_time, right_time) {
    var i = false;
    var scale_arr = this._cloud_archives.scale_arr;
    var all_dataset = this._cloud_archives.all_dataset;
    var is_nvr_camera = false;

    if (this.get('model_id') == '61') {
      is_nvr_camera = true;
      scale_arr = this._local_archives.scale_arr;
      all_dataset = this._local_archives.all_dataset;
    }
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
        if (is_nvr_camera) {
          data.meta = 1;
        } else {
          if (this.getCacheTime() !== 0 && data.start >= this.getCacheTime()) {
            data.meta = 1;
          }
        }
      } else {
        data.meta = all_dataset['' + scale][index];
      }
      meta_list.push(data);
    }
    return meta_list;
  },
});

// describe camera list
Live.CameraCollection = SkywatchCollection.extend({
  model: Live.CameraModel,
  url: Skywatch.api_path + 'cameras',
  comparator: 'name', // sort by name

  // fetch cameras per request
  _STEP: 100,

  initialize: function() {
    this._fetched = false;
    this._fetching = $.Deferred();
    this._pulling = {};
  },

  fetchIncrementally: function() {
    if (!this._fetched) {
      this._fetched = true;
      this._fetchNext(0);
    }
    return this._fetching.promise();
  },

  _fetchNext: function(offset) {
    var self = this;
    return this.fetch({
      data: {
        offset: offset,
        length: this._STEP,
      },
      remove: false,
      merge: true,
    }).then(function(data) {
      // get device_list
      var device_list = Skywatch.Live.cameras.models.map(function(m) {
        return m.attributes;
      });

      // set to needed modules
      if (Skywatch.RuleActions && Skywatch.RuleActions.setDeviceList) {
        Skywatch.RuleActions.setDeviceList(device_list);
      }
      if (Skywatch.Rules && Skywatch.Rules.setDeviceList) {
        Skywatch.Rules.setDeviceList(device_list);
      }

      if (data.length === self._STEP) {
        // chain next fetch
        return self._fetchNext(offset + self._STEP);
      } else {
        // resolve this promise
        return self._fetching.resolve();
      }
    });
  },

  fetchCloudArchives: function(camera_ids) {
    var deferred = $.Deferred();
    var jobs = [];
    var self = this;
    _.each(camera_ids, function(camera_id) {
      if (camera_id === 0) {
        return;
      }
      var camera = self.get(camera_id);
      if (typeof camera === 'undefined') {
        return;
      }
      var job;
      if (camera.get('model_id') == '61') {
        job = camera.fetchLocalArchives();
      } else {
        job = camera.fetchCloudArchives();
      }

      jobs.push(job);
      job.progress(function(archives) {
        deferred.notify(camera, archives);
      });
    });

    $.when.apply($, jobs).done(function() {
      deferred.resolve();
    });
    return deferred;
  },

  addPulling: function(id) {
    this._pulling[id] = true;
  },

  removePulling: function(id) {
    delete this._pulling[id];
  },

  cancelInactivePulling: function(active_camera_ids) {
    var self = this;
    _.each(this._pulling, function(v, k) {
      if (active_camera_ids.indexOf(k) >= 0) {
        return;
      }
      var camera = self.get(k);
      if (camera && camera.cancelFetchCloudArchives) {
        camera.cancelFetchCloudArchives();
      }
    });
  },

  getCameraCount: function() {
    return this.filter(function(camera) {
      return camera.get('active') == '1';
    }).length;
  },
});

// describe each tab property
Live.GroupModel = SkywatchModel.extend({
  urlRoot: Skywatch.api_path + 'groups',

  changeCameraCount: function(camera_count, options) {
    var silent = options && options.silent;
    var cameras = _.clone(this.get('cameras'));

    if (camera_count > 16) {
      // too more camera
      return false;
    }

    var old_count = cameras.length;
    if (old_count === camera_count) return;

    if (old_count > camera_count) {
      cameras = cameras.slice(0, camera_count);
    } else {
      var c = camera_count - old_count;
      while (c-- > 0) {
        cameras.push({id: 0});
      }
    }

    this.set('cameras', cameras, {
      silent: silent,
    });
  },

  hasCamera: function(camera_id) {
    var cameras = this.get('cameras');
    return !!_.find(cameras, function(camera) {
      return camera.id == camera_id;
    });
  },

  addCamera: function(camera_id) {
    console.error('addCamera is called');
    // check duplication
    Live.groups.each(function(group) {
      // NOTE group may be deleted during iteration
      if (!group) {
        return;
      }
      var cameras = group.get('cameras');
      // remove duplication
      _.each(cameras, function(camera) {
        if (camera.id == camera_id) {
          group.removeCamera(camera_id);
        }
      });
    });

    // deep copy it make sure change event is fired
    var cameras = _.cloneDeep(this.get('cameras'));
    // find empty camera
    var i = _.findIndex(cameras, function(camera) {
      return camera.id == '0';
    });
    // if full
    if (i < 0) {
      var grid = Math.floor(Math.sqrt(cameras.length)) + 1;
      i = grid * grid - cameras.length;
      while (i--) {
        cameras.push({
          id: 0,
        });
      }

      // find insert point
      i = _.findIndex(cameras, function(camera) {
        return camera.id == '0';
      });
    }

    cameras[i].id = camera_id;
    this.set('cameras', cameras);
  },

  removeCamera: function(camera_id, options) {
    var silent = options && options.silent;
    var cameras = _.cloneDeep(this.get('cameras'));

    // find camera
    var i = _.findIndex(cameras, function(camera) {
      return camera.id == camera_id;
    });
    if (i < 0) {
      return;
    }
    cameras[i].id = 0;

    // if only has one camera, just remove this
    var remain = _.filter(cameras, function(camera) {
      return camera.id != '0';
    });
    // if (remain.length <= 1) {
    //     this.destroy();
    //     return;
    // }

    // shrink to fit
    var new_grid = Math.ceil(Math.sqrt(remain.length));
    var old_grid = Math.ceil(Math.sqrt(cameras.length));
    if (new_grid < old_grid) {
      i = new_grid * new_grid - remain.length;
      while (i--) {
        remain.push({
          id: 0,
        });
      }
      cameras = remain;
    }

    this.set('cameras', cameras, {
      silent: silent,
    });
  },

  swapCamera: function(index_1, index_2) {
    var cameras = _.cloneDeep(this.get('cameras'));
    var tmp = cameras[index_1];
    cameras[index_1] = cameras[index_2];
    cameras[index_2] = tmp;
    this.set('cameras', cameras);
  },

  setCamera: function(index, camera_id) {
    var self = this;
    // prevent duplicate cameras
    this.collection.each(function(group) {
      group.removeCamera(camera_id, {
        // prevent fire duplicate events
        silent: group === this,
      });
    });

    var cameras = _.cloneDeep(this.get('cameras'));

    cameras[index].id = camera_id;

    this.set('cameras', cameras);
  },

  getCameraCount: function() {
    return _.filter(this.get('cameras'), function(camera) {
      return camera.id != '0';
    }).length;
  },

  isFull: function() {
    return this.getCameraCount() >= 16;
  },
});

// collection of tabs
Live.GroupCollection = SkywatchCollection.extend({
  model: Live.GroupModel,
  url: Skywatch.api_path + 'groups',

  initialize: function() {
    this.listenTo(this, 'add', this._onAdd);
  },

  hasCamera: function(camera_id) {
    return this.some(function(group) {
      return group.hasCamera(camera_id);
    });
  },

  findCamera: function(camera_id) {
    return this.find(function(group) {
      return group.hasCamera(camera_id);
    });
  },

  removeCamera: function(camera_id) {
    this.each(function(group) {
      group.removeCamera(camera_id);
    });
  },

  _onAdd: function(group_model) {
    // don't add id==0
    Live.cameras.add(
      _.filter(group_model.get('cameras'), function(camera) {
        return (
          camera.id != '0' && typeof Live.cameras.get(camera.id) === 'undefined'
        );
      }),
    );

    // make sure the number of cameras is corret
    var cameras = group_model.get('cameras');
    var camera_count = _.reduce(
      cameras,
      function(memo, camera) {
        return memo + (camera.id != '0' ? 1 : 0);
      },
      0,
    );

    var total =
      Math.ceil(Math.sqrt(camera_count)) * Math.ceil(Math.sqrt(camera_count));
    while (total - cameras.length > 0) {
      cameras.push({id: 0});
    }
    group_model.set('cameras', cameras);
  },
});

Live.ArchiveModel = SkywatchModel.extend({
  initialize: function() {
    this._cached_url = {
      false: {
        expires: 0,
        url: '',
      },
      true: {
        expires: 0,
        url: '',
      },
    };
    this._current_fetching_url = null;
  },

  // gateway for getUrl
  getArchiveURL: function(scope, fastforward, force_download) {
    if (scope == 'CloudArchives') {
      return this.getURL(fastforward);
    } else {
      return this.getLocalURL(fastforward);
    }
  },

  getURL: function(fastforward, avi, force_download) {
    fastforward = fastforward || false;
    avi = avi || false;
    force_download = force_download || false;

    var data = {
      // api_key: $.cookie('api_key'),
      scope: 'CloudArchives',
      archive_id: this.get('id'),
      media_type: this.get('media_type'),
      region: this.get('region'),
      smart_ff: '0',
      avi: '0',
    };
    if (fastforward === true && this.get('smart_ff') == '1') {
      data.smart_ff = '1';
    }
    if (avi === true) {
      data.avi = '1';
    }
    if (force_download) {
      data.force_download = '1';
    }
    data.from = this.get('from') || '';
    return _.template(
      Skywatch.api_path +
        'cameras/<%= camera_id %>/archives/download?<%= params %>',
    )({
      camera_id: this.collection.getCamera().get('id'),
      params: $.param(data),
    });
  },

  getLocalURL: function() {
    // format local time
    var $date = new Date(parseInt(this.get('timestamp'), 10) * 1000);
    var year = $date.getFullYear();
    var month = $date.getMonth() + 1;
    var day = $date.getDate();
    var hour =
      $date.getHours() >= 10 ? $date.getHours() : '0' + $date.getHours();
    var minute =
      $date.getMinutes() >= 10 ? $date.getMinutes() : '0' + $date.getMinutes();
    var second =
      $date.getSeconds() >= 10 ? $date.getSeconds() : '0' + $date.getSeconds();
    var archive_local_time =
      year + '|' + month + '|' + day + '|' + hour + '|' + minute + '|' + second;

    var data = {
      // api_key: $.cookie('api_key'),
      scope: 'LocalArchives',
      archive_id: this.get('destPath'),
      archive_local_time: archive_local_time,
    };
    return _.template(
      Skywatch.api_path +
        'cameras/<%= camera_id %>/archives/download?<%= params %>',
    )({
      camera_id: this.collection.getCamera().get('id'),
      params: $.param(data),
    });
  },

  fetchURL: function(fastforward) {
    if (this.get && this.get('source') == 'server') {
      return this.fetchCloudArchiveUrl(fastforward);
    } else {
      return this.fetchLocalArchiveUrl(fastforward);
    }
  },

  fetchCloudArchiveUrl: function(fastforward) {
    fastforward = !!fastforward;

    if (new Date().getTime() < this._cached_url[fastforward].expires) {
      return $.Deferred().resolve(this._cached_url[fastforward].url);
    }

    // cancel last request
    this.cancelURLFetching();
    var data = {
      // api_key: $.cookie('api_key'),
      scope: 'CloudArchives',
      archive_id: this.get('id'),
      media_type: this.get('media_type'),
      region: this.get('region'),
    };
    if (fastforward && this.get('smart_ff') == '1') {
      data.smart_ff = '1';
    }
    var url = _.template(
      Skywatch.api_path + 'cameras/<%= camera_id %>/archives/link',
    )({
      camera_id: this.collection.getCamera().get('id'),
    });
    var self = this;
    var deferred = $.Deferred();
    function fetch() {
      self._current_fetching_url = $.get(url, $.param(data))
        .done(function(url) {
          url = url.replace(/<script.*script>/, '');
          var expires = url.match(/Expires=(\d+)/);
          expires = expires[1] * 1000;
          self._cached_url[fastforward].expires = expires;
          self._cached_url[fastforward].url = url;
          deferred.resolve(url);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            // programly abort, need not retry
            return;
          }
          // retry again
          return fetch();
        });
      return self._current_fetching_url;
    }
    fetch();
    return deferred.promise();
  },

  fetchLocalArchiveUrl: function(fastforward) {
    // cancel last request
    this.cancelURLFetching();
    var url = this.getLocalURL();
    var deferred = $.Deferred();
    deferred.resolve(url);
    return deferred.promise();
  },

  cancelURLFetching: function() {
    if (!this._current_fetching_url) {
      return;
    }
    if (this._current_fetching_url.state() === 'pending') {
      this._current_fetching_url.abort();
    }
    this._current_fetching_url = null;
  },

  fastforwardAvailable: function() {
    if (this.get('smart_ff') == '1') {
      return true;
    }
    return false;
  },

  getSmartFFTimestamp: function(video_time) {
    var meta;
    try {
      meta = JSON.parse(this.get('meta'));
    } catch (e) {
      console.warn('json error', this.get('meta'));
      return 0;
    }
    var second, ff_second, ff_second_next;
    var meta_keys = _.keys(meta);
    var time = false;

    for (var i = 0; i < meta_keys.length - 1; i++) {
      ff_second = parseFloat(meta[meta_keys[i]][0]);
      ff_second_next = parseFloat(meta[meta_keys[i + 1]][0]);
      if (ff_second <= video_time && ff_second_next >= video_time) {
        time =
          ((video_time - ff_second) / (ff_second_next - ff_second)) *
            (parseInt(meta_keys[i + 1], 10) - parseInt(meta_keys[i], 10)) +
          parseInt(meta_keys[i], 10);
      }
    }
    var timestamp = parseInt(this.get('timestamp'), 10) + Math.floor(time);
    //             console.log(video_time, time,  new Date(timestamp * 1000), this.get('meta'));
    return timestamp;
  },

  /**
   * @brief convert global unix time to real video time
   * @param unix_time global unix time by second
   * @param is_smart_ff should convert to smart ff
   */
  toArchiveTime: function(unix_time, is_smart_ff) {
    var video_time = Math.floor(unix_time - this.get('timestamp'));
    if (!is_smart_ff) {
      // normal archive: global time - start time
      return video_time;
    }

    var meta;
    try {
      meta = JSON.parse(this.get('meta'));
    } catch (e) {
      console.warn('json error', this.get('meta'));
      return 0;
    }
    var second, ff_second, ff_second_next;
    var meta_keys = _.keys(meta);
    var time = 0;

    for (var i = 0; i < meta_keys.length - 1; i++) {
      if (!(meta_keys[i] <= video_time && video_time <= meta_keys[i + 1])) {
        continue;
      }
      time = meta[meta_keys[i]][0];
      break;
    }
    return Math.floor(time);
  },
});

Live.ArchiveCollection = SkywatchCollection.extend({
  model: Live.ArchiveModel,
  comparator: 'timestamp', // sort by timestamp

  initialize: function(models, options) {
    this._camera = options.camera;
    this._scope = options.scope;
    this.scale_arr = [20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240];

    if (
      this._scope == 'CloudArchives' ||
      options.camera.get('model_id') == '61' ||
      options.camera.attributes.model == '61'
    ) {
      this.on('add', this.parseMeta);
      this.on('change', this.parseMeta);
      this.all_dataset = {};
    }
  },

  getCamera: function() {
    return this._camera;
  },

  parseMeta: function(archive) {
    var scale_arr = this.scale_arr;
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

    timestamp = parseInt(archive.get('timestamp'));
    if (
      typeof archive.get('length') == 'undefined' &&
      this._camera.get('model_id') == '61'
    ) {
      length = 60;
    } else {
      length = parseInt(archive.get('length'));
    }

    tmp_meta = false;
    meta_data = false;
    if (length <= 20) return;

    if (!archive.get('smart_ff') || archive.get('smart_ff') == '0') {
      // use zero as meta
      meta = default_meta;
    } else {
      try {
        meta = JSON.parse(archive.get('meta'));
      } catch (e) {
        console.error('Parse json meta data error');
        console.error(archive.get('meta'));
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
      if (typeof this.all_dataset['' + scale] == 'undefined') {
        this.all_dataset['' + scale] = {};
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
        if (typeof this.all_dataset[scale][index] == 'undefined') {
          this.all_dataset[scale][index] = meta_data[second];
          tmp_meta[index] = meta_data[second];
        } else {
          if (this.all_dataset[scale][index] < meta_data[second]) {
            this.all_dataset[scale][index] = meta_data[second];
            tmp_meta[index] = meta_data[second];
          }
        }
      }
      meta_data = tmp_meta;
    }
  },
});

Live.MessageCollection = SkywatchCollection.extend({
  FETCH_LENGTH: 10,
  url: Skywatch.api_path + 'user/message',
  initialize: function(models, options) {
    this.type = typeof options.type != 'undefined' ? options.type : 'camera';
    this.camera_id =
      typeof options.camera_id != 'undefined' ? options.camera_id : -1;
    this.group_id =
      typeof options.group_id != 'undefined' ? options.group_id : -1;
    this.is_done = false; // whether already fetched the oldest data
  },
  fetchCount: function(scope) {
    var params = {
      // api_key: $.cookie('api_key'),
      lang: Skywatch.lang_selector,
      scope: scope,
    };
    if (this.type == 'camera') {
      params.camera_id = this.camera_id;
    } else {
      params.group_id = this.group_id;
    }
    return $.get('api/v2/user/message/count', params).done(function(data) {
      data = data.replace(/<script.*script>/, '');
      return $.Deferred().resolve(data);
    });
  },
  updateAllMessageStatus: function(status) {
    var event_list = [];
    _.each(this.models, function(model) {
      event_list.push({
        event_id: model.get('event_id'),
        event_type: model.get('event_type'),
      });
    });
    var params = {
      // api_key: $.cookie('api_key'),
      // event_list: event_list,
      status: status,
    };
    return $.post('api/v2/user/message', params).done(function(data) {
      data = data.replace(/<script.*script>/, '');
      return $.Deferred().resolve(data);
    });
  },
  fetchLatestOnes: function() {
    var self = this;
    var data = {
      offset: 0,
      length: self.FETCH_LENGTH,
      lang: Skywatch.lang_selector,
      scope: 'all',
    };
    if (this.type == 'camera') {
      data.camera_id = this.camera_id;
    } else {
      data.group_id = this.group_id;
    }
    var deferred = $.Deferred();
    this.fetch({data: data, add: true, remove: false, merge: true}).done(
      function(data) {
        data = data.replace(/<script.*script>/, '');
        deferred.resolve(data);
      },
    );
    return deferred.promise();
  },
  fetchMore: function() {
    var self = this;
    var data = {
      offset: self.length,
      length: self.FETCH_LENGTH,
      lang: Skywatch.lang_selector,
      scope: 'all',
    };
    if (this.type == 'camera') {
      data.camera_id = self.camera_id;
    } else {
      data.group_id = self.group_id;
    }
    var deferred = $.Deferred();
    this.fetch({data: data, add: true, remove: false}).done(function(data) {
      self.is_done = data.length < self.FETCH_LENGTH;
      deferred.resolve(data);
    });
    return deferred.promise();
  },
  updateExisting: function(data) {
    // also update existing data
    this.add(data, {merge: true});
  },
});

Live.ControlState = SkywatchModel.extend({
  defaults: {
    left_time: 0,
    right_time: 0,
    current_time: 0,
    scale: '0',
    state: 'normal',
    group_id: 0,
    mute: false,
    type: false,
    highlight_start: false,
    highlight_end: false,
  },
});

// Live.MessageCollection = RealtimeCollection.extend({
//     url: Skywatch.api_path + 'user/message',
// });

// global instances
Live.cameras = new Live.CameraCollection();
Live.groups = new Live.GroupCollection();
Live.control_state = new Live.ControlState({});

window.Skywatch.Live = Live;

// User setting namespace
var Setting = {};

Setting.AccountModel = SkywatchModel.extend({
  urlRoot: Skywatch.api_path + 'user/info',
});

Setting.ServiceListCollection = RealtimeCollection.extend({
  url: Skywatch.api_path + 'user/servicelist',
});

Setting.OperatorHistoryCollection = RealtimeCollection.extend({
  url: Skywatch.api_path + 'user/operatorhistory',
});

Setting.account_model = new Setting.AccountModel({});
Setting.service_list_model = new Setting.ServiceListCollection();
Setting.operator_model = new Setting.OperatorHistoryCollection();

window.Skywatch.Setting = Setting;
