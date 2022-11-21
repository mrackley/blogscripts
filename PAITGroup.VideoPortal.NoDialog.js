/*
 * PAITGroup.VideoPortal.NoDialog- Create digital signatures in SharePoint
 * Version 1.0 
 * @requires jQuery v1.7 or greater 
 * @requires Office UI Fabric 
 * @requires Masonry.js
 * @requires Flip.js
 *
 * Copyright (c) 2016 Mark Rackley / PAIT Group
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @description Integrates O365 Video Portal with ShareSharePoint Online site but does not display video in a dialog box
 * @type jQuery
 * @name PAITGroup.VideoPortal.NoDialog
 * @category Plugins/PAITGroup
 * @author Mark Rackley / http://www.markrackley.net / http://www.paitgroup.com / mrackley@paitgroup.com
 */


	document.write('<div id="MediaPortal" class="MediaPortal">'+
		'<div class="MediaPlayer" ><span class="ms-font-xl ms-fontColor-white">PAIT Group Video Portal</span><i class="ms-Icon ms-font-xl ms-Icon--xCircle ms-fontColor-white arrow" aria-hidden="true"  onclick="$(\'#MediaPortal\').fadeOut();$(\'#video\').empty();"></i>'+
		'<div id="video"><br><br><br><span class="ms-font-xl ms-fontColor-white">SELECT CHANNEL BELOW TO WATCH A VIDEO</span></div>'+
		'</div>'+
		'</div>'+
		'<span id="channels" class="ms-font-l ms-fontColor-blue"></span>'+
		'<div id="results" >'+
		'<span class="ms-font-xl ms-fontColor-blue">Search: <input type="text" id="filterBox" onkeyup="FilterVideos(this.value);"></span>'+
		'<div id="PAITApps"></div>'+
		'</div>');

	function FilterVideos(value)
	{
		$("#PAITApps").masonry('destroy');

		$(".PAITApp-Tile").hide();
		$(".PAITApp-Tile:contains('"+value+"')").show();
		if(value.length == 0)
		{
			$(".PAITApp-Tile").show();			
		}
		$("#PAITApps").masonry({
				isAnimated: true,
				itemSelector: '.PAITApp-Tile',
				columnWidth: 10, 
				"gutter": 5,
				"isFitWidth": true
			}); 

	}

	var GVideoPortalURL = "";
	var GVideoChannel = "";
	
	var call = $.ajax({
		url: _spPageContextInfo.webAbsoluteUrl + "/_api/VideoService.Discover",
		type: "GET",
		dataType: "json",
		headers: {
			Accept: "application/json;odata=verbose"
		}

	});
	call.done(function (data,textStatus, jqXHR){
		GetChannels(data.d.VideoPortalUrl);
	});
	call.fail(function (jqXHR,textStatus,errorThrown){
		alert("Error retrieving Video Portal: " + jqXHR.responseText);
	});
	
	function GetChannels(VPUrl)
	{
		GVideoPortalURL = VPUrl;
		var call = $.ajax({
			url: VPUrl + "/_api/VideoService/Channels",
			type: "GET",
			dataType: "json",
			headers: {
				Accept: "application/json;odata=verbose"
			}
	
		});
		call.done(function (data,textStatus, jqXHR){
			var channels="";
			for (index in data.d.results)
			{
				channels += "<span style='cursor:pointer;' onclick='SelectChannel(\""+data.d.results[index].Id+"\");'>"+data.d.results[index].Title+"</span> | ";
			}
			$("#channels").append(channels.substring(0,channels.lastIndexOf("|")));
			$(".Results").fadeIn();
		});
		call.fail(function (jqXHR,textStatus,errorThrown){
			alert("Error retrieving Video Portal: " + jqXHR.responseText);
		});

	}
	
	function SelectChannel(value)
	{
		GVideoChannel = value;
		$("#PAITApps").masonry('destroy');
		$("#PAITApps").empty();
		var call = $.ajax({
			url: GVideoPortalURL + "/_api/VideoService/Channels('{"+value+"}')/Videos?$orderby=Title",
			type: "GET",
			dataType: "json",
			headers: {
				Accept: "application/json;odata=verbose"
			}
	
		});
		call.done(function (data,textStatus, jqXHR){
			
			var newest = new Date();
			var newestID = 0;
			var newestTitle = "";
			
			for (index in data.d.results)
			{
				if (newest.getTime() > new Date(data.d.results[index].CreatedDate).getTime()) {
					newestID = data.d.results[index].ID;
					newestTitle = data.d.results[index].Title;
					newest = new Date(data.d.results[index].CreatedDate);
				}
				
				var tile = "<div class='PAITApp-Tile' onclick='AddVideo(\""+data.d.results[index].ID+"\",\""+data.d.results[index].Title+"\")'>" +
				"  <div class='front'> " +
				"    <img width='250' src='"+data.d.results[index].ThumbnailUrl+"' />" +
				"    <span class='PAITApp-TileTitle'>"+data.d.results[index].Title+"</span>" +
				"  </div> " +
//				"  <div class='back'>" +
				"	 <div id='tableGrid' class='back ms-Grid'>"+
				"		<div class='ms-Grid-row'>"+
				"			<span class='ms-Grid-col ms-u-sm12 ms-font-xl ms-fontColor-white'>"+data.d.results[index].Title+"</span>"+
				"		</div>"+
				"		<div class='ms-Grid-row'>"+
				"			<span class='ms-Grid-col ms-u-sm4 ms-font-m-plus ms-fontColor-white'>Author:</span>"+
				"			<span class='ms-Grid-col ms-u-sm8 ms-font-m-plus ms-fontColor-white'>"+data.d.results[index].OwnerName.split(",")[0]+"</span>"+
				"		</div>"+
				"		<div class='ms-Grid-row'>"+
				"			<span class='ms-Grid-col ms-u-sm4 ms-font-m-plus ms-fontColor-white'>Duration (seconds):</span>"+
				"			<span class='ms-Grid-col ms-u-sm8 ms-font-m-plus ms-fontColor-white'>"+data.d.results[index].VideoDurationInSeconds+" </span>"+
				"		</div>"+
				"		<div class='ms-Grid-row'>"+
				"			<span class='ms-Grid-col ms-u-sm4 ms-font-m-plus ms-fontColor-white'>Description:</span>"+
				"			<span class='ms-Grid-col ms-u-sm8 ms-font-m-plus ms-fontColor-white'>"+data.d.results[index].Description+" </span>"+
				"		</div>"+
				"	</div>"+
//				"  </div> " +
				"</div>";
				
				$("#PAITApps").append(tile);

			}
			AddVideo(newestID,newestTitle);
			$(".PAITApp-Tile").flip({
			  axis: 'y',
			  trigger: 'hover'
			});
			$(".PAITApp-Tile").on('flip:done',function(){
			  $(this).find(".ms-Grid-col").fadeIn();
			});
			$("#PAITApps").masonry({
				isAnimated: true,
				itemSelector: '.PAITApp-Tile',
				columnWidth: 10, 
				"gutter": 5,
				"isFitWidth": true
			}); 
		});
		call.fail(function (jqXHR,textStatus,errorThrown){
			alert("Error retrieving Video Portal: " + jqXHR.responseText);
		});
	
	}
	
	function AddVideo(id,title)
	{
		$.cookie("SelectedVideo", title ,{ path: '/' });	
		var src = GVideoPortalURL +"/_layouts/15/VideoEmbedHost.aspx?chId=" + GVideoChannel + "&amp;vId=" + id + "&amp;width=640&amp;height=360&amp;autoPlay=false&amp;showInfo=true";

		$("#video").html('<iframe id="mediaFrame" width=640 height=360 src="'+ src +'" allowfullscreen></iframe>')
		$("#MediaPortal").fadeIn();

	}
	
	$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});