'use strict';

/* App Module */

var app = angular.module('webixApp', [ "webix" ]);

app.controller("webixTestController", function($scope){
  $scope.records = [
  	{ id:1, title:"The Shawshank Redemption", year:1994, votes:678790, rating:9.2, rank:1},
	{ id:2, title:"The Godfather", year:1972, votes:511495, rating:9.2, rank:2},
	{ id:3, title:"The Godfather: Part II", year:1974, votes:319352, rating:9.0, rank:3},
	{ id:4, title:"The Good, the Bad and the Ugly", year:1966, votes:213030, rating:8.9, rank:4},
	{ id:5, title:"My Fair Lady", year:1964, votes:533848, rating:8.9, rank:5},
	{ id:6, title:"12 Angry Men", year:1957, votes:164558, rating:8.9, rank:6}
  ];

  $scope.lines = [
  	{ id:1, sales:20, year:"02"},
  	{ id:2, sales:55, year:"03"},
  	{ id:3, sales:40, year:"04"},
  	{ id:4, sales:78, year:"05"},
  	{ id:5, sales:61, year:"06"},
  	{ id:6, sales:35, year:"07"},
  	{ id:7, sales:80, year:"08"},
  	{ id:8, sales:50, year:"09"},
  	{ id:9, sales:65, year:"10"},
  	{ id:10, sales:59, year:"11"}
  ];

  $scope.addRecord = function(){
  	$scope.records.push({
  		title:"New Record",
  		rating:999,
  		votes:0,
  		year:2013
  	});
  };

  $scope.changeLine = function(type){
  	$$("mychart").define("type", type);
  	$$("mychart").render();
  };

  $scope.showDetails = function(id, details){
  	$scope.selectedId = id.row;
    $scope.eventType = details[1].type;
    $scope.nativeElement = details[2].nodeName;
    $scope.$digest();
  };

  $scope.showHeaderDetails = function(id, details){
    $scope.sortedCol = id;
    $scope.sortDir = details[1];
    $scope.sortType = details[2];
    $scope.$digest();
  };
});

