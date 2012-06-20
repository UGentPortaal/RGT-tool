$(document).ready(function() {
	$('#btn-add').click(function() {
	    var num     = $('.cloned').length; // how many "duplicatable" input fields we currently have
	    var newNum  = new Number(num + 1);      // the numeric ID of the new input field being added
	
	    // update count of alternatives
	    $('#numAlternatives').val(newNum);
	
	    // create the new element via clone(), and manipulate it's ID using newNum value
	    var newElem	= '<div id="input'+newNum+'" class="cloned"><input type="text" name="1-alternative'+newNum+'" id="id_1-alternative'+newNum+'" /></div>'
	
	    // insert the new element after the last "duplicatable" input field
	    $('#input' + num).after(newElem);
	});
});