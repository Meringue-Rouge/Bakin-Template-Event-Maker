**Use the tool here:**
https://meringue-rouge.github.io/Bakin-Template-Event-Maker/

# What's working:
- Parsing default templates (not fully complete)
- Exporting with changes
- Importing custom events (partial) without a template, generating templates based on comments in the event

# Tested parameter generation types from an exported event
- Items (parameter lets you select an item for events that give / take items, and check for item in inventory)
- Switches (toggle on/off an existing global or cross-save switch, and "check for switch" event)
- Money (add or subtract money)
- EventSheet graphics (using G#keywords, one per non-parallel sheet that you wish to change the graphics for)

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
