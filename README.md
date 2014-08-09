#popbox

简易弹窗插件（自带兼容的事件方法）

##usage

	var pop = new Popbox({
		el: function(){
			return '<div class="pop-section" data-event="popDrag">hello world <em data-event="popByebye,logMessage">click to change it~</em></div>';
		},
		overlay: true,
		dragable: true,
		style: {
			width: '350px',
			padding: '20px 50px'
		},
		events: {
			'click#popByebye': function(e,el){
				this.reDraw(function(){
					return '<p data-event="popClose">bye~(click to close me)</p>'
				},{color: 'red'})
			},
			'click#logMessage': function(){
				console.log('#$@');
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

**overlay**

	是否需要遮罩

**dragable**

	是否可以拖动
	
**close(callback)**

	关闭弹窗
	
**show(callback)**

	显示弹窗
	
**remove**

	从 dom 节点删除弹窗
	
##update log

1. 140715add: 现在支持多事件绑定到同一个元素上面了。(用逗号`,`分隔事件);
2. 140727add: 增加遮罩层以及是否可拖动选择。(当`dragable`为`true`时，需要在可拖动元素上面添加`data-event="popDrag"`);
3. 140730add: 增加了多弹窗层级控制(点击置顶) 
4. 140809fix: 修复 resize 时遮罩层尺寸问题