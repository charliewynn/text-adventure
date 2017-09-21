$(function(){
	if(!game) return Log.die("No Game Found");
	if(!game.Name) return Log.die("Game was not set-up properly", "Missing Game Name");
	var Game = $.extend({},game,true);
	var input = $("#input");

	function focus(){
		input.select();
		input.focus();
	}
	focus();
	$(document).click(focus);
	var oldCommandIndex = -1;
	$(input).keydown(function(event){
		//console.log(event.keyCode);
		//
		//38 = up
		//40 = down
		if(event.keyCode == 38){
			this.value = Game.state.commands.slice(oldCommandIndex)[0];
			oldCommandIndex -= 1;
			if(oldCommandIndex < -5) oldCommandIndex = -5;
		}
		if(event.keyCode == 40){
			this.value = Game.state.commands.slice(oldCommandIndex +2)[0];
			oldCommandIndex += 1;
			if(oldCommandIndex >= -1){
				oldCommandIndex = -1;
			}
		}
		if(event.keyCode == 13){
			oldCommandIndex = -1;
			Game.hear(this.value);
			Game.state.commands.push(this.value);
			Game.state.commands = Game.state.commands.slice(-5);
			Game.parse(this.value);
			this.value = '';
		}
	})
	Game.state.commands = [];

	Game.mightRestart = false;
	Game.parse = function(text){
		if(!text) return;


		if(Game.mightRestart){
			Game.mightRestart = false;
			if(["y","yes","yep"].indexOf(text.toLowerCase()) >= 0){
				Memory.reset(Game.Name);
				document.location.reload();
			}
			Game.say("Whew, thought you might quit on me there");
			return;
		}
		if(["restart","start over"].indexOf(text.toLowerCase()) >= 0){
			Game.mightRestart = true;
			Game.say("Are you sure you wish to start over?");
			return;
		}
		var lower = text.toLowerCase().trim();
		var location = Game.state.location;
		if(!location) return Log.warn("Player was not at a location");

		var lookList = ["Look","Inspect","check"];
		var goList = ["go to", "goto", "enter","go"];
		var getList = ["get", "pick up", "take"];
		var buyList = ["buy","purchase"];
		var todo = [lookList, goList, buyList, getList];

		var currentLoc = Game.currentLocation();	
		for(var action in currentLoc.Actions){
			action = currentLoc.Actions[action];
			todo.push(action.Nicknames);
		}

		var parsedAction = resolveAction(text, todo);

		if(!parsedAction) return Game.say("You can't " + text);
		switch(parsedAction.action){
			case lookList[0]:
				return Game.say(Game.currentLocation().LongText);
				break;
			case goList[0]:
				return Game.tryMove(parsedAction.stripped);
				break;
			case buyList[0]:
				return Game.tryBuy(parsedAction.stripped);
				break;
			case getList[0]:
				return Game.tryGet(parsedAction.stripped);
				break;
		}
		//we must be doing a location action if we get to this point
		Game.tryAction(parsedAction);

	}
	function resolveAction(userText, commandLists){
		for(var commandList in commandLists){
			commandList = commandLists[commandList];
			for(var command in commandList){
				command = commandList[command]
					if(userText.toLowerCase().indexOf(command.toLowerCase()) >= 0){
						var removeCommand = new RegExp(' *'+command+' *','ig');
						var stripped = userText.replace(removeCommand, '');
						var action = commandList[0];
						return {text:userText, command:command, action:action, stripped:stripped};
					}
			}
		}
	}

	Game.save = function(){Memory.save(Game.Name, Game.state);};

	Game.tryAction = function(parsedAction){
		//we might need to make this smarter as far as matching actions
		var currentLoc = Game.currentLocation();
		var possibleActions = currentLoc.Actions.filter(function(act){
			return act.Nicknames[0] == parsedAction.action;
		})
		if(!possibleActions.length == 1) return Game.die("Tried to perform " + possibleActions.length + " actions at once", possibleActions);

		var action = possibleActions[0];
		if(action.RequiresOn){
			for(var req in action.RequiresOn){
				req = action.RequiresOn[req];
				if(!Game.state[req[0]]) return Game.say(req[1]);
			}
		}
		if(action.RequiresOff){
			for(var req in action.RequiresOff){
				req = action.RequiresOff[req];
				if(Game.state[req[0]]) return Game.say(req[1]);
			}
		}

		for(var res in action.ResultsOn){
			Game.state[action.ResultsOn[res]] = true;
		}
		for(var res in action.ResultsOff){
			Game.state[action.ResultsOff[res]] = false;
		}
		//don't readd to their worth if repeating - but we'll let them repeat
		if(!Game.state[action.ShortName]){
			Game.say(action.ShortText);
			if(!Game.state.$) Game.state.$ = 0;
			if(action.Worth)
				Game.state.$ += action.Worth;
			Game.state[action.ShortName] = true;
		}
		else if(action.SecondText){
			Game.say(action.SecondText);
		}
		Game.save();
		if(action.MoveTo)
			Game.Move(action.MoveTo);

	}

	Game.tryGet = function(item){
		var loc = Game.currentLocation();
		if(!loc.Items || !loc.Items.length)
			return Game.say("Nothing to pick up here");
		for(var i in loc.Items){
			i = loc.Items[i];
			for(var nn in i.Nicknames){
				nn = i.Nicknames[nn];
				if(item.toLowerCase().indexOf(nn.toLowerCase()) >= 0){
					if(Game.state[i.ShortName])
						return Game.say("You've already picked up " + i.Name);
					for(var res in i.ResultsOn){
						Game.state[i.ResultsOn[res]] = true;
					}
					for(var res in i.ResultsOff){
						Game.state[i.ResultsOff[res]] = false;
					}
					if(!Game.state.$) Game.state.$ = 0;
					if(i.Worth)
						Game.state.$ += i.Worth;
					Game.state[i.ShortName] = true;
					Game.save();
					return Game.say("You got " + i.Name);
				}
			}
		}
		return Game.say("Couldn't find " + item);
	}

	Game.tryBuy = function(item){
		var loc = Game.currentLocation();
		if(!loc.ForSale || !loc.ForSale.length)
			return Game.say("Nothing to buy here");
		for(var i in loc.ForSale){
			i = loc.ForSale[i];
			for(var nn in i.Nicknames){
				nn = i.Nicknames[nn];
				if(item.toLowerCase().indexOf(nn.toLowerCase()) >= 0){
					if(Game.state[i.Name] && i.IsOnly)
						return Game.say("You've already bought " + i.Name);
					if(!Game.state.$)
						Game.state.$ = 0;
					if(Game.state.$ < i.Cost)
						return Game.say("You can't afford " + i.Name + ".  It costs " + i.Cost + (Game.Currency || " dollars" ) + " and you only have " + Game.state.$ + (Game.Currency || " dollars") + ".");
					Game.state.$-=i.Cost;
					for(var res in i.ResultsOn){
						Game.state[i.ResultsOn[res]] = true;
					}
					for(var res in i.ResultsOff){
						Game.state[i.ResultsOff[res]] = false;
					}
					Game.state[i.Name] = true;

					Game.save();
					return Game.say("You bought " + i.Name);
				}
			}
		}
		return Game.say("Couldn't find " + item);
	}

	Game.tryMove = function(strippedLocation){

		var loc = Game.currentLocation();

		if(strippedLocation.toLowerCase() == 'back'){
			strippedLocation = Game.state.lastLocation;
		}
		//possible locations
		for(var pl in loc.Neighbors){
			pl = loc.Neighbors[pl];
			var locNicknames = pl.slice(1);
			pl = Game.findLocation(pl[0]);
			pl.Nicknames = locNicknames;
			//check each nickname
			for(var nn in pl.Nicknames){
				if(strippedLocation.toLowerCase().indexOf(pl.Nicknames[nn].toLowerCase()) >= 0){
					if(pl.RequiresOn){
						for(var req in pl.RequiresOn){
							req = pl.RequiresOn[req];
							if(!Game.state[req[0]]) return Game.say(req[1]);
						}
					}
					if(pl.RequiresOff){
						for(var req in pl.RequiresOff){
							req = pl.RequiresOff[req];
							if(Game.state[req[0]]) return Game.say(req[1]);
						}
					}
					return Game.Move(pl.ShortName);
				}
			}
		}
		Game.say("Could not find location " + strippedLocation+"<br>You are currently at " + Game.currentLocation().Name);
	}

	Game.Move = function(location){
		Game.state.lastLocation = Game.state.location;
		Game.state.location = location;
		Game.say(Game.findLocation(location).ShortText);
		Game.save();
	}
	Game.findLocation = function(shortName){
		var locs = Game.Locations.filter(a=>a.ShortName == shortName);
		if(locs.length != 1)
			Log.die("Game location data is corrupted", "The Game could not locate '"+shortName+". searching for it returned " + locs.length + " locations");
		else
			return locs[0];
	}
	Game.currentLocation = function(){
		return Game.findLocation(Game.state.location);
	}

	Game.hear = function(text){
		var messages = $("#console");
		Game.consoleSpill();
		messages.append('<br><div class="heard">'+text+"</div><br>");
	}
	Game.consoleQueue = [];

	Game.consoleSpill = function(){
		while(Game.consoleQueue.length){
			Game.console.children().last().append(Game.consoleQueue.splice(0,1));
			if(Game.consoleQueue.length){
				Game.console.append('<div class="sent"></div>');
			}	
		}
	}
	Game.console = $("#console");
	setInterval(function(){
		if(!Game.consoleQueue.length) return;
		Game.console.children().last().append(Game.consoleQueue[0][0]);
		Game.consoleQueue[0] = Game.consoleQueue[0].substr(1);
		if(Game.consoleQueue[0].length == 0){
			Game.consoleQueue.splice(0,1);
			if(Game.consoleQueue.length){
				Game.console.append('<div class="sent"></div>');
				$("#main").scrollTop($("#main")[0].scrollHeight);
			}
		}
	}, 50);

	Game.say = function(text){
		Game.state.lastMessage = text;
		if(Game.consoleQueue.length == 0)
			Game.console.append('<div class="sent"></div>');
		Game.consoleQueue.push(text);
		//wait until consolequeue will have picked up text change and push it
		setTimeout(function(){
			$("#main").scrollTop($("#main")[0].scrollHeight);
		},51);
	}
	Game.say("-- This is a proof of concept --");
	Game.say(" - You can visit the Forest, Shop, and Deku Tree - ");
	Game.consoleSpill();
	Game.say("You can enter commands such as 'Go to ...', 'Pick up ...', 'Look Around'");
	Game.say('');
	Game.state = $.extend(Game.state,Memory.load(Game.Name),true);
	Game.say(Game.currentLocation().ShortText);
});
