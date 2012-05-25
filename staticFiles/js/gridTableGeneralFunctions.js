var urlStaticFiles= '/static/';

//check if plugin has been loaded
if(!jQuery.getRowAndCellIndex)
{
	$.ajax({
		url: urlStaticFiles + 'js/RowAndCellIndex.js',
		dataType: 'script',
		async:   false 
	});
}


$.ajax({
	url: urlStaticFiles + 'js/jshashtable-2.1_src.js',
	dataType: 'script',
	async:   false 
});

//var nChangeableCols= 0; // number of cols without the cols used for the row menus
var colMenuTimers= new Hashtable();
var nFixedCols= 5;//number of cols that are not user for alternatives
var nFixedRows= 2;//number of rows that are not user for concerns

//this function should be called if a new grid is loaded in the page
function prepareForNewGrid(table)
{
	var tableContainer = $(table).parent();
	 //add the animation to the buttons of the menu of the grid
	$(table).find(".deleteImage").hover(function(){
		 $(this).attr("src", urlStaticFiles + "icons/delete_hover.png");
	},
	function(){
		 $(this).attr("src", urlStaticFiles + "icons/delete.png");
	});//end hover
				
	 $(table).find(".addImage").hover(function(){
		 $(this).attr("src", urlStaticFiles + "icons/plus_hover.png");
	 },
	 function(){
		 $(this).attr("src", urlStaticFiles + "icons/plus.png");
	 });//end hover
				
	 //add show and hide the menu function
	 $(table).find('.gridRow').mouseleave(function(){
					
		 $(this).find('.gridRowMenu').each(function(){
			 $(this).hide();
		 });
	 });//end mouse leave
				
	 //add hide cell menu
	 $(table).find('.ratioCell').each(function(){
					
		 var cell= $(this);
		 cell.mouseleave(function(){
						
			 hidecolMenu(cell, null, true, null);
		 });
	 });
				
	 $(table).find('.colMenu').each(function(){
					
		 var cell= $(this);
		 cell.mouseleave(function(){
						
			 hidecolMenu(cell, null, true, null);
		 });
	 });
				
	 $(table).find('.alternativeCell').each(function(){
					
		 var cell= $(this);
		 cell.mouseleave(function(){
						
			 hidecolMenu(cell, null, true, null);
		 });
	 });
	
	 //initiate an array for the col menu of the table
	var tableId= getTableId(table);
	if(!colMenuTimers.containsKey(tableId))
	{
		colMenuTimers.put(tableId, new Array(getNumberOfAlternatives(table)));
	}
	calculateTotalWeight(tableContainer);
}
	
//this function will hide and show the row menu
function displayRowMenu(cell)
{
	
	temp= cell.getRowAndCellIndex();
	rowIndex= temp[0];
	colIndex= temp[1];
	nCols= cell.parent('tr').children('td').length;
	if( Math.floor(nCols/2) > colIndex )
	{
		var rightMenu= cell.parent('tr').find('#rightRowMenuDiv');
		if(!rightMenu.is(':hidden'))
		{
			rightMenu.hide();
		}
		cell.parent('tr').find('#leftRowMenuDiv').show();
	}
	else
	{
		var leftMenu= cell.parent('tr').find('#leftRowMenuDiv');
		if(!leftMenu.is(':hidden'))
		{
			leftMenu.hide();
		}
		cell.parent('tr').find('#rightRowMenuDiv').show();
	}
}

//this function will set the col menu hide in n milliseconds and show the col menu
function showColMenu(cell)
{
	var temp= cell.getRowAndCellIndex();
	var rowIndex= temp[0];
	var cellIndex= temp[1];
	var table= findTable(cell);
	var tableId= getTableId(table);
	if(colMenuTimers.get(tableId)[cellIndex - 2] != null)
	{
		//console.log('cancel: ' + tableId + ' ' + colMenuTimers.get(tableId)[cellIndex - 2]);
		clearTimeout(colMenuTimers.get(tableId)[cellIndex - 2]);
		colMenuTimers.get(tableId)[cellIndex - 2]= null;
	}
	
	colMenuDiv= table.find('tbody>tr:eq(0)').children('td:eq(' + cellIndex + ')').children('div');
	if(colMenuDiv.is(':hidden'))
	{
		//console.log('show: ' + tableId + ' ' + colMenuTimers.get(tableId)[cellIndex - 2]);
		colMenuDiv.show();
	}
}

