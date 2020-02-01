# Mensabot

A simple bot that parses the current menu of any of [Studierendenwerk Hamburg](https://www.studierendenwerk-hamburg.de/studierendenwerk/en/essen/speiseplaene/)'s cafeterias and posts it to Mattermost.

## Configuration

Create a `.env` file with configuration options in the root directory:
```
MATTERMOST_WEBHOOK=webhook URL
LANG_ID=de or en
CAFETERIA_ID=see link above to find your cafeteria's ID
```
