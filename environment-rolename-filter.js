var environmentRoleNameFilter = {
	inputId: "rolename-filter",
	machines: {},
	machineIds: [],

	machineId: function(machineName) {
		return machineName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-machine";
	},

	createFilterInput: function ()
	{
		var input = document.createElement("input");
		input.id = this.inputId;
		input.type = "text";
		input.className = "grouping-chooser";
		input.oninput = environmentRoleNameFilter.filterFor;

		return input;
	},

	addFilterInput: function(node)
	{
		console.debug("Adding environment role name filter input");

		var input = this.createFilterInput();
		var existingInput = document.getElementById(input.id);

		if (existingInput) {
			console.debug("Filter input already added, skipping...");
			return;
		}

		node.parentNode.appendChild(input);
	},

	addMachineToCache: function(node)
	{
		console.debug("Adding machine to cache:");

		var machineNode = node.parentNode.parentNode.parentNode.parentNode.parentNode; // Ernest P. Worrell goes 'Ewwwwwwww'
		console.debug("Machine node:")
		console.debug(machineNode);

		var machineNameNode = node.parentNode.parentNode.getElementsByTagName('H5')[0];
		console.debug("Machine name:")
		console.debug(machineNameNode);

		var rolesNodes = node.parentNode.getElementsByTagName('SPAN');
		console.debug("Roles:")
		console.debug(rolesNodes);

		var machineName = machineNameNode.innerText.toLowerCase();
		
		// Get roles of server
		var roles = [];
		for(var i = 0; i < rolesNodes.length; i++)
		{
			roles.push(rolesNodes[i].innerText.trim().toLowerCase());
		}
		console.debug(roles);

		machineNode.id = environmentRoleNameFilter.machineId(machineName);
		
		// The cache is machine/role -> [machineId, machineId, ...]
		environmentRoleNameFilter.machines[machineName] = [machineNode.id]; // So we don't have to switch loading styles when finding machine ids later.
		environmentRoleNameFilter.machineIds.push(machineNode.id);
		for(var i = 0; i < roles.length; i++)
		{
			if(environmentRoleNameFilter.machines[roles[i]] == null)
			{
				environmentRoleNameFilter.machines[roles[i]] = [];
			}

			environmentRoleNameFilter.machines[roles[i]].push(machineNode.id);
		}

		console.debug('Environment machine added: ' + machineName);
		console.log(environmentRoleNameFilter.machines);
	},

	filterFor: function(event) {
		console.log("Filtering for");
		console.log(event.srcElement.value.toLowerCase());
		console.log(environmentRoleNameFilter.machines);

		var machineIdsToShow = [];
		var filterText = event.srcElement.value.toLowerCase();
		for(var rolename in environmentRoleNameFilter.machines)
		{
			if (rolename.indexOf(filterText) == 0)
			{
				for(var id of environmentRoleNameFilter.machines[rolename])
				{
					console.log("pushing " + id)
					machineIdsToShow.push(id);
				}
			}
		}

		console.log("Showing:");
		console.log(machineIdsToShow);
		
		for(var id of environmentRoleNameFilter.machineIds)
		{
			var machineNode = document.getElementById(id);
			if (machineIdsToShow.indexOf(id) >= 0)
			{
				console.log("Showing " + id);
				machineNode.style.display = "block";
			} 
			else 
			{
				console.log("hiding " + id);
				machineNode.style.display = "none";
			}
		}
	},

	nodeInsertion: function(event)
	{
		// Catch Angular messing with the DOM.
		var node = event.target;
		if (node.nodeType != 1) 
			return;
		
		if (node.tagName == 'SPAN' && node.getAttribute("ng-repeat") == "role in machine.Roles")
		{
			node.addEventListener("DOMCharacterDataModified", function(e) {
				if(e.prevValue == "{{ role }} "
					&& e.path[1].parentNode.outerHTML.indexOf("{{ role }} ") < 0) // Need to wait until ALL roles have been Angulared.
				{
					environmentRoleNameFilter.addMachineToCache(e.path[1]);
				}
			});
		}

		if (node.tagName == 'H1' && node.innerText == 'Environments') {
			environmentRoleNameFilter.addFilterInput(node);
		}
	}
}