//hide the col menu
function hidecolMenu(cell, cellIndex, delayed, tableId)
{
	if(delayed == true)
	{
		cellIndex= cell.getRowAndCellIndex()[1];
		var tableId= getTableId(cell);
		colMenuTimers.get(tableId)[cellIndex - 2]= setTimeout("hidecolMenu(null, " + cellIndex + ", false, '" + tableId + "' );", 200);
		//console.log('start timer: ' + tableId + ' ' + colMenuTimers.get(tableId)[cellIndex - 2]);
	}
	else
	{
		//console.log('hidden: ' + tableId + ' ' + colMenuTimers.get(tableId)[cellIndex - 2]);
		$('#' + tableId).find('tbody>tr:eq(0)').children('td:eq(' + cellIndex + ')').children('div').hide();
	}
}

function addRow(cell)
{
	var nConcerns= getNumberOfConcerns(cell);//parseInt($("#nConcerns").val());
	nConcerns++;
	var leftId= "concern_" + nConcerns + "_left";
	var rightId= "concern_" + nConcerns +"_right";
	var ratingReadOnly= isRatingReadOnly(cell);
	var showRatingWhileFalseChangeRatingsWeights= isShowRatingIfReadOnly(cell);
	var tableContainer = findTable(cell).parent();
	//$("#nConcerns").val(nConcerns);
	
	//add the new row to the table
	var nAlternatives= getNumberOfAlternatives(cell); //parseInt($("#nAlternatives").val());
	var cols= '';
	var id= ''; //id is the name used id and name options in the input tag
	
	//row menu
	cols+= '<td onmouseover="displayRowMenu($(this))">\n';
	cols+= '<div id= "leftRowMenuDiv" class="gridRowMenu">\n';
	cols+= '<a><img class= "deleteImage" src="' + urlStaticFiles + 'icons/delete.png" alt="" onclick= "removeRow($(this).parents(\'td\'))"/></a>\n';
	cols+= '<a><img class= "addImage" src="' + urlStaticFiles + 'icons/plus.png" alt="" onclick= "addRow($(this).parents(\'td\'))"/></a>\n';
	cols+= '</div>\n';
	cols+= '</td>\n';
	//concern left
	cols+= '<td onmouseover="displayRowMenu($(this))" class= "concernCell"><input class="tableHeader" type="text" id="' + leftId + '" name="' + leftId +'" onchange="isTextEmpty($(this));isTableSaved()" /></td>\n';
	for(var i=0; i < nAlternatives; i++)
	{
		id= "ratio_concer" + nConcerns + "_alternative" + (i + 1);
		if(!ratingReadOnly)
		{
			cols+= '<td class= "ratioCell" onmouseover="displayRowMenu($(this));showColMenu($(this))" ><div><input type="text" id="' + id +'" name="' + id + '" onchange="isTextEmpty($(this));isTableSaved()"/></div></td>\n';
			//cols+= "<td><input type=\"text\" id=" + id +" name= " + id +"/></td>";
		}
		else
		{
			cols+= '<td class= "ratioCell" onmouseover="displayRowMenu($(this));showColMenu($(this))" ><div><input type="text" id="' + id +'" name="' + id + '" disabled="disabled" readonly/></div></td>\n';
		}
	}
	//concern weight
	if(!ratingReadOnly)
	{
		cols+= '<td onmouseover="displayRowMenu($(this))">\n'
		cols+= '<input type="text" id= "weight_concern' + nConcerns + '" name= "weight_concern' + nConcerns + '" value= "1.0" onchange="calculateTotalWeight($(this).parents(\'#gridTrableContainerDiv\'));isTextEmpty($(this));isTableSaved()"/>\n';
		cols+= '</td>\n'
	}
	else
	{
		if(showRatingWhileFalseChangeRatingsWeights)
		{
			cols+= '<td onmouseover="displayRowMenu($(this))">\n'
			cols+= '<input type="text" id= "weight_concern' + nConcerns + '" name= "weight_concern' + nConcerns + '" value= "1.0" onchange="calculateTotalWeight($(this).parents(\'#gridTrableContainerDiv\'))" disabled="disabled" readonly/>\n';
			cols+= '</td>\n'
		}
		else
		{
			cols+= '<td onmouseover="displayRowMenu($(this))">\n'
			cols+= '<input type="text" id= "weight_concern' + nConcerns + '" name= "weight_concern' + nConcerns + '" value= "" onchange="calculateTotalWeight($(this).parents(\'#gridTrableContainerDiv\'))" disabled="disabled" readonly/>\n';
			cols+= '</td>\n'
		}
	}
	//concern right
	cols+= '<td onmouseover="displayRowMenu($(this))" class= "concernCell"><input class= "tableHeader" type="text" id="' + rightId + '" name="' + rightId + '" onchange="isTextEmpty($(this));isTableSaved()" /></td>\n';
	//add the new row to the table
	cols+= '<td onmouseover="displayRowMenu($(this))">\n';
	cols+= '<div id= "rightRowMenuDiv" class="gridRowMenu">\n';
	cols+= '<a><img class= "deleteImage" src="' + urlStaticFiles + 'icons/delete.png" alt="" onclick= "removeRow($(this).parents(\'td\'))"/></a>\n';
	cols+= '<a><img class= "addImage" src="' + urlStaticFiles + 'icons/plus.png" alt="" onclick= "addRow($(this).parents(\'td\'))"/></a>\n';
	cols+= '</div>\n';
	cols+= '</td>\n';
	var table= findTable(cell);
	//$("#Grid").append('<tr class="gridRow">' + cols + '</tr>');
	table.find('tbody').append('<tr class="gridRow">' + cols + '</tr>');
	//now add the mouseleave and mouseenter actions
	
	//left part
	var obj= table.find("tbody>tr:last");
	//obj.find('#leftRowMenuDiv').hide();
	
	
	//right part
	//obj.find('#rightRowMenuDiv').hide();
	
	//right and left
	obj.find('.ratioCell').each(function(){
		$(this).mouseleave(function(){
			hidecolMenu($(this), null, true, null);
		});	
	});
	
	obj.find('.colMenu').each(function(){
		
		var cell= $(this);
		cell.mouseleave(function(){
			
			hidecolMenu(cell, null, true, null);
		});
	});
	
	obj.find('.alternativeCell').each(function(){
		
		var cell= $(this);
		cell.mouseleave(function(){
			
			hidecolMenu(cell, null, true, null);
		});
	});
	
	//add the animation to the buttons of the menu of the grid
	obj.find(".deleteImage").hover(function(){
		$(this).attr("src", urlStaticFiles + "icons/delete_hover.png");
	},
			function(){
				$(this).attr("src", urlStaticFiles + "icons/delete.png");
	});//end hover
	
	obj.find(".addImage").hover(function(){
		$(this).attr("src", urlStaticFiles + "icons/plus_hover.png");
	},
			function(){
				$(this).attr("src", urlStaticFiles + "icons/plus.png");
	});//end hover
	
	//add show and hide the menu function
	obj.mouseleave(function(){
		
		$(this).find('.gridRowMenu').each(function(){
			$(this).hide();
		});
	});//end mouse leave
	
	//calculate the total weight
	calculateTotalWeight(tableContainer);
}

