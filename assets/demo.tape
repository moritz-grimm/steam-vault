# VHS tape file for SteamVault demo GIF
# Run on Linux/WSL: vhs assets/demo.tape
#
# Uses a mock script because as of now SteamVault does not run on Linux
# No real auth, Steam, or Node.js required

Output assets/demo.gif

Set Shell bash
Set FontSize 16
Set Width 900
Set Height 500
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 60ms

Hide
Type "bash assets/demo-mock.sh"
Enter
Sleep 500ms
Show
Sleep 22s
