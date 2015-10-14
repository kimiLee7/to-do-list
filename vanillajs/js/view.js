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
	function View(template, category_template) {
		this.template = template;
		this.category_template = category_template;
		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;
		this.$todoList = qs('.todo-list');
		this.$main = qs('.main');
		this.$newTodo = qs('.new-todo');
		this.$toggleAll = qs('.toggle-all');
		this.$todoItemCounter = qs('.todo-count');
		this.$footer = qs('.footer');
		this.$clearCompleted = qs('.clear-completed');
		this.$left_menu_list = qs('.left_menu_list');
		this.$current_category = qs('#show_current_category');
		this.$filter_all = qs('#filter_state_all');
		this.$filter_active = qs('#filter_state_active');
		this.$filter_completed = qs('#filter_state_completed');
		this.$todoapp = qs('.todoapp');
		this.$search = qs('.search_icon');
		this.$search_input = qs('#search_bar input[type="text"]');
		this.$search_section = qs('.search_results');
		this.$search_list = qs('.search_tasks_list');
		this.$sort = qs('.sort');
		this.$marked_section = qs('.marked_list_section');
		this.$marked_list = qs('.marked_list');
		this.$marked_menu = qs('.left_menu_marked li');
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
				self.$search_section.style.display = 'none';
				self.$marked_section.style.display = 'none';
				self.$todoapp.style.display = 'block';
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
			},
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			},
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			setFilter: function () {
				self._setFilter(parameter);
			},
			showTimeInfo: function () {
				self._showTimeInfo(parameter.created, parameter.modified);
			},
			hideTimeInfo: function () {
				qs('.show_time').style.display = 'none';
			},
			showLeftSideBar: function () {
				self.$left_menu_list.innerHTML = self.category_template.show(parameter.category, parameter.data);
			},
			showCurrentCategory: function () {
				self.$current_category.innerHTML = parameter;
			},
			showSearchResults: function () {
				self.$todoapp.style.display = 'none';
				self.$marked_section.style.display = 'none';
				self.$search_section.style.display = 'block';
				self.$current_category.innerHTML = 'Search Results';
				self.$search_list.innerHTML = self.template.showSearchResults(parameter.categories, parameter.todos);
			},
			sortAZ: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			removeInSearchList: function () {
				self._removeItemInSearchResults(parameter.id, parameter.where);
			},
			toggleCompleteInSearchList: function () {
				self._elementCompleteInSearchList(parameter.id, parameter.completed, parameter.where);
			},
			editItemInSearchList: function () {
				self._editItemInSearchList(parameter.id, parameter.title, parameter.where);
			},
			editItemDoneInSearchList: function () {
				self._editItemDoneInSearchList(parameter.id, parameter.title, parameter.where);
			},
			editItemCancelInSearchList: function () {
				self._editItemCancelInSearchList(parameter.id, parameter.where);
			},
			elementMarked: function () {
				self._markItem(parameter.id, parameter.marked);
			},
			elementMarkedInSearchList: function () {
				self._markItemInSearchList(parameter.id, parameter.marked, parameter.where);
			},
			showMarkedList: function () {
				self.$todoapp.style.display = 'none';
				self.$search_section.style.display = 'none';
				self.$marked_section.style.display = 'block';
				self.$marked_list.innerHTML = self.template.showSearchResults(parameter.categories, parameter.todos);
			},
			cancelMarkItemInMarkedList: function () {
				console.log(parameter.id);
				console.log(parameter.where);
				self._removeItemInSearchResults(parameter.id, parameter.where);
			},
			showMarkedMenuSelected: function () {
				if (parameter.selected === true){
					self.$marked_menu.className = 'selected';
				}else {
					self.$marked_menu.className = '';
				}
			}
		};

		viewCommands[viewCmd]();
	};

	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
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

		}else if (event == 'getTimeInfo') {
			$delegate(self.$todoList, '.time_info', 'mouseover', function () {
					handler({id: self._itemId(this)});
			});

		}else if (event === 'getTimeInfoDone') {
			$delegate(self.$todoList, '.time_info', 'mouseout', function () {
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
				handler({completed: this.checked});     //when the event is fired, return this.checked = true;
			});

		}else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		}else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		}else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);

		}else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});
