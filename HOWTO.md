# Wick Editor v16

**Note:** The `Modifier` key in this document refers to the `Control` key in Windows, and the `Command` key on MacOS.

## Brower Support

- All features of the Wick Editor are supported in Firefox and Chrome.
- All features of the Wick Player are supported by most major browsers, including mobile browsers.

## Canvas

 - Pan canvas with `Spacebar`
 - Zoom in and out with `+` and `-` keys
 - Zoom in and out with `Modifier` + `Scroll`
 - You can also zoom in and out with the plus and minus buttons below the timeline. This is also where you can select the percent at which to zoom.
 - Reset canvas zoom level to 100% with `Modifier` + `0`
 - Canvas color can be changed in project settings
 - Canvas dimensions (width/height) can be changed in project settings

### Undo/Redo

- Undo any action by clicking `Edit` -> `Undo` or by pressing `Modifier` + `Z`
- Redo any action by clicking `Edit` -> `Redo` or by pressing `Modifier` + `Shift` + `Z`

### Copy/Cut/Paste/Delete

- Copy object(s) by pressing `Modifier`+`C` or by clicking `Edit` -> `Copy` in the menu bar
- Cut object(s) by pressing `Modifier`+`X` or by clicking `Edit` -> `Cut` in the menu bar
- Paste object(s) by pressing `Modifier`+`V` or by clicking `Edit` -> `Paste` in the menu bar
- Cut object(s) by pressing `Delete` or `Backspace`, or by clicking `Edit` -> `Delete` in the menu bar
- Duplicate object(s) by pressing `Modifier` + `D` or or right clicking and selecting `Duplicate Object(s)`.

### Ordering

- Move object(s) forward by right clicking and selecting `Move Forwards` or pressing `Modifier` + `Up`
- Move object(s) backwards by right clicking and selecting `Move Backwards` or pressing `Modifier` + `Down`
- Move object(s) to the front by right clicking and selecting `Move To Front` or pressing `Modifier` + `Shift` + `Up`
- Move object(s) to the back by right clicking and selecting `Move To Back` or pressing `Modifier` + `Shift` + `Down`

## Toolbar

### Color Picker

- Click either box to change the current fill or stroke color.
- The filled box changes the fill color, and the unfilled box changes the stroke color.
- The default pallete contains twelve basic colors.
- The color picker saves the last six colors used below the default pallete.
- Click and drag the largest square to change the saturation and lightness of the current color.
- Click and drag the vertical rectangle to change the hue of the current color.
- Click and drag the horizontal rectangle to change to opacity of the current color.

### Selection Cursor

_Making selections_

- Click to select object
- `Shift` + click to select multiple objects
- Click and drag to select objects touching the selection box
- `Alt` + click and drag to select objects strictly inside the selection box

_Modifying selections_

- Scale by dragging handles on corners and sides
- Scale and keep aspect ratio of object(s) by holding `Shift` and dragging handles on corners
- Rotate by dragging corners
- Move object(s) by 1 pixel in any direction using the arrow keys
- Move object(s) by 10 pixels in any direction using `Shift` + arrow keys
- Select all objects on the canvas by clicking `Edit` -> `Select All` in the menu bar, or by pressing `Modifier` + `A`
- Deselect all objects on the canvas by clicking `Edit` -> `Deselect All` in the menu bar, or by using `Modifier` + `Shift` + `A`

### Path Cursor

_Making selections_

- Click any path to select it
- Drag to select paths touching the selection box
- Alt+drag to select objects strictly inside the selection box

_Modifying Path Segments_

- Click and drag points to move them
- Click on a stroke to add a point on that part of the stroke
- Hold `Modifier` and click a point to remove it

_Modifying Path Curves_

- Double click a path to straighten and smooth its curves
- Drag handles to change curvature of strokes

### Brush

_Brush Options_

- Color
	- The brush uses the current fill color as its drawing color.
- Size
- Smoothness
- Stabilizer Level
- Pressure Sensitivity Enabled
- Pressure Sensitivity Level
   - A higher Pressure Sensitivity level makes the pressure from a tablet have more impact on the size of the brush.
- Blob Detail
	- A higher Blob Detail value will give your strokes more detail when they are converted to paths, but will make drawing strokes slower.

### Pencil

_Pencil Options_

- Color
	- The pencil uses the current stroke color as its drawing color.
- Stroke width
- Smoothness

### Fill Bucket

