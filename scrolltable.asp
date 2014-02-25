<% @language=vbscript %>
<%
response.buffer = True
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <script src="js/jquery-1.7.2.min.js"></script>
        <script src="js/jquery.freezetablecolumns.1.1.js"></script>
          <style type="text/css">
            #mytable-div table {
              border-collapse: collapse;
            }
            #mytable-div td,th {
              border: 1px solid #B3B3B3;
              white-space: nowrap;
              padding: 2px 4px;
            }
          </style>
      </head>
      <body>
        <script>
          $(document).ready(function() {
            var html = '';
            html += '<th>Track</th>';
            html += '<th>Race</th>';
            html += '<th># Horses</th>';
            html += '<th>Post Time</th>';
            html += '<th>Balance</th>';
            html += '<th>Win #</th>';
            html += '<th>Win Name</th>';
            html += '<th>Place #</th>';
            html += '<th>Place Name</th>';
            html += '<th>E Pool</th>';
            html += '<th>Lost Amt</th>';
            
            $('#mytable > thead > tr').append(html);
            
            // freeze the columns
            setTimeout(function() {$('#mytable').freezeTableColumns({
              width:       800, //$(window).width(),   // required (exact px here, not % or em)
              height:      700,                 // required (exact px here, not % or em)
              numFrozen:   3,                   // optional, defaults to 1 left-most column frozen
           // frozenWidth: 200,                 // optional, defaults to natural width of frozen columns
           // clearWidths: true,                // optional, defaults to true, meaning that any set widths on the columns are cleared
              
            })
            $('#mytable > tbody').css('color', 'black')
            }
            
            ,100);//freezeTableColumns

            $('#mytable > tbody').load('ajax/getdata.asp');
             //$('#mytable > tbody').css('color', 'black');

          });//ready
        </script>
        
        <table id="mytable">
          <thead><tr><th></th></tr></thead>

          <tbody style="color:White"></tbody>
        </table>
       
      </body>
      </html>