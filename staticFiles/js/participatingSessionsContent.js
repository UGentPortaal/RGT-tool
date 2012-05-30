function sendResponse()
{
	var sessionUSID= participatingGetSessionUSID(); //function is from participatingSession.js
	var iteration= $.trim($('#participantSessionIteration').text());
	var table= $('#participatingSessionResponseGridForm').find('table');
	var nAlternatives= getNumberOfAlternatives(table);
	var nConcerns= getNumberOfConcerns(table);
	var form= $('#participatingSessionResponseGridForm');
	var strD= '';
	//serialize the disabled inputs
	form.find('input:disabled').each(function(){
		strD = strD + '&' + $(this).attr('name') + '=' + $(this).val();
	});
	var str=  'nConcerns=' + nConcerns + '&nAlternatives=' + nAlternatives + '&iteration=' + iteration + '&gridType=response&sessionUSID=' + sessionUSID + '&' + form.serialize() + strD;
	$.post('/sessions/respond/', str, function(data){
		if($(data).find('error').length <= 0)
		{
			var dateTime = $(data).find('dateTime').text();
			$('#responseStatusA').attr('class', 'green');
			$('#responseStatusSpan').text('Response was sent at: ' + dateTime);
			showMessageInDialogBox('Response was sent.');
			//$('.participatingSessionsResponseHighlight').effect('highlight', {color: '#AFDCEC'}, 1500);
		}
		else
		{
			showMessageInDialogBox($(data).find('error').text());
		}
	})
}

function getResponseFromIteration(iteration)
{
	showLoadingSpinner($('#wrap'), 'Please wait...')
	try
	{
		var sessionUSID= participatingGetSessionUSID(); //function is from participatingSession.js
		if(iteration == null || iteration == '')
		{
			iteration= $('#responseSelection option:selected').val();
		}
		if(iteration != null && iteration != 'null')
		{
			if(iteration == 'current')
			{
				iteration= $('#participantSessionIteration').text();
			}
			str= 'sessionUSID=' + sessionUSID + '&iteration=' + iteration;
			$.post('/sessions/response/', str, function(data){
				try
				{
					if($(data).find('error').length <= 0)
					{
						$('#participationSessionsContentDiv').html($(data).find('htmlData').text());
						$('#participationSessionsContentDiv').find('input:button, button').button();
						$('#participationSessionsContentGridsDiv').find('#gridTrableContainerDiv').each(function(){
							prepareForNewGrid($(this));	
						});
						hideLoadingSpinner($('#wrap'));
					}
					else
					{
						hideLoadingSpinner($('#wrap'));
						showMessageInDialogBox($(data).find('error').text());
					}
				}
				catch(err)
				{
					console.log(err);
					hideLoadingSpinner($('#wrap'));
				}
			})
		}
		else
		{
			hideLoadingSpinner($('#wrap'));
		}
	}
	catch(err)
	{
		console.log(err);
		hideLoadingSpinner($('#wrap'));
	}
}