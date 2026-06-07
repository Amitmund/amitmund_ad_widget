# amitmund_ad_widget
To manage ad and to make people aware.


# Note

Just need to add the following code just before of the </body> on the base.html within the template. 

The system look for the viewport and play the ads automatically.


# Few tech:
```
🧠 Key clarification

You likely saw:

<script src="widget.js"></script>

and later:

<script src="beacon.min.js"></script>

👉 That second one is NOT replacing yours
👉 It is being injected by Cloudflare at edge/CDN level

🚨 Why this matters

It usually happens when you enable:

Cloudflare features like:
Web Analytics
Zaraz
Rocket Loader (sometimes)
Auto-injected scripts
```
