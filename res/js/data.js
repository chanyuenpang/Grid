/**
 * User: Yop Chan
 * Date: 13-3-19
 * Time: 下午11:19
 */

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function(fmt)
{
	//author: meizz
	var o = {
		"M+" : this.getMonth()+1,                 //月份
		"d+" : this.getDate(),                    //日
		"h+" : this.getHours(),                   //小时
		"m+" : this.getMinutes(),                 //分
		"s+" : this.getSeconds(),                 //秒
		"q+" : Math.floor((this.getMonth()+3)/3), //季度
		"S"  : this.getMilliseconds()             //毫秒
	};
	if(/(y+)/.test(fmt))
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("("+ k +")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
	return fmt;
}

//namespace
var gd = {};

gd.ContentType = {
	Empty : -1,
	Text : 'text',
	Image : 'image',
	Link : 'link'
};

var DM = {

	root : "https://yop-dev.firebaseIO.com/grid/",
	userRoot : "https://yop-dev.firebaseIO.com/grid/user/",
	dataRoot : "https://yop-dev.firebaseIO.com/grid/userdata/",
	statisRoot : "https://yop-dev.firebaseIO.com/grid/statis/",

	_data : {
		content : {
			gift : {
				_0x0 : {
					id : '_0x0',
					name : "Welcome!",
					content : {
						image : {
							caption : "今天也是愉快的一天，欢迎使用 储物柜 ~",
							url : "res/image/welcome.jpg",
							preview_url : "res/image/welcome.jpg"
						},
						text : {
							caption : null,
							content : null
						},
						link : {
							caption : null,
							url : null
						},
						meta : {
							copy_able : true,
							style : 0
						}
					},
					option : {
						password : null,
						effective_date : null,
						expire_date : null,
						random_box_id : null,
						random_rate : null,
						visible : true
					},
					statis : {
						total_visit : 0,
						daily_visit : 0,
						copy : 0
					}
				}
			}
		},
		category : {
			home : {
				id : "home",
				name : "小柜",
				used : 0,
				total_visit : 0,
				daily_visit : 0,
				random_source : false,
				deletable : false,
				size : {
					width : 4,
					height : 5
				},
				created_by : 'user',
				content : {
					image : 0,
					text : 0,
					link : 0
				}
			},
			gift : {
				id : "gift",
				name : "收件箱",
				used : 1,
				total_visit : 0,
				daily_visit : 0,
				random_source : false,
				deletable : false,
				size : {
					width : 4,
					height : 5
				},
				created_by : 'user',
				content : {
					image : 1,
					text : 0,
					link : 0
				}
			}
		}
	},
	_user : {
		profile : {
			id : 0,
			screen_name : 0,
			profile_image_url : 0,
			url : 0,
			gender : 0
		},
		statis : {
			category_count : 2,
			box_count : 40,
			usage_count : 1,
			total_visit : 0,
			daily_visit : 0
		}
	},

	user : {
		profile : {
			id : 0,
			screen_name : 0,
			profile_image_url : 0,
			url : 0,
			gender : 0
		},
		statis : {
			category_count : 2,
			box_count : 40,
			usage_count : 1,
			total_visit : 0,
			daily_visit : 0
		}
	},
	categories : null,

	attachWeibo : function(){
		WB2.anyWhere(function(W){
			W.widget.connectButton({
				id: "wb_connect_btn",
				type:"2,2",
				callback : {
					login: DM.auth,
					logout: DM.logout
				}
			});
		});
	},

	_createUser : function(authClient, user){
		var id = DM._user.profile.id;
		if(!id) return;
		var fb = new Firebase(DM.userRoot);
		fb.child(id).set(DM._user, function(error){
			if(!error) {
				fb = new Firebase(DM.dataRoot);
				DM._data.category.gift.created_by = user.email;
				DM._data.category.home.created_by = user.email;
				fb.child(id).set(DM._data, function(error){
					if(!error){
						authClient.createUser(user.email, user.password, function(error, u) {
							if (error) {
								App.show('Error','抱歉，关联账号信息出错了，请重新登录。',App.MessageType.Error)
							} else DM.login();
						});
					}
				});
			}
		});
	},

	auth : function(o){
		o.status = null;
		DM.user.profile = o;
		var userData = {
			email : '' + o.id + '@yop.hk',
			password : '' + o.id,
			rememberMe: true
		};

		var rootRef = new Firebase(dm.rootRef);
		var authClient = new FirebaseAuthClient(DM._root, function(error, user){
			if(error){
				switch(error.code){
					case 'INVALID_USER':
						DM._createUser(this,userData);
						break;
					default :
						App.show('Notice','很抱歉，登录失败，请刷新重试。',App.MessageType.Error);
				}
			} else if(user){
				DM.login();
			} else {
				this.login('password', userData);
			}
		});
	},

	login : function(){
		var id = DM.user.profile.id;
		if(!id) return;
		var fb = new Firebase(DM.userRoot);
		fb.child(id).once('value',function(snap){
			DM.user = snap.val();
		});
		DM.user.statis.daily_visit++;
		DM.user.statis.total_visit++;
		DM.save();

		DM.categories = [];
		fb = new Firebase(DM.dataRoot).child(id).child('category');
		fb.once('value', function(snap){
			var data = snap.val();
			for(var i in data){
				DM.categories[data[i].id] = new gd.Category(data[i]);
			}
		});
	},

	logout : function(){
		DM._user.profile = null;
		DM.user = null;
		DM.categories = null;
	},

	removeCategory : function(id){
		var c = DM.categories[id];
		if(c){
			c.remove(function(err){
				if(!err){
					DM.user.statis.category_count++;
					DM.user.statis.box_count -= c.data.size.width* c.data.size.height;
					DM.user.statis.usage_count -= c.data.used;
					DM.save();
					DM.categories[id] = null;
				}
			});
		}
	},

	createCategory : function(cName){
		var id = '' + DM.user.statis.category_count + 100000;
		var data = {
			id : id,
			name : cName,
			used : 0,
			total_visit : 0,
			daily_visit : 0,
			random_source : false,
			deletable : true,
			size : {
				width : 4,
				height : 5
			}
		}
		var path = DM.dataRoot + DM.user.profile.id + '/category/' + id;
		var fb = new Firebase(path);
		fb.set(data,function(error){
			if(!error){
				DM.categories[id](new gd.Category(data));
				DM.user.statis.category_count++;
				DM.user.statis.box_count+= data.size.width*data.size.height;
				DM.save();
				App.show('Success','新建柜子成功。',App.MessageType.Success);
			} else {
				App.show('Error','新建失败，请稍后重试。',App.MessageType.Error);
			}
		});
	},

	save : function(callback){
		var fb = new Firebase(DM.userRoot + DM.user.profile.id + '/statis/');
		fb.update(DM.user.statis, callback);
	}
};

gd.Box = cc.Class.extend({
	_parent : 0,
	_data : null,

	ctor : function(id,parent){
		this._parent = parent;
		this._data = {
			id : id,
			option : {
				visible : true
			},
			statis : {
				total_visit : 0,
				daily_visit : 0,
				copy : 0
			}
		}
	},

	setData : function(data){
		this._data = data;
	},

	setContent : function(content){
		var back = this._data.content;
		this._data.content = content;
		this.save('content', function(err){
			if(!err) {
				App.show('Success','保存成功！',App.MessageType.Success);
			} else {
				this._data.content = back;
				App.show('Error','保存失败，请稍后再试！',App.MessageType.Error);
			}
		});
	},

	setOptions : function(options){
		var back = this._data.option;
		this._data.option = options;
		this.save('option', function(err){
			if(!err) {
				App.show('Success','设置成功！',App.MessageType.Success);
			} else {
				this._data.option = back;
				App.show('Error','设置失败，请稍后再试！',App.MessageType.Error);
			}
		});
	},

	open : function(){
		var statis = this._data.statis;
		statis.total_visit++;
		var today = (new Date()).format('yyyyMMdd');
		var daily = statis.daily_visit[today];
		statis.daily_visit = [];
		statis.daily_visit[today] = (daily ? daily+1 : 1);
		this.save('statis');
	},

	empty : function(){
		this.setContent(null);
	},

	save : function(type, callback){
		if(!this._data.created) {
			type = null;
			this._data.created = new Date();
			this._data.created = new Date();
		}
		var fb = new Firebase(this._parent.contentRoot());
		fb = fb.child(this._data.id);
		var data = this._data;
		if(type) {
			fb = fb.child(type);
			data = this._data[type];
		}
		fb.update(data, function(err){
			if(callback) callback.call(this,err);
		});
	}
});

gd.Category = cc.Class.extend({

	_data : null,
	_boxes : null,

	ctor : function(data){
		this._data = data;
	},

	root : function(){
		return DM.dataRoot + DM.user.profile.id + '/category/' + this._data.id + '/';
	},

	contentRoot : function(){
		return DM.dataRoot + DM.user.profile.id + '/content/' + this._data.id + '/';
	},

	checkIn : function(force){
		if(this._boxes != null && !force) return;
		this._boxes = [];
		var s = this._data.size;
		var id;
		for(var x = 0; x < s.width; x++){
			for(var y = 0; y < s.height; y++){
				id = '_'+x + 'x' + y; // string like _1x1
				this.boxes[id] = new gd.Box(id,this);
			}
		}
		var fb = new Firebase(this.contentRoot());
		fb.once('value', function(snap){
			var v = snap.val();
			for( var id in v){
				this._boxes[id].setData(v[id]);
			}
		});
	},

	checkOut : function(){
		this._boxes = null;
	},

	remove : function(callback){
		if(!this._data.deletable) {
			App.show('Notice','抱歉，这个柜子不可以被删除。', App.MessageType.Important);
			return;
		}
		var self = new Firebase(this.root());
		self.remove(function(error){
			if(!error){
				var content = new Firebase(this.contentRoot());
				content.remove(function(error){
					if(!error){
						App.show('Success','柜子已经成功删除。', App.MessageType.Success);
					}
					else{
						App.show('Error','出错了，柜子已经清空，请稍后再删除柜子。', App.MessageType.Error);
					}
					if(callback) callback.call(this, error);
				});
			} else {
				App.show('Error','出错了，删除失败，请稍后重试。', App.MessageType.Error);
				if(callback) callback.call(this, true);
			}
		});
	},

	open : function(){
		this.checkIn();
		this._data.total_visit++;
		var today = (new Date()).format('yyyyMMdd');
		var daily = this._data.daily_visit[today];
		this._data.daily_visit = [];
		this._data.daily_visit[today] = (daily ? daily+1 : 1);
		this.save();
	},

	save : function(callback){
		var fb = new Firebase(this.root());
		fb.update(this._data, function(err){
			if(callback) callback.call(this,err);
		});
	},

	setName : function(name){
		this._data.name = name;
		this.save(function(err){
			if(!err){
				App.show('Success','修改成功。',App.MessageType.Success);
			} else {
				App.show('Error','操作失败，请稍后再重试。',App.MessageType.Error);
			}
		});
	}
});