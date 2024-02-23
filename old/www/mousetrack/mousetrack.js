/**
 * 
 * MouseTrack
 * Custom library for mouse tracking in Javascript
 * 
 * Created by Daniel Gacitua <daniel.gacitua@usach.cl>
 * 
 * License: MIT 
 * http://opensource.org/licenses/MIT
 * 
 * Based on Denis Papathanasiou's buckabuckaboo
 * https://github.com/dpapathanasiou/buckabuckaboo
 * 
 */

/**
 * dpapathanasiou: Global variables found in the BUCKA namespace,
 * including the browser window dimensions,
 * calculated using technique from
 * http://andylangton.co.uk/blog/development/get-viewport-size-width-and-height-javascript
 * via http://stackoverflow.com/a/11744120
 *
 * @class vars
 * @constructor
 * @namespace BUCKA
 * @property w window
 * @property d document
 * @property e document element
 * @property g document body
 * @property ping Image object (used to transmit mouse position data to the server)
 * @property srvr url to the 1x1 image used by ping
 * @property navTime navigation start Unix timestamp
 */

var MouseTrack = {};

MouseTrack.vars = {
    w : window,
    d : document 
};

MouseTrack.vars.e = MouseTrack.vars.d.documentElement;
MouseTrack.vars.g = MouseTrack.vars.d.getElementsByTagName('body')[0];
MouseTrack.vars.ping = new Image();
MouseTrack.vars.srvr = null;
MouseTrack.vars.navTime = null;

//document.cookie = Math.random();
// get session id MO
//getJSessionId = function(){
//	var jsId = document.cookie.match(/JSESSIONID=[^;]+/);
//	if(jsId != null){
//		jsId = jsID[0].substring(11);
//	else
//		jsId = jsId.substring(11);
//	}
//	return jsId;
//}



// dgacitua: Get precise Unix timestamp using performance.now()
// Use perf.now() polyfill for cross-browser compatibility
// https://gist.github.com/paulirish/5438650
MouseTrack.getPreciseTimestamp = function() {
	if (MouseTrack.vars.navTime != null) {
		return MouseTrack.vars.navTime + performance.now();
	}
	else {
		return performance.now();
	}
};


// dpapathanasiou: Cross-browser event handling, from jresig's blog:
// http://ejohn.org/projects/flexible-javascript-events/
MouseTrack.addEvent = function ( obj, type, fn ) {
	if ( obj.attachEvent ) {
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn]( MouseTrack.vars.w.event );}
		obj.attachEvent( 'on'+type, obj[type+fn] );
	}
	else {
		obj.addEventListener( type, fn, false );
	}
};

// dpapathanasiou: Capture the current mouse position and transmit that info to the server hosting this script,
// only if the mouse's x,y coordinates can be determined, and MouseTrack.vars.srvr has been defined
MouseTrack.moveListener = function (evt) {
	if( MouseTrack.vars.srvr != null ) {
		var time = MouseTrack.getPreciseTimestamp();

		var x = evt.pageX,
			y = evt.pageY,
			w = MouseTrack.vars.w.innerWidth || MouseTrack.vars.e.clientWidth || MouseTrack.vars.g.clientWidth,
			h = MouseTrack.vars.w.innerHeight|| MouseTrack.vars.e.clientHeight|| MouseTrack.vars.g.clientHeight,
		  src = encodeURIComponent(window.location);	// dgacitua: encodeURIComponent() has been removed. MO:recovered
			tabs = "tabs:"+Array.prototype.map.call(document.querySelectorAll('div.active li.active'),function(t){ return t.textContent; }).join('|');
		//	sesId = /SESS\w*ID=([^;]+)/i.test(document.cookie) ? RegExp.$1 : false;
			sesId = document.cookie;
			browserZoomLevel = Math.round(window.devicePixelRatio * 100);
;

		if( x == null && evt.clientX != null ) {
			x = evt.clientX + (MouseTrack.vars.e && MouseTrack.vars.e.scrollLeft || MouseTrack.vars.g && MouseTrack.vars.g.scrollLeft || 0)
			- (MouseTrack.vars.e && MouseTrack.vars.e.clientLeft || MouseTrack.vars.g && MouseTrack.vars.g.clientLeft || 0);
			y = evt.clientY + (MouseTrack.vars.e && MouseTrack.vars.e.scrollTop  || MouseTrack.vars.g && MouseTrack.vars.g.scrollTop  || 0)
			- (MouseTrack.vars.e && MouseTrack.vars.e.clientTop  || MouseTrack.vars.g && MouseTrack.vars.g.clientTop  || 0);
		}

		// dgacitua: Output is displayed through Javascript's console and stored on movement_output object
		//console.log('Mouse Movement! X:' + x + ' Y:' + y + ' W:' + w + ' H:' + h + ' TIME:' + time + ' SRC:' + src);

		var movement_output = {
			type: 'mouse_movement',
			x_pos: x,
			y_pos: y,
			w_scr: w,
			h_scr: h,
			timestamp: time,
			src_url: src
		};
		MouseTrack.vars.ping.src = MouseTrack.vars.srvr+'/1x1.gif?move_x='+x+'&y='+y+'&w='+w+'&h='+h+'&src='+src + tabs+'&sesId'+sesId+'&zoom' +browserZoomLevel;

	}
};

