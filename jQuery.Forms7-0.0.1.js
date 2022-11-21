/*
/*
 * Forms7 - Store HTML forms in SharePoint lists using jQuery & SPServices
 * Version 0.0.1 BETA!!  Lots of things to get cleaned up but it's functional
 * @requires jQuery v1.4.2 or greater - jQuery 1.7+ recommended
 * @requires SPServices http://spservices.codeplex.com
 *
 * Copyright (c) 2013-2014 Mark Rackley
 * Examples and coming soon.
  * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @description Store HTML forms in SharePoint lists using jQuery & SPServices
 * @type jQuery
 * @name Forms7
 * @category Plugins/Forms7
 * @author Mark Rackley / http://www.markrackley.net / mrackley@gmail.com
 */

(function($) {

	var gForms7FormID = "0";
	var gForms7EncryptClass = "F7Encrypt"
	var gForms7EncryptedString = "F7Encrypted";
	var gForms7DecryptedStringTest = "F7Decrypted";
	var gForms7EncrptForm = false; 
	var gForms7Secret = undefined;
	var gForms7DecryptFailed = false; 

	$.fn.Forms7Initialize = function(options) {
	
			var opt = $.extend({}, {
				listID: "0",				
				queryStringVar: "ID",
				forms7DataField: "Forms7Data",
				listName: "",	
				addRequiredFields: true,	
				completefunc: null
			}, options);
			
					
			return this.each(function() {
			
				if ($(this).hasClass(gForms7EncryptClass))
				{
					gForms7EncrptForm = true;
				}
			
				$("div[data-Forms7Type='PeoplePicker']").each(function()
				{
					$(this).Forms7PeoplePicker();	
				});

			
			    listID = opt.listID;
			    
				if (listID == 0)
				{
					var queryStringVals = $().SPServices.SPGetQueryString();
					listID = queryStringVals[opt.queryStringVar];
				}
				//store in global var for save
				gForms7FormID = listID;
				
				if (listID != undefined)
				{
				  LoadFormFields(this,listID,opt.listName,opt.completefunc,opt.forms7DataField);
				 }
				
				if (opt.addRequiredFields)
					AddRequiredFields(this);
	
			});
		
	};

		

		//utility function to load a drop down list with values from a SharePOint List
		$.fn.Forms7LoadDDL = function(options) {
		
			var opt = $.extend({}, {
			    webURL: "",
				query:"",
				listName: "",				
				firstOptionText: "Please Select",
				fieldName: "Title",
				orderByField	: "Title",			
				completefunc: null
			}, options);
			var $this = this;
		
			return this.each(function() {
			
				var curValue = $($this).find("option:selected").text();
				
			    $($this).empty();
			
				var query = opt.query;
				if (query == "")
				{
					query = "<Query><Where><Neq><FieldRef Name='ID'/><Value Type='Integer'>0</Value></Neq></Where><OrderBy><FieldRef Name='"+opt.orderByField+"'/></OrderBy></Query>";
				}
			    
			    //The Web Service method we are calling, to read list items we use 'GetListItems'
			    var method = "GetListItems";
			    var fieldsToRead =     "<ViewFields><FieldRef Name='"+opt.fieldName+"' /></ViewFields>";
			                        
			    //Here is our SPServices Call where we pass in the variables that we set above
			    $().SPServices({
			            operation: method,
			            async: true,  //if you set this to true, you may get faster performance, but your order may not be accurate.
			            listName: opt.listName,
			            webURL: opt.webURL,
			            CAMLViewFields: fieldsToRead,
			              CAMLQuery: query,
			                  //this basically means "do the following code when the call is complete"
			                completefunc: function (xData, Status) { 
			                	var options = "<option value='0'> "+opt.firstOptionText+" </option>";
			                    //this code iterates through every row of data returned from the web service call
			                    $(xData.responseXML).SPFilterNode("z:row").each(function() { 
			                        var id  = $(this).attr("ows_ID");
			                    	var value  = ($(this).attr("ows_"+opt.fieldName));
			                    	if (value.split(";#")[1] != undefined)
			                    	{
			                    		value = value.split(";#")[1];
			                    	}
			                    	if ($.trim(value) == $.trim(curValue))
			                    	{
				                    	options += "<option selected='selected' value='"+id+"' >"+ value  +"</option>";
			                    	}
			                    	else
			                    	{
			  	                		options += "<option value='"+id+"'>"+ value  +"</option>";
			  	                	}
			                    });
			                	$($this).append(options); 
								if(opt.completefunc !== null) {
									opt.completefunc(this);
								}

			                }
			    });
		    
		    });
		     
		};

//utility function to load a drop down list based upon a selected value of another list
	$.fn.Forms7LoadChildDDL = function(options) {
		
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

			return this.each(function() {

	var curValue = $($this).find("option:selected").text();
    $($this).empty();

	var query = opt.query;
	if (query == "")
	{
		query = "<Query>" +
	                "<Where>" +
	                    "<Eq>" +
	                        "<FieldRef Name='" + opt.parentField  + "' LookupId='TRUE'/><Value Type='Lookup'>" + opt.parentID+ "</Value>" + 
	                    "</Eq>" +
	                "</Where>" +
	                "<OrderBy>" + 
                            "<FieldRef Name='"+opt.orderByField +"' />" +
	                "</OrderBy>" +
	            "</Query>";
    }

    //The Web Service method we are calling, to read list items we use 'GetListItems'
    var method = "GetListItems";
    var fieldsToRead =     "<ViewFields>" +
                            "<FieldRef Name='"+opt.fieldName +"' />" +
                        "</ViewFields>";
                                                
    //Here is our SPServices Call where we pass in the variables that we set above
    $().SPServices({
            operation: method,
            async: false,  //if you set this to true, you may get faster performance, but your order may not be accurate.
            listName: opt.listName,
            webURL: opt.webURL,
            CAMLViewFields: fieldsToRead,
              CAMLQuery: query,
                  //this basically means "do the following code when the call is complete"
                completefunc: function (xData, Status) { 
                	options = "<option value='0'> "+opt.firstOptionText+" </option>";
                    //this code iterates through every row of data returned from the web service call
					
                    $(xData.responseXML).SPFilterNode("z:row").each(function() { 

                        id  = $(this).attr("ows_ID");
                    	value  = ($(this).attr("ows_" + opt.fieldName ));
                    	if (value != undefined)
                    	{
	                    	if ($.trim(value) == $.trim(curValue))
	                    	{
		                    	options += "<option selected='selected' value='"+id+"' >"+ value +"</option>";
	                    	}
	                    	else
	                    	{
	  	                		options += "<option value='"+id+"'>"+ value +"</option>";
	  	                	}
  	                	}
                    });
                	$($this).append(options);
					if(opt.completefunc !== null) {
						opt.completefunc(this);
					}
          
                }
    });
    
    });
     
}

	$.fn.Forms7AddUserToPeoplePicker  = function(options) {
		var opt = $.extend({}, {
				allowMultipleValues: true,
				maximumEntitySuggestions: 15
			}, options);
			var $this = this;
		
		var $this = this;


		var spPP = SPClientPeoplePicker.SPClientPeoplePickerDict[$(this).attr("id") + "_TopSpan"];

		var people = spPP.GetAllUserInfo();
		var peopleArray = new Array();		
		
		for (index in people)
		{
			peopleArray.push(people[index].Description);
			peopleArray.push(people[index].DisplayText);
		}
		  
		peopleArray.push(opt.email);
		peopleArray.push(opt.name);
		$($this).Forms7PeoplePicker({people: peopleArray});

	};
	
	$.fn.Forms7AddCurrentUserToPeoplePicker  = function(options) {
		var $this = this;


		var spPP = SPClientPeoplePicker.SPClientPeoplePickerDict[$(this).attr("id") + "_TopSpan"];

		var people = spPP.GetAllUserInfo();
		var peopleArray = new Array();		
		
		for (index in people)
		{
			peopleArray.push(people[index].Description);
			peopleArray.push(people[index].DisplayText);
		}

	
		var userid = _spPageContextInfo.userId;
		
		var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
		
		var requestHeaders = { "accept" : "application/json;odata=verbose" };
		
		$.ajax({
		  url : requestUri,
		  contentType : "application/json;odata=verbose",
		  headers : requestHeaders,
		  success : onSuccess,
		  error : onError
		});
		
		function onSuccess(data, request){
		  var name = data.d.Title;
		  var email = data.d.Email;
		  
		 peopleArray.push(email);
		 peopleArray.push(name);
		$($this).Forms7PeoplePicker({people: peopleArray});

		}
		
		function onError(error) {
		  alert(error);
		}
		
	};
	
		
//Converts People Pickers
	$.fn.Forms7PeoplePicker = function(options) {
		var opt = $.extend({}, {
				allowMultipleValues: true,
				maximumEntitySuggestions: 15
			}, options);
			var $this = this;
			
			
			
		    // Create a schema to store picker properties, and set the properties.
		    var schema = {};
		    schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';  
		    schema['SearchPrincipalSource'] = 15;
		    schema['ResolvePrincipalSource'] = 15;
		    schema['AllowMultipleValues'] = opt.allowMultipleValues;
		    schema['MaximumEntitySuggestions'] = opt.maximumEntitySuggestions;
		    schema['Width'] = ($($this).width()*1 - 25) + "px";
		    
			var users = new Array();
			
			if (opt.people != undefined)
			{
			
				for (index = 0; index < opt.people.length; index+=2) { 
				    var email = opt.people[index];
				    var name = opt.people[index+1];
					var user= new Object();  
					user.AutoFillDisplayText = name;  
					user.AutoFillKey = email;  
					user.Description = email;  
					user.DisplayText = name;  
					user.EntityType = "User";  
					user.IsResolved = true;  
	//				user.Key = user.get_loginName();  
					user.Resolved = true;  
				    
				    users.push(user);
				}
		    }
		    // Render and initialize the picker. 
		    // Pass the ID of the DOM element that contains the picker, an array of initial
		    // PickerEntity objects to set the picker value, and a schema that defines
		    // picker properties.
		    SPClientPeoplePicker_InitStandaloneControlWrapper($(this).attr("ID"), users, schema);
	};
	


//Validates form and saves if there are no errors
	$.fn.Forms7Submit = function(options) {
		var opt = $.extend({}, {
				listName: "",			
				forms7DataField: "Forms7Data",
				validateForm: true,
				completefunc: null,	
				errorOffsetTop: 20,
				errorOffsetLeft: 25	
			}, options);
			var $this = this;

			if (gForms7EncrptForm && gForms7DecryptFailed)
			{
				alert("Cannot save form that was not properly decrypted. Please refresh the form and enter the correct decryption key.");
				return;
			}
			return this.each(function() {

			if (opt.validateForm)
			{
				if(($this).Forms7Validate({errorOffsetTop: opt.errorOffsetTop,
									      errorOffsetLeft: opt.errorOffsetLeft}))
				{
					saveForm($this,opt.listName,opt.completefunc,opt.forms7DataField);
				}
				else
				{
					alert("Please fix form errors and re-submit!");
				}
			} else {
				saveForm($this,opt.listName,opt.completefunc,opt.forms7DataField);
			}
		
		});
	};

	$.fn.Forms7Validate = function(options) {
		var opt = $.extend({}, {
				errorOffsetTop: 20,
				errorOffsetLeft: 25
			}, options);

	  	validForm = true;
	  	$("div.error").remove();
	    $(this).find("input").filter(':visible').each(function(){
		    	value = $.trim($(this).val());
		    	type = $(this).attr("validate");
		    	if ($(this).hasClass("required") || $(this).hasClass("requiredNoAsterix"))
		    	{
			    	if ($(this).attr("type") == "radio" && ($('input[name="'+$(this).attr("name")+'"]:checked').val() == undefined))
					{
			    		//$(this).closest("td").append("<span class='error'><br>THIS FIELD IS REQUIRED.</span>");
//			    		$(this).before("<span class='error' style='float:bottom'><br>THIS FIELD IS REQUIRED.</span>");
		    			var position = $(this).position();
		    			$(this).after("<div class='error'>REQUIRED FIELD</div>");
		    			
		    			var myDiv = $(this).next("div");
		    			
		    			$(myDiv).css("position","absolute");
						$(myDiv).css("left", position.left);
						$(myDiv).css("top", position.top - opt.errorOffsetTop);
					}
		    		else if((value.length == 0))
		    		{
		    			var position = $(this).position();
		    			$(this).after("<div class='error'>REQUIRED FIELD</div>");
		    			
		    			var myDiv = $(this).next("div");
		    			
		    			$(myDiv).css("position","absolute");
						$(myDiv).css("left", position.left + opt.errorOffsetLeft);
						$(myDiv).css("top", position.top - opt.errorOffsetTop);
		    			
			    	}
		    	}
		    	if (type != undefined && value != undefined && value.length > 0)
		    	{
		    		eval(type + "('" + value + "',this,"+opt.errorOffsetLeft+","+opt.errorOffsetTop+")");
		    	}
	    });
	    $(this).find("select").filter(':visible').each(function(){
		    	value = $.trim($(this).val());
		    	type = $(this).attr("validate");
		    	if ($(this).hasClass("required"))
		    	{
		    		if((value.length == 0) || value == "0")
		    		{
			    		//$(this).closest("td").append("<span class='error'><br>THIS FIELD IS REQUIRED.</span>");
//			    		$(this).after("<span class='error' style='float:bottom'><br>THIS FIELD IS REQUIRED.</span>");
			    		var position = $(this).position();
		    			$(this).after("<div class='error'>REQUIRED FIELD</div>");
		    			
		    			var myDiv = $(this).next("div");
		    			
		    			$(myDiv).css("position","absolute");
						$(myDiv).css("left", position.left + opt.errorOffsetLeft);
						$(myDiv).css("top", position.top - opt.errorOffsetTop);

			    	}
		    	}
		    	if (type != undefined && value != undefined && value.length > 0)
		    	{
		    		eval(type + "('" + value + "',this,"+opt.errorOffsetLeft+","+opt.errorOffsetTop+")");
		    	}
	    });
	     $(this).find("textarea").filter(':visible').each(function(){
		    	value = $.trim($(this).val());
		    	type = $(this).attr("validate");
		    	if ($(this).hasClass("required"))
		    	{
		    		if((value.length == 0) || value == "0")
		    		{
			    		//$(this).closest("td").append("<span class='error'><br>THIS FIELD IS REQUIRED.</span>");
			    		//$(this).after("<span class='error' style='float:bottom'>THIS FIELD IS REQUIRED.</span>");
			    		var position = $(this).position();
		    			$(this).after("<div class='error'>REQUIRED FIELD</div>");
		    			
		    			var myDiv = $(this).next("div");
		    			
		    			$(myDiv).css("position","absolute");
						$(myDiv).css("left", position.left + opt.errorOffsetLeft);
						$(myDiv).css("top", position.top - opt.errorOffsetTop);

			    	}
		    	}
		    	if (type != undefined && value != undefined && value.length > 0)
		    	{
		    		eval(type + "('" + value + "',this,"+opt.errorOffsetLeft+","+opt.errorOffsetTop+")");
		    	}
	    });
	
	    if ($("div.error").first().html() != null)
	    {
	    	validForm = false;
	    }
		return validForm ;
	  };
	
	$.fn.Forms7Repeat = function(containerID) {
		var repeatNum = 1;
		$("[id^='"+containerID+"Forms7']").each(function(){
			repeatNum++;
		});
		var idPostfix = "Forms7"+(repeatNum-1);
		if (repeatNum == 1)
		{
			idPostfix = ""; 
			var firstRemove = "<a class='FSRemoveRow' href=\"JavaScript:$().Forms7RepeatHideRow('"+
				containerID + idPostfix +"')\"> - </a>";
			$("#"+containerID + idPostfix).append(firstRemove)
		}
		
		$("#"+containerID + idPostfix).after($("#"+containerID).clone().attr("id",containerID + "Forms7" + 
			repeatNum).attr("data-Forms7Parent",containerID)); 
			
			$("#"+ containerID + "Forms7" + repeatNum + " .FSRemoveRow").hide();
			$("#"+ containerID + "Forms7" + repeatNum).append("<a href=\"JavaScript:$().Forms7RepeatHideRow('"+
			containerID + "Forms7" + repeatNum +"')\"> - </a>");
			$("#"+ containerID + "Forms7" + repeatNum).show();
			
		$("#"+containerID + "Forms7" + repeatNum).find(':input').each(function() {
		    switch(this.type) {
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
		    }
			
		  }).removeClass("F7DontSave");
	}

	$.fn.Forms7RepeatHideRow = function(containerID) {
		$("#" + containerID).addClass("F7DontSave").hide();
	}


	$.fn.Forms7Reporting = function(options) {
		var opt = $.extend({},{
				listName: "",		
				forms7DataField: "Forms7Data",
				query: "<Query><Where><Neq><FieldRef Name='ID' /><Value Type='Number'>0</Value></Neq></Where></Query>"
		}, options);
		
		var $this = this;

		//create table header row
		$(this).append("<thead>");
			for (index in opt.columnDisplay)
			{
				$(this).append("<th>"+opt.columnDisplay[index]+"</th>");
			}
		$(this).append("</thead>");
		
		//create aoColumns parameter for dataTables
		colArray = [];
			for (index in opt.sourceData)
			{
				obj = {"mData":   opt.sourceData[index] };
				colArray.push(obj);
			}
		
	
			$().SPServices({	
			operation: "GetListItems",		
			async: true,		
			listName: opt.listName,		
			CAMLViewFields: "<ViewFields><FieldRef Name='"+opt.forms7DataField+"' /></ViewFields>",		
			CAMLQuery: opt.query,		
			completefunc: function(xData, Status) {			
				var dataArray = new Array();

				$(xData.responseXML).SPFilterNode("z:row").each(function() { 								

					var data = $(this).attr("ows_Forms7Data");
					eval("var obj=" + data);
					dataArray.push(obj);
				}); 
				
				$($this).dataTable({
				        "bProcessing": true,
				        "aaData": dataArray,
				        "aoColumns": colArray
					  });

			}			
			
		}); 

	};

	
	//put a red asterisk in front of all required fields
	function AddRequiredFields(form)
	{
		$(form).find(".required").each(function(){
			$("<font color='red'>*</font>").insertBefore(this);
		});
	
	}
	
	function Encrypt(formString) {
		if(gForms7Secret == undefined)
		{
			gForms7Secret = window.prompt("This Form contains encrypted fields. Please enter encryption key.","< encryption key >");
		}
		formString += gForms7DecryptedStringTest + "VERIFIED";
		formString = gForms7EncryptedString + $().Forms7Encrypt(formString,gForms7Secret);
		return formString
	}

	function EncryptForm(formString) {
		if(gForms7EncrptForm)
		{
			if(gForms7Secret == undefined)
			{
				gForms7Secret = window.prompt("This Form will be encrypted. Please enter encryption key.","< encryption key >");
			}
			formString += gForms7DecryptedStringTest + "VERIFIED";
			formString = gForms7EncryptedString + $().Forms7Encrypt(formString,gForms7Secret);
		}
		return formString
	}
	
	
	function Decrypt(formString,element) {
		originalFormString = formString;
		if(formString.indexOf(gForms7EncryptedString) == 0)
		{
			formString = formString.split(gForms7EncryptedString)[1];
			if(gForms7Secret == undefined)
			{
				gForms7Secret = window.prompt("This Form contains encrypted data. Please enter encryption key.","< encryption key >");
			}
			var values = "";
			try {
				decryptedString = $().Forms7Decrypt(formString,gForms7Secret);
				values = decryptedString.split(gForms7DecryptedStringTest );
			} catch (exception)
			{
				alert("Decryption failed. Please reload the page and try again!");
				gForms7DecryptFailed = true;
				return originalFormString;
			}
			if (values.length <2)
			{
				alert("Decryption failed. Please reload the page and try again!");
				gForms7DecryptFailed = true;
				if (element != undefined)
				{
					$(element).prop("readonly", true);
				}
				formString = originalFormString;
			} else {
				formString = values[0];
			}
		}
		return formString
	}

	$.fn.Forms7Decrypt = function(formString,key) {
		return formString
	}

	
	$.fn.Forms7Encrypt = function(formString,key) {
		return formString
	}
	
	//loads an existing form and populates the forms fields
	function LoadFormFields(form, id,listName,completefunc,forms7DataField)
	{
		var retVal = {};
		
		var query = "<Query>" +
		                "<Where>" +
		                    "<Eq>" +
		                        "<FieldRef Name='ID'/><Value Type='Integer'>" + id + "</Value>" + 
		                    "</Eq>" +
		                "</Where>" +
		            "</Query>";
	   
	    //The Web Service method we are calling, to read list items we use 'GetListItems'
	    var method = "GetListItems";
	    var fieldsToRead =     "<ViewFields>" +
	                            "<FieldRef Name='"+forms7DataField+"' />" +
	                            "<FieldRef Name='Created' />" +
	                            "<FieldRef Name='Author' />" +
	                        "</ViewFields>";
	    
	    var returnValue = 0;
	                                                
	    //Here is our SPServices Call where we pass in the variables that we set above
	    $().SPServices({
	            operation: method,
	            async: false,  //if you set this to true, you may get faster performance, but your order may not be accurate.
	            listName: listName,
	            CAMLViewFields: fieldsToRead,
	              CAMLQuery: query,
	                  //this basically means "do the following code when the call is complete"
	                completefunc: function (xData, Status) { 
	                	
	                    $(xData.responseXML).SPFilterNode("z:row").each(function() { 
	
	                        id  = $(this).attr("ows_ID");
	                    	value  = ($(this).attr("ows_"+forms7DataField ));
							value = Decrypt(value);
							if (!gForms7DecryptFailed)
							{
								var regex = new RegExp("\r", "g");
								value = value.replace(regex,"'");
								regex = new RegExp("\n", "g");
								value = value.replace(regex,"'");
								//Thanks Gareth
								value = value.replace(/\\/g, "\\\\");
								
								eval("var formData=" + value);
								
								retVal.formData = formData;
								retVal.CreatedBy = ($(this).attr("ows_Author" ).split(";#")[1]);
								retVal.Created =  ($(this).attr("ows_Created" ));
								
	//							var formData = retVal.formData;
								
								$("#CreatedBy").html(retVal.CreatedBy );
								$("#CreatedDate").html(retVal.Created);
						
								PopulateFormData(form,formData);
	
							}

							if(completefunc !== null) {
								completefunc();
							}
	                    });
					
	                }
	    });
	    
	    return retVal;
	}
	
	//iterates over the html form elements and populates with 
	//data read from the SharePoint List
	function PopulateFormData(form,formData)
	{
		for(field in formData)
		{
			element = $(form).find("#" + field);
			
			if(field === "Forms7Repeatable")
			{
				repeatableArray = formData[field];
				for (index in repeatableArray)
				{
					if (repeatableArray[index].Forms7Parent != "undefined")
					{
						$().Forms7Repeat(repeatableArray[index].Forms7Parent);
					}
					var thisRepeatableForm = $(form).find("#" + repeatableArray[index].ID);
					PopulateFormData(thisRepeatableForm,repeatableArray[index]);
				}
			}
			
			else if ($(element).is("select"))
			{
				$(element).append("<option selected='selected'>"+formData[field]+"</option>");
			}
			else if ($(element).is("div") || $(element).is("span"))
			{
				if ($(element).attr("data-Forms7Type") != undefined && $(element).attr("data-Forms7Type") == "PeoplePicker")
				{
					//set value in Person or Group Field
					if( formData[field].length > 0)
					{
						var people = htmlDecode(formData[field]).split(";#");
						$(element).Forms7PeoplePicker({people: people});	
					}

				} else {
					$(element).html(htmlDecode(formData[field]));
				}
			}
			else 
			{
				if ($(element).attr("type") == "radio" || $(element).attr("type") == "checkbox"){
					$(element).attr("checked",true);
				} 
				else {
					$(element).val(htmlDecode(formData[field],element));
				}
			}
		}
	}

	//in case your code needs to remove the required fields,
	//this removes the asterisk and the "required" class making
	//all fields NOT required
	function RemoveRequiredFields()
	{
		$('#' + FormDivID ).find(".required").each(function(){
			text = $(this).html().replace("*","")
			$(this).removeClass("required");
	     	$(this).html(text);
	     });
	}


//utility function to read a single Form field from a list
function GetFieldValue(listName,id ,fieldName,getText)
{
	var query = "<Query>" +
	                "<Where>" +
	                    "<Eq>" +
	                        "<FieldRef Name='ID'/><Value Type='Integer'>" + id + "</Value>" + 
	                    "</Eq>" +
	                "</Where>" +
	            "</Query>";
   
    //The Web Service method we are calling, to read list items we use 'GetListItems'
    var method = "GetListItems";
    var list = listName;
    var fieldsToRead =     "<ViewFields>" +
                            "<FieldRef Name='"+fieldName +"' />" +
                        "</ViewFields>";
    
    var returnValue = 0;
                                                
    //Here is our SPServices Call where we pass in the variables that we set above
    $().SPServices({
            operation: method,
            async: false,  //if you set this to true, you may get faster performance, but your order may not be accurate.
            listName: list,
            CAMLViewFields: fieldsToRead,
              CAMLQuery: query,
                  //this basically means "do the following code when the call is complete"
                completefunc: function (xData, Status) { 
                    $(xData.responseXML).SPFilterNode("z:row").each(function() { 

                        id  = $(this).attr("ows_ID");
                    	value  = ($(this).attr("ows_" + fieldName ));
                    	if (value != undefined){
							if (getText == undefined || getText == false)
							{
								returnValue = value.split(";#")[0];
							}else{
								returnValue = value.split(";#")[1];
							}
	                    }
                    });
                }
    });
    return returnValue;


}

//utility function to read a lookup form field from a SharePoint List
function GetLookupFieldValue(listName,fieldName,fieldValue,returnField,getText)
{
	var query = "<Query>" +
	                "<Where>" +
	                    "<Eq>" +
	                        "<FieldRef Name='" + fieldName+ "' LookupId='TRUE'/><Value Type='Lookup'>" + fieldValue+ "</Value>" + 
	                    "</Eq>" +
	                "</Where>" +
	            "</Query>";
   
    //The Web Service method we are calling, to read list items we use 'GetListItems'
    var method = "GetListItems";
    var list = listName;
    var fieldsToRead =     "<ViewFields>" +
                            "<FieldRef Name='"+returnField+"' />" +
                        "</ViewFields>";
    
    var returnValue = 0;
                                                
    //Here is our SPServices Call where we pass in the variables that we set above
    $().SPServices({
            operation: method,
            async: false,  //if you set this to true, you may get faster performance, but your order may not be accurate.
            listName: list,
            CAMLViewFields: fieldsToRead,
              CAMLQuery: query,
                  //this basically means "do the following code when the call is complete"
                completefunc: function (xData, Status) { 
                    $(xData.responseXML).SPFilterNode("z:row").each(function() { 

                        id  = $(this).attr("ows_ID");
                    	value  = ($(this).attr("ows_" + returnField));
                    	if (value != undefined){
							if (getText == undefined || getText == false)
							{
								returnValue = value.split(";#")[0];
							}else{
								returnValue = value.split(";#")[1];
							}
	                    }
                    });
                }
    });
    return returnValue;


}


function CDataWrap(value)
{
	return "<![CDATA[" + value + "]]>";
}

var Forms7ValuePairs; 

function buildForms7DataObject(formElement)
{
	
	var formDataString = "";
	
	$(formElement).find("input").not(".F7DontSave").each(function()
	{
			var id =  this.id;
			if (id.indexOf("TopSpan_HiddenInput") < 0)
			{
				var value = $(this).val();
				var encryptField = $(this).hasClass(gForms7EncryptClass);
				var encodedValue = htmlEncode(value,encryptField);
				var type = $(this).attr("type");
				if (type == undefined)
				{
					type = "text";
				}
				if (value != undefined && value.length > 0 && type.toUpperCase() != "BUTTON")
				{
					formVal = formVal = $(this).attr("listFieldName");
					if ((type.toUpperCase() != "RADIO" && type.toUpperCase() != "CHECKBOX") )
					{
						formDataString += "" + id + ":\"" + encodedValue + "\",";				
					}  else {
						if ($(this).is(':checked'))
						{
							formDataString += "" + id + ":\"" + encodedValue + "\",";				
						} else {
							if(type.toUpperCase() == "CHECKBOX")
							{
								//if checkbox is not checked we need to clear the associated
								//SharePoint list field if one is mapped
								value = "";
							} else {
								formVal = undefined;
							}
						}
					}
			
					if (formVal != undefined)
					{
						if($(this).attr("isDate") == "yes")
						{
							var thisDate = new Date(value);
							value = thisDate.toISOString();
						}
						if ((encryptField && !gForms7DecryptFailed) || !encryptField)
						{
							Forms7ValuePairs.push([ $(this).attr("listFieldName"),value]);
						}
					}
				}
			}
	});
	$(formElement).find("select").each(function()
	{
			id =  this.id;
			value = $(this).find("option:selected").text();
			formDataString += "" + id + ":\"" + value + "\",";	
	
			formVal = $(this).attr("listFieldName");
			if (formVal != undefined)
			{
				Forms7ValuePairs.push([ $(this).attr("listFieldName"), value]);
			}
	});
	$(formElement).find("textarea").each(function()
	{
			id =  this.id;
			value = $(this).val();
			var encryptField = $(this).hasClass(gForms7EncryptClass);
			encodedValue = htmlEncode(value,encryptField);

			if (value.length > 0)
			{
				formDataString += "" + id + ":\"" + encodedValue + "\",";	
				if ($(this).attr("listFieldName") != undefined && ((encryptField && !gForms7DecryptFailed) || !encryptField))
				{
					Forms7ValuePairs.push([ $(this).attr("listFieldName"), CDataWrap(value)]);
				}
			}

	});
	//get the People Picker instance
	$(formElement).find("div[data-Forms7Type='PeoplePicker']").each(function()
	{
		var spPP = SPClientPeoplePicker.SPClientPeoplePickerDict[$(this).attr("id") + "_TopSpan"];

		var people = spPP.GetAllUserInfo();
		
		var emails = "";
		var seperator = "";
		var listFieldValue = "";
		
		for (index in people)
		{
			emails += seperator + people[index].Description + ";#" + people[index].DisplayText;
			listFieldValue += seperator + "-1;#" + people[index].Description;
			seperator = ";#";
		}
		if ($(this).attr("listFieldName") != undefined)
		{
			Forms7ValuePairs.push([ $(this).attr("listFieldName"), listFieldValue]);
		}
		formDataString += "" + this.id + ":\"" + emails + "\",";
	});
	

	$("div.listFieldName").each(function() 
	{
		if ($(this).attr("data-Forms7Type") == undefined)
		{
			if ($.trim($(this).html()).length > 0)
			{
				var regex = new RegExp("\"", "g");
				value = ($(this).html()).replace(regex,"'");
	
				formDataString += "" + this.id + ":\"" + value + "\",";
				if ($(this).attr("listFieldName") != undefined)
				{
					Forms7ValuePairs.push([ $(this).attr("listFieldName"), CDataWrap($(this).html())]);
				}
			}
		}
	});
	
	return formDataString;
}

function htmlEncode(str,encode) {
	if (encode && gForms7DecryptFailed)
	{
		return str;
	}
    if (encode)
	{
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

function htmlDecode(str,element) {
	str = String(str)
//            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"');
//            .replace(/&#39;/g, '''')
//            .replace(/</g, '&lt;')
//            .replace(/>/g, '&gt;');
    str = Decrypt(str,element);
	return str;
}

//create / updates the list entry 
function saveForm(formElement,listName,saveCompleteFunc,forms7DataField )
{
	
	var clonedForm = $(formElement).clone();

	var formDataString = "{";

 	Forms7ValuePairs = new Array();
	
	var curRow = 0;
	var oldRowID = "";
	formDataString +=  "Forms7Repeatable: [";
	$(clonedForm).find("[data-Forms7Repeatable]").each(function()
	{
		if ($(this).hasClass("F7DontSave"))
		{
		}
		else
		{
			//renumber in case rows were deleted
			var rowID = $(this).attr("id").split("Forms7")[0];
			var parent = $(this).attr("data-Forms7Parent") ;
			if (rowID != oldRowID)
			{
				curRow = 0;
				oldRowID = rowID;
				parent = undefined; 
			}
			if (curRow != 0)
			{
				rowID = rowID + "Forms7" + curRow;
			}
			curRow++;
			var repeatableString =  "{ID: '" + rowID +"',";
			repeatableString += "Forms7Parent: '" + parent + "',";;
			repeatableString += buildForms7DataObject(this);
			repeatableString += "},";
			formDataString += repeatableString;
		}
		$(this).remove();
	});
	formDataString += "],";

	formDataString += buildForms7DataObject(clonedForm);
	
//	formDataString = formDataString.replace(/,\s*$/, "");
	
	formDataString  = formDataString.replace(/,(?=[^,]*$)/, '');
	
	formDataString += "};";
	
	formDataString = EncryptForm(formDataString);
	
	Forms7ValuePairs.push([forms7DataField, CDataWrap(formDataString )]);
	
	var batchCommand = "New";
	var ID = 0;
	if (gForms7FormID != undefined && gForms7FormID != 0)
	{
		batchCommand = "Update";
		ID = gForms7FormID;
	}
	
//	for(value in valuePairs)
//	{
//		thisField = valuePairs[value];
//		alert(thisField[0] + " - " + thisField[1]);
//	}
	
	$().SPServices({
		operation: "UpdateListItems",
		listName: listName ,
		batchCmd: batchCommand ,
		ID: ID,
		valuepairs: Forms7ValuePairs,
		completefunc: function(xData, Status) {
			var errorCode = $( xData.responseXML ).find( "ErrorCode" ).text();
			if ( errorCode != "0x00000000") {
	            alert("An error occurred creating or updating your form. Please check your entries and try again.");
	            alert(xData.responseXML.xml);
	            return;
			}
			else if (Status == "Error") {
	            alert("Unable to communicate with Sharepoint Server!");
	            return;
	        }
//			alert(xData.responseXML.xml);
			 var newId = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
			 if (saveCompleteFunc !== null)
			 {
			 	saveCompleteFunc(newId);
			 }
//			 SaveSuccessful(newId);
		 
		}
	});
		
}


})( jQuery );



//check for a valid date
function validDate(value,element,offsetLeft,offsetTop) {
	$(element).closest("td").find("span.error").remove();

	if(!(!/Invalid|NaN/.test(new Date(value))))
	{
		$(element).closest("td").append("<span class='error'><br>Enter a valid date.</span>");

	} else {
		var thisDate = new Date(value);
		$(element).val(thisDate.getMonth()*1 + 1 +"/"+thisDate.getDate() +"/"+thisDate.getFullYear());
	}
}

// checks for a valid email address
function validEmail(value,element,offsetLeft,offsetTop) {
	if(!(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value)))
	{
//		$(element).closest("td").append("<span class='error'><br>Enter a valid email address.</span>");
		var position = $(element).position();
		$(element).after("<div class='error'>ENTER A VALID EMAIL ADDRESS.</div>");
		
		var myDiv = $(element).next("div");
		
		$(myDiv).css("position","absolute");
		$(myDiv).css("left", position.left + offsetLeft);
		$(myDiv).css("top", position.top - offsetTop);

	}
}

//check for a valid number
function validNumber(value,element,offsetLeft,offsetTop)
{
	if(!(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)))
	{
	
		var position = $(element).position();
		$(element).after("<div class='error'>ENTER A VALID NUMBER.</div>");
		
		var myDiv = $(element).next("div");
		
		$(myDiv).css("position","absolute");
		$(myDiv).css("left", position.left + offsetLeft);
		$(myDiv).css("top", position.top - offsetTop);

	}
}

