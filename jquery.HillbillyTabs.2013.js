/*
 * HillbillyTabs.2013 - Place SharePoint 2013 Web Parts in Tabs
 * Version 3.0 
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

function HillbillyTabs(webPartTitles)
{
    
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
                            
                            $("#Tab" + index+CEWPID).append((webPart));
                         }
                        
                    });
                });
            }
        }
    }
    
     HideErrorParts();

    $("#"+tabDivID).tabs();
    
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


