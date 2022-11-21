/*
 * HillbillyTabify - Turn SharePoint forms into a tabbed internface
 * Version 1.0 
 * @requires jQuery v1.7 or greater 
 * @requires jQueryUI v1.11 or greater 
 *
 * Copyright (c) 2013-2015 Mark Rackley
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @description Turn SharePoint forms into a tabbed internface
 * @type jQuery
 * @name HillbillyTabify
 * @category Plugins/HillbillyTabs
 * @author Mark Rackley / http://www.markrackley.net / mrackley@gmail.com
 *
 * This solution is provided "as-is" without warranty. Use at your own risk
 * 
 */


$("#onetIDListForm").hide();
$(".ms-formtable").hide();

function HillbillyTabifyForms(tabInfo)
	{
        var count = 0;
        var currentIndex = -1;
        var currentTab = "";
        
		$("table.ms-formtable td").each(function(){
            if (this.innerHTML.indexOf('FieldName="') != -1){
                if (count == 0)
                {
                    currentIndex++;
                    if (currentIndex >= tabInfo.length)
                    {
                        return;
                    }                    
                    if(currentTab != tabInfo[currentIndex].title)
                    {
                        currentTab = tabInfo[currentIndex].title;
                        $("#HillbillyTabs").append('<li><a href="#Tab'+currentIndex+'" id="TabHead'+currentIndex+'">'+
                            currentTab+'</a></li>').after('<div id="Tab'+currentIndex+'"><table id="table'+currentIndex+'"></table></div>');
                        count = tabInfo[currentIndex].size;
                    }
                }
                $("#table" + currentIndex).append($(this).closest("tr"));
                count--;
            }
		});	

        $("#tabsContainer").tabs();
        $("#onetIDListForm").fadeIn("slow");
        $(".s4-wpcell").fadeIn();
        $(".ms-formtable").fadeIn("slow");
	}

