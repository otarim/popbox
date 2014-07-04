#popbox

简易弹窗插件（自带兼容的事件方法）

##usage

	var pop = new Popbox({
		el: function(){
			return '<div class="pop-section">hello world <em data-event="popByebye">click to change it~</em></div>';
		},
		style: {
			width: '350px'
		},
		events: {
			'click#popByebye': function(e,el){
				this.reDraw(function(){
					return '<p data-event="popClose">bye~(click to close me)</p>'
				},{color: red})
			}
		}
	}).show();
	
##property & method

**el**

	返回弹窗的结构（不包含最外层container标签）
	
**event**
	
	方法名#data-event属性的值，事件代理在最外层元素，支持 focus 以及 blur 冒泡
	e: 事件源
	el: 目标元素
	
**reDraw(callback,style)**

	callback: 返回重绘弹窗的结构
	style: 最外层container的样式
	
**style**

	指定最外层container的样式
	
**close**

	关闭弹窗
	
**show**

	显示弹窗
	
**remove**

	从 dom 节点删除弹窗
	
*ieFix*

	用于修复 ie 居中