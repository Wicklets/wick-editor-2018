/* lil input checker by Josh */

var CheckInput = (function () {

    var checkInput = { };

    checkInput.isNumber = function (n) {
        var num = parseInt(n);
        return (typeof num === 'number') && !isNaN(num);
    }

    checkInput.isInteger = function (n) {
        var num = parseInt(n);
        return (typeof num === 'number') && (num % 1 == 0);
    }

	checkInput.isPositiveInteger = function (n) {
        var num = parseInt(n);
        return (typeof num === 'number') && (num % 1 == 0) && (num > 0)
    }

    checkInput.isString = function (str) {
        return typeof str === 'string';
    }

    checkInput.testPositiveInteger = function (n) {
        var num = parseInt(n);
        return ((typeof num === 'number') && (num % 1 == 0) && (num > 0));
    }

    checkInput.isNonNegativeInteger = function (n) {
        var num = parseInt(n);
        return ((typeof num === 'number') && (num % 1 == 0) && (num >= 0));
    }

	return checkInput;

})();