// dgacitua: Modified method from moveListener() for registering mouse clicks
MouseTrack.clickListener = function (evt) {
    if( MouseTrack.vars.srvr != null ) {
		var time = MouseTrack.getPreciseTimestamp();

		var x = evt.pageX,
		    y = evt.pageY,
		    w = MouseTrack.vars.w.innerWidth || MouseTrack.vars.e.clientWidth || MouseTrack.vars.g.clientWidth,
		    h = MouseTrack.vars.w.innerHeight|| MouseTrack.vars.e.clientHeight|| MouseTrack.vars.g.clientHeight,
		  src = encodeURIComponent(window.location);
		tabs = "tabs:"+Array.prototype.map.call(document.querySelectorAll('div.active li.active'), function(t) { return t.textContent; }).join('|');
		//sesId = /SESS\w*ID=([^;]+)/i.test(document.cookie) ? RegExp.$1 : false;
		sesId = document.cookie;
		browserZoomLevel = Math.round(window.devicePixelRatio * 100);

		if( x == null && evt.clientX != null ) {
		    x = evt.clientX + (MouseTrack.vars.e && MouseTrack.vars.e.scrollLeft || MouseTrack.vars.g && MouseTrack.vars.g.scrollLeft || 0)
			- (MouseTrack.vars.e && MouseTrack.vars.e.clientLeft || MouseTrack.vars.g && MouseTrack.vars.g.clientLeft || 0);
		    y = evt.clientY + (MouseTrack.vars.e && MouseTrack.vars.e.scrollTop  || MouseTrack.vars.g && MouseTrack.vars.g.scrollTop  || 0)
			- (MouseTrack.vars.e && MouseTrack.vars.e.clientTop  || MouseTrack.vars.g && MouseTrack.vars.g.clientTop  || 0);
		}

		// dgacitua: Output is displayed through Javascript's console and stored on click_output object
		//console.log('Mouse Click! X:' + x + ' Y:' + y + ' W:' + w + ' H:' + h + ' TIME:' + time + ' SRC:' + src);

		var click_output = {
			type: 'mouse_click',
			x_pos: x,
			y_pos: y,
			w_scr: w,
			h_scr: h,
			timestamp: time,
			src_url: src
		};
		MouseTrack.vars.ping.src = MouseTrack.vars.srvr+'/1x1.gif?click_x='+x+'&y='+y+'&w='+w+'&h='+h+'&src='+src+tabs+'&sesId' + sesId+'&zoom' +browserZoomLevel;
    }
};


// dpapathanasiou: An initialization function to set the MouseTrack.vars.srvr
// value and add the proper event handler for mouse tracking.
MouseTrack.init = function(srvr) {
	MouseTrack.vars.srvr = srvr;				// Server instance URL
    MouseTrack.vars.navTime = Date.now();		// Navigation start Unix timestamp
    MouseTrack.addEvent(MouseTrack.vars.g, "click", MouseTrack.clickListener);		// Add event for tracking mouse clicks
    MouseTrack.addEvent(MouseTrack.vars.g, "mouseover", MouseTrack.moveListener);	// Add event for tracking mouse movements
};
