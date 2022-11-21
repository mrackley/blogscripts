/*
 * HillbillyTabs.2013 - Place SharePoint 2013 Web Parts in Tabs
 * Version 4.0 
 * @requires jQuery v1.7 or greater 
 * @requires jQueryUI v1.11 or greater 
 * @requires jQuery.cookie 
 *
 * Copyright (c) 2013-2015 Mark Rackley
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @description Places SharePoint WebPart into jQuery UI Tabs
 * @type jQuery
 * @name HillbillyTabs.2013
 * @category Plugins/HillbillyTabs
 * @author Mark Rackley / http://www.markrackley.net / mrackley@gmail.com
 */

   $("#contentBox").hide();


function VerticalHillbillyTabs(webPartTitles)
{
    HillbillyTabs(webPartTitles,false);
}

function HillbillyTabs(webPartTitles,horizontal)
{
    if (horizontal == undefined)
    {
        horizontal = true;
    }
   	
   	var tabWidth = 0;
   	
    var CEWPID = "";
    var tabDivID = "";
    var ulID = "";
    $("#tabsContainer").closest("[id^='MSOZoneCell_WebPart']").find("span[id^='WebPartCaptionWPQ']").each(function()
    {
        CEWPID = $(this).attr("id");
    });
    if (CEWPID == "")
    {
        CEWPID = $("#tabsContainer").closest("[id^='MSOZoneCell_WebPart']").attr("id");
    }
    
    tabDivID = CEWPID + "TabsDiv";
    ulID = CEWPID + "Tabs";
    $("#tabsContainer").attr("id",tabDivID).append("<ul id='"+ulID+"'></ul>");
    
    if(webPartTitles == undefined)
    {
		
        var index = 0;
        $("#" + tabDivID).closest("div.ms-webpart-zone, div.ms-rte-layoutszone-inner").find("h2.ms-webpart-titleText").each(function()
        {
            if($(this).find("span[id^='WebPartCaptionWPQ']").attr("id") != CEWPID)
            {
                var title = $(this).text();
                
                $("#"+ulID).append('<li><a href="#Tab'+index+CEWPID+'" id="TabHead'+index+CEWPID+'" onclick="HillbillyTabClick(this.id);">'+
                    title+'</a></li>').after('<div id="Tab'+index+CEWPID+'"></div>');
                
                var webPart = $(this).closest("[id^='MSOZoneCell_WebPart']");
               if (webPart.width() > tabWidth)
                {
                   	tabWidth = webPart.width();
                }
                
                $("#Tab" + index+CEWPID).append((webPart));
                index++;
            }
        });
    } else {
    for(index in webPartTitles)
        {
            var title = webPartTitles[index];
            var tabContent = title.split(";#");
            if (tabContent.length > 1)
            {
                $("#"+ulID).append('<li><a href="#Tab'+index+CEWPID+'" id="TabHead'+index+CEWPID+'" onclick="HillbillyTabClick(this.id);">'+
                    tabContent[0]+'</a></li>').after('<div id="Tab'+index+CEWPID+'"></div>');
            
                for(i = 1; i < tabContent.length; i++)
                {
                    $("h2.ms-webpart-titleText").each(function()
                    {
                        $(this).find("span:contains('"+tabContent[i]+"')").each(function()
                        {
                             if ($(this).text() == tabContent[i]){
                                
                                var webPart = $(this).closest("span").closest("[id^='MSOZoneCell_WebPart']");
				                if (webPart.width() > tabWidth)
				                {
				                	tabWidth = webPart.width();
				                }
                                
                                
                                $("#Tab" + index+CEWPID).append((webPart));
                             }
                            
                        });
                    });
                }
            }
            else
            {
                $("h2.ms-webpart-titleText").each(function()
                {
                    $(this).find("span:contains('"+title+"')").each(function()
                    {
                         if ($(this).text() == title){
                            $("#"+ulID).append('<li><a href="#Tab'+index+CEWPID+'" id="TabHead'+index+CEWPID+'" onclick="HillbillyTabClick(this.id);">'+
                                title+'</a></li>').after('<div id="Tab'+index+CEWPID+'"></div>');
                            
                            var webPart = $(this).hide().closest("span").closest("[id^='MSOZoneCell_WebPart']");
				            if (webPart.width() > tabWidth)
			                {
			                	tabWidth = webPart.width();
			                }
                            
                            $("#Tab" + index+CEWPID).append((webPart));
                         }
                        
                    });
                });
            }
        }
    }
    
     HideErrorParts();

     if(horizontal)
     {
        $("#"+tabDivID).tabs();
     } else {
		$("<style>")
		    .prop("type", "text/css")
		    .html("\
				.ui-tabs.ui-tabs-vertical {\
				    padding: 0;\
				    width: 100%; \
				    min-width: 600px;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-widget-header {\
				    border: none;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-tabs-nav {\
				    float: left;\
				    width: 10em;\
				    background: #CCC;\
				    border-radius: 4px 0 0 4px;\
				    border-right: 1px solid gray;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-tabs-nav li {\
				    clear: left;\
				    width: 100%;\
				    margin: 0.2em 0;\
				    border: 1px solid gray;\
				    border-width: 1px 0 1px 1px;\
				    border-radius: 4px 0 0 4px;\
				    overflow: hidden;\
				    position: relative;\
				    right: -2px;\
				    z-index: 2;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-tabs-nav li a {\
				    display: block;\
				    width: 100%;\
				    padding: 0.6em 1em;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-tabs-nav li a:hover {\
				    cursor: pointer;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-tabs-nav li.ui-tabs-active {\
				    margin-bottom: 0.2em;\
				    padding-bottom: 0;\
				    border-right: 1px solid white;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-tabs-nav li:last-child {\
				    margin-bottom: 10px;\
				}\
				.ui-tabs.ui-tabs-vertical .ui-tabs-panel {\
				    float: left;\
				    width: 28em;\
				    border-left: 1px solid gray;\
				    border-radius: 0;\
				    position: relative;\
				    left: -1px;\
				}\
		    ")
		    .appendTo("head");
     
        $( "#"+tabDivID).tabs().addClass('ui-tabs-vertical ui-helper-clearfix');
        //        $( "#"+tabDivID + " li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
     }
    
    ShowActiveTab();
    $("#contentBox").fadeIn("slow");


}

function HillbillyTabClick(id)
{
    $.cookie("ActiveTab",id,{ path: '/' });
}

function ShowActiveTab()
{
    $("#" + $.cookie("ActiveTab")).click();
}

  function HideErrorParts()
{
    $("span[id^='WebPartCaptionWPQ']").each(function()
    {
        $(this).prev("span:contains('Error')").each(function()
        {
                
                var webPart = $(this).closest("span").closest("[id^='MSOZoneCell_WebPart']").hide();
            
        });
    });
}
