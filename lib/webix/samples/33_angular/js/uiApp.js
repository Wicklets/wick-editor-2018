'use strict';

/* App Module */

var app = angular.module('webixApp', [ "webix" ]);

app.controller("webixTestController", function($scope){

  //element of UI
  var header = { type:"header", template:"App header" };
  var left = { view:"list", id:"a1", select:true, data:["One", "Two", "Three"] };
  var right = { template:"Right area", id:"a2" };

  //configuration
  $scope.l_config = {
    isolate:true, rows:[  //we need "isolate" if we want to have multiple directives per page
      header, 
      { cols:[ left, { view:"resizer" }, right ]}
    ]
  };

  //mirror configuration
  $scope.r_config = {
    isolate:true, rows:[ 
      header, 
      { cols:[ right, { view:"resizer" }, left ]}
    ]
  };

  //currently active configuration
  $scope.config = $scope.l_config;

  //event handlers for UI goes here
  $scope.doSome = function(root){
    var list = root.$$("a1");
    list.attachEvent("onAfterSelect", function(id){
      root.$$("a2").setHTML(this.getItem(id).value);
    });

    list.select(list.getFirstId());
  };
});

