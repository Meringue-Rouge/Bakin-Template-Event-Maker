![customtemplate](https://github.com/user-attachments/assets/b0343073-ce0a-4292-a58d-deb4f8bc356c)
<h1 align="center">
https://meringue-rouge.github.io/Bakin-Template-Event-Maker/<br><br>
</h1>

**Make reusable objects with map-specific parameters in RPG Developer Bakin! Generate custom template events using this website by simply adding commentary events in your event export!**

**RPG Developer Bakinでマップ固有のパラメーターを持つ再利用可能なオブジェクトを作成します！イベント・エクスポートに解説イベントを追加するだけで、このウェブサイトを使用してカスタム・テンプレート・イベントを生成できます！。**

> [!WARNING]
> Website is in BETA, a lot of features aren't supported. If you encounter bugs, please submit an issue here, or contact me on X ([@MeringueRouge](https://x.com/MeringueRouge)). Thanks, and hopefully this tool helps you out!

# What are Template Events useful for? |  テンプレート・イベントは何に役立つのか？
They're useful for creating events that need to be as reusable as a Cast object, but you need to pass on very specific parameters to each instance of the object. Without it, copying and pasting an event by hand is tedious, requires modifying multiple instances of a variable, and if you need to a fix a bug in the logic, then it'll mean that modifying one means you need to edit each and every one of them.

Castオブジェクトのように再利用可能である必要があるイベントを作成するのに便利ですが、オブジェクトの各インスタンスに非常に特定のパラメータを渡す必要があります。また、ロジックのバグを修正する必要がある場合、1つを修正することは、1つ1つを編集することを意味します。

Some kinds of use cases that work well include treasure chests, doors, and anything really that requires passing parameters on a map basis.

宝箱やドアなど、マップ単位でパラメータを渡す必要があるものであれば、どんなものでもよい。

# How to use the website / ウェブサイトの利用方法

- For most cases, add a Note (a comment) event just above the event you want to use as a parameter in your event template. The format is generally `#keyword`, and using the same keyword multiple times in the same object will only create a single field in the event template.
- Export the object events into a TXT, by clicking the button in the top-right.
- Load the TXT into the web tool.
- All detected keywords are shown. Edit the descriptions if needed to make it more readable, leave information for your level designers on functionality, etc.
- Before exporting, edit the export number and name, and then press export.
- Drop the downloaded file in `Program Files (x86)\Steam\steamapps\common\BAKIN\data\en\templates`. You can also make it a common event template by dropping it into `Program Files (x86)\Steam\steamapps\common\BAKIN\data\en\common_templates`.
- Duplicate any BMP image in the folder and rename it to the exact same name as your exported file (just as a BMP file instead). Feel free to edit it in an image editing software if needed.
- Launch Bakin, and then find a "Event" folder under the event palette.
- Place on map, fill in some properties to your liking. Double-check the template is working properly by editing it again (click on the object placed on the map twice), and convert it into a custom event, and check that the values you set were properly updated.

- ほとんどの場合、イベントテンプレートのパラメータとして使用したいイベントのすぐ上に Note（コメント）イベントを追加します。書式は一般的に`#keyword`で、同じオブジェクトの中で同じキーワードを複数回使用しても、イベントテンプレートのフィールドは1つしか作成されません。
- 右上のボタンをクリックして、オブジェクトイベントをTXTにエクスポートします。
- TXTをウェブツールにロードします。
- 検出されたキーワードがすべて表示されます。必要であれば、説明を編集して、より読みやすくしたり、レベル・デザイナーのために機能に関する情報を残したりしてください。
- エクスポートする前に、エクスポート番号と名前を編集し、エクスポートを押してください。
- ダウンロードしたファイルを「Program Files (x86)」にドロップする。また、ダウンロードしたファイルを「Program Files (x86)◆Steamsteamapps◆common◆BAKIN◆data◆encommon◆templates◆」にドロップして、共通イベントテンプレートにすることもできる。
- フォルダ内の任意のBMP画像を複製して、エクスポートしたファイルと全く同じ名前にリネームする（代わりにBMPファイルとして）。必要であれば、画像編集ソフトで自由に編集してください。
- Bakinを起動し、イベントパレットの下にある "Event "フォルダを見つけます。
- マップ上に配置し、お好みでプロパティを記入してください。テンプレートが正しく動作しているか、もう一度編集して（マップ上に配置したオブジェクトを2回クリック）、カスタムイベントに変換し、設定した値が正しく更新されているか確認してください。

# Supported Event Types
### How to use Keywords
These events can have a "note" event placed just over the event you want to be able to change through the UI in Bakin. The format of the note must be `#keyword`, with `keyword` being any word you want that you can understand (like a variable of sorts). *This will only apply to the event immediately under it.*

Using **unique keywords** (no two keywords are the same) throughout an event will create a template UI object **for each keyword**.

Using the **exact same keyword multiple times** throughout an event and it's sheets will only result in **one template UI** object, but will apply to all the events concerned. Don't share the same keyword for events with different subject matters (it's fine to use the same keyword for an Increase/Decrease Item event and a Check Items Possessed event, but you can't use that same keyword for a teleport event).


## Items
- [X] **Increase/Decrease Item / アイテムを増やす／減らす**
- [X] **Check Items Possessed / 持っているアイテムの確認**

![Capture d'écran 2025-04-14 122216-small](https://github.com/user-attachments/assets/b80c5f90-c7b8-4159-ba87-41bb42e28d37)

> [!TIP]
> The exact items that you specify when they have a #keyword do not matter, as they are replaced by the template's selection, so long as the #keywords you use make sense logically.

**Usage**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.

> ***If you are only checking for a single type of item, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Items Possessed Event and the Increase/Decrease Item event to check if the player has the item in question before giving said item.***

## Switches
- [X] **Event Switch On/Off / イベントスイッチのON/OFF**
- [X] **Check Event Switch / イベントスイッチの確認**

![Capture d'écran 2025-04-14 121710-small](https://github.com/user-attachments/assets/53fa669d-6386-49d2-b60d-6ea3569435c4)

> [!TIP]
> The exact switches that have a #keyword do not matter, as they are replaced by the template's selection, so long as the #keywords you use make sense.

**Usage**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.

> ***If you are only checking for a single switch, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## Variable Box
- [X] **Variable Box Assignment and Calculation / 変数ボックスへの代入と計算**
- [X] **Assign to String Variable / 文字列変数への代入**

![Capture d'écran 2025-04-15 105117-small](https://github.com/user-attachments/assets/647c686e-14f1-47f3-855e-c9e99e0c5b58)

**Usage**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.

> [!WARNING]
> This only applies to the ***value*** being assigned to a variable (user can define the value but not the variable to receive said value outside of what was defined in the event). You cannot (at this time) assign the variable box to change.

> ***If you are only checking for a single switch, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## Money
- [X] **Increase/Decrease Money / お金を増やす／減らす**

**Usage**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.

> ***If you are only checking for a single switch, then using the same keyword for different events will only result in one template entry on the UI.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## Teleport
- [X] **Teleport Player / プレイヤーを他の場所に移動**
- [X] **Teleport Event / イベントを瞬間移動**

![Capture d'écran 2025-04-14 122535-small](https://github.com/user-attachments/assets/5baa9903-3dab-4c04-9c92-e6883639e1c5)

**Usage**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.
> [!NOTE]
> This will create both a map position and orientation template object on the website UI, per unique keyword.
**Note**: In Bakin, using more than one teleport template object will result in only the last one having the map rendered. Entities will still be rendered on the other ui map.

> ***Use the same keyword if you have multiple teleport events that need to go to the same position.
> Ex: Use the same note keyword over both a Check Event Switch Event and the Event Switch On/Off event to check if the switch is on or off, before turning that same switch on or off.***

## Battle
- [X] **Execute Battle and Check Results / バトル実行と結果の確認**

**Usage**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.
> [!NOTE]
> This will create both an enemy and a battle map template object on the website UI, per unique keyword.
> Additionally, only one enemy is currently supported. To get around this without converting the event, make an enemy without a model, make a common event that runs at the start of battle checking if this modeless enemy is present, and if it is, spawn and replace the enemy with the enemies of your choice.

> ***Use the same keyword if you have multiple events with the same encounter. However, to change background between two keyword created encounters, you'll need two different keywords.***

## Dialogue
- [X] **Display Message / メッセージを表示**

**Usage**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.

## Conversations
- [X] **Display Conversation / 会話を表示**

Conversations are a bit more complicated to set up.
- For each character model you want to be able to replace, you'll need to create a Note event in the format of ``C#keyword``, with keyword being any word of your choice.
- Above the conversation event, create a Note event in the format of ``#keyword[CL,CR,eventL,eventR]``.
  - Replace CL with the C#keyword (without C#) for the left character in this event.
  - Replace CR with the C#keyword (without C#) for the right character in this event.
  - If you wish to keep the original animation assigned to the left character in this dialogue event (as the GUI offers an animation that will override this animation by default), keep eventL, otherwise delete theword but keep the structure intact (so don't delete the comma).
  - If you wish to keep the original animation assigned to the right character in this dialogue event (as the GUI offers an animation that will override this animation by default), keep eventR, otherwise remove eventR.

The initial #keyword for the event will dictate the dialogue's word contents, so remember to use a different #keyword for each dialogue event, otherwise you'll have duplicate conversations.

![Capture d'écran 2025-04-15 172342-small](https://github.com/user-attachments/assets/65f0d120-7129-4d99-961b-940b579f831f)
![Capture d'écran 2025-04-15 172330-small](https://github.com/user-attachments/assets/81ed8e57-b3cb-4a90-9881-9aa7243af76e)
![Capture d'écran 2025-04-15 172350-small](https://github.com/user-attachments/assets/c3ffa866-38a5-4f2a-9ec2-23cb9b563ed0)
![Capture d'écran 2025-04-15 172355-small](https://github.com/user-attachments/assets/8e8212f9-16e4-4581-aeed-03573581f70a)



## Graphics

- [X] **EventSheet Graphics**
- [X] **Change Event Graphic / イベントのグラフィックを変更**

![Capture d'écran 2025-04-15 113149-small](https://github.com/user-attachments/assets/aa258e1c-f57a-4c71-9f87-94189d451745)

**Usage (EventSheet Graphics Specific)**: For every EventSheet (but not parallel sheets) that you want to be able to modify the graphics, but not through an event, create a note written in the format of ``G#keyword``, with keyword being a word of your choice.

> [!WARNING]
> Do not place a `G#keyword` inside a parallel event, it will cause Bakin to convert it into a normal sheet and cause major issues for your event.

**Usage (Change Event Graphic)**: Create a note just over each event that you want a template for, in the format of ``#keyword``, with keyword being a word of your choice.

> ***Only one G#keyword per eventsheet allowed. You can reuse the same G#keyword on different sheets if you want different sheets to share the same changable model.***

## EventSheet Conditions

- [X] **Switch**

![Capture d'écran 2025-04-19 192239-small](https://github.com/user-attachments/assets/ff962aad-d98f-4972-92f1-156885815736)
![Capture d'écran 2025-04-19 192221-small](https://github.com/user-attachments/assets/fe5e9b71-145d-450e-8896-d6def06f4a63)

You can make the switches contained within an eventsheet's run conditions.
Since there's no way to leave comments inside of eventsheet conditions, by default, ALL eventsheet switches are displayed on the website, and if you don't turn on the "Enable Export" button on them, they will not be turned into parameters when exported. Eventsheets conditions referring to the same switch will be merged into one template object on the website and bakin.

> [!IMPORTANT]
> For the website to distinguish the different switches, unlike standard events in your sheet, in which the #keyword would handle the process (thus making whatever switch you used not important), here you NEED to make sure the switches are different according to your logic (in other words, you can't use one switch for every eventsheet switch condition and replace each one individually on the website).



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

# Manual Enhancements / Research:
Unfortunately, I won't be able to support every event or element automatically, since I'm working on this tool while working on my game. However, there are a few additional things you could look into and edit the output from the editor manually to greatly improve your template events.

First, it's worth checking out the official templates' TXT files, and seeing how they're formatted. This is how I was able to use AI (Grok 3 in this case) to build out the website to automate the process in building one's own template events.

## Categories
Each template event can have at the start of the TXT, before everything else, two lines that "categorize" the event.
`スタンプ	Stamp
カテゴリ	Category`
I'm not sure what the Stamp label does in the engine, however, the Category will define which folder the template will appear in. For example, if I write `カテゴリ	Hard Magic`, then the template event will be in a folder called "Hard Magic".

## UI Order
`テンプレート定義	Title
	設定ボックス	説明文
		デフォルト文字列	Description
		設定ID	説明
	設定ボックス終了	改行
	設定ボックス	キャラクターグラフィック
		...
	設定ボックス終了
	設定ボックス	文章
		...
	設定ボックス終了
テンプレート定義終了`
At the top of a template file, the contents of the template are defined by `テンプレート定義` and end at `テンプレート定義終了`.
Each object on the UI are declared by `設定ボックス`, followed by the type of UI element it is in japanese, and end by `設定ボックス終了`.
You can reorder the order of these objects and everything inside to re-order the UI order, useful to keep elements related to the same thing closer together.
