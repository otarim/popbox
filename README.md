#popbox

简易弹窗插件（自带兼容的事件方法）

##usage

	var pop = new Popbox({
		el: function(){
			return '<div class="pop-section">hello world <em data-event="popByebye">click to change it~</em></div>';
		},
		events: {
			'click#popByebye': function(e,el){
				this.reDraw(function(){
					return '<p data-event="popClose">bye~(click to close me)</p>'
				})
			}
		}
	}).show();