function removeRow(cell)
{
	var concernNumber= cell.getRowAndCellIndex()[0] - 1;
	var nConcerns= getNumberOfConcerns(cell);//parseInt($("#nConcerns").val());
	var temp= null;
	var tableContainer = findTable(cell).parent();
	if(nConcerns - 1 != 0)
	{	
		//update all the ids of the table 
		var table= findTable(cell).find("tbody");
		table.find("tr:gt(" + (concernNumber + 1) + ")").each(function(i)
		{	
			var concernIndex= concernNumber + i;
			
			//create the old and new ids
			var oldLeftId= "concern_" + (concernIndex + 1) + "_left";
			var oldRightId= "concern_" + (concernIndex + 1) + "_right";
			var leftId= "concern_" + concernIndex + "_left";
			var rightId= "concern_" + concernIndex +"_right";
			var oldWeightId= 'weight_concern' + (concernIndex + 1);
			var weightId= 'weight_concern' + concernIndex;
			//update the left concern
			temp= $(this).find('#' + oldLeftId);
			temp.attr('id', leftId);
			temp.attr('name', leftId);
			
			//update the ratios id and name attributes
			var nAlternatives= getNumberOfAlternatives(cell);//parseInt($("#nAlternatives").val());
			$(this).find("td:gt(1):lt(" + nAlternatives + ")").each(function(i){
				
				var id="ratio_concer" + concernIndex + "_alternative" + (i + 1); 
				
				$(this).find("input").attr("id", id);
				$(this).find("input").attr("name", id);
			});
			//update the weight
			temp= $(this).find('#' + oldWeightId);
			temp.attr('id', weightId);
			temp.attr('name', weightId);
			//update the right concern
			temp= $(this).find('#' + oldRightId);
			temp.attr('id', rightId);
			temp.attr('name', rightId);
		});
		
		//remove the row
		table.find("tr:eq(" + (concernNumber + 1) + ")").remove();
		
		//remove add -1 to the total concerns
		nConcerns--;
		//$("#nConcerns").val(nConcerns);
		calculateTotalWeight(tableContainer);
		
		isTableSaved();
	}
}

