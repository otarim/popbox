;(function(exports){
// -- Popbox by otarim
// todo: show(timeout)  ---close(timeout) 
function preventDefault(e){
	e = window.event || e;
	e.preventDefault ? e.preventDefault() : e.returnValue = false;
	return true;
}
function getData(el, property) {
	return 'dataset' in el ? el.dataset[property] : el.getAttribute('data-' + property);
}
function setData(el, property, value) {
	return 'dataset' in el ? (el.dataset[property] = value) : (el.setAttribute('data-' + property,value))
}
var eventHub = {};
var isIE = !-[1,];
var specialTypes = {
	mouseenter : {
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
	var contains = function(el,target){
		if(el.compareDocumentPosition){
			return (el.compareDocumentPosition(target) & 16) !== 0;
		}else{
			return el.contains(target);
		}
	}
	var bindEvent = function(el,type,callback,rpk){
		var _callback = callback,useCapture = false,
			target,_type;
		if(type === 'mouseenter' || type === 'mouseleave'){
			_type = type;
			type = specialTypes[_type]['type'];
			callback = function(e){
				var e = window.event || e;
				target = e.relatedTarget || e[specialTypes[_type]['target']];
				if(contains(el,target) || el === target){
					e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				}else{
					_callback.call(el,e);
				}
			}
			eventHub[_type] = eventHub[_type] || [];
			eventHub[_type].push({
				_callback: _callback,
				callback: callback
			});
		}
		if(type === 'blur' || type === 'focus'){
			useCapture = true;
			type = specialTypes[type];
		}
		return rpk.call(el,type,callback,useCapture);
		
	}
	if (typeof addEventListener === 'function') {
		return function(el, type, callback) {
			bindEvent(el, type, callback,function(type,callback,useCapture){
				return el.addEventListener(type, callback, useCapture);
			});
		}
	} else {
		return function(el, type, callback) {
			bindEvent(el, type, callback,function(type,callback){
				return el.attachEvent('on'+type, callback);
			});
		}
	}
})();

var removeEvent = (function(){
	var digCallback = function(el,type,callback,rpk){
		var hub,_type,useCapture = false;
		if(type === 'mouseenter' || type === 'mouseleave'){
			hub = eventHub[type];
			_type = type;
			type = specialTypes[_type]['type'];
			for(var i = 0;i < hub.length;i++){
				if(callback === hub[i]['_callback']){
					callback = hub[i]['callback'];
					break;
				}
			}
		}
		if(type === 'blur' || type === 'focus'){
			useCapture = true;
			type = specialTypes[type];
		}
		return rpk.call(el,type,callback,useCapture);
	}
	if (typeof removeEventListener === 'function') {
		return function(el, type, callback) {
			digCallback(el,type,callback,function(type,callback,useCapture){
				return el.removeEventListener(type,callback,useCapture);
			})
		}
	} else {
		return function(el, type, callback) {
			digCallback(el, type, callback,function(type,callback){
				return el.attachEvent('on'+type, callback);
			});
		}
	}
})();
function Popbox(config){
	// default layout
	var wrap = this.el = document.createElement('div');
	var defaultEvent = {
		'click#popClose': this.close
	};
	this.events = config && config.events && Popbox.merge(defaultEvent,config.events) || defaultEvent;
	wrap.className = 'popbox-container_';
	wrap.style.cssText += ';position: fixed;_position: absolute;top: 50%;left: 50%;-webkit-transform: translate(-50%,-50%);-moz-transform: translate(-50%,-50%);-o-transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);transform: translate(-50%,-50%);display: none';
	config.style && (wrap.style.cssText += Popbox.coStyle(config.style));
	wrap.innerHTML = config && config.el && config.el.call(this,this.el) || '';
	document.body.insertBefore(wrap, document.body.firstChild);
	this.bind();
}

Popbox.merge = function(obj,target){
	for(var i in target){
		if(target.hasOwnProperty(i)){
			obj[i] = target[i];
		}
	}
	return obj;
}

Popbox.coStyle = function(styleList){
	var ret = [';'];
	for(var i in styleList){
		if(styleList.hasOwnProperty(i)){
			ret.push(i + ':' + styleList[i]);
		}
	}
	return ret.join(';')
}

Popbox.prototype = {
	reDraw: function(callback,styleObj){
		styleObj && (this.el.style.cssText += Popbox.coStyle(styleObj));
		this.el.innerHTML = callback.call(this,this.el);
		this.ieFix();
		return this;
	},
	bind: function(){
		var eventList = this.events,
			self = this;
		for(var i in eventList){
			if(eventList.hasOwnProperty(i)){
				(function(i){
					var customEvent = i.split('#');
					var callback = function(e){
						e = window.event || e;
						var target = e.srcElement || e.target,
							eventType = getData(target,'event');
						if(eventType === customEvent[1]){
							eventList[i].call(self,e,target);
						}
					}
					addEvent(self.el,customEvent[0],callback);
				})(i)
			}
		}
	},
	close: function(){
		this.el.style.cssText += ';display: none;';
		return this;
	},
	show: function(){
		this.el.style.cssText += ';display: block;';
		this.ieFix();
		return this;
	},
	remove: function(){
		document.body.removeChild(this.el);
	},	
	ieFix: function(){
		// 隐藏元素拿不到 layout
		var offX,offY;
		if(!-[1,]){
			offX = -this.el.offsetWidth / 2 + 'px';
			offY = -this.el.offsetHeight / 2 + 'px';
			this.el.style.cssText += ';margin-top: ' + offY + ';margin-left: ' + offX;
		}
	}
}
exports.Popbox = Popbox;
})(window)