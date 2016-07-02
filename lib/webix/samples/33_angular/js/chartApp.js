'use strict';

/* App Module */

var app = angular.module('webixApp', [ "webix" ]);

app.controller("webixChartController", function($scope){

  var chart_data = [
    { "sales":"20", "sales2":"35", "sales3":"55", "year":"02" },
    { "sales":"40", "sales2":"24", "sales3":"40", "year":"03" },
    { "sales":"44", "sales2":"20", "sales3":"27", "year":"04" },
    { "sales":"23", "sales2":"50", "sales3":"43", "year":"05" },
    { "sales":"21", "sales2":"36", "sales3":"31", "year":"06" },
    { "sales":"50", "sales2":"40", "sales3":"56", "year":"07" },
    { "sales":"30", "sales2":"65", "sales3":"75", "year":"08" },
    { "sales":"90", "sales2":"62", "sales3":"55", "year":"09" },
    { "sales":"55", "sales2":"40", "sales3":"60", "year":"10" },
    { "sales":"72", "sales2":"45", "sales3":"54", "year":"11" }
  ];

  $scope.charts = [
    { data:chart_data, series:[ { template:"sales", color:"#ff8" }, { template:"sales2", color:"#f8f" }] },
    { data:chart_data, series:[ { template:"sales2", color:"#ff8" }, { template:"sales3", color:"#f8f" }] },
    { data:chart_data, series:[ { template:"sales3", color:"#ff8" }, { template:"sales", color:"#f8f" }] }
  ];

  $scope.addSerie = function(){
    for (var i = 0; i < $scope.charts.length; i++)
      $scope.charts[i].series.push({ template:"sales", color:"#8ff" });
  };

  $scope.removeSerie = function(){
    for (var i = 0; i < $scope.charts.length; i++)
      $scope.charts[i].series.pop();
  };

  $scope.addChart = function(){
    $scope.charts.push( { data:chart_data, series:[ { template:"sales3", color:"#ff8" }, { template:"sales", color:"#f8f" }] } );
  };

  $scope.removeChart = function(){
    $scope.charts.pop();
  };

});

