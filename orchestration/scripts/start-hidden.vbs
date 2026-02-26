Set WshShell = CreateObject("WScript.Shell")
' Launch node index.js hidden (window style 0)
WshShell.Run "cmd.exe /c node index.js > orchestrator_boot.log 2>&1", 0, False
