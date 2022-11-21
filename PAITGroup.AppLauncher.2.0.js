$.fn.PAITGroupAppLauncher= function (options)
{
     var opt = $.extend({}, {
		listName: 'PromotedLinks',
		tileWidth: 100,
        tileHeight: 100,
        showTitle: true
    }, options);
	
		
	var call = $.ajax({
		url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('"+opt.listName+"')/items?orderby=Order",
		type: "GET",
		dataType: "json",
		headers: {
			Accept: "application/json;odata=verbose"
		}
	});
	call.done(function (data,textStatus, jqXHR){
			for(index in data.d.results)
			{
				var tile = "<div class='PAITApp-Tile' onclick='window.location=\""+data.d.results[index].LinkLocation.Url+"\";'>"+
							"<div class='front'>"+
							"<img width='"+opt.tileWidth+"' height='"+opt.tileHeight+"' src='"+data.d.results[index].BackgroundImageLocation.Url+"'>";
				if (opt.showTitle)
				{
					tile += "<div class='PAITApp-TileTitle'>"+data.d.results[index].Title+"</div>";
				}
				tile += "</div><div class='back'>" +
								data.d.results[index].Description +
							"</div>"+
						  "</div>";
				$("#PAITApps").append(tile);
			}

		$('.PAITApp-Tile,.back').css({"height":opt.tileHeight});
		$('.PAITApp-Tile,.back').css({"width":opt.tileWidth});
		
			$(".PAITApp-Tile").flip({
					axis: 'y',
					trigger: 'hover'
				});
				
				
				
			$("#PAITApps").masonry({
  // options
  itemSelector: '.PAITApp-Tile',
  columnWidth: 200
}); 
			

	});
	
	call.fail(function (jqXHR,textStatus,errorThrown){
		alert("Error retrieving Apps: " + jqXHR.responseText);
	});
}

