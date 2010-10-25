function Model(collectionName) {
  this.collectionName = collectionName;
  Storage.data.models.push(this.collectionName);
  Storage.data[this.collectionName] = {};
}

Model.prototype.find = function(id) {
  var item = Storage.data[this.collectionName][id];
  if (typeof item !== 'undefined') {
    return (new ModelInstance(this, item));
  } else {
    return null;
  }
};

Model.prototype.findAll = function(options) {
  var items = [];

  for (var item in Storage.data[this.collectionName]) {
    var add = true;
    item = Storage.data[this.collectionName][item];
    if (options) {
      jQuery.each(options, function(index, value) {
        if (item[index] !== value) {
          add = false;
          return false;
        }
      });
    }

    if (add) {
      items.push(new ModelInstance(this, item));
    }
  }
  return items;
};

Model.prototype.create = function(item) {
  item.id = Storage.guid();
  Storage.data[this.collectionName][item.id] = item;
  Storage.remote.create(this.collectionName, item);
  var instance = new ModelInstance(this, item);
  if (this.hasOwnProperty('afterCreate')) this.afterCreate(instance);
  return instance;
};

Model.prototype.destroy = function(id) {
  delete Storage.data[this.collectionName][id];
  Storage.remote.destroy(this.collectionName, { id: id });
  if (this.hasOwnProperty('afterDestroy')) this.afterDestroy();
};

function KeyValueModel(collectionName) {
  this.collectionName = collectionName;
  Storage.data.models.push(this.collectionName);
  Storage.data[this.collectionName] = {};
}

KeyValueModel.prototype.set = function(key, value) {
  Storage.data[this.collectionName][key] = value;
  Storage.remote.setKey(this.collectionName, { collection: this.collectionName, key: key, value: value });
};

KeyValueModel.prototype.get = function(key) {
  return Storage.data[this.collectionName][key];
};

function ModelInstance(model, item) {
  this.id = item.id;
  this.model = model;
}

ModelInstance.prototype.update = function(item) {
  Storage.data[this.model.collectionName][this.id] = $.extend(Storage.data[this.model.collectionName][this.id], item);
  Storage.remote.update(this.model.collectionName, item);
  if (this.model.hasOwnProperty('afterUpdate')) this.model.afterUpdate(this);
  return this;
};

ModelInstance.prototype.get = function(field) {
  if (typeof field === 'undefined') {
    return Storage.data[this.model.collectionName][this.id];
  }
  return Storage.data[this.model.collectionName][this.id][field];
};

ModelInstance.prototype.set = function(field, value) {
  if (value === Storage.data[this.model.collectionName][this.id][field]) return;
  Storage.data[this.model.collectionName][this.id][field] = value;
  Storage.remote.update(this.model.collectionName, this.json());
  if (this.model.hasOwnProperty('afterUpdate')) this.model.afterUpdate(this);    
  return this;
};

ModelInstance.prototype.destroy = function() {
  delete Storage.data[this.model.collectionName][this.get('id')];
  Storage.remote.destroy(this.model.collectionName, { id: this.get('id') });
  if (this.hasOwnProperty('afterDestroy')) this.afterDestroy();
};

ModelInstance.prototype.json = function() {
  return Storage.data[this.model.collectionName][this.get('id')];
};

ModelInstance.prototype.valueOf = function() {
  return JSON.stringify(this.json());
};