function addCol(cell)
{
	var temp= null;
	var nAlternatives= getNumberOfAlternatives(cell);//parseInt($("#nAlternatives").val());
	var id= ''; //id is the name used id and name options in the input tag
	nAlternatives++;
	id= "alternative_" + nAlternatives + "_name";
	var ratingReadOnly= isRatingReadOnly(cell);
	
	//$("#nAlternatives").val(nAlternatives);
		
	//add the col menu
	var tbody= findTable(cell).find('tbody');//$('#Grid>tbody');
	tbody.find('tr:eq(0)').find('td:eq(' + nAlternatives + ')').after('<td class= "colMenu" onmouseover="showColMenu($(this))">\n' +
						'<div class= "colMenuDiv">\n' + 
							'<a><img class= "deleteImage" src="' + urlStaticFiles + 'icons/delete.png" alt="" onclick= "removeCol($(this).parents(\'td\'))"/></a>\n' +
							'<a><img class= "addImage" src="' + urlStaticFiles + 'icons/plus.png" alt="" onclick= "addCol($(this).parents(\'td\'))"/></a>\n' +
						'</div>\n' +
					'</td>\n'
			);
	temp= tbody.find('tr:eq(0)').find('td:eq(' + (nAlternatives + 1) + ')');
	
	//add the mouse leave function to the cell menu
	temp.mouseleave(function(){
			
		hidecolMenu($(this), null, true, null);
	});
	
	//add the mouse in and out events to the images
	temp.find(".deleteImage").hover(function(){
		$(this).attr("src", urlStaticFiles + "icons/delete_hover.png");
	},
			function(){
				$(this).attr("src", urlStaticFiles + "icons/delete.png");
	});//end hover
	
	temp.find(".addImage").hover(function(){
		$(this).attr("src", urlStaticFiles + "icons/plus_hover.png");
	},
			function(){
				$(this).attr("src", urlStaticFiles + "icons/plus.png");
	});//end hover
	
	//hide the menu
	//temp.find('.colMenuDiv').hide();
	
	//add the 'header'
	tbody.find('tr:eq(1)').find('td:eq(' + nAlternatives + ')').after('<td class= "alternativeCell" onmouseover="showColMenu($(this))" >\n' +
						'<input class= "tableHeader" type="text" id="' + id + '" name="' + id + '" onchange="isTextEmpty($(this));isTableSaved()" />\n' +
					'</td>\n'
			);
	//add the mouse leave function to the header cell
	tbody.find('tr:eq(1)').find('td:eq(' + (nAlternatives + 1) + ')').mouseleave(function(){
			
		hidecolMenu($(this), null, true, null);
	});
	
	//add the new col to the table
	var nConcerns= getNumberOfConcerns(cell);//parseInt($("#nConcerns").val());
	//take care of the normal cells of the table
	for(var i=0; i < nConcerns; i++)
	{
		id= "ratio_concer" + (i + 1) + "_alternative" + nAlternatives;
		temp = tbody.find("tr:eq(" +  (i + 2)  + ")");
		//function changed because of the new added cell in the begin of the table ( there are now 2 cells now (name of the concern + the options)), also it is now i+2 because we added another tr to the begin of the table
		if(!ratingReadOnly)
		{
			temp.find("td:eq(" + nAlternatives + ")").after('<td class= "ratioCell" onmouseover="displayRowMenu($(this));showColMenu($(this))" ><div><input type="text" id="' + id + '" name= "' + id + '" onchange="isTextEmpty($(this));isTableSaved()" /></div></td>\n');
		}
		else
		{
			temp.find("td:eq(" + nAlternatives + ")").after('<td class= "ratioCell" onmouseover="displayRowMenu($(this));showColMenu($(this))" ><div><input type="text" id="' + id + '" name= "' + id + '" disabled="disabled" readonly /></div></td>\n');
		}		
		//with old index
		//$("#ratioTable").find("tr:eq(" +  (i + 1) + ")").find("td:eq(" + (nAlternatives - 1) + ")").after("<td><input type=\"text\" id=" + id + " name=" + id + " /></td>");
		
		//add the mouseleave function to the ratio cell
		temp.find("td:eq(" + (nAlternatives + 1) + ")").mouseleave(function(){
			hidecolMenu($(this), null, true, null);
		});
	}
	//add +1 position to the colMenuTimers
	var tableId= getTableId(cell);
	colMenuTimers.get(tableId).push(null);
}

