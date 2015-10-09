/**
 * Created by Xiaomin on 2015/10/9.
 */

(function (window) {
    'use strict';

    function Category_Template() {
        this.defaultCategory_template
        = '<li>'
        +   '<a href="{{path}}">'
        +       '<img src="images/menu.png" alt="todo-list icon" width="20px" height="15px"/>'
        +       '<span class="title">{{title}}</span>'
        +   '</a>'
        + '</li>';
    }

    Category_Template.prototype.show = function (data) {
        var view = '';
        for (var i = 0; i < data.length; i++) {
            var template = this.defaultCategory_template;
            template = template.replace('{{path}}', '#/category/' + data[i]);
            template = template.replace('{{title}}', data[i]);
            view = view + template;
        }
        return view;
    };


    window.app = window.app || {};
    window.app.Category_Template = Category_Template;
})(window);