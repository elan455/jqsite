(function( $ ) {
  $.fn.freezeTableColumns = function(options) {
    options = initOptions(options);
		var source_table = $(this);
		var main_id = source_table.attr('id');
		if (!main_id) {
		  console.log('jquery.freezetablecolumns.js: Error initializing frozen columns - source table must have a unique id attribute.');
		  return;
	  }

		// set up the four regions
		source_table.after('<div id="' + main_id + '-div" style="display: inline-block;"></div>');
		source_table.detach(); // remove the table from the document flow
		main_div = $('#' + main_id + '-div');
		main_div.append(
		  '<div id="' + main_id + '-row1" style="white-space: nowrap;">' + 
		  '<div id="' + main_id + '-region1" style="display: inline-block; vertical-align: top; width: 5px; overflow: hidden;"><div></div></div>' + 
      '<div id="' + main_id + '-region2" style="display: inline-block; vertical-align: top; width: 5px; overflow-x: hidden; overflow-y: scroll;"><div></div></div>' + 
		  '</div>'
		);
		main_div.append(
      '<div id="' + main_id + '-row2"  style="white-space: nowrap;">' +
		  '<div id="' + main_id + '-region3" style="display: inline-block; vertical-align: top; height: 100%; width: 5px; overflow-y: hidden; overflow-x: scroll;"><div></div></div>' + 
      '<div id="' + main_id + '-region4" style="display: inline-block; vertical-align: top; height: 100%; width: 5px; overflow: scroll;"><div></div></div>' + 
	    '</div>'
	  );

		// row 1 (corner area and header divs)
		// note that I use .children() rather than .find() in case the user's table cells have additional tables embedded within them
		var source_table_region1 = source_table.get(0).cloneNode(false);
		$(source_table_region1).removeAttr('id'); // only one of the four tables can have the original id
    moveElement(source_table_region1, $('#' + main_id + '-region1').children('div'));
    $('#' + main_id + '-region1').children('div').children('table').append('<thead></thead>');
    var thead = $('#' + main_id + '-region1 > div > table > thead');
    source_table.children('thead').children('tr').each(function(rowindex, rowelement) {
      thead.append('<tr></tr>');
      var tr = thead.children('tr:last');
      var cellindex = 0;
      $(rowelement).children('td,th').each(function() {
        if (cellindex >= options.numFrozen) {
          return false;
        }
        moveElement(this, tr);
        if (typeof $(this).attr('colspan') === "undefined") {
          cellindex += 1;
        }else{
          cellindex += $(this).attr('colspan');
        }
      });
    });
    var source_table_region2 = source_table.get(0).cloneNode(false);
		$(source_table_region2).removeAttr('id'); // only one of the four tables can have the original id
    moveElement(source_table_region2, $('#' + main_id + '-region2').children('div')); // second table is easier because we already removed the frozen td's -- just add what's left in the thead
		moveElement(source_table.children('thead'), $('#' + main_id + '-region2').children('div').children('table'));

    // row 2 (frozen columns and main data table divs)
    var source_table_region3 = source_table.get(0).cloneNode(false);
		$(source_table_region3).removeAttr('id'); // only one of the four tables can have the original id
    moveElement(source_table_region3, $('#' + main_id + '-region3').children('div'));
    $('#' + main_id + '-region3').children('div').children('table').append('<tbody></tbody>');
    var tbody = $('#' + main_id + '-region3 > div > table > tbody');
    source_table.children('tbody').children('tr').each(function(rowindex, rowelement) {
      tbody.append('<tr></tr>');
      var tr = tbody.children('tr:last');
      var cellindex = 0;
      $(rowelement).children('td,th').each(function() {
        if (cellindex >= options.numFrozen) {
          return false;
        }
        moveElement(this, tr);
        if (typeof $(this).attr('colspan') === "undefined") {
          cellindex += 1;
        }else{
          cellindex += $(this).attr('colspan');
        }
      });
    });
    moveElement(source_table, $('#' + main_id + '-region4').children('div')) // move whatever is left in the table
  
    // set to fixed-with
    for (var i = 1; i <= 4; i++) {
      $('#' + main_id + '-region' + i).children('div').children('table').css('table-layout', 'fixed');
    }
  
    // lay everything out
    source_table.freezeTableColumnsLayout(options);
  
    // set up the events to match elements when scrolled
    var scroll_affects = {  // source -> xscroll, yscroll
      '-region1': [ '-region3', '-region2' ],
      '-region2': [ '-region4', '-region1' ],
      '-region3': [ '-region1', '-region4' ],
      '-region4': [ '-region2', '-region3' ],
    }
    main_div.children('div').children('div').scroll(function(event) {
      var sourceid = $(this).attr('id').substr($(this).attr('id').lastIndexOf('-'));
      $('#' + main_id + scroll_affects[sourceid][0]).scrollLeft($(this).scrollLeft());
      $('#' + main_id + scroll_affects[sourceid][1]).scrollTop($(this).scrollTop());
    });//scroll
    
  };//freezeTableColumns

  
  /* 
    Moves an element to a new parent.  I use the Javascript DOM methods here because
    JQuery's append strips and evaluates any attached javascript the user has in the table.
    This is not what the user expects, so move the table elements using DOM.
    I use this method any time I'm moving existing HTML I didn't place in the document.
  */
  function moveElement(element, newparent) {
    $(element).each(function(eindex, e) {
      $(newparent).get(0).appendChild(e);
    });
  }


  /* 
    Adjusts the widths to an already-existing frozen table.  This allows you to adjust the main div height or width,
    cell contents, etc., and then lay everything out again.  The options are the same as the main function, but
    you can't change the number of frozen columns.  See the example at the top for, well, an example.
  */
  $.fn.freezeTableColumnsLayout = function(options) {
    options = initOptions(options);
    var main_id = $(this).attr('id');
    
		// make all the columns the same width
		function setColWidths(topRegion, bottomRegion) {
		  // clear the widths if needed
		  if (options.clearWidths) {
  		  topRegion.children('div').children('table').width('');
	  	  bottomRegion.children('div').children('table').width('');
		    topRegion.children('div').children('table').children('thead,tbody').children('tr').children('td,th').each(function() {
		      $(this).removeAttr('width');
		      $(this).css('width', '');
	      });
		    bottomRegion.children('div').children('table').children('thead,tbody').children('tr').children('td,th').each(function() {
		      $(this).removeAttr('width');
		      $(this).css('width', '');
	      });
	    }
		  // find the first <tr> without any colspan attributes (those mess up the algorithm)
		  var top_tr = null;
		  topRegion.children('div').children('table').children('thead,tbody').children('tr').each(function(index) {
		    if ($(this).children('td,th').filter('[colspan]').length == 0) { // i.e. this row has no colspans
  		    top_tr = $(this);
  		    return false;
	      }
	    });
		  var bottom_tr = null;
		  bottomRegion.children('div').children('table').children('thead,tbody').children('tr').each(function(index) {
		    if ($(this).children('td,th').filter('[colspan]').length == 0) { // i.e. this row has no colspans
  		    bottom_tr = $(this);
  		    return false;
	      }
	    });
	    if (top_tr == null || bottom_tr == null) {
  		  return;
      }
	    // set the widths of each column
	    topRegion.children('div').children('table').children('colgroup').remove();
	    topRegion.children('div').children('table').prepend('<colgroup></colgroup>');
	    bottomRegion.children('div').children('table').children('colgroup').remove();
	    bottomRegion.children('div').children('table').prepend('<colgroup></colgroup>');
  		top_tr.children('td,th').each(function(index) {
  		  var bottomcell = bottom_tr.children('td,th').eq(index);
  		  var maxwidth = Math.max($(this).width(), bottomcell.width()) + 10;
  		  topRegion.children('div').children('table').children('colgroup').append('<col width="' + maxwidth + '"/>');
  		  bottomRegion.children('div').children('table').children('colgroup').append('<col width="' + maxwidth + '"/>');
  	  });//each
    }//setColWidths function
    setColWidths($('#' + main_id + '-region1'), $('#' + main_id + '-region3'));
    setColWidths($('#' + main_id + '-region2'), $('#' + main_id + '-region4'));
    
    // make all the rows the same height
    function setRowHeights(left_region, right_region) {
      left_region.children('div').children('table').children('thead,tbody').children('tr').each(function(index) {
        var right_region_tr = right_region.children('div').children('table').children('tbody,thead').children('tr').eq(index);
        var maxheight = Math.max($(this).height(), right_region_tr.height());
        $(this).height(maxheight);
        right_region_tr.height(maxheight);
      });
    }//setRowHeights
    setRowHeights($('#' + main_id + '-region1'), $('#' + main_id + '-region2'));
    setRowHeights($('#' + main_id + '-region3'), $('#' + main_id + '-region4'));
  
		// set row 2 height to follow the required height
		var row1height = $('#' + main_id + '-div').children('#' + main_id + '-row1').outerHeight();
		$('#' + main_id + '-div').children('#' + main_id + '-row2').height(options.height - row1height);

    // calculate how big the tables want to be, given an "unlimited" space (50,000 in this case)
    $('#' + main_id + '-region1').children('div').width(50000);
    $('#' + main_id + '-region2').children('div').width(50000);
    $('#' + main_id + '-region3').children('div').width(50000);
    $('#' + main_id + '-region4').children('div').width(50000);
    var region1_3div = Math.max($('#' + main_id + '-region1').children('div').children('table').outerWidth(), $('#' + main_id + '-region3').children('div').children('table').outerWidth());
    var region2_4div = Math.max($('#' + main_id + '-region1').children('div').children('table').outerWidth(), $('#' + main_id + '-region4').children('div').children('table').outerWidth());
    if (options.frozenWidth < 0) {
      options.frozenWidth = region1_3div;
    }

    // set the widths for both the containing divs (with the overflow scrolls) and the inner divs (that give the tables all the room they want)
    $('#' + main_id + '-region1').width(options.frozenWidth);
    $('#' + main_id + '-region1').children('div').width(region1_3div);
    $('#' + main_id + '-region2').width(options.width - options.frozenWidth);
    $('#' + main_id + '-region2').children('div').width(region2_4div);
    $('#' + main_id + '-region3').width(options.frozenWidth);
    $('#' + main_id + '-region3').children('div').width(region1_3div);
    $('#' + main_id + '-region4').width(options.width - options.frozenWidth);
    $('#' + main_id + '-region4').children('div').width(region2_4div);
  };//freezeTableColumnsLayout


  /* Initializes the options with default values - not meant to be called externally */
  function initOptions(options) {
		return $.extend({
      width:       800,
      height:      800,
      numFrozen:   1,
      frozenWidth: -1, // default is dynamic
      clearWidths: true,
		}, options || {});//extend
  };//initOptions  
  
})( jQuery );
