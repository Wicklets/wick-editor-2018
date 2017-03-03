var ThumbnailRendererInterface = function (wickEditor) {

    var thumbpreview;
    var thumbRenderer;

    this.setup = function () {

        thumbpreview = document.createElement('div')
        wickEditor.project.fitScreen = false;

        thumbRenderer = new WickPixiRenderer(wickEditor.project, thumbpreview, 0.2);
        thumbRenderer.setup();

    }
    
    this.syncWithEditorState = function () {

        this.renderThumbnailForFrame(wickEditor.project.getCurrentFrame());

    }

    this.renderThumbnailForFrame = function (wickFrame) {

        if(!thumbRenderer) return;
        if(!wickFrame) return;

        thumbRenderer.refresh(wickEditor.project.rootObject);
        thumbRenderer.render(wickEditor.project.getCurrentObject().getAllActiveChildObjects());
        wickFrame.thumbnail = thumbRenderer.rendererCanvas.toDataURL();

    }

    this.cleanup = function () {
        thumbRenderer.cleanup();
    }
}