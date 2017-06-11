# Unlimited Quotebook
```
qb> have some juice
```
![](https://raw.githubusercontent.com/NoxCaos/unlimited-quotebook/master/success.png)

**Unlimited Quotebook** is bot for Discord servers that can find different phrases from various movies and anime. It searches for subtitles added into database, exports the frame and overlays full text.
Request format:
```
qb> <keywords> [-params]
```
And other commands start from '.'
```
qb> .help
```
[![Invite to your server](https://cdn.discordapp.com/attachments/319532159201181696/323553130732060683/invite.png)](https://discordapp.com/oauth2/authorize?&client_id=321522356172619777&scope=bot&permissions=125952)
## Bot commands
+ `.list` will show the list of hosted series
+ `.help` bot help into direct message
+ `.clrtmp` clear temp folder *admin only*
+ `.kill` shuts down the bot *admin only*

## Request parameters
### `-s <name>` Source
You can specify source (full name or part name) of the quote.
The example searches for words *get* and *ready* in 'Tsukimonogatari'
```
qb> get ready -s tsuki
```
![](https://cdn.discordapp.com/attachments/319532159201181696/323355779413573634/e8e42eeb-df5d-ece0-4c21-00811b07b6d5.png)
### `-men <user/text>` Mention user
Will replace mention of someone in quote (format `/[A-Z][a-z]*[-,]/`) with your own text.
It is preferable to make a keyword with character name and coma after it, so it will try to match mention quote
```
qb> ayano, -men John
```
![](https://cdn.discordapp.com/attachments/319532159201181696/323539885019627550/f9f11e3d-1874-7121-65f7-de02c3fbd393.png)

You can also use discord mentions, bot will format them
```
qb> kyoko, -men @Very Long Name#4242
```
![](https://cdn.discordapp.com/attachments/319532159201181696/323536538656964610/a725b797-25fe-e844-f875-2c37513ab729.png)
### `-ctxt <text>` Replace text with custom
In case if you want to extract just a frame and write a custom text, use `-ctxt` parameter.
To remove text completely, use underscore ( _ ) as parameter.
```
qb> offer shinobu -ctxt Hey, wanna some fresh quotes?
```
![](https://cdn.discordapp.com/attachments/319532159201181696/323265452346179584/5b04c743-6372-538c-707b-5c6775be8854.png)
### `-msg <text>` Write a message along with image
Adds message to image. You can also mention other users
```
qb> ^hello?$ -msg When someone ignores you
```
![](https://cdn.discordapp.com/attachments/319532159201181696/323542547412811776/unknown.png)
### `-rmsg <text>` Removes your message
Can remove a request message to avoid spam
```
qb> hello? -rmsg
```
## Advanced keyword formatting
Bot searches keywords **uncluding order**, but can include any symbols between them by default. If you want to search for particular phrase, separate keywords with underscore
```
qb> hey_what's_up
```
You can use regular expressions too
```
qb> ^hello.$
```
> Keep in mind, that subtitles most of the time end with dot `.`
> so instead of `/$/` you may and with `.,?!`

The default search request in regexp will look like that:
`/keyword.*keyword2.*\?/gi`

# Hosting help
`// coming soon`

## Lisense `MIT`

