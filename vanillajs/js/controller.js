(function (window) {
	'use strict';

	/**
	 * Takes a model and view and acts as the controller between them
	 *
	 * @constructor
	 * @param {object} model The model instance
	 * @param {object} view The view instance
	 */
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;

		self.view.bind('newTodo', function (title) {
			self.addItem(title);
		});

		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});
/*

		self.view.bind("getTimeInfo", function(item) {
			console.log(item.id);
			self.showTimeInfo(item.id);
		});

		self.view.bind("getTimeInfoDone", function (item) {
			self.hideTimeInfo(item.id);
		});
*/
		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});

		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});

		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title, item.modified);
		});

		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});
		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});


	}


	Controller.prototype.addItem = function (title) {
		var self = this;

		if (title.trim() === '') {
			return;
		}

		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];

		self.model.create(category, title, function () {
			self.view.render('clearNewTodo');
//			self._filter(true);
			self.updateTodoContent(category);
		});
	};
	/**
	 * By giving it an ID it'll find the DOM element matching that ID,
	 * remove it from the DOM and also remove it from storage.
	 *
	 * @param {number} id The ID of the item to remove from the DOM and
	 * storage
	 */
	Controller.prototype.removeItem = function (id) {
		var self = this;
		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];
		self.model.remove(category, id, function () {
			self.view.render('removeItem', id);
		});

//	   self._filter();
		self.updateTodoContent(category);
	};

	Controller.prototype.showTimeInfo = function(id) {
		var self = this;
		self.model.read({id: id}, function (data) {
			var remove_array_of_data = JSON.stringify(data[0]);
			console.log(remove_array_of_data);
			var be_json_data = JSON.parse(remove_array_of_data);
			console.log(be_json_data.created);
			self.view.render("showTimeInfo", {created:be_json_data.created, modified: be_json_data.modified});
		});
	};


	Controller.prototype.hideTimeInfo = function (id) {
		var self = this;
		self.model.read({id:id}, function (data) {
			self.view.render("hideTimeInfo");
		})
	};

	/**
	 * Will remove all completed items from the DOM and storage.
	 */
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];
		self.model.read(category, { completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});

		self.updateTodoContent(category);
	};

	/**
	 * Updates the pieces of the page which change depending on the remaining
	 * number of todos.
	 */
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});

			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};

	/**
	 * Re-filters the todo items, based on the active route.
	 * @param {boolean|undefined} force  forces a re-painting of todo items.
	 */
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

		// Update the elements on the page, which change with each completed todo
		 this._updateCount();

		// If the last active route isn't "All", or we're switching routes, we
		// re-create the todo item elements, calling:
		//   this.show[All|Active|Completed]();
	/*	if (force) {
			this['showAll']();
		}*/

		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute]();
		}

		this._lastActiveRoute = activeRoute;
	};

	/**
	 * Loads and initialises the view
	 *
	 * @param {string} '' | 'active' | 'completed'
	 */
	/*

	 Controller.prototype.setView = function (locationHash) {
	 var route = locationHash.split('/')[1];
	 var page = route || '';
	 this._updateFilterState(page);
	 };
	 */


	/**
	 * An event to fire on load. Will get all items and display them in the
	 * todo-list
	 */
	Controller.prototype.showAll = function () {
		var self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};


	/**
	 * Renders all active tasks
	 */
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Renders all completed tasks
	 */
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Give it an ID of a model and a checkbox and it will update the item
	 * in storage based on the checkbox's state.
	 *
	 * @param {number} id The ID of the element to complete or uncomplete
	 * @param {object} checkbox The checkbox to check the state of complete
	 *                          or not
	 * @param {boolean|undefined} silent Prevent re-filtering the todo items
	 */
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];
		self.model.update(category, id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});

		if (!silent) {
			self.updateTodoContent(category);
		}
	};

	/**
	 * Will toggle ALL checkboxes' on/off state and completeness of models.
	 * Just pass in the event object.
	 */
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];
		self.model.read(category, { completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});

		self.updateTodoContent(category);
	};

	/*
	 * Triggers the item editing mode.
	 */

	Controller.prototype.editItem = function (id) {
		var self = this;
		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];
		self.model.read(category, id, function (data) {
			self.view.render('editItem', {id: id, title: data[0].title});
		});
	};
	/**
	 self.view.bind('toggleAll', function (status) {
		self.toggleAll(status.completed);
	});
	 * An event to fire whenever you want to add an item. Simply pass in the event
	 * object and it'll handle the DOM insertion and saving of the new item.
	 */

	/*
	 * Finishes the item editing mode successfully.
	 */
	Controller.prototype.editItemSave = function (id, title, modified) {
		var self = this;
		title = title.trim();
		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];
		if (title.length !== 0) {
			self.model.update(category, id, {title: title, modified: modified}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		} else {
			self.removeItem(id);
		}
	};

	/*
	 * Cancels the item editing mode.
	 */
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		var locationHash = document.location.hash;
		var category = locationHash.split('/')[2];
		self.model.read(category, id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};

	/**
	 * Simply updates the filter nav's selected states
	 */
	Controller.prototype._updateFilterState = function (currentPage) {
		// Store a reference to the active route, allowing us to re-filter todo
		// items as they are marked complete or incomplete.
		this._activeRoute = currentPage;

		if (currentPage === '') {
			this._activeRoute = 'All';
		}

		this._filter();

		this.view.render('setFilter', currentPage);
	};

	//author xiaomin

	Controller.prototype.setLeftSideBar = function () {
		var self = this;
		self.model.getCategoryInfo(function (data) {
			self.view.render('showLeftSideBar', data);
		})
	};

	Controller.prototype.setView = function (locationHash) {
		var page;
		var route1;
		var route2;
		if (locationHash == '') {
		    page = '';
			route1 = 'category';
		} else {
			route1 = locationHash.split('/')[1];
			route2 = locationHash.split('/')[2];
		    page = route2 || '';
		}
		if (route1 == 'category') {
			this.showCurrentCategory(page);
			this.updateTodoContent(page);
		}
	};

	Controller.prototype.updateTodoContent = function (page) {
		var self = this;
		self.model.read(page, function(data) {
			self.view.render('showEntries', data);
		});
	};

	Controller.prototype.showCurrentCategory = function (category) {
		var self = this;
		if (category == '') {
			self.model.getFirstCategory(function (data) {
				self.view.render('showCurrentCategory', data);
			});
		} else {
			self.view.render('showCurrentCategory', category);
		}
	};


	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);