//check for a valid SSN
function validSSN(value,element,offsetLeft,offsetTop)
{
	var regex = new RegExp("-", "g");
	value = value.replace(regex,"");
	var error = false;
	
	if (value.length != 9 || !(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)))
	{
		error = true;
		//$(element).closest("td").append("<span class='error'><br>Enter a valid Social Security Number (###-##-####)</span>");
	}
	else if(!(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)))
	{
//		$(element).closest("td").append("<span class='error'><br>Enter a valid Social Security Number (###-##-####)</span>");
		error = true;
	}
	if (error)
	{
		var position = $(element).position();
		$(element).after("<div class='error'>ENTER A VALID SSN (##-###-####).</div>");
		
		var myDiv = $(element).next("div");
		
		$(myDiv).css("position","absolute");
		$(myDiv).css("left", position.left + offsetLeft);
		$(myDiv).css("top", position.top - offsetTop);

	}
}

//checks for a valid Phone Number
function validPhone(value,element,offsetLeft,offsetTop)
{
	var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;  
	if (!phoneNumberPattern.test(value))
	{
		var position = $(element).position();
		$(element).after("<div class='error'>ENTER A VALID PHONE NUMBER.</div>");
		
		var myDiv = $(element).next("div");
		
		$(myDiv).css("position","absolute");
		$(myDiv).css("left", position.left + offsetLeft);
		$(myDiv).css("top", position.top - offsetTop);

		//$(element).closest("td").append("<span class='error'><br>Enter a valid phone number.</span>");
	}
}



//formats a phone number for the given element
function formatPhone(element)
{
	if(element.value.length==3)
	{
		element.value += "-";
	} else 	if(element.value.length==7)
	{
		element.value += "-";
	} 

}

//formats the text as an SSN for the given element
function formatSSN(element)
{
	if(element.value.length==3)
	{
		element.value += "-";
	} else 	if(element.value.length==6)
	{
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
    var result           = original.apply(this, arguments),
        my_textareas     = this.find('textarea').add(this.filter('textarea')),
        result_textareas = result.find('textarea').add(result.filter('textarea')),
        my_selects       = this.find('select').add(this.filter('select')),
        result_selects   = result.find('select').add(result.filter('select'));

    for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
    for (var i = 0, l = my_selects.length;   i < l; ++i) {
      for (var j = 0, m = my_selects[i].options.length; j < m; ++j) {
        if (my_selects[i].options[j].selected === true) {
          result_selects[i].options[j].selected = true;
        }
      }
    }
    return result;
  };
}) (jQuery.fn.clone);