//  author xiaomin
		}else if (event === 'filterAll') {
			$on(self.$filter_all, 'click', function () {
				var category = document.location.hash.split('/')[2];
				handler(category);
		});

		}else if (event === 'filterActive') {
			$on(self.$filter_active, 'click', function () {
				var category = document.location.hash.split('/')[2];
				handler(category);
			});
		}else if (event === 'filterCompleted') {
			$on(self.$filter_completed, 'click', function () {
				var category = document.location.hash.split('/')[2];
				handler(category);
			});
		}else if (event === 'search') {
			$on(self.$search, 'click', function () {
				var keyword = self.$search_input.value;
				handler(keyword);
			});
		}else if (event === 'sortAz') {
			$on(self.$sort, 'click', function () {
				var category = document.location.hash.split('/')[2];
				handler(category);
			});
		}else if (event === 'removeItemInSearchResult') {
			$delegate(self.$search_list, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});
		}else if (event === 'toggleItemInSearchResult') {
			$delegate(self.$search_list, '.toggle', 'click', function () {
				handler({id: self._itemId(this), completed: this.checked});
			});
		}else if (event === 'editItemInSearchResult') {
			$delegate(self.$search_list, 'li label' , 'dblclick', function () {
				handler({id: self._itemId(this)});
			});
		}else if (event === 'itemEditDoneInSearchResult') {
			self._bindItemEditDoneInSearchList(handler);
		}else if (event === 'itemEditCancelInSearchResult') {
			self._bindItemEditCancelInSearchList(handler);
		}else if (event === 'markItem') {
			// 此处selector = 'button', 不能为'.mark', 因为状态为marked时，className 为 '.marked', 如果使用'.mark', 会导致无法获得发生点击事件的元素
			$delegate(self.$todoList, 'button', 'click', function () {
				var marked = self._ifMarked(this);
				handler({id: self._itemId(this), marked: marked});
			});
		}else if (event === 'markItemInSearchResult') {
			$delegate(self.$search_list, 'button', 'click', function () {
				handler({id: self._itemId(this)});
			});
		}else if (event === 'removeItemInMarkedList') {
			$delegate(self.$marked_list, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});
		}else if (event === 'toggleItemInMarkedList') {
			$delegate(self.$marked_list, '.toggle', 'click', function () {
				handler({id: self._itemId(this), completed: this.checked});
			});
		}else if (event === 'editItemInMarkedList') {
			$delegate(self.$marked_list, 'li label' , 'dblclick', function () {
				handler({id: self._itemId(this)});
			});
		}else if (event === 'itemEditDoneInMarkedList') {
			self._bindItemEditDoneInMarkedList(handler);
		}else if (event === 'itemEditCancelInMarkedList') {
			self._bindItemEditCancelInMarkedList(handler);
		}else if (event === 'cancelMarkItemInMarkedList') {
			$delegate(self.$marked_list, 'button', 'click', function () {
				handler({id: self._itemId(this)});
			});
		}

	};

	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				var modify_time = new Date();
				handler({
					id: self._itemId(this),
					title: this.value,
					modified: modify_time.getFullYear().toString() + "-"
						      + (modify_time.getMonth() + 1).toString() + "-"
					          + modify_time.getDate().toString()
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;                       //设置label标签的内容？？？ textContent???
		});
	};

	View.prototype._setFilter = function (idOfa) {
		qs('.filters .selected').className = '';
     	qs('.filters #' + idOfa).className = 'selected';
	};

	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	View.prototype._showTimeInfo = function (created, modified) {
		qs('.show_time').innerHTML = this.template.timeFormat(created, modified);
		qs('.show_time').style.display = 'block';
	};

	View.prototype._removeItemInSearchResults = function (id, where) {
		console.log(id);
		var elem = qs('[data-id="' + id + '"]');
		console.log(elem);
		if (where === 'searchList') {
			console.log('where value is searchList');
			console.log(elem.parentNode);
			this.$search_list.removeChild(elem);
		}else if (where === 'markedList') {
			console.log(elem);
			console.log(this.$marked_section);
			console.log(elem.parentNode);
			this.$marked_list.removeChild(elem);
		}
	};

	View.prototype._elementCompleteInSearchList = function (id, completed, where) {
		var listItem;
		if (where === 'searchList') {
			listItem  = qs('[data-id="' + id + '"]', this.$search_list);
		} else if (where === 'markedList') {
			listItem  = qs('[data-id="' + id + '"]', this.$marked_list);
		}

		if (!listItem) {
			return;
		}
		listItem.className = completed ? 'completed' : '';
		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;

	};

	View.prototype._editItemInSearchList = function (id, title, where) {
		var listItem;
		if (where === 'searchList') {
			listItem = qs('[data-id = "' + id + '"]', this.$search_list);
		}else if (where === 'markedList') {
			listItem = qs('[data-id = "' + id + '"]', this.$marked_list);
		}

		if (!listItem) {
			return;
		}
		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	View.prototype._bindItemEditDoneInSearchList = function (handler) {
		var self = this;
		$delegate(self.$search_list, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				var modify_time = new Date();
				handler({
					id: self._itemId(this),
					title: this.value,
					modified: modify_time.getFullYear().toString() + "-"
					+ (modify_time.getMonth() + 1).toString() + "-"
					+ modify_time.getDate().toString()
				});
			}
		});

		$delegate(self.$search_list, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};


	View.prototype._editItemDoneInSearchList = function (id, title, where) {
		var listItem;
		if (where === 'searchList') {
			listItem = qs('[data-id = "' + id + '"]', this.$search_list);
		}else if (where === 'markedList') {
			listItem = qs('[data-id = "' + id + '"]', this.$marked_list);
		}
		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	View.prototype._bindItemEditCancelInSearchList = function (handler) {
		var self = this;
		$delegate(self.$search_list, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();
				handler({id: self._itemId(this)});
			}
		});
	};

	View.prototype._editItemCancelInSearchList = function (id, where) {
		var listItem;
		if (where === 'searchList') {
			listItem = qs('[data-id = "' + id + '"]', this.$search_list);
		}else if (where === 'markedList') {
			listItem = qs('[data-id = "' + id + '"]', this.$marked_list);
		}
		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);
		listItem.className = listItem.className.replace('editing', '');
	};

	View.prototype._markItem = function (id, marked) {
		var listItem = qs('[data-id = "' + id + '"]', this.$todoList);
		if (!listItem) {
			return;
		}

		var button = qs('button', listItem);
		button.className = marked? 'marked': 'mark';
	};

	//判断element是否marked, 通过给button元素增加一个value属性来判断， value ==0, not marked; value ==1, marked
	View.prototype._ifMarked = function (ele) {
		var li = $parent(ele, 'li');
		if(qs('button', li).value === '0') {
			return true;
		}else {
			return false;
		}
	};

	View.prototype._markItemInSearchList = function (id, marked, where) {
		var listItem;
		if (where === 'searchList') {
			listItem = qs('[data-id = "' + id + '"]', this.$search_list);
		} else if (where === 'markedList') {
			listItem = qs('[data-id = "' + id + '"]', this.$marked_list);
		}
		if (!listItem) {
			return;
		}
		var button = qs('button', listItem);
		button.className = marked? 'marked': 'mark';
	};

	View.prototype._bindItemEditDoneInMarkedList = function (handler) {
		var self = this;
		$delegate(self.$marked_list, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				var modify_time = new Date();
				handler({
					id: self._itemId(this),
					title: this.value,
					modified: modify_time.getFullYear().toString() + "-"
					+ (modify_time.getMonth() + 1).toString() + "-"
					+ modify_time.getDate().toString()
				});
			}
		});

		$delegate(self.$marked_list, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	View.prototype._bindItemEditCancelInMarkedList = function (handler) {
		var self = this;
		$delegate(self.$marked_list, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();
				handler({id: self._itemId(this)});
			}
		});
	};

	View.prototype.readKeywordInSearchInput = function () {
		return this.$search_input.value;
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
