# Native keyboard setup and final result

Final native-keyboard.json is PASS; actual Android Space Farm→Boss changes
selection, saves primary/recovery, keeps focus/outline and restores intent.
keyboard-initial-failure.json records the early unpaused focus observation.
keyboard-calibration-failure.json/input XML text record UIAutomator's missing
frame after a null-root dump. keyboard-navigation-target-failure.json records
the unaffected bottom navigation target below44px. Final setup holds intervals
and touches the >=44px Boss preset to acquire native WebView focus before key
input. Product scripts/APK are unchanged. All failures and CLI output remain.

Physical/exact WebView60/TalkBack acceptance stays OPEN; see ../DEVICE_ACCEPTANCE.txt.