function removeCol(cell)
{
	var alternativeNumber= cell.getRowAndCellIndex()[1] - 1;
	var nAlternatives= getNumberOfAlternatives(cell);//parseInt($("#nAlternatives").val());
	var nConcerns= getNumberOfConcerns(cell);//parseInt($("#nConcerns").val());
	var table= findTable(cell);
	// find now the tableId of this cell because when you remove it, it generates error
	// because it cannot find it
	var tableId= getTableId(cell);
	var temp= null;
	var id= null;
	if(nAlternatives - 2 != 0)
	{
		
		//remove cell menu
		var tbody= findTable(cell).find('tbody');//$('#Grid>tbody');
		tbody.find('tr:eq(0)').find('td:eq(' + (alternativeNumber + 1) + ')').remove();
		
		//rename the next headers
		//let's first find the correct row where the headers are, after that find the 
		tbody.find('tr:eq(1)').find('td:gt(' + (alternativeNumber + 1) + '):lt(' + (nAlternatives - alternativeNumber) + ')').each(function(i){
			id= "alternative_" + (alternativeNumber + i) + "_name";
			$(this).find('input').attr("id", id);
			$(this).find('input').attr('name', id);
		})
		
		//remove 'header'
		tbody.find('tr:eq(1)').find('td:eq(' + (alternativeNumber + 1) + ')').remove();
		
		//now lets remove 1 col from every row, update the ids of the other cols and change the id of the hidden fields (also from the header)
		for(var i=0; i < nConcerns; i++)
		{	
			var row= table.find("tbody>tr:eq(" +  (i + 2)  + ")");//$("#Grid>tbody").find("tr:eq(" +  (i + 2)  + ")");
			//update the ids of the other cols
			for(var j= alternativeNumber + 1; j <= nAlternatives; j++)
			{
				id= "ratio_concer" + (i + 1) + "_alternative" + (j - 1);
				var input= row.find("td:eq("+ (j + 1) +")").find("input");
				input.attr("id", id);
				input.attr("name", id);

			}
			//remove the col that isn't needed anymore
			row.find("td:eq(" + (alternativeNumber + 1) + ")").remove();
			
		}
		
		//save the new total number of alternatives
		nAlternatives--;
		//$("#nAlternatives").val(nAlternatives);
		
		//remove -1 position to the colMenuTimers
		colMenuTimers.get(tableId).pop();

		isTableSaved();
	}
}

