var Storage = {
  data: { models: [] },

  guid: function() {
    return (new Date()).valueOf() + (Math.random() * 0x10000|0) + '';
  },

  loading: function() {},
  done: function() {},
  ready: function() {},

  remote: {
    read: function() {
      Storage.loading();
      jQuery.getJSON('/storage/restore', function(data) {
        Storage.done();
        jQuery.each(data || [], function(index, value) {
          Storage.data[index] = value;
        });
        Storage.ready();
      }, 'json');
    },

    create: function(collection, json) {
      Storage.loading();
      jQuery.post('/storage', {
        data: JSON.stringify(json),
        collection: collection
      },
      function() {
        Storage.done();
      }, 'json');
    },

    update: function(collection, json) {
      Storage.loading();
      jQuery.post('/storage', {
        '_method': 'PUT',
        data: JSON.stringify(json),
        collection: collection
      },
      function() {
        Storage.done();
      }, 'json');
    },

    destroy: function(collection, json) {
      Storage.loading();
      json['_method'] = 'DELETE';
      json['collection'] = collection;
      jQuery.post('/storage', json,
      function() {
        Storage.done();
      }, 'json');
    },

    setKey: function(collection, json) {
      Storage.loading();
      jQuery.post('/storage/set_key_value', { '_method': 'PUT', collection: collection, data: JSON.stringify(json) },
      function() {
        Storage.done();
      }, 'json');
    }
  }
};

