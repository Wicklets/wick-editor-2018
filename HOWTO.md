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

### Snapping

- Snapping can be enabled in the Inspector when a cursor tool is selected (Selection Cursor or Path Cursor).

_Snap Align_

 - Enables selections to snap to nearby objects. Useful for lining things up precicely.

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

**DESIGN TODO**

### Zoom

- Click to zoom in
- Hold `Alt` and click to zoom out
- Click and drag, draw a rectangle, and release to zoom into a section of the screen

### Pan

- Click and drag to pan

## Timeline

### Frames

- To add a frame, double click an empty space on the timeline or right click and select `Add Frame`
- Select frames by clicking and dragging, all frames inside the selection box will be selected.
- Delete selected frames by pressing `Delete` or right clicking and selecting `Delete Frame`
- Move frame(s) by clicking and dragging selected frames
- Change the duration of frame(s) by dragging the left or right edges of the selection box

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

**TODO**

### Onion Skinning

- Click the onion icon to enable onion skinning
- Control how many frames are shown in onion skin by dragging the edges of the box near the playhead.

## Wick Objects

all wick objects have **TODO**

### Paths

**TODO**

### Images

**TODO**

### Text

- static
- dynamic

### Groups

Create a group by 
Edit group by double clicking or right clicking
Leave group by using breadcrumbs or by double clicking

### Buttons

Create a button by
The button is added to the asset library
A "library link" is added - to remove/change it, use the dropdown menu in the inspector

Edit button states double clicking or right clicking
Leave button timeline by using breadcrumbs or by double clicking

### Clips

Create a clip by
The clip is added to the asset library
A "library link" is added - to remove/change it, use the dropdown menu in the inspector

Clips have their own timelines

Edit timeline by double clicking or right clicking
Leave button timeline by using breadcrumbs or by double clicking

Start frame
Play once/twice/loop forever
Autoplay?

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

**TODO**

## Scripting Window

Autocomplete
Reference Section
Syntax Errors
Runtime Errors

## Writing Scripts

Clips and buttons can be scripted

### Object Access

- named objects
- 'root' and 'parent'

### Events

- use events to run code only when a certain event happens, such as when an object is clicked, or when an object is first loaded

### Function Calls

- calling fuctions is like giving a command
- they can have options, too (arguments)

### Variables

- store information by using variables
- objects have many builtin variables
- you can make your own variables too
- put variables that you want to access everywhere in `root`

### If Statements

- use if statements to run code only if certain parameters are met

### For Loops / For In (?)

**DESIGN WIP**

## Script Reference

### Scope

Name | Description
--- | ---
`this` | TODO
`parent` | TODO
`root` | TODO

### Timeline

Name | Description
--- | ---
`play()` | TODO
`stop()` | TODO
`gotoAndStop(frame)` | TODO
`gotoAndPlay(frame)` | TODO
`gotoNextFrame()` | TODO
`gotoPrevFrame()` | TODO
`currentFrameNumber` | TODO
`currentFrameName` | TODO

### Events

**TODO** Note mobile equivalents

Name | Description
--- | ---
`on(update)` | TODO
`on(load)` | TODO
`on(click)` | TODO
`on(mousedown)` | TODO
`on(mouseup)` | TODO
`on(mouseenter)` | TODO
`on(mouseleave)` | TODO
`on(mousehover)` | TODO
`on(mousedrag)` | TODO
`on(keypressed)` | TODO
`on(keydown)` | TODO
`on(keyup)` | TODO

### Wick Object Attributes

Name | Description
--- | ---
`x` | TODO
`y` | TODO
`scaleX` | TODO
`scaleY` | TODO
`rotation` | TODO
`flipX` | TODO
`flipY` | TODO
`opacity` | TODO

### Wick Object Methods

Name | Description
--- | ---
`hitTest()` | TODO
`delete()` | TODO

### Mouse Input

Name | Description
--- | ---
`mouseX` | TODO
`mouseY` | TODO
`mouseMoveX` | TODO
`mouseMoveY` | TODO

### Keyboard Input

Name | Description
--- | ---
`key` | TODO
`keyIsDown(key)` | TODO
`keyJustPressed(key)` | TODO

### Sound

Name | Description
--- | ---
`playSound(filename)` | TODO
`stopAllSounds()` | TODO

### Creating Objects

Name | Description
--- | ---
`createInstanceOf(assetName)` | TODO
`getAllInstancesOf(assetName)` | TODO

## Saving Projects

### Autosave

- Projects are "autosaved" every time you run your project.
- You can also force an autosave by clicking on the title of the project in the top-left corner of the screen, or by pressing `Modifier` + `Shift` + `S`.
- __Autosaved projects are deleted when you clear your browser cache.__ It is recommended to save your projects as .wick files as often as possible.

### .wick file format

- A .wick file is the native filetype for Wick projects.
- .wick files can be opened in the editor by dragging them into the browser window, or by clicking `File` -> `Open Project` and selecting them.

##Exporting Projects

### .zip archive

- `File` -> `Export ZIP Archive`
- The exported .zip archive will contain the Wick Player bundled into an html file named `index.html`, as well as your project named `wick-project.wick`.
- Most Flash/HTML5 game websites accept `.zip` files in this format.

### .html file

- `File` -> `Export HTML File`
- HTML files can be opened by all web browsers and can play the Wick project inside.
- HTML files can easily be embedded inside another webpage (see `Embedding Projects`)

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

### Embedding an HTML file

You can embed a Wick project exported as an HTML file by using an iframe.

_Example:_

`<iframe src="myproject.html" width="720" height="480"></iframe>`

### Embedding a .wick file

To embed a .wick file, you will need the Wick Player html file. Download it **TODO** here.

Then embed the player in an iframe and add the filename of your project with an `#` after `player.html` as shown here:

`<iframe width="720" height="480" src="player.html#myproject.wick"></iframe>`