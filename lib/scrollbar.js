/*    scrollbar code      */
/*     just for fun       */
/* for late night sadness */

var Scrollbar = function (viewboxSize, contentSize, scrollbarContainerSize) {

	this.viewboxSize = viewboxSize;
	this.viewboxPosition - undefined;

	this.barSize = undefined;
	this.barPosition = 0;

	this.contentSize = contentSize;

	this.scrollbarContainerSize = scrollbarContainerSize;

	this._recalcBarSize();
	this._recalcViewboxPosition();

};

Scrollbar.prototype._recalcBarSize = function () {
	this.barSize = this.viewboxSize * (this.viewboxSize / this.contentSize);
	this.barSize = Math.max(this.barSize, 14);
};

Scrollbar.prototype._recalcBarPosition = function () {
	this.barPosition = this.viewboxSize * (this.viewboxPosition / this.contentSize);
	this._constrainBarPosition();
};

Scrollbar.prototype._recalcViewboxPosition = function (val) {
	this.viewboxPosition = (this.barPosition / this.viewboxSize) * this.contentSize;
};

Scrollbar.prototype._constrainBarPosition = function () {
	this.barPosition = Math.max(this.barPosition, 0);
	this.barPosition = Math.min(this.barPosition, this.scrollbarContainerSize-this.barSize);
}

Scrollbar.prototype.setViewboxSize = function (val) {
	this.viewboxSize = val;
	this._recalcBarSize();
	this._recalcBarPosition();
	this._recalcViewboxPosition();
};

Scrollbar.prototype.setContentSize = function (val) {
	this.contentSize = val;
	this._recalcBarSize();
	this._recalcBarPosition();
	this._recalcViewboxPosition();
};

Scrollbar.prototype.setBarPosition = function (val) {
	this.barPosition = val;
	this._constrainBarPosition();
	this._recalcViewboxPosition();
	this._recalcBarPosition();
};

Scrollbar.prototype.setViewboxPosition = function (val) {
	this.viewboxPosition = val;
	this._recalcBarPosition();
};

Scrollbar.prototype.setScrollbarContainerSize = function (val) {
	this.scrollbarContainerSize = val;
};