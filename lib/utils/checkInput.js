/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var CheckInput = (function () {

	var checkInput = { };

	checkInput.callIfPositiveInteger = function (n, setFunc) {
        var num = Number(n);
        if((typeof num === 'number') && (num % 1 == 0) && (num > 0)) {
            setFunc(num);
        }
    }

    checkInput.callIfString = function (str, setFunc) {
        if(typeof str === 'string') {
            setFunc(str);
        }
    }

    checkInput.testPositiveInteger = function (n) {
        var num = Number(n);
        return ((typeof num === 'number') && (num % 1 == 0) && (num > 0));
    }

    checkInput.testNonNegativeInteger = function (n) {
        var num = Number(n);
        return ((typeof num === 'number') && (num % 1 == 0) && (num >= 0));
    }

    checkInput.testString = function (str) {
        return (typeof str === 'string')
    }

	return checkInput;

})();