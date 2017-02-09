TODO: make this module work only with offline files

First of all, download all the pages to the folder /pages and then, register it to a json file which will get those files and process then.

```sh
URL=example.com
USER_AGENT="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6"
wget -bqre robots=off -A.html $URL –user-agent=$USER_AGENT
```