// http://stackoverflow.com/questions/14636536/
// how-to-check-if-a-variable-is-an-integer-in-javascript
function isInt(data) {
	if (data === parseInt(data, 10))
	    return true;
	else
	    return false;
}