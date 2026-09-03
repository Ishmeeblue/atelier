Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

objShell.CurrentDirectory = strPath & "\backend"
objShell.Run "cmd /c node server.js", 0, False

WScript.Sleep 2000

objShell.Run "http://localhost:3000", 1, False