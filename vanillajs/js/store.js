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
				categories: ['ShoppingList', 'Travel', 'TrivalMatters']
			};
			var categories = category_data.categories;
			console.log(categories.length);
			var todo_data = {};
			for (var i = 0; i < categories.length; i++) {
				todo_data[categories[i]] = [];
			}
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
	Store.prototype.find = function (category, query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName1])[category];

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
			callback = callback || function () {};
			console.log('returned data in store.findAll() is ' + JSON.parse(localStorage[this._dbName1])[category]);
			console.log('returned data type in store.findAll() is ' + typeof JSON.parse(localStorage[this._dbName1])[category]);
			callback.call(this, JSON.parse(localStorage[this._dbName1])[category]);

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
			for (var i = 0; i < data[category].length; i++) {
				if (data[category][i].id === id) {
					for (var key in updateData) {
						data[category][i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName1] = JSON.stringify(data);
			callback.call(this, JSON.parse(localStorage[this._dbName1])[category]);
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
	Store.prototype.remove = function (category, id, callback) {
		var data = JSON.parse(localStorage[this._dbName1]);
		var todos = data[category];

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todos.splice(i, 1);
				break;
			}
		}

		localStorage[this._dbName1] = JSON.stringify(data);
		callback.call(this, JSON.parse(localStorage[this._dbName1])[category]);
	};

	//xiaomin

	Store.prototype.readCategoryInfo = function (callback) {
		callback = callback || function (){};
		callback.call(this, JSON.parse(localStorage[this._dbName2]).categories);
	};

	Store.prototype.readFirstCategoryData = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName2]).categories[0] );
	};

	/**
	 * query match todos by title, support fuzzy query
	 * 返回的数据格式如：{categories: ['shopping list', 'trival matters', ...], todos: {[{}, {}, ....],....}}
	 * @param callback
	 */

	Store.prototype.findMatch = function (keyword, callback) {
		console.log('In function findMatch');
		callback = callback || function () {};
		var categories = JSON.parse(localStorage[this._dbName2]).categories;
		var allTodos = JSON.parse(localStorage[this._dbName1]);
		var matchCategories = [];
		var matchTodos = {};

		for (var i = 0; i < categories.length; i++) {
			var eachCategoryTodos = allTodos[categories[i]];
			matchTodos[categories[i]] = [];
			for (var j = 0; j < eachCategoryTodos.length; j++) {
				if (eachCategoryTodos[j].title.indexOf(keyword) !== -1) {
					matchCategories.push(categories[i]);
					matchTodos[categories[i]].push(eachCategoryTodos[j]);
				}
			}
		}
		//这里有点投机取巧，后续改进
		if (keyword === ''){
			matchCategories = [];
		}

		if (matchCategories.length === 0) {
			callback.call(this,{categories: [], todos: matchTodos} );
		} else {
			// 给数组 matchCategories 去重
			var sorted = matchCategories.sort();
			var result = [];
			result.push(sorted[0]);
			for (var k = 1; k < matchCategories.length; k++) {
				if (sorted[k] !== result[result.length -1]) {
					result.push(sorted[k]);
				}
			}

			callback.call(this, {categories: result, todos: matchTodos});
		}

	};

	Store.prototype.sort = function (category, callback) {
		var data = JSON.parse(localStorage[this._dbName1]);
		var todos = data[category];
		var sortedTodos = [];
		var titleArray = [];
		for (var i = 0; i < todos.length; i++) {
			titleArray.push(todos[i].title);
		}
		var sortedTitle = titleArray.sort();
		for (var j = 0; j < sortedTitle.length; j++) {
			for (var k = 0; k < todos.length; k++) {
				if (todos[k].title == sortedTitle[j]) {
					sortedTodos.push(todos[k]);
				}
			}
		}
		callback.call(this, sortedTodos);
	};

	Store.prototype.removeAnItemInAllCategories = function (query, callback) {
		callback = callback || function () {};
		var categories = JSON.parse(localStorage[this._dbName2]).categories;
		var data = JSON.parse(localStorage[this._dbName1]);
		for (var i = 0; i < categories.length; i++) {
			for (var j = 0; j < data[categories[i]].length; j++) {
					if (data[categories[i]][j].id == query.id) {
					data[categories[i]].splice(j, 1);
					break;
				}
			}
		}
		localStorage[this._dbName1] = JSON.stringify(data);
		callback.call(this, JSON.parse(localStorage[this._dbName1]));
	};

	Store.prototype.updateInSearchResults = function (updateData, id, callback) {
		callback = callback || function () {};
		var categories = JSON.parse(localStorage[this._dbName2]).categories;
		var data = JSON.parse(localStorage[this._dbName1]);
		for (var i = 0; i < categories.length; i++) {
			for (var j = 0; j < data[categories[i]].length; j++) {
				if (data[categories[i]][j].id === id) {
					for (var key in updateData) {
						data[categories[i]][j][key] = updateData[key];
					}
					break;
				}
			}
		}
		console.log(data);
		localStorage[this._dbName1] = JSON.stringify(data);
		callback.call(this, JSON.parse(localStorage[this._dbName1]));
	};

	Store.prototype.findAnItemInAllCategories = function (id, callback) {
		var todo = [];
		callback = callback || function () {};
		var categories = JSON.parse(localStorage[this._dbName2]).categories;
		var data = JSON.parse(localStorage[this._dbName1]);
		for (var i = 0; i < categories.length; i++) {
			for (var j = 0; j < data[categories[i]].length; j++) {
				if (data[categories[i]][j].id == id) {
					todo.push(data[categories[i]][j]);
					break;
				}
			}
		}
		console.log('find item is ' + todo[0]);
		callback.call(this, todo[0]);
	};

	Store.prototype.findItemsInAllCategories = function (condition, callback) {
		console.log('in findItemsInAllCategories function');
		callback = callback || function () {};
		var categories = JSON.parse(localStorage[this._dbName2]).categories;
		var allTodos = JSON.parse(localStorage[this._dbName1]);
		var matchCategories = [];
		var matchTodos = {};
		console.log(matchCategories);
		for (var i = 0; i < categories.length; i++) {
			var eachCategoryTodos = allTodos[categories[i]];
			matchTodos[categories[i]] = [];
			console.log('index ' + i + ' matchCategories value is' + matchCategories);
			for (var j = 0; j < eachCategoryTodos.length; j++) {
				for (var key in condition){
					if (eachCategoryTodos[j][key] == condition[key]){
						matchCategories.push(categories[i]);
						matchTodos[categories[i]].push(eachCategoryTodos[j]);
					}
				}
			}
		}

		console.log('matchCategories is ' + matchCategories);
		if (matchCategories.length === 0) {
			console.log('in if block');
			callback.call(this, {categories: [], todos: matchTodos})
		} else {
			// 给数组 matchCategories 去重
			var sorted = matchCategories.sort();
			var result = [];
			result.push(sorted[0]);
			for (var k = 1; k < matchCategories.length; k++) {
				if (sorted[k] !== result[result.length -1]) {
					result.push(sorted[k]);
				}
			}
			callback.call(this, {categories: result, todos: matchTodos});
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);
