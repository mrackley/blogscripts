/*
/*
 * StratusForms - Store HTML forms in SharePoint lists using jQuery
 * Version 1.2 BETA!!  
 * @requires jQuery v1.4.2 or greater - jQuery 1.10+ recommended
 * 
 *
 * Copyright (c) 2013-2016 Mark Rackley
 * This work is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 * http://creativecommons.org/licenses/by-nc/3.0/
 */
/**
 * @description Store HTML forms in SharePoint lists using jQuery & a data layer
 * @type jQuery
 * @name StratusForms
 * @category Plugins/StratusForms
 * @author Mark Rackley / http://www.markrackley.net / info@stratusforms.com
 */

(function ($) {

    var gStratusFormsFormID = "0";
    var gStratusFormsEncryptClass = "SFEncrypt"
    var gStratusFormsEncryptedString = "SFEncrypted";
    var gStratusFormsDecryptedStringTest = "SFDecrypted";
    var gStratusFormsEncrptForm = false;
    var gStratusFormsSecret = undefined;
    var gStratusFormsDecryptFailed = false;
    var gStratusFormsChildListData = new Array();
    
    $.fn.StratusFormsLight = function (options)
    {
	     var opt = $.extend({}, {
			useInternalFieldName: false,
            completefunc: null
        }, options);

    	  //loop through all the spans in the custom layout        
        $("span.StratusFormsTemplate").each(function()
        {
            //get the display name from the custom layout
            var formField = $(this).attr("data-FormField");

            formField = formField.replace(/&(?!amp;)/g,'&amp;');
            elem = $(this);
            //find the corresponding field from the default form and move it
            //into the custom layout
            var fieldType = "FieldName";
			if (opt.useInternalFieldName)
			{
				fieldType = "FieldInternalName";
			}

            $("table.ms-formtable td").each(function(){
                if (this.innerHTML.indexOf(fieldType + '="'+formField +'"') != -1){
                    $(this).contents().appendTo(elem);
                }
            });
        });
         if (opt.completefunc !== null) {
                opt.completefunc();
            }

    };

    $.fn.StratusFormsInitialize = function (options) {

        var opt = $.extend({}, {
            listID: "0",
            queryStringVar: "ID",
            StratusFormsDataField: "StratusFormsData",
            listName: "",
            addRequiredFields: true,
            completefunc: null
        }, options);


        return this.each(function () {

            if ($(this).hasClass(gStratusFormsEncryptClass)) {
                gStratusFormsEncrptForm = true;
            }



            var listID = opt.listID;

            if (listID == 0) {
                listID = getParameterByName(opt.queryStringVar);
            }
            //store in global var for save
            gStratusFormsFormID = listID;
			
            if (listID != undefined) {
                LoadFormFields(this, listID, opt.listName, opt.completefunc, opt.StratusFormsDataField);
            } else {
	            
	            $("div[data-StratusFormsType='PeoplePicker']").each(function () {
	                $(this).StratusFormsPeoplePicker();
	            });
            
            
	            $("select").each(function()
	            {
	            	if ($(this).attr("data-StratusFormsLookup") != undefined )
	        		{
	        			 eval("var lookupInfo=" + $(this).attr("data-StratusFormsLookup"));
	        			 $(this).StratusFormsLoadDDL ({
									listName: lookupInfo.listName,	
									firstOptionText: lookupInfo.firstOption,
									fieldName: lookupInfo.fieldName
						});
	        		}
	
	            });
            }

            if (opt.addRequiredFields)
                AddRequiredFields(this);

        });

    };


    function getParameterByName(key) {
        key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
        var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
        return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    }
    //utility function to load a drop down list with values from a SharePOint List
    $.fn.StratusFormsLoadDDL = function (options) {

        var opt = $.extend({}, {
            webURL: "",
            query: "",
            listName: "",
            firstOptionText: "Please Select",
            fieldName: "Title",
            orderByField: "Title",
            selValue: "",
            completefunc: null
        }, options);
        var $this = this;

        return this.each(function () {

            var curValue = $($this).find("option:selected").text();

            $($this).empty();
            $().StratusFormsLoadDropDownList(this, curValue, opt.webURL, opt.query, opt.listName, opt.firstOptionText,
                opt.fieldName, opt.orderByField, opt.completefunc,opt.selValue);

        });

    };

    //utility function to load a drop down list based upon a selected value of another list
    $.fn.StratusFormsLoadChildDDL = function (options) {

        var opt = $.extend({}, {
            webURL: "",
            query: "",
            parentID: "",
            parentField: "",
            listName: "",
            firstOptionText: "Please Select",
            fieldName: "Title",
            orderByField: "Title",
            completefunc: null
        }, options);
        var $this = this;

        return this.each(function () {

            var curValue = $($this).find("option:selected").text();
            $($this).empty();

            $().StratusFormsLoadChildDropDownList(this, curValue, opt.webURL, opt.query, opt.parentID,
                opt.parentField, opt.listName, opt.firstOptionText,
                opt.fieldName, opt.orderByField, opt.completefunc);

        });

    }




    //Validates form and saves if there are no errors
    $.fn.StratusFormsSubmit = function (options) {
        var opt = $.extend({}, {
            listName: "",
            StratusFormsDataField: "StratusFormsData",
            validateForm: true,
            completefunc: null,
            errorOffsetTop: 20,
            errorOffsetLeft: 25
        }, options);
        var $this = this;

        if (gStratusFormsEncrptForm && gStratusFormsDecryptFailed) {
            alert("Cannot save form that was not properly decrypted. Please refresh the form and enter the correct decryption key.");
            return;
        }
        return this.each(function () {

            if (opt.validateForm) {
                if (($this).StratusFormsValidate({
                    errorOffsetTop: opt.errorOffsetTop,
                    errorOffsetLeft: opt.errorOffsetLeft
                })) {
                    saveForm($this, opt.listName, opt.completefunc, opt.StratusFormsDataField);
                }
                else {
                    alert("Please fix form errors and re-submit!");
                }
            } else {
                saveForm($this, opt.listName, opt.completefunc, opt.StratusFormsDataField);
            }

        });
    };

    $.fn.StratusFormsValidate = function (options) {
        var opt = $.extend({}, {
            errorOffsetTop: 20,
            errorOffsetLeft: 25
        }, options);

        validForm = true;
        $("div.error").remove();
        $("div.required[data-StratusFormsType='PeoplePicker']").each(function () {
        	var people = $().StratusFormsGetPeopleFromPeoplePicker(this);
        	if(people.length == 0)
        	{
                    var position = $(this).position();
                    $(this).after("<div class='error'>REQUIRED FIELD</div>");

                    var myDiv = $(this).next("div");

                    $(myDiv).css("position", "absolute");
                    $(myDiv).css("left", position.left);
                    $(myDiv).css("top", position.top - opt.errorOffsetTop);
        	
        	}
        });
        $(this).find("input").filter(':visible').each(function () {
            value = $.trim($(this).val());
            type = $(this).attr("validate");
            if ($(this).hasClass("required") || $(this).hasClass("requiredNoAsterix")) {
                if ($(this).attr("type") == "radio" && ($('input[name="' + $(this).attr("name") + '"]:checked').val() == undefined)) {
                    //$(this).closest("td").append("<span class='error'><br>THIS FIELD IS REQUIRED.</span>");
                    //			    		$(this).before("<span class='error' style='float:bottom'><br>THIS FIELD IS REQUIRED.</span>");
                    var position = $(this).position();
                    $(this).after("<div class='error'>REQUIRED FIELD</div>");

                    var myDiv = $(this).next("div");

                    $(myDiv).css("position", "absolute");
                    $(myDiv).css("left", position.left);
                    $(myDiv).css("top", position.top - opt.errorOffsetTop);
                }
                else if ((value.length == 0)) {
                    var position = $(this).position();
                    $(this).after("<div class='error'>REQUIRED FIELD</div>");

                    var myDiv = $(this).next("div");

                    $(myDiv).css("position", "absolute");
                    $(myDiv).css("left", position.left + opt.errorOffsetLeft);
                    $(myDiv).css("top", position.top - opt.errorOffsetTop);

                }
            }
            if (type != undefined && value != undefined && value.length > 0) {
                eval(type + "('" + value + "',this," + opt.errorOffsetLeft + "," + opt.errorOffsetTop + ")");
            }
        });
        $(this).find("select").filter(':visible').each(function () {
            value = $.trim($(this).val());
            type = $(this).attr("validate");
            if ($(this).hasClass("required")) {
                if ((value.length == 0) || value == "0") {
                    //$(this).closest("td").append("<span class='error'><br>THIS FIELD IS REQUIRED.</span>");
                    //			    		$(this).after("<span class='error' style='float:bottom'><br>THIS FIELD IS REQUIRED.</span>");
                    var position = $(this).position();
                    $(this).after("<div class='error'>REQUIRED FIELD</div>");

                    var myDiv = $(this).next("div");

                    $(myDiv).css("position", "absolute");
                    $(myDiv).css("left", position.left + opt.errorOffsetLeft);
                    $(myDiv).css("top", position.top - opt.errorOffsetTop);

                }
            }
            if (type != undefined && value != undefined && value.length > 0) {
                eval(type + "('" + value + "',this," + opt.errorOffsetLeft + "," + opt.errorOffsetTop + ")");
            }
        });
        $(this).find("textarea").filter(':visible').each(function () {
            value = $.trim($(this).val());
            type = $(this).attr("validate");
            if ($(this).hasClass("required")) {
                if ((value.length == 0) || value == "0") {
                    //$(this).closest("td").append("<span class='error'><br>THIS FIELD IS REQUIRED.</span>");
                    //$(this).after("<span class='error' style='float:bottom'>THIS FIELD IS REQUIRED.</span>");
                    var position = $(this).position();
                    $(this).after("<div class='error'>REQUIRED FIELD</div>");

                    var myDiv = $(this).next("div");

                    $(myDiv).css("position", "absolute");
                    $(myDiv).css("left", position.left + opt.errorOffsetLeft);
                    $(myDiv).css("top", position.top - opt.errorOffsetTop);

                }
            }
            if (type != undefined && value != undefined && value.length > 0) {
                eval(type + "('" + value + "',this," + opt.errorOffsetLeft + "," + opt.errorOffsetTop + ")");
            }
        });

        if ($("div.error").first().html() != null) {
            validForm = false;
        }
        return validForm;
    };

    $.fn.StratusFormsRepeat = function (containerID) {
        var repeatNum = 1;
        $("[id^='" + containerID + "StratusForms']").each(function () {
            repeatNum++;
        });
        var idPostfix = "StratusForms" + (repeatNum - 1);
        if (repeatNum == 1) {
            idPostfix = "";
            var firstRemove = "<a class='FSRemoveRow' href=\"JavaScript:$().StratusFormsRepeatHideRow('" +
				containerID + idPostfix + "')\"> - </a>";
            $("#" + containerID + idPostfix).append(firstRemove)
        }

        $("#" + containerID + idPostfix).after($("#" + containerID).clone().attr("id", containerID + "StratusForms" +
			repeatNum).attr("data-StratusFormsParent", containerID));

        $("#" + containerID + "StratusForms" + repeatNum + " .FSRemoveRow").hide();
        $("#" + containerID + "StratusForms" + repeatNum).append("<a href=\"JavaScript:$().StratusFormsRepeatHideRow('" +
        containerID + "StratusForms" + repeatNum + "')\"> - </a>");
        $("#" + containerID + "StratusForms" + repeatNum).show();

        $("#" + containerID + "StratusForms" + repeatNum).find(':input').each(function () {
            switch (this.type) {
                case 'password':
                case 'text':
                case 'textarea':
                case 'file':
                case 'select-one':
                case 'select-multiple':
                    jQuery(this).val('');
                    break;
                case 'checkbox':
                case 'radio':
                    this.checked = false;
                    break;
           }

        }).removeClass("SFDontSave");
        
        $("#" + containerID + "StratusForms" + repeatNum).find('div').each(function () {
            
			if ($(this).attr("data-StratusFormsType") != undefined && $(this).attr("data-StratusFormsType") == "PeoplePicker") {
	        	$(this).empty();
				$(this).attr("id",$(this).attr("id") + repeatNum);
				$(this).StratusFormsPeoplePicker();
	       	}

        }).removeClass("SFDontSave");
    }

    $.fn.StratusFormsRepeatHideRow = function (containerID) {
        $("#" + containerID).addClass("SFDontSave").hide();
    }


    $.fn.StratusFormsReporting = function (options) {
        var opt = $.extend({}, {
            listName: "",
            StratusFormsDataField: "StratusFormsData",
            query: "<Query><Where><Neq><FieldRef Name='ID' /><Value Type='Number'>0</Value></Neq></Where></Query>"
        }, options);


        $().StratusFormsFormReporting(this, opt.listName, opt.StratusFormsDataField, opt.query, opt.columnDisplay, opt.sourceData);

    };


    //put a red asterisk in front of all required fields
    function AddRequiredFields(form) {
        $(form).find(".required").each(function () {
            $("<font color='red'>*</font>").insertBefore(this);
        });

    }

    function Encrypt(formString) {
        if (gStratusFormsSecret == undefined) {
            gStratusFormsSecret = window.prompt("This Form contains encrypted fields. Please enter encryption key.", "< encryption key >");
        }
        formString += gStratusFormsDecryptedStringTest + "VERIFIED";
        formString = gStratusFormsEncryptedString + $().StratusFormsEncrypt(formString, gStratusFormsSecret);
        return formString
    }

    function EncryptForm(formString) {
        if (gStratusFormsEncrptForm) {
            if (gStratusFormsSecret == undefined) {
                gStratusFormsSecret = window.prompt("This Form will be encrypted. Please enter encryption key.", "< encryption key >");
            }
            formString += gStratusFormsDecryptedStringTest + "VERIFIED";
            formString = gStratusFormsEncryptedString + $().StratusFormsEncrypt(formString, gStratusFormsSecret);
        }
        return formString
    }


    function Decrypt(formString, element) {
        var originalFormString = formString;
        if (formString.indexOf(gStratusFormsEncryptedString) == 0) {
            formString = formString.split(gStratusFormsEncryptedString)[1];
            if (gStratusFormsSecret == undefined) {
                gStratusFormsSecret = window.prompt("This Form contains encrypted data. Please enter encryption key.", "< encryption key >");
            }
            var values = "";
            try {
                decryptedString = $().StratusFormsDecrypt(formString, gStratusFormsSecret);
                values = decryptedString.split(gStratusFormsDecryptedStringTest);
            } catch (exception) {
                alert("Decryption failed. Please reload the page and try again!");
                gStratusFormsDecryptFailed = true;
                return originalFormString;
            }
            if (values.length < 2) {
                alert("Decryption failed. Please reload the page and try again!");
                gStratusFormsDecryptFailed = true;
                if (element != undefined) {
                    $(element).prop("readonly", true);
                }
                formString = originalFormString;
            } else {
                formString = values[0];
            }
        }
        return formString
    }

    $.fn.StratusFormsDecrypt = function (formString, key) {
        return formString
    }


    $.fn.StratusFormsEncrypt = function (formString, key) {
        return formString
    }

    //loads an existing form and populates the forms fields
    function LoadFormFields(form, id, listName, completefunc, StratusFormsDataField) {

        var promise = $().StratusFormsLoadFormFields(form, id, listName, StratusFormsDataField);

        promise.done(function (value, createdBy, created) {
            value = Decrypt(value);
            if (!gStratusFormsDecryptFailed) {
                var regex = new RegExp("\r", "g");
                value = value.replace(regex, "'");
                regex = new RegExp("\n", "g");
                value = value.replace(regex, "'");
                value = value.replace(/\\/g, "\\\\");

                eval("var formData=" + value);

                $("#CreatedBy").html(createdBy);
                $("#CreatedDate").html(created);

                PopulateFormData(form, formData);

            }

            if (completefunc !== null) {
                completefunc();
            }

        });
    }

    //iterates over the html form elements and populates with 
    //data read from the SharePoint List
    function PopulateFormData(form, formData) {
        for (var field in formData) {
            var element = $(form).find("#" + field);

            if (field === "StratusFormsRepeatable") {
                var repeatableArray = formData[field];
                for (var index in repeatableArray) {
                    if (repeatableArray[index].StratusFormsParent != "undefined") {
                        $().StratusFormsRepeat(repeatableArray[index].StratusFormsParent);
                    }
                    var thisRepeatableForm = $(form).find("#" + repeatableArray[index].ID);
                    PopulateFormData(thisRepeatableForm, repeatableArray[index]);
                }
            }

            else if ($(element).is("select")) {
            	$(element).val(formData[field]);
            	if ($(element).val() != formData[field])
            	{
        		if ($(element).attr("data-StratusFormsLookup") != undefined )
        		{
        			 eval("var lookupInfo=" + $(element).attr("data-StratusFormsLookup"));
        			 var thisLookup = $(element);
        			 var selectValue = formData[field];
        			 $(element).StratusFormsLoadDDL ({
									listName: lookupInfo.listName,	
									firstOptionText: lookupInfo.firstOption,
									fieldName: lookupInfo.fieldName,
									selValue: selectValue,
								    completefunc: function(elem,selValue) { 
										$(elem).find("option").each(function(){									
											if(($(this).text()) === selValue)
											{
												$(elem).val($(this).val());
												return;
											}
										});
									}

						});
	        		}
	                
	            }
	            else {
	            	$(element).append("<option selected='selected'>" + formData[field] + "</option>");
	            }
            }
            else if ($(element).is("div") || $(element).is("span")) {
                if ($(element).attr("data-StratusFormsType") != undefined && $(element).attr("data-StratusFormsType") == "PeoplePicker") {
	                $(element).StratusFormsPeoplePicker();
                    
                    //set value in Person or Group Field
                    if (formData[field].length > 0) {
                        var people = htmlDecode(formData[field]).split(";#");
                        $(element).StratusFormsPeoplePicker({ people: people });
                    }

                } else {
                    $(element).html(htmlDecode(formData[field]));
                }
            }
            else {
                if ($(element).attr("type") == "radio" || $(element).attr("type") == "checkbox") {
                    $(element).attr("checked", "checked");
                }
                else {
                    $(element).val(htmlDecode(formData[field], element));
                }
            }
        }
    }

    //in case your code needs to remove the required fields,
    //this removes the asterisk and the "required" class making
    //all fields NOT required
    function RemoveRequiredFields() {
        $('#' + FormDivID).find(".required").each(function () {
            text = $(this).html().replace("*", "")
            $(this).removeClass("required");
            $(this).html(text);
        });
    }

    function CDataWrap(value) {
        //return "<![CDATA[" + value + "]]>";
        return value;
    }

    function buildStratusFormsDataObject(formElement,StratusFormsValuePairs) {

        var formDataString = "";

        $(formElement).find("input").not(".SFDontSave").each(function () {
            var id = this.id;
            if (id.indexOf("TopSpan_HiddenInput") < 0) {
                var value = $(this).val();
                var encryptField = $(this).hasClass(gStratusFormsEncryptClass);
                var encodedValue = htmlEncode(value, encryptField);
                var type = $(this).attr("type");
                if (type == undefined) {
                    type = "text";
                }
                if (value != undefined && value.length > 0 && type.toUpperCase() != "BUTTON") {
                    formVal = formVal = $(this).attr("listFieldName");
                    if ((type.toUpperCase() != "RADIO" && type.toUpperCase() != "CHECKBOX")) {
                        formDataString += "" + id + ":\"" + encodedValue + "\",";
                    } else {
                        if ($(this).is(':checked')) {
                        	if ( type.toUpperCase() == "CHECKBOX")
                        	{
                        		value = "1";
                        	}
                            formDataString += "" + id + ":\"" + value + "\",";
                        } else {
                            if (type.toUpperCase() == "CHECKBOX") {
                                //if checkbox is not checked we need to clear the associated
                                //SharePoint list field if one is mapped
                                value = "0";
                            } else {
                                formVal = undefined;
                            }
                        }
                    }

                    if (formVal != undefined) {
                        if ($(this).attr("isDate") == "yes") {
                            var thisDate = new Date(value);
                            value = thisDate.toISOString();
                        }
                        if ((encryptField && !gStratusFormsDecryptFailed) || !encryptField) {
                            StratusFormsValuePairs.push([$(this).attr("listFieldName"), value]);
                        }
                    }
                }
            }
        });
        $(formElement).find("select").each(function () {
            id = this.id;
            value = $(this).find("option:selected").text();
            formDataString += "" + id + ":\"" + value + "\",";

            formVal = $(this).attr("listFieldName");
            if (formVal != undefined) {
                StratusFormsValuePairs.push([$(this).attr("listFieldName"), value]);
            }
        });
        $(formElement).find("textarea").each(function () {
            id = this.id;
            value = $(this).val();
            var encryptField = $(this).hasClass(gStratusFormsEncryptClass);
            encodedValue = htmlEncode(value, encryptField);

            if (value.length > 0) {
                formDataString += "" + id + ":\"" + encodedValue + "\",";
                if ($(this).attr("listFieldName") != undefined && ((encryptField && !gStratusFormsDecryptFailed) || !encryptField)) {
                    StratusFormsValuePairs.push([$(this).attr("listFieldName"), CDataWrap(value)]);
                }
            }

        });
        //get the People Picker instance
        $(formElement).find("div[data-StratusFormsType='PeoplePicker']").each(function () {

            var people = $().StratusFormsGetPeopleFromPeoplePicker(this);

            var emails = "";
            var seperator = "";
            var listFieldValue = "";

            for (index in people) {
                emails += seperator + people[index].Description + ";#" + people[index].DisplayText;
                listFieldValue += seperator + "-1;#" + people[index].Description;
                seperator = ";#";
            }
            if ($(this).attr("listFieldName") != undefined) {
                StratusFormsValuePairs.push([$(this).attr("listFieldName"), listFieldValue]);
            }
            formDataString += "" + this.id + ":\"" + emails + "\",";
        });


        $(formElement).find("span[listFieldName],label[listFieldName]").each(function () {
            //if ($(this).attr("data-StratusFormsType") == undefined) {
                if ($.trim($(this).html()).length > 0) {
                    var regex = new RegExp("\"", "g");
                    value = ($(this).html()).replace(regex, "'");

                    formDataString += "" + this.id + ":\"" + value + "\",";
                    //alert($(this).attr("listFieldName")+ "---" +CDataWrap($(this).html()));
                    if ($(this).attr("listFieldName") != undefined) {
                        StratusFormsValuePairs.push([$(this).attr("listFieldName"), CDataWrap($(this).html())]);
                    }
                }
            //}
        });

        return formDataString;
    }

    function htmlEncode(str, encode) {
        if (encode && gStratusFormsDecryptFailed) {
            return str;
        }
        if (encode) {
            str = Encrypt(str);
        }
        str = String(str)
    //            .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;');
        //            .replace(/'/g, '&#39;')
        //            .replace(/</g, '&lt;')
        //            .replace(/>/g, '&gt;');

        return str;
    }

    function htmlDecode(str, element) {
        str = String(str)
    //            .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"');
        //            .replace(/&#39;/g, '''')
        //            .replace(/</g, '&lt;')
        //            .replace(/>/g, '&gt;');
        str = Decrypt(str, element);
        return str;
    }

    //create / updates the list entry 
    function saveForm(formElement, listName, saveCompleteFunc, StratusFormsDataField, formID) {

        var clonedForm = $(formElement).clone();

        var formDataString = "{";

        var StratusFormsValuePairs = new Array();

        var curRow = 0;
        var oldRowID = "";
        formDataString += "StratusFormsRepeatable: [";
        $(clonedForm).find("[data-StratusFormsRepeatable]").each(function () {
            if ($(this).hasClass("SFDontSave")) {
            }
            else {
                //renumber in case rows were deleted
                var rowID = $(this).attr("id").split("StratusForms")[0];
                var parent = $(this).attr("data-StratusFormsParent");
                if (rowID != oldRowID) {
                    curRow = 0;
                    oldRowID = rowID;
                    parent = undefined;
                }
                if (curRow != 0) {
                    rowID = rowID + "StratusForms" + curRow;
                }
                curRow++;
                
                
                                
                
                var stratusFormsChildValuePairs = new Array();
                
                var repeatableString = "{ID: '" + rowID + "',";
                repeatableString += "StratusFormsParent: '" + parent + "',";
                repeatableString += buildStratusFormsDataObject(this,stratusFormsChildValuePairs );
                repeatableString += "},";
                formDataString += repeatableString;
                
                var childList = $(this).attr("data-StratusFormsChildList");
                if ( childList != null && childList != undefined)
                {
                	var childArray = childList.split(";#");
                	var childID = 0;
                	if (childArray[1] != null && childArray[1] != undefined)
                	{	childID = childArray[1];
                	}
                	stratusFormsChildValuePairs.push(["StratusFormsRowID", rowID]);
                	
		            var childObject = { list: childArray[0],
		            					rowID: rowID, 
		            					valuePairs: stratusFormsChildValuePairs
		            				};
		            				
		            gStratusFormsChildListData.push(childObject);
                }
                

            }
            $(this).remove();
        });
        formDataString += "],";
        
        formDataString += buildStratusFormsDataObject(clonedForm,StratusFormsValuePairs);

        //	formDataString = formDataString.replace(/,\s*$/, "");

        formDataString = formDataString.replace(/,(?=[^,]*$)/, '');

        formDataString += "};";
        
                //alert(formDataString);


        formDataString = EncryptForm(formDataString);

        StratusFormsValuePairs.push([StratusFormsDataField, CDataWrap(formDataString)]);

		if (formID == null)
		{
			formID = gStratusFormsFormID;
		}
        $().StratusFormsSaveForm(listName, formID, StratusFormsValuePairs, saveCompleteFunc,gStratusFormsChildListData);
    }


})(jQuery);

	function validDate(value, element, offsetLeft, offsetTop) {
	    if (!(!/Invalid|NaN/.test(new Date(value)))) {
		        var position = $(element).position();
		        $(element).after("<div class='error'>ENTER A VALID DATE.</div>");
		
		        var myDiv = $(element).next("div");
		
		        $(myDiv).css("position", "absolute");
		        $(myDiv).css("left", position.left + offsetLeft);
		        $(myDiv).css("top", position.top - offsetTop);
	
	    } else {
	        var thisDate = new Date(value);
	        $(element).val(thisDate.getMonth() * 1 + 1 + "/" + thisDate.getDate() + "/" + thisDate.getFullYear());
	    }
    }
	
	function validPercentage(value, element, offsetLeft, offsetTop) {
		value = value.replace("%","");
		if (!(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {

	        var position = $(element).position();
	        $(element).after("<div class='error'>ENTER A VALID NUMBER.</div>");
	
	        var myDiv = $(element).next("div");
	
	        $(myDiv).css("position", "absolute");
	        $(myDiv).css("left", position.left + offsetLeft);
	        $(myDiv).css("top", position.top - offsetTop);

    	} else {
	        $(element).val(value + "%");
    	}
    }

	function validCurrency(value, element, offsetLeft, offsetTop) {
		value = value.replace("$","");
		if (!(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {
		
	        var position = $(element).position();
	        $(element).after("<div class='error'>ENTER A VALID NUMBER.</div>");
	
	        var myDiv = $(element).next("div");
	
	        $(myDiv).css("position", "absolute");
	        $(myDiv).css("left", position.left + offsetLeft);
	        $(myDiv).css("top", position.top - offsetTop);
		
    	} else {
	        $(element).val("$" + (value*1).toFixed(2));
    	}
    }
	

// checks for a valid email address
function validEmail(value, element, offsetLeft, offsetTop) {
    if (!(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value))) {
        //		$(element).closest("td").append("<span class='error'><br>Enter a valid email address.</span>");
        var position = $(element).position();
        $(element).after("<div class='error'>ENTER A VALID EMAIL ADDRESS.</div>");

        var myDiv = $(element).next("div");

        $(myDiv).css("position", "absolute");
        $(myDiv).css("left", position.left + offsetLeft);
        $(myDiv).css("top", position.top - offsetTop);

    }
}

//check for a valid number
function validNumber(value, element, offsetLeft, offsetTop) {
    if (!(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {

        var position = $(element).position();
        $(element).after("<div class='error'>ENTER A VALID NUMBER.</div>");

        var myDiv = $(element).next("div");

        $(myDiv).css("position", "absolute");
        $(myDiv).css("left", position.left + offsetLeft);
        $(myDiv).css("top", position.top - offsetTop);

    }
}

//check for a valid SSN
function validSSN(value, element, offsetLeft, offsetTop) {
    var regex = new RegExp("-", "g");
    value = value.replace(regex, "");
    var error = false;

    if (value.length != 9 || !(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {
        error = true;
        //$(element).closest("td").append("<span class='error'><br>Enter a valid Social Security Number (###-##-####)</span>");
    }
    else if (!(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {
        //		$(element).closest("td").append("<span class='error'><br>Enter a valid Social Security Number (###-##-####)</span>");
        error = true;
    }
    if (error) {
        var position = $(element).position();
        $(element).after("<div class='error'>ENTER A VALID SSN (##-###-####).</div>");

        var myDiv = $(element).next("div");

        $(myDiv).css("position", "absolute");
        $(myDiv).css("left", position.left + offsetLeft);
        $(myDiv).css("top", position.top - offsetTop);

    }
}

//checks for a valid Phone Number
function validPhone(value, element, offsetLeft, offsetTop) {
    var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    if (!phoneNumberPattern.test(value)) {
        var position = $(element).position();
        $(element).after("<div class='error'>ENTER A VALID PHONE NUMBER.</div>");

        var myDiv = $(element).next("div");

        $(myDiv).css("position", "absolute");
        $(myDiv).css("left", position.left + offsetLeft);
        $(myDiv).css("top", position.top - offsetTop);

        //$(element).closest("td").append("<span class='error'><br>Enter a valid phone number.</span>");
    }
}



//formats a phone number for the given element
function formatPhone(element) {
    if (element.value.length == 3) {
        element.value += "-";
    } else if (element.value.length == 7) {
        element.value += "-";
    }

}

//formats the text as an SSN for the given element
function formatSSN(element) {
    if (element.value.length == 3) {
        element.value += "-";
    } else if (element.value.length == 6) {
        element.value += "-";
    }

}



// Textarea and select clone() bug workaround | Spencer Tipping
// Licensed under the terms of the MIT source code license

// Motivation.
// jQuery's clone() method works in most cases, but it fails to copy the value of textareas and select elements. This patch replaces jQuery's clone() method with a wrapper that fills in the
// values after the fact.

// An interesting error case submitted by Piotr Przybyl: If two <select> options had the same value, the clone() method would select the wrong one in the cloned box. The fix, suggested by Piotr
// and implemented here, is to use the selectedIndex property on the <select> box itself rather than relying on jQuery's value-based val().

(function (original) {
    jQuery.fn.clone = function () {
        var result = original.apply(this, arguments),
            my_textareas = this.find('textarea').add(this.filter('textarea')),
            result_textareas = result.find('textarea').add(result.filter('textarea')),
            my_selects = this.find('select').add(this.filter('select')),
            result_selects = result.find('select').add(result.filter('select'));

        for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
        for (var i = 0, l = my_selects.length; i < l; ++i) {
            for (var j = 0, m = my_selects[i].options.length; j < m; ++j) {
                if (my_selects[i].options[j].selected === true) {
                    result_selects[i].options[j].selected = true;
                }
            }
        }
        return result;
    };
})(jQuery.fn.clone);