function calculateTotalWeight(tableContainer)
{
	var nConcerns= getNumberOfConcerns(tableContainer.find('table'));//parseInt($("#nConcerns").val())
	var weightTotal= 0.0;
	var id= null;
	var tbody= tableContainer.find('tbody');//$('#Grid>tbody');
	
	for(var i= 0; i < nConcerns; i++)
	{
		id= "weight_concern" + (i + 1);
		weightTotal+= parseFloat(tbody.find('#' + id).val());
	}
	
	if(weightTotal >= 0 || weightTotal < 0)
	{
		tableContainer.find('#weightMeter').attr('value', weightTotal);
	}
	else
	{
		tableContainer.find('#weightMeter').attr('value', '-----');
	}
}

//function used to find what the number of alternatives, only supports table, td and tr objects
function getNumberOfAlternatives(obj)
{
	var nCols= 0;
	switch(obj.prop('tagName').toLowerCase())
	{
		case 'td':
		{
			nCols= obj.parent('tr').children('td').length;
			break;
		}
		case 'tr':
		{
			nCols= obj.children('td').length;
			break;
		}
		case 'table':
		{
			nCols= obj.children('tbody').children('tr:first').children('td').length;
			break;
		}
	}
	return nCols - nFixedCols; 
}

//function used to find what the number of concerns, only supports table, td and tr objects
function getNumberOfConcerns(obj)
{
	var nRows= 0;
	switch(obj.prop('tagName').toLowerCase())
	{
		case 'td':
		{
			nRows= obj.parent('tr').parent('tbody').children('tr').length;
			break;
		}
		case 'tr':
		{
			nRows= obj.length;
			break;
		}
		case 'table':
		{
			nRows= obj.children('tbody').children('tr').length;
			break;
		}
	}
	return nRows - nFixedRows;
}

//only supports table, td and tr objects
function findTable(obj)
{
	switch(obj.prop('tagName').toLowerCase())
	{
		case 'td':
		{
			return obj.parents('table');
		}
		case 'tr':
		{
			return obj.parents('table');
		}
		case 'table':
		{
			return obj;
		}
	}
}

//get the table id the is stored in a hidden value that pertence to a grid table
function getTableId(obj)
{
	var table= findTable(obj);
	return table.attr('id');
}

function isRatingReadOnly(obj)
{
	var ratingReadOnly= findTable(obj).parent('div').find('#changeRatingsWeights').val();
	try
	{
		if (ratingReadOnly != null && (ratingReadOnly != '' || ratingReadOnly != ' '))
		{
			ratingReadOnly= Boolean(ratingReadOnly);
		}
		else
		{
			ratingReadOnly= false;
		}
	}
	catch(err)
	{
		ratingReadOnly= false;
	}
	return ratingReadOnly;
}

function isShowRatingIfReadOnly(obj)
{
	var showRatingWhileFalseChangeRatingsWeights= findTable(obj).parent('div').find('#showRatingWhileFalseChangeRatingsWeights').val();
	try
	{
		if (showRatingWhileFalseChangeRatingsWeights != null && (showRatingWhileFalseChangeRatingsWeights != '' || showRatingWhileFalseChangeRatingsWeights != ' '))
		{
			showRatingWhileFalseChangeRatingsWeights= Boolean(showRatingWhileFalseChangeRatingsWeights);
		}
		else
		{
			showRatingWhileFalseChangeRatingsWeights= false;
		}
	}
	catch(err)
	{
		showRatingWhileFalseChangeRatingsWeights= false;
	}
	return showRatingWhileFalseChangeRatingsWeights;
}

function isGridComplete() {
	var fields = $('#form').serializeArray();
	$.each(fields, function(i, field) {
		if (field.value == "") {
			isGridCompleteFlag = false;
			return false;
		} else {
			isGridCompleteFlag = true;
		}
	});
	
	if (isGridCompleteFlag && hasTableBeenSaved) {
		$('#showDendogramButton').removeAttr('disabled');
	} else {
		$('#showDendogramButton').attr('disabled', 'disabled');
	}
}

function isTextEmpty(tag) {
	var value = $.trim(tag.val());
	if (value == "") {
		tag.val('');
	} else {
		tag.val(value);
	}
}	