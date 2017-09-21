var game = {
	Currency:"rp",
	state:{
		location:'Kokori',
		lastMessage:"You wake up in Kokori Forest"
	},
	Name: "OOT",
	Locations:[
		{
			ShortName:"SlingshotRoom",
			Name:"Deku Tree 2nd floor sideroom",
			ShortText:"You enter the side room",
			LongText:"There's a chest in this room",
			Actions:[
				{
					Name:"Opened Chest with SlingShot",
					ShortName:"GotSlingShot",
					Nicknames:["Open"],
					ResultsOn:["hasSlingshot"],
					ShortText:"You got the slingshot!",
					SecondText:"You already opened this chest"
				}
			]
		},
		{
			ShortName:"DownstairsDekuTree",
			Name:"Deku Tree Basement",
			ShortText:"You fall down to below where the spider web was",
			LongText:"Above you is the main floor of the Deku tree",
			Neighbors:[["InsideDekuTree","up"]]
		},
		{
			ShortName:"UpstairsDekuTree",
			Name:"Deku Tree 2nd floor",
			ShortText:"You climb up some vines to get to the second floor",
			LongText:"Looking down you can see an area below the spider webs on the first floor, you also see a room to the side",
			Neighbors:[["InsideDekuTree", "down"],["SlingshotRoom","side","room","slingshot"]],
			Actions:[
				{
					Name:"Jumped onto Deku Spider Web",
					ShortName:"JumpIntoSpiderWeb",
					Nicknames:["Jump"],
					RequiresOn:[["hasSlingshot","You probably shouldn't jump down until you get the slingshot"]],
					ResultsOn:["Web Broken"],
					ShortText:"You jump down and break the web on the floor below and fall through to the basement",
					SecondText:"You jump through the broken web into the basement",
					MoveTo:"DownstairsDekuTree"
				}
			]
		},
		{
			ShortName:"InsideDekuTree",
			Name:"Inside the Great Deku Tree",
			ShortText:"You enter the Great Deku Tree, you hear monsters above and below you",
			LongText:"You can go up or down",
			Neighbors:[["DekuTree","outside"],["UpstairsDekuTree","up","upstairs","second floor"]],
			Actions:[
				{
					Nicknames:["Climb"],
					MoveTo:"UpstairsDekuTree"
				}
			]
		},
		{
			ShortName:"DekuTree",
			Name:"Great Deku Tree",
			ShortText:"You made it to the Great Deku Tree",
			LongText:"Deku Tree Long Text",
			RequiresOn:[["hasShield", "Milo won't let you enter without a sheild, maybe you can find one for sale nearby"],["hasSword","Milo won't let you enter without a Sword. Maybe you can find one around here?"]],
			Neighbors:[["Kokori","kokori","forest","forrest","home"],["InsideDekuTree","inside","in"]]
		},
		{
			ShortName:"Tunnel",
			Name:"Kokori Tunnel",
			ShortText:"You crawl through a small tunnel and make it to a hidden area.",
			LongText:"You see a treasure chest and a few rupees scattered around",
			Neighbors:[["Kokori","home","forrest","forest","kokori"]],
			RequiresOff:["isAdult"],
			Actions:[
				{
					Name:"Kokori Sword",
					ShortName:"KokoriSword",
					Nicknames:["Open"],
					ResultsOn:["hasSword"],
					ShortText:"You opened a chest and found the Kokori Sword!",
					SecondText:"You already opened this chest"
				}
			],
			Items:[
				{
					ShortName:"Rupees2",
					Name: "Rupees",
					Nicknames: ["Rupees","Ruppees","money"],
					Worth: 30
				}
			]
		},
		{
			ShortName:"Kokori",
			Name:"Kokori Forest",
			ShortText:"Kokori Forest",
			LongText:"Kokori Forest is populated with the Kokori people. There are several homes and a Shop.  You notice a small tunnel.  There is a path to Hyrule Field, another leads to the Great Deku Tree, and another towards the Forest Temple",
			Neighbors:[['KokoriShop',"shop","store"], ["DekuTree","tree","deku"], ["Tunnel","tunnel","sword"]],
			Items:[
				{
					ShortName:"Rupees1",
					Name: "Rupees",
					Nicknames: ["Rupees","Ruppees","money"],
					Worth: 100
				}
			]
		},
		{
			ShortName:"KokoriShop",
			Name:"Kokori Shop",
			ShortText:"Kokori Shop - Look Around to see what you may buy",
			LongText: "Kokori Shield - 40rp",
			ForSale: [
				{
					ShortName:"KokoriShield",
					Name: "Kokori Shield",
					Nicknames:["Shield","Sheild","Kokori Shield"],
					Cost: 40,
					IsOnly: true,
					ResultsOn: ["hasShield"]
				}
			],
			Neighbors:[['Kokori',"home","forrest","forest","kokori"]]
		}
	]
}
