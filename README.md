<img alt="Wick: The Internet's free and open source creation toolkit" src="site/img/home-message.png" alt="Drawing" width="500"/>

Wick is an HTML5-based Flash-style editor and player for interactive media on the web. Try the editor and see the demos [here](http://wickeditor.com/)!

### How to run the editor locally for development
* Clone or download and unzip this repo
* Open terminal in the newly made `wick` folder and start an HTTP server:
  * `python -m SimpleHTTPServer` (Python 2)
  * `python -m http.server` (Python 3)
* OR if you have npm installed, you can get [http-server](https://github.com/indexzero/http-server), which is faster
  * `npm install http-server -g` to install
  * `http-server` to start
* Open a browser window, and go to `http://localhost:8000/`
* You can also try the (buggy) Electron app mode by [installing Electron](https://electron.atom.io/) and running `electron .` in the wick directory

### How to contribute to Wick
We always need help with development - there's so much to do!
* Bug fixes are always appreciated. Check out the bugs on the [issue tracker](https://github.com/zrispo/wick/issues)
* If you have an idea for a specific feature, [tweet @zrispo (that's me)](https://twitter.com/zrispo) for big stuff, or [make an issue](https://github.com/zrispo/wick/issues) for smaller stuff
