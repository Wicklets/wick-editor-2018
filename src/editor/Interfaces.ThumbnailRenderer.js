var ThumbnailRendererInterface = function (wickEditor) {

    var self = this;

    var thumbpreview;
    var thumbRenderer;

    this.setup = function () {

        thumbpreview = document.createElement('div')
        thumbpreview.className = 'thumbnailPreview';
        //document.body.appendChild(thumbpreview)
        wickEditor.project.fitScreen = false;

        thumbRenderer = new WickPixiRenderer(wickEditor.project, thumbpreview, 0.2);
        thumbRenderer.setup();

    }
    
    this.syncWithEditorState = function () {

        self.renderThumbnailForFrame(wickEditor.project.getCurrentFrame());

    }

    this.renderThumbnailForFrame = function (wickFrame) {

        if(!thumbRenderer) return;
        if(!wickFrame) return;

        thumbRenderer.refresh(wickEditor.project.rootObject);

        var layerObjects = [];
        wickEditor.project.getCurrentObject().getAllActiveChildObjects().forEach(function (child) {
            if(child.isOnActiveLayer(wickEditor.project.getCurrentLayer())) {
                layerObjects.push(child);
            }
        });

        setTimeout(function () {
            thumbRenderer.render(layerObjects);
            wickFrame.thumbnail = thumbRenderer.rendererCanvas.toDataURL();
            wickEditor.timeline.syncWithEditorState()
        }, 100)

    }

    this.cleanup = function () {
        thumbRenderer.cleanup();
    }
}