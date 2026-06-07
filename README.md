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


## Troubleshooting approach using:

```
{
  "version": "1.0.1", <-- Added this one, so that we can use on `console.log` with config.version to match.
  "scrollSpeed": 1,

  "ads": [
    {
      "template": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/templates/positive.html",
      "image": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget@main/assets/images/subod-behera-car-sell.png",
      "title": "",
      "message": "Trusted by thousands",
      "url": "https://sretoolkit.com/blog/post/widgetjs/"
    },
    {
      "template": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/templates/negative.html",
      "image": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget@main/assets/images/pradeep-painter.jpeg",
      "title": "On Public Interest",
      "message": "DO NOT TRUST - Pradeep From Raipur, House Color Contractor - 6393260901",
      "url": "https://SREToolkit.com"
    },
    {
      "template": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/templates/promo.html",
      "image": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget@main/assets/images/subod-behera-car-sell.png",
      "title": "Car Sell on Bhawanipatna",
      "message": "Car Sell on Bhawanipatna contact me.",
      "url": "https://sretoolkit.com/blog/post/widgetjs/"
    }
  ]
}

```

#### Troubleshooting using the `console.log`

```
console.log("Ad Config Version:", config.version);
```
