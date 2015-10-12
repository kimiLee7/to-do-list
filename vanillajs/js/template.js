/*jshint laxbreak:true */
(function (window) {
	'use strict';

	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'`': '&#x60;'
	};

	var escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	var reUnescapedHtml = /[&<>"'`]/g;
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
		return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, escapeHtmlChar)
			: string;
	};

	/**
	 * Sets up defaults for all the Template methods such as a default template
	 *
	 * @constructor
	 */
	function Template() {
		this.defaultTemplate
		=	'<li data-id="{{id}}" class="{{completed}}">'
		+		'<div class="view">'
		+			'<input class="toggle" type="checkbox" {{checked}}>'
		+			'<label>{{title}}</label>'
//		+			'<div class="time_info"></div>
		+           '<button class="mark" value = "{{value}}"></button>'
		+			'<button class="destroy"></button>'
		+		'</div>'
//		+		'<div class="show_time"></div>'
		+	'</li>';

		this.searchCategoryTemplate
		=	'<li class="show_category">'
		+   	'<a href="{{path}}">{{category}}</a>'
		+   '</li>';

/*		+	'<li data-id="{{id}}" class="{{completed}}">'
		+		'<div class="view">'
		+			'<input class="toggle" type="checkbox" {{checked}}>'
		+			'<label>{{title}}</label>'
		+			'<button class="mark"></button>'
		+			'<button class="destroy"></button>'
		+		'</div>'
		+  '</li>';*/

	}

	/**
	 * Creates an <li> HTML string and returns it for placement in your app.
	 *
	 * NOTE: In real life you should be using a templating engine such as Mustache
	 * or Handlebars, however, this is a vanilla JS example.
	 *
	 * @param {object} data The object containing keys you want to find in the
	 *                      template to replace.
	 * @returns {string} HTML String of an <li> element
	 *
	 * @example
	 * view.show({
	 *	id: 1,
	 *	title: "Hello World",
	 *	completed: 0,
	 * });
	 */
	Template.prototype.show = function (data) {
		var i, l;
		var view = '';

		for (i = 0, l = data.length; i < l; i++) {
			var template = this.defaultTemplate;
			var completed = '';
			var checked = '';
			var marked = 'mark';
			var value = '0';
			if (data[i].completed) {
				completed = 'completed';
				checked = 'checked';
			}
			if (data[i].marked) {
				marked = 'marked';
				value = '1';
			}

			template = template.replace('{{id}}', data[i].id);
			template = template.replace('{{title}}', escape(data[i].title));
			template = template.replace('{{completed}}', completed);
			template = template.replace('{{checked}}', checked);
			template = template.replace('mark', marked);
			template = template.replace('{{value}}', value);
			view = view + template;
		}
		return view;
	};

	/**
	 * Displays a counter of how many to dos are left to complete
	 *
	 * @param {number} activeTodos The number of active todos.
	 * @returns {string} String containing the count
	 */
	Template.prototype.itemCounter = function (activeTodos) {
		var plural = activeTodos === 1 ? '' : 's';

		return '<strong>' + activeTodos + '</strong> item' + plural + ' left';
	};

	/**
	 * Updates the text within the "Clear completed" button
	 *
	 * @param  {[type]} completedTodos The number of completed todos.
	 * @returns {string} String containing the count
	 */
	Template.prototype.clearCompletedButton = function (completedTodos) {
		if (completedTodos > 0) {
			return 'Clear completed';
		} else {
			return '';
		}
	};

	// author: xiaomin
	Template.prototype.timeFormat = function (created, modified) {
		if (modified != ''){
			return '<p>' +  'created:' + created  + '</br>' +  'modified:' + modified + '</p>' ;
		}else {
			return  '<p>' +  'created:' + created + '</p>' ;
		}

	};

	Template.prototype.showSearchResults = function (categories, todos) {
		var view = '';

		for (var i = 0; i < categories.length; i++) {
			var search_category_view = '';
			var category_template = this.searchCategoryTemplate;
			category_template = category_template.replace('{{path}}', '#/category/'+ categories[i]);
			category_template = category_template.replace('{{category}}', categories[i]);
			search_category_view = search_category_view + category_template;
			var search_todos_list_view = '';
			for (var j = 0; j < todos[categories[i]].length; j++) {
				var search_todos_template = this.defaultTemplate;
				var completed = '';
				var checked = '';

				var marked = 'mark';
				var value = '0';
				if (todos[categories[i]][j].completed) {
					completed = 'completed';
					checked = 'checked';
				}
				if (todos[categories[i]][j].marked) {
					marked = 'marked';
					value = '1';
				}
				search_todos_template = search_todos_template.replace('{{id}}', todos[categories[i]][j].id);
				search_todos_template = search_todos_template.replace('{{title}}', escape(todos[categories[i]][j].title));
				search_todos_template = search_todos_template.replace('{{completed}}', completed);
				search_todos_template = search_todos_template.replace('{{checked}}', checked);
				search_todos_template = search_todos_template.replace('mark', marked);
				search_todos_template = search_todos_template.replace('{{value}}', value);
				search_todos_list_view = search_todos_list_view + search_todos_template;
			}
			view = view + search_category_view + search_todos_list_view;
		}
		return view;
	};


	// Export to window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
