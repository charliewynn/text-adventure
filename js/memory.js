var Memory = function(){
	var self = {};
	self.load = function(name){
		console.log("loaded");
		return readCookie(name)||{};
	},
	self.save = function(name, state){
		console.log("saved");
		writeCookie(name, state, 1);
	}
	self.reset = function(name){
		localStorage.removeItem(name);
	}
    function writeCookie(c_name,value,exdays)
    {
		value = JSON.stringify(value);
		localStorage.setItem(c_name,value);
    }

    function readCookie(c_name)
    {
		return JSON.parse(localStorage.getItem(c_name));
    }

	return self;
}()
