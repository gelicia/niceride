Array.prototype.returnVal = function(stationName, attributeName) {
    for (var idx = 0; idx < this.length; idx += 1) {
        if (this[idx].stationName === stationName) {
        	if (attributeName == 'bikes'){
        		return this[idx].bikes;
        	}
        	else if (attributeName == 'free'){
        		return this[idx].free;
        	}
        	else if (attributeName == 'bikesDiff'){
        		return this[idx].bikesDiff;
        	}
        	else {
        		return null;
        	}
        }
    }
    return null;
};

function loadDataset () {

	var requests = 1000;
    var madeRequests = 0;
    var prevSet = [];
    var diffSet = [];
    //var updSet = [];

	var stationInfoSet = new Miso.Dataset({
	url : function () {
		var u = 'http://api.citybik.es/niceride.json?req=' + madeRequests + '&callback=';
		//console.log(u);
		return u;
	},	
	interval: 10000, 
	sync: true, 
	jsonp : true,
	resetOnFetch: true
	});

	stationInfoSet.fetch({
	  success : function() {
	    // track how many requests we've made
	    madeRequests++;

	    // If we reached our max
	    if (madeRequests >= requests) {
	      // stop the importer.
	      this.importer.stop();
	    }

	    var content = document.getElementById('content');

	    if (prevSet.length > 0){ //If elements exist in the prev set, get the differences
	    	diffSet.length = 0; //clear out previous diffSet info
			this.each(
	  			function (row){
	  				var diffInfo = new Object();
	  				diffInfo.stationName = row.name;
	  				diffInfo.internalID = row.internal_id;
	  				diffInfo.bikesDiff = row.bikes - prevSet.returnVal(diffInfo.stationName, 'bikes');
	  				diffInfo.freeDiff = row.free - prevSet.returnVal(diffInfo.stationName, 'free');
	  				diffSet.push(diffInfo);
	  			}
	  		);

	  		prevSet.length = 0; 
	    }

		
		this.each( //fill prevSet with the current set of information, either for the first time or after diffs are ascertained
			function(row){
				var stationInfo = new Object();
				stationInfo.stationName = row.name;
				stationInfo.internalID = row.internal_id;
				stationInfo.bikes = row.bikes;
				stationInfo.free = row.free;

				prevSet.push(stationInfo);
			}
		);

		if (diffSet.length == 0) {
			d3.select("body")
				.append("div")
					.attr("class", "chart")
				.selectAll(".bar")
				.data(prevSet)
				.enter()
				.append("div")
					.attr("class", "line")
					.attr("id", function(d) {return "intID" + d.internalID})

			d3.selectAll("div.line")
	            .append("div")
	            .attr("class","label")
	            .text(function(d){return d.stationName})

			d3.selectAll("div.line")
				.append("div")
				.attr("class", "bar")
				.style("width", function(d){return (d.bikes * 10 ) + "px"})
				.text(function(d){return d.bikes});
		}
		else {
			for (var i = 0; i < diffSet.length; i += 1) {
				var diffRow = document.getElementById("intID" + diffSet[i].internalID);

				for (var j = 0; j < diffRow.children.length; j += 1) {	
				//two children - bar something and label, leave the label child alone		
					if (diffRow.children[j].className.substring(0, 3) == 'bar')
					{
						var newBikeDiff = prevSet.returnVal(diffSet[i].stationName, 'bikes');
						if (diffSet[i].bikesDiff > 0)
						{
							diffRow.children[j].className='bar barincrement';
						}
						else if (diffSet[i].bikesDiff < 0) { //decreased bikes
							diffRow.children[j].className='bar bardecrement';
						}
						else { //reset to bar
							diffRow.children[j].className='bar';
						}

						if (diffSet[i].bikesDiff != 0) 
						{
							diffRow.children[j].style.cssText = "width: " +  (newBikeDiff * 10) + "px";
							diffRow.children[j].textContent = newBikeDiff;
						}
					}
				}

			}

		}
		
	  
		}
	});
}