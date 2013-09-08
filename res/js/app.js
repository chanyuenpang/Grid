/**
 * User: Yop Chan
 * Date: 13-3-19
 * Time: 下午11:19
 */

var App = {
	show : function(title,content,type){
		$('#vInfo>p').html(content);
	}
};

App.MessageType = {
	Normal : 0,
	Error : 1,
	Info : 2,
	Success : 3,
	Important : 4
};

$(document).ready(function(){
		DM.attachWeibo();
	}
);