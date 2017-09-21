var Log = function(){
	var self = {};
	self.die = function(reason, details){
		console.log("%c"+reason,"color:red");
		console.log(details);
		alert("There was a critical error\r\n"+reason);
	}
	self.log = function(){
		console.log(...arguments);
	}
	self.warn = function(text){
		console.log("%c"+text,"color:orange");
	}

	return self;
}()
