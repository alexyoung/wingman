var Storage = {
  data: { models: [] },

  guid: function() {
    return (new Date()).valueOf() + (Math.random() * 0x10000|0) + '';
  },

  ready: function() {},

  remote: {
    read: function() {
      jQuery.getJSON('/storage/restore', function(data) {
        jQuery.each(data || [], function(index, value) {
          Storage.data[index] = value;
        });
        Storage.ready();
      }, 'json');
    },

    create: function(collection, json) {
      jQuery.post('/storage', {
        data: JSON.stringify(json),
        collection: collection
      },
      function() {
      }, 'json');
    },

    update: function(collection, json) {
      jQuery.post('/storage', {
        '_method': 'PUT',
        data: JSON.stringify(json),
        collection: collection
      },
      function() {
      }, 'json');
    },

    destroy: function(collection, json) {
      json['_method'] = 'DELETE';
      json['collection'] = collection;
      jQuery.post('/storage', json,
      function() {
      }, 'json');
    },

    setKey: function(collection, json) {
      jQuery.post('/storage/set_key_value', { '_method': 'PUT', collection: collection, data: JSON.stringify(json) },
      function() {
      }, 'json');
    }
  }
};

