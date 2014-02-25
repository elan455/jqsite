<!--#include file="../../adovbs.inc"-->
<%
Set Conn = Server.CreateObject("ADODB.connection")
sConnectionString = "DRIVER={SQL Server};Server=gnome\sqlexpress;Database=exactadb;UID=autoexacta;PWD=zeta@THETA8;" 
Conn.Open sConnectionString
Set rsLog = Server.CreateObject("ADODB.Recordset")
sSQL = "Select top 300 track,race,horseNum,postTime,wwbalance,winNum,winName,placeNum,placeName,epool,lostamount From tblLog order by logid"
'rsLog.Open sSQL,Conn
rsLog.ActiveConnection = Conn
rsLog.CursorLocation = adUseClient
rsLog.CursorType = adOpenKeyset
rsLog.LockType = adLockOptimistic
rsLog.Source = sSQL
rsLog.Open
%>
 
 
<% Do While Not rsLog.EOF %>

<tr>
    <td></td>
    <td><%=rsLog(0)%></td>
    <td><%=rsLog(1)%></td>
    <td><%=rsLog(2)%></td>
    <td><%=rsLog(3)%></td>
    <td><%=rsLog(4)%></td>
    <td><%=rsLog(5)%></td>
    <td><%=rsLog(6)%></td>
    <td><%=rsLog(7)%></td>
    <td><%=rsLog(8)%></td>
    <td><%=rsLog(9)%></td>
    <td><%=rsLog(10)%></td>
</tr>
<%
rsLog.Movenext
Loop
'rsLog.Close
'set rs = Nothing
'Conn.Close
'Set Conn = Nothing
%>

