![Qlik Bot Skype Header](/screenshots/skype/Qlik_BOT_Headers_Skype.jpg?raw=true "Qlik Bot Skype Header")

# QlikBotNode 

## Skype

### Live Demo

- You can add Qlik Sense Bot as a contact now by search for it.
![Bot Search](/screenshots/skype/search-bot.png?raw=true "Bot Search")

### Installation

- First you need to "Register a Bot with Bot Service". Login to the [Azure Portal](http://portal.azure.com/)
- Click the New button found on the upper left-hand corner of the Azure portal, then select **AI + Cognitive Services > Bot Channels Registration**.
- Click the **Create** button to start the creation process.
![Bot Service Settings](/screenshots/skype/registration-create-bot-service-blade.png?raw=true "Bot Service Settings")
- Enter a **Bot Name** as you want to appear in your contact list
- You can use the free Pricing Tier for testing
- For the Messaging Point add you full route like https://{your-server}/api/sense-bot/microsoft/
- You can skip the Application Insight for now
- Once registered, go to settings and get the AppId and the Password. You will need to add them in your environmental variables
![Bot Service Settings - AppId](/screenshots/skype/registration-settings-manage-link.png "Bot Service Settings - AppId")
- Click on Manage to get the password
![Bot Service Settings - Password](/screenshots/skype/registration-generate-app-password.png "Bot Service Settings - Password")
- Put the AppId and Password in your Environmental variables.
	- For Windows, go to "Control Panel" -> "System" -> "Advanced System Settings" -> "Environment Variables"
	- For Linux, from your directory (~), type "nano .bash_profile" or "vim .bash_profile" and enter the variables there like 
		- export SKYPE_BOT_ID_SCV=''
        - export SKYPE_BOT_PASSWORD_SVC=''
- While still in settings, go to "channel" and add skype.

Thats it!

For more Details on [Register a bot with Bot Service](https://docs.microsoft.com/en-us/bot-framework/bot-service-quickstart-registration "Register a bot with Bot Service")

**Note:** for local testing you need to install the [BotFramework-Emulator](https://github.com/Microsoft/BotFramework-Emulator "BotFramework-Emulator"). Once installed, add in the Endpoint Url "https://localhost:3443/api/sense-bot/microsoft/"

### Usage

- Type **help** for all of the available commands.
![Type Help](/screenshots/skype/chat-help.png "Type Help")
- Click on **"Salesforce"** to get the available commands for the Salesforce App and then click on the **"Dashboard"** to get a list of KPIs
![Salesforce](/screenshots/skype/chat-salesforce.png "Salesforce")
- Click on **"CIO Dashboard"** and then on **"Management"**
![CIO Dashboard](/screenshots/skype/chat-cio.png "CIO Dashboard")
- If you want to change your language click on **"Language"** and select one of the available ones. So far we have only 3, English, Spanish and Greek but please feel free to add as many more as you want
![Change Language](/screenshots/skype/chat-language.png "Change Language")


### Available Commands that you can also type

- Once you select the app to connect to

