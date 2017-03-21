var ThumbnailRendererInterface = function (wickEditor) {

    var self = this;

    var thumbpreview;
    var thumbRenderer;

    this.setup = function () {

        /*thumbpreview = document.createElement('div')
        thumbpreview.className = 'thumbnailPreview';
        //document.body.appendChild(thumbpreview)
        wickEditor.project.fitScreen = false;

        thumbRenderer = new WickPixiRenderer(wickEditor.project, thumbpreview, 0.2);
        thumbRenderer.setup();*/

    }
    
    this.syncWithEditorState = function () {

        self.renderThumbnailForFrame(wickEditor.project.getCurrentFrame());

    }

    this.renderThumbnailForFrame = function (wickFrame) {

        thumbRenderer = window.wickRenderer;

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
            if(wickPlayer.running) return;

            thumbRenderer.render(layerObjects);
            wickFrame.thumbnail = window.rendererCanvas.getElementsByTagName('canvas')[0].toDataURL('image/jpeg', 0.001);
            //console.log(wickFrame.thumbnail)
            wickEditor.timeline.syncWithEditorState()
        }, 100)

    }

    this.cleanup = function () {
        thumbRenderer.cleanup();
    }
}