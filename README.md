![customtemplate](https://github.com/user-attachments/assets/b0343073-ce0a-4292-a58d-deb4f8bc356c)
<h1 align="center">
https://meringue-rouge.github.io/Bakin-Template-Event-Maker/<br><br>
</h1>

**Generate custom template events for RPG Developer Bakin using this website and simple Note events in your event export!**

> [!WARNING]
> Website is in BETA, a lot of features aren't supported. If you encounter bugs, please submit an issue here, or contact me on X ([@ingenoireP](https://x.com/IngenoireP)). Thanks, and hopefully this tool helps you out!

# Supported Event Types
## Items
- [X] **Increase/Decrease Item / アイテムを増やす／減らす**
- [X] **Check Items Possessed / 持っているアイテムの確認**

![Capture d'écran 2025-04-14 122216-small](https://github.com/user-attachments/assets/b80c5f90-c7b8-4159-ba87-41bb42e28d37)

> [!TIP]
> The exact items that you specify when they have a #keyword do not matter, as they are replaced by the template's selection, so long as the #keywords you use make sense logically.

**Usage**: Create a note just over each event that you want a template for, in the format of **#keyword**, with keyword being a word of your choice.

> ***If you are only checking for a single type of item, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Items Possessed Event and the Increase/Decrease Item event to check if the player has the item in question before giving said item.***

## Switches
- [X] **Event Switch On/Off / イベントスイッチのON/OFF**
- [X] **Check Event Switch / イベントスイッチの確認**

![Capture d'écran 2025-04-14 121710-small](https://github.com/user-attachments/assets/53fa669d-6386-49d2-b60d-6ea3569435c4)

> [!TIP]
> The exact switches that have a #keyword do not matter, as they are replaced by the template's selection, so long as the #keywords you use make sense.

**Usage**: Create a note just over each event that you want a template for, in the format of **#keyword**, with keyword being a word of your choice.

> ***If you are only checking for a single switch, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## Money
- [X] **Increase/Decrease Money / お金を増やす／減らす**

**Usage**: Create a note just over each event that you want a template for, in the format of **#keyword**, with keyword being a word of your choice.

> ***If you are only checking for a single switch, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## Teleport
- [X] **Teleport Player / プレイヤーを他の場所に移動**
- [X] **Teleport Event / イベントを瞬間移動**

![Capture d'écran 2025-04-14 122535-small](https://github.com/user-attachments/assets/5baa9903-3dab-4c04-9c92-e6883639e1c5)

**Usage**: Create a note just over each event that you want a template for, in the format of **#keyword**, with keyword being a word of your choice.
> [!NOTE]
> This will create both a map position and orientation template object on the website UI, per unique keyword.
**Note**: In Bakin, using more than one teleport template object will result in only the last one having the map rendered. Entities will still be rendered on the other ui map.

> ***Use the same keyword if you have multiple teleport events that need to go to the same position.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## EventSheet Graphics

**Usage**: For every EventSheet (but not parallel sheets) that you want to be able to modify the graphics, but not through an event, create a note written in the format of **G#keyword**, with keyword being a word of your choice.

> ***Only one G#keyword per eventsheet allowed. You can reuse the same G#keyword on different sheets if you want different sheets to share the same changable model.***


More events will be supported as I get to working on this tool.

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
