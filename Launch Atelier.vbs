Set WshShell = CreateObject("WScript.Shell")

' Launch Express Backend silently (0 = hidden window)
WshShell.Run "cmd /c cd /d ""D:\CODING\ATELIER PROJECT\atelier\backend"" && node server.js", 0, False

' Launch Vite Frontend silently (0 = hidden window)
WshShell.Run "cmd /c cd /d ""D:\CODING\ATELIER PROJECT\atelier\frontend"" && npm run dev", 0, False

' Wait 3 seconds for servers to initialize
WScript.Sleep 3000

' Open Atelier in your default browser
WshShell.Run "http://localhost:5173"