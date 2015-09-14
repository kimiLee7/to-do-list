/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	 * View that abstracts away the browser's DOM completely.
	 * It has two simple entry points:
	 *
	 *   - bind(eventName, handler)
	 *     Takes a todo application event and registers the handler
	 *   - render(command, parameterObject)
	 *     Renders the given command with the options
	 */
	function View(template) {
		this.template = template;
//		this.ENTER_KEY = 13;
//		this.ESCAPE_KEY = 27;
		this.$todoList = qs('.todo-list');
//		this.$main = qs('.main');
		this.$newTodo = qs('.new-todo');
		this.$toggleAll = qs('.toggle-all');
	}

	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};


	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			removeItem: function () {
				self._removeItem(parameter);
			},
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			}
		};

		viewCommands[viewCmd]();
	};

	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	View.prototype.bind = function (event, handler) {
		var self = this;
		if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		}else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
					handler({id: self._itemId(this)});
			});

		}else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		}else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
