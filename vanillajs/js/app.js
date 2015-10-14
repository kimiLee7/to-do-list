/*global app, $on */
(function () {
	'use strict';

	/**
	 * Sets up a brand new Todo list.
	 *
	 * @param {string} name The name of your new to do list.
	 */
	function Todo(name, category_name) {
		this.storage = new app.Store(name, category_name);
		this.model = new app.Model(this.storage);
		this.template = new app.Template();
		this.category_template = new app.Category_Template();
		this.view = new app.View(this.template, this.category_template);
		this.controller = new app.Controller(this.model, this.view);
	}

	var todo = new Todo('allTodos', 'categoryInfo');

	function setView() {
		todo.controller.setLeftSideBar(document.location.hash);
	 	todo.controller.setView(document.location.hash);
	 }
	 $on(window, 'load', setView);
	 $on(window, 'hashchange', setView);
})();