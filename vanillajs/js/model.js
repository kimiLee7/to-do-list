(function (window) {
	'use strict';

	/**
	 * Creates a new Model instance and hooks up the storage.
	 *
	 * @constructor
	 * @param {object} storage A reference to the client side storage class
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * Creates a new todo model
	 *
	 * @param {string} [title] The title of the task
	 * @param {function} [callback] The callback to fire after the model is created
	 */
	Model.prototype.create = function (category, title, callback) {
		title = title || '';
		category = category || '';
		callback = callback || function () {};

		var newItem = {
			title: title.trim(),
			completed: false,
			marked: false
		};

		this.storage.save(category, newItem, callback);
	};

	/**
	 * Finds and returns a model in storage. If no query is given it'll simply
	 * return everything. If you pass in a string or number it'll look that up as
	 * the ID of?the model to find. Lastly, you can pass it an object to match
	 * against.
	 *
	 * @param {string|number|object} [query] A query to match models against
	 * @param {function} [callback] The callback to fire after the model is found
	 *
	 * @example
	 * model.read(1, func); // Will find the model with an ID of 1
	 * model.read('1'); // Same as above
	 * //Below will find a model with foo equalling bar and hello equalling world.
	 * model.read({ foo: 'bar', hello: 'world' });
	 */
	Model.prototype.read = function (category, query, callback) {
		var queryType = typeof query;
		callback = callback || function () {};

		if (queryType === 'function') {
			callback = query;
			return this.storage.findAll(category, callback);
		} else if (queryType === 'string' || queryType === 'number') {
			query = parseInt(query, 10);
			this.storage.find(category, { id: query }, callback);
		} else {
			this.storage.find(category, query, callback);
		}
	};

	/**
	 * Updates a model by giving it an ID, data to update, and a callback to fire when
	 * the update is complete.
	 *
	 * @param {number} id The id of the model to update
	 * @param {object} data The properties to update and their new value
	 * @param {function} callback The callback to fire when the update is complete.
	 */
	Model.prototype.update = function (category, id, data, callback) {
		this.storage.save(category, data, callback, id);
	};


	/**
	 * Removes a model from storage
	 *
	 * @param {number} id The ID of the model to remove
	 * @param {function} callback The callback to fire when the removal is complete.
	 */
	Model.prototype.remove = function (category, id, callback) {
		this.storage.remove(category, id, callback);
	};

	/**
	 * Returns a count of all todos
	 */
	Model.prototype.getCount = function (category, callback) {
		var todos = {
			active: 0,
			completed: 0,
			total: 0
		};

		this.storage.findAll(category, function (data) {
/*			if (data === undefined) {
				data = [];
			}*/
			console.log('returned data from storage.findAll() in model.count() is ' + data);
			console.log('will call data.forEach() after data is returned');
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		});
	};

	//author xiaomin
	Model.prototype.getCategoryInfo = function (callback) {
		this.storage.readCategoryInfo(callback);
	};

	Model.prototype.getFirstCategoryData = function (callback) {
		this.storage.readFirstCategoryData(callback);
	};

	Model.prototype.readMatch = function (keyword, callback) {
		this.storage.findMatch(keyword, callback);
	};

	Model.prototype.readSorted = function (category, callback) {
		this.storage.sort(category, callback);
	};

	Model.prototype.removeAnItemInAllCategories = function (query, callback) {
		this.storage.removeAnItemInAllCategories(query, callback);
	};

	Model.prototype.updateInSearchResults = function (updateData, id, callback) {
		this.storage.updateInSearchResults(updateData, id, callback);
	};

	Model.prototype.findAnItemInAllCategories = function (id, callback) {
		this.storage.findAnItemInAllCategories(id, callback);
	};

	Model.prototype.findItemsInAllCategories = function (condition, callback) {
		this.storage.findItemsInAllCategories(condition, callback);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
