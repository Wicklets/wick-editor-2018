InspectorInterface.getProperties = function (wickEditor, inspector) {

	var properties = [];

	inspectorDiv = document.getElementById('inspectorGUI');
    propertiesContainer = buildDiv('inspector-properties-container', inspectorDiv);
    buttonsContainer = buildDiv('inspector-buttons-container', inspectorDiv);

    selectionInfo = inspector.selectionInfo;

    properties.push(new InspectorInterface.StringInput({
        title: 'Name',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject';
        },
        getValueFn: function () {
            return selectionInfo.object.name || "";
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.name = val;
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'X',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && !selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return roundToHundredths(selectionInfo.object.x);
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: [selectionInfo.object],
                modifiedStates: [{
                    x: eval(val)
                }]
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Y',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && !selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return roundToHundredths(selectionInfo.object.y);
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: [selectionInfo.object],
                modifiedStates: [{
                    y: eval(val)
                }]
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Rotation',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && !selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return roundToHundredths(selectionInfo.object.rotation);
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: [selectionInfo.object],
                modifiedStates: [{
                    rotation: eval(val)
                }]
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Opacity',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && !selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return roundToHundredths(selectionInfo.object.opacity);
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: [selectionInfo.object],
                modifiedStates: [{
                    opacity: eval(val)
                }]
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Width',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && !selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return roundToHundredths(selectionInfo.object.scaleX*selectionInfo.object.width);
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: [selectionInfo.object],
                modifiedStates: [{
                    scaleX: eval(val)/selectionInfo.object.width
                }]
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Height',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && !selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return roundToHundredths(selectionInfo.object.scaleY*selectionInfo.object.height);
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: [selectionInfo.object],
                modifiedStates: [{
                    scaleY: eval(val)/selectionInfo.object.height
                }]
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Volume',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return roundToHundredths(selectionInfo.object.volume);
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.volume = eval(val);
        }
    }));

    properties.push(new InspectorInterface.CheckboxInput({
        title: 'Loop',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isSound;
        },
        getValueFn: function () {
            return selectionInfo.object.loop;
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.loop = val;
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Variable',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isText;
        },
        getValueFn: function () {
            return selectionInfo.object.varName || "";
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.varName = val;
        }
    }));

    properties.push(new InspectorInterface.SelectInput({
        title: 'Font',
        options: ['arial', 'times new roman', 'comic sans ms', 'georgia', 'palatino linotype', 'book antiqua', 'helvetica', 'arial black', 'impact', 'lucida sans unicode', 'tahoma', 'geneva', 'trebuchet ms', 'verdana', 'courier new', 'Lucida Console'],
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isText;
        },
        getValueFn: function () {
            return selectionInfo.object.textData.fontFamily;
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.textData.fontFamily = val;
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.SelectInput({
        title: 'Align',
        options: ['left', 'center', 'right'],
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isText;
        },
        getValueFn: function () {
            return selectionInfo.object.textData.textAlign;
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.textData.textAlign = val;
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.CheckboxInput({
        title: 'Bold',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isText;
        },
        getValueFn: function () {
            return selectionInfo.object.textData.fontWeight === 'bold';
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.textData.fontWeight = val ? 'bold' : 'normal';
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.CheckboxInput({
        title: 'Italic',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isText;
        },
        getValueFn: function () {
            return selectionInfo.object.textData.fontStyle === 'italic';
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.textData.fontStyle = val ? 'italic' : 'normal';
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.ColorInput({
        title: 'Font Color',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isText;
        },
        getValueFn: function () {
            return selectionInfo.object.textData.fill;
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.textData.fill = val;
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Font Size',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isText;
        },
        getValueFn: function () {
            return selectionInfo.object.textData.fontSize;
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.textData.fontSize = eval(val);
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.ColorInput({
        title: 'Fill Color',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isPath;
        },
        getValueFn: function () {
            if(!selectionInfo.object || !selectionInfo.object.fabricObjectReference) return;
            if(!selectionInfo.object.fabricObjectReference.fill) return;
            return selectionInfo.object.fabricObjectReference.fill;
        }, 
        onChangeFn: function (val) {
            wickEditor.guiActionHandler.doAction("changeFillColorOfSelection", {
                color: val
            });
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.ColorInput({
        title: 'Stroke Color',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isPath;
        },
        getValueFn: function () {
            if(!selectionInfo.object || !selectionInfo.object.fabricObjectReference) return;
            if(!selectionInfo.object.fabricObjectReference.stroke) return;
            return selectionInfo.object.fabricObjectReference.stroke;
        }, 
        onChangeFn: function (val) {
            wickEditor.guiActionHandler.doAction("changeStrokeColorOfSelection", {
                color: val
            });
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Stroke Width',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 && selectionInfo.type == 'wickobject' && selectionInfo.object.isPath;
        },
        getValueFn: function () {
            if(!selectionInfo.object || !selectionInfo.object.fabricObjectReference) return;
            if(!selectionInfo.object.fabricObjectReference.stroke) return;
            return selectionInfo.object.fabricObjectReference.strokeWidth;
        }, 
        onChangeFn: function (val) {
            wickEditor.guiActionHandler.doAction("changeStrokeWidthOfSelection", {
                strokeWidth: eval(val)
            });
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Name',
        isActiveFn: function () {
            return selectionInfo.type === 'project';
        },
        getValueFn: function () {
            return wickEditor.project.name;
        }, 
        onChangeFn: function (val) {
            wickEditor.project.name = val;
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Width',
        isActiveFn: function () {
            return selectionInfo.type === 'project';
        },
        getValueFn: function () {
            return wickEditor.project.width;
        }, 
        onChangeFn: function (val) {
            wickEditor.project.width = eval(val);
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Height',
        isActiveFn: function () {
            return selectionInfo.type === 'project';
        },
        getValueFn: function () {
            return wickEditor.project.height;
        }, 
        onChangeFn: function (val) {
            wickEditor.project.height = eval(val);
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Framerate',
        isActiveFn: function () {
            return selectionInfo.type === 'project';
        },
        getValueFn: function () {
            return wickEditor.project.framerate;
        }, 
        onChangeFn: function (val) {
            wickEditor.project.framerate = eval(val);
        }
    }));

    properties.push(new InspectorInterface.ColorInput({
        title: 'Background Color',
        isActiveFn: function () {
            return selectionInfo.type === 'project';
        },
        getValueFn: function () {
            return wickEditor.project.backgroundColor;
        }, 
        onChangeFn: function (val) {
            wickEditor.project.backgroundColor = val;
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Name',
        isActiveFn: function () {
            return selectionInfo.type === 'playrange' && selectionInfo.numObjects === 1;
        },
        getValueFn: function () {
            return selectionInfo.object.identifier || "";
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.identifier = val;
            wickEditor.syncInterfaces()
        }
    }));

    properties.push(new InspectorInterface.ColorInput({
        title: 'Color',
        isActiveFn: function () {
            return selectionInfo.type === 'playrange' && selectionInfo.numObjects === 1;
        },
        getValueFn: function () {
            return selectionInfo.object.color;
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.color = val;
            wickEditor.syncInterfaces();
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Start',
        isActiveFn: function () {
            return selectionInfo.type === 'playrange' && selectionInfo.numObjects === 1;
        },
        getValueFn: function () {
            return selectionInfo.object.start+1;
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyPlayRange', {
                playRange: selectionInfo.object,
                start: eval(val)-1
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'End',
        isActiveFn: function () {
            return selectionInfo.type === 'playrange' && selectionInfo.numObjects === 1;
        },
        getValueFn: function () {
            return selectionInfo.object.end+1;
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('modifyPlayRange', {
                playRange: selectionInfo.object,
                end: eval(val)-1
            });
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Name',
        isActiveFn: function () {
            return selectionInfo.type === 'frame' && selectionInfo.numObjects === 1;
        },
        getValueFn: function () {
            return selectionInfo.object.name || "";
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.name = val;
            wickEditor.syncInterfaces()
        }
    }));

    properties.push(new InspectorInterface.StringInput({
        title: 'Length',
        isActiveFn: function () {
            return selectionInfo.type === 'frame' && selectionInfo.numObjects === 1;
        },
        getValueFn: function () {
            return selectionInfo.object.length;
        }, 
        onChangeFn: function (val) {
            wickEditor.actionHandler.doAction('changeFrameLength', {
		        frame: selectionInfo.object, 
		        newFrameLength: eval(val)
		    });
        }
    }));

    properties.push(new InspectorInterface.CheckboxInput({
        title: 'Save State',
        isActiveFn: function () {
            return selectionInfo.type === 'frame' && selectionInfo.numObjects === 1;
        },
        getValueFn: function () {
            return selectionInfo.object.alwaysSaveState;
        }, 
        onChangeFn: function (val) {
            selectionInfo.object.alwaysSaveState = val;
        }
    }));

    /*properties.push(new InspectorInterface.SelectInput({
        title: 'Type',
        options: ['Linear', 'Quadratic', 'Exponential'],
        isActiveFn: function () {
            return selectionInfo.type === 'frame' 
                && selectionInfo.numObjects === 1 
                && selectionInfo.object.getCurrentTween();
        },
        getValueFn: function () {
            return selectionInfo.object.getCurrentTween().tweenType;
        }, 
        onChangeFn: function (val) {
            var tween = selectionInfo.object.getCurrentTween();

            tween.tweenType = val;
            if(val === 'Linear') {
                tween.tweenDir = 'None';
            }
            if(val !== 'Linear' && tween.tweenDir === 'None') {
                tween.tweenDir = "In";
            }
            wickEditor.syncInterfaces();
        }
    }));*/

    properties.push(new InspectorInterface.SelectInput({
        title: 'Direction',
        options: ['None', 'In', 'Out', 'InOut'],
        isActiveFn: function () {
            return selectionInfo.type === 'frame' 
                && selectionInfo.numObjects === 1 
                && selectionInfo.object.getCurrentTween();
        },
        getValueFn: function () {
            return selectionInfo.object.getCurrentTween().tweenDir;
        }, 
        onChangeFn: function (val) {
            var tween = selectionInfo.object.getCurrentTween();

            tween.tweenDir = val;
            if(val === 'None') {
                tween.tweenType = 'Linear';
            } else {
                tween.tweenType = 'Quadratic';
            }
            console.log(tween);
            wickEditor.syncInterfaces();
        }
    }));

/* Buttons */

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Flip Horizontally",
        icon: "./resources/inspector-flip-horizontally.svg",
        colorClass: 'common',
        isActiveFn: function () {
            return (selectionInfo.numObjects > 0 && selectionInfo.type === 'wickobject');
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('flipHorizontally');
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Flip Vertically",
        icon: "./resources/inspector-flip-vertically.svg",
        colorClass: 'common',
        isActiveFn: function () {
            return (selectionInfo.numObjects > 0 && selectionInfo.type === 'wickobject');
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('flipVertically');
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Delete",
        icon: "./resources/inspector-delete.svg",
        colorClass: 'common',
        isActiveFn: function () {
            return (selectionInfo.numObjects > 0 && selectionInfo.type === 'wickobject');
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Duplicate",
        icon: "./resources/inspector-duplicate.svg",
        colorClass: 'common',
        isActiveFn: function () {
            return (selectionInfo.numObjects > 0 && selectionInfo.type === 'wickobject');
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("duplicateSelection")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Send to Back",
        icon: "./resources/inspector-send-to-back.svg",
        colorClass: 'common',
        isActiveFn: function () {
            return (selectionInfo.numObjects > 0 && selectionInfo.type === 'wickobject');
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("sendToBack")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Bring to Front",
        icon: "./resources/inspector-bring-to-front.svg",
        colorClass: 'common',
        isActiveFn: function () {
            return (selectionInfo.numObjects > 0 && selectionInfo.type === 'wickobject');
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("bringToFront")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Edit Code",
        icon: "./resources/inspector-edit-code.svg",
        colorClass: 'common',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 
                && selectionInfo.type === 'wickobject';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('editScripts');
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Close Path",
        icon: "./resources/ellipse.png",
        colorClass: 'all-paths',
        isActiveFn: function () {
            return selectionInfo.dataType === 'path' 
                && selectionInfo.numObjects === 1;
        },
        buttonAction: function () {
            
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Unite Paths",
        icon: "./resources/ellipse.png",
        colorClass: 'all-paths',
        isActiveFn: function () {
            return selectionInfo.numObjects > 1 
                && selectionInfo.special.allPaths;
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('doBooleanOperation', {boolFnName:'unite'});
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Intersect Paths",
        icon: "./resources/ellipse.png",
        colorClass: 'all-paths',
        isActiveFn: function () {
            return selectionInfo.numObjects > 1 
                && selectionInfo.special.allPaths;
        },
        buttonAction: function () {
            
        }
    }));

     properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Subtract Paths",
        icon: "./resources/ellipse.png",
        colorClass: 'all-paths',
        isActiveFn: function () {
            return selectionInfo.numObjects > 1 
                && selectionInfo.special.allPaths;
        },
        buttonAction: function () {
            
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Exclude Paths",
        icon: "./resources/ellipse.png",
        colorClass: 'all-paths',
        isActiveFn: function () {
            return selectionInfo.numObjects > 1 
                && selectionInfo.special.allPaths;
        },
        buttonAction: function () {
            
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Divide Paths",
        icon: "./resources/ellipse.png",
        colorClass: 'all-paths',
        isActiveFn: function () {
            return selectionInfo.numObjects > 1 
                && selectionInfo.special.allPaths;
        },
        buttonAction: function () {
            
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Convert to Clip",
        icon: "./resources/inspector-edit-timeline.svg",
        colorClass: 'multiple',
        isActiveFn: function () {
            return selectionInfo.numObjects > 0 
                && (selectionInfo.type === 'wickobject' || selectionInfo.type === 'multiple') 
                && selectionInfo.dataType !== 'symbol';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("convertToSymbol")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Convert to Button",
        icon: "./resources/inspector-button.svg",
        colorClass: 'multiple',
        isActiveFn: function () {
            return selectionInfo.numObjects > 0 
                && (selectionInfo.type === 'wickobject' || selectionInfo.type === 'multiple') 
                && selectionInfo.dataType !== 'symbol';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("convertToButton")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Edit Frames",
        icon: "./resources/inspector-edit-timeline.svg",
        colorClass: 'symbol',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 
                && selectionInfo.type === 'wickobject'
                && selectionInfo.dataType === 'symbol';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("editObject")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Break Apart",
        icon: "./resources/inspector-break-apart.svg",
        colorClass: 'symbol',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 
                && selectionInfo.type === 'wickobject'
                && selectionInfo.dataType === 'symbol';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("breakApart")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Create Motion Tween",
        icon: "./resources/inspector-tween.svg",
        colorClass: 'frames',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 
                && selectionInfo.dataType === 'frame'
                && !selectionInfo.object.getCurrentTween();
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('createMotionTween');
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Delete Motion Tween",
        icon: "./resources/inspector-delete.svg",
        colorClass: 'frames',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 
                && selectionInfo.dataType === 'frame'
                && selectionInfo.object.getCurrentTween();
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('deleteMotionTween');
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Add Frame",
        icon: "./resources/inspector-flip-vertically.svg",
        colorClass: 'frames',
        isActiveFn: function () {
            return selectionInfo.numObjects > 0 
                && selectionInfo.dataType === 'frame';
        },
        buttonAction: function () {
            wickEditor.actionHandler.doAction('addNewFrame');
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Copy Frame Forward",
        icon: "./resources/inspector-duplicate.svg",
        colorClass: 'frames',
        isActiveFn: function () {
            return selectionInfo.numObjects > 0 
                && selectionInfo.dataType === 'frame';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('copyFrameForward')
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Extend Frame To Position",
        icon: "./resources/inspector-flip-vertically.svg",
        colorClass: 'frames',
        isActiveFn: function () {
            return selectionInfo.numObjects > 0 
                && selectionInfo.dataType === 'frame';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('extendFrameToPosition')
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Delete Frame(s)",
        icon: "./resources/inspector-delete.svg",
        colorClass: 'frames',
        isActiveFn: function () {
            return selectionInfo.numObjects > 0 
                && selectionInfo.dataType === 'frame';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Edit Code",
        icon: "./resources/inspector-edit-code.svg",
        colorClass: 'frames',
        isActiveFn: function () {
            return selectionInfo.numObjects === 1 
                && selectionInfo.dataType === 'frame';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction('editScripts');
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Delete PlayRange",
        icon: "./resources/inspector-delete.svg",
        colorClass: 'playranges',
        isActiveFn: function () {
            return selectionInfo.numObjects > 0 
                && selectionInfo.dataType === 'playrange';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
        }
    }));

    properties.push(new InspectorInterface.InspectorButton({
        tooltipTitle: "Delete Tween",
        icon: "./resources/inspector-delete.svg",
        colorClass: 'playranges',
        isActiveFn: function () {
            return selectionInfo.type === 'tween';
        },
        buttonAction: function () {
            wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
        }
    }));

    return properties;
}