;
(function(exports) {
	// -- Popbox by otarim
	function preventDefault(e) {
		e = window.event || e;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
		return true;
	}

	function getData(el, property) {
		return 'dataset' in el ? el.dataset[property] : el.getAttribute('data-' + property);
	}

	function setData(el, property, value) {
		return 'dataset' in el ? (el.dataset[property] = value) : (el.setAttribute('data-' + property, value))
	}
	var eventHub = {};
	var isIE = typeof addEventListener !== 'function';
	var specialTypes = {
		mouseenter: {
			type: 'mouseover',
			target: 'fromElement'
		},
		mouseleave: {
			type: 'mouseout',
			target: 'toElement'
		},
		focus: (isIE ? 'focusin' : 'focus'),
		blur: (isIE ? 'focusout' : 'blur')
	}

	var addEvent = (function() {
		var contains = function(el, target) {
			if (el.compareDocumentPosition) {
				return (el.compareDocumentPosition(target) & 16) !== 0;
			} else {
				return el.contains(target);
			}
		}
		var bindEvent = function(el, type, callback, rpk) {
			var _callback = callback,
				useCapture = false,
				target, _type;
			if (type === 'mouseenter' || type === 'mouseleave') {
				_type = type;
				type = specialTypes[_type]['type'];
				callback = function(e) {
					var e = window.event || e;
					target = e.relatedTarget || e[specialTypes[_type]['target']];
					if (contains(el, target) || el === target) {
						e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
					} else {
						_callback.call(el, e);
					}
				}
				eventHub[_type] = eventHub[_type] || [];
				eventHub[_type].push({
					_callback: _callback,
					callback: callback
				});
			}
			if (type === 'blur' || type === 'focus') {
				useCapture = true;
				type = specialTypes[type];
			}
			return rpk.call(el, type, callback, useCapture);

		}
		if (typeof addEventListener === 'function') {
			return function(el, type, callback) {
				bindEvent(el, type, callback, function(type, callback, useCapture) {
					return el.addEventListener(type, callback, useCapture);
				});
			}
		} else {
			return function(el, type, callback) {
				bindEvent(el, type, callback, function(type, callback) {
					return el.attachEvent('on' + type, callback);
				});
			}
		}
	})();

	var removeEvent = (function() {
		var digCallback = function(el, type, callback, rpk) {
			var hub, _type, useCapture = false;
			if (type === 'mouseenter' || type === 'mouseleave') {
				hub = eventHub[type];
				_type = type;
				type = specialTypes[_type]['type'];
				for (var i = 0; i < hub.length; i++) {
					if (callback === hub[i]['_callback']) {
						callback = hub[i]['callback'];
						break;
					}
				}
			}
			if (type === 'blur' || type === 'focus') {
				useCapture = true;
				type = specialTypes[type];
			}
			return rpk.call(el, type, callback, useCapture);
		}
		if (typeof removeEventListener === 'function') {
			return function(el, type, callback) {
				digCallback(el, type, callback, function(type, callback, useCapture) {
					return el.removeEventListener(type, callback, useCapture);
				})
			}
		} else {
			return function(el, type, callback) {
				digCallback(el, type, callback, function(type, callback) {
					return el.attachEvent('on' + type, callback);
				});
			}
		}
	})();

	var merge = function(obj, target) {
		for (var i in target) {
			if (target.hasOwnProperty(i)) {
				obj[i] = target[i];
			}
		}
		return obj;
	}

	var coStyle = function(styleList) {
		var ret = [';'];
		for (var i in styleList) {
			if (styleList.hasOwnProperty(i)) {
				ret.push(i + ':' + styleList[i]);
			}
		}
		return ret.join(';')
	}

	var addPrefix = function(property, value) {
		var prefix = ['-webkit-', '-moz-', '-ms-', '-o-', ''],
			ret = [];
		for (var i = 0; i < prefix.length; i++) {
			ret.push(prefix[i] + property + ':' + value);
		}
		return ret.join(';');
	}

	var getDocumentLayout = function() {
		return {
			docWidth: document.documentElement.scrollWidth || document.body.scrollWidth,
			docHeight: document.documentElement.scrollHeight || document.body.scrollHeight
		}
	}

	var getViewLayout = function() {
		return {
			width: document.documentElement.scrollLeft + document.documentElement.clientWidth / 2,
			height: document.documentElement.scrollTop + document.documentElement.clientHeight / 2
		}
	}

	var supportAnimationEnd = (function(){
		var prefix = {
			'webkit': 'webkitAnimationEnd',
			'Moz': 'animationend',
			'ms': 'MSAnimationEnd',
			'O': 'animationend'
		},
		elStyle = document.createElement('div').style,
		ret = false;
		for(var i in prefix){
			if(prefix.hasOwnProperty(i)){
				if(i + 'Animation' in elStyle){
					ret = prefix[i];
					break;
				}
			}
		}
		// fallback to standard
		if(!ret && 'animation' in elStyle){
			ret = 'animationend';
		}
		return ret;
	})()

	var isIE6 = typeof window.XMLHttpRequest === 'undefined'; //ie78 return 'object'

	var overlayIndex = popMaxzIndex = 9998;

	var instances = [];

	var overlays = [];

	var hasBindShortcut = false;

	var hasBindResize = false;

	
	var css = (function(){
		var map = {
			hide: 'none',
			show: ''
		};
		var css = {};
		for(var i in map){
			if(map.hasOwnProperty(i)){
				css[i] = (function(display){
					if(supportAnimationEnd){
						return function(el,className,callback,context){
							el.animationend = function(){
								callback && callback.call(context);
								this.classList.remove(className);
								this.style.display = display;
								removeEvent(this, supportAnimationEnd, this.animationend);
								this.animationend = null;

							}
							addEvent(el,supportAnimationEnd,el.animationend);
							el.classList.add(className);
						}
					}else{
						return function(el,className,callback,context){
							el.style.display = display;
							callback && callback.call(context);
						}
					}
				})(map[i])
			}
		}
		return css;
	})();

	var loadStylesheet = (function(){
		var cssText = '.ui-animate-bounceIn{display:block!important;-webkit-animation:bounceIn .2s linear;-o-animation:bounceIn .2s linear;-moz-animation:bounceIn .2s linear;animation:bounceIn .2s linear}@-webkit-keyframes bounceIn{0%{-webkit-transform:scale(.5);opacity:0}70%{-webkit-transform:scale(1.03)}100%{-webkit-transform:scale(1)}}@-o-keyframes bounceIn{0%{-o-transform:scale(.5);opacity:0}70%{-o-transform:scale(1.03)}100%{-o-transform:scale(1)}}@-moz-keyframes bounceIn{0%{-moz-transform:scale(.5);opacity:0}70%{-moz-transform:scale(1.03)}100%{-moz-transform:scale(1)}}@keyframes bounceIn{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.03)}100%{transform:scale(1)}}.ui-animate-bounceOut{-webkit-animation:bounceOut .2s linear;-o-animation:bounceOut .2s linear;animation:bounceOut .2s linear}@-webkit-keyframes bounceOut{0%{-webkit-transform:scale(1)}70%{-webkit-transform:scale(1.03)}100%{-webkit-transform:scale(0)}}@-o-keyframes bounceOut{0%{-o-transform:scale(1)}70%{-o-transform:scale(1.03)}100%{-o-transform:scale(0)}}@-moz-keyframes bounceOut{0%{-moz-transform:scale(1)}70%{-moz-transform:scale(1.03)}100%{-moz-transform:scale(0)}}@keyframes bounceOut{0%{transform:scale(1)}70%{transform:scale(1.03)}100%{transform:scale(0)}}.ui-animate-fadeIn{display:block!important;-webkit-animation:fadeIn .2s linear;-o-animation:fadeIn .2s linear;animation:fadeIn .2s linear}@-webkit-keyframes fadeIn{0%{opacity:0}100%{opacity:.5}}@-o-keyframes fadeIn{0%{opacity:0}100%{opacity:.5}}@-moz-keyframes fadeIn{0%{opacity:0}100%{opacity:.5}}@keyframes fadeIn{0%{opacity:0}100%{opacity:.5}}.ui-animate-fadeOut{-webkit-animation:fadeOut .2s linear;-o-animation:fadeOut .2s linear;animation:fadeOut .2s linear}@-webkit-keyframes fadeOut{0%{opacity:.5}100%{opacity:0}}@-o-keyframes fadeOut{0%{opacity:.5}100%{opacity:0}}@-moz-keyframes fadeOut{0%{opacity:.5}100%{opacity:0}}@keyframes fadeOut{0%{opacity:.5}100%{opacity:0}}';
		var styleTag = document.createElement('style');
		// needed in ie
		styleTag.setAttribute('type', 'text/css');
		if(styleTag.styleSheet){
			styleTag.styleSheet.cssText = cssText;
		}else{
			styleTag.innerHTML = cssText;
		}
		var done = false;
		return function(){
			if(done){return}
			done = true;
			document.getElementsByTagName('head')[0].appendChild(styleTag);
		}
	})();

	function Popbox(config) {
		var wrap = this.el = document.createElement('div');
		var defaultEvent = {
			'click#popClose': function(e, el) {
				this.close();
			}
		};
		this.zIndex = ++popMaxzIndex;
		this.config = config || {};
		this.config.dragable && this.bindDragEvent(defaultEvent);
		this.useAnimate = true;
		this.events = this.config.events && merge(defaultEvent, config.events) || defaultEvent;
		wrap.className = 'popbox-container_';
		wrap.style.cssText += ';position: fixed;display: none;top: 50%;left: 50%;z-index: ' + this.zIndex;
		if(isIE6){
			wrap.style.position = 'absolute';
		}
		this.config.style && (wrap.style.cssText += coStyle(config.style));
		wrap.innerHTML = this.config.el && config.el.call(this, this.el) || '';
		document.body.insertBefore(wrap, document.body.firstChild);
		instances.push({
			instance: this,
			el: this.el,
			zIndex: this.zIndex
		})
		if(config.animate === false){
			this.useAnimate = false;
		}else{
			loadStylesheet();
		}
		this.config.overlay !== false && this.buildOverlay();
		this.config.shortcut = config.shortcut || false;
		this.bind();
	}

	Popbox.prototype = {
		reDraw: function(callback, styleObj) {
			styleObj && (this.el.style.cssText += coStyle(styleObj));
			this.el.innerHTML = callback.call(this, this.el);
			this.layoutFix();
			return this;
		},
		bind: function() {
			var eventList = this.events,
				self = this;
			var todos = instances;
			var getEventList = function(target) {
				return getData(target, 'event') && getData(target, 'event').split(',') || [];
			}
			var matchEvent = function(eventType, eventName) {
				if (typeof [].indexOf === 'function') {
					return eventType.indexOf(eventName) !== -1
				} else {
					for (var i = 0, l = eventType.length; i < l; i++) {
						if (eventType[i] === eventName) {
							return true;
						}
					}
					return false;
				}
			}
			var toTop = (function() {
				var reZindex = function(arr, from, begin) {
					for (l = arr.length; from < l; from++) {
						// z-index getter or setter didn't works in ie
						arr[from].el.style['zIndex'] = begin++;
					}
				}
				return function() {
					for (var i = 0, l = todos.length; i < l; i++) {
						if (todos[i].zIndex === self.zIndex) {
							var who = todos.splice(i, 1)[0],
								zIndex = who.el.style['zIndex'];
							todos.push(who);
							reZindex(todos, i, zIndex);
							break;
						}
					}
				}
			})()
			var doShortcut = function(e) {
				e = window.event || e;
				var keyValue = e.keyCode || e.which;
				if (keyValue === 27) {
					for (var i = 0, l = todos.length; i < l; i++) {
						self.close.call(todos[i].instance);
					}
				}
			}
			for (var i in eventList) {
				if (eventList.hasOwnProperty(i)) {
					(function(i) {
						var customEvent = i.split('#');
						var callback = function(e) {
							e = window.event || e;
							var target = e.srcElement || e.target,
								eventType = getEventList(target);
							if (matchEvent(eventType, customEvent[1])) {
								eventList[i].call(self, e, target);
							}
						}
						addEvent(self.el, customEvent[0], callback);
					})(i)
				}
			}
			// bind toTop event
			addEvent(this.el, 'mousedown', toTop)
			if (this.config.shortcut && !hasBindShortcut) {
				// just bind once
				hasBindShortcut = true;
				addEvent(document, 'keydown', doShortcut)
			}
		},
		close: function(callback) {
			// cssText += ';display..' cannot hide select element in ie6
			this.toggleOverlay(false);
			if(this.useAnimate){
				css.hide(this.el,'ui-animate-bounceOut',callback,this);
			}else{
				this.el.style.display = 'none';
				callback && callback.call(this);
			}
			return this;
		},
		show: function(callback) {
			this.toggleOverlay(true);
			if(this.useAnimate){
				css.show(this.el,'ui-animate-bounceIn',callback,this);
			}else{
				this.el.style.display = 'block';
				callback && callback.call(this);
			}
			this.layoutFix();
			return this;
		},
		remove: function() {
			var self = this;
			this.close(function(){
				document.body.removeChild(self.el);
				self.overlayEl && document.body.removeChild(self.overlayEl);
			})
		},
		buildOverlay: function() {
			this.overlayEl = overlay = document.createElement('div');
			overlays.push(overlay);
			overlay.style.cssText += ';position: absolute;display: none;width: ' + getDocumentLayout().docWidth + 'px;height: ' + getDocumentLayout().docHeight + 'px;top: 0;left: 0;background: #000;filter: alpha(opacity=50);opacity: .5;z-index: ' + overlayIndex;
			document.body.insertBefore(overlay, document.body.firstChild);
		},
		toggleOverlay: function(show) {
			var self = this;
			var resizeOverlay = function(el) {
				el.style.cssText += ';width: ' + getDocumentLayout().docWidth + 'px;height: ' + getDocumentLayout().docHeight + 'px';
			}
			if (this.overlayEl) {
				if (show === true) {
					if(this.useAnimate){
						css.show(this.overlayEl,'ui-animate-fadeIn',null,this);
					}else{
						this.overlayEl.style.display = 'block';
					}
					resizeOverlay(this.overlayEl);
				} else {
					if(this.useAnimate){
						css.hide(this.overlayEl,'ui-animate-fadeOut',null,this);
					}else{
						this.overlayEl.style.display = 'none';
					}
				}
			}
			if (!hasBindResize) {
				hasBindResize = true;
				addEvent(window, 'resize', function() {
					for (var i = 0; i < overlays.length; i++) {
						resizeOverlay(overlays[i]);
					}
				})
			}
		},
		bindDragEvent: function(defaultEvent) {
			var self = this;
			var dragEventFn = function(e, target) {
				var elStyle = this.el.style,
					elTop = this.el.offsetTop,
					elLeft = this.el.offsetLeft;
				var beginPos = {
						x: e.pageX || e.clientX,
						y: e.pageY || e.clientY
					},
					endPos = {};
				elStyle['marginLeft'] = elStyle['marginTop'] = '';
				elStyle.cssText += ';top: ' + elTop + 'px;left: ' + elLeft + 'px;';
				document.onmousemove = function(e) {
					e = window.event || e;
					endPos = {
						x: e.pageX || e.clientX,
						y: e.pageY || e.clientY
					};
					elStyle.cssText += ';top: ' + (elTop + endPos.y - beginPos.y) + 'px;left: ' + (elLeft + endPos.x - beginPos.x) + 'px;';
				}
				document.onmouseup = function() {
					document.onmouseup = document.onmousemove = document.onselect = null;
				}
			}
			defaultEvent['mousedown#popDrag'] = dragEventFn;
		},
		layoutFix: function() {
			var offX = -this.el.offsetWidth / 2 + 'px';
				offY = -this.el.offsetHeight / 2 + 'px';
				if (isIE6) {
					this.el.style.cssText += ';top: ' + getViewLayout().height + 'px;left: ' + getViewLayout().width + 'px;';
				} else {
					this.el.style.cssText += ';top: 50%;left: 50%;';
				}
				this.el.style.cssText += ';margin-top: ' + offY + ';margin-left: ' + offX;
		}
	}
	exports.Popbox = Popbox;
})(window)