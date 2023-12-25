# Fossil_Buienradar
App for Fossil Hybrid HR with info from Dutch buienradar.

## Description
This app is designed for the Fossil Hybrid HR smartwatch. It will not work on any other smartwatch. The app is a stripped and apdated version of my Fossil_Dutch_Weather app.

Dutch buienradar is a reliable source for precipitation forecast, based on current radar-data. The Buienradar API provides hyperlocal and per 5 minutes data about the expected precipitation in a text-file. This watchapp relies on Gadgetbridge for the communication with the watch and a 'companion' phone-app that can send information from the internet to gadgetbridge. I used tasker as the companion app. For more info take a look at https://www.buienradar.nl/overbuienradar/gratis-weerdata.

![buienradar](https://github.com/gjkrediet/Fossil_Buienradar/assets/20277013/9b54d459-6aff-4dcf-871d-ce933f424edf)

This app shows Buienradar-data with a resolution of 5 minutes for the first half hour and with a resolution of 10 minutes for the next hour and a half. Upon start of the app the data is requested from Tasker and - when received - shown in the app. The app exits after 30 seconds.

### Installation
Upload buienradarApp.wapp to your watch or compile the app yourself. Instructions for preprocessing/compiling the app are similar to those for Gadgetbridge's opensourceWatchface which can be found here: https://codeberg.org/Freeyourgadget/fossil-hr-watchface

Three Tasker tasks are included for retrieving and storing information. One task is for downloading and storing buienradar-data. It's main part consists of a java scriptlet.
There is also a task for retreiving the current location and city. Import the tasks in Tasker, change them to your needs and create a profile for each to run them at a regular interval. For the reverse lookup of the city you will need an api-key which you can obtain via your google account. Search for the frase 'YOURAPIKEY' and replace is with yours. Alternatively disable the task for the reverse lookup. 

A third task contains the dispatcher for catching and processing requests from the watch. Create a profile in Tasker with the event "Intent Received" with the following content: Action: nodomain.freeyourgadget.gadgetbridge.Q_COMMUTE_MENU. Make this profile start a 'dispatcher'-task. An example is included. You may want to catch requests from other apps (as is the case in the example), which you should then also include in this dispatcher (see https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Fossil-Hybrid-HR#commute-app ).

## Credits
Many thanks to https://codeberg.org/arjan5 and https://github.com/dakhnod for their insights and help. This app is initially based on their examples and work and in part made with their tools.
