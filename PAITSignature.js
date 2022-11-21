/*
 * PAITSignature - Create digital signatures in SharePoint
 * Version 1.0 
 * @requires jQuery v1.7 or greater 
 * @requires Office UI Fabric 
 * @requires Sketch.js
 *
 * Copyright (c) 2016 Mark Rackley / PAIT Group
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @description allows users to create digital signatures on SharePoint Lists and Libraries
 * @type jQuery
 * @name PAITSignature
 * @category Plugins/PAITGroup
 * @author Mark Rackley / http://www.markrackley.net / http://www.paitgroup.com / mrackley@paitgroup.com
 */
	document.write('<div class="SignatureDialogOverLay">'+
		'<div class="SignatureDialog" >'+
		'	<div class="ms-Dialog-header ms-Dialog-title">Sign Below'+
		'    </div>'+
		'	<canvas id="Signature" width="800" height="200"></canvas>'+
		'	<br>'+
		'	<span class="ms-Button" onclick="Sign();">OK</span>		<span class="ms-Button" onclick="$(\'.SignatureDialogOverLay\').fadeOut();">Cancel</span>'+
		'</div>'+
		'</div>');

	jQuery(document).ready(function($) {
				
				
		signatureData =  $("textarea[title='Signature']").val();
		
		if (signatureData != undefined)
		{
			$("textarea[title='Signature']").closest("tr").hide();
			$(".ms-formtable").after('<span class="ms-formlabel">Signature</span><br><div id="CanvasContainer" class="pt-canvasContainer"><i class="ms-Icon ms-Icon--pencil ms-fontSize-xxl pt-pencil" onclick="ShowSignatureBox();" aria-hidden="true"></i><canvas id="SignedCanvas" width="800" height="200"></canvas></div>');
			DrawSignature(signatureData);
		} else {
			$(".ms-formtable").after('<span class="ms-formlabel">Signature</span><br><div class="pt-CanvasContainer"><canvas id="SignedCanvas" width="800" height="200"></canvas></div>');
			$("table.ms-formtable td").each(function(){
			    if (this.innerHTML.indexOf('FieldName="Signature"') != -1){
			       signatureData =  $(this).find("div").html();
					DrawSignature(signatureData);
					$(this).closest("tr").hide();
			
				}
			});
		
		}

	});
	
	function ShowSignatureBox()
	{
		$('#Signature').remove();
		$('.ms-Dialog-title').after('<canvas id="Signature" width="800" height="200"></canvas>');
		$('#Signature').sketch();
		$('.SignatureDialogOverLay').fadeIn();
	}
	
	function Sign()
	{
		var canvas = document.getElementById('Signature');
        var context = canvas.getContext('2d');
        
        $("textarea[title='Signature']").val(canvas.toDataURL());
		signatureData =  $("textarea[title='Signature']").val();
		
		$('#SignedCanvas').remove();
		$('#CanvasContainer').append('<canvas id="SignedCanvas" width="800" height="200"></canvas>');
		
		DrawSignature(signatureData);
		$('.SignatureDialogOverLay').fadeOut();

	}	
	
	function DrawSignature(signatureData)
	{
		var myCanvas = document.getElementById('SignedCanvas');
		var ctx = myCanvas.getContext('2d');
		var img = new Image;
		img.src = signatureData ;
		setTimeout(function(){ctx.drawImage(img,0,0);},500);
	}