- Click any path to change it's fill or stroke color
- Click any holes created by paths to fill that hole

### Rectangle

- Click and drag to draw a rectangle
- Hold shift while dragging to draw a perfect square
- Change corner roundness in inspector

### Ellipse

- Click and drag to draw an ellipse
- Hold shift while dragging to draw a perfect circle

### Line

- Click and drag to draw a line
- Hold shift while dragging to draw horizontal/vertical/diagonal line

### Pen

- Click to create a new point
- Click and drag to create a new point and change it's curvature
- Click first point to close shape
- Click the ends of an existing shape to add more curves to that shape

### Eyedropper

- Click any path to set the current fill or stroke color to that path's color.

### Text

- Click and drag to create a text box
- Click text objects to edit them

### Zoom

- Click to zoom in
- Hold `Alt` and click to zoom out
- Click and drag, draw a rectangle, and release to zoom into a section of the screen

### Pan

- Click and drag to pan

## Timeline

### Frames

**DESIGN TODO**

- To add a frame, double click an empty space on the timeline or right click and select `Add Frame`
- Change the length of frame(s) by dragging the edges left or right.
- Select frames by clicking and dragging, all frames inside the selection box will be selected.
- Delete selected frames by pressing `Delete` or right clicking and selecting `Delete Frame`

### Playhead

- Move the playhead by dragging it, or by using the `<` and `>` keys.
- Clicking on a frame will jump the playhead to that frame.
- Play the whole timeline by clicking the `Play Preview` button, or by pressing `Enter`
- Loop the timeline by holding `Shift` and clicking the `Play Preview` button, or by pressing `Shift` + `Enter`
- Change the framerate that the timeline is played at in project settings

### Layers

- Create a layer with the `Add Layer` button
- Delete the current layer with the `Delete Layer` button
- Rename a layer by clicking on its name
- Layers can be locked by clicking the lock icon on that layer
- Layers can be hidden by clicking the eye icon in that layer
- Layers can be reordered by dragging them by the three lines icon on the left

### Tweens

- Create a motion tween on a frame by right clicking a frame and selecting `Create Motion Tween`.
- If there are multiple objects on the frame when a motion tween is created, they will be automatically grouped into a single object.
- Create keyframes by right clicking and selecting `Insert Keyframe`.
- Copy and paste keyframes by right clicking a keyframe and selecting `Copy Keyframe` or `Paste Keyframe`.
- Keyframes will be automatically added if an object is modified while the playhead is over a point on the frame without a keyframe.
- You can change the "easing" of a tween in the Inspector. The current options are `None`, `Ease In`, `Ease Out`, and `Ease In-Out`.
- If you want to rotate an object 360 degrees or more in a tween, use the `Number of Rotations` value in the Inspector. _Note: You can rotate objects counter-clockwise by using a negative value here._
- Tweening of all transformations (x, y, scale, rotation) is possible, as well as opacity.

### Sounds

- Add a sound to a frame by dragging it from the asset library onto a frame, or by selecing a frame and choosing a sound from the dropdown menu in the Inspector.

### Onion Skinning

- Click the onion icon to enable onion skinning
- Control how many frames are shown in onion skin by dragging the edges of the box near the playhead.

## Import

### Images

Import images by dragging them into the editor or by selecting `Import` -> `Image` in the menu bar.

_Supported image types:_

- `png`
- `jpeg`
- `bmp`
- `gif` (_Animated GIFs are converted into clips with all the frames of the original GIF_)

### Sounds

Import sounds by dragging them into the editor or by selecting `Import` -> `Sound` in the menu bar.

_Supported sound file types:_

- `mp3`
- `wav`
- `ogg`

### SVG

Import SVGs by dragging them into the editor or by selecting `Import` -> `SVG` in the menu bar.

### Asset Library

- All assets used in the project are stored in the Asset Library.
- Reorganize assets by clicking and dragging them.
- Rename assets by selecting an asset and clicking the `Rename Asset` button.
- Delete assets by selecting an asset and clicking the `Delete Asset` button.

## Wick Objects

All Wick Objects have the following attributes:

- Position (x,y)
- Width
- Height
- Scale (x,y)
- Rotation (angle, 0-360)
- Opacity

### Paths

_Attributes:_

- Fill color
- Stroke color
- Stroke width
- Boolean Operations
 - Unite: Combines two or more paths into one path.
 - Subtract: Uses the topmost path to cut out a portion of other selected paths.

### Images

_Attributes:_

- Asset source

### Text

_Attributes:_

- Font family
- Font size
- Font color
- Text align
- Bold
- Italic

### Groups

- Create a group by right clicking wick object(s) and selecting `Group Objects` or by pressing `Modifier` + `G`.
- Edit group by double clicking or right clicking and selecting `Edit Group`.
- Leave group by using breadcrumbs or by double clicking
- Break apart a group by right clicking and selecting `Break Apart` or by pressing `Modifier` + `B`

### Buttons

- Right click a selection of wick object(s) and select `Create Clip from Objects`.
- A dialog box will open up prompting you to name the new Clip
- An asset will be created out of the new Clip, and the new Clip will use that asset as its source. _(to change this later, select a different "clip resource" in the inspector)_

_Button Appearance_

- To change how a button appears when it interacts with the mouse, right click the button and select `Edit Button`.
- Create frames in the places where the timeline is labeled `Up`, `Over`, and `Down`.

### Clips

_Creating a Clip_

- Right click a selection of wick object(s) and select `Create Clip from Objects`.
- A dialog box will open up prompting you to name the new Clip
- An asset will be created out of the new Clip, and the new Clip will use that asset as its source. _(to change this later, select a different "clip resource" in the inspector)_

_Clip timelines_

- Clips have their own timelines.
- Clip timelines run independently of the main timeline.
- Edit the timeline of a Clip by double clicking or right clicking the Clip and selecting `Edit Timeline`.
- Leave the timeline of the clip by using breadcrumbs or by double clicking the canvas.

_Clip attributes_

- Name (used in scripting - see `Writing Scripts` section.)
- Start frame
- Autoplay

__Note__ that the "root object" is actually a Clip that contains everything in the project. You can never leave the root object.

## Writing Scripts

Scripts can be added to Clips, Buttons, and Frames.

With an Clip, Button, or Frame selected, open the Scripting Window by clicking the bar along the bottom of the editor.

### Object Access

- You can access any named Clip by using its name. For example, to set some value of a Clip named "player", you would use a line of code like this:

`player.rotation = 90`

- You can access the object that the script belongs to using the keyword `this`.

- You can access the root object of the project by using the keyword `root`.

- You can access the parent object of the current object by using the keyword `parent`.

### Moving the Timeline Programmatically

- While a project is running, the playhead will automatically move forward once per "tick". Projects "tick" at the rate of the framerate 
- (e.g. a project with a framerate of 12 will tick 12 times per second.)

All timeline functions can be used on objects, such as: 
 
- `root.play()` 
- `this.stop()`
- `yourOwnObject.gotoAndPlay(2)`

as well as by themselves, where they will refer to the timeline where the script was added:

- `play()`
- `gotoAndStop(2)`

### Variables

- Store information in an object by using variables as shown:
 - `this.level = 5`
 - `player.isAlive = true`
 - `player.name = "Slombo"`
 - `root.numberOfBees = 10000`
- See all builtin variables below in the `Script Reference` section
- Tip: Put variables that you want to access everywhere in `root`.

### Events

- Use events to run code when a certain event happens, such as when an object is clicked, or when an object first appears onscreen.

### Creating Objects Programmatically

- You can create instances of Clips from the Asset Library programmatically by using `createInstanceOf()` with the name of the asset to use. Example:

`enemy = createInstanceOf("Enemy")`

### Errors

- If your script contains a syntax error, the project will not run until it is fixed. The Scripting Window will highlight the line that contains the syntax error.
- If a runtime error occurs while the project is running, the player will close, and the line that caused the error will be highlighted in the Scripting Window.

## Script Reference

### Scope

Name | Description
--- | ---
`this` | Refers to the Wick Object running the script.
`parent` | Refers to the parent of the Wick Object running the script. (This is `null` for the root object.)
`root` | Refers to the root object of the project.

### Timeline

Name | Description
--- | ---
`play()` | Plays the timeline. 
`stop()` | Stops the timeline.
`gotoAndStop(frame)` | Moves the timeline to the specified frame and stops the timeline. You can use a number to move the timeline to a certain position, or a string to move the timeline to a named frame.
`gotoAndPlay(frame)` | Moves the timeline to the specified frame and plays the timeline. You can use a number to move the timeline to a certain position, or a string to move the timeline to a named frame.
`gotoNextFrame()` | Moves the timeline to the next frame.
`gotoPrevFrame()` | Moves the timeline to the previous frame.
`currentFrameNumber` | The current frame number that the timeline is currently on.
`currentFrameName` | The current name of the frame that the timeline is currently on. If the timeline is on an unnamed frame, this value will be `null`.

### Events

Name | Description
--- | ---
`on(load)` | Runs once when the object/frame first appears onscreen.
`on(update)` | Runs once per tick that the object/frame is onscreen.
`on(click)` | Runs when the object/frame is clicked (i.e. a full press and release)
`on(mousedown)` | Runs when the object/frame is first pressed by the mouse.
`on(mouseup)` | Runs when mouse is released over the frame/object.
`on(mouseenter)` | Runs when the mouse first rolls over the frame/object.
`on(mouseleave)` | Runs when the mouse leaves the frame/object.
`on(mousehover)` | Runs every tick that the mouse is hovered over the frame/object.
`on(mousedrag)` | Runs every tick that the mouse is hovered over the frame/object while held down.
`on(keypressed)` | Runs when a key is pressed.
`on(keydown)` | Runs every tick that a key is held down.
`on(keyup)` | Runs when a key is released.

### Wick Object Attributes

Name | Description
--- | ---
`x` | The horizontal position of the object on the x-axis.
`y` | The vertical position of the object on the y-axis.
`scaleX` | The horizontal scale of the object.
`scaleY` | The vertical scale of the object.
`rotation` | The rotation of the object, in angles.
`flipX` | True if the object is mirrored horizontally, false otherwise.
`flipY` | True if the object is mirrored vertically, false otherwise.
`opacity` | Value from 0.0 to 1.0 where 0.0 is completely transparent, and 1.0 is completely opaque.

### Wick Object Methods

Name | Description
--- | ---
`hitTest(object)` | Returns `true` if the object collides with the speicified object.
`delete()` | Deletes the object.

### Mouse Input

Name | Description
--- | ---
`mouseX` | The position of the mouse on the x-axis.
`mouseY` | The position of the mouse on the y-axis.
`mouseMoveX` | The amount the mouse has moved on the x-axis.
`mouseMoveY` | The amount the mouse has moved on the y-axis.

### Keyboard Input

Name | Description
--- | ---
`key` | The last key that was pressed/released/held down.
`keyIsDown(key)` | Returns true if the specified key is currently held down.
`keyJustPressed(key)` | Returns true if the specified key was pressed.

### Sound

Name | Description
--- | ---
`playSound(filename)` | Plays the specified sound from the Asset Library.
`stopAllSounds()` | Stops all currently playing sounds.

### Creating Objects

Name | Description
--- | ---
`createInstanceOf(assetName)` | Creates a Clip using the specified asset as its source.
`getAllInstancesOf(assetName)` | Returns an array containing all objects onscreen that are instances of the specified asset.

## Saving Projects

### Autosave

- Projects are "autosaved" every time you run your project.
- You can also force an autosave by clicking on the title of the project in the top-left corner of the screen, or by pressing `Modifier` + `Shift` + `S`.
- __Autosaved projects are deleted when you clear your browser cache.__ It is recommended to save your projects as .wick files as often as possible.

### .wick file format

- A .wick file is the native filetype for Wick projects.
- .wick files can be opened in the editor by dragging them into the browser window, or by clicking `File` -> `Open Project` and selecting them.

## Exporting Projects

### .zip archive

- `File` -> `Export ZIP Archive`
- The exported .zip archive will contain the Wick Player bundled into an html file named `index.html`, as well as your project named `wick-project.wick`.
- Most Flash/HTML5 game websites accept `.zip` files in this format.

### Video

- `File` -> `Export Video`
- Choose quality (Low, Medium, High, or Ultra)
- Videos are exported as `mp4` files using the `mpeg4` codec.

## Builtin Player

- Play your project in the builtin player by clicking the `Run` button in the menu bar or by pressing `Modifier` + `Enter`.
- Close the builtin player by clicking the X in the top right corner or by pressing `Escape`.
- If script errors happen inside the builtin player, the player will close and the editor will show you where the error happened by selecting the object or frame that caused the error.
- You can run the builtin player in a new window by pressing `Modifier` + `Shift` + `Enter`, but errors will not be shown in the editor.

## Embedding Projects

To embed a .wick file, you will need the Wick Player html file. Download it **TODO** here.

Then, embed the player in an iframe and add the filename of your project with an `#` after `player.html` as shown here:

`<iframe width="720" height="480" src="player.html#myproject.wick"></iframe>`