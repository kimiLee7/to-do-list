/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 *
	 * @param {string} name The name of our DB we want to use
	 * @param {function} callback Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */
	// ========================================关于store 暂时注释掉==================================

	/*
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}
	*/

	// =======================================重写store==================================

	function Store(name, category_name, callback) {
		callback = callback || function () {};

		this._dbName1 = name;
		this._dbName2 = category_name;

		if (!localStorage[name] || !localStorage[category_name]) {
			var category_data = {
				categories: ['Shopping List', 'Travel', 'Trival Matters']
			};
			var todo_data = {};
			localStorage[category_name] = JSON.stringify(category_data);
			localStorage[name] = JSON.stringify(todo_data);
		}

		callback.call(this, JSON.parse(localStorage[name]), JSON.parse(localStorage[category_name]));
	}


	/**
	 * Finds items based on a query given as a JS object
	 *
	 * @param {object} query The query to match against (i.e. {foo: 'bar'})
	 * @param {function} callback	 The callback to fire when the query has
	 * completed running
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data will return any items that have foo: bar and
	 *	 // hello: world in their properties
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName1]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Will retrieve all data from the collection
	 *
	 * @param {function} callback The callback to fire upon retrieving data
	 */
/*	Store.prototype.findAll = function (callback) {
	 callback = callback || function () {};
	 callback.call(this, JSON.parse(localStorage[this._dbName1]).todos);
	 };*/

	//================================重写findAll=====================
	Store.prototype.findAll = function (category, callback) {
		if (category == ''){
			category = JSON.parse(localStorage[this._dbName2]).categories[0];
			callback = callback || function () {};
			callback.call(this, JSON.parse(localStorage[this._dbName1])[category]);
		}else{
			callback = callback || function () {};
			callback.call(this, JSON.parse(localStorage[this._dbName1])[category]);
		}
	};


	/**
	 * Will save the given data to the DB. If no item exists it will create a new
	 * item, otherwise it'll simply update an existing item's properties
	 *
	 * @param {object} updateData The data to save back into the DB
	 * @param {function} callback The callback to fire after saving
	 * @param {number} id An optional param to enter an ID of an item to update
	 */
	Store.prototype.save = function (category, updateData, callback, id) {
		var data = JSON.parse(localStorage[this._dbName1]);
		data[category] = data[category] || [];
		callback = callback || function () {};

		// If an ID was actually given, find the item and update each property
		if (id) {
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (var key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName1] = JSON.stringify(data);
			callback.call(this, JSON.parse(localStorage[this._dbName1]).todos);
		} else {
			// Generate an ID
			var full_time = new Date();
			updateData.id = full_time.getTime();
			updateData.created = full_time.getFullYear().toString() + "-"
			                     + (full_time.getMonth() + 1).toString() + "-"
				                 + full_time.getDate().toString();
			updateData.modified = "";
			data[category].push(updateData);
			localStorage[this._dbName1] = JSON.stringify(data);
			callback.call(this);
//			callback.call(this, [updateData]);   //[updateData]是什么意思？？？这个参数存在的意义是？？？？
		}
	};

	/**
	 * Will remove an item from the Store based on its ID
	 *
	 * @param {number} id The ID of the item you want to remove
	 * @param {function} callback The callback to fire after saving
	 */
	Store.prototype.remove = function (id, callback) {
		var data = JSON.parse(localStorage[this._dbName1]);
		var todos = data.todos;

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todos.splice(i, 1);
				break;
			}
		}

		localStorage[this._dbName1] = JSON.stringify(data);
		callback.call(this, JSON.parse(localStorage[this._dbName1]).todos);
	};

	//xiaomin
	Store.prototype.readCategoryInfo = function (callback) {
		callback = callback || function (){};
		callback.call(this, JSON.parse(localStorage[this._dbName2]).categories);
	};

	Store.prototype.readFirstCategory = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName2]).categories[0] );
	};


	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);
