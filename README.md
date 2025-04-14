**Use the tool here:**
https://meringue-rouge.github.io/Bakin-Template-Event-Maker/



# Supported Event Types
## Items
- [X] **Increase/Decrease Item / アイテムを増やす／減らす**
- [X] **Check Items Possessed / 持っているアイテムの確認**

**Usage**: Create a note just over each event that you want a template for, in the format of #keyword, with keyword being a word of your choice.

> ***If you are only checking for a single type of item, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Items Possessed Event and the Increase/Decrease Item event to check if the player has the item in question before giving said item.***

## Switches
- [X] **Event Switch On/Off / イベントスイッチのON/OFF**
- [X] **Check Event Switch / イベントスイッチの確認**

**Usage**: Create a note just over each event that you want a template for, in the format of #keyword, with keyword being a word of your choice.

> ***If you are only checking for a single switch, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## Money
- [X] **Increase/Decrease Money / お金を増やす／減らす**

**Usage**: Create a note just over each event that you want a template for, in the format of #keyword, with keyword being a word of your choice.

> ***If you are only checking for a single switch, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***


- Money (add or subtract money)
- EventSheet graphics (using G#keywords, one per non-parallel sheet that you wish to change the graphics for)
- Teleport Player/Event (for events, leave it on "This Event" for the target, otherwise it'll teleport the GUID associated to the event)

# Usage:
- Create an event in Bakin.
- To define the variables / lines of the event that should be changeable through parameters, create a comment event just above the line that needs to be shown, in the format of #keyword, with keyword being a keyword of your choice.
  - **If a single parameter is used multiple times throughout the event**, place another comment over each line that should use a unique field in the template with the same keyword.
  - For different parameters, use a different keyword.
- To define if a non-parallel event sheet in particular needs unique graphics, create a comment anywhere within the sheet starting with **G#keyword**, with keyword being a template entry for your graphics.
  - If multiple non-parallel event sheets need unique graphics, use different keywords within each one, or use the same one to share it between sheets. If you don't want to change the graphics for that sheet, do not define G#.
- Export the event into a txt file.
- Upload it to the website.
- Configure information on the fields, the site should detect thanks to the comments the fields and type of fields for the parameter.
- If you need a default GUID (for graphics), go to Bakin, into the Resources, then 3D or 2D Stamps, and right-click the stamp you want and copy the GUID.
- When all your fields are correct, register a file id from 090000 upwards. You can't have two files with the same file id in your engine.
- Give it a file name.
- Export and open your Bakin's Steamapps folder, located where your steam install is at.
  - Go to Steam\steamapps\common\BAKIN\data\en if you use an English version of Bakin, or Steam\steamapps\common\BAKIN\data\jp for a Japanese version.
  - For common events, drop it in the common_templates folder.
  - For a map event, drop it in the templates folder.
- Make sure to add a bmp file with the exact same name as your txt file. Make a duplicate of one of the defaults in the same folder and rename it if you don't have one.
- Close Bakin entirely and then open a game project.
- For common events, it'll appear at the bottom when creating a standard common event. For a map event, it'll show up in a Event folder in the Events tab of